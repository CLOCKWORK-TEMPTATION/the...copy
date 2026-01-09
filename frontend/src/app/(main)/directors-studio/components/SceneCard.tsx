"use client";

import React, { useState, memo, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Clock,
  Users,
  MoreVertical,
  Camera,
  Trash2,
  Edit2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteScene } from "@/hooks/useProject";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface SceneCardProps {
  id: string;
  sceneNumber: number;
  title: string;
  location: string;
  timeOfDay: string;
  characters: string[];
  shotCount?: number;
  status?: "planned" | "in-progress" | "completed";
  description?: string | null;
  onEdit?: () => void;
}

const SceneCard = memo(function SceneCard({
  id,
  sceneNumber,
  title,
  location,
  timeOfDay,
  characters,
  shotCount = 0,
  status = "planned",
  description,
  onEdit,
}: SceneCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteScene = useDeleteScene();
  const { toast } = useToast();

  const statusColors = {
    planned: "bg-muted text-muted-foreground",
    "in-progress": "bg-primary/10 text-primary",
    completed:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  };

  const statusLabels = {
    planned: "مخطط",
    "in-progress": "قيد التنفيذ",
    completed: "مكتمل",
  };

  const handleDelete = async () => {
    try {
      await deleteScene.mutateAsync(id);
      toast({
        title: "تم الحذف",
        description: "تم حذف المشهد بنجاح",
      });
      setDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "فشل حذف المشهد",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card
        className="hover-elevate active-elevate-2"
        data-testid={`card-scene-${sceneNumber}`}
      >
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  data-testid="button-scene-menu"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link href="/shots">تخطيط اللقطات</Link>
                </DropdownMenuItem>
                {onEdit && (
                  <DropdownMenuItem
                    onClick={onEdit}
                    data-testid="button-edit-scene"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    تعديل المشهد
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  data-testid="button-delete-scene"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  حذف المشهد
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Badge className={statusColors[status]}>
              {statusLabels[status]}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{title}</h3>
            <Badge variant="outline" className="text-base px-3">
              المشهد {sceneNumber}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-end gap-6 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-2">
              <span>{location}</span>
              <MapPin className="w-4 h-4" />
            </div>

            <div className="flex items-center gap-2">
              <span>{timeOfDay}</span>
              <Clock className="w-4 h-4" />
            </div>

            <div className="flex items-center gap-2">
              <span>{characters.length} شخصيات</span>
              <Users className="w-4 h-4" />
            </div>

            {shotCount > 0 && (
              <div className="flex items-center gap-2">
                <span>{shotCount} لقطات</span>
                <Camera className="w-4 h-4" />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            {characters.map((character, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {character}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">
              تأكيد الحذف
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من حذف "{title}"؟ سيتم حذف جميع اللقطات المرتبطة به.
              هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete-scene"
            >
              حذف
            </AlertDialogAction>
            <AlertDialogCancel data-testid="button-cancel-delete-scene">
              إلغاء
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

export default SceneCard;
