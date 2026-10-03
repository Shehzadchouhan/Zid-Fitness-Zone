import React, { useState } from 'react';
import { LayoutGrid, Dumbbell, Activity, Flame, Coffee, ShieldCheck, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { AMENITIES, FAQS } from '../data/gymData';

const ICON_MAP = {
  LayoutGrid,
  Dumbbell,
  Activity,
  Flame,
  Coffee,
  ShieldCheck
};

export default function Amenities() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <section id="amenities" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Amenities Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-amber-400 font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 inline-block mb-3">
            WORLD-CLASS AMENITIES
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-wide uppercase text-white">
            THE ZID <span className="gold-gradient-text">TRAINING EXPERIENCE</span>
          </h2>
          <p className="mt-3 text-slate-400 text-base sm:text-lg">
            Engineered from the ground up for maximum workout productivity, hygiene, recovery, and member luxury.
          </p>
        </div>

        {/* Amenities Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {AMENITIES.map((item, idx) => {
            const Icon = ICON_MAP[item.icon] || Dumbbell;
            return (
              <div
                key={idx}
                className="glass-card rounded-2xl p-6 border border-white/10 hover:border-amber-500/40 transition-all flex items-start gap-4"
              >
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block mb-1">
                    {item.category}
                  </span>
                  <h3 className="text-lg font-bold text-white mb-1.5">{item.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-amber-400 font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 inline-block mb-3">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold uppercase text-white">
              GOT QUESTIONS? <span className="gold-gradient-text">WE'VE GOT ANSWERS.</span>
            </h3>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="glass-card rounded-2xl border border-white/10 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-base text-white hover:text-amber-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-amber-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-slate-300 text-sm leading-relaxed border-t border-white/5">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
