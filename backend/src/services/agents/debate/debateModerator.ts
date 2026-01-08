/**
 * Debate Moderator - منسق المناظرة
 * Orchestrates debates, builds consensus, and synthesizes results
 * المرحلة 3 - Multi-Agent Debate System
 */

import { geminiService } from '@/services/gemini.service';
import {
  DebateSession,
  DebateConfig,
  DebateParticipant,
  DebateArgument,
  ConsensusResult,
  Vote,
} from './types';
import { DebateSessionClass } from './debateSession';
import { StandardAgentOutput } from '../shared/standardAgentPattern';

/**
 * DebateModerator class
 * Manages the entire debate process and builds consensus
 */
export class DebateModerator {
  private session: DebateSessionClass;
  private votes: Map<string, Vote[]> = new Map();

  constructor(
    topic: string,
    participants: DebateParticipant[],
    config?: Partial<DebateConfig>
  ) {
    this.session = new DebateSessionClass(topic, participants, config);
  }

  /**
   * Run the complete debate process
   */
  async runDebate(context?: string): Promise<StandardAgentOutput> {
    console.log(`[DebateModerator] Starting debate on: ${this.session.topic}`);

    try {
      await this.session.start();

      const maxRounds = this.session.config.maxRounds || 3;
      const consensusThreshold = this.session.config.consensusThreshold || 0.75;

      let consensusReached = false;
      let currentRound = 1;

      // Execute debate rounds
      while (currentRound <= maxRounds && !consensusReached) {
        console.log(`[DebateModerator] Round ${currentRound}/${maxRounds}`);

        // Execute round
        await this.session.executeRound(currentRound, context);

        // Check for consensus after round 1
        if (currentRound > 1 || maxRounds === 1) {
          const consensus = await this.buildConsensus();
          const round = this.session.getCurrentRound();
          if (round) {
            (round as any).consensus = consensus;
          }

          if (consensus.achieved && consensus.agreementScore >= consensusThreshold) {
            consensusReached = true;
            console.log(`[DebateModerator] Consensus reached in round ${currentRound}`);
            break;
          }
        }

        currentRound++;
      }

      // Generate final synthesis
      const finalResult = await this.synthesizeFinalResult();
      this.session.setFinalResult(finalResult);
      this.session.complete();

      return finalResult;
    } catch (error) {
      console.error(`[DebateModerator] Debate failed:`, error);
      this.session.fail(error instanceof Error ? error.message : 'Unknown error');

      // Return fallback result
      return {
        text: `عذراً، حدث خطأ أثناء المناظرة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`,
        confidence: 0.3,
        notes: ['فشل في إتمام المناظرة'],
        metadata: {
          debateRounds: this.session.rounds.length,
        },
      };
    }
  }

  /**
   * Build consensus from arguments
   */
  async buildConsensus(): Promise<ConsensusResult> {
    console.log(`[DebateModerator] Building consensus...`);

    const allArguments = this.session.getAllArguments();

    if (allArguments.length === 0) {
      return {
        achieved: false,
        agreementScore: 0,
        consensusPoints: [],
        disagreementPoints: ['لا توجد حجج كافية للتحليل'],
        finalSynthesis: '',
        participatingAgents: [],
        confidence: 0,
      };
    }

    try {
      // Analyze arguments for common themes and disagreements
      const analysis = await this.analyzeArguments(allArguments);

      // Calculate agreement score
      const agreementScore = await this.calculateAgreementScore(allArguments);

      // Determine if consensus is achieved
      const consensusThreshold = this.session.config.consensusThreshold || 0.75;
      const achieved = agreementScore >= consensusThreshold;

      // Get participating agents
      const participatingAgents = Array.from(
        new Set(allArguments.map(arg => arg.agentName))
      );

      // Generate synthesis if consensus achieved
      let finalSynthesis = '';
      if (achieved) {
        finalSynthesis = await this.generateSynthesis(
          allArguments,
          analysis.consensusPoints
        );
      }

      return {
        achieved,
        agreementScore,
        consensusPoints: analysis.consensusPoints,
        disagreementPoints: analysis.disagreementPoints,
        finalSynthesis,
        participatingAgents,
        confidence: agreementScore,
      };
    } catch (error) {
      console.error(`[DebateModerator] Error building consensus:`, error);

      return {
        achieved: false,
        agreementScore: 0,
        consensusPoints: [],
        disagreementPoints: ['خطأ في تحليل التوافق'],
        finalSynthesis: '',
        participatingAgents: [],
        confidence: 0,
      };
    }
  }

