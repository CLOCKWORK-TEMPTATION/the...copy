"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CharacterTracker from "@/app/(main)/directors-studio/components/CharacterTracker";
import SceneCard from "@/app/(main)/directors-studio/components/SceneCard";
import type {
  CharacterTrackerProps,
  SceneCardProps,
} from "@/app/(main)/directors-studio/helpers/projectSummary";

interface ProjectTabsProps {
  scenes: SceneCardProps[];
  characters: CharacterTrackerProps["characters"];
}

export function ProjectTabs({ scenes, characters }: ProjectTabsProps) {
  return (
    <Tabs defaultValue="scenes" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2 mr-auto">
        <TabsTrigger value="scenes" data-testid="tab-scenes">
          المشاهد
        </TabsTrigger>
        <TabsTrigger value="characters" data-testid="tab-characters">
          الشخصيات
        </TabsTrigger>
      </TabsList>

      <TabsContent value="scenes" className="space-y-4 mt-6">
        <ScenesTabContent scenes={scenes} />
      </TabsContent>

      <TabsContent value="characters" className="mt-6">
        <CharactersTabContent characters={characters} />
      </TabsContent>
    </Tabs>
  );
}

interface ScenesTabContentProps {
  scenes: SceneCardProps[];
}

function ScenesTabContent({ scenes }: ScenesTabContentProps) {
  if (!scenes.length) {
    return (
      <p className="text-center text-muted-foreground py-12">
        لا توجد مشاهد بعد. قم بتحميل سيناريو للبدء.
      </p>
    );
  }

  return (
    <>
      {scenes.map((scene) => {
        const { status, ...sceneProps } = scene;
        return (
          <SceneCard
            key={scene.id}
            {...sceneProps}
            status={status ?? "planned"}
          />
        );
      })}
    </>
  );
}

interface CharactersTabContentProps {
  characters: CharacterTrackerProps["characters"];
}

function CharactersTabContent({ characters }: CharactersTabContentProps) {
  if (!characters.length) {
    return (
      <p className="text-center text-muted-foreground py-12">
        لا توجد شخصيات بعد.
      </p>
    );
  }

  return <CharacterTracker characters={characters} />;
}

export default ProjectTabs;
