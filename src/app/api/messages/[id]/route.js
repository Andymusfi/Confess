import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    // Auto-delete messages that have been posted for more than 2 days
    db.exec(`
      DELETE FROM messages 
      WHERE status = 'posted' 
      AND (julianday('now') - julianday(COALESCE(updated_at, created_at))) >= 2
    `);

    const stmt = db.prepare('SELECT id, to_name, from_name, message_text, song, status, created_at FROM messages WHERE id = ?');
    const message = stmt.get(id);

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    // Check auth
    const authCookie = request.cookies.get('admin_auth')?.value;
    if (authCookie !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const stmt = db.prepare("UPDATE messages SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    const result = stmt.run(status, id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
