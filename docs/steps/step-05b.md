# Step 5B: Master-Detail Reader Layout with Dummy Data

## Objective
Build the real master-detail reading layout against dummy data without involving a database or Server Actions, establishing the desktop-first structural foundation.

## Implementation Details
1. **Dependencies Added**:
   - `react-markdown`: For rendering the markdown content of articles safely.
   - `remark-gfm`: For GitHub Flavored Markdown support (tables, strikethrough, tasklists).
2. **Dummy Data created**:
   - `src/lib/dummy-articles.ts` includes an array of 10 dummy articles simulating the `Article` schema.
   - Varied publications and reading lengths to accurately test layout truncations and visual hierarchy.
3. **Master-Detail Layout**:
   - Utilized a route group `src/app/(reader)` to avoid interference with the style guide.
   - `src/app/(reader)/layout.tsx`: Persistent left sidebar (320px-360px) utilizing `ScrollArea`, alongside a main flexible reader pane.
   - `src/app/(reader)/page.tsx`: Initial unselected state at the root URL displaying a subtle selection prompt.
   - `src/app/(reader)/sidebar.tsx`: The sidebar lists all dummy articles via Next.js `Link` components. Hover states and selection highlighting match requirements by dynamically applying token-based background colors (not hardcoded), and text color differentiates active/inactive states.
4. **Article Viewer (`/a/[id]`)**:
   - `src/app/(reader)/a/[id]/page.tsx` renders the full article utilizing `react-markdown`.
   - Adheres to typography styles strictly: `Source Serif 4` for title and body, `Inter` for metadata.
   - Constrained reader width to `max-w-[65ch]` to maximize legibility.
   - Handled non-existent article IDs with an explicit "not found" view.
5. **Quality Checks**:
   - `pnpm check` ensures everything conforms to strict typechecking and linting standards.

## Next Steps
Integrate with SQLite to transition this UI from dummy static objects to real, persistently stored and fetched articles. Mobile responsiveness will follow after.
