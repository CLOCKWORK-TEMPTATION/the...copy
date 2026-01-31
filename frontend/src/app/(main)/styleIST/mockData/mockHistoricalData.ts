/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview بيانات وهمية للرسوم البيانية والتحليلات
 * 
 * لماذا نفصل البيانات الوهمية؟
 * - يسهّل استبدالها ببيانات حقيقية لاحقاً
 * - يوضح هيكل البيانات المتوقع من الـ API
 */

import { z } from 'zod';

// ==========================================
// مخططات التحقق من البيانات
// ==========================================

/**
 * مخطط بيانات الأداء
 */
const PerformanceDataSchema = z.array(z.object({
  name: z.string(),
  durability: z.number().min(0).max(100),
  comfort: z.number().min(0).max(100),
  visual: z.number().min(0).max(100).optional(),
}));

/**
 * مخطط بيانات اختبار الإجهاد
 */
const FabricStressTestSchema = z.array(z.object({
  subject: z.string(),
  A: z.number().min(0),
  B: z.number().min(0),
  fullMark: z.number().min(0),
}));

/**
 * مخطط توزيع الميزانية
 */
const BudgetDistributionSchema = z.array(z.object({
  name: z.string(),
  value: z.number().min(0),
}));

// ==========================================
// البيانات الوهمية
// ==========================================

/**
 * بيانات أداء الأزياء عبر المشاهد
 * لماذا نتتبع المتانة والراحة؟
 * - المتانة: لتوقع الحاجة لنسخ إضافية
 * - الراحة: لضمان أداء الممثل لا يتأثر
 */
export const performanceData = PerformanceDataSchema.parse([
  { name: 'المشهد 1', durability: 90, comfort: 80, visual: 95 },
  { name: 'المشهد 2', durability: 65, comfort: 50, visual: 85 },
  { name: 'المشهد 3', durability: 40, comfort: 90, visual: 70 },
  { name: 'المشهد 4', durability: 85, comfort: 85, visual: 90 },
  { name: 'المشهد 5', durability: 20, comfort: 40, visual: 60 },
]);

/**
 * بيانات اختبار إجهاد القماش
 * لماذا نختبر كل هذه العوامل؟
 * - للتأكد من أن القماش يتحمل ظروف التصوير
 * - B يمثل المعيار الآمن، A يمثل الاختيار الحالي
 */
export const fabricStressTest = FabricStressTestSchema.parse([
  { subject: 'مقاومة الشد', A: 120, B: 110, fullMark: 150 },
  { subject: 'ثبات اللون', A: 98, B: 130, fullMark: 150 },
  { subject: 'التهوية', A: 86, B: 130, fullMark: 150 },
  { subject: 'العمر الافتراضي', A: 99, B: 100, fullMark: 150 },
  { subject: 'المرونة', A: 85, B: 90, fullMark: 150 },
  { subject: 'مقاومة الحريق', A: 65, B: 85, fullMark: 150 },
]);

/**
 * توزيع الميزانية
 * لماذا نتتبع التوزيع؟
 * - لمساعدة المنتج في اتخاذ قرارات مالية
 */
export const budgetDistribution = BudgetDistributionSchema.parse([
  { name: 'خامات أساسية', value: 4000 },
  { name: 'تصنيع وتفصيل', value: 3000 },
  { name: 'تعديلات (Alterations)', value: 1500 },
  { name: 'إكسسوارات', value: 1000 },
]);

// ==========================================
// أنواع مُستنتجة
// ==========================================

export type PerformanceData = z.infer<typeof PerformanceDataSchema>;
export type FabricStressTest = z.infer<typeof FabricStressTestSchema>;
export type BudgetDistribution = z.infer<typeof BudgetDistributionSchema>;
