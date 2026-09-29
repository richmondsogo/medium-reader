# Daybreak (medium-reader)

Daybreak is a private reader for Medium Daily Digest emails. A digest email is a daily summary email sent by Medium that highlights recommended articles. The application provides a clean reading experience with a local ninety-day archive. This software is a personal tool rather than a public product. It stays private by design to protect personal data and paywalled content without requiring a login system.

## What It Does

- Fetches digest emails from Gmail using the Internet Message Access Protocol (IMAP).
- Extracts and cleans article text from email links.
- Handles paywalled articles by fetching full text through Freedium mirrors. Freedium is a proxy service that renders paywalled Medium articles.
- Fixes broken image links and retries failed image downloads.
- Strips unwanted Medium web chrome and user interface elements.
- Stores articles locally in a SQLite database using Write-Ahead Logging (WAL).
- Serves a fast web reading interface built with Next.js and Tailwind CSS.

## Quick Start

### Prerequisites

- Node.js version 20.9.0 or later.
- pnpm package manager version 10 or later.
- A Gmail account receiving Medium Daily Digest emails.

### Setup Instructions

1. Clone the repository to your local machine:

```bash
git clone https://github.com/richmondsogo/medium-reader.git
```

2. Change into the project directory:

```bash
cd medium-reader
```

3. Install project dependencies:

```bash
pnpm install
```

4. Create your local environment file from the example template:

```bash
cp .env.example .env
```

5. Generate a Gmail App Password for IMAP access:
   - Open your Google Account security settings.
   - Navigate to **2-Step Verification**.
   - Scroll to the bottom and select **App passwords**.
   - Generate a new app password named `medium-reader`.
   - Google displays a 16-character passcode.

6. Configure required credentials in `.env`:
   - Set `GMAIL_USER` to your Gmail address.
   - Set `GMAIL_APP_PASSWORD` to your 16-character app password without spaces.
   - All other variables in `.env` have working defaults.

7. Fetch your initial digest emails and populate the database:

```bash
pnpm fetch-digests
```

8. Start the local development server:

```bash
pnpm dev
```

9. Open your browser and navigate to the application:

```
http://localhost:3000
```

> [!NOTE]
> **Windows Notes**
> - Antivirus software such as Norton can block IMAP connections. Disable email scanning features if IMAP connections fail.
> - PowerShell requires the `-LiteralPath` parameter for paths containing square brackets, such as Next.js route directories.

## Command Reference

The Command-Line Interface (CLI) scripts provide data ingestion, database inspection, and maintenance operations.

| Command | Description | Safety Behavior |
| :--- | :--- | :--- |
| `pnpm dev` | Starts the Next.js development server on port 3000. | Read-only web server. |
| `pnpm build` | Compiles the production build of the Next.js application. | Read-only build task. |
| `pnpm start` | Runs the compiled Next.js production server. | Read-only web server. |
| `pnpm lint` | Runs ESLint to check code standards. | Read-only code check. |
| `pnpm typecheck` | Validates TypeScript types across the codebase. | Read-only code check. |
| `pnpm test` | Executes the Vitest automated test suite. | Read-only test runner. |
| `pnpm check` | Runs lint, typecheck, and test commands in sequence. | Read-only verification pipeline. |
| `pnpm format` | Formats all source files with Prettier. | Modifies source code files. |
| `pnpm fetch-digests` | Connects to Gmail via IMAP, parses new digest emails, and stores articles in SQLite. | Writes new articles and ingest logs. Safe to run repeatedly. |
| `pnpm inspect-db` | Displays database statistics, article counts by status, and recent articles. | Read-only query against SQLite. |
| `pnpm purge-old-articles` | Removes articles older than 90 days. | **Safe by default.** Runs as a dry run and deletes nothing. Run `pnpm purge-old-articles --confirm` to delete articles. |
| `pnpm backfill-subtitles` | Extracts subtitles for stored articles that lack subtitle metadata. | **Safe by default.** Runs as a dry run limited to 10 articles. Run `pnpm backfill-subtitles --apply` to commit changes. Use `--limit <N>` to adjust batch size, or `--all` to process every article. |
| `pnpm db:generate` | Generates new SQLite migration files from Drizzle schema definitions. | Generates migration files in `drizzle/migrations`. |

## How It Is Built

Daybreak uses a three-stage architecture. The ingestion pipeline connects to Gmail via IMAP, parses digest emails, and extracts article text. The storage layer saves articles in a local SQLite database configured with Write-Ahead Logging (WAL). The web layer serves articles through a Next.js App Router user interface using dynamic server rendering. For detailed architectural decisions, see [docs/architecture.md](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/docs/architecture.md). For design principles and coding conventions, review [DESIGN.md](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/DESIGN.md) and [AGENTS.md](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/AGENTS.md).

## Status

- **Working Today**: Email ingestion via IMAP, article extraction, paywall bypass, chrome cleanup, local SQLite archiving, and the reading user interface.
- **In Progress**: Automated deployment configuration for private networks.

## Privacy and License

Daybreak is a personal project intended only for private use on private networks because it displays content from paywalled sources.
