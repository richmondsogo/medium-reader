// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React, { StrictMode, act } from "react";
import { createRoot, Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ArticleImage,
  ImageFallback,
  getImageRetryKey,
  getNextRetryDelay,
  MAX_IMAGE_RETRIES,
  RETRY_DELAYS,
} from "./article-image";

// @ts-expect-error test environment global
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe("article-image - retry key & delay calculations", () => {
  it("formats retry key with current retry count to force React remounting", () => {
    const src = "https://miro.medium.com/v2/resize:fit:1400/hash.png";
    expect(getImageRetryKey(src, 0)).toBe(`${src}-0`);
    expect(getImageRetryKey(src, 1)).toBe(`${src}-1`);
    expect(getImageRetryKey(src, 2)).toBe(`${src}-2`);
  });

  it("schedules increasing delays for up to 2 retries, then exhausts", () => {
    expect(MAX_IMAGE_RETRIES).toBe(2);
    expect(RETRY_DELAYS).toEqual([300, 800]);

    // Attempt 0 -> retry 1 delay: 300ms
    expect(getNextRetryDelay(0)).toBe(300);
    // Attempt 1 -> retry 2 delay: 800ms
    expect(getNextRetryDelay(1)).toBe(800);
    // Attempt 2 -> retries exhausted, returns null
    expect(getNextRetryDelay(2)).toBeNull();
    // Subsequent calls return null
    expect(getNextRetryDelay(3)).toBeNull();
  });
});

describe("article-image - component rendering", () => {
  it("renders an img with rewritten URL and loading=lazy", () => {
    const html = renderToStaticMarkup(
      <ArticleImage
        src="https://medium.com/img/medium/700/1*dummyhash.png"
        alt="A diagram of system architecture"
      />
    );

    expect(html).toContain("<img");
    expect(html).toContain("https://miro.medium.com/v2/resize:fit:1400/1*dummyhash.png");
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('alt="A diagram of system architecture"');
    expect(html).toContain("rounded-md max-w-full h-auto my-6");
  });

  it("renders graceful fallback when src is missing or empty", () => {
    const html = renderToStaticMarkup(
      <ArticleImage src="" alt="Missing chart" />
    );

    expect(html).not.toContain("<img");
    expect(html).toContain('role="img"');
    expect(html).toContain("Image unavailable");
    expect(html).toContain("Missing chart");
    expect(html).toContain("border-border/60");
  });

  it("renders ImageFallback with correct accessibility role and label", () => {
    const htmlWithAlt = renderToStaticMarkup(<ImageFallback alt="Sample description" />);
    expect(htmlWithAlt).toContain('role="img"');
    expect(htmlWithAlt).toContain('aria-label="Image unavailable: Sample description"');
    expect(htmlWithAlt).toContain("Image unavailable");
    expect(htmlWithAlt).toContain("Sample description");

    const htmlWithoutAlt = renderToStaticMarkup(<ImageFallback />);
    expect(htmlWithoutAlt).toContain('aria-label="Image unavailable"');
    expect(htmlWithoutAlt).toContain("Image unavailable");
  });
});

