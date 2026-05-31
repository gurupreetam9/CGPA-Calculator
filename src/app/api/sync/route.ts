import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/token-verifier';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;

function getSupabaseAdmin() {
  if (!supabaseServiceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not configured. Add it to .env.local.'
    );
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

async function authenticateRequest(
  request: NextRequest
): Promise<{ uid: string; email?: string } | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  return verifyFirebaseToken(token, firebaseProjectId);
}

// GET: Fetch user's saved data from Supabase
export async function GET(request: NextRequest) {
  try {
    const decoded = await authenticateRequest(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('user_results')
      .select('semesters_data, selected_semester_key')
      .eq('firebase_uid', decoded.uid)
      .maybeSingle();

    if (error) {
      console.error('Supabase GET error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Sync GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Save user's data to Supabase
export async function POST(request: NextRequest) {
  try {
    const decoded = await authenticateRequest(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.semesters_data || typeof body.semesters_data !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from('user_results').upsert({
      firebase_uid: decoded.uid,
      semesters_data: body.semesters_data,
      selected_semester_key: body.selected_semester_key ?? null,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Supabase POST error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Sync POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
