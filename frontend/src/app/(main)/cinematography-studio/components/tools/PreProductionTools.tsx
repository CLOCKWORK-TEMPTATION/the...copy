"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Eye, Sparkles, Zap, Image as ImageIcon } from "lucide-react";

interface PreProductionProps {
  mood?: string;
}

const PreProductionTools: React.FC<PreProductionProps> = ({
  mood = "noir",
}) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [darkness, setDarkness] = useState([50]);
  const [complexity, setComplexity] = useState([30]);

  const handleGenerate = () => {
    if (!prompt.trim()) {
      return;
    }
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-4 space-y-6">
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-amber-500 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              مولد الرؤية البصرية
            </CardTitle>
            <CardDescription className="text-zinc-400">
              حول المشهد المكتوب إلى كادر سينمائي (Concept Art)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                وصف المشهد
              </label>
              <Textarea
                placeholder="مثال: غرفة تحقيق مظلمة، ضوء واحد مسلط على وجه المتهم، دخان سجائر يملأ المكان..."
                className="bg-black/20 border-zinc-700 text-zinc-100 min-h-[120px] focus:border-amber-500"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <div className="space-y-4 p-4 bg-black/20 rounded-lg border border-white/5">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">
                    Shadows & Mystery (الغموض)
                  </span>
                  <span className="text-amber-500 font-mono">
                    {darkness[0]}%
                  </span>
                </div>
                <Slider
                  value={darkness}
                  onValueChange={setDarkness}
                  max={100}
                  step={1}
                  className="cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">
                    Visual Chaos (الفوضى البصرية)
                  </span>
                  <span className="text-amber-500 font-mono">
                    {complexity[0]}%
                  </span>
                </div>
                <Slider
                  value={complexity}
                  onValueChange={setComplexity}
                  max={100}
                  step={1}
                />
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-bold py-6"
            >
              {isGenerating ? (
                <>
                  جاري التخيل <Sparkles className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  توليد الكادر <Zap className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-8">
        <Card className="bg-zinc-900 border-zinc-800 h-full min-h-[500px] flex flex-col relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none mix-blend-overlay" />

          <div className="flex-1 flex items-center justify-center bg-black/40 relative">
            {!isGenerating ? (
              <div className="text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center mx-auto border-2 border-dashed border-zinc-700 group-hover:border-amber-500/50 transition-colors">
                  <ImageIcon className="h-10 w-10 text-zinc-500" />
                </div>
                <p className="text-zinc-500 max-w-sm mx-auto px-4">
                  الصورة ستظهر هنا. الذكاء الاصطناعي سيقترح زاوية الكاميرا
                  وتوزيع الإضاءة بناءً على "مود" {mood}.
                </p>
              </div>
            ) : (
              <div className="text-center space-y-4 animate-pulse">
                <div className="w-full max-w-md h-64 bg-zinc-800/50 rounded-lg mx-auto" />
                <p className="text-amber-500 font-mono text-sm">
                  جاري هندسة الضوء والظلال...
                </p>
              </div>
            )}
          </div>

          <div className="p-4 bg-zinc-950 border-t border-zinc-800 grid grid-cols-3 gap-4 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="text-amber-600">LENS:</span>
              {isGenerating ? "..." : "35mm Anamorphic"}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-600">LIGHT:</span>
              {isGenerating ? "..." : "Low-Key / Chiaroscuro"}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-600">ANGLE:</span>
              {isGenerating ? "..." : "Dutch Angle (Low)"}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PreProductionTools;
