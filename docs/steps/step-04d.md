# Step 4D: CLI Entrypoints

This step adds the real-world executable entrypoints that run the ingestion and maintenance tasks against a real network and database. 

## Additions
- **`src/cli/fetch-digests.ts`**: The main ingestion CLI script. It initializes a SQLite database connection (via `createDb`), connects to Gmail via `ImapflowClient`, and invokes `fetchDigests`. Prints out a clear, human-readable summary of processed emails and articles.
- **`src/cli/purge-old-articles.ts`**: Maintenance script to purge unsaved articles older than 90 days. Built with a `--dry-run` flag that uses a `count()` query to safely preview changes without data loss.
- **`src/cli/inspect-db.ts`**: Debugging and inspection tool that prints the total count of articles and processed emails, summarizes fetch statuses, and outputs the top 5 most recently ingested articles.

## Documentation Updates
- Updated `package.json` to include `"fetch-digests"`, `"purge-old-articles"`, and `"inspect-db"`.
- Updated `.env.example` to detail the newly available CLI commands.
- Updated `docs/architecture.md` and `AGENTS.md` to reflect the CLI tools and their usages.

These scripts run synchronously from the terminal (or cron) and do not include automated tests as they are merely thin glue around already-tested core logic (`fetchDigests`, `purgeOldArticles`, etc.).

## Real-world validation
During the first live run, an initial `fetch-digests` run was interrupted (Ctrl+C) partway through, having already processed 9 of 15 found digest emails. A second run correctly skipped those 9 (verified via `processedEmails` timestamps) and completed the remaining 6. The final state was 193 distinct articles from 225 possible (15 emails x 15 articles), with the 32-article gap fully explained by legitimate overlap across digests and confirmed via a URL-uniqueness check. There were no duplicates and no data loss. This is real evidence that the idempotency and upsert design work under actual interrupted/resumed conditions, not just in tests.
