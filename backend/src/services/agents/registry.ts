/**
 * Agent Registry - Backend
 * Central registry for all drama analyst agents
 */

import { TaskType } from './core/enums';
import { BaseAgent } from './shared/BaseAgent';
import { characterDeepAnalyzerAgent } from './characterDeepAnalyzer/CharacterDeepAnalyzerAgent';
import { dialogueAdvancedAnalyzerAgent } from './dialogueAdvancedAnalyzer/DialogueAdvancedAnalyzerAgent';
import { visualCinematicAnalyzerAgent } from './visualCinematicAnalyzer/VisualCinematicAnalyzerAgent';
import { themesMessagesAnalyzerAgent } from './themesMessagesAnalyzer/ThemesMessagesAnalyzerAgent';
import { culturalHistoricalAnalyzerAgent } from './culturalHistoricalAnalyzer/CulturalHistoricalAnalyzerAgent';
import { producibilityAnalyzerAgent } from './producibilityAnalyzer/ProducibilityAnalyzerAgent';
import { targetAudienceAnalyzerAgent } from './targetAudienceAnalyzer/TargetAudienceAnalyzerAgent';
import { productionReadinessAnalyzerAgent } from './productionReadinessAnalyzer/ProductionReadinessAnalyzerAgent';

/**
 * Agent Registry Map
 * Maps TaskType to Agent Instance
 */
export class AgentRegistry {
  private static instance: AgentRegistry;
  private agents: Map<TaskType, BaseAgent> = new Map();

  private constructor() {
    this.registerAgents();
  }

  public static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  /**
   * Register all available agents
   */
  private registerAgents(): void {
    // Analysis agents
    this.agents.set(TaskType.CHARACTER_DEEP_ANALYZER, characterDeepAnalyzerAgent);
    this.agents.set(TaskType.DIALOGUE_ADVANCED_ANALYZER, dialogueAdvancedAnalyzerAgent);
    this.agents.set(TaskType.VISUAL_CINEMATIC_ANALYZER, visualCinematicAnalyzerAgent);
    this.agents.set(TaskType.THEMES_MESSAGES_ANALYZER, themesMessagesAnalyzerAgent);
    this.agents.set(TaskType.CULTURAL_HISTORICAL_ANALYZER, culturalHistoricalAnalyzerAgent);
    this.agents.set(TaskType.PRODUCIBILITY_ANALYZER, producibilityAnalyzerAgent);
    this.agents.set(TaskType.TARGET_AUDIENCE_ANALYZER, targetAudienceAnalyzerAgent);
    this.agents.set(TaskType.PRODUCTION_READINESS_ANALYZER, productionReadinessAnalyzerAgent);
  }

  /**
   * Get agent by task type
   */
  public getAgent(taskType: TaskType): BaseAgent | undefined {
    return this.agents.get(taskType);
  }

  /**
   * Get all registered agents
   */
  public getAllAgents(): Map<TaskType, BaseAgent> {
    return new Map(this.agents);
  }

  /**
   * Check if agent exists for task type
   */
  public hasAgent(taskType: TaskType): boolean {
    return this.agents.has(taskType);
  }

  /**
   * Get available task types
   */
  public getAvailableTaskTypes(): TaskType[] {
    return Array.from(this.agents.keys());
  }

  /**
   * Get agent count
   */
  public getAgentCount(): number {
    return this.agents.size;
  }
}

/**
 * Singleton instance export
 */
export const agentRegistry = AgentRegistry.getInstance();
