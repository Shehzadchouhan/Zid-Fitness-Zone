import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare, Menu, X, Sparkles, LayoutDashboard, ChevronDown, UserRound, LogOut, Activity } from 'lucide-react';
import { GYM_INFO } from '../data/gymData';

export default function Navbar({ onOpenJoinModal, onToggleAdmin, onOpenAuth, onOpenMemberDashboard, onLogout, user, isAdminView }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const primaryLinks = [
    { label: 'Programs', href: '#programs' },
    { label: 'Membership', href: '#pricing' },
    { label: 'Coaches', href: '#coaches' },
    { label: 'Contact', href: '#contact' }
  ];

  const moreLinks = [
    { label: 'Fitness tools', href: '#fitness-lab' },
    { label: 'Member results', href: '#results' },
    { label: 'Amenities & FAQs', href: '#amenities' }
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0a0b0e]/95 backdrop-blur-md border-b border-amber-500/20 py-3 shadow-2xl'
          : 'bg-gradient-to-b from-black/90 via-black/60 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="zid-wordmark zid-wordmark--compact" aria-label="ZID gym logo">
              <span className="zid-wordmark__text">ZID</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-[10px] uppercase font-bold tracking-[0.38em] text-slate-300">
                train . grind . repeat
              </div>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-5" aria-label="Main navigation">
            {primaryLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors relative py-1 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                aria-expanded={moreMenuOpen}
                aria-controls="more-navigation"
                className="flex items-center gap-1 text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors py-1"
              >
                More <ChevronDown className={`w-4 h-4 transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {moreMenuOpen && (
                <div id="more-navigation" className="absolute right-0 top-full mt-3 w-52 rounded-lg border border-white/10 bg-[#11141b] p-2 shadow-2xl">
                  {moreLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={() => setMoreMenuOpen(false)}
                      className="block rounded-md px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-amber-400"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Quick Actions & Admin Switcher */}
          <div className="hidden xl:flex items-center gap-3">
            <div className="relative">
              <button type="button" onClick={() => user ? setAccountMenuOpen(!accountMenuOpen) : onOpenAuth()} aria-label={user ? `${user.role === 'owner' ? 'Owner' : 'Member'} account menu` : 'Sign in'} aria-expanded={accountMenuOpen} title={user ? `${user.role === 'owner' ? 'Owner' : 'Member'} account` : 'Sign in'} className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition ${user?.role === 'owner' ? 'border-amber-500/40 bg-amber-500/10 text-amber-300' : user ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-200' : 'border-slate-700 bg-slate-900/80 text-slate-200 hover:border-amber-500/50 hover:text-amber-300'}`}>
                {user?.role === 'owner' ? <LayoutDashboard className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
                <span>{user ? user.name : 'Sign in'}</span>
                {user && <ChevronDown className={`h-3.5 w-3.5 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`} />}
              </button>
              {accountMenuOpen && user && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-white/10 bg-[#11141b] p-2 shadow-2xl">
                  <div className="border-b border-white/10 px-3 py-2">
                    <div className="text-sm font-semibold text-white">{user.name}</div>
                    <div className="truncate text-xs text-slate-500">{user.email}</div>
                    <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-amber-400">{user.role}</div>
                  </div>
                  {user.role === 'member' ? (
                    <button type="button" onClick={() => { setAccountMenuOpen(false); onOpenMemberDashboard(); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-emerald-300"><Activity className="h-4 w-4" />My progress</button>
                  ) : (
                    <button type="button" onClick={() => { setAccountMenuOpen(false); onToggleAdmin(); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-amber-300"><LayoutDashboard className="h-4 w-4" />{isAdminView ? 'Exit owner portal' : 'Owner portal'}</button>
                  )}
                  <button type="button" onClick={() => { setAccountMenuOpen(false); onLogout(); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm text-slate-400 hover:bg-rose-500/10 hover:text-rose-300"><LogOut className="h-4 w-4" />Sign out</button>
                </div>
              )}
            </div>

            {/* Quick Contact Icons */}
            <a
              href={`tel:${GYM_INFO.phone}`}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
              title="Call Reception"
            >
              <Phone className="w-4 h-4 text-amber-400" />
            </a>

            <a
              href={`https://wa.me/${GYM_INFO.whatsapp}?text=Hi%20ZID!%20I%20am%20interested%20in%20joining%20the%20gym.`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/30 transition-colors"
              title="WhatsApp Front Desk"
            >
              <MessageSquare className="w-4 h-4" />
            </a>

            {/* Free Trial CTA */}
            <button
              onClick={() => onOpenJoinModal({ defaultGoal: 'Free 1-Day Trial Pass' })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transform hover:-translate-y-0.5 transition-all"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              <span>FREE TRIAL PASS</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 xl:hidden">
            <div className="relative">
              <button type="button" onClick={() => user ? setAccountMenuOpen(!accountMenuOpen) : onOpenAuth()} aria-label={user ? `${user.role === 'owner' ? 'Owner' : 'Member'} account menu` : 'Sign in'} aria-expanded={accountMenuOpen} className={`rounded-lg border p-2 ${user?.role === 'owner' ? 'border-amber-500/40 bg-slate-900 text-amber-300' : 'border-slate-700 bg-slate-900 text-slate-200'}`}>
                {user?.role === 'owner' ? <LayoutDashboard className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
              </button>
              {accountMenuOpen && user && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-white/10 bg-[#11141b] p-2 shadow-2xl">
                  <div className="border-b border-white/10 px-3 py-2">
                    <div className="text-sm font-semibold text-white">{user.name}</div>
                    <div className="truncate text-xs text-slate-500">{user.email}</div>
                    <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-amber-400">{user.role}</div>
                  </div>
                  {user.role === 'member' ? (
                    <button type="button" onClick={() => { setAccountMenuOpen(false); onOpenMemberDashboard(); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-emerald-300"><Activity className="h-4 w-4" />My progress</button>
                  ) : (
                    <button type="button" onClick={() => { setAccountMenuOpen(false); onToggleAdmin(); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-amber-300"><LayoutDashboard className="h-4 w-4" />Owner portal</button>
                  )}
                  <button type="button" onClick={() => { setAccountMenuOpen(false); onLogout(); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm text-slate-400 hover:bg-rose-500/10 hover:text-rose-300"><LogOut className="h-4 w-4" />Sign out</button>
                </div>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0c0e14] border-b border-amber-500/20 px-4 pt-4 pb-6 mt-3 space-y-4 shadow-2xl">
          <nav className="flex flex-col space-y-1" aria-label="Mobile navigation">
            {primaryLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate-200 hover:text-amber-400 py-2"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 mt-2 border-t border-slate-800">
              <span className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1">More to explore</span>
              {moreLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm text-slate-300 hover:text-amber-400 py-2"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </nav>

          <div className="pt-4 border-t border-slate-800 space-y-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenJoinModal({ defaultGoal: 'Free 1-Day Trial Pass' });
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-center flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              <span>CLAIM FREE TRIAL PASS</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${GYM_INFO.phone}`}
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-800 text-slate-200 text-sm font-semibold"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                Call Desk
              </a>
              <a
                href={`https://wa.me/${GYM_INFO.whatsapp}?text=Hi%20ZID!`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 text-sm font-semibold"
              >
                <MessageSquare className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
