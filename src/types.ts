export type CardTemplateType = 'polaroid' | 'vinyl' | 'magazine' | 'cinema' | 'pantone';

export type FilterEffect = 'none' | 'film_grain' | 'vintage_warm' | 'tokyo_cool' | 'cyber_neon' | 'bnw';

export type QuoteStyle = 'wongKarWai' | 'japaneseMinimal' | 'frenchChic' | 'lateNight';

export interface ColorSwatch {
  hex: string;
  name: string; // e.g. "暮色加州 Sunset California"
  cmyk?: string; // e.g. "C:12 M:55 Y:88 K:0"
  percentage: number; // 0-100
  moodTag: string; // e.g. "温柔 35%"
}

export interface PoeticQuote {
  wongKarWai: {
    monologue: string;
    english: string;
    timecode: string; // e.g. "04:19:02"
    scene: string; // e.g. "重庆大厦 0.01公分"
  };
  japaneseMinimal: {
    line: string;
    english: string;
    season: string; // e.g. "初秋 · 暮光微凉"
  };
  frenchChic: {
    editorial: string;
    english: string;
    issue: string; // e.g. "VOL. 24 / AUTUMN VOGUE"
  };
  lateNight: {
    cureText: string;
    english: string;
    midnightTime: string; // e.g. "02:47 AM"
  };
}

export interface MoodDNA {
  dominantMood: string; // e.g. "93% 城市漫游者的松弛感"
  vibeKeywords: string[]; // ["电影感", "物哀", "湿润冷调", "微醺"]
  bpmScore: string; // "72 BPM · 慢摇爵士"
  weatherFeel: string; // "20:45 阴有微雨 · 22°C"
  scentNote: string; // "前调：冷杉甘露 | 中调：烟熏乌木 | 尾调：烘焙香草"
  bgmTrack: {
    title: string;
    artist: string;
    genre: string;
  };
}

export interface VibeShotResult {
  id: string;
  timestamp: number;
  imageUrl: string;
  photoTitle: string;
  colorPalette: ColorSwatch[];
  quotes: PoeticQuote;
  moodDNA: MoodDNA;
  selectedQuoteStyle: QuoteStyle;
  customQuote?: string;
  customTitle?: string;
  filter: FilterEffect;
}

export interface PresetPhoto {
  id: string;
  title: string;
  category: 'coffee' | 'street' | 'nature' | 'night' | 'cat';
  tag: string;
  imageUrl: string;
  fallbackColors: ColorSwatch[];
}

// Agnes AI 文生图/图生图返回结果（AI 重绘电影海报）
export interface GeneratedPoster {
  id?: string;
  timestamp?: number;
  /** Agnes 返回的 CDN 图片地址（可能为空，取决于输出格式） */
  imageUrl?: string | null;
  /** 裸 Base64（PNG） */
  imageBase64?: string | null;
  /** 可直接用于 <img> 的 data URL */
  imageDataUrl?: string | null;
}

