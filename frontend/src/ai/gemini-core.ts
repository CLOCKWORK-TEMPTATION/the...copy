// Gemini AI Core Integration for Frontend
// Routes all Gemini calls through Backend API for security and caching

import { analyzeScript, getShotSuggestion, chatWithAI } from "@/lib/api";

/**
 * Model identifier type
 */
export type ModelId =
  | "gemini-1.5-flash"
  | "gemini-1.5-pro"
  | "gemini-pro"
  | "gemini-flash";

/**
 * Convert Gemini response to plain text
 */
export function toText(response: any): string {
  if (typeof response === "string") return response;
  if (response?.text) return response.text;
  if (response?.response?.text) return response.response.text();
  return JSON.stringify(response);
}

/**
 * Safe string substitution helper
 */
export function safeSub(
  template: string,
  values: Record<string, string>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key] !== undefined ? values[key] : match;
  });
}

/**
 * Call Gemini with text prompt
 */
export async function callGeminiText(
  prompt: string,
  _options?: {
    model?: ModelId;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  try {
    const response = await geminiCore.chatWithAI(prompt);
    return toText(response);
  } catch (error) {
    console.error("Failed to call Gemini:", error);
    throw error;
  }
}

// Core Gemini functions that call Backend API
export const geminiCore = {
  // Analyze screenplay content via Backend
  async analyzeScreenplay(
    content: string,
    _analysisType: string = "structure",
    projectId?: string
  ) {
    if (!projectId) {
      throw new Error("projectId is required for screenplay analysis");
    }

    try {
      const response = await analyzeScript(projectId, content);
      return response.data;
    } catch (error) {
      console.error("Failed to analyze screenplay:", error);
      throw error;
    }
  },

  // Generate shot suggestions via Backend
  async generateShotSuggestion(
    sceneDescription: string,
    projectId?: string,
    sceneId?: string
  ) {
    if (!projectId || !sceneId) {
      throw new Error(
        "projectId and sceneId are required for shot suggestions"
      );
    }

    try {
      const response = await getShotSuggestion(
        projectId,
        sceneId,
        sceneDescription
      );
      return response.data;
    } catch (error) {
      console.error("Failed to generate shot suggestion:", error);
      throw error;
    }
  },

  // Chat with AI via Backend
  async chatWithAI(message: string, context?: Record<string, unknown>) {
    try {
      const response = await chatWithAI(message, undefined, context);
      return response.data;
    } catch (error) {
      console.error("Failed to chat with AI:", error);
      throw error;
    }
  },
};

// Stream response for real-time updates (via Backend)
export async function streamFlash(
  prompt: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  // For now, use regular chat - streaming can be implemented later
  const response = await geminiCore.chatWithAI(prompt);

  if (response && onChunk) {
    const nested =
      typeof response.response === "string"
        ? response.response
        : response.response?.message || response.response?.content;
    const text = nested || response.message || response.content || "";
    onChunk(text);
  }

  const nested =
    typeof response?.response === "string"
      ? response?.response
      : response?.response?.message || response?.response?.content;
  return nested || response?.message || response?.content || "";
}

export default geminiCore;
