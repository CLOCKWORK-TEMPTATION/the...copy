'use client';

/**
 * صفحة الميزانية الرئيسية - Budget Main Page
 * 
 * @description
 * الصفحة الرئيسية لتطبيق إدارة ميزانيات الأفلام
 * تتيح للمستخدم إدخال السيناريو وتوليد ميزانية احترافية
 * 
 * السبب: توفر واجهة بسيطة للمستخدم لبدء عملية
 * إنشاء الميزانية دون تعقيد تقني
 */

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Budget, AIAnalysis, GenerateBudgetRequestSchema } from './lib/types';
import { geminiService } from './lib/geminiService';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Textarea } from './components/ui/textarea';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Film, Sparkles, FileSearch, Zap, TrendingUp, Shield } from 'lucide-react';

/**
 * تحميل ديناميكي للمكونات الثقيلة
 * 
 * @description
 * يؤجل تحميل المكونات الكبيرة حتى الحاجة إليها
 * لتحسين وقت التحميل الأولي للصفحة
 */
const BudgetApp = dynamic(() => import('./components/BudgetApp'), { ssr: false });
const ScriptAnalyzer = dynamic(
  () => import('./components/ScriptAnalyzer').then(mod => ({ default: mod.ScriptAnalyzer })), 
  { ssr: false }
);

/**
 * استجابة API لتوليد الميزانية
 */
interface GenerateBudgetResponse {
  budget?: Budget;
  error?: string;
}

/**
 * خطأ API
 */
interface ApiError {
  message: string;
}

/**
 * صفحة الميزانية الرئيسية
 * 
 * @description
 * تعرض نموذج إدخال السيناريو وأزرار التحليل والتوليد
 * وتنتقل لمحرر الميزانية بعد التوليد الناجح
 */
export default function BudgetPage() {
  const [scenario, setScenario] = useState('');
  const [filmTitle, setFilmTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatedBudget, setGeneratedBudget] = useState<Budget | null>(null);
  const [scriptAnalysis, setScriptAnalysis] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState('');

  /**
   * تحليل السيناريو بالذكاء الاصطناعي
   * 
   * @description
   * يُرسل السيناريو للتحليل ويعرض النتائج
   */
  const analyzeScript = useCallback(async (): Promise<void> => {
    if (!scenario) {
      setError('الرجاء إدخال السيناريو أولاً');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      const analysis = await geminiService.analyzeScript(scenario);
      setScriptAnalysis(analysis);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || 'حدث خطأ أثناء تحليل السيناريو');
    } finally {
      setAnalyzing(false);
    }
  }, [scenario]);

  /**
   * توليد الميزانية من السيناريو
   * 
   * @description
   * يُرسل السيناريو وعنوان الفيلم للخادم
   * لتوليد ميزانية احترافية كاملة
   */
  const generateBudget = useCallback(async (): Promise<void> => {
    // التحقق من صحة المدخلات باستخدام Zod
    const validation = GenerateBudgetRequestSchema.safeParse({
      title: filmTitle,
      scenario: scenario,
    });

    if (!validation.success) {
      setError(validation.error.errors[0]?.message || 'الرجاء إدخال عنوان الفيلم ووصف السيناريو');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/budget/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: filmTitle,
          scenario: scenario,
        }),
      });

      const data: GenerateBudgetResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في إنشاء الميزانية');
      }

      if (data.budget) {
        setGeneratedBudget(data.budget);
      }
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || 'حدث خطأ أثناء إنشاء الميزانية');
    } finally {
      setLoading(false);
    }
  }, [filmTitle, scenario]);

  /**
   * معالج تغيير عنوان الفيلم
   * 
   * @description
   * مصفوفة الاعتماديات فارغة لأن setFilmTitle من useState
   * مضمونة الثبات من React ولن تتغير
   */
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilmTitle(e.target.value);
  }, []);

  /**
   * معالج تغيير السيناريو
   * 
   * @description
   * مصفوفة الاعتماديات فارغة لأن setScenario من useState
   * مضمونة الثبات من React ولن تتغير
   */
  const handleScenarioChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setScenario(e.target.value);
  }, []);

  // عرض محرر الميزانية إذا تم التوليد بنجاح
  if (generatedBudget) {
    return <BudgetApp initialBudget={generatedBudget} initialScript={scenario} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* الترويسة */}
        <div className="text-center space-y-4 py-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform">
            <Film className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            FilmBudget AI Pro
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            أول منصة عربية متخصصة في إنتاج ميزانيات الأفلام باستخدام الذكاء الاصطناعي المتقدم
          </p>
          
          {/* شبكة الميزات */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 max-w-4xl mx-auto">
            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm font-medium">توليد فوري</p>
            </div>
            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <FileSearch className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium">تحليل متقدم</p>
            </div>
            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium">تحسين التكاليف</p>
            </div>
            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <Shield className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm font-medium">معايير احترافية</p>
            </div>
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        <Card className="shadow-2xl border-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <CardContent className="p-6 md:p-8">
            <Tabs defaultValue="script" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="script" className="text-base">
                  <Film className="w-4 h-4 ml-2" />
                  السيناريو والميزانية
                </TabsTrigger>
                <TabsTrigger value="analysis" className="text-base">
                  <FileSearch className="w-4 h-4 ml-2" />
                  التحليل الاحترافي
                </TabsTrigger>
              </TabsList>

              <TabsContent value="script" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="film-title" className="text-right block w-full text-base font-semibold">
                    عنوان الفيلم
                  </Label>
                  <Input
                    id="film-title"
                    placeholder="مثال: المطاردة العظيمة"
                    value={filmTitle}
                    onChange={handleTitleChange}
                    className="text-right h-12 text-lg"
                    dir="rtl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scenario" className="text-right block w-full text-base font-semibold">
                    السيناريو أو الوصف التفصيلي
                  </Label>
                  <Textarea
                    id="scenario"
                    placeholder="أدخل السيناريو الكامل أو وصف تفصيلي للفيلم..."
                    value={scenario}
                    onChange={handleScenarioChange}
                    rows={12}
                    className="text-right resize-none font-mono text-sm leading-relaxed"
                    dir="rtl"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={analyzeScript}
                    disabled={analyzing || !scenario}
                    variant="outline"
                    className="h-12 text-base"
                  >
                    {analyzing ? (
                      <>
                        <span className="animate-spin mr-2">⟳</span>
                        جاري التحليل...
                      </>
                    ) : (
                      <>
                        <FileSearch className="w-5 h-5 mr-2" />
                        تحليل السيناريو أولاً
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={generateBudget}
                    disabled={loading || !scenario || !filmTitle}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-12 text-base font-medium"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin mr-2">⟳</span>
                        جاري الإنشاء...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        إنشاء الميزانية الكاملة
                      </>
                    )}
                  </Button>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-lg text-sm text-center">
                    {error}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="analysis" className="space-y-6">
                <ScriptAnalyzer
                  analysis={scriptAnalysis}
                  isAnalyzing={analyzing}
                  onAnalyze={analyzeScript}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* التذييل */}
        <div className="text-center space-y-2">
          <p className="text-slate-500 text-sm">
            © 2025 FilmBudget AI Pro. Powered by Google Gemini 2.0 Flash
          </p>
          <p className="text-slate-400 text-xs">
            تم التطوير بأحدث تقنيات الذكاء الاصطناعي لخدمة صناعة السينما العربية
          </p>
        </div>
      </div>
    </div>
  );
}
