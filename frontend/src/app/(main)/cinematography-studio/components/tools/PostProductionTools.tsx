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
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

const PostProductionTools: React.FC = () => {
  const [colorPalette, setColorPalette] = useState<string[]>([]);
  const [temperature, setTemperature] = useState(5500);

  const generateColorPalette = () => {
    // Simulated color palette generation
    const mockPalette = ["#1a2332", "#4a5c7a", "#7b8fa3", "#d4a574", "#e8c89c"];
    setColorPalette(mockPalette);
  };

  return (
    <div className="space-y-6">
      {/* Color Grading Assistant */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <span className="text-2xl">🎨</span>
            <span>مساعد تدريج الألوان - Color Grading Assistant</span>
          </CardTitle>
          <CardDescription>اقتراحات ذكية لتدريج الألوان وLUTs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>نوع المشهد / Scene Type</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Button variant="outline" size="sm">
                🌅 صباحي
              </Button>
              <Button variant="outline" size="sm">
                🌃 ليلي
              </Button>
              <Button variant="outline" size="sm">
                🏢 داخلي
              </Button>
              <Button variant="outline" size="sm">
                🌳 خارجي
              </Button>
              <Button variant="outline" size="sm">
                😊 سعيد
              </Button>
              <Button variant="outline" size="sm">
                😔 حزين
              </Button>
            </div>
          </div>

          <div>
            <Label>Color Temperature: {temperature}K</Label>
            <Slider
              value={[temperature]}
              onValueChange={(value) => setTemperature(value[0] ?? 5500)}
              min={2000}
              max={10000}
              step={100}
              className="mt-2"
            />
          </div>

          <Button onClick={generateColorPalette} className="w-full">
            🎨 توليد لوحة ألوان
          </Button>

          {colorPalette.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-3 text-sm">
                لوحة الألوان المقترحة:
              </h4>
              <div className="flex gap-2">
                {colorPalette.map((color, idx) => (
                  <div key={idx} className="flex-1 text-center">
                    <div
                      className="h-20 rounded-lg mb-2 border-2 border-gray-200"
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-xs font-mono">{color}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editorial Assistant */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <span className="text-2xl">✂️</span>
            <span>مساعد المونتاج - Editorial Assistant</span>
          </CardTitle>
          <CardDescription>اقتراحات للإيقاع والانتقالات</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="edit-notes">ملاحظات المونتاج</Label>
            <Textarea
              id="edit-notes"
              placeholder="وصف المشهد أو نوع المونتاج المطلوب..."
              rows={4}
              className="mt-2"
            />
          </div>
          <Button className="w-full" variant="outline">
            🎬 تحليل الإيقاع
          </Button>
        </CardContent>
      </Card>

      {/* Footage Analyzer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <span className="text-2xl">📹</span>
            <span>محلل المشاهد - Footage Analyzer</span>
          </CardTitle>
          <CardDescription>تحليل تقني للفيديو المصور</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🎞️</div>
            <p className="text-gray-600 mb-4">ارفع ملف فيديو للتحليل</p>
            <Button>📤 رفع فيديو</Button>
          </div>

          <div className="mt-6 space-y-2">
            <h4 className="font-semibold text-sm">التحليل التقني:</h4>
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3 bg-gray-50">
                <p className="text-xs text-gray-500">Exposure Analysis</p>
                <Badge variant="outline" className="mt-1">
                  Pending
                </Badge>
              </Card>
              <Card className="p-3 bg-gray-50">
                <p className="text-xs text-gray-500">Color Consistency</p>
                <Badge variant="outline" className="mt-1">
                  Pending
                </Badge>
              </Card>
              <Card className="p-3 bg-gray-50">
                <p className="text-xs text-gray-500">Focus Quality</p>
                <Badge variant="outline" className="mt-1">
                  Pending
                </Badge>
              </Card>
              <Card className="p-3 bg-gray-50">
                <p className="text-xs text-gray-500">Motion Blur</p>
                <Badge variant="outline" className="mt-1">
                  Pending
                </Badge>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Manager */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <span className="text-2xl">📦</span>
            <span>مدير التسليم - Delivery Manager</span>
          </CardTitle>
          <CardDescription>إعدادات التصدير والتسليم</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <Label>Platform / المنصة</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button variant="outline" size="sm">
                  🎬 Cinema DCP
                </Button>
                <Button variant="outline" size="sm">
                  📺 Broadcast HD
                </Button>
                <Button variant="outline" size="sm">
                  🌐 Web / Social
                </Button>
                <Button variant="outline" size="sm">
                  💿 Blu-ray
                </Button>
              </div>
            </div>
            <Button className="w-full mt-4">⚙️ إنشاء إعدادات التصدير</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostProductionTools;
