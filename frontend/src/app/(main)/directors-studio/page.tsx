"use client";

import dynamic from "next/dynamic";
import { PageLayout } from "@/app/(main)/directors-studio/components/PageLayout";
import { LoadingSection } from "@/app/(main)/directors-studio/components/LoadingSection";
import {
  useProjectScenes,
  useProjectCharacters,
} from "@/app/(main)/directors-studio/hooks/useProject";
import { getCurrentProject } from "@/lib/projectStore";
import type { Project } from "@/types/api";
import {
  hasActiveProject,
  prepareCharacterList,
  type CharacterTrackerProps,
  type ProjectCharacterInput,
  type SceneCardProps,
} from "@/app/(main)/directors-studio/helpers/projectSummary";

const NoProjectSection = dynamic(
  () =>
    import("@/app/(main)/directors-studio/components/NoProjectSection").then(
      (mod) => ({ default: mod.NoProjectSection })
    ),
  {
    ssr: false,
  }
);

const ProjectContent = dynamic(
  () =>
    import("@/app/(main)/directors-studio/components/ProjectContent").then(
      (mod) => ({ default: mod.ProjectContent })
    ),
  {
    ssr: false,
  }
);

export default function DirectorsStudioPage() {
  const currentProject = getCurrentProject<Project>();
  const activeProjectKey = currentProject?.id ?? undefined;
  const { data: scenes, isLoading: scenesLoading } =
    useProjectScenes(activeProjectKey);
  const { data: characters, isLoading: charactersLoading } =
    useProjectCharacters(activeProjectKey);

  const normalizeSceneStatus = (
    status?: string | null
  ): SceneCardProps["status"] => {
    if (status === "planned" || status === "in-progress" || status === "completed") {
      return status;
    }
    return "planned";
  };

  const isLoading = [scenesLoading, charactersLoading].some(Boolean);
  const scenesList: SceneCardProps[] = Array.isArray(scenes)
    ? scenes.map((scene) => ({
        ...scene,
        status: normalizeSceneStatus(scene.status),
      }))
    : [];
  const charactersList: CharacterTrackerProps["characters"] =
    prepareCharacterList(characters as ProjectCharacterInput | undefined);

  if (isLoading) {
    return (
      <PageLayout>
        <LoadingSection />
      </PageLayout>
    );
  }

  if (!hasActiveProject(activeProjectKey ?? null, scenesList)) {
    return (
      <PageLayout>
        <NoProjectSection />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <ProjectContent scenes={scenesList} characters={charactersList} />
    </PageLayout>
  );
}
