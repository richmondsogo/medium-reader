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

1. **Ingest CLI (`src/ingest`)**:
   Runs as an idempotent cron job. Polls Medium Daily Digest emails via IMAP, parses digest HTML to extract article URLs, runs them through a resilient fallback fetcher chain, and converts article HTML into markdown using Mozilla Readability.

2. **Database & Server Layer (`src/server`)**:
   Encapsulates all SQLite database operations with Drizzle ORM. Enables Write-Ahead Logging (WAL) for concurrent single-writer/multi-reader access and FTS5 virtual tables for full-text search.

3. **Web Application (`src/app`, `src/components`)**:
   Next.js App Router application without an intermediate REST/GraphQL API. Server Components render articles directly from the database; Server Actions handle mutations (e.g., mark as read, save, purge).

4. **Security & Deployment**:
   Deployed strictly on a private network (e.g. Tailscale) with no public exposure and no external auth layer needed. Markdown rendering disallows raw HTML to prevent injection vulnerabilities.

## Maintenance Operations

- **Purge Old Articles CLI (`src/cli/purge-old-articles.ts`)**:
  Safe-by-default maintenance script. Running it without flags acts as a dry run, printing how many old, unsaved articles would be deleted. It requires the `--confirm` flag to actually perform the deletion. By construction, both the dry-run count and the actual deletion use the exact same predicate function.
