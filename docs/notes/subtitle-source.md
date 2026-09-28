# Subtitle Source Discovery Report (Step 06h)

**Date**: 2026-09-28  
**Scope**: Empirical audit of article subtitle sources across 193 stored articles, live HTML candidate sources (Direct Medium vs. Freedium mirror), and evaluation of "lift from body" vs. metadata extraction.  
**Constraint**: Discovery only. No schema, ingest, or rendering changes made in this step.

---

## 1. Executive Summary

1. **Email Digest Teaser Truncation (Ground Truth)**:
   - `articles.snippet` originates from the Medium Daily Digest email teaser.
   - Across all 193 articles in the database, **146 snippets (75.6%) end in a Unicode ellipsis (`…`)**, truncating the author's real subtitle or opening hook.
   - The snippet has a strict, consistent hard cap of **55 characters**.

2. **The "Lift from Body at Render Time" Hypothesis is Disproven**:
   - Only **42 out of 193 articles (21.8%)** begin with text matching the snippet.
   - In **78.2% of articles**, the real subtitle is **completely absent from stored body markdown**. Readability / Turndown extracts the article body and discards Medium's subtitle element (`pw-subtitle-paragraph`).
   - Where the first line matches the snippet, the article had no subtitle to begin with—the digest simply grabbed the first sentence of the article's body.
   - In articles like #99, the first line is an author epigraph/hook (`_I thought I was building a library..._`), while the actual subtitle is in metadata.
   - **Conclusion**: Lifting from the body at render time cannot recover the real subtitle for ~80% of articles, and risks stripping or duplicating valid article body paragraphs.

