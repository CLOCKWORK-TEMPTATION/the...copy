"use client";

import { useState } from "react";
import { MapPin, Plus, Search, Building, Trees, Mountain } from "lucide-react";

interface Location {
  id: string;
  name: string;
  nameAr: string;
  type: string;
  address: string;
  features: string[];
}

export default function Locations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    nameAr: "",
    type: "interior",
    address: "",
    features: "",
  });

  const handleSearch = async () => {
    try {
      const response = await fetch("/api/locations/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery || undefined }),
      });
      const data = await response.json();
      if (data.success && data.data?.locations) {
        setLocations(data.data.locations);
      } else {
        setLocations([]);
      }
    } catch (error) {
      console.error("Error:", error);
      setLocations([]);
    }
  };

  const handleAddLocation = async () => {
    try {
      const response = await fetch("/api/locations/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          features: formData.features.split(",").map(f => f.trim()).filter(Boolean),
        }),
      });
      const data = await response.json();
      if (data.success) {
        setShowAddForm(false);
        setFormData({ name: "", nameAr: "", type: "interior", address: "", features: "" });
        handleSearch();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "exterior": return Trees;
      case "natural": return Mountain;
      default: return Building;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "interior": return "داخلي";
      case "exterior": return "خارجي";
      case "natural": return "طبيعي";
      case "studio": return "استوديو";
      default: return type;
    }
  };

  return (
    <div className="art-director-page">
      <header className="art-page-header">
        <MapPin size={32} className="header-icon" />
        <div>
          <h1>إدارة المواقع</h1>
          <p>قاعدة بيانات مواقع التصوير والديكورات</p>
        </div>
      </header>

      <div className="art-toolbar">
        <div className="art-search-box">
          <input
            type="text"
            className="art-input"
            placeholder="ابحث عن موقع..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="art-btn" onClick={handleSearch}>
            <Search size={18} />
            بحث
          </button>
        </div>
        <button className="art-btn" onClick={() => setShowAddForm(true)}>
          <Plus size={18} />
          إضافة موقع جديد
        </button>
      </div>

      {showAddForm && (
        <div className="art-card" style={{ marginBottom: "24px", animation: "fadeIn 0.3s ease-in-out" }}>
          <h3 style={{ marginBottom: "20px" }}>إضافة موقع جديد</h3>
          <div className="art-form-grid">
            <div className="art-form-group">
              <label>اسم الموقع (عربي)</label>
              <input
                type="text"
                className="art-input"
                placeholder="مثال: قصر البارون"
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
              />
            </div>
            <div className="art-form-group">
              <label>اسم الموقع (إنجليزي)</label>
              <input
                type="text"
                className="art-input"
                placeholder="Example: Baron Palace"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="art-form-group">
              <label>النوع</label>
              <select
                className="art-input"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="interior">داخلي</option>
                <option value="exterior">خارجي</option>
                <option value="natural">طبيعي</option>
                <option value="studio">استوديو</option>
              </select>
            </div>
            <div className="art-form-group">
              <label>العنوان</label>
              <input
                type="text"
                className="art-input"
                placeholder="العنوان الكامل"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="art-form-group full-width">
              <label>المميزات (مفصولة بفواصل)</label>
              <input
                type="text"
                className="art-input"
                placeholder="مثال: إضاءة طبيعية, مساحة واسعة, موقف سيارات"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              />
            </div>
          </div>
          <div className="art-form-actions">
            <button className="art-btn" onClick={handleAddLocation}>
              <Plus size={18} />
              إضافة
            </button>
            <button className="art-btn art-btn-secondary" onClick={() => setShowAddForm(false)}>
              إلغاء
            </button>
          </div>
        </div>
      )}

      <div className="art-grid-3">
        {locations.length === 0 ? (
          <div className="art-card art-empty-state">
            <MapPin size={48} />
            <h3>لا توجد مواقع</h3>
            <p>ابدأ بإضافة موقع جديد أو قم بالبحث</p>
          </div>
        ) : (
          locations.map((location) => {
            const TypeIcon = getTypeIcon(location.type);
            return (
              <div key={location.id} className="art-card">
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "var(--art-success)", fontSize: "12px" }}>
                  <TypeIcon size={16} />
                  {getTypeLabel(location.type)}
                </div>
                <h3 style={{ marginBottom: "4px" }}>{location.nameAr}</h3>
                <p style={{ color: "var(--art-text-muted)", fontSize: "13px", marginBottom: "8px" }}>{location.name}</p>
                <p style={{ color: "var(--art-text-muted)", fontSize: "12px", marginBottom: "12px" }}>{location.address}</p>
                {location.features && location.features.length > 0 && (
                  <div>
                    {location.features.map((feature, index) => (
                      <span key={index} className="art-feature-tag">{feature}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
