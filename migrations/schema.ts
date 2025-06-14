import { pgTable, foreignKey, serial, integer, text, timestamp, boolean, numeric, date, index, unique, time, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const appTasks = pgTable("app_tasks", {
	id: serial().primaryKey().notNull(),
	projectId: integer("project_id").notNull(),
	title: text().notNull(),
	description: text().default(').notNull(),
	status: text().default('todo').notNull(),
	priority: text().default('medium').notNull(),
	category: text().default('feature').notNull(),
	assignee: text(),
	estimatedHours: integer("estimated_hours"),
	actualHours: integer("actual_hours").default(0),
	dueDate: timestamp("due_date", { mode: 'string' }),
	completedDate: timestamp("completed_date", { mode: 'string' }),
	dependencies: text().array().default([""]).notNull(),
	tags: text().array().default([""]).notNull(),
	attachments: text().array().default([""]).notNull(),
	comments: text().default(').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [appProjects.id],
			name: "app_tasks_project_id_app_projects_id_fk"
		}),
]);

export const appProjects = pgTable("app_projects", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text().default(').notNull(),
	status: text().default('planning').notNull(),
	priority: text().default('medium').notNull(),
	projectType: text("project_type").default('web').notNull(),
	repositoryUrl: text("repository_url"),
	deploymentUrl: text("deployment_url"),
	targetDate: timestamp("target_date", { mode: 'string' }),
	startDate: timestamp("start_date", { mode: 'string' }),
	completedDate: timestamp("completed_date", { mode: 'string' }),
	progress: integer().default(0).notNull(),
	estimatedHours: integer("estimated_hours"),
	actualHours: integer("actual_hours").default(0),
	techStack: text("tech_stack").array().default([""]).notNull(),
	tags: text().array().default([""]).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const contentTypes = pgTable("content_types", {
	id: serial().primaryKey().notNull(),
	categoryId: integer("category_id").notNull(),
	name: text().notNull(),
	description: text(),
	frequency: text().notNull(),
	targetCount: integer("target_count").notNull(),
	isRecurring: boolean("is_recurring").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [contentCategories.id],
			name: "content_types_category_id_content_categories_id_fk"
		}),
]);

export const budgets = pgTable("budgets", {
	id: serial().primaryKey().notNull(),
	category: text().notNull(),
	monthlyLimit: numeric("monthly_limit", { precision: 8, scale:  2 }).notNull(),
	spent: numeric({ precision: 8, scale:  2 }).default('0'),
	month: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const challenges = pgTable("challenges", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	type: text().notNull(),
	targetValue: integer("target_value").notNull(),
	currentValue: integer("current_value").default(0),
	startDate: date("start_date").notNull(),
	endDate: date("end_date").notNull(),
	isActive: boolean("is_active").default(true),
	isCompleted: boolean("is_completed").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const contentPieces = pgTable("content_pieces", {
	id: serial().primaryKey().notNull(),
	contentTypeId: integer("content_type_id").notNull(),
	title: text().notNull(),
	description: text(),
	status: text().default('idea'),
	targetDate: date("target_date"),
	scheduledDate: date("scheduled_date"),
	publishedDate: date("published_date"),
	notes: text(),
	priority: text().default('medium'),
	estimatedDuration: integer("estimated_duration"),
	actualDuration: integer("actual_duration"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	platforms: text().array().default([""]),
	tags: text().array().default([""]),
	assignee: text(),
}, (table) => [
	foreignKey({
			columns: [table.contentTypeId],
			foreignColumns: [contentTypes.id],
			name: "content_pieces_content_type_id_content_types_id_fk"
		}),
]);

export const contentProgress = pgTable("content_progress", {
	id: serial().primaryKey().notNull(),
	contentPieceId: integer("content_piece_id").notNull(),
	phase: text().notNull(),
	isCompleted: boolean("is_completed").default(false),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.contentPieceId],
			foreignColumns: [contentPieces.id],
			name: "content_progress_content_piece_id_content_pieces_id_fk"
		}),
]);

export const contentCategories = pgTable("content_categories", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	color: text().default('#8B5CF6'),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const appTimeEntries = pgTable("app_time_entries", {
	id: serial().primaryKey().notNull(),
	projectId: integer("project_id").notNull(),
	taskId: integer("task_id"),
	description: text().notNull(),
	startTime: timestamp("start_time", { mode: 'string' }).notNull(),
	endTime: timestamp("end_time", { mode: 'string' }),
	duration: integer().default(0).notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	billable: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [appProjects.id],
			name: "app_time_entries_project_id_app_projects_id_fk"
		}),
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [appTasks.id],
			name: "app_time_entries_task_id_app_tasks_id_fk"
		}),
]);

