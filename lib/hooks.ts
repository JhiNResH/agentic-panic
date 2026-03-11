'use client';

import { useState, useEffect, useCallback } from 'react';

// Types matching API response
export interface FeedEvent {
  id: string;
  type: string;
  agent_address: string | null;
  agent_name: string | null;
  title: string;
  description: string | null;
  trust_score: number | null;
  trust_delta: number | null;
  source_url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  trust_count: number;
  suspect_count: number;
}

export interface TrendingAgent {
  agent_address: string;
  agent_name: string;
  trust_score: number;
}

export interface TrendingData {
  top_trusted: TrendingAgent[];
  top_suspected: TrendingAgent[];
}

// Mock data for when DB is empty
const MOCK_EVENTS: FeedEvent[] = [
  {
    id: '1', type: 'job_completed', agent_address: '0x4a...12e', agent_name: 'TrustBot',
    title: 'TrustBot completed verification batch #891 — 14 agents scored in 2 minutes',
    description: 'Verification successful for the latest batch of autonomous agents on Base.',
    trust_score: 92, trust_delta: null, source_url: null, metadata: null,
    created_at: new Date(Date.now() - 2 * 60000).toISOString(),
    trust_count: 142, suspect_count: 4,
  },
  {
    id: '2', type: 'rug_warning', agent_address: '0xdead...beef', agent_name: 'GhostProtocol',
    title: 'GhostProtocol — Rug Alert',
    description: 'Multiple large withdrawals detected. 12 consecutive failed jobs. Trust score dropped to 8.',
    trust_score: 8, trust_delta: -45, source_url: null, metadata: null,
    created_at: new Date(Date.now() - 14 * 60000).toISOString(),
    trust_count: 2, suspect_count: 602,
  },
  {
    id: '3', type: 'trust_change', agent_address: '0xneural...swap', agent_name: 'NeuralSwap',
    title: 'NeuralSwap +18.4%',
    description: 'Unusual volume spike on Base DEX. 3x average daily volume.',
    trust_score: 23, trust_delta: 18, source_url: null, metadata: null,
    created_at: new Date(Date.now() - 33 * 60000).toISOString(),
    trust_count: 42, suspect_count: 12,
  },
  {
    id: '4', type: 'job_completed', agent_address: '0xsigma...9', agent_name: 'Sigma-9',
    title: 'Agent Maintenance: Sigma-9',
    description: 'Sigma-9 AI is seeking GPU compute providers for epoch 14 training run.',
    trust_score: 78, trust_delta: null, source_url: null, metadata: { reward: '0.15 VIRTUAL' },
    created_at: new Date(Date.now() - 60 * 60000).toISOString(),
    trust_count: 18, suspect_count: 1,
  },
  {
    id: '5', type: 'new_agent', agent_address: '0xsovereign...mind', agent_name: 'Sovereign Mind Protocol',
    title: 'Sovereign Mind Protocol',
    description: 'Decentralized governance agent for DAO Treasury management. Audited by Ethy AI, Axelrod, and OpenZeppelin.',
    trust_score: null, trust_delta: null, source_url: null, metadata: { funded: 68 },
    created_at: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    trust_count: 31, suspect_count: 5,
  },
];

const MOCK_TRENDING: TrendingData = {
  top_trusted: [
    { agent_address: '0x1', agent_name: 'Ethy AI', trust_score: 100 },
    { agent_address: '0x2', agent_name: 'Axelrod', trust_score: 100 },
    { agent_address: '0x3', agent_name: 'Nox', trust_score: 93 },
    { agent_address: '0x4', agent_name: 'Director Lucien', trust_score: 93 },
    { agent_address: '0x5', agent_name: 'TrustBot', trust_score: 92 },
  ],
  top_suspected: [
    { agent_address: '0xa', agent_name: 'GhostProtocol', trust_score: 8 },
    { agent_address: '0xb', agent_name: 'NeuralSwap', trust_score: 23 },
    { agent_address: '0xc', agent_name: 'ScamBot', trust_score: 12 },
    { agent_address: '0xd', agent_name: 'FakeOracle', trust_score: 15 },
    { agent_address: '0xe', agent_name: 'PhantomAgent', trust_score: 5 },
  ],
};

export function useFeed(type?: string) {
  const [events, setEvents] = useState<FeedEvent[]>(MOCK_EVENTS);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const fetchEvents = useCallback(async (cursor?: string) => {
    try {
      const params = new URLSearchParams();
      if (type) params.set('type', type);
      if (cursor) params.set('cursor', cursor);
      params.set('limit', '20');

      const res = await fetch(`/api/feed?${params}`);
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();

      if (data.events && data.events.length > 0) {
        if (cursor) {
          setEvents(prev => [...prev, ...data.events]);
        } else {
          setEvents(data.events);
        }
        setNextCursor(data.next_cursor);
        setIsLive(true);
      }
      // If empty and no cursor, keep mock data
    } catch {
      // Keep mock data on error
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const loadMore = () => {
    if (nextCursor) fetchEvents(nextCursor);
  };

  return { events, loading, loadMore, hasMore: !!nextCursor, isLive };
}

export function useTrending() {
  const [data, setData] = useState<TrendingData>(MOCK_TRENDING);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/trending')
      .then(r => r.json())
      .then(d => {
        if (d.top_trusted?.length > 0 || d.top_suspected?.length > 0) {
          setData(d);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { ...data, loading };
}

export function useVote() {
  const [voted, setVoted] = useState<Record<string, 'trust' | 'suspect'>>({});

  const vote = async (eventId: string, voteType: 'trust' | 'suspect') => {
    if (voted[eventId]) return; // Already voted

    setVoted(prev => ({ ...prev, [eventId]: voteType }));

    try {
      const fingerprint = `anon-${Math.random().toString(36).slice(2, 10)}`;
      await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, vote: voteType, fingerprint }),
      });
    } catch {
      // Vote saved locally even if API fails
    }
  };

  return { vote, voted };
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
