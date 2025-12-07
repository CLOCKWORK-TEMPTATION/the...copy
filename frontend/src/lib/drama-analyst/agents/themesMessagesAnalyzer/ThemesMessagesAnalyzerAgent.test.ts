import { describe, it, expect, beforeEach, vi } from "vitest";
import { ThemesMessagesAnalyzerAgent } from "./ThemesMessagesAnalyzerAgent";
import { StandardAgentInput } from "../shared/standardAgentPattern";
import { TaskType } from "@core/enums";

// Mock geminiService
vi.mock("../../services/geminiService", () => ({
  geminiService: {
    generateContent: vi
      .fn()
      .mockResolvedValue("Mock AI response for themes and messages analysis"),
  },
}));

describe("ThemesMessagesAnalyzerAgent", () => {
  let agent: ThemesMessagesAnalyzerAgent;

  beforeEach(() => {
    agent = new ThemesMessagesAnalyzerAgent();
    vi.clearAllMocks();
  });

  describe("Configuration", () => {
    it("should initialize with correct configuration", () => {
      const config = agent.getConfig();

      expect(config.name).toBe("PhilosophyMiner AI");
      expect(config.taskType).toBe(TaskType.THEMES_MESSAGES_ANALYZER);
      expect(config.confidenceFloor).toBe(0.75);
      expect(config.supportsRAG).toBe(true);
      expect(config.supportsSelfCritique).toBe(true);
      expect(config.supportsConstitutional).toBe(true);
      expect(config.supportsUncertainty).toBe(true);
      expect(config.supportsHallucination).toBe(true);
      expect(config.supportsDebate).toBe(true);
    });

    it("should allow confidence floor to be updated", () => {
      agent.setConfidenceFloor(0.85);
      const config = agent.getConfig();
      expect(config.confidenceFloor).toBe(0.85);
    });
  });

  describe("Success Path", () => {
    it("should execute themes and messages analysis task successfully", async () => {
      const input: StandardAgentInput = {
        input:
          "حلل الموضوعات والرسائل الفلسفية في هذا النص: قصة عن صراع الإنسان مع مصيره وبحثه عن المعنى...",
        options: {
          enableRAG: true,
          enableSelfCritique: true,
          enableConstitutional: true,
          enableUncertainty: true,
          enableHallucination: true,
          enableDebate: false,
          confidenceThreshold: 0.75,
        },
        context: {
          previousStations: {
            analysis: "تحليل أولي للنص",
            plotSummary: "ملخص الحبكة",
          },
        },
      };

      const result = await agent.executeTask(input);

      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
      expect(typeof result.text).toBe("string");
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.metadata).toBeDefined();

      // Verify no JSON in output
      expect(result.text).not.toMatch(/\{[\s\S]*?"[^"]*"\s*:[\s\S]*?\}/);
      expect(result.text).not.toMatch(/```json/);
    });

    it("should include context from previous stations in prompt", async () => {
      const input: StandardAgentInput = {
        input: "استخرج الموضوعات والرسائل الفلسفية",
        options: {},
        context: {
          previousStations: {
            analysis: "النص يحتوي على أفكار عميقة",
            plotSummary: "ملخص شامل للأحداث",
            characterThemes: "موضوعات شخصية",
          },
        },
      };

      const result = await agent.executeTask(input);

      expect(result).toBeDefined();
      expect(result.text).toBeTruthy();
    });

    it("should return text-only output without JSON blocks", async () => {
      const input: StandardAgentInput = {
        input: "حلل الموضوعات الفلسفية",
        options: {
          enableRAG: true,
        },
        context: {},
      };

      const result = await agent.executeTask(input);

      // Ensure output is clean text
      expect(result.text).not.toContain("```json");
      expect(result.text).not.toContain("```");
      expect(result.text).not.toMatch(/\{[^}]*"[^"]*":[^}]*\}/);
    });
  });

  describe("Philosophical Analysis Features", () => {
    it("should extract main and sub-themes", async () => {
      const input: StandardAgentInput = {
        input: "استخرج الموضوعات الرئيسية والفرعية",
        options: {
          enableRAG: true,
          confidenceThreshold: 0.75,
        },
        context: {
          previousStations: {
            plotSummary: "قصة معقدة متعددة الطبقات",
          },
        },
      };

      const result = await agent.executeTask(input);

      expect(result).toBeDefined();
      expect(result.text).toBeTruthy();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
    });

    it("should uncover implicit philosophical messages", async () => {
      const input: StandardAgentInput = {
        input: "اكشف الرسائل الفلسفية الضمنية",
        options: {
          enableSelfCritique: true,
          confidenceThreshold: 0.75,
        },
        context: {
          previousStations: {
            analysis: "نص يحمل رسائل عميقة",
          },
        },
      };

      const result = await agent.executeTask(input);

      expect(result).toBeDefined();
      expect(result.text).toBeTruthy();
    });

    it("should analyze philosophical coherence", async () => {
      const input: StandardAgentInput = {
        input: "قيّم التماسك الفلسفي للنص",
        options: {
          enableConstitutional: true,
          confidenceThreshold: 0.75,
        },
        context: {
          previousStations: {
            analysis: "نص يطرح أفكار متنوعة",
          },
        },
      };

      const result = await agent.executeTask(input);

      expect(result).toBeDefined();
      expect(result.confidence).toBeDefined();
    });

    it("should identify thematic contradictions", async () => {
      const input: StandardAgentInput = {
        input: "حدد التناقضات الموضوعاتية",
        options: {
          enableHallucination: true,
          confidenceThreshold: 0.75,
        },
        context: {},
      };

      const result = await agent.executeTask(input);

      expect(result).toBeDefined();
      expect(result.text).toBeTruthy();
    });

    it("should evaluate intellectual originality", async () => {
      const input: StandardAgentInput = {
        input: "قيّم الأصالة الفكرية والعمق المفاهيمي",
        options: {
          enableUncertainty: true,
          confidenceThreshold: 0.75,
        },
        context: {},
      };

      const result = await agent.executeTask(input);

      expect(result).toBeDefined();
      expect(result.text).toBeTruthy();
    });
  });

  describe("Post-Processing", () => {
    it("should clean JSON blocks from output", async () => {
      const input: StandardAgentInput = {
        input: "حلل الموضوعات",
        options: {},
        context: {},
      };

      const result = await agent.executeTask(input);

      // Verify all JSON is removed
      expect(result.text).not.toMatch(/```json[\s\S]*?```/);
      expect(result.text).not.toMatch(/```[\s\S]*?```/);
      expect(result.text).not.toMatch(/\{[\s\S]*?"[^"]*"\s*:[\s\S]*?\}/);
    });

    it("should add appropriate notes based on confidence level", async () => {
      const input: StandardAgentInput = {
        input: "قدم تحليلاً فلسفياً",
        options: {
          confidenceThreshold: 0.75,
        },
        context: {},
      };

      const result = await agent.executeTask(input);

      expect(result.notes).toBeDefined();

      // Notes should reflect confidence level
      if (result.confidence >= 0.85) {
        expect(result.notes).toContain("عميق");
      } else if (result.confidence >= 0.7) {
        expect(result.notes).toContain("جيد");
      } else {
        expect(result.notes).toContain("أولي");
      }
    });
  });

  describe("Error Handling", () => {
    it("should return fallback response on error", async () => {
      const input: StandardAgentInput = {
        input: "",
        options: {},
        context: {},
      };

      const result = await agent.executeTask(input);

      expect(result).toBeDefined();
      expect(result.text).toBeTruthy();
      expect(result.confidence).toBeLessThanOrEqual(0.5);
      expect(result.metadata?.error).toBeDefined();
    });

    it("should handle missing context gracefully", async () => {
      const input: StandardAgentInput = {
        input: "حلل الموضوعات",
        options: {},
        context: undefined as any,
      };

      const result = await agent.executeTask(input);

      expect(result).toBeDefined();
      expect(result.text).toBeTruthy();
    });
  });

  describe("Advanced Options", () => {
    it("should respect all advanced options", async () => {
      const input: StandardAgentInput = {
        input: "قدم تحليلاً فلسفياً شاملاً",
        options: {
          enableRAG: true,
          enableSelfCritique: true,
          enableConstitutional: true,
          enableUncertainty: true,
          enableHallucination: true,
          enableDebate: true,
          maxDebateRounds: 3,
          confidenceThreshold: 0.8,
          temperature: 0.7,
          maxTokens: 8192,
        },
        context: {},
      };

      const result = await agent.executeTask(input);

      expect(result).toBeDefined();
      expect(result.text).toBeTruthy();
      expect(result.confidence).toBeDefined();
      expect(result.metadata).toBeDefined();
    });
  });
});
