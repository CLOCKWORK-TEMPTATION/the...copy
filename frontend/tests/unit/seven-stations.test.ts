import { describe, it, expect } from "vitest";
import { StationsOrchestrator } from "../src/lib/ai/stations/orchestrator";

describe("Seven Stations System", () => {
  describe("StationsOrchestrator", () => {
    it("should create orchestrator instance", () => {
      const orchestrator = new StationsOrchestrator();
      expect(orchestrator).toBeDefined();
    });

    it("should execute all seven stations", async () => {
      const orchestrator = new StationsOrchestrator();
      const testText = `
        مشهد 1 - داخلي - ليل
        
        أحمد: مرحباً يا فاطمة، كيف حالك؟
        فاطمة: بخير والحمد لله، وأنت؟
        أحمد: أشعر بالقلق من المستقبل.
        
        تنظر فاطمة إليه بحزن وتضع يدها على كتفه.
        
        فاطمة: لا تقلق، كل شيء سيكون بخير.
      `;

      const result = await orchestrator.execute(testText);

      expect(result).toBeDefined();
      expect(result.stations).toBeDefined();
      expect(result.finalReport).toBeDefined();
      expect(result.totalConfidence).toBeGreaterThan(0);
      expect(result.executionTime).toBeGreaterThan(0);

      // التأكد من وجود جميع المحطات السبع
      expect(result.stations.S1).toBeDefined();
      expect(result.stations.S2).toBeDefined();
      expect(result.stations.S3).toBeDefined();
      expect(result.stations.S4).toBeDefined();
      expect(result.stations.S5).toBeDefined();
      expect(result.stations.S6).toBeDefined();
      expect(result.stations.S7).toBeDefined();
    });

    it("should handle empty text gracefully", async () => {
      const orchestrator = new StationsOrchestrator();

      const result = await orchestrator.execute("");

      expect(result).toBeDefined();
      expect(result.totalConfidence).toBeLessThan(0.5);
    });

    it("should generate Arabic text output only", async () => {
      const orchestrator = new StationsOrchestrator();
      const testText = "نص تجريبي للاختبار";

      const result = await orchestrator.execute(testText);

      // التأكد من أن التقرير النهائي نص عربي
      expect(result.finalReport).toMatch(/[\u0600-\u06FF]/);
      expect(result.finalReport).not.toMatch(/^\s*\{/); // ليس JSON

      // التأكد من أن كل محطة تنتج نص عربي
      Object.values(result.stations).forEach((station: any) => {
        expect(station.summary).toMatch(/[\u0600-\u06FF]/);
        expect(station.confidence).toBeGreaterThanOrEqual(0);
        expect(station.confidence).toBeLessThanOrEqual(1);
      });
    });
  });
});
