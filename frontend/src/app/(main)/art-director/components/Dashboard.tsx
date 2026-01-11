"use client";

import { useEffect, useState } from "react";
import {
  Palette,
  MapPin,
  Boxes,
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface Plugin {
  id: string;
  name: string;
  nameAr: string;
  category: string;
}

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

const quickActions = [
  {
    id: "inspiration",
    icon: Palette,
    title: "إنشاء Mood Board",
    desc: "لوحة إلهام بصرية جديدة",
    color: "#e94560",
  },
  {
    id: "locations",
    icon: MapPin,
    title: "إضافة موقع",
    desc: "تسجيل موقع تصوير جديد",
    color: "#4ade80",
  },
  {
    id: "sets",
    icon: Boxes,
    title: "تحليل ديكور",
    desc: "فحص إعادة الاستخدام",
    color: "#fbbf24",
  },
  {
    id: "documentation",
    icon: FileText,
    title: "إنشاء تقرير",
    desc: "توليد كتاب الإنتاج",
    color: "#60a5fa",
  },
];

const stats = [
  { icon: Sparkles, label: "مشاريع نشطة", value: "3", color: "#e94560" },
  { icon: MapPin, label: "مواقع مسجلة", value: "12", color: "#4ade80" },
  { icon: Boxes, label: "ديكورات", value: "28", color: "#fbbf24" },
  { icon: CheckCircle2, label: "مهام مكتملة", value: "156", color: "#60a5fa" },
];

const defaultPlugins: Plugin[] = [
  { id: "visual-analyzer", name: "Visual Analyzer", nameAr: "محلل الاتساق البصري", category: "التحليل" },
  { id: "terminology-translator", name: "Terminology Translator", nameAr: "مترجم المصطلحات", category: "الترجمة" },
  { id: "budget-optimizer", name: "Budget Optimizer", nameAr: "محسّن الميزانية", category: "الإدارة" },
  { id: "lighting-simulator", name: "Lighting Simulator", nameAr: "محاكي الإضاءة", category: "التصميم" },
  { id: "risk-analyzer", name: "Risk Analyzer", nameAr: "محلل المخاطر", category: "التحليل" },
  { id: "creative-inspiration", name: "Creative Inspiration", nameAr: "الإلهام الإبداعي", category: "التصميم" },
  { id: "location-coordinator", name: "Location Coordinator", nameAr: "منسق المواقع", category: "الإدارة" },
  { id: "set-reusability", name: "Set Reusability", nameAr: "إعادة استخدام الديكور", category: "الاستدامة" },
  { id: "documentation-generator", name: "Documentation Generator", nameAr: "مولد التوثيق", category: "التوثيق" },
];

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [plugins, setPlugins] = useState<Plugin[]>(defaultPlugins);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/plugins")
      .then(res => res.json())
      .then(data => {
        if (data?.plugins) {
          setPlugins(data.plugins);
        }
      })
      .catch(() => setPlugins(defaultPlugins))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="art-director-page">
      <header className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>مرحباً بك في CineArchitect</h1>
          <p style={{ color: "var(--art-text-muted)", fontSize: "16px" }}>مساعدك الذكي لتصميم الديكورات السينمائية</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--art-text-muted)", fontSize: "14px" }}>
          <Clock size={16} />
          <span>{new Date().toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
      </header>

      <section style={{ marginBottom: "32px" }}>
        <div className="art-grid-4">
          {stats.map((stat, index) => (
            <div key={index} className="art-card art-stat-card">
              <div className="art-stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
                <stat.icon size={24} />
              </div>
              <div className="art-stat-info">
                <span className="art-stat-value">{stat.value}</span>
                <span className="art-stat-label">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>إجراءات سريعة</h2>
        <div className="art-grid-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="art-card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: `${action.color}15`,
                border: "none",
                cursor: "pointer",
                textAlign: "left",
              }}
              onClick={() => onNavigate(action.id)}
            >
              <div style={{ background: `${action.color}20`, color: action.color, padding: "10px", borderRadius: "12px" }}>
                <action.icon size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: "16px", marginBottom: "4px" }}>{action.title}</h3>
                <p style={{ color: "var(--art-text-muted)", fontSize: "13px" }}>{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>الأدوات المتاحة ({plugins.length})</h2>
        {loading ? (
          <div className="art-card">جاري تحميل الأدوات من المنصة...</div>
        ) : (
          <div className="art-grid-3">
            {plugins.map((plugin) => (
              <div key={plugin.id} className="art-card" style={{ position: "relative" }}>
                <div style={{ display: "inline-block", background: "var(--art-primary)", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", marginBottom: "12px" }}>
                  {plugin.category}
                </div>
                <h3 style={{ fontSize: "16px", marginBottom: "4px" }}>{plugin.nameAr}</h3>
                <p style={{ color: "var(--art-text-muted)", fontSize: "13px" }}>{plugin.name}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
