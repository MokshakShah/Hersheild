import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getSupabaseAdmin } from '@/lib/supabase';

const BUCKET_NAME = 'evidence';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const supabase = getSupabaseAdmin();

    const { data: record, error: fetchError } = await supabase
      .from('evidence')
      .select('path')
      .eq('id', params.id)
      .eq('user_id', decoded.userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Fetch evidence for delete error:', fetchError);
      return NextResponse.json({ error: 'Failed to locate evidence' }, { status: 500 });
    }

    if (!record) {
      return NextResponse.json({ error: 'Evidence not found' }, { status: 404 });
    }

    const storageDelete = await supabase.storage.from(BUCKET_NAME).remove([record.path]);
    if (storageDelete.error) {
      console.error('Storage delete error:', storageDelete.error);
      return NextResponse.json({ error: 'Failed to delete stored evidence' }, { status: 500 });
    }

    const { error: deleteError } = await supabase
      .from('evidence')
      .delete()
      .eq('id', params.id)
      .eq('user_id', decoded.userId);

    if (deleteError) {
      console.error('Metadata delete error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete evidence record' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE evidence/:id error:', error);
    return NextResponse.json({ error: 'Failed to delete evidence' }, { status: 500 });
  }
}

