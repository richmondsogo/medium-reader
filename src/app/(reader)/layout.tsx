import { ReactNode } from "react";
import { env } from "@/lib/env";
import { createDb } from "@/db/client";
import { listArticles } from "@/db/articles";
import { ReaderShell } from "./reader-shell";

export default async function ReaderLayout({ children }: { children: ReactNode }) {
  const db = createDb(env.DATABASE_PATH);
  const articles = listArticles(db);

  return <ReaderShell articles={articles}>{children}</ReaderShell>;
}
