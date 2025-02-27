import Database from "@replit/database";

// Export instance of Replit Database
export const db = new Database();

// Simple health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await db.list(); // Simple operation to verify connection
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Graceful shutdown helper (no-op for Replit DB as it doesn't need explicit cleanup)
export async function closeDatabase(): Promise<void> {
  // Nothing to close for Replit DB
  console.log('Database connection closed successfully');
}