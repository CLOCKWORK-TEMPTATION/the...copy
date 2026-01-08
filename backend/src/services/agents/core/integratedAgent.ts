import { GeminiService } from './geminiService';
import type { AgentConfig } from '../../../config/agentConfigs';
import { agentsConfig } from '../../../config/agentConfigs';
import { TaskCategory, TaskType } from '../../../types/types';
import type { AIAgentConfig } from '../../../types/types';

/**
 * @class IntegratedAgent
 * @description Base class for all integrated AI agents in the system
 */
export class IntegratedAgent {
  protected geminiService: GeminiService;
  protected config: AgentConfig;
  protected agentConfig: AIAgentConfig;

  constructor(agentConfig: AIAgentConfig, apiKey: string) {
    this.agentConfig = agentConfig;
    this.config = agentsConfig[agentConfig.id || 'default'] || agentsConfig.default;
    this.geminiService = new GeminiService(apiKey, this.config);
  }

  /**
   * @method execute
   * @description Execute the agent's primary task - must be overridden by subclasses
   */
  public async execute(...args: any[]): Promise<any> {
    throw new Error("Method 'execute()' must be implemented by subclass.");
  }
}
