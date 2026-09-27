"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dummyArticles } from "@/lib/dummy-articles";
import { cn } from "@/lib/utils";

export function Sidebar({ className }: { className?: string } = {}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "w-full md:w-[320px] lg:w-[360px] md:shrink-0 border-r bg-background flex flex-col h-full",
        className
      )}
    >
      <div className="sticky top-0 z-20 flex h-14 items-center gap-1 px-3 border-b bg-background shrink-0">
        <span className="font-sans text-[15px] font-medium text-foreground">Digest</span>
      </div>
      <div
        className="flex-1 min-h-0 overflow-y-auto
          [scrollbar-width:thin] [scrollbar-color:transparent_transparent]
          hover:[scrollbar-color:var(--border)_transparent]
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-thumb]:bg-transparent
          hover:[&::-webkit-scrollbar-thumb]:bg-border
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-track]:bg-transparent"
      >
        <ul className="flex flex-col gap-1 p-2 list-none m-0">
          {dummyArticles.map((article) => {
            const href = `/a/${article.id}`;
            const isSelected = pathname === href;

            return (
              <li key={article.id} className="m-0 p-0 scroll-my-3">
                <Link
                  href={href}
                  className={`block w-full px-4 py-3 transition-colors ${
                    isSelected ? "bg-muted/60" : "hover:bg-muted/40"
                  }`}
                >
                  <span
                    className={`block text-[16px] leading-[24px] line-clamp-2 text-foreground ${
                      isSelected ? "font-semibold" : "font-medium"
                    }`}
                  >
                    {article.title}
                  </span>
                  <span className="flex min-w-0 items-center gap-1.5 text-[14px] leading-[20px] font-normal text-muted-foreground">
                    <span className="truncate min-w-0">
                      {article.publicationName || article.authorName}
                    </span>
                    <span className="shrink-0">&middot;</span>
                    <span className="shrink-0">{article.readingTimeMinutes} min</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}