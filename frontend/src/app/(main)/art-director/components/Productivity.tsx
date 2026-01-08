"use client";

import { useState } from "react";
import { BarChart3, Clock, AlertTriangle, TrendingUp, Plus } from "lucide-react";

export default function Productivity() {
  const [showTimeForm, setShowTimeForm] = useState(false);
  const [showDelayForm, setShowDelayForm] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [timeForm, setTimeForm] = useState({ task: "", hours: "", category: "design" });
  const [delayForm, setDelayForm] = useState({ reason: "", impact: "low", hoursLost: "" });

  const mockChartData = [
    { name: "تصميم", hours: 45, color: "#e94560" },
    { name: "بناء", hours: 32, color: "#4ade80" },
    { name: "طلاء", hours: 18, color: "#fbbf24" },
    { name: "إضاءة", hours: 12, color: "#60a5fa" },
    { name: "اجتماعات", hours: 8, color: "#a78bfa" },
  ];

  const pieData = [
    { name: "مكتمل", value: 65, color: "#4ade80" },
    { name: "قيد التنفيذ", value: 25, color: "#fbbf24" },
    { name: "متأخر", value: 10, color: "#ef4444" },
  ];

  const handleLogTime = () => {
    setShowTimeForm(false);
    setTimeForm({ task: "", hours: "", category: "design" });
  };

  const handleReportDelay = () => {
    setShowDelayForm(false);
    setDelayForm({ reason: "", impact: "low", hoursLost: "" });
  };

  const loadRecommendations = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRecommendations([
      "تحسين جدولة مهام التصميم لتقليل وقت الانتظار",
      "تخصيص المزيد من الموارد لمرحلة البناء",
      "تقليل عدد الاجتماعات غير الضرورية",
      "استخدام أدوات التواصل الفوري بدلاً من الاجتماعات",
    ]);
  };

  return (
    <div className="art-director-page">
      <header className="art-page-header">
        <BarChart3 size={32} className="header-icon" />
        <div>
          <h1>تحليل الإنتاجية</h1>
          <p>تتبع الوقت والأداء وتحليل التأخيرات</p>
        </div>
      </header>

      <div className="art-toolbar">
        <button className="art-btn" onClick={() => setShowTimeForm(true)}>
          <Clock size={18} />
          تسجيل وقت
        </button>
        <button className="art-btn art-btn-secondary" onClick={() => setShowDelayForm(true)}>
          <AlertTriangle size={18} />
          الإبلاغ عن تأخير
        </button>
        <button className="art-btn art-btn-secondary" onClick={loadRecommendations}>
          <TrendingUp size={18} />
          توصيات التحسين
        </button>
      </div>

      {showTimeForm && (
        <div className="art-card" style={{ marginBottom: "24px", animation: "fadeIn 0.3s ease-in-out" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <Clock size={20} /> تسجيل وقت العمل
          </h3>
          <div className="art-form-grid">
            <div className="art-form-group">
              <label>المهمة</label>
              <input
                type="text"
                className="art-input"
                placeholder="وصف المهمة"
                value={timeForm.task}
                onChange={(e) => setTimeForm({ ...timeForm, task: e.target.value })}
              />
            </div>
            <div className="art-form-group">
              <label>الساعات</label>
              <input
                type="number"
                className="art-input"
                placeholder="عدد الساعات"
                value={timeForm.hours}
                onChange={(e) => setTimeForm({ ...timeForm, hours: e.target.value })}
              />
            </div>
            <div className="art-form-group">
              <label>الفئة</label>
              <select
                className="art-input"
                value={timeForm.category}
                onChange={(e) => setTimeForm({ ...timeForm, category: e.target.value })}
              >
                <option value="design">تصميم</option>
                <option value="construction">بناء</option>
                <option value="painting">طلاء</option>
                <option value="lighting">إضاءة</option>
                <option value="meetings">اجتماعات</option>
              </select>
            </div>
          </div>
          <div className="art-form-actions">
            <button className="art-btn" onClick={handleLogTime}>
              <Plus size={18} /> تسجيل
            </button>
            <button className="art-btn art-btn-secondary" onClick={() => setShowTimeForm(false)}>إلغاء</button>
          </div>
        </div>
      )}

      {showDelayForm && (
        <div className="art-card" style={{ marginBottom: "24px", animation: "fadeIn 0.3s ease-in-out" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <AlertTriangle size={20} /> الإبلاغ عن تأخير
          </h3>
          <div className="art-form-grid">
            <div className="art-form-group full-width">
              <label>سبب التأخير</label>
              <textarea
                className="art-input"
                placeholder="وصف سبب التأخير"
                value={delayForm.reason}
                onChange={(e) => setDelayForm({ ...delayForm, reason: e.target.value })}
                rows={3}
                style={{ resize: "none" }}
              />
            </div>
            <div className="art-form-group">
              <label>مستوى التأثير</label>
              <select
                className="art-input"
                value={delayForm.impact}
                onChange={(e) => setDelayForm({ ...delayForm, impact: e.target.value })}
              >
                <option value="low">منخفض</option>
                <option value="medium">متوسط</option>
                <option value="high">مرتفع</option>
                <option value="critical">حرج</option>
              </select>
            </div>
            <div className="art-form-group">
              <label>الساعات المفقودة</label>
              <input
                type="number"
                className="art-input"
                placeholder="عدد الساعات"
                value={delayForm.hoursLost}
                onChange={(e) => setDelayForm({ ...delayForm, hoursLost: e.target.value })}
              />
            </div>
          </div>
          <div className="art-form-actions">
            <button className="art-btn" onClick={handleReportDelay}>
              <AlertTriangle size={18} /> إبلاغ
            </button>
            <button className="art-btn art-btn-secondary" onClick={() => setShowDelayForm(false)}>إلغاء</button>
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="art-card" style={{ marginBottom: "24px", animation: "fadeIn 0.3s ease-in-out" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <TrendingUp size={20} /> توصيات التحسين
          </h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {recommendations.map((rec, index) => (
              <li key={index} style={{ padding: "12px", background: "rgba(74, 222, 128, 0.1)", borderRadius: "8px", marginBottom: "8px" }}>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="art-grid-2" style={{ gap: "24px" }}>
        <div className="art-card">
          <h3 style={{ marginBottom: "20px" }}>توزيع ساعات العمل</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {mockChartData.map((item, index) => (
              <div key={index} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ width: "80px", fontSize: "14px" }}>{item.name}</span>
                <div style={{ flex: 1, height: "24px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${(item.hours / 50) * 100}%`,
                      height: "100%",
                      background: item.color,
                      borderRadius: "4px",
                    }}
                  />
                </div>
                <span style={{ width: "40px", fontSize: "14px", textAlign: "left" }}>{item.hours}h</span>
              </div>
            ))}
          </div>
        </div>

        <div className="art-card">
          <h3 style={{ marginBottom: "20px" }}>حالة المهام</h3>
          <div style={{ display: "flex", justifyContent: "center", gap: "24px", flexWrap: "wrap" }}>
            {pieData.map((item, index) => (
              <div key={index} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: `conic-gradient(${item.color} 0% ${item.value}%, rgba(255,255,255,0.1) ${item.value}% 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "8px",
                  }}
                >
                  <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "var(--art-card)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                    {item.value}%
                  </div>
                </div>
                <span style={{ fontSize: "14px", color: item.color }}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
