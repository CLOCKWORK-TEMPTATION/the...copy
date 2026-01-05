/**
 * Gemini AI Client - عميل الذكاء الاصطناعي لتحليل السيناريو العربي
 *
 * هذا الملف يحتوي على client للتكامل مع Google Generative AI (Gemini)
 * لتحليل السيناريوهات العربية وتقديم ملاحظات ذكية.
 *
 * @module lib/ai/gemini-client
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

/**
 * أنواع التحليل الممكنة
 */
export type AnalysisType =
  | 'contextual'        // تحليل سياقي شامل
  | 'dialogue'          // تحليل الحوار
  | 'characters'        // تحليل الشخصيات
  | 'plot'             // تحليل الحبكة
  | 'consistency'      // تحليل الاستمرارية
  | 'suggestions';      // اقتراحات تحسين

/**
 * نتيجة التحليل
 */
export interface AnalysisResult {
  type: AnalysisType;
  summary: string;
  details: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  confidence: number;
}

/**
 * إعدادات التحليل
 */
export interface AnalysisOptions {
  language?: 'ar' | 'en';
  detailLevel?: 'brief' | 'standard' | 'detailed';
  includeSuggestions?: boolean;
}

/**
 * GeminiClient - عميل Google Generative AI
 *
 * يوفر methods لتحليل السيناريوهات العربية باستخدام Gemini AI
 */
export class GeminiClient {
  private static genAI: GoogleGenerativeAI | null = null;
  private static model: GenerativeModel | null = null;

