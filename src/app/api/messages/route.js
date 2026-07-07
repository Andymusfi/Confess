import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { nanoid } from 'nanoid';

export async function POST(request) {
  try {
    const { to_name, from_name, message_text, song } = await request.json();
    
    if (!to_name || !message_text) {
      return NextResponse.json({ error: 'To and Message are required' }, { status: 400 });
    }

    // Generate a short ID (e.g. 8 chars)
    const id = nanoid(8);
    
    const stmt = db.prepare(`
      INSERT INTO messages (id, to_name, from_name, message_text, song)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, to_name, from_name || '', message_text, song || '');

    return NextResponse.json({ id, message: 'Message sent successfully' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// For Admin: Get all messages
export async function GET(request) {
  try {
    // Check auth via cookie (simplified for this prototype)
    const authCookie = request.cookies.get('admin_auth')?.value;
    if (authCookie !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Auto-delete messages that have been posted for more than 2 days
    db.exec(`
      DELETE FROM messages 
      WHERE status = 'posted' 
      AND (julianday('now') - julianday(COALESCE(updated_at, created_at))) >= 2
    `);

    const stmt = db.prepare('SELECT * FROM messages ORDER BY created_at DESC');
    const messages = stmt.all();
    
    return NextResponse.json({ messages });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
