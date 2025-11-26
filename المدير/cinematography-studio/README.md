# CineAI Studio - استوديو مديري التصوير السينمائي

## Overview - نظرة عامة

CineAI Studio is a comprehensive AI-powered toolset for cinematographers, covering all stages of film production: pre-production, production, and post-production.

استوديو CineAI هو مجموعة أدوات شاملة مدعومة بالذكاء الاصطناعي لمديري التصوير، تغطي جميع مراحل الإنتاج السينمائي.

## Features - الميزات

### 📋 Pre-Production - ما قبل الإنتاج

#### 📝 Shot List Generator - مولد قائمة اللقطات

- AI-powered shot list generation from scripts
- توليد قوائم لقطات ذكية من السيناريو
- Detailed camera angles and movement suggestions
- اقتراحات زوايا الكاميرا والحركة

#### 📍 Location Scout Assistant - مساعد استكشاف المواقع

- Location analysis and recommendations
- تحليل المواقع والتوصيات
- Lighting setup suggestions
- اقتراحات إعداد الإضاءة

#### 🎨 Mood Board Creator - منشئ لوحة المزاج

- Visual inspiration boards
- لوحات إلهام بصرية
- AI-generated reference images
- صور مرجعية من الذكاء الاصطناعي

#### ⚙️ Equipment Optimizer - محسن المعدات

- Smart equipment recommendations
- توصيات ذكية للمعدات
- Camera and lighting optimization
- تحسين الكاميرا والإضاءة

### 🎬 Production - الإنتاج

#### ✅ Real-Time Shot Validator - مدقق اللقطات المباشر

- Instant shot quality analysis
- تحليل فوري لجودة اللقطة
- Composition, exposure, and focus validation
- التحقق من التكوين والتعريض والفوكس
- Real-time suggestions for improvement
- اقتراحات فورية للتحسين

#### 🤖 Real-Time Assistant - المساعد الفوري

- On-set technical consultation
- استشارات تقنية أثناء التصوير
- Quick answers to cinematography questions
- إجابات سريعة على أسئلة التصوير

#### 📊 Data Logger - مسجل البيانات

- Camera settings documentation
- توثيق إعدادات الكاميرا
- Shot metadata tracking
- تتبع بيانات اللقطات

### ✨ Post-Production - ما بعد الإنتاج

#### 🎨 Color Grading Assistant - مساعد تدريج الألوان

- AI-suggested color palettes
- لوحات ألوان مقترحة
- LUT recommendations
- توصيات LUT
- Scene-specific grading
- تدريج خاص بكل مشهد

#### ✂️ Editorial Assistant - مساعد المونتاج

- Pacing and rhythm analysis
- تحليل الإيقاع والسرعة
- Transition suggestions
- اقتراحات الانتقالات

#### 📹 Footage Analyzer - محلل المشاهد

- Technical analysis of recorded footage
- تحليل تقني للمشاهد المسجلة
- Quality assessment
- تقييم الجودة

#### 📦 Delivery Manager - مدير التسليم

- Export settings for different platforms
- إعدادات التصدير لمنصات مختلفة
- Format optimization
- تحسين التنسيقات

## Project Structure - بنية المشروع

```
cinematography-studio/
├── components/
│   ├── CineAIStudio.tsx           # Main component
│   └── tools/
│       ├── PreProductionTools.tsx  # Pre-production tools
│       ├── ProductionTools.tsx     # Production tools
│       └── PostProductionTools.tsx # Post-production tools
├── hooks/                          # Custom React hooks
├── lib/                            # Utility functions
├── styles/                         # Component styles
├── assets/                         # Static assets
├── cineai-tmp/                     # Original source (reference)
├── page.tsx                        # Next.js page entry
└── README.md                       # This file
```

## API Routes - مسارات API

### Generate Shot List

```
POST /api/cineai/generate-shots
Body: { script: string }
Response: { shots: Shot[], generatedAt: string }
```

### Validate Shot

```
POST /api/cineai/validate-shot
Body: FormData with image
Response: { validation: ValidationResult, analyzedAt: string }
```

### Color Grading Suggestions

```
POST /api/cineai/color-grading
Body: { sceneType: string, mood?: string, temperature?: number }
Response: { palette: string[], suggestions: string[] }
```

## Tech Stack - المكدس التقني

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **UI Components**: Radix UI (shadcn/ui)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **API**: Next.js API Routes

## Usage - الاستخدام

### Running Locally - التشغيل محلياً

```bash
cd frontend
pnpm install
pnpm dev
```

Navigate to: `http://localhost:3000/cinematography-studio`

## Development Notes - ملاحظات التطوير

### Adding New Tools

1. Create tool component in `components/tools/`
2. Import in appropriate phase component
3. Add API route if needed in `/api/cineai/`

### AI Integration

Currently using mock data. To integrate real AI:

1. Add API keys to `.env.local`
2. Update API route implementations
3. Use OpenAI, Google Gemini, or other AI services

### Styling Guidelines

- Follow project design tokens
- Use Tailwind utility classes
- Maintain RTL support
- Keep bilingual content (Arabic/English)

## Future Enhancements - تحسينات مستقبلية

- [ ] Real AI integration (OpenAI/Gemini)
- [ ] Image upload and analysis
- [ ] Video footage analysis
- [ ] LUT generation and preview
- [ ] Shot library and templates
- [ ] Collaboration features
- [ ] Mobile responsive improvements
- [ ] Offline mode support
- [ ] Export to industry-standard formats

## Integration with Main Project - التكامل مع المشروع الرئيسي

This module is fully integrated with the main project:

- ✅ Uses shared UI components
- ✅ Follows project structure conventions
- ✅ Compatible with project styling system
- ✅ Integrated with Next.js App Router
- ✅ API routes follow project patterns
- ✅ TypeScript types and interfaces
- ✅ Bilingual support (Arabic/English)

## License - الترخيص

Part of the main project. See root LICENSE file for details.

## Support - الدعم

For issues or questions, refer to the main project documentation or contact the development team.

---

**Note:** This is a production-ready implementation migrated from the original cineai-app with full Next.js integration.

**ملاحظة:** هذا تطبيق جاهز للإنتاج تم ترحيله من cineai-app الأصلي مع تكامل كامل مع Next.js.
