'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { StatsBar } from '@/components/StatsBar';
import { EventFeed } from '@/components/EventFeed';
import { Sidebar } from '@/components/Sidebar';
import { BottomStats } from '@/components/BottomStats';
import { motion } from 'motion/react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Atmospheric Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#D4A373]/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-500/5 blur-[120px] rounded-full"></div>
      </div>

      <Header />
      <StatsBar />
      
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10 relative z-10">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-2 py-0.5 bg-[#D4A373]/10 text-[#D4A373] text-[10px] font-bold uppercase tracking-[0.3em] border border-[#D4A373]/20 rounded">System Online</span>
            <div className="h-[1px] flex-1 bg-[#141414]/10"></div>
          </div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl md:text-7xl font-black tracking-tighter mb-4 uppercase italic text-[#141414]"
          >
            Live Agent <span className="text-[#D4A373]">Intelligence</span>
          </motion.h2>
          <p className="text-lg opacity-60 font-medium max-w-2xl leading-relaxed">
            Real-time neural event monitoring across the Virtuals ACP ecosystem. 
            <span className="text-[#141414]/80 ml-2">Scanning 17,402 active nodes.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <EventFeed />
          </div>
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>

        <BottomStats />
      </main>

      <footer className="p-8 text-center text-[9px] opacity-30 font-mono uppercase tracking-[0.5em] relative z-10">
        &copy; 2026 Agentic Panic Neural Interface • Secure Connection Established
      </footer>
    </div>
  );
}
