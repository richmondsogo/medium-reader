import * as cheerio from "cheerio";
import { parseEmailFile } from "./parseEmailFile";
import { parseDigestHtml } from "./parseDigestHtml";
import { type DigestEmail, digestEmailSchema, DigestParseError } from "./types";

export async function parseDigest(buffer: Buffer): Promise<DigestEmail> {
  const email = await parseEmailFile(buffer);
  const articles = parseDigestHtml(email.html);

  // Extract recipient handle from the email header greeting if present
  let recipientHandle: string | undefined;
  const $ = cheerio.load(email.html);
  const headerProfile = $('a[href*="medium.com/@"]')
    .filter((_, el) => $(el).text().trim().startsWith("@"))
    .first();

  if (headerProfile.length) {
    recipientHandle = headerProfile.text().trim().replace(/^@/, "");
  }

  const candidate = {
    messageId: email.messageId,
    subject: email.subject,
    dispatchDate: email.dispatchDate,
    recipientHandle,
    articles,
  };

  try {
    return digestEmailSchema.parse(candidate);
  } catch (err) {
    throw new DigestParseError(
      `Failed to validate digest email: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}
