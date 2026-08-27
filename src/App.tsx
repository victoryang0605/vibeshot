import React, { useState, useRef } from 'react';
import { CardTemplateType, FilterEffect, QuoteStyle, VibeShotResult, GeneratedPoster } from './types';
import { FALLBACK_VIBESHOT, PRESET_PHOTOS } from './utils/presetPhotos';
import { Header } from './components/Header';
import { PhotoUploader } from './components/PhotoUploader';
import { CardStudio } from './components/CardStudio';
import { TemplateSelector } from './components/TemplateSelector';
import { FilterControls } from './components/FilterControls';
import { QuoteStyleSelector } from './components/QuoteStyleSelector';
import { ColorPaletteBar } from './components/ColorPaletteBar';
import { MoodDNAPanel } from './components/MoodDNAPanel';
import { ExportModal } from './components/ExportModal';
import { ProMonetizationModal } from './components/ProMonetizationModal';
import { MiniProgramSourceModal } from './components/MiniProgramSourceModal';
import { WechatSimulatorFrame } from './components/WechatSimulatorFrame';
import { AiRedrawModal } from './components/AiRedrawModal';
import { playLofiChimeSound, playCameraShutterSound, setSoundEnabled } from './utils/audio';
import { Sparkles, Download, Share2, Crown, RefreshCw, Camera, FileCode, Smartphone, Wand2 } from 'lucide-react';

