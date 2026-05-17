CREATE TABLE `courses` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`level` text DEFAULT 'beginner' NOT NULL,
	`duration` integer NOT NULL,
	`cover_url` text NOT NULL,
	`audio_url` text NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`instructor_id` text,
	`series_id` text,
	`order_in_series` integer DEFAULT 0,
	`created_at` text DEFAULT '2026-05-17T06:28:33.844Z' NOT NULL,
	FOREIGN KEY (`instructor_id`) REFERENCES `instructors`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`series_id`) REFERENCES `series`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `instructors` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`avatar_url` text NOT NULL,
	`bio` text NOT NULL,
	`voice_type` text DEFAULT 'gentle' NOT NULL,
	`created_at` text DEFAULT '2026-05-17T06:28:33.829Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `progress` (
	`user_id` text NOT NULL,
	`course_id` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`completed_at` text,
	`updated_at` text DEFAULT '2026-05-17T06:28:33.860Z' NOT NULL,
	PRIMARY KEY(`user_id`, `course_id`),
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `series` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`cover_url` text NOT NULL,
	`level` text DEFAULT 'beginner' NOT NULL,
	`estimated_days` integer DEFAULT 7 NOT NULL,
	`is_recommended` integer DEFAULT false NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT '2026-05-17T06:28:33.844Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `series_courses` (
	`series_id` text NOT NULL,
	`course_id` text NOT NULL,
	`order` integer DEFAULT 0,
	PRIMARY KEY(`series_id`, `course_id`),
	FOREIGN KEY (`series_id`) REFERENCES `series`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade
);
