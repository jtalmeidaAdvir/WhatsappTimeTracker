import Database from 'better-sqlite3';
import path from 'path';

// Create database file in project root
const dbPath = path.join(process.cwd(), 'database.sqlite');
export const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

console.log('✅ Connected to SQLite database at:', dbPath);