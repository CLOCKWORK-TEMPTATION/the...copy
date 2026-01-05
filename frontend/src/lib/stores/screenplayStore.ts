/**
 * Screenplay Store - متجر حالة محرر السيناريو
 *
 * هذا الملف يحتوي على store Zustand لإدارة حالة محرر السيناريو العربي.
 * يوفر:
 * - إدارة المحتوى والخطوط المنسقة
 * - إعدادت المحرر (الخط، الحجم، السمة)
 * - وظائف الحفظ والتحميل
 * - Auto-save functionality
 *
 * @module lib/stores/screenplayStore
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * نوع السطر المنسق
 */
export interface FormattedLine {
  id: string;
  text: string;
  type: 'basmala' | 'scene-header-top-line' | 'scene-header-1' | 'scene-header-2' | 'scene-header-3' | 'character' | 'dialogue' | 'parenthetical' | 'action' | 'transition' | 'unknown';
  number: number;
}

/**
 * إحصائيات المستند
 */
export interface DocumentStats {
  characters: number;
  words: number;
  lines: number;
  scenes: number;
  pages: number;
}

/**
 * إعدادات المحرر
 */
export interface EditorSettings {
  fontSize: number;
  fontFamily: 'Cairo' | 'Amiri' | 'Tajawal';
  theme: 'light' | 'dark';
  showLineNumbers: boolean;
  showRulers: boolean;
  autoSaveInterval: number; // بالمللي ثانية
}

/**
 * حالة المحرر
 */
export interface ScreenplayState {
  // === المحتوى ===
  content: string;
  formattedLines: FormattedLine[];

  // === الموقع والتحديد ===
  cursorPosition: number;
  selection: { start: number; end: number } | null;

  // === حالة المستند ===
  isDirty: boolean;
  lastSaved: Date | null;
  lastSavedContent: string;

  // === الإحصائيات ===
  stats: DocumentStats;

  // === الإعدادات ===
  settings: EditorSettings;

  // === حالة الحفظ ===
  isSaving: boolean;
  isLoading: boolean;
  saveError: string | null;

  // === الحالة الحالية ===
  currentDocumentId: string | null;
  currentFormat: string;

  // === Actions ===

  // إدارة المحتوى
  setContent: (content: string) => void;
  setFormattedLines: (lines: FormattedLine[]) => void;
  appendContent: (text: string) => void;
  clearContent: () => void;

  // إدارة الموقع
  setCursorPosition: (position: number) => void;
  setSelection: (selection: { start: number; end: number } | null) => void;

  // إعدادت المحرر
  updateSettings: (settings: Partial<EditorSettings>) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (family: 'Cairo' | 'Amiri' | 'Tajawal') => void;
  toggleTheme: () => void;

  // الحفظ والتحميل
  saveDocument: () => Promise<void>;
  loadDocument: (id: string) => Promise<void>;
  exportDocument: (format: 'html' | 'txt' | 'pdf') => Promise<void>;
  markDirty: () => void;
  markClean: () => void;

  // الإحصائيات
  calculateStats: () => void;
  updateStat: (stat: keyof DocumentStats, value: number) => void;

  // Current format
  setCurrentFormat: (format: string) => void;

  // Reset
  reset: () => void;
}

/**
 * الإعدادات الافتراضية
 */
const defaultSettings: EditorSettings = {
  fontSize: 14,
  fontFamily: 'Amiri',
  theme: 'light',
  showLineNumbers: false,
  showRulers: true,
  autoSaveInterval: 30000, // 30 ثانية
};

/**
 * الإحصائيات الافتراضية
 */
const defaultStats: DocumentStats = {
  characters: 0,
  words: 0,
  lines: 0,
  scenes: 0,
  pages: 1,
};

/**
 * Screenplay Store - متجر حالة محرر السيناريو
 *
 * يوفر methods لإدارة حالة المحرر بشكل كامل
 */
