# Step 05e: UI Refinement Batch (Sidebar, Article Typography, Spacing, Theming)

## Summary
Executed the UI refinement batch based on direct user testing:
1. Migrated the entire application to a single-typeface system (Inter for everything, Geist Mono for code only), removing `Source_Serif_4` across typography variants, root layout, CSS theme tokens, style guide, and `DESIGN.md`.
2. Replaced manual theme toggling with system-only OS preference detection via root `ThemeProvider` (`next-themes`), removing all manual toggle controls.
3. Increased sidebar row spacing and padding to `px-4 py-3` per row and `gap-1` between rows.
4. Built a responsive single-pane layout below the `md` breakpoint (768px) with route-driven pane switching (`/` shows full-width sidebar list, `/a/[id]` shows full-width article with a plain-text "← Back" link) and seamless two-pane master-detail above `md`.
5. Widened the article reading column to `max-w-[720px]` with responsive horizontal gutters (`px-5` mobile, `md:px-8` tablet, `lg:px-12` desktop).
6. Applied matching subtle, thin, transparent-until-hover scrollbar styling to the reader pane container matching the sidebar.

## Changes Made by Checkpoint

### Checkpoint 1: Single-Typeface System (`78e0550`)
- **`src/components/ui/typography.tsx`**: Removed `font-serif` from `ArticleTitle`, `ArticleHeading2`, `ArticleHeading3`, `ArticleBody`, and `ArticleBlockquote`. All typography now inherits the default `font-sans` (Inter).
- **`src/app/layout.tsx`**: Removed `Source_Serif_4` import, configuration variable, and class mapping on `<html>`.
- **`src/app/globals.css`**: Removed `--font-serif: var(--font-source-serif-4);` from `@theme inline`.
- **`src/app/style-guide/page.tsx`**: Cleaned up `Source_Serif_4` references and classes.
- **`DESIGN.md`**: Updated the **Fonts** section to document Inter as the single typeface across UI and article content.

### Checkpoint 2: System-Only Theme Detection (`2b847f3`)
- **`src/components/theme-provider.tsx`**: Created client `ThemeProvider` wrapping `next-themes` configured with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, and `disableTransitionOnChange`.
- **`src/app/layout.tsx`**: Wrapped `{children}` in `ThemeProvider` and added `suppressHydrationWarning` on `<html>`.
- **`src/app/style-guide/page.tsx`**: Removed manual theme toggle button and unused `useTheme` / state hooks.
- **`DESIGN.md`**: Updated **Color & theme** section to state system-only preference without manual UI toggles.

### Checkpoint 3: Responsive Single-Pane Layout & Text-Based Back Navigation (`0689644`)
- **`src/app/(reader)/sidebar.tsx`**:
  - Increased spacing: `px-4 py-3` row link padding, `gap-1` list row gap.
  - Made sidebar accept `className` and responsive default width `w-full md:w-[320px] lg:w-[360px] md:shrink-0`.
- **`src/app/(reader)/reader-shell.tsx`**: Created client shell using `usePathname()` to conditionally apply Tailwind classes:
  - On `/`: Sidebar is `flex w-full` (visible full width), reader `<main>` is `hidden md:flex`.
  - On `/a/[id]`: Sidebar is `hidden md:flex` (hidden below `md`), reader `<main>` is `flex flex-1 w-full`.
  - At/above `md`: Both panes display side-by-side as master-detail.
- **`src/app/(reader)/layout.tsx`**: Rendered `<ReaderShell>{children}</ReaderShell>`.
- **`src/app/(reader)/a/[id]/page.tsx`**: Added text-based Back navigation `<Link href="/"><ArrowLeft className="h-4 w-4" /><span>Back</span></Link>` styled with `md:hidden` so it only displays in mobile single-pane mode.

### Checkpoint 4: Article Width, Responsive Padding & Matching Scrollbars (`41def85`)
- **`src/app/(reader)/a/[id]/page.tsx`**: Updated article wrapper to `mx-auto w-full max-w-[720px] py-12 px-5 md:px-8 lg:px-12`.
- **`src/app/(reader)/reader-shell.tsx`**: Applied identical subtle scrollbar utility classes to `<main>` (`[scrollbar-width:thin] [scrollbar-color:transparent_transparent] hover:[scrollbar-color:var(--border)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent`).

## Verification & QA Matrix

### Live Browser Inspections (Chrome DevTools MCP)
- **Computed Font Family**: Article `<h1>` computes to `Inter, "Inter Fallback"`, font weight `600`, line height `48px`. Paragraphs compute to `Inter, "Inter Fallback"`.
- **Computed Theme Detection**:
  - `prefers-color-scheme: dark`: `<html class="... dark">`, `body.backgroundColor = lab(2.75381 0 0)` (near-black), `body.color = lab(98.26 0 0)`.
  - `prefers-color-scheme: light`: `<html class="... light">`, `body.backgroundColor = lab(100 0 0)` (white), `body.color = lab(2.75381 0 0)`.
  - Total button toggles found on page: 0.
- **Sidebar Spacing**: `paddingTop = 12px`, `paddingBottom = 12px`, `paddingLeft = 16px`, `paddingRight = 16px`, `rowGap = 4px`.
- **Responsive Layout Verification**:
  - `375px` on `/`: Sidebar `display: flex`, `width: 100%`, reader pane `display: none`.
  - `375px` on `/a/[id]`: Sidebar `display: none`, reader pane `display: flex`, Back button container `display: block`.
  - Clicking "← Back" cleanly returns to `/`.
  - `1280px+` on `/a/[id]`: Sidebar `display: flex` (`360px`), reader pane `display: flex`, Back button container `display: none`.
- **Article Dimensions**: At 1600px viewport, `article.maxWidth = 720px`, `paddingLeft = 48px`, `paddingRight = 48px`. At 375px viewport, `paddingLeft = 20px`, `paddingRight = 20px`.
- **Scrollbar Matching**: Transparent thumb until container hover on both sidebar and reader pane.

### 6-Screenshot Matrix Review
1. **375px — Light Mode**: Clean full-width article, visible text Back button, comfortable 20px horizontal padding.
2. **375px — Dark Mode**: Near-black background with high-contrast text and crisp typography.
3. **768px — Light Mode**: Two-pane master-detail cleanly active; Back button hidden; 32px tablet gutters.
4. **768px — Dark Mode**: Sidebar list and article render in unison with clear hierarchy.
5. **1440px — Light Mode**: 720px reading column centered with 48px desktop gutters; balanced proportions.
6. **1440px — Dark Mode**: Dense, type-driven, minimal visual noise matching brianlovin.com/hn inspiration.

## Test Suite Status
`pnpm check` green across all checkpoints (ESLint, TypeScript `tsc --noEmit`, 52/52 Vitest unit and integration tests passing).
