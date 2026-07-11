CREATE TABLE `push_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`platform` text NOT NULL,
	`token` text,
	`reminder_time` text,
	`enabled` integer DEFAULT false NOT NULL,
	`updated_at` text DEFAULT '2026-07-08T04:58:52.801Z' NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_courses` (
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
	`created_at` text DEFAULT '2026-07-08T04:58:52.684Z' NOT NULL,
	FOREIGN KEY (`instructor_id`) REFERENCES `instructors`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`series_id`) REFERENCES `series`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_courses`("id", "title", "description", "category", "level", "duration", "cover_url", "audio_url", "tags", "instructor_id", "series_id", "order_in_series", "created_at") SELECT "id", "title", "description", "category", "level", "duration", "cover_url", "audio_url", "tags", "instructor_id", "series_id", "order_in_series", "created_at" FROM `courses`;--> statement-breakpoint
DROP TABLE `courses`;--> statement-breakpoint
ALTER TABLE `__new_courses` RENAME TO `courses`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_email_verification_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`code` text NOT NULL,
	`expires_at` text NOT NULL,
	`used` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT '2026-07-08T04:58:52.687Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_email_verification_codes`("id", "email", "code", "expires_at", "used", "created_at") SELECT "id", "email", "code", "expires_at", "used", "created_at" FROM `email_verification_codes`;--> statement-breakpoint
DROP TABLE `email_verification_codes`;--> statement-breakpoint
ALTER TABLE `__new_email_verification_codes` RENAME TO `email_verification_codes`;--> statement-breakpoint
CREATE TABLE `__new_instructors` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`avatar_url` text NOT NULL,
	`bio` text NOT NULL,
	`voice_type` text DEFAULT 'gentle' NOT NULL,
	`created_at` text DEFAULT '2026-07-08T04:58:52.677Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_instructors`("id", "name", "avatar_url", "bio", "voice_type", "created_at") SELECT "id", "name", "avatar_url", "bio", "voice_type", "created_at" FROM `instructors`;--> statement-breakpoint
DROP TABLE `instructors`;--> statement-breakpoint
ALTER TABLE `__new_instructors` RENAME TO `instructors`;--> statement-breakpoint
CREATE TABLE `__new_progress` (
	`user_id` text NOT NULL,
	`course_id` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`completed_at` text,
	`updated_at` text DEFAULT '2026-07-08T04:58:52.790Z' NOT NULL,
	PRIMARY KEY(`user_id`, `course_id`),
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_progress`("user_id", "course_id", "position", "completed", "completed_at", "updated_at") SELECT "user_id", "course_id", "position", "completed", "completed_at", "updated_at" FROM `progress`;--> statement-breakpoint
DROP TABLE `progress`;--> statement-breakpoint
ALTER TABLE `__new_progress` RENAME TO `progress`;--> statement-breakpoint
CREATE TABLE `__new_series` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`cover_url` text NOT NULL,
	`level` text DEFAULT 'beginner' NOT NULL,
	`estimated_days` integer DEFAULT 7 NOT NULL,
	`is_recommended` integer DEFAULT false NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT '2026-07-08T04:58:52.682Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_series`("id", "title", "description", "cover_url", "level", "estimated_days", "is_recommended", "order", "created_at") SELECT "id", "title", "description", "cover_url", "level", "estimated_days", "is_recommended", "order", "created_at" FROM `series`;--> statement-breakpoint
DROP TABLE `series`;--> statement-breakpoint
ALTER TABLE `__new_series` RENAME TO `series`;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`nickname` text NOT NULL,
	`token` text,
	`role` text DEFAULT 'user' NOT NULL,
	`wechat_openid` text,
	`avatar_url` text,
	`created_at` text DEFAULT '2026-07-08T04:58:52.793Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "email", "password", "nickname", "token", "role", "wechat_openid", "avatar_url", "created_at") SELECT "id", "email", "password", "nickname", "token", "role", "wechat_openid", "avatar_url", "created_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);