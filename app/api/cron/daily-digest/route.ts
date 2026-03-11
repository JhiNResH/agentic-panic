import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase, Event } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // Verify cron secret
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Query events from last 24 hours
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .neq('type', 'digest')
      .order('created_at', { ascending: false });

    if (eventsError) {
      console.error('Failed to fetch events:', eventsError);
      return NextResponse.json(
        { error: 'Failed to fetch events', details: eventsError.message },
        { status: 500 }
      );
    }

    if (!events || events.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No events to digest',
        timestamp: new Date().toISOString(),
      });
    }

    // Group events by type and count
    const eventCounts: Record<string, number> = {};
    for (const event of events as Event[]) {
      eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;
    }

    // Prepare summary of events for AI
    const eventsSummary = (events as Event[]).map((e) => ({
      type: e.type,
      title: e.title,
      description: e.description,
      trust_score: e.trust_score,
      trust_delta: e.trust_delta,
      agent_name: e.agent_name,
    }));

    // Call Gemini API
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing Gemini API key' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are an AI agent economy analyst. Summarize these events from the last 24h into exactly 5 bullet points and 5 keywords. Be concise and data-driven.

Events: ${JSON.stringify(eventsSummary)}

Event counts by type: ${JSON.stringify(eventCounts)}

Respond in this exact JSON format:
{
  "bullet_points": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON from response (handle markdown code blocks)
    let aiResponse: { bullet_points: string[]; keywords: string[] };
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      aiResponse = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      // Fallback response
      aiResponse = {
        bullet_points: [
          `${events.length} total events recorded in the last 24 hours`,
          `Event types: ${Object.keys(eventCounts).join(', ')}`,
          'AI summary generation encountered an issue',
          'Manual review of events recommended',
          'System continues monitoring agent activity',
        ],
        keywords: ['events', 'agents', 'monitoring', 'activity', 'system'],
      };
    }

    // Format today's date
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const formattedDate = today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Create digest description from bullet points
    const description = aiResponse.bullet_points
      .map((point: string) => `• ${point}`)
      .join('\n');

    // Insert digest event
    const { data: digest, error: insertError } = await supabase
      .from('events')
      .insert({
        type: 'digest',
        title: `Daily Digest — ${formattedDate}`,
        description: description,
        metadata: {
          keywords: aiResponse.keywords,
          event_counts: eventCounts,
          bullet_points: aiResponse.bullet_points,
          date: dateStr,
          total_events: events.length,
        },
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to insert digest:', insertError);
      return NextResponse.json(
        { error: 'Failed to insert digest', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      digest_id: digest.id,
      event_count: events.length,
      event_types: eventCounts,
      keywords: aiResponse.keywords,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron daily-digest error:', error);
    return NextResponse.json(
      { error: 'Failed to generate daily digest', details: String(error) },
      { status: 500 }
    );
  }
}
