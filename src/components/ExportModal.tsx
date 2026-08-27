import React, { useState } from 'react';
import { VibeShotResult, CardTemplateType } from '../types';
import { Download, Copy, Check, X, Sparkles, ShoppingBag, Eye, Share2, Smartphone, ShieldCheck } from 'lucide-react';
import { toPng } from 'html-to-image';

interface ExportModalProps {
  result: VibeShotResult;
  currentTemplate: CardTemplateType;
  cardRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  result,
  currentTemplate,
  cardRef,
  onClose,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeMerchTab, setActiveMerchTab] = useState<'magnet' | 'plaque' | 'case'>('magnet');

  const activeQuote =
    result.customQuote ||
    (result.selectedQuoteStyle === 'wongKarWai'
      ? result.quotes.wongKarWai.monologue
      : result.selectedQuoteStyle === 'japaneseMinimal'
      ? result.quotes.japaneseMinimal.line
      : result.selectedQuoteStyle === 'frenchChic'
      ? result.quotes.frenchChic.editorial
      : result.quotes.lateNight.cureText);

  // Social Share Text Generator
  const socialText = `【拾光半格 · ${result.customTitle || result.photoTitle}】
🎨 画面潘通色号：${result.colorPalette.map((c) => `${c.hex} (${c.name})`).join(' · ')}
🎬 电影台词：“${activeQuote}”
🎵 适配信标：${result.moodDNA.bgmTrack.title} · ${result.moodDNA.bpmScore}
🏷️ ${result.moodDNA.vibeKeywords.map((k) => `#${k}`).join(' ')} #拾光半格 #拍立得调色 #电影感台词 #日常碎片`;

  const handleCopySocialText = () => {
    navigator.clipboard.writeText(socialText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownloadPNG = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        quality: 0.95,
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download = `Shiguang_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export high-res PNG:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-100">
              导出高清卡片 & 发朋友圈文案
            </h2>
          </div>
          <p className="text-xs text-stone-400">
            300 DPI 超清无损排版 · 适配小红书 / 微信朋友圈 / Instagram
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleDownloadPNG}
            disabled={isExporting}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 active:scale-95 transition-all cursor-pointer"
          >
            {isExporting ? (
              <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isExporting ? '正在生成 3x 超清画质...' : '保存 3x 超清海报 (PNG)'}</span>
          </button>

          <button
            onClick={handleCopySocialText}
            className="w-full py-3.5 px-4 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-100 font-semibold text-sm flex items-center justify-center gap-2 border border-stone-700 transition-all active:scale-95 cursor-pointer"
          >
            {copySuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copySuccess ? '已复制全套发圈文案！' : '一键复制朋友圈/小红书文案'}</span>
          </button>
        </div>

        {/* Copyable Post Preview Area */}
        <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="font-mono text-[11px] text-amber-400">📋 小红书 / 朋友圈配文预备：</span>
            <span className="text-[10px] text-stone-500">已自动组合色卡与标签</span>
          </div>
          <pre className="text-xs font-serif text-stone-300 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
            {socialText}
          </pre>
        </div>

        {/* Physical Print-On-Demand (POD) Merchandise Preview Showcase */}
        <div className="border-t border-stone-800 pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-stone-200">
                把情绪色卡做成实体周边 (定制 POD 预览)
              </h3>
            </div>
            <span className="text-[11px] text-stone-400 bg-stone-800 px-2 py-0.5 rounded-md">
              实体文创商业链路
            </span>
          </div>

          {/* Merch Selector Tabs */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'magnet', label: '🧲 磁吸冰箱贴', price: '¥19.9 / 组' },
              { id: 'plaque', label: '🖼️ 亚克力桌面立牌', price: '¥29.9 / 件' },
              { id: 'case', label: '📱 极简透光手机壳', price: '¥39.9 / 个' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveMerchTab(m.id as any)}
                className={`p-2.5 rounded-2xl border text-center transition-all ${
                  activeMerchTab === m.id
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                    : 'bg-stone-950/60 border-stone-800 text-stone-400'
                }`}
              >
                <div className="text-xs font-bold">{m.label}</div>
                <div className="text-[10px] text-stone-500 font-mono mt-0.5">{m.price}</div>
              </button>
            ))}
          </div>

          {/* Live Mockup Rendering Preview */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-stone-900 border border-stone-700 overflow-hidden relative shadow-md shrink-0">
                <img
                  src={result.imageUrl}
                  alt="Merch mock"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-3 bg-white/90 text-[7px] text-black font-mono flex items-center justify-center">
                  VIBESHOT
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-stone-200">
                  {activeMerchTab === 'magnet'
                    ? '哑光复古磁吸冰箱贴 (4枚色卡装)'
                    : activeMerchTab === 'plaque'
                    ? '高透光加厚亚克力桌面艺术立牌 (带电影原木底座)'
                    : '防摔气囊透光手机壳 (潘通色号高定版)'}
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5">
                  原厂 12 色高保真微喷工艺 · 永不褪色
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                alert('周边定制工厂对接中：此为现象级变现模块演示，可通过微信小店/有赞一件代发对接供应链！')
              }
              className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs shrink-0 transition-transform active:scale-95"
            >
              模拟一键下单
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] text-stone-500 border-t border-stone-800/80 pt-4">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>无水印 · 永久商用授权</span>
          </div>
          <span>拾光半格 © 2026</span>
        </div>
      </div>
    </div>
  );
};
