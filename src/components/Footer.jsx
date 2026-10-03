import React from 'react';
import { Dumbbell, Phone, Mail, MapPin, ArrowUp } from 'lucide-react';
import { GYM_INFO } from '../data/gymData';

export default function Footer({ onToggleAdmin }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black border-t border-white/10 pt-16 pb-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="zid-wordmark zid-wordmark--compact" aria-label="ZID logo">
                <span className="zid-wordmark__text">ZID</span>
              </div>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Punjab's premier 10,000 sq.ft strength and human performance arena. Specializing in scientific bodybuilding, Olympic powerlifting, CrossFit, and custom body transformations.
            </p>

            <div className="text-xs text-slate-400 space-y-1">
              <div>Founder & Head Coach: <strong className="text-white">{GYM_INFO.founder}</strong></div>
              <div>Arena Location: <strong className="text-slate-200">{GYM_INFO.city}</strong></div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li><a href="#programs" className="hover:text-amber-400 transition-colors">Training Programs</a></li>
              <li><a href="#fitness-lab" className="hover:text-amber-400 transition-colors">BMI & Macro Lab</a></li>
              <li><a href="#pricing" className="hover:text-amber-400 transition-colors">Membership Tiers</a></li>
              <li><a href="#coaches" className="hover:text-amber-400 transition-colors">Certified Coaches</a></li>
              <li><a href="#results" className="hover:text-amber-400 transition-colors">Client Results</a></li>
            </ul>
          </div>

          {/* Facilities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Arena Zones
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>Hammer Strength Iso-Lateral</li>
              <li>Olympic Rubber Drop Platforms</li>
              <li>Spartan CrossFit Turf & Rig</li>
              <li>Finnish Steam & Sauna Spa</li>
              <li>InBody 570 Composition Lab</li>
              <li>SFZ Fuel & Espresso Bar</li>
            </ul>
          </div>

          {/* Operating Hours & Admin */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Arena Hours
            </h4>
            <div className="text-xs text-slate-300 space-y-1.5">
              <div>
                <span className="text-slate-400 block">Mon – Saturday:</span>
                <strong className="text-amber-300">5:00 AM – 11:00 PM</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Sunday:</span>
                <strong className="text-slate-200">7:00 AM – 2:00 PM</strong>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onToggleAdmin}
                className="text-[11px] px-3 py-1.5 rounded-lg bg-slate-900 border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors flex items-center gap-1.5"
              >
                <span>⚡ Open Gym Owner Portal</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Credits & Tech Stack */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} ZID. All rights reserved.
            <span className="block sm:inline sm:ml-2">Crafted by <a href="https://github.com/ShehzadChouhan" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-amber-400 font-medium underline">Mohd. Shehzad</a></span>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-slate-900 text-[10px] text-amber-400/80 border border-slate-800">
              React 19 • Tailwind CSS • Express API • Node.js
            </span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Scroll to Top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
