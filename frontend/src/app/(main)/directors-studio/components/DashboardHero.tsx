"use client";

import { Button } from "@/components DONT USE THIS FLODER EVER/ui/button";
import { Film, Upload, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ProjectManager from "@/app/(main)/directors-studio/components/ProjectManager";

export default function DashboardHero() {
  const scrollToUpload = () => {
    const uploadElement = document.querySelector(
      '[data-testid="card-script-upload"]'
    );
    if (uploadElement) {
      uploadElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="relative h-[400px] rounded-md overflow-hidden">
      <Image
        src="/directors-studio/Film_production_hero_image_6b2179d4.png"
        alt="Film production hero - خلفية الإنتاج السينمائي"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
        quality={85}
      />
      <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/60 to-black/40" />

      <div className="relative h-full flex flex-col justify-center items-end px-12 text-white">
        <div className="max-w-2xl text-right space-y-6">
          <div className="flex items-center justify-end gap-2">
            <h1 className="text-5xl font-bold font-serif">
              مساعد الإخراج السينمائي
            </h1>
            <Film className="w-12 h-12" />
          </div>

          <p className="text-xl text-white/90 leading-relaxed">
            مساعد ذكاء اصطناعي متكامل يساعدك في جميع مراحل الإنتاج السينمائي من
            تحليل السيناريو إلى تخطيط اللقطات والمشاهد
          </p>

          <div className="flex flex-wrap gap-4 justify-end pt-4">
            <ProjectManager />
            <Button
              size="lg"
              variant="outline"
              className="backdrop-blur-md bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={scrollToUpload}
              data-testid="button-new-project"
            >
              <Upload className="w-5 h-5 ml-2" />
              تحميل سيناريو جديد
            </Button>
            <Button
              size="lg"
              className="bg-primary text-primary-foreground"
              asChild
              data-testid="button-ai-assistant"
            >
              <Link href="/directors-studio/ai-assistant">
                <Sparkles className="w-5 h-5 ml-2" />
                بدء المساعد الذكي
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
