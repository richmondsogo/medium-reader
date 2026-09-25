export function normalizeUrl(rawUrl: string): string {
  const parsed = new URL(rawUrl);
  parsed.protocol = "https:";
  parsed.host = parsed.host.toLowerCase();
  parsed.search = "";
  parsed.hash = "";

  if (parsed.pathname.length > 1 && parsed.pathname.endsWith("/")) {
    parsed.pathname = parsed.pathname.replace(/\/+$/, "");
  }

  return parsed.toString();
}
