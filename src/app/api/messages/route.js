import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { nanoid } from 'nanoid';

export async function POST(request) {
  try {
    const { to_name, from_name, message_text, song } = await request.json();
    
    if (!to_name || !message_text) {
      return NextResponse.json({ error: 'To and Message are required' }, { status: 400 });
    }

    const id = nanoid(8);
    
    const { error } = await supabase
      .from('messages')
      .insert([
        { 
          id, 
          to_name, 
          from_name: from_name || '', 
          message_text, 
          song: song || '' 
        }
      ]);
      
    if (error) throw error;

    return NextResponse.json({ id, message: 'Message sent successfully' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// For Admin: Get all messages
export async function GET(request) {
  try {
    const authCookie = request.cookies.get('admin_auth')?.value;
    if (authCookie !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete posted messages older than 2 days
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    // Note: To perfectly replicate COALESCE(updated_at, created_at) >= 2 days, 
    // we would do this in two passes or a custom RPC, but two passes is fine for this scale:
    await supabase
      .from('messages')
      .delete()
      .eq('status', 'posted')
      .lte('updated_at', twoDaysAgo.toISOString());
      
    await supabase
      .from('messages')
      .delete()
      .eq('status', 'posted')
      .is('updated_at', null)
      .lte('created_at', twoDaysAgo.toISOString());

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return NextResponse.json({ messages });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
