import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { GYM_INFO } from '../data/gymData';
import { api } from '../services/api';
import { normalizeIndianMobile } from '../../shared/phone.js';

export default function ContactSection({ onLeadSubmitted }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    age: '',
    gender: 'male',
    locality: '',
    goal: 'Muscle Building & Strength',
    timePreference: 'Morning (6 AM - 8 AM)',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Phone validation
    const phone = normalizeIndianMobile(formData.phone);
    if (!phone) {
      setError('Enter a valid 10-digit Indian mobile number starting with 6–9.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.createLead({
        ...formData,
        phone,
        source: 'Contact & Join Form'
      });

      if (res.success) {
        setSuccess(true);
        if (onLeadSubmitted) onLeadSubmitted(res.lead);
        setFormData({
          name: '',
          phone: '',
          email: '',
          age: '',
          gender: 'male',
          locality: '',
          goal: 'Muscle Building & Strength',
          timePreference: 'Morning (6 AM - 8 AM)',
          notes: ''
        });
      } else {
        setError(res.error || 'Failed to submit form. Please try again.');
      }
    } catch (err) {
      setError('Network error. Your details have been saved locally.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 relative bg-slate-950/90 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-amber-400 font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 inline-block mb-3">
            GET IN TOUCH & VISIT ARENA
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-wide uppercase text-white">
            START YOUR <span className="gold-gradient-text">JOURNEY TODAY</span>
          </h2>
          <p className="mt-3 text-slate-400 text-base sm:text-lg">
            Have questions or want to tour the facility? Fill out the form or drop in directly at our Ludhiana arena.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Contact Details & Location Card */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
              <h3 className="text-2xl font-bebas tracking-wide text-white">
                ZID <span className="text-amber-400">HQ</span>
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold text-slate-400 block mb-0.5">Location</span>
                    <p className="text-sm text-slate-200 font-medium leading-snug">
                      {GYM_INFO.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold text-slate-400 block mb-0.5">Arena Operating Hours</span>
                    <p className="text-sm text-slate-200 font-medium">
                      Mon – Sat: <span className="text-amber-400">{GYM_INFO.timing.weekdays}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Sunday: {GYM_INFO.timing.sundays}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold text-slate-400 block mb-0.5">Direct Line</span>
                    <a href={`tel:${GYM_INFO.phone}`} className="text-sm text-slate-200 font-medium hover:text-amber-400 transition-colors">
                      {GYM_INFO.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold text-slate-400 block mb-0.5">Official Email</span>
                    <a href={`mailto:${GYM_INFO.email}`} className="text-sm text-slate-200 font-medium hover:text-amber-400 transition-colors">
                      {GYM_INFO.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Callout */}
              <div className="pt-4 border-t border-white/5">
                <a
                  href={`https://wa.me/${GYM_INFO.whatsapp}?text=Hi%20Coach%20Shehzad!%20I%20want%20to%20know%20more%20about%20joining%20ZID.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>DIRECT WHATSAPP CONCIERGE</span>
                </a>
              </div>
            </div>

          </div>

          {/* Upgraded Join & Inquire Form */}
          <div className="lg:col-span-7 glass-card rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl">
            <h3 className="text-2xl font-bebas tracking-wide text-white mb-2">
              APPLY FOR MEMBERSHIP & <span className="text-amber-400">FREE ASSESSMENT</span>
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mb-6">
              Fill in your details below. Our team reviews your training goals and schedules your free 1-on-1 fitness assessment.
            </p>

            {success ? (
              <div className="p-8 text-center space-y-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-bold text-white">Application Received!</h4>
                <p className="text-slate-300 text-sm max-w-md mx-auto">
                  Thank you! A ZID fitness advisor will call you shortly to confirm your free trial pass and training slot.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-6 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs uppercase"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Mohd. Shehzad"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white focus:border-amber-500 focus:outline-none transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      maxLength={16}
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="98765 43210 or +91"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white focus:border-amber-500 focus:outline-none transition-colors text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@email.com"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white focus:border-amber-500 focus:outline-none transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      min="16"
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="e.g. 24"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white focus:border-amber-500 focus:outline-none transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white focus:border-amber-500 focus:outline-none transition-colors text-sm"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      Locality / Area
                    </label>
                    <input
                      type="text"
                      name="locality"
                      value={formData.locality}
                      onChange={handleChange}
                      placeholder="e.g. Model Town / Sarabha Nagar"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white focus:border-amber-500 focus:outline-none transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      Primary Fitness Goal
                    </label>
                    <select
                      name="goal"
                      value={formData.goal}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white focus:border-amber-500 focus:outline-none transition-colors text-sm"
                    >
                      <option value="Muscle Building & Strength">Muscle Building & Hypertrophy</option>
                      <option value="Fat Loss & Toning">Fat Loss & Toning</option>
                      <option value="Olympic Powerlifting">Olympic Powerlifting (1RM Peaking)</option>
                      <option value="Spartan CrossFit & Stamina">Spartan CrossFit & Conditioning</option>
                      <option value="Combat Boxing & Core">Combat Boxing & Core Strike</option>
                      <option value="General Health & Rehab">General Mobility & Health</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Preferred Workout Timing
                  </label>
                  <select
                    name="timePreference"
                    value={formData.timePreference}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white focus:border-amber-500 focus:outline-none transition-colors text-sm"
                  >
                    <option value="Morning (5:30 AM - 8:00 AM)">Early Morning (5:30 AM - 8:00 AM)</option>
                    <option value="Forenoon (8:00 AM - 11:00 AM)">Forenoon (8:00 AM - 11:00 AM)</option>
                    <option value="Afternoon (12:00 PM - 4:00 PM)">Afternoon (12:00 PM - 4:00 PM)</option>
                    <option value="Evening (5:00 PM - 8:00 PM)">Peak Evening (5:00 PM - 8:00 PM)</option>
                    <option value="Night (8:00 PM - 10:30 PM)">Late Night (8:00 PM - 10:30 PM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Any Injuries or Specific Questions? (Optional)
                  </label>
                  <textarea
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Tell us about previous training experience, shoulder/knee injuries, or questions about trainers..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white focus:border-amber-500 focus:outline-none transition-colors text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'SUBMITTING APPLICATION...' : 'SUBMIT MEMBERSHIP APPLICATION'}</span>
                </button>
              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
