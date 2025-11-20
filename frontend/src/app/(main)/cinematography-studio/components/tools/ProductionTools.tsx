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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ProductionTools: React.FC = () => {
  const [shotValidation, setShotValidation] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleValidateShot = () => {
    setIsValidating(true);
    // Simulated validation
    setTimeout(() => {
      setShotValidation({
        status: "good",
        score: 85,
        suggestions: [
          "الإضاءة جيدة ولكن يمكن تحسين الـ fill light قليلاً",
          "الإطار مكون بشكل ممتاز - القاعدة الثلثية مطبقة",
          "تأكد من ضبط الفوكس على عيني الممثل",
        ],
        exposure: "Good",
        composition: "Excellent",
        focus: "Acceptable",
      });
      setIsValidating(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Real-Time Shot Validator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <span className="text-2xl">✅</span>
            <span>مدقق اللقطات المباشر - Real-Time Shot Validator</span>
          </CardTitle>
          <CardDescription>
            تحقق من جودة اللقطة قبل التسجيل النهائي
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-gray-600 mb-4">
              ارفع صورة من الكاميرا أو Monitor
            </p>
            <Button>📤 رفع صورة للتحليل</Button>
          </div>

          <Button
            onClick={handleValidateShot}
            disabled={isValidating}
            className="w-full"
          >
            {isValidating ? "🔄 جاري التحليل..." : "🔍 تحليل اللقطة"}
          </Button>

          {shotValidation && (
            <div className="space-y-3 mt-4">
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      تقييم اللقطة: {shotValidation.score}/100
                    </span>
                    <Badge className="bg-green-600">
                      {shotValidation.status === "good" ? "جيد" : "يحتاج تحسين"}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-3 gap-3">
                <Card className="text-center p-3">
                  <p className="text-xs text-gray-500">Exposure</p>
                  <p className="font-semibold">{shotValidation.exposure}</p>
                </Card>
                <Card className="text-center p-3">
                  <p className="text-xs text-gray-500">Composition</p>
                  <p className="font-semibold">{shotValidation.composition}</p>
                </Card>
                <Card className="text-center p-3">
                  <p className="text-xs text-gray-500">Focus</p>
                  <p className="font-semibold">{shotValidation.focus}</p>
                </Card>
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-sm">اقتراحات التحسين:</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {shotValidation.suggestions.map(
                      (suggestion: string, idx: number) => (
                        <li
                          key={idx}
                          className="text-sm flex items-start space-x-2 space-x-reverse"
                        >
                          <span className="text-blue-600">•</span>
                          <span>{suggestion}</span>
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-Time Assistant */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <span className="text-2xl">🤖</span>
            <span>المساعد الفوري - Real-Time Assistant</span>
          </CardTitle>
          <CardDescription>اسأل أي سؤال فني أثناء التصوير</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="question">سؤالك</Label>
            <Input
              id="question"
              placeholder="مثال: ما هي أفضل فتحة عدسة لهذا المشهد؟"
              className="mt-2"
            />
          </div>
          <Button className="w-full">💬 اسأل المساعد</Button>

          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <h4 className="font-semibold mb-2 text-sm">أسئلة شائعة:</h4>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
              >
                ما هي أفضل إعدادات الكاميرا للتصوير الخارجي؟
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
              >
                كيف أحقق الـ bokeh effect في هذا المشهد؟
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
              >
                ما هو ISO المناسب في ظروف الإضاءة المنخفضة؟
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Logger */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <span className="text-2xl">📊</span>
            <span>مسجل البيانات - Data Logger</span>
          </CardTitle>
          <CardDescription>
            تسجيل إعدادات الكاميرا والإضاءة لكل لقطة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Scene / المشهد</Label>
              <Input placeholder="1A" className="mt-1" />
            </div>
            <div>
              <Label>Take / اللقطة</Label>
              <Input placeholder="3" className="mt-1" />
            </div>
            <div>
              <Label>Lens / العدسة</Label>
              <Input placeholder="50mm" className="mt-1" />
            </div>
            <div>
              <Label>Aperture / الفتحة</Label>
              <Input placeholder="f/2.8" className="mt-1" />
            </div>
          </div>
          <Button className="w-full mt-4">💾 حفظ البيانات</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionTools;
