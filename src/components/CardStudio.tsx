import React, { forwardRef } from 'react';
import { CardTemplateType, VibeShotResult, FilterEffect } from '../types';
import { Disc, Sparkles, Film, Compass, Bookmark, Music } from 'lucide-react';

interface CardStudioProps {
  result: VibeShotResult;
  currentTemplate: CardTemplateType;
  filter: FilterEffect;
}

export const CardStudio = forwardRef<HTMLDivElement, CardStudioProps>(
  ({ result, currentTemplate, filter }, ref) => {
    // Current Active Quote
    const activeQuoteData = result.quotes[result.selectedQuoteStyle] || result.quotes.wongKarWai;
    
    // Get quote text
    const mainQuote =
      result.customQuote ||
      (result.selectedQuoteStyle === 'wongKarWai'
        ? (activeQuoteData as any).monologue
        : result.selectedQuoteStyle === 'japaneseMinimal'
        ? (activeQuoteData as any).line
        : result.selectedQuoteStyle === 'frenchChic'
        ? (activeQuoteData as any).editorial
        : (activeQuoteData as any).cureText);

    const englishQuote = (activeQuoteData as any).english || '';
    const dateStr = new Date(result.timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const timeStr = (activeQuoteData as any).timecode || (activeQuoteData as any).midnightTime || '21:30:15';

    // CSS filter helper
    const getFilterClass = (f: FilterEffect) => {
      switch (f) {
        case 'film_grain':
          return 'contrast-110 brightness-95 saturate-85 sepia-[0.15]';
        case 'vintage_warm':
          return 'sepia-[0.28] contrast-105 brightness-100 saturate-110 hue-rotate-[-10deg]';
        case 'tokyo_cool':
          return 'hue-rotate-[18deg] saturate-90 contrast-110 brightness-95';
        case 'cyber_neon':
          return 'contrast-125 saturate-140 brightness-105';
        case 'bnw':
          return 'grayscale contrast-120 brightness-95';
        default:
          return '';
      }
    };

    return (
      <div className="w-full flex justify-center py-4 overflow-hidden">
        {/* The Card Capture Container */}
        <div
          ref={ref}
          id="capture-card-node"
          className="relative transition-all duration-300 select-none shadow-2xl overflow-hidden"
          style={{ width: '100%', maxWidth: '420px' }}
        >
          {/* ========================================================= */}
          {/* 1. TEMPLATE: POLAROID (Classic White Border) */}
          {/* ========================================================= */}
          {currentTemplate === 'polaroid' && (
            <div className="bg-[#FAF9F5] text-stone-900 p-4 sm:p-5 rounded-2xl shadow-2xl border border-stone-200/80 font-serif space-y-4">
              {/* Photo Frame */}
              <div className="relative aspect-4/3 sm:aspect-square w-full rounded-lg overflow-hidden bg-stone-950 shadow-inner">
                <img
                  src={result.imageUrl}
                  alt="VibeShot"
                  crossOrigin="anonymous"
                  className={`w-full h-full object-cover ${getFilterClass(filter)}`}
                />
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-mono text-amber-200 tracking-wider">
                  VIBESHOT · {dateStr}
                </div>
              </div>

              {/* Bottom Bezel with Captions & Color Chips */}
              <div className="pt-2 pb-1 space-y-3">
                {/* Title & Tag */}
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <h3 className="font-bold text-sm text-stone-900 tracking-tight">
                      {result.customTitle || result.photoTitle || '即刻情绪碎片'}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">{timeStr}</span>
                </div>

                {/* Main Quote */}
                <div className="space-y-1.5 min-h-[52px]">
                  <p className="text-xs text-stone-800 leading-relaxed font-serif font-medium tracking-wide">
                    “{mainQuote}”
                  </p>
                  {englishQuote && (
                    <p className="text-[10px] text-stone-500 font-sans italic leading-tight">
                      {englishQuote}
                    </p>
                  )}
                </div>

                {/* 4 Mood Color Swatches */}
                <div className="pt-2 flex items-center justify-between border-t border-stone-200/80">
                  <div className="flex items-center gap-2">
                    {result.colorPalette.map((color, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <div
                          className="w-3.5 h-3.5 rounded-full shadow-sm border border-stone-300/80"
                          style={{ backgroundColor: color.hex }}
                          title={`${color.name} (${color.hex})`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-stone-400">
                    <span>PANTONE® MOOD</span>
                    <span>#{result.colorPalette[0]?.hex}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. TEMPLATE: VINYL RECORD & ALBUM TRACK (Black Luxury) */}
          {/* ========================================================= */}
          {currentTemplate === 'vinyl' && (
            <div className="bg-gradient-to-b from-stone-900 via-stone-950 to-black text-stone-100 p-5 rounded-3xl border border-stone-800 shadow-2xl font-sans space-y-4 relative overflow-hidden">
              {/* Header Badge */}
              <div className="flex items-center justify-between text-xs border-b border-stone-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Disc className="w-4 h-4 text-amber-400 animate-spin-slow" />
                  <span className="font-mono text-[11px] text-amber-300 font-bold tracking-wider">
                    VIBE VINYL SIDE-A
                  </span>
                </div>
                <span className="text-[10px] font-mono text-stone-500">
                  {result.moodDNA.bpmScore}
                </span>
              </div>

              {/* Photo & Emerging Vinyl Disc */}
              <div className="relative flex items-center justify-center py-2">
                {/* Photo Sleeve */}
                <div className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-2xl border border-stone-700 z-10 bg-stone-900 shrink-0">
                  <img
                    src={result.imageUrl}
                    alt="Album Sleeve"
                    crossOrigin="anonymous"
                    className={`w-full h-full object-cover ${getFilterClass(filter)}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 text-[10px] font-serif text-amber-200">
                    {result.customTitle || result.photoTitle}
                  </div>
                </div>

                {/* Half-Emerging Vinyl Disc */}
                <div className="w-44 h-44 rounded-full bg-stone-950 border-4 border-stone-800 shadow-2xl -ml-16 z-0 flex items-center justify-center animate-spin-slow">
                  <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[8px] font-mono text-amber-300 text-center p-1">
                    LP·33 RPM
                  </div>
                </div>
              </div>

              {/* Track Info & Lyric Line */}
              <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-stone-200">
                      {result.moodDNA.bgmTrack.title}
                    </div>
                    <div className="text-[10px] text-stone-400">
                      {result.moodDNA.bgmTrack.artist} · {result.moodDNA.bgmTrack.genre}
                    </div>
                  </div>
                  {/* Audio Wave Visualizer */}
                  <div className="flex items-end gap-0.5 h-4">
                    {[40, 80, 50, 100, 70, 30, 90, 60].map((h, i) => (
                      <span
                        key={i}
                        className="w-1 bg-amber-400 rounded-full"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-amber-100 font-serif italic border-t border-stone-800/80 pt-2 leading-relaxed">
                  “{mainQuote}”
                </p>
              </div>

              {/* 4 Palette Color Blocks Bar */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {result.colorPalette.map((c, i) => (
                  <div
                    key={i}
                    className="p-1.5 rounded-lg border border-stone-800 text-center space-y-0.5"
                    style={{ backgroundColor: `${c.hex}33` }}
                  >
                    <div
                      className="w-full h-2 rounded"
                      style={{ backgroundColor: c.hex }}
                    />
                    <div className="text-[9px] font-mono text-stone-300 truncate">
                      {c.hex}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. TEMPLATE: MAGAZINE COVER (French Monocle Editorial) */}
          {/* ========================================================= */}
          {currentTemplate === 'magazine' && (
            <div className="bg-[#121214] text-stone-100 p-5 rounded-3xl border border-stone-800 shadow-2xl font-serif space-y-4">
              {/* Editorial Header */}
              <div className="text-center border-b-2 border-stone-700 pb-2 space-y-1">
                <div className="flex justify-between items-center text-[9px] font-mono text-stone-400 tracking-widest uppercase">
                  <span>AUTUMN EDITORIAL</span>
                  <span>ISSUE NO. 24</span>
                  <span>{dateStr}</span>
                </div>
                <h2 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-stone-100 via-amber-200 to-stone-300 font-serif">
                  VIBESHOT
                </h2>
                <div className="text-[9px] font-mono tracking-widest text-amber-400 uppercase">
                  AESTHETIC & MOOD JOURNAL
                </div>
              </div>

              {/* Full Width Visual */}
              <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-stone-900 border border-stone-700 shadow-inner">
                <img
                  src={result.imageUrl}
                  alt="Editorial Photo"
                  crossOrigin="anonymous"
                  className={`w-full h-full object-cover ${getFilterClass(filter)}`}
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[9px] font-mono text-white">
                  PHOTO ESSAY · {result.customTitle || result.photoTitle}
                </div>
                <div className="absolute bottom-2 right-2 text-[9px] font-mono text-amber-300 bg-black/60 px-2 py-0.5 rounded">
                  {result.moodDNA.weatherFeel}
                </div>
              </div>

              {/* Editorial Article Excerpt */}
              <div className="grid grid-cols-3 gap-3 pt-1 text-stone-300">
                <div className="col-span-2 space-y-1.5">
                  <div className="text-[10px] font-mono uppercase text-amber-400 tracking-wider">
                    — ESSENCE OF MOMENT
                  </div>
                  <p className="text-xs font-serif leading-relaxed text-stone-200 font-normal">
                    {mainQuote}
                  </p>
                  <p className="text-[9px] font-sans text-stone-400 italic">
                    {englishQuote}
                  </p>
                </div>

                {/* Vertical Color Spec Swatch Column */}
                <div className="col-span-1 border-l border-stone-800 pl-3 space-y-1.5 text-[9px] font-mono">
                  <div className="text-stone-500 uppercase tracking-wider">CMYK SPEC</div>
                  {result.colorPalette.map((c, i) => (
                    <div key={i} className="space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span
                          className="w-2.5 h-2.5 rounded-xs inline-block"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-stone-300 font-bold">{c.hex}</span>
                      </div>
                      <div className="text-[8px] text-stone-500 truncate">{c.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. TEMPLATE: CINEMATIC LETTERBOX 2.39:1 (Wong Kar-wai) */}
          {/* ========================================================= */}
          {currentTemplate === 'cinema' && (
            <div className="bg-black text-stone-100 rounded-3xl border border-stone-900 shadow-2xl font-mono overflow-hidden">
              {/* Cinema Black Top Bar */}
              <div className="bg-black px-4 py-2 flex items-center justify-between text-[10px] text-stone-400 border-b border-stone-900">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                  <span className="text-red-500 font-bold">REC</span>
                  <span>[00:14:28:09]</span>
                </div>
                <div>2.39:1 ANAMORPHIC DCI 4K</div>
                <div className="text-amber-400">FPS 24.00</div>
              </div>

              {/* Anamorphic Widescreen Viewport */}
              <div className="relative aspect-[2.39/1] w-full overflow-hidden bg-stone-950">
                <img
                  src={result.imageUrl}
                  alt="Cinema Frame"
                  crossOrigin="anonymous"
                  className={`w-full h-full object-cover ${getFilterClass(filter)}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                {/* Classic Movie Yellow / White Bilingual Subtitles */}
                <div className="absolute bottom-2 inset-x-4 text-center space-y-0.5">
                  <div className="font-serif text-xs sm:text-sm font-bold text-[#FFE600] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wide">
                    {mainQuote}
                  </div>
                  {englishQuote && (
                    <div className="text-[9px] font-sans text-stone-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] italic">
                      {englishQuote}
                    </div>
                  )}
                </div>
              </div>

              {/* Cinema Black Bottom Bar */}
              <div className="bg-black px-4 py-3 flex items-center justify-between border-t border-stone-900">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-stone-500 font-serif">
                    {result.customTitle || result.photoTitle}
                  </span>
                  <span className="text-[10px] text-stone-600">· {timeStr}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {result.colorPalette.map((c, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full border border-stone-800 shadow-sm"
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 5. TEMPLATE: PANTONE COLOR SPECIMEN (Designer Swatch) */}
          {/* ========================================================= */}
          {currentTemplate === 'pantone' && (
            <div className="bg-white text-stone-900 p-5 rounded-2xl shadow-2xl border border-stone-200 font-sans space-y-4">
              {/* Photo as Main Swatch */}
              <div className="relative aspect-4/3 w-full rounded-lg overflow-hidden bg-stone-900">
                <img
                  src={result.imageUrl}
                  alt="Pantone Main"
                  crossOrigin="anonymous"
                  className={`w-full h-full object-cover ${getFilterClass(filter)}`}
                />
              </div>

              {/* Big Color Palette Grid */}
              <div className="grid grid-cols-4 gap-2">
                {result.colorPalette.map((c, idx) => (
                  <div key={idx} className="space-y-1">
                    <div
                      className="w-full h-14 rounded-lg shadow-sm border border-stone-200/80"
                      style={{ backgroundColor: c.hex }}
                    />
                    <div className="text-[10px] font-mono font-bold text-stone-900 uppercase">
                      {c.hex}
                    </div>
                    <div className="text-[9px] text-stone-500 truncate leading-tight">
                      {c.name.split(' ')[0]}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pantone Specification Label */}
              <div className="border-t-2 border-stone-900 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-base font-black font-mono tracking-tighter text-stone-950">
                    PANTONE® MOOD
                  </div>
                  <div className="text-[10px] font-mono text-stone-500">
                    FORMULA GUIDE 2026
                  </div>
                </div>

                <p className="text-xs text-stone-800 font-serif leading-relaxed italic">
                  “{mainQuote}”
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);
