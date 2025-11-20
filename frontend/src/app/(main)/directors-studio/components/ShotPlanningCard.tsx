"use client";

import { useState, useEffect, memo, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Video,
  Move,
  Maximize2,
  Sun,
  Lightbulb,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetShotSuggestion } from "@/hooks/useAI";
import type { Shot } from "@shared/schema";

interface ShotPlanningCardProps {
  shot?: Partial<Shot>;
  shotNumber: number;
  sceneNumber: number;
  sceneDescription?: string;
  projectId?: string;
  sceneId?: string;
  onSave?: (shotData: Partial<Shot>) => void;
  onDelete?: () => void;
}

const ShotPlanningCard = memo(function ShotPlanningCard({
  shot,
  shotNumber,
  sceneNumber,
  sceneDescription = "",
  projectId = "",
  sceneId = "",
  onSave,
  onDelete,
}: ShotPlanningCardProps) {
  const [shotType, setShotType] = useState(shot?.shotType || "medium");
  const [cameraAngle, setCameraAngle] = useState(
    shot?.cameraAngle || "eye-level"
  );
  const [cameraMovement, setCameraMovement] = useState(
    shot?.cameraMovement || "static"
  );
  const [lighting, setLighting] = useState(shot?.lighting || "natural");
  const [aiSuggestion, setAiSuggestion] = useState<{
    suggestion: string;
    reasoning: string;
  } | null>(shot?.aiSuggestion ? JSON.parse(shot.aiSuggestion) : null);

  const getSuggestionMutation = useGetShotSuggestion();

  useEffect(() => {
    if (shot) {
      setShotType(shot.shotType || "medium");
      setCameraAngle(shot.cameraAngle || "eye-level");
      setCameraMovement(shot.cameraMovement || "static");
      setLighting(shot.lighting || "natural");
      if (shot.aiSuggestion) {
        try {
          setAiSuggestion(JSON.parse(shot.aiSuggestion));
        } catch {
          setAiSuggestion(null);
        }
      }
    }
  }, [shot]);

  const handleGetSuggestion = async () => {
    if (!projectId || !sceneId) {
      console.error("Missing projectId or sceneId for getting suggestions");
      return;
    }
    try {
      const result = await getSuggestionMutation.mutateAsync({
        projectId,
        sceneId,
        shotType,
      });
      if ("data" in result && result.data && result.data.suggestions?.[0]) {
        const firstSuggestion = result.data.suggestions[0];
        setAiSuggestion({
          suggestion: firstSuggestion.description,
          reasoning: firstSuggestion.reasoning || "",
        });
      }
    } catch (error) {
      console.error("Failed to get suggestion:", error);
    }
  };

  const handleReset = () => {
    setShotType("medium");
    setCameraAngle("eye-level");
    setCameraMovement("static");
    setLighting("natural");
    setAiSuggestion(null);
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        shotType,
        cameraAngle,
        cameraMovement,
        lighting,
        aiSuggestion: aiSuggestion ? JSON.stringify(aiSuggestion) : null,
      });
    }
  };

  return (
    <Card data-testid={`card-shot-${shotNumber}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="outline">المشهد {sceneNumber}</Badge>
          <CardTitle className="text-lg">اللقطة {shotNumber}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 text-right">
            <label className="text-sm font-medium flex items-center justify-end gap-2">
              <Video className="w-4 h-4" />
              نوع اللقطة
            </label>
            <Select value={shotType} onValueChange={setShotType}>
              <SelectTrigger data-testid="select-shot-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="extreme-wide">لقطة عريضة جداً</SelectItem>
                <SelectItem value="wide">لقطة عريضة</SelectItem>
                <SelectItem value="medium">لقطة متوسطة</SelectItem>
                <SelectItem value="close-up">لقطة قريبة</SelectItem>
                <SelectItem value="extreme-close-up">
                  لقطة قريبة جداً
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 text-right">
            <label className="text-sm font-medium flex items-center justify-end gap-2">
              <Maximize2 className="w-4 h-4" />
              زاوية الكاميرا
            </label>
            <Select value={cameraAngle} onValueChange={setCameraAngle}>
              <SelectTrigger data-testid="select-camera-angle">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">عالية</SelectItem>
                <SelectItem value="eye-level">مستوى العين</SelectItem>
                <SelectItem value="low">منخفضة</SelectItem>
                <SelectItem value="birds-eye">عين الطائر</SelectItem>
                <SelectItem value="dutch">مائلة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 text-right">
            <label className="text-sm font-medium flex items-center justify-end gap-2">
              <Move className="w-4 h-4" />
              حركة الكاميرا
            </label>
            <Select value={cameraMovement} onValueChange={setCameraMovement}>
              <SelectTrigger data-testid="select-camera-movement">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="static">ثابتة</SelectItem>
                <SelectItem value="pan">حركة أفقية</SelectItem>
                <SelectItem value="tilt">حركة عمودية</SelectItem>
                <SelectItem value="dolly">تتبع</SelectItem>
                <SelectItem value="crane">كرين</SelectItem>
                <SelectItem value="handheld">محمولة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 text-right">
            <label className="text-sm font-medium flex items-center justify-end gap-2">
              <Sun className="w-4 h-4" />
              الإضاءة
            </label>
            <Select value={lighting} onValueChange={setLighting}>
              <SelectTrigger data-testid="select-lighting">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="natural">طبيعية</SelectItem>
                <SelectItem value="three-point">ثلاثية النقاط</SelectItem>
                <SelectItem value="low-key">إضاءة منخفضة</SelectItem>
                <SelectItem value="high-key">إضاءة عالية</SelectItem>
                <SelectItem value="dramatic">درامية</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGetSuggestion}
          disabled={getSuggestionMutation.isPending}
          data-testid="button-get-ai-suggestion"
        >
          {getSuggestionMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              جاري الحصول على الاقتراح...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 ml-2" />
              احصل على اقتراح AI
            </>
          )}
        </Button>

        {aiSuggestion && (
          <div className="p-4 rounded-md bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1 text-right space-y-2">
                <p className="text-sm font-medium text-primary">اقتراح AI</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {aiSuggestion.suggestion}
                </p>
                {aiSuggestion.reasoning && (
                  <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                    <strong>السبب:</strong> {aiSuggestion.reasoning}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-end flex-wrap">
          {onDelete && shot && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
              data-testid="button-delete-shot"
            >
              <Trash2 className="w-4 h-4 ml-2" />
              حذف
            </Button>
          )}
          <div className="flex gap-2 mr-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              data-testid="button-reset-shot"
            >
              إعادة تعيين
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              data-testid="button-save-shot"
            >
              حفظ اللقطة
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default ShotPlanningCard;
