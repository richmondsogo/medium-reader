"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { env } from "@/lib/env";
import { createDb } from "@/db/client";
import { setArticleRead } from "@/db/articles";

const idSchema = z.number().int().positive();

export async function markArticleRead(id: number): Promise<void> {
  const parsedId = idSchema.parse(id);
  const db = createDb(env.DATABASE_PATH);
  setArticleRead(db, parsedId, true);
  revalidatePath("/", "layout");
}
