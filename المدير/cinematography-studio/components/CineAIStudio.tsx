"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Import tool components
import PreProductionTools from "@/app/(main)/cinematography-studio/components/tools/PreProductionTools";
import ProductionTools from "@/app/(main)/cinematography-studio/components/tools/ProductionTools";
import PostProductionTools from "@/app/(main)/cinematography-studio/components/tools/PostProductionTools";

export const CineAIStudio: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<
    "pre" | "production" | "post"
  >("pre");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-zinc-800 to-slate-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-4 space-x-reverse justify-center mb-4">
            <span className="text-6xl">🎥</span>
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2">CineAI Studio</h1>
              <p className="text-xl text-gray-300">
                استوديو مديري التصوير السينمائي
              </p>
              <p className="text-sm text-gray-400 mt-1">
                AI-Powered Cinematography Assistant
              </p>
            </div>
          </div>
          <div className="flex justify-center space-x-2 space-x-reverse">
            <Badge variant="outline" className="text-white border-white">
              مدعوم بالذكاء الاصطناعي
            </Badge>
            <Badge variant="outline" className="text-white border-white">
              Pre-Production
            </Badge>
            <Badge variant="outline" className="text-white border-white">
              Production
            </Badge>
            <Badge variant="outline" className="text-white border-white">
              Post-Production
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Card */}
          <Card className="mb-8 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-3xl">
                مرحباً بك في استوديو CineAI 🎬
              </CardTitle>
              <CardDescription className="text-lg">
                أدوات متقدمة لمديري التصوير في جميع مراحل الإنتاج السينمائي
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                CineAI يوفر لك مجموعة شاملة من الأدوات المدعومة بالذكاء
                الاصطناعي لمساعدتك في:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <span className="text-3xl">📋</span>
                  <div>
                    <h4 className="font-semibold text-blue-900">
                      ما قبل الإنتاج
                    </h4>
                    <p className="text-sm text-gray-600">التخطيط والاستعداد</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 space-x-reverse">
                  <span className="text-3xl">🎬</span>
                  <div>
                    <h4 className="font-semibold text-blue-900">الإنتاج</h4>
                    <p className="text-sm text-gray-600">التصوير والتنفيذ</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 space-x-reverse">
                  <span className="text-3xl">✨</span>
                  <div>
                    <h4 className="font-semibold text-blue-900">
                      ما بعد الإنتاج
                    </h4>
                    <p className="text-sm text-gray-600">
                      المونتاج والإخراج النهائي
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Tabs */}
          <Tabs defaultValue="pre-production" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger
                value="pre-production"
                onClick={() => setCurrentPhase("pre")}
              >
                <span className="mr-2">📋</span>
                ما قبل الإنتاج
              </TabsTrigger>
              <TabsTrigger
                value="production"
                onClick={() => setCurrentPhase("production")}
              >
                <span className="mr-2">🎬</span>
                الإنتاج
              </TabsTrigger>
              <TabsTrigger
                value="post-production"
                onClick={() => setCurrentPhase("post")}
              >
                <span className="mr-2">✨</span>
                ما بعد الإنتاج
              </TabsTrigger>
            </TabsList>

            {/* Pre-Production Phase */}
            <TabsContent value="pre-production">
              <PreProductionTools />
            </TabsContent>

            {/* Production Phase */}
            <TabsContent value="production">
              <ProductionTools />
            </TabsContent>

            {/* Post-Production Phase */}
            <TabsContent value="post-production">
              <PostProductionTools />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            CineAI Studio - أدوات مديري التصوير المدعومة بالذكاء الاصطناعي
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Powered by Advanced AI for Cinematographers
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CineAIStudio;
