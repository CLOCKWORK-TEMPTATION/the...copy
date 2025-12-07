/**
 * Upgraded Agents Export
 * جميع الوكلاء المحدّثة بالنمط القياسي
 * RAG → Self-Critique → Constitutional → Uncertainty → Hallucination → Debate
 * إخراج نصي فقط - لا JSON
 */

import { TaskType } from "@core/types";
import { BaseAgent } from "./shared/BaseAgent";

// Import upgraded agents
import { CompletionAgent } from "./completion/CompletionAgent";
import { CreativeAgent } from "./creative/CreativeAgent";
import { CharacterVoiceAgent } from "./characterVoice/CharacterVoiceAgent";
import { SceneGeneratorAgent } from "./sceneGenerator/SceneGeneratorAgent";
import { StyleFingerprintAgent } from "./styleFingerprint/StyleFingerprintAgent";
import { ThematicMiningAgent } from "./thematicMining/ThematicMiningAgent";
import { ConflictDynamicsAgent } from "./conflictDynamics/ConflictDynamicsAgent";
import { DialogueForensicsAgent } from "./dialogueForensics/DialogueForensicsAgent";
import { CharacterNetworkAgent } from "./characterNetwork/CharacterNetworkAgent";
import { AdaptiveRewritingAgent } from "./adaptiveRewriting/AdaptiveRewritingAgent";
import { TensionOptimizerAgent } from "./tensionOptimizer/TensionOptimizerAgent";
import { RhythmMappingAgent } from "./rhythmMapping/RhythmMappingAgent";
import { PlotPredictorAgent } from "./plotPredictor/PlotPredictorAgent";
import { WorldBuilderAgent } from "./worldBuilder/WorldBuilderAgent";
import { AudienceResonanceAgent } from "./audienceResonance/AudienceResonanceAgent";

// Agent instances (singleton pattern)
export const completionAgent = new CompletionAgent();
export const creativeAgent = new CreativeAgent();
export const characterVoiceAgent = new CharacterVoiceAgent();
export const sceneGeneratorAgent = new SceneGeneratorAgent();
export const styleFingerprintAgent = new StyleFingerprintAgent();
export const thematicMiningAgent = new ThematicMiningAgent();
export const conflictDynamicsAgent = new ConflictDynamicsAgent();
export const dialogueForensicsAgent = new DialogueForensicsAgent();
export const characterNetworkAgent = new CharacterNetworkAgent();
export const adaptiveRewritingAgent = new AdaptiveRewritingAgent();
export const tensionOptimizerAgent = new TensionOptimizerAgent();
export const rhythmMappingAgent = new RhythmMappingAgent();
export const plotPredictorAgent = new PlotPredictorAgent();
export const worldBuilderAgent = new WorldBuilderAgent();
export const audienceResonanceAgent = new AudienceResonanceAgent();

/**
 * Agent registry - maps task types to agent instances
 */
export const UPGRADED_AGENTS = new Map<TaskType, BaseAgent>([
  [TaskType.COMPLETION, completionAgent],
  [TaskType.CREATIVE_DEVELOPMENT, creativeAgent],
  [TaskType.CHARACTER_VOICE, characterVoiceAgent],
  [TaskType.SCENE_GENERATOR, sceneGeneratorAgent],
  [TaskType.STYLE_FINGERPRINT, styleFingerprintAgent],
  [TaskType.THEMATIC_MINING, thematicMiningAgent],
  [TaskType.CONFLICT_DYNAMICS, conflictDynamicsAgent],
  [TaskType.DIALOGUE_FORENSICS, dialogueForensicsAgent],
  [TaskType.CHARACTER_NETWORK, characterNetworkAgent],
  [TaskType.ADAPTIVE_REWRITING, adaptiveRewritingAgent],
  [TaskType.TENSION_OPTIMIZER, tensionOptimizerAgent],
  [TaskType.RHYTHM_MAPPING, rhythmMappingAgent],
  [TaskType.PLOT_PREDICTOR, plotPredictorAgent],
  [TaskType.WORLD_BUILDER, worldBuilderAgent],
  [TaskType.AUDIENCE_RESONANCE, audienceResonanceAgent],
]);

import {
  StandardAgentInput,
  StandardAgentOutput,
} from "./shared/standardAgentPattern";

