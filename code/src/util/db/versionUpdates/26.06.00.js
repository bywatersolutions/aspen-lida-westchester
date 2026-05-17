export const key = '26.06.00';

/**
 * Creates a new table for logging API errors, and an index on the created_at column
 * for faster querying of recent errors.
 * @param db
 * @returns {Promise<void>}
 */
export async function up(db) {
     await db.execAsync(`
          CREATE TABLE IF NOT EXISTS api_error_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at INTEGER NOT NULL,
            method TEXT,
            endpoint TEXT,
            status INTEGER,
            problem TEXT,
            message TEXT,
            request_url TEXT,
            request_params TEXT,
            request_body TEXT,
            response_body TEXT
          );

          CREATE INDEX IF NOT EXISTS idx_api_error_logs_created_at
               ON api_error_logs(created_at DESC);
     `);
}
