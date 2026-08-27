import React, { useState } from 'react';
import { Crown, Sparkles, X, Check, ShoppingBag, Globe, Zap, ArrowRight, DollarSign } from 'lucide-react';

interface ProMonetizationModalProps {
  onClose: () => void;
}

export const ProMonetizationModal: React.FC<ProMonetizationModalProps> = ({ onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<'lifetime' | 'year' | 'pod'>('lifetime');

  const monetizationPaths = [
    {
      title: '1. 软件层：Pro VIP 买断与订阅制',
      tag: '毛利率 95%+',
      desc: '门槛低至一杯奶茶钱（¥9.9 买断），提供 4K 超清导出、王家卫独家滤镜库、去水印、批量生图。',
      stats: '日均 1000 活跃用户，按 3% 付费转化即日入近千元。',
    },
    {
      title: '2. 硬件与文创：POD 实体周边一件代发',
      tag: '毛利率 65%~75%',
      desc: '直连有赞/微信小店与义乌/深圳柔性供应链，用户一键将爱宠、咖啡、旅行色卡定制为亚克力立牌、冰箱贴与手机壳。',
      stats: '客单价 ¥29.9 ~ ¥59.9，零库存风险，自动化发货。',
    },
    {
      title: '3. 品牌与文旅：商业联名情绪调色盘',
      tag: '客单价 ¥30,000+',
      desc: '与 Manner、Seesaw 等精品咖啡或阿那亚、大理等文旅地标合作推出官方定制色号专区。',
      stats: '自带社交裂变与传播属性，B端品牌极度渴望年轻化内容载体。',
    },
    {
      title: '4. 出海全球化：App Store & TikTok',
      tag: '订阅美金 $4.99/月',
      desc: '在 Instagram / TikTok 以 #VibeShot #PantonePhotography 标签发起审美挑战赛，获取海外高 ARPU 订阅用户。',
      stats: '海外年轻人对 Aesthetic & Moodboard 支付意愿更高。',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-100">
              「拾光半格」商业变现与盈利蓝图
            </h2>
          </div>
          <p className="text-xs text-stone-400">
            现象级审美应用如何从“高调性流量”平滑转化为“高毛利现金流”
          </p>
        </div>

        {/* Pricing Cards Showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Plan 1 */}
          <div
            onClick={() => setSelectedPlan('lifetime')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              selectedPlan === 'lifetime'
                ? 'bg-amber-500/15 border-amber-400 shadow-lg shadow-amber-950/40 scale-[1.02]'
                : 'bg-stone-950/80 border-stone-800 hover:border-stone-700'
            }`}
          >
            <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-bold">
              最受欢迎 · 极低心理门槛
            </div>
            <div className="text-xl font-bold text-stone-100 mt-1">
              ¥9.9 <span className="text-xs font-normal text-stone-400">/ 终身买断</span>
            </div>
            <div className="text-xs text-stone-300 mt-2 font-medium">情绪色卡 Pro 终身会员</div>
            <ul className="text-[11px] text-stone-400 space-y-1 mt-2">
              <li className="flex items-center gap-1">
                <Check className="w-3 h-3 text-amber-400" /> 解锁全部 5 款奢华排版
              </li>
              <li className="flex items-center gap-1">
                <Check className="w-3 h-3 text-amber-400" /> 4K 印刷级无损导出
              </li>
              <li className="flex items-center gap-1">
                <Check className="w-3 h-3 text-amber-400" /> 去水印与专属金句库
              </li>
            </ul>
          </div>

          {/* Plan 2 */}
          <div
            onClick={() => setSelectedPlan('pod')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              selectedPlan === 'pod'
                ? 'bg-amber-500/15 border-amber-400 shadow-lg shadow-amber-950/40 scale-[1.02]'
                : 'bg-stone-950/80 border-stone-800 hover:border-stone-700'
            }`}
          >
            <div className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-bold">
              高毛利文创周边
            </div>
            <div className="text-xl font-bold text-stone-100 mt-1">
              ¥29.9 <span className="text-xs font-normal text-stone-400">/ 件起</span>
            </div>
            <div className="text-xs text-stone-300 mt-2 font-medium">实体周边 POD 定制包</div>
            <ul className="text-[11px] text-stone-400 space-y-1 mt-2">
              <li className="flex items-center gap-1">
                <Check className="w-3 h-3 text-rose-400" /> 亚克力色卡桌面立牌
              </li>
              <li className="flex items-center gap-1">
                <Check className="w-3 h-3 text-rose-400" /> 4枚装磁吸冰箱贴
              </li>
              <li className="flex items-center gap-1">
                <Check className="w-3 h-3 text-rose-400" /> 极简透光气囊手机壳
              </li>
            </ul>
          </div>

          {/* Plan 3 */}
          <div
            onClick={() => setSelectedPlan('year')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              selectedPlan === 'year'
                ? 'bg-amber-500/15 border-amber-400 shadow-lg shadow-amber-950/40 scale-[1.02]'
                : 'bg-stone-950/80 border-stone-800 hover:border-stone-700'
            }`}
          >
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
              创作者 & 设计师
            </div>
            <div className="text-xl font-bold text-stone-100 mt-1">
              ¥99 <span className="text-xs font-normal text-stone-400">/ 年</span>
            </div>
            <div className="text-xs text-stone-300 mt-2 font-medium">工作室商业授权版</div>
            <ul className="text-[11px] text-stone-400 space-y-1 mt-2">
              <li className="flex items-center gap-1">
                <Check className="w-3 h-3 text-cyan-400" /> 批量解析与API接入
              </li>
              <li className="flex items-center gap-1">
                <Check className="w-3 h-3 text-cyan-400" /> 自定义品牌专属 Logo
              </li>
              <li className="flex items-center gap-1">
                <Check className="w-3 h-3 text-cyan-400" /> 完整商业印刷授权
              </li>
            </ul>
          </div>
        </div>

        {/* 4 Core Monetization Strategies Breakdown */}
        <div className="space-y-3 border-t border-stone-800 pt-4">
          <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider font-mono">
            4 大变现支柱解析
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {monetizationPaths.map((path, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-200">{path.title}</span>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                    {path.tag}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">{path.desc}</p>
                <div className="text-[10px] text-stone-500 font-mono pt-1">{path.stats}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={() =>
              alert('恭喜体验！已为您激活 VIP Pro 全特权模式，已解锁全部 5 种奢华模板与 4K 超清导出！')
            }
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-300 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>模拟体验解锁 VIP Pro 特权</span>
          </button>
        </div>
      </div>
    </div>
  );
};
