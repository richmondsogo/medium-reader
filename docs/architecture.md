# Architecture Overview

`medium-reader` is a private, single-user application that ingests Medium Daily Digest emails via IMAP, fetches article content, cleans and converts it to markdown, stores it in SQLite, and serves it through a distraction-free reader UI.

## System Diagram

```
+-------------------------------------------------------------------+
| Gmail (IMAP Inbox)                                                |
+---------------------------------+---------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
| Ingestion Pipeline (CLI cron)                                     |
|  - IMAP Fetcher & MIME Parser                                     |
|  - Fetcher Chain: Direct -> Freedium -> Mirror -> Email Snippet   |
|  - Mozilla Readability + Turndown (HTML to Markdown)              |
+---------------------------------+---------------------------------+
                                  |
                                  v (writes)
+-------------------------------------------------------------------+
| SQLite Database (WAL mode, FTS5 full-text search)                 |
| Managed via Drizzle ORM                                           |
+---------------------------------+---------------------------------+
                                  ^
                                  | (queries & mutations)
+---------------------------------+---------------------------------+
| Next.js App Router (Single-package Node.js runtime)               |
|  - React Server Components (direct DB reads)                      |
|  - Server Actions (direct DB writes / status updates)             |
|  - Tailwind CSS + shadcn/ui                                       |
+---------------------------------+---------------------------------+
                                  |
                                  v (Private Network / Tailscale)
+-----------------------------------+
| Reader Client (Clean Reading UI)  |
+-----------------------------------+
```

## Component Architecture

1. **Ingest CLI (`src/ingest` and `src/cli`)**:
   Runs via CLI commands (which can be scheduled as cron jobs):
   - `pnpm fetch-digests`: Polls Medium Daily Digest emails via IMAP, parses digest HTML to extract article URLs, runs them through a resilient fallback fetcher chain, converts article HTML into markdown using Mozilla Readability, and stores them idempotently in the database.
   - `pnpm purge-old-articles`: Cleans up the database by deleting un-saved articles older than 90 days.
   - `pnpm inspect-db`: Provides quick, read-only visibility into database statistics and recent ingests.

2. **Database & Server Layer (`src/server`)**:
   Encapsulates all SQLite database operations with Drizzle ORM. Enables Write-Ahead Logging (WAL) for concurrent single-writer/multi-reader access and FTS5 virtual tables for full-text search.

3. **Web Application (`src/app`, `src/components`)**:
   Next.js App Router application without an intermediate REST/GraphQL API. Server Components render articles directly from the database; Server Actions handle mutations (e.g., mark as read, save, purge).

4. **Security & Deployment**:
   Deployed strictly on a private network (e.g. Tailscale) with no public exposure and no external auth layer needed. Markdown rendering disallows raw HTML to prevent injection vulnerabilities.
