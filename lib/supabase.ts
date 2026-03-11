import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export type EventType =
  | 'new_agent'
  | 'job_completed'
  | 'job_failed'
  | 'trust_change'
  | 'trust_alert'
  | 'rug_warning'
  | 'milestone'
  | 'news'
  | 'digest';

export interface Event {
  id: string;
  type: EventType;
  agent_address: string | null;
  agent_name: string | null;
  title: string;
  description: string | null;
  trust_score: number | null;
  trust_delta: number | null;
  source_url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Vote {
  id: string;
  event_id: string;
  voter_fingerprint: string;
  vote: 'trust' | 'suspect';
  created_at: string;
}

export interface EventWithVotes extends Event {
  trust_count: number;
  suspect_count: number;
}
