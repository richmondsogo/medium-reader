# Step 2A: Email Format Discovery & Inspection

## What was done

1. Installed the permitted dependencies: `mailparser` (^3.9.28) and `cheerio` (^1.2.0) as runtime dependencies, and `@types/mailparser` (^3.4.6) as dev dependency.
2. Updated `.gitignore` to ignore the temporary extraction folder `tmp/`.
3. Created `scripts/inspect-eml.ts` to decode all `.eml` files in `fixtures/emails/`, write the decoded HTML and plain text parts to `tmp/`, and analyze email headers, MIME structures, link taxonomy, and DOM hierarchies.
4. Executed `scripts/inspect-eml.ts` across all 5 fixture files:
   - `fixtures/emails/digest-2026-09-06.eml`
   - `fixtures/emails/digest-2026-09-08.eml`
   - `fixtures/emails/digest-2026-09-23.eml`
   - `fixtures/emails/digest-2026-09-24.eml`
   - `fixtures/emails/digest-2026-09-25.eml`
5. Authored comprehensive discovery documentation in `docs/notes/digest-email-format.md` detailing:
   - Header specifications (`From`, `Subject` for all fixtures, `Date`, `Message-ID`, `List-Unsubscribe`, `List-Unsubscribe-Post`).
   - MIME structure (`multipart/alternative`, `text/plain`, `text/html`, UTF-8, quoted-printable).
   - Link taxonomy and frequency per email categorized into 8 functional types (article, author, publication, topic/tag, upgrade/membership, settings/unsubscribe, footer, images/tracking pixels).
   - Link destination behavior: confirmed that article links are direct `medium.com` URLs with destination post IDs directly in the pathname (no HTTP redirects required).
   - Per-article metadata analysis (presence of title, author, publication, snippet, reading time, claps, responses, member-only indicator; absence of article publication dates).
   - Structural differences across fixtures (article counts, thumbnail presence, publication presence, rotating promo banners).
   - Parsing hazards and brittleness analysis (obfuscated CSS classes, footer articles with hex IDs, non-article `h2` elements, optional thumbnails/publications).
6. Audited `docs/notes/digest-email-format.md` with strict regex and string checks to guarantee compliance with the redaction rule (no user emails, handles, tokens, or raw tracking URLs present).
7. Ran `pnpm check` to verify TypeScript typing, linting, and existing tests pass cleanly.

## Key Discovery Findings

- **Consistent Volume**: Every fixture contains **exactly 15 articles** divided into two sections: "Today's highlights" (10 articles) and "From your following" (5 articles).
- **Direct Story Links**: Story links are **direct** `medium.com` links (`https://medium.com/@<author>/<slug>-<post-id>?source=...`). No redirect discovery or network chasing is needed.
- **No Tag Links**: Daily digest emails contain zero topic or tag links.
- **Missing Publication Dates**: Article cards do not contain publication dates; only the email dispatch timestamp exists in the email headers.
- **Card Traversal**: Selectors should avoid minified CSS classes (`cb cc cd ce`) and instead locate `a:has(h2)` matching Medium post ID path patterns, avoiding footer legal and career links.

## Commands run

```bash
# Add authorized dependencies
pnpm add mailparser cheerio
pnpm add -D @types/mailparser

# Run email inspection script
pnpm exec tsx scripts/inspect-eml.ts

# Quality and consistency verification
pnpm check
```

## Dependencies Added

- **Dependencies**:
  - `cheerio`: ^1.2.0
  - `mailparser`: ^3.9.28
- **Dev Dependencies**:
  - `@types/mailparser`: ^3.4.6
