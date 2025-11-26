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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const PreProductionTools: React.FC = () => {
  const [script, setScript] = useState("");
  const [shotList, setShotList] = useState<any[]>([]);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateShotList = async () => {
    if (!script.trim()) return;
    setLoading(true);

    // Simulated AI response for now
    setTimeout(() => {
      const mockShots = [
        {
          id: 1,
          type: "Wide Shot",
          description: "Establishing shot of the location",
          camera: "Static",
          lighting: "Natural",
        },
        {
          id: 2,
          type: "Medium Shot",
          description: "Character enters frame",
          camera: "Dolly in",
          lighting: "Three-point",
        },
        {
          id: 3,
          type: "Close-up",
          description: "Character emotional reaction",
          camera: "Handheld",
          lighting: "Soft key",
        },
        {
          id: 4,
          type: "Over-the-shoulder",
          description: "Conversation shot",
          camera: "Static",
          lighting: "Balanced",
        },
      ];
      setShotList(mockShots);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Shot List Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <span className="text-2xl">📝</span>
            <span>مولد قائمة اللقطات - Shot List Generator</span>
          </CardTitle>
          <CardDescription>
            قم بإدخال السيناريو وسيقوم الذكاء الاصطناعي بإنشاء قائمة لقطات مفصلة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="script-input">نص السيناريو / Script</Label>
            <Textarea
              id="script-input"
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="أدخل نص السيناريو هنا...&#10;Enter your script here..."
              rows={10}
              className="mt-2"
            />
          </div>
          <Button
            onClick={handleGenerateShotList}
            disabled={loading || !script.trim()}
            className="w-full"
          >
            {loading ? "🔄 جاري التوليد..." : "🎬 توليد قائمة اللقطات"}
          </Button>

          {/* Shot List Results */}
          {shotList.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="font-semibold text-lg">قائمة اللقطات المقترحة:</h4>
              {shotList.map((shot) => (
                <Card key={shot.id} className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 space-x-reverse mb-2">
                          <Badge>{shot.type}</Badge>
                          <Badge variant="outline">{shot.camera}</Badge>
                        </div>
                        <p className="text-sm text-gray-700">
                          {shot.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Lighting: {shot.lighting}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location Scout Assistant */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <span className="text-2xl">📍</span>
            <span>مساعد استكشاف المواقع - Location Scout</span>
          </CardTitle>
          <CardDescription>
            تحليل المواقع واقتراحات الإضاءة والزوايا المثالية
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="location-input">
              وصف الموقع / Location Description
            </Label>
            <Input
              id="location-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="مثال: مكتب حديث بنوافذ كبيرة / Modern office with large windows"
              className="mt-2"
            />
          </div>
          <Button className="w-full" variant="outline">
            🔍 تحليل الموقع
          </Button>
        </CardContent>
      </Card>

      {/* Mood Board Creator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <span className="text-2xl">🎨</span>
            <span>منشئ لوحة المزاج - Mood Board Creator</span>
          </CardTitle>
          <CardDescription>
            إنشاء لوحات مزاج بصرية للإلهام والمرجعية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline">📸 رفع صور مرجعية</Button>
            <Button variant="outline">🤖 توليد بالذكاء الاصطناعي</Button>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Optimizer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <span className="text-2xl">⚙️</span>
            <span>محسن المعدات - Equipment Optimizer</span>
          </CardTitle>
          <CardDescription>
            اقتراحات ذكية لأفضل تجهيزات الكاميرا والإضاءة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" variant="outline">
            🛠️ تحسين قائمة المعدات
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PreProductionTools;
