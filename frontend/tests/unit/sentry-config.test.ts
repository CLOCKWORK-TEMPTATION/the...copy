import { describe, it, expect } from "vitest";
import { existsSync } from "fs";
import { join } from "path";

describe("Sentry Configuration - Regression Guard", () => {
  const frontendRoot = join(__dirname, "../..");

  it("should have instrumentation.ts file", () => {
    const instrumentationPath = join(frontendRoot, "src/instrumentation.ts");
    expect(existsSync(instrumentationPath)).toBe(true);
  });

  it("should have global-error.tsx file", () => {
    const globalErrorPath = join(frontendRoot, "src/app/global-error.tsx");
    expect(existsSync(globalErrorPath)).toBe(true);
  });

  it("should NOT have deprecated sentry.server.config.ts", () => {
    const serverConfigPath = join(frontendRoot, "sentry.server.config.ts");
    expect(existsSync(serverConfigPath)).toBe(false);
  });

  it("should NOT have deprecated sentry.edge.config.ts", () => {
    const edgeConfigPath = join(frontendRoot, "sentry.edge.config.ts");
    expect(existsSync(edgeConfigPath)).toBe(false);
  });

  it("should have client config (still needed)", () => {
    const clientConfigPath = join(frontendRoot, "sentry.client.config.ts");
    expect(existsSync(clientConfigPath)).toBe(true);
  });

  it("should NOT have deprecated instrumentationHook flag", async () => {
    const nextConfigPath = join(frontendRoot, "next.config.ts");
    const nextConfigContent = await import("fs").then((fs) =>
      fs.promises.readFile(nextConfigPath, "utf-8")
    );
    expect(nextConfigContent).not.toContain("instrumentationHook");
  });
});
