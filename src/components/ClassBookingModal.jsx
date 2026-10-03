import React, { useState } from 'react';
import { X, Calendar, Clock, User, CheckCircle2, Flame, ArrowRight, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { normalizeIndianMobile } from '../../shared/phone.js';

export default function ClassBookingModal({ isOpen, onClose, gymClass, onBookedSuccess }) {
  const [athleteName, setAthleteName] = useState('');
  const [athletePhone, setAthletePhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !gymClass) return null;

  const handleBooking = async (e) => {
    e.preventDefault();
    const phone = normalizeIndianMobile(athletePhone);
    if (!phone) {
      setError('Enter a valid 10-digit Indian mobile number starting with 6–9.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await api.bookClass(gymClass.id, {
        athleteName,
        athletePhone: phone
      });

      if (res.success) {
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch {}

        setConfirmed(true);
        if (onBookedSuccess) onBookedSuccess(gymClass.id);
      }
    } catch (err) {
      setError(err.message || 'Could not reserve this class. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md glass-card rounded-3xl border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmed ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-2xl font-bold text-white">SPOT CONFIRMED!</h3>
            <p className="text-slate-300 text-sm">
              You are booked for <strong className="text-amber-400">{gymClass.title}</strong>.
            </p>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-left space-y-1.5 text-slate-300">
              <div>Time: <strong className="text-white">{gymClass.time}</strong></div>
              <div>Coach: <strong className="text-white">{gymClass.instructor}</strong></div>
              <div>Estimated Calorie Burn: <strong className="text-amber-400">{gymClass.calories}</strong></div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase"
            >
              Done & Return to Schedule
            </button>
          </div>
        ) : (
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
              {gymClass.category} Studio Session
            </span>
            <h3 className="text-2xl font-bebas text-white mb-2">{gymClass.title}</h3>
            
            <div className="flex items-center gap-3 text-xs text-slate-300 mb-6 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{gymClass.time}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>{gymClass.instructor}</span>
              </div>
            </div>

            <form onSubmit={handleBooking} className="space-y-4">
              {error && <p role="alert" className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300"><AlertCircle className="h-4 w-4 shrink-0" />{error}</p>}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Athlete Name *
                </label>
                <input
                  type="text"
                  required
                  value={athleteName}
                  onChange={(e) => setAthleteName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

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
                  value={athletePhone}
                  onChange={(e) => setAthletePhone(e.target.value)}
                  placeholder="98765 43210 or +91"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? 'RESERVING...' : 'CONFIRM CLASS SPOT'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
