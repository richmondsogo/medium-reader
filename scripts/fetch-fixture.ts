import fs from "fs/promises";
import path from "path";

async function main() {
  const args = process.argv.slice(2);
  const urlArg = args.find((a) => !a.startsWith("--"));
  const nameArg = args.find((a) => !a.startsWith("--") && a !== urlArg);
  const viaArg = args.find((a) => a.startsWith("--via="))?.split("=")[1] || "direct";

  if (!urlArg || !nameArg) {
    console.error("Usage: tsx scripts/fetch-fixture.ts <url> <output-name> [--via=direct|freedium|freedium-mirror]");
    process.exit(1);
  }

  let fetchUrl = urlArg;
  if (viaArg === "freedium") {
    fetchUrl = "https://freedium.cfd/" + urlArg;
  } else if (viaArg === "freedium-mirror") {
    fetchUrl = "https://freedium-mirror.cfd/" + urlArg;
  } else if (viaArg !== "direct") {
    console.error("Invalid --via option. Use direct, freedium, or freedium-mirror.");
    process.exit(1);
  }

  const outputHtmlPath = path.join(__dirname, "../fixtures/html", nameArg + ".html");
  const outputMetaPath = path.join(__dirname, "../fixtures/html", nameArg + ".meta.json");

  const startTime = Date.now();
  let httpStatus = 0;
  const responseHeaders: Record<string, string> = {};
  let contentLength = 0;
  let errorMsg = null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(fetchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    httpStatus = response.status;
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    const text = await response.text();
    contentLength = text.length;

    if (response.ok) {
      await fs.writeFile(outputHtmlPath, text, "utf-8");
      console.log("Saved HTML to " + outputHtmlPath);
    }
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Fetch error: " + errorMsg);
  }

  const elapsedMs = Date.now() - startTime;

  const metaData = {
    requestedUrl: urlArg,
    fetchUrl,
    via: viaArg,
    httpStatus,
    responseHeaders,
    fetchedAt: new Date().toISOString(),
    contentLength,
    elapsedMs,
    error: errorMsg,
  };

  await fs.writeFile(outputMetaPath, JSON.stringify(metaData, null, 2), "utf-8");
  console.log("Saved meta to " + outputMetaPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
