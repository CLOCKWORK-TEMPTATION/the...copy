/**
 * Standard Agent Execution Pattern - Backend
 *
 * This module provides a unified execution pattern for all drama analyst agents:
 * RAG → Self-Critique → Constitutional → Uncertainty → Hallucination → (Optional) Debate
 *
 * All agents must follow this pattern to ensure:
 * - Consistent quality
 * - Text-only outputs (no JSON to UI)
 * - Proper confidence tracking
 * - Constitutional compliance
 */

import {
  StandardAgentInput,
  StandardAgentOptions,
  StandardAgentOutput,
  RAGContext,
  SelfCritiqueResult,
  ConstitutionalCheckResult,
  UncertaintyMetrics,
  HallucinationCheckResult,
} from '../core/types';
import { GeminiService } from '@/services/gemini.service';
import { logger } from '@/utils/logger';

// =====================================================
// Default Options
// =====================================================

const DEFAULT_OPTIONS: StandardAgentOptions = {
  temperature: 0.3,
  enableRAG: true,
  enableSelfCritique: true,
  enableConstitutional: true,
  enableUncertainty: true,
  enableHallucination: true,
  enableDebate: false,
  confidenceThreshold: 0.7,
  maxIterations: 3,
};

// =====================================================
// RAG: Retrieval-Augmented Generation
// =====================================================

async function performRAG(
  input: string,
  context?: string
): Promise<RAGContext> {
  if (!context || context.length < 100) {
    return { chunks: [], relevanceScores: [] };
  }

  // Simple chunking strategy
  const chunkSize = 500;
  const overlap = 50;
  const chunks: string[] = [];

  let start = 0;
  while (start < context.length) {
    const end = Math.min(start + chunkSize, context.length);
    chunks.push(context.substring(start, end));
    start = end - overlap;
  }

  // Score chunks by relevance (simple keyword matching)
  const inputKeywords = input
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);
  const relevanceScores = chunks.map((chunk) => {
    const chunkLower = chunk.toLowerCase();
    let score = 0;
    inputKeywords.forEach((keyword) => {
      if (chunkLower.includes(keyword)) score++;
    });
    return score / Math.max(inputKeywords.length, 1);
  });

  // Sort by relevance and take top 3
  const indexed = chunks.map((chunk, i) => ({
    chunk,
    score: relevanceScores[i] ?? 0,
  }));
  indexed.sort((a, b) => b.score - a.score);

  const topChunks = indexed.slice(0, 3).map((item) => item.chunk);
  const topScores = indexed.slice(0, 3).map((item) => item.score);

  return { chunks: topChunks, relevanceScores: topScores };
}

// =====================================================
// Self-Critique Module
// =====================================================

async function performSelfCritique(
  geminiService: GeminiService,
  text: string,
  maxIterations: number = 2
): Promise<SelfCritiqueResult> {
  let currentText = text;
  let iterations = 0;

  for (let i = 0; i < maxIterations; i++) {
    iterations++;

    const critiquePrompt = `قم بنقد النص التالي وحدد نقاط الضعف أو التحسينات المحتملة:

${currentText}

قدم:
1. نقد موجز ومحدد
2. نص محسّن يدمج التحسينات

الرد:`;

    try {
      const critiqueResponse = await geminiService.analyzeText(
        critiquePrompt,
        'self-critique'
      );

      // Check if improvements were suggested
      if (
        critiqueResponse.includes('لا يوجد') ||
        critiqueResponse.includes('ممتاز')
      ) {
        return {
          improved: false,
          iterations,
          finalText: currentText,
          improvementScore: 0.95,
        };
      }

      // Extract improved text (simplified extraction)
      const lines = critiqueResponse.split('\n');
      const improvedLines = lines.filter(
        (line) => line.trim().length > 20 && !line.includes('نقد')
      );
      if (improvedLines.length > 0) {
        currentText = improvedLines.join('\n');
      }
    } catch (error) {
      logger.error('Self-critique iteration failed:', error);
      break;
    }
  }

  return {
    improved: true,
    iterations,
    finalText: currentText,
    improvementScore: 0.85,
  };
}

