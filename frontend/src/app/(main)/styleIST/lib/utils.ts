/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview دوال مساعدة عامة لوحدة StyleIST
 * 
 * لماذا نفصل الدوال المساعدة؟
 * - لتسهيل إعادة الاستخدام عبر المكونات
 * - لتسهيل الاختبار بشكل منفصل
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * دمج أسماء الفئات CSS مع دعم Tailwind
 * 
 * لماذا نستخدم twMerge مع clsx؟
 * - clsx يدمج الفئات الشرطية
 * - twMerge يحل تعارضات Tailwind (مثل: p-2 + p-4 = p-4)
 * 
 * @param inputs - مصفوفة من أسماء الفئات أو الكائنات الشرطية
 * @returns سلسلة أسماء الفئات المدمجة
 * 
 * @example
 * cn('p-4', 'bg-red-500', isActive && 'border-2')
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * تحويل رسائل الخطأ التقنية لرسائل صديقة للمستخدم
 * 
 * لماذا نحوّل رسائل الخطأ؟
 * - رسائل الـ API غالباً تقنية وغير مفهومة للمستخدم العادي
 * - نريد تقديم إرشادات عملية بدلاً من رسائل مبهمة
 * 
 * @param error - الخطأ الأصلي (أي نوع)
 * @param context - سياق الخطأ لإضافته للرسالة
 * @returns رسالة خطأ واضحة بالعربية
 */
export function getFriendlyErrorMessage(error: unknown, context: string): string {
  let rawMessage = 'حدث خطأ غير متوقع.';
  
  if (error instanceof Error) {
    rawMessage = error.message;
  } else if (typeof error === 'string') {
    rawMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    rawMessage = String((error as { message: unknown }).message);
  }

  // التعامل مع أخطاء نوع الملف
  if (rawMessage.includes('Unsupported MIME type')) {
    try {
      const errorJson = JSON.parse(rawMessage);
      const nestedMessage = errorJson?.error?.message;
      if (nestedMessage && nestedMessage.includes('Unsupported MIME type')) {
        const mimeType = nestedMessage.split(': ')[1] || 'غير مدعوم';
        return `نوع الملف '${mimeType}' غير مدعوم. يُرجى استخدام صيغة PNG، JPEG، أو WEBP.`;
      }
    } catch {
      // ليست JSON
    }
    return 'صيغة الملف غير مدعومة. يُرجى رفع صورة بصيغة PNG، JPEG، أو WEBP.';
  }

  // التعامل مع أخطاء الشبكة
  if (rawMessage.includes('fetch') || rawMessage.includes('network')) {
    return 'فشل الاتصال بالخادم. يُرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.';
  }

  // التعامل مع أخطاء المهلة الزمنية
  if (rawMessage.includes('timeout') || rawMessage.includes('timed out')) {
    return 'استغرقت العملية وقتاً طويلاً. يُرجى المحاولة مرة أخرى.';
  }

  return `${context}. ${rawMessage}`;
}

/**
 * تحويل ملف لـ Base64
 * 
 * لماذا Base64؟
 * - لإرسال الصور للـ API بدون الحاجة لـ multipart form
 * - يسهّل تضمين الصور في JSON
 * 
 * @param file - الملف المراد تحويله
 * @returns وعد بسلسلة Base64 (بدون بادئة data URL)
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const result = reader.result as string;
      // إزالة بادئة data URL للحصول على Base64 الخام
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    
    reader.onerror = () => {
      reject(new Error('فشل قراءة الملف'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * تحويل رابط URL لكائن File
 * 
 * لماذا نحتاج هذا التحويل؟
 * - بعض APIs تتطلب كائن File وليس URL
 * - يسمح بمعالجة الصور المُولدة كما لو كانت مرفوعة من المستخدم
 * 
 * @param url - رابط الصورة (يدعم data URLs أو HTTP URLs)
 * @param filename - اسم الملف المُراد استخدامه
 * @returns وعد بكائن File
 */
export const urlToFile = async (url: string, filename: string): Promise<File> => {
  // التعامل مع data URLs
  if (url.startsWith('data:')) {
    const arr = url.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  // التعامل مع HTTP URLs
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`فشل تحميل الصورة: ${response.status}`);
  }
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
};

/**
 * تأخير التنفيذ
 * 
 * لماذا نحتاج تأخير؟
 * - لتجنب إرهاق الـ API بالطلبات المتتالية
 * - لإضافة تأثيرات انتقالية سلسة
 * 
 * @param ms - عدد الميلي ثانية للتأخير
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
