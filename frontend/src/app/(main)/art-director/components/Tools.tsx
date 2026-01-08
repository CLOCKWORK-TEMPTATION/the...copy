"use client";

import { useState } from "react";
import {
  Eye, Languages, DollarSign, Sun, AlertTriangle, FileCheck,
  Palette, MapPin, Recycle, BarChart3, FileText, Play, Loader2,
  Box, Clapperboard, GraduationCap, Cuboid, Video
} from "lucide-react";

interface Plugin {
  id: string;
  name: string;
  nameAr: string;
  category: string;
}

interface ToolConfig {
  icon: any;
  color: string;
  inputs: { name: string; label: string; type: string; placeholder?: string; options?: { value: string; label: string }[] }[];
}

const toolConfigs: Record<string, ToolConfig> = {
  "visual-analyzer": {
    icon: Eye,
    color: "#e94560",
    inputs: [
      { name: "sceneId", label: "رقم المشهد", type: "text", placeholder: "مثال: scene-001" },
      { name: "referenceColors", label: "الألوان المرجعية", type: "text", placeholder: "مثال: #FF5733, #3498DB" },
      { name: "lightingCondition", label: "حالة الإضاءة", type: "select", options: [
        { value: "daylight", label: "ضوء النهار" },
        { value: "sunset", label: "غروب الشمس" },
        { value: "night", label: "ليلي" },
        { value: "artificial", label: "إضاءة صناعية" }
      ]}
    ]
  },
  "terminology-translator": {
    icon: Languages,
    color: "#4ade80",
    inputs: [
      { name: "term", label: "المصطلح", type: "text", placeholder: "مثال: Key Light" },
      { name: "sourceLang", label: "اللغة المصدر", type: "select", options: [
        { value: "en", label: "الإنجليزية" },
        { value: "ar", label: "العربية" }
      ]},
      { name: "targetLang", label: "اللغة الهدف", type: "select", options: [
        { value: "ar", label: "العربية" },
        { value: "en", label: "الإنجليزية" }
      ]}
    ]
  },
  "budget-optimizer": {
    icon: DollarSign,
    color: "#fbbf24",
    inputs: [
      { name: "totalBudget", label: "الميزانية الإجمالية", type: "number", placeholder: "100000" },
      { name: "categories", label: "الفئات (مفصولة بفواصل)", type: "text", placeholder: "ديكور, إضاءة, أثاث" },
      { name: "priority", label: "الأولوية", type: "select", options: [
        { value: "quality", label: "الجودة" },
        { value: "cost", label: "التوفير" },
        { value: "balanced", label: "متوازن" }
      ]}
    ]
  },
  "lighting-simulator": {
    icon: Sun,
    color: "#60a5fa",
    inputs: [
      { name: "timeOfDay", label: "وقت اليوم", type: "select", options: [
        { value: "dawn", label: "الفجر" },
        { value: "morning", label: "الصباح" },
        { value: "noon", label: "الظهر" },
        { value: "afternoon", label: "بعد الظهر" },
        { value: "sunset", label: "الغروب" },
        { value: "night", label: "الليل" }
      ]},
      { name: "location", label: "نوع الموقع", type: "select", options: [
        { value: "interior", label: "داخلي" },
        { value: "exterior", label: "خارجي" }
      ]},
      { name: "mood", label: "المزاج المطلوب", type: "text", placeholder: "مثال: درامي، رومانسي" }
    ]
  },
  "risk-analyzer": {
    icon: AlertTriangle,
    color: "#ef4444",
    inputs: [
      { name: "projectPhase", label: "مرحلة المشروع", type: "select", options: [
        { value: "pre-production", label: "ما قبل الإنتاج" },
        { value: "production", label: "الإنتاج" },
        { value: "post-production", label: "ما بعد الإنتاج" }
      ]},
      { name: "budget", label: "الميزانية", type: "number", placeholder: "500000" },
      { name: "timeline", label: "الجدول الزمني (أيام)", type: "number", placeholder: "60" }
    ]
  },
  "creative-inspiration": {
    icon: Palette,
    color: "#ec4899",
    inputs: [
      { name: "sceneDescription", label: "وصف المشهد", type: "textarea", placeholder: "صف المشهد بالتفصيل..." },
      { name: "mood", label: "المزاج", type: "select", options: [
        { value: "romantic", label: "رومانسي" },
        { value: "dramatic", label: "درامي" },
        { value: "mysterious", label: "غامض" },
        { value: "cheerful", label: "مرح" }
      ]},
      { name: "era", label: "الحقبة", type: "text", placeholder: "مثال: الثمانينيات" }
    ]
  },
  "documentation-generator": {
    icon: FileText,
    color: "#8b5cf6",
    inputs: [
      { name: "projectName", label: "اسم المشروع", type: "text", placeholder: "اسم الفيلم" },
      { name: "projectNameAr", label: "اسم المشروع (عربي)", type: "text", placeholder: "الاسم بالعربية" },
      { name: "director", label: "المخرج", type: "text", placeholder: "اسم المخرج" },
      { name: "productionCompany", label: "شركة الإنتاج", type: "text", placeholder: "اسم الشركة" }
    ]
  },
};

