"use client";

import React from "react";
import ProjectStats from "@/app/(main)/directors-studio/components/ProjectStats";
import { ProjectTabs } from "@/app/(main)/directors-studio/components/ProjectTabs";
import {
  calculateProjectStats,
  type CharacterTrackerProps,
  type SceneCardProps,
} from "@/app/(main)/directors-studio/helpers/projectSummary";

interface ProjectContentProps {
  scenes: SceneCardProps[];
  characters: CharacterTrackerProps["characters"];
}

export function ProjectContent({ scenes, characters }: ProjectContentProps) {
  const stats = calculateProjectStats(scenes, characters);

  return (
    <>
      <ProjectStats {...stats} />
      <ProjectTabs scenes={scenes} characters={characters} />
    </>
  );
}

export default ProjectContent;
