import Database from 'better-sqlite3';
import path from 'path';

// Define DB path in the project root
const dbPath = path.join(process.cwd(), 'messages.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    to_name TEXT NOT NULL,
    from_name TEXT NOT NULL,
    message_text TEXT NOT NULL,
    song TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

try {
  db.exec('ALTER TABLE messages ADD COLUMN updated_at DATETIME');
} catch (e) {
  // Ignore if column already exists
}

export default db;
