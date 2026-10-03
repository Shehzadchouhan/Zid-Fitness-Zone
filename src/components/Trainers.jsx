import React from 'react';
import { Calendar } from 'lucide-react';
import { TRAINERS } from '../data/gymData';

export default function Trainers({ onBookTrainer }) {
  const coach = TRAINERS.find((trainer) => trainer.id === 'shehzad');

  return (
    <section id="coaches" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-amber-400 font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 inline-block mb-3">
            YOUR GYM OWNER & COACH
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-wide uppercase text-white">
            MEET YOUR <span className="gold-gradient-text">TRANSFORMATION COACH</span>
          </h2>
          <p className="mt-3 text-slate-400 text-base sm:text-lg">
            Train one-on-one with Mohd. Shehzad, the gym owner and head coach, with a plan built around your goals.
          </p>
        </div>

        {/* Owner and head coach */}
        <div className="mx-auto max-w-2xl">
          {coach && (
            <div
              key={coach.id}
              className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-amber-500/50 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                {/* Image */}
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={coach.image}
                    alt={coach.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12141a] via-[#12141a]/30 to-transparent" />
                  
                  {/* Experience Badge */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-[11px] font-bold text-amber-400 border border-amber-500/30">
                    {coach.experience} EXP
                  </div>

                  <div className="absolute bottom-3 left-4 right-4">
                    <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">
                      {coach.role}
                    </span>
                    <h3 className="text-2xl font-bebas text-white tracking-wide">
                      {coach.name}
                    </h3>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
                  <p className="text-xs text-slate-300 italic border-l-2 border-amber-500 pl-2.5">
                    "{coach.bio}"
                  </p>

                  <div className="pt-2 border-t border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Specialty & Credentials:
                    </span>
                    <p className="text-xs font-semibold text-amber-300">
                      {coach.specialty}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {coach.certifications.map((c, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => onBookTrainer(coach)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-black text-amber-400 font-bold text-xs tracking-wider uppercase border border-amber-500/30 hover:border-amber-500 transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>BOOK WITH MOHD. SHEHZAD</span>
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </section>
  );
}
