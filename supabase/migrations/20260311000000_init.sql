-- Agentic Panic Database Schema
-- Run this script in your Supabase SQL Editor

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- new_agent, job_completed, job_failed, trust_change, trust_alert, rug_warning, milestone, news
  agent_address TEXT,
  agent_name TEXT,
  title TEXT NOT NULL,
  description TEXT,
  trust_score INT,
  trust_delta INT,
  source_url TEXT, -- for news events
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id),
  voter_fingerprint TEXT NOT NULL,
  vote TEXT NOT NULL CHECK (vote IN ('trust', 'suspect')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, voter_fingerprint)
);

CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_agent ON events(agent_address);
CREATE INDEX idx_events_created ON events(created_at DESC);
CREATE INDEX idx_votes_event ON votes(event_id);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Allow public read access to events
CREATE POLICY "Events are publicly readable" ON events
  FOR SELECT USING (true);

-- Allow public read access to votes
CREATE POLICY "Votes are publicly readable" ON votes
  FOR SELECT USING (true);

-- Allow insert with service role key (for API routes)
CREATE POLICY "Service role can insert events" ON events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can insert votes" ON votes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update votes" ON votes
  FOR UPDATE USING (true);
