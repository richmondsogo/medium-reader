# Step 05d: Font Pipeline Root Cause Fix & Reader Pane Typography Refinement

## Summary
Diagnosed and resolved the root cause of broken fonts across the app, bringing `layout.tsx` and `globals.css` into compliance with Next.js App Router and Tailwind CSS v4 `@theme inline` specifications. Rebuilt the reader pane typography components in `src/components/ui/typography.tsx` and wired them cleanly into the reader route `src/app/(reader)/a/[id]/page.tsx`, verified step-by-step via live browser computed style inspection and screenshots.

## Root Cause Analysis
1. **Font Loading**: `src/app/layout.tsx` imported and configured `Geist` and `Geist_Mono` (with `--font-geist-sans` and `--font-geist-mono`), omitting `Inter` and `Source_Serif_4` required by `DESIGN.md`.
2. **Tailwind v4 Theme Mapping**: `src/app/globals.css` declared `--font-sans: var(--font-sans);`—a circular self-reference causing CSS custom property invalidation and fallback to the browser default Times New Roman. Additionally, `--font-serif` was missing entirely from the `@theme inline` block.

## Changes Made
- **`src/app/layout.tsx`**:
  - Configured `Inter` (`--font-inter`), `Source_Serif_4` (`--font-source-serif-4`), and `Geist_Mono` (`--font-geist-mono`) with `display: "swap"` and Latin subsets.
  - Injected all three font variables into the root `<html>` element.
- **`src/app/globals.css`**:
  - Updated `@theme inline` mapping:
    - `--font-sans: var(--font-inter);`
    - `--font-serif: var(--font-source-serif-4);`
    - `--font-mono: var(--font-geist-mono);`
    - `--font-heading: var(--font-inter);`
- **`src/components/ui/typography.tsx`**:
  - `ArticleTitle`: `font-serif text-[32px] md:text-[40px] leading-[1.2] font-semibold tracking-tight`
  - `ArticleHeading2`: `font-serif text-[24px] font-semibold mt-12 mb-4 leading-tight`
  - `ArticleHeading3`: `font-serif text-[20px] font-semibold mt-8 mb-3 leading-snug`
  - `ArticleBody`: `font-serif text-[19px] leading-[1.7] [&_p]:mb-6`
  - `ArticleBlockquote`: `border-l-2 border-border pl-5 italic text-muted-foreground my-8 text-[19px] leading-[1.7] font-serif`
- **`src/app/(reader)/a/[id]/page.tsx`**:
  - Imported and wired `ArticleTitle`, `ArticleHeading2`, `ArticleHeading3`, `ArticleBody`, and `ArticleBlockquote` via `ReactMarkdown` components.
  - Increased header byline separation margin to `mb-12` (48px).

## Verification (Chrome DevTools MCP)
- **H1 Font Family**: `"Source Serif 4", "Source Serif 4 Fallback"`
- **Sidebar Font Family**: `Inter, "Inter Fallback"`
- **ArticleTitle Computed Style**: Font size 40px, Line height 48px, Weight 600, Letter spacing -1px
- **ArticleHeading2 Computed Style**: Font size 24px, Weight 600, Margin Top 48px, Margin Bottom 16px
- **ArticleHeading3 Computed Style**: Font size 20px, Weight 600, Margin Top 32px, Margin Bottom 12px
- **ArticleBody Computed Style**: Font size 19px, Line height 32.3px, Paragraph Margin Bottom 24px
- **ArticleBlockquote Computed Style**: Font size 19px, Line height 32.3px, Border Left 1.6px-2px solid, Padding Left 20px, Vertical Margins 32px
- **Byline Header**: Margin Bottom 48px
- **Test Suite**: `pnpm check` passed cleanly (ESLint, TypeScript, 52/52 Vitest tests green).
