import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, QrCode, Phone, Calendar, ArrowRight, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { GYM_INFO } from '../data/gymData';
import { normalizeIndianMobile } from '../../shared/phone.js';

const PASS_STORAGE_KEY = 'sfz_vip_pass';

function readStoredPass() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(PASS_STORAGE_KEY) || 'null');
    if (stored?.name && stored?.passCode) return stored;
  } catch {}
  return null;
}

export default function JoinModal({ isOpen, onClose, initialData = {} }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    timeSlot: 'Morning (6:00 AM - 7:30 AM)',
    goal: initialData.defaultGoal || 'Free 1-Day Trial Pass'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(readStoredPass);

  const handleClose = () => {
    if (bookingConfirmed) {
      sessionStorage.removeItem(PASS_STORAGE_KEY);
      setBookingConfirmed(null);
    }
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phone = normalizeIndianMobile(formData.phone);
    if (!phone) {
      setError('Enter a valid 10-digit Indian mobile number starting with 6–9.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await api.createLead({
        name: formData.name,
        phone,
        email: formData.email,
        goal: formData.goal,
        timePreference: formData.timeSlot,
        source: 'Free Pass Modal'
      });

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      const pass = {
        name: res.lead.name,
        timeSlot: formData.timeSlot,
        passCode: `ZID-PASS-${Math.floor(100000 + Math.random() * 900000)}`
      };
      try {
        sessionStorage.setItem(PASS_STORAGE_KEY, JSON.stringify(pass));
      } catch {}
      setBookingConfirmed(pass);
    } catch (err) {
      setError(err.message || 'Could not request your pass. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-card rounded-3xl border border-amber-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {bookingConfirmed ? (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
              <CheckCircle2 className="w-9 h-9 text-black" />
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-white">
                VIP PASS ISSUED!
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Show this digital card at the ZID front desk for instant entry.
              </p>
            </div>

            {/* Digital Pass Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1c1f2b] to-[#0d0e14] border-2 border-amber-400/60 shadow-xl text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-black font-extrabold text-[10px] rounded-bl-xl tracking-wider">
                1-DAY ALL ACCESS
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="font-bebas text-xl text-white">ZID</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="text-slate-400">Athlete Name: <strong className="text-white">{bookingConfirmed.name}</strong></div>
                <div className="text-slate-400">Access Code: <span className="font-mono font-bold text-amber-300">{bookingConfirmed.passCode}</span></div>
                <div className="text-slate-400">Reserved Slot: <strong className="text-slate-200">{bookingConfirmed.timeSlot}</strong></div>
                <div className="text-slate-400">Arena: <span className="text-slate-200">Ferozepur Rd, Ludhiana</span></div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Valid for Next 48 Hours
                </span>
                <span className="text-[10px] text-slate-500 font-mono">POWERED BY ZID OS</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              <a
                href={`https://wa.me/${GYM_INFO.whatsapp}?text=${encodeURIComponent(`Hi! I just claimed my ZID VIP Pass ${bookingConfirmed.passCode} for ${bookingConfirmed.name}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <span>SEND PASS TO MY WHATSAPP</span>
              </a>

              <button
                onClick={handleClose}
                className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Close & Return to Arena
              </button>
            </div>

          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                COMPLIMENTARY PASS
              </span>
            </div>

            <h3 className="text-2xl font-bebas tracking-wide text-white mb-2">
              CLAIM YOUR 1-DAY <span className="text-amber-400">FREE VIP PASS</span>
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              Experience our 10,000 sq.ft strength floor, group classes, and steam sauna with zero obligation.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p role="alert" className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300"><AlertCircle className="h-4 w-4 shrink-0" />{error}</p>}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Gurpreet Singh"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Phone Number (For front-desk follow-up) *
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={16}
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="98765 43210 or +91"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Preferred Visit Slot
                </label>
                <select
                  value={formData.timeSlot}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeSlot: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-500 focus:outline-none"
                >
                  <option value="Morning (6:00 AM - 7:30 AM)">Morning (6:00 AM - 7:30 AM)</option>
                  <option value="Morning (8:00 AM - 9:30 AM)">Morning (8:00 AM - 9:30 AM)</option>
                  <option value="Evening (5:30 PM - 7:00 PM)">Peak Evening (5:30 PM - 7:00 PM)</option>
                  <option value="Night (7:30 PM - 9:00 PM)">Night (7:30 PM - 9:00 PM)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? 'GENERATING PASS...' : 'GENERATE MY VIP PASS'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
