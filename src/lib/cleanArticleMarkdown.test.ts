import { describe, it, expect } from "vitest";
import { cleanArticleMarkdown, detectResidualChromeMarkers } from "./cleanArticleMarkdown";

describe("cleanArticleMarkdown", () => {
  it("removes duplicate title line with setext underline", () => {
    const input = `My Great Article
----------------

Here is the actual content of the article.`;
    const cleaned = cleanArticleMarkdown(input, "My Great Article");
    expect(cleaned).toBe("Here is the actual content of the article.");
  });

  it("removes duplicate title line with bold or header markdown", () => {
    const input = `**Mileu of memories**

Here is the actual poem.`;
    const cleaned = cleanArticleMarkdown(input, "Mileu of memories");
    expect(cleaned).toBe("Here is the actual poem.");
  });

  it("removes 'Press enter or click to view image in full size' caption text", () => {
    const input = `Press enter or click to view image in full size

![Photo](https://example.com/photo.jpg)

The article continues here.`;
    const cleaned = cleanArticleMarkdown(input);
    expect(cleaned).toBe(`![Photo](https://example.com/photo.jpg)

The article continues here.`);
  });

  it("unwraps profile links with exact nested markdown image structure from Article #99", () => {
    const input = `[

![Kelly Turner](https://miro.medium.com/v2/resize:fill:64:64/1*PmIHD5xqGCYO899Bn0_7Ag.jpeg)



](https://kellyjoturner.medium.com/?source=post_page---byline--b452553462bf-----------------------------------------)

Author prose begins here.`;

    const cleaned = cleanArticleMarkdown(input);
    expect(cleaned).toBe(
      `![Kelly Turner](https://miro.medium.com/v2/resize:fill:64:64/1*PmIHD5xqGCYO899Bn0_7Ag.jpeg)\n\nAuthor prose begins here.`
    );
  });

  it("unwraps medium.com/@handle profile links with text", () => {
    const input = `[Follow me](https://medium.com/@divadsanders?source=post_page)

Content follows.`;
    const cleaned = cleanArticleMarkdown(input);
    expect(cleaned).toBe("Follow me\n\nContent follows.");
  });

  it("removes an isolated 'N min read' line", () => {
    const input = `15 min read

First paragraph of text.`;
    const cleaned = cleanArticleMarkdown(input);
    expect(cleaned).toBe("First paragraph of text.");
  });

  it("removes standalone absolute and relative date lines", () => {
    const absoluteInput = `Sep 16, 2026

First paragraph.`;
    expect(cleanArticleMarkdown(absoluteInput)).toBe("First paragraph.");

    const relativeInput = `5 days ago

First paragraph.`;
    expect(cleanArticleMarkdown(relativeInput)).toBe("First paragraph.");
  });

  it("removes standalone \\-- and -- divider lines", () => {
    const escapedInput = `\\--

First paragraph.`;
    expect(cleanArticleMarkdown(escapedInput)).toBe("First paragraph.");

    const rawInput = `--

First paragraph.`;
    expect(cleanArticleMarkdown(rawInput)).toBe("First paragraph.");
  });

  it("cleans verbatim leading content of Article #99 end to end", () => {
    const rawArticle99 = `Press enter or click to view image in full size

[

![Kelly Turner](https://miro.medium.com/v2/resize:fill:64:64/1*PmIHD5xqGCYO899Bn0_7Ag.jpeg)



](https://kellyjoturner.medium.com/?source=post_page---byline--b452553462bf-----------------------------------------)

15 min read

Sep 16, 2026

\\--

_I thought I was building a library. I think I was actually trying to figure out how humanity remembers._

This is the third part of a series about a question I have become increasingly unable to ignore.`;

    const cleaned = cleanArticleMarkdown(
      rawArticle99,
      "Maybe the Solution to AI Is More Human Than We Think"
    );

    expect(cleaned).toBe(
      `![Kelly Turner](https://miro.medium.com/v2/resize:fill:64:64/1*PmIHD5xqGCYO899Bn0_7Ag.jpeg)\n\n_I thought I was building a library. I think I was actually trying to figure out how humanity remembers._\n\nThis is the third part of a series about a question I have become increasingly unable to ignore.`
    );
  });

  it("cleans verbatim leading content of Article #112 end to end", () => {
    const rawArticle112 = `[

![Anna Parker | Business & Tech Analyst](https://miro.medium.com/v2/resize:fill:64:64/1*OOeJO1j_LxTYqkEPsPrFbg.png)



](https://annahparker.medium.com/?source=post_page---byline--bbf36859b7be-----------------------------------------)

4 min read

Sep 16, 2026

\\--

Press enter or click to view image in full size

By the time someone hands in their resignation, the decision was already made months ago.`;

    const cleaned = cleanArticleMarkdown(
      rawArticle112,
      "Why Your Best People Leave Quietly, Not Loudly"
    );

    expect(cleaned).toBe(
      `![Anna Parker | Business & Tech Analyst](https://miro.medium.com/v2/resize:fill:64:64/1*OOeJO1j_LxTYqkEPsPrFbg.png)\n\nBy the time someone hands in their resignation, the decision was already made months ago.`
    );
  });

  it("cleans verbatim leading content of Article #122 end to end", () => {
    const rawArticle122 = `Why ambition fails without a life strategy
------------------------------------------

[

![Natalya Permyakova](https://miro.medium.com/v2/resize:fill:64:64/1*KhOdnzLL2QAfOhuyP6r8Mg.jpeg)



](https://medium.com/@natalya.permyakova?source=post_page---byline--d10dfb33f2e1-----------------------------------------)

4 min read

Sep 18, 2026

\\--

Press enter or click to view image in full size

Photo by Unsplash`;

    const cleaned = cleanArticleMarkdown(
      rawArticle122,
      "Stop Setting Goals Without Direction"
    );

    expect(cleaned).toBe(
      `Why ambition fails without a life strategy\n------------------------------------------\n\n![Natalya Permyakova](https://miro.medium.com/v2/resize:fill:64:64/1*KhOdnzLL2QAfOhuyP6r8Mg.jpeg)\n\nPhoto by Unsplash`
    );
  });

  it("should NOT touch legitimate prose, hyphens, external links, or article links", () => {
    const input = `This is a state-of-the-art analysis.

It took me about 5 min to understand why this matters.
Check out [this documentation](https://example.com/docs) for more details.

Also see [an interesting story](https://medium.com/@author/how-to-code-well-1234abcd) by the same writer.

On Sep 16, 2026, the team announced the release.

---

Here is the conclusion.`;

    const cleaned = cleanArticleMarkdown(input, "Unrelated Title");
    expect(cleaned).toBe(input);
  });
});

