# Step 06a: Wire Real Database Queries via Server Components

## Summary
Executed Step 06a of `medium-reader`: replaced dummy article data with real database queries via Next.js Server Components.
- The sidebar now streams 193 ingested articles directly from SQLite ordered by `ingestedAt DESC`.
- The reader pane now fetches real article markdown by ID, handling non-existent articles with a clean fallback state.
- Completely removed `src/lib/dummy-articles.ts` with zero lingering references across the codebase.

---

## Changes Made

### 1. Database Query Functions
- **[`src/db/articles.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/db/articles.ts)**:
  - Added `listArticles(db: DbClient)`: returns articles ordered by `desc(articles.ingestedAt)`, selecting only the 7 sidebar fields (`id`, `title`, `authorName`, `publicationName`, `readingTimeMinutes`, `isRead`, `isSaved`) and omitting `contentMarkdown` to avoid memory overhead for long article lists.
  - Exported `SidebarArticle` type derived directly from `ReturnType<typeof listArticles>[number]`.
  - Added `getArticleById(db: DbClient, id: number)`: returns the complete row including `contentMarkdown`, or `undefined` if not found.
- **[`src/db/articles.test.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/db/articles.test.ts)**:
  - Added unit test suite for `listArticles`: verifies descending `ingestedAt` sort order, verifies all 7 sidebar fields, and confirms `contentMarkdown` is not included.
  - Added unit test suite for `getArticleById`: verifies retrieval of full row with `contentMarkdown` when present, and verifies `undefined` return when absent.

### 2. UI Server Component Wiring
- **[`src/app/(reader)/layout.tsx`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/app/(reader)/layout.tsx)**:
  - Converted `ReaderLayout` into an `async` Server Component.
  - Initialized database via `createDb(env.DATABASE_PATH)` and fetched real articles using `listArticles(db)`.
  - Passed `articles` into `ReaderShell`.
- **[`src/app/(reader)/reader-shell.tsx`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/app/(reader)/reader-shell.tsx)**:
  - Updated props to accept `articles: SidebarArticle[]`.
  - Passed `articles` into `<Sidebar articles={articles} className={...} />`.
- **[`src/app/(reader)/sidebar.tsx`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/app/(reader)/sidebar.tsx)**:
  - Updated props to accept `articles: SidebarArticle[]`.
  - Removed import of `dummyArticles`.
  - Preserved `"use client"` directive and active selection highlighting via `usePathname()`.
- **[`src/app/(reader)/a/[id]/page.tsx`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/app/(reader)/a/[id]/page.tsx)**:
  - Kept as an `async` Server Component.
  - Removed import of `dummyArticles`.
  - Fetched article from database using `getArticleById(db, id)`.
  - Handled `isNaN(id)` and missing rows by rendering the clean "Article not found" fallback UI.
  - Rendered real article `title`, metadata byline (`authorName`, `publicationName`, `readingTimeMinutes`), and `contentMarkdown` using `ReactMarkdown` and `@/components/ui/typography` components.

### 3. Cleanup
- **[`src/lib/dummy-articles.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/lib/dummy-articles.ts)**:
  - Deleted file. Confirmed zero imports or occurrences remain across the codebase.

---

## Verification & QA Matrix

### Test Suite (`pnpm check`)
- Ran `pnpm check` (ESLint, TypeScript `tsc --noEmit`, Vitest) after each checkpoint:
  - **ESLint**: passed with zero warnings/errors.
  - **TypeScript**: passed cleanly with zero type errors.
  - **Vitest**: all 13 test files passed (55/55 tests passed).

### Live Browser Verification
Inspected running Next.js application at `http://localhost:3000/`:
1. **Sidebar Articles on Root (`/`)**:
   - Verified that the sidebar displays all 193 articles from the SQLite database.
   - Spot-checked the first 5 articles against `pnpm inspect-db` output:
     1. *"One Habit Separates Self-Aware People from Everyone Else"* (Change Your Mind Change Your Life · 5 min)
     2. *“Stop Reading the Code.” AI Is Starting a Fight Over What Software Engineers Are Actually For.* (JavaScript in Plain English · 14 min)
     3. *Why we switched to the GCP Secret Manager API in Spring Boot and What we learned?* (Stackademic · 3 min)
     4. *My Grandmother Waited Until Her Last Breath to Say Something Terrible* (The 221 · 6 min)
     5. *Rockstar Games’ Development Saga is Odyssean* (The Ugly Monster · 32 min)
2. **Article Reader Pane (`/a/193`)**:
   - Confirmed full article loads with real title, publication byline, reading time, and rich markdown.
   - Confirmed markdown elements rendered: H1, H3 headings (*"The Old Contract Between Engineers and Code Was Simple"*, etc.), blockquotes, and styled paragraphs.
3. **Article Reader Pane (`/a/191`)**:
   - Confirmed technical article loads with headings, links, and code block formatting.
4. **Not-Found Fallback (`/a/99999`)**:
   - Confirmed invalid / non-existent article IDs display the "Article not found" state without crashing.

### Visual Artifacts
- [`docs/screenshots/step-06a-sidebar-root.png`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/docs/screenshots/step-06a-sidebar-root.png)
- [`docs/screenshots/step-06a-article-193.png`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/docs/screenshots/step-06a-article-193.png)
- [`docs/screenshots/step-06a-not-found.png`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/docs/screenshots/step-06a-not-found.png)
