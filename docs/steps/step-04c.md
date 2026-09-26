# Step 4c: Fix IMAP Filter for Daily Digests

## Goal
Fix the IMAP search to accurately filter only "Medium Daily Digest" emails, as the previous `noreply@medium.com` filter was pulling in stats, submission notifications, and editorial emails alongside real digests.

## Changes
- Updated the IMAP search criteria in `src/ingest/imapflowClient.ts` to `from: "Medium Daily Digest"` rather than just the address.
- Added a strict local check in the fetch loop inside `imapflowClient.ts` to verify the sender name includes "Medium Daily Digest", because Gmail's IMAP search tokenization can sometimes be fuzzy.
- Updated `FakeEmail` in `src/ingest/fakeImapClient.ts` to optionally support the `from` field and accurately simulate this stricter filtering.
- Updated `src/ingest/fakeImapClient.test.ts` to include a test verifying that non-digest Medium emails are successfully excluded.

## Verification
- `pnpm check` ran successfully (all typechecks and tests green).
- Ran `pnpm tsx scripts/imap-dry-run.ts` against real Gmail data and confirmed that all results strictly match the digest subject pattern, with stats and notification emails successfully excluded.
