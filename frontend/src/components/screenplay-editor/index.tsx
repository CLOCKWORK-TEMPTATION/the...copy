/**
 * Screenplay Editor - محرر السيناريو العربي
 *
 * المكون الرئيسي لمحرر السيناريو العربي
 *
 * @module components/screenplay-editor
 */

import * as React from 'react';
import { useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Loader2,
  Sun,
  Moon,
  Save,
  FileText,
  Download,
  Search,
  Settings,
  Type,
  Bold,
  Italic,
  Underline,
  BookHeart,
} from 'lucide-react';
import { useScreenplayEditor } from '@/hooks/useScreenplayEditor';
import { useEditorSettings } from '@/hooks/useScreenplayEditor';
import { useScreenplayStore } from '@/lib/stores/screenplayStore';
import { GeminiClient } from '@/lib/ai/gemini-client';
import type { FormattedLine } from '@/lib/stores/screenplayStore';

/**
 * ScreenplayEditor Component - المكون الرئيسي
 */
export function ScreenplayEditor() {
  const editorRef = useRef<HTMLDivElement>(null);

  // Custom hooks
  const { settings, toggleTheme } = useEditorSettings();
  const { exportDocument } = useScreenplayStore();
  const {
    content,
    formattedLines,
    currentFormat,
    processText,
    insertText,
    saveDocument,
    isDirty,
    isSaving,
  } = useScreenplayEditor();

  // Dialog states
  const [showAIAnalysis, setShowAIAnalysis] = React.useState(false);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [aiResult, setAiResult] = React.useState('');

  /**
   * Initialize Gemini AI
   */
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      GeminiClient.initialize();
    }
  }, []);

  /**
   * Handle input changes
   */
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerText || '';
    processText(newContent);
  };

  /**
   * Handle keyboard events
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Tab key for format navigation
    if (e.key === 'Tab') {
      e.preventDefault();
      // TODO: Implement Tab navigation logic
    }

    // Ctrl/Cmd + S for save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveDocument();
    }

    // Ctrl/Cmd + Enter for AI analysis
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleAIAnalysis();
    }
  };

  /**
   * Handle AI Analysis
   */
  const handleAIAnalysis = async () => {
    if (!content.trim()) {
      alert('الرجاء إدخال نص للتحليل');
      return;
    }

    setShowAIAnalysis(true);
    setIsAnalyzing(true);

    try {
      const result = await GeminiClient.analyzeScreenplay(content, {
        language: 'ar',
        detailLevel: 'standard',
        includeSuggestions: true,
      });

      setAiResult(`
**الملخص:**
${result.summary}

**نقاط القوة:**
${result.details.strengths.map(s => `• ${s}`).join('\n')}

**نقاط التحسين:**
${result.details.weaknesses.map(w => `• ${w}`).join('\n')}

**الاقتراحات:**
${result.details.suggestions.map(s => `• ${s}`).join('\n')}
      `);
    } catch (error) {
      setAiResult(`فشل التحليل: ${error}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Get format styles for a line type
   */
  const getFormatStyles = (formatType: string): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      fontFamily: `${settings.fontFamily}, Amiri, Cairo, Noto Sans Arabic, sans-serif`,
      fontSize: `${settings.fontSize}pt`,
      direction: 'rtl' as const,
      lineHeight: '1.8',
      minHeight: '1.2em',
    };

    const formatStyles: Record<string, React.CSSProperties> = {
      'basmala': { textAlign: 'left', margin: '0' },
      'scene-header-top-line': { display: 'flex', justifyContent: 'space-between', width: '100%', margin: '1rem 0 0 0' },
      'scene-header-1': { ...baseStyles, fontWeight: 'bold', textTransform: 'uppercase', margin: '0' },
      'scene-header-2': { ...baseStyles, fontStyle: 'italic', margin: '0' },
      'scene-header-3': { ...baseStyles, textAlign: 'center', fontWeight: 'bold', margin: '0 0 1rem 0' },
      'character': { ...baseStyles, textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', width: '2.5in', margin: '12px auto 0 auto' },
      'parenthetical': { ...baseStyles, textAlign: 'center', fontStyle: 'italic', width: '2.0in', margin: '6px auto' },
      'dialogue': { ...baseStyles, textAlign: 'center', width: '2.5in', lineHeight: '1.2', margin: '0 auto 12px auto' },
      'action': { ...baseStyles, textAlign: 'right', margin: '12px 0' },
      'transition': { ...baseStyles, textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', margin: '1rem 0' },
      'unknown': { ...baseStyles },
    };

    return formatStyles[formatType] || formatStyles['unknown'];
  };

  /**
   * Render formatted line
   */
  const renderFormattedLine = (line: FormattedLine) => {
    const styles = getFormatStyles(line.type);

    return (
      <div key={line.id} style={styles}>
        {line.text}
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${settings.theme === 'dark' ? 'dark' : ''}`}>
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">محرر السيناريو العربي</h1>
            {isDirty && <span className="text-sm text-muted-foreground">• غير محفوظ</span>}
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-accent rounded-md"
              title={settings.theme === 'light' ? 'الوضع الداكن' : 'الوضع الفاتح'}
            >
              {settings.theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* AI Analysis */}
            <button
              onClick={handleAIAnalysis}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
              title="تحليل ذكي (Ctrl+Enter)"
            >
              <Sparkles size={18} />
              <span>تحليل ذكي</span>
            </button>

            {/* Save */}
            <button
              onClick={saveDocument}
              disabled={!isDirty || isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              <span>حفظ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Editor Area */}
          <div className="lg:col-span-3">
            <div className="border rounded-lg bg-background p-6 min-h-[600px]">
              {/* Toolbar */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                <button className="p-2 hover:bg-accent rounded-md" title="عريض">
                  <Bold size={18} />
                </button>
                <button className="p-2 hover:bg-accent rounded-md" title="مائل">
                  <Italic size={18} />
                </button>
                <button className="p-2 hover:bg-accent rounded-md" title="تسطير">
                  <Underline size={18} />
                </button>
                <div className="flex-1" />
                <select
                  value={settings.fontFamily}
                  onChange={(e) => useScreenplayStore.getState().setFontFamily(e.target.value as any)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="Amiri">Amiri</option>
                  <option value="Cairo">Cairo</option>
                  <option value="Tajawal">Tajawal</option>
                </select>
                <select
                  value={settings.fontSize}
                  onChange={(e) => useScreenplayStore.getState().setFontSize(Number(e.target.value))}
                  className="px-3 py-2 border rounded-md bg-background w-20"
                >
                  <option value={12}>12pt</option>
                  <option value={14}>14pt</option>
                  <option value={16}>16pt</option>
                  <option value={18}>18pt</option>
                  <option value={20}>20pt</option>
                </select>
              </div>

              {/* Editor */}
              <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                className="outline-none min-h-[500px] focus:outline-none"
                style={{
                  fontFamily: `${settings.fontFamily}, sans-serif`,
                  fontSize: `${settings.fontSize}pt`,
                  direction: 'rtl',
                  textAlign: 'right',
                }}
                suppressContentEditableWarning
              >
                {formattedLines.map(renderFormattedLine)}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Statistics */}
            <div className="border rounded-lg bg-background p-4">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <FileText size={18} />
                الإحصائيات
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>الكلمات:</span>
                  <span className="font-mono">{useScreenplayStore.getState().stats.words}</span>
                </div>
                <div className="flex justify-between">
                  <span>الحروف:</span>
                  <span className="font-mono">{useScreenplayStore.getState().stats.characters}</span>
                </div>
                <div className="flex justify-between">
                  <span>السطور:</span>
                  <span className="font-mono">{useScreenplayStore.getState().stats.lines}</span>
                </div>
                <div className="flex justify-between">
                  <span>المشاهد:</span>
                  <span className="font-mono">{useScreenplayStore.getState().stats.scenes}</span>
                </div>
                <div className="flex justify-between">
                  <span>الصفحات:</span>
                  <span className="font-mono">{useScreenplayStore.getState().stats.pages}</span>
                </div>
              </div>
            </div>

            {/* Export */}
            <div className="border rounded-lg bg-background p-4">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Download size={18} />
                التصدير
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => exportDocument('txt')}
                  className="w-full px-4 py-2 border rounded-md hover:bg-accent text-left"
                >
                  نص (.txt)
                </button>
                <button
                  onClick={() => exportDocument('html')}
                  className="w-full px-4 py-2 border rounded-md hover:bg-accent text-left"
                >
                  HTML
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* AI Analysis Dialog */}
      {showAIAnalysis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-auto m-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Sparkles size={20} />
                تحليل ذكي للسيناريو
              </h3>
              <button
                onClick={() => setShowAIAnalysis(false)}
                className="p-2 hover:bg-accent rounded-md"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 size={32} className="animate-spin text-primary mb-4" />
                  <p>جاري تحليل السيناريو...</p>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none dir-rtl whitespace-pre-wrap">
                  {aiResult}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 p-6 border-t">
              <button
                onClick={() => setShowAIAnalysis(false)}
                className="px-4 py-2 border rounded-md hover:bg-accent"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScreenplayEditor;
