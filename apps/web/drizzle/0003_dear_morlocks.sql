CREATE TABLE `anatomy_answers` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`run_id` text,
	`topic` text NOT NULL,
	`correct` integer NOT NULL,
	`answered_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`run_id`) REFERENCES `anatomy_runs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `anatomy_answers_user_idx` ON `anatomy_answers` (`user_id`,`answered_at`);--> statement-breakpoint
CREATE TABLE `anatomy_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`mode` text NOT NULL,
	`topics` text NOT NULL,
	`total` integer NOT NULL,
	`score` integer NOT NULL,
	`finished_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `anatomy_runs_user_idx` ON `anatomy_runs` (`user_id`,`finished_at`);