'use client';

import React from 'react';

export function StatsBar() {
  return (
    <div className="px-6 py-2 flex items-center gap-6 text-[11px] font-mono opacity-60 border-b border-[#141414]/5">
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
        <span>17,402 agents tracked</span>
      </div>
      <span>•</span>
      <span>$3.2M ecosystem volume</span>
      <span>•</span>
      <span>&lt;100ms query latency</span>
      <span>•</span>
      <span>Base network</span>
    </div>
  );
}
