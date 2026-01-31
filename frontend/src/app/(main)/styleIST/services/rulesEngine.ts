/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview محرك قواعد السلامة والمتانة
 * 
 * لماذا محرك قواعد منفصل؟
 * - القواعد الفيزيائية ثابتة ولا تحتاج تخمين AI
 * - يضمن نتائج متسقة ومتوقعة
 * - يمكن توسيعه بسهولة بإضافة قواعد جديدة
 */

import { z } from 'zod';

// ==========================================
// أنواع البيانات
// ==========================================

/**
 * أنواع الأقمشة المدعومة
 * لماذا هذه الأنواع تحديداً؟
 * - الأكثر استخداماً في صناعة الأزياء السينمائية
 */
export const FabricTypeSchema = z.enum([
  'cotton',
  'polyester', 
  'silk',
  'wool',
  'leather',
  'spandex',
]);
export type FabricType = z.infer<typeof FabricTypeSchema>;

/**
 * أنواع المخاطر في المشهد
 * لماذا نحدد المخاطر؟
 * - لتحذير فريق الملابس من مشاكل محتملة
 */
export const SceneHazardSchema = z.enum([
  'fire',
  'water',
  'stunt',
  'extreme_heat',
  'extreme_cold',
]);
export type SceneHazard = z.infer<typeof SceneHazardSchema>;

/**
 * حالة التقرير
 */
export type SafetyStatus = 'safe' | 'warning' | 'critical';

/**
 * تقرير السلامة الكامل
 */
export interface SafetyReport {
  /** درجة السلامة من 0 إلى 100 */
  score: number;
  /** الحالة العامة */
  status: SafetyStatus;
  /** قائمة المشاكل المكتشفة */
  issues: string[];
  /** مؤشر المتانة */
  durabilityIndex: number;
}

// ==========================================
// قواعد التقييم
// ==========================================

/** حدود درجة الأمان */
const SAFETY_THRESHOLDS = {
  critical: 50,
  warning: 80,
} as const;

/** قواعد مخاطر الحريق */
const FIRE_HAZARD_RULES: Record<string, { scoreDelta: number; durabilityDelta: number; issue?: string }> = {
  polyester: { 
    scoreDelta: -50, 
    durabilityDelta: 0, 
    issue: 'خطر جسيم: البوليستر والسباندكس مواد سريعة الاشتعال وتذوب على الجلد.' 
  },
  spandex: { 
    scoreDelta: -50, 
    durabilityDelta: 0, 
    issue: 'خطر جسيم: البوليستر والسباندكس مواد سريعة الاشتعال وتذوب على الجلد.' 
  },
  wool: { 
    scoreDelta: -5, 
    durabilityDelta: 10 
  },
  cotton: { 
    scoreDelta: -20, 
    durabilityDelta: 0, 
    issue: 'تحذير: القطن يشتعل بسرعة ما لم يتم معالجته كيميائياً.' 
  },
};

/** قواعد مخاطر الأكشن */
const STUNT_HAZARD_RULES: Record<string, { scoreDelta: number; durabilityDelta: number; issue?: string }> = {
  silk: { 
    scoreDelta: -30, 
    durabilityDelta: -40, 
    issue: 'تمزق: الحرير لا يتحمل الاحتكاك أو الشد العنيف في مشاهد الأكشن.' 
  },
  leather: { 
    scoreDelta: 10, 
    durabilityDelta: 20 
  },
  spandex: { 
    scoreDelta: 5, 
    durabilityDelta: 0, 
    issue: 'ملاحظة: السباندكس يوفر حرية حركة ممتازة لكنه لا يوفر حماية من الكشط.' 
  },
};

