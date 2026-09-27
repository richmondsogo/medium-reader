import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ListItemTitle, ListItemTitleSelected } from "./typography";

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
