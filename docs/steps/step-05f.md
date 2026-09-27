# Step 05f: Pure CSS Theming Fix, Smooth Scrolling, and Hanken Grotesk Font Swap

## Summary
Executed Step 05f addressing theming root cause, smooth scrolling, and global font swap:
1. **Theming Root Cause & Pure CSS Fix**: Removed `next-themes` and `ThemeProvider` completely. Stale `localStorage` entries from earlier manual toggle testing had been masking the underlying behavior in clean/incognito profiles. Reverted Tailwind v4 to its default OS-driven strategy using pure CSS `@media (prefers-color-scheme: dark)`, removing all runtime JavaScript and `localStorage` caching from the theme pipeline.
2. **Smooth Scrolling**: Added `scroll-smooth` to `<html>` and both independent scroll containers (sidebar scroll container and reader shell `<main>`).
3. **Single Typeface Font Swap (Hanken Grotesk)**: Replaced `Inter` with `Hanken Grotesk` globally via `next/font/google`, updated CSS theme variable `--font-sans` and `--font-heading`, while keeping `Geist Mono` strictly for code.

---

## Changes Made by Checkpoint

### Checkpoint 1: Pure CSS Theming (`fcaaef8`)
`fix: remove next-themes, use pure CSS prefers-color-scheme (no localStorage, no manual state)`
- **`src/components/theme-provider.tsx`**: Removed file entirely.
- **`src/app/layout.tsx`**: Removed `ThemeProvider` import and wrapper around `{children}`, keeping `suppressHydrationWarning` on `<html>`.
- **`package.json` & `pnpm-lock.yaml`**: Removed `next-themes` dependency.
- **`src/app/globals.css`**:
  - Removed `@custom-variant dark (&:is(.dark *));` to revert Tailwind v4 to its default media-query-based dark variant.
  - Replaced `.dark { ... }` block with `@media (prefers-color-scheme: dark) { :root { ... } }` so design tokens dynamically update based on OS preference without needing any `.dark` class on the DOM.
- **`DESIGN.md`**: Updated **Color & theme** section to specify pure CSS `prefers-color-scheme` media query without JS, UI toggles, or localStorage persistence.
- **Codebase Grep Audit**: Verified zero remaining references to `useTheme`, `next-themes`, or `.dark` class across application code.

### Checkpoint 2: Smooth Scrolling & Hanken Grotesk Font Swap (`f016bd8`)
`feat: smooth scroll, swap Inter for Hanken Grotesk`
- **`src/app/layout.tsx`**:
  - Replaced `Inter` with `Hanken_Grotesk` from `next/font/google`, mapped to `--font-hanken-grotesk`.
  - Added `scroll-smooth` to `<html>` class list.
- **`src/app/(reader)/sidebar.tsx`**: Added `scroll-smooth` to the sidebar's scrollable `div`.
- **`src/app/(reader)/reader-shell.tsx`**: Added `scroll-smooth` to the `<main>` scroll container.
- **`src/app/globals.css`**: Updated `@theme inline` mapping for `--font-sans` and `--font-heading` to `var(--font-hanken-grotesk)`.
- **`src/app/style-guide/page.tsx`**: Updated font import, variable, and copy to `Hanken_Grotesk`.
- **`DESIGN.md`**: Updated **Fonts** section to document Hanken Grotesk as the single application typeface.

---

## Verification & QA Matrix

### 1. Theming & Storage Verification (Chrome DevTools MCP)
- **Local Storage Cleared**: Evaluated `localStorage.clear()` on `http://localhost:3000` to guarantee a clean profile with zero cached state.
- **Emulate `prefers-color-scheme: dark`**:
  - `html.className`: `"hanken_grotesk_... geist_mono_... h-full antialiased scroll-smooth"` (No `.dark` class present).
  - `body.backgroundColor`: `lab(2.75381 0 0)` (near-black background token).
  - `body.color`: `lab(98.26 0 0)` (near-white foreground token).
  - `localStorage.length`: `0` (zero theme-related keys).
- **Emulate `prefers-color-scheme: light`**:
  - `body.backgroundColor`: `lab(100 0 0)` (pure white background token).
  - `body.color`: `lab(2.75381 0 0)` (dark foreground token).
  - `localStorage.length`: `0` (zero theme-related keys).
- **Zero JS / Zero Storage**: Confirmed that no JavaScript or localStorage is involved in theme switching; it is driven entirely by pure CSS media query.

### 2. Smooth Scrolling Verification
- `<html>` element: `classList.contains('scroll-smooth') === true`.
- Sidebar scrollable container (`aside > div.overflow-y-auto`): `classList.contains('scroll-smooth') === true`.
- Reader shell `<main>` container: `classList.contains('scroll-smooth') === true`.

### 3. Font Family Computed Style Verification
- Sidebar title (`Digest`): `"Hanken Grotesk", "Hanken Grotesk Fallback"`.
- Sidebar article items: `"Hanken Grotesk", "Hanken Grotesk Fallback"`.
- Article header (`h1`): `"Hanken Grotesk", "Hanken Grotesk Fallback"`.
- Document body: `"Hanken Grotesk", "Hanken Grotesk Fallback"`.
- Inline code elements: inherits `Geist Mono` (`font-mono`).

---

## Test Suite Status
- `pnpm check` ran cleanly with zero errors and zero warnings:
  - ESLint: passed
  - TypeScript (`tsc --noEmit`): passed
  - Vitest: 13/13 test files passed, 52/52 tests passed
