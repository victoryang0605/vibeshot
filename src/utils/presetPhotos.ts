import { PresetPhoto, VibeShotResult } from '../types';

export const PRESET_PHOTOS: PresetPhoto[] = [
  {
    id: 'coffee-afternoon',
    title: '☕ 午后燕麦拿铁',
    category: 'coffee',
    tag: '松弛感 / 慢生活',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    fallbackColors: [
      { hex: '#3E2723', name: '深焙浓缩 Espresso Noir', cmyk: 'C:40 M:60 Y:70 K:80', percentage: 38, moodTag: '沉淀 38%' },
      { hex: '#8D6E63', name: '燕麦温存 Oat Velvet', cmyk: 'C:20 M:40 Y:50 K:20', percentage: 28, moodTag: '温和 28%' },
      { hex: '#D7CCC8', name: '奶泡呢喃 Silk Cream', cmyk: 'C:10 M:15 Y:20 K:0', percentage: 22, moodTag: '治愈 22%' },
      { hex: '#ECEFF1', name: '午后留白 Cloud White', cmyk: 'C:5 M:3 Y:2 K:0', percentage: 12, moodTag: '松弛 12%' },
    ],
  },
  {
    id: 'tokyo-rain',
    title: '🌧️ 深夜东京雨巷',
    category: 'night',
    tag: '王家卫 / 电影感',
    imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80',
    fallbackColors: [
      { hex: '#0F172A', name: '雨夜沥青 Wet Midnight', cmyk: 'C:70 M:60 Y:50 K:90', percentage: 42, moodTag: '冷冽 42%' },
      { hex: '#E11D48', name: '霓虹余热 Neon Crimson', cmyk: 'C:0 M:95 Y:65 K:0', percentage: 24, moodTag: '心跳 24%' },
      { hex: '#38BDF8', name: '潮湿冷蓝 Tokyo Mist', cmyk: 'C:60 M:10 Y:0 K:0', percentage: 20, moodTag: '孤光 20%' },
      { hex: '#FACC15', name: '计程车灯 Yellow Flash', cmyk: 'C:0 M:20 Y:90 K:0', percentage: 14, moodTag: '驻足 14%' },
    ],
  },
  {
    id: 'sunset-coast',
    title: '🌇 20:00 晚霞出逃',
    category: 'nature',
    tag: '加州落日 / 治愈',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    fallbackColors: [
      { hex: '#E07A5F', name: '橘红晚霞 Sunset Horizon', cmyk: 'C:5 M:60 Y:65 K:0', percentage: 40, moodTag: '浪漫 40%' },
      { hex: '#3D405B', name: '暮色海风 Twilight Sea', cmyk: 'C:60 M:50 Y:30 K:40', percentage: 30, moodTag: '微醺 30%' },
      { hex: '#F4F1DE', name: '细腻暖沙 Warm Coast', cmyk: 'C:3 M:5 Y:15 K:0', percentage: 18, moodTag: '自由 18%' },
      { hex: '#81B29A', name: '浪花微光 Emerald Tide', cmyk: 'C:45 M:10 Y:35 K:0', percentage: 12, moodTag: '放空 12%' },
    ],
  },
  {
    id: 'lazy-cat',
    title: '🐱 窗台晒太阳的橘猫',
    category: 'cat',
    tag: '日系 / 温暖',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
    fallbackColors: [
      { hex: '#EA580C', name: '焦糖橘毛 Caramel Amber', cmyk: 'C:0 M:75 Y:95 K:0', percentage: 36, moodTag: '温热 36%' },
      { hex: '#FED7AA', name: '日光绒毛 Sunlit Fluff', cmyk: 'C:0 M:20 Y:35 K:0', percentage: 32, moodTag: '慵懒 32%' },
      { hex: '#78716C', name: '老木窗棂 Vintage Wood', cmyk: 'C:35 M:35 Y:40 K:20', percentage: 20, moodTag: '静止 20%' },
      { hex: '#FEF08A', name: '金黄光斑 Daylight Dust', cmyk: 'C:2 M:5 Y:55 K:0', percentage: 12, moodTag: '惬意 12%' },
    ],
  },
  {
    id: 'vintage-desk',
    title: '📚 凌晨两点的灵感台灯',
    category: 'street',
    tag: '胶片 / 复古思考',
    imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
    fallbackColors: [
      { hex: '#1E293B', name: '静默午夜 Silent Obsidian', cmyk: 'C:65 M:50 Y:40 K:80', percentage: 45, moodTag: '专注 45%' },
      { hex: '#CA8A04', name: '复古暖光 Brass Glow', cmyk: 'C:15 M:40 Y:95 K:10', percentage: 25, moodTag: '灵感 25%' },
      { hex: '#64748B', name: '纸页余温 Parchment Slate', cmyk: 'C:40 M:25 Y:20 K:10', percentage: 18, moodTag: '沉思 18%' },
      { hex: '#F1F5F9', name: '空白文档 Blank Canvas', cmyk: 'C:3 M:2 Y:2 K:0', percentage: 12, moodTag: '新生 12%' },
    ],
  },
];

export const FALLBACK_VIBESHOT: VibeShotResult = {
  id: 'default-1',
  timestamp: Date.now(),
  imageUrl: PRESET_PHOTOS[0].imageUrl,
  photoTitle: '午后燕麦拿铁',
  colorPalette: PRESET_PHOTOS[0].fallbackColors,
  quotes: {
    wongKarWai: {
      monologue: '那天下午 4 点零 3 分，我和这杯咖啡的距离只有 0.01 公分。57 个小时之后，我彻底放下了昨天的执念。',
      english: 'At 4:03 PM, I was only 0.01 cm away from this cup of coffee. 57 hours later, the obsession vanished.',
      timecode: '04:03:19',
      scene: '午后街角 0.01公分',
    },
    japaneseMinimal: {
      line: '风穿过窗台的时候，光线刚好落在杯沿上。平凡的生活，本身就是不期而遇的奇迹。',
      english: 'When the breeze crossed the sill, sunlight rested on the cup. Ordinary life is a miracle itself.',
      season: '初秋 · 阳光微温',
    },
    frenchChic: {
      editorial: '无需解释的松弛感，比一切刻意修饰的滤镜都更迷人。保持 30% 的神秘与 70% 的从容。',
      english: 'Effortless chic is the ultimate luxury. 30% mystery, 70% unbothered peace.',
      issue: 'VIBESHOT / ISSUE 08',
    },
    lateNight: {
      cureText: '借着咖啡与温热的香气，把今天所有的兵荒马乱，都折叠存进记忆。慢慢来，一切皆有回甘。',
      english: 'By the aroma of warmth, folding today’s chaos away. Take it slow, sweetness follows.',
      midnightTime: '04:15 PM',
    },
  },
  moodDNA: {
    dominantMood: '95% 城市漫游者的午后松弛',
    vibeKeywords: ['燕麦暖调', '慢生活', '物哀美学', '胶片颗粒'],
    bpmScore: '68 BPM · 慵懒慢调爵士',
    weatherFeel: '16:00 晴朗微风 · 24°C',
    scentNote: '前调：烤杏仁 | 中调：热燕麦奶 | 尾调：雪松与香草',
    bgmTrack: {
      title: 'Coffee in the Rain',
      artist: 'Lofi Beats & Bill Evans',
      genre: 'Warm Acoustic Jazz',
    },
  },
  selectedQuoteStyle: 'wongKarWai',
  filter: 'none',
};
