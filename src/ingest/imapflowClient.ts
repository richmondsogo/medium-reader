import { ImapFlow } from "imapflow";
import { env } from "../lib/env";
import { ImapClient } from "./imapClient";

export class ImapConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImapConnectionError";
  }
}

export class ImapflowClient implements ImapClient {
  private client: ImapFlow;
  private connected = false;

  constructor() {
    this.client = new ImapFlow({
      host: "imap.gmail.com",
      port: 993,
      secure: true,
      auth: {
        user: env.GMAIL_USER,
        pass: env.GMAIL_APP_PASSWORD,
      },
      logger: false,
    });
  }

  async connect(): Promise<void> {
    if (this.connected) return;
    try {
      await this.client.connect();
      this.connected = true;
    } catch {
      // Re-throw with a sanitized message to avoid leaking credentials
      throw new ImapConnectionError(
        "Failed to connect to Gmail IMAP. Please check your network and GMAIL_APP_PASSWORD.",
      );
    }
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.client.logout();
      this.connected = false;
    }
  }

  async findDigestEmails(
    since?: Date,
  ): Promise<{ uid: number; messageId: string; subject?: string }[]> {
    await this.connect();

    // Using INBOX for now. Gmail's "[Gmail]/All Mail" is another option,
    // but INBOX is standard and works if emails are not archived immediately.
    const lock = await this.client.getMailboxLock("INBOX", { readOnly: true });
    try {
      const searchCriteria: { from: string; since?: Date } = {
        from: "noreply@medium.com",
      };
      if (since) {
        searchCriteria.since = since;
      }

      const results: { uid: number; messageId: string }[] = [];
      // Fetch envelope to get messageId.
      for await (const message of this.client.fetch(searchCriteria, {
        envelope: true,
      })) {
        results.push({
          uid: message.uid,
          messageId: message.envelope?.messageId || "",
          subject: message.envelope?.subject || "",
        });
      }
      return results;
    } finally {
      lock.release();
    }
  }

  async fetchRawMessage(uid: number): Promise<Buffer> {
    await this.connect();

    const lock = await this.client.getMailboxLock("INBOX", { readOnly: true });
    try {
      const message = await this.client.fetchOne(
        uid.toString(),
        { source: true },
        { uid: true },
      );
      if (!message || !message.source) {
        throw new Error(`Message with UID ${uid} not found or has no source.`);
      }
      return message.source;
    } finally {
      lock.release();
    }
  }
}
