import { ImapClient } from "./imapClient";

export interface FakeEmail {
  uid: number;
  messageId: string;
  rawBuffer: Buffer;
  date?: Date; // Optional date if we want to test 'since' filters
}

export class FakeImapClient implements ImapClient {
  private emails: FakeEmail[];
  private connected = false;

  constructor(emails: FakeEmail[] = []) {
    this.emails = emails;
  }

  async connect(): Promise<void> {
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async findDigestEmails(
    since?: Date,
  ): Promise<{ uid: number; messageId: string; subject?: string }[]> {
    if (!this.connected) {
      throw new Error("Client is not connected");
    }

    let matches = this.emails;
    if (since) {
      matches = matches.filter((e) => e.date && e.date >= since);
    }

    return matches.map((e) => ({
      uid: e.uid,
      messageId: e.messageId,
      subject: "Fake Subject",
    }));
  }

  async fetchRawMessage(uid: number): Promise<Buffer> {
    if (!this.connected) {
      throw new Error("Client is not connected");
    }

    const email = this.emails.find((e) => e.uid === uid);
    if (!email) {
      throw new Error(`Message with UID ${uid} not found`);
    }

    return email.rawBuffer;
  }
}
