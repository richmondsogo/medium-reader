"use client";

import { useTheme } from "next-themes";
import { Inter, Source_Serif_4 } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import {
  ArticleTitle,
  ArticleHeading2,
  ArticleHeading3,
  ArticleBody,
  ListItemTitle,
  Meta,
  SectionLabel,
  UiLabel,
} from "@/components/ui/typography";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sourceSerif4 = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif-4",
});

export default function StyleGuidePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <div
      className={`min-h-screen bg-background text-foreground p-8 ${inter.variable} ${sourceSerif4.variable}`}
    >
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Nav-style row */}
        <nav
          className={`${inter.className} flex items-center justify-between py-4`}
        >
          <SectionLabel className="tracking-tight">
            Medium Reader
          </SectionLabel>
          <div className="flex items-center space-x-4">
            <UiLabel className="text-muted-foreground">Style Guide</UiLabel>
            {mounted && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Toggle {theme === "dark" ? "Light" : "Dark"}
              </Button>
            )}
          </div>
        </nav>

        <Separator className="bg-border" />

        {/* Headings and Paragraph */}
        <div className={`${sourceSerif4.className} space-y-6`}>
          <ArticleTitle className="text-foreground">
            Style Guide & Typography
          </ArticleTitle>
          <ArticleHeading2 className="text-foreground">
            Subheading Example (H2)
          </ArticleHeading2>
          <ArticleHeading3 className="text-muted-foreground">
            Section Title (H3)
          </ArticleHeading3>
          <ArticleBody className="text-foreground">
            This is a paragraph rendered in the Source Serif 4 font. It
            demonstrates the reading experience for the main article content.
            The design uses Tailwind CSS theme tokens like{" "}
            <code className="text-[13px] bg-muted text-muted-foreground px-1 py-0.5 rounded font-mono">
              bg-background
            </code>{" "}
            and{" "}
            <code className="text-[13px] bg-muted text-muted-foreground px-1 py-0.5 rounded font-mono">
              text-foreground
            </code>{" "}
            to ensure proper contrast in both light and dark modes. Good
            typography is essential for a comfortable reading experience.
          </ArticleBody>
        </div>

        {/* Small UI text & Metadata */}
        <div className={`${inter.className} space-y-2`}>
          <Meta as="div">
            Published on September 26, 2026 • 5 min read
          </Meta>
          <UiLabel as="div" className="text-[12px] text-muted-foreground uppercase tracking-wider font-semibold">
            Tag: Typography
          </UiLabel>
        </div>

        <Separator className="bg-border" />

        {/* UI Components */}
        <div className={`${inter.className} space-y-6`}>
          <ListItemTitle as="h2">UI Components</ListItemTitle>
          <div className="flex space-x-4">
            <Button className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              Primary Button
            </Button>
            <Button
              variant="secondary"
              className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Secondary
            </Button>
            <Button
              variant="outline"
              className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Outline
            </Button>
          </div>

          <div className="pt-4">
            <UiLabel as="h3" className="text-muted-foreground mb-2 block font-medium">
              ScrollArea Example
            </UiLabel>
            <ScrollArea className="h-40 w-full rounded-md border border-border p-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <UiLabel key={i} as="div" className="text-foreground">
                    Scrollable content item {i} demonstrating the ScrollArea
                    component.
                  </UiLabel>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
 
