import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// 微信小程序登录配置
// ------------------------------------------------------------
// AppID: 小程序后台「开发管理 -> 开发设置」可见
// Secret: 小程序后台「开发管理 -> 开发设置 -> 小程序密钥」生成
// （Secret 是敏感信息，仅存服务端环境变量，绝不入库/进前端）
// 用户数据默认存本地文件 data/（开发/测试用）；
// 正式环境建议接数据库（云托管 MySQL / 云开发），避免容器重启丢数据。
// ============================================================
const WX_APPID = process.env.WX_APPID || '';
const WX_SECRET = process.env.WX_SECRET || '';
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TOKENS_FILE = path.join(DATA_DIR, 'tokens.json');

function readJsonFile<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return fallback;
  }
}

function writeJsonFile(file: string, data: unknown) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// 从请求头解析 Bearer token
function resolveToken(req: express.Request): string {
  const auth = req.headers.authorization || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : '';
}

// ============================================================
// Agnes AI（免费全模态 API，OpenAI 兼容）配置
// ------------------------------------------------------------
// 国际主节点:  https://apihub.agnes-ai.com/v1
// 国际备用线:  https://apihub.agnes-ai.cn/v1
// 国内服务节点: https://api.agnes-ai.cn/v1 （需在国内站注册获取 Key）
// Key 获取: platform.agnes-ai.com 注册 -> Settings -> API Keys（免费发放）
// 模型: 识图 agnes-2.5-flash | 生图 agnes-image-2.1-flash（当前均 ¥0）
// ============================================================
const AGNES_BASE_URL = (process.env.AGNES_BASE_URL || 'https://apihub.agnes-ai.com/v1').replace(/\/+$/, '');
const AGNES_API_KEY = process.env.AGNES_API_KEY || '';
const AGNES_VISION_MODEL = process.env.AGNES_VISION_MODEL || 'agnes-2.5-flash';
const AGNES_IMAGE_MODEL = process.env.AGNES_IMAGE_MODEL || 'agnes-image-2.1-flash';

function agnesHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (AGNES_API_KEY) headers['Authorization'] = `Bearer ${AGNES_API_KEY}`;
  return headers;
}

// OpenAI 兼容请求封装：对 429 / 5xx 做指数退避重试（最多 3 次）；其余 4xx 快速失败
async function agnesFetch(apiPath: string, body: unknown, timeoutMs = 120000): Promise<any> {
  const url = `${AGNES_BASE_URL}${apiPath}`;
  let lastErr: unknown;

  for (let attempt = 0; attempt < 3; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: agnesHeaders(),
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => null);
      if (res.ok) return data;
      const err: any = new Error(`Agnes API ${res.status}: ${JSON.stringify(data).slice(0, 500)}`);
      // 4xx（除 429 限流）为确定性错误，不重试
      if (res.status !== 429 && res.status < 500) err.fatal = true;
      throw err;
    } catch (err: any) {
      if (err?.name === 'AbortError') throw new Error(`Agnes API 请求超时（${timeoutMs}ms）`);
      if (err?.fatal) throw err;
      lastErr = err;
    } finally {
      clearTimeout(timer);
    }
    // 指数退避后重试
    await new Promise((r) => setTimeout(r, 800 * Math.pow(2, attempt)));
  }
  throw lastErr || new Error('Agnes API 请求失败');
}

