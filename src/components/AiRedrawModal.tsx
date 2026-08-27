import React, { useState } from 'react';
import { GeneratedPoster } from '../types';
import { X, Download, Sparkles, Loader2, ExternalLink, RotateCcw } from 'lucide-react';

interface AiRedrawModalProps {
  poster: GeneratedPoster;
  onClose: () => void;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export const AiRedrawModal: React.FC<AiRedrawModalProps> = ({
  poster,
  onClose,
  onRegenerate,
  isRegenerating,
}) => {
  const [downloaded, setDownloaded] = useState(false);

  const imageSrc = poster.imageDataUrl || poster.imageUrl || '';

  const handleDownload = async () => {
    if (!imageSrc) return;
    try {
      if (poster.imageDataUrl) {
        // Base64 直出
        const link = document.createElement('a');
        link.download = `Shiguang_AI_Poster_${Date.now()}.png`;
        link.href = poster.imageDataUrl;
        link.click();
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 2000);
      } else if (poster.imageUrl) {
        // 跨域 URL 转 blob 下载（失败则新窗口打开）
        try {
          const blob = await (await fetch(poster.imageUrl)).blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `Shiguang_AI_Poster_${Date.now()}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          setDownloaded(true);
          setTimeout(() => setDownloaded(false), 2000);
        } catch {
          window.open(poster.imageUrl, '_blank');
        }
      }
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-stone-950 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800">
          <div className="flex items-center gap-2 text-amber-300">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-bold font-serif">AI 重绘电影海报</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
            aria-label="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Generated Artwork */}
        <div className="p-5">
          <div className="relative rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 aspect-square flex items-center justify-center">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt="AI 重绘电影海报"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-stone-500 text-xs">图片生成中...</div>
            )}
            {isRegenerating && (
              <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                <div className="text-xs text-amber-200 font-serif animate-pulse">
                  Agnes Image 2.1 正在重绘海报...
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2.5 mt-4">
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                disabled={isRegenerating}
                className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-stone-700 disabled:opacity-50 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>换一种风格</span>
              </button>
            )}
            <button
              onClick={handleDownload}
              disabled={!imageSrc}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloaded ? '已开始下载' : '下载高清图'}</span>
            </button>
          </div>

          {poster.imageUrl && (
            <a
              href={poster.imageUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex items-center justify-center gap-1 text-[11px] text-stone-500 hover:text-amber-300 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              查看原图链接
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
