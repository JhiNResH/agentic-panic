import { NextRequest, NextResponse } from 'next/server';
import { supabase, EventWithVotes, EventType } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') as EventType | null;
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
  const cursor = searchParams.get('cursor'); // ISO timestamp for keyset pagination

  let query = supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (type) {
    query = query.eq('type', type);
  }

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data: events, error: eventsError } = await query;

  if (eventsError) {
    return NextResponse.json({ error: eventsError.message }, { status: 500 });
  }

  if (!events || events.length === 0) {
    return NextResponse.json({
      events: [],
      next_cursor: null,
    });
  }

  // Get vote counts for all events
  const eventIds = events.map((e) => e.id);
  const { data: votes, error: votesError } = await supabase
    .from('votes')
    .select('event_id, vote')
    .in('event_id', eventIds);

  if (votesError) {
    return NextResponse.json({ error: votesError.message }, { status: 500 });
  }

  // Aggregate vote counts
  const voteCounts: Record<string, { trust: number; suspect: number }> = {};
  for (const vote of votes || []) {
    if (!voteCounts[vote.event_id]) {
      voteCounts[vote.event_id] = { trust: 0, suspect: 0 };
    }
    voteCounts[vote.event_id][vote.vote as 'trust' | 'suspect']++;
  }

  // Merge events with vote counts
  const eventsWithVotes: EventWithVotes[] = events.map((event) => ({
    ...event,
    trust_count: voteCounts[event.id]?.trust || 0,
    suspect_count: voteCounts[event.id]?.suspect || 0,
  }));

  // Compute next cursor
  const lastEvent = events[events.length - 1];
  const nextCursor = events.length === limit ? lastEvent.created_at : null;

  return NextResponse.json({
    events: eventsWithVotes,
    next_cursor: nextCursor,
  });
}
