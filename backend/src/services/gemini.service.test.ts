import { describe, it, expect } from 'vitest';
import { GeminiService } from './gemini.service';

describe('GeminiService', () => {
  let geminiService: GeminiService;

  it('should create GeminiService instance', () => {
    geminiService = new GeminiService();
    expect(geminiService).toBeDefined();
  });

  it('should have analyzeText method', () => {
    geminiService = new GeminiService();
    expect(typeof geminiService.analyzeText).toBe('function');
  });

  it('should have reviewScreenplay method', () => {
    geminiService = new GeminiService();
    expect(typeof geminiService.reviewScreenplay).toBe('function');
  });
});
