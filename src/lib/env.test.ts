import { describe, expect, it } from "vitest";
import { parseEnv } from "./env";

describe("env configuration", () => {
  it("applies default values when env vars are missing", () => {
    const config = parseEnv({});

    expect(config.DATABASE_PATH).toBe("./data/medium-reader.db");
    expect(config.LOG_LEVEL).toBe("info");
    expect(config.FREEDIUM_BASE_URLS).toEqual([
      "https://freedium-mirror.cfd",
      "https://freedium.cfd",
    ]);
  });

  it("parses valid custom environment variables", () => {
    const config = parseEnv({
      DATABASE_PATH: "/custom/path/app.db",
      LOG_LEVEL: "debug",
      FREEDIUM_BASE_URLS: "https://custom.freedium.com, https://other.com",
    });

    expect(config.DATABASE_PATH).toBe("/custom/path/app.db");
    expect(config.LOG_LEVEL).toBe("debug");
    expect(config.FREEDIUM_BASE_URLS).toEqual([
      "https://custom.freedium.com",
      "https://other.com",
    ]);
  });

  it("throws a readable error when LOG_LEVEL is invalid", () => {
    expect(() =>
      parseEnv({
        LOG_LEVEL: "verbose",
      }),
    ).toThrow(/Invalid environment configuration: LOG_LEVEL/);
  });
});
