'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertTriangle, TrendingUp, Info, Rocket, ThumbsUp, ThumbsDown, ArrowLeft, Newspaper, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EventWithVotes } from '@/lib/supabase';

interface EventDetailClientProps {
  event: EventWithVotes;
}

export function EventDetailClient({ event }: EventDetailClientProps) {
  const [trustCount, setTrustCount] = useState(event.trust_count);
  const [suspectCount, setSuspectCount] = useState(event.suspect_count);
  const [isVoting, setIsVoting] = useState(false);

  const getIcon = () => {
    switch (event.type) {
      case 'job_completed':
        return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case 'rug_warning':
      case 'trust_alert':
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      case 'trust_change':
        return <TrendingUp className="w-6 h-6 text-orange-600" />;
      case 'new_agent':
        return <Rocket className="w-6 h-6 text-purple-600" />;
      case 'news':
        return <Newspaper className="w-6 h-6 text-blue-600" />;
      case 'digest':
        return <BookOpen className="w-6 h-6 text-amber-600" />;
      default:
        return <Info className="w-6 h-6 text-gray-600" />;
    }
  };

  const getTypeColor = () => {
    switch (event.type) {
      case 'job_completed':
        return 'text-green-700 border-green-600/20 bg-green-50';
      case 'rug_warning':
      case 'trust_alert':
        return 'text-red-700 border-red-600/20 bg-red-50';
      case 'trust_change':
        return 'text-orange-700 border-orange-600/20 bg-orange-50';
      case 'new_agent':
        return 'text-purple-700 border-purple-600/20 bg-purple-50';
      case 'news':
        return 'text-blue-700 border-blue-600/20 bg-blue-50';
      case 'digest':
        return 'text-amber-700 border-amber-600/20 bg-amber-50';
      default:
        return 'text-gray-700 border-gray-600/20 bg-gray-50';
    }
  };

  const handleVote = async (voteType: 'trust' | 'suspect') => {
    if (isVoting) return;
    setIsVoting(true);

    try {
      // Generate a simple fingerprint
      const fingerprint = `${navigator.userAgent}-${screen.width}x${screen.height}`;
      const hash = btoa(fingerprint).slice(0, 32);

      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event.id,
          vote: voteType,
          fingerprint: hash,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTrustCount(data.counts.trust_count);
        setSuspectCount(data.counts.suspect_count);
      }
    } catch (error) {
      console.error('Vote error:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Atmospheric Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#D4A373]/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-500/5 blur-[120px] rounded-full"></div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-10 relative z-10">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 transition-opacity mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Feed
        </Link>

        {/* Event card */}
        <div
          className={cn(
            'p-8 rounded-xl border border-[#141414]/10 bg-white/80 backdrop-blur-sm shadow-lg',
            event.type === 'rug_warning' && 'border-l-4 border-l-red-500',
            event.type === 'job_completed' && 'border-l-4 border-l-green-500'
          )}
        >
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div
              className={cn(
                'w-14 h-14 rounded-lg flex items-center justify-center border border-[#141414]/5 bg-white shadow-sm'
              )}
            >
              {getIcon()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-widest border px-2 py-1 rounded',
                    getTypeColor()
                  )}
                >
                  {event.type.replace('_', ' ')}
                </span>
                <span className="text-[11px] font-mono opacity-40">
                  {formatDate(event.created_at)}
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#141414]">
                {event.title}
              </h1>
            </div>
          </div>

          {/* Trust score badge */}
          {event.trust_score !== null && (
            <div className="flex items-center gap-4 mb-6 p-4 bg-[#141414]/5 rounded-lg">
              <div
                className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl',
                  getTrustScoreColor(event.trust_score)
                )}
              >
                {event.trust_score}
              </div>
              <div>
                <div className="text-sm font-bold text-[#141414]">Trust Score</div>
                <div className="text-xs opacity-60">
                  {event.trust_delta !== null && event.trust_delta !== 0 && (
                    <span
                      className={cn(
                        event.trust_delta > 0 ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {event.trust_delta > 0 ? '+' : ''}
                      {event.trust_delta} from previous
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="mb-6">
              <p className="text-base opacity-70 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}

          {/* Agent info */}
          {event.agent_name && (
            <div className="mb-6 p-4 bg-[#141414]/5 rounded-lg">
              <div className="text-xs font-bold uppercase tracking-widest opacity-40 mb-1">
                Agent
              </div>
              <div className="font-bold text-[#141414]">{event.agent_name}</div>
              {event.agent_address && (
                <div className="text-xs font-mono opacity-60 mt-1">
                  {event.agent_address}
                </div>
              )}
            </div>
          )}

          {/* Source link */}
          {event.source_url && (
            <div className="mb-6">
              <a
                href={event.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#D4A373] hover:underline"
              >
                View Source
                <ArrowLeft className="w-3 h-3 rotate-[135deg]" />
              </a>
            </div>
          )}

          {/* Vote buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-[#141414]/10">
            <div className="text-xs opacity-40">Cast your vote</div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleVote('trust')}
                disabled={isVoting}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm font-bold',
                  'bg-[#141414]/5 border-[#141414]/5 hover:bg-green-50 hover:text-green-700 hover:border-green-200',
                  isVoting && 'opacity-50 cursor-not-allowed'
                )}
              >
                <ThumbsUp className="w-4 h-4" />
                Trust {trustCount}
              </button>
              <button
                onClick={() => handleVote('suspect')}
                disabled={isVoting}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm font-bold',
                  'bg-[#141414]/5 border-[#141414]/5 hover:bg-red-50 hover:text-red-700 hover:border-red-200',
                  isVoting && 'opacity-50 cursor-not-allowed'
                )}
              >
                <ThumbsDown className="w-4 h-4" />
                Suspect {suspectCount}
              </button>
            </div>
          </div>
        </div>

        {/* Maiat protocol footer */}
        <div className="mt-8 text-center">
          <span className="text-xs text-[#c4953a]">
            Powered by Maiat Protocol
          </span>
        </div>
      </main>

      <footer className="p-8 text-center text-[9px] opacity-30 font-mono uppercase tracking-[0.5em] relative z-10">
        &copy; 2026 Agentic Panic Neural Interface
      </footer>
    </div>
  );
}
