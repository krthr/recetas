CREATE TABLE `plan_slots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`plan_id` integer NOT NULL,
	`day_of_week` integer NOT NULL,
	`meal_type` text NOT NULL,
	`recipe_id` integer,
	FOREIGN KEY (`plan_id`) REFERENCES `weekly_plans`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`ingredients` text NOT NULL,
	`time` integer NOT NULL,
	`difficulty` text NOT NULL,
	`meal_type` text NOT NULL,
	`photo` text,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `weekly_plans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer NOT NULL
);
