/**
 * Gemini AI service stub for client-side usage.
 * Provides the same surface API used across the app without bundling server logic.
 */

export enum GeminiModel {
  FLASH = "gemini-1.5-flash",
  PRO = "gemini-1.5-pro",
  FLASH_LITE = "gemini-flash",
}

export class GeminiService {
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  async generateContent(prompt: string): Promise<string> {
    return `Generated response for: ${prompt}`;
  }

  getModel(_modelName: string = GeminiModel.FLASH) {
    return {
      generateContent: async (prompt: string) => ({
        response: {
          text: async () => this.generateContent(prompt),
        },
      }),
    };
  }
}

export const geminiService = new GeminiService();

export default geminiService;