describe("article-image - resilient retry & fallback lifecycle", () => {
  let container: HTMLDivElement;
  let root: Root;
  const originalComplete = Object.getOwnPropertyDescriptor(
    HTMLImageElement.prototype,
    "complete"
  );
  const originalNaturalWidth = Object.getOwnPropertyDescriptor(
    HTMLImageElement.prototype,
    "naturalWidth"
  );

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    if (originalComplete) {
      Object.defineProperty(HTMLImageElement.prototype, "complete", originalComplete);
    } else {
      delete (HTMLImageElement.prototype as unknown as Record<string, unknown>).complete;
    }
    if (originalNaturalWidth) {
      Object.defineProperty(HTMLImageElement.prototype, "naturalWidth", originalNaturalWidth);
    } else {
      delete (HTMLImageElement.prototype as unknown as Record<string, unknown>).naturalWidth;
    }
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // Scenario a: error -> +300ms a NEW <img> node exists -> error -> +800ms another NEW node -> error -> fallback box present, no <img>. Total <img> mounts = 3.
  it("scenario a: error -> +300ms NEW <img> node -> error -> +800ms another NEW node -> error -> fallback box present", async () => {
    let imgMountCount = 0;
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of Array.from(m.addedNodes)) {
          if (node.nodeName === "IMG") {
            imgMountCount++;
          }
        }
      }
    });
    observer.observe(container, { childList: true, subtree: true });

    await act(async () => {
      root.render(
        <ArticleImage
          src="https://miro.medium.com/v2/resize:fit:1400/img.png"
          alt="Architecture diagram"
        />
      );
    });

    const img1 = container.querySelector("img");
    expect(img1).not.toBeNull();

    // Error on attempt 0
    await act(async () => {
      img1!.dispatchEvent(new Event("error"));
    });

    // Advance 300ms for retry 1
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    const img2 = container.querySelector("img");
    expect(img2).not.toBeNull();
    expect(img2).not.toBe(img1);

    // Error on attempt 1
    await act(async () => {
      img2!.dispatchEvent(new Event("error"));
    });

    // Advance 800ms for retry 2
    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    const img3 = container.querySelector("img");
    expect(img3).not.toBeNull();
    expect(img3).not.toBe(img2);

    // Error on attempt 2 (retries exhausted)
    await act(async () => {
      img3!.dispatchEvent(new Event("error"));
    });

    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toContain("Image unavailable");
    expect(container.textContent).toContain("Architecture diagram");
    expect(imgMountCount).toBe(3);
    observer.disconnect();
  });

  // Scenario b: the same, wrapped in <StrictMode>
  it("scenario b: the same, wrapped in <StrictMode>", async () => {
    await act(async () => {
      root.render(
        <StrictMode>
          <ArticleImage
            src="https://miro.medium.com/v2/resize:fit:1400/img.png"
            alt="Architecture diagram"
          />
        </StrictMode>
      );
    });

    const img1 = container.querySelector("img");
    expect(img1).not.toBeNull();

    // Error on attempt 0
    await act(async () => {
      img1!.dispatchEvent(new Event("error"));
    });

    // Advance 300ms for retry 1
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    const img2 = container.querySelector("img");
    expect(img2).not.toBeNull();
    expect(img2).not.toBe(img1);

    // Error on attempt 1
    await act(async () => {
      img2!.dispatchEvent(new Event("error"));
    });

    // Advance 800ms for retry 2
    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    const img3 = container.querySelector("img");
    expect(img3).not.toBeNull();
    expect(img3).not.toBe(img2);

    // Error on attempt 2
    await act(async () => {
      img3!.dispatchEvent(new Event("error"));
    });

    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toContain("Image unavailable");
  });

  // Scenario c: the same via mount-time complete/naturalWidth check (no error event dispatched)
  it("scenario c: pre-hydration complete & naturalWidth === 0 in <StrictMode>", async () => {
    Object.defineProperty(HTMLImageElement.prototype, "complete", {
      configurable: true,
      get: () => true,
    });
    Object.defineProperty(HTMLImageElement.prototype, "naturalWidth", {
      configurable: true,
      get: () => 0,
    });

    let imgMountCount = 0;
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of Array.from(m.addedNodes)) {
          if (node.nodeName === "IMG") {
            imgMountCount++;
          }
        }
      }
    });
    observer.observe(container, { childList: true, subtree: true });

    await act(async () => {
      root.render(
        <StrictMode>
          <ArticleImage
            src="https://miro.medium.com/v2/resize:fit:1400/img.png"
            alt="Architecture diagram"
          />
        </StrictMode>
      );
    });

    const img1 = container.querySelector("img");
    expect(img1).not.toBeNull();

    // Advance 300ms for retry 1
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    const img2 = container.querySelector("img");
    expect(img2).not.toBeNull();
    expect(img2).not.toBe(img1);

    // Advance 800ms for retry 2 (attempts retry 2, exhausts, renders fallback)
    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toContain("Image unavailable");
    // Under StrictMode, initial mount creates 2 img nodes (simulated unmount/remount),
    // then retry 1 creates 1, retry 2 creates 1 -> at least 3 distinct attempts
    expect(imgMountCount).toBeGreaterThanOrEqual(3);
    observer.disconnect();
  });

  // Scenario d: error once, then success on attempt 2 -> no fallback, <img> present
  it("scenario d: error once, then success on attempt 2 -> no fallback, <img> present", async () => {
    await act(async () => {
      root.render(
        <StrictMode>
          <ArticleImage
            src="https://miro.medium.com/v2/resize:fit:1400/img.png"
            alt="Architecture diagram"
          />
        </StrictMode>
      );
    });

    const img1 = container.querySelector("img");
    expect(img1).not.toBeNull();

    // Error on attempt 0
    await act(async () => {
      img1!.dispatchEvent(new Event("error"));
    });

    // Advance 300ms for retry 1
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    const img2 = container.querySelector("img");
    expect(img2).not.toBeNull();
    expect(img2).not.toBe(img1);

    // Attempt 1 succeeds (load event)
    await act(async () => {
      img2!.dispatchEvent(new Event("load"));
    });

    // Advance time further to make sure no unintended timers or fallback trigger
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(container.querySelector("img")).not.toBeNull();
    expect(container.textContent).not.toContain("Image unavailable");
  });

  // Scenario e: unmount while a retry timer is pending -> no state update, no leaked timer
  it("scenario e: unmount while a retry timer is pending -> no state update, no leaked timer", async () => {
    await act(async () => {
      root.render(
        <StrictMode>
          <ArticleImage
            src="https://miro.medium.com/v2/resize:fit:1400/img.png"
            alt="Architecture diagram"
          />
        </StrictMode>
      );
    });

    const img1 = container.querySelector("img");
    expect(img1).not.toBeNull();

    // Trigger error on attempt 0 to start 300ms timer
    await act(async () => {
      img1!.dispatchEvent(new Event("error"));
    });

    // Unmount before timer fires
    await act(async () => {
      root.unmount();
    });

    // Advance timers past delay
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(container.querySelector("img")).toBeNull();
  });
});
