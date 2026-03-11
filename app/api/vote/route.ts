import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface VoteRequest {
  event_id: string;
  vote: 'trust' | 'suspect';
  fingerprint: string;
}

export async function POST(request: NextRequest) {
  let body: VoteRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { event_id, vote, fingerprint } = body;

  if (!event_id || !vote || !fingerprint) {
    return NextResponse.json(
      { error: 'Missing required fields: event_id, vote, fingerprint' },
      { status: 400 }
    );
  }

  if (vote !== 'trust' && vote !== 'suspect') {
    return NextResponse.json(
      { error: 'Vote must be "trust" or "suspect"' },
      { status: 400 }
    );
  }

  // Upsert vote (insert or update if exists)
  const { data, error } = await supabase
    .from('votes')
    .upsert(
      {
        event_id,
        voter_fingerprint: fingerprint,
        vote,
      },
      {
        onConflict: 'event_id,voter_fingerprint',
      }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get updated vote counts for this event
  const { data: votes, error: countError } = await supabase
    .from('votes')
    .select('vote')
    .eq('event_id', event_id);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  const trust_count = votes?.filter((v) => v.vote === 'trust').length || 0;
  const suspect_count = votes?.filter((v) => v.vote === 'suspect').length || 0;

  return NextResponse.json({
    success: true,
    vote: data,
    counts: {
      trust_count,
      suspect_count,
    },
  });
}
