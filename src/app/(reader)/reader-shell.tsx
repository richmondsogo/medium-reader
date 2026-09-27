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
        } flex-1 flex-col min-w-0 h-full overflow-auto scroll-smooth bg-background
          [scrollbar-width:thin] [scrollbar-color:transparent_transparent]
          hover:[scrollbar-color:var(--border)_transparent]
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-thumb]:bg-transparent
          hover:[&::-webkit-scrollbar-thumb]:bg-border
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-track]:bg-transparent`}
      >
        {children}
      </main>
    </div>
  );
}
