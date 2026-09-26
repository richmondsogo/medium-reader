"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { dummyArticles } from "@/lib/dummy-articles";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[320px] lg:w-[360px] flex-shrink-0 border-r bg-background flex flex-col h-full">
      <div className="p-4 border-b h-14 flex items-center shrink-0">
        <h1 className="font-sans font-semibold text-lg">Digest</h1>
      </div>
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="flex flex-col p-2 space-y-1">
            {dummyArticles.map((article) => {
              const href = `/a/${article.id}`;
              const isSelected = pathname === href;
              
              return (
                <Link
                  key={article.id}
                  href={href}
                  className={`
                    block p-3 rounded-md transition-colors
                    ${isSelected ? "bg-accent text-accent-foreground" : "hover:bg-accent/50 text-foreground"}
                  `}
                >
                  <h2 className="font-sans font-medium text-sm line-clamp-2 leading-tight mb-1">
                    {article.title}
                  </h2>
                  <div className="font-sans text-xs text-muted-foreground flex items-center space-x-1">
                    {article.publicationName ? (
                      <span className="truncate">{article.publicationName}</span>
                    ) : (
                      <span className="truncate">{article.authorName}</span>
                    )}
                    <span>&middot;</span>
                    <span className="shrink-0">{article.readingTimeMinutes} min</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}
