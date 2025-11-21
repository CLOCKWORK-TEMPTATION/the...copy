import dynamic from "next/dynamic";
import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { toText } from "@/ai/gemini-core";
// TODO: Re-import these types once they're properly defined
// import {
//   AIResponse,
//   ProcessedFile,
//   AgentId,
//   AIRequest,
// } from "@/lib/drama-analyst/types";
// import { submitTask } from "@/orchestration/executor";
// import { runFullPipeline } from "@/lib/actions/analysis";
// import {
//   MIN_FILES_REQUIRED,
//   TASKS_REQUIRING_COMPLETION_SCOPE,
//   COMPLETION_ENHANCEMENT_OPTIONS,
//   TASK_LABELS,
//   TASK_CATEGORY_MAP,
// } from "@/lib/drama-analyst/constants";
// import { agentIdToTaskTypeMap } from "@/lib/drama-analyst/agents/taskInstructions";

// Temporary placeholders - these should be moved to proper type files
type AIResponse = any;
type ProcessedFile = any;
type AgentId = any;
type AIRequest = any;

const MIN_FILES_REQUIRED = 0;
const TASKS_REQUIRING_COMPLETION_SCOPE: any[] = [];
const COMPLETION_ENHANCEMENT_OPTIONS: any[] = [];
const TASK_LABELS: Record<string, string> = {};
const TASK_CATEGORY_MAP: Record<string, string> = {};
const agentIdToTaskTypeMap: Record<string, any> = {};

const submitTask = async (..._args: any[]): Promise<any> => {
  // TODO: Implement task submission logic
  return null;
};
const runFullPipeline = async (..._args: any[]): Promise<any> => {
  // TODO: Implement full pipeline logic
  return null;
};
import { AgentReportViewer } from "@/components/agent-report-viewer";
import { AgentReportsExporter } from "@/components/agent-reports-exporter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  Upload,
  Lightbulb,
  Search,
  Film,
  Globe,
  Code,
  Clipboard,
  Lock,
  Unlock,
  Wand2,
  Brain,
  Network,
  MessageSquare,
  Palette,
  TrendingUp,
  Map,
  Zap,
  Target,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Database,
  Eye,
  Shield,
  Users,
  Download,
} from "lucide-react";
// Dynamically import heavy components
const FileUpload = dynamic(() => import("@/components/file-upload"), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
});

// Define TaskType enum
enum TaskType {
  CREATIVE = 'CREATIVE',
  COMPLETION = 'COMPLETION',
  ADAPTIVE_REWRITING = 'ADAPTIVE_REWRITING',
  SCENE_GENERATOR = 'SCENE_GENERATOR',
  CHARACTER_VOICE = 'CHARACTER_VOICE',
  WORLD_BUILDER = 'WORLD_BUILDER',
  PLOT_PREDICTOR = 'PLOT_PREDICTOR',
  TENSION_OPTIMIZER = 'TENSION_OPTIMIZER',
  RHYTHM_MAPPING = 'RHYTHM_MAPPING',
  CHARACTER_NETWORK = 'CHARACTER_NETWORK',
  DIALOGUE_FORENSICS = 'DIALOGUE_FORENSICS',
  THEMATIC_MINING = 'THEMATIC_MINING',
  STYLE_FINGERPRINT = 'STYLE_FINGERPRINT',
  CONFLICT_DYNAMICS = 'CONFLICT_DYNAMICS',
}

// Keep only creative development tools
const CREATIVE_DEVELOPMENT_TASKS = {
  [TaskType.CREATIVE]: "إبداع محاكي",
  [TaskType.COMPLETION]: "إكمال النص",
  [TaskType.ADAPTIVE_REWRITING]: "إعادة الكتابة التكيفية",
  [TaskType.SCENE_GENERATOR]: "مولد المشاهد",
  [TaskType.CHARACTER_VOICE]: "صوت الشخصية",
  [TaskType.WORLD_BUILDER]: "بناء العالم",
  [TaskType.PLOT_PREDICTOR]: "متنبئ الحبكة",
  [TaskType.TENSION_OPTIMIZER]: "محسّن التوتر",
  [TaskType.RHYTHM_MAPPING]: "خريطة الإيقاع",
  [TaskType.CHARACTER_NETWORK]: "شبكة الشخصيات",
  [TaskType.DIALOGUE_FORENSICS]: "تشريح الحوار",
  [TaskType.THEMATIC_MINING]: "استخراج الثيمات",
  [TaskType.STYLE_FINGERPRINT]: "بصمة الأسلوب",
  [TaskType.CONFLICT_DYNAMICS]: "ديناميكيات الصراع",
};

