# Step 06l: App Identity and Route Naming

## Summary

Completed **Step 06l** for `medium-reader`:
1. **Route Renaming**: Renamed the article route from `/a/[id]` to `/read/[id]` using `git mv`. Extracted path generation and validation into `src/lib/routes.ts` (`articlePath` and `isArticlePath`).
2. **Regression Prevention**: Colocated unit tests in `src/lib/routes.test.ts` and created `src/lib/routes.guard.test.ts` to ensure no non-test code under `src/app` and `src/components` references legacy `/a/` routes. Proved the guard with a temporary failing file.
3. **App Identity ("Daybreak")**: Added `APP_NAME = "Daybreak"` in `src/lib/brand.ts` and created a brand `Wordmark` typography variant (`font-sans text-[17px] font-semibold tracking-tight leading-none lowercase text-foreground`). Replaced the plain "Digest" text in the sidebar header with a text-only Link to `/` rendering `<Wordmark>{APP_NAME}</Wordmark>`.
4. **Header Alignment**: Measured `getBoundingClientRect().x` in DevTools for the wordmark and the article title rows below; aligned both at exactly `x: 32px`.
5. **Page Metadata**: Configured root title template `{ default: APP_NAME, template: "%s · " + APP_NAME }` and description in `src/app/layout.tsx`. Added `generateMetadata` in `src/app/(reader)/read/[id]/page.tsx` returning `{ title: article?.title ?? "Article not found" }`.
6. **Dual-Theme SVG Favicon**: Created `src/app/icon.svg` (viewBox `"0 0 32 32"`, all coordinates and dimensions even integers) with `@media (prefers-color-scheme: dark)` color swapping. Deleted `src/app/favicon.ico`. Added `src/lib/identity.test.ts`. Verified crispness and separation of the half-circle and baseline bar at 16px across light and dark backdrops.
7. **Strict UI Constraints**: Confirmed zero icons, logos, or marks added anywhere in reader UI.
8. **Living Docs**: Updated `DESIGN.md` with an Identity section and `AGENTS.md` with route helper and brand conventions.

---

## 1. Route Enumeration (Pre-Change Discovery)

A full search of `src`, `scripts`, and living docs before modification showed:

| File:Line | Content / Context | Classification | Action |
|---|---|---|---|
| `src/app/(reader)/a` (Directory) | Directory containing article route `[id]/page.tsx` and `[id]/mark-read-on-view.tsx` | **Route folder** | Renamed to `src/app/(reader)/read` via `git mv` |
| `src/app/(reader)/sidebar.tsx:40` | `const href = \`/a/${article.id}\`;` | **Route reference** | Replaced with `articlePath(article.id)` |
| `src/app/(reader)/reader-shell.tsx:16` | `const isArticle = pathname.startsWith("/a/");` | **Route reference** | Replaced with `isArticlePath(pathname)` |
| `src/app/(reader)/a/[id]/page.tsx:88` | `</a>` | **Unrelated** | HTML closing tag |
| `src/ingest/extractArticleContent.ts:21` | `// 2. Strip elements whose text content matches /Freedium beta/i` | **Unrelated** | Regex comment |
| `src/ingest/extractArticleContent.ts:26, 29` | `/Freedium beta/i` | **Unrelated** | Regex pattern |
| `src/ingest/extractArticleContent.test.ts:29` | `expect(result.contentMarkdown).not.toMatch(/Freedium beta/i);` | **Unrelated** | Regex test |
| `src/ingest/httpFetch.ts:12` | `... Safari/537.36` | **Unrelated** | User-Agent string |
| `src/lib/env.ts:4` | `DATABASE_PATH: z.string().default("./data/medium-reader.db"),` | **Unrelated** | Path string |
| `src/lib/env.test.ts:8, 14, 17` | `expect(...).toBe("./data/medium-reader.db");` | **Unrelated** | Test fixtures |
| `src/lib/ingest-env.test.ts:11` | `expect(config.DATABASE_PATH).toBe("./data/medium-reader.db");` | **Unrelated** | Test fixture |

---

## 2. Checkpoint 1: Route Rename (`/a/[id]` -> `/read/[id]`)