export function App() {
  const [currentResult, setCurrentResult] = useState<VibeShotResult>(FALLBACK_VIBESHOT);
  const [currentTemplate, setCurrentTemplate] = useState<CardTemplateType>('polaroid');
  const [currentFilter, setCurrentFilter] = useState<FilterEffect>('none');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [isSimulatorMode, setIsSimulatorMode] = useState(false);

  // AI 重绘海报 (Agnes Image 2.1 Flash)
  const [generatedPoster, setGeneratedPoster] = useState<GeneratedPoster | null>(null);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);

  // Modals
  const [showExportModal, setShowExportModal] = useState(false);
  const [showMonetizationModal, setShowMonetizationModal] = useState(false);
  const [showSourceCodeModal, setShowSourceCodeModal] = useState(false);

  // Card reference for html-to-image export
  const cardRef = useRef<HTMLDivElement>(null);
  const uploaderSectionRef = useRef<HTMLDivElement>(null);

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  // Trigger AI vision color analysis on uploaded or selected image
  const handleSelectImage = async (base64OrUrl: string, title?: string, isFile = false) => {
    setIsAnalyzing(true);
    try {
      // If it is a base64 image from file upload
      let requestBody: any = {
        photoTitle: title || '日常高光瞬间',
      };

      if (isFile && base64OrUrl.startsWith('data:')) {
        requestBody.imageBase64 = base64OrUrl;
        const mimeMatch = base64OrUrl.match(/^data:(image\/\w+);base64,/);
        if (mimeMatch) {
          requestBody.mimeType = mimeMatch[1];
        }
      } else {
        // If it's a preset URL, check if we have a preset
        const matchedPreset = PRESET_PHOTOS.find((p) => p.imageUrl === base64OrUrl);
        if (matchedPreset) {
          requestBody.photoTitle = matchedPreset.title;
        }
      }

      const res = await fetch('/api/vibeshot/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentResult({
          ...data,
          imageUrl: base64OrUrl,
          selectedQuoteStyle: 'wongKarWai',
          filter: currentFilter,
        });
        playLofiChimeSound();
      } else {
        // Fallback gracefully
        setCurrentResult((prev) => ({
          ...prev,
          imageUrl: base64OrUrl,
          photoTitle: title || prev.photoTitle,
        }));
        playLofiChimeSound();
      }
    } catch (err) {
      console.error('Analysis request error:', err);
      setCurrentResult((prev) => ({
        ...prev,
        imageUrl: base64OrUrl,
        photoTitle: title || prev.photoTitle,
      }));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectQuoteStyle = (style: QuoteStyle) => {
    setCurrentResult((prev) => ({
      ...prev,
      selectedQuoteStyle: style,
      customQuote: undefined, // Reset custom quote to show style default
    }));
  };

  const handleUpdateCustomQuote = (text: string) => {
    setCurrentResult((prev) => ({
      ...prev,
      customQuote: text.trim() === '' ? undefined : text,
    }));
  };

  // 当前选中台词（与 CardStudio 保持一致的取词逻辑）
  const getActiveQuoteText = (result: VibeShotResult): string => {
    if (result.customQuote) return result.customQuote;
    const q = result.quotes[result.selectedQuoteStyle] || result.quotes.wongKarWai;
    switch (result.selectedQuoteStyle) {
      case 'japaneseMinimal': return (q as any).line;
      case 'frenchChic': return (q as any).editorial;
      case 'lateNight': return (q as any).cureText;
      default: return (q as any).monologue;
    }
  };

  // AI 重绘电影海报（图生图：以当前照片为参考；预设远程图直接引用 URL）
  const handleAiRedraw = async () => {
    setIsGeneratingPoster(true);
    try {
      const result = currentResult;
      const activeQuote = getActiveQuoteText(result);
      const keywords = (result.moodDNA?.vibeKeywords || []).join('、');
      const prompt = `将这张照片重绘成一幅电影感海报：主体是「${result.photoTitle || '日常高光瞬间'}」，情绪基调「${result.moodDNA?.dominantMood || '松弛电影感'}」，美学关键词「${keywords || '胶片颗粒、电影感、高级灰'}」。画面配文："${activeQuote}"。请保留原照片的主体与构图，提升为王家卫电影质感：胶片颗粒、湿润冷调、光影层次丰富、电影级宽银幕构图、高级版式设计感，高细节、高质量。`;

      const isLocalBase64 = result.imageUrl?.startsWith('data:');
      const body: any = {
        prompt,
        size: '1024x1024',
        ratio: '1:1',
        usePhotoAsReference: true,
      };
      if (isLocalBase64) {
        body.imageBase64 = result.imageUrl;
      } else if (result.imageUrl) {
        body.imageUrl = result.imageUrl; // 公开 URL（如 Unsplash 预设）
      }

      const res = await fetch('/api/vibeshot/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.imageDataUrl || data.imageUrl) {
          setGeneratedPoster(data);
          playLofiChimeSound();
          return;
        }
        throw new Error(data.error || '生图接口未返回图片');
      } else {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `生图接口错误 ${res.status}`);
      }
    } catch (err) {
      console.error('AI redraw request error:', err);
      alert(`AI 重绘失败：${err instanceof Error ? err.message : err}`);
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header */}
      <Header
        soundOn={soundOn}
        onToggleSound={handleToggleSound}
        onOpenMonetization={() => setShowMonetizationModal(true)}
        onOpenUpload={() => {
          uploaderSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenSourceCode={() => setShowSourceCodeModal(true)}
        isSimulatorMode={isSimulatorMode}
        onToggleSimulatorMode={() => setIsSimulatorMode(!isSimulatorMode)}
      />

      {/* Mini Program Source Ready Notification Banner */}
      <div className="bg-emerald-950/40 border-b border-emerald-500/20 py-2 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-300 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>已生成微信原生小程序全套工程源码 (/miniprogram) · 支持微信开发者工具一键导入</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSourceCodeModal(true)}
              className="text-emerald-400 hover:text-emerald-200 underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>查看源码包 (WXML/WXSS)</span>
            </button>
            <span className="text-emerald-700">|</span>
            <button
              onClick={() => setIsSimulatorMode(!isSimulatorMode)}
              className="text-amber-400 hover:text-amber-200 underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{isSimulatorMode ? '切换宽屏' : '体验微信真机框'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      {isSimulatorMode ? (
        <div className="py-6 px-4 flex flex-col items-center">
          <div className="mb-4 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
              <Smartphone className="w-3.5 h-3.5" />
              <span>微信原生小程序真机胶囊与刘海屏模拟</span>
            </span>
          </div>
          <WechatSimulatorFrame title="拾光半格 · 电影帧">
            <div className="p-4 space-y-5">
              {/* Studio Workspace within Simulator */}
              <div className="bg-stone-900/60 border border-stone-800/80 rounded-2xl p-3 flex flex-col items-center">
                <CardStudio
                  ref={cardRef}
                  result={currentResult}
                  currentTemplate={currentTemplate}
                  filter={currentFilter}
                />

                <div className="w-full grid grid-cols-2 gap-2 pt-3 border-t border-stone-800 mt-2">
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>保存海报</span>
                  </button>

                  <button
                    onClick={() => setShowExportModal(true)}
                    className="py-2.5 px-2 rounded-xl bg-stone-800 text-stone-100 font-semibold text-xs flex items-center justify-center gap-1 border border-stone-700 active:scale-95 transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>发圈文案</span>
                  </button>

                  <button
                    onClick={handleAiRedraw}
                    disabled={isGeneratingPoster}
                    className="col-span-2 py-2.5 px-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all disabled:opacity-60"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>{isGeneratingPoster ? 'Agnes 重绘中...' : 'AI 重绘电影海报'}</span>
                  </button>
                </div>
              </div>

              <TemplateSelector
                currentTemplate={currentTemplate}
                onSelectTemplate={setCurrentTemplate}
              />

              <FilterControls
                currentFilter={currentFilter}
                onSelectFilter={setCurrentFilter}
              />

              <QuoteStyleSelector
                result={currentResult}
                onSelectQuoteStyle={handleSelectQuoteStyle}
                onUpdateCustomQuote={handleUpdateCustomQuote}
              />

              <ColorPaletteBar palette={currentResult.colorPalette} />

              <MoodDNAPanel moodDNA={currentResult.moodDNA} />

              <PhotoUploader
                onSelectImage={handleSelectImage}
                isAnalyzing={isAnalyzing}
              />
            </div>
          </WechatSimulatorFrame>
        </div>
      ) : (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
          {/* Hero Concept Intro */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>微信小程序 · 纯原生工程已就绪</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-stone-100 via-amber-200 to-stone-300 tracking-tight">
              随手拍照片 · 3秒变身高级电影帧
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 font-serif leading-relaxed">
              提取情绪潘通色标，提炼王家卫/日系极简电影台词，一键排版导出高调性朋友圈海报
            </p>
          </div>

          {/* Studio Workspace: 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (5 Cols): Real-time Rendered Card Showcase */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
              <div className="bg-stone-900/60 border border-stone-800/80 rounded-3xl p-4 sm:p-5 backdrop-blur-md shadow-2xl flex flex-col items-center">
                <div className="flex items-center justify-between w-full pb-3 border-b border-stone-800 text-xs text-stone-400">
                  <span className="font-mono text-amber-400 flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5" /> 实时排版预览
                  </span>
                  <span className="text-[10px] text-stone-500 font-serif">
                    {currentResult.photoTitle}
                  </span>
                </div>

                {/* The Visual Card Node */}
                <CardStudio
                  ref={cardRef}
                  result={currentResult}
                  currentTemplate={currentTemplate}
                  filter={currentFilter}
                />

                {/* Quick Primary Actions */}
                <div className="w-full grid grid-cols-2 gap-2.5 pt-3 border-t border-stone-800">
                  <button
                    id="open-export-modal-btn"
                    onClick={() => setShowExportModal(true)}
                    className="py-3 px-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-950/40 active:scale-95 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>导出高清卡片</span>
                  </button>

                  <button
                    onClick={() => setShowExportModal(true)}
                    className="py-3 px-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-100 font-semibold text-xs flex items-center justify-center gap-1.5 border border-stone-700 active:scale-95 transition-all cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-amber-400" />
                    <span>发圈文案</span>
                  </button>

                  <button
                    onClick={handleAiRedraw}
                    disabled={isGeneratingPoster}
                    className="col-span-2 py-3 px-3 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-fuchsia-950/40 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-wait cursor-pointer"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>{isGeneratingPoster ? 'Agnes 正在重绘海报...' : 'AI 重绘电影海报（Agnes 免费生图）'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column (7 Cols): Aesthetic Controls & Customizers */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Template Selector */}
              <TemplateSelector
                currentTemplate={currentTemplate}
                onSelectTemplate={setCurrentTemplate}
              />

              {/* 2. Film Lens Filters */}
              <FilterControls
                currentFilter={currentFilter}
                onSelectFilter={setCurrentFilter}
              />

              {/* 3. Poetic Quotes & Style Selector */}
              <QuoteStyleSelector
                result={currentResult}
                onSelectQuoteStyle={handleSelectQuoteStyle}
                onUpdateCustomQuote={handleUpdateCustomQuote}
              />

              {/* 4. Pantone Color Swatches Bar */}
              <ColorPaletteBar palette={currentResult.colorPalette} />

              {/* 5. Mood Sensory DNA */}
              <MoodDNAPanel moodDNA={currentResult.moodDNA} />

              {/* 6. Photo Uploader & Presets */}
              <div ref={uploaderSectionRef} className="pt-2">
                <PhotoUploader
                  onSelectImage={handleSelectImage}
                  isAnalyzing={isAnalyzing}
                />
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Modals */}
      {showExportModal && (
        <ExportModal
          result={currentResult}
          currentTemplate={currentTemplate}
          cardRef={cardRef}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showMonetizationModal && (
        <ProMonetizationModal onClose={() => setShowMonetizationModal(false)} />
      )}

      {showSourceCodeModal && (
        <MiniProgramSourceModal onClose={() => setShowSourceCodeModal(false)} />
      )}

      {generatedPoster && (
        <AiRedrawModal
          poster={generatedPoster}
          onClose={() => setGeneratedPoster(null)}
          onRegenerate={handleAiRedraw}
          isRegenerating={isGeneratingPoster}
        />
      )}
    </div>
  );
}

export default App;
