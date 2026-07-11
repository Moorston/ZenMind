CREATE TABLE `admin_audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`admin_id` text NOT NULL,
	`action` text NOT NULL,
	`target_type` text NOT NULL,
	`target_id` text,
	`old_value` text,
	`new_value` text,
	`created_at` text DEFAULT '2026-07-10T13:00:00.000Z' NOT NULL
);--> statement-breakpoint
CREATE INDEX `idx_audit_admin` ON `admin_audit_logs` (`admin_id`);--> statement-breakpoint
CREATE INDEX `idx_audit_action` ON `admin_audit_logs` (`action`);--> statement-breakpoint
CREATE INDEX `idx_audit_created` ON `admin_audit_logs` (`created_at`);