export const useScreenplayStore = create<ScreenplayState>()(
  devtools(
    persist(
      (set, get) => ({
        // === Initial State ===

        content: '',
        formattedLines: [],
        cursorPosition: 0,
        selection: null,
        isDirty: false,
        lastSaved: null,
        lastSavedContent: '',
        stats: defaultStats,
        settings: defaultSettings,
        isSaving: false,
        isLoading: false,
        saveError: null,
        currentDocumentId: null,
        currentFormat: 'action',

        // === Content Management ===

        /**
         * تعيين محتوى السيناريو
         * @param content - المحتوى الجديد
         */
        setContent: (content: string) => {
          set({ content, isDirty: content !== get().lastSavedContent });
          get().calculateStats();
        },

        /**
         * تعيين الخطوط المنسقة
         * @param lines - الخطوط المنسقة
         */
        setFormattedLines: (lines: FormattedLine[]) => {
          set({ formattedLines: lines });
        },

        /**
         * إضافة محتوى في النهاية
         * @param text - النص المراد إضافته
         */
        appendContent: (text: string) => {
          const newContent = get().content + text;
          set({ content: newContent, isDirty: true });
          get().calculateStats();
        },

        /**
         * مسح المحتوى
         */
        clearContent: () => {
          set({
            content: '',
            formattedLines: [],
            isDirty: false,
            stats: defaultStats,
          });
        },

        // === Cursor & Selection Management ===

        /**
         * تعيين موقع المؤشر
         * @param position - موقع المؤشر الجديد
         */
        setCursorPosition: (position: number) => {
          set({ cursorPosition: position });
        },

        /**
         * تعيين التحديد
         * @param selection - التحديد الجديد
         */
        setSelection: (selection: { start: number; end: number } | null) => {
          set({ selection });
        },

        // === Settings Management ===

        /**
         * تحديث الإعدادات
         * @param newSettings - الإعدادات الجديدة
         */
        updateSettings: (newSettings: Partial<EditorSettings>) => {
          set((state) => ({
            settings: { ...state.settings, ...newSettings }
          }));
        },

        /**
         * تعيين حجم الخط
         * @param size - حجم الخط الجديد
         */
        setFontSize: (size: number) => {
          set((state) => ({
            settings: { ...state.settings, fontSize: size }
          }));
        },

        /**
         * تعيين نوع الخط
         * @param family - نوع الخط الجديد
         */
        setFontFamily: (family: 'Cairo' | 'Amiri' | 'Tajawal') => {
          set((state) => ({
            settings: { ...state.settings, fontFamily: family }
          }));
        },

        /**
         * تبديل السمة (فاتح/داكن)
         */
        toggleTheme: () => {
          set((state) => ({
            settings: {
              ...state.settings,
              theme: state.settings.theme === 'light' ? 'dark' : 'light'
            }
          }));
        },

        // === Save & Load ===

        /**
         * حفظ المستند
         */
        saveDocument: async () => {
          const state = get();
          if (!state.isDirty) return;

          set({ isSaving: true, saveError: null });

          try {
            // TODO: Implement actual save logic (Firebase/localStorage)
            // For now, just mark as clean
            set({
              isSaving: false,
              lastSaved: new Date(),
              lastSavedContent: state.content,
              isDirty: false,
            });
          } catch (error) {
            set({
              isSaving: false,
              saveError: `Failed to save: ${error}`,
            });
          }
        },

        /**
         * تحميل مستند
         * @param id - معرف المستند
         */
        loadDocument: async (id: string) => {
          set({ isLoading: true, saveError: null });

          try {
            // TODO: Implement actual load logic (Firebase/localStorage)
            // For now, just set the document ID
            set({
              isLoading: false,
              currentDocumentId: id,
            });
          } catch (error) {
            set({
              isLoading: false,
              saveError: `Failed to load: ${error}`,
            });
          }
        },

        /**
         * تصدير المستند
         * @param format - صيغة التصدير
         */
        exportDocument: async (format: 'html' | 'txt' | 'pdf') => {
          const state = get();

          try {
            // TODO: Implement actual export logic
            console.log(`Exporting document as ${format}:`, state.content);

            if (format === 'txt') {
              // Export as plain text
              const blob = new Blob([state.content], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `screenplay-${Date.now()}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            } else if (format === 'html') {
              // Export as HTML
              const htmlContent = `
                <!DOCTYPE html>
                <html lang="ar" dir="rtl">
                <head>
                  <meta charset="UTF-8">
                  <title>سيناريو</title>
                  <style>
                    body { font-family: 'Amiri', 'Cairo', sans-serif; direction: rtl; }
                  </style>
                </head>
                <body>
                  ${state.content}
                </body>
                </html>
              `;
              const blob = new Blob([htmlContent], { type: 'text/html' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `screenplay-${Date.now()}.html`;
              a.click();
              URL.revokeObjectURL(url);
            }
          } catch (error) {
            console.error('Export failed:', error);
          }
        },

        /**
         * تعليم المستند كمتسخ (dirty)
         */
        markDirty: () => {
          set({ isDirty: true });
        },

        /**
         * تعليم المستند كنظيف (clean)
         */
        markClean: () => {
          set({ isDirty: false, lastSaved: new Date() });
        },

        // === Statistics ===

        /**
         * حساب إحصائيات المستند
         */
        calculateStats: () => {
          const state = get();
          const content = state.content;

          const characters = content.length;
          const words = content.trim() ? content.trim().split(/\s+/).length : 0;
          const lines = content.split('\n').length;
          const scenes = (content.match(/مشهد\s*\d+/gi) || []).length;
          const pages = Math.max(1, Math.ceil(lines / 25)); // تقريباً 25 سطر لكل صفحة

          set({
            stats: {
              characters,
              words,
              lines,
              scenes,
              pages,
            }
          });
        },

        /**
         * تحديث إحصائية معينة
         * @param stat - نوع الإحصائية
         * @param value - القيمة الجديدة
         */
        updateStat: (stat: keyof DocumentStats, value: number) => {
          set((state) => ({
            stats: { ...state.stats, [stat]: value }
          }));
        },

        // === Current Format ===

        /**
         * تعيين النوع الحالي
         * @param format - النوع الجديد
         */
        setCurrentFormat: (format: string) => {
          set({ currentFormat: format });
        },

        // === Reset ===

        /**
         * إعادة تعيين المتجر إلى الحالة الافتراضية
         */
        reset: () => {
          set({
            content: '',
            formattedLines: [],
            cursorPosition: 0,
            selection: null,
            isDirty: false,
            lastSaved: null,
            lastSavedContent: '',
            stats: defaultStats,
            settings: defaultSettings,
            isSaving: false,
            isLoading: false,
            saveError: null,
            currentDocumentId: null,
            currentFormat: 'action',
          });
        },
      }),
      {
        name: 'screenplay-storage',
        partialize: (state) => ({
          settings: state.settings,
          // نحفظ الإعدادات فقط، لا المحتوى
        }),
      }
    ),
    {
      name: 'screenplay-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

/**
 * Actions selectors - اختصارات للاستخدام الشائع
 */
export const screenplayActions = {
  // Content
  setContent: (content: string) => useScreenplayStore.getState().setContent(content),
  clearContent: () => useScreenplayStore.getState().clearContent(),

  // Settings
  setFontSize: (size: number) => useScreenplayStore.getState().setFontSize(size),
  setFontFamily: (family: 'Cairo' | 'Amiri' | 'Tajawal') => useScreenplayStore.getState().setFontFamily(family),
  toggleTheme: () => useScreenplayStore.getState().toggleTheme(),

  // Save & Load
  saveDocument: () => useScreenplayStore.getState().saveDocument(),
  exportDocument: (format: 'html' | 'txt' | 'pdf') => useScreenplayStore.getState().exportDocument(format),
};

/**
 * Selectors - دوال مساعدة لاختيار أجزاء محددة من الحالة
 */
export const selectContent = (state: ScreenplayState) => state.content;
export const selectFormattedLines = (state: ScreenplayState) => state.formattedLines;
export const selectSettings = (state: ScreenplayState) => state.settings;
export const selectStats = (state: ScreenplayState) => state.stats;
export const selectIsDirty = (state: ScreenplayState) => state.isDirty;
export const selectIsSaving = (state: ScreenplayState) => state.isSaving;

/**
 * التصدير الافتراضي
 */
export default useScreenplayStore;
