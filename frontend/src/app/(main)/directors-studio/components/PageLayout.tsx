"use client";

import type { ReactNode } from "react";
import DashboardHero from "./DashboardHero";

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="space-y-8">
      <DashboardHero />
      {children}
    </div>
  );
}
