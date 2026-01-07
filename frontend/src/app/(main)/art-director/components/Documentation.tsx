"use client";

import { useState } from "react";
import { FileText, Book, PenTool, Download, Plus } from "lucide-react";

interface ProductionBook {
  title: string;
  titleAr: string;
  sections: string[];
  createdAt: string;
}

interface StyleGuide {
  name: string;
  nameAr: string;
  elements: string[];
}

export default function Documentation() {
  const [showBookForm, setShowBookForm] = useState(false);
  const [showDecisionForm, setShowDecisionForm] = useState(false);
  const [productionBook, setProductionBook] = useState<ProductionBook | null>(null);
  const [styleGuide, setStyleGuide] = useState<StyleGuide | null>(null);
  const [loading, setLoading] = useState(false);

  const [bookForm, setBookForm] = useState({
    projectName: "",
    projectNameAr: "",
    director: "",
    productionCompany: "",
  });

  const [decisionForm, setDecisionForm] = useState({
    title: "",
    description: "",
    category: "color",
    rationale: "",
  });

  const handleGenerateBook = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setProductionBook({
      title: bookForm.projectName || "New Project",
      titleAr: bookForm.projectNameAr || "مشروع جديد",
      sections: [
        "مقدمة المشروع",
        "رؤية الإخراج الفنية",
        "لوحات الألوان والمزاج",
        "قائمة المواقع",
        "مخطط الديكورات",
        "جدول الإكسسوارات",
        "خطة الإضاءة",
        "ميزانية قسم الفن",
      ],
      createdAt: new Date().toISOString(),
    });
    setShowBookForm(false);
    setLoading(false);
  };

  const handleGenerateStyleGuide = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setStyleGuide({
      name: "Visual Style Guide",
      nameAr: "دليل الأسلوب البصري",
      elements: [
        "لوحة الألوان الرئيسية",
        "الألوان الثانوية",
        "أنماط الإضاءة",
        "الخامات والملمس",
        "أنماط الأثاث",
        "الإكسسوارات المميزة",
        "الخطوط والطباعة",
      ],
    });
    setLoading(false);
  };

  const handleLogDecision = () => {
    setShowDecisionForm(false);
    setDecisionForm({ title: "", description: "", category: "color", rationale: "" });
  };

  return (
    <div className="art-director-page">
      <header className="art-page-header">
        <FileText size={32} className="header-icon" />
        <div>
          <h1>التوثيق التلقائي</h1>
          <p>إنشاء كتب الإنتاج وأدلة الأسلوب</p>
        </div>
      </header>

      <div className="art-toolbar">
        <button className="art-btn" onClick={() => setShowBookForm(true)}>
          <Book size={18} />
          إنشاء كتاب إنتاج
        </button>
        <button className="art-btn art-btn-secondary" onClick={handleGenerateStyleGuide} disabled={loading}>
          <PenTool size={18} />
          دليل الأسلوب
        </button>
        <button className="art-btn art-btn-secondary" onClick={() => setShowDecisionForm(true)}>
          <Plus size={18} />
          توثيق قرار
        </button>
      </div>

      {showBookForm && (
        <div className="art-card" style={{ marginBottom: "24px", animation: "fadeIn 0.3s ease-in-out" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <Book size={20} /> إنشاء كتاب الإنتاج
          </h3>
          <div className="art-form-grid">
            <div className="art-form-group">
              <label>اسم المشروع (عربي)</label>
              <input
                type="text"
                className="art-input"
                placeholder="مثال: رحلة إلى المجهول"
                value={bookForm.projectNameAr}
                onChange={(e) => setBookForm({ ...bookForm, projectNameAr: e.target.value })}
              />
            </div>
            <div className="art-form-group">
              <label>اسم المشروع (إنجليزي)</label>
              <input
                type="text"
                className="art-input"
                placeholder="Example: Journey to the Unknown"
                value={bookForm.projectName}
                onChange={(e) => setBookForm({ ...bookForm, projectName: e.target.value })}
              />
            </div>
            <div className="art-form-group">
              <label>المخرج</label>
              <input
                type="text"
                className="art-input"
                placeholder="اسم المخرج"
                value={bookForm.director}
                onChange={(e) => setBookForm({ ...bookForm, director: e.target.value })}
              />
            </div>
            <div className="art-form-group">
              <label>شركة الإنتاج</label>
              <input
                type="text"
                className="art-input"
                placeholder="اسم الشركة"
                value={bookForm.productionCompany}
                onChange={(e) => setBookForm({ ...bookForm, productionCompany: e.target.value })}
              />
            </div>
          </div>
          <div className="art-form-actions">
            <button className="art-btn" onClick={handleGenerateBook} disabled={loading}>
              <Book size={18} />
              {loading ? "جاري الإنشاء..." : "إنشاء"}
            </button>
            <button className="art-btn art-btn-secondary" onClick={() => setShowBookForm(false)}>إلغاء</button>
          </div>
        </div>
      )}

      {showDecisionForm && (
        <div className="art-card" style={{ marginBottom: "24px", animation: "fadeIn 0.3s ease-in-out" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <PenTool size={20} /> توثيق قرار إبداعي
          </h3>
          <div className="art-form-grid">
            <div className="art-form-group full-width">
              <label>عنوان القرار</label>
              <input
                type="text"
                className="art-input"
                placeholder="مثال: اختيار اللون الرئيسي للديكور"
                value={decisionForm.title}
                onChange={(e) => setDecisionForm({ ...decisionForm, title: e.target.value })}
              />
            </div>
            <div className="art-form-group full-width">
              <label>الوصف</label>
              <textarea
                className="art-input"
                placeholder="وصف تفصيلي للقرار"
                value={decisionForm.description}
                onChange={(e) => setDecisionForm({ ...decisionForm, description: e.target.value })}
                rows={3}
                style={{ resize: "none" }}
              />
            </div>
            <div className="art-form-group">
              <label>الفئة</label>
              <select
                className="art-input"
                value={decisionForm.category}
                onChange={(e) => setDecisionForm({ ...decisionForm, category: e.target.value })}
              >
                <option value="color">الألوان</option>
                <option value="lighting">الإضاءة</option>
                <option value="props">الإكسسوارات</option>
                <option value="furniture">الأثاث</option>
                <option value="texture">الخامات</option>
              </select>
            </div>
            <div className="art-form-group">
              <label>المبرر</label>
              <input
                type="text"
                className="art-input"
                placeholder="سبب اتخاذ هذا القرار"
                value={decisionForm.rationale}
                onChange={(e) => setDecisionForm({ ...decisionForm, rationale: e.target.value })}
              />
            </div>
          </div>
          <div className="art-form-actions">
            <button className="art-btn" onClick={handleLogDecision}>
              <Plus size={18} />
              توثيق
            </button>
            <button className="art-btn art-btn-secondary" onClick={() => setShowDecisionForm(false)}>إلغاء</button>
          </div>
        </div>
      )}

      <div className="art-grid-2" style={{ gap: "24px" }}>
        {productionBook && (
          <div className="art-card" style={{ animation: "fadeIn 0.3s ease-in-out" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <Book size={24} style={{ color: "var(--art-primary)" }} />
              <div>
                <h3 style={{ margin: 0 }}>{productionBook.titleAr}</h3>
                <p style={{ color: "var(--art-text-muted)", margin: 0, fontSize: "14px" }}>{productionBook.title}</p>
              </div>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <h4 style={{ marginBottom: "12px" }}>الأقسام:</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {productionBook.sections.map((section, index) => (
                  <li key={index} style={{ padding: "8px 12px", background: "rgba(255,255,255,0.05)", borderRadius: "6px", marginBottom: "6px", fontSize: "14px" }}>
                    {section}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ color: "var(--art-text-muted)", fontSize: "12px", marginBottom: "16px" }}>
              تاريخ الإنشاء: {new Date(productionBook.createdAt).toLocaleDateString("ar-EG")}
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button className="art-btn art-btn-secondary">
                <Download size={16} /> PDF
              </button>
              <button className="art-btn art-btn-secondary">
                <Download size={16} /> Word
              </button>
            </div>
          </div>
        )}

        {styleGuide && (
          <div className="art-card" style={{ animation: "fadeIn 0.3s ease-in-out" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <PenTool size={24} style={{ color: "var(--art-purple)" }} />
              <div>
                <h3 style={{ margin: 0 }}>{styleGuide.nameAr}</h3>
                <p style={{ color: "var(--art-text-muted)", margin: 0, fontSize: "14px" }}>{styleGuide.name}</p>
              </div>
            </div>
            <div>
              <h4 style={{ marginBottom: "12px" }}>العناصر:</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {styleGuide.elements.map((element, index) => (
                  <span key={index} className="art-element-tag">{element}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
