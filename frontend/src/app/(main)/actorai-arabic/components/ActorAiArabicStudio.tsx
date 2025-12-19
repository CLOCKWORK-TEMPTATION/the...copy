"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ==================== أنواع البيانات ====================

interface User {
  id: string;
  name: string;
  email: string;
}

interface Script {
  id: string;
  title: string;
  author: string;
  content: string;
  uploadDate: string;
  status: "analyzed" | "processing" | "pending";
}

interface Recording {
  id: string;
  title: string;
  duration: string;
  date: string;
  score: number;
}

interface AnalysisResult {
  objectives: {
    main: string;
    scene: string;
    beats: string[];
  };
  obstacles: {
    internal: string[];
    external: string[];
  };
  emotionalArc: Array<{
    beat: number;
    emotion: string;
    intensity: number;
  }>;
  coachingTips: string[];
}

interface ChatMessage {
  role: "user" | "ai";
  text: string;
  typing?: boolean;
}

interface VocalExercise {
  id: string;
  name: string;
  description: string;
  duration: string;
  category: "breathing" | "articulation" | "projection" | "resonance";
}

type ViewType = "home" | "demo" | "dashboard" | "login" | "register" | "vocal" | "ar";

// ==================== أنواع AR/MR ====================

interface ARFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: "ready" | "coming_soon";
}

interface TeleprompterSettings {
  speed: number;
  fontSize: number;
  opacity: number;
  position: "top" | "center" | "bottom";
}

interface BlockingMark {
  id: string;
  x: number;
  y: number;
  label: string;
  color: string;
}

interface CameraEyeSettings {
  focalLength: number;
  shotType: "closeup" | "medium" | "wide" | "extreme_wide";
  aspectRatio: "16:9" | "2.35:1" | "4:3" | "1:1";
}

interface HolographicPartner {
  character: string;
  emotion: string;
  intensity: number;
  isActive: boolean;
}

interface GestureControl {
  type: "eye" | "hand" | "head" | "voice";
  action: string;
  enabled: boolean;
}

// ==================== البيانات التجريبية ====================

const SAMPLE_SCRIPT = `المشهد الأول - حديقة المنزل - ليلاً

يقف أحمد تحت شرفة ليلى، ينظر إليها بشوق.

أحمد:
يا ليلى، يا قمر الليل، أنتِ نور عيني وروحي.
كيف أستطيع أن أعيش بعيداً عنكِ؟

تظهر ليلى على الشرفة.

ليلى:
يا أحمد، قلبي معك، لكن العائلة تقف بيننا.
ماذا سنفعل؟

أحمد:
سأجد طريقة، مهما كانت الصعوبات.
حبنا أقوى من كل العوائق.`;

const VOCAL_EXERCISES: VocalExercise[] = [
  {
    id: "1",
    name: "تمرين التنفس العميق",
    description: "استنشق ببطء لمدة 4 ثوان، احبس النفس 4 ثوان، ثم أخرج الهواء لمدة 4 ثوان",
    duration: "5 دقائق",
    category: "breathing",
  },
  {
    id: "2",
    name: "تمرين الحروف المتحركة",
    description: "ردد الحروف: آ - إي - أو - إييي - أووو مع التركيز على وضوح كل حرف",
    duration: "3 دقائق",
    category: "articulation",
  },
  {
    id: "3",
    name: "تمرين الإسقاط الصوتي",
    description: "تخيل أن صوتك يصل لنهاية القاعة، ردد جملة 'أنا هنا' بصوت واضح ومُسقَط",
    duration: "4 دقائق",
    category: "projection",
  },
  {
    id: "4",
    name: "تمرين الرنين",
    description: "أغلق فمك وهمهم بصوت 'ممممم' مع الشعور بالاهتزاز في الوجه والصدر",
    duration: "3 دقائق",
    category: "resonance",
  },
  {
    id: "5",
    name: "أعاصير اللسان",
    description: "ردد بسرعة: 'قرقر القمري فوق قمة القرية' - كرر 5 مرات",
    duration: "2 دقائق",
    category: "articulation",
  },
  {
    id: "6",
    name: "تمرين الحجاب الحاجز",
    description: "ضع يدك على بطنك، استنشق حتى تشعر ببطنك يرتفع، ثم أخرج الهواء مع صوت 'هااا'",
    duration: "4 دقائق",
    category: "breathing",
  },
];

const ACTING_METHODOLOGIES = [
  { id: "stanislavsky", name: "طريقة ستانيسلافسكي", nameEn: "Stanislavsky Method" },
  { id: "meisner", name: "تقنية مايسنر", nameEn: "Meisner Technique" },
  { id: "chekhov", name: "تقنية مايكل تشيخوف", nameEn: "Michael Chekhov" },
  { id: "hagen", name: "أوتا هاجن", nameEn: "Uta Hagen" },
  { id: "practical", name: "الجماليات العملية", nameEn: "Practical Aesthetics" },
];

// ==================== بيانات AR/MR ====================

const AR_FEATURES: ARFeature[] = [
  {
    id: "teleprompter",
    name: "Teleprompter معلق",
    description: "نص معلق في الفراغ يتبع نظرتك مع التمرير التلقائي",
    icon: "📜",
    status: "ready",
  },
  {
    id: "blocking",
    name: "علامات Blocking",
    description: "علامات ثلاثية الأبعاد على الأرض لتحديد مواقع الحركة",
    icon: "🎯",
    status: "ready",
  },
  {
    id: "camera_eye",
    name: "عين الكاميرا",
    description: "إطار كاميرا افتراضي لفهم الـ Framing والتكوين",
    icon: "📷",
    status: "ready",
  },
  {
    id: "holographic_partner",
    name: "شريك هولوغرافي",
    description: "شخصية ثلاثية الأبعاد للتدريب على المشاهد الثنائية",
    icon: "👤",
    status: "ready",
  },
  {
    id: "gesture_control",
    name: "تحكم بالإيماءات",
    description: "تحكم بالعين واليد والرأس والصوت",
    icon: "👁️",
    status: "ready",
  },
];

const SHOT_TYPES = [
  { id: "extreme_wide", name: "لقطة واسعة جداً", nameEn: "Extreme Wide Shot" },
  { id: "wide", name: "لقطة واسعة", nameEn: "Wide Shot" },
  { id: "medium", name: "لقطة متوسطة", nameEn: "Medium Shot" },
  { id: "closeup", name: "لقطة قريبة", nameEn: "Close-up" },
];

