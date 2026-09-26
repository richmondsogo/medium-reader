CREATE TABLE `articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`url` text NOT NULL,
	`title` text,
	`authorName` text,
	`authorHandle` text,
	`publicationName` text,
	`snippet` text,
	`contentMarkdown` text NOT NULL,
	`wordCount` integer,
	`readingTimeMinutes` integer,
	`memberOnly` integer,
	`fetchStatus` text,
	`fetchedVia` text,
	`thumbnailUrl` text,
	`claps` text,
	`responses` text,
	`publishedDate` text,
	`isRead` integer DEFAULT false NOT NULL,
	`isSaved` integer DEFAULT false NOT NULL,
	`ingestedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `articles_url_unique` ON `articles` (`url`);--> statement-breakpoint
CREATE TABLE `ingestRuns` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`startedAt` text,
	`finishedAt` text,
	`emailsFound` integer,
	`emailsProcessed` integer,
	`articlesUpserted` integer,
	`articlesFailed` integer,
	`status` text,
	`errorSummary` text
);
--> statement-breakpoint
CREATE TABLE `processedEmails` (
	`messageId` text PRIMARY KEY NOT NULL,
	`processedAt` text,
	`articleCount` integer
);
