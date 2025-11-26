"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Play,
  FileText,
  AlertTriangle,
  CheckCircle2,
  BrainCircuit,
  Gavel,
  Activity,
  GitMerge,
  Scale,
  MessageSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const FileUpload = dynamic(() => import("@/components/file-upload"), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
  ssr: false,
});

// --- Types Definitions ---

interface CrossStationAlert {
  sourceStation: string;
  targetStation: string;
  issue: string;
  severity: "low" | "medium" | "high";
}

interface StationMetric {
  label: string;
  value: number; // 0-100
  trend: "up" | "down" | "stable";
}

interface DebateSession {
  isOpen: boolean;
  topic: string;
  history: { speaker: "user" | "ai"; text: string }[];
}

interface StationResult {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  status: "idle" | "analyzing" | "completed" | "error";
  confidence: number;
  findings: string[];
  metrics?: StationMetric[];
  alerts?: CrossStationAlert[];
}

// --- Main Component ---

export default function SevenStationsInterface() {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeStationId, setActiveStationId] = useState<string | null>(null);
  const [debateSession, setDebateSession] = useState<DebateSession>({
    isOpen: false,
    topic: "",
    history: [],
  });
  const { toast } = useToast();

  // Initial State of Stations
  const [stations, setStations] = useState<StationResult[]>([
    {
      id: "S0",
      name: "المحطة صفر: المشرحة",
      icon: Activity,
      description: "فحص النبرة، الغلاف الجوي، والحمض النووي للنص.",
      status: "idle",
      confidence: 0,
      findings: [],
    },
    {
      id: "S1",
      name: "البناء الهيكلي",
      icon: BrainCircuit,
      description: "تحليل العظام: الحبكة، نقاط التحول، والإيقاع.",
      status: "idle",
      confidence: 0,
      findings: [],
    },
    {
      id: "S2",
      name: "شبكة الصراعات",
      icon: GitMerge,
      description: "خرائط العلاقات وتشابك المصالح.",
      status: "idle",
      confidence: 0,
      findings: [],
    },
    {
      id: "S3",
      name: "الأبعاد النفسية",
      icon: Scale,
      description: "دوافع الشخصيات والتحيزات المعرفية.",
      status: "idle",
      confidence: 0,
      findings: [],
    },
    {
      id: "S4",
      name: "الرمزية والديناميكية",
      icon: Activity,
      description: "ما وراء النص (Subtext) والرسائل المبطنة.",
      status: "idle",
      confidence: 0,
      findings: [],
    },
    {
      id: "S5",
      name: "محامي الشيطان",
      icon: Gavel,
      description: "هجوم نقدي شرس لاكتشاف الثغرات.",
      status: "idle",
      confidence: 0,
      findings: [],
    },
    {
      id: "S6",
      name: "الحكم النهائي",
      icon: CheckCircle2,
      description: "تجميع الأدلة وإصدار تقرير الصلاحية.",
      status: "idle",
      confidence: 0,
      findings: [],
    },
  ]);

  // --- Logic ---

  const runSimulation = async () => {
    if (!text.trim()) {
      toast({
        title: "النص مفقود",
        description: "لا يمكن استجواب الفراغ. أطعم النظام نصاً أولاً.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Reset stations
    setStations(s => s.map(st => ({ ...st, status: "idle", findings: [], confidence: 0 })));

    // Simulate Analysis Pipeline (This would be your actual API call logic)
    // Here we utilize a waterfall effect for the UI
    for (let i = 0; i < stations.length; i++) {
      setStations((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, status: "analyzing" } : s))
      );
      
      // Mock API Latency
      await new Promise((r) => setTimeout(r, 1500));
      
      // Mock Results (Replace this with actual API response parsing)
      setStations((prev) =>
        prev.map((s, idx) => {
          if (idx === i) {
            return {
              ...s,
              status: "completed",
              confidence: 0.7 + Math.random() * 0.3,
              findings: generateMockFindings(s.id),
              metrics: generateMockMetrics(s.id),
              alerts: idx > 1 ? generateMockAlerts(s.id) : [],
            };
          }
          return s;
        })
      );
    }

    setIsAnalyzing(false);
    toast({
      title: "اكتمل التحقيق",
      description: "تم إنشاء تقرير التشريح السردي بنجاح.",
    });
  };

  // --- Mock Data Generators (To demonstrate functionality) ---
  const generateMockFindings = (id: string) => {
    const findings = [
      "التوتر في المشهد الافتتاحي يعتمد على الصدفة أكثر من السببية.",
      "حوار الشخصية (س) يحمل دلالات لا تتناسب مع خلفيتها الاجتماعية.",
      "هناك فجوة زمنية غير مبررة بين الفصل الثاني والثالث.",
      "استخدام الرمزية (المرآة المكسورة) مستهلك وكليشيه.",
    ];
    return findings.slice(0, Math.floor(Math.random() * 3) + 1);
  };

  const generateMockMetrics = (id: string): StationMetric[] => {
    return [
      { label: "كثافة الصراع", value: Math.random() * 100, trend: "up" },
      { label: "غموض الدوافع", value: Math.random() * 100, trend: "down" },
      { label: "الإيقاع", value: Math.random() * 100, trend: "stable" },
    ];
  };

  const generateMockAlerts = (id: string): CrossStationAlert[] => {
    if (Math.random() > 0.7) return [];
    return [
      {
        sourceStation: id,
        targetStation: "S1",
        issue: "تناقض في الدافع الرئيسي مع البناء الهيكلي",
        severity: "high",
      },
    ];
  };

  // --- Interaction Handlers ---

  const handleDebateOpen = (finding: string) => {
    setDebateSession({
      isOpen: true,
      topic: finding,
      history: [
        { speaker: "ai", text: `لقد حددت النقطة التالية كنقطة ضعف: "${finding}". لماذا تعتقد أنني مخطئ؟` },
      ],
    });
  };

  const handleDebateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock AI Response logic
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem("argument") as HTMLInputElement;
    const userArg = input.value;
    
    if (!userArg.trim()) return;

    const newHistory = [
      ...debateSession.history,
      { speaker: "user", text: userArg } as const,
      { speaker: "ai", text: "وجهة نظر مثيرة للاهتمام. سأقوم بتحديث معامل الثقة بناءً على هذا التبرير الدرامي." } as const,
    ];

    setDebateSession({ ...debateSession, history: newHistory });
    input.value = "";
  };

  // --- UI Components ---

  return (
    <div className="container mx-auto p-4 min-h-screen bg-background" dir="rtl">
      {/* Header Section */}
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          غرفة التشريح السردي
        </h1>
        <p className="text-muted-foreground text-lg">
          نظام المحطات السبع للتحليل الدرامي المتقدم
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input & Controls */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                الأدلة المادية (النص)
              </CardTitle>
              <CardDescription>ارفع السيناريو أو الصقه هنا لبدء التحقيق.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload
                onFileContent={(c, n) => setText(c)}
                accept=".pdf,.docx,.txt"
              />
              <div className="relative">
                <Textarea
                  placeholder="أو اكتب المشهد هنا..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[300px] font-mono text-sm resize-none bg-muted/30 focus:bg-background transition-colors"
                />
                <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/80 px-2 rounded">
                  {text.length} حرف
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={runSimulation}
                disabled={isAnalyzing || !text}
                className="w-full text-lg font-bold py-6 shadow-md hover:shadow-xl transition-all"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    جاري الاستجواب...
                  </>
                ) : (
                  <>
                    <Play className="ml-2 h-5 w-5" />
                    بدء التحليل
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Overall Health / Stats (Mock) */}
          {stations.some(s => s.status === "completed") && (
            <Card>
              <CardHeader>
                <CardTitle>مؤشرات حيوية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>التماسك المنطقي</span>
                    <span className="font-bold">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>الأصالة الإبداعية</span>
                    <span className="font-bold">92%</span>
                  </div>
                  <Progress value={92} className="h-2 bg-purple-100" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Stations Visualization */}
        <div className="lg:col-span-8 space-y-4">
          <ScrollArea className="h-[calc(100vh-200px)] pr-4">
            <div className="space-y-4">
              {stations.map((station, index) => (
                <StationCard
                  key={station.id}
                  station={station}
                  isActive={isAnalyzing && station.status === "analyzing"}
                  onDebate={handleDebateOpen}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Debate Dialog (Modal) */}
      <Dialog open={debateSession.isOpen} onOpenChange={(open) => setDebateSession(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Gavel className="h-5 w-5" />
              اعتراض على الحكم
            </DialogTitle>
            <DialogDescription>
              أنت تناظر "المدعي الناقد" حول النقطة: <br/>
              <span className="font-bold text-foreground">"{debateSession.topic}"</span>
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[300px] border rounded-md p-4 bg-muted/20">
            <div className="space-y-4">
              {debateSession.history.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex w-full",
                    msg.speaker === "user" ? "justify-start" : "justify-end"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg p-3 text-sm",
                      msg.speaker === "user"
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted text-foreground rounded-bl-none"
                    )}
                  >
                    <p className="font-bold text-xs mb-1 opacity-70">
                      {msg.speaker === "user" ? "أنت (الدفاع)" : "الذكاء الاصطناعي (الادعاء)"}
                    </p>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <form onSubmit={handleDebateSubmit} className="flex gap-2 mt-4">
            <Textarea
              name="argument"
              placeholder="اكتب مرافعتك هنا..."
              className="flex-1 min-h-[80px]"
            />
            <Button type="submit" className="h-auto px-6">
              إرسال <MessageSquare className="mr-2 h-4 w-4" />
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Sub-Components ---

function StationCard({
  station,
  isActive,
  onDebate
}: {
  station: StationResult;
  isActive: boolean;
  onDebate: (finding: string) => void;
}) {
  const StatusIcon = () => {
    if (station.status === "analyzing") return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
    if (station.status === "completed") return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (station.status === "error") return <AlertTriangle className="h-5 w-5 text-destructive" />;
    return <station.icon className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <Card className={cn(
      "transition-all duration-300 border-l-4",
      isActive ? "border-l-primary shadow-lg scale-[1.01]" : "border-l-transparent",
      station.status === "completed" ? "border-l-green-500/50" : ""
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-full bg-muted",
              isActive && "bg-primary/10 text-primary"
            )}>
              <StatusIcon />
            </div>
            <div>
              <CardTitle className="text-lg">{station.name}</CardTitle>
              <CardDescription>{station.description}</CardDescription>
            </div>
          </div>
          {station.status === "completed" && (
            <Badge variant={station.confidence > 0.8 ? "default" : "secondary"}>
              ثقة: {Math.round(station.confidence * 100)}%
            </Badge>
          )}
        </div>
      </CardHeader>
      
      {station.status === "completed" && (
        <CardContent className="pt-2 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
          {/* Metrics Grid */}
          {station.metrics && station.metrics.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {station.metrics.map((m, i) => (
                <div key={i} className="bg-muted/30 p-2 rounded text-center">
                  <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
                  <div className="text-lg font-bold text-primary">{Math.round(m.value)}</div>
                </div>
              ))}
            </div>
          )}

          {/* Findings List */}
          <div className="space-y-2">
            {station.findings.map((finding, idx) => (
              <div key={idx} className="flex items-start gap-2 group p-2 rounded hover:bg-muted/50 transition-colors">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                <p className="text-sm flex-1">{finding}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 h-6 text-xs text-muted-foreground hover:text-destructive transition-opacity"
                  onClick={() => onDebate(finding)}
                >
                  اعترض!
                </Button>
              </div>
            ))}
          </div>

          {/* Cross-Station Alerts */}
          {station.alerts && station.alerts.length > 0 && (
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
              <h4 className="text-xs font-bold text-amber-600 mb-2 flex items-center gap-1">
                <GitMerge className="h-3 w-3" /> تعارض مع محطات أخرى
              </h4>
              {station.alerts.map((alert, i) => (
                <div key={i} className="text-xs text-amber-800/80">
                  • يتعارض مع <strong>{alert.targetStation}</strong>: {alert.issue}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}