"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  useProjects,
  useUpdateProject,
  useDeleteProject,
} from "@/hooks/useProject";
import {
  getCurrentProject,
  setCurrentProject,
  clearCurrentProject,
} from "@/lib/projectStore";
import { FolderOpen, Trash2, Edit2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { Project } from "@/types/api";

export default function ProjectManager() {
  const { data: projects, isLoading } = useProjects();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const { toast } = useToast();
  const currentProject = getCurrentProject();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const handleSelectProject = (project: any) => {
    setCurrentProject(project);
    window.location.reload();
  };

  const handleStartEdit = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await updateProject.mutateAsync({ id, data: { title: editTitle } });
      setEditingId(null);
      toast({
        title: "تم التحديث",
        description: "تم تحديث عنوان المشروع بنجاح",
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "فشل تحديث المشروع";
      toast({
        title: "حدث خطأ",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setProjectToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    try {
      await deleteProject.mutateAsync(projectToDelete);

      if (currentProject && currentProject.id === projectToDelete) {
        clearCurrentProject();
        window.location.reload();
      }

      toast({
        title: "تم الحذف",
        description: "تم حذف المشروع بنجاح",
      });
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "فشل حذف المشروع";
      toast({
        title: "حدث خطأ",
        description: message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const projectsList = Array.isArray(projects) ? projects : [];

  if (!projectsList || projectsList.length === 0) {
    return null;
  }

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" data-testid="button-manage-projects">
            <FolderOpen className="w-4 h-4 ml-2" />
            إدارة المشاريع ({projectsList.length})
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">المشاريع المتاحة</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {projectsList.map((project: any) => (
              <Card
                key={project.id}
                className={
                  currentProject && currentProject.id === project.id
                    ? "border-primary"
                    : ""
                }
                data-testid={`card-project-${project.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    {editingId === project.id ? (
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1"
                        dir="rtl"
                        data-testid="input-edit-project-title"
                      />
                    ) : (
                      <div className="flex-1 text-right">
                        <h3 className="font-semibold">{project.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(project.createdAt).toLocaleDateString(
                            "ar-SA"
                          )}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {editingId === project.id ? (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSaveEdit(project.id)}
                          disabled={updateProject.isPending}
                          data-testid="button-save-edit"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              handleStartEdit(project.id, project.title)
                            }
                            data-testid={`button-edit-${project.id}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteClick(project.id)}
                            data-testid={`button-delete-${project.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                          {(!currentProject ||
                            currentProject.id !== project.id) && (
                            <Button
                              variant="outline"
                              onClick={() => handleSelectProject(project)}
                              data-testid={`button-select-${project.id}`}
                            >
                              اختيار
                            </Button>
                          )}
                          {currentProject &&
                            currentProject.id === project.id && (
                              <Button
                                variant="default"
                                disabled
                                data-testid="button-current-project"
                              >
                                المشروع الحالي
                              </Button>
                            )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">
              تأكيد الحذف
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من حذف هذا المشروع؟ سيتم حذف جميع المشاهد والشخصيات
              واللقطات المرتبطة به. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete"
            >
              حذف
            </AlertDialogAction>
            <AlertDialogCancel data-testid="button-cancel-delete">
              إلغاء
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
