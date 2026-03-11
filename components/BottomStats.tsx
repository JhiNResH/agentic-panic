'use client';

import React from 'react';

export function BottomStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16 pt-10 border-t border-[#141414]/10">
      <div className="flex flex-col group cursor-default">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#D4A373] mb-2">Active Nodes</span>
        <span className="text-4xl font-black tracking-tighter group-hover:text-[#D4A373] transition-colors text-[#141414]">17,402</span>
        <span className="text-[10px] font-mono opacity-30 mt-1">Verified Autonomous Agents</span>
      </div>
      <div className="flex flex-col group cursor-default">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#D4A373] mb-2">Network Volume</span>
        <span className="text-4xl font-black tracking-tighter group-hover:text-[#D4A373] transition-colors text-[#141414]">$3.2M</span>
        <span className="text-[10px] font-mono opacity-30 mt-1">24H Transaction Throughput</span>
      </div>
      <div className="flex flex-col group cursor-default">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#D4A373] mb-2">Security Index</span>
        <span className="text-4xl font-black tracking-tighter text-green-600 shadow-sm">94%</span>
        <span className="text-[10px] font-mono opacity-30 mt-1">Rug Prevention Success Rate</span>
      </div>
    </div>
  );
}
