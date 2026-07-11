ALTER TABLE `courses` ADD `is_deleted` integer DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_courses_deleted` ON `courses` (`is_deleted`);
