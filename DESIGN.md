# medium-reader — Design System

Inspired by brianlovin.com/hn: dense, type-driven, no visual noise. The
design does the least amount of stuff possible and still feels intentional.

## Fonts
- **Source Serif 4** — article titles and article body text ONLY (inside the
  reader pane). Applied via the `font-serif` utility class.
- **Inter** — everything else: sidebar, nav, buttons, metadata, bylines,
  dates, tags, reading time. This is the default (`font-sans`, applied
  globally on `<html>`), so most UI text needs no explicit class at all.
- **Geist Mono** — inline `<code>` elements only. Nowhere else.

## Color & theme
- Dark-mode-first, near-black background (`oklch` low-lightness), matching
  the reference's #0a0a0a feel. Light mode is the alternate, not the default.
- Follows OS preference by default (`next-themes`, `defaultTheme="system"`,
  `enableSystem`), with a manual override toggle available.
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
