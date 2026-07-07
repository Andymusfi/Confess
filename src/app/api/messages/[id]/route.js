import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

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

    const { data: message, error } = await supabase
      .from('messages')
      .select('id, to_name, from_name, message_text, song, status, created_at')
      .eq('id', id)
      .single();

    if (error || !message) {
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
    const authCookie = request.cookies.get('admin_auth')?.value;
    if (authCookie !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const { data, error } = await supabase
      .from('messages')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error || !data || data.length === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
