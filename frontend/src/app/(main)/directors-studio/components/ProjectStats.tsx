"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components DONT USE THIS FLODER EVER/ui/card";
import { Film, Users, Camera, CheckCircle } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <div className="p-2 rounded-md bg-primary/10 text-primary">{icon}</div>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-right">
          <div className="text-3xl font-bold">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ProjectStatsProps {
  totalScenes: number;
  totalCharacters: number;
  totalShots: number;
  completedScenes: number;
}

export default function ProjectStats({
  totalScenes,
  totalCharacters,
  totalShots,
  completedScenes,
}: ProjectStatsProps) {
  return (
    <div
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      data-testid="project-stats"
    >
      <StatCard
        title="إجمالي المشاهد"
        value={totalScenes}
        icon={<Film className="w-4 h-4" />}
        description="في السيناريو الحالي"
      />
      <StatCard
        title="الشخصيات"
        value={totalCharacters}
        icon={<Users className="w-4 h-4" />}
        description="شخصية رئيسية وثانوية"
      />
      <StatCard
        title="اللقطات المخططة"
        value={totalShots}
        icon={<Camera className="w-4 h-4" />}
        description="لقطة تم تخطيطها"
      />
      <StatCard
        title="مشاهد مكتملة"
        value={`${completedScenes}/${totalScenes}`}
        icon={<CheckCircle className="w-4 h-4" />}
        description={`${Math.round((completedScenes / totalScenes) * 100)}% مكتمل`}
      />
    </div>
  );
}
