/**
 * Application route helpers.
 */

export function articlePath(id: number | string): string {
  return `/read/${id}`;
}

const ARTICLE_PATH_PATTERN = /^\/read\/[^/]+\/?$/;

export function isArticlePath(pathname: string): boolean {
  return ARTICLE_PATH_PATTERN.test(pathname);
}
