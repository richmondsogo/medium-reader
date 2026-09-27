/**
 * Rewrites broken Medium image URLs sourced from Freedium mirrors to the working
 * miro.medium.com CDN endpoint.
 *
 * Freedium mirrors rewrite Medium CDN images to relative paths like:
 * - /img/medium/700/<hash>
 * - /img/700/<hash>
 *
 * When resolved against medium.com, these become:
 * - https://medium.com/img/medium/700/<hash>
 * - https://medium.com/img/700/<hash>
 *
 * Medium blocks direct hotlinking to medium.com/img/* (returning 403 Forbidden / 404).
 * However, the underlying hash maps directly to Medium's public CDN:
 * https://miro.medium.com/v2/resize:fit:1400/<hash>
 *
 * Any URL not matching the medium.com/img/* pattern (such as already valid
 * miro.medium.com CDN URLs or external image URLs) is returned unmodified.
 */
export function rewriteImageUrl(url: string): string {
  if (!url) {
    return url;
  }

  const match = url.match(/^https?:\/\/medium\.com\/img\/(?:medium\/)?\d+\/(.+)$/);
  if (match) {
    const hash = match[1];
    return `https://miro.medium.com/v2/resize:fit:1400/${hash}`;
  }

  return url;
}
