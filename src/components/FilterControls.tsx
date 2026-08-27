import React from 'react';
import { FilterEffect } from '../types';
import { Sliders, Sparkles, Sun, Moon, Zap, Eye } from 'lucide-react';
import { playCardSwitchSound } from '../utils/audio';

interface FilterControlsProps {
  currentFilter: FilterEffect;
  onSelectFilter: (filter: FilterEffect) => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  currentFilter,
  onSelectFilter,
}) => {
  const filters: { id: FilterEffect; label: string; icon: any; tag: string }[] = [
    { id: 'none', label: '原图质感', icon: Eye, tag: '清晰' },
    { id: 'film_grain', label: '胶片颗粒', icon: Sparkles, tag: '王家卫' },
    { id: 'vintage_warm', label: '暖阳复古', icon: Sun, tag: '法式' },
    { id: 'tokyo_cool', label: '东京冷蓝', icon: Moon, tag: '物哀' },
    { id: 'cyber_neon', label: '赛博霓虹', icon: Zap, tag: '高对比' },
    { id: 'bnw', label: '经典黑白', icon: Sliders, tag: '纯粹' },
  ];

  return (
    <div className="w-full bg-stone-900/80 border border-stone-800 rounded-3xl p-5 space-y-3 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-stone-100">胶片调色滤镜 (Film Lenses)</h3>
        </div>
        <span className="text-[11px] text-stone-500 font-mono">实时色彩渲染</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {filters.map((f) => {
          const Icon = f.icon;
          const isActive = currentFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => {
                playCardSwitchSound();
                onSelectFilter(f.id);
              }}
              className={`p-2.5 rounded-2xl border text-center transition-all space-y-1 group ${
                isActive
                  ? 'bg-amber-500/20 border-amber-500/60 shadow-sm'
                  : 'bg-stone-950/60 hover:bg-stone-950 border-stone-800/80 hover:border-stone-700'
              }`}
            >
              <div
                className={`w-7 h-7 mx-auto rounded-xl flex items-center justify-center ${
                  isActive ? 'bg-amber-400 text-stone-950' : 'bg-stone-800 text-stone-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div
                className={`text-xs font-medium ${
                  isActive ? 'text-amber-200 font-bold' : 'text-stone-300'
                }`}
              >
                {f.label}
              </div>
              <div className="text-[9px] font-mono text-stone-500">{f.tag}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
