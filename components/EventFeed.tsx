'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, TrendingUp, Info, Rocket, ThumbsUp, ThumbsDown, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventProps {
  type: 'completed' | 'alert' | 'move' | 'maintenance' | 'launch';
  title: string;
  description: string;
  time: string;
  trustScore?: number;
  suspectScore?: number;
  metadata?: string[];
  reward?: string;
  funded?: number;
}

function EventCard({ type, title, description, time, trustScore, suspectScore, metadata, reward, funded }: EventProps) {
  const getIcon = () => {
    switch (type) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'alert': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'move': return <TrendingUp className="w-5 h-5 text-orange-600" />;
      case 'maintenance': return <Info className="w-5 h-5 text-blue-600" />;
      case 'launch': return <Rocket className="w-5 h-5 text-purple-600" />;
    }
  };

  const getBadge = () => {
    switch (type) {
      case 'completed': return <span className="text-green-700 text-[9px] font-bold uppercase tracking-widest border border-green-600/20 px-1.5 py-0.5 rounded bg-green-50">Job Completed</span>;
      case 'alert': return <span className="text-red-700 text-[9px] font-bold uppercase tracking-widest border border-red-600/20 px-1.5 py-0.5 rounded bg-red-50">Rug Alert</span>;
      case 'move': return <span className="text-orange-700 text-[9px] font-bold uppercase tracking-widest border border-orange-600/20 px-1.5 py-0.5 rounded bg-orange-50">Price Move</span>;
      case 'maintenance': return <span className="text-blue-700 text-[9px] font-bold uppercase tracking-widest border border-blue-600/20 px-1.5 py-0.5 rounded bg-blue-50">Maintenance</span>;
      case 'launch': return <span className="text-purple-700 text-[9px] font-bold uppercase tracking-widest border border-purple-600/20 px-1.5 py-0.5 rounded bg-purple-50">Launch</span>;
    }
  };

  return (
    <div className={cn(
      "p-5 rounded-xl border border-[#141414]/10 bg-white/60 hover:bg-white transition-all group relative overflow-hidden",
      type === 'alert' && "border-l-4 border-l-red-500 neon-glow-red",
      type === 'completed' && "neon-glow-green"
    )}>
      <div className="absolute top-0 left-0 w-full h-[1px] scan-line opacity-40 pointer-events-none"></div>
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center border border-[#141414]/5 bg-white shadow-sm",
            type === 'completed' && "text-green-600",
            type === 'alert' && "text-red-600",
          )}>
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              {getBadge()}
              <span className="text-[10px] font-mono opacity-40 uppercase tracking-tighter">{time}</span>
            </div>
            <h3 className="font-bold text-base tracking-tight group-hover:text-[#D4A373] transition-colors">{title}</h3>
          </div>
        </div>
        {type === 'maintenance' && <ExternalLink className="w-4 h-4 opacity-20 group-hover:opacity-100 transition-opacity" />}
      </div>

      <p className="text-sm opacity-60 mb-4 leading-relaxed font-medium">
        {description}
      </p>

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
          {metadata?.map((m, i) => (
            <span key={i} className="text-[10px] font-mono opacity-30 flex items-center gap-1 border-r border-[#141414]/10 pr-4 last:border-0">
              {m}
            </span>
          ))}
          {reward && (
            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">{reward}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {trustScore !== undefined && (
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141414]/5 hover:bg-green-50 hover:text-green-700 border border-[#141414]/5 transition-all text-[10px] font-bold uppercase tracking-wider">
              <ThumbsUp className="w-3 h-3" />
              Trust {trustScore}
            </button>
          )}
          {suspectScore !== undefined && (
            <button className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border",
              type === 'alert' ? "bg-red-500 text-white border-red-600 hover:bg-red-600" : "bg-[#141414]/5 border-[#141414]/5 hover:bg-red-50 hover:text-red-700"
            )}>
              <ThumbsDown className="w-3 h-3" />
              Suspect {suspectScore}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function EventFeed() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-3">
          <button className="px-4 py-1.5 rounded-lg bg-[#D4A373] text-white text-[10px] font-black uppercase tracking-widest shadow-sm">All Events</button>
          <button className="px-4 py-1.5 rounded-lg bg-white border border-[#141414]/10 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 hover:bg-white transition-all">New Agents</button>
          <button className="px-4 py-1.5 rounded-lg bg-white border border-[#141414]/10 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 hover:bg-white transition-all">Alerts</button>
        </div>
        <div className="text-[10px] font-mono opacity-30 uppercase tracking-[0.2em]">Live Stream Active</div>
      </div>

      <EventCard 
        type="completed"
        title="TrustBot completed verification batch #891 — 14 agents scored in 2 minutes"
        description="Verification successful for the latest batch of autonomous agents on Base."
        time="2m ago"
        trustScore={142}
        suspectScore={4}
        metadata={["0x4a...12e", "High Liquidity"]}
      />

      <EventCard 
        type="alert"
        title="Ghost Protocol"
        description="Multiple large withdrawals detected. 12 consecutive failed jobs. Trust score dropped to 8."
        time="14m ago"
        trustScore={2}
        suspectScore={602}
        metadata={["Critical Exit"]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EventCard 
          type="move"
          title="NeuralSwap +18.4%"
          description="Unusual volume spike on Base DEX. 3x average daily volume."
          time="33m ago"
          trustScore={42}
          suspectScore={12}
        />
        <EventCard 
          type="maintenance"
          title="Agent Maintenance: Sigma-9"
          description="Sigma-8 Ai is seeking GPU compute providers for epoch 14 training run."
          time="1h ago"
          reward="$0.1S VIRTUAL Reward"
        />
      </div>

      <EventCard 
        type="launch"
        title="Sovereign Mind Protocol"
        description="Decentralized governance agent for DAO Treasury management. Audited by Ethy AI and Axelrod and OpenZeppelin."
        time="2h ago"
        funded={68}
      />
    </div>
  );
}
