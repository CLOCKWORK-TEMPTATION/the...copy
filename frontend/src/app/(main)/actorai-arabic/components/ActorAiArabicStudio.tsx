"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export const ActorAiArabicStudio: React.FC<{}> = () => {
  const [currentView, setCurrentView] = useState<"home" | "demo" | "dashboard">(
    "home"
  );
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const showNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const renderHeader = () => (
    <header className="bg-gradient-to-r from-blue-900 to-purple-900 text-white p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3 space-x-reverse">
            <span className="text-4xl">🎭</span>
            <h1 className="text-3xl font-bold">الممثل الذكي</h1>
          </div>
          <nav className="flex space-x-4 space-x-reverse">
            <Button
              onClick={() => setCurrentView("home")}
              variant={currentView === "home" ? "secondary" : "ghost"}
              className={
                currentView === "home"
                  ? "bg-white text-blue-900 hover:bg-white"
                  : "text-white hover:bg-blue-800"
              }
            >
              🏠 الرئيسية
            </Button>
            <Button
              onClick={() => setCurrentView("demo")}
              variant={currentView === "demo" ? "secondary" : "ghost"}
              className={
                currentView === "demo"
                  ? "bg-white text-blue-900 hover:bg-white"
                  : "text-white hover:bg-blue-800"
              }
            >
              🎬 التجربة
            </Button>
            <Button
              onClick={() => setCurrentView("dashboard")}
              variant={currentView === "dashboard" ? "secondary" : "ghost"}
              className={
                currentView === "dashboard"
                  ? "bg-white text-blue-900 hover:bg-white"
                  : "text-white hover:bg-blue-800"
              }
            >
              📊 لوحة التحكم
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );

  const renderNotification = () => {
    if (!notification) return null;

    return (
      <div className="fixed top-4 right-4 z-50">
        <Alert
          variant={notification.type === "error" ? "destructive" : "default"}
        >
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      </div>
    );
  };

  const renderHome = () => (
    <div className="text-center py-16">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-5xl font-bold text-gray-800 mb-6">
          طور مهاراتك التمثيلية بالذكاء الاصطناعي
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          أتقن فنك مع تحليل النصوص المدعوم بالذكاء الاصطناعي، وشركاء المشاهد الافتراضيين، وتحليلات الأداء
        </p>
        <div className="flex gap-4 justify-center mb-12">
          <Button
            size="lg"
            onClick={() => setCurrentView("demo")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            🎬 جرب التطبيق
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() =>
              showNotification("info", "التسجيل قريباً!")
            }
          >
            ابدأ الآن
          </Button>
        </div>
        <div className="text-8xl opacity-30 mb-12">🎭</div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold mb-2">تحليل النصوص</h3>
              <p className="text-gray-600">
                تحليل عميق للأهداف والعقبات والمسارات العاطفية باستخدام منهجيات التمثيل المثبتة
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2">شريك المشهد الذكي</h3>
              <p className="text-gray-600">
                تدرب على المشاهد مع شريك ذكي يستجيب بطبيعية لأدائك
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">
                تحليلات الأداء
              </h3>
              <p className="text-gray-600">
                ملاحظات مفصلة حول الأصالة العاطفية والأداء الصوتي والحضور الجسدي
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-4">📈</div>
              <h3 className="text-xl font-semibold mb-2">تتبع التقدم</h3>
              <p className="text-gray-600">
                راقب نموك مع التحليلات الشاملة ونصائح التدريب الشخصية
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16">
          <h3 className="text-3xl font-bold text-gray-800 mb-8">
            كيف يعمل
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="text-xl font-semibold mb-2">ارفع نصك</h4>
              <p className="text-gray-600">استورد أي نص بصيغة نصية</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="text-xl font-semibold mb-2">حلل وتدرب</h4>
              <p className="text-gray-600">
                احصل على رؤى الذكاء الاصطناعي وتدرب مع شركاء افتراضيين
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="text-xl font-semibold mb-2">تتبع التقدم</h4>
              <p className="text-gray-600">
                راقب التحسينات وأتقن حرفتك
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDemo = () => (
    <div className="max-w-6xl mx-auto py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        🎬 التجربة التفاعلية
      </h2>
      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analysis">📝 تحليل النص</TabsTrigger>
          <TabsTrigger value="partner">🎭 شريك المشهد</TabsTrigger>
          <TabsTrigger value="recording">🎥 التسجيل</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تحليل النص</CardTitle>
              <CardDescription>
                ارفع نصاً للحصول على تحليل مدعوم بالذكاء الاصطناعي باستخدام منهجيات التمثيل المثبتة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors">
                <div className="text-6xl mb-4">📄</div>
                <p className="text-lg">اضغط لاستخدام نص تجريبي</p>
                <p className="text-sm text-gray-500">
                  أو اسحب وأفلت نصك هنا
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    منهجية التمثيل
                  </label>
                  <select className="w-full border rounded-md p-2">
                    <option>طريقة ستانيسلافسكي</option>
                    <option>تقنية مايسنر</option>
                    <option>تقنية مايكل تشيخوف</option>
                    <option>أوتا هاجن</option>
                    <option>الجماليات العملية</option>
                  </select>
                </div>

                <Button
                  className="w-full"
                  onClick={() =>
                    showNotification("success", "تم التحليل بنجاح! 🎉")
                  }
                >
                  🔍 حلل النص
                </Button>
              </div>

              <Card className="bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-900">
                    🎯 نتائج التحليل التجريبي
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">الهدف الرئيسي:</h4>
                    <p>أن يكون مع جولييت ويتغلب على عقبات العائلة</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">المسار العاطفي:</h4>
                    <div className="flex gap-4">
                      <Badge>الشوق (70%)</Badge>
                      <Badge>الدهشة (85%)</Badge>
                      <Badge>الحب (95%)</Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">نصائح التدريب:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>
                        ركز على الصور البصرية - انظر حقاً إلى جولييت كالشمس
                      </li>
                      <li>اسمح بلحظات صمت للتنفس والتفكير</li>
                      <li>
                        اعثر على التوازن بين الشغف والضعف
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partner" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>شريك المشهد الذكي</CardTitle>
              <CardDescription>
                تدرب على مشاهدك مع شريك ذكي
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="bg-blue-100 rounded-lg p-4 mb-3">
                      <p className="font-medium">روميو (أنت):</p>
                      <p className="italic">
                        ولكن هدوءاً، ما هذا الضوء الذي ينبعث من تلك النافذة؟ إنه الشرق، وجولييت هي الشمس.
                      </p>
                    </div>
                    <div className="bg-purple-100 rounded-lg p-4">
                      <p className="font-medium">جولييت (ذكاء اصطناعي):</p>
                      <p className="italic">
                        يا روميو، يا روميو، لماذا أنت روميو؟ انكر أباك وارفض اسمك.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Button className="w-full">🎤 ابدأ التدريب</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recording" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تسجيل الأداء</CardTitle>
              <CardDescription>
                سجل أداءك واحصل على ملاحظات مدعومة بالذكاء الاصطناعي
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-8xl mb-4">🎥</div>
                <p className="text-lg mb-4">
                  مستعد لتسجيل أدائك؟
                </p>
                <Button size="lg">⏺️ ابدأ التسجيل</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderDashboard = () => (
    <div className="max-w-6xl mx-auto py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        📊 لوحة التحكم الخاصة بك
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>النصوص</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">3</div>
            <p className="text-gray-600">إجمالي المرفوع</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>التسجيلات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-purple-600">12</div>
            <p className="text-gray-600">إجمالي العروض</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>متوسط النقاط</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">79</div>
            <p className="text-gray-600">تقييم الأداء</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>📚 Recent النصوص</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
              <div>
                <h4 className="font-semibold">
                  Romeo & Juliet - Balcony Scene
                </h4>
                <p className="text-sm text-gray-600">
                  William Shakespeare • Uploaded: Oct 28, 2025
                </p>
              </div>
              <Badge>مُحلل</Badge>
            </div>
            <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
              <div>
                <h4 className="font-semibold">Hamlet - To be or not to be</h4>
                <p className="text-sm text-gray-600">
                  William Shakespeare • Uploaded: Oct 26, 2025
                </p>
              </div>
              <Badge>مُحلل</Badge>
            </div>
            <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
              <div>
                <h4 className="font-semibold">
                  A Streetcar Named Desire - Scene 3
                </h4>
                <p className="text-sm text-gray-600">
                  Tennessee Williams • Uploaded: Oct 25, 2025
                </p>
              </div>
              <Badge variant="outline">جاري المعالجة</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🎥 Recent التسجيلات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
              <div>
                <h4 className="font-semibold">Romeo & Juliet - Take 3</h4>
                <p className="text-sm text-gray-600">
                  المدة: 3:42 • Oct 30, 2025
                </p>
              </div>
              <Badge className="bg-green-600">النقاط: 82</Badge>
            </div>
            <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
              <div>
                <h4 className="font-semibold">Hamlet - Take 1</h4>
                <p className="text-sm text-gray-600">
                  المدة: 4:15 • Oct 29, 2025
                </p>
              </div>
              <Badge className="bg-yellow-600">النقاط: 76</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMainContent = () => {
    switch (currentView) {
      case "home":
        return renderHome();
      case "demo":
        return renderDemo();
      case "dashboard":
        return renderDashboard();
      default:
        return renderHome();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderHeader()}
      {renderNotification()}
      <main className="container mx-auto px-4 py-8">{renderMainContent()}</main>
    </div>
  );
};
