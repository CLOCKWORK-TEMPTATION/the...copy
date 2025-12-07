import { describe, it, expect, beforeEach, vi } from "vitest";
import { DialogueAdvancedAnalyzerAgent } from "./DialogueAdvancedAnalyzerAgent";
import { StandardAgentInput } from "../shared/standardAgentPattern";
import { TaskType } from "@core/enums";

// Mock geminiService
vi.mock("../../services/geminiService", () => ({
  geminiService: {
    generateContent: vi
      .fn()
      .mockResolvedValue("Mock AI response for dialogue advanced analysis"),
  },
}));

describe("DialogueAdvancedAnalyzerAgent", () => {
  let agent: DialogueAdvancedAnalyzerAgent;

  beforeEach(() => {
    agent = new DialogueAdvancedAnalyzerAgent();
    vi.clearAllMocks();
  });

  describe("Configuration", () => {
    it("should initialize with correct configuration", () => {
      const config = agent.getConfig();

      expect(config.name).toBe("ConversationLens AI");
      expect(config.taskType).toBe(TaskType.DIALOGUE_ADVANCED_ANALYZER);
      expect(config.confidenceFloor).toBe(0.75);
      expect(config.supportsRAG).toBe(true);
      expect(config.supportsSelfCritique).toBe(true);
      expect(config.supportsConstitutional).toBe(true);
      expect(config.supportsUncertainty).toBe(true);
      expect(config.supportsHallucination).toBe(true);
      expect(config.supportsDebate).toBe(true);
    });

    it("should allow confidence floor to be updated", () => {
      agent.setConfidenceFloor(0.87);
      const config = agent.getConfig();
      expect(config.confidenceFloor).toBe(0.87);
    });
  });

  describe("Success Path", () => {
    it("should execute dialogue advanced analysis task successfully", async () => {
      const input: StandardAgentInput = {
        input:
          "حلل هذا الحوار بعمق: \n- الشخص أ: أنا بخير.\n- الشخص ب: حقاً؟\n- الشخص أ: نعم، لماذا تسأل؟",
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
            characterAnalysis: "الشخصيتان لديهما تاريخ معقد",
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
        input: "قم بتحليل متطور للحوار المقدم",
        options: {},
        context: {
          previousStations: {
            analysis: "النص يحتوي على حوار غني",
            characterAnalysis: "شخصيات متنوعة",
            dialogueSamples: "عينات من الحوار",
          },
        },
      };

      const result = await agent.executeTask(input);

      expect(result).toBeDefined();
      expect(result.text).toBeTruthy();
    });

    it("should return text-only output without JSON blocks", async () => {
      const input: StandardAgentInput = {
        input: "حلل الحوار وكشف النص الفرعي",
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

  describe("Dialogue Analysis Features", () => {
    it("should detect subtext in dialogue", async () => {
      const input: StandardAgentInput = {
        input: "اكشف النص الفرعي والمعاني الضمنية في الحوار",
        options: {
          enableRAG: true,
          confidenceThreshold: 0.75,
        },
        context: {
          previousStations: {
            dialogueSamples: "حوار يحمل معاني خفية",
          },
        },
      };

      const result = await agent.executeTask(input);

      expect(result).toBeDefined();
      expect(result.text).toBeTruthy();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
    });

    it("should analyze speech rhythm and flow", async () => {
      const input: StandardAgentInput = {
        input: "حلل الإيقاع اللغوي وتدفق الحوار",
        options: {
          enableSelfCritique: true,
          confidenceThreshold: 0.75,
        },
        context: {
          previousStations: {
            dialogueSamples: "حوار متنوع الإيقاع",
          },
        },
      };

      const result = await agent.executeTask(input);

      expect(result).toBeDefined();
      expect(result.text).toBeTruthy();
    });

    it("should evaluate character voice distinctiveness", async () => {
      const input: StandardAgentInput = {
        input: "قيّم تفرد صوت كل شخصية في الحوار",
        options: {
          enableConstitutional: true,
          confidenceThreshold: 0.75,
        },
        context: {
          previousStations: {
            characterAnalysis: "عدة شخصيات في المشهد",
          },
        },
      };

      const result = await agent.executeTask(input);

      expect(result).toBeDefined();
      expect(result.confidence).toBeDefined();
    });

    it("should detect clichés and suggest alternatives", async () => {
      const input: StandardAgentInput = {
        input: "حدد الحوار المبتذل واقترح بدائل",
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
  });

  describe("Post-Processing", () => {
    it("should clean JSON blocks from output", async () => {
      const input: StandardAgentInput = {
        input: "حلل الحوار",
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
        input: "قدم تحليلاً لغوياً للحوار",
        options: {
          confidenceThreshold: 0.75,
        },
        context: {},
      };

      const result = await agent.executeTask(input);

      expect(result.notes).toBeDefined();

      // Notes should reflect confidence level
      if (result.confidence >= 0.85) {
        expect(result.notes).toContain("متقدم");
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
        input: "حلل الحوار",
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
        input: "قدم تحليلاً لغوياً شاملاً للحوار",
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
