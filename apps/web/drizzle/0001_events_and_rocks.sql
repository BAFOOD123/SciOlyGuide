CREATE TABLE `flashcards` (
	`user_id` text NOT NULL,
	`card_id` text NOT NULL,
	`box` integer NOT NULL,
	`due_at` integer NOT NULL,
	`reviews` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `card_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `quiz_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`event` text NOT NULL,
	`mode` text NOT NULL,
	`plan` text NOT NULL,
	`responses` text NOT NULL,
	`config` text NOT NULL,
	`station_seconds` integer,
	`started_at` integer NOT NULL,
	`ends_at` integer,
	`finished_at` integer,
	`score` integer,
	`max_score` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `quiz_sessions_user_idx` ON `quiz_sessions` (`user_id`,`event`,`started_at`);--> statement-breakpoint
CREATE TABLE `rm_answers` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`session_id` text,
	`specimen_id` text,
	`skill` text NOT NULL,
	`correct` integer NOT NULL,
	`answered_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`session_id`) REFERENCES `quiz_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `rm_answers_user_idx` ON `rm_answers` (`user_id`,`answered_at`);--> statement-breakpoint
CREATE TABLE `user_events` (
	`user_id` text NOT NULL,
	`event_slug` text NOT NULL,
	`added_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `event_slug`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
