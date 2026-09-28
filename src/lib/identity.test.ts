import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("identity", () => {
  const iconPath = path.resolve(process.cwd(), "src/app/icon.svg");
  const faviconPath = path.resolve(process.cwd(), "src/app/favicon.ico");

  it("src/app/icon.svg exists and contains viewBox='0 0 32 32' and 'prefers-color-scheme: dark'", () => {
    expect(fs.existsSync(iconPath)).toBe(true);
    const content = fs.readFileSync(iconPath, "utf-8");
    expect(content).toContain('viewBox="0 0 32 32"');
    expect(content).toContain("prefers-color-scheme: dark");
  });

  it("src/app/favicon.ico does not exist", () => {
    expect(fs.existsSync(faviconPath)).toBe(false);
  });
});