// 从模型输出中稳健提取 JSON（容忍 ```json 围栏与前后缀文本）
function extractJson(raw: string): any {
  if (!raw) throw new Error('模型未返回内容');
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : raw;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('模型输出中未找到 JSON');
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

// 统一为 data URI（若已是 data: 前缀则原样返回）
function toDataUri(imageBase64: string, mimeType?: string): string {
  return imageBase64.startsWith('data:')
    ? imageBase64
    : `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`;
}

async function startServer() {
  const app = express();
  // 云托管/云服务器通常通过 PORT 环境变量指定监听端口
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '25mb' }));

  // Health check API
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), provider: 'agnes-ai' });
  });

  // ============================================================
  // 微信一键登录（wx.login code -> openid -> 自动注册/登录）
  // ============================================================
  app.post('/api/auth/login', async (req, res) => {
    const { code } = req.body || {};
    if (!code) return res.status(400).json({ error: '缺少微信登录 code' });
    if (!WX_APPID || !WX_SECRET) {
      return res.status(500).json({ error: '服务端未配置 WX_APPID / WX_SECRET' });
    }

    try {
      // 用 code 向微信换 openid（官方接口）
      const url =
        `https://api.weixin.qq.com/sns/jscode2session` +
        `?appid=${encodeURIComponent(WX_APPID)}` +
        `&secret=${encodeURIComponent(WX_SECRET)}` +
        `&js_code=${encodeURIComponent(code)}` +
        `&grant_type=authorization_code`;
      const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
      const data: any = await r.json();

      if (!data.openid) {
        return res.status(401).json({ error: `微信登录失败：${data.errcode || ''} ${data.errmsg || ''}` });
      }

      const openid: string = data.openid;
      const users = readJsonFile<Record<string, any>>(USERS_FILE, {});
      const now = Date.now();

      // 自动注册：openid 不存在则创建用户
      if (!users[openid]) {
        users[openid] = {
          openid,
          nickName: '微信用户',
          avatarUrl: '',
          createdAt: now,
          lastLoginAt: now,
        };
      } else {
        users[openid].lastLoginAt = now;
      }
      writeJsonFile(USERS_FILE, users);

      // 签发登录令牌
      const token = crypto.randomBytes(24).toString('hex');
      const tokens = readJsonFile<Record<string, string>>(TOKENS_FILE, {});
      tokens[token] = openid;
      writeJsonFile(TOKENS_FILE, tokens);

      res.json({ token, user: users[openid] });
    } catch (err: any) {
      console.error('微信登录错误:', err);
      res.status(502).json({ error: String(err?.message || err) });
    }
  });

  // 当前登录用户信息
  app.get('/api/auth/me', (req, res) => {
    const token = resolveToken(req);
    const tokens = readJsonFile<Record<string, string>>(TOKENS_FILE, {});
    const openid = tokens[token];
    if (!openid) return res.status(401).json({ error: '未登录或登录已过期' });
    const users = readJsonFile<Record<string, any>>(USERS_FILE, {});
    res.json({ user: users[openid] || null });
  });

  // 更新用户资料（昵称等）
  app.post('/api/auth/profile', (req, res) => {
    const token = resolveToken(req);
    const tokens = readJsonFile<Record<string, string>>(TOKENS_FILE, {});
    const openid = tokens[token];
    if (!openid) return res.status(401).json({ error: '未登录或登录已过期' });

    const { nickName } = req.body || {};
    const users = readJsonFile<Record<string, any>>(USERS_FILE, {});
    if (users[openid] && typeof nickName === 'string' && nickName.trim()) {
      users[openid].nickName = nickName.trim().slice(0, 24);
      writeJsonFile(USERS_FILE, users);
    }
    res.json({ user: users[openid] });
  });

  // ============================================================
  // 拾光半格 AI 情绪色号 & 电影台词分析（识图）
  // 由 Google Gemini 迁移至 Agnes AI（agnes-2.5-flash, 免费）
  // ============================================================
  const PROMPT_TEMPLATE = `你是一位享誉国际的顶级色彩美学大师、王家卫风格电影导演兼独立杂志《MONOCLE》主编。
请仔细分析用户上传的这张照片：
照片备注/标题: "{{photoTitle}}"
风格偏好: "{{stylePreference}}"

请完成以下 3 项高阶审美提炼：
1. 提取 4 种最打动人心的「情绪潘通色号」(colorPalette)：
   - hex: 严谨的 16 进制颜色代码（如 #2A3B4C）
   - name: 极具诗意与电影质感的中文+英文色号名称（如 "深海夜航 Deep Midnight", "焦糖清晨 Caramel Dawn", "伦敦雾气 London Mist"）
   - cmyk: 专业印刷色标（如 "C:40 M:20 Y:10 K:60"）
   - percentage: 视觉占比估算 (0-100, 4个色块之和约100)
   - moodTag: 情绪词标签（如 "孤光 35%", "温存 28%"）

2. 创作 4 种不同高定风格的双语电影台词与极简文案 (quotes)：
   - wongKarWai (王家卫电影独白): 必须包含标志性王家卫元素（如精确到秒的时间戳、距离0.01公分、罐头保质期、雨夜、冷峻独白）+ 优美英文译文 + 虚构电影镜头场景。
   - japaneseMinimal (日系物哀极简风): 关注光影流转、微风、器物、四季轮转的禅意诗句 + 英文。
   - frenchChic (法式杂志/松弛感): 强调Effortless chic、不讨好他人的高级松弛、小众审美哲学 + 英文。
   - lateNight (深夜治愈/解药): 治愈当代年轻人精神内耗、给疲惫打工人的温柔解药 + 英文。

3. 提炼情绪DNA与听觉通感 (moodDNA)：
   - dominantMood: 如 "94% 城市漫游者的松弛感"
   - vibeKeywords: 4 个精致的美学关键词（如 ["胶片颗粒", "雨夜漫游", "冷感克制", "微醺"]）
   - bpmScore: 适配心跳/节拍（如 "68 BPM · 慢调爵士"）
   - weatherFeel: 画面传达的天气与时间温度（如 "22:15 阴有微雨 · 20°C"）
   - scentNote: 画面引发的通感香气（前调/中调/尾调）
   - bgmTrack: 推荐一首最契合画面的虚构或真实神仙Lo-Fi/爵士背景音乐。

请严格以 JSON 格式输出，结构如下（不要输出任何多余文字或 markdown 围栏）：
{
  "photoTitle": "string",
  "colorPalette": [{"hex": "#2A3B4C", "name": "中文 English", "cmyk": "C:.. M:.. Y:.. K:..", "percentage": 25, "moodTag": "情绪词 25%"}],
  "quotes": {
    "wongKarWai": {"monologue": "中文独白", "english": "EN", "timecode": "04:03:19", "scene": "虚构镜头场景"},
    "japaneseMinimal": {"line": "中文诗句", "english": "EN", "season": "初秋 · 暮光微凉"},
    "frenchChic": {"editorial": "中文文案", "english": "EN", "issue": "VIBESHOT NO. 09"},
    "lateNight": {"cureText": "中文治愈", "english": "EN", "midnightTime": "21:30 PM"}
  },
  "moodDNA": {
    "dominantMood": "94% 城市漫游者的松弛感",
    "vibeKeywords": ["电影感", "物哀美学", "湿润冷调", "微醺"],
    "bpmScore": "72 BPM · 慢摇爵士节奏",
    "weatherFeel": "21:15 阴转微雨 · 湿度 75%",
    "scentNote": "前调：冷杉甘露 | 中调：烟熏乌木 | 尾调：烘焙香草",
    "bgmTrack": {"title": "Midsummer Rain & Coffee", "artist": "Norah & Bill Evans Trio", "genre": "Late Night Lo-Fi Jazz"}
  }
}`;

  // 本地高保真兜底（Key 缺失 / 网络异常 / 解析失败时返回，保证体验不中断）
  const generateFallbackVibe = () => {
    const title = '日常高光瞬间';
    return {
      id: String(Date.now()),
      timestamp: Date.now(),
      photoTitle: title,
      colorPalette: [
        { hex: '#2A3B4C', name: '暮色加州 Sunset California', cmyk: 'C:55 M:40 Y:20 K:70', percentage: 38, moodTag: '沉静 38%' },
        { hex: '#E07A5F', name: '焦糖落日 Caramel Dusk', cmyk: 'C:5 M:60 Y:65 K:0', percentage: 28, moodTag: '温存 28%' },
        { hex: '#F4F1DE', name: '呢喃奶白 Velvet Cream', cmyk: 'C:2 M:4 Y:10 K:0', percentage: 20, moodTag: '松弛 20%' },
        { hex: '#81B29A', name: '海风薄雾 Sea Mist', cmyk: 'C:40 M:10 Y:30 K:0', percentage: 14, moodTag: '自由 14%' },
      ],
      quotes: {
        wongKarWai: {
          monologue: `那天下午 4 点零 3 分，我和这处风景的距离只有 0.01 公分。57 个小时之后，我彻底放下了过去的焦虑。`,
          english: 'At 4:03 PM, I was only 0.01 cm away from this view. 57 hours later, the anxiety vanished into the mist.',
          timecode: '04:03:19',
          scene: '街角转弯 0.01公分',
        },
        japaneseMinimal: {
          line: '光线穿过透明空气的时候，平凡的事物都在安静地发光。生活本身，就是最好的滤镜。',
          english: 'When light filters through clear air, ordinary moments quietly glow.',
          season: '初秋 · 暮色微凉',
        },
        frenchChic: {
          editorial: '无需刻意解释的松弛感，是最高阶的审美态度。30% 的神秘感，70% 的不疾不徐。',
          english: 'Effortless chic is the ultimate attitude. 30% mystery, 70% unbothered peace.',
          issue: 'VIBESHOT NO. 09',
        },
        lateNight: {
          cureText: '把今天所有的琐碎与兵荒马乱，都折叠收进黄昏的影子里。晚安，明天又是全新的一天。',
          english: 'Folding today’s noise away into the dusk shadows. Good night, world.',
          midnightTime: '21:30 PM',
        },
      },
      moodDNA: {
        dominantMood: '94% 城市漫游者的松弛感',
        vibeKeywords: ['电影感', '物哀美学', '湿润冷调', '微醺'],
        bpmScore: '72 BPM · 慢摇爵士节奏',
        weatherFeel: '21:15 阴转微雨 · 湿度 75%',
        scentNote: '前调：冷杉甘露 | 中调：烟熏乌木 | 尾调：烘焙香草',
        bgmTrack: {
          title: 'Midsummer Rain & Coffee',
          artist: 'Norah & Bill Evans Trio',
          genre: 'Late Night Lo-Fi Jazz',
        },
      },
    };
  };

  // 照片识图分析：照片 + 提示词 -> 结构化 JSON（情绪色号 / 台词 / 情绪DNA）
  app.post('/api/vibeshot/analyze', async (req, res) => {
    const { imageBase64, mimeType, photoTitle, stylePreference } = req.body;

    if (!AGNES_API_KEY) {
      console.warn('AGNES_API_KEY is not set in environment, using local fallback.');
      return res.json(generateFallbackVibe());
    }

    try {
      const promptText = PROMPT_TEMPLATE
        .replace('{{photoTitle}}', photoTitle || '随手拍日常')
        .replace('{{stylePreference}}', stylePreference || 'all');

      // Agnes 2.5 Flash 识图（OpenAI 兼容 content blocks，图片支持 Data URI Base64）
      const parts: any[] = [];
      if (imageBase64) {
        parts.push({ type: 'image_url', image_url: { url: toDataUri(imageBase64, mimeType) } });
      }
      parts.push({ type: 'text', text: promptText });

      const data = await agnesFetch('/chat/completions', {
        model: AGNES_VISION_MODEL,
        messages: [{ role: 'user', content: parts }],
        temperature: 0.9,
        max_tokens: 8192,
      }, 180000);

      const rawText = data?.choices?.[0]?.message?.content;
      if (!rawText) throw new Error('Agnes 识图未返回内容');

      const parsed = extractJson(rawText);
      res.json({
        id: String(Date.now()),
        timestamp: Date.now(),
        ...parsed,
      });
    } catch (err: any) {
      console.error('Agnes Vision analysis error:', err);
      res.json(generateFallbackVibe());
    }
  });

  // ============================================================
  // VibeShot AI 电影海报重绘（文生图 / 图生图）
  // Agnes Image 2.1 Flash（agnes-image-2.1-flash, 免费）
  // ============================================================
  app.post('/api/vibeshot/generate-image', async (req, res) => {
    const {
      prompt,
      imageBase64,     // 可选：参考照片（Data URI 或裸 base64）
      imageUrl,        // 可选：参考照片的公网 HTTPS 地址（与 imageBase64 二选一）
      mimeType,
      size = '1024x1024',
      ratio = '1:1',
      usePhotoAsReference = false,
    } = req.body;

    if (!AGNES_API_KEY) {
      return res.status(502).json({ error: 'AGNES_API_KEY 未配置，无法调用生图模型' });
    }

    try {
      const finalPrompt =
        (typeof prompt === 'string' && prompt.trim())
          ? prompt.trim()
          : '电影感海报，高级胶片质感，电影级光影与构图，丰富细节';

      const isI2I = usePhotoAsReference && (imageBase64 || imageUrl);

      // 图生图：参考图必须放在 extra_body.image 中，输出格式用 extra_body.response_format
      // 文生图：顶层 return_base64: true 输出 Base64
      let body: any;
      if (isI2I) {
        const ref = imageBase64
          ? toDataUri(imageBase64, mimeType)
          : imageUrl;
        body = {
          model: AGNES_IMAGE_MODEL,
          prompt: finalPrompt,
          size,
          ratio,
          extra_body: {
            image: [ref],
            response_format: 'b64_json',
          },
        };
      } else {
        body = {
          model: AGNES_IMAGE_MODEL,
          prompt: finalPrompt,
          size,
          ratio,
          return_base64: true,
        };
      }

      // 生图耗时较长：60s - 360s，取 300s
      const data = await agnesFetch('/images/generations', body, 300000);
      const item = data?.data?.[0];
      if (!item || (!item.b64_json && !item.url)) {
        throw new Error('Agnes 生图未返回图片数据');
      }

      const b64 = item.b64_json || null;
      res.json({
        id: String(Date.now()),
        timestamp: Date.now(),
        imageUrl: item.url || null,
        imageBase64: b64,
        imageDataUrl: b64 ? `data:image/png;base64,${b64}` : null,
      });
    } catch (err: any) {
      console.error('Agnes image generation error:', err);
      res.status(502).json({ error: String(err?.message || err) });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[拾光半格] Server running on http://localhost:${PORT}`);
    console.log(`[拾光半格] AI Provider: Agnes AI (${AGNES_BASE_URL})`);
    console.log(`[拾光半格] Vision: ${AGNES_VISION_MODEL} | Image: ${AGNES_IMAGE_MODEL}`);
    if (!AGNES_API_KEY) {
      console.warn('[拾光半格] AGNES_API_KEY 未配置，AI 将使用本地兜底数据。');
    }
  });
}

startServer();
