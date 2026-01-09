"use client";

import { useState } from "react";
import { Card } from "@/components DONT USE THIS FLODER EVER/ui/card";
import { Upload, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components DONT USE THIS FLODER EVER/ui/button";
import { useCreateProject, useAnalyzeScript } from "@/hooks/useProject";
import { setCurrentProject } from "@/lib/projectStore";
import { useToast } from "@/hooks/use-toast";

export default function ScriptUploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const createProject = useCreateProject();
  const analyzeScript = useAnalyzeScript();

  const isUploading = createProject.isPending || analyzeScript.isPending;

  const handleFile = async (file: File) => {
    try {
      const project = await createProject.mutateAsync({ title: "مشروع جديد" });
      if ("data" in project && project.data) {
        setCurrentProject(project.data);
        const scriptText = await file.text();
        await analyzeScript.mutateAsync({
          projectId: project.data.id,
          script: scriptText,
        });
      }

      toast({
        title: "تم التحليل بنجاح!",
        description: "تم تحليل السيناريو واستخراج المشاهد والشخصيات",
      });

      window.location.reload();
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "فشل تحليل السيناريو. الرجاء المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <Card
      className={`p-12 border-2 border-dashed transition-all ${
        isDragging ? "border-primary bg-primary/5" : "border-border"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid="card-script-upload"
    >
      <div className="flex flex-col items-center justify-center gap-6 min-h-[300px]">
        {isUploading ? (
          <>
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
            <p className="text-xl text-muted-foreground">
              جاري تحميل السيناريو...
            </p>
          </>
        ) : (
          <>
            <div className="p-6 rounded-full bg-primary/10">
              <Upload className="w-12 h-12 text-primary" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold">
                قم بتحميل السيناريو الخاص بك
              </h3>
              <p className="text-muted-foreground">
                اسحب وأفلت ملف PDF أو Word هنا، أو انقر للاختيار
              </p>
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span>الصيغ المدعومة: PDF, DOC, DOCX, TXT</span>
            </div>

            <input
              type="file"
              id="script-upload"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
            />
            <Button
              size="lg"
              onClick={() => document.getElementById("script-upload")?.click()}
              data-testid="button-choose-file"
            >
              اختيار ملف
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
