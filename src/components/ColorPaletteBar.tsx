import React, { useState } from 'react';
import { ColorSwatch } from '../types';
import { Palette, Copy, Check, Sparkles } from 'lucide-react';

interface ColorPaletteBarProps {
  palette: ColorSwatch[];
}

export const ColorPaletteBar: React.FC<ColorPaletteBarProps> = ({ palette }) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  return (
    <div className="w-full bg-stone-900/80 border border-stone-800 rounded-3xl p-5 space-y-4 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-stone-100">画面情绪潘通色号 (Pantone Palette)</h3>
        </div>
        <span className="text-[11px] text-stone-500 font-mono">点击色块复制 HEX 色号</span>
      </div>

      {/* 4 Swatches Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {palette.map((color, idx) => {
          const isCopied = copiedHex === color.hex;
          return (
            <div
              key={idx}
              onClick={() => handleCopyHex(color.hex)}
              className="p-3 rounded-2xl bg-stone-950 border border-stone-800/80 hover:border-amber-500/40 cursor-pointer group transition-all hover:scale-[1.02] space-y-2.5"
            >
              {/* Color Swatch Block */}
              <div
                className="w-full h-14 rounded-xl shadow-md border border-white/10 relative overflow-hidden flex items-center justify-center"
                style={{ backgroundColor: color.hex }}
              >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-xs px-2 py-1 rounded-md text-[10px] font-mono text-white flex items-center gap-1">
                  {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{isCopied ? '已复制' : '复制HEX'}</span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-stone-200 uppercase">
                    {color.hex}
                  </span>
                  <span className="text-[10px] font-mono text-amber-400/90 font-medium">
                    {color.percentage}%
                  </span>
                </div>
                <div className="text-xs font-serif text-stone-300 truncate">
                  {color.name}
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
                  <span>{color.moodTag}</span>
                  {color.cmyk && <span className="text-[9px] truncate max-w-[80px]">{color.cmyk}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
