import { relations } from "drizzle-orm/relations";
import { appProjects, appTasks, contentCategories, contentTypes, contentPieces, contentProgress, appTimeEntries, testCases, appSprints, groceryLists, groceryItems, bills, billPayments, qualityIssues, miniGameBlocks, miniGameDesigns, performanceInsights, todos, timeBlocks, habits, habitLogs, socialMediaPosts, socialMediaAnalytics } from "./schema";

export const appTasksRelations = relations(appTasks, ({one, many}) => ({
	appProject: one(appProjects, {
		fields: [appTasks.projectId],
		references: [appProjects.id]
	}),
	appTimeEntries: many(appTimeEntries),
	testCases: many(testCases),
	qualityIssues: many(qualityIssues),
}));

export const appProjectsRelations = relations(appProjects, ({many}) => ({
	appTasks: many(appTasks),
	appTimeEntries: many(appTimeEntries),
	testCases: many(testCases),
	appSprints: many(appSprints),
	qualityIssues: many(qualityIssues),
}));

export const contentTypesRelations = relations(contentTypes, ({one, many}) => ({
	contentCategory: one(contentCategories, {
		fields: [contentTypes.categoryId],
		references: [contentCategories.id]
	}),
	contentPieces: many(contentPieces),
}));

export const contentCategoriesRelations = relations(contentCategories, ({many}) => ({
	contentTypes: many(contentTypes),
}));

export const contentPiecesRelations = relations(contentPieces, ({one, many}) => ({
	contentType: one(contentTypes, {
		fields: [contentPieces.contentTypeId],
		references: [contentTypes.id]
	}),
	contentProgresses: many(contentProgress),
}));

export const contentProgressRelations = relations(contentProgress, ({one}) => ({
	contentPiece: one(contentPieces, {
		fields: [contentProgress.contentPieceId],
		references: [contentPieces.id]
	}),
}));

export const appTimeEntriesRelations = relations(appTimeEntries, ({one}) => ({
	appProject: one(appProjects, {
		fields: [appTimeEntries.projectId],
		references: [appProjects.id]
	}),
	appTask: one(appTasks, {
		fields: [appTimeEntries.taskId],
		references: [appTasks.id]
	}),
}));

export const testCasesRelations = relations(testCases, ({one, many}) => ({
	appProject: one(appProjects, {
		fields: [testCases.projectId],
		references: [appProjects.id]
	}),
	appTask: one(appTasks, {
		fields: [testCases.taskId],
		references: [appTasks.id]
	}),
	qualityIssues: many(qualityIssues),
}));

export const appSprintsRelations = relations(appSprints, ({one}) => ({
	appProject: one(appProjects, {
		fields: [appSprints.projectId],
		references: [appProjects.id]
	}),
}));

export const groceryItemsRelations = relations(groceryItems, ({one}) => ({
	groceryList: one(groceryLists, {
		fields: [groceryItems.listId],
		references: [groceryLists.id]
	}),
}));

export const groceryListsRelations = relations(groceryLists, ({many}) => ({
	groceryItems: many(groceryItems),
}));

export const billPaymentsRelations = relations(billPayments, ({one}) => ({
	bill: one(bills, {
		fields: [billPayments.billId],
		references: [bills.id]
	}),
}));

export const billsRelations = relations(bills, ({many}) => ({
	billPayments: many(billPayments),
}));

export const qualityIssuesRelations = relations(qualityIssues, ({one}) => ({
	appProject: one(appProjects, {
		fields: [qualityIssues.projectId],
		references: [appProjects.id]
	}),
	appTask: one(appTasks, {
		fields: [qualityIssues.taskId],
		references: [appTasks.id]
	}),
	testCase: one(testCases, {
		fields: [qualityIssues.testCaseId],
		references: [testCases.id]
	}),
}));

export const miniGameDesignsRelations = relations(miniGameDesigns, ({one, many}) => ({
	miniGameBlock: one(miniGameBlocks, {
		fields: [miniGameDesigns.miniGameBlockId],
		references: [miniGameBlocks.id]
	}),
	socialMediaPosts: many(socialMediaPosts),
}));

export const miniGameBlocksRelations = relations(miniGameBlocks, ({many}) => ({
	miniGameDesigns: many(miniGameDesigns),
	performanceInsights: many(performanceInsights),
}));

export const performanceInsightsRelations = relations(performanceInsights, ({one}) => ({
	miniGameBlock: one(miniGameBlocks, {
		fields: [performanceInsights.miniGameBlockId],
		references: [miniGameBlocks.id]
	}),
}));

export const timeBlocksRelations = relations(timeBlocks, ({one}) => ({
	todo: one(todos, {
		fields: [timeBlocks.todoId],
		references: [todos.id]
	}),
}));

export const todosRelations = relations(todos, ({many}) => ({
	timeBlocks: many(timeBlocks),
}));

export const habitLogsRelations = relations(habitLogs, ({one}) => ({
	habit: one(habits, {
		fields: [habitLogs.habitId],
		references: [habits.id]
	}),
}));

export const habitsRelations = relations(habits, ({many}) => ({
	habitLogs: many(habitLogs),
}));

export const socialMediaPostsRelations = relations(socialMediaPosts, ({one, many}) => ({
	miniGameDesign: one(miniGameDesigns, {
		fields: [socialMediaPosts.miniGameDesignId],
		references: [miniGameDesigns.id]
	}),
	socialMediaAnalytics: many(socialMediaAnalytics),
}));

export const socialMediaAnalyticsRelations = relations(socialMediaAnalytics, ({one}) => ({
	socialMediaPost: one(socialMediaPosts, {
		fields: [socialMediaAnalytics.postId],
		references: [socialMediaPosts.id]
	}),
}));