import { ReactNode } from "react";
import { getDb } from "@/db/instance";
import { listArticles } from "@/db/articles";
import { ReaderShell } from "./reader-shell";

export default async function ReaderLayout({ children }: { children: ReactNode }) {
  const db = getDb();
  const articles = listArticles(db);

  return <ReaderShell articles={articles}>{children}</ReaderShell>;
}
