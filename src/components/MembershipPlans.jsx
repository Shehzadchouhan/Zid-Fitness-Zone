import React, { useState } from 'react';
import { Check, X, Sparkles, ArrowRight, Zap, Shield, Crown } from 'lucide-react';
import { PLANS } from '../data/gymData';

export default function MembershipPlans({ onSelectPlan }) {
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' | 'annual'

  return (
    <section id="pricing" className="py-20 relative bg-slate-950/60 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-amber-400 font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 inline-block mb-3">
            MEMBERSHIP TIERS
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-wide uppercase text-white">
            YOUR NEXT LEVEL STARTS <span className="gold-gradient-text">HERE</span>
          </h2>
          <p className="mt-3 text-slate-400 text-base sm:text-lg">
            Precision coaching, premium equipment, and a culture of execution designed for people who take performance seriously.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>

            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                billingCycle === 'annual'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Plan</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-black text-amber-400 tracking-wider">
                SAVE 25%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
          {PLANS.map((plan) => {
            const isAnnual = billingCycle === 'annual';
            const price = isAnnual
              ? Math.round(plan.annualPrice / 12)
              : plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-b from-[#181b24] to-[#0e1017] border-2 border-amber-400 shadow-2xl shadow-amber-500/20 lg:-translate-y-4'
                    : 'glass-card border border-white/10 hover:border-white/20'
                }`}
              >
                {/* Popular Ribbon */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-xs uppercase tracking-widest shadow-md">
                    MOST POPULAR CHOICE
                  </div>
                )}

                <div>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      {plan.badge}
                    </span>
                    {plan.popular ? <Crown className="w-5 h-5 text-amber-400" /> : <Shield className="w-5 h-5 text-slate-500" />}
                  </div>

                  <h3 className="text-2xl font-extrabold text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-6">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="pb-6 border-b border-white/10 mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-amber-400">₹</span>
                      <span className="text-5xl font-bebas text-white tracking-wider">
                        {price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-slate-400 text-sm font-medium">/ month</span>
                    </div>

                    {isAnnual ? (
                      <div className="mt-2 text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Billed annually at ₹{plan.annualPrice.toLocaleString('en-IN')} ({plan.savingsAnnual})</span>
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-slate-500">
                        Billed monthly. Cancel or freeze anytime.
                      </div>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Included Privileges:
                    </span>
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200">
                        <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}

                    {plan.notIncluded && plan.notIncluded.length > 0 && (
                      <div className="pt-2 border-t border-white/5 space-y-2">
                        {plan.notIncluded.map((nf, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs text-slate-500 line-through">
                            <X className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                            <span>{nf}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Enroll CTA */}
                <button
                  onClick={() => onSelectPlan({ plan, billingCycle, price })}
                  className={`w-full py-3.5 rounded-xl font-extrabold text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black shadow-lg shadow-amber-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-amber-500/40'
                  }`}
                >
                  <span>GET STARTED NOW</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

              </div>
            );
          })}
        </div>

        {/* Corporate & Student Discount Notice */}
        <div className="mt-12 text-center text-xs text-slate-400 max-w-xl mx-auto">
          Need custom corporate wellness plans for teams or student membership discounts?
          <a href="#contact" className="text-amber-400 ml-1 font-semibold underline hover:text-amber-300">
            Contact our corporate desk
          </a>
        </div>

      </div>
    </section>
  );
}
