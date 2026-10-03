import React from 'react';
import { Star, Flame, Trophy, Quote, ArrowRight } from 'lucide-react';
import { TRANSFORMATIONS, TESTIMONIALS } from '../data/gymData';

export default function Transformations({ onOpenJoinModal }) {
  return (
    <section id="results" className="py-20 relative bg-slate-950/80 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-amber-400 font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 inline-block mb-3">
            VERIFIED PROOF & TRANSFORMATIONS
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-wide uppercase text-white">
            RESULTS THAT <span className="gold-gradient-text">CHANGE YOUR LIFE</span>
          </h2>
          <p className="mt-3 text-slate-400 text-base sm:text-lg">
            From low energy to elite performance — these are the stories of disciplined athletes who committed to a smarter system and never looked back.
          </p>
        </div>

        {/* Transformations Showcase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {TRANSFORMATIONS.map((item, idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-amber-500/40 transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Images Container */}
                <div className="relative h-64 overflow-hidden grid grid-cols-2 gap-1 bg-black p-1">
                  <div className="relative h-full overflow-hidden rounded-l-xl">
                    <img
                      src={item.beforeImg}
                      alt={`${item.name} Before`}
                      className="w-full h-full object-cover filter grayscale"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-slate-300">
                      BEFORE ({item.beforeWeight})
                    </div>
                  </div>

                  <div className="relative h-full overflow-hidden rounded-r-xl">
                    <img
                      src={item.afterImg}
                      alt={`${item.name} After`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-amber-500 text-[10px] font-bold text-black">
                      AFTER ({item.afterWeight})
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">{item.name}</h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                      {item.timeline}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-300 mb-4 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{item.metrics}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed italic mb-4">
                    "{item.quote}"
                  </p>

                  <div className="text-[11px] text-slate-400">
                    Coach: <strong className="text-slate-200">{item.trainer}</strong>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => onOpenJoinModal({ defaultGoal: `Transformation like ${item.name}` })}
                  className="w-full py-2.5 rounded-xl bg-slate-800/90 hover:bg-amber-500 hover:text-black text-amber-400 font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2"
                >
                  <span>START MY TRANSFORMATION</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Member Reviews & Google Rating Badge */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-white/5">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-6 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs text-slate-500">{t.date}</span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                "{t.comment}"
              </p>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <strong className="text-white">{t.name}</strong>
                <span className="text-amber-400 font-medium">{t.plan}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
