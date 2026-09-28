"use client";

import * as React from "react";
import { ImageOff } from "lucide-react";
import { rewriteImageUrl } from "../lib/rewriteImageUrl";
import { Meta } from "./ui/typography";
import { cn } from "../lib/utils";

export const RETRY_DELAYS = [300, 800] as const;
export const MAX_IMAGE_RETRIES = 2;

export function getImageRetryKey(src: string, retryCount: number): string {
  return `${src}-${retryCount}`;
}

export function getNextRetryDelay(
  currentRetryCount: number,
  maxRetries = MAX_IMAGE_RETRIES
): number | null {
  if (currentRetryCount >= maxRetries) {
    return null;
  }
  return RETRY_DELAYS[currentRetryCount] ?? 800;
}

export interface ArticleImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node?: any;
}

export function ImageFallback({ alt }: { alt?: string }) {
  return (
    <div
      role="img"
      aria-label={alt ? `Image unavailable: ${alt}` : "Image unavailable"}
      className="my-6 flex flex-col items-center justify-center gap-1 rounded-md border border-border/60 bg-muted/20 px-4 py-6 text-center"
    >
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <ImageOff className="h-4 w-4 shrink-0" aria-hidden="true" />
        <Meta as="span">Image unavailable</Meta>
      </div>
      {alt ? (
        <Meta as="span" className="max-w-[480px] text-muted-foreground/75 line-clamp-2">
          {alt}
        </Meta>
      ) : null}
    </div>
  );
}

function ResilientImage({
  rewrittenSrc,
  alt,
  className,
  ...props
}: {
  rewrittenSrc: string;
  alt?: string;
  className?: string;
} & React.ImgHTMLAttributes<HTMLImageElement>) {
  const [retryCount, setRetryCount] = React.useState(0);
  const [hasFailed, setHasFailed] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const handledAttemptRef = React.useRef<number>(-1);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleError = React.useCallback(() => {
    if (handledAttemptRef.current === retryCount) {
      return;
    }
    handledAttemptRef.current = retryCount;

    const delay = getNextRetryDelay(retryCount, MAX_IMAGE_RETRIES);
    if (delay !== null) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setRetryCount((prev) => prev + 1);
      }, delay);
    } else {
      setHasFailed(true);
    }
  }, [retryCount]);

  React.useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // Detect pre-hydration failures: if the image finished loading before hydration
    // and naturalWidth is 0, the browser's error event fired before React attached onError.
    if (img.complete && img.naturalWidth === 0) {
      handleError();
    }
  }, [retryCount, handleError]);

  if (hasFailed) {
    return <ImageFallback alt={alt} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      key={getImageRetryKey(rewrittenSrc, retryCount)}
      src={rewrittenSrc}
      alt={alt ?? ""}
      loading="lazy"
      onError={handleError}
      className={cn("rounded-md max-w-full h-auto my-6", className)}
      {...props}
    />
  );
}

export function ArticleImage({
  src,
  alt,
  className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  node,
  ...props
}: ArticleImageProps) {
  const rewrittenSrc = typeof src === "string" ? rewriteImageUrl(src) : undefined;

  if (!rewrittenSrc) {
    return <ImageFallback alt={alt} />;
  }

  return (
    <ResilientImage
      key={rewrittenSrc}
      rewrittenSrc={rewrittenSrc}
      alt={alt}
      className={className}
      {...props}
    />
  );
}
