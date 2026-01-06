/**
 * Gemini AI service stub
 * TODO: Implement actual AI service integration
 */

export async function generateContent(prompt: string): Promise<string> {
  return `Generated response for: ${prompt}`
}

export const geminiService = {
  generateContent,
}

export default geminiService