const GESTURE_CONTROLS: GestureControl[] = [
  { type: "eye", action: "النظر للأعلى = تمرير النص", enabled: true },
  { type: "eye", action: "الرمش المزدوج = إيقاف/تشغيل", enabled: true },
  { type: "hand", action: "رفع اليد = إيقاف الشريك", enabled: true },
  { type: "hand", action: "إشارة OK = استمرار", enabled: true },
  { type: "head", action: "إيماءة الرأس = الموافقة", enabled: true },
  { type: "voice", action: "'توقف' = إيقاف المشهد", enabled: true },
  { type: "voice", action: "'أعد' = إعادة السطر", enabled: true },
];

// ==================== المكون الرئيسي ====================

export const ActorAiArabicStudio: React.FC = () => {
  // حالة التطبيق الرئيسية
  const [currentView, setCurrentView] = useState<ViewType>("home");
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // حالة الإشعارات
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // حالة تحليل النص
  const [scriptText, setScriptText] = useState("");
  const [selectedMethodology, setSelectedMethodology] = useState("stanislavsky");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // حالة شريك المشهد
  const [rehearsing, setRehearsing] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // حالة التسجيل
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordings, setRecordings] = useState<Recording[]>([
    { id: "1", title: "مشهد الحديقة - التجربة 3", duration: "3:42", date: "2025-10-30", score: 82 },
    { id: "2", title: "مشهد اللقاء - التجربة 1", duration: "4:15", date: "2025-10-29", score: 76 },
  ]);

  // حالة النصوص
  const [scripts, setScripts] = useState<Script[]>([
    { id: "1", title: "روميو وجولييت - مشهد الشرفة", author: "شكسبير", content: SAMPLE_SCRIPT, uploadDate: "2025-10-28", status: "analyzed" },
    { id: "2", title: "هاملت - أكون أو لا أكون", author: "شكسبير", content: "...", uploadDate: "2025-10-26", status: "analyzed" },
    { id: "3", title: "عربة اسمها الرغبة - المشهد 3", author: "تينيسي ويليامز", content: "...", uploadDate: "2025-10-25", status: "processing" },
  ]);

  // حالة تمارين الصوت
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [exerciseTimer, setExerciseTimer] = useState(0);

  // حالة AR/MR
  const [arMode, setArMode] = useState<"setup" | "teleprompter" | "blocking" | "camera" | "partner" | "gestures">("setup");
  const [teleprompterSettings, setTeleprompterSettings] = useState<TeleprompterSettings>({
    speed: 50,
    fontSize: 24,
    opacity: 80,
    position: "center",
  });
  const [blockingMarks, setBlockingMarks] = useState<BlockingMark[]>([
    { id: "1", x: 20, y: 30, label: "بداية", color: "#22c55e" },
    { id: "2", x: 50, y: 50, label: "وسط", color: "#3b82f6" },
    { id: "3", x: 80, y: 70, label: "نهاية", color: "#ef4444" },
  ]);
  const [cameraSettings, setCameraSettings] = useState<CameraEyeSettings>({
    focalLength: 50,
    shotType: "medium",
    aspectRatio: "16:9",
  });
  const [holographicPartner, setHolographicPartner] = useState<HolographicPartner>({
    character: "ليلى",
    emotion: "حب",
    intensity: 70,
    isActive: false,
  });
  const [activeGestures, setActiveGestures] = useState<GestureControl[]>(GESTURE_CONTROLS);
  const [arSessionActive, setArSessionActive] = useState(false);
  const [visionProConnected, setVisionProConnected] = useState(false);

  // ==================== الدوال المساعدة ====================

  const showNotification = useCallback((type: "success" | "error" | "info", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const navigate = useCallback((view: ViewType) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  }, [theme]);

  // ==================== وظائف المصادقة ====================

  const handleLogin = useCallback((email: string, password: string) => {
    // محاكاة تسجيل الدخول
    if (email && password) {
      setUser({ id: "1", name: "أحمد محمد", email });
      showNotification("success", "تم تسجيل الدخول بنجاح!");
      navigate("dashboard");
    } else {
      showNotification("error", "يرجى إدخال البيانات الصحيحة");
    }
  }, [navigate, showNotification]);

  const handleRegister = useCallback((name: string, email: string, password: string) => {
    if (name && email && password) {
      setUser({ id: "1", name, email });
      showNotification("success", "تم إنشاء الحساب بنجاح!");
      navigate("dashboard");
    } else {
      showNotification("error", "يرجى ملء جميع الحقول");
    }
  }, [navigate, showNotification]);

  const handleLogout = useCallback(() => {
    setUser(null);
    showNotification("info", "تم تسجيل الخروج");
    navigate("home");
  }, [navigate, showNotification]);

  // ==================== وظائف تحليل النص ====================

  const useSampleScript = useCallback(() => {
    setScriptText(SAMPLE_SCRIPT);
    showNotification("info", "تم تحميل النص التجريبي");
  }, [showNotification]);

  const analyzeScript = useCallback(() => {
    if (!scriptText.trim()) {
      showNotification("error", "يرجى إدخال نص أولاً");
      return;
    }

    setAnalyzing(true);

    // محاكاة تحليل النص
    setTimeout(() => {
      const result: AnalysisResult = {
        objectives: {
          main: "أن يكون مع ليلى ويتغلب على عقبات العائلة",
          scene: "التعبير عن الحب وتقييم مشاعر ليلى تجاهه",
          beats: [
            "مراقبة ليلى من بعيد بشوق",
            "الكشف عن الحضور والتعبير عن المشاعر",
            "تقديم الوعد بإيجاد حل",
          ],
        },
        obstacles: {
          internal: ["الخوف من الرفض", "القلق من اكتشاف العائلة"],
          external: ["المسافة الجسدية (الشرفة)", "معارضة العائلة", "خطر الاكتشاف"],
        },
        emotionalArc: [
          { beat: 1, emotion: "شوق", intensity: 70 },
          { beat: 2, emotion: "أمل", intensity: 85 },
          { beat: 3, emotion: "حب وإصرار", intensity: 95 },
        ],
        coachingTips: [
          "ركز على الصور البصرية - انظر حقاً إلى ليلى كنور في الظلام",
          "اسمح بلحظات صمت للتنفس والتفكير قبل كل جملة",
          "اعثر على التوازن بين الشغف والضعف",
          "استخدم اللغة الشاعرية دون فقدان الأصالة العاطفية",
          "اجعل صوتك يعكس التوتر بين الحب والخوف",
        ],
      };

      setAnalysisResult(result);
      setAnalyzing(false);
      showNotification("success", "تم تحليل النص بنجاح!");
    }, 2500);
  }, [scriptText, showNotification]);

  // ==================== وظائف شريك المشهد ====================

  const startRehearsal = useCallback(() => {
    setRehearsing(true);
    setChatMessages([
      {
        role: "ai",
        text: "مرحباً! أنا شريكك في المشهد. سأقوم بدور ليلى. ابدأ بقول سطرك الأول...",
      },
    ]);
  }, []);

  const sendMessage = useCallback(() => {
    if (!userInput.trim()) return;

    const newMessage: ChatMessage = { role: "user", text: userInput };
    setChatMessages(prev => [...prev, newMessage]);
    setUserInput("");

    // رد الذكاء الاصطناعي
    setTimeout(() => {
      const aiResponses = [
        "يا أحمد، قلبي معك، لكن العائلة تقف بيننا. ماذا سنفعل؟ 💔",
        "أنا خائفة... لكن حبك يعطيني القوة. هل ستبقى معي؟",
        "كلماتك تلمس قلبي... لكن الطريق صعب أمامنا.",
        "أثق بك يا أحمد. سنجد طريقة معاً.",
      ];

      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];

      setChatMessages(prev => [
        ...prev,
        { role: "ai", text: randomResponse, typing: true },
      ]);

      setTimeout(() => {
        setChatMessages(prev =>
          prev.map((msg, idx) =>
            idx === prev.length - 1 ? { ...msg, typing: false } : msg
          )
        );
      }, 1000);
    }, 1500);
  }, [userInput]);

  const endRehearsal = useCallback(() => {
    setRehearsing(false);
    setChatMessages([]);
    showNotification("success", "انتهت جلسة التدريب! أحسنت 👏");
  }, [showNotification]);

  // ==================== وظائف التسجيل ====================

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    setRecordingTime(0);
    showNotification("info", "بدأ التسجيل... 🎥");
  }, [showNotification]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);

    const minutes = Math.floor(recordingTime / 60);
    const seconds = recordingTime % 60;
    const duration = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    const newRecording: Recording = {
      id: Date.now().toString(),
      title: `تسجيل جديد - ${new Date().toLocaleDateString("ar-EG")}`,
      duration,
      date: new Date().toISOString().split("T")[0],
      score: Math.floor(Math.random() * 20) + 75, // نتيجة بين 75-95
    };

    setRecordings(prev => [newRecording, ...prev]);
    showNotification("success", `تم حفظ التسجيل! النتيجة: ${newRecording.score}/100`);
  }, [recordingTime, showNotification]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // ==================== وظائف تمارين الصوت ====================

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeExercise) {
      interval = setInterval(() => {
        setExerciseTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeExercise]);

  const startExercise = useCallback((exerciseId: string) => {
    setActiveExercise(exerciseId);
    setExerciseTimer(0);
    showNotification("info", "ابدأ التمرين الآن!");
  }, [showNotification]);

  const stopExercise = useCallback(() => {
    setActiveExercise(null);
    setExerciseTimer(0);
    showNotification("success", "أحسنت! تم إنهاء التمرين");
  }, [showNotification]);

  // ==================== Auto scroll للدردشة ====================

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // ==================== عرض الإشعارات ====================

  const renderNotification = () => {
    if (!notification) return null;
    return (
      <div className="fixed top-4 left-4 z-50 animate-in slide-in-from-top">
        <Alert variant={notification.type === "error" ? "destructive" : "default"}>
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      </div>
    );
  };

  // ==================== عرض الهيدر ====================

  const renderHeader = () => (
    <header className="bg-gradient-to-l from-blue-900 to-purple-900 text-white p-6 sticky top-0 z-40">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🎭</span>
            <h1 className="text-3xl font-bold">الممثل الذكي</h1>
          </div>

          <nav className="flex items-center gap-2">
            <Button
              onClick={() => navigate("home")}
              variant={currentView === "home" ? "secondary" : "ghost"}
              className={currentView === "home" ? "bg-white text-blue-900" : "text-white hover:bg-blue-800"}
            >
              🏠 الرئيسية
            </Button>
            <Button
              onClick={() => navigate("demo")}
              variant={currentView === "demo" ? "secondary" : "ghost"}
              className={currentView === "demo" ? "bg-white text-blue-900" : "text-white hover:bg-blue-800"}
            >
              🎬 التجربة
            </Button>
            <Button
              onClick={() => navigate("vocal")}
              variant={currentView === "vocal" ? "secondary" : "ghost"}
              className={currentView === "vocal" ? "bg-white text-blue-900" : "text-white hover:bg-blue-800"}
            >
              🎤 تمارين الصوت
            </Button>
            <Button
              onClick={() => navigate("ar")}
              variant={currentView === "ar" ? "secondary" : "ghost"}
              className={currentView === "ar" ? "bg-white text-blue-900" : "text-white hover:bg-blue-800"}
            >
              🥽 تدريب AR/MR
            </Button>

            {user ? (
              <>
                <Button
                  onClick={() => navigate("dashboard")}
                  variant={currentView === "dashboard" ? "secondary" : "ghost"}
                  className={currentView === "dashboard" ? "bg-white text-blue-900" : "text-white hover:bg-blue-800"}
                >
                  📊 لوحة التحكم
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="text-white hover:bg-red-600"
                >
                  🚪 خروج
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => navigate("login")}
                  variant="ghost"
                  className="text-white hover:bg-blue-800"
                >
                  دخول
                </Button>
                <Button
                  onClick={() => navigate("register")}
                  className="bg-white text-blue-900 hover:bg-gray-100"
                >
                  ابدأ الآن
                </Button>
              </>
            )}

            <Button
              onClick={toggleTheme}
              variant="ghost"
              className="text-white hover:bg-blue-800"
              size="icon"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );

  // ==================== صفحة تسجيل الدخول ====================

  const renderLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">🎭</div>
            <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
            <CardDescription>سجل دخولك للوصول إلى حسابك</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              className="w-full"
              onClick={() => handleLogin(email, password)}
            >
              تسجيل الدخول
            </Button>
            <p className="text-sm text-gray-600">
              ليس لديك حساب؟{" "}
              <button
                onClick={() => navigate("register")}
                className="text-blue-600 hover:underline"
              >
                سجل الآن
              </button>
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  };

  // ==================== صفحة التسجيل ====================

  const renderRegister = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">🎭</div>
            <CardTitle className="text-2xl">إنشاء حساب جديد</CardTitle>
            <CardDescription>انضم إلينا وابدأ رحلة التطوير</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم الكامل</Label>
              <Input
                id="name"
                placeholder="أحمد محمد"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              className="w-full"
              onClick={() => handleRegister(name, email, password)}
            >
              إنشاء الحساب
            </Button>
            <p className="text-sm text-gray-600">
              لديك حساب بالفعل؟{" "}
              <button
                onClick={() => navigate("login")}
                className="text-blue-600 hover:underline"
              >
                سجل دخولك
              </button>
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  };

  // ==================== الصفحة الرئيسية ====================

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
          <Button size="lg" onClick={() => navigate("demo")} className="bg-blue-600 hover:bg-blue-700">
            🎬 جرب التطبيق
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("vocal")}>
            🎤 تمارين الصوت
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("register")}>
            ابدأ الآن
          </Button>
        </div>

        <div className="text-8xl opacity-30 mb-12">🎭</div>

        {/* الميزات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mt-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold mb-2">تحليل النصوص</h3>
              <p className="text-gray-600">
                تحليل عميق للأهداف والعقبات والمسارات العاطفية
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2">شريك المشهد الذكي</h3>
              <p className="text-gray-600">
                تدرب على المشاهد مع شريك ذكي يستجيب بطبيعية
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-4">🎤</div>
              <h3 className="text-xl font-semibold mb-2">تمارين الصوت</h3>
              <p className="text-gray-600">
                تمارين نطق وتنفس واسقاط صوتي احترافية
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-4">📈</div>
              <h3 className="text-xl font-semibold mb-2">تتبع التقدم</h3>
              <p className="text-gray-600">
                راقب نموك مع تحليلات شاملة ونصائح مخصصة
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-4">🥽</div>
              <h3 className="text-xl font-semibold mb-2">تدريب AR/MR</h3>
              <p className="text-gray-600">
                تجربة غامرة مع Vision Pro للتدريب الاحترافي
              </p>
              <Badge className="mt-3 bg-purple-600">جديد</Badge>
            </CardContent>
          </Card>
        </div>

        {/* كيف يعمل */}
        <div className="mt-16">
          <h3 className="text-3xl font-bold text-gray-800 mb-8">كيف يعمل</h3>
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
              <p className="text-gray-600">احصل على رؤى الذكاء الاصطناعي وتدرب</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="text-xl font-semibold mb-2">تتبع التقدم</h4>
              <p className="text-gray-600">راقب التحسينات وأتقن حرفتك</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ==================== صفحة التجربة ====================

  const renderDemo = () => (
    <div className="max-w-6xl mx-auto py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">🎬 التجربة التفاعلية</h2>

      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="analysis">📝 تحليل النص</TabsTrigger>
          <TabsTrigger value="partner">🎭 شريك المشهد</TabsTrigger>
          <TabsTrigger value="recording">🎥 التسجيل</TabsTrigger>
        </TabsList>

        {/* تاب تحليل النص */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تحليل النص</CardTitle>
              <CardDescription>
                ارفع نصاً للحصول على تحليل مدعوم بالذكاء الاصطناعي
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* منطقة النص */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>النص المسرحي/السينمائي</Label>
                  <Button variant="outline" size="sm" onClick={useSampleScript}>
                    📄 استخدم نص تجريبي
                  </Button>
                </div>
                <Textarea
                  placeholder="الصق نصك هنا أو استخدم النص التجريبي..."
                  className="min-h-[200px]"
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                />
              </div>

              {/* اختيار المنهجية */}
              <div className="space-y-2">
                <Label>منهجية التمثيل</Label>
                <Select value={selectedMethodology} onValueChange={setSelectedMethodology}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTING_METHODOLOGIES.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name} ({method.nameEn})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* زر التحليل */}
              <Button
                className="w-full"
                onClick={analyzeScript}
                disabled={analyzing || !scriptText.trim()}
              >
                {analyzing ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    جاري التحليل...
                  </>
                ) : (
                  "🔍 حلل النص"
                )}
              </Button>

              {/* نتائج التحليل */}
              {analysisResult && (
                <Card className="bg-blue-50 mt-6">
                  <CardHeader>
                    <CardTitle className="text-blue-900">🎯 نتائج التحليل</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* الأهداف */}
                    <div>
                      <h4 className="font-semibold mb-2 text-lg">الأهداف:</h4>
                      <div className="space-y-2 bg-white p-4 rounded-lg">
                        <p><strong>الهدف الرئيسي:</strong> {analysisResult.objectives.main}</p>
                        <p><strong>هدف المشهد:</strong> {analysisResult.objectives.scene}</p>
                        <div>
                          <strong>النبضات:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {analysisResult.objectives.beats.map((beat, idx) => (
                              <li key={idx}>{beat}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* العقبات */}
                    <div>
                      <h4 className="font-semibold mb-2 text-lg">العقبات:</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg">
                          <strong>داخلية:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {analysisResult.obstacles.internal.map((obs, idx) => (
                              <li key={idx}>{obs}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <strong>خارجية:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {analysisResult.obstacles.external.map((obs, idx) => (
                              <li key={idx}>{obs}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* المسار العاطفي */}
                    <div>
                      <h4 className="font-semibold mb-2 text-lg">المسار العاطفي:</h4>
                      <div className="flex gap-4 flex-wrap">
                        {analysisResult.emotionalArc.map((arc, idx) => (
                          <div key={idx} className="bg-white p-4 rounded-lg text-center">
                            <div className="text-2xl mb-2">
                              {arc.emotion === "شوق" ? "💭" : arc.emotion === "أمل" ? "✨" : "❤️"}
                            </div>
                            <Badge variant="outline">{arc.emotion}</Badge>
                            <Progress value={arc.intensity} className="mt-2 w-20" />
                            <span className="text-sm text-gray-600">{arc.intensity}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* نصائح التدريب */}
                    <div>
                      <h4 className="font-semibold mb-2 text-lg">💡 نصائح التدريب:</h4>
                      <ul className="space-y-2">
                        {analysisResult.coachingTips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2 bg-white p-3 rounded-lg">
                            <span className="text-green-500">✓</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* تاب شريك المشهد */}
        <TabsContent value="partner" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🎭 شريك المشهد الذكي</CardTitle>
              <CardDescription>تدرب على مشاهدك مع شريك ذكي يستجيب لأدائك</CardDescription>
            </CardHeader>
            <CardContent>
              {!rehearsing ? (
                <div className="text-center py-12">
                  <div className="text-8xl mb-6">🎭</div>
                  <h3 className="text-2xl font-semibold mb-4">مستعد للتدريب؟</h3>
                  <p className="text-gray-600 mb-6">
                    سيقوم الذكاء الاصطناعي بدور الشخصية الأخرى في المشهد
                  </p>
                  <Button size="lg" onClick={startRehearsal}>
                    🎬 ابدأ التدريب
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* منطقة الدردشة */}
                  <div className="border rounded-lg p-4 h-[400px] overflow-y-auto bg-gray-50">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`mb-4 ${msg.role === "user" ? "text-left" : "text-right"}`}
                      >
                        <div
                          className={`inline-block p-4 rounded-lg max-w-[80%] ${msg.role === "user"
                              ? "bg-blue-100 text-blue-900"
                              : "bg-purple-100 text-purple-900"
                            }`}
                        >
                          <p className="font-medium mb-1">
                            {msg.role === "user" ? "أنت (أحمد):" : "ليلى (AI):"}
                          </p>
                          <p className={msg.typing ? "animate-pulse" : ""}>
                            {msg.text}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* إدخال الرسالة */}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="اكتب سطرك هنا..."
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      className="flex-1"
                    />
                    <div className="flex flex-col gap-2">
                      <Button onClick={sendMessage} disabled={!userInput.trim()}>
                        📤 إرسال
                      </Button>
                      <Button variant="outline" onClick={endRehearsal}>
                        ⏹️ إنهاء
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* تاب التسجيل */}
        <TabsContent value="recording" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🎥 تسجيل الأداء</CardTitle>
              <CardDescription>
                سجل أداءك واحصل على ملاحظات مدعومة بالذكاء الاصطناعي
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                {!isRecording ? (
                  <>
                    <div className="text-8xl mb-6">🎥</div>
                    <h3 className="text-2xl font-semibold mb-4">مستعد لتسجيل أدائك؟</h3>
                    <Button size="lg" onClick={startRecording}>
                      ⏺️ ابدأ التسجيل
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-8xl mb-6 animate-pulse">🔴</div>
                    <h3 className="text-4xl font-mono font-bold text-red-600 mb-4">
                      {formatTime(recordingTime)}
                    </h3>
                    <p className="text-gray-600 mb-6">جاري التسجيل...</p>
                    <Button size="lg" variant="destructive" onClick={stopRecording}>
                      ⏹️ إيقاف التسجيل
                    </Button>
                  </>
                )}
              </div>

              {/* قائمة التسجيلات */}
              {recordings.length > 0 && (
                <div className="mt-8">
                  <h4 className="font-semibold mb-4">📚 تسجيلاتك السابقة:</h4>
                  <div className="space-y-3">
                    {recordings.map((rec) => (
                      <div
                        key={rec.id}
                        className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div>
                          <h5 className="font-medium">{rec.title}</h5>
                          <p className="text-sm text-gray-600">
                            المدة: {rec.duration} • {rec.date}
                          </p>
                        </div>
                        <Badge
                          className={
                            rec.score >= 80
                              ? "bg-green-600"
                              : rec.score >= 70
                                ? "bg-yellow-600"
                                : "bg-red-600"
                          }
                        >
                          النتيجة: {rec.score}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  // ==================== صفحة تمارين الصوت ====================

  const renderVocalExercises = () => (
    <div className="max-w-6xl mx-auto py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">🎤 تمارين الصوت والنطق</h2>
      <p className="text-gray-600 mb-8">تمارين احترافية لتطوير صوتك وأدائك الصوتي</p>

      {/* التمرين النشط */}
      {activeExercise && (
        <Card className="mb-8 bg-gradient-to-l from-purple-500 to-blue-500 text-white">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold mb-2">
              {VOCAL_EXERCISES.find((e) => e.id === activeExercise)?.name}
            </h3>
            <p className="text-lg mb-4 opacity-90">
              {VOCAL_EXERCISES.find((e) => e.id === activeExercise)?.description}
            </p>
            <div className="text-5xl font-mono font-bold mb-6">
              {formatTime(exerciseTimer)}
            </div>
            <Button
              size="lg"
              variant="secondary"
              onClick={stopExercise}
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              ⏹️ إنهاء التمرين
            </Button>
          </CardContent>
        </Card>
      )}

      {/* قائمة التمارين */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {VOCAL_EXERCISES.map((exercise) => (
          <Card
            key={exercise.id}
            className={`hover:shadow-lg transition-shadow ${activeExercise === exercise.id ? "ring-2 ring-purple-500" : ""
              }`}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {exercise.category === "breathing" && "🌬️"}
                    {exercise.category === "articulation" && "👄"}
                    {exercise.category === "projection" && "📢"}
                    {exercise.category === "resonance" && "🔔"}
                    {exercise.name}
                  </CardTitle>
                  <CardDescription>{exercise.description}</CardDescription>
                </div>
                <Badge variant="outline">{exercise.duration}</Badge>
              </div>
            </CardHeader>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => startExercise(exercise.id)}
                disabled={activeExercise !== null && activeExercise !== exercise.id}
              >
                {activeExercise === exercise.id ? "⏸️ جاري التمرين..." : "▶️ ابدأ التمرين"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* نصائح عامة */}
      <Card className="mt-8 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">💡 نصائح مهمة للتمارين الصوتية</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-yellow-900">
            <li className="flex items-start gap-2">
              <span>✓</span>
              <span>قم بتمارين الإحماء الصوتي قبل أي أداء أو تسجيل</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✓</span>
              <span>اشرب الماء بشكل مستمر للحفاظ على ترطيب الحبال الصوتية</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✓</span>
              <span>تجنب الصراخ أو الهمس المفرط لحماية صوتك</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✓</span>
              <span>مارس التمارين يومياً لمدة 10-15 دقيقة للحصول على أفضل النتائج</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );

  // ==================== صفحة تدريب AR/MR ====================

  const renderARTraining = () => (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">🥽 تدريب AR/MR</h2>
          <p className="text-gray-600">تجربة غامرة للتدريب على التمثيل - جاهز لـ Vision Pro</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge
            variant={visionProConnected ? "default" : "outline"}
            className={visionProConnected ? "bg-green-600" : ""}
          >
            {visionProConnected ? "🔗 Vision Pro متصل" : "⏸️ في انتظار الاتصال"}
          </Badge>
          <Button
            onClick={() => {
              setVisionProConnected(!visionProConnected);
              showNotification(
                visionProConnected ? "info" : "success",
                visionProConnected ? "تم قطع الاتصال" : "تم الاتصال بـ Vision Pro!"
              );
            }}
            variant={visionProConnected ? "destructive" : "default"}
          >
            {visionProConnected ? "قطع الاتصال" : "🥽 اتصل بـ Vision Pro"}
          </Button>
        </div>
      </div>

      {/* شريط الميزات */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {AR_FEATURES.map((feature) => (
          <Card
            key={feature.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              arMode === feature.id ? "ring-2 ring-purple-500 bg-purple-50" : ""
            }`}
            onClick={() => setArMode(feature.id as typeof arMode)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">{feature.icon}</div>
              <h4 className="font-semibold text-sm">{feature.name}</h4>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* محتوى الميزة المختارة */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* منطقة المعاينة */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                👁️ معاينة AR
                {arSessionActive && (
                  <Badge className="bg-red-500 animate-pulse">جلسة نشطة</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* منطقة المعاينة الافتراضية */}
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl aspect-video overflow-hidden">
                {/* شبكة AR */}
                <div className="absolute inset-0 opacity-20">
                  <div className="w-full h-full" style={{
                    backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                    backgroundSize: "50px 50px"
                  }}></div>
                </div>

                {/* Teleprompter معاينة */}
                {arMode === "teleprompter" && (
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 max-w-lg p-6 bg-black/60 rounded-xl border border-cyan-500/50 backdrop-blur"
                    style={{
                      top: teleprompterSettings.position === "top" ? "10%" : teleprompterSettings.position === "center" ? "50%" : "80%",
                      transform: teleprompterSettings.position === "center" ? "translate(-50%, -50%)" : "translateX(-50%)",
                      opacity: teleprompterSettings.opacity / 100,
                      fontSize: `${teleprompterSettings.fontSize}px`,
                    }}
                  >
                    <p className="text-cyan-400 text-center leading-relaxed">
                      يا ليلى، يا قمر الليل، أنتِ نور عيني وروحي.
                      <br />
                      كيف أستطيع أن أعيش بعيداً عنكِ؟
                    </p>
                    <div className="mt-4 flex justify-center">
                      <div className="w-32 h-1 bg-cyan-500/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 rounded-full animate-pulse"
                          style={{ width: `${teleprompterSettings.speed}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* علامات Blocking */}
                {arMode === "blocking" && (
                  <>
                    {blockingMarks.map((mark) => (
                      <div
                        key={mark.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move"
                        style={{ left: `${mark.x}%`, top: `${mark.y}%` }}
                      >
                        <div
                          className="w-16 h-16 rounded-full border-4 flex items-center justify-center text-white font-bold shadow-lg"
                          style={{
                            borderColor: mark.color,
                            backgroundColor: `${mark.color}40`,
                            boxShadow: `0 0 20px ${mark.color}80`
                          }}
                        >
                          {mark.label}
                        </div>
                        <div
                          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 rounded text-xs text-white"
                          style={{ backgroundColor: mark.color }}
                        >
                          النقطة {mark.id}
                        </div>
                      </div>
                    ))}
                    {/* خطوط الاتصال */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.5" />
                          <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.5" />
                        </linearGradient>
                      </defs>
                      <path
                        d={`M ${blockingMarks[0]?.x}% ${blockingMarks[0]?.y}% L ${blockingMarks[1]?.x}% ${blockingMarks[1]?.y}% L ${blockingMarks[2]?.x}% ${blockingMarks[2]?.y}%`}
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="3"
                        strokeDasharray="10,5"
                        className="animate-pulse"
                      />
                    </svg>
                  </>
                )}

                {/* عين الكاميرا */}
                {arMode === "camera" && (
                  <div className="absolute inset-4 border-4 border-yellow-500/70 rounded-lg">
                    {/* زوايا الإطار */}
                    <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-yellow-500"></div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-yellow-500"></div>
                    <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-yellow-500"></div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-yellow-500"></div>

                    {/* خطوط التثليث */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className="border border-yellow-500/20"></div>
                      ))}
                    </div>

                    {/* معلومات اللقطة */}
                    <div className="absolute top-2 left-2 bg-black/70 px-3 py-1 rounded text-yellow-400 text-sm">
                      {cameraSettings.shotType === "closeup" && "لقطة قريبة"}
                      {cameraSettings.shotType === "medium" && "لقطة متوسطة"}
                      {cameraSettings.shotType === "wide" && "لقطة واسعة"}
                      {cameraSettings.shotType === "extreme_wide" && "لقطة واسعة جداً"}
                    </div>
                    <div className="absolute top-2 right-2 bg-black/70 px-3 py-1 rounded text-yellow-400 text-sm">
                      {cameraSettings.aspectRatio}
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/70 px-3 py-1 rounded text-yellow-400 text-sm">
                      {cameraSettings.focalLength}mm
                    </div>
                    <div className="absolute bottom-2 right-2 flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-white text-sm">REC</span>
                    </div>
                  </div>
                )}

                {/* الشريك الهولوغرافي */}
                {arMode === "partner" && (
                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className={`relative ${holographicPartner.isActive ? "animate-pulse" : ""}`}>
                      {/* الهالة */}
                      <div
                        className="absolute inset-0 rounded-full blur-xl"
                        style={{
                          background: `radial-gradient(circle, rgba(168,85,247,${holographicPartner.intensity / 100}) 0%, transparent 70%)`,
                          width: "200px",
                          height: "200px",
                          transform: "translate(-25%, -25%)"
                        }}
                      ></div>

                      {/* الشخصية */}
                      <div className="relative text-center">
                        <div className="text-9xl mb-4 filter drop-shadow-lg" style={{
                          filter: `drop-shadow(0 0 20px rgba(168,85,247,${holographicPartner.intensity / 100}))`
                        }}>
                          👤
                        </div>
                        <div className="bg-purple-900/80 px-4 py-2 rounded-lg backdrop-blur">
                          <p className="text-purple-200 font-bold">{holographicPartner.character}</p>
                          <p className="text-purple-300 text-sm">العاطفة: {holographicPartner.emotion}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-purple-400">الشدة:</span>
                            <div className="flex-1 h-2 bg-purple-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-400"
                                style={{ width: `${holographicPartner.intensity}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* التحكم بالإيماءات */}
                {arMode === "gestures" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-8">
                      {/* العين */}
                      <div className="text-center">
                        <div className="text-6xl mb-2 animate-bounce">👁️</div>
                        <p className="text-cyan-400 text-sm">تتبع العين</p>
                        <div className="mt-2 w-16 h-16 mx-auto border-2 border-cyan-500 rounded-full relative">
                          <div className="absolute w-4 h-4 bg-cyan-500 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping"></div>
                        </div>
                      </div>

                      {/* اليد */}
                      <div className="text-center">
                        <div className="text-6xl mb-2">🤚</div>
                        <p className="text-green-400 text-sm">تتبع اليد</p>
                        <div className="mt-2 flex justify-center gap-1">
                          {[1,2,3,4,5].map((f) => (
                            <div key={f} className="w-2 h-8 bg-green-500/50 rounded-full animate-pulse" style={{ animationDelay: `${f * 0.1}s` }}></div>
                          ))}
                        </div>
                      </div>

                      {/* الرأس */}
                      <div className="text-center">
                        <div className="text-6xl mb-2">🗣️</div>
                        <p className="text-yellow-400 text-sm">تتبع الرأس</p>
                        <div className="mt-2 flex justify-center">
                          <div className="w-12 h-12 border-2 border-yellow-500 rounded-lg relative animate-pulse">
                            <div className="absolute inset-2 border border-yellow-500/50 rounded"></div>
                          </div>
                        </div>
                      </div>

                      {/* الصوت */}
                      <div className="text-center">
                        <div className="text-6xl mb-2">🎙️</div>
                        <p className="text-red-400 text-sm">الأوامر الصوتية</p>
                        <div className="mt-2 flex justify-center items-end gap-1">
                          {[3,5,7,4,6,8,5,3].map((h, i) => (
                            <div
                              key={i}
                              className="w-2 bg-red-500 rounded-full animate-pulse"
                              style={{ height: `${h * 4}px`, animationDelay: `${i * 0.1}s` }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* شاشة الإعداد */}
                {arMode === "setup" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-8xl mb-6 animate-bounce">🥽</div>
                      <h3 className="text-2xl font-bold text-white mb-4">جاهز لتجربة AR/MR</h3>
                      <p className="text-gray-400 mb-6 max-w-md">
                        اختر أحد الأدوات من الأعلى للبدء في إعداد بيئة التدريب الغامرة
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Button
                          size="lg"
                          className="bg-purple-600 hover:bg-purple-700"
                          onClick={() => setArMode("teleprompter")}
                        >
                          📜 ابدأ مع Teleprompter
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* أزرار التحكم */}
              <div className="mt-6 flex justify-center gap-4">
                <Button
                  size="lg"
                  onClick={() => {
                    setArSessionActive(!arSessionActive);
                    showNotification(
                      arSessionActive ? "info" : "success",
                      arSessionActive ? "تم إيقاف الجلسة" : "بدأت جلسة AR!"
                    );
                  }}
                  className={arSessionActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                >
                  {arSessionActive ? "⏹️ إيقاف الجلسة" : "▶️ بدء جلسة AR"}
                </Button>
                <Button variant="outline" onClick={() => setArMode("setup")}>
                  🔄 إعادة ضبط
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* لوحة الإعدادات */}
        <div className="space-y-6">
          {/* إعدادات Teleprompter */}
          {arMode === "teleprompter" && (
            <Card>
              <CardHeader>
                <CardTitle>📜 إعدادات Teleprompter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>سرعة التمرير: {teleprompterSettings.speed}%</Label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={teleprompterSettings.speed}
                    onChange={(e) => setTeleprompterSettings({
                      ...teleprompterSettings,
                      speed: parseInt(e.target.value)
                    })}
                    className="w-full mt-2"
                  />
                </div>
                <div>
                  <Label>حجم الخط: {teleprompterSettings.fontSize}px</Label>
                  <input
                    type="range"
                    min="14"
                    max="48"
                    value={teleprompterSettings.fontSize}
                    onChange={(e) => setTeleprompterSettings({
                      ...teleprompterSettings,
                      fontSize: parseInt(e.target.value)
                    })}
                    className="w-full mt-2"
                  />
                </div>
                <div>
                  <Label>الشفافية: {teleprompterSettings.opacity}%</Label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={teleprompterSettings.opacity}
                    onChange={(e) => setTeleprompterSettings({
                      ...teleprompterSettings,
                      opacity: parseInt(e.target.value)
                    })}
                    className="w-full mt-2"
                  />
                </div>
                <div>
                  <Label>الموقع</Label>
                  <Select
                    value={teleprompterSettings.position}
                    onValueChange={(val) => setTeleprompterSettings({
                      ...teleprompterSettings,
                      position: val as "top" | "center" | "bottom"
                    })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">أعلى</SelectItem>
                      <SelectItem value="center">وسط</SelectItem>
                      <SelectItem value="bottom">أسفل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* إعدادات Blocking */}
          {arMode === "blocking" && (
            <Card>
              <CardHeader>
                <CardTitle>🎯 علامات Blocking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {blockingMarks.map((mark, idx) => (
                  <div key={mark.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: mark.color }}
                    ></div>
                    <div className="flex-1">
                      <Input
                        value={mark.label}
                        onChange={(e) => {
                          const updated = [...blockingMarks];
                          updated[idx].label = e.target.value;
                          setBlockingMarks(updated);
                        }}
                        className="text-sm"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const colors = ["#f59e0b", "#06b6d4", "#ec4899"];
                    setBlockingMarks([
                      ...blockingMarks,
                      {
                        id: (blockingMarks.length + 1).toString(),
                        x: Math.random() * 60 + 20,
                        y: Math.random() * 60 + 20,
                        label: `نقطة ${blockingMarks.length + 1}`,
                        color: colors[blockingMarks.length % colors.length],
                      }
                    ]);
                  }}
                >
                  ➕ إضافة علامة
                </Button>
              </CardContent>
            </Card>
          )}

          {/* إعدادات الكاميرا */}
          {arMode === "camera" && (
            <Card>
              <CardHeader>
                <CardTitle>📷 عين الكاميرا</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>نوع اللقطة</Label>
                  <Select
                    value={cameraSettings.shotType}
                    onValueChange={(val) => setCameraSettings({
                      ...cameraSettings,
                      shotType: val as CameraEyeSettings["shotType"]
                    })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SHOT_TYPES.map((shot) => (
                        <SelectItem key={shot.id} value={shot.id}>
                          {shot.name} ({shot.nameEn})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>نسبة العرض</Label>
                  <Select
                    value={cameraSettings.aspectRatio}
                    onValueChange={(val) => setCameraSettings({
                      ...cameraSettings,
                      aspectRatio: val as CameraEyeSettings["aspectRatio"]
                    })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16:9">16:9 (سينمائي)</SelectItem>
                      <SelectItem value="2.35:1">2.35:1 (واسع)</SelectItem>
                      <SelectItem value="4:3">4:3 (كلاسيكي)</SelectItem>
                      <SelectItem value="1:1">1:1 (مربع)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>البعد البؤري: {cameraSettings.focalLength}mm</Label>
                  <input
                    type="range"
                    min="16"
                    max="200"
                    value={cameraSettings.focalLength}
                    onChange={(e) => setCameraSettings({
                      ...cameraSettings,
                      focalLength: parseInt(e.target.value)
                    })}
                    className="w-full mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* إعدادات الشريك الهولوغرافي */}
          {arMode === "partner" && (
            <Card>
              <CardHeader>
                <CardTitle>👤 الشريك الهولوغرافي</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>اسم الشخصية</Label>
                  <Input
                    value={holographicPartner.character}
                    onChange={(e) => setHolographicPartner({
                      ...holographicPartner,
                      character: e.target.value
                    })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>العاطفة</Label>
                  <Select
                    value={holographicPartner.emotion}
                    onValueChange={(val) => setHolographicPartner({
                      ...holographicPartner,
                      emotion: val
                    })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="حب">❤️ حب</SelectItem>
                      <SelectItem value="غضب">😠 غضب</SelectItem>
                      <SelectItem value="حزن">😢 حزن</SelectItem>
                      <SelectItem value="فرح">😊 فرح</SelectItem>
                      <SelectItem value="خوف">😨 خوف</SelectItem>
                      <SelectItem value="دهشة">😲 دهشة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>شدة العاطفة: {holographicPartner.intensity}%</Label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={holographicPartner.intensity}
                    onChange={(e) => setHolographicPartner({
                      ...holographicPartner,
                      intensity: parseInt(e.target.value)
                    })}
                    className="w-full mt-2"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    setHolographicPartner({
                      ...holographicPartner,
                      isActive: !holographicPartner.isActive
                    });
                    showNotification(
                      "success",
                      holographicPartner.isActive ? "تم إيقاف الشريك" : "تم تفعيل الشريك!"
                    );
                  }}
                  variant={holographicPartner.isActive ? "destructive" : "default"}
                >
                  {holographicPartner.isActive ? "⏹️ إيقاف الشريك" : "▶️ تفعيل الشريك"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* إعدادات الإيماءات */}
          {arMode === "gestures" && (
            <Card>
              <CardHeader>
                <CardTitle>👁️ التحكم بالإيماءات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeGestures.map((gesture, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 border rounded-lg ${gesture.enabled ? "bg-green-50 border-green-200" : "bg-gray-50"}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {gesture.type === "eye" && "👁️"}
                        {gesture.type === "hand" && "🤚"}
                        {gesture.type === "head" && "🗣️"}
                        {gesture.type === "voice" && "🎙️"}
                      </span>
                      <span className="text-sm">{gesture.action}</span>
                    </div>
                    <Button
                      size="sm"
                      variant={gesture.enabled ? "default" : "outline"}
                      onClick={() => {
                        const updated = [...activeGestures];
                        updated[idx].enabled = !updated[idx].enabled;
                        setActiveGestures(updated);
                      }}
                    >
                      {gesture.enabled ? "✓" : "○"}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* بطاقة المعلومات */}
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="text-purple-800">💡 نصائح AR/MR</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-purple-900">
                <li className="flex items-start gap-2">
                  <span>🥽</span>
                  <span>تأكد من اتصال Vision Pro قبل بدء الجلسة</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>💡</span>
                  <span>اختر إضاءة مناسبة لأفضل تتبع</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>🎯</span>
                  <span>ابدأ بمساحة خالية 3×3 متر على الأقل</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>🔋</span>
                  <span>شحن الجهاز لأكثر من 50% للجلسات الطويلة</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ميزات قادمة */}
      <Card className="mt-8 bg-gradient-to-l from-indigo-900 to-purple-900 text-white">
        <CardHeader>
          <CardTitle>🚀 ميزات قادمة في الإصدارات المقبلة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-4xl mb-3">🎭</div>
              <h4 className="font-bold mb-2">التقاط الحركة</h4>
              <p className="text-purple-200 text-sm">تسجيل وتحليل حركات الجسم كاملة</p>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl mb-3">🌍</div>
              <h4 className="font-bold mb-2">بيئات افتراضية</h4>
              <p className="text-purple-200 text-sm">مشاهد ثلاثية الأبعاد كاملة للتدريب</p>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl mb-3">👥</div>
              <h4 className="font-bold mb-2">تدريب جماعي</h4>
              <p className="text-purple-200 text-sm">التدريب مع ممثلين آخرين عن بُعد</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ==================== لوحة التحكم ====================

  const renderDashboard = () => (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          📊 مرحباً، {user?.name || "ضيف"}!
        </h2>
        <Badge variant="outline" className="text-lg px-4 py-2">
          عضو منذ أكتوبر 2025
        </Badge>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">النصوص</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">{scripts.length}</div>
            <p className="text-gray-500 text-sm">إجمالي المرفوع</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">التسجيلات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-purple-600">{recordings.length}</div>
            <p className="text-gray-500 text-sm">إجمالي العروض</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">متوسط النقاط</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">
              {recordings.length > 0
                ? Math.round(recordings.reduce((a, b) => a + b.score, 0) / recordings.length)
                : 0}
            </div>
            <p className="text-gray-500 text-sm">تقييم الأداء</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">ساعات التدريب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-orange-600">12.5</div>
            <p className="text-gray-500 text-sm">هذا الشهر</p>
          </CardContent>
        </Card>
      </div>

      {/* النصوص الأخيرة */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>📚 النصوص الأخيرة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scripts.map((script) => (
              <div
                key={script.id}
                className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div>
                  <h4 className="font-semibold">{script.title}</h4>
                  <p className="text-sm text-gray-600">
                    {script.author} • تاريخ الرفع: {script.uploadDate}
                  </p>
                </div>
                <Badge
                  variant={script.status === "analyzed" ? "default" : "outline"}
                  className={script.status === "analyzed" ? "bg-green-600" : ""}
                >
                  {script.status === "analyzed"
                    ? "مُحلل ✓"
                    : script.status === "processing"
                      ? "جاري المعالجة..."
                      : "في الانتظار"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* التسجيلات الأخيرة */}
      <Card>
        <CardHeader>
          <CardTitle>🎥 التسجيلات الأخيرة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recordings.map((rec) => (
              <div
                key={rec.id}
                className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div>
                  <h4 className="font-semibold">{rec.title}</h4>
                  <p className="text-sm text-gray-600">
                    المدة: {rec.duration} • {rec.date}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <Progress value={rec.score} />
                  </div>
                  <Badge
                    className={
                      rec.score >= 80
                        ? "bg-green-600"
                        : rec.score >= 70
                          ? "bg-yellow-600"
                          : "bg-red-600"
                    }
                  >
                    {rec.score}/100
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ==================== الـ Footer ====================

  const renderFooter = () => (
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              🎭 الممثل الذكي
            </h3>
            <p className="text-gray-400">
              منصة تدريب الممثلين بالذكاء الاصطناعي
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">المنتج</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="hover:text-white cursor-pointer">التجربة</li>
              <li className="hover:text-white cursor-pointer">الميزات</li>
              <li className="hover:text-white cursor-pointer">الأسعار</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">الموارد</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="hover:text-white cursor-pointer">المدونة</li>
              <li className="hover:text-white cursor-pointer">الدروس</li>
              <li className="hover:text-white cursor-pointer">الدعم</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">تواصل معنا</h4>
            <p className="text-gray-400">© 2025 الممثل الذكي</p>
          </div>
        </div>
      </div>
    </footer>
  );

  // ==================== تحديد المحتوى الرئيسي ====================

  const renderMainContent = () => {
    switch (currentView) {
      case "home":
        return renderHome();
      case "demo":
        return renderDemo();
      case "vocal":
        return renderVocalExercises();
      case "ar":
        return renderARTraining();
      case "dashboard":
        return renderDashboard();
      case "login":
        return renderLogin();
      case "register":
        return renderRegister();
      default:
        return renderHome();
    }
  };

  // ==================== العرض النهائي ====================

  return (
    <div className={`min-h-screen ${theme === "dark" ? "dark bg-gray-900" : "bg-gray-50"}`} dir="rtl">
      {renderHeader()}
      {renderNotification()}
      <main className="container mx-auto px-4 py-8">
        {renderMainContent()}
      </main>
      {renderFooter()}
    </div>
  );
};
