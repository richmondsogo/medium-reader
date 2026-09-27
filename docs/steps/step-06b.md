# Step 06b: Reader Refinements & Image Diagnosis

## Summary
Executed Step 06b of `medium-reader`:
1. **Link to Original Article**: Added an `ExternalLink` icon in the reader pane byline row (`Author in Publication · N min read`), wrapped in an `<a>` tag targeting the real Medium article URL in a new tab (`target="_blank" rel="noopener noreferrer"`). Sized at 14px (`h-3.5 w-3.5`) to match surrounding `Meta` typography.
2. **Mark-as-Read on View & Dimmed Sidebar Title**:
   - Added Server Action `markArticleRead(id: number)` in `src/server/actions.ts` calling `setArticleRead(db, id, true)` and revalidating layout cache via `revalidatePath("/", "layout")`.
   - Added client component `MarkReadOnView` in `src/app/(reader)/a/[id]/mark-read-on-view.tsx` executing `markArticleRead` on mount only when `!isRead` to avoid redundant writes.
   - Updated `ListItemTitle` and `ListItemTitleSelected` in `src/components/ui/typography.tsx` to handle `isRead?: boolean`, dimming read items to `text-muted-foreground` while unread items remain `text-foreground`, independent of the selected semibold state.
   - Wired `isRead` into `sidebar.tsx`.
3. **Image Handling Diagnosis**:
   - Created and executed `scripts/inspect-article-images.ts` across the database of 193 articles.
   - Diagnosed why images may fail to render: 0 placeholder stubs exist, but 98.8% of image URLs point to `medium.com/img/medium/...` (rewritten by Freedium mirrors), which return HTTP 403 / 404 hotlink errors. In contrast, direct Medium CDN links (`miro.medium.com`) return HTTP 200 OK.
   - Documented findings in `docs/notes/image-handling-diagnosis.md` with zero modifications to extraction or rendering code.

---

## Changes Made

### 1. Link to Original Article
- **[`src/app/(reader)/a/[id]/page.tsx`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/app/(reader)/a/[id]/page.tsx)**:
  - Imported `ExternalLink` from `lucide-react` and `Meta` from `@/components/ui/typography`.
  - Replaced unmanaged text styling with `<Meta as="div" className="flex items-center gap-1.5">`.
  - Appended an `<a>` tag immediately following the reading time pointing to `article.url` with `target="_blank" rel="noopener noreferrer"`.
  - Nested `<ExternalLink className="h-3.5 w-3.5" />` with accessible `aria-label` and `title`.

### 2. Mark-as-Read on View & Dimmed Sidebar Title
- **[`src/server/actions.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/server/actions.ts)**:
  - Added `"use server"` module with `markArticleRead(id: number)`.
  - Validated ID with `z.number().int().positive()`.
  - Called `setArticleRead(db, parsedId, true)` and `revalidatePath("/", "layout")`.
- **[`src/server/actions.test.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/server/actions.test.ts)**:
  - Added unit test suite verifying `setArticleRead` execution, layout revalidation, and zod ID validation.
- **[`src/app/(reader)/a/[id]/mark-read-on-view.tsx`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/app/(reader)/a/[id]/mark-read-on-view.tsx)**:
  - Created client component using `useEffect` on mount to invoke `markArticleRead(id)` only when `!isRead`.
- **[`src/components/ui/typography.tsx`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/components/ui/typography.tsx)**:
  - Added `isRead?: boolean` to `ListItemTitleProps`.
  - Applied `isRead ? "text-muted-foreground" : "text-foreground"` in `ListItemTitle` and `ListItemTitleSelected`.
  - Ensured selected (`font-semibold`) and read (`text-muted-foreground`) combine seamlessly.
- **[`src/components/ui/typography.test.tsx`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/components/ui/typography.test.tsx)**:
  - Added unit test suite validating default `text-foreground`, `isRead` `text-muted-foreground`, and combination with `ListItemTitleSelected`.
- **[`src/app/(reader)/sidebar.tsx`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/app/(reader)/sidebar.tsx)**:
  - Passed `isRead={article.isRead}` to `TitleComponent`.
  - Removed hardcoded `text-foreground` override so `typography.tsx` controls title color.

### 3. Image Handling Diagnosis
- **[`scripts/inspect-article-images.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/scripts/inspect-article-images.ts)**:
  - Created standalone diagnostic script inspecting `thumbnailUrl`, markdown `![` syntax, placeholder heuristics (`data:image`, `1x1`, `blank`, base64), and live HTTP fetching.
- **[`docs/notes/image-handling-diagnosis.md`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/docs/notes/image-handling-diagnosis.md)**:
  - Generated comprehensive diagnostic findings report.

---

## Verification & QA Matrix

### Test Suite (`pnpm check`)
- Ran `pnpm check` (ESLint, TypeScript `tsc --noEmit`, Vitest):
  - **ESLint**: passed with zero warnings or errors.
  - **TypeScript**: passed cleanly with zero type errors.
  - **Vitest**: all 15 test files passed (60/60 tests passed, including new `actions.test.ts` and `typography.test.tsx`).

### Live Browser & Network Verification
1. **Link to Original Article**:
   - Inspected `http://localhost:3000/a/193`: verified `<a>` tag with `href="https://medium.com/@ruchilove/one-habit-separates-self-aware-people-from-everyone-else-8e66ec395f9d"`, `target="_blank"`, `rel="noopener noreferrer"`, and `lucide-external-link` SVG.
2. **Mark-as-Read on View**:
   - Navigated to unread article 193: verified `isRead` updated to `true` in SQLite.
   - Navigated back to `/`: verified the sidebar title for article 193 was immediately updated to `text-muted-foreground` (dimmed) without requiring a manual page refresh.
   - Navigated to unread article 192: verified it transitioned to dimmed, with unread articles (e.g. 191) remaining bright `text-foreground`.
   - Verified that visiting an already-read article does not re-invoke `markArticleRead`.
3. **Image Diagnostic Run**:
   - Executed `scripts/inspect-article-images.ts`: completed with exit code 0.

### Visual Artifacts
- [`docs/screenshots/step-06b-article-193-byline.png`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/docs/screenshots/step-06b-article-193-byline.png)
- [`docs/screenshots/step-06b-sidebar-dimmed-root.png`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/docs/screenshots/step-06b-sidebar-dimmed-root.png)
- [`docs/screenshots/step-06b-sidebar-dimmed-multi.png`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/docs/screenshots/step-06b-sidebar-dimmed-multi.png)

---

## Commit Checkpoints
1. `feat: link byline to original article` (commit `146f880`)
2. `feat: mark articles read on view, dim in sidebar` (commit `6eb0c8d`)
3. `docs: step-06b and image handling diagnosis` (final step commit)