/** قواعد مخاطر الماء */
const WATER_HAZARD_RULES: Record<string, { scoreDelta: number; durabilityDelta: number; issue?: string }> = {
  wool: { 
    scoreDelta: -25, 
    durabilityDelta: 0, 
    issue: 'وزن زائد: هذا القماش يمتص الماء ويصبح ثقيلاً جداً، مما قد يعيق السباحة.' 
  },
  leather: { 
    scoreDelta: -25, 
    durabilityDelta: 0, 
    issue: 'وزن زائد: هذا القماش يمتص الماء ويصبح ثقيلاً جداً، مما قد يعيق السباحة.' 
  },
  polyester: { 
    scoreDelta: 10, 
    durabilityDelta: 0 
  },
  silk: { 
    scoreDelta: 0, 
    durabilityDelta: 0, 
    issue: 'تلف بصري: الحرير يفقد رونقه وتماسكه عند البلل.' 
  },
};

// ==========================================
// دوال التقييم
// ==========================================

/**
 * تقييم المخاطر الفيزيائية للزي
 * 
 * لماذا نُقيّم المخاطر؟
 * - لحماية الممثل من الإصابات
 * - لتجنب تلف الأزياء الباهظة
 * - لضمان سير التصوير بسلاسة
 * 
 * @param fabric - نوع القماش المستخدم
 * @param hazards - قائمة المخاطر في المشهد
 * @returns تقرير السلامة الكامل
 * 
 * @example
 * const report = evaluateSafety('cotton', ['fire', 'stunt']);
 * if (report.status === 'critical') {
 *   // عرض تحذير للمستخدم
 * }
 */
export const evaluateSafety = (fabric: FabricType, hazards: SceneHazard[]): SafetyReport => {
  let score = 100;
  const issues: string[] = [];
  let durabilityIndex = 80;

  // تحليل مخاطر الحريق
  if (hazards.includes('fire')) {
    const rule = FIRE_HAZARD_RULES[fabric];
    if (rule) {
      score += rule.scoreDelta;
      durabilityIndex += rule.durabilityDelta;
      if (rule.issue) issues.push(rule.issue);
    }
  }

  // تحليل مخاطر الأكشن
  if (hazards.includes('stunt')) {
    const rule = STUNT_HAZARD_RULES[fabric];
    if (rule) {
      score += rule.scoreDelta;
      durabilityIndex += rule.durabilityDelta;
      if (rule.issue) issues.push(rule.issue);
    } else {
      issues.push('توصية: تأكد من خياطة مزدوجة (Double Stitching) لهذا المشهد.');
    }
  }

  // تحليل مخاطر الماء
  if (hazards.includes('water')) {
    const rule = WATER_HAZARD_RULES[fabric];
    if (rule) {
      score += rule.scoreDelta;
      durabilityIndex += rule.durabilityDelta;
      if (rule.issue) issues.push(rule.issue);
    }
  }

  // حساب الحالة النهائية
  let status: SafetyStatus = 'safe';
  if (score < SAFETY_THRESHOLDS.critical) {
    status = 'critical';
  } else if (score < SAFETY_THRESHOLDS.warning) {
    status = 'warning';
  }

  return {
    score: Math.max(0, score),
    status,
    issues,
    durabilityIndex: Math.min(100, Math.max(0, durabilityIndex)),
  };
};

/**
 * حساب تكلفة الاستهلاك المتوقعة (ROI)
 * 
 * لماذا نحسب العائد على الاستثمار؟
 * - لمساعدة المنتج في اتخاذ قرارات الميزانية
 * - لتوقع التكاليف الإضافية من التلف
 * 
 * @param baseCost - التكلفة الأساسية للقطعة
 * @param durability - مؤشر المتانة (0-100)
 * @param copiesNeeded - عدد النسخ المطلوبة
 * @returns التكلفة الإجمالية المتوقعة
 * 
 * @example
 * const totalCost = calculateROI(500, 80, 3);
 * // = 500 * 3 * (1 + 0.2) = 1800
 */
export const calculateROI = (
  baseCost: number,
  durability: number,
  copiesNeeded: number
): number => {
  // كلما زادت المتانة، قلّ احتمال الاستبدال
  const replacementFactor = (100 - durability) / 100;
  const totalEstimatedCost = (baseCost * copiesNeeded) * (1 + replacementFactor);
  return Math.round(totalEstimatedCost);
};
