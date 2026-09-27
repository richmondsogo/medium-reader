# Step 05g: Reader Pane Padding Flattening and IBM Plex Sans Font Swap

## Summary
Executed Step 05g addressing reader pane padding at large viewports and swapping the primary typeface:
1. **Reader Pane Padding Flattening**: In `src/app/(reader)/a/[id]/page.tsx`, flattened the article container padding from breakpoint-escalating `px-5 md:px-8 lg:px-12` to a uniform `px-6` (24px) across all screen sizes. This eliminates double-counting of horizontal padding on top of `max-w-[720px] mx-auto` centering on wider viewports.
2. **Single Typeface Font Swap (IBM Plex Sans)**: Replaced `Hanken Grotesk` globally with `IBM Plex Sans` via `next/font/google`, mapped CSS theme variables `--font-sans` and `--font-heading` to `--font-ibm-plex-sans`, updated `DESIGN.md`, and updated the style guide page while preserving `Geist Mono` exclusively for inline code.

---

## Changes Made by Checkpoint

### Checkpoint 1: Reader Pane Padding Flattening (`73ad385`)
`fix: flatten reader pane padding, remove breakpoint escalation`
- **`src/app/(reader)/a/[id]/page.tsx`**: Replaced `<article className="mx-auto w-full max-w-[720px] py-12 px-5 md:px-8 lg:px-12">` with `<article className="mx-auto w-full max-w-[720px] py-12 px-6">`.

### Checkpoint 2: IBM Plex Sans Font Swap
`feat: swap Hanken Grotesk for IBM Plex Sans`
- **`src/app/layout.tsx`**:
  - Replaced `Hanken_Grotesk` with `IBM_Plex_Sans` from `next/font/google`, mapped to `--font-ibm-plex-sans` with weights `["400", "500", "600", "700"]`.
  - Updated `html` class string to interpolate `ibmPlexSans.variable`.
- **`src/app/globals.css`**: Updated `@theme inline` mapping for `--font-sans` and `--font-heading` to `var(--font-ibm-plex-sans)`.
- **`src/app/style-guide/page.tsx`**: Updated font import, variable instantiation, class names, and copy text to reference `IBM Plex Sans`.
- **`DESIGN.md`**: Updated the **Fonts** section to document `IBM Plex Sans` as the single application typeface.
- **`docs/steps/step-05g.md`**: Recorded step execution log, changes by checkpoint, and verification results.

---

## Verification & QA Matrix

### 1. Reader Pane Padding Verification (Chrome DevTools MCP)
Evaluated computed geometry of `<article>` on `/a/1` across target breakpoints:
- **375px (Mobile)**:
  - `window.innerWidth`: `375px`
  - `article.offsetWidth`: `375px`
  - `paddingLeft`: `24px` (`px-6`)
  - `paddingRight`: `24px` (`px-6`)
- **768px (Tablet)**:
  - `window.innerWidth`: `768px`
  - Sidebar: `330px`
  - Article pane width: `438px`
  - `paddingLeft`: `24px` (`px-6`)
  - `paddingRight`: `24px` (`px-6`)
- **1600px+ (Desktop / Ultrawide)**:
  - `window.innerWidth`: `1600px`
  - `article.offsetWidth`: `720px` (`max-w-[720px] mx-auto` centering)
  - `paddingLeft`: `24px` (`px-6`)
  - `paddingRight`: `24px` (`px-6`)
  - Confirmed side padding remains modest, consistent, and readable without excess inset.

### 2. Font Family Computed Style Verification
Inspected computed `font-family` styles via DevTools runtime script execution on live dev server (`http://localhost:3000`):
- Sidebar title (`Digest`): `"IBM Plex Sans", "IBM Plex Sans Fallback"`
- Sidebar article items: `"IBM Plex Sans", "IBM Plex Sans Fallback"`
- Article header (`h1`): `"IBM Plex Sans", "IBM Plex Sans Fallback"`
- Article body paragraphs: `"IBM Plex Sans", "IBM Plex Sans Fallback"`
- Style guide (`/style-guide`): `"IBM Plex Sans", "IBM Plex Sans Fallback"`
- Inline code elements: `"Geist Mono", "Geist Mono Fallback"` (untouched)

---

## Test Suite Status
- `pnpm check` ran cleanly with zero errors:
  - ESLint: passed
  - TypeScript (`tsc --noEmit`): passed
  - Vitest: 13/13 test files passed, 52/52 tests passed
