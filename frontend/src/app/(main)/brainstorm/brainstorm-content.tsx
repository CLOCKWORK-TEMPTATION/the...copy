"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  FileText,
  Users,
  Brain,
  Sparkles,
  Settings,
  BookOpen,
  Target,
  Trophy,
  MessageSquare,
  Zap,
  Shield,
  Cpu,
  Layers,
  Rocket,
  Globe,
  Film,
  BarChart,
  Lightbulb,
  Compass,
  Fingerprint,
  PenTool,
  Music,
  Search,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import FileUpload from "@/components/file-upload";

// استيراد الوكلاء الحقيقيين
import {
  getAllAgents,
  getAgentsForPhase,
  getAgentStats,
  getCollaborators,
  BRAINSTORM_PHASES,
  type BrainstormAgentDefinition,
  type BrainstormPhase,
  type AgentIcon,
  type AgentCategory,
} from "@/lib/drama-analyst/services/brainstormAgentRegistry";
import { multiAgentDebate } from "@/lib/drama-analyst/orchestration/multiAgentDebate";

// ============================================
// ===== أنواع الواجهة =====
// ============================================

interface AgentState {
  id: string;
  status: "idle" | "working" | "completed" | "error";
  lastMessage?: string;
  progress?: number;
}

interface Session {
  id: string;
  brief: string;
  phase: BrainstormPhase;
  status: "active" | "completed" | "paused" | "error";
  startTime: Date;
  activeAgents: string[];
  results?: Record<string, unknown>;
}

interface DebateMessage {
  agentId: string;
  agentName: string;
  message: string;
  timestamp: Date;
  type: "proposal" | "critique" | "agreement" | "decision";
}

// ============================================
// ===== مكون الأيقونة الديناميكي =====
// ============================================

function AgentIconComponent({ icon, className = "w-5 h-5" }: { icon: AgentIcon; className?: string }) {
  const iconMap: Record<AgentIcon, React.ReactNode> = {
    brain: <Brain className={className} />,
    users: <Users className={className} />,
    "message-square": <MessageSquare className={className} />,
    "book-open": <BookOpen className={className} />,
    target: <Target className={className} />,
    shield: <Shield className={className} />,
    zap: <Zap className={className} />,
    cpu: <Cpu className={className} />,
    layers: <Layers className={className} />,
    rocket: <Rocket className={className} />,
    "file-text": <FileText className={className} />,
    sparkles: <Sparkles className={className} />,
    trophy: <Trophy className={className} />,
    globe: <Globe className={className} />,
    film: <Film className={className} />,
    "chart-bar": <BarChart className={className} />,
    lightbulb: <Lightbulb className={className} />,
    compass: <Compass className={className} />,
    fingerprint: <Fingerprint className={className} />,
    "pen-tool": <PenTool className={className} />,
    music: <Music className={className} />,
    search: <Search className={className} />,
  };

  return iconMap[icon] || <Cpu className={className} />;
}

// ============================================
// ===== مكون بطاقة الوكيل =====
// ============================================

