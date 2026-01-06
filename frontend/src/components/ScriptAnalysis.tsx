/**
 * مثال على استخدام Pipeline Agent في تحليل السيناريو
 * يمكن دمج هذا في Directors Studio أو Analysis page
 */

"use client";

import { useState } from "react";
import { sevenStationsOrchestrator } from "@/orchestration/pipeline-orchestrator";
import { backgroundWorkersInitializer } from "@/workers/initializer";
import type { SevenStationsExecution } from "@/orchestration/pipeline-orchestrator";

export function useScriptAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStation, setCurrentStation] = useState("");
  const [result, setResult] = useState<SevenStationsExecution | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * تحليل السيناريو باستخدام محطات السبع
   */
  const analyzeScript = async (
    scriptId: string,
    scriptContent: string,
    options?: {
      skipStations?: string[];
      priorityStations?: string[];
      timeout?: number;
    }
  ) => {
    try {
      setIsAnalyzing(true);
      setProgress(0);
      setError(null);
      setCurrentStation("جاري التحضير...");

      // التحقق من جاهزية Background Agent
      const useBackgroundAgent = backgroundWorkersInitializer.isPipelineAgentReady();
      
      if (useBackgroundAgent) {
        console.log("✅ استخدام Background Agent للتحليل");
      } else {
        console.log("⚠️ Background Agent غير متاح - استخدام المعالجة المباشرة");
      }

      // تشغيل التحليل
      const execution = await sevenStationsOrchestrator.runSevenStationsPipeline(
        scriptId,
        scriptContent,
        {
          ...options,
          useBackgroundAgent, // استخدام Background Agent إذا كان متاحاً
        }
      );

      // متابعة التقدم
      const updateProgress = () => {
        const currentExecution = sevenStationsOrchestrator.getExecution(execution.id);
        if (currentExecution) {
          setProgress(currentExecution.progress);
          
          const completedStations = currentExecution.stations.length;
          if (completedStations > 0) {
            const lastStation = currentExecution.stations[completedStations - 1];
            setCurrentStation(`المحطة: ${lastStation.stationName}`);
          }
        }
      };

      // تحديث التقدم كل نصف ثانية
      const progressInterval = setInterval(updateProgress, 500);

      // انتظار اكتمال التحليل
      while (!execution.endTime) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const currentExecution = sevenStationsOrchestrator.getExecution(execution.id);
        if (currentExecution?.endTime) {
          Object.assign(execution, currentExecution);
          break;
        }
      }

      clearInterval(progressInterval);

      setResult(execution);
      setProgress(100);
      setCurrentStation("اكتمل التحليل!");
      
      return execution;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "خطأ غير معروف";
      setError(errorMessage);
      console.error("خطأ في تحليل السيناريو:", err);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * إلغاء التحليل الجاري
   */
  const cancelAnalysis = (executionId: string) => {
    sevenStationsOrchestrator.cancelExecution(executionId);
    setIsAnalyzing(false);
    setCurrentStation("تم إلغاء التحليل");
  };

  return {
    analyzeScript,
    cancelAnalysis,
    isAnalyzing,
    progress,
    currentStation,
    result,
    error,
  };
}

/**
 * مكون واجهة المستخدم لتحليل السيناريو
 */
export function ScriptAnalysisPanel({ scriptId, scriptContent }: {
  scriptId: string;
  scriptContent: string;
}) {
  const {
    analyzeScript,
    cancelAnalysis,
    isAnalyzing,
    progress,
    currentStation,
    result,
    error,
  } = useScriptAnalysis();

  const handleAnalyze = async () => {
    try {
      await analyzeScript(scriptId, scriptContent);
    } catch (err) {
      // Error is already handled in the hook
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6" dir="rtl">
      <h2 className="mb-4 text-2xl font-bold">تحليل السيناريو - المحطات السبع</h2>
      
      {/* أزرار التحكم */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="rounded-md bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isAnalyzing ? "جاري التحليل..." : "ابدأ التحليل"}
        </button>
        
        {isAnalyzing && result && (
          <button
            onClick={() => cancelAnalysis(result.id)}
            className="rounded-md border border-destructive px-6 py-2 text-destructive hover:bg-destructive/10"
          >
            إلغاء
          </button>
        )}
      </div>

      {/* شريط التقدم */}
      {isAnalyzing && (
        <div className="mb-6">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium">{currentStation}</span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* رسالة خطأ */}
      {error && (
        <div className="mb-6 rounded-md border border-destructive bg-destructive/10 p-4 text-destructive">
          <p className="font-medium">حدث خطأ:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* النتائج */}
      {result && !isAnalyzing && (
        <div className="space-y-4">
          <div className="rounded-md border border-border bg-muted/50 p-4">
            <h3 className="mb-2 font-semibold">نتائج التحليل</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">الحالة:</span>
                <span className={result.overallSuccess ? "text-green-600" : "text-red-600"}>
                  {result.overallSuccess ? "نجح" : "فشل"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">عدد المحطات:</span>
                <span>{result.stations.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">المدة الإجمالية:</span>
                <span>{(result.totalDuration / 1000).toFixed(2)} ثانية</span>
              </div>
            </div>
          </div>

          {/* نتائج كل محطة */}
          <div className="space-y-2">
            <h3 className="font-semibold">تفاصيل المحطات:</h3>
            {result.stations.map((station, index) => (
              <div
                key={station.stationId}
                className="rounded-md border border-border p-3 text-sm"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium">{station.stationName}</span>
                  <span className={station.success ? "text-green-600" : "text-red-600"}>
                    {station.success ? "✓" : "✗"}
                  </span>
                </div>
                <div className="text-muted-foreground">
                  المدة: {(station.duration / 1000).toFixed(2)} ثانية
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
