"use client";

import { useState, useEffect } from "react";
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
import { useCreateCharacter, useUpdateCharacter } from "@/hooks/useProject";
import type {
  Character,
  CreateCharacterRequest,
  UpdateCharacterRequest,
} from "@/types/api";

interface CharacterFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  character?: Character;
}

interface CharacterFormState {
  name: string;
  appearances: number;
  consistencyStatus: string;
  lastSeen: string | null;
  notes: string | null;
}

const mapCharacterToFormData = (value?: Character): CharacterFormState => ({
  name: value?.name ?? "",
  appearances: value?.appearances ?? 0,
  consistencyStatus: value?.consistencyStatus ?? "good",
  lastSeen: value?.lastSeen ?? null,
  notes: value?.notes ?? null,
});

export default function CharacterFormDialog({
  open,
  onOpenChange,
  projectId,
  character,
}: CharacterFormDialogProps) {
  const { toast } = useToast();
  const createCharacter = useCreateCharacter();
  const updateCharacter = useUpdateCharacter();

  const [formData, setFormData] = useState(() =>
    mapCharacterToFormData(character)
  );

  useEffect(() => {
    setFormData(mapCharacterToFormData(character));
  }, [character, open]);

  const handleSubmit = async (_e: React.FormEvent) => {
    _e.preventDefault();

    if (!formData.name) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم الشخصية",
        variant: "destructive",
      });
      return;
    }

    const isEditing = Boolean(character);
    const payload: Omit<Character, "id" | "projectId"> = {
      name: formData.name,
      appearances: formData.appearances,
      consistencyStatus: formData.consistencyStatus,
      ...(formData.lastSeen && { lastSeen: formData.lastSeen }),
      ...(formData.notes && { notes: formData.notes }),
    };

    const mutation = isEditing
      ? () =>
          updateCharacter.mutateAsync({
            id: character!.id,
            data: payload as UpdateCharacterRequest,
          })
      : () =>
          createCharacter.mutateAsync({
            ...(payload as CreateCharacterRequest),
            projectId,
          });

    try {
      await mutation();

      toast({
        title: isEditing ? "تم التحديث" : "تم الإنشاء",
        description: isEditing
          ? "تم تحديث الشخصية بنجاح"
          : "تم إنشاء الشخصية بنجاح",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: isEditing ? "فشل تحديث الشخصية" : "فشل إنشاء الشخصية",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-character-form">
        <DialogHeader>
          <DialogTitle className="text-right">
            {character ? "تعديل الشخصية" : "إضافة شخصية جديدة"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-right block">
              اسم الشخصية *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              dir="rtl"
              placeholder="مثال: أحمد محمود"
              data-testid="input-character-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="appearances" className="text-right block">
              عدد الظهور
            </Label>
            <Input
              id="appearances"
              type="number"
              min="0"
              value={formData.appearances}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  appearances: parseInt(e.target.value) || 0,
                })
              }
              dir="ltr"
              data-testid="input-character-appearances"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="consistencyStatus" className="text-right block">
              حالة الثبات
            </Label>
            <Select
              value={formData.consistencyStatus}
              onValueChange={(value) =>
                setFormData({ ...formData, consistencyStatus: value })
              }
            >
              <SelectTrigger
                id="consistencyStatus"
                data-testid="select-character-consistency"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="good">جيد</SelectItem>
                <SelectItem value="warning">تحذير</SelectItem>
                <SelectItem value="issue">مشكلة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastSeen" className="text-right block">
              آخر ظهور
            </Label>
            <Input
              id="lastSeen"
              value={formData.lastSeen ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, lastSeen: e.target.value })
              }
              dir="rtl"
              placeholder="مثال: المشهد 5"
              data-testid="input-character-lastseen"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-right block">
              ملاحظات
            </Label>
            <Textarea
              id="notes"
              value={formData.notes ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              dir="rtl"
              placeholder="ملاحظات حول الشخصية..."
              className="min-h-24"
              data-testid="textarea-character-notes"
            />
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
              disabled={createCharacter.isPending || updateCharacter.isPending}
              data-testid="button-submit-character"
            >
              {createCharacter.isPending || updateCharacter.isPending
                ? "جاري الحفظ..."
                : character
                  ? "تحديث"
                  : "إضافة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
