// Core Types for AI Agent System

export interface AIAgentConfig {
  id: string;
  name: string;
  description?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  capabilities?: AIAgentCapabilities;
  dependencies?: string[];
  cacheStrategy?: string;
  confidenceThreshold?: number;
  parallelizable?: boolean;
  collaboratesWith?: string[];
  dependsOn?: string[];
  enhances?: string[];
  category?: TaskCategory;
  fewShotExamples?: any[];
  chainOfThoughtTemplate?: string;
  batchProcessing?: boolean;
  validationRules?: string[];
  outputSchema?: any;
}

export interface AIAgentCapabilities {
  canAnalyze?: boolean;
  canGenerate?: boolean;
  canCritique?: boolean;
  canDebate?: boolean;
  supportedLanguages?: string[];
  maxInputLength?: number;
  ragEnabled?: boolean;
  metacognitive?: boolean;
  agentOrchestration?: boolean;
  multiModal?: boolean;
  complexityScore?: number;
  accuracyLevel?: number;
  processingSpeed?: number;
  resourceIntensity?: number;
  reasoningChains?: boolean;
  adaptiveLearning?: boolean;
  toolUse?: boolean;
  memorySystem?: boolean;
  selfReflection?: boolean;
  vectorSearch?: boolean;
  languageModeling?: boolean;
  patternRecognition?: boolean;
  creativeGeneration?: boolean;
  analyticalReasoning?: boolean;
  emotionalIntelligence?: boolean;
}

export interface StandardAgentOptions {
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  retries?: number;
  enableCaching?: boolean;
  enableLogging?: boolean;
}

export interface StandardAgentInput {
  text: string;
  context?: Record<string, unknown>;
  options?: StandardAgentOptions;
}

export interface StandardAgentOutput {
  text: string;
  confidence: number;
  notes: any;
  metadata: {
    ragUsed?: boolean;
    critiqueIterations?: number;
    constitutionalViolations?: number;
    uncertaintyScore?: number;
    hallucinationDetected?: boolean;
    debateRounds?: number;
    completionQuality?: number;
    creativityScore?: number;
    sceneQuality?: number;
    worldQuality?: number;
    processingTime?: number;
  };
}

export interface Result<T, E = Error> {
  success: boolean;
  data?: T;
  error?: E;
}

export enum TaskCategory {
  CORE = "core",
  PREDICTIVE = "predictive",
  ADVANCED_MODULES = "advanced_modules",
  ANALYSIS = "analysis",
  CREATIVE = "creative",
}

export enum TaskType {
  CHARACTER = "character",
  SCENE = "scene",
  SCRIPT = "script",
  GENERAL = "general",
  ANALYSIS = "analysis",
  CREATIVE = "creative",
  INTEGRATED = "integrated",
  COMPLETION = "completion",
  AUDIENCE_RESONANCE = "audience_resonance",
  PLATFORM_ADAPTER = "platform_adapter",
  CREATIVE_DEVELOPMENT = "creative_development",
  ADAPTIVE_REWRITING = "adaptive_rewriting",
  SCENE_GENERATOR = "scene_generator",
  CHARACTER_VOICE = "character_voice",
  WORLD_BUILDER = "world_builder",
  PLOT_PREDICTOR = "plot_predictor",
  TENSION_OPTIMIZER = "tension_optimizer",
  RHYTHM_MAPPING = "rhythm_mapping",
  CHARACTER_NETWORK = "character_network",
  DIALOGUE_FORENSICS = "dialogue_forensics",
  THEMATIC_MINING = "thematic_mining",
  STYLE_FINGERPRINT = "style_fingerprint",
  CONFLICT_DYNAMICS = "conflict_dynamics",
  CHARACTER_DEEP_ANALYZER = "character_deep_analyzer",
  DIALOGUE_ADVANCED_ANALYZER = "dialogue_advanced_analyzer",
  VISUAL_CINEMATIC_ANALYZER = "visual_cinematic_analyzer",
  THEMES_MESSAGES_ANALYZER = "themes_messages_analyzer",
  CULTURAL_HISTORICAL_ANALYZER = "cultural_historical_analyzer",
  PRODUCIBILITY_ANALYZER = "producibility_analyzer",
  TARGET_AUDIENCE_ANALYZER = "target_audience_analyzer",
  LITERARY_QUALITY_ANALYZER = "literary_quality_analyzer",
  RECOMMENDATIONS_GENERATOR = "recommendations_generator",
}

export interface AgentConfigMapping {
  path: string;
  configName: string;
}

export interface AIRequest {
  text: string;
  taskType?: TaskType;
  options?: Record<string, unknown>;
}

export interface AIResponse {
  text: string;
  confidence: number;
  metadata?: Record<string, unknown>;
}

// Utility functions
export function createResult<T>(data: T): Result<T> {
  return { success: true, data };
}

export function createError<E>(error: E): Result<never, E> {
  return { success: false, error };
}

export function isSuccess<T, E>(
  result: Result<T, E>
): result is Result<T, E> & { success: true; data: T } {
  return result.success;
}

export function isError<T, E>(
  result: Result<T, E>
): result is Result<T, E> & { success: false; error: E } {
  return !result.success;
}
