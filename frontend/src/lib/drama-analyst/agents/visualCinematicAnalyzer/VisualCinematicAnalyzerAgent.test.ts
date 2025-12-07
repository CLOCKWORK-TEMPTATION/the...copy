import { describe, it, expect, beforeEach, vi } from "vitest";
import { VisualCinematicAnalyzerAgent } from "./VisualCinematicAnalyzerAgent";
import { StandardAgentInput } from "../shared/standardAgentPattern";
import { TaskType } from "@core/enums";

// Mock geminiService
vi.mock("../../services/geminiService", () => ({
  geminiService: {
    generateContent: vi
      .fn()
      .mockResolvedValue("Mock AI response for visual cinematic analysis"),
  },
}));

describe("VisualCinematicAnalyzerAgent", () => {
  let agent: VisualCinematicAnalyzerAgent;

  beforeEach(() => {
    agent = new VisualCinematicAnalyzerAgent();
    vi.clearAllMocks();
  });

  describe("Configuration", () => {
    it("should initialize with correct configuration", () => {
      const config = agent.getConfig();

      expect(config.name).toBe("CinemaVision AI");
      expect(config.taskType).toBe(TaskType.VISUAL_CINEMATIC_ANALYZER);
      expect(config.confidenceFloor).toBe(0.75);
      expect(config.supportsRAG).toBe(true);
      expect(config.supportsSelfCritique).toBe(true);
      expect(config.supportsConstitutional).toBe(true);
      expect(config.supportsUncertainty).toBe(true);
      expect(config.supportsHallucination).toBe(true);
      expect(config.supportsDebate).toBe(true);
    });

    it("should allow confidence floor to be updated", () => {
      agent.setConfidenceFloor(0.8);
      const config = agent.getConfig();
      expect(config.confidenceFloor).toBe(0.8);
    });
  });

  describe("Success Path", () => {
    it("should execute visual cinematic analysis task successfully", async () => {
      const input: StandardAgentInput = {
        input:
          "حلل الجوانب البصرية والسينمائية: مشهد ليلي في غابة مظلمة، شخص يجري هارباً من خطر غير مرئي...",
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
            sceneDescriptions: "وصف المشاهد الرئيسية",
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
        input: "قدم تحليلاً سينمائياً للمشهد",
        options: {},
        context: {
          previousStations: {
            analysis: "النص يحتوي على مشاهد بصرية قوية",
            sceneDescriptions: "وصف تفصيلي للمشاهد",
            mood: "أجواء توتر وغموض",
          },
        },
      };

      const result = await agent.executeTask(input);

      expect(result).toBeDefined();
      expect(result.text).toBeTruthy();
    });

    it("should return text-only output without JSON blocks", async () => {
      const input: StandardAgentInput = {
        input: "حلل العناصر البصرية والإخراجية",
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

  describe("Visual Cinematic Analysis Features", () => {
    it("should identify key visual elements", async () => {
      const input: StandardAgentInput = {
        input: "حدد العناصر البصرية الرئيسية (ديكور، إضاءة، ألوان)",
        options: {
          enableRAG: true,
          confidenceThreshold: 0.75,
        },
        context: {
          previousStations: {
            sceneDescriptions: "مشهد داخلي في قصر قديم",
          },
        },
      };

      const result = await agent.executeTask(input);

      expect(result).toBeDefined();
      expect(result.text).toBeTruthy();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
    });

    it("should suggest camera composition and direction", async () => {
      const input: StandardAgentInput = {
        input: "اقترح زوايا الكاميرا وحركاتها وأنواع اللقطات",
        options: {
          enableSelfCritique: true,
          confidenceThreshold: 0.75,
        },
        context: {
          previousStations: {
            sceneDescriptions: "مشهد مطاردة في شوارع المدينة",
          },
        },
      };

      const result = await agent.executeTask(input);

      expect(result).toBeDefined();
      expect(result.text).toBeTruthy();
    });

    it("should assess filmability and production challenges", async () => {
      const input: StandardAgentInput = {
        input: "قيّم قابلية التصوير والتحديات الإنتاجية",
        options: {
          enableConstitutional: true,
          confidenceThreshold: 0.75,
        },
        context: {
          previousStations: {
            sceneDescriptions: "مشهد معركة بحرية ضخمة",
          },
        },
      };

      const result = await agent.executeTask(input);

      expect(result).toBeDefined();
      expect(result.confidence).toBeDefined();
    });

    it("should detect visual symbolism", async () => {
      const input: StandardAgentInput = {
        input: "اكشف الرمزية البصرية والاستعارات المرئية",
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

    it("should analyze mood and pacing", async () => {
      const input: StandardAgentInput = {
        input: "حلل الأجواء والإيقاع البصري",
        options: {
          enableUncertainty: true,
          confidenceThreshold: 0.75,
        },
        context: {
          previousStations: {
            mood: "توتر وترقب",
          },
        },
      };

      const result = await agent.executeTask(input);

      expect(result).toBeDefined();
      expect(result.text).toBeTruthy();
    });
  });

  describe("Post-Processing", () => {
    it("should clean JSON blocks from output", async () => {
      const input: StandardAgentInput = {
        input: "حلل المشهد",
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
        input: "قدم تحليلاً سينمائياً",
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
        input: "حلل المشهد",
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
        input: "قدم تحليلاً سينمائياً بصرياً شاملاً",
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
