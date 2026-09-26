export interface ImapClient {
  findDigestEmails(since?: Date): Promise<{ uid: number; messageId: string }[]>;
  fetchRawMessage(uid: number): Promise<Buffer>;
}
