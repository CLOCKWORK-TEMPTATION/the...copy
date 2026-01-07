/**
 * Agent Debator - وكيل المناظرة
 * Handles individual agent participation in debates
 * المرحلة 3 - Multi-Agent Debate System
 */

import { BaseAgent } from '../shared/BaseAgent';
import { geminiService } from '@/services/gemini.service';
import {
  DebateRole,
  DebateArgument,
  DebatePosition,
  Refutation,
} from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * AgentDebator class
 * Wraps a BaseAgent to participate in debates
 */
export class AgentDebator {
  private agent: BaseAgent;
  private role: DebateRole;
  private debateHistory: DebateArgument[] = [];

  constructor(agent: BaseAgent, role: DebateRole) {
    this.agent = agent;
    this.role = role;
  }

  /**
   * Get agent name
   */
  getAgentName(): string {
    const config = this.agent.getConfig();
    return config.name;
  }

  /**
   * Get agent role
   */
  getRole(): DebateRole {
    return this.role;
  }

  /**
   * Present initial argument
   * تقديم الحجة الأولية
   */
  async presentArgument(
    topic: string,
    context?: string,
    previousArguments?: DebateArgument[]
  ): Promise<DebateArgument> {
    const agentName = this.getAgentName();
    console.log(`[AgentDebator] ${agentName} presenting argument for: ${topic}`);

    // Build prompt based on role
    let prompt = this.buildArgumentPrompt(topic, context, previousArguments);

    try {
      // Get agent's analysis
      const result = await this.agent.executeTask({
        input: prompt,
        options: {
          temperature: 0.7,
          enableRAG: true,
          enableSelfCritique: true,
        },
        context: context || '',
      });

      // Parse and structure the argument
      const argument: DebateArgument = {
        id: uuidv4(),
        agentName,
        role: this.role,
        position: result.text,
        reasoning: this.extractReasoning(result.text),
        evidence: this.extractEvidence(result.text),
        confidence: result.confidence,
        referencesTo: previousArguments?.map(arg => arg.id) || [],
        timestamp: new Date(),
      };

      this.debateHistory.push(argument);
      return argument;
    } catch (error) {
      console.error(`[AgentDebator] Error presenting argument:`, error);

      // Fallback argument
      return {
        id: uuidv4(),
        agentName,
        role: this.role,
        position: `عذراً، واجهت صعوبة في تقديم حجة كاملة حول: ${topic}`,
        reasoning: 'خطأ في المعالجة',
        evidence: [],
        confidence: 0.3,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Refute an existing argument
   * الرد على حجة موجودة
   */
  async refuteArgument(
    targetArgument: DebateArgument,
    context?: string
  ): Promise<Refutation> {
    const agentName = this.getAgentName();
    console.log(`[AgentDebator] ${agentName} refuting argument from ${targetArgument.agentName}`);

    const prompt = `
قم بتحليل ونقد الحجة التالية:

**الحجة الأصلية:**
${targetArgument.position}

**التبرير:**
${targetArgument.reasoning}

**الأدلة:**
${targetArgument.evidence.join('\n')}

قدم رداً منطقياً يتضمن:
1. نقاط الضعف في الحجة
2. حجج مضادة مدعومة بالأدلة
3. تقييم موضوعي لقوة الحجة الأصلية

${context ? `\n**السياق الإضافي:**\n${context}` : ''}
`;

    try {
      const result = await this.agent.executeTask({
        input: prompt,
        options: {
          temperature: 0.7,
          enableRAG: true,
          enableSelfCritique: true,
        },
        context: context || '',
      });

      const refutation: Refutation = {
        targetArgumentId: targetArgument.id,
        refutingAgent: agentName,
        counterArgument: result.text,
        evidence: this.extractEvidence(result.text),
        strength: this.calculateRefutationStrength(result.confidence, targetArgument.confidence),
      };

      return refutation;
    } catch (error) {
      console.error(`[AgentDebator] Error refuting argument:`, error);

      return {
        targetArgumentId: targetArgument.id,
        refutingAgent: agentName,
        counterArgument: 'عذراً، واجهت صعوبة في تقديم رد مناسب',
        evidence: [],
        strength: 0.2,
      };
    }
  }

  /**
   * Vote on arguments
   * التصويت على الحجج
   */
  async voteOnArguments(
    debateArguments: DebateArgument[],
    topic: string
  ): Promise<Map<string, number>> {
    const agentName = this.getAgentName();
    console.log(`[AgentDebator] ${agentName} voting on ${debateArguments.length} arguments`);

    const votes = new Map<string, number>();

    const prompt = `

بناءً على الموضوع: "${topic}"



قم بتقييم الحجج التالية وأعطِ كل واحدة درجة من 0 إلى 1:



${debateArguments.map((arg, idx) => `

**الحجة ${idx + 1}** (من ${arg.agentName}):

${arg.position}

الثقة: ${arg.confidence}

`).join('\n---\n')}

قدم تقييمك بناءً على:
- القوة المنطقية
- جودة الأدلة
- الصلة بالموضوع
- الشمولية

أعطِ درجة لكل حجة (0-1):
`;

    try {
      const result = await geminiService.generateContent(prompt, {
        temperature: 0.5,
        maxTokens: 2048,
      });

      // Parse voting results (simplified - in production, use structured output)
      const lines = result.split('\n');
      debateArguments.forEach((arg, idx) => {
        // Try to extract vote scores from the response
        const scoreMatch = lines.find(line =>
          line.includes(`${idx + 1}`) || (arg.agentName && line.includes(arg.agentName))
        );

        if (scoreMatch) {
          const match = scoreMatch.match(/(\d+\.?\d*)/);
          if (match) {
            const score = Math.min(1, Math.max(0, parseFloat(match[1])));
            votes.set(arg.id, score);
          }
        }

        // Default vote if parsing failed
        if (!votes.has(arg.id)) {
          votes.set(arg.id, arg.confidence * 0.8); // Base vote on confidence
        }
      });

      return votes;
    } catch (error) {
      console.error(`[AgentDebator] Error voting:`, error);

      // Fallback: vote based on confidence scores
      debateArguments.forEach(arg => {
        votes.set(arg.id, arg.confidence * 0.7);
      });

      return votes;
    }
  }

  /**
   * Build argument prompt based on role
   */
  private buildArgumentPrompt(
    topic: string,
    context?: string,
    previousArguments?: DebateArgument[]
  ): string {
    let prompt = `الموضوع: ${topic}\n\n`;

    if (context) {
      prompt += `السياق:\n${context}\n\n`;
    }

    if (previousArguments && previousArguments.length > 0) {
      prompt += `الحجج السابقة:\n`;
      previousArguments.forEach((arg, idx) => {
        prompt += `\n${idx + 1}. ${arg.agentName} (${arg.role}):\n${arg.position}\n`;
      });
      prompt += '\n';
    }

    switch (this.role) {
      case DebateRole.PROPOSER:
        prompt += 'قدم حجة قوية ومدعومة بالأدلة لدعم موقفك من هذا الموضوع.';
        break;
      case DebateRole.OPPONENT:
        prompt += 'قدم حجة مضادة مدعومة بالأدلة، مع تحليل نقدي للحجج السابقة.';
        break;
      case DebateRole.SYNTHESIZER:
        prompt += 'حلل الحجج المقدمة واستخلص نقاط التوافق والاختلاف، ثم قدم رأياً موحداً.';
        break;
      default:
        prompt += 'قدم تحليلاً متوازناً للموضوع مع عرض وجهات نظر متعددة.';
    }

    return prompt;
  }

  /**
   * Extract reasoning from text
   */
  private extractReasoning(text: string): string {
    // Look for reasoning patterns in Arabic
    const patterns = [
      /لأن[^\.]+\./g,
      /بسبب[^\.]+\./g,
      /نظراً[^\.]+\./g,
      /حيث أن[^\.]+\./g,
    ];

    let reasoning = '';
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        reasoning += matches.join(' ');
      }
    }

    return reasoning || text.substring(0, 200); // Fallback to first 200 chars
  }

  /**
   * Extract evidence from text
   */
  private extractEvidence(text: string): string[] {
    const evidence: string[] = [];

    // Look for bullet points or numbered lists
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.match(/^[\-\*\•]\s/) || line.match(/^\d+[\.\)]\s/)) {
        evidence.push(line.trim());
      }
    }

    // If no structured evidence found, extract sentences with key indicators
    if (evidence.length === 0) {
      const sentences = text.match(/[^\.!؟]+[\.!؟]/g) || [];
      const keyPhrases = ['مثل', 'على سبيل المثال', 'الدليل', 'يظهر', 'يوضح', 'تشير'];

      for (const sentence of sentences) {
        if (keyPhrases.some(phrase => sentence.includes(phrase))) {
          evidence.push(sentence.trim());
        }
      }
    }

    return evidence.slice(0, 5); // Limit to 5 pieces of evidence
  }

  /**
   * Calculate refutation strength
   */
  private calculateRefutationStrength(
    refuterConfidence: number,
    originalConfidence: number
  ): number {
    // Higher refuter confidence and lower original confidence = stronger refutation
    return (refuterConfidence + (1 - originalConfidence)) / 2;
  }

  /**
   * Get debate history
   */
  getDebateHistory(): DebateArgument[] {
    return [...this.debateHistory];
  }

  /**
   * Clear debate history
   */
  clearHistory(): void {
    this.debateHistory = [];
  }
}