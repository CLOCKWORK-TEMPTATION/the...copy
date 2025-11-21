"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Play,
  FileText,
  ChevronDown,
  ChevronUp,
  Download,
  Upload,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";

const FileUpload = dynamic(() => import("@/components/file-upload"), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
  ssr: false,
});

interface StationResult {
  id: string;
  name: string;
  summary: string;
  confidence: number;
  status: "pending" | "running" | "completed" | "error";
}

interface AnalysisResult {
  success: boolean;
  report: string;
  confidence: number;
  executionTime: number;
  stationsCount: number;
}

export default function SevenStationsInterface() {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedStations, setExpandedStations] = useState<Set<string>>(
    new Set()
  );
  const { toast } = useToast();

  const stations = [
    {
      id: "S1",
      name: "المحطة الأولى: التحليل التأسيسي",
      description: "تحليل البنية الأساسية للنص",
    },
    {
      id: "S2",
      name: "المحطة الثانية: التحليل المفاهيمي",
      description: "استخراج الثيمات والمفاهيم",
    },
    {
      id: "S3",
      name: "المحطة الثالثة: شبكة الصراعات",
      description: "تحليل العلاقات والصراعات",
    },
    {
      id: "S4",
      name: "المحطة الرابعة: مقاييس الفعالية",
      description: "قياس فعالية النص الدرامي",
    },
    {
      id: "S5",
      name: "المحطة الخامسة: الديناميكية والرمزية",
      description: "تحليل الرموز والديناميكية",
    },
    {
      id: "S6",
      name: "المحطة السادسة: الفريق الأحمر",
      description: "التحليل النقدي متعدد الوكلاء",
    },
    {
      id: "S7",
      name: "المحطة السابعة: التقرير النهائي",
      description: "إنشاء التقرير الشامل",
    },
  ];

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError("يرجى إدخال نص للتحليل");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analysis/seven-stations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || "حدث خطأ أثناء التحليل");
      }
    } catch (err) {
      setError("فشل في الاتصال بالخادم");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleStation = (stationId: string) => {
    const newExpanded = new Set(expandedStations);
    if (newExpanded.has(stationId)) {
      newExpanded.delete(stationId);
    } else {
      newExpanded.add(stationId);
    }
    setExpandedStations(newExpanded);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-500";
    if (confidence >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const handleExport = (format: "txt" | "pdf" | "docx") => {
    if (!result) {
      toast({
        title: "لا يوجد تقرير للتصدير",
        description: "يرجى تشغيل التحليل أولاً",
        variant: "destructive",
      });
      return;
    }

    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === "txt") {
        content = `تقرير التحليل - المحطات السبع
===========================================

النص المدخل:
${text}

===========================================
نتائج التحليل
===========================================

${result.report}

===========================================
معلومات التحليل
===========================================
مستوى الثقة: ${(result.confidence * 100).toFixed(1)}%
عدد المحطات: ${result.stationsCount}
وقت التنفيذ: ${(result.executionTime / 1000).toFixed(1)} ثانية

===========================================
تاريخ التقرير: ${new Date().toLocaleString("ar-SA")}
`;
        filename = `seven-stations-analysis-${Date.now()}.txt`;
        mimeType = "text/plain;charset=utf-8";
      } else if (format === "pdf" || format === "docx") {
        toast({
          title: "قريباً",
          description: `تصدير ${format.toUpperCase()} سيكون متاحاً قريباً`,
        });
        return;
      } else {
        return;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "تم التصدير بنجاح",
        description: `تم تصدير التقرير بصيغة ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "فشل التصدير",
        description:
          error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    }
  };

  const handleSendToDevelopment = () => {
    if (!result) {
      toast({
        title: "لا يوجد تقرير",
        description: "يرجى تشغيل التحليل أولاً",
        variant: "destructive",
      });
      return;
    }

    // Store the report in localStorage for the Development page
    const analysisData = {
      originalText: text,
      finalReport: result.report,
      confidence: result.confidence,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem("sevenStationsAnalysis", JSON.stringify(analysisData));

    toast({
      title: "تم نقل التقرير",
      description: "جاري التحويل إلى صفحة التطوير...",
    });

    // Navigate to development page
    window.location.href = "/development?fromAnalysis=true";
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl" dir="rtl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">
            نظام المحطات السبع للتحليل الدرامي
          </h1>
          <p className="text-muted-foreground">
            تحليل شامل للنصوص الدرامية عبر سبع محطات متخصصة
          </p>
        </div>

        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              إدخال النص
            </CardTitle>
            <CardDescription>
              أدخل النص الدرامي المراد تحليله (سيناريو، مسرحية، أو نص درامي)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="mb-4">
              <FileUpload
                onFileContent={(content, filename) => {
                  setText(content);
                  toast({
                    title: "تم تحميل الملف",
                    description: `تم تحميل ${filename} بنجاح`,
                  });
                }}
                accept=".pdf,.docx,.txt"
                maxSize={10}
              />
            </div>
            <Textarea
              placeholder="أدخل النص الدرامي هنا أو قم برفع ملف (PDF, DOCX, TXT)..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[200px] text-right"
              dir="rtl"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                عدد الأحرف: {text.length}
              </span>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !text.trim()}
                className="flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isAnalyzing ? "جاري التحليل..." : "بدء التحليل"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stations Overview */}
        <Card>
          <CardHeader>
            <CardTitle>المحطات السبع</CardTitle>
            <CardDescription>
              نظرة عامة على محطات التحليل المختلفة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {stations.map((station, index) => (
                <div
                  key={station.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{station.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {station.description}
                    </p>
                  </div>
                  <Badge variant={isAnalyzing ? "secondary" : "outline"}>
                    {isAnalyzing ? "قيد التنفيذ" : "في الانتظار"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-red-800">
                <strong>خطأ:</strong> {error}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Display */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>نتائج التحليل</span>
                <div className="flex items-center gap-2">
                  <Badge className={getConfidenceColor(result.confidence)}>
                    الثقة: {(result.confidence * 100).toFixed(1)}%
                  </Badge>
                  <Badge variant="outline">
                    الوقت: {(result.executionTime / 1000).toFixed(1)}ث
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Export and Integration Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => handleExport("txt")}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    تصدير TXT
                  </Button>
                  <Button
                    onClick={() => handleExport("pdf")}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    تصدير PDF
                  </Button>
                  <Button
                    onClick={() => handleExport("docx")}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    تصدير DOCX
                  </Button>
                  <Button
                    onClick={handleSendToDevelopment}
                    className="flex items-center gap-2 mr-auto"
                  >
                    <Play className="h-4 w-4" />
                    نقل إلى صفحة التطوير
                  </Button>
                </div>

                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span>عرض التقرير الكامل</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <pre
                        className="whitespace-pre-wrap text-sm font-mono text-right"
                        dir="rtl"
                      >
                        {result.report}
                      </pre>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
