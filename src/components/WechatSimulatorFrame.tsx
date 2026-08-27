import React from 'react';
import { Wifi, Battery, Signal, MoreHorizontal, CircleDot } from 'lucide-react';

interface Props {
  title?: string;
  children: React.ReactNode;
}

export function WechatSimulatorFrame({ title = '拾光半格', children }: Props) {
  return (
    <div className="flex justify-center w-full py-2">
      <div className="w-full max-w-[420px] bg-stone-950 border-[6px] border-stone-800 rounded-[48px] shadow-2xl shadow-black/80 overflow-hidden flex flex-col relative ring-1 ring-stone-700/50">
        
        {/* Dynamic Island / iPhone Top Notch */}
        <div className="w-full bg-stone-950 px-7 pt-3.5 pb-1 flex items-center justify-between text-stone-200 text-xs select-none">
          <span className="font-semibold text-xs tracking-tight">9:41</span>
          <div className="w-24 h-4 bg-stone-900 rounded-full flex items-center justify-center border border-stone-800">
            <div className="w-2 h-2 rounded-full bg-stone-950 mr-2"></div>
            <div className="w-2 h-2 rounded-full bg-stone-800"></div>
          </div>
          <div className="flex items-center gap-1.5 text-stone-300">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* WeChat Mini Program Custom Navigation Bar with Official Top-Right Capsule Button */}
        <div className="w-full bg-stone-950/95 border-b border-stone-800/80 px-4 py-2.5 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
          {/* Left Title */}
          <div className="flex items-center gap-1.5">
            <span className="font-serif font-black text-sm text-stone-100">{title}</span>
          </div>

          {/* Official WeChat Top-Right Capsule Button (小程序胶囊按钮) */}
          <div className="flex items-center h-8 px-2.5 rounded-full bg-stone-900/90 border border-stone-700/70 text-stone-200 shadow-inner gap-2 select-none">
            <button 
              className="p-1 hover:text-amber-400 transition-colors cursor-pointer"
              title="微信小程序菜单 (分享/设置/浮窗)"
              onClick={() => alert('微信小程序原生右上角菜单：分享给朋友 / 分享到朋友圈 / 添加到我的小程序')}
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-3 bg-stone-700"></div>
            <button 
              className="p-1 hover:text-rose-400 transition-colors cursor-pointer"
              title="微信小程序退出 / 关闭"
              onClick={() => alert('微信小程序胶囊：最小化 / 退出小程序')}
            >
              <CircleDot className="w-3.5 h-3.5 text-stone-300" />
            </button>
          </div>
        </div>

        {/* Mini Program Page Body Container */}
        <div className="w-full bg-stone-950 overflow-y-auto max-h-[800px] scrollbar-thin scrollbar-thumb-stone-800">
          {children}
        </div>

        {/* iPhone Home Indicator Bottom Bar */}
        <div className="w-full bg-stone-950 py-2 flex justify-center border-t border-stone-900">
          <div className="w-32 h-1 bg-stone-700 rounded-full"></div>
        </div>

      </div>
    </div>
  );
}
