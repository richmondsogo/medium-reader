"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dummyArticles } from "@/lib/dummy-articles";
import { SectionLabel, ListItemTitle, ListItemTitleSelected, Meta } from "@/components/ui/typography";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[320px] lg:w-[360px] flex-shrink-0 border-r bg-background flex flex-col h-full">
      <div className="sticky top-0 z-20 flex h-14 items-center gap-1 px-3 border-b bg-background shrink-0">
        <SectionLabel className="text-foreground">Digest</SectionLabel>
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
        <ul className="flex flex-col gap-0.5 p-2 list-none m-0">
          {dummyArticles.map((article) => {
            const href = `/a/${article.id}`;
            const isSelected = pathname === href;

            const TitleComponent = isSelected ? ListItemTitleSelected : ListItemTitle;

            return (
              <li key={article.id} className="m-0 p-0 scroll-my-3">
                <Link
                  href={href}
                  className={`block w-full px-3 py-1.5 transition-colors ${
                    isSelected ? "bg-muted/60" : "hover:bg-muted/40"
                  }`}
                >
                  <TitleComponent className="block line-clamp-2 text-foreground">
                    {article.title}
                  </TitleComponent>
                  <Meta className="flex min-w-0 items-center gap-1.5 mt-0.5">
                    <span className="truncate min-w-0">
                      {article.publicationName || article.authorName}
                    </span>
                    <span className="shrink-0">&middot;</span>
                    <span className="shrink-0">{article.readingTimeMinutes} min</span>
                  </Meta>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}