export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: unknown;
}

export interface Project {
  id: string;
  title: string;
  scriptContent?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Scene {
  id: string;
  projectId: string;
  sceneNumber: number;
  title: string;
  location: string;
  timeOfDay: string;
  characters: string[];
  description?: string | null;
  shotCount?: number;
  status: string;
}

export interface Character {
  id: string;
  projectId: string;
  name: string;
  appearances: number;
  consistencyStatus: string;
  lastSeen?: string | null;
  notes?: string | null;
}

export interface Shot {
  id: string;
  sceneId: string;
  shotNumber: number;
  shotType: string;
  cameraAngle: string;
  cameraMovement: string;
  lighting: string;
  aiSuggestion?: string | null;
}

export interface CreateProjectRequest {
  title: string;
  scriptContent?: string;
}

export interface UpdateProjectRequest {
  title?: string;
  scriptContent?: string;
}

export interface CreateCharacterRequest {
  name: string;
  appearances?: number;
  consistencyStatus?: string;
  lastSeen?: string | null;
  notes?: string | null;
}

export interface UpdateCharacterRequest {
  name?: string;
  appearances?: number;
  consistencyStatus?: string;
  lastSeen?: string | null;
  notes?: string | null;
}

export interface CreateSceneRequest {
  sceneNumber: number;
  title: string;
  location: string;
  timeOfDay: string;
  characters: string[];
  description?: string | null;
  status?: string;
  shotCount?: number;
}

export interface UpdateSceneRequest {
  sceneNumber?: number;
  title?: string;
  location?: string;
  timeOfDay?: string;
  characters?: string[];
  description?: string | null;
  status?: string;
  shotCount?: number;
}

export interface CreateShotRequest {
  shotNumber: number;
  shotType: string;
  cameraAngle: string;
  cameraMovement: string;
  lighting: string;
  aiSuggestion?: string | null;
}

export interface UpdateShotRequest {
  shotNumber?: number;
  shotType?: string;
  cameraAngle?: string;
  cameraMovement?: string;
  lighting?: string;
  aiSuggestion?: string | null;
}