describe("detectResidualChromeMarkers", () => {
  it("flags slightly-different caption phrasing that current cleanArticleMarkdown misses", () => {
    // Current cleanArticleMarkdown requires verbatim "Press enter or click to view image in full size".
    // A variant like "Click to view image in full size" slips past cleanArticleMarkdown.
    const rawMarkdown = `Click to view image in full size

![Illustration](https://miro.medium.com/v2/resize:fill:64:64/1*sample.png)

This is the opening paragraph of an otherwise valid article.`;

    const cleaned = cleanArticleMarkdown(rawMarkdown);
    // Verifying it slipped past cleanArticleMarkdown:
    expect(cleaned).toContain("Click to view image in full size");

    // But detectResidualChromeMarkers detects the leaked variant:
    const markers = detectResidualChromeMarkers(cleaned);
    expect(markers).toEqual(["caption-prompt"]);
  });

  it("returns empty array for clean article prose and properly cleaned articles", () => {
    const cleanProse = `This is a state-of-the-art analysis.

It took me about 5 min to understand why this matters.
Check out [this documentation](https://example.com/docs) for more details.

Also see [an interesting story](https://medium.com/@author/how-to-code-well-1234abcd) by the same writer.

On Sep 16, 2026, the team announced the release.

---

Here is the conclusion.`;

    expect(detectResidualChromeMarkers(cleanProse)).toEqual([]);
  });

  it("returns empty array after cleanArticleMarkdown removes standard Medium chrome", () => {
    const rawArticle99 = `Press enter or click to view image in full size

[

![Kelly Turner](https://miro.medium.com/v2/resize:fill:64:64/1*PmIHD5xqGCYO899Bn0_7Ag.jpeg)



](https://kellyjoturner.medium.com/?source=post_page---byline--b452553462bf-----------------------------------------)

15 min read

Sep 16, 2026

\\--

_I thought I was building a library. I think I was actually trying to figure out how humanity remembers._

This is the third part of a series about a question I have become increasingly unable to ignore.`;

    const cleaned = cleanArticleMarkdown(
      rawArticle99,
      "Maybe the Solution to AI Is More Human Than We Think"
    );
    expect(detectResidualChromeMarkers(cleaned)).toEqual([]);
  });

  it("detects other residual noise patterns when present", () => {
    // Residual reading time variant
    expect(
      detectResidualChromeMarkers("Some intro\n\n*5 mins read*\n\nSome body text.")
    ).toEqual(["reading-time"]);

    // Residual standalone date variant
    expect(
      detectResidualChromeMarkers("Some intro\n\n*Sep 16, 2026*\n\nSome body text.")
    ).toEqual(["date-line"]);

    // Residual divider line variant
    expect(
      detectResidualChromeMarkers("Some intro\n\n––\n\nSome body text.")
    ).toEqual(["divider-line"]);

    // Residual profile link variant (e.g. angle bracketed or unstripped)
    expect(
      detectResidualChromeMarkers("Some intro\n\n<https://medium.com/@johndoe>\n\nSome body text.")
    ).toEqual(["profile-link"]);
  });
});

