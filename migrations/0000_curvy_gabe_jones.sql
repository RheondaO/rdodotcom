CREATE TABLE "app_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'planning' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"project_type" text DEFAULT 'web' NOT NULL,
	"repository_url" text,
	"deployment_url" text,
	"target_date" timestamp,
	"start_date" timestamp,
	"completed_date" timestamp,
	"progress" integer DEFAULT 0 NOT NULL,
	"estimated_hours" integer,
	"actual_hours" integer DEFAULT 0,
	"tech_stack" text[] DEFAULT '{}' NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_sprints" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'planning' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"goal" text DEFAULT '' NOT NULL,
	"velocity" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'todo' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"category" text DEFAULT 'feature' NOT NULL,
	"assignee" text,
	"estimated_hours" integer,
	"actual_hours" integer DEFAULT 0,
	"due_date" timestamp,
	"completed_date" timestamp,
	"dependencies" text[] DEFAULT '{}' NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"attachments" text[] DEFAULT '{}' NOT NULL,
	"comments" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_time_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"task_id" integer,
	"description" text NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"duration" integer DEFAULT 0 NOT NULL,
	"date" timestamp NOT NULL,
	"billable" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bill_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"bill_id" integer NOT NULL,
	"date" date NOT NULL,
	"amount" numeric(8, 2) NOT NULL,
	"is_paid" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bills" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"amount" numeric(8, 2) NOT NULL,
	"is_auto_pay" boolean DEFAULT false,
	"due_date" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"monthly_limit" numeric(8, 2) NOT NULL,
	"spent" numeric(8, 2) DEFAULT '0',
	"month" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"target_value" integer NOT NULL,
	"current_value" integer DEFAULT 0,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"is_active" boolean DEFAULT true,
	"is_completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"color" text DEFAULT '#8B5CF6',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_pieces" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_type_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'idea',
	"target_date" date,
	"scheduled_date" date,
	"published_date" date,
	"platforms" text[] DEFAULT '{}',
	"tags" text[] DEFAULT '{}',
	"notes" text,
	"priority" text DEFAULT 'medium',
	"estimated_duration" integer,
	"actual_duration" integer,
	"assignee" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_piece_id" integer NOT NULL,
	"phase" text NOT NULL,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"frequency" text NOT NULL,
	"target_count" integer NOT NULL,
	"is_recurring" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "daily_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"water_intake" integer DEFAULT 0,
	"exercise_completed" boolean DEFAULT false,
	"exercise_notes" text,
	"breakfast_completed" boolean DEFAULT false,
	"lunch_completed" boolean DEFAULT false,
	"dinner_completed" boolean DEFAULT false,
	"nap_taken" boolean DEFAULT false,
	"nap_duration" integer,
	"wake_up_time" time,
	"sleep_hours" numeric(3, 1),
	"sleep_quality" integer,
	"mood" text,
	"energy_level" integer,
	"stress_level" integer,
	"symptoms" jsonb,
	"medications_taken" jsonb,
	"period_flow" text,
	"period_symptoms" jsonb,
	"work_hours" numeric(3, 1) DEFAULT '0',
	"tv_hours" numeric(3, 1) DEFAULT '0',
	"phone_hours" numeric(3, 1) DEFAULT '0',
	"focus_sessions_completed" integer DEFAULT 0,
	"cash_savings" numeric(10, 2) DEFAULT '0',
	"grocery_spent" numeric(8, 2) DEFAULT '0',
	"daily_income" numeric(8, 2) DEFAULT '0',
	"habit_completions" jsonb,
	"todo_items" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "daily_entries_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "focus_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"planned_duration" integer NOT NULL,
	"actual_duration" integer,
	"task_description" text,
	"was_successful" boolean,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"target_value" numeric(8, 2),
	"current_value" numeric(8, 2) DEFAULT '0',
	"unit" text,
	"target_date" date,
	"is_completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "grocery_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"estimated_price" numeric(6, 2),
	"is_completed" boolean DEFAULT false,
	"list_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "grocery_lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"is_recurring" boolean DEFAULT false,
	"is_template" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "habit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"habit_id" integer NOT NULL,
	"date" date NOT NULL,
	"completed" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "habits" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"target_frequency" integer DEFAULT 1,
	"current_streak" integer DEFAULT 0,
	"longest_streak" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "income_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"amount" numeric(8, 2) NOT NULL,
	"date" date NOT NULL,
	"category" text,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "medications" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"dosage" text,
	"frequency" text,
	"reminder_times" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mini_game_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"frequency" text NOT NULL,
	"frequency_value" integer NOT NULL,
	"color" text DEFAULT '#8B5CF6',
	"category" text DEFAULT 'engagement',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mini_game_designs" (
	"id" serial PRIMARY KEY NOT NULL,
	"mini_game_block_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"design_notes" text,
	"status" text DEFAULT 'designed',
	"target_date" date,
	"designed_date" date,
	"reviewed_date" date,
	"approved_date" date,
	"version" integer DEFAULT 1,
	"is_template" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "performance_insights" (
	"id" serial PRIMARY KEY NOT NULL,
	"mini_game_block_id" integer NOT NULL,
	"platform" text NOT NULL,
	"day_of_week" text NOT NULL,
	"time_slot" text NOT NULL,
	"post_type" text NOT NULL,
	"avg_impressions" integer DEFAULT 0 NOT NULL,
	"avg_reach" integer DEFAULT 0 NOT NULL,
	"avg_likes" integer DEFAULT 0 NOT NULL,
	"avg_comments" integer DEFAULT 0 NOT NULL,
	"avg_shares" integer DEFAULT 0 NOT NULL,
	"avg_engagement_rate" integer DEFAULT 0 NOT NULL,
	"total_posts" integer DEFAULT 0 NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quality_issues" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"task_id" integer,
	"test_case_id" integer,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"category" text DEFAULT 'bug' NOT NULL,
	"severity" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"found_in" text DEFAULT 'development' NOT NULL,
	"assigned_to" text,
	"steps_to_reproduce" text[] DEFAULT '{}' NOT NULL,
	"expected_behavior" text DEFAULT '' NOT NULL,
	"actual_behavior" text DEFAULT '' NOT NULL,
	"workaround" text DEFAULT '' NOT NULL,
	"resolution" text DEFAULT '' NOT NULL,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_media_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"impressions" integer DEFAULT 0 NOT NULL,
	"reach" integer DEFAULT 0 NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"comments" integer DEFAULT 0 NOT NULL,
	"shares" integer DEFAULT 0 NOT NULL,
	"saves" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"profile_views" integer DEFAULT 0 NOT NULL,
	"engagement_rate" integer DEFAULT 0 NOT NULL,
	"recorded_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_media_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"mini_game_design_id" integer NOT NULL,
	"platform" text NOT NULL,
	"post_url" text,
	"scheduled_date" timestamp NOT NULL,
	"published_date" timestamp,
	"day_of_week" text NOT NULL,
	"time_slot" text NOT NULL,
	"post_type" text NOT NULL,
	"caption" text,
	"hashtags" text[] DEFAULT '{}',
	"status" text DEFAULT 'scheduled' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_cases" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"task_id" integer,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"category" text DEFAULT 'functionality' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"steps" text[] DEFAULT '{}' NOT NULL,
	"expected_result" text DEFAULT '' NOT NULL,
	"actual_result" text DEFAULT '' NOT NULL,
	"tested_by" text,
	"tested_at" timestamp,
	"environment" text DEFAULT 'development' NOT NULL,
	"browser_or_device" text,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"date" date NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"category" text,
	"todo_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "todos" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"priority" text DEFAULT 'medium',
	"category" text,
	"due_date" date,
	"is_completed" boolean DEFAULT false,
	"estimated_duration" integer,
	"actual_duration" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'user',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "app_sprints" ADD CONSTRAINT "app_sprints_project_id_app_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."app_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_tasks" ADD CONSTRAINT "app_tasks_project_id_app_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."app_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_time_entries" ADD CONSTRAINT "app_time_entries_project_id_app_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."app_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_time_entries" ADD CONSTRAINT "app_time_entries_task_id_app_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."app_tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bill_payments" ADD CONSTRAINT "bill_payments_bill_id_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."bills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_pieces" ADD CONSTRAINT "content_pieces_content_type_id_content_types_id_fk" FOREIGN KEY ("content_type_id") REFERENCES "public"."content_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_progress" ADD CONSTRAINT "content_progress_content_piece_id_content_pieces_id_fk" FOREIGN KEY ("content_piece_id") REFERENCES "public"."content_pieces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_types" ADD CONSTRAINT "content_types_category_id_content_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."content_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grocery_items" ADD CONSTRAINT "grocery_items_list_id_grocery_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."grocery_lists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_logs" ADD CONSTRAINT "habit_logs_habit_id_habits_id_fk" FOREIGN KEY ("habit_id") REFERENCES "public"."habits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mini_game_designs" ADD CONSTRAINT "mini_game_designs_mini_game_block_id_mini_game_blocks_id_fk" FOREIGN KEY ("mini_game_block_id") REFERENCES "public"."mini_game_blocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_insights" ADD CONSTRAINT "performance_insights_mini_game_block_id_mini_game_blocks_id_fk" FOREIGN KEY ("mini_game_block_id") REFERENCES "public"."mini_game_blocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_issues" ADD CONSTRAINT "quality_issues_project_id_app_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."app_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_issues" ADD CONSTRAINT "quality_issues_task_id_app_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."app_tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_issues" ADD CONSTRAINT "quality_issues_test_case_id_test_cases_id_fk" FOREIGN KEY ("test_case_id") REFERENCES "public"."test_cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_media_analytics" ADD CONSTRAINT "social_media_analytics_post_id_social_media_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."social_media_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_media_posts" ADD CONSTRAINT "social_media_posts_mini_game_design_id_mini_game_designs_id_fk" FOREIGN KEY ("mini_game_design_id") REFERENCES "public"."mini_game_designs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_project_id_app_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."app_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_task_id_app_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."app_tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_blocks" ADD CONSTRAINT "time_blocks_todo_id_todos_id_fk" FOREIGN KEY ("todo_id") REFERENCES "public"."todos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "daily_entries_date_idx" ON "daily_entries" USING btree ("date");--> statement-breakpoint
CREATE INDEX "daily_entries_created_at_idx" ON "daily_entries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "goals_category_idx" ON "goals" USING btree ("category");--> statement-breakpoint
CREATE INDEX "goals_completed_idx" ON "goals" USING btree ("is_completed");--> statement-breakpoint
CREATE INDEX "goals_target_date_idx" ON "goals" USING btree ("target_date");--> statement-breakpoint
CREATE INDEX "goals_created_at_idx" ON "goals" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "habit_logs_habit_id_idx" ON "habit_logs" USING btree ("habit_id");--> statement-breakpoint
CREATE INDEX "habit_logs_date_idx" ON "habit_logs" USING btree ("date");--> statement-breakpoint
CREATE INDEX "habit_logs_habit_date_idx" ON "habit_logs" USING btree ("habit_id","date");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "users" USING btree ("username");