### Implementation
- Renamed parent directory:
  ```bash
  git mv "src/app/(reader)/a" "src/app/(reader)/read"
  ```
- Created [`src/lib/routes.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/lib/routes.ts):
  - `articlePath(id: number | string): string` returns `/read/${id}`.
  - `isArticlePath(pathname: string): boolean` tests against `/^\/read\/[^/]+\/?$/`.
- Updated [`src/app/(reader)/sidebar.tsx`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/app/(reader)/sidebar.tsx) to use `articlePath(article.id)`.
- Updated [`src/app/(reader)/reader-shell.tsx`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/app/(reader)/reader-shell.tsx) to use `isArticlePath(pathname)`.
- Created [`src/lib/routes.test.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/lib/routes.test.ts) covering id formatting, trailing slashes, and prefix collisions (`/`, `/read`, `/read/`, `/a/12`, `/reader`).
- Created [`src/lib/routes.guard.test.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/lib/routes.guard.test.ts) scanning all non-test code under `src/app` and `src/components` for `/["'`]\/a\/|\/a\/\${/`.

### Proving the Guard
1. Injected temporary file `src/components/zz-plant.tsx` containing `export const x = "/a/1";`.
2. Executed test and captured failure:
   ```
   FAIL  src/lib/routes.guard.test.ts > routes - guard against legacy /a/ routes
   AssertionError: Found legacy route pattern /a/ in files: src\components\zz-plant.tsx: expected [ 'src\\components\\zz-plant.tsx' ] to deeply equal []
   ```
3. Removed `src/components/zz-plant.tsx`.
4. Re-executed test and confirmed passing:
   ```
   ✓ src/lib/routes.guard.test.ts (1 test) 19ms
   ```

### Checkpoint 1 Verification Evidence
- Cleared `.next` cache and executed `pnpm build`:
  ```
  Route (app)
  ┌ ƒ /
  ├ ○ /_not-found
  ├ ƒ /read/[id]
  └ ○ /style-guide
  ```
- DevTools 1280px Desktop Navigation:
  - Clicked sidebar link `/read/193`: navigated to `http://localhost:3000/read/193`.
  - Row selected state: `linkClasses: "... bg-muted/60 shadow-elevated"`, `isSelected: true`.
- Direct route loading:
  - `http://localhost:3000/read/99`: HTTP 200, article "Maybe the Solution to AI Is More Human Than We Think" rendered.
  - `http://localhost:3000/a/99`: HTTP 404, "This page could not be found." (No redirect, expected 404).
- Mobile 375px Navigation:
  - At `/`: sidebar visible (`sidebarDisplay: "flex"`), reader hidden (`mainDisplay: "none"`).
  - Clicked unread article `/read/185`: navigated to `/read/185`, sidebar hidden (`sidebarDisplay: "none"`), reader visible (`mainDisplay: "flex"`), Back button visible (`backLinkVisible: "inline-flex"`).
  - Clicked Back: returned to `/`, article #185 title dimmed in sidebar (`classesAfter: "... text-muted-foreground ..."`).
- **Commit 1**: `refactor: move article route from /a/[id] to /read/[id]` (`18316d5`).

---

## 3. Checkpoint 2: Identity (Wordmark, Metadata, Favicon)

### Implementation
- Created [`src/lib/brand.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/lib/brand.ts): `export const APP_NAME = "Daybreak";`.
- Updated [`src/components/ui/typography.tsx`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/components/ui/typography.tsx):
  - Added variant `"brand": "font-sans text-[17px] font-semibold tracking-tight leading-none lowercase text-foreground"`.
  - Exported `<Wordmark>` component.
  - Added unit test in [`src/components/ui/typography.test.tsx`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/components/ui/typography.test.tsx).
- Updated [`src/app/(reader)/sidebar.tsx`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/app/(reader)/sidebar.tsx):
  - Replaced plain "Digest" text with:
    ```tsx
    <div className="sticky top-0 z-20 flex h-14 items-center px-8 border-b bg-background shrink-0">
      <Link
        href="/"
        className="rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground"
      >
        <Wordmark>{APP_NAME}</Wordmark>
      </Link>
    </div>
    ```
- Updated [`src/app/layout.tsx`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/app/layout.tsx):
  - Set `title: { default: APP_NAME, template: "%s · " + APP_NAME }`.
  - Set `description: "A calm reader for your daily Medium digest."`.
- Updated [`src/app/(reader)/read/[id]/page.tsx`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/app/(reader)/read/[id]/page.tsx):
  - Added `generateMetadata` fetching article title by id from database, returning `{ title: article?.title ?? "Article not found" }`.
- Created [`src/app/icon.svg`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/app/icon.svg) with even-integer pixel-snapped geometry and dual-theme media query styling:
  ```xml
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
    <style>
      .bg { fill: #141414; }
      .fg { fill: #fafafa; }
      @media (prefers-color-scheme: dark) {
        .bg { fill: #fafafa; }
        .fg { fill: #141414; }
      }
    </style>
    <rect class="bg" width="32" height="32" rx="8"/>
    <path class="fg" d="M8 18a8 8 0 0 1 16 0Z"/>
    <rect class="fg" x="6" y="20" width="20" height="2"/>
  </svg>
  ```
- Removed default `src/app/favicon.ico`.
- Created [`src/lib/identity.test.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/lib/identity.test.ts) asserting `icon.svg` exists with valid viewBox and media query, and asserting `favicon.ico` does not exist.

### Checkpoint 2 Verification Evidence
- **Header Alignment (`getBoundingClientRect().x`)**:
  - `wordmarkX`: `32px`
  - `firstTitleX`: `32px`
  - `difference`: `0px`
- **Document Titles**:
  - `/`: `"Daybreak"`
  - `/read/99`: `"Maybe the Solution to AI Is More Human Than We Think · Daybreak"`
  - `/read/99999`: `"Article not found · Daybreak"`
- **Icon Network & DOM**:
  - `<head>` contains `<link rel="icon" href="/icon.svg?icon.1b7hdajijwqmo.svg" type="image/svg+xml" sizes="any">`.
  - `/icon.svg`: HTTP 200, `content-type: image/svg+xml`.
  - `/favicon.ico`: HTTP 404 Not Found.
- **Icon Rendering at Tab Sizes**:
  - Injected 16px, 32px, and 64px icon instances onto both light and dark backdrops.
  - Inspected at devicePixelRatio 1 and 2:
    - At 16px, the rising sun half-circle and the horizontal horizon bar land on integer pixel boundaries, remaining sharp and distinctly separated by an unbroken 1px gap.
    - Dual-theme color switching adapts automatically (`#141414` background in light mode, `#fafafa` background in dark mode).
- **Hard UI Constraint**:
  - Grep across `src/app/(reader)` and `src/components` confirmed 0 `<svg>`, 0 `<img>`, and 0 icon components added to the reader UI.
- Captured screenshots:
  - Light mode header: [`docs/screenshots/step-06l-header-light.png`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/docs/screenshots/step-06l-header-light.png)
  - Dark mode header: [`docs/screenshots/step-06l-header-dark.png`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/docs/screenshots/step-06l-header-dark.png)
  - 2x device scale: [`docs/screenshots/step-06l-header-2x.png`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/docs/screenshots/step-06l-header-2x.png)
  - Scale 1 icon test: [`docs/screenshots/step-06l-icon-test-scale1.png`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/docs/screenshots/step-06l-icon-test-scale1.png)
  - Scale 2 icon test: [`docs/screenshots/step-06l-icon-test-scale2.png`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/docs/screenshots/step-06l-icon-test-scale2.png)
  - Light mode icon test: [`docs/screenshots/step-06l-icon-test-light-mode.png`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/docs/screenshots/step-06l-icon-test-light-mode.png)
- **Commit 2**: `feat: add Daybreak wordmark, page titles and favicon` (`fc576a3`).

---

## 4. Checkpoint 3: Documentation and Cleanup

### Implementation
- Updated [`DESIGN.md`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/DESIGN.md) adding `## Identity` section describing app naming, text-only wordmark, and favicon exception.
- Updated [`AGENTS.md`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/AGENTS.md) Conventions section with rules regarding `articlePath()` and `APP_NAME`.
- Authored [`docs/steps/step-06l.md`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/docs/steps/step-06l.md).
- Cleaned up database test copy (`data/idtest.db*`) and removed `$env:DATABASE_PATH`.
