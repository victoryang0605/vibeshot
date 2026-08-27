import React from 'react';
import { CardTemplateType } from '../types';
import { Camera, Disc, Newspaper, Film, Palette } from 'lucide-react';
import { playCardSwitchSound } from '../utils/audio';

interface TemplateSelectorProps {
  currentTemplate: CardTemplateType;
  onSelectTemplate: (template: CardTemplateType) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  currentTemplate,
  onSelectTemplate,
}) => {
  const templates: { id: CardTemplateType; name: string; icon: any; tag: string }[] = [
    { id: 'polaroid', name: '经典拍立得', icon: Camera, tag: '小红书爆款' },
    { id: 'vinyl', name: '黑胶唱片卡', icon: Disc, tag: '网易云热评' },
    { id: 'magazine', name: '法式杂志封面', icon: Newspaper, tag: 'Vogue调性' },
    { id: 'cinema', name: '2.39:1 电影帧', icon: Film, tag: '王家卫胶片' },
    { id: 'pantone', name: '潘通情绪色卡', icon: Palette, tag: '设计师质感' },
  ];

  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between text-xs text-stone-400">
        <span className="font-semibold text-stone-200">选择高定排版卡片模板</span>
        <span className="text-[11px] text-stone-500 font-mono">5 种风格即刻切换</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {templates.map((t) => {
          const Icon = t.icon;
          const isActive = currentTemplate === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                playCardSwitchSound();
                onSelectTemplate(t.id);
              }}
              className={`p-3 rounded-2xl border transition-all text-left flex flex-col justify-between space-y-2 group cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-b from-amber-500/20 to-orange-500/10 border-amber-500/60 shadow-lg shadow-amber-950/20'
                  : 'bg-stone-900/80 hover:bg-stone-900 border-stone-800 hover:border-stone-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                    isActive ? 'bg-amber-400 text-stone-950' : 'bg-stone-800 text-stone-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                    isActive
                      ? 'bg-amber-400/20 text-amber-300'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {t.tag}
                </span>
              </div>
              <div
                className={`text-xs font-semibold tracking-tight ${
                  isActive ? 'text-amber-200 font-bold' : 'text-stone-300'
                }`}
              >
                {t.name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
