/**
 * Debate Resolution System
 * نظام حل المناظرة
 * المرحلة 3 - Multi-Agent Debate System
 */

import { geminiService } from '@/services/gemini.service';
import { DebateArgument, ConsensusResult, Vote } from './types';

/**
 * Calculate agreement score between arguments
 * حساب درجة التوافق بين الحجج
 */
export async function calculateAgreementScore(
  args: DebateArgument[]
): Promise<number> {
  console.log(`[Resolution] Calculating agreement score for ${args.length} arguments`);

  if (args.length === 0) {
    return 0;
  }

  if (args.length === 1) {
    return args[0].confidence;
  }

  try {
    // Method 1: Confidence variance (30%)
    const confidenceScore = calculateConfidenceAgreement(args);

    // Method 2: Position similarity via AI (50%)
    const positionScore = await calculatePositionSimilarity(args);

    // Method 3: Evidence overlap (20%)
    const evidenceScore = calculateEvidenceOverlap(args);

    // Weighted combination
    const agreementScore =
      confidenceScore * 0.3 + positionScore * 0.5 + evidenceScore * 0.2;

    console.log(
      `[Resolution] Agreement score: ${agreementScore.toFixed(3)} ` +
        `(confidence: ${confidenceScore.toFixed(3)}, ` +
        `position: ${positionScore.toFixed(3)}, ` +
        `evidence: ${evidenceScore.toFixed(3)})`
    );

    return Math.min(1, Math.max(0, agreementScore));
  } catch (error) {
    console.error(`[Resolution] Error calculating agreement score:`, error);

    // Fallback: use average confidence
    const avgConfidence =
      args.reduce((sum, arg) => sum + arg.confidence, 0) / args.length;
    return avgConfidence;
  }
}

/**
 * Identify consensus points from arguments
 * تحديد نقاط التوافق
 */
export async function identifyConsensusPoints(
  args: DebateArgument[],
  topic: string
): Promise<string[]> {
  console.log(`[Resolution] Identifying consensus points`);

  if (args.length === 0) {
    return [];
  }

  try {
    const prompt = `
قم بتحليل الحجج التالية في مناظرة حول: "${topic}"

${args
  .map(
    (arg, idx) => `
**الحجة ${idx + 1}** (${arg.agentName}):
${arg.position}
الثقة: ${(arg.confidence * 100).toFixed(0)}%
`
  )
  .join('\n---\n')}

حدد **نقاط التوافق** التي يتفق عليها معظم المشاركين أو تظهر في أكثر من حجة.

قدم قائمة منقطة بنقاط التوافق فقط (بدون شرح إضافي):
`;

    const response = await geminiService.generateContent(prompt, {
      temperature: 0.4,
      maxTokens: 2048,
    });

    // Extract consensus points
    const points = extractBulletPoints(response);

    console.log(`[Resolution] Found ${points.length} consensus points`);
    return points;
  } catch (error) {
    console.error(`[Resolution] Error identifying consensus points:`, error);
    return [];
  }
}

/**
 * Identify disagreement points
 * تحديد نقاط الاختلاف
 */
export async function identifyDisagreementPoints(
  args: DebateArgument[],
  topic: string
): Promise<string[]> {
  console.log(`[Resolution] Identifying disagreement points`);

  if (args.length === 0) {
    return [];
  }

  try {
    const prompt = `
قم بتحليل الحجج التالية في مناظرة حول: "${topic}"

${args
  .map(
    (arg, idx) => `
**الحجة ${idx + 1}** (${arg.agentName}):
${arg.position}
`
  )
  .join('\n---\n')}

حدد **نقاط الاختلاف** التي يختلف عليها المشاركون أو تظهر بها آراء متعارضة.

قدم قائمة منقطة بنقاط الاختلاف فقط:
`;

    const response = await geminiService.generateContent(prompt, {
      temperature: 0.4,
      maxTokens: 2048,
    });

    // Extract disagreement points
    const points = extractBulletPoints(response);

    console.log(`[Resolution] Found ${points.length} disagreement points`);
    return points;
  } catch (error) {
    console.error(`[Resolution] Error identifying disagreement points:`, error);
    return [];
  }
}

/**
 * Resolve disagreements and find middle ground
 * حل الخلافات وإيجاد أرضية مشتركة
 */
