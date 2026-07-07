const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'messages.db');
const db = new Database(dbPath);

console.log('Checking schema...');
try {
  db.exec('ALTER TABLE messages ADD COLUMN updated_at DATETIME');
  console.log('Successfully added updated_at column.');
} catch (e) {
  console.log('Error or column already exists:', e.message);
}

const stmt = db.prepare("PRAGMA table_info(messages)");
console.log('Table columns:', stmt.all().map(c => c.name));
