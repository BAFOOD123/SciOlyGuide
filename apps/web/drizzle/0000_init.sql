CREATE TABLE `attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`cipher_type` text NOT NULL,
	`spec` text NOT NULL,
	`test_id` text,
	`question_index` integer,
	`status` text NOT NULL,
	`response` text NOT NULL,
	`notes` text,
	`points` integer NOT NULL,
	`score` integer,
	`errors` integer,
	`checks` integer DEFAULT 0 NOT NULL,
	`hints` integer DEFAULT 0 NOT NULL,
	`elapsed_ms` integer DEFAULT 0 NOT NULL,
	`started_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`finished_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`test_id`) REFERENCES `tests`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `attempts_user_type_idx` ON `attempts` (`user_id`,`cipher_type`,`status`);--> statement-breakpoint
CREATE INDEX `attempts_user_finished_idx` ON `attempts` (`user_id`,`finished_at`);--> statement-breakpoint
CREATE INDEX `attempts_test_idx` ON `attempts` (`test_id`,`question_index`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `tests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`level` text NOT NULL,
	`seed` integer NOT NULL,
	`specials` text NOT NULL,
	`started_at` integer NOT NULL,
	`ends_at` integer NOT NULL,
	`finished_at` integer,
	`timed_seconds` integer,
	`score` integer,
	`max_score` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `tests_user_idx` ON `tests` (`user_id`,`started_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`display_name` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_idx` ON `users` (`username`);