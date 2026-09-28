import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ListItemTitle, ListItemTitleSelected, ArticleSubtitle, Wordmark } from "./typography";

describe("typography - ListItemTitle", () => {
  it("renders with text-foreground by default when isRead is false", () => {
    const html = renderToStaticMarkup(<ListItemTitle>Title</ListItemTitle>);
    expect(html).toContain("text-foreground");
    expect(html).not.toContain("text-muted-foreground");
    expect(html).toContain("font-medium");
  });

  it("renders with text-muted-foreground when isRead is true", () => {
    const html = renderToStaticMarkup(<ListItemTitle isRead={true}>Title</ListItemTitle>);
    expect(html).toContain("text-muted-foreground");
    expect(html).not.toContain("text-foreground");
    expect(html).toContain("font-medium");
  });

  it("ListItemTitleSelected combines semibold weight with isRead color", () => {
    const unreadSelected = renderToStaticMarkup(<ListItemTitleSelected>Title</ListItemTitleSelected>);
    expect(unreadSelected).toContain("font-semibold");
    expect(unreadSelected).toContain("text-foreground");

    const readSelected = renderToStaticMarkup(<ListItemTitleSelected isRead={true}>Title</ListItemTitleSelected>);
    expect(readSelected).toContain("font-semibold");
    expect(readSelected).toContain("text-muted-foreground");
    expect(readSelected).not.toContain("text-foreground");
  });
});

describe("typography - ArticleSubtitle", () => {
  it("renders with article-subtitle typography classes and muted-foreground", () => {
    const html = renderToStaticMarkup(<ArticleSubtitle>Teaser text snippet</ArticleSubtitle>);
    expect(html).toContain("text-muted-foreground");
    expect(html).toContain("text-[18px]");
    expect(html).toContain("font-normal");
    expect(html).toContain("Teaser text snippet");
  });
});

describe("typography - Wordmark", () => {
  it("renders the given text and has the lowercase class", () => {
    const html = renderToStaticMarkup(<Wordmark>Daybreak</Wordmark>);
    expect(html).toContain("Daybreak");
    expect(html).toContain("lowercase");
  });
});

