"use client";

import dynamic from "next/dynamic";

// ⚡ ENHANCED VERSION - Combines best features from all editors
// Features:
// ✅ SceneHeaderAgent - معالجة متقدمة لرؤوس المشاهد العربية المعقدة
// ✅ postProcessFormatting - تصحيح ذكي للنصوص بعد اللصق
// ✅ Advanced paste handling - معالجة لصق متطورة مع تتبع السياق
// ✅ All 7 System Classes - كل فئات النظام (StateManager, AutoSaveManager, AdvancedSearchEngine, etc.)
// ✅ AdvancedAgentsPopup - تكامل مع الوكلاء المتقدمة
// ✅ Full Sidebar - شريط جانبي كامل مع الإحصائيات
// ✅ Status Bar - شريط حالة مباشر
// ✅ AI Writing Assistant - مساعد كتابة بالذكاء الاصطناعي
// ✅ Character Rename - إعادة تسمية الشخصيات
// ✅ Dark/Light mode - الوضع الليلي/النهاري
const ScreenplayEditorEnhanced = dynamic(
  () => import("./components/ScreenplayEditorEnhanced"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-black flex items-center justify-center" dir="rtl">
        <div className="text-white text-xl">جاري تحميل المحرر المحسّن...</div>
      </div>
    ),
  }
);

export default function EditorPage() {
  return <ScreenplayEditorEnhanced />;
}
