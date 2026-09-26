# Step 4B: IMAP Client

## Goal
Implement a read-only IMAP client using `imapflow` for finding Medium Daily Digest emails in Gmail. This provides the foundation for the orchestrator (Step 4C).

## Changes
1. **Configured Environment Variables**: Added `GMAIL_USER` and `GMAIL_APP_PASSWORD` to `src/lib/env.ts` with strict validation. Updated `.env.example` and test setup.
2. **Defined `ImapClient` Interface**: Created a minimal interface (`src/ingest/imapClient.ts`) exposing `findDigestEmails`, `fetchRawMessage`, `connect`, and `disconnect`.
3. **Implemented `ImapflowClient`**: Created a real IMAP client wrapper (`src/ingest/imapflowClient.ts`) using `imapflow` that connects securely to Gmail IMAP, locking the INBOX in `readOnly` mode. Added error sanitization to prevent credential leaks on failure.
4. **Created `FakeImapClient`**: Added an in-memory client (`src/ingest/fakeImapClient.ts`) and associated contract tests to enable local testing without hitting the network.
5. **Dry-Run Script**: Wrote `scripts/imap-dry-run.ts` to execute a search against the live mailbox and log summary email envelope data.
6. **Security Documentation**: Noted the importance of never logging `GMAIL_APP_PASSWORD` in `AGENTS.md`.

## Notes
- `findDigestEmails` currently searches for `from: 'noreply@medium.com'`.
- All connections are read-only; no writes are made to the mailbox.
- Error messages from `imapflowClient` are sanitized to avoid embedding real passwords.
