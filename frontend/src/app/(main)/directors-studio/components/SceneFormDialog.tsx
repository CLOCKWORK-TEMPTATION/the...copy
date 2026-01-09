"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components DONT USE THIS FLODER EVER/ui/dialog";
import { Button } from "@/components DONT USE THIS FLODER EVER/ui/button";
import { Input } from "@/components DONT USE THIS FLODER EVER/ui/input";
import { Label } from "@/components DONT USE THIS FLODER EVER/ui/label";
import { Textarea } from "@/components DONT USE THIS FLODER EVER/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components DONT USE THIS FLODER EVER/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateScene, useUpdateScene } from "@/hooks/useProject";
import type { Scene } from "@/types/api";

interface SceneFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  scene?: Scene;
  maxSceneNumber?: number;
}

export default function SceneFormDialog({
  open,
  onOpenChange,
  projectId,
  scene,
  maxSceneNumber = 0,
}: SceneFormDialogProps) {
  const { toast } = useToast();
  const createScene = useCreateScene();
  const updateScene = useUpdateScene();

  const [formData, setFormData] = useState({
    sceneNumber: scene?.sceneNumber || maxSceneNumber + 1,
    title: scene?.title || "",
    location: scene?.location || "",
    timeOfDay: scene?.timeOfDay || "نهار",
    description: scene?.description || "",
    characters: scene?.characters || [],
    status: scene?.status || "planned",
  });

  useEffect(() => {
    if (scene) {
      setFormData({
        sceneNumber: scene.sceneNumber,
        title: scene.title,
        location: scene.location,
        timeOfDay: scene.timeOfDay,
        description: scene.description || "",
        characters: scene.characters || [],
        status: scene.status,
      });
    } else {
      setFormData({
        sceneNumber: maxSceneNumber + 1,
        title: "",
        location: "",
        timeOfDay: "نهار",
        description: "",
        characters: [],
        status: "planned",
      });
    }
  }, [scene, maxSceneNumber, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.location) {
      toast({
        title: "خطأ",
        description: "الرجاء ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    try {
      if (scene) {
        await updateScene.mutateAsync({
          id: scene.id,
          data: {
            ...formData,
          },
        });

        toast({
          title: "تم التحديث",
          description: "تم تحديث المشهد بنجاح",
        });
      } else {
        await createScene.mutateAsync({
          projectId,
          ...formData,
          shotCount: 0,
        });

        toast({
          title: "تم الإنشاء",
          description: "تم إنشاء المشهد بنجاح",
        });
      }

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: scene ? "فشل تحديث المشهد" : "فشل إنشاء المشهد",
        variant: "destructive",
      });
    }
  };

  const handleCharacterInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    const charactersArray = value
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c);
    setFormData({ ...formData, characters: charactersArray });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        data-testid="dialog-scene-form"
      >
        <DialogHeader>
          <DialogTitle className="text-right">
            {scene ? "تعديل المشهد" : "إضافة مشهد جديد"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sceneNumber" className="text-right block">
              رقم المشهد
            </Label>
            <Input
              id="sceneNumber"
              type="number"
              min="1"
              value={formData.sceneNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sceneNumber: parseInt(e.target.value) || 1,
                })
              }
              dir="ltr"
              data-testid="input-scene-number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-right block">
              عنوان المشهد *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              dir="rtl"
              placeholder="مثال: البطل يدخل المنزل"
              data-testid="input-scene-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-right block">
              الموقع *
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              dir="rtl"
              placeholder="مثال: منزل - غرفة المعيشة"
              data-testid="input-scene-location"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeOfDay" className="text-right block">
              وقت اليوم
            </Label>
            <Select
              value={formData.timeOfDay}
              onValueChange={(value) =>
                setFormData({ ...formData, timeOfDay: value })
              }
            >
              <SelectTrigger id="timeOfDay" data-testid="select-scene-time">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="نهار">نهار</SelectItem>
                <SelectItem value="ليل">ليل</SelectItem>
                <SelectItem value="فجر">فجر</SelectItem>
                <SelectItem value="غروب">غروب</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="characters" className="text-right block">
              الشخصيات (مفصولة بفاصلة)
            </Label>
            <Input
              id="characters"
              value={
                Array.isArray(formData.characters)
                  ? formData.characters.join(", ")
                  : ""
              }
              onChange={handleCharacterInputChange}
              dir="rtl"
              placeholder="مثال: أحمد, فاطمة, محمد"
              data-testid="input-scene-characters"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-right block">
              الوصف
            </Label>
            <Textarea
              id="description"
              value={formData.description ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              dir="rtl"
              placeholder="وصف تفصيلي للمشهد..."
              className="min-h-24"
              data-testid="textarea-scene-description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-right block">
              الحالة
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger id="status" data-testid="select-scene-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">مخطط</SelectItem>
                <SelectItem value="in-progress">قيد التنفيذ</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={createScene.isPending || updateScene.isPending}
              data-testid="button-submit-scene"
            >
              {createScene.isPending || updateScene.isPending
                ? "جاري الحفظ..."
                : scene
                  ? "تحديث"
                  : "إضافة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
