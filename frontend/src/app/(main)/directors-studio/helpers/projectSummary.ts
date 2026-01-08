import type { ComponentProps } from "react";
import type CharacterTracker from "@/app/(main)/directors-studio/components/CharacterTracker";
import type SceneCard from "@/app/(main)/directors-studio/components/SceneCard";

export type SceneCardProps = ComponentProps<typeof SceneCard>;
export type CharacterTrackerProps = ComponentProps<typeof CharacterTracker>;

export type ProjectCharacterInput = ReadonlyArray<
  Omit<
    CharacterTrackerProps["characters"][number],
    "consistencyStatus" | "lastSeen"
  > & {
    consistencyStatus?:
      | CharacterTrackerProps["characters"][number]["consistencyStatus"]
      | null;
    lastSeen?: string | null;
  }
>;

export function prepareCharacterList(
  characters?: ProjectCharacterInput
): CharacterTrackerProps["characters"] {
  if (!characters) {
    return [];
  }

  const fallbackStatus: CharacterTrackerProps["characters"][number]["consistencyStatus"] =
    "good";

  return characters.map((character) => ({
    ...character,
    consistencyStatus: (character.consistencyStatus ??
      fallbackStatus) as CharacterTrackerProps["characters"][number]["consistencyStatus"],
    lastSeen: character.lastSeen ?? "غير محدد",
  }));
}

export function hasActiveProject(
  projectId: string | null,
  scenes: SceneCardProps[]
): boolean {
  return Boolean(projectId) && scenes.length > 0;
}

export interface ProjectStatsSummary {
  totalScenes: number;
  totalCharacters: number;
  totalShots: number;
  completedScenes: number;
}

export function calculateProjectStats(
  scenes: SceneCardProps[],
  characters: CharacterTrackerProps["characters"]
): ProjectStatsSummary {
  const completedScenes = scenes.filter(
    (scene) => scene.status === "completed"
  ).length;
  const totalShots = scenes.reduce(
    (sum, scene) => sum + (scene.shotCount ?? 0),
    0
  );

  return {
    totalScenes: scenes.length,
    totalCharacters: characters.length,
    totalShots,
    completedScenes,
  };
}
