# Step 05j: Dark Mode Elevated Shadow & Independent Scroll Isolation

## Summary
Executed Step 05j to implement two final visual and structural refinements based on research findings:
1. **Dark Mode Elevated Shadow**: Added a subtle inset contrast shadow (`shadow-elevated`) to the sidebar list row's hover and selected states in dark mode only (`prefers-color-scheme: dark`), providing tactile edge definition and bevel depth without altering light mode.
2. **Scroll Isolation Confirmation & Hardening**: Hardened `<body>` with `h-full overflow-hidden` in `src/app/layout.tsx` to completely lock document/window-level scrolling and verified that only the sidebar list container and the reader pane's `<main>` scroll independently.

---

## Changes

### 1. Dark Mode Elevated Shadow Token & Utility
- **`src/app/globals.css`**:
  - Bound `--shadow-elevated: var(--shadow-elevated);` in `@theme inline`.
  - Defined `--shadow-elevated: none;` in `:root` (light mode).
  - Defined the multi-stop inset contrast shadow in `@media (prefers-color-scheme: dark)`:
    ```css
    --shadow-elevated: inset 0 0 0 0.5px rgba(255, 255, 255, 0.04),
      inset 0 0.5px 0 0 rgba(255, 255, 255, 0.04),
      0 1px 3px 0 rgba(0, 0, 0, 0.4);
    ```
  - Registered `@utility shadow-elevated { box-shadow: var(--shadow-elevated); }` so Tailwind generates `shadow-elevated` and `hover:shadow-elevated`.
- **`src/app/(reader)/sidebar.tsx`**:
  - Applied `shadow-elevated` to the selected row (`bg-muted/60 shadow-elevated`).
  - Applied `hover:shadow-elevated` to the hover state (`hover:bg-muted/40 hover:shadow-elevated`).

### 2. Scroll Isolation Locking
- **`src/app/layout.tsx`**:
  - Updated `<body>` from `min-h-full flex flex-col` to `h-full overflow-hidden flex flex-col`.
  - Together with `<div className="flex h-screen w-full overflow-hidden bg-background">` in `ReaderShell`, this guarantees the window and document can never scroll.
  - The sidebar list (`<div className="flex-1 min-h-0 overflow-y-auto ...">`) and reader pane (`<main className="... overflow-auto ...">`) retain full independent scrollability.

### 3. Design Documentation
- **`DESIGN.md`**:
  - Documented the dark mode elevated shadow (`shadow-elevated`) under `Motion & interaction`.
  - Documented the document-level scroll lock and two-pane independent scroll model under `Layout & hierarchy`.

---

## Verification & Live Browser Evidence

### 1. Dark Mode vs. Light Mode Shadow Inspection
Inspected live computed styles via DevTools on `http://localhost:3000/a/2`:
- **Dark Mode (`prefers-color-scheme: dark`)**:
  - Selected Row (`/a/2`):
    `box-shadow`: `"rgba(255, 255, 255, 0.04) 0px 0px 0px 0.5px inset, rgba(255, 255, 255, 0.04) 0px 0.5px 0px 0px inset, rgba(0, 0, 0, 0.4) 0px 1px 3px 0px"`
  - Hovered Row (`/a/1`):
    `box-shadow`: `"rgba(255, 255, 255, 0.04) 0px 0px 0px 0.5px inset, rgba(255, 255, 255, 0.04) 0px 0.5px 0px 0px inset, rgba(0, 0, 0, 0.4) 0px 1px 3px 0px"`
  - Unhovered, Unselected Rows:
    `box-shadow`: `"none"`
  - Screenshot: [`docs/screenshots/step-05j-sidebar-dark-mode-shadow.png`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/docs/screenshots/step-05j-sidebar-dark-mode-shadow.png)
- **Light Mode (`prefers-color-scheme: light`)**:
  - Selected Row: `box-shadow`: `"none"`
  - Hovered Row: `box-shadow`: `"none"`
  - Unhovered Rows: `box-shadow`: `"none"`
  - Light mode shows no shadow change whatsoever.
  - Screenshot: [`docs/screenshots/step-05j-sidebar-light-mode-no-shadow.png`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/docs/screenshots/step-05j-sidebar-light-mode-no-shadow.png)

### 2. Scroll Isolation Verification
Injected 50 dummy articles into the sidebar and 50 dummy paragraphs into `<main>` to deeply overflow both panes:
- **Outer Window / Document Lock**:
  - `window.innerHeight`: `674px`
  - `document.documentElement.scrollHeight`: `674px`
  - `document.body.scrollHeight`: `674px`
  - `document.body` computed overflow: `hidden`
  - Executed `window.scrollTo(0, 500)`: `window.scrollY` remained `0`, `document.documentElement.scrollTop` remained `0`, `document.body.scrollTop` remained `0`. No outer scrollbar appeared.
- **Independent Pane Scrolling**:
  - Sidebar list container: `scrollHeight = 3647px`, `clientHeight = 618px`, scrolled independently to `scrollTop = 200px` (`overflowY = auto`).
  - Reader main pane: `scrollHeight = 3592px`, `clientHeight = 674px`, scrolled independently to `scrollTop = 350.4px` (`overflowY = auto`).
