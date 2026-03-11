import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const MAIAT_API_URL = 'https://app.maiat.io/api/v1/agents';

interface MaiatAgent {
  address: string;
  name: string;
  trust_score: number;
  jobs_completed?: number;
}

interface AgentState {
  address: string;
  name: string;
  trust_score: number;
  jobs_completed: number;
}

async function fetchMaiatAgents(): Promise<MaiatAgent[]> {
  try {
    const response = await fetch(MAIAT_API_URL);
    if (!response.ok) {
      console.error(`Maiat API failed: ${response.status}`);
      return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : data.agents || [];
  } catch (error) {
    console.error('Failed to fetch Maiat agents:', error);
    return [];
  }
}

async function getLastKnownAgentStates(): Promise<Map<string, AgentState>> {
  // Get the most recent event for each agent to determine last known state
  const { data, error } = await supabase
    .from('events')
    .select('agent_address, agent_name, trust_score, metadata, created_at')
    .not('agent_address', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1000);

  if (error) {
    console.error('Failed to fetch last known states:', error);
    return new Map();
  }

  const agentMap = new Map<string, AgentState>();

  for (const event of data || []) {
    if (!event.agent_address) continue;

    // Only keep the most recent event per agent
    if (!agentMap.has(event.agent_address)) {
      const metadata = event.metadata as { jobs_completed?: number } | null;
      agentMap.set(event.agent_address, {
        address: event.agent_address,
        name: event.agent_name || event.agent_address.slice(0, 8),
        trust_score: event.trust_score || 0,
        jobs_completed: metadata?.jobs_completed || 0,
      });
    }
  }

  return agentMap;
}

interface EventToInsert {
  type: string;
  agent_address: string;
  agent_name: string;
  title: string;
  description: string;
  trust_score: number;
  trust_delta?: number;
  metadata?: Record<string, unknown>;
}

export async function fetchTrustScores(): Promise<number> {
  console.log('Fetching trust scores from Maiat API...');

  const agents = await fetchMaiatAgents();
  console.log(`Found ${agents.length} agents from Maiat`);

  if (agents.length === 0) {
    return 0;
  }

  const lastKnownStates = await getLastKnownAgentStates();
  console.log(`${lastKnownStates.size} agents with known state in database`);

  const eventsToInsert: EventToInsert[] = [];

  for (const agent of agents) {
    const address = agent.address;
    const name = agent.name || address.slice(0, 8);
    const currentScore = agent.trust_score;
    const jobsCompleted = agent.jobs_completed || 0;

    const lastKnown = lastKnownStates.get(address);

    if (!lastKnown) {
      // New agent
      eventsToInsert.push({
        type: 'new_agent',
        agent_address: address,
        agent_name: name,
        title: `New agent discovered: ${name}`,
        description: `Agent ${name} has been added to the network with a trust score of ${currentScore}`,
        trust_score: currentScore,
        metadata: { jobs_completed: jobsCompleted },
      });
      continue;
    }

    const scoreDelta = currentScore - lastKnown.trust_score;
    const lastJobs = lastKnown.jobs_completed;

    // Trust score change >= 5 points
    if (Math.abs(scoreDelta) >= 5) {
      const direction = scoreDelta > 0 ? 'increased' : 'decreased';
      eventsToInsert.push({
        type: 'trust_change',
        agent_address: address,
        agent_name: name,
        title: `${name} trust score ${direction} by ${Math.abs(scoreDelta)}`,
        description: `Trust score changed from ${lastKnown.trust_score} to ${currentScore}`,
        trust_score: currentScore,
        trust_delta: scoreDelta,
        metadata: { previous_score: lastKnown.trust_score, jobs_completed: jobsCompleted },
      });
    }

    // Trust alert: score dropped below 30
    if (currentScore < 30 && lastKnown.trust_score >= 30) {
      eventsToInsert.push({
        type: 'trust_alert',
        agent_address: address,
        agent_name: name,
        title: `Trust alert: ${name} dropped below 30`,
        description: `Agent ${name} trust score is now ${currentScore} - below critical threshold`,
        trust_score: currentScore,
        trust_delta: scoreDelta,
        metadata: { previous_score: lastKnown.trust_score },
      });
    }

    // Milestone events: 50, 100, 500 jobs
    const milestones = [50, 100, 500];
    for (const milestone of milestones) {
      if (jobsCompleted >= milestone && lastJobs < milestone) {
        eventsToInsert.push({
          type: 'milestone',
          agent_address: address,
          agent_name: name,
          title: `${name} reached ${milestone} jobs completed`,
          description: `Agent ${name} has successfully completed ${milestone} jobs`,
          trust_score: currentScore,
          metadata: { milestone, jobs_completed: jobsCompleted },
        });
      }
    }
  }

  console.log(`${eventsToInsert.length} events to insert`);

  if (eventsToInsert.length === 0) {
    return 0;
  }

  const { error } = await supabase.from('events').insert(eventsToInsert);

  if (error) {
    console.error('Failed to insert events:', error);
    return 0;
  }

  console.log(`Successfully inserted ${eventsToInsert.length} events`);
  return eventsToInsert.length;
}

// Run if executed directly
if (require.main === module) {
  fetchTrustScores()
    .then((count) => {
      console.log(`Done. Inserted ${count} events.`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
