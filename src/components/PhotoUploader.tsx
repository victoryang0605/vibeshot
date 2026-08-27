import React, { useRef, useState } from 'react';
import { Upload, Camera, Image as ImageIcon, Sparkles, Wand2, Compass } from 'lucide-react';
import { PresetPhoto } from '../types';
import { PRESET_PHOTOS } from '../utils/presetPhotos';
import { playCameraShutterSound } from '../utils/audio';

interface PhotoUploaderProps {
  onSelectImage: (base64OrUrl: string, title?: string, isFile?: boolean) => void;
  isAnalyzing: boolean;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ onSelectImage, isAnalyzing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [customTitle, setCustomTitle] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playCameraShutterSound();
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      onSelectImage(base64, customTitle || file.name.replace(/\.[^/.]+$/, ''), true);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    playCameraShutterSound();
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      onSelectImage(base64, customTitle || file.name.replace(/\.[^/.]+$/, ''), true);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: PresetPhoto) => {
    playCameraShutterSound();
    onSelectImage(preset.imageUrl, preset.title, false);
  };

  return (
    <div className="w-full bg-stone-900/90 border border-stone-800 rounded-3xl p-5 sm:p-7 backdrop-blur-xl shadow-2xl space-y-6">
      {/* Upload Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800/80 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> 上传随手拍照片 · 3秒提炼电影帧
          </h2>
          <p className="text-xs text-stone-400">
            支持咖啡、路灯、窗台、猫咪、雨夜或工作台等任意生活瞬间
          </p>
        </div>

        {/* Optional Title input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="自定义画面标题 (选填)"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50 w-44"
          />
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all group overflow-hidden ${
          isDragOver
            ? 'border-amber-400 bg-amber-500/10'
            : 'border-stone-800 hover:border-amber-500/50 bg-stone-950/60 hover:bg-stone-950/90'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-stone-800/80 border border-stone-700/60 flex items-center justify-center text-amber-300 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all shadow-inner">
            <Camera className="w-7 h-7" />
          </div>
          <div>
            <div className="text-sm font-semibold text-stone-200 group-hover:text-amber-200 transition-colors">
              点击选择照片 / 拍摄，或直接拖拽图片到这里
            </div>
            <p className="text-xs text-stone-500 mt-1">
              支持 JPG, PNG, WEBP, HEIC 格式（本地纯净秒级解析，隐私安全）
            </p>
          </div>
        </div>

        {isAnalyzing && (
          <div className="absolute inset-0 bg-stone-950/90 backdrop-blur-md flex flex-col items-center justify-center space-y-3 z-20">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <div className="text-xs font-serif text-amber-200 animate-pulse">
              正在萃取情绪潘通色谱 & 谱写王家卫独白...
            </div>
          </div>
        )}
      </div>

      {/* Curated Sample Presets Gallery */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-400" /> 或一键体验高逼格精选样片：
          </span>
          <span className="text-[11px] text-stone-500 font-serif">点击即刻生成</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {PRESET_PHOTOS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className="group cursor-pointer rounded-2xl bg-stone-950 border border-stone-800 hover:border-amber-500/40 p-2 space-y-2 transition-all hover:scale-[1.02]"
            >
              <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-stone-900">
                <img
                  src={preset.imageUrl}
                  alt={preset.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                <span className="absolute bottom-1 left-1.5 text-[10px] text-stone-200 font-mono px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs">
                  {preset.tag}
                </span>
              </div>
              <div className="text-xs font-medium text-stone-300 group-hover:text-amber-300 truncate">
                {preset.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
