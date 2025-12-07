import { describe, it, expect, beforeEach, vi } from "vitest";
import { ProducibilityAnalyzerAgent } from "./ProducibilityAnalyzerAgent";
import { StandardAgentInput } from "../shared/standardAgentPattern";
import { TaskType } from "@core/enums";

// Mock geminiService
vi.mock("../../services/geminiService", () => ({
  geminiService: {
    generateContent: vi
      .fn()
      .mockResolvedValue("Mock AI response for producibility analysis"),
  },
}));

describe("ProducibilityAnalyzerAgent", () => {
  let agent: ProducibilityAnalyzerAgent;

  beforeEach(() => {
    agent = new ProducibilityAnalyzerAgent();
    vi.clearAllMocks();
  });

  describe("Configuration", () => {
    it("should initialize with correct configuration", () => {
      const config = agent.getConfig();

      expect(config.name).toBe("ProductionOracle AI");
      expect(config.taskType).toBe(TaskType.PRODUCIBILITY_ANALYZER);
      expect(config.confidenceFloor).toBe(0.75);
      expect(config.supportsRAG).toBe(true);
      expect(config.supportsSelfCritique).toBe(true);
      expect(config.supportsConstitutional).toBe(true);
      expect(config.supportsUncertainty).toBe(true);
      expect(config.supportsHallucination).toBe(true);
      expect(config.supportsDebate).toBe(true);
    });

    it("should allow confidence floor to be updated", () => {
      agent.setConfidenceFloor(0.82);
      const config = agent.getConfig();
      expect(config.confidenceFloor).toBe(0.82);
    });
  });

  describe("Success Path", () => {
    it("should execute producibility analysis task successfully", async () => {
      const input: StandardAgentInput = {
        input:
          "حلل قابلية إنتاج هذا السيناريو: 50 مشهد، 20 موقع خارجي، مؤثرات بصرية كثيرة...",
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
            sceneBreakdown: "تفصيل المشاهد",
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
        input: "قيّم قابلية الإنتاج",
        options: {},
        context: {
          previousStations: {
            analysis: "النص يتطلب موارد كبيرة",
            sceneBreakdown: "تفصيل شامل للمشاهد",
            visualAnalysis: "تحليل المتطلبات البصرية",
          },
        },
      };

      const result = await agent.executeTask(input);

      expect(result).toBeDefined();
      expect(result.text).toBeTruthy();
    });

    it("should return text-only output without JSON blocks", async () => {
      const input: StandardAgentInput = {
        input: "حلل المتطلبات الإنتاجية",
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

  describe("Production Analysis Features", () => {
    it("should estimate budget range", async () => {
      const input: StandardAgentInput = {
        input: "قدّر نطاق الميزانية والعوامل المؤثرة في التكلفة",
        options: {
          enableRAG: true,
          confidenceThreshold: 0.75,
        },
        context: {
          previousStations: {
            sceneBreakdown: "مشاهد متنوعة ومعقدة",
          },
        },
      };

      const result = await agent.executeTask(input);

      expect(result).toBeDefined();
      expect(result.text).toBeTruthy();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
    });

    it("should analyze technical requirements", async () => {
      const input: StandardAgentInput = {
        input: "حدد المتطلبات التقنية والمعدات المطلوبة",
        options: {
          enableSelfCritique: true,
          confidenceThreshold: 0.75,
        },
        context: {
          previousStations: {
            visualAnalysis: "مشاهد تتطلب مؤثرات خاصة",
          },
        },
      };

      const result = await agent.executeTask(input);

      expect(result).toBeDefined();
      expect(result.text).toBeTruthy();
    });

    it("should assess shooting difficulty", async () => {
      const input: StandardAgentInput = {
        input: "قيّم صعوبة التصوير والتحديات المحتملة",
        options: {
          enableConstitutional: true,
          confidenceThreshold: 0.75,
        },
        context: {
          previousStations: {
            sceneBreakdown: "مشاهد في مواقع صعبة",
          },
        },
      };

      const result = await agent.executeTask(input);

      expect(result).toBeDefined();
      expect(result.confidence).toBeDefined();
    });

    it("should analyze location requirements", async () => {
      const input: StandardAgentInput = {
        input: "حلل متطلبات المواقع وعددها",
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

    it("should estimate production timeline", async () => {
      const input: StandardAgentInput = {
        input: "قدّر الجدول الزمني لمراحل الإنتاج المختلفة",
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

    it("should suggest cost optimization strategies", async () => {
      const input: StandardAgentInput = {
        input: "اقترح استراتيجيات لتحسين التكلفة",
        options: {
          enableDebate: true,
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
        input: "حلل الإنتاج",
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
        input: "قدم تحليلاً إنتاجياً",
        options: {
          confidenceThreshold: 0.75,
        },
        context: {},
      };

      const result = await agent.executeTask(input);

      expect(result.notes).toBeDefined();

      // Notes should reflect confidence level
      if (result.confidence >= 0.85) {
        expect(result.notes).toContain("شامل");
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
        input: "حلل الإنتاج",
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
        input: "قدم تحليلاً إنتاجياً شاملاً",
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
