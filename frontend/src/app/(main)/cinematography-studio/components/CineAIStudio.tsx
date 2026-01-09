"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Camera,
  Clapperboard,
  Film,
  Wand2,
  Palette,
  Focus,
  Aperture,
  Sparkles,
  LayoutGrid,
  ArrowLeft,
  Play,
  Clock,
} from "lucide-react";
import dynamic from "next/dynamic";
import PreProductionTools from "./tools/PreProductionTools";
import ProductionTools from "./tools/ProductionTools";
import PostProductionTools from "./tools/PostProductionTools";

// Dynamically import new components
const LensSimulator = dynamic(
  () => import("@/components/ui/lens-simulator"),
  {
    loading: () => (
      <div className="flex items-center justify-center h-96 bg-zinc-900 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">جاري تحميل محاكي العدسات...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
);

const ColorGradingPreview = dynamic(
  () => import("@/components/ui/color-grading-preview"),
  {
    loading: () => (
      <div className="flex items-center justify-center h-96 bg-zinc-900 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">جاري تحميل معاينة الألوان...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
);

const DOFCalculator = dynamic(
  () => import("@/components/ui/dof-calculator"),
  {
    loading: () => (
      <div className="flex items-center justify-center h-96 bg-zinc-900 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">جاري تحميل حاسبة عمق الميدان...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
);

type Phase = "pre" | "production" | "post";
type TabValue = "pre-production" | "production" | "post-production";

const tabValueByPhase: Record<Phase, TabValue> = {
  pre: "pre-production",
  production: "production",
  post: "post-production",
};

const phaseByTab: Record<TabValue, Phase> = {
  "pre-production": "pre",
  production: "production",
  "post-production": "post",
};

const isTabValue = (value: string): value is TabValue =>
  value === "pre-production" ||
  value === "production" ||
  value === "post-production";

// Tool definitions
const TOOLS = [
  {
    id: "lens-simulator",
    name: "محاكي العدسات",
    nameEn: "Lens Simulator",
    icon: Aperture,
    description: "محاكاة عدسات سينمائية شهيرة",
    color: "from-amber-500 to-orange-600",
    status: "available",
  },
  {
    id: "color-grading",
    name: "التدرج اللوني",
    nameEn: "Color Grading",
    icon: Palette,
    description: "معاينة LUTs وتأثيرات الألوان",
    color: "from-purple-500 to-pink-600",
    status: "available",
  },
  {
    id: "dof-calculator",
    name: "حاسبة عمق الميدان",
    nameEn: "DOF Calculator",
    icon: Focus,
    description: "حساب عمق الميدان للقطاتك",
    color: "from-blue-500 to-cyan-600",
    status: "available",
  },
  {
    id: "shot-analyzer",
    name: "محلل اللقطات",
    nameEn: "Shot Analyzer",
    icon: Camera,
    description: "تحليل اللقطات بالذكاء الاصطناعي",
    color: "from-green-500 to-emerald-600",
    status: "coming-soon",
  },
];

// Stats for header
const STATS = [
  { label: "المشاريع", value: "5", icon: Film },
  { label: "اللقطات", value: "248", icon: Camera },
  { label: "الأدوات", value: "3", icon: Sparkles },
];

export const CineAIStudio: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<Phase>("pre");
  const [visualMood, setVisualMood] = useState("noir");
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"dashboard" | "phases">("dashboard");

  // Render active tool
  const renderTool = () => {
    switch (activeTool) {
      case "lens-simulator":
        return <LensSimulator />;
      case "color-grading":
        return <ColorGradingPreview />;
      case "dof-calculator":
        return <DOFCalculator />;
      default:
        return null;
    }
  };

  // If a tool is active, show it full screen
  if (activeTool) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        {/* Tool Header */}
        <header className="border-b border-white/10 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTool(null)}
                className="text-zinc-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 ml-2" />
                العودة
              </Button>
              <div className="h-6 w-px bg-zinc-700" />
              <div className="flex items-center gap-2">
                {(() => {
                  const tool = TOOLS.find((t) => t.id === activeTool);
                  if (!tool) return null;
                  const Icon = tool.icon;
                  return (
                    <>
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${tool.color}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h1 className="font-semibold text-white">{tool.name}</h1>
                        <p className="text-xs text-zinc-400">{tool.nameEn}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </header>

        {/* Tool Content */}
        <main className="container mx-auto px-6 py-8">{renderTool()}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-amber-500/30">
      {/* Header */}
      <header className="border-b border-white/10 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 p-2 rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <Camera className="h-6 w-6 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tighter flex items-center gap-2">
                CineAI <span className="text-amber-600">Vision</span>
              </h1>
              <p className="text-xs text-zinc-400 font-mono tracking-widest uppercase">
                Director of Photography OS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-4 mr-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-lg font-bold text-amber-500">{stat.value}</p>
                  <p className="text-xs text-zinc-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-zinc-800/50 p-1 rounded-lg">
              <Button
                variant={activeView === "dashboard" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveView("dashboard")}
                className="h-7"
              >
                <LayoutGrid className="h-4 w-4 ml-1" />
                الأدوات
              </Button>
              <Button
                variant={activeView === "phases" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveView("phases")}
                className="h-7"
              >
                <Film className="h-4 w-4 ml-1" />
                المراحل
              </Button>
            </div>

            {/* Mood Selector */}
            <div className="flex items-center gap-2 bg-zinc-800/50 px-3 py-1.5 rounded-full border border-white/5">
              <Wand2 className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-zinc-300">مود المشروع:</span>
              <Select value={visualMood} onValueChange={setVisualMood}>
                <SelectTrigger className="h-6 w-[140px] border-none bg-transparent text-xs focus:ring-0 p-0 text-amber-500 font-bold">
                  <SelectValue placeholder="اختر المود" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                  <SelectItem value="noir">Noir / كابوسي</SelectItem>
                  <SelectItem value="realistic">Realistic / واقعي</SelectItem>
                  <SelectItem value="surreal">Surreal / غرائبي</SelectItem>
                  <SelectItem value="vintage">Vintage / كلاسيكي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {activeView === "dashboard" ? (
          // Tools Dashboard
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Tools Grid */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                أدوات التصوير السينمائي
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {TOOLS.map((tool) => (
                  <Card
                    key={tool.id}
                    className={`bg-zinc-900 border-zinc-800 overflow-hidden cursor-pointer group transition-all duration-300 ${
                      tool.status === "available"
                        ? "hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10"
                        : "opacity-60"
                    }`}
                    onClick={() => tool.status === "available" && setActiveTool(tool.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-br ${tool.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          <tool.icon className="h-6 w-6 text-white" />
                        </div>
                        {tool.status === "available" ? (
                          <Badge className="bg-green-500/20 text-green-400 border-0">
                            <Play className="h-3 w-3 ml-1" />
                            متاح
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-zinc-500 border-zinc-700">
                            <Clock className="h-3 w-3 ml-1" />
                            قريباً
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-bold text-white mb-1">{tool.name}</h3>
                      <p className="text-xs text-zinc-500 mb-2">{tool.nameEn}</p>
                      <p className="text-sm text-zinc-400">{tool.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Access to Phases */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Film className="h-5 w-5 text-amber-500" />
                مراحل الإنتاج
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    phase: "pre",
                    title: "ما قبل الإنتاج",
                    titleEn: "Pre-Production",
                    icon: Clapperboard,
                    description: "تخطيط الرؤية البصرية والكادرات",
                  },
                  {
                    phase: "production",
                    title: "أثناء التصوير",
                    titleEn: "Production",
                    icon: Camera,
                    description: "تحليل اللقطات والإعدادات التقنية",
                  },
                  {
                    phase: "post",
                    title: "ما بعد الإنتاج",
                    titleEn: "Post-Production",
                    icon: Film,
                    description: "تصحيح الألوان والمعالجة النهائية",
                  },
                ].map((item) => (
                  <Card
                    key={item.phase}
                    className="bg-zinc-900 border-zinc-800 cursor-pointer hover:border-amber-500/50 transition-all"
                    onClick={() => {
                      setCurrentPhase(item.phase as Phase);
                      setActiveView("phases");
                    }}
                  >
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-amber-600/20">
                        <item.icon className="h-6 w-6 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{item.title}</h3>
                        <p className="text-xs text-zinc-500">{item.titleEn}</p>
                        <p className="text-sm text-zinc-400 mt-1">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Phases View
          <div className="max-w-7xl mx-auto space-y-8">
            <Tabs
              value={tabValueByPhase[currentPhase]}
              onValueChange={(value) => {
                if (isTabValue(value)) {
                  setCurrentPhase(phaseByTab[value]);
                }
              }}
              className="w-full"
            >
              <div className="flex justify-center mb-8">
                <TabsList className="bg-zinc-900/80 border border-white/10 p-1 rounded-2xl h-auto">
                  <TabsTrigger
                    value="pre-production"
                    className="px-8 py-3 rounded-xl text-zinc-400 data-[state=active]:bg-amber-600 data-[state=active]:text-black transition-all duration-300"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Clapperboard className="h-5 w-5" />
                      <span className="font-bold">ما قبل الإنتاج</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="production"
                    className="px-8 py-3 rounded-xl text-zinc-400 data-[state=active]:bg-amber-600 data-[state=active]:text-black transition-all duration-300"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Camera className="h-5 w-5" />
                      <span className="font-bold">أثناء التصوير</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="post-production"
                    className="px-8 py-3 rounded-xl text-zinc-400 data-[state=active]:bg-amber-600 data-[state=active]:text-black transition-all duration-300"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Film className="h-5 w-5" />
                      <span className="font-bold">ما بعد الإنتاج</span>
                    </div>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="relative min-h-[600px]">
                <TabsContent
                  value="pre-production"
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <PreProductionTools mood={visualMood} />
                </TabsContent>

                <TabsContent
                  value="production"
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <ProductionTools mood={visualMood} />
                </TabsContent>

                <TabsContent
                  value="post-production"
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <PostProductionTools mood={visualMood} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
};

export default CineAIStudio;