  /**
   * Analyze arguments to find consensus and disagreement points
   */
  private async analyzeArguments(
    debateArguments: DebateArgument[]
  ): Promise<{ consensusPoints: string[]; disagreementPoints: string[] }> {
    const prompt = `

قم بتحليل الحجج التالية في مناظرة حول: "${this.session.topic}"



${debateArguments.map((arg, idx) => `
**الحجة ${idx + 1}** (${arg.agentName}):
${arg.position}
الثقة: ${arg.confidence}
`).join('\n---\n')}

حدد:
1. **نقاط التوافق**: النقاط التي يتفق عليها معظم المشاركين
2. **نقاط الاختلاف**: النقاط المثيرة للجدل أو التي يختلف عليها المشاركون

قدم النتائج بشكل واضح ومنظم.
`;

    try {
      const response = await geminiService.generateContent(prompt, {
        temperature: 0.5,
        maxTokens: 4096,
      });

      // Parse response to extract consensus and disagreement points
      const lines = response.split('\n');
      const consensusPoints: string[] = [];
      const disagreementPoints: string[] = [];

      let currentSection: 'consensus' | 'disagreement' | null = null;

      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.includes('توافق') || trimmed.includes('اتفاق')) {
          currentSection = 'consensus';
          continue;
        }

        if (trimmed.includes('اختلاف') || trimmed.includes('جدل')) {
          currentSection = 'disagreement';
          continue;
        }

        // Extract bullet points or numbered items
        if (trimmed.match(/^[\-\*\•]\s/) || trimmed.match(/^\d+[\.\)]\s/)) {
          const point = trimmed.replace(/^[\-\*\•]\s/, '').replace(/^\d+[\.\)]\s/, '');

