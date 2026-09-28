# medium-reader — Design System

Inspired by brianlovin.com/hn: dense, type-driven, no visual noise. The
design does the least amount of stuff possible and still feels intentional.

## Fonts
- **IBM Plex Sans** — single typeface for the entire application: article titles, headings,
  body text, blockquotes, sidebar, nav, buttons, metadata, bylines, dates, tags,
  and reading time. This is the default (`font-sans`, applied globally on `<html>`),
  so UI and article text inherit this font automatically.
- **Geist Mono** — inline `<code>` elements and code blocks only. Nowhere else.

## Color & theme
- Dark-mode-first, near-black background (`oklch` low-lightness), matching
  the reference's #0a0a0a feel. Light mode is the alternate, not the default.
- Follows OS preference strictly via pure CSS `prefers-color-scheme` media query,
  with no manual toggle, no JS, and no localStorage persistence.
- Tokens only: `background`, `foreground`, `muted`, `muted-foreground`,
  `border`, `accent`, plus shadcn's fuller set already in globals.css.
  Never hardcode a hex/oklch value in a component.

## Layout & hierarchy
- Master-detail: persistent sidebar list (article title + publication +
  reading time, no thumbnails) + a reader pane. No pagination — just a
  scrollable list, like the reference.
- Hierarchy comes from type size, weight, and foreground/muted-foreground
  color. NEVER cards, drop shadows, or colored boxes to create separation.
- One border style: 1px, using the `border` token, low opacity.
- One radius value, used everywhere or nowhere.
- Spacing: Tailwind's default 4px scale only. No arbitrary pixel values.
- Heading-to-subtext gap: standard gap between a title/heading and its accompanying meta/subtext row is `mb-2.5` (10px on Tailwind's 4px scale).
- Scroll isolation: document and body level scrolling is fully locked (`h-full overflow-hidden`). Only the sidebar list container and the reader pane's `<main>` scroll independently (`overflow-y-auto min-h-0`).

## Motion & interaction
- Transitions: ~120ms, opacity/transform only, used sparingly.
- Every interactive element has a visible `focus-visible` state.
- Sidebar hover/selected states are shown via background AND text color
  together, never color alone. Rows use an inset rounded highlight (`mx-2 rounded-lg`)
  with `bg-muted/60` (selected) and `hover:bg-muted/40` (hover), without hard-edged accent borders.
- Dark mode elevated shadow (`shadow-elevated`): in dark mode only (`prefers-color-scheme: dark`),
  selected and hovered sidebar rows apply a subtle inset contrast shadow (`inset 0 0 0 0.5px rgba(255,255,255,0.04), inset 0 0.5px 0 0 rgba(255,255,255,0.04), 0 1px 3px 0 rgba(0,0,0,0.4)`),
  providing tactile bevel definition. In light mode, this evaluates to `none` (zero shadow change).

## Non-goals for now
No cards, no decorative outer shadows, no decorative icons, no thumbnails in the list. If
something is tempting to add "for polish," check the reference first — it
almost certainly does less, not more.

## Identity
- The app name is **Daybreak** and lives in `src/lib/brand.ts`.
- The UI shows the app name as text only via the `<Wordmark>` component in the sidebar header; no logo, mark, or decorative icon is used anywhere in the reader UI.
- The only graphic in the application is `src/app/icon.svg` (the tab icon), which is the single place where hardcoded hex colors are allowed.
- Article URLs come from `articlePath()` in `src/lib/routes.ts`.

## Typography system
- All text elements must route through <typography.tsx> wrapper components (e.g., <ArticleTitle>, <Meta>).  
- No component may specify its own ont-size, ont-weight, or line-height. This is enforced by ESLint.
- Hardcoded constants (only used inside typography.tsx):
  - list-item-title: 16px size, 24px line-height, medium weight (semibold when selected).
  - meta: 14px size, 20px line-height, normal weight.
  - article-subtitle: 18px-20px size, 1.4 line-height, muted-foreground, normal weight.
  - article-body: 18px-20px size (Tailwind lg), 1.6-1.7 line-height.
  - section-label: 15px size, medium weight.
  - ui-label-small: 12px size, semibold weight.