const plugins: Plugin[] = [
  { id: "visual-analyzer", name: "Visual Analyzer", nameAr: "محلل الاتساق البصري", category: "التحليل" },
  { id: "terminology-translator", name: "Terminology Translator", nameAr: "مترجم المصطلحات", category: "الترجمة" },
  { id: "budget-optimizer", name: "Budget Optimizer", nameAr: "محسّن الميزانية", category: "الإدارة" },
  { id: "lighting-simulator", name: "Lighting Simulator", nameAr: "محاكي الإضاءة", category: "التصميم" },
  { id: "risk-analyzer", name: "Risk Analyzer", nameAr: "محلل المخاطر", category: "التحليل" },
  { id: "creative-inspiration", name: "Creative Inspiration", nameAr: "الإلهام الإبداعي", category: "التصميم" },
  { id: "documentation-generator", name: "Documentation Generator", nameAr: "مولد التوثيق", category: "التوثيق" },
];

export default function Tools() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    if (!selectedTool) return;
    setLoading(true);
    setResult(null);

    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setResult({
      success: true,
      data: {
        message: "تم تنفيذ الأداة بنجاح",
        tool: selectedTool,
        inputs: formData,
        timestamp: new Date().toISOString(),
      }
    });
    setLoading(false);
  };

  const renderInput = (input: any) => {
    if (input.type === "select") {
      return (
        <select
          className="art-input"
          value={formData[input.name] || ""}
          onChange={(e) => setFormData({ ...formData, [input.name]: e.target.value })}
        >
          <option value="">اختر...</option>
          {input.options?.map((opt: any) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }
    if (input.type === "textarea") {
      return (
        <textarea
          className="art-input"
          placeholder={input.placeholder}
          value={formData[input.name] || ""}
          onChange={(e) => setFormData({ ...formData, [input.name]: e.target.value })}
          rows={4}
          style={{ resize: "none" }}
        />
      );
    }
    return (
      <input
        type={input.type}
        className="art-input"
        placeholder={input.placeholder}
        value={formData[input.name] || ""}
        onChange={(e) => setFormData({ ...formData, [input.name]: e.target.value })}
      />
    );
  };

  return (
    <div className="art-director-page">
      <header className="art-page-header">
        <Play size={32} className="header-icon" />
        <div>
          <h1>جميع الأدوات</h1>
          <p>تشغيل واختبار أدوات CineArchitect</p>
        </div>
      </header>

      <div className="art-tools-layout">
        <aside className="art-tools-sidebar">
          <h3>الأدوات المتاحة ({plugins.length})</h3>
          <div className="art-tools-list">
            {plugins.map((plugin) => {
              const config = toolConfigs[plugin.id];
              const Icon = config?.icon || Play;
              const color = config?.color || "#e94560";
              
              return (
                <button
                  key={plugin.id}
                  className={`art-tool-item ${selectedTool === plugin.id ? "active" : ""}`}
                  onClick={() => {
                    setSelectedTool(plugin.id);
                    setFormData({});
                    setResult(null);
                  }}
                >
                  <Icon size={20} style={{ color }} />
                  <div className="art-tool-info">
                    <span className="art-tool-name-ar">{plugin.nameAr}</span>
                    <span className="art-tool-category">{plugin.category}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <main>
          {!selectedTool ? (
            <div className="art-no-tool-selected">
              <Play size={64} />
              <h2>اختر أداة للبدء</h2>
              <p>اختر أداة من القائمة الجانبية لتشغيلها</p>
            </div>
          ) : (
            <div className="art-tool-workspace">
              <div className="art-tool-header" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                {(() => {
                  const plugin = plugins.find(p => p.id === selectedTool);
                  const config = toolConfigs[selectedTool];
                  const Icon = config?.icon || Play;
                  return (
                    <>
                      <Icon size={32} style={{ color: config?.color }} />
                      <div>
                        <h2 style={{ margin: 0 }}>{plugin?.nameAr}</h2>
                        <p style={{ color: "var(--art-text-muted)", margin: 0 }}>{plugin?.name}</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="art-card art-tool-form">
                <h3 style={{ marginBottom: "16px" }}>المدخلات</h3>
                <div className="art-form-grid">
                  {toolConfigs[selectedTool]?.inputs.map((input) => (
                    <div key={input.name} className={`art-form-group ${input.type === "textarea" ? "full-width" : ""}`}>
                      <label>{input.label}</label>
                      {renderInput(input)}
                    </div>
                  ))}
                </div>
                <button
                  className="art-btn art-execute-btn"
                  onClick={handleExecute}
                  disabled={loading}
                  style={{ marginTop: "16px" }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="art-spinner" />
                      جاري التنفيذ...
                    </>
                  ) : (
                    <>
                      <Play size={18} />
                      تنفيذ
                    </>
                  )}
                </button>
              </div>

              {result && (
                <div className="art-card art-result-card" style={{ animation: "fadeIn 0.3s ease-in-out" }}>
                  <h3>النتيجة</h3>
                  <div className={`art-result-status ${result.success ? "success" : "error"}`}>
                    {result.success ? "تم بنجاح" : "حدث خطأ"}
                  </div>
                  <pre className="art-result-json">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
