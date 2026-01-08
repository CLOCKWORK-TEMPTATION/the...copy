"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Palette,
  MapPin,
  Boxes,
  BarChart3,
  FileText,
  Film,
  Wrench,
} from "lucide-react";
import "./art-director.css";

import Dashboard from "./components/Dashboard";
import Tools from "./components/Tools";
import Inspiration from "./components/Inspiration";
import Locations from "./components/Locations";
import Sets from "./components/Sets";
import Productivity from "./components/Productivity";
import Documentation from "./components/Documentation";

const navItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "لوحة التحكم", labelEn: "Dashboard" },
  { id: "tools", icon: Wrench, label: "جميع الأدوات", labelEn: "All Tools" },
  { id: "inspiration", icon: Palette, label: "الإلهام البصري", labelEn: "Inspiration" },
  { id: "locations", icon: MapPin, label: "المواقع", labelEn: "Locations" },
  { id: "sets", icon: Boxes, label: "الديكورات", labelEn: "Sets" },
  { id: "productivity", icon: BarChart3, label: "الإنتاجية", labelEn: "Productivity" },
  { id: "documentation", icon: FileText, label: "التوثيق", labelEn: "Documentation" },
];

export default function ArtDirectorStudio() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard onNavigate={setActiveTab} />;
      case "tools":
        return <Tools />;
      case "inspiration":
        return <Inspiration />;
      case "locations":
        return <Locations />;
      case "sets":
        return <Sets />;
      case "productivity":
        return <Productivity />;
      case "documentation":
        return <Documentation />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="art-director-layout">
      <aside className="art-director-sidebar">
        <div className="art-director-logo">
          <Film size={32} />
          <div className="art-director-logo-text">
            <span className="art-director-logo-title">CineArchitect</span>
            <span className="art-director-logo-subtitle">مساعد مهندس الديكور</span>
          </div>
        </div>

        <nav className="art-director-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`art-director-nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="art-director-main">
        {renderContent()}
      </main>
    </div>
  );
}
