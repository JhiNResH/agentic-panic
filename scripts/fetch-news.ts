import Parser from 'rss-parser';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const braveApiKey = process.env.BRAVE_API_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const RSS_FEEDS = [
  'https://news.smol.ai/rss',
  'https://www.coindesk.com/arc/outboundfeeds/rss/',
  'https://decrypt.co/feed',
];

const AI_KEYWORDS = [
  'ai agent',
  'autonomous agent',
  'agentic',
  'virtuals',
  'acp',
  'trust score',
  'on-chain agent',
];

function containsAIKeyword(text: string): boolean {
  const lowerText = text.toLowerCase();
  return AI_KEYWORDS.some((keyword) => lowerText.includes(keyword));
}

function hashUrl(url: string): string {
  return createHash('sha256').update(url).digest('hex');
}

interface NewsItem {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
}

async function fetchRSSFeeds(): Promise<NewsItem[]> {
  const parser = new Parser();
  const items: NewsItem[] = [];

  for (const feedUrl of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);

      for (const item of feed.items) {
        if (!item.title || !item.link) continue;

        const combinedText = `${item.title} ${item.contentSnippet || ''} ${item.content || ''}`;

        // For smol.ai, include all items; for others, filter by keywords
        const isSmolAI = feedUrl.includes('smol.ai');
        if (isSmolAI || containsAIKeyword(combinedText)) {
          items.push({
            title: item.title,
            link: item.link,
            description: item.contentSnippet || item.content?.slice(0, 500),
            pubDate: item.pubDate,
          });
        }
      }
    } catch (error) {
      console.error(`Failed to fetch RSS feed ${feedUrl}:`, error);
    }
  }

  return items;
}

interface BraveSearchResult {
  title: string;
  url: string;
  description?: string;
  age?: string;
}

async function fetchBraveSearch(): Promise<NewsItem[]> {
  if (!braveApiKey) {
    console.log('BRAVE_API_KEY not set, skipping Brave Search');
    return [];
  }

  const queries = ['AI agent economy', 'Virtuals Protocol agent'];
  const items: NewsItem[] = [];

  for (const query of queries) {
    try {
      const response = await fetch(
        `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&freshness=pd`,
        {
          headers: {
            Accept: 'application/json',
            'X-Subscription-Token': braveApiKey,
          },
        }
      );

      if (!response.ok) {
        console.error(`Brave Search failed for "${query}": ${response.status}`);
        continue;
      }

      const data = await response.json();
      const results = (data.web?.results || []) as BraveSearchResult[];

      for (const result of results) {
        items.push({
          title: result.title,
          link: result.url,
          description: result.description,
        });
      }
    } catch (error) {
      console.error(`Brave Search error for "${query}":`, error);
    }
  }

  return items;
}

async function getExistingUrlHashes(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('events')
    .select('metadata')
    .eq('type', 'news')
    .not('metadata', 'is', null);

  if (error) {
    console.error('Failed to fetch existing events:', error);
    return new Set();
  }

  const hashes = new Set<string>();
  for (const event of data || []) {
    const urlHash = (event.metadata as { url_hash?: string })?.url_hash;
    if (urlHash) {
      hashes.add(urlHash);
    }
  }
  return hashes;
}

export async function fetchNews(): Promise<number> {
  console.log('Fetching news from RSS feeds and Brave Search...');

  const [rssItems, braveItems] = await Promise.all([
    fetchRSSFeeds(),
    fetchBraveSearch(),
  ]);

  const allItems = [...rssItems, ...braveItems];
  console.log(`Found ${allItems.length} total items`);

  // Get existing URL hashes for deduplication
  const existingHashes = await getExistingUrlHashes();
  console.log(`${existingHashes.size} existing news items in database`);

  // Deduplicate by URL hash
  const seenHashes = new Set<string>();
  const newItems: NewsItem[] = [];

  for (const item of allItems) {
    const urlHash = hashUrl(item.link);
    if (!existingHashes.has(urlHash) && !seenHashes.has(urlHash)) {
      seenHashes.add(urlHash);
      newItems.push(item);
    }
  }

  console.log(`${newItems.length} new unique items to insert`);

  if (newItems.length === 0) {
    return 0;
  }

  // Insert new events
  const events = newItems.map((item) => ({
    type: 'news',
    title: item.title,
    description: item.description,
    source_url: item.link,
    metadata: {
      url_hash: hashUrl(item.link),
      pub_date: item.pubDate,
    },
  }));

  const { error } = await supabase.from('events').insert(events);

  if (error) {
    console.error('Failed to insert news events:', error);
    return 0;
  }

  console.log(`Successfully inserted ${events.length} news events`);
  return events.length;
}

// Run if executed directly
if (require.main === module) {
  fetchNews()
    .then((count) => {
      console.log(`Done. Inserted ${count} news items.`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
