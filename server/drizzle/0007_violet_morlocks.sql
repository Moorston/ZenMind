CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`user_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_comments_post` ON `comments` (`post_id`);--> statement-breakpoint
CREATE TABLE `follows` (
	`follower_id` text NOT NULL,
	`following_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`follower_id`, `following_id`),
	FOREIGN KEY (`follower_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`following_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `likes` (
	`user_id` text NOT NULL,
	`post_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`user_id`, `post_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`course_id` text,
	`content` text NOT NULL,
	`type` text DEFAULT 'reflection' NOT NULL,
	`likes_count` integer DEFAULT 0 NOT NULL,
	`comments_count` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_posts_user` ON `posts` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_posts_created` ON `posts` (`created_at`);--> statement-breakpoint
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
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`instructor_id`) REFERENCES `instructors`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`series_id`) REFERENCES `series`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_courses`("id", "title", "description", "category", "level", "duration", "cover_url", "audio_url", "tags", "instructor_id", "series_id", "order_in_series", "created_at") SELECT "id", "title", "description", "category", "level", "duration", "cover_url", "audio_url", "tags", "instructor_id", "series_id", "order_in_series", "created_at" FROM `courses`;--> statement-breakpoint
DROP TABLE `courses`;--> statement-breakpoint
ALTER TABLE `__new_courses` RENAME TO `courses`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_courses_category` ON `courses` (`category`);--> statement-breakpoint
CREATE INDEX `idx_courses_level` ON `courses` (`level`);--> statement-breakpoint
CREATE INDEX `idx_courses_instructor` ON `courses` (`instructor_id`);--> statement-breakpoint
CREATE TABLE `__new_email_verification_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`code` text NOT NULL,
	`expires_at` text NOT NULL,
	`used` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_email_verification_codes`("id", "email", "code", "expires_at", "used", "created_at") SELECT "id", "email", "code", "expires_at", "used", "created_at" FROM `email_verification_codes`;--> statement-breakpoint
DROP TABLE `email_verification_codes`;--> statement-breakpoint
ALTER TABLE `__new_email_verification_codes` RENAME TO `email_verification_codes`;--> statement-breakpoint
CREATE INDEX `idx_email_codes_email` ON `email_verification_codes` (`email`,`code`,`used`);--> statement-breakpoint
CREATE TABLE `__new_instructors` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`avatar_url` text NOT NULL,
	`bio` text NOT NULL,
	`voice_type` text DEFAULT 'gentle' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_instructors`("id", "name", "avatar_url", "bio", "voice_type", "created_at") SELECT "id", "name", "avatar_url", "bio", "voice_type", "created_at" FROM `instructors`;--> statement-breakpoint
DROP TABLE `instructors`;--> statement-breakpoint
ALTER TABLE `__new_instructors` RENAME TO `instructors`;--> statement-breakpoint
CREATE TABLE `__new_memberships` (
	`user_id` text PRIMARY KEY NOT NULL,
	`level` text DEFAULT 'free' NOT NULL,
	`expires_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_memberships`("user_id", "level", "expires_at", "created_at") SELECT "user_id", "level", "expires_at", "created_at" FROM `memberships`;--> statement-breakpoint
DROP TABLE `memberships`;--> statement-breakpoint
ALTER TABLE `__new_memberships` RENAME TO `memberships`;--> statement-breakpoint
CREATE TABLE `__new_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`item_id` text,
	`amount` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`payment_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`paid_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_orders`("id", "user_id", "type", "item_id", "amount", "status", "payment_id", "created_at", "paid_at") SELECT "id", "user_id", "type", "item_id", "amount", "status", "payment_id", "created_at", "paid_at" FROM `orders`;--> statement-breakpoint
DROP TABLE `orders`;--> statement-breakpoint
ALTER TABLE `__new_orders` RENAME TO `orders`;--> statement-breakpoint
CREATE TABLE `__new_progress` (
	`user_id` text NOT NULL,
	`course_id` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`completed_at` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`user_id`, `course_id`),
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_progress`("user_id", "course_id", "position", "completed", "completed_at", "updated_at") SELECT "user_id", "course_id", "position", "completed", "completed_at", "updated_at" FROM `progress`;--> statement-breakpoint
DROP TABLE `progress`;--> statement-breakpoint
ALTER TABLE `__new_progress` RENAME TO `progress`;--> statement-breakpoint
CREATE INDEX `idx_progress_user` ON `progress` (`user_id`);--> statement-breakpoint
CREATE TABLE `__new_push_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`platform` text NOT NULL,
	`token` text,
	`reminder_time` text,
	`enabled` integer DEFAULT false NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_push_tokens`("id", "user_id", "platform", "token", "reminder_time", "enabled", "updated_at") SELECT "id", "user_id", "platform", "token", "reminder_time", "enabled", "updated_at" FROM `push_tokens`;--> statement-breakpoint
DROP TABLE `push_tokens`;--> statement-breakpoint
ALTER TABLE `__new_push_tokens` RENAME TO `push_tokens`;--> statement-breakpoint
CREATE INDEX `idx_push_tokens_enabled_reminder` ON `push_tokens` (`enabled`,`reminder_time`);--> statement-breakpoint
CREATE TABLE `__new_series` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`cover_url` text NOT NULL,
	`level` text DEFAULT 'beginner' NOT NULL,
	`estimated_days` integer DEFAULT 7 NOT NULL,
	`is_recommended` integer DEFAULT false NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
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
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "email", "password", "nickname", "token", "role", "wechat_openid", "avatar_url", "created_at") SELECT "id", "email", "password", "nickname", "token", "role", "wechat_openid", "avatar_url", "created_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users_token` ON `users` (`token`);