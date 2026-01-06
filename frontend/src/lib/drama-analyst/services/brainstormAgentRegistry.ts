/**
 * Stub for drama analyst services
 * TODO: Implement actual agent registry
 */

export type BrainstormPhase = 1 | 2 | 3 | 4 | 5

export type AgentIcon =
  | "brain"
  | "users"
  | "message-square"
  | "book-open"
  | "target"
  | "shield"
  | "zap"
  | "cpu"
  | "layers"
  | "rocket"
  | "file-text"
  | "sparkles"
  | "trophy"
  | "globe"
  | "film"
  | "chart-bar"
  | "lightbulb"
  | "compass"
  | "fingerprint"
  | "pen-tool"
  | "music"
  | "search"

export type AgentCategory = "core" | "analysis" | "creative" | "predictive" | "advanced"

export interface BrainstormAgentDefinition {
  id: string
  name: string
  nameAr: string
  role: string
  description: string
  category: AgentCategory
  icon: AgentIcon
  taskType: string
  capabilities: {
    canAnalyze: boolean
    canGenerate: boolean
    canPredict: boolean
    hasMemory: boolean
    usesSelfReflection: boolean
    supportsRAG: boolean
  }
  collaboratesWith: string[]
  enhances: string[]
  complexityScore: number
  phaseRelevance: BrainstormPhase[]
}

export const BRAINSTORM_PHASES = {
  1: { name: "الملخص الإبداعي", description: "فهم الفكرة" },
  2: { name: "توليد الأفكار", description: "إنتاج أفكار جديدة" },
  3: { name: "المراجعة المستقلة", description: "تحليل شامل" },
  4: { name: "المناقشة التنافسية", description: "النقاش التفاعلي" },
  5: { name: "القرار النهائي", description: "التوصيات" },
}

export function getAllAgents(): BrainstormAgentDefinition[] {
  return []
}

export function getAgentsForPhase(phase: BrainstormPhase): BrainstormAgentDefinition[] {
  return []
}

export function getAgentStats() {
  return {
    total: 0,
    byCategory: {},
    withRAG: 0,
    withSelfReflection: 0,
    withMemory: 0,
    averageComplexity: 0,
  }
}

export function getCollaborators(agentId: string): string[] {
  return []
}

export const brainstormAgentRegistry = {
  getAgent: () => ({}),
  getAllAgents: () => [],
}

export default brainstormAgentRegistry
