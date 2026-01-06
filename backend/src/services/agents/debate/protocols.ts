/**
 * Debate Protocols
 * بروتوكولات المناظرة - High-level debate orchestration functions
 * المرحلة 3 - Multi-Agent Debate System
 */

import { BaseAgent } from '../shared/BaseAgent';
import {
  DebateConfig,
  DebateParticipant,
  DebateArgument,
  DebateRole,
  ConsensusResult,
  Vote,
} from './types';
import { DebateModerator } from './debateModerator';
import { StandardAgentOutput } from '../shared/standardAgentPattern';
import { selectDebatingAgents } from './selection';

/**
 * Start a debate session
 * بدء جلسة مناظرة
 */
export async function startDebate(
  topic: string,
  availableAgents: BaseAgent[],
  context?: string,
  config?: Partial<DebateConfig>
): Promise<StandardAgentOutput> {
  console.log(`[DebateProtocol] Starting debate on: ${topic}`);

  // Select participating agents
  const participants = selectDebatingAgents(availableAgents, config);

  if (participants.length < 2) {
    throw new Error('يجب أن يكون هناك على الأقل وكيلان للمناظرة');
  }

  // Create moderator and run debate
  const moderator = new DebateModerator(topic, participants, config);
  const result = await moderator.runDebate(context);

  return result;
}

/**
 * Present arguments from all participants
 * تقديم الحجج من جميع المشاركين
 */
export async function presentArguments(
  topic: string,
  participants: DebateParticipant[],
  context?: string,
  previousArguments?: DebateArgument[]
): Promise<DebateArgument[]> {
  console.log(`[DebateProtocol] Collecting arguments from ${participants.length} participants`);

  const argumentPromises = participants.map(async participant => {
    try {
      const agentName = participant.agent.getConfig().name;
      console.log(`[DebateProtocol] Getting argument from ${agentName}`);

      // Build prompt based on role
      const prompt = buildArgumentPrompt(
        topic,
        participant.role,
        context,
        previousArguments
      );

      const result = await participant.agent.executeTask({
        input: prompt,
        options: {
          temperature: 0.7,
          enableRAG: true,
          enableSelfCritique: true,
        },
        context: context || '',
      });

      const argument: DebateArgument = {
        id: `${agentName}-${Date.now()}`,
        agentName,
        role: participant.role,
        position: result.text,
        reasoning: extractReasoning(result.text),
        evidence: extractEvidence(result.text),
        confidence: result.confidence,
        referencesTo: previousArguments?.map(arg => arg.id) || [],
        timestamp: new Date(),
      };

      return argument;
    } catch (error) {
      console.error(`[DebateProtocol] Error getting argument from participant:`, error);
      return null;
    }
  });

  const debateArguments = await Promise.all(argumentPromises);

  // Filter out failed arguments
  return debateArguments.filter((arg): arg is DebateArgument => arg !== null);
}

/**
 * Refute arguments
 * الرد على الحجج
 */
export async function refuteArguments(
  args: DebateArgument[],
  participants: DebateParticipant[],
  context?: string
): Promise<DebateArgument[]> {
  console.log(`[DebateProtocol] Refuting ${args.length} arguments`);

  const refutations: DebateArgument[] = [];

  for (const participant of participants) {
    const agentName = participant.agent.getConfig().name;

    // Each agent refutes arguments from other agents
    const otherArguments = args.filter(arg => arg.agentName !== agentName);

    if (otherArguments.length === 0) continue;

    try {
      const prompt = buildRefutationPrompt(otherArguments, context);

      const result = await participant.agent.executeTask({
        input: prompt,
        options: {
          temperature: 0.7,
          enableRAG: true,
          enableSelfCritique: true,
        },
        context: context || '',
      });

      const refutation: DebateArgument = {
        id: `refutation-${agentName}-${Date.now()}`,
        agentName,
        role: DebateRole.OPPONENT,
        position: result.text,
        reasoning: extractReasoning(result.text),
        evidence: extractEvidence(result.text),
        confidence: result.confidence,
        referencesTo: otherArguments.map(arg => arg.id),
        timestamp: new Date(),
      };

      refutations.push(refutation);
    } catch (error) {
      console.error(`[DebateProtocol] Error getting refutation from ${agentName}:`, error);
    }
  }

  return refutations;
}

/**
 * Synthesize consensus from arguments
 * توليف التوافق من الحجج
 */
