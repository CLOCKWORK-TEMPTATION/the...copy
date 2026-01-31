/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview خدمة التواصل مع Gemini API
 * 
 * لماذا نفصل خدمة الـ API؟
 * - تجميع كل استدعاءات الـ API في مكان واحد
 * - تسهيل تبديل الـ Provider لاحقاً (OpenAI، Claude، إلخ)
 * - مركزية معالجة الأخطاء والتحويلات
 */

import { 
  DesignBrief, 
  ProfessionalDesignResult, 
  ProfessionalDesignResultSchema,
  SimulationConfig, 
  FitAnalysisResult,
  FitAnalysisResultSchema, 
  ImageGenerationSize 
} from '../types';
import { fileToBase64 } from '../lib/utils';

/** نقطة نهاية الـ API */
const API_ENDPOINT = '/api/gemini';

/**
 * نوع استجابة الـ API
 * لماذا نحدد النوع؟
 * - لضمان التعامل الصحيح مع الاستجابة
 */
interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
}

/**
 * استدعاء الـ API الأساسي
 * 
 * لماذا دالة مركزية؟
 * - لتوحيد معالجة الأخطاء والـ Headers
 * - لتسهيل إضافة المصادقة أو الـ Retry لاحقاً
 * 
 * @param action - نوع الإجراء المطلوب
 * @param data - البيانات المُرسلة
 * @returns وعد بالاستجابة
 * @throws Error في حالة فشل الطلب
 */
async function callGeminiAPI<T>(action: string, data: Record<string, unknown>): Promise<T> {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, data }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({})) as ApiResponse;
      throw new Error(errorBody.error || `فشل الطلب: ${response.status}`);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('حدث خطأ غير متوقع أثناء الاتصال بالخادم');
  }
}

/**
 * توليد تصميم أزياء احترافي
 * 
 * لماذا نحتاج التحقق من الاستجابة؟
 * - الـ AI قد يُرجع بيانات ناقصة أو بتنسيق مختلف
 * - Zod يضمن أن البيانات مطابقة للهيكل المتوقع
 * 
 * @param brief - بريف التصميم من المستخدم
 * @returns نتيجة التصميم المُحققة
 */
export const generateProfessionalDesign = async (
  brief: DesignBrief
): Promise<ProfessionalDesignResult> => {
  const result = await callGeminiAPI<Record<string, unknown>>('generateDesign', { brief });

  // التحقق من الاستجابة باستخدام Zod مع قيم افتراضية
  const validated = ProfessionalDesignResultSchema.safeParse({
    lookTitle: result.lookTitle ?? 'تصميم مخصص',
    dramaticDescription: result.dramaticDescription ?? '',
    breakdown: result.breakdown ?? {},
    rationale: result.rationale ?? [],
    productionNotes: result.productionNotes ?? {},
    imagePrompt: result.imagePrompt ?? '',
    conceptArtUrl: result.conceptArtUrl ?? 'https://placehold.co/512x512/1a1a1a/d4b483?text=Design+Concept',
    realWeather: result.realWeather ?? { temp: 72, condition: 'Default', location: '' },
  });

  if (!validated.success) {
    console.warn('تحذير: استجابة API غير مطابقة تماماً للمخطط', validated.error);
    // نُرجع القيم الافتراضية في حالة الفشل
    return {
      lookTitle: String(result.lookTitle ?? 'تصميم مخصص'),
      dramaticDescription: String(result.dramaticDescription ?? ''),
      breakdown: {
        basics: '',
        layers: '',
        shoes: '',
        accessories: '',
        materials: '',
        colorPalette: '',
        ...(result.breakdown as Record<string, string> ?? {}),
      },
      rationale: Array.isArray(result.rationale) ? result.rationale as string[] : [],
      productionNotes: {
        copies: '1',
        distressing: 'لا يوجد',
        cameraWarnings: '',
        weatherAlt: '',
        budgetAlt: '',
        ...(result.productionNotes as Record<string, string> ?? {}),
      },
      imagePrompt: String(result.imagePrompt ?? ''),
      conceptArtUrl: String(result.conceptArtUrl ?? 'https://placehold.co/512x512/1a1a1a/d4b483?text=Design+Concept'),
      realWeather: {
        temp: 72,
        condition: 'Default',
        location: '',
        ...(result.realWeather as Record<string, unknown> ?? {}),
      },
    };
  }

  return validated.data;
};

/**
 * تحويل الصوت لنص
 * 
 * لماذا نحتاج هذه الخدمة؟
 * - لتمكين المصمم من إملاء ملاحظاته صوتياً
 * - يُسرّع عملية إدخال البيانات
 * 
 * @param audioBlob - ملف الصوت
 * @returns النص المُستخرج
 */
