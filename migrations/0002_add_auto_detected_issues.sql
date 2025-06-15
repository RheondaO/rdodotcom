
CREATE TABLE "auto_detected_issues" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"severity" text DEFAULT 'medium' NOT NULL,
	"estimated_effort" text,
	"blocked_features" text[] DEFAULT '{}' NOT NULL,
	"suggested_solution" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'identified' NOT NULL,
	"auto_detected" boolean DEFAULT true,
	"detection_source" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "auto_detected_issues" ADD CONSTRAINT "auto_detected_issues_project_id_app_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."app_projects"("id") ON DELETE no action ON UPDATE no action;
