/**
 * Instructions loader service for dynamic loading of agent instructions
 */

import { INSTRUCTIONS_MAP } from '../agents/instructions';

interface InstructionSet {
  systemPrompt: string;
  instructions: string[];
  outputFormat?: Record<string, string>;
  examples?: Array<{ input: string; output: string }>;
  [key: string]: any;
}

class InstructionsLoader {
  private cache = new Map<string, InstructionSet>();

  /**
   * Load instructions for a specific agent
   */
  async loadInstructions(agentId: string): Promise<InstructionSet> {
    // Check cache first
    if (this.cache.has(agentId)) {
      return this.cache.get(agentId)!;
    }

    try {
      const rawInstructions = INSTRUCTIONS_MAP[agentId];
      
      if (!rawInstructions) {
        console.warn(`No instructions found for agent ${agentId}, using fallback`);
        return this.getFallbackInstructions(agentId);
      }

      const instructions = this.parseInstructions(rawInstructions, agentId);
      this.cache.set(agentId, instructions);
      return instructions;
    } catch (error) {
      console.error(`Failed to load instructions for ${agentId}:`, error);
      return this.getFallbackInstructions(agentId);
    }
  }

  /**
   * Parse raw instructions string into InstructionSet
   */
  private parseInstructions(raw: string, agentId: string): InstructionSet {
    try {
      // Extract JSON block
      const jsonMatch = raw.match(/```json\s*([\s\S]*?)\s*```/);
      let parsedJson: any = {};
      
      if (jsonMatch && jsonMatch[1]) {
        try {
          parsedJson = JSON.parse(jsonMatch[1]);
        } catch (e) {
          console.warn(`Failed to parse JSON for ${agentId}`, e);
        }
      }

      // Extract text before JSON as system prompt context
      const textContext = raw.split(/```json/)[0].trim();

      return {
        systemPrompt: textContext || `أنت وكيل ذكي متخصص في ${agentId}`,
        instructions: parsedJson.instructions || [textContext],
        outputFormat: parsedJson.outputFormat || {},
        examples: parsedJson.examples || [],
        ...parsedJson
      };
    } catch (error) {
      console.error(`Error parsing instructions for ${agentId}:`, error);
      return this.getFallbackInstructions(agentId);
    }
  }

  /**
   * Get fallback instructions when loading fails
   */
  private getFallbackInstructions(agentId: string): InstructionSet {
    return {
      systemPrompt: `أنت وكيل ذكي متخصص في ${agentId}. قم بتحليل المحتوى المقدم وقدم رؤى مفيدة.`,
      instructions: [
        'حلل المحتوى المقدم بعناية',
        'قدم رؤى مفيدة وقابلة للتطبيق',
        'حافظ على الجودة والدقة في التحليل'
      ],
      outputFormat: {
        analysis: 'التحليل الأساسي',
        recommendations: 'التوصيات'
      }
    };
  }

  /**
   * Preload instructions for multiple agents
   */
  async preloadInstructions(agentIds: string[]): Promise<void> {
    // Since we import directly, preloading is just caching parsed results
    agentIds.forEach(id => this.loadInstructions(id));
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache status
   */
  getCacheStatus(): { cached: string[] } {
    return {
      cached: Array.from(this.cache.keys())
    };
  }
}

// Singleton instance
export const instructionsLoader = new InstructionsLoader();

// Export types
export type { InstructionSet };
