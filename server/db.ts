import { drizzle } from "drizzle-orm/neon-http";
import { neon, Pool } from "@neondatabase/serverless";
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create connection pool for better performance
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

const sql = neon(process.env.DATABASE_URL!, {
  fetchConnectionCache: true,
  fullResults: true,
});

const db = drizzle(sql, { 
  schema,
  logger: process.env.NODE_ENV === 'development'
});

export { db, pool };