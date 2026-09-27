import { Inter } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function StyleGuidePage() {
  return (
    <div
      className={`min-h-screen bg-background text-foreground p-8 ${inter.variable}`}
    >
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Nav-style row */}
        <nav
          className={`${inter.className} flex items-center justify-between py-4`}
        >
          <div className="font-semibold text-lg tracking-tight">
            Medium Reader
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Style Guide</span>
          </div>
        </nav>

        <Separator className="bg-border" />

        {/* Headings and Paragraph */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Style Guide & Typography
          </h1>
          <h2 className="text-2xl font-semibold text-foreground">
            Subheading Example (H2)
          </h2>
          <h3 className="text-xl font-medium text-muted-foreground">
            Section Title (H3)
          </h3>
          <p className="text-lg leading-relaxed text-foreground">
            This is a paragraph rendered in the Inter font. It
            demonstrates the reading experience for the main article content.
            The design uses Tailwind CSS theme tokens like{" "}
            <code className="text-sm bg-muted text-muted-foreground px-1 py-0.5 rounded">
              bg-background
            </code>{" "}
            and{" "}
            <code className="text-sm bg-muted text-muted-foreground px-1 py-0.5 rounded">
              text-foreground
            </code>{" "}
            to ensure proper contrast in both light and dark modes. Good
            typography is essential for a comfortable reading experience.
          </p>
        </div>

        {/* Small UI text & Metadata */}
        <div className={`${inter.className} space-y-2`}>
          <div className="text-sm text-muted-foreground">
            Published on September 26, 2026 • 5 min read
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Tag: Typography
          </div>
        </div>

        <Separator className="bg-border" />

        {/* UI Components */}
        <div className={`${inter.className} space-y-6`}>
          <h2 className="text-xl font-semibold">UI Components</h2>
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
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              ScrollArea Example
            </h3>
            <ScrollArea className="h-40 w-full rounded-md border border-border p-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="text-sm text-foreground">
                    Scrollable content item {i} demonstrating the ScrollArea
                    component.
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
 
