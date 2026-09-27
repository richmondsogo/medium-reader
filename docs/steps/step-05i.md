# Step 05i: Discovery & Design Reference Study (`brianlovin.com/hn` & `brianlovin/briOS`)

## Summary
Executed Step 05i as a pure research and discovery step to extensively study the live design and implementation architecture of [brianlovin.com/hn](https://brianlovin.com/hn) and its backing public repository [`brianlovin/briOS`](https://github.com/brianlovin/briOS).

No code was modified in `medium-reader`. `typography.tsx`, `DESIGN.md`, and application components remain completely untouched.

All findings, measurements, tokens, and structural analyses have been documented in:
- [`docs/notes/brianlovin-design-reference.md`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/docs/notes/brianlovin-design-reference.md)
- [`docs/screenshots/`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/docs/screenshots/)

---

## Discoveries & Findings

### 1. Live Browser Measurements (`brianlovin.com/hn`)
Using live browser DevTools inspection (`window.getComputedStyle(...)`) and screenshot captures across both light and dark modes:
- **Layout & Structure**:
  - Global navigation header: `height: 56px` (`h-14`), horizontal padding `12px` (`px-3`).
  - Fixed viewport container: `fixed inset-x-0 top-14 bottom-0` locks document scroll; list and detail panes scroll independently inside `overflow-y-auto min-h-0`.
  - Master list sidebar: width fixed to `350px` (`max-width: 350px`, driven by `--secondary-sidebar-width`).
  - Detail pane: fills remaining viewport width (`flex: 1 1 0%`), with a centered reading column limited to `max-width: 768px` (`max-w-3xl`) and `0 32px` padding (`lg:px-8`).
  - Responsive behavior: driven by container queries (`@container` + `@3xl`). Below `@3xl`, view collapses to single column (list on `/hn`, detail on `/hn/[id]`). At and above `@3xl`, both panes display side-by-side.
- **Typography & Hierarchy**:
  - Global font family: **Inter** (`Inter, "Inter Fallback", sans-serif`) with system monospace for code and metadata usernames.
  - Story Titles (List): `16px`, font-weight `500` (Medium), line-height `24px`, letter-spacing `normal`, clamped to 2 lines (`line-clamp-2`).
  - Domain / Subtext (List): `16px`, font-weight `400` (Regular), line-height `24px`, muted quaternary color.
  - Story Title (Detail): `40px` (`2.5rem`), font-weight `700` (Bold), line-height `48px` (`leading-[1.2]`), letter-spacing `-0.64px`.
  - Comment Usernames: Monospace, `15px` / `16px`, font-weight `400`, line-height `22.5px` / `24px`.
  - Comment Paragraphs: `18px`, font-weight `400`, line-height `32px`, comfortable reading scale.
- **Spacing & Padding**:
  - Sidebar outer inset: `ul` has `12px` padding on all sides (`md:p-3`).
  - Item spacing: tight `2px` vertical flex gap between items (`gap-0.5`).
  - Item internal hit target: vertical padding `12px`, horizontal padding `14px` (`py-3 px-3.5`).
  - Title to domain gap: `2px` (`gap-0.5`).
  - Detail header vertical padding: `48px 0` (`md:py-12`).
  - Comment hierarchy: nested replies indent with `pl-4 mt-4` (16px left padding, 16px top margin) and zero left margin. Root comments separated by `40px` (`gap-10`).
- **Corner Radii & Borders**:
  - Sidebar item border-radius: `8px` (`md:rounded-lg`).
  - Promotional cards / empty state: `16px` (`rounded-2xl`).
  - Buttons & pills: `9999px` (`rounded-full`).
  - Accent bars: **None**. Selection does not use a colored left accent border.
- **Color Tokens & Contrast Shadows**:
  - Dark mode: background `lab(2.75% 0 0)` (~`#070707`), primary text `rgba(255, 255, 255, 0.9)`, tertiary `rgba(255, 255, 255, 0.5)`, quaternary `rgba(255, 255, 255, 0.32)`, hairline borders `rgba(255, 255, 255, 0.12)`.
  - Light mode: background `#ffffff`, primary text `lab(7.78% 0 0)` (~`#141414`), tertiary `lab(48.5% 0 0)` (~`#737373`), quaternary `lab(66.1% 0 0)` (~`#a3a3a3`), hairline borders `rgba(0, 0, 0, 0.12)`.
  - Contrast shadow (`dark:shadow-contrast`): multi-stop inset shadow applied on dark mode selected rows and elevated surfaces: `inset 0 0 0 0.5px rgba(255, 255, 255, 0.04), inset 0 0.5px 0 0 rgba(255, 255, 255, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.4)`.
- **Scrollbars**:
  - Global CSS rule: `scrollbar-width: thin; scrollbar-color: var(--scrollbar-color) transparent;`.
  - Transparent track prevents layout shift or unsightly scroll gutters.

### 2. GitHub Repository Inspection (`brianlovin/briOS`)
- **Route Structure**: Hacker News route lives in `src/app/hn`.
  - `src/app/hn/layout.tsx`: Server Component that pre-fetches and caches top stories using Next.js `"use cache"`.
  - `src/app/hn/HNLayoutClient.tsx`: Client coordinator handling post state, selection via pathname matching, and embedding the layout primitives.
  - `src/app/hn/[id]/HNPostPageClient.tsx`: Article header, metadata byline, comment thread parsing, and keyboard shortcuts (`alt+j`/`alt+k`).
- **Reusable Primitives**:
  - `src/components/ListDetailLayout.tsx`: Container-query-powered master-detail split view.
  - `src/components/ListDetailWrapper.tsx`: Viewport-locking frame below top navigation.
  - `src/hooks/useListNavigation.ts`: Global keyboard navigation across story items.
- **Styling Architecture**:
  - Built with Tailwind CSS v4 (`@import "tailwindcss"; @theme inline`).
  - Semantic variables in `:root` and `@variant dark`.
  - Custom `@utility shadow-contrast`.

---

## Visual Evidence

Saved screenshots:
- `docs/screenshots/brianlovin-hn-full.png`
- `docs/screenshots/brianlovin-hn-detail-view.png`
- `docs/screenshots/brianlovin-hn-light.png`
- `docs/screenshots/brianlovin-hn-list.png`
- `docs/screenshots/brianlovin-hn-list-item.png`

---

## Verification & QA

1. **Clean Workspace & No File Pollution**:
   - `git status` confirms zero changes to `DESIGN.md`, `src/components/ui/typography.tsx`, or any existing codebase files.
   - Only research notes and screenshots were created.
2. **Quality Checks**:
   - `pnpm check`:
     - ESLint: passed
     - TypeScript (`tsc --noEmit`): passed
     - Vitest: 13/13 test files passed, 52/52 tests passed
