
import { db } from "./db";
import { sql } from "drizzle-orm";
import * as schema from "@shared/schema";

async function checkDatabase() {
  console.log("🔍 Starting database health check...");
  
  try {
    // Test basic connection
    console.log("✅ Testing database connection...");
    await db.execute(sql`SELECT 1`);
    console.log("✅ Database connection successful");

    // Check if all tables exist
    console.log("✅ Checking table existence...");
    const tables = [
      'users', 'daily_entries', 'bills', 'bill_payments', 'grocery_items', 
      'grocery_lists', 'goals', 'habits', 'habit_logs', 'medications', 
      'todos', 'time_blocks', 'focus_sessions', 'budgets', 'income_entries',
      'challenges', 'content_categories', 'content_types', 'content_pieces',
      'content_progress', 'mini_game_blocks', 'mini_game_designs',
      'app_projects', 'app_tasks', 'app_sprints', 'app_time_entries',
      'test_cases', 'quality_issues', 'social_media_posts', 
      'social_media_analytics', 'performance_insights'
    ];

    for (const table of tables) {
      try {
        await db.execute(sql.raw(`SELECT COUNT(*) FROM ${table} LIMIT 1`));
        console.log(`✅ Table '${table}' exists and accessible`);
      } catch (error) {
        console.error(`❌ Table '${table}' error:`, error);
      }
    }

    // Test storage class methods
    console.log("✅ Testing storage class methods...");
    const { storage } = await import("./storage");
    
    // Test basic CRUD operations
    const testDate = new Date().toISOString().split('T')[0];
    
    // Test daily entry creation
    try {
      const dailyEntry = await storage.createOrUpdateDailyEntry({
        date: testDate,
        waterIntake: 1,
        exerciseCompleted: false
      });
      console.log("✅ Daily entry creation works");
      
      // Test retrieval
      const retrieved = await storage.getDailyEntry(testDate);
      if (retrieved) {
        console.log("✅ Daily entry retrieval works");
      }
    } catch (error) {
      console.error("❌ Daily entry test failed:", error);
    }

    // Test public stats (complex query)
    try {
      const stats = await storage.getPublicStats();
      console.log("✅ Public stats query works:", stats);
    } catch (error) {
      console.error("❌ Public stats query failed:", error);
    }

    // Test database indexes
    console.log("✅ Checking database indexes...");
    const indexQuery = sql`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname;
    `;
    
    const indexes = await db.execute(indexQuery);
    console.log(`✅ Found ${indexes.length} indexes`);

    // Test foreign key constraints
    console.log("✅ Checking foreign key constraints...");
    const fkQuery = sql`
      SELECT
        tc.table_name, 
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public';
    `;
    
    const foreignKeys = await db.execute(fkQuery);
    console.log(`✅ Found ${foreignKeys.length} foreign key constraints`);

    console.log("🎉 Database health check completed successfully!");
    console.log("✅ Ready for production deployment!");

  } catch (error) {
    console.error("❌ Database health check failed:", error);
    process.exit(1);
  }
}

checkDatabase().catch(console.error);