const DramaAnalystApp: React.FC = () => {
  const [textInput, setTextInput] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [specialRequirements, setSpecialRequirements] = useState<string>("");
  const [additionalInfo, setAdditionalInfo] = useState<string>("");
  const [completionScope, setCompletionScope] = useState<string>("");
  const [selectedCompletionEnhancements, setSelectedCompletionEnhancements] =
    useState<TaskType[]>([]);

  const [analysisReport, setAnalysisReport] = useState<string>("");
  const [isAnalysisComplete, setIsAnalysisComplete] = useState<boolean>(false);
  const [taskResults, setTaskResults] = useState<Record<string, any>>({});
  const [showReportModal, setShowReportModal] = useState<string | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  // Advanced AI Systems Settings
  const [advancedSettings, setAdvancedSettings] = useState({
    enableRAG: true,
    enableSelfCritique: true,
    enableConstitutional: true,
    enableHallucination: true,
    enableUncertainty: false,
    enableDebate: false,
  });

  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleTaskSelect = useCallback((task: TaskType) => {
    setSelectedTask(task);
    setError(null);
    setAiResponse(null);
    if (!TASKS_REQUIRING_COMPLETION_SCOPE.includes(task)) {
      setCompletionScope("");
    }
    if (task !== TaskType.COMPLETION) {
      setSelectedCompletionEnhancements([]);
    }
  }, []);

  const handleToggleEnhancement = useCallback((enhancementId: TaskType) => {
    setSelectedCompletionEnhancements((prev) =>
      prev.includes(enhancementId)
        ? prev.filter((id) => id !== enhancementId)
        : [...prev, enhancementId]
    );
  }, []);

  useEffect(() => {
    // Check for Seven Stations analysis in localStorage first
    const sevenStationsData = localStorage.getItem("sevenStationsAnalysis");
    if (sevenStationsData) {
      try {
        const analysisData = JSON.parse(sevenStationsData);
        if (analysisData.finalReport && analysisData.originalText) {
          setAnalysisReport(analysisData.finalReport);
          setTextInput(analysisData.originalText);
          setIsAnalysisComplete(true);

          toast({
            title: "تم استيراد التقرير من نظام المحطات السبع",
            description: `مستوى الثقة: ${(analysisData.confidence * 100).toFixed(1)}%`,
          });

          // Clear the data after loading
          localStorage.removeItem("sevenStationsAnalysis");
          return;
        }
      } catch (e) {
        console.error("Error parsing Seven Stations analysis:", e);
      }
    }

    // Check for analysis results from session storage
    const storedAnalysis = sessionStorage.getItem("stationAnalysisResults");
    const storedId = sessionStorage.getItem("analysisId");

    if (storedAnalysis && storedId) {
      try {
        const analysisData = JSON.parse(storedAnalysis);
        if (analysisData.stationOutputs?.station7) {
          setAnalysisReport(
            JSON.stringify(analysisData.stationOutputs.station7, null, 2)
          );
          setAnalysisId(storedId);
          setIsAnalysisComplete(true);
          return;
        }
      } catch (e) {
        console.error("Error parsing stored analysis:", e);
      }
    }

    // Fallback: manual input validation
    if (analysisReport.trim().length > 100) {
      setIsAnalysisComplete(true);
    } else {
      setIsAnalysisComplete(false);
    }

    // Auto-load original text if available
    const storedText = sessionStorage.getItem("originalText");
    if (storedText && !textInput) {
      setTextInput(storedText);
    }
  }, [analysisReport, textInput, toast]);

  const clearAnalysisData = () => {
    sessionStorage.removeItem("stationAnalysisResults");
    sessionStorage.removeItem("analysisId");
    sessionStorage.removeItem("originalText");
    setAnalysisReport("");
    setAnalysisId(null);
    setIsAnalysisComplete(false);
    setTextInput("");
  };

  const handleSubmit = useCallback(async () => {
    if (!selectedTask || textInput.length < 100) {
      setError("يرجى اختيار مهمة وإدخال نص لا يقل عن 100 حرف");
      return;
    }

    if (
      TASKS_REQUIRING_COMPLETION_SCOPE.includes(selectedTask) &&
      !completionScope.trim()
    ) {
      setError(
        `لهذه المهمة (${TASK_LABELS[selectedTask] || selectedTask})، يرجى تحديد "نطاق الإكمال المطلوب"`
      );
      return;
    }

    setError(null);
    setAiResponse(null);
    setIsLoading(true);

    const agentId = Object.keys(agentIdToTaskTypeMap).find(
      (key) => agentIdToTaskTypeMap[key as AgentId] === selectedTask
    ) as AgentId;

    if (!agentId) {
      setError(`لا يمكن العثور على وكيل صالح للمهمة المحددة: ${selectedTask}`);
      setIsLoading(false);
      return;
    }

    const processedFile: ProcessedFile = {
      fileName: "input.txt",
      textContent: textInput,
      size: textInput.length,
      sizeBytes: textInput.length,
    };

    const request: AIRequest = {
      agent: agentId,
      prompt: specialRequirements,
      context: {
        files: [processedFile],
      },
      options: {
        additionalInfo,
        analysisReport: analysisReport,
        analysisId: analysisId,
        completionScope: TASKS_REQUIRING_COMPLETION_SCOPE.includes(selectedTask)
          ? completionScope
          : undefined,
        selectedCompletionEnhancements:
          selectedTask === TaskType.COMPLETION
            ? selectedCompletionEnhancements
            : undefined,
      },
    };

    try {
      // Pass advanced settings to executor
      const result = await submitTask(request);

      if (result && typeof result === "object" && "text" in result) {
        setAiResponse(result as AIResponse);
        toast({
          title: "تم التحليل بنجاح",
          description: "تم إكمال المهمة بنجاح",
        });
      } else {
        const errorMsg =
          typeof result === "string" ? result : "حدث خطأ غير متوقع";
        setError(errorMsg);
        toast({
          variant: "destructive",
          title: "خطأ في التحليل",
          description: errorMsg,
        });
      }
    } catch (e: any) {
      setError(e.message || "حدث خطأ غير متوقع أثناء الإرسال");
      toast({
        variant: "destructive",
        title: "خطأ في التحليل",
        description: e.message || "حدث خطأ غير متوقع",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    textInput,
    selectedTask,
    specialRequirements,
    additionalInfo,
    completionScope,
    selectedCompletionEnhancements,
    advancedSettings,
    analysisReport,
    analysisId,
    toast,
  ]);

  // Use utility functions for reduced complexity
  const getCreativeTaskIcon = (taskType: TaskType) => {
    const iconMap = {
      [TaskType.CREATIVE]: <Wand2 className="w-5 h-5" />,
      [TaskType.COMPLETION]: <Clipboard className="w-5 h-5" />,
      [TaskType.ADAPTIVE_REWRITING]: <Code className="w-5 h-5" />,
      [TaskType.SCENE_GENERATOR]: <Film className="w-5 h-5" />,
      [TaskType.CHARACTER_VOICE]: <MessageSquare className="w-5 h-5" />,
      [TaskType.WORLD_BUILDER]: <Globe className="w-5 h-5" />,
      [TaskType.PLOT_PREDICTOR]: <TrendingUp className="w-5 h-5" />,
      [TaskType.TENSION_OPTIMIZER]: <Zap className="w-5 h-5" />,
      [TaskType.RHYTHM_MAPPING]: <Map className="w-5 h-5" />,
      [TaskType.CHARACTER_NETWORK]: <Network className="w-5 h-5" />,
      [TaskType.DIALOGUE_FORENSICS]: <Search className="w-5 h-5" />,
      [TaskType.THEMATIC_MINING]: <Target className="w-5 h-5" />,
      [TaskType.STYLE_FINGERPRINT]: <Palette className="w-5 h-5" />,
      [TaskType.CONFLICT_DYNAMICS]: <Brain className="w-5 h-5" />,
    };
    return iconMap[taskType] || <Lightbulb className="w-5 h-5" />;
  };

  const getTaskIcon = (taskType: TaskType) => {
    return getCreativeTaskIcon(taskType);
  };

  const creativeTasks = Object.keys(CREATIVE_DEVELOPMENT_TASKS) as TaskType[];

  return (
    <div className="container mx-auto max-w-6xl p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            المحلل الدرامي والمبدع المحاكي
          </CardTitle>
          <CardDescription className="text-center">
            منصة ذكية لتحليل النصوص الدرامية وإنتاج محتوى إبداعي محاكي باستخدام
            الذكاء الاصطناعي
          </CardDescription>
        </CardHeader>
      </Card>

      {!isAnalysisComplete && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertTitle>قسم التطوير الإبداعي مقفل</AlertTitle>
          <AlertDescription>
            يجب إكمال تحليل المحطات السبع أولاً أو إدخال تقرير التحليل يدوياً
            لفتح أدوات التطوير الإبداعي
          </AlertDescription>
        </Alert>
      )}

      {isAnalysisComplete && analysisId && (
        <Alert>
          <Unlock className="h-4 w-4" />
          <AlertTitle>تم تحميل نتائج التحليل</AlertTitle>
          <AlertDescription>
            يمكنك الآن استخدام أدوات التطوير الإبداعي لتحليل النص الخاص بك
          </AlertDescription>
        </Alert>
      )}

      {isAnalysisComplete && analysisId && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            تم تحميل نتائج تحليل المحطات السبع تلقائياً (ID:{" "}
            {analysisId.slice(0, 8)}...)
          </span>
          <Button
            variant="link"
            size="sm"
            onClick={clearAnalysisData}
            className="p-0 h-auto ml-2"
          >
            مسح البيانات
          </Button>
        </div>
      )}

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>المدخلات المطلوبة</CardTitle>
          <CardDescription>
            السيناريو وتقرير التحليل من المحطات السبع
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            onFileContent={(content, _filename) => {
              setTextInput(content);
              toast({
                title: "تم تحميل الملف",
                description: "تم استيراد محتوى الملف بنجاح",
              });
            }}
          />
          <div>
            <Label htmlFor="screenplay">النص الدرامي</Label>
            <Textarea
              id="screenplay"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="min-h-32"
              placeholder="النص الدرامي المراد تطويره..."
              disabled={!!analysisId}
            />
            {analysisId && (
              <p className="text-sm text-muted-foreground mt-1">
                تم تحميل النص تلقائياً من جلسة التحليل السابقة
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="analysisReport">
              تقرير التحليل (المحطة السابعة)
              {analysisId && (
                <span className="text-green-600 text-sm ml-2">
                  ✓ محمل تلقائياً
                </span>
              )}
            </Label>
            <Textarea
              id="analysisReport"
              value={analysisReport}
              onChange={(e) => setAnalysisReport(e.target.value)}
              className="min-h-32"
              placeholder="تقرير التحليل من المحطات السبع... (سيتم تحميله تلقائياً بعد إكمال التحليل)"
              disabled={!!analysisId}
            />
            {analysisId && (
              <p className="text-sm text-muted-foreground mt-1">
                تم تحميل التقرير تلقائياً من نتائج تحليل المحطات السبع
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Creative Tools Selection */}
      {isAnalysisComplete && (
        <Card>
          <CardHeader>
            <CardTitle>أدوات التطوير الإبداعي</CardTitle>
            <CardDescription>اختر الأداة الإبداعية المطلوبة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {creativeTasks.map((task) => (
                <Button
                  key={task}
                  variant={selectedTask === task ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={() => handleTaskSelect(task)}
                >
                  {getCreativeTaskIcon(task)}
                  <span className="text-xs text-center">
                    {
                      CREATIVE_DEVELOPMENT_TASKS[
                        task as keyof typeof CREATIVE_DEVELOPMENT_TASKS
                      ]
                    }
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Development Requirements */}
      {isAnalysisComplete && (
        <Card>
          <CardHeader>
            <CardTitle>متطلبات التطوير</CardTitle>
            <CardDescription>حدد متطلبات التطوير الإبداعي</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="devRequirements">متطلبات خاصة</Label>
              <Textarea
                id="devRequirements"
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                placeholder="حدد متطلبات التطوير الإبداعي..."
              />
            </div>
            <div>
              <Label htmlFor="additionalInfo">معلومات إضافية</Label>
              <Textarea
                id="additionalInfo"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="أضف أي معلومات إضافية هنا..."
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* تحسينات الإكمال */}
      {selectedTask === TaskType.COMPLETION && (
        <Card>
          <CardHeader>
            <CardTitle>تحسينات الإكمال</CardTitle>
            <CardDescription>اختر التحسينات الإضافية للإكمال</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {COMPLETION_ENHANCEMENT_OPTIONS.map((enhancement) => (
                <div key={enhancement} className="flex items-center space-x-2">
                  <Checkbox
                    id={enhancement}
                    checked={selectedCompletionEnhancements.includes(
                      enhancement
                    )}
                    onCheckedChange={() => handleToggleEnhancement(enhancement)}
                  />
                  <Label htmlFor={enhancement} className="text-sm">
                    {TASK_LABELS[enhancement] || enhancement}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* نطاق الإكمال */}
      {selectedTask &&
        TASKS_REQUIRING_COMPLETION_SCOPE.includes(selectedTask) && (
          <Card>
            <CardHeader>
              <CardTitle>نطاق الإكمال المطلوب</CardTitle>
              <CardDescription>حدد مدى الإكمال المطلوب</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={completionScope}
                onChange={(e) => setCompletionScope(e.target.value)}
                placeholder="مثال: فصل واحد، 3 مشاهد، حتى نهاية المسرحية، حلقتان..."
              />
            </CardContent>
          </Card>
        )}

      {/* الإعدادات المتقدمة */}
      {isAnalysisComplete && selectedTask && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              الإعدادات المتقدمة لأنظمة الذكاء الاصطناعي
            </CardTitle>
            <CardDescription>
              تفعيل/تعطيل الأنظمة المتقدمة (RAG، النقد الذاتي، الذكاء الدستوري،
              كشف الهلوسات)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 space-x-reverse p-3 rounded-lg border bg-card">
                <Checkbox
                  id="enableRAG"
                  checked={advancedSettings.enableRAG}
                  onCheckedChange={(checked) =>
                    setAdvancedSettings({
                      ...advancedSettings,
                      enableRAG: checked as boolean,
                    })
                  }
                />
                <div className="space-y-1 flex-1">
                  <Label
                    htmlFor="enableRAG"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                  >
                    <Database className="w-4 h-4 text-blue-500" />
                    RAG (الاسترجاع المعزز)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    يسترجع سياق ذي صلة من النص الأصلي والتحليل لضمان الدقة
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 space-x-reverse p-3 rounded-lg border bg-card">
                <Checkbox
                  id="enableSelfCritique"
                  checked={advancedSettings.enableSelfCritique}
                  onCheckedChange={(checked) =>
                    setAdvancedSettings({
                      ...advancedSettings,
                      enableSelfCritique: checked as boolean,
                    })
                  }
                />
                <div className="space-y-1 flex-1">
                  <Label
                    htmlFor="enableSelfCritique"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                  >
                    <Brain className="w-4 h-4 text-purple-500" />
                    النقد الذاتي
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    مراجعة وتحسين المخرجات تلقائياً قبل العرض النهائي
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 space-x-reverse p-3 rounded-lg border bg-card">
                <Checkbox
                  id="enableConstitutional"
                  checked={advancedSettings.enableConstitutional}
                  onCheckedChange={(checked) =>
                    setAdvancedSettings({
                      ...advancedSettings,
                      enableConstitutional: checked as boolean,
                    })
                  }
                />
                <div className="space-y-1 flex-1">
                  <Label
                    htmlFor="enableConstitutional"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4 text-green-500" />
                    الذكاء الدستوري
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    التأكد من الالتزام بقواعد الأمانة والتماسك السردي
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 space-x-reverse p-3 rounded-lg border bg-card">
                <Checkbox
                  id="enableHallucination"
                  checked={advancedSettings.enableHallucination}
                  onCheckedChange={(checked) =>
                    setAdvancedSettings({
                      ...advancedSettings,
                      enableHallucination: checked as boolean,
                    })
                  }
                />
                <div className="space-y-1 flex-1">
                  <Label
                    htmlFor="enableHallucination"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    كشف الهلوسات
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    اكتشاف وتصحيح المحتوى غير المستند للنص الأصلي
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 space-x-reverse p-3 rounded-lg border bg-card">
                <Checkbox
                  id="enableUncertainty"
                  checked={advancedSettings.enableUncertainty}
                  onCheckedChange={(checked) =>
                    setAdvancedSettings({
                      ...advancedSettings,
                      enableUncertainty: checked as boolean,
                    })
                  }
                />
                <div className="space-y-1 flex-1">
                  <Label
                    htmlFor="enableUncertainty"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-cyan-500" />
                    قياس عدم اليقين
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    قياس مستوى الثقة في المخرجات (قد يبطئ الأداء)
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 space-x-reverse p-3 rounded-lg border bg-card">
                <Checkbox
                  id="enableDebate"
                  checked={advancedSettings.enableDebate}
                  onCheckedChange={(checked: boolean) =>
                    setAdvancedSettings({
                      ...advancedSettings,
                      enableDebate: checked,
                    })
                  }
                />
                <div className="space-y-1 flex-1">
                  <Label
                    htmlFor="enableDebate"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                  >
                    <Users className="w-4 h-4 text-indigo-500" />
                    النقاش متعدد الوكلاء
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    نقاش بين وكلاء متعددة للتوصل لأفضل حل (بطيء جداً)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* متطلبات خاصة */}
      <Card>
        <CardHeader>
          <CardTitle>متطلبات خاصة (اختياري)</CardTitle>
          <CardDescription>أضف أي متطلبات أو توجيهات خاصة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="specialRequirements">متطلبات خاصة</Label>
            <Textarea
              id="specialRequirements"
              value={specialRequirements}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setSpecialRequirements(e.target.value)
              }
              placeholder="أضف أي متطلبات خاصة هنا..."
            />
          </div>
          <div>
            <Label htmlFor="additionalInfo">معلومات إضافية</Label>
            <Textarea
              id="additionalInfo"
              value={additionalInfo}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setAdditionalInfo(e.target.value)
              }
              placeholder="أضف أي معلومات إضافية هنا..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      {isAnalysisComplete && (
        <div className="text-center">
          <Button
            onClick={handleSubmit}
            disabled={
              isLoading || !selectedTask || !textInput || !analysisReport
            }
            size="lg"
            className="px-8"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                جاري التطوير...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                بدء التطوير الإبداعي
              </>
            )}
          </Button>
        </div>
      )}

      {/* رسائل الخطأ */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* النتائج */}
      {aiResponse && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>نتائج التحليل</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReportModal(selectedTask || "result")}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  عرض التقرير الكامل
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const blob = new Blob([toText(aiResponse.raw)], {
                      type: "text/plain;charset=utf-8",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${selectedTask || "result"}_report.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  تصدير التقرير
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>التحليل الدرامي</AlertTitle>
              <AlertDescription className="prose prose-sm dark:prose-invert mt-2 whitespace-pre-wrap">
                {toText(aiResponse.raw).substring(0, 500)}...
                <div className="mt-2 text-muted-foreground text-xs">
                  عرض أول 500 حرف فقط. اضغط "عرض التقرير الكامل" لمشاهدة التقرير
                  بالكامل
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Modal عرض التقرير */}
      {showReportModal && aiResponse && (
        <AgentReportViewer
          report={{
            agentName:
              CREATIVE_DEVELOPMENT_TASKS[
                selectedTask as keyof typeof CREATIVE_DEVELOPMENT_TASKS
              ] || "التقرير",
            agentId: selectedTask || "unknown",
            text: toText(aiResponse.raw),
            confidence: 1.0,
            timestamp: new Date().toISOString(),
          }}
        />
      )}

      {/* زر تصدير التقرير النهائي الشامل */}
      {Object.keys(taskResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>التقارير المجمعة</CardTitle>
            <CardDescription>
              تم إنجاز {Object.keys(taskResults).length} مهمة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AgentReportsExporter
              reports={taskResults}
              originalText={textInput}
              onExport={(format: string) => {
                toast({
                  title: "تم التصدير",
                  description: `تم تصدير التقرير النهائي بنجاح`,
                });
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DramaAnalystApp;