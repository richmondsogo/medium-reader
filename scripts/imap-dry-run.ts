import { ImapflowClient } from "../src/ingest/imapflowClient";

async function main() {
  console.log("Starting IMAP dry run...");
  const client = new ImapflowClient();

  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);

    console.log(`Connecting to Gmail IMAP and searching for emails since ${since.toISOString()}...`);
    const emails = await client.findDigestEmails(since);

    console.log(`\nFound ${emails.length} Medium Daily Digest emails:`);
    for (const email of emails) {
      console.log(`- UID: ${email.uid} | Message-ID: ${email.messageId}`);
      console.log(`  Subject: ${email.subject || "(No Subject)"}`);
    }
  } catch (error) {
    console.error("\nError during IMAP dry run:");
    console.error(error instanceof Error ? error.message : error);
  } finally {
    console.log("\nDisconnecting...");
    await client.disconnect();
  }
}

main().catch(console.error);
