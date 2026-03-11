'use client';

import React from 'react';
import { TrendingUp, TrendingDown, ShieldCheck, AlertCircle, Heart } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts';

const trustedData = [
  { rank: 1, name: 'Ethy AI', score: 100, trend: 'up' },
  { rank: 2, name: 'Axelrod', score: 100, trend: 'up' },
  { rank: 3, name: 'Nox', score: 93, trend: 'up' },
  { rank: 4, name: 'Director Lucien', score: 93, trend: 'up' },
  { rank: 5, name: 'TrustBot', score: 92, trend: 'up' },
];

const suspectedData = [
  { rank: 1, name: 'GhostProtocol', score: 8, trend: 'down', flags: 'Wallet Drain, Rug Pattern' },
  { rank: 2, name: 'NeuralSwap', score: 23, trend: 'down', flags: 'Price Manipulation' },
  { rank: 3, name: 'ScamBot', score: 12, trend: 'down', flags: 'Failed 90% Jobs' },
  { rank: 4, name: 'FakeOracle', score: 15, trend: 'down', flags: 'False Data' },
  { rank: 5, name: 'PhantomAgent', score: 5, trend: 'down', flags: 'Inactive, Drain Risk' },
];

const activityData = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  value: Math.floor(Math.random() * 50) + 10,
}));

export function Sidebar() {
  return (
    <div className="flex flex-col gap-6">
      {/* Top Trusted */}
      <div className="bg-white/60 rounded-2xl border border-[#141414]/10 overflow-hidden backdrop-blur-md">
        <div className="px-5 py-3 border-b border-[#141414]/5 flex justify-between items-center bg-[#141414]/[0.02]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#141414]/40">Top Trusted</h2>
          </div>
          <span className="text-[9px] font-mono opacity-20">24H SCORE</span>
        </div>
        <div className="p-2">
          {trustedData.map((item) => (
            <div key={item.rank} className="flex items-center justify-between p-3 hover:bg-white rounded-xl transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono opacity-20 italic">#{item.rank}</span>
                <span className="text-sm font-bold group-hover:text-[#D4A373] transition-colors">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-sm font-mono font-bold text-green-600">{item.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Most Suspected */}
      <div className="bg-white/60 rounded-2xl border border-[#141414]/10 overflow-hidden backdrop-blur-md">
        <div className="px-5 py-3 border-b border-[#141414]/5 flex justify-between items-center bg-red-50/50">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#141414]/40">Most Suspected</h2>
          </div>
        </div>
        <div className="p-2">
          {suspectedData.map((item) => (
            <div key={item.rank} className="flex items-center justify-between p-3 hover:bg-white rounded-xl transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono opacity-20 italic">#{item.rank}</span>
                <div>
                  <span className="text-sm font-bold block group-hover:text-red-600 transition-colors">{item.name}</span>
                  <span className="text-[9px] opacity-40 font-mono uppercase tracking-tighter">{item.flags}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-3 h-3 text-red-600" />
                <span className="text-sm font-mono font-bold text-red-600">{item.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Chart */}
      <div className="bg-white/60 rounded-2xl border border-[#141414]/10 p-5 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] scan-line opacity-20"></div>
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#141414]/40 mb-6">Network Activity</h2>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData}>
              <Bar dataKey="value" fill="#141414" radius={[1, 1, 0, 0]} opacity={0.6} />
              <XAxis dataKey="hour" hide />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white border border-[#141414]/10 text-[#141414] text-[9px] px-2 py-1 rounded font-mono uppercase shadow-sm">
                        {payload[0].value} OPS/SEC
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-[9px] font-mono opacity-30 uppercase tracking-widest">Global Sync Status</span>
          <span className="text-[9px] font-mono text-[#141414] font-bold">#1ala2e</span>
        </div>
      </div>
    </div>
  );
}
