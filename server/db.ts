import dotenv from "dotenv";
dotenv.config();

// Import 'pg' correctly for ES modules
import pkg from "pg";
const { Pool } = pkg; // Correct way to use Pool with ES modules

import { drizzle } from "drizzle-orm/node-postgres";

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Create a PostgreSQL connection pool
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Initialize Drizzle with the PostgreSQL connection
export const db = drizzle(pool);
