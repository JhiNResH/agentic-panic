'use client';

import React from 'react';
import { Search, Bell, User } from 'lucide-react';

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-[#141414]/10 bg-[#E4E3E0]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#D4A373] rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold">A</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-tight">Agentic Panic</h1>
            <p className="text-[10px] opacity-40 uppercase tracking-[0.2em] font-mono">Neural Interface v2.6</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-xs font-bold uppercase tracking-widest border-b border-[#141414] pb-1 text-[#141414]">Feed</a>
          <a href="#" className="text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Analytics</a>
          <a href="#" className="text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Dashboard</a>
          <a href="#" className="text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Alerts</a>
        </nav>
      </div>

      <div className="flex items-center gap-4 flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
          <input 
            type="text" 
            placeholder="Search agents, contracts, or events..." 
            className="w-full bg-[#141414]/5 border border-[#141414]/10 rounded-lg py-2 pl-10 pr-4 text-xs font-mono focus:outline-none focus:border-[#141414]/20 transition-colors placeholder:opacity-40"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-[#141414]/5 rounded-lg transition-colors relative group">
          <Bell className="w-5 h-5 opacity-60 group-hover:opacity-100" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
        </button>
        <div className="w-9 h-9 rounded-lg overflow-hidden border border-[#141414]/10 p-0.5 bg-white">
          <img src="https://picsum.photos/seed/user/100/100" alt="User" className="w-full h-full object-cover rounded-md transition-all" />
        </div>
      </div>
    </header>
  );
}
