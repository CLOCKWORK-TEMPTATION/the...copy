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
            <h1 className="text-3xl font-bold">ActorAI Pro</h1>
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
              🏠 Home
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
              🎬 Demo
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
              📊 Dashboard
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
          Transform Your Acting with AI
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Master your craft with AI-powered script analysis, virtual scene
          partners, and performance analytics
        </p>
        <div className="flex gap-4 justify-center mb-12">
          <Button
            size="lg"
            onClick={() => setCurrentView("demo")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            🎬 Try Demo
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() =>
              showNotification("info", "Registration coming soon!")
            }
          >
            Get Started
          </Button>
        </div>
        <div className="text-8xl opacity-30 mb-12">🎭</div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold mb-2">Script Analysis</h3>
              <p className="text-gray-600">
                Deep analysis of objectives, obstacles, and emotional arcs using
                proven acting methodologies
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2">AI Scene Partner</h3>
              <p className="text-gray-600">
                Rehearse scenes with an intelligent AI partner that responds
                naturally to your performance
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">
                Performance Analytics
              </h3>
              <p className="text-gray-600">
                Detailed feedback on emotional authenticity, vocal delivery, and
                physical presence
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-4">📈</div>
              <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
              <p className="text-gray-600">
                Monitor your growth with comprehensive analytics and
                personalized coaching tips
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16">
          <h3 className="text-3xl font-bold text-gray-800 mb-8">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="text-xl font-semibold mb-2">Upload Your Script</h4>
              <p className="text-gray-600">Import any script in text format</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="text-xl font-semibold mb-2">Analyze & Rehearse</h4>
              <p className="text-gray-600">
                Get AI insights and practice with virtual partners
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="text-xl font-semibold mb-2">Track Progress</h4>
              <p className="text-gray-600">
                Monitor improvements and master your craft
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
        🎬 Interactive Demo
      </h2>
      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analysis">📝 Script Analysis</TabsTrigger>
          <TabsTrigger value="partner">🎭 Scene Partner</TabsTrigger>
          <TabsTrigger value="recording">🎥 Recording</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Script Analysis</CardTitle>
              <CardDescription>
                Upload a script to get AI-powered analysis using proven acting
                methodologies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors">
                <div className="text-6xl mb-4">📄</div>
                <p className="text-lg">Click to use sample script</p>
                <p className="text-sm text-gray-500">
                  or drag and drop your script here
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Acting Methodology
                  </label>
                  <select className="w-full border rounded-md p-2">
                    <option>Stanislavsky Method</option>
                    <option>Meisner Technique</option>
                    <option>Michael Chekhov Technique</option>
                    <option>Uta Hagen</option>
                    <option>Practical Aesthetics</option>
                  </select>
                </div>

                <Button
                  className="w-full"
                  onClick={() =>
                    showNotification("success", "Analysis completed! 🎉")
                  }
                >
                  🔍 Analyze Script
                </Button>
              </div>

              <Card className="bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-900">
                    🎯 Sample Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Main Objective:</h4>
                    <p>To be with Juliet and overcome family obstacles</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Emotional Arc:</h4>
                    <div className="flex gap-4">
                      <Badge>Longing (70%)</Badge>
                      <Badge>Wonder (85%)</Badge>
                      <Badge>Love (95%)</Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Coaching Tips:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>
                        Focus on the visual imagery - really see Juliet as the
                        sun
                      </li>
                      <li>Allow moments of silence for breath and thought</li>
                      <li>
                        Find the balance between passion and vulnerability
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
              <CardTitle>AI Scene Partner</CardTitle>
              <CardDescription>
                Rehearse your scenes with an intelligent AI partner
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="bg-blue-100 rounded-lg p-4 mb-3">
                      <p className="font-medium">Romeo (You):</p>
                      <p className="italic">
                        But soft, what light through yonder window breaks? It is
                        the east, and Juliet is the sun.
                      </p>
                    </div>
                    <div className="bg-purple-100 rounded-lg p-4">
                      <p className="font-medium">Juliet (AI):</p>
                      <p className="italic">
                        O Romeo, Romeo, wherefore art thou Romeo? Deny thy
                        father and refuse thy name.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Button className="w-full">🎤 Start Rehearsal</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recording" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Recording</CardTitle>
              <CardDescription>
                Record your performance and get AI-powered feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-8xl mb-4">🎥</div>
                <p className="text-lg mb-4">
                  Ready to record your performance?
                </p>
                <Button size="lg">⏺️ Start Recording</Button>
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
        📊 Your Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Scripts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">3</div>
            <p className="text-gray-600">Total uploaded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recordings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-purple-600">12</div>
            <p className="text-gray-600">Total performances</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">79</div>
            <p className="text-gray-600">Performance rating</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>📚 Recent Scripts</CardTitle>
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
              <Badge>Analyzed</Badge>
            </div>
            <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
              <div>
                <h4 className="font-semibold">Hamlet - To be or not to be</h4>
                <p className="text-sm text-gray-600">
                  William Shakespeare • Uploaded: Oct 26, 2025
                </p>
              </div>
              <Badge>Analyzed</Badge>
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
              <Badge variant="outline">Processing</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🎥 Recent Recordings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
              <div>
                <h4 className="font-semibold">Romeo & Juliet - Take 3</h4>
                <p className="text-sm text-gray-600">
                  Duration: 3:42 • Oct 30, 2025
                </p>
              </div>
              <Badge className="bg-green-600">Score: 82</Badge>
            </div>
            <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
              <div>
                <h4 className="font-semibold">Hamlet - Take 1</h4>
                <p className="text-sm text-gray-600">
                  Duration: 4:15 • Oct 29, 2025
                </p>
              </div>
              <Badge className="bg-yellow-600">Score: 76</Badge>
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
