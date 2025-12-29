/**
 * Unit Tests for ProductionReadinessAnalyzerAgent
 *
 * Tests basic functionality including:
 * - Agent initialization
 * - Prompt building with context
 * - Fallback response generation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { productionReadinessAnalyzerAgent } from '@/services/agents/productionReadinessAnalyzer/ProductionReadinessAnalyzerAgent';
import { TaskType } from '@/services/agents/core/enums';

// Mock logger to avoid console output during tests
vi.mock('@/utils/logger', () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock Sentry to avoid actual error reporting during tests
vi.mock('@sentry/node', () => ({
  default: {
    captureException: vi.fn(),
  },
  captureException: vi.fn(),
}));

// Mock GeminiService to avoid actual API calls
vi.mock('@/services/gemini.service', () => {
  const mockAnalyzeText = vi.fn().mockResolvedValue('تقرير جاهزية الإنتاج\n\nالتقييم العام: جاهز مع ملاحظات');
  return {
    GeminiService: class {
      analyzeText = mockAnalyzeText;
    },
  };
});

describe('ProductionReadinessAnalyzerAgent', () => {
  describe('Agent Configuration', () => {
    it('should be initialized with correct configuration', () => {
      const config = productionReadinessAnalyzerAgent.getConfig();

      expect(config.name).toBe('ProductionReadiness AI');
      expect(config.taskType).toBe(TaskType.PRODUCTION_READINESS_ANALYZER);
      expect(config.confidenceFloor).toBe(0.85);
    });

    it('should support all standard agent patterns', () => {
      const config = productionReadinessAnalyzerAgent.getConfig();

      expect(config.supportsRAG).toBe(true);
      expect(config.supportsSelfCritique).toBe(true);
      expect(config.supportsConstitutional).toBe(true);
      expect(config.supportsUncertainty).toBe(true);
      expect(config.supportsHallucination).toBe(true);
      expect(config.supportsDebate).toBe(true);
    });
  });

  describe('Prompt Building', () => {
    it('should build prompt with production data', () => {
      const testInput = {
        input: 'معدات التصنيع جاهزة، الموظفون مدربون، المواد الخام متوفرة.',
        context: {
          reportDate: '2025-12-29',
          facilityName: 'مصنع النور',
          reportingPeriod: 'الربع الرابع 2025',
        },
      };

      // Access protected method via reflection for testing
      const prompt = (productionReadinessAnalyzerAgent as any).buildPrompt(testInput);

      expect(prompt).toContain('تقرير جاهزية الإنتاج');
      expect(prompt).toContain('2025-12-29');
      expect(prompt).toContain('مصنع النور');
      expect(prompt).toContain('الربع الرابع 2025');
      expect(prompt).toContain('معدات التصنيع جاهزة');
      expect(prompt).toContain('معلومات عامة');
      expect(prompt).toContain('حالة المعدات والآلات');
      expect(prompt).toContain('الموارد البشرية');
      expect(prompt).toContain('المواد الخام والمخزون');
      expect(prompt).toContain('الجودة والسلامة');
      expect(prompt).toContain('البنية التحتية');
      expect(prompt).toContain('التحديات والمخاطر');
      expect(prompt).toContain('التوصيات');
      expect(prompt).toContain('التقييم العام');
    });

    it('should use default values when context is not provided', () => {
      const testInput = {
        input: 'بيانات الإنتاج',
        context: {},
      };

      const prompt = (productionReadinessAnalyzerAgent as any).buildPrompt(testInput);

      expect(prompt).toContain('تقرير جاهزية الإنتاج');
      expect(prompt).toContain('غير محدد');
    });

    it('should handle string context gracefully', () => {
      const testInput = {
        input: 'بيانات الإنتاج',
        context: 'some string context',
      };

      const prompt = (productionReadinessAnalyzerAgent as any).buildPrompt(testInput);

      expect(prompt).toContain('تقرير جاهزية الإنتاج');
    });
  });

  describe('Report Structure', () => {
    it('should include all required sections in the prompt', () => {
      const testInput = {
        input: 'test data',
        context: {},
      };

      const prompt = (productionReadinessAnalyzerAgent as any).buildPrompt(testInput);

      // All 9 required sections
      expect(prompt).toContain('1. معلومات عامة');
      expect(prompt).toContain('2. حالة المعدات والآلات');
      expect(prompt).toContain('3. الموارد البشرية');
      expect(prompt).toContain('4. المواد الخام والمخزون');
      expect(prompt).toContain('5. الجودة والسلامة');
      expect(prompt).toContain('6. البنية التحتية');
      expect(prompt).toContain('7. التحديات والمخاطر');
      expect(prompt).toContain('8. التوصيات');
      expect(prompt).toContain('9. التقييم العام');

      // Readiness ratings
      expect(prompt).toContain('جاهز تماماً');
      expect(prompt).toContain('جاهز مع ملاحظات');
      expect(prompt).toContain('غير جاهز');
    });
  });

  describe('Fallback Response', () => {
    it('should provide meaningful fallback response', async () => {
      const testInput = {
        input: 'test data',
        context: {
          reportDate: '2025-12-29',
        },
      };

      const fallback = await (productionReadinessAnalyzerAgent as any).getFallbackResponse(testInput);

      expect(fallback).toContain('تقرير جاهزية الإنتاج');
      expect(fallback).toContain('2025-12-29');
      expect(fallback).toContain('المعدات');
      expect(fallback).toContain('الموارد البشرية');
      expect(fallback).toContain('المواد الخام');
    });

    it('should use current date when not provided in context', async () => {
      const testInput = {
        input: 'test data',
        context: {},
      };

      const fallback = await (productionReadinessAnalyzerAgent as any).getFallbackResponse(testInput);

      expect(fallback).toContain('تقرير جاهزية الإنتاج');
      // Should contain a date in ISO format
      expect(fallback).toMatch(/\d{4}-\d{2}-\d{2}/);
    });
  });
});
