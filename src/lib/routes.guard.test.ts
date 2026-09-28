import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

function getCodeFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { recursive: true, withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.isFile()) {
      const parent = entry.parentPath || (entry as unknown as { path?: string }).path || dir;
      const fullPath = path.join(parent, entry.name);
      const isCodeFile = fullPath.endsWith(".ts") || fullPath.endsWith(".tsx");
      const isTestOrType =
        fullPath.endsWith(".test.ts") ||
        fullPath.endsWith(".test.tsx") ||
        fullPath.endsWith(".d.ts");
      if (isCodeFile && !isTestOrType) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

describe("routes - guard against legacy /a/ routes", () => {
  const legacyPattern = /["'`]\/a\/|\/a\/\${/;

  it("ensures no non-test .ts/.tsx in src/app or src/components references /a/", () => {
    const targetDirs = [
      path.resolve(process.cwd(), "src/app"),
      path.resolve(process.cwd(), "src/components"),
    ];

    const files = targetDirs.flatMap((dir) => getCodeFiles(dir));
    expect(files.length).toBeGreaterThan(0);

    const violations: string[] = [];

    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      if (legacyPattern.test(content)) {
        violations.push(path.relative(process.cwd(), file));
      }
    }

    expect(
      violations,
      `Found legacy route pattern /a/ in files: ${violations.join(", ")}`
    ).toEqual([]);
  });
});
