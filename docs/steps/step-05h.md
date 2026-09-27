# Step 05h: Rounded Sidebar Hover State & Wider Heading-to-Subtext Gap

## Summary
Executed Step 05h implementing two sidebar visual refinements:
1. **Rounded Inset Highlight**: Converted the sidebar row highlight from full-bleed to an inset rounded rectangle by adding horizontal margin (`mx-2`) and rounded corners (`rounded-lg`) to each row's `Link` element while dropping `w-full` (avoiding right-side margin overflow). Ensured no left accent borders (`border-l-2`) are present, as selection is clearly distinguishable by background (`bg-muted/60`) and font weight (`font-semibold`), meeting accessibility criteria without color alone.
2. **Standard Heading-to-Subtext Gap**: Increased the vertical spacing between `ListItemTitle` and `Meta` in the sidebar to `mb-2.5` (10px on Tailwind's 4px scale), and routed the row text through the `@/components/ui/typography` components (`ListItemTitle`, `ListItemTitleSelected`, and `Meta`). Documented `mb-2.5` in `DESIGN.md` as the application's standard heading-to-subtext gap.

---

## Changes Made

### 1. Sidebar Row Highlight & Spacing Refinements
- **`src/app/(reader)/sidebar.tsx`**:
  - Imported `ListItemTitle`, `ListItemTitleSelected`, and `Meta` from `@/components/ui/typography`.
  - Updated `Link` classes to `block mx-2 rounded-lg px-4 py-3 transition-colors ${isSelected ? "bg-muted/60" : "hover:bg-muted/40"}`.
  - Dynamically rendered `TitleComponent` (`ListItemTitleSelected` when `isSelected` is true, otherwise `ListItemTitle`) with `mb-2.5`.
  - Wrapped article publication, author, and reading time metadata in `<Meta>`.

### 2. Design System Documentation
- **`DESIGN.md`**:
  - Documented the standard heading-to-subtext gap as `mb-2.5` (10px on Tailwind's 4px scale) under **Layout & hierarchy**.
  - Documented the inset rounded highlight (`mx-2 rounded-lg`), background, and font-weight differentiation under **Motion & interaction**.

---

## Verification & QA Matrix

### Live Browser Inspections (Chrome DevTools MCP)
Inspected live computed properties and bounding rect geometry on `http://localhost:3000/a/2`:
- **Highlight Inset Geometry**:
  - `computedBorderRadius`: `10px` (`rounded-lg` / `var(--radius)`)
  - `computedMarginLeft`: `8px`, `computedMarginRight`: `8px` (`mx-2`)
  - `asideRect.left`: `0px`, `linkRect.left`: `16px` (8px list padding + 8px link margin; inset from left edge)
  - `asideRect.right`: `360px`, `linkRect.right`: `332.8px` (inset by 27.2px from sidebar border)
  - Confirmed highlight is cleanly inset and does not touch left/right edges of sidebar.
- **Accent Border Absence**:
  - `computedBorderLeftWidth`: `0px` across both selected and hover states.
- **Selection & Hover Differentiation**:
  - Selected item (Row 1): `backgroundColor = oklab(0.268999 -0.0000026077 0.00000628829 / 0.6)` (`bg-muted/60`), title `fontWeight = 600` (`font-semibold`).
  - Hovered item (Row 0): `backgroundColor = oklab(0.268999 -0.0000026077 0.00000628829 / 0.4)` (`hover:bg-muted/40`), title `fontWeight = 500` (`font-medium`).
- **Heading-to-Subtext Gap**:
  - `title.marginBottom`: `10px` (`mb-2.5`)
  - Measured vertical gap (`meta.top - title.bottom`): exactly `10px`.
- **Viewport Screenshot Review**:
  - Captured viewport screenshot confirming rounded highlight corners, clear inset, and comfortable vertical separation between article titles and metadata.

---

## Test Suite Status
- `pnpm check` ran cleanly with zero errors:
  - ESLint: passed
  - TypeScript (`tsc --noEmit`): passed
  - Vitest: 13/13 test files passed, 52/52 tests passed
