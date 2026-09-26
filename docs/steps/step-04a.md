# Step 4A: Database Schema and Data Access

In this step, we built the foundation for the local SQLite database used to store articles fetched from emails. We defined the database schema using Drizzle ORM and created a robust set of repository functions to manage the data.

## What was built:

- **Schema definition**: Created the `articles` table in `src/db/schema.ts` to store parsed article data, including URL, title, Markdown content, reading time, and metadata. Added flags for tracking `isRead` and `isSaved` status, along with `fetchStatus` to track the quality of the content retrieved.
- **Database client**: Set up `better-sqlite3` and `drizzle-orm` in `src/db/client.ts` to create and configure the SQLite connection with Write-Ahead Logging (WAL) for better concurrency. Added automated migrations on startup.
- **Repository functions**: Implemented functions in `src/db/articles.ts` to upsert articles (`upsertArticle`) with logic to never downgrade the `fetchStatus`, update read/saved states (`setArticleRead`, `setArticleSaved`), and `purgeOldArticles` to remove old, unread, and unsaved articles.
- **Testing**: Added tests (`src/db/articles.test.ts`) to verify the ranking of fetch statuses, upsert behavior (insert, upgrade, unchanged), read/saved state toggles, and the purge logic to ensure only stale, unsaved articles are removed.
