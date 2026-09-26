import { z } from "zod";

export const envSchema = z.object({
  DATABASE_PATH: z.string().default("./data/medium-reader.db"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  FREEDIUM_BASE_URLS: z
    .string()
    .default("https://freedium-mirror.cfd,https://freedium.cfd")
    .transform((val) => val.split(",").map((s) => s.trim()).filter(Boolean)),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(
  rawEnv: Record<string, string | undefined> = process.env,
): Env {
  const result = envSchema.safeParse(rawEnv);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${issues}`);
  }
  return result.data;
}

export const env = parseEnv();