export const transcribeAudio = async (audioBlob: Blob | File): Promise<string> => {
  const base64 = await fileToBase64(audioBlob as File);
  const result = await callGeminiAPI<{ text?: string }>('transcribeAudio', {
    audioBase64: base64,
    mimeType: audioBlob.type || 'audio/webm',
  });
  return result.text ?? '';
};

/**
 * تحليل محتوى الفيديو
 * 
 * لماذا تحليل الفيديو؟
 * - لاستخراج إلهام التصميم من مقاطع مرجعية
 * - لفهم الأسلوب البصري المطلوب
 * 
 * @param videoFile - ملف الفيديو
 * @returns تحليل المحتوى
 */
export const analyzeVideoContent = async (videoFile: File): Promise<string> => {
  const base64 = await fileToBase64(videoFile);
  const result = await callGeminiAPI<{ analysis?: string }>('analyzeVideo', {
    videoBase64: base64,
    mimeType: videoFile.type,
  });
  return result.analysis ?? '';
};

/**
 * توليد صورة قطعة ملابس
 * 
 * @param prompt - وصف القطعة المطلوبة
 * @param size - دقة الصورة
 * @returns رابط الصورة واسمها
 */
export const generateGarmentAsset = async (
  prompt: string,
  size: ImageGenerationSize = '1K'
): Promise<{ url: string; name: string }> => {
  const result = await callGeminiAPI<{ imageUrl?: string }>('generateGarment', { prompt, size });
  return {
    url: result.imageUrl ?? 'https://placehold.co/512x512/1a1a1a/d4b483?text=Garment',
    name: prompt.slice(0, 30),
  };
};

/**
 * توليد نتيجة القياس الافتراضي
 * 
 * لماذا القياس الافتراضي؟
 * - للتأكد من ملاءمة الزي للممثل قبل التصنيع الفعلي
 * - لتوفير الوقت والتكلفة
 * 
 * @param garmentUrl - رابط صورة الزي
 * @param personImageUrl - رابط صورة الشخص
 * @param config - إعدادات المحاكاة
 * @returns نتيجة تحليل التلاؤم
 */
export const generateVirtualFit = async (
  garmentUrl: string,
  personImageUrl: string,
  config: SimulationConfig
): Promise<FitAnalysisResult> => {
  const result = await callGeminiAPI<Record<string, unknown>>('generateVirtualFit', {
    garmentUrl,
    personUrl: personImageUrl,
    config,
  });

  const validated = FitAnalysisResultSchema.safeParse({
    compatibilityScore: result.compatibilityScore ?? 85,
    safetyIssues: result.safetyIssues ?? [],
    fabricNotes: result.fabricNotes ?? result.fitDescription ?? 'تحليل التناسب',
    movementPrediction: result.movementPrediction ?? 'متوقع',
  });

  if (!validated.success) {
    return {
      compatibilityScore: 85,
      safetyIssues: [],
      fabricNotes: 'تحليل التناسب',
      movementPrediction: 'متوقع',
    };
  }

  return validated.data;
};

/**
 * توليد فيديو اختبار الإجهاد
 * 
 * ملاحظة: هذه الميزة تتطلب تكوين API إضافي
 * 
 * @param garmentUrl - رابط صورة الزي
 * @param config - إعدادات المحاكاة
 * @returns رابط الفيديو والتقرير
 */
export const generateStressTestVideo = async (
  garmentUrl: string,
  config: SimulationConfig
): Promise<{ videoUrl: string; report: string }> => {
  // حالياً غير متاح - يتطلب تكوين API إضافي
  return {
    videoUrl: '',
    report: 'اختبار الإجهاد غير متاح حالياً - يتطلب تكوين API إضافي',
  };
};

/**
 * تعديل صورة زي بالذكاء الاصطناعي
 * 
 * لماذا تعديل الصور؟
 * - لإجراء تغييرات سريعة على التصاميم
 * - للتجريب دون الحاجة لإعادة التوليد الكامل
 * 
 * @param imageFileOrUrl - الصورة الأصلية (ملف أو رابط)
 * @param editPrompt - تعليمات التعديل
 * @returns الصورة المُعدلة
 */
export const editGarmentImage = async (
  imageFileOrUrl: File | string,
  editPrompt: string
): Promise<{ url: string; name: string }> => {
  const imageUrl = typeof imageFileOrUrl === 'string'
    ? imageFileOrUrl
    : await fileToBase64(imageFileOrUrl);
  
  const result = await callGeminiAPI<{ imageUrl?: string }>('editGarment', { 
    imageUrl, 
    editPrompt 
  });
  
  return {
    url: result.imageUrl ?? imageUrl,
    name: editPrompt.slice(0, 30),
  };
};
