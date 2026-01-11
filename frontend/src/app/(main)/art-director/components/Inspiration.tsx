"use client";

import { useState } from "react";
import { Palette, Sparkles, Image, Wand2 } from "lucide-react";

interface ColorPalette {
  name: string;
  nameAr: string;
  colors: string[];
}

interface MoodBoard {
  theme: string;
  themeAr: string;
  keywords: string[];
  suggestedPalette: ColorPalette;
}

export default function Inspiration() {
  const [sceneDescription, setSceneDescription] = useState("");
  const [mood, setMood] = useState("");
  const [era, setEra] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MoodBoard | null>(null);
  const [palettes, setPalettes] = useState<ColorPalette[]>([]);

  const handleAnalyze = async () => {
    if (!sceneDescription) return;
    setLoading(true);

    try {
      const response = await fetch("/api/inspiration/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneDescription,
          mood: mood || undefined,
          era: era || undefined,
        }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setResult(data.data);
      }
    } catch (error) {
      console.error("Error:", error);
    }

    setLoading(false);
  };

  const handleGeneratePalette = async () => {
    if (!mood) return;
    setLoading(true);

    try {
      const response = await fetch("/api/inspiration/palette", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, count: 3 }),
      });
      const data = await response.json();
      if (data.success && data.data?.palettes) {
        setPalettes(data.data.palettes);
      }
    } catch (error) {
      console.error("Error:", error);
    }

    setLoading(false);
  };

  return (
    <div className="art-director-page">
      <header className="art-page-header">
        <Palette size={32} className="header-icon" />
        <div>
          <h1>الإلهام البصري</h1>
          <p>إنشاء لوحات مزاجية وباليتات ألوان للمشاهد</p>
        </div>
      </header>

      <div className="art-grid-2" style={{ gap: "24px" }}>
        <section className="art-card">
          <h2 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <Wand2 size={20} /> تحليل المشهد
          </h2>

          <div className="art-form-group">
            <label>وصف المشهد</label>
            <textarea
              className="art-input"
              placeholder="صف المشهد بالتفصيل... مثال: مشهد رومانسي في مقهى قديم بباريس في الثلاثينيات"
              value={sceneDescription}
              onChange={(e) => setSceneDescription(e.target.value)}
              rows={4}
              style={{ resize: "none" }}
            />
          </div>

          <div className="art-form-grid">
            <div className="art-form-group">
              <label>المزاج العام</label>
              <select
                className="art-input"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
              >
                <option value="">اختر المزاج</option>
                <option value="romantic">رومانسي</option>
                <option value="dramatic">درامي</option>
                <option value="mysterious">غامض</option>
                <option value="cheerful">مرح</option>
                <option value="melancholic">حزين</option>
                <option value="tense">متوتر</option>
              </select>
            </div>

            <div className="art-form-group">
              <label>الحقبة الزمنية</label>
              <select
                className="art-input"
                value={era}
                onChange={(e) => setEra(e.target.value)}
              >
                <option value="">اختر الحقبة</option>
                <option value="ancient">قديمة</option>
                <option value="medieval">عصور وسطى</option>
                <option value="victorian">فيكتورية</option>
                <option value="1920s">العشرينيات</option>
                <option value="1950s">الخمسينيات</option>
                <option value="1980s">الثمانينيات</option>
                <option value="modern">حديثة</option>
                <option value="futuristic">مستقبلية</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <button className="art-btn" onClick={handleAnalyze} disabled={loading || !sceneDescription}>
              <Sparkles size={18} />
              {loading ? "جاري التحليل..." : "تحليل المشهد"}
            </button>
            <button className="art-btn art-btn-secondary" onClick={handleGeneratePalette} disabled={loading || !mood}>
              <Palette size={18} />
              اقتراح ألوان
            </button>
          </div>
        </section>

        <section>
          {result && (
            <div className="art-card" style={{ marginBottom: "24px", animation: "fadeIn 0.3s ease-in-out" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <Image size={20} /> نتائج التحليل
              </h3>

              <div style={{ marginBottom: "16px" }}>
                <span style={{ color: "var(--art-text-muted)" }}>الموضوع: </span>
                <span style={{ fontWeight: 600 }}>{result.themeAr}</span>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <span style={{ color: "var(--art-text-muted)", display: "block", marginBottom: "8px" }}>الكلمات المفتاحية:</span>
                <div>
                  {result.keywords.map((keyword, index) => (
                    <span key={index} className="art-keyword-tag">{keyword}</span>
                  ))}
                </div>
              </div>

              {result.suggestedPalette && (
                <div>
                  <span style={{ color: "var(--art-text-muted)", display: "block", marginBottom: "8px" }}>
                    الباليت المقترح: {result.suggestedPalette.nameAr}
                  </span>
                  <div className="art-color-row">
                    {result.suggestedPalette.colors.map((color, index) => (
                      <div
                        key={index}
                        className="art-color-swatch"
                        style={{ background: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {palettes.length > 0 && (
            <div className="art-grid-3" style={{ animation: "fadeIn 0.3s ease-in-out" }}>
              {palettes.map((palette, index) => (
                <div key={index} className="art-card">
                  <h4 style={{ marginBottom: "4px" }}>{palette.nameAr}</h4>
                  <p style={{ color: "var(--art-text-muted)", fontSize: "12px", marginBottom: "12px" }}>{palette.name}</p>
                  <div className="art-color-row">
                    {palette.colors.map((color, colorIndex) => (
                      <div
                        key={colorIndex}
                        className="art-color-swatch"
                        style={{ background: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