export async function synthesizeConsensus(
  args: DebateArgument[],
  topic: string,
  synthesizer?: BaseAgent
): Promise<ConsensusResult> {
  console.log(`[DebateProtocol] Synthesizing consensus from ${args.length} arguments`);

  if (args.length === 0) {
    return {
      achieved: false,
      agreementScore: 0,
      consensusPoints: [],
      disagreementPoints: ['لا توجد حجج للتحليل'],
      finalSynthesis: '',
      participatingAgents: [],
      confidence: 0,
    };
  }

  try {
    // Use synthesizer agent if provided, otherwise create synthesis directly
    const synthesisText = synthesizer
      ? await getSynthesizerAgentOutput(synthesizer, args, topic)
      : await generateDirectSynthesis(args, topic);

    // Analyze consensus points
    const { consensusPoints, disagreementPoints } = await analyzeConsensusPoints(
      args,
      synthesisText
    );

    // Calculate agreement score
    const agreementScore = calculateAgreementScore(args, consensusPoints);

    // Determine if consensus is achieved (threshold 0.75)
    const achieved = agreementScore >= 0.75;

    // Get participating agents
    const participatingAgents = Array.from(
      new Set(args.map(arg => arg.agentName))
    );

    return {
      achieved,
      agreementScore,
      consensusPoints,
      disagreementPoints,
      finalSynthesis: synthesisText,
      participatingAgents,
      confidence: agreementScore,
    };
  } catch (error) {
    console.error(`[DebateProtocol] Error synthesizing consensus:`, error);

    return {
      achieved: false,
      agreementScore: 0,
      consensusPoints: [],
      disagreementPoints: ['خطأ في توليف التوافق'],
      finalSynthesis: '',
      participatingAgents: [],
      confidence: 0,
    };
  }
}

/**
 * Vote on best response
 * التصويت على أفضل رد
 */
export async function voteOnBestResponse(
  args: DebateArgument[],
  participants: DebateParticipant[],
  topic: string
): Promise<{ argumentId: string; votes: Vote[]; winner: DebateArgument }> {
  console.log(`[DebateProtocol] Voting on ${args.length} arguments`);

  const allVotes: Vote[] = [];

  // Each participant votes on all arguments
  for (const participant of participants) {
    const agentName = participant.agent.getConfig().name;

    try {
      const prompt = buildVotingPrompt(args, topic);

      const result = await participant.agent.executeTask({
        input: prompt,
        options: {
          temperature: 0.5,
          enableRAG: false,
        },
      });

      // Parse votes from response
      const votes = parseVotesFromResponse(result.text, args, agentName);
      allVotes.push(...votes);
    } catch (error) {
      console.error(`[DebateProtocol] Error getting votes from ${agentName}:`, error);
    }
  }

  // Calculate vote scores for each argument
  const scoreMap = new Map<string, number>();
  args.forEach(arg => scoreMap.set(arg.id, 0));

  allVotes.forEach(vote => {
    const currentScore = scoreMap.get(vote.argumentId) || 0;
    scoreMap.set(vote.argumentId, currentScore + vote.score);
  });

  // Find winner (highest score)
  let maxScore = 0;
  let winnerId = args[0].id;

  scoreMap.forEach((score, argId) => {
    if (score > maxScore) {
      maxScore = score;
      winnerId = argId;
    }
  });

  const winner = args.find(arg => arg.id === winnerId) || args[0];

  return {
    argumentId: winnerId,
    votes: allVotes,
    winner,
  };
}

// ===== Helper Functions =====

/**
 * Build argument prompt based on role
 */
function buildArgumentPrompt(
  topic: string,
  role: DebateRole,
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
      prompt += `${idx + 1}. ${arg.agentName}: ${arg.position.substring(0, 200)}...\n`;
    });
    prompt += '\n';
  }

  switch (role) {
    case DebateRole.PROPOSER:
      prompt += 'قدم حجة قوية ومدعومة بالأدلة لدعم موقفك من هذا الموضوع.';
      break;
    case DebateRole.OPPONENT:
      prompt += 'قدم حجة مضادة مدعومة بالأدلة.';
      break;
    case DebateRole.SYNTHESIZER:
      prompt += 'حلل الحجج واستخلص رأياً موحداً.';
      break;
    default:
      prompt += 'قدم تحليلاً متوازناً للموضوع.';
  }

  return prompt;
}

/**
 * Build refutation prompt
 */
function buildRefutationPrompt(
  args: DebateArgument[],
  context?: string
): string {
  let prompt = 'قم بتحليل ونقد الحجج التالية:\n\n';

  args.forEach((arg, idx) => {
    prompt += `**الحجة ${idx + 1}** (${arg.agentName}):\n`;
    prompt += `${arg.position}\n\n`;
  });

  if (context) {
    prompt += `\nالسياق:\n${context}\n\n`;
  }

  prompt += 'قدم رداً منطقياً يتضمن نقاط الضعف والحجج المضادة.';

  return prompt;
}

