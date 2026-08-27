import React, { useState } from 'react';
import { QuoteStyle, VibeShotResult } from '../types';
import { Film, Wind, Coffee, Moon, Edit3, Check, Copy, RefreshCw } from 'lucide-react';
import { playCardSwitchSound } from '../utils/audio';

interface QuoteStyleSelectorProps {
  result: VibeShotResult;
  onSelectQuoteStyle: (style: QuoteStyle) => void;
  onUpdateCustomQuote: (text: string) => void;
}

export const QuoteStyleSelector: React.FC<QuoteStyleSelectorProps> = ({
  result,
  onSelectQuoteStyle,
  onUpdateCustomQuote,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const quoteStyles: { id: QuoteStyle; label: string; icon: any; desc: string }[] = [
    { id: 'wongKarWai', label: '王家卫电影独白', icon: Film, desc: '距离0.01公分 · 记忆保质期' },
    { id: 'japaneseMinimal', label: '日系物哀极简', icon: Wind, desc: '光影流转 · 生活神迹' },
    { id: 'frenchChic', label: '法式时髦杂志', icon: Coffee, desc: 'Effortless Chic · 高级松弛' },
    { id: 'lateNight', label: '深夜治愈解药', icon: Moon, desc: '折叠喧嚣 · 温柔入梦' },
  ];

  const currentQuote =
    result.customQuote ||
    (result.selectedQuoteStyle === 'wongKarWai'
      ? result.quotes.wongKarWai.monologue
      : result.selectedQuoteStyle === 'japaneseMinimal'
      ? result.quotes.japaneseMinimal.line
      : result.selectedQuoteStyle === 'frenchChic'
      ? result.quotes.frenchChic.editorial
      : result.quotes.lateNight.cureText);

  const handleCopyText = () => {
    navigator.clipboard.writeText(currentQuote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-stone-900/80 border border-stone-800 rounded-3xl p-5 space-y-4 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-stone-100">精选双语文案与电影台词</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-2.5 py-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs flex items-center gap-1 transition-colors"
          >
            <Edit3 className="w-3 h-3 text-amber-400" />
            <span>{isEditing ? '完成' : '编辑文案'}</span>
          </button>

          <button
            onClick={handleCopyText}
            className="px-2.5 py-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs flex items-center gap-1 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? '已复制' : '复制文案'}</span>
          </button>
        </div>
      </div>

      {/* Style Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {quoteStyles.map((s) => {
          const Icon = s.icon;
          const isActive = result.selectedQuoteStyle === s.id;
          return (
            <button
              key={s.id}
              onClick={() => {
                playCardSwitchSound();
                onSelectQuoteStyle(s.id);
              }}
              className={`p-2.5 rounded-2xl border text-left space-y-1 transition-all ${
                isActive
                  ? 'bg-amber-500/15 border-amber-500/60 shadow-sm'
                  : 'bg-stone-950/60 hover:bg-stone-950 border-stone-800/80 hover:border-stone-700'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-stone-400'}`} />
                <span className={`text-xs font-semibold ${isActive ? 'text-amber-200' : 'text-stone-300'}`}>
                  {s.label}
                </span>
              </div>
              <div className="text-[10px] text-stone-500 truncate font-serif">
                {s.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* Editable or Current Quote Display */}
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={currentQuote}
            onChange={(e) => onUpdateCustomQuote(e.target.value)}
            rows={3}
            className="w-full p-3 rounded-2xl bg-stone-950 border border-amber-500/40 text-stone-100 text-xs font-serif leading-relaxed focus:outline-none focus:border-amber-400 resize-none shadow-inner"
            placeholder="输入您自定义的金句文案..."
          />
          <div className="flex justify-between items-center text-[10px] text-stone-500">
            <span>支持任意自定义文字，实时同步至当前卡片</span>
            <button
              onClick={() => onUpdateCustomQuote('')}
              className="text-amber-400/80 hover:text-amber-300 underline"
            >
              恢复 AI 原始文案
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800/80 space-y-1.5">
          <p className="text-xs font-serif text-stone-200 leading-relaxed italic">
            “{currentQuote}”
          </p>
          {result.quotes[result.selectedQuoteStyle]?.english && (
            <p className="text-[10px] font-sans text-stone-400 italic">
              {result.quotes[result.selectedQuoteStyle]?.english}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
