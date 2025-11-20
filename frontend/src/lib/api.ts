import type {
  ApiResponse,
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  Scene,
  CreateSceneInput,
  UpdateSceneInput,
  Character,
  CreateCharacterInput,
  UpdateCharacterInput,
  Shot,
  CreateShotInput,
  UpdateShotInput,
  AnalyzeScriptResponse,
  ShotSuggestionResponse,
  ChatResponse,
} from "./api-types";

/**
 * API functions for AI services
 */

export async function analyzeScript(
  projectId: string,
  script: string
): Promise<ApiResponse<AnalyzeScriptResponse>> {
  const response = await fetch("/api/cineai/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, script }),
  });

  if (!response.ok) {
    throw new Error(`Analysis failed: ${response.statusText}`);
  }

  return response.json();
}

export async function getShotSuggestion(
  projectId: string,
  sceneId: string,
  sceneDescription: string
): Promise<ApiResponse<ShotSuggestionResponse>> {
  const response = await fetch("/api/cineai/generate-shots", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, sceneId, sceneDescription }),
  });

  if (!response.ok) {
    throw new Error(`Shot suggestion failed: ${response.statusText}`);
  }

  return response.json();
}

export async function chatWithAI(
  message: string,
  projectId?: string,
  context?: Record<string, unknown>
): Promise<ApiResponse<ChatResponse>> {
  const response = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, projectId, context }),
  });

  if (!response.ok) {
    throw new Error(`Chat failed: ${response.statusText}`);
  }

  return response.json();
}

// Project API functions
export async function getProjects(): Promise<ApiResponse<Project[]>> {
  const response = await fetch("/api/projects");
  if (!response.ok) throw new Error("Failed to fetch projects");
  return response.json();
}

export async function getProject(id: string): Promise<ApiResponse<Project>> {
  const response = await fetch(`/api/projects/${id}`);
  if (!response.ok) throw new Error("Failed to fetch project");
  return response.json();
}

export async function createProject(
  data: CreateProjectInput
): Promise<ApiResponse<Project>> {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create project");
  return response.json();
}

export async function updateProject(
  id: string,
  data: UpdateProjectInput
): Promise<ApiResponse<Project>> {
  const response = await fetch(`/api/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update project");
  return response.json();
}

export async function deleteProject(id: string): Promise<ApiResponse<void>> {
  const response = await fetch(`/api/projects/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete project");
  return response.json();
}

// Scene API functions
export async function getProjectScenes(
  projectId: string
): Promise<ApiResponse<Scene[]>> {
  const response = await fetch(`/api/projects/${projectId}/scenes`);
  if (!response.ok) throw new Error("Failed to fetch scenes");
  return response.json();
}

export async function createScene(
  projectId: string,
  data: CreateSceneInput
): Promise<ApiResponse<Scene>> {
  const response = await fetch(`/api/projects/${projectId}/scenes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create scene");
  return response.json();
}

export async function updateScene(
  sceneId: string,
  data: UpdateSceneInput
): Promise<ApiResponse<Scene>> {
  const response = await fetch(`/api/scenes/${sceneId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update scene");
  return response.json();
}

export async function deleteScene(sceneId: string): Promise<ApiResponse<void>> {
  const response = await fetch(`/api/scenes/${sceneId}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete scene");
  return response.json();
}

// Character API functions
export async function getProjectCharacters(
  projectId: string
): Promise<ApiResponse<Character[]>> {
  const response = await fetch(`/api/projects/${projectId}/characters`);
  if (!response.ok) throw new Error("Failed to fetch characters");
  return response.json();
}

export async function createCharacter(
  projectId: string,
  data: CreateCharacterInput
): Promise<ApiResponse<Character>> {
  const response = await fetch(`/api/projects/${projectId}/characters`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create character");
  return response.json();
}

export async function updateCharacter(
  characterId: string,
  data: UpdateCharacterInput
): Promise<ApiResponse<Character>> {
  const response = await fetch(`/api/characters/${characterId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update character");
  return response.json();
}

export async function deleteCharacter(
  characterId: string
): Promise<ApiResponse<void>> {
  const response = await fetch(`/api/characters/${characterId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete character");
  return response.json();
}

// Shot API functions
export async function getSceneShots(
  sceneId: string
): Promise<ApiResponse<Shot[]>> {
  const response = await fetch(`/api/scenes/${sceneId}/shots`);
  if (!response.ok) throw new Error("Failed to fetch shots");
  return response.json();
}

export async function createShot(
  sceneId: string,
  data: CreateShotInput
): Promise<ApiResponse<Shot>> {
  const response = await fetch(`/api/scenes/${sceneId}/shots`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create shot");
  return response.json();
}

export async function updateShot(
  shotId: string,
  data: UpdateShotInput
): Promise<ApiResponse<Shot>> {
  const response = await fetch(`/api/shots/${shotId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update shot");
  return response.json();
}

export async function deleteShot(shotId: string): Promise<ApiResponse<void>> {
  const response = await fetch(`/api/shots/${shotId}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete shot");
  return response.json();
}

// Export all functions as a namespace for wildcard imports
export default {
  analyzeScript,
  getShotSuggestion,
  chatWithAI,
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectScenes,
  createScene,
  updateScene,
  deleteScene,
  getProjectCharacters,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  getSceneShots,
  createShot,
  updateShot,
  deleteShot,
};