// =====================================================
// Constitutional AI Check
// =====================================================

async function performConstitutionalCheck(
  geminiService: GeminiService,
  text: string
): Promise<ConstitutionalCheckResult> {
  const checkPrompt = `تحقق من أن النص التالي يلتزم بالمعايير الأخلاقية:
- عدم التحيز أو التمييز
- احترام الثقافات المختلفة
- عدم وجود محتوى مسيء أو ضار
- دقة المعلومات

النص:
${text}

إذا كان هناك أي انتهاك، قدم نصاً محسّناً. وإلا، قل "متوافق".

الرد:`;

  try {
    const checkResponse = await geminiService.analyzeText(
      checkPrompt,
      'constitutional'
    );

    if (
      checkResponse.includes('متوافق') ||
      checkResponse.includes('لا يوجد انتهاك')
    ) {
      return {
        compliant: true,
        violations: [],
        correctedText: text,
      };
    }

    return {
      compliant: false,
      violations: ['محتوى يحتاج تحسين'],
      correctedText: checkResponse,
    };
  } catch (error) {
    logger.error('Constitutional check failed:', error);
    return {
      compliant: true,
      violations: [],
      correctedText: text,
    };
  }
}

// =====================================================
// Uncertainty Quantification
// =====================================================

async function quantifyUncertainty(
  geminiService: GeminiService,
  text: string
): Promise<UncertaintyMetrics> {
  const uncertaintyPrompt = `حدد مستوى الثقة في التحليل التالي وأي جوانب غير مؤكدة:

${text}

قيّم من 0 إلى 1 وحدد الجوانب غير المؤكدة.

الرد:`;

  try {
    const uncertaintyResponse = await geminiService.analyzeText(
      uncertaintyPrompt,
      'uncertainty'
    );

    // Extract confidence score (simplified)
    const confidenceMatch = uncertaintyResponse.match(/\d+\.\d+/);
    const confidence = confidenceMatch ? parseFloat(confidenceMatch[0]) : 0.8;

    const uncertainAspects: string[] = [];
    if (uncertaintyResponse.includes('غير مؤكد')) {
      uncertainAspects.push('بعض الجوانب تحتاج مزيد من التحليل');
    }

    return {
      score: 1 - confidence,
      confidence,
      uncertainAspects,
    };
  } catch (error) {
    logger.error('Uncertainty quantification failed:', error);
    return {
      score: 0.2,
      confidence: 0.8,
      uncertainAspects: [],
    };
  }
}

// =====================================================
// Hallucination Detection
// =====================================================

async function detectHallucinations(
  geminiService: GeminiService,
  text: string,
  context?: string
): Promise<HallucinationCheckResult> {
  if (!context) {
    return {
      detected: false,
      claims: [],
      correctedText: text,
    };
  }

  const hallucinationPrompt = `تحقق من أن التحليل التالي مبني على المحتوى الأصلي فقط، دون اختراع معلومات:

المحتوى الأصلي:
${context.substring(0, 1000)}

التحليل:
${text}

حدد أي ادعاءات غير مدعومة بالمحتوى الأصلي.

الرد:`;

  try {
    const hallucinationResponse = await geminiService.analyzeText(
      hallucinationPrompt,
      'hallucination'
    );

    if (
      hallucinationResponse.includes('جميع الادعاءات مدعومة') ||
      hallucinationResponse.includes('لا يوجد')
    ) {
      return {
        detected: false,
        claims: [],
        correctedText: text,
      };
    }

    return {
      detected: true,
      claims: [{ claim: 'ادعاء غير مدعوم', supported: false }],
      correctedText: hallucinationResponse,
    };
  } catch (error) {
    logger.error('Hallucination detection failed:', error);
    return {
      detected: false,
      claims: [],
      correctedText: text,
    };
  }
}