export async function resolveDisagreements(
  args: DebateArgument[],
  disagreementPoints: string[],
  topic: string
): Promise<string> {
  console.log(
    `[Resolution] Resolving ${disagreementPoints.length} disagreement points`
  );

  if (disagreementPoints.length === 0) {
    return 'لا توجد نقاط اختلاف كبيرة للحل';
  }

  try {
    const prompt = `
الموضوع: "${topic}"

تم تحديد نقاط الاختلاف التالية:
${disagreementPoints.map((point, idx) => `${idx + 1}. ${point}`).join('\n')}

بناءً على الحجج الأصلية:
${args
  .map(
    (arg, idx) => `
${idx + 1}. ${arg.agentName}:
${arg.position.substring(0, 400)}
`
  )
  .join('\n---\n')}

قم بتقديم **حل توفيقي** لكل نقطة اختلاف يجمع بين وجهات النظر المختلفة:
`;

    const response = await geminiService.generateContent(prompt, {
      temperature: 0.6,
      maxTokens: 4096,
    });

    console.log(`[Resolution] Generated resolution for disagreements`);
    return response;
  } catch (error) {
    console.error(`[Resolution] Error resolving disagreements:`, error);
    return 'خطأ في توليد الحل التوفيقي';
  }
}

/**
 * Generate final synthesis from all arguments
 * توليف نهائي من جميع الحجج
 */
export async function generateFinalSynthesis(
  args: DebateArgument[],
  consensusPoints: string[],
  disagreementPoints: string[],
  topic: string
): Promise<string> {
  console.log(`[Resolution] Generating final synthesis`);

  if (args.length === 0) {
    return 'لا توجد حجج لتوليفها';
  }

  try {
    const prompt = `
الموضوع: "${topic}"

**نقاط التوافق:**
${consensusPoints.length > 0 ? consensusPoints.map((p, i) => `${i + 1}. ${p}`).join('\n') : 'لا توجد'}

**نقاط الاختلاف:**
${disagreementPoints.length > 0 ? disagreementPoints.map((p, i) => `${i + 1}. ${p}`).join('\n') : 'لا توجد'}

**الحجج الأصلية:**
${args
  .map(
    (arg, idx) => `
${idx + 1}. **${arg.agentName}** (ثقة: ${(arg.confidence * 100).toFixed(0)}%):
${arg.position}
`
  )
  .join('\n---\n')}

قم بتوليف **موقف نهائي شامل** يتضمن:
1. تلخيص نقاط التوافق
2. معالجة نقاط الاختلاف بطريقة متوازنة
3. استخلاص رؤية موحدة ومتماسكة
4. توصيات عملية (إن أمكن)

قدم التوليف بشكل منظم وواضح:
`;

    const synthesis = await geminiService.generateContent(prompt, {
      temperature: 0.6,
      maxTokens: 8192,
    });

    console.log(`[Resolution] Final synthesis generated`);
    return synthesis;
  } catch (error) {
    console.error(`[Resolution] Error generating final synthesis:`, error);
    return 'خطأ في توليف النتيجة النهائية';
  }
}

/**
 * Build complete consensus result
 * بناء نتيجة التوافق الكاملة
 */
export async function buildConsensusResult(
  args: DebateArgument[],
  topic: string
): Promise<ConsensusResult> {
  console.log(`[Resolution] Building consensus result`);

  try {
    // 1. Calculate agreement score
    const agreementScore = await calculateAgreementScore(args);

    // 2. Identify consensus and disagreement points
    const [consensusPoints, disagreementPoints] = await Promise.all([
      identifyConsensusPoints(args, topic),
      identifyDisagreementPoints(args, topic),
    ]);

    // 3. Generate final synthesis
    const finalSynthesis = await generateFinalSynthesis(
      args,
      consensusPoints,
      disagreementPoints,
      topic
    );

    // 4. Determine if consensus is achieved (threshold: 0.75)
    const achieved = agreementScore >= 0.75;

    // 5. Get participating agents
    const participatingAgents = Array.from(
      new Set(args.map(arg => arg.agentName))
    );

    return {
      achieved,
      agreementScore,
      consensusPoints,
      disagreementPoints,
      finalSynthesis,
      participatingAgents,
      confidence: agreementScore,
    };
  } catch (error) {
    console.error(`[Resolution] Error building consensus result:`, error);

    return {
      achieved: false,
      agreementScore: 0,
      consensusPoints: [],
      disagreementPoints: ['خطأ في بناء نتيجة التوافق'],
      finalSynthesis: '',
      participatingAgents: [],
      confidence: 0,
    };
  }
}

/**
 * Calculate votes and determine winner
 * حساب الأصوات وتحديد الفائز
 */