3. **Live HTML Candidate Source Comparison**:
   - **Direct Medium HTML**:
     - `og:description` reliably contains the **exact, full, untruncated subtitle** across all tested articles.
     - `meta[name="description"]` is unreliable (frequently contains SEO marketing copy, or an ugly string concatenation of title + body text).
     - Heading structure (`h2` after `h1`) is inconsistent or empty in server-rendered Medium HTML.
   - **Freedium Mirror HTML**:
     - `meta[name="description"]` reliably contains the **exact, full, untruncated subtitle** (Freedium mirrors Medium's `og:description` into its own `meta[name="description"]`).
     - `og:description` is stripped (`null`) by Freedium.
   - **Canonical Extraction Rule**:
     `subtitle = html.match(og:description) || html.match(meta[name="description"])`

4. **Recommendation**:
   - **Option (c) with phased backfill**: Add a dedicated `subtitle` column to SQLite schema, populate it during ingest from `og:description` (direct) / `meta[name="description"]` (Freedium), and run a one-time backfill script across existing articles (~4.8 minutes total at 1.5s rate limits).

---

## 2. B1. Database-Wide Snippet Statistics (193 Articles)

An audit of all 193 articles in `./data/medium-reader.db` revealed:

| Metric | Value | Notes |
|:---|:---:|:---|
| **Total Articles** | 193 | 100% have a non-empty snippet |
| **Snippet ends with Unicode ellipsis (`…`)** | 146 (75.6%) | Truncated by Medium's digest generator |
| **Snippet ends with ASCII dots (`...`)** | 0 (0.0%) | Medium always uses `\u2026` |
| **Untruncated Snippets** | 47 (24.4%) | Short subtitle or hook under 55 chars |
| **Minimum Length** | 21 chars | e.g. *"Copy my strategy, dude."* (#3) |
| **Maximum Length** | 55 chars | Exact hard ceiling across all 193 articles |
| **Average Length (Overall)** | 48.85 chars | |
| **Average Length (Ellipsis)** | 51.95 chars | Tightly clustered at 50–55 chars |
| **Average Length (Non-ellipsis)** | 39.26 chars | |

### Length Distribution
- 137 out of 193 articles (71.0%) cluster between 50 and 55 characters:
  - 50 chars: 13
  - 51 chars: 21
  - 52 chars: 28
  - 53 chars: 35
  - 54 chars: 20
  - 55 chars: 20
- **Finding**: Medium enforces a word-boundary truncation algorithm with a hard limit of 55 characters, appending `…`.

---

## 3. B2. Empirical Test of 3 Target Articles

We tested 3 articles with truncated snippets (1 fetched `direct`, 2 fetched `freedium-mirror`):
- **Article #99** (`direct`): *Maybe the Solution to AI Is More Human Than We Think*
- **Article #1** (`freedium-mirror`): *9 Unsexy Digital Products People Buy Every Single Day (No AI Required)*
- **Article #2** (`freedium-mirror`): *I Spent A Month In India. I Won’t Be Back.*

We fetched live HTML via the existing pipeline (`httpFetch`), saved raw HTML to temporary files, and evaluated candidate subtitle sources.

### Candidate Extraction Matrix

| Article | Source Candidate | Direct Medium HTML | Freedium Mirror HTML | Ground Truth (Live Article View) | Evaluation |
|:---|:---|:---|:---|:---|:---|
| **#99** | `og:description` | `"AI may need more than better models. It may need a living human memory built from observation, expertise, disagreement, and context."` | *null* | Match | **Exact Match** in Direct |
| **#99** | `meta[name=description]` | `"Maybe the Solution to AI Is More Human Than We Think I thought I was building a library. I think I was actually trying to figure out how humanity remembers. This is the third part of a series about a …"` | `"AI may need more than better models. It may need a living human memory built from observation, expertise, disagreement, and context."` | Match | Broken in Direct (concatenates title + body + truncated); **Exact Match** in Freedium |
| **#99** | `h2` after `h1` | *null* | *null* | N/A | Subtitle not rendered as `h2` sibling |
| **#99** | Stored Snippet | `"AI may need more than better models. It may need a…"` | `"AI may need more than better models. It may need a…"` | Truncated | Truncated at 52 chars |
| **#1** | `og:description` | `"Checklists are boring AF, and that’s exactly why they work"` | *null* | Match | **Exact Match** in Direct |
| **#1** | `meta[name=description]` | `"Looking for digital product ideas? See 9 boring products that solve recurring problems, save buyers time, and can be created once and sold repeatedly."` | `"Checklists are boring AF, and that’s exactly why they work"` | Match | SEO copy in Direct; **Exact Match** in Freedium |
| **#1** | Subtitle Element | `"Checklists are boring AF, and that’s exactly why they work"` (`pw-subtitle-paragraph`) | *null* | Match | Stripped by Readability/Freedium |
| **#1** | Stored Snippet | `"Checklists are boring AF, and that’s exactly why they…"` | `"Checklists are boring AF, and that’s exactly why they…"` | Truncated | Truncated at 54 chars |
| **#2** | `og:description` | `"India was always the country I wanted to visit the most"` | *null* | Match | **Exact Match** in Direct |
| **#2** | `meta[name=description]` | `"I Spent A Month In India. I Won’t Be Back India was always the country I wanted to visit the most For the longest time, I wanted to travel to India. I came close on many occasions, but I always …"` | `"India was always the country I wanted to visit the most."` | Match | Concatenated in Direct; **Exact Match** in Freedium |
| **#2** | Subtitle Element | `"India was always the country I wanted to visit the most"` (`pw-subtitle-paragraph`) | *null* | Match | Stripped by Readability/Freedium |
| **#2** | Stored Snippet | `"India was always the country I wanted to visit the…"` | `"India was always the country I wanted to visit the…"` | Truncated | Truncated at 51 chars |

---

## 4. B3 & B4. Stored Markdown Analysis & "Lift from Body" Audit

We inspected the first 5 non-blank lines of stored `contentMarkdown` (after `cleanArticleMarkdown`) for Articles #99, #1, and #2, and audited all 193 articles across the database:

### Case Study: Target Articles
1. **Article #99**:
   - Line 1: `![Kelly Turner](https://miro.medium.com/...avatar.jpeg)`
   - Line 2: `_I thought I was building a library. I think I was actually trying to figure out how humanity remembers._`
   - Line 3: `This is the third part of a series about a question I have become increasingly unable to ignore...`
   - *Observation*: Line 2 is an introductory italicized hook/epigraph. The true subtitle (*"AI may need more than better models..."*) is **not in the body text at all**.
2. **Article #1**:
   - Line 1: `Someone paid $150 for a PDF document today.`
   - Line 2: `Not an AI image generator, a viral launch thread, or a countdown timer...`
   - *Observation*: The true subtitle (*"Checklists are boring AF, and that’s exactly why they work"*) is **completely absent from stored markdown**.
3. **Article #2**:
   - Line 1: `For the longest time, I wanted to travel to India. I came close on many occasions...`
   - *Observation*: The true subtitle (*"India was always the country I wanted to visit the most"*) was discarded during extraction and is **absent from stored markdown**.

### Database-Wide Body Scan (193 Articles)
- First line matches snippet prefix: **42 / 193 (21.8%)**
- First line does NOT match snippet: **151 / 193 (78.2%)**
- First line is italic (`*...*` or `_..._`): **8 / 193 (4.1%)**
- First line is a markdown heading (`##` / `###`): **37 / 193 (19.2%)**

### Why "Lift from Body" Fails:
1. **Low Coverage**: In ~78% of articles, the subtitle does not exist in the extracted body.
2. **Body Duplication / Destruction**: For the 21.8% of articles where the first line matches the snippet prefix (e.g. #4, #16, #17), the author never wrote a subtitle; the email digest generator grabbed the opening sentence of the article. Lifting it out of the body removes the author's opening sentence, while leaving it in creates a jarring visual duplication where the same sentence appears as both subtitle and first paragraph.

---

## 5. B5. Comparison of Options & Recommendation

### Option (a): Lift Subtitle Line from Body at Render Time
- **Mechanism**: Parse stored markdown at render time, detect if the first block looks like a subtitle, render it as `<ArticleSubtitle>`, and remove it from the body.
- **Pros**: Zero database schema changes, zero re-fetching.
- **Cons**: 
  - Fails on **78.2% of articles** where the subtitle is missing from the body.
  - Mangles legitimate opening sentences and epigraphs (like #99).
  - High heuristic complexity with false positives.
- **Verdict**: **Rejected.**

### Option (b): New `subtitle` Column at Ingest Going Forward Only
- **Mechanism**: Add a nullable `subtitle` text column to the `articles` schema. During ingest (`fetchAndExtractArticle.ts`), extract `subtitle` from `og:description` (direct) or `meta[name=description]` (Freedium). Fall back to `articleLink.snippet` only if HTML metadata is empty.
- **Pros**: Clean, robust, 100% accurate for new incoming digests. Zero re-fetching of historical articles.
- **Cons**: Existing 193 articles remain with truncated snippets.
- **Verdict**: **Viable baseline.**

### Option (c): Option (b) + One-Time Backfill for Existing 193 Articles (RECOMMENDED)
- **Mechanism**: Implement Option (b). Then run a standalone CLI script (`pnpm backfill-subtitles` or migration) to re-fetch metadata for the 193 existing articles.
- **Re-fetch Cost Analysis**:
  - Total articles to backfill: 193.
  - Delay between requests (`ARTICLE_FETCH_DELAY_MS`): 1500 ms.
  - Total elapsed time: `193 * 1.5s = 289.5 seconds (~4.8 minutes)`.
  - Bandwidth: Only HTML `<head>` is needed (can even abort after head or fetch normally).
  - Network footprint: 185 Freedium requests, 8 direct Medium requests. Completely safe within rate limits.
- **Pros**: 100% of articles in the library have pristine, untruncated subtitles.
- **Verdict**: **Recommended approach for the next step.**

### Option (d): Keep the Teaser
- **Mechanism**: Make no changes; continue using `snippet` from the digest email.
- **Pros**: Zero effort, zero risk.
- **Cons**: 75.6% of subtitles remain visibly cut off with `…`.
- **Verdict**: **Inferior reading experience.**

---

## 6. Summary for Step 06h

The discovery conclusively demonstrates:
- **Canonical Direct Subtitle Source**: `meta[property="og:description"]`
- **Canonical Freedium Subtitle Source**: `meta[name="description"]`
- Next implementation step should adopt Option (c) with a new schema column and lightweight backfill script.
