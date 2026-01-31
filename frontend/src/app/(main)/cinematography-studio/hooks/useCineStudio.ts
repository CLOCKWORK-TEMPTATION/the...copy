"use client";

/**
 * خطاف استوديو السينما (useCineStudio)
 *
 * @description
 * السبب وراء هذا التصميم:
 * - فصل منطق إدارة الحالة عن مكون العرض
 * - تسهيل إعادة استخدام المنطق في مكونات أخرى
 * - تحسين قابلية الاختبار والصيانة
 *
 * يُدير:
 * - حالة المرحلة الحالية (ما قبل/أثناء/ما بعد الإنتاج)
 * - المزاج البصري المختار
 * - الأداة النشطة
 * - طريقة العرض (لوحة الأدوات أو المراحل)
 *
 * @example
 * ```tsx
 * const {
 *   currentPhase,
 *   setCurrentPhase,
 *   activeTool,
 *   setActiveTool,
 *   visualMood,
 *   setVisualMood,
 *   activeView,
 *   setActiveView,
 *   currentTabValue,
 *   handleTabChange
 * } = useCineStudio();
 * ```
 *
 * @module useCineStudio
 */

import { useState, useCallback, useMemo } from "react";

/**
 * أنواع المراحل الإنتاجية
 * السبب: تحديد المراحل الثلاث الرئيسية للإنتاج السينمائي
 */
export type Phase = "pre" | "production" | "post";

/**
 * قيم التبويبات المقابلة للمراحل
 * السبب: توافق مع مكون Tabs من Radix UI
 */
export type TabValue = "pre-production" | "production" | "post-production";

/**
 * أنماط المزاج البصري المتاحة
 * السبب: تحديد الخيارات المتاحة للمستخدم
 */
export type VisualMood = "noir" | "realistic" | "surreal" | "vintage";

/**
 * طرق العرض المتاحة
 * السبب: التبديل بين عرض الأدوات وعرض المراحل
 */
export type ViewMode = "dashboard" | "phases";

/**
 * واجهة قيم الخطاف المُرجعة
 *
 * @description
 * السبب: توفير واجهة واضحة للمكونات المستهلكة
 */
export interface CineStudioState {
  /** المرحلة الحالية */
  currentPhase: Phase;
  /** تعيين المرحلة */
  setCurrentPhase: (phase: Phase) => void;
  /** الأداة النشطة (null = لا توجد أداة مفتوحة) */
  activeTool: string | null;
  /** تعيين الأداة النشطة */
  setActiveTool: (tool: string | null) => void;
  /** المزاج البصري المختار */
  visualMood: VisualMood;
  /** تعيين المزاج البصري */
  setVisualMood: (mood: VisualMood) => void;
  /** طريقة العرض الحالية */
  activeView: ViewMode;
  /** تعيين طريقة العرض */
  setActiveView: (view: ViewMode) => void;
  /** قيمة التبويب الحالية (مشتقة من المرحلة) */
  currentTabValue: TabValue;
  /** معالج تغيير التبويب */
  handleTabChange: (value: string) => void;
  /** الانتقال لمرحلة مع تغيير العرض */
  navigateToPhase: (phase: Phase) => void;
}

/**
 * خريطة التحويل من المرحلة إلى قيمة التبويب
 * السبب: ضمان التوافق بين الحالة الداخلية ومكون Tabs
 */
const TAB_VALUE_BY_PHASE: Record<Phase, TabValue> = {
  pre: "pre-production",
  production: "production",
  post: "post-production",
};

/**
 * خريطة التحويل من قيمة التبويب إلى المرحلة
 * السبب: استعادة المرحلة من تغيير التبويب
 */
const PHASE_BY_TAB: Record<TabValue, Phase> = {
  "pre-production": "pre",
  production: "production",
  "post-production": "post",
};

/**
 * التحقق من صحة قيمة التبويب
 *
 * @description
 * السبب: Type Guard للتأكد من أن القيمة صالحة قبل استخدامها
 *
 * @param value - القيمة للتحقق منها
 * @returns true إذا كانت قيمة تبويب صالحة
 */
export function isValidTabValue(value: string): value is TabValue {
  return (
    value === "pre-production" ||
    value === "production" ||
    value === "post-production"
  );
}

/**
 * خطاف إدارة حالة استوديو السينما
 *
 * @description
 * السبب: توفير إدارة مركزية لحالة الاستوديو مع:
 * - تحويلات آمنة للأنواع
 * - دوال مُحسّنة بـ useCallback
 * - قيم مشتقة بـ useMemo
 *
 * @param initialPhase - المرحلة الأولية (افتراضي: "pre")
 * @param initialMood - المزاج الأولي (افتراضي: "noir")
 * @returns كائن يحتوي على جميع الحالات والدوال
 */
export function useCineStudio(
  initialPhase: Phase = "pre",
  initialMood: VisualMood = "noir"
): CineStudioState {
  // === الحالات الأساسية ===

  /** المرحلة الحالية من سير العمل */
  const [currentPhase, setCurrentPhase] = useState<Phase>(initialPhase);

  /** المزاج البصري المختار للمشروع */
  const [visualMood, setVisualMood] = useState<VisualMood>(initialMood);

  /** الأداة المفتوحة حالياً (null = لا شيء) */
  const [activeTool, setActiveTool] = useState<string | null>(null);

  /** طريقة العرض: لوحة الأدوات أو عرض المراحل */
  const [activeView, setActiveView] = useState<ViewMode>("dashboard");

  // === القيم المشتقة ===

  /**
   * قيمة التبويب المحسوبة من المرحلة الحالية
   * السبب: تجنب حساب القيمة في كل عرض
   */
  const currentTabValue = useMemo<TabValue>(
    () => TAB_VALUE_BY_PHASE[currentPhase],
    [currentPhase]
  );

  // === المعالجات المُحسّنة ===

  /**
   * معالج تغيير التبويب
   * السبب: التحقق من صحة القيمة قبل تحديث الحالة
   */
  const handleTabChange = useCallback((value: string) => {
    if (isValidTabValue(value)) {
      setCurrentPhase(PHASE_BY_TAB[value]);
    }
  }, []);

  /**
   * الانتقال لمرحلة مع تبديل العرض تلقائياً
   * السبب: تبسيط الانتقال من لوحة الأدوات إلى عرض المراحل
   */
  const navigateToPhase = useCallback((phase: Phase) => {
    setCurrentPhase(phase);
    setActiveView("phases");
  }, []);

  return {
    currentPhase,
    setCurrentPhase,
    activeTool,
    setActiveTool,
    visualMood,
    setVisualMood,
    activeView,
    setActiveView,
    currentTabValue,
    handleTabChange,
    navigateToPhase,
  };
}

export default useCineStudio;
