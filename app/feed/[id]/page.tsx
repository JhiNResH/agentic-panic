import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase, Event, EventWithVotes } from '@/lib/supabase';
import { EventDetailClient } from './EventDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getEvent(id: string): Promise<EventWithVotes | null> {
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !event) {
    return null;
  }

  // Get vote counts
  const { data: votes } = await supabase
    .from('votes')
    .select('vote')
    .eq('event_id', id);

  const trustCount = votes?.filter((v) => v.vote === 'trust').length || 0;
  const suspectCount = votes?.filter((v) => v.vote === 'suspect').length || 0;

  return {
    ...(event as Event),
    trust_count: trustCount,
    suspect_count: suspectCount,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    return {
      title: 'Event Not Found | Agentic Panic',
    };
  }

  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || '';
  const ogImageUrl = `${appUrl}/api/og?event_id=${id}`;

  return {
    title: `${event.title} | Agentic Panic`,
    description: event.description || 'Live Agent Intelligence Feed',
    openGraph: {
      title: event.title,
      description: event.description || 'Live Agent Intelligence Feed',
      type: 'article',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description: event.description || 'Live Agent Intelligence Feed',
      images: [ogImageUrl],
    },
  };
}

export default async function EventPage({ params }: PageProps) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    notFound();
  }

  return <EventDetailClient event={event} />;
}
