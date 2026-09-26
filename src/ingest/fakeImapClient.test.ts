import { describe, expect, it } from "vitest";
import { FakeImapClient } from "./fakeImapClient";

describe("fakeImapClient contract test", () => {
  it("finds emails and fetches raw messages correctly", async () => {
    const fakeEmails = [
      {
        uid: 1,
        messageId: "<msg1@example.com>",
        rawBuffer: Buffer.from("Message 1"),
        date: new Date("2026-09-01T10:00:00Z"),
      },
      {
        uid: 2,
        messageId: "<msg2@example.com>",
        rawBuffer: Buffer.from("Message 2"),
        date: new Date("2026-09-05T10:00:00Z"),
      },
      {
        uid: 3,
        messageId: "<msg3@example.com>",
        rawBuffer: Buffer.from("Message 3"),
        date: new Date("2026-09-10T10:00:00Z"),
      },
      {
        uid: 4,
        messageId: "<msg4@example.com>",
        rawBuffer: Buffer.from("Not A Digest"),
        date: new Date("2026-09-10T10:00:00Z"),
        from: "Medium <noreply@medium.com>",
      },
    ];

    const client = new FakeImapClient(fakeEmails);

    // Should fail if not connected
    await expect(client.findDigestEmails()).rejects.toThrow("not connected");

    await client.connect();

    // findDigestEmails returns all 3
    const allEmails = await client.findDigestEmails();
    expect(allEmails).toHaveLength(3);
    expect(allEmails).toEqual([
      { uid: 1, messageId: "<msg1@example.com>", subject: "Fake Subject" },
      { uid: 2, messageId: "<msg2@example.com>", subject: "Fake Subject" },
      { uid: 3, messageId: "<msg3@example.com>", subject: "Fake Subject" },
    ]);

    // findDigestEmails with since filter
    const recentEmails = await client.findDigestEmails(
      new Date("2026-09-06T00:00:00Z"),
    );
    expect(recentEmails).toHaveLength(1);
    expect(recentEmails[0].uid).toBe(3);

    // fetchRawMessage returns the right buffer
    const buf = await client.fetchRawMessage(2);
    expect(buf.toString()).toBe("Message 2");

    // fetchRawMessage for an unknown uid throws a clear error
    await expect(client.fetchRawMessage(999)).rejects.toThrow(
      "Message with UID 999 not found",
    );

    await client.disconnect();
    await expect(client.fetchRawMessage(2)).rejects.toThrow("not connected");
  });
});
