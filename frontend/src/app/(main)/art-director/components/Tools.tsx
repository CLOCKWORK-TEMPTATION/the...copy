"use client";

import { useEffect, useState } from "react";
import { Play, Loader2 } from "lucide-react";
import { toolConfigs, ToolId, ToolInput } from "../core/toolConfigs";

interface Plugin {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  version?: string;
}

export default function Tools() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [selectedTool, setSelectedTool] = useState<ToolId | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/plugins")
      .then(res => res.json())
      .then(data => {
        setPlugins(data.plugins || []);

        const firstAvailable = (data.plugins || [])
          .map((p: Plugin) => p.id)
          .find((id: string) => toolConfigs[id as ToolId]) as ToolId | undefined;

        if (!selectedTool && firstAvailable) {
          setSelectedTool(firstAvailable);
        }
      })
      .catch(() => setPlugins([]));
  }, [selectedTool]);

  const handleExecute = async () => {
    if (!selectedTool) return;

    const config = toolConfigs[selectedTool];
    if (!config) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setResult(data);

      if (!response.ok || data.success === false) {
        setError(data.error || "فشل تنفيذ الأداة");
      }
    } catch (err) {
      setError("تعذر الاتصال بالخادم الرئيسي");
    }

    setLoading(false);
  };

  const renderInput = (input: ToolInput) => {
    if (input.type === "select") {
      return (
        <select
          className="art-input"
          value={formData[input.name] || ""}
          onChange={(e) => setFormData({ ...formData, [input.name]: e.target.value })}
        >
          <option value="">اختر...</option>
          {input.options?.map((opt) => (
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

  const renderInputs = () => {
    if (!selectedTool) return null;

    const inputs = toolConfigs[selectedTool]?.inputs || [];

    return inputs.map((input) => (
      <div key={input.name} className={`art-form-group ${input.type === "textarea" ? "full-width" : ""}`}>
        <label>{input.label}</label>
        {renderInput(input)}
      </div>
    ));
  };

  const selectedPlugin = selectedTool ? plugins.find(p => p.id === selectedTool) : null;
  const selectedConfig = selectedTool ? toolConfigs[selectedTool] : null;

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
              const config = toolConfigs[plugin.id as ToolId];
              const Icon = config?.icon || Play;
              const color = config?.color || "#e94560";

              return (
                <button
                  key={plugin.id}
                  className={`art-tool-item ${selectedTool === plugin.id ? "active" : ""}`}
                  onClick={() => {
                    setSelectedTool(plugin.id as ToolId);
                    setFormData({});
                    setResult(null);
                    setError(null);
                  }}
                  style={{ '--tool-color': color } as any}
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
                {selectedConfig && (
                  <selectedConfig.icon size={32} style={{ color: selectedConfig.color }} />
                )}
                <div>
                  <h2 style={{ margin: 0 }}>{selectedPlugin?.nameAr}</h2>
                  <p style={{ color: "var(--art-text-muted)", margin: 0 }}>{selectedPlugin?.name}</p>
                </div>
              </div>

              <div className="art-card art-tool-form">
                <h3 style={{ marginBottom: "16px" }}>المدخلات</h3>
                <div className="art-form-grid">{renderInputs()}</div>
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

                {error && (
                  <div className="art-alert art-alert-error" style={{ marginTop: "12px" }}>
                    {error}
                  </div>
                )}
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
