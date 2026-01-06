import type {
  ApiResponse,
  Project,
  Scene,
  Character,
  Shot,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateSceneRequest,
  UpdateSceneRequest,
  CreateCharacterRequest,
  UpdateCharacterRequest,
  CreateShotRequest,
  UpdateShotRequest,
} from "@/types/api";

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    ...options,
  });

  const payload = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | T
    | null;

  if (!response.ok) {
    return {
      success: false,
      error:
        (payload as ApiResponse<T> | null)?.error || response.statusText,
      data: (payload as ApiResponse<T> | null)?.data,
    };
  }

  if (payload && typeof payload === "object" && "success" in payload) {
    return payload as ApiResponse<T>;
  }

  return { success: true, data: payload as T };
}

export async function get<T>(url: string): Promise<ApiResponse<T>> {
  return request<T>(url);
}

export async function post<T>(
  url: string,
  data?: unknown
): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: "POST",
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });
}

export async function put<T>(
  url: string,
  data?: unknown
): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: "PUT",
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });
}

export async function del<T>(url: string): Promise<ApiResponse<T>> {
  return request<T>(url, { method: "DELETE" });
}

export async function getProjects(): Promise<ApiResponse<Project[]>> {
  return get<Project[]>("/api/projects");
}

export async function getProject(id: string): Promise<ApiResponse<Project>> {
  return get<Project>(`/api/projects/${id}`);
}

export async function createProject(
  data: CreateProjectRequest
): Promise<ApiResponse<Project>> {
  return post<Project>("/api/projects", data);
}

export async function updateProject(
  id: string,
  data: UpdateProjectRequest
): Promise<ApiResponse<Project>> {
  return put<Project>(`/api/projects/${id}`, data);
}

export async function deleteProject(
  id: string
): Promise<ApiResponse<{ id: string }>> {
  return del<{ id: string }>(`/api/projects/${id}`);
}

export async function getProjectScenes(
  projectId: string
): Promise<ApiResponse<Scene[]>> {
  return get<Scene[]>(`/api/projects/${projectId}/scenes`);
}

export async function createScene(
  projectId: string,
  data: CreateSceneRequest
): Promise<ApiResponse<Scene>> {
  return post<Scene>(`/api/projects/${projectId}/scenes`, data);
}

export async function updateScene(
  id: string,
  data: UpdateSceneRequest
): Promise<ApiResponse<Scene>> {
  return put<Scene>(`/api/scenes/${id}`, data);
}

export async function deleteScene(
  id: string
): Promise<ApiResponse<{ id: string }>> {
  return del<{ id: string }>(`/api/scenes/${id}`);
}

export async function getProjectCharacters(
  projectId: string
): Promise<ApiResponse<Character[]>> {
  return get<Character[]>(`/api/projects/${projectId}/characters`);
}

export async function createCharacter(
  projectId: string,
  data: CreateCharacterRequest
): Promise<ApiResponse<Character>> {
  return post<Character>(`/api/projects/${projectId}/characters`, data);
}

export async function updateCharacter(
  id: string,
  data: UpdateCharacterRequest
): Promise<ApiResponse<Character>> {
  return put<Character>(`/api/characters/${id}`, data);
}

export async function deleteCharacter(
  id: string
): Promise<ApiResponse<{ id: string }>> {
  return del<{ id: string }>(`/api/characters/${id}`);
}

export async function getSceneShots(
  sceneId: string
): Promise<ApiResponse<Shot[]>> {
  return get<Shot[]>(`/api/scenes/${sceneId}/shots`);
}

export async function createShot(
  sceneId: string,
  data: CreateShotRequest
): Promise<ApiResponse<Shot>> {
  return post<Shot>(`/api/scenes/${sceneId}/shots`, data);
}

export async function updateShot(
  id: string,
  data: UpdateShotRequest
): Promise<ApiResponse<Shot>> {
  return put<Shot>(`/api/shots/${id}`, data);
}

export async function deleteShot(
  id: string
): Promise<ApiResponse<{ id: string }>> {
  return del<{ id: string }>(`/api/shots/${id}`);
}

export async function analyzeScript(
  projectId: string,
  scriptContent: string
): Promise<ApiResponse<unknown>> {
  await updateProject(projectId, { scriptContent });
  return post<unknown>(`/api/projects/${projectId}/analyze`);
}

export async function getShotSuggestion(
  projectId: string,
  sceneId: string,
  sceneDescription: string
): Promise<ApiResponse<unknown>> {
  return post<unknown>("/api/ai/shot-suggestion", {
    projectId,
    sceneId,
    sceneDescription,
  });
}

export async function chatWithAI(
  message: string,
  _model?: string,
  context?: Record<string, unknown>
): Promise<
  ApiResponse<{
    response?: { message?: string; content?: string } | string;
    message?: string;
    content?: string;
  }>
> {
  return post<{
    response?: { message?: string; content?: string } | string;
    message?: string;
    content?: string;
  }>("/api/ai/chat", { message, context });
}

export default {
  get,
  post,
  put,
  del,
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
  analyzeScript,
  getShotSuggestion,
  chatWithAI,
};