  /**
   * تهيئة الـ client
   * @param apiKey - مفتاح API الخاص بـ Gemini
   */
  static initialize(apiKey?: string): void {
    const key = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!key) {
      console.warn('Gemini API key not found. AI features will be disabled.');
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(key);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      console.log('Gemini AI Client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Gemini AI Client:', error);
    }
  }

  /**
   * التحقق من أن الـ client مهيأ
   * @returns true إذا كان الـ client مهيأ
   */
  static isReady(): boolean {
    return this.model !== null;
  }

  /**
   * تحليل سيناريو شامل
   * @param content - محتوى السيناريو
   * @param options - خيارات التحليل
   * @returns نتيجة التحليل
   */
  static async analyzeScreenplay(
    content: string,
    options: AnalysisOptions = {}
  ): Promise<AnalysisResult> {
    if (!this.isReady()) {
      throw new Error('Gemini AI Client not initialized. Call initialize() first.');
    }

    const {
      language = 'ar',
      detailLevel = 'standard',
      includeSuggestions = true
    } = options;

    const detailInstructions = {
      brief: 'قدم ملخصاً موجزاً في 3-5 جمل.',
      standard: 'قدم تحليلاً متوسطاً في فقرة واحدة.',
      detailed: 'قدم تحليلاً مفصلاً في عدة فقرات مع نقاط محددة.'
    };

    const prompt = `
      أنت خبير في تحليل السيناريوهات العربية. قم بتحليل السيناريو التالي:

      === السيناريو ===
      ${content}
      === نهاية السيناريو ===

      قدم تحليلاً يشمل:
      1. **استمرارية الحبكة**: هل الحبكة متماسكة ومنطقية؟
      2. **تطور الشخصيات**: هل الشخصيات متسقة ومتطورة؟
      3. **قوة الحوار**: هل الحوار واقعي ومقنع؟
      4. **التناقضات**: هل هناك تناقضات أو مشاكل؟
      ${includeSuggestions ? '5. **اقتراحات التحسين**: ما هي التحسينات الممكنة؟' : ''}

      ${detailInstructions[detailLevel]}

      استخدم اللغة ${language === 'ar' ? 'العربية' : 'English'}.
    `;

    try {
      const result = await this.model!.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        type: 'contextual',
        summary: this.extractSummary(text),
        details: {
          strengths: this.extractStrengths(text),
          weaknesses: this.extractWeaknesses(text),
          suggestions: includeSuggestions ? this.extractSuggestions(text) : []
        },
        confidence: 0.85
      };
    } catch (error) {
      console.error('Failed to analyze screenplay:', error);
      throw new Error(`AI analysis failed: ${error}`);
    }
  }

  /**
   * تحليل الحوار فقط
   * @param content - محتوى السيناريو
   * @returns نتيجة تحليل الحوار
   */
  static async analyzeDialogue(content: string): Promise<AnalysisResult> {
    if (!this.isReady()) {
      throw new Error('Gemini AI Client not initialized.');
    }

    const prompt = `
      قم بتحليل الحوار في السيناريو العربي التالي:

      === السيناريو ===
      ${content}
      === نهاية السيناريو ===

      ركز على:
      1. هل الحوار واقعي وطبيعي؟
      2. هل كل شخصية لها صوت مميز؟
      3. هل الحوار يدفع الحبكة للأمام؟
      4. هل هناك حوار مفرط أو غير ضروري؟
    `;

    try {
      const result = await this.model!.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        type: 'dialogue',
        summary: this.extractSummary(text),
        details: {
          strengths: this.extractStrengths(text),
          weaknesses: this.extractWeaknesses(text),
          suggestions: this.extractSuggestions(text)
        },
        confidence: 0.88
      };
    } catch (error) {
      console.error('Failed to analyze dialogue:', error);
      throw new Error(`Dialogue analysis failed: ${error}`);
    }
  }

  /**
   * تحليل الشخصيات
   * @param content - محتوى السيناريو
   * @returns نتيجة تحليل الشخصيات
   */
  static async analyzeCharacters(content: string): Promise<AnalysisResult> {
    if (!this.isReady()) {
      throw new Error('Gemini AI Client not initialized.');
    }

    const prompt = `
      قم بتحليل الشخصيات في السيناريو العربي التالي:

      === السيناريو ===
      ${content}
      === نهاية السيناريو ===

      ركز على:
      1. هل الشخصيات متميزة وواضحة؟
      2. هل تطور الشخصيات منطقي؟
      3. هل دوافع الشخصيات واضحة؟
      4. هل التفاعلات بين الشخصيات واقعية؟
    `;

    try {
      const result = await this.model!.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        type: 'characters',
        summary: this.extractSummary(text),
        details: {
          strengths: this.extractStrengths(text),
          weaknesses: this.extractWeaknesses(text),
          suggestions: this.extractSuggestions(text)
        },
        confidence: 0.86
      };
    } catch (error) {
      console.error('Failed to analyze characters:', error);
      throw new Error(`Character analysis failed: ${error}`);
    }
  }

  /**
   * اقتراح تحسينات للسيناريو
   * @param content - محتوى السيناريو
   * @param focusArea - منطقة التركيز (اختياري)
   * @returns اقتراحات التحسين
   */
  static async suggestImprovements(
    content: string,
    focusArea?: string
  ): Promise<string[]> {
    if (!this.isReady()) {
      throw new Error('Gemini AI Client not initialized.');
    }

    const focusInstruction = focusArea
      ? ` ركز بشكل خاص على: ${focusArea}.`
      : '';

    const prompt = `
      قم بمراجعة السيناريو العربي التالي واقترح تحسينات محددة:

      === السيناريو ===
      ${content}
      === نهاية السيناريو ===

      قدم 5-10 اقتراحات تحسين محددة وقابلة للتنفيذ.${focusInstruction}

      لكل اقتراح، وضح:
      - المشكلة الحالية
      - التحسين المقترح
      - كيفية التنفيذ
    `;

    try {
      const result = await this.model!.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.extractSuggestions(text);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      throw new Error(`Suggestion generation failed: ${error}`);
    }
  }

  /**
   * اكتشاف التناقضات في السيناريو
   * @param content - محتوى السيناريو
   * @returns قائمة بالتناقضات المكتشفة
   */
  static async detectInconsistencies(content: string): Promise<string[]> {
    if (!this.isReady()) {
      throw new Error('Gemini AI Client not initialized.');
    }

    const prompt = `
      قم بمراجعة السيناريو العربي التالي واكتشف أي تناقضات:

      === السيناريو ===
      ${content}
      === نهاية السيناريو ===

      ابحث عن:
      1. تناقضات في الشخصيات (تصرفات غير متسقة)
      2. تناقضات في الزمان والمكان
      3. تناقضات في الحبكة
      4. أخطاء منطقية
      5. تناقضات في الحوار

      ل每个 تناقض، وضح:
      - المشكلة
      - الموقع في السيناريو
      - كيفية الإصلاح
    `;

    try {
      const result = await this.model!.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // استخراج التناقضات من النص
      const inconsistencies: string[] = [];
      const lines = text.split('\n');

      let currentInconsistency = '';
      for (const line of lines) {
        if (line.match(/^\d+\.|-/)) {
          if (currentInconsistency) {
            inconsistencies.push(currentInconsistency.trim());
          }
          currentInconsistency = line;
        } else if (line.trim()) {
          currentInconsistency += '\n' + line;
        }
      }

      if (currentInconsistency) {
        inconsistencies.push(currentInconsistency.trim());
      }

      return inconsistencies;
    } catch (error) {
      console.error('Failed to detect inconsistencies:', error);
      throw new Error(`Inconsistency detection failed: ${error}`);
    }
  }

  // === Helper Methods ===

  /**
   * استخراج الملخص من نص التحليل
   * @param text - نص التحليل
   * @returns الملخص المستخرج
   */
  private static extractSummary(text: string): string {
    // استخراج أول فقرة أو جملة
    const firstParagraph = text.split('\n\n')[0];
    return firstParagraph || text.substring(0, 200) + '...';
  }

  /**
   * استخراج نقاط القوة من نص التحليل
   * @param text - نص التحليل
   * @returns قائمة نقاط القوة
   */
  private static extractStrengths(text: string): string[] {
    const strengths: string[] = [];
    const patterns = [
      /(?:نقاط القوة|الإيجابيات|المزايا|Strengths)[:：]\s*\n([^\n]+)/gi,
      /(?:•|\-|\*)\s*([^\n]+(?:قوة|ميزة|جيد|ممتاز|قوي))/gi
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          strengths.push(match[1].trim());
        }
      }
    }

    return strengths;
  }

  /**
   * استخراج نقاط الضعف من نص التحليل
   * @param text - نص التحليل
   * @returns قائمة نقاط الضعف
   */
  private static extractWeaknesses(text: string): string[] {
    const weaknesses: string[] = [];
    const patterns = [
      /(?:نقاط الضعف|السلبيات|العيوب|Weaknesses)[:：]\s*\n([^\n]+)/gi,
      /(?:•|\-|\*)\s*([^\n]+(?:ضعف|مشكلة|عيوب|تحسين|بحاجة))/gi
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          weaknesses.push(match[1].trim());
        }
      }
    }

    return weaknesses;
  }

  /**
   * استخراج الاقتراحات من نص التحليل
   * @param text - نص التحليل
   * @returns قائمة الاقتراحات
   */
  private static extractSuggestions(text: string): string[] {
    const suggestions: string[] = [];
    const patterns = [
      /(?:الاقتراحات|التوصيات|المقترحات|Suggestions)[:：]\s*\n([^\n]+)/gi,
      /(?:•|\-|\*)\s*([^\n]+(?:اقترح|أنصح|يفضل|يجب))/gi,
      /(\d+\.\s+[^\n]+(?:اقترح|تحسين|تطوير))/gi
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          suggestions.push(match[1].trim());
        }
      }
    }

    return suggestions;
  }
}

/**
 * التصدير الافتراضي
 */
export default GeminiClient;

/**
 * تهيئة تلقائية عند الاستيراد
 */
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  GeminiClient.initialize();
}
