import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { supabase, Event } from '@/lib/supabase';

export const runtime = 'edge';

const getEventTypeColor = (type: string): string => {
  switch (type) {
    case 'job_completed':
      return '#22c55e'; // green
    case 'rug_warning':
      return '#ef4444'; // red
    case 'trust_change':
    case 'trust_alert':
      return '#c4953a'; // gold
    case 'new_agent':
      return '#3b82f6'; // blue
    case 'news':
      return '#6b7280'; // gray
    case 'digest':
      return '#c4953a'; // gold
    case 'milestone':
      return '#8b5cf6'; // purple
    default:
      return '#6b7280'; // gray
  }
};

const getTrustScoreColor = (score: number): string => {
  if (score >= 70) return '#22c55e';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('event_id');
    const type = searchParams.get('type');
    const date = searchParams.get('date');

    // Handle digest OG card
    if (type === 'digest') {
      let query = supabase
        .from('events')
        .select('*')
        .eq('type', 'digest')
        .order('created_at', { ascending: false });

      if (date) {
        const startOfDay = new Date(`${date}T00:00:00.000Z`);
        const endOfDay = new Date(`${date}T23:59:59.999Z`);
        query = query
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString());
      }

      const { data: digest, error } = await query.limit(1).single();

      if (error || !digest) {
        return generateErrorImage('Digest not found');
      }

      return generateDigestImage(digest as Event);
    }

    // Handle event OG card
    if (eventId) {
      const { data: event, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error || !event) {
        return generateErrorImage('Event not found');
      }

      if (event.type === 'digest') {
        return generateDigestImage(event as Event);
      }

      return generateEventImage(event as Event);
    }

    return generateErrorImage('Missing event_id or type parameter');
  } catch (error) {
    console.error('OG image generation error:', error);
    return generateErrorImage('Failed to generate image');
  }
}

function generateEventImage(event: Event): ImageResponse {
  const accentColor = getEventTypeColor(event.type);
  const trustScore = event.trust_score;
  const trustColor = trustScore ? getTrustScoreColor(trustScore) : '#6b7280';

  // Truncate description to max 2 lines (~120 chars)
  const description = event.description
    ? event.description.length > 120
      ? event.description.substring(0, 117) + '...'
      : event.description
    : '';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#faf9f7',
          padding: '0',
        }}
      >
        {/* Left accent bar */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '12px',
            backgroundColor: accentColor,
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            padding: '60px 60px 60px 72px',
            justifyContent: 'space-between',
          }}
        >
          {/* Top section */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Event type badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <span
                style={{
                  backgroundColor: accentColor + '20',
                  color: accentColor,
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '18px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                {event.type.replace('_', ' ')}
              </span>
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: '48px',
                fontWeight: 700,
                color: '#1a1a2e',
                margin: '0 0 24px 0',
                lineHeight: 1.2,
              }}
            >
              {event.title}
            </h1>

            {/* Description */}
            {description && (
              <p
                style={{
                  fontSize: '24px',
                  color: '#9a9aab',
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {description}
              </p>
            )}
          </div>

          {/* Bottom section */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}
          >
            {/* Trust score badge */}
            {trustScore !== null && trustScore !== undefined && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: trustColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      color: 'white',
                      fontSize: '24px',
                      fontWeight: 700,
                    }}
                  >
                    {trustScore}
                  </span>
                </div>
                <span style={{ color: '#9a9aab', fontSize: '20px' }}>
                  Trust Score
                </span>
              </div>
            )}

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '8px',
              }}
            >
              <span style={{ color: '#9a9aab', fontSize: '20px' }}>
                Agentic Panic — Live Agent Intelligence
              </span>
              <span style={{ color: '#c4953a', fontSize: '16px' }}>
                Powered by Maiat Protocol
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

function generateDigestImage(digest: Event): ImageResponse {
  const metadata = digest.metadata as {
    bullet_points?: string[];
    keywords?: string[];
    date?: string;
  } | null;

  const bulletPoints = metadata?.bullet_points || [];
  const keywords = metadata?.keywords || [];
  const dateStr = metadata?.date || digest.created_at.split('T')[0];

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#faf9f7',
          padding: '48px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '32px' }}>
          <h1
            style={{
              fontSize: '48px',
              fontWeight: 700,
              color: '#1a1a2e',
              margin: '0 0 12px 0',
            }}
          >
            Agent Economy Daily Digest
          </h1>
          <span
            style={{
              fontSize: '24px',
              color: '#c4953a',
              fontWeight: 600,
            }}
          >
            {dateStr}
          </span>
        </div>

        {/* Bullet points */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            gap: '16px',
          }}
        >
          {bulletPoints.slice(0, 5).map((point, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <span style={{ color: '#c4953a', fontSize: '20px' }}></span>
              <span
                style={{
                  fontSize: '20px',
                  color: '#1a1a2e',
                  lineHeight: 1.4,
                }}
              >
                {point.length > 80 ? point.substring(0, 77) + '...' : point}
              </span>
            </div>
          ))}
        </div>

        {/* Keywords */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          {keywords.slice(0, 5).map((keyword, i) => (
            <span
              key={i}
              style={{
                backgroundColor: '#c4953a20',
                color: '#c4953a',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '16px',
                fontWeight: 500,
              }}
            >
              {keyword}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #1a1a2e20',
            paddingTop: '24px',
          }}
        >
          <span style={{ color: '#9a9aab', fontSize: '20px' }}>
            Agentic Panic — Live Agent Intelligence
          </span>
          <span style={{ color: '#c4953a', fontSize: '16px' }}>
            Powered by Maiat Protocol
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

function generateErrorImage(message: string): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#faf9f7',
        }}
      >
        <span style={{ fontSize: '48px', color: '#1a1a2e', fontWeight: 700 }}>
          Agentic Panic
        </span>
        <span style={{ fontSize: '24px', color: '#9a9aab', marginTop: '16px' }}>
          {message}
        </span>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
