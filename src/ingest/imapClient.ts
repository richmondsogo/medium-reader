export interface ImapClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  findDigestEmails(
    since?: Date,
  ): Promise<{ uid: number; messageId: string; subject?: string }[]>;
  fetchRawMessage(uid: number): Promise<Buffer>;
}
