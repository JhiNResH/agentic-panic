import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface TrendingAgent {
  agent_address: string;
  agent_name: string;
  trust_score: number;
  latest_event_id: string;
  latest_event_type: string;
  created_at: string;
}

export async function GET() {
  // Get latest events per agent with trust scores
  // We need distinct agents with their most recent trust score
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .not('agent_address', 'is', null)
    .not('trust_score', 'is', null)
    .order('created_at', { ascending: false })
    .limit(500); // Fetch recent events to find unique agents

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!events || events.length === 0) {
    return NextResponse.json({
      top_trusted: [],
      top_suspected: [],
    });
  }

  // Get unique agents with their latest event (highest trust score)
  const agentMap = new Map<string, TrendingAgent>();

  for (const event of events) {
    if (!event.agent_address || event.trust_score === null) continue;

    // Only keep the first (most recent) event per agent
    if (!agentMap.has(event.agent_address)) {
      agentMap.set(event.agent_address, {
        agent_address: event.agent_address,
        agent_name: event.agent_name || event.agent_address.slice(0, 8),
        trust_score: event.trust_score,
        latest_event_id: event.id,
        latest_event_type: event.type,
        created_at: event.created_at,
      });
    }
  }

  const agents = Array.from(agentMap.values());

  // Sort by trust score descending for top trusted
  const sortedByTrust = [...agents].sort(
    (a, b) => b.trust_score - a.trust_score
  );
  const topTrusted = sortedByTrust.slice(0, 5);

  // Sort by trust score ascending for top suspected (lowest scores)
  const sortedBySuspect = [...agents].sort(
    (a, b) => a.trust_score - b.trust_score
  );
  const topSuspected = sortedBySuspect.slice(0, 5);

  return NextResponse.json({
    top_trusted: topTrusted,
    top_suspected: topSuspected,
  });
}
