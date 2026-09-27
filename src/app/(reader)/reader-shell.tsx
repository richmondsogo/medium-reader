"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";

export function ReaderShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isArticle = pathname.startsWith("/a/");

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar className={isArticle ? "hidden md:flex" : "flex"} />
      <main
        className={`${
          isArticle ? "flex" : "hidden md:flex"
        } flex-1 flex-col min-w-0 h-full overflow-auto bg-background`}
      >
        {children}
      </main>
    </div>
  );
}
