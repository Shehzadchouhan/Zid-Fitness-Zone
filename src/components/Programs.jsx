import React, { useState } from 'react';
import { Dumbbell, Flame, Trophy, Zap, Shield, HeartPulse, Clock, Sparkles, Check, ArrowRight } from 'lucide-react';
import { PROGRAMS } from '../data/gymData';

const ICON_MAP = {
  Dumbbell,
  Flame,
  Trophy,
  Zap,
  Shield,
  HeartPulse
};

export default function Programs({ onSelectProgram }) {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Strength', 'CrossFit', 'Cardio', 'Combat', 'Recovery'];

  const filteredPrograms = activeCategory === 'All'
    ? PROGRAMS
    : PROGRAMS.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <section id="programs" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-amber-400 font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 inline-block mb-3">
            TRAINING DISCIPLINES
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-wide uppercase text-white">
            WORLD-CLASS <span className="gold-gradient-text">PROGRAMS</span>
          </h2>
          <p className="mt-3 text-slate-400 text-base sm:text-lg">
            Whether you want to build stage-ready muscle, explode athletic power, or incinerate stubborn body fat, our scientific protocols get you results.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                activeCategory === cat
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25 scale-105'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPrograms.map((prog) => {
            const IconComponent = ICON_MAP[prog.icon] || Dumbbell;
            return (
              <div
                key={prog.id}
                className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-amber-500/50 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  {/* Card Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={prog.image}
                      alt={prog.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12141a] via-[#12141a]/40 to-transparent" />
                    
                    {/* Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-md text-xs font-bold bg-black/70 backdrop-blur-md text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                        {prog.category}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-300">
                      <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-sm">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{prog.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-sm">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        <span>{prog.burn}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-white tracking-wide">{prog.title}</h3>
                    </div>
                    
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">
                      {prog.description}
                    </p>

                    {/* Highlights */}
                    <div className="space-y-1.5 pt-2 border-t border-white/5">
                      {prog.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 pt-0">
                  <button
                    onClick={() => onSelectProgram(prog)}
                    className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-amber-500 hover:text-black text-amber-400 font-bold text-sm tracking-wide border border-amber-500/30 hover:border-amber-500 transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    <span>START THIS PROGRAM</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
