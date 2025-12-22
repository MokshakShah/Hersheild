import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getSupabaseAdmin } from '@/lib/supabase';
import { randomUUID } from 'crypto';

type EvidenceType = 'photo' | 'audio';

interface EvidenceRow {
  id: string;
  user_id: string;
  type: EvidenceType;
  path: string;
  size: number;
  created_at: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null;
}

const BUCKET_NAME = 'evidence';

function parseDataUri(dataUri: string): { buffer: Buffer; contentType: string } {
  const matches = /^data:(.+);base64,(.+)$/.exec(dataUri);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid data URI format');
  }

  const contentType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');
  return { buffer, contentType };
}

async function buildSignedUrl(path: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, 60 * 60); // 1 hour

  if (error || !data) {
    throw new Error(`Failed to create signed URL: ${error?.message}`);
  }

  return data.signedUrl;
}

function mapEvidence(row: EvidenceRow, url: string) {
  return {
    id: row.id,
    _id: row.id,
    userId: row.user_id,
    type: row.type,
    dataUri: url,
    timestamp: new Date(row.created_at).toLocaleString(),
    createdAt: new Date(row.created_at).getTime(),
    location: row.location,
    size: row.size,
    path: row.path,
  };
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const userId = decoded.userId;
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from<EvidenceRow>('evidence')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch evidence error:', error);
      return NextResponse.json({ error: 'Failed to load evidence' }, { status: 500 });
    }

    const rows = data || [];

    if (rows.length === 0) {
      return NextResponse.json({ success: true, evidence: [] });
    }

    const paths = rows.map((row) => row.path);
    const signedResponse = await supabase.storage.from(BUCKET_NAME).createSignedUrls(paths, 60 * 60);

    if (signedResponse.error) {
      console.error('Signed URL batch error:', signedResponse.error);
      return NextResponse.json({ error: 'Failed to sign evidence URLs' }, { status: 500 });
    }

    const evidence = rows.map((row, index) => mapEvidence(row, signedResponse.data?.[index]?.signedUrl || ''));

    return NextResponse.json({ success: true, evidence });
  } catch (error) {
    console.error('GET evidence error:', error);
    return NextResponse.json({ error: 'Failed to load evidence' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const userId = decoded.userId;
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { type, dataUri, location } = body as { type: EvidenceType; dataUri: string; location: EvidenceRow['location'] };

    if (!type || !dataUri) {
      return NextResponse.json({ error: 'Type and dataUri are required' }, { status: 400 });
    }

    const { buffer, contentType } = parseDataUri(dataUri);
    const id = randomUUID();
    const extension = type === 'photo' ? 'jpg' : 'wav';
    const path = `${userId}/${id}.${extension}`;

    const uploadResult = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, buffer, { contentType, upsert: false });

    if (uploadResult.error) {
      console.error('Evidence upload error:', uploadResult.error);
      return NextResponse.json({ error: 'Failed to upload evidence' }, { status: 500 });
    }

    const { data: record, error: insertError } = await supabase
      .from('evidence')
      .insert({
        id,
        user_id: userId,
        type,
        path,
        size: buffer.length,
        location: location ?? null,
      })
      .select('*')
      .single();

    if (insertError || !record) {
      console.error('Evidence insert error:', insertError);
      // cleanup uploaded file if metadata fails
      await supabase.storage.from(BUCKET_NAME).remove([path]);
      return NextResponse.json({ error: 'Failed to store evidence metadata' }, { status: 500 });
    }

    const signedUrl = await buildSignedUrl(path);
    return NextResponse.json({
      success: true,
      evidence: mapEvidence(record as EvidenceRow, signedUrl),
    });
  } catch (error) {
    console.error('POST evidence error:', error);
    return NextResponse.json({ error: 'Failed to save evidence' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const userId = decoded.userId;
    const supabase = getSupabaseAdmin();

    const { data: rows, error } = await supabase
      .from<EvidenceRow>('evidence')
      .select('path')
      .eq('user_id', userId);

    if (error) {
      console.error('Fetch evidence for delete error:', error);
      return NextResponse.json({ error: 'Failed to load evidence records' }, { status: 500 });
    }

    const paths = rows?.map((row) => row.path) || [];

    if (paths.length > 0) {
      const removeResult = await supabase.storage.from(BUCKET_NAME).remove(paths);
      if (removeResult.error) {
        console.error('Evidence bulk storage delete error:', removeResult.error);
        return NextResponse.json({ error: 'Failed to delete stored evidence' }, { status: 500 });
      }
    }

    const { error: deleteRowsError } = await supabase
      .from('evidence')
      .delete()
      .eq('user_id', userId);

    if (deleteRowsError) {
      console.error('Evidence bulk metadata delete error:', deleteRowsError);
      return NextResponse.json({ error: 'Failed to delete evidence records' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE evidence error:', error);
    return NextResponse.json({ error: 'Failed to delete evidence' }, { status: 500 });
  }
}

