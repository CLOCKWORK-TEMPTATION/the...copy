/**
 * Task icon mapper utility
 * Extracted to reduce cyclomatic complexity in creative-development.tsx
 */

import {
  Lightbulb,
  Sparkles,
  FileText,
  PenTool,
  Beaker,
  Users,
  Search,
  Film,
  Globe,
  BarChart,
  Clipboard,
  Wand2,
  Brain,
  MessageSquare,
  TrendingUp,
  Zap,
  Music,
  Network,
  Palette,
  Target,
} from "lucide-react";
import { TaskType, TaskCategory } from "@/types/enums";

/**
 * Icon mapping for specific task types
 */
const TASK_TYPE_ICONS: Partial<Record<TaskType, React.ReactNode>> = {
  [TaskType.ANALYSIS]: <Lightbulb className="w-4 h-4" />,
  [TaskType.CREATIVE]: <Sparkles className="w-4 h-4" />,
  [TaskType.INTEGRATED]: <FileText className="w-4 h-4" />,
  [TaskType.COMPLETION]: <PenTool className="w-4 h-4" />,
  [TaskType.CHARACTER_DEEP_ANALYZER]: <Users className="w-4 h-4" />,
  [TaskType.DIALOGUE_ADVANCED_ANALYZER]: <Search className="w-4 h-4" />,
  [TaskType.VISUAL_CINEMATIC_ANALYZER]: <Film className="w-4 h-4" />,
  [TaskType.THEMES_MESSAGES_ANALYZER]: <Lightbulb className="w-4 h-4" />,
  [TaskType.CULTURAL_HISTORICAL_ANALYZER]: <Globe className="w-4 h-4" />,
  [TaskType.PRODUCIBILITY_ANALYZER]: <BarChart className="w-4 h-4" />,
  [TaskType.TARGET_AUDIENCE_ANALYZER]: <Users className="w-4 h-4" />,
  [TaskType.LITERARY_QUALITY_ANALYZER]: <PenTool className="w-4 h-4" />,
  [TaskType.RECOMMENDATIONS_GENERATOR]: <Sparkles className="w-4 h-4" />,
};

/**
 * Icon mapping for task categories
 */
const TASK_CATEGORY_ICONS: Record<TaskCategory, React.ReactNode> = {
  [TaskCategory.ANALYSIS]: <Lightbulb className="w-4 h-4" />,
  [TaskCategory.CREATIVE]: <Sparkles className="w-4 h-4" />,
  [TaskCategory.INTEGRATED]: <FileText className="w-4 h-4" />,
  [TaskCategory.GENERAL]: <Clipboard className="w-4 h-4" />,
  [TaskCategory.CHARACTER]: <Users className="w-4 h-4" />,
  [TaskCategory.SCENE]: <Film className="w-4 h-4" />,
  [TaskCategory.SCRIPT]: <FileText className="w-4 h-4" />,
  [TaskCategory.CORE]: <Target className="w-4 h-4" />,
  [TaskCategory.PREDICTIVE]: <TrendingUp className="w-4 h-4" />,
  [TaskCategory.ADVANCED_MODULES]: <Brain className="w-4 h-4" />,
};

/**
 * Get icon for a task type
 * Simplified logic with O(1) lookup instead of nested switches
 */
export function getTaskIcon(
  taskType: TaskType,
  taskCategoryMap: Partial<Record<TaskType, TaskCategory>>
): React.ReactNode {
  // First, try to get icon by specific task type
  const taskIcon = TASK_TYPE_ICONS[taskType];
  if (taskIcon) {
    return taskIcon;
  }

  // Fall back to category icon
  const taskCategory = taskCategoryMap[taskType];
  if (taskCategory && TASK_CATEGORY_ICONS[taskCategory]) {
    return TASK_CATEGORY_ICONS[taskCategory];
  }

  // Default fallback
  return <Sparkles className="w-4 h-4" />;
}

/**
 * Icon mapping for creative task types
 */
const CREATIVE_TASK_ICONS: Partial<Record<TaskType, React.ReactNode>> = {
  [TaskType.CREATIVE]: <Wand2 className="w-4 h-4" />,
  [TaskType.COMPLETION]: <PenTool className="w-4 h-4" />,
  [TaskType.ADAPTIVE_REWRITING]: <Brain className="w-4 h-4" />,
  [TaskType.SCENE_GENERATOR]: <Film className="w-4 h-4" />,
  [TaskType.CHARACTER_VOICE]: <MessageSquare className="w-4 h-4" />,
  [TaskType.WORLD_BUILDER]: <Globe className="w-4 h-4" />,
  [TaskType.PLOT_PREDICTOR]: <TrendingUp className="w-4 h-4" />,
  [TaskType.TENSION_OPTIMIZER]: <Zap className="w-4 h-4" />,
  [TaskType.RHYTHM_MAPPING]: <Music className="w-4 h-4" />,
  [TaskType.CHARACTER_NETWORK]: <Network className="w-4 h-4" />,
  [TaskType.DIALOGUE_FORENSICS]: <Search className="w-4 h-4" />,
  [TaskType.THEMATIC_MINING]: <Lightbulb className="w-4 h-4" />,
  [TaskType.STYLE_FINGERPRINT]: <Palette className="w-4 h-4" />,
  [TaskType.CONFLICT_DYNAMICS]: <Target className="w-4 h-4" />,
};

/**
 * Get icon for creative task type
 */
export function getCreativeTaskIcon(taskType: TaskType): React.ReactNode {
  // Try to get icon by specific creative task type
  const icon = CREATIVE_TASK_ICONS[taskType];
  if (icon) {
    return icon;
  }

  // Default fallback
  return <Sparkles className="w-4 h-4" />;
}