/**
 * Build voting prompt
 */
function buildVotingPrompt(args: DebateArgument[], topic: string): string {
  let prompt = `الموضوع: ${topic}\n\nقيّم الحجج التالية (من 0 إلى 1):\n\n`;

  args.forEach((arg, idx) => {
    prompt += `${idx + 1}. ${arg.agentName}:\n${arg.position.substring(0, 300)}\n\n`;
  });

  prompt += 'أعطِ درجة لكل حجة بناءً على القوة المنطقية والأدلة.';

  return prompt;
}

/**
 * Extract reasoning from text
 */
function extractReasoning(text: string): string {
  const patterns = [
    /لأن[^\.]+\./g,
    /بسبب[^\.]+\./g,
    /نظراً[^\.]+\./g,
  ];

  let reasoning = '';
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      reasoning += matches.join(' ');
    }
  }

  return reasoning || text.substring(0, 200);
}

/**
 * Extract evidence from text
 */
function extractEvidence(text: string): string[] {
  const evidence: string[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    if (line.match(/^[\-\*\•]\s/) || line.match(/^\d+[\.\)]\s/)) {
      evidence.push(line.trim());
    }
  }

  return evidence.slice(0, 5);
}

/**
 * Get synthesis from synthesizer agent
 */
async function getSynthesizerAgentOutput(
  synthesizer: BaseAgent,
  args: DebateArgument[],
  topic: string
): Promise<string> {
  const prompt = `
الموضوع: ${topic}

قم بتوليف الحجج التالية في رأي موحد:

${args.map((arg, idx) => `
${idx + 1}. ${arg.agentName}:
${arg.position}
`).join('\n---\n')}

قدم توليفاً شاملاً يجمع أفضل ما في كل حجة.
`;

  const result = await synthesizer.executeTask({
    input: prompt,
    options: {
      temperature: 0.6,
      enableRAG: true,
    },
  });

  return result.text;
}

/**
 * Generate direct synthesis without synthesizer agent
 */
async function generateDirectSynthesis(
  args: DebateArgument[],
  topic: string
): Promise<string> {
  // Simple concatenation with summary
  let synthesis = `# توليف الآراء حول: ${topic}\n\n`;

  synthesis += `بناءً على ${args.length} حجة من المشاركين، نستنتج ما يلي:\n\n`;

  args.forEach((arg, idx) => {
    synthesis += `**${idx + 1}. ${arg.agentName}:**\n${arg.position.substring(0, 300)}...\n\n`;
  });

  return synthesis;
}

/**
 * Analyze consensus points from arguments
 */
async function analyzeConsensusPoints(
  args: DebateArgument[],
  synthesisText: string
): Promise<{ consensusPoints: string[]; disagreementPoints: string[] }> {
  // Simple extraction from synthesis text
  const consensusPoints: string[] = [];
  const disagreementPoints: string[] = [];

  const lines = synthesisText.split('\n');

  for (const line of lines) {
    if (line.includes('اتفاق') || line.includes('توافق')) {
      consensusPoints.push(line.trim());
    }
    if (line.includes('اختلاف') || line.includes('تعارض')) {
      disagreementPoints.push(line.trim());
    }
  }

  return { consensusPoints, disagreementPoints };
}

/**
 * Calculate agreement score
 */
function calculateAgreementScore(
  args: DebateArgument[],
  consensusPoints: string[]
): number {
  if (args.length === 0) return 0;

  // Base score on confidence similarity and consensus points
  const avgConfidence =
    args.reduce((sum, arg) => sum + arg.confidence, 0) / args.length;

  const consensusRatio = Math.min(1, consensusPoints.length / args.length);

  return (avgConfidence * 0.6) + (consensusRatio * 0.4);
}

/**
 * Parse votes from AI response
 */
function parseVotesFromResponse(
  response: string,
  args: DebateArgument[],
  voterId: string
): Vote[] {
  const votes: Vote[] = [];

  args.forEach((arg, idx) => {
    // Try to find score for this argument
    const scoreMatch = response.match(new RegExp(`${idx + 1}[\\s\\S]{0,50}(\\d+\\.?\\d*)`, 'i'));

    let score = 0.5; // Default
    if (scoreMatch) {
      score = Math.min(1, Math.max(0, parseFloat(scoreMatch[1])));
    }

    votes.push({
      voterId,
      argumentId: arg.id,
      score,
      timestamp: new Date(),
    });
  });

  return votes;
}