function AgentCard({
  agent,
  state,
  isExpanded,
  onToggleExpand,
}: {
  agent: BrainstormAgentDefinition;
  state: AgentState;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const getStatusColor = (status: AgentState["status"]) => {
    switch (status) {
      case "working":
        return "bg-blue-400 animate-pulse";
      case "completed":
        return "bg-green-400";
      case "error":
        return "bg-red-400";
      default:
        return "bg-gray-400";
    }
  };

  const getCategoryColor = (category: AgentCategory) => {
    switch (category) {
      case "core":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "analysis":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "creative":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "predictive":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    }
  };

  const categoryNames: Record<AgentCategory, string> = {
    core: "أساسي",
    analysis: "تحليل",
    creative: "إبداع",
    predictive: "تنبؤ",
    advanced: "متقدم",
  };

  const collaborators = getCollaborators(agent.id);

  return (
    <div
      className={`p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors border ${
        state.status === "working" ? "border-blue-400" : "border-transparent"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="text-blue-500">
          <AgentIconComponent icon={agent.icon} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">{agent.nameAr}</p>
            <Badge variant="secondary" className={`text-xs ${getCategoryColor(agent.category)}`}>
              {categoryNames[agent.category]}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate">{agent.role}</p>
          {state.lastMessage && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {state.lastMessage}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(state.status)}`} />
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onToggleExpand}>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-muted space-y-2">
          <p className="text-xs text-muted-foreground">{agent.description}</p>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {agent.capabilities.canAnalyze && (
              <Badge variant="outline" className="text-xs">تحليل</Badge>
            )}
            {agent.capabilities.canGenerate && (
              <Badge variant="outline" className="text-xs">توليد</Badge>
            )}
            {agent.capabilities.canPredict && (
              <Badge variant="outline" className="text-xs">تنبؤ</Badge>
            )}
            {agent.capabilities.hasMemory && (
              <Badge variant="outline" className="text-xs">ذاكرة</Badge>
            )}
            {agent.capabilities.supportsRAG && (
              <Badge variant="outline" className="text-xs">RAG</Badge>
            )}
          </div>

          {collaborators.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium text-muted-foreground">يتعاون مع:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {collaborators.slice(0, 3).map((c) => (
                  <Badge key={c.id} variant="secondary" className="text-xs">
                    {c.nameAr}
                  </Badge>
                ))}
                {collaborators.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{collaborators.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>التعقيد: {(agent.complexityScore * 100).toFixed(0)}%</span>
            <span>الاسم: {agent.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// ===== المكون الرئيسي =====
// ============================================

export default function BrainstormContent() {
  // الوكلاء الحقيقيون
  const realAgents = useMemo(() => getAllAgents(), []);
  const agentStats = useMemo(() => getAgentStats(), []);

  // الحالة
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [agentStates, setAgentStates] = useState<Map<string, AgentState>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePhase, setActivePhase] = useState<BrainstormPhase>(1);
  const [brief, setBrief] = useState("");
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());
  const [debateMessages, setDebateMessages] = useState<DebateMessage[]>([]);
  const [showAllAgents, setShowAllAgents] = useState(false);

  // الوكلاء المرتبطين بالمرحلة الحالية
  const phaseAgents = useMemo(() => getAgentsForPhase(activePhase), [activePhase]);
  const displayedAgents = showAllAgents ? realAgents : phaseAgents;

  // تهيئة حالات الوكلاء
  useEffect(() => {
    const initialStates = new Map<string, AgentState>();
    realAgents.forEach((agent) => {
      initialStates.set(agent.id, {
        id: agent.id,
        status: "idle",
      });
    });
    setAgentStates(initialStates);
  }, [realAgents]);

  // تبديل توسيع الوكيل
  const toggleAgentExpand = useCallback((agentId: string) => {
    setExpandedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(agentId)) {
        next.delete(agentId);
      } else {
        next.add(agentId);
      }
      return next;
    });
  }, []);

  // تحديث حالة وكيل
  const updateAgentState = useCallback((agentId: string, updates: Partial<AgentState>) => {
    setAgentStates((prev) => {
      const next = new Map(prev);
      const current = next.get(agentId);
      if (current) {
        next.set(agentId, { ...current, ...updates });
      }
      return next;
    });
  }, []);

  // بدء جلسة جديدة
  const handleStartSession = async () => {
    if (!brief.trim()) {
      setError("يرجى إدخال ملخص الفكرة الإبداعية");
      return;
    }

    setIsLoading(true);
    setError(null);
    setDebateMessages([]);

    try {
      // إنشاء الجلسة
      const newSession: Session = {
        id: `session-${Date.now()}`,
        brief,
        phase: 1,
        status: "active",
        startTime: new Date(),
        activeAgents: phaseAgents.map((a) => a.id),
      };

      setCurrentSession(newSession);
      setActivePhase(1);
      setBrief("");

      // تفعيل الوكلاء المرتبطين بالمرحلة الأولى
      const phase1Agents = getAgentsForPhase(1);
      phase1Agents.forEach((agent) => {
        updateAgentState(agent.id, { status: "working" });
      });

      // محاكاة عمل الوكلاء (في الإنتاج: استخدام multiAgentDebate)
      await simulateAgentWork(phase1Agents, newSession);

    } catch (err) {
      setError("فشل في إنشاء الجلسة");
      console.error("[Brainstorm] Session creation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // محاكاة عمل الوكلاء
  const simulateAgentWork = async (agents: readonly BrainstormAgentDefinition[], session: Session) => {
    // المرحلة 1: تحليل أولي
    for (const agent of agents) {
      updateAgentState(agent.id, {
        status: "working",
        lastMessage: `جاري تحليل: "${session.brief.substring(0, 30)}..."`,
      });

      // تأخير محاكاة
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));

      updateAgentState(agent.id, {
        status: "completed",
        lastMessage: `تم التحليل بنجاح ✓`,
      });

      // إضافة رسالة للنقاش
      setDebateMessages((prev) => [
        ...prev,
        {
          agentId: agent.id,
          agentName: agent.nameAr,
          message: `أكملت تحليلي الأولي للفكرة. النتائج تشير إلى...`,
          timestamp: new Date(),
          type: "proposal",
        },
      ]);
    }

    // الانتقال للمرحلة التالية تلقائياً
    setTimeout(() => {
      setActivePhase(2);
      setCurrentSession((prev) => prev ? { ...prev, phase: 2 } : null);
    }, 2000);
  };

  // إيقاف الجلسة
  const handleStopSession = () => {
    setCurrentSession(null);
    setActivePhase(1);
    setDebateMessages([]);
    
    // إعادة تعيين حالات جميع الوكلاء
    realAgents.forEach((agent) => {
      updateAgentState(agent.id, { status: "idle" });
    });
  };

  // تقدم المرحلة
  const handleAdvancePhase = async () => {
    if (!currentSession) return;
    
    const nextPhase = Math.min(activePhase + 1, 5) as BrainstormPhase;
    setActivePhase(nextPhase);
    setCurrentSession((prev) => prev ? { ...prev, phase: nextPhase } : null);

    // تفعيل وكلاء المرحلة الجديدة
    const nextPhaseAgents = getAgentsForPhase(nextPhase);
    nextPhaseAgents.forEach((agent) => {
      updateAgentState(agent.id, { status: "working" });
    });

    // محاكاة العمل
    if (nextPhase === 4) {
      // مرحلة النقاش
      await simulateDebate(nextPhaseAgents);
    } else {
      await simulateAgentWork(nextPhaseAgents, currentSession);
    }
  };

  // محاكاة النقاش
  const simulateDebate = async (agents: readonly BrainstormAgentDefinition[]) => {
    const debateTypes: DebateMessage["type"][] = ["proposal", "critique", "agreement", "decision"];
    
    for (let round = 0; round < 2; round++) {
      for (const agent of agents) {
        updateAgentState(agent.id, { status: "working" });
        
        await new Promise((resolve) => setTimeout(resolve, 800));

        const randomIndex = Math.floor(Math.random() * debateTypes.length);
        const messageType: DebateMessage["type"] = debateTypes[randomIndex] ?? "proposal";
        const messages: Record<DebateMessage["type"], string[]> = {
          proposal: ["أقترح أن نركز على...", "من وجهة نظري، يجب أن...", "أرى أن الحل الأمثل هو..."],
          critique: ["أعتقد أن هناك ثغرة في...", "يجب مراعاة...", "لاحظت أن..."],
          agreement: ["أتفق مع هذا الطرح", "نعم، هذا منطقي", "أؤيد هذا الاتجاه"],
          decision: ["القرار النهائي هو...", "بناءً على النقاش، أقرر...", "الخلاصة هي..."],
        };

        const messageOptions = messages[messageType];
        const selectedMessage = messageOptions[Math.floor(Math.random() * messageOptions.length)] ?? "";

        setDebateMessages((prev) => [
          ...prev,
          {
            agentId: agent.id,
            agentName: agent.nameAr,
            message: selectedMessage,
            timestamp: new Date(),
            type: messageType,
          },
        ]);

        updateAgentState(agent.id, { status: "completed" });
      }
    }
  };

  // مراحل العصف الذهني
  const phases = BRAINSTORM_PHASES.map((phase) => ({
    id: phase.id,
    name: phase.name,
    nameEn: phase.nameEn,
    description: phase.description,
    icon: getPhaseIcon(phase.id),
    color: getPhaseColor(phase.id),
    agentCount: getAgentsForPhase(phase.id).length,
  }));

  function getPhaseIcon(phaseId: BrainstormPhase) {
    const icons = {
      1: <BookOpen className="w-5 h-5" />,
      2: <Sparkles className="w-5 h-5" />,
      3: <Shield className="w-5 h-5" />,
      4: <Trophy className="w-5 h-5" />,
      5: <Target className="w-5 h-5" />,
    };
    return icons[phaseId];
  }

  function getPhaseColor(phaseId: BrainstormPhase) {
    const colors = {
      1: "bg-blue-500 hover:bg-blue-600",
      2: "bg-purple-500 hover:bg-purple-600",
      3: "bg-green-500 hover:bg-green-600",
      4: "bg-yellow-500 hover:bg-yellow-600",
      5: "bg-red-500 hover:bg-red-600",
    };
    return colors[phaseId];
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          منصة العصف الذهني
        </h1>
        <p className="text-xl text-muted-foreground">
          منصة التطوير القصصي بالذكاء الاصطناعي متعدد الوكلاء
        </p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <Badge variant="secondary" className="text-sm">
            {agentStats.total} وكيل متخصص
          </Badge>
          <Badge variant="secondary" className="text-sm">
            {agentStats.withRAG} يدعم RAG
          </Badge>
          <Badge variant="secondary" className="text-sm">
            متوسط التعقيد: {(agentStats.averageComplexity * 100).toFixed(0)}%
          </Badge>
        </div>
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-medium">خطأ: {error}</p>
          </div>
        )}
        
        {currentSession && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-600 font-medium">
              الجلسة الحالية: {currentSession.brief}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              الحالة: {currentSession.status} | المرحلة: {currentSession.phase}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Control Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Cpu className="w-6 h-6 text-blue-500" />
                لوحة التحكم الرئيسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Process Phases */}
              <div>
                <h3 className="text-lg font-semibold mb-4">مراحل العملية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {phases.map((phase) => (
                    <TooltipProvider key={phase.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={activePhase === phase.id ? "default" : "outline"}
                            className={`p-4 h-auto flex items-center gap-3 ${
                              activePhase === phase.id ? "ring-2 ring-blue-500" : ""
                            }`}
                            onClick={() => setActivePhase(phase.id as BrainstormPhase)}
                          >
                            {phase.icon}
                            <div className="text-left flex-1">
                              <p className="font-bold text-sm">{phase.name}</p>
                              <p className="text-xs opacity-75">{phase.nameEn}</p>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {phase.agentCount}
                            </Badge>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{phase.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>

              {/* Session Creation/Control */}
              {!currentSession ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      ملخص الفكرة الإبداعية
                    </label>
                    <FileUpload
                      onFileContent={(content) => {
                        setBrief(content);
                        setError(null);
                      }}
                      className="mb-4"
                    />
                    <Textarea
                      value={brief}
                      onChange={(e) => setBrief(e.target.value)}
                      placeholder="اكتب هنا الفكرة الأساسية لقصتك..."
                      className="min-h-[100px]"
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    onClick={handleStartSession}
                    disabled={isLoading || !brief.trim()}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Settings className="w-5 h-5 mr-2 animate-spin" />
                        جاري الإنشاء...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        بدء جلسة جديدة
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-medium mb-2">الملخص الإبداعي</h3>
                    <p className="text-sm">{currentSession.brief}</p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleAdvancePhase}
                      disabled={activePhase >= 5}
                      className="flex-1"
                    >
                      <Rocket className="w-5 h-5 mr-2" />
                      المرحلة التالية
                    </Button>
                    <Button
                      onClick={handleStopSession}
                      variant="destructive"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      إعادة
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        التقدم العام
                      </span>
                      <span className="text-sm font-medium">
                        {((activePhase / 5) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${(activePhase / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Debate Panel */}
          {currentSession && debateMessages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-green-500" />
                  سجل النقاش
                </CardTitle>
                <CardDescription>
                  {debateMessages.length} رسالة من الوكلاء
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {debateMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg ${
                          msg.type === "proposal"
                            ? "bg-blue-50 border-blue-200"
                            : msg.type === "critique"
                            ? "bg-yellow-50 border-yellow-200"
                            : msg.type === "agreement"
                            ? "bg-green-50 border-green-200"
                            : "bg-purple-50 border-purple-200"
                        } border`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{msg.agentName}</span>
                          <Badge variant="outline" className="text-xs">
                            {msg.type === "proposal" && "اقتراح"}
                            {msg.type === "critique" && "نقد"}
                            {msg.type === "agreement" && "موافقة"}
                            {msg.type === "decision" && "قرار"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Agents Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="w-6 h-6 text-purple-500" />
                فريق الوكلاء
              </CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span>
                  {showAllAgents
                    ? `${realAgents.length} وكيل متخصص`
                    : `${phaseAgents.length} وكيل للمرحلة ${activePhase}`}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllAgents(!showAllAgents)}
                >
                  {showAllAgents ? "عرض المرحلة" : "عرض الكل"}
                </Button>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {displayedAgents.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      state={agentStates.get(agent.id) || { id: agent.id, status: "idle" }}
                      isExpanded={expandedAgents.has(agent.id)}
                      onToggleExpand={() => toggleAgentExpand(agent.id)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {[
          {
            icon: <Brain className="w-6 h-6" />,
            title: "ذكاء اصطناعي متقدم",
            desc: `${agentStats.total} وكيل متخصص`,
          },
          {
            icon: <Layers className="w-6 h-6" />,
            title: "5 فئات متنوعة",
            desc: "أساسي، تحليل، إبداع، تنبؤ، متقدم",
          },
          {
            icon: <Zap className="w-6 h-6" />,
            title: "نظام نقاش ذكي",
            desc: "تعاون حقيقي بين الوكلاء",
          },
          {
            icon: <Shield className="w-6 h-6" />,
            title: "جودة مضمونة",
            desc: `${agentStats.withSelfReflection} وكيل بتأمل ذاتي`,
          },
        ].map((feature, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="text-blue-500 mb-4">{feature.icon}</div>
              <h3 className="font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
