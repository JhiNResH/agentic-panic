'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, TrendingUp, Info, Rocket, ThumbsUp, ThumbsDown, ExternalLink, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFeed, useVote, timeAgo, FeedEvent } from '@/lib/hooks';

function getEventDisplay(type: string) {
  switch (type) {
    case 'job_completed': return { icon: <CheckCircle2 className="w-5 h-5 text-green-600" />, badge: 'Job Completed', badgeClass: 'text-green-700 border-green-600/20 bg-green-50', glow: 'neon-glow-green' };
    case 'job_failed': return { icon: <AlertTriangle className="w-5 h-5 text-orange-600" />, badge: 'Job Failed', badgeClass: 'text-orange-700 border-orange-600/20 bg-orange-50', glow: '' };
    case 'rug_warning': return { icon: <AlertTriangle className="w-5 h-5 text-red-600" />, badge: 'Rug Alert', badgeClass: 'text-red-700 border-red-600/20 bg-red-50', glow: 'neon-glow-red' };
    case 'trust_change': return { icon: <TrendingUp className="w-5 h-5 text-orange-600" />, badge: 'Trust Change', badgeClass: 'text-orange-700 border-orange-600/20 bg-orange-50', glow: '' };
    case 'trust_alert': return { icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />, badge: 'Trust Alert', badgeClass: 'text-yellow-700 border-yellow-600/20 bg-yellow-50', glow: '' };
    case 'new_agent': return { icon: <Rocket className="w-5 h-5 text-purple-600" />, badge: 'New Agent', badgeClass: 'text-purple-700 border-purple-600/20 bg-purple-50', glow: '' };
    case 'milestone': return { icon: <CheckCircle2 className="w-5 h-5 text-[#D4A373]" />, badge: 'Milestone', badgeClass: 'text-[#D4A373] border-[#D4A373]/20 bg-[#D4A373]/5', glow: '' };
    case 'news': return { icon: <Newspaper className="w-5 h-5 text-gray-600" />, badge: 'News', badgeClass: 'text-gray-700 border-gray-600/20 bg-gray-50', glow: '' };
    case 'digest': return { icon: <Info className="w-5 h-5 text-blue-600" />, badge: 'Daily Digest', badgeClass: 'text-blue-700 border-blue-600/20 bg-blue-50', glow: '' };
    default: return { icon: <Info className="w-5 h-5 text-blue-600" />, badge: type, badgeClass: 'text-blue-700 border-blue-600/20 bg-blue-50', glow: '' };
  }
}

function EventCard({ event, onVote, votedAs }: { event: FeedEvent; onVote: (id: string, v: 'trust' | 'suspect') => void; votedAs?: 'trust' | 'suspect' }) {
  const display = getEventDisplay(event.type);
  const isAlert = event.type === 'rug_warning';
  const funded = (event.metadata as Record<string, number> | null)?.funded;
  const reward = (event.metadata as Record<string, string> | null)?.reward;

  return (
    <div className={cn(
      "p-5 rounded-xl border border-[#141414]/10 bg-white/60 hover:bg-white transition-all group relative overflow-hidden",
      isAlert && "border-l-4 border-l-red-500",
      display.glow
    )}>
      <div className="absolute top-0 left-0 w-full h-[1px] scan-line opacity-40 pointer-events-none"></div>
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-[#141414]/5 bg-white shadow-sm">
            {display.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("text-[9px] font-bold uppercase tracking-widest border px-1.5 py-0.5 rounded", display.badgeClass)}>
                {display.badge}
              </span>
              <span className="text-[10px] font-mono opacity-40 uppercase tracking-tighter">{timeAgo(event.created_at)}</span>
            </div>
            <h3 className="font-bold text-base tracking-tight group-hover:text-[#D4A373] transition-colors">{event.title}</h3>
          </div>
        </div>
        {event.source_url && <a href={event.source_url} target="_blank" rel="noopener"><ExternalLink className="w-4 h-4 opacity-20 group-hover:opacity-100 transition-opacity" /></a>}
      </div>

      {event.description && (
        <p className="text-sm opacity-60 mb-4 leading-relaxed font-medium">{event.description}</p>
      )}

      {funded !== undefined && (
        <div className="mb-4">
          <div className="h-1.5 w-full bg-[#141414]/5 rounded-full overflow-hidden">
            <div className="h-full bg-[#D4A373]" style={{ width: `${funded}%` }}></div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] font-mono opacity-30 uppercase">Progress Track</span>
            <span className="text-[9px] font-mono opacity-60">{funded}% Funded</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-auto">
        <div className="flex gap-4">
          {event.agent_name && (
            <span className="text-[10px] font-mono opacity-30 flex items-center gap-1 border-r border-[#141414]/10 pr-4">
              {event.agent_name}
            </span>
          )}
          {event.trust_score !== null && (
            <span className="text-[10px] font-mono opacity-30">Score: {event.trust_score}</span>
          )}
          {reward && (
            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">{reward}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onVote(event.id, 'trust')}
            disabled={!!votedAs}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border",
              votedAs === 'trust' ? "bg-green-100 text-green-700 border-green-300" : "bg-[#141414]/5 border-[#141414]/5 hover:bg-green-50 hover:text-green-700"
            )}>
            <ThumbsUp className="w-3 h-3" />
            Trust {event.trust_count + (votedAs === 'trust' ? 1 : 0)}
          </button>
          <button 
            onClick={() => onVote(event.id, 'suspect')}
            disabled={!!votedAs}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border",
              votedAs === 'suspect' ? "bg-red-100 text-red-700 border-red-300" :
              isAlert ? "bg-red-500 text-white border-red-600 hover:bg-red-600" : "bg-[#141414]/5 border-[#141414]/5 hover:bg-red-50 hover:text-red-700"
            )}>
            <ThumbsDown className="w-3 h-3" />
            Suspect {event.suspect_count + (votedAs === 'suspect' ? 1 : 0)}
          </button>
        </div>
      </div>
    </div>
  );
}

export function EventFeed() {
  const [filter, setFilter] = React.useState<string | undefined>();
  const { events, loading, loadMore, hasMore, isLive } = useFeed(filter);
  const { vote, voted } = useVote();

  const filters = [
    { label: 'All Events', value: undefined },
    { label: 'New Agents', value: 'new_agent' },
    { label: 'Alerts', value: 'trust_alert' },
    { label: 'Rug Warnings', value: 'rug_warning' },
    { label: 'Jobs', value: 'job_completed' },
    { label: 'News', value: 'news' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-3 flex-wrap">
          {filters.map(f => (
            <button 
              key={f.label}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                filter === f.value ? "bg-[#D4A373] text-white shadow-sm font-black" : "bg-white border border-[#141414]/10 opacity-40 hover:opacity-100 hover:bg-white"
              )}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="text-[10px] font-mono opacity-30 uppercase tracking-[0.2em]">
          {isLive ? '🟢 Live' : '⚡ Demo Mode'}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm opacity-40">Loading events...</div>
      ) : (
        <>
          {events.map((event, i) => (
            <EventCard key={event.id || i} event={event} onVote={vote} votedAs={voted[event.id]} />
          ))}
          {hasMore && (
            <button onClick={loadMore} className="py-3 text-center text-sm opacity-40 hover:opacity-100 transition-opacity border border-[#141414]/10 rounded-xl">
              Load more...
            </button>
          )}
        </>
      )}
    </div>
  );
}
