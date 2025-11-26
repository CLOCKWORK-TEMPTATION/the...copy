/**
 * Application Constants
 */

// Task categories and types
export const TaskCategory = {
  CHARACTER: "character",
  SCENE: "scene",
  SCRIPT: "script",
  GENERAL: "general",
  INTEGRATED: "integrated",
  CORE: "core",
  PREDICTIVE: "predictive",
  ADVANCED_MODULES: "advanced_modules",
  ANALYSIS: "analysis",
  CREATIVE: "creative",
} as const;

export type TaskCategory = (typeof TaskCategory)[keyof typeof TaskCategory];

export const TaskType = {
  CHARACTER: "character",
  SCENE: "scene",
  SCRIPT: "script",
  GENERAL: "general",
  INTEGRATED: "integrated",
  CORE: "core",
  PREDICTIVE: "predictive",
  ADVANCED_MODULES: "advanced_modules",
  ANALYSIS: "analysis",
  CREATIVE: "creative",
} as const;

export type TaskType = (typeof TaskType)[keyof typeof TaskType];

// Enhancement levels
export const EnhancementLevel = {
  MINIMAL: "minimal",
  MODERATE: "moderate",
  EXTENSIVE: "extensive",
} as const;

export type EnhancementLevel =
  (typeof EnhancementLevel)[keyof typeof EnhancementLevel];

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
}

// Project interfaces
export interface Project {
  id: string;
  title: string;
  scriptContent?: string;
  userId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  status?: "active" | "archived" | "draft";
}

export interface Scene {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Character {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  traits?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Shot {
  id: string;
  sceneId: string;
  type: string;
  description?: string;
  duration?: number;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// AI Request types
export interface AIRequest {
  prompt?: string;
  context?: any;
  files?: File[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ExecutionResult {
  ok: boolean;
  value?: any;
  error?: string;
  message?: string;
}

// Default values
export const DEFAULT_AI_MODEL = "gemini-pro";
export const DEFAULT_TEMPERATURE = 0.7;
export const DEFAULT_MAX_TOKENS = 2048;

// API Endpoints
export const API_ENDPOINTS = {
  PROJECTS: "/api/projects",
  SCENES: "/api/scenes",
  CHARACTERS: "/api/characters",
  SHOTS: "/api/shots",
  ANALYZE: "/api/analyze",
  CHAT: "/api/chat",
} as const;
