/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview أنواع البيانات الرئيسية لوحدة StyleIST
 * 
 * لماذا نستخدم Zod؟
 * - التحقق من صحة البيانات في وقت التشغيل (Runtime Validation)
 * - توليد أنواع TypeScript تلقائياً من الـ Schemas
 * - رسائل خطأ واضحة للمستخدم عند فشل التحقق
 */

import { z } from 'zod';

// ==========================================
// المخططات (Zod Schemas)
// ==========================================

/**
 * مخطط البريف التصميمي
 * لماذا ستة أسئلة؟
 * - تغطي كل جوانب التصميم السينمائي من السياق للشخصية للقيود
 */
export const DesignBriefSchema = z.object({
  /** نوع المشروع: فيلم روائي، مسلسل درامي، إلخ */
  projectType: z.string().min(2, 'نوع المشروع مطلوب'),
  /** سياق المشهد: الزمان، المكان، الجو العام */
  sceneContext: z.string().min(5, 'سياق المشهد مطلوب'),
  /** ملف الشخصية: الاسم، العمر، الدور، الطبقة الاجتماعية */
  characterProfile: z.string().min(2, 'بيانات الشخصية مطلوبة'),
  /** الحالة النفسية: ما يُظهره الزي وما يُخفيه */
  psychologicalState: z.string().min(2, 'الحالة النفسية مطلوبة'),
  /** موقع التصوير: المدينة لجلب بيانات الطقس */
  filmingLocation: z.string().min(2, 'موقع التصوير مطلوب'),
  /** القيود الإنتاجية: الميزانية، مشاهد الأكشن، المحاذير */
  productionConstraints: z.string().optional().default(''),
});

/**
 * مخطط تفكيك الزي
 * لماذا نفصل كل عنصر؟
 * - يسهّل على فريق الملابس تجهيز كل قطعة منفصلة
 */
const CostumeBreakdownSchema = z.object({
  basics: z.string().default(''),
  layers: z.string().default(''),
  shoes: z.string().default(''),
  accessories: z.string().default(''),
  materials: z.string().default(''),
  colorPalette: z.string().default(''),
});

/**
 * مخطط ملاحظات الإنتاج
 * لماذا هذه الحقول؟
 * - النسخ: لضمان الاستمرارية عند التلف
 * - التعتيق: لمطابقة مرحلة القصة الزمنية
 * - تحذيرات الكاميرا: لتفادي مشاكل الموار أو التشبع
 */
const ProductionNotesSchema = z.object({
  copies: z.string().default('1'),
  distressing: z.string().default('لا يوجد'),
  cameraWarnings: z.string().default(''),
  weatherAlt: z.string().default(''),
  budgetAlt: z.string().default(''),
});

/**
 * مخطط بيانات الطقس
 * لماذا الطقس مهم؟
 * - يؤثر على اختيار الخامات (خفيفة/ثقيلة)
 * - يؤثر على راحة الممثل أثناء التصوير
 */
const WeatherDataSchema = z.object({
  temp: z.number().default(72),
  condition: z.string().default('غير محدد'),
  location: z.string().default(''),
  sources: z.array(z.string()).optional(),
});

/**
 * مخطط نتيجة التصميم الاحترافي
 * لماذا كل هذه التفاصيل؟
 * - يُشكّل "ورقة تفكيك الزي" الرسمية للإنتاج
 */
export const ProfessionalDesignResultSchema = z.object({
  lookTitle: z.string().default('تصميم مخصص'),
  dramaticDescription: z.string().default(''),
  breakdown: CostumeBreakdownSchema,
  rationale: z.array(z.string()).default([]),
  productionNotes: ProductionNotesSchema,
  imagePrompt: z.string().default(''),
  conceptArtUrl: z.string().url().or(z.string()).default(''),
  realWeather: WeatherDataSchema,
});

/**
 * مخطط نتيجة تحليل التلاؤم
 * لماذا نحلل السلامة؟
 * - حماية الممثل من مخاطر القماش (اشتعال، تعثر)
 * - ضمان حرية الحركة في مشاهد الأكشن
 */
export const FitAnalysisResultSchema = z.object({
  compatibilityScore: z.number().min(0).max(100).default(85),
  safetyIssues: z.array(z.string()).default([]),
  fabricNotes: z.string().default(''),
  movementPrediction: z.string().default(''),
});

/**
 * مخطط عنصر خزانة الملابس
 */
export const WardrobeItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
});

/**
 * مخطط إعدادات المحاكاة
 * لماذا نحاكي الإضاءة والفيزياء؟
 * - للتأكد من شكل القماش تحت ظروف التصوير الفعلية
 */
export const SimulationConfigSchema = z.object({
  lighting: z.enum(['natural', 'studio', 'dramatic', 'neon']).default('studio'),
  physics: z.enum(['static', 'flow', 'heavy', 'wet']).default('static'),
  action: z.enum(['idle', 'walking', 'running', 'fighting']).default('idle'),
  actorConstraints: z.string().optional(),
});

/**
 * أحجام توليد الصور
 */
export const ImageGenerationSizeSchema = z.enum(['1K', '2K', '4K']);

// ==========================================
// الأنواع المُستنتجة من المخططات
// ==========================================

/** بريف التصميم - مدخلات المستخدم */
export type DesignBrief = z.infer<typeof DesignBriefSchema>;

/** نتيجة التصميم الاحترافي - مخرجات الذكاء الاصطناعي */
export type ProfessionalDesignResult = z.infer<typeof ProfessionalDesignResultSchema>;

/** نتيجة تحليل التلاؤم */
export type FitAnalysisResult = z.infer<typeof FitAnalysisResultSchema>;

/** عنصر من خزانة الملابس */
export type WardrobeItem = z.infer<typeof WardrobeItemSchema>;

/** إعدادات المحاكاة */
export type SimulationConfig = z.infer<typeof SimulationConfigSchema>;

/** حجم توليد الصورة */
export type ImageGenerationSize = z.infer<typeof ImageGenerationSizeSchema>;

// ==========================================
// أنواع إضافية (غير مُدارة بـ Zod)
// ==========================================

/**
 * طبقة زي واحدة في مكدس الملابس
 */
export interface OutfitLayer {
  garment: WardrobeItem | null;
  poseImages: Record<string, string>;
}

/**
 * أوضاع التطبيق الرئيسية
 */
export type AppMode = 'home' | 'director' | 'fitting';

/**
 * أوضاع عرض المخرج
 */
export type DirectorView = 'brief' | 'processing' | 'lookbook';

/**
 * بيانات التصميم المُمررة لغرفة القياس
 */
export interface DesignToFit {
  url: string;
  name: string;
  weather: string;
}
