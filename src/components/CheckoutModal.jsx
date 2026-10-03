import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Tag, Sparkles, CreditCard, ArrowRight, Download, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { normalizeIndianMobile } from '../../shared/phone.js';

export default function CheckoutModal({ isOpen, onClose, planData, onMembershipCreated }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [coupon, setCoupon] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [enrolledMember, setEnrolledMember] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen || !planData) return null;

  const { plan, billingCycle } = planData;
  const rawPrice = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
  const discountAmount = Math.round((rawPrice * discountPercent) / 100);
  const finalPrice = rawPrice - discountAmount;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    const clean = coupon.trim().toUpperCase();
    if (clean === 'SFZFIRST' || clean === 'PUNJABFIT') {
      setDiscountPercent(10);
      setCouponSuccess('10% VIP Launch Discount applied!');
    } else {
      setCouponError('Invalid coupon. Try using "SFZFIRST"');
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    const normalizedPhone = normalizeIndianMobile(phone);
    if (!normalizedPhone) {
      setError('Enter a valid 10-digit Indian mobile number starting with 6–9.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const request = await api.createLead({
        name,
        phone: normalizedPhone,
        email,
        planInterest: plan.name,
        source: 'Membership Plan Request',
        membershipRequest: { billingCycle, amount: finalPrice },
        notes: `Requested ${plan.name} (${billingCycle}) at ₹${finalPrice}. Payment and membership activation are pending owner confirmation.`
      });

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 }
        });
      } catch {}

      setEnrolledMember({ ...request.lead, plan: plan.name, billingCycle, amount: finalPrice });
    } catch (err) {
      setError(err.message || 'Could not send your membership request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-card rounded-3xl border border-amber-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {enrolledMember ? (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs uppercase font-extrabold text-amber-400 tracking-widest block mb-1">
                MEMBERSHIP REQUEST RECEIVED
              </span>
              <h3 className="text-2xl font-bebas text-white">
                YOUR PLAN IS RESERVED FOR FOLLOW-UP
              </h3>
              <p className="text-slate-300 text-xs mt-1">
                The ZID team will contact you to confirm your plan and payment. No payment was taken and your membership is not active yet.
              </p>
            </div>

            {/* Member Digital Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1b1e28] to-[#0c0d12] border-2 border-amber-400 text-left space-y-3 shadow-2xl relative">
              <div className="flex items-center justify-between">
                  <span className="font-bebas text-2xl text-white">
                  ZID <span className="text-amber-400">MEMBERSHIP REQUEST</span>
                </span>
                  <span className="px-2.5 py-0.5 rounded bg-amber-500 text-black font-extrabold text-[10px] uppercase">Pending</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/10">
                <div>
                  <span className="text-slate-500 block">Member Name</span>
                  <strong className="text-white">{enrolledMember.name}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Request ID</span>
                  <strong className="font-mono text-amber-300">{enrolledMember.id}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Status</span>
                  <span className="text-amber-300 font-bold">Awaiting confirmation</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Plan / Billing</span>
                  <strong className="text-slate-200">{enrolledMember.plan} / {enrolledMember.billingCycle}</strong>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider"
            >
              Close & Return to ZID
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                MEMBERSHIP ENROLLMENT
              </span>
            </div>

            <h3 className="text-2xl font-bebas text-white mb-1">
              JOIN ON <span className="text-amber-400">{plan.name}</span>
            </h3>
            <p className="text-slate-400 text-xs mb-6">
              Send your plan request. The team will confirm payment and membership activation with you.
            </p>

            {/* Plan Price Summary */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 mb-6 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Selected Plan:</span>
                <strong className="text-white">{plan.name} ({billingCycle.toUpperCase()})</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Base Price:</span>
                <span className="font-medium">₹{rawPrice.toLocaleString('en-IN')}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Coupon Discount ({discountPercent}%):</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                <span className="font-bold text-white text-sm">Plan Total:</span>
                <span className="text-2xl font-bebas text-amber-400 tracking-wide">
                  ₹{finalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Coupon input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2 mb-6">
              <input
                type="text"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Promo Code (Try SFZFIRST)"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white uppercase focus:border-amber-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs"
              >
                Apply
              </button>
            </form>
            {couponSuccess && <p className="text-xs text-emerald-400 -mt-4 mb-4">{couponSuccess}</p>}
            {couponError && <p className="text-xs text-rose-400 -mt-4 mb-4">{couponError}</p>}

            {/* Checkout Form */}
            <form onSubmit={handleCheckout} className="space-y-3.5">
              {error && <p role="alert" className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300"><AlertCircle className="h-4 w-4 shrink-0" />{error}</p>}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mohd. Shehzad"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={16}
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210 or +91"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-[11px] text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Demo checkout only. No payment is processed here; the gym will confirm payment in person.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? 'SENDING REQUEST...' : `SEND MEMBERSHIP REQUEST · ₹${finalPrice.toLocaleString('en-IN')}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