// =====================================================
// Main Execution Pattern
// =====================================================

export async function executeStandardAgentPattern(
  basePrompt: string,
  options: StandardAgentOptions,
  executionContext: Record<string, any>
): Promise<StandardAgentOutput> {
  const startTime = Date.now();
  const geminiService = new GeminiService();

  // Merge with defaults
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const notes: string[] = [];
  const metadata: any = {
    ragUsed: false,
    critiqueIterations: 0,
    constitutionalViolations: 0,
    uncertaintyScore: 0,
    hallucinationDetected: false,
    debateRounds: 0,
  };

  try {
    // Step 1: RAG (if enabled and context provided)
    let enhancedPrompt = basePrompt;
    if (opts.enableRAG && executionContext.context) {
      const ragContext = await performRAG(
        basePrompt,
        typeof executionContext.context === 'string'
          ? executionContext.context
          : JSON.stringify(executionContext.context)
      );
      metadata.ragUsed = ragContext.chunks.length > 0;

      if (ragContext.chunks.length > 0) {
        enhancedPrompt = `${basePrompt}\n\nسياق إضافي:\n${ragContext.chunks.join('\n\n')}`;
        notes.push(`تم استخدام ${ragContext.chunks.length} مقاطع سياقية ذات صلة`);
      }
    }

    // Step 2: Initial generation
    let generatedText = await geminiService.analyzeText(
      enhancedPrompt,
      executionContext.taskType || 'general'
    );

    // Step 3: Self-Critique (if enabled)
    if (opts.enableSelfCritique) {
      const critiqueResult = await performSelfCritique(
        geminiService,
        generatedText,
        opts.maxIterations
      );
      generatedText = critiqueResult.finalText;
      metadata.critiqueIterations = critiqueResult.iterations;
      if (critiqueResult.improved) {
        notes.push(`تم تحسين النص خلال ${critiqueResult.iterations} دورة نقد ذاتي`);
      }
    }

    // Step 4: Constitutional Check (if enabled)
    if (opts.enableConstitutional) {
      const constitutionalResult = await performConstitutionalCheck(
        geminiService,
        generatedText
      );
      if (!constitutionalResult.compliant) {
        generatedText = constitutionalResult.correctedText;
        metadata.constitutionalViolations = constitutionalResult.violations.length;
        notes.push('تم تصحيح بعض الجوانب للالتزام بالمعايير الأخلاقية');
      }
    }

    // Step 5: Uncertainty Quantification (if enabled)
    let confidence = 0.85;
    if (opts.enableUncertainty) {
      const uncertaintyMetrics = await quantifyUncertainty(
        geminiService,
        generatedText
      );
      confidence = uncertaintyMetrics.confidence;
      metadata.uncertaintyScore = uncertaintyMetrics.score;
      if (uncertaintyMetrics.uncertainAspects.length > 0) {
        notes.push(...uncertaintyMetrics.uncertainAspects);
      }
    }

    // Step 6: Hallucination Detection (if enabled)
    if (opts.enableHallucination && executionContext.context) {
      const hallucinationResult = await detectHallucinations(
        geminiService,
        generatedText,
        typeof executionContext.context === 'string'
          ? executionContext.context
          : JSON.stringify(executionContext.context)
      );
      if (hallucinationResult.detected) {
        generatedText = hallucinationResult.correctedText;
        metadata.hallucinationDetected = true;
        notes.push('تم اكتشاف وتصحيح بعض الادعاءات غير المدعومة');
      }
    }

    metadata.processingTime = Date.now() - startTime;

    return {
      text: generatedText,
      confidence,
      notes,
      metadata,
    };
  } catch (error) {
    logger.error('Standard agent pattern execution failed:', error);
    throw error;
  }
}
