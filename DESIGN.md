# medium-reader — Design System

Inspired by brianlovin.com/hn: dense, type-driven, no visual noise. The
design does the least amount of stuff possible and still feels intentional.

## Fonts
- **Inter** — single typeface for the entire application: article titles, headings,
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

## Motion & interaction
- Transitions: ~120ms, opacity/transform only, used sparingly.
- Every interactive element has a visible `focus-visible` state.
- Sidebar hover/selected states are shown via background AND text color
  together, never color alone.

## Non-goals for now
No cards, no shadows, no decorative icons, no thumbnails in the list. If
something is tempting to add "for polish," check the reference first — it
almost certainly does less, not more.

## Typography system
- All text elements must route through <typography.tsx> wrapper components (e.g., <ArticleTitle>, <Meta>).  
- No component may specify its own ont-size, ont-weight, or line-height. This is enforced by ESLint.
- Hardcoded constants (only used inside 	ypography.tsx):
  - list-item-title: 16px size, 24px line-height, medium weight (semibold when selected).
  - meta: 14px size, 20px line-height, normal weight.
  - rticle-body: 18px-20px size (Tailwind lg), 1.6-1.7 line-height.
  - section-label: 15px size, medium weight.
  - ui-label-small: 12px size, semibold weight.
