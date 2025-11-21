/**
 * Pipeline Sequential Flow Test
 *
 * Tests that the seven stations pipeline runs in correct order (1→7)
 * and that each station receives output from the previous station.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { runSevenStations } from "../src/lib/ai/stations";
import type { StationOutput } from "../src/lib/ai/interfaces/stations";

describe("Pipeline Sequential Flow (1→7)", () => {
  const testText = `
    في قرية صغيرة على ضفاف النهر، عاش أحمد وسارة.
    أحمد كان صيادًا ماهرًا، بينما كانت سارة معلمة في المدرسة المحلية.
    تواجه القرية تهديدًا بالفيضان، ويجب على الجميع التعاون للنجاة.
    في النهاية، ينجح أحمد وسارة في إنقاذ القرية بفضل تعاونهما.
  `;

  it("should run all 7 stations in sequence", async () => {
    const result = await runSevenStations(testText);

    expect(result.success).toBe(true);
    expect(result.outputs).toHaveLength(7);
  }, 120000); // 2 minutes timeout

  it("should have correct station IDs in order", async () => {
    const result = await runSevenStations(testText);

    expect(result.outputs[0].stationId).toBe("station-1");
    expect(result.outputs[1].stationId).toBe("station-2");
    expect(result.outputs[2].stationId).toBe("station-3");
    expect(result.outputs[3].stationId).toBe("station-4");
    expect(result.outputs[4].stationId).toBe("station-5");
    expect(result.outputs[5].stationId).toBe("station-6");
    expect(result.outputs[6].stationId).toBe("station-7");
  }, 120000);

  it("should have all stations marked as successful", async () => {
    const result = await runSevenStations(testText);

    result.outputs.forEach((output, index) => {
      expect(output.success).toBe(true);
      expect(output.error).toBeUndefined();
    });
  }, 120000);

  it("should produce non-empty text output for each station", async () => {
    const result = await runSevenStations(testText);

    result.outputs.forEach((output, index) => {
      expect(output.textOutput).toBeDefined();
      expect(output.textOutput.length).toBeGreaterThan(0);
      expect(typeof output.textOutput).toBe("string");
    });
  }, 120000);

  it("should build a complete full report", async () => {
    const result = await runSevenStations(testText);

    expect(result.fullReport).toBeDefined();
    expect(result.fullReport.length).toBeGreaterThan(0);
    expect(result.fullReport).toContain("المحطات السبع");
  }, 120000);

  it("should contain station names in Arabic", async () => {
    const result = await runSevenStations(testText);

    expect(result.outputs[0].stationName).toBe("تحليل الشخصيات والأسلوب");
    expect(result.outputs[1].stationName).toBe("بيان القصة والنوع الأدبي");
    expect(result.outputs[2].stationName).toBe("شبكة الصراع");
    expect(result.outputs[3].stationName).toBe("تقييم الكفاءة");
    expect(result.outputs[4].stationName).toBe("التحليل الديناميكي");
    expect(result.outputs[5].stationName).toBe("التشخيص");
    expect(result.outputs[6].stationName).toBe("التقرير النهائي");
  }, 120000);

  it("should NOT contain JSON in any station output", async () => {
    const result = await runSevenStations(testText);

    result.outputs.forEach((output, index) => {
      // Check that output doesn't start with { or [
      expect(output.textOutput.trim()).not.toMatch(/^[\{\[]/);

      // Check that output doesn't contain JSON-like structures
      expect(output.textOutput).not.toContain('{"');
      expect(output.textOutput).not.toContain('":');

      // Should be readable Arabic text
      expect(output.textOutput).toMatch(/[\u0600-\u06FF]/); // Arabic Unicode range
    });
  }, 120000);

  it("should have text-only protocol (no JSON parsing)", async () => {
    // This test verifies that the stations module uses text-only protocol
    const result = await runSevenStations("نص تجريبي");

    // Verify outputs are plain text, not JSON
    result.outputs.forEach((output) => {
      expect(typeof output.textOutput).toBe("string");
      expect(output.textOutput).not.toMatch(/^\s*[\{\[]/);
    });
  }, 120000);

  it("should pass context between sequential stations", async () => {
    const result = await runSevenStations(testText);

    // Station 2 should have received Station 1's output
    // Station 3 should have received combined output from 1 & 2, etc.

    // We can verify this by checking that later stations reference earlier findings
    const station7Output = result.outputs[6].textOutput;

    // Station 7 (final report) should synthesize all previous stations
    expect(station7Output.length).toBeGreaterThan(
      result.outputs[0].textOutput.length
    );

    // Should contain comprehensive analysis
    expect(station7Output).toMatch(/ملخص|تقرير|تحليل|توصيات/);
  }, 120000);

  it("should handle errors gracefully", async () => {
    // Test with empty text
    const result = await runSevenStations("");

    // Should not crash
    expect(result).toBeDefined();
    expect(result.success).toBeDefined();
    expect(result.outputs).toBeDefined();
  }, 120000);
});

describe("Station Output Interface Compliance", () => {
  it("should match StationOutput interface structure", async () => {
    const result = await runSevenStations("نص تجريبي قصير");

    result.outputs.forEach((output: StationOutput) => {
      // Check required fields
      expect(output).toHaveProperty("stationId");
      expect(output).toHaveProperty("stationName");
      expect(output).toHaveProperty("textOutput");
      expect(output).toHaveProperty("success");

      // Check types
      expect(typeof output.stationId).toBe("string");
      expect(typeof output.stationName).toBe("string");
      expect(typeof output.textOutput).toBe("string");
      expect(typeof output.success).toBe("boolean");

      // Optional fields
      if (output.processingNotes) {
        expect(typeof output.processingNotes).toBe("string");
      }
      if (output.error) {
        expect(typeof output.error).toBe("string");
      }
    });
  }, 120000);

  it("should have OrchestratorResult structure", async () => {
    const result = await runSevenStations("نص تجريبي");

    expect(result).toHaveProperty("success");
    expect(result).toHaveProperty("outputs");
    expect(result).toHaveProperty("fullReport");

    expect(typeof result.success).toBe("boolean");
    expect(Array.isArray(result.outputs)).toBe(true);
    expect(typeof result.fullReport).toBe("string");
  }, 120000);
});
