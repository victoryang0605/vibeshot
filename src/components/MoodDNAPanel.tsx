import React from 'react';
import { MoodDNA } from '../types';
import { Sparkles, Music, CloudSun, Wind, Radio } from 'lucide-react';

interface MoodDNAPanelProps {
  moodDNA: MoodDNA;
}

export const MoodDNAPanel: React.FC<MoodDNAPanelProps> = ({ moodDNA }) => {
  return (
    <div className="w-full bg-stone-900/80 border border-stone-800 rounded-3xl p-5 space-y-4 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-stone-100">情绪通感与空间 DNA (Mood Sensory)</h3>
        </div>
        <span className="text-[11px] text-amber-300 font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
          {moodDNA.dominantMood}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* 1. BGM Track */}
        <div className="p-3 rounded-2xl bg-stone-950/80 border border-stone-800/80 space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
            <Music className="w-3.5 h-3.5" />
            <span>通感听觉背景音 (BGM)</span>
          </div>
          <div className="font-bold text-stone-200 truncate">{moodDNA.bgmTrack.title}</div>
          <div className="text-[11px] text-stone-400 truncate">
            {moodDNA.bgmTrack.artist} · {moodDNA.bpmScore}
          </div>
        </div>

        {/* 2. Weather & Time */}
        <div className="p-3 rounded-2xl bg-stone-950/80 border border-stone-800/80 space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
            <CloudSun className="w-3.5 h-3.5" />
            <span>环境气候与光温</span>
          </div>
          <div className="font-bold text-stone-200 truncate">{moodDNA.weatherFeel}</div>
          <div className="text-[11px] text-stone-400">光线柔和，适宜放空</div>
        </div>

        {/* 3. Scent Note */}
        <div className="p-3 rounded-2xl bg-stone-950/80 border border-stone-800/80 space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
            <Wind className="w-3.5 h-3.5" />
            <span>通感气味小像</span>
          </div>
          <div className="text-[11px] text-stone-300 font-serif leading-tight">
            {moodDNA.scentNote}
          </div>
        </div>
      </div>

      {/* Vibe Keywords Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[11px] text-stone-500 font-mono">美学关键词：</span>
        {moodDNA.vibeKeywords.map((kw, i) => (
          <span
            key={i}
            className="px-2.5 py-1 rounded-xl bg-stone-800/90 text-stone-300 border border-stone-700/60 text-xs font-mono"
          >
            #{kw}
          </span>
        ))}
      </div>
    </div>
  );
};
