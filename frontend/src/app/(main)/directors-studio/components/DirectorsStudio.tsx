"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const DirectorsStudio: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-4 space-x-reverse justify-center">
            <span className="text-6xl">🎬</span>
            <div>
              <h1 className="text-4xl font-bold mb-2">استوديو المخرجين</h1>
              <p className="text-xl text-gray-300">Directors Studio</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="border-4 border-dashed border-purple-400 bg-purple-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl mb-2">
                    🚧 قيد التطوير
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Under Development
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  قريباً
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-xl text-gray-700">
                هذه الصفحة محجوزة لاستوديو المخرجين - قيد التطوير حالياً
              </p>

              <div className="bg-white rounded-lg p-6 space-y-4">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  الميزات المخطط لها:
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3 space-x-reverse">
                    <span className="text-2xl">📝</span>
                    <div>
                      <strong className="text-lg">تحليل السيناريو:</strong>
                      <p className="text-gray-600">
                        أدوات تحليل متقدمة للسيناريوهات والبنية الدرامية
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3 space-x-reverse">
                    <span className="text-2xl">🎭</span>
                    <div>
                      <strong className="text-lg">إدارة الممثلين:</strong>
                      <p className="text-gray-600">
                        أدوات لإدارة أداء الممثلين وملاحظات الإخراج
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3 space-x-reverse">
                    <span className="text-2xl">🎨</span>
                    <div>
                      <strong className="text-lg">لوحة القصة:</strong>
                      <p className="text-gray-600">
                        إنشاء وتحرير لوحات القصة (Storyboards)
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3 space-x-reverse">
                    <span className="text-2xl">📅</span>
                    <div>
                      <strong className="text-lg">جدولة التصوير:</strong>
                      <p className="text-gray-600">
                        تخطيط وإدارة جداول التصوير والإنتاج
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3 space-x-reverse">
                    <span className="text-2xl">🎞️</span>
                    <div>
                      <strong className="text-lg">المونتاج المبدئي:</strong>
                      <p className="text-gray-600">
                        أدوات لتصور المونتاج وإيقاع الفيلم
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3 space-x-reverse">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <strong className="text-lg">رؤية المخرج:</strong>
                      <p className="text-gray-600">
                        مساحة عمل لتوثيق وتطوير الرؤية الإخراجية
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="flex justify-center pt-6">
                <Button size="lg" variant="outline" disabled>
                  <span className="text-xl mr-2">🔜</span>
                  قريباً
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-gray-600">
            <p>
              للاستفسارات أو المساهمة في التطوير، يرجى التواصل مع فريق التطوير
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DirectorsStudio;