export const bills = pgTable("bills", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	amount: numeric({ precision: 8, scale:  2 }).notNull(),
	isAutoPay: boolean("is_auto_pay").default(false),
	dueDate: integer("due_date").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const focusSessions = pgTable("focus_sessions", {
	id: serial().primaryKey().notNull(),
	date: date().notNull(),
	startTime: timestamp("start_time", { mode: 'string' }).notNull(),
	endTime: timestamp("end_time", { mode: 'string' }),
	plannedDuration: integer("planned_duration").notNull(),
	actualDuration: integer("actual_duration"),
	taskDescription: text("task_description"),
	wasSuccessful: boolean("was_successful"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const habits = pgTable("habits", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	category: text().notNull(),
	targetFrequency: integer("target_frequency").default(1),
	currentStreak: integer("current_streak").default(0),
	longestStreak: integer("longest_streak").default(0),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const incomeEntries = pgTable("income_entries", {
	id: serial().primaryKey().notNull(),
	source: text().notNull(),
	amount: numeric({ precision: 8, scale:  2 }).notNull(),
	date: date().notNull(),
	category: text(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const medications = pgTable("medications", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	dosage: text(),
	frequency: text(),
	reminderTimes: text("reminder_times"),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const groceryLists = pgTable("grocery_lists", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	isRecurring: boolean("is_recurring").default(false),
	isTemplate: boolean("is_template").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const goals = pgTable("goals", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	category: text().notNull(),
	targetValue: numeric("target_value", { precision: 8, scale:  2 }),
	currentValue: numeric("current_value", { precision: 8, scale:  2 }).default('0'),
	unit: text(),
	targetDate: date("target_date"),
	isCompleted: boolean("is_completed").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("goals_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("goals_completed_idx").using("btree", table.isCompleted.asc().nullsLast().op("bool_ops")),
	index("goals_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("goals_target_date_idx").using("btree", table.targetDate.asc().nullsLast().op("date_ops")),
]);

export const dailyEntries = pgTable("daily_entries", {
	id: serial().primaryKey().notNull(),
	date: date().notNull(),
	waterIntake: integer("water_intake").default(0),
	exerciseCompleted: boolean("exercise_completed").default(false),
	exerciseNotes: text("exercise_notes"),
	breakfastCompleted: boolean("breakfast_completed").default(false),
	lunchCompleted: boolean("lunch_completed").default(false),
	dinnerCompleted: boolean("dinner_completed").default(false),
	napTaken: boolean("nap_taken").default(false),
	napDuration: integer("nap_duration"),
	wakeUpTime: time("wake_up_time"),
	sleepHours: numeric("sleep_hours", { precision: 3, scale:  1 }),
	sleepQuality: integer("sleep_quality"),
	mood: text(),
	energyLevel: integer("energy_level"),
	stressLevel: integer("stress_level"),
	symptoms: jsonb(),
	medicationsTaken: jsonb("medications_taken"),
	periodFlow: text("period_flow"),
	periodSymptoms: jsonb("period_symptoms"),
	workHours: numeric("work_hours", { precision: 3, scale:  1 }).default('0'),
	tvHours: numeric("tv_hours", { precision: 3, scale:  1 }).default('0'),
	phoneHours: numeric("phone_hours", { precision: 3, scale:  1 }).default('0'),
	focusSessionsCompleted: integer("focus_sessions_completed").default(0),
	cashSavings: numeric("cash_savings", { precision: 10, scale:  2 }).default('0'),
	grocerySpent: numeric("grocery_spent", { precision: 8, scale:  2 }).default('0'),
	dailyIncome: numeric("daily_income", { precision: 8, scale:  2 }).default('0'),
	habitCompletions: jsonb("habit_completions"),
	todoItems: jsonb("todo_items"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("daily_entries_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("daily_entries_date_idx").using("btree", table.date.asc().nullsLast().op("date_ops")),
	unique("daily_entries_date_unique").on(table.date),
]);

export const testCases = pgTable("test_cases", {
	id: serial().primaryKey().notNull(),
	projectId: integer("project_id").notNull(),
	taskId: integer("task_id"),
	title: text().notNull(),
	description: text().default(').notNull(),
	category: text().default('functionality').notNull(),
	priority: text().default('medium').notNull(),
	status: text().default('pending').notNull(),
	steps: text().array().default([""]).notNull(),
	expectedResult: text("expected_result").default(').notNull(),
	actualResult: text("actual_result").default(').notNull(),
	testedBy: text("tested_by"),
	testedAt: timestamp("tested_at", { mode: 'string' }),
	environment: text().default('development').notNull(),
	browserOrDevice: text("browser_or_device"),
	notes: text().default(').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [appProjects.id],
			name: "test_cases_project_id_app_projects_id_fk"
		}),
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [appTasks.id],
			name: "test_cases_task_id_app_tasks_id_fk"
		}),
]);

export const appSprints = pgTable("app_sprints", {
	id: serial().primaryKey().notNull(),
	projectId: integer("project_id").notNull(),
	name: text().notNull(),
	description: text().default(').notNull(),
	status: text().default('planning').notNull(),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }).notNull(),
	goal: text().default(').notNull(),
	velocity: integer().default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [appProjects.id],
			name: "app_sprints_project_id_app_projects_id_fk"
		}),
]);

export const groceryItems = pgTable("grocery_items", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	estimatedPrice: numeric("estimated_price", { precision: 6, scale:  2 }),
	isCompleted: boolean("is_completed").default(false),
	listId: integer("list_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.listId],
			foreignColumns: [groceryLists.id],
			name: "grocery_items_list_id_grocery_lists_id_fk"
		}),
]);

export const billPayments = pgTable("bill_payments", {
	id: serial().primaryKey().notNull(),
	billId: integer("bill_id").notNull(),
	date: date().notNull(),
	amount: numeric({ precision: 8, scale:  2 }).notNull(),
	isPaid: boolean("is_paid").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.billId],
			foreignColumns: [bills.id],
			name: "bill_payments_bill_id_bills_id_fk"
		}),
]);

export const miniGameBlocks = pgTable("mini_game_blocks", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	frequency: text().notNull(),
	frequencyValue: integer("frequency_value").notNull(),
	color: text().default('#8B5CF6'),
	category: text().default('engagement'),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const todos = pgTable("todos", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	priority: text().default('medium'),
	category: text(),
	dueDate: date("due_date"),
	isCompleted: boolean("is_completed").default(false),
	estimatedDuration: integer("estimated_duration"),
	actualDuration: integer("actual_duration"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const qualityIssues = pgTable("quality_issues", {
	id: serial().primaryKey().notNull(),
	projectId: integer("project_id").notNull(),
	taskId: integer("task_id"),
	testCaseId: integer("test_case_id"),
	title: text().notNull(),
	description: text().default(').notNull(),
	category: text().default('bug').notNull(),
	severity: text().default('medium').notNull(),
	status: text().default('open').notNull(),
	priority: text().default('medium').notNull(),
	foundIn: text("found_in").default('development').notNull(),
	assignedTo: text("assigned_to"),
	stepsToReproduce: text("steps_to_reproduce").array().default([""]).notNull(),
	expectedBehavior: text("expected_behavior").default(').notNull(),
	actualBehavior: text("actual_behavior").default(').notNull(),
	workaround: text().default(').notNull(),
	resolution: text().default(').notNull(),
	resolvedAt: timestamp("resolved_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [appProjects.id],
			name: "quality_issues_project_id_app_projects_id_fk"
		}),
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [appTasks.id],
			name: "quality_issues_task_id_app_tasks_id_fk"
		}),
	foreignKey({
			columns: [table.testCaseId],
			foreignColumns: [testCases.id],
			name: "quality_issues_test_case_id_test_cases_id_fk"
		}),
]);

export const miniGameDesigns = pgTable("mini_game_designs", {
	id: serial().primaryKey().notNull(),
	miniGameBlockId: integer("mini_game_block_id").notNull(),
	title: text().notNull(),
	description: text(),
	designNotes: text("design_notes"),
	status: text().default('designed'),
	targetDate: date("target_date"),
	designedDate: date("designed_date"),
	reviewedDate: date("reviewed_date"),
	approvedDate: date("approved_date"),
	version: integer().default(1),
	isTemplate: boolean("is_template").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.miniGameBlockId],
			foreignColumns: [miniGameBlocks.id],
			name: "mini_game_designs_mini_game_block_id_mini_game_blocks_id_fk"
		}),
]);

export const performanceInsights = pgTable("performance_insights", {
	id: serial().primaryKey().notNull(),
	miniGameBlockId: integer("mini_game_block_id").notNull(),
	platform: text().notNull(),
	dayOfWeek: text("day_of_week").notNull(),
	timeSlot: text("time_slot").notNull(),
	postType: text("post_type").notNull(),
	avgImpressions: integer("avg_impressions").default(0).notNull(),
	avgReach: integer("avg_reach").default(0).notNull(),
	avgLikes: integer("avg_likes").default(0).notNull(),
	avgComments: integer("avg_comments").default(0).notNull(),
	avgShares: integer("avg_shares").default(0).notNull(),
	avgEngagementRate: integer("avg_engagement_rate").default(0).notNull(),
	totalPosts: integer("total_posts").default(0).notNull(),
	lastUpdated: timestamp("last_updated", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.miniGameBlockId],
			foreignColumns: [miniGameBlocks.id],
			name: "performance_insights_mini_game_block_id_mini_game_blocks_id_fk"
		}),
]);

export const timeBlocks = pgTable("time_blocks", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	date: date().notNull(),
	startTime: text("start_time").notNull(),
	endTime: text("end_time").notNull(),
	category: text(),
	todoId: integer("todo_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.todoId],
			foreignColumns: [todos.id],
			name: "time_blocks_todo_id_todos_id_fk"
		}),
]);

export const habitLogs = pgTable("habit_logs", {
	id: serial().primaryKey().notNull(),
	habitId: integer("habit_id").notNull(),
	date: date().notNull(),
	completed: boolean().default(false),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("habit_logs_date_idx").using("btree", table.date.asc().nullsLast().op("date_ops")),
	index("habit_logs_habit_date_idx").using("btree", table.habitId.asc().nullsLast().op("int4_ops"), table.date.asc().nullsLast().op("int4_ops")),
	index("habit_logs_habit_id_idx").using("btree", table.habitId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.habitId],
			foreignColumns: [habits.id],
			name: "habit_logs_habit_id_habits_id_fk"
		}),
]);

export const socialMediaPosts = pgTable("social_media_posts", {
	id: serial().primaryKey().notNull(),
	miniGameDesignId: integer("mini_game_design_id").notNull(),
	platform: text().notNull(),
	postUrl: text("post_url"),
	scheduledDate: timestamp("scheduled_date", { mode: 'string' }).notNull(),
	publishedDate: timestamp("published_date", { mode: 'string' }),
	dayOfWeek: text("day_of_week").notNull(),
	timeSlot: text("time_slot").notNull(),
	postType: text("post_type").notNull(),
	caption: text(),
	hashtags: text().array().default([""]),
	status: text().default('scheduled').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.miniGameDesignId],
			foreignColumns: [miniGameDesigns.id],
			name: "social_media_posts_mini_game_design_id_mini_game_designs_id_fk"
		}),
]);

export const socialMediaAnalytics = pgTable("social_media_analytics", {
	id: serial().primaryKey().notNull(),
	postId: integer("post_id").notNull(),
	impressions: integer().default(0).notNull(),
	reach: integer().default(0).notNull(),
	likes: integer().default(0).notNull(),
	comments: integer().default(0).notNull(),
	shares: integer().default(0).notNull(),
	saves: integer().default(0).notNull(),
	clicks: integer().default(0).notNull(),
	profileViews: integer("profile_views").default(0).notNull(),
	engagementRate: integer("engagement_rate").default(0).notNull(),
	recordedAt: timestamp("recorded_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.postId],
			foreignColumns: [socialMediaPosts.id],
			name: "social_media_analytics_post_id_social_media_posts_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: text().notNull(),
	password: text().notNull(),
	role: text().default('user'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("users_username_idx").using("btree", table.username.asc().nullsLast().op("text_ops")),
	unique("users_username_unique").on(table.username),
]);