/**
 * Execute agent task with standard pattern
 * @param taskType - Type of task to execute
 * @param input - Standard agent input
 * @returns Standard agent output (text only)
 */
export async function executeAgentTask(
  taskType: TaskType,
  input: StandardAgentInput
): Promise<StandardAgentOutput> {
  const agent = UPGRADED_AGENTS.get(taskType);

  if (!agent) {
    // Fallback for agents not yet upgraded
    console.warn(`Agent for ${taskType} not yet upgraded. Using fallback.`);
    return {
      text: `الوكيل ${taskType} لم يتم ترقيته بعد. يرجى المحاولة لاحقاً.`,
      confidence: 0.0,
      notes: ["الوكيل غير متاح"],
      metadata: {
        processingTime: 0,
        tokensUsed: 0,
        modelUsed: "none",
        timestamp: new Date().toISOString(),
      },
    };
  }

  try {
    // Execute with standard pattern
    return await agent.executeTask(input);
  } catch (error) {
    // SECURITY FIX: Pass taskType as separate argument to prevent format string injection
    console.error("Error executing task", taskType, ":", error);
    return {
      text: `حدث خطأ أثناء تنفيذ المهمة. يرجى المحاولة مرة أخرى.`,
      confidence: 0.0,
      notes: [error instanceof Error ? error.message : "خطأ غير معروف"],
      metadata: {
        processingTime: 0,
        tokensUsed: 0,
        modelUsed: "none",
        timestamp: new Date().toISOString(),
        error: true,
      },
    };
  }
}

/**
 * Get agent configuration
 */
export function getAgentConfig(taskType: TaskType) {
  const agent = UPGRADED_AGENTS.get(taskType);
  return agent?.getConfig() || null;
}

/**
 * Check if agent is upgraded
 */
export function isAgentUpgraded(taskType: TaskType): boolean {
  return UPGRADED_AGENTS.has(taskType);
}

/**
 * Get list of upgraded agents
 */
export function getUpgradedAgents(): TaskType[] {
  return Array.from(UPGRADED_AGENTS.keys());
}

/**
 * Create agents for remaining task types (to be implemented)
 * These will be created as they are upgraded
 */
export const AGENTS_TO_UPGRADE: TaskType[] = [
  TaskType.ANALYSIS,
  TaskType.INTEGRATED,
  TaskType.PLATFORM_ADAPTER,
  TaskType.CHARACTER_DEEP_ANALYZER,
  TaskType.DIALOGUE_ADVANCED_ANALYZER,
  TaskType.VISUAL_CINEMATIC_ANALYZER,
  TaskType.THEMES_MESSAGES_ANALYZER,
  TaskType.CULTURAL_HISTORICAL_ANALYZER,
  TaskType.PRODUCIBILITY_ANALYZER,
  TaskType.TARGET_AUDIENCE_ANALYZER,
  TaskType.LITERARY_QUALITY_ANALYZER,
  TaskType.RECOMMENDATIONS_GENERATOR,
];

/**
 * Batch execute multiple agent tasks
 */
export async function batchExecuteAgentTasks(
  tasks: Array<{ taskType: TaskType; input: StandardAgentInput }>
): Promise<StandardAgentOutput[]> {
  const results = await Promise.allSettled(
    tasks.map(({ taskType, input }) => executeAgentTask(taskType, input))
  );

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    } else {
      const task = tasks[index];
      const taskType = task?.taskType ?? "unknown";
      return {
        text: `فشل تنفيذ المهمة ${taskType}`,
        confidence: 0.0,
        notes: result.reason?.message || "خطأ غير معروف",
        metadata: {
          processingTime: 0,
          tokensUsed: 0,
          modelUsed: "none",
          timestamp: new Date().toISOString(),
          error: true,
        },
      };
    }
  });
}

/**
 * Get agent statistics
 */
export function getAgentStatistics() {
  const total = 15; // Total core agents for creative development (14 original + audienceResonance)
  const upgraded = UPGRADED_AGENTS.size;
  const remaining = total - upgraded;

  return {
    total,
    upgraded,
    remaining,
    percentage: Math.round((upgraded / total) * 100),
    upgradedAgents: getUpgradedAgents(),
    remainingAgents: AGENTS_TO_UPGRADE,
  };
}
