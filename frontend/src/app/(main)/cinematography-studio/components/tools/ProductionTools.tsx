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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ScanLine,
  AlertTriangle,
  CheckCircle,
  Focus,
  Aperture,
  Thermometer,
} from "lucide-react";

interface ProductionProps {
  mood?: string;
}

interface ShotAnalysis {
  score: number;
  dynamicRange: string;
  grainLevel: string;
  issues: string[];
  exposure: number;
}

const ProductionTools: React.FC<ProductionProps> = ({ mood = "noir" }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ShotAnalysis | null>(null);

  const handleAnalyzeShot = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setAnalysis({
        score: 88,
        dynamicRange: "High",
        grainLevel: "Moderate (Cinematic)",
        issues:
          mood === "noir"
            ? []
            : [
                "الإضاءة مظلمة جداً (تتناسب مع النوار ولكن تأكد من تفاصيل الوجه)",
              ],
        exposure: 70,
      });
      setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="col-span-1 md:col-span-2 bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex justify-between items-center">
            <span className="flex items-center gap-2">
              <ScanLine className="text-amber-500" />
              تحليل اللقطة الحي
            </span>
            {analysis && (
              <Badge
                variant="outline"
                className="text-green-400 border-green-900 bg-green-900/20"
              >
                READY TO SHOOT
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="aspect-video bg-black rounded-lg border border-zinc-800 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <div className="bg-red-600 w-2 h-2 rounded-full animate-pulse" />
              <span className="text-[10px] font-mono text-zinc-500">
                REC 4K
              </span>
            </div>

            <Button
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              onClick={handleAnalyzeShot}
            >
              {isAnalyzing
                ? "جاري المسح الطيفي..."
                : "ارفع لقطة اختبار (Test Shot)"}
            </Button>
          </div>

          {analysis && (
            <div className="grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="bg-zinc-950 p-3 rounded border-l-2 border-amber-500">
                <p className="text-[10px] text-zinc-500 uppercase">Exposure</p>
                <p className="font-mono text-lg text-white">
                  {analysis.exposure}%
                </p>
              </div>
              <div className="bg-zinc-950 p-3 rounded border-l-2 border-blue-500">
                <p className="text-[10px] text-zinc-500 uppercase">Grain</p>
                <p className="font-mono text-sm text-white truncate">
                  {analysis.grainLevel}
                </p>
              </div>
              <div className="bg-zinc-950 p-3 rounded border-l-2 border-purple-500">
                <p className="text-[10px] text-zinc-500 uppercase">Mood Fit</p>
                <p className="font-mono text-lg text-white">
                  {analysis.score}/100
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-400 uppercase tracking-widest">
              Technical Specs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-2 bg-zinc-950 rounded">
              <div className="flex items-center gap-2">
                <Focus className="w-4 h-4 text-zinc-500" />
                <span className="text-sm text-zinc-300">Focus Peaking</span>
              </div>
              <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">
                ON
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-zinc-950 rounded">
              <div className="flex items-center gap-2">
                <Aperture className="w-4 h-4 text-zinc-500" />
                <span className="text-sm text-zinc-300">False Color</span>
              </div>
              <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">
                OFF
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-zinc-950 rounded">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-zinc-500" />
                <span className="text-sm text-zinc-300">Color Temp</span>
              </div>
              <span className="font-mono text-xs text-amber-500">3200K</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-amber-500 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Rady's Warning System
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              المحلل الفوري يعطي ملاحظات بناءً على ستايل التصوير الخاص بك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-zinc-400 mb-4">
              {analysis && analysis.issues.length > 0 ? (
                <ul className="list-disc pl-4 space-y-1 text-red-400">
                  {analysis.issues.map((issue, i) => (
                    <li key={issue + i}>{issue}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-green-500/80 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> لا توجد مشاكل حرجة. الجو
                  العام متناسق.
                </p>
              )}
            </div>
            <Input
              placeholder="اسأل عن الإضاءة، العدسات..."
              className="bg-zinc-950 border-zinc-800 text-xs"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductionTools;
