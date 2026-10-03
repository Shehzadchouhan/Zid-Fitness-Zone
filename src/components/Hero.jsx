import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Flame, Users, Trophy, Play, Star, MapPin, Clock } from 'lucide-react';
import { GYM_INFO } from '../data/gymData';

export default function Hero({ onOpenJoinModal }) {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      
      {/* Background Media & Atmospheric Gradients */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80"
          alt="ZID fitness and performance arena"
          className="w-full h-full object-cover object-center filter brightness-[0.28] contrast-125 scale-100 sm:scale-105 transform animate-pulse-subtle"
        />
        
        {/* Athletic radial glow & overlay vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b0e] via-[#0a0b0e]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0b0e] via-transparent to-[#0a0b0e]/80" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Live Facility Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-xs sm:text-sm text-slate-300 backdrop-blur-md mb-6 shadow-lg shadow-black/50">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-emerald-400">NOW OPEN</span>
          <span className="text-slate-500">•</span>
          <span>5 AM  – 10 PM</span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="hidden sm:inline text-amber-300">Thandi Sarak,Malerkotla</span>
        </div>

        {/* Hero Title */}
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="zid-logo-lockup" aria-label="ZID logo">
            <div className="zid-logo-lockup__word">ZID</div>
            <div className="zid-logo-lockup__meta">
              <span className="zid-logo-lockup__meta-line">FITNESS &amp; PERFORMANCE</span>
              <span className="zid-logo-lockup__meta-line zid-logo-lockup__meta-line--accent">TRAIN . GRIND . REPEAT</span>
            </div>
          </div>

          <p className="text-lg sm:text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed">
            Premium strength coaching, elite conditioning, and high-performance transformation for serious people who want measurable results.
          </p>
        </div>

        {/* Primary Call to Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
          <button
            onClick={() => onOpenJoinModal({ defaultGoal: 'Free 1-Day Trial Pass' })}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-extrabold text-base tracking-wider uppercase shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 group"
          >
            <Sparkles className="w-5 h-5 fill-black" />
            <span>CLAIM FREE 1-DAY PASS</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <a
            href="#pricing"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-base tracking-wide border border-slate-700/80 hover:border-amber-500/50 shadow-lg backdrop-blur-md transition-all flex items-center justify-center gap-2"
          >
            <span>VIEW MEMBERSHIPS</span>
          </a>
        </div>

        {/* Highlights Bar */}
        <div className="mt-14 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          
          <div className="flex flex-col items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-1 text-amber-400 font-bebas text-3xl sm:text-4xl tracking-wide">
              <span>{GYM_INFO.stats.membersCount}</span>
            </div>
            <span className="text-xs uppercase tracking-widest text-slate-400 font-medium">Active Athletes</span>
          </div>

          <div className="flex flex-col items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-1 text-amber-400 font-bebas text-3xl sm:text-4xl tracking-wide">
              <span>{GYM_INFO.stats.facilitySqFt}</span>
              <span className="text-base text-slate-400">SQ FT</span>
            </div>
            <span className="text-xs uppercase tracking-widest text-slate-400 font-medium">Strength Arena</span>
          </div>

          <div className="flex flex-col items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-1 text-amber-400 font-bebas text-3xl sm:text-4xl tracking-wide">
              <span>{GYM_INFO.stats.trainersCount}</span>
            </div>
            <span className="text-xs uppercase tracking-widest text-slate-400 font-medium">Head Coach</span>
          </div>

          <div className="flex flex-col items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-1 text-amber-400 font-bebas text-3xl sm:text-4xl tracking-wide">
              <span>4.9</span>
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-xs uppercase tracking-widest text-slate-400 font-medium">680+ Google Reviews</span>
          </div>

        </div>

      </div>
    </section>
  );
}