          if (currentSection === 'consensus') {
            consensusPoints.push(point);
          } else if (currentSection === 'disagreement') {
            disagreementPoints.push(point);
          }
        }
      }

      return { consensusPoints, disagreementPoints };
    } catch (error) {
      console.error(`[DebateModerator] Error analyzing arguments:`, error);
      return {
        consensusPoints: [],
        disagreementPoints: ['خطأ في التحليل'],
      };
    }
  }

  /**
   * Calculate agreement score (0-1)
   */
  private async calculateAgreementScore(debateArguments: DebateArgument[]): Promise<number> {
    if (debateArguments.length === 0) return 0;

    // Method 1: Based on confidence similarity
    const confidences = debateArguments.map(arg => arg.confidence);
    const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    const variance = confidences.reduce((sum, c) => sum + Math.pow(c - avgConfidence, 2), 0) / confidences.length;
    const confidenceAgreement = 1 - Math.min(1, variance);

    // Method 2: Based on position similarity (using AI)
    let positionAgreement = 0.5; // Default

    try {
      const prompt = `
على مقياس من 0 إلى 1، ما مدى تشابه المواقف التالية؟

${debateArguments.map((arg, idx) => `
${idx + 1}. ${arg.agentName}: ${arg.position.substring(0, 200)}
`).join('\n')}

أعطِ فقط رقماً بين 0 و 1 (حيث 1 = تطابق تام، 0 = تعارض تام):
`;

      const response = await geminiService.generateContent(prompt, {
        temperature: 0.3,
        maxTokens: 100,
      });

      const match = response.match(/(\d+\.?\d*)/);
      if (match && match[1]) {
        positionAgreement = Math.min(1, Math.max(0, parseFloat(match[1])));
      }
    } catch (error) {
      console.error(`[DebateModerator] Error calculating position agreement:`, error);
    }

    // Combined score (weighted average)
    const agreementScore = (confidenceAgreement * 0.3) + (positionAgreement * 0.7);

    return agreementScore;
  }

  /**
   * Generate synthesis from consensus points
   */
  private async generateSynthesis(
    debateArguments: DebateArgument[],
    consensusPoints: string[]
  ): Promise<string> {
    const prompt = `
بناءً على المناظرة حول: "${this.session.topic}"

**نقاط التوافق:**
${consensusPoints.map((point, idx) => `${idx + 1}. ${point}`).join('\n')}

**الحجج الأصلية:**

${debateArguments.slice(0, 3).map((arg, idx) => `

${idx + 1}. ${arg.agentName}: ${arg.position.substring(0, 300)}

`).join('\n')}

قم بتوليف موقف نهائي موحد يجمع نقاط التوافق ويقدم رأياً متماسكاً وشاملاً.
`;

    try {
      const synthesis = await geminiService.generateContent(prompt, {
        temperature: 0.6,
        maxTokens: 8192,
      });

      return synthesis;
    } catch (error) {
      console.error(`[DebateModerator] Error generating synthesis:`, error);
      return 'خطأ في توليد التوليف النهائي';
    }
  }

  /**
   * Synthesize final result from all debate rounds
   */
  private async synthesizeFinalResult(): Promise<StandardAgentOutput> {
    console.log(`[DebateModerator] Synthesizing final result...`);

    const metrics = this.session.getMetrics();
    const lastRound = this.session.getCurrentRound();
    const consensus = lastRound?.consensus;

    let finalText = '';
    let confidence = 0;
    const notes: string[] = [];

    if (consensus && consensus.achieved) {
      finalText = consensus.finalSynthesis;
      confidence = consensus.confidence;
      notes.push(`تم التوصل إلى توافق بنسبة ${(consensus.agreementScore * 100).toFixed(1)}%`);
    } else {
      // No consensus - synthesize from all arguments
      const allArguments = this.session.getAllArguments();
      finalText = await this.synthesizeWithoutConsensus(allArguments);
      confidence = metrics.averageConfidence * 0.8; // Reduce confidence if no consensus
      notes.push('لم يتم التوصل إلى توافق كامل - هذا توليف للآراء المختلفة');
    }

    notes.push(`عدد الجولات: ${metrics.totalRounds}`);
    notes.push(`عدد الحجج: ${metrics.totalArguments}`);
    notes.push(`جودة المناظرة: ${(metrics.qualityScore * 100).toFixed(1)}%`);

    return {
      text: finalText,
      confidence,
      notes,
      metadata: {
        debateRounds: metrics.totalRounds,
        consensusAchieved: metrics.consensusAchieved,
        participantCount: metrics.participantCount,
        agreementScore: metrics.finalAgreementScore,
        qualityScore: metrics.qualityScore,
        processingTime: metrics.processingTime,
      },
    };
  }

  /**
   * Synthesize result when no consensus is reached
   */
  private async synthesizeWithoutConsensus(debateArguments: DebateArgument[]): Promise<string> {
    const prompt = `
لم يتم التوصل إلى توافق كامل في المناظرة حول: "${this.session.topic}"

قم بتوليف الآراء المختلفة التالية في رؤية شاملة تعرض جميع وجهات النظر:

${debateArguments.map((arg, idx) => `

**${idx + 1}. ${arg.agentName}:**

${arg.position}

(الثقة: ${arg.confidence})

`).join('\n---\n')}

قدم توليفاً يشمل:
1. عرض موضوعي لجميع وجهات النظر
2. تحديد نقاط القوة في كل حجة
3. استخلاص رؤية متوازنة تجمع أفضل ما في كل موقف
`;

    try {
      const synthesis = await geminiService.generateContent(prompt, {
        temperature: 0.6,
        maxTokens: 8192,
      });

      return synthesis;
    } catch (error) {
      console.error(`[DebateModerator] Error synthesizing without consensus:`, error);
      return 'خطأ في توليف النتيجة النهائية';
    }
  }

  /**
   * Get debate session
   */
  getSession(): DebateSession {
    return this.session;
  }

  /**
   * Record a vote
   */
  recordVote(vote: Vote): void {
    const existingVotes = this.votes.get(vote.argumentId) || [];
    existingVotes.push(vote);
    this.votes.set(vote.argumentId, existingVotes);
  }

  /**
   * Get votes for an argument
   */
  getVotesForArgument(argumentId: string): Vote[] {
    return this.votes.get(argumentId) || [];
  }

  /**
   * Get all votes
   */
  getAllVotes(): Map<string, Vote[]> {
    return new Map(this.votes);
  }
}