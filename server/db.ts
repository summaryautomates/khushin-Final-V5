import Database from "@replit/database";

// Export instance of Replit Database
export const db = new Database();

// Simple health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // Test the connection by attempting to write and read a value
    const testKey = "health_check";
    const testValue = new Date().toISOString();

    await db.set(testKey, testValue);
    const retrieved = await db.get(testKey);

    // Extract the actual value from the response object
    const actual = (retrieved && typeof retrieved === "object" && "value" in retrieved)
      ? retrieved.value
      : retrieved;

    const success = actual === testValue;

    if (success) {
      console.log('Database health check passed:', {
        testKey,
        matched: true,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('Database health check failed: values do not match', {
        testKey,
        expected: testValue,
        received: actual,
        timestamp: new Date().toISOString()
      });
    }

    return success;
  } catch (error) {
    console.error('Database health check failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

// Graceful shutdown helper (no-op for Replit DB as it doesn't need explicit cleanup)
export async function closeDatabase(): Promise<void> {
  // Nothing to close for Replit DB
  console.log('Database connection closed successfully');
}