export function calculateVoteResults(
  votes: Vote[]
): { argumentScores: Map<string, number>; winnerId: string | null } {
  console.log(`[Resolution] Calculating vote results from ${votes.length} votes`);

  const argumentScores = new Map<string, number>();

  // Aggregate votes
  votes.forEach(vote => {
    const currentScore = argumentScores.get(vote.argumentId) || 0;
    argumentScores.set(vote.argumentId, currentScore + vote.score);
  });

  // Find winner (highest score)
  let maxScore = 0;
  let winnerId: string | null = null;

  argumentScores.forEach((score, argId) => {
    if (score > maxScore) {
      maxScore = score;
      winnerId = argId;
    }
  });

  console.log(
    `[Resolution] Vote winner: ${winnerId} with score ${maxScore.toFixed(2)}`
  );

  return { argumentScores, winnerId };
}

// ===== Helper Functions =====

/**
 * Calculate agreement based on confidence variance
 */
function calculateConfidenceAgreement(args: DebateArgument[]): number {
  const confidences = args.map(arg => arg.confidence);
  const avgConfidence =
    confidences.reduce((a, b) => a + b, 0) / confidences.length;

  const variance =
    confidences.reduce((sum, c) => sum + Math.pow(c - avgConfidence, 2), 0) /
    confidences.length;

  // Lower variance = higher agreement
  const agreementScore = 1 - Math.min(1, variance * 2);

  return agreementScore;
}

/**
 * Calculate position similarity using AI
 */
async function calculatePositionSimilarity(
  args: DebateArgument[]
): Promise<number> {
  try {
    const prompt = `
على مقياس من 0 إلى 1، ما مدى تشابه المواقف التالية؟

${args
  .map(
    (arg, idx) => `
${idx + 1}. ${arg.agentName}:
${arg.position.substring(0, 300)}
`
  )
  .join('\n')}

أعطِ فقط رقماً واحداً بين 0 و 1:
- 1 = تطابق تام
- 0.75 = تشابه كبير
- 0.5 = تشابه معتدل
- 0.25 = اختلاف كبير
- 0 = تعارض تام

الرقم:
`;

    const response = await geminiService.generateContent(prompt, {
      temperature: 0.3,
      maxTokens: 50,
    });

    const match = response.match(/(\d+\.?\d*)/);
    if (match && match[1]) {
      return Math.min(1, Math.max(0, parseFloat(match[1])));
    }

    return 0.5; // Default
  } catch (error) {
    console.error(`[Resolution] Error calculating position similarity:`, error);
    return 0.5;
  }
}

/**
 * Calculate evidence overlap
 */
function calculateEvidenceOverlap(args: DebateArgument[]): number {
  if (args.length < 2) {
    return 1;
  }

  // Collect all evidence
  const allEvidence = args.flatMap(arg => arg.evidence);

  if (allEvidence.length === 0) {
    return 0.5; // No evidence, neutral score
  }

  // Count evidence overlaps
  let overlapCount = 0;
  let totalComparisons = 0;

  for (let i = 0; i < arguments.length; i++) {
    for (let j = i + 1; j < arguments.length; j++) {
      const evidence1 = arguments[i].evidence;
      const evidence2 = arguments[j].evidence;

      evidence1.forEach(e1 => {
        evidence2.forEach(e2 => {
          totalComparisons++;
          // Simple similarity check (can be improved with embeddings)
          if (areSimilar(e1, e2)) {
            overlapCount++;
          }
        });
      });
    }
  }

  if (totalComparisons === 0) {
    return 0.5;
  }

  return overlapCount / totalComparisons;
}

/**
 * Check if two strings are similar (simple version)
 */
function areSimilar(str1: string, str2: string): boolean {
  const normalized1 = str1.toLowerCase().trim();
  const normalized2 = str2.toLowerCase().trim();

  // Check if one contains the other
  if (
    normalized1.includes(normalized2) ||
    normalized2.includes(normalized1)
  ) {
    return true;
  }

  // Check word overlap
  const words1 = normalized1.split(/\s+/);
  const words2 = normalized2.split(/\s+/);

  const commonWords = words1.filter(w => words2.includes(w));

  // If 50%+ words overlap, consider similar
  return commonWords.length / Math.max(words1.length, words2.length) > 0.5;
}

/**
 * Extract bullet points from text
 */
function extractBulletPoints(text: string): string[] {
  const points: string[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Match bullet points (-, *, •) or numbered lists (1., 2.), etc)
    if (trimmed.match(/^[\-\*\•]\s/) || trimmed.match(/^\d+[\.\)]\s/)) {
      const point = trimmed
        .replace(/^[\-\*\•]\s/, '')
        .replace(/^\d+[\.\)]\s/, '')
        .trim();

      if (point.length > 0) {
        points.push(point);
      }
    }
  }

  return points;
}
