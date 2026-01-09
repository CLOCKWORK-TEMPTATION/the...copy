import { GoogleGenerativeAI } from "@google/generative-ai";

export class SmartImportSystem {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);

        // استخدام النموذج المحدد حسب طلبك
        this.model = this.genAI.getGenerativeModel({
            model: "models/gemini-3-flash-preview",
            generationConfig: {
                responseMimeType: "application/json"
            }
        });
    }

    async refineClassification(lines: string[]): Promise<any[]> {
        const prompt = `
      You are an expert Screenplay Formatter specialized in Arabic scripts.
      Analyze the following screenplay lines and correct their classification strictly.
      
      Rules:
      1. 'scene-header-3' MUST be a location name (e.g., "غرفة المكتب") appearing immediately after a master scene header.
      2. Differentiate carefully between 'action' description and 'character' names.
      3. Return ONLY a JSON array.

      Lines:
      ${JSON.stringify(lines)}

      Output format:
      [{"text": "...", "type": "scene-header-1" | "scene-header-3" | "action" | "character" | "dialogue"}]
    `;

        try {
            const result = await this.model.generateContent(prompt);
            const responseText = result.response.text();
            return JSON.parse(responseText);
        } catch (error) {
            console.error("AI Refinement failed:", error);
            return []; // فشل الـ AI لا يوقف التطبيق، نعتمد على الـ Regex
        }
    }
}
