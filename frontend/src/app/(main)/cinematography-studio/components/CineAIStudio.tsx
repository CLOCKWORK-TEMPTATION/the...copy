"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Clapperboard, Film, Wand2 } from "lucide-react";
import PreProductionTools from "@/app/(main)/cinematography-studio/components/tools/PreProductionTools";
import ProductionTools from "@/app/(main)/cinematography-studio/components/tools/ProductionTools";
import PostProductionTools from "@/app/(main)/cinematography-studio/components/tools/PostProductionTools";

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

export const CineAIStudio: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<Phase>("pre");
  const [visualMood, setVisualMood] = useState("noir");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-amber-500/30">
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
      </main>
    </div>
  );
};

export default CineAIStudio;
