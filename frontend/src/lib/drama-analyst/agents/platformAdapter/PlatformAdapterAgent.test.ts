import { describe, it, expect, beforeEach } from "vitest";
import { PlatformAdapterAgent } from "./PlatformAdapterAgent";
import { TaskType } from "@core/types";

describe("PlatformAdapterAgent", () => {
    let agent: PlatformAdapterAgent;

    beforeEach(() => {
        agent = new PlatformAdapterAgent();
    });

    it("should have correct configuration", () => {
        const config = agent.getConfig();

        expect(config.name).toBe("MediaTransmorph AI");
        expect(config.taskType).toBe(TaskType.PLATFORM_ADAPTER);
        expect(config.confidenceFloor).toBe(0.78);
        expect(config.supportsRAG).toBe(true);
        expect(config.supportsSelfCritique).toBe(true);
    });

    it("should execute task successfully", async () => {
        const result = await agent.executeTask({
            input: "حوّل هذا المحتوى ليناسب تويتر",
            options: {
                enableRAG: false,
                enableSelfCritique: false,
                enableConstitutional: false,
                enableUncertainty: false,
                enableHallucination: false,
            },
            context: {
                targetPlatform: "Twitter",
                sourceContent: "مقال طويل عن الذكاء الاصطناعي في صناعة الأفلام",
                constraints: {
                    characterLimit: 280,
                },
            },
        });

        expect(result.text).toBeTruthy();
        expect(result.confidence).toBeGreaterThan(0);
        expect(typeof result.text).toBe("string");
    });

    it("should return text-only output without JSON blocks", async () => {
        const result = await agent.executeTask({
            input: "حوّل هذا المحتوى لإنستغرام",
            options: {
                enableRAG: false,
                enableSelfCritique: false,
            },
            context: {
                targetPlatform: "Instagram",
            },
        });

        expect(result.text).not.toContain("```json");
        expect(result.text).not.toContain("```");
        expect(result.text).not.toMatch(/\{[^}]*"[^"]*":[^}]*\}/);
    });

    it("should handle platform-specific constraints", async () => {
        const result = await agent.executeTask({
            input: "حوّل هذا الفيديو الطويل للتيك توك",
            options: {
                enableRAG: false,
            },
            context: {
                targetPlatform: "TikTok",
                constraints: {
                    videoLength: "60 seconds",
                    aspectRatio: "9:16",
                },
            },
        });

        expect(result.text).toBeTruthy();
        expect(result.confidence).toBeGreaterThan(0);
    });

    it("should handle errors gracefully", async () => {
        const result = await agent.executeTask({
            input: "",
            options: {
                enableRAG: false,
            },
        });

        expect(result.confidence).toBeLessThanOrEqual(0.5);
        expect(result.notes).toBeDefined();
    });

    it("should provide fallback response on failure", async () => {
        const fallbackResponse = await (agent as any).getFallbackResponse({
            input: "test",
            context: {
                targetPlatform: "YouTube",
            },
        });

        expect(fallbackResponse).toContain("YouTube");
        expect(fallbackResponse).toContain("توصيات");
    });

    it("should post-process output correctly", async () => {
        const mockOutput = {
            text: `تحليل التحويل
\`\`\`json
{ "platform": "Twitter" }
\`\`\`
المحتوى المحول هنا`,
            confidence: 0.85,
            notes: [],
            metadata: {},
        };

        const processed = await (agent as any).postProcess(mockOutput);

        expect(processed.text).not.toContain("```json");
        expect(processed.text).not.toContain("{ \"platform\"");
        expect(processed.notes).toContain(
            "تحويل عالي الجودة - مُحسّن للمنصة المستهدفة"
        );
    });

    it("should add appropriate notes based on confidence", async () => {
        const lowConfidenceOutput = {
            text: "محتوى محول",
            confidence: 0.65,
            notes: [],
            metadata: {},
        };

        const processed = await (agent as any).postProcess(lowConfidenceOutput);

        expect(processed.notes).toContain("تحويل أولي - يُنصح بالمراجعة والتحسين");
    });

    it("should preserve core message during adaptation", async () => {
        const result = await agent.executeTask({
            input: "حوّل هذا المقال عن الإبداع في الكتابة الدرامية",
            options: {
                enableRAG: false,
                enableSelfCritique: false,
            },
            context: {
                targetPlatform: "LinkedIn",
                sourceContent:
                    "الإبداع في الكتابة الدرامية يتطلب فهماً عميقاً للشخصيات والصراع",
            },
        });

        expect(result.text).toBeTruthy();
        expect(result.confidence).toBeGreaterThan(0);
    });
});
