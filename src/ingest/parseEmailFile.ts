import { simpleParser, type ParsedMail } from "mailparser";
import { DigestParseError } from "./types";

export interface ParsedEmailFile {
  messageId: string;
  subject: string;
  dispatchDate: string;
  html: string;
  text: string;
}

export async function parseEmailFile(buffer: Buffer): Promise<ParsedEmailFile> {
  const parsed: ParsedMail = await simpleParser(buffer);

  const html = typeof parsed.html === "string" ? parsed.html.trim() : "";
  if (!html) {
    throw new DigestParseError("Email does not contain a valid HTML body");
  }

  const text = typeof parsed.text === "string" ? parsed.text : "";
  const messageId = parsed.messageId || "";
  if (!messageId) {
    throw new DigestParseError("Email missing Message-ID header");
  }

  const dispatchDate = parsed.date ? parsed.date.toISOString() : "";
  if (!dispatchDate) {
    throw new DigestParseError("Email missing valid Date header");
  }

  const subject = parsed.subject || "";

  return {
    messageId,
    subject,
    dispatchDate,
    html,
    text,
  };
}
