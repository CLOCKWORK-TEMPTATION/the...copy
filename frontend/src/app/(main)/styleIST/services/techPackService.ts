/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview خدمة توليد أوامر الشغل (Tech Pack)
 * 
 * لماذا Tech Pack؟
 * - الوثيقة الرسمية التي تُرسل لورشة التصنيع
 * - تحتوي كل المواصفات اللازمة لإنتاج الزي
 */

import { FabricType } from './rulesEngine';

// ==========================================
// أنواع البيانات
// ==========================================

/**
 * مواصفات أمر الشغل الكامل
 */
export interface TechPackSpec {
  /** كود البانتون للون */
  pantoneCode: string;
  /** اسم اللون */
  pantoneName: string;
  /** معاينة اللون بالـ HEX */
  hexPreview: string;
  /** استهلاك القماش بالمتر */
  fabricConsump: number;
  /** تقدير التكلفة بالدولار */
  costEstimate: number;
  /** تحذير تاريخي إن وُجد */
  historicalWarning: string | null;
  /** تعليمات العناية */
  careLabel: string;
  /** كثافة النسيج */
  threadCount: string;
  /** هل تحتاج بطانة؟ */
  liningRequired: boolean;
}

// ==========================================
// قواميس البيانات المرجعية
// ==========================================

/**
 * تواريخ اختراع الأقمشة
 * لماذا نتتبع التواريخ؟
 * - لتجنب أخطاء الراكور التاريخي في الأفلام الزمنية
 */
const FABRIC_HISTORY: Record<string, number> = {
  polyester: 1941,
  spandex: 1959,
  nylon: 1935,
  acrylic: 1950,
  viscose: 1883,
  cotton: -3000,
  wool: -10000,
  silk: -3000,
  leather: -50000,
};

/**
 * قاموس ألوان البانتون السينمائية
 * لماذا البانتون؟
 * - معيار صناعي يضمن تطابق الألوان عبر الموردين
 */
const PANTONE_MAP: Record<string, { code: string; name: string; hex: string }> = {
  red: { code: '19-1763 TCX', name: 'High Risk Red', hex: '#A81C07' },
  blue: { code: '19-4052 TCX', name: 'Classic Blue', hex: '#0F4C81' },
  green: { code: '19-0419 TCX', name: 'Rifle Green', hex: '#444C38' },
  black: { code: '19-4005 TCX', name: 'Stretch Limo', hex: '#2B2B2B' },
  white: { code: '11-0601 TCX', name: 'Bright White', hex: '#F4F5F0' },
  brown: { code: '19-1250 TCX', name: 'Picante', hex: '#8D4F37' },
  yellow: { code: '13-0647 TCX', name: 'Illuminating', hex: '#F5DF4D' },
  grey: { code: '17-5104 TCX', name: 'Ultimate Gray', hex: '#939597' },
};

/**
 * استهلاك القماش حسب نوع القطعة
 * لماذا نُقدّر الاستهلاك؟
 * - لحساب التكلفة وطلب الكمية الصحيحة
 */
const GARMENT_FABRIC_USAGE: Record<string, number> = {
  coat: 3.5,
  jacket: 2.2,
  shirt: 1.8,
  pants: 1.5,
  dress: 4.0,
  default: 2.0,
};

/**
 * كثافة النسيج حسب نوع القماش
 */
const THREAD_COUNT_MAP: Record<string, string> = {
  silk: '600 TC',
  wool: '120 GSM',
  leather: 'N/A',
  polyester: '180 TC',
  cotton: '300 TC',
  spandex: '200 TC',
};

// ==========================================
// دوال المعالجة
// ==========================================

/**
 * استخراج كود البانتون الأقرب
 * 
 * @param colorFamily - عائلة اللون (أحمر، أزرق، إلخ)
 * @returns بيانات لون البانتون
 */
export const extractPantone = (
  colorFamily: string = 'black'
): { code: string; name: string; hex: string } => {
  const key = colorFamily.toLowerCase();
  return PANTONE_MAP[key] ?? PANTONE_MAP.black;
};

/**
 * تقدير استهلاك القماش
 * 
 * @param garmentType - نوع القطعة
 * @param fabricWidth - عرض القماش بالسنتيمتر (افتراضي: 150)
 * @returns الاستهلاك بالمتر الطولي
 */
export const estimateFabricUsage = (
  garmentType: string,
  fabricWidth: number = 150
): number => {
  const type = garmentType.toLowerCase();
  return GARMENT_FABRIC_USAGE[type] ?? GARMENT_FABRIC_USAGE.default;
};

/**
 * التحقق من الدقة التاريخية
 * 
 * لماذا التحقق التاريخي؟
 * - تجنب وجود بوليستر في فيلم عن الحرب العالمية الأولى مثلاً
 * - الحفاظ على مصداقية العمل الفني
 * 
 * @param year - سنة أحداث الفيلم
 * @param material - نوع القماش المقترح
 * @returns رسالة تحذير أو null إذا كان مناسباً
 */
export const validateHistoricalAccuracy = (
  year: number,
  material: FabricType
): string | null => {
  const inventionYear = FABRIC_HISTORY[material.toLowerCase()];

  if (inventionYear && year < inventionYear) {
    return `خطأ تاريخي: خامة "${material}" لم تكن موجودة في سنة ${year}. تم اختراعها عام ${inventionYear}.`;
  }

  // قواعد ثقافية إضافية
  if (year < 1920 && material === 'spandex') {
    return 'خطأ راكور زمني: الأقمشة المطاطية (الليكرا/السباندكس) غير مقبولة في الدراما التاريخية قبل الخمسينات.';
  }

  return null;
};

/**
 * توليد أمر الشغل الكامل
 * 
 * لماذا نُجمّع كل البيانات؟
 * - لإنشاء وثيقة شاملة يمكن إرسالها مباشرة للتصنيع
 * - توفير الوقت في جمع المعلومات يدوياً
 * 
 * @param fabric - نوع القماش
 * @param garmentType - نوع القطعة
 * @param year - سنة أحداث الفيلم
 * @param baseColor - اللون الأساسي
 * @returns مواصفات أمر الشغل الكاملة
 */
export const generateFullTechPack = (
  fabric: FabricType,
  garmentType: string,
  year: number,
  baseColor: string
): TechPackSpec => {
  const pantone = extractPantone(baseColor);
  const yardage = estimateFabricUsage(garmentType);
  const historyCheck = validateHistoricalAccuracy(year, fabric);

  // تقدير التكلفة
  const basePricePerMeter = fabric === 'silk' || fabric === 'leather' ? 45 : 12;
  const laborCost = 150;
  const cost = Math.round((basePricePerMeter * yardage) + laborCost);

  // كثافة النسيج
  const threadCount = THREAD_COUNT_MAP[fabric] ?? '300 TC';

  // تحديد الحاجة للبطانة
  const liningRequired = ['coat', 'jacket', 'dress'].includes(garmentType.toLowerCase());

  // تعليمات العناية
  const careLabel = fabric === 'silk' || fabric === 'wool' 
    ? 'Dry Clean Only' 
    : 'Machine Wash Cold';

  return {
    pantoneCode: pantone.code,
    pantoneName: pantone.name,
    hexPreview: pantone.hex,
    fabricConsump: yardage,
    costEstimate: cost,
    historicalWarning: historyCheck,
    careLabel,
    threadCount,
    liningRequired,
  };
};
