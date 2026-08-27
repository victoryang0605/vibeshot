import React from 'react';
import { Sparkles, Palette, Crown, Volume2, VolumeX, Camera, Film, Image as ImageIcon, FileCode, Smartphone } from 'lucide-react';

interface HeaderProps {
  soundOn: boolean;
  onToggleSound: () => void;
  onOpenMonetization: () => void;
  onOpenUpload: () => void;
  onOpenSourceCode: () => void;
  isSimulatorMode: boolean;
  onToggleSimulatorMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  soundOn,
  onToggleSound,
  onOpenMonetization,
  onOpenUpload,
  onOpenSourceCode,
  isSimulatorMode,
  onToggleSimulatorMode,
}) => {
  return (
    <header className="w-full border-b border-stone-800/80 bg-stone-950/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shadow-lg shadow-amber-950/30 group-hover:scale-105 transition-all">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-base sm:text-lg tracking-tight text-stone-100 group-hover:text-amber-200 transition-colors">
                拾光半格
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 border border-stone-700">
                VibeShot
              </span>
            </div>
            <p className="text-[11px] text-stone-400 font-serif hidden sm:block">
              随手拍 · 电影帧 · 潘通情绪拍立得
            </p>
          </div>
        </div>

        {/* Quick Actions Right */}
        <div className="flex items-center gap-2">
          {/* 原生小程序工程源码 */}
          <button
            onClick={onOpenSourceCode}
            className="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
            title="查看纯原生微信小程序 (WXML/WXSS/JS/JSON) 完整工程源码"
          >
            <FileCode className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">小程序源码 (WXML)</span>
            <span className="sm:hidden">源码</span>
          </button>

          {/* 微信真机模拟模式切换 */}
          <button
            onClick={onToggleSimulatorMode}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer ${
              isSimulatorMode
                ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border-stone-800'
            }`}
            title="切换微信小程序真机胶囊与刘海屏模拟框"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isSimulatorMode ? '退出小程序框' : '微信真机模式'}</span>
          </button>

          <button
            id="camera-upload-header-btn"
            onClick={onOpenUpload}
            className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">选图</span>
          </button>

          <button
            id="open-monetization-header-btn"
            onClick={onOpenMonetization}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm group"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="hidden lg:inline">商业变现</span>
          </button>

          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
            title={soundOn ? '静音音效' : '开启胶片快门与黑胶环境音'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
