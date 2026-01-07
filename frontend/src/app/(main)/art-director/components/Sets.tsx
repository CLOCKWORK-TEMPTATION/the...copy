"use client";

import { useState } from "react";
import { Boxes, Recycle, Leaf, Plus } from "lucide-react";

interface SetPiece {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  condition: string;
  reusabilityScore: number;
}

interface SustainabilityReport {
  totalPieces: number;
  reusablePercentage: number;
  estimatedSavings: number;
  environmentalImpact: string;
}

const defaultPieces: SetPiece[] = [
  { id: "1", name: "Classic Sofa", nameAr: "كنبة كلاسيكية", category: "أثاث", condition: "excellent", reusabilityScore: 95 },
  { id: "2", name: "Vintage Chandelier", nameAr: "نجفة عتيقة", category: "إضاءة", condition: "good", reusabilityScore: 80 },
  { id: "3", name: "Wooden Bookshelf", nameAr: "مكتبة خشبية", category: "أثاث", condition: "excellent", reusabilityScore: 90 },
  { id: "4", name: "Persian Carpet", nameAr: "سجادة فارسية", category: "أقمشة", condition: "fair", reusabilityScore: 60 },
];

export default function Sets() {
  const [pieces, setPieces] = useState<SetPiece[]>(defaultPieces);
  const [report, setReport] = useState<SustainabilityReport | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    nameAr: "",
    category: "أثاث",
    condition: "excellent",
    dimensions: "",
  });

  const handleAddPiece = () => {
    const newPiece: SetPiece = {
      id: Date.now().toString(),
      name: formData.name,
      nameAr: formData.nameAr,
      category: formData.category,
      condition: formData.condition,
      reusabilityScore: formData.condition === "excellent" ? 95 : formData.condition === "good" ? 75 : formData.condition === "fair" ? 50 : 25,
    };
    setPieces([...pieces, newPiece]);
    setShowAddForm(false);
    setFormData({ name: "", nameAr: "", category: "أثاث", condition: "excellent", dimensions: "" });
  };

  const loadSustainabilityReport = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setReport({
      totalPieces: pieces.length,
      reusablePercentage: 78,
      estimatedSavings: 45000,
      environmentalImpact: "تقليل البصمة الكربونية بنسبة 23%",
    });
    setLoading(false);
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "excellent": return "#4ade80";
      case "good": return "#fbbf24";
      case "fair": return "#f97316";
      default: return "#ef4444";
    }
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case "excellent": return "ممتاز";
      case "good": return "جيد";
      case "fair": return "مقبول";
      default: return "سيء";
    }
  };

  return (
    <div className="art-director-page">
      <header className="art-page-header">
        <Boxes size={32} className="header-icon" />
        <div>
          <h1>إدارة الديكورات</h1>
          <p>تتبع قطع الديكور وتحليل إعادة الاستخدام</p>
        </div>
      </header>

      <div className="art-toolbar">
        <button className="art-btn" onClick={() => setShowAddForm(true)}>
          <Plus size={18} />
          إضافة قطعة
        </button>
        <button className="art-btn art-btn-secondary" onClick={loadSustainabilityReport} disabled={loading}>
          <Leaf size={18} />
          {loading ? "جاري التحميل..." : "تقرير الاستدامة"}
        </button>
      </div>

      {showAddForm && (
        <div className="art-card" style={{ marginBottom: "24px", animation: "fadeIn 0.3s ease-in-out" }}>
          <h3 style={{ marginBottom: "20px" }}>إضافة قطعة ديكور</h3>
          <div className="art-form-grid">
            <div className="art-form-group">
              <label>الاسم (عربي)</label>
              <input
                type="text"
                className="art-input"
                placeholder="مثال: كنبة كلاسيكية"
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
              />
            </div>
            <div className="art-form-group">
              <label>الاسم (إنجليزي)</label>
              <input
                type="text"
                className="art-input"
                placeholder="Example: Classic Sofa"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="art-form-group">
              <label>الفئة</label>
              <select
                className="art-input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="أثاث">أثاث</option>
                <option value="إكسسوارات">إكسسوارات</option>
                <option value="إضاءة">إضاءة</option>
                <option value="أقمشة">أقمشة</option>
                <option value="هياكل">هياكل</option>
              </select>
            </div>
            <div className="art-form-group">
              <label>الحالة</label>
              <select
                className="art-input"
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              >
                <option value="excellent">ممتاز</option>
                <option value="good">جيد</option>
                <option value="fair">مقبول</option>
                <option value="poor">سيء</option>
              </select>
            </div>
            <div className="art-form-group full-width">
              <label>الأبعاد</label>
              <input
                type="text"
                className="art-input"
                placeholder="مثال: 200×80×90 سم"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
              />
            </div>
          </div>
          <div className="art-form-actions">
            <button className="art-btn" onClick={handleAddPiece}>
              <Plus size={18} />
              إضافة
            </button>
            <button className="art-btn art-btn-secondary" onClick={() => setShowAddForm(false)}>
              إلغاء
            </button>
          </div>
        </div>
      )}

      {report && (
        <div className="art-card" style={{ marginBottom: "24px", animation: "fadeIn 0.3s ease-in-out" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <Leaf size={20} /> تقرير الاستدامة
          </h3>
          <div className="art-grid-3" style={{ marginBottom: "20px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: 700 }}>{report.totalPieces}</div>
              <div style={{ color: "var(--art-text-muted)", fontSize: "14px" }}>إجمالي القطع</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: 700, color: "#4ade80" }}>{report.reusablePercentage}%</div>
              <div style={{ color: "var(--art-text-muted)", fontSize: "14px" }}>قابل لإعادة الاستخدام</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: 700, color: "#fbbf24" }}>${report.estimatedSavings}</div>
              <div style={{ color: "var(--art-text-muted)", fontSize: "14px" }}>توفير متوقع</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", background: "rgba(74, 222, 128, 0.1)", borderRadius: "10px" }}>
            <Recycle size={18} style={{ color: "#4ade80" }} />
            <span>{report.environmentalImpact}</span>
          </div>
        </div>
      )}

      <div className="art-grid-4">
        {pieces.length === 0 ? (
          <div className="art-card art-empty-state">
            <Boxes size={48} />
            <h3>لا توجد قطع</h3>
            <p>ابدأ بإضافة قطع ديكور جديدة</p>
          </div>
        ) : (
          pieces.map((piece) => (
            <div key={piece.id} className="art-card">
              <div style={{ display: "inline-block", background: "var(--art-primary)", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", marginBottom: "12px" }}>
                {piece.category}
              </div>
              <h4 style={{ marginBottom: "4px" }}>{piece.nameAr}</h4>
              <p style={{ color: "var(--art-text-muted)", fontSize: "12px", marginBottom: "12px" }}>{piece.name}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  className="art-condition-badge"
                  style={{ background: `${getConditionColor(piece.condition)}20`, color: getConditionColor(piece.condition) }}
                >
                  {getConditionLabel(piece.condition)}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}>
                  <Recycle size={14} />
                  {piece.reusabilityScore}%
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
