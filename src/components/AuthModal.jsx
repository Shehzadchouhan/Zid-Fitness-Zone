import React, { useEffect, useState } from 'react';
import { ArrowRight, Dumbbell, LayoutDashboard, UserRound, X } from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({ isOpen, initialRole = 'member', initialMode = 'login', onClose, onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setRole(initialRole);
      setError('');
    }
  }, [initialMode, initialRole, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = mode === 'register'
        ? await api.auth.register({ name, email, password })
        : await api.auth.login({ email, password });
      onAuthenticated(result.user, mode === 'register');
    } catch (requestError) {
      setError(requestError.message || 'Unable to authenticate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const changeRole = (nextRole) => {
    setRole(nextRole);
    setMode('login');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="relative w-full max-w-md overflow-hidden rounded-2xl border border-amber-500/30 bg-[#101218] p-6 shadow-2xl sm:p-8" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button type="button" onClick={onClose} aria-label="Close sign in" className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white">
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-black">
            <Dumbbell className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">ZID Fitness</p>
            <h2 id="auth-title" className="text-2xl font-bold text-white">
              {mode === 'choice' ? 'Choose your sign in' : role === 'owner' ? 'Owner sign in' : mode === 'register' ? 'Create your account' : 'Welcome back'}
            </h2>
          </div>
        </div>

        {mode === 'choice' ? (
          <div className="space-y-2">
            <button type="button" onClick={() => changeRole('member')} className="flex w-full items-center gap-4 rounded-lg border border-slate-700 bg-slate-900/70 p-4 text-left transition hover:border-amber-400/60 hover:bg-slate-900">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300"><UserRound className="h-5 w-5" /></span>
              <span className="flex-1"><span className="block text-sm font-bold text-white">Member</span><span className="mt-1 block text-xs text-slate-400">Sign in or create a member account</span></span>
              <ArrowRight className="h-4 w-4 text-slate-500" />
            </button>
            <button type="button" onClick={() => changeRole('owner')} className="flex w-full items-center gap-4 rounded-lg border border-slate-700 bg-slate-900/70 p-4 text-left transition hover:border-amber-400/60 hover:bg-slate-900">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400/10 text-amber-300"><LayoutDashboard className="h-5 w-5" /></span>
              <span className="flex-1"><span className="block text-sm font-bold text-white">Gym owner</span><span className="mt-1 block text-xs text-slate-400">Sign in to the owner portal</span></span>
              <ArrowRight className="h-4 w-4 text-slate-500" />
            </button>
            <button type="button" onClick={onClose} className="w-full py-3 text-sm font-semibold text-slate-400 transition hover:text-white">Maybe later</button>
          </div>
        ) : (
          <>
            <div className="mb-5 grid grid-cols-2 border-b border-white/10" role="tablist" aria-label="Account type">
              <button type="button" role="tab" aria-selected={role === 'member'} onClick={() => changeRole('member')} className={`border-b-2 px-3 py-3 text-sm font-semibold transition ${role === 'member' ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                Member
              </button>
              <button type="button" role="tab" aria-selected={role === 'owner'} onClick={() => changeRole('owner')} className={`border-b-2 px-3 py-3 text-sm font-semibold transition ${role === 'owner' ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                Gym owner
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
          {role === 'member' && mode === 'register' && (
            <label className="block space-y-1.5 text-xs font-semibold uppercase tracking-wide text-slate-300">
              Full name
              <input autoComplete="name" required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-amber-400" placeholder="Your name" />
            </label>
          )}
          <label className="block space-y-1.5 text-xs font-semibold uppercase tracking-wide text-slate-300">
            Email address
            <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-amber-400" placeholder="you@example.com" />
          </label>
          <label className="block space-y-1.5 text-xs font-semibold uppercase tracking-wide text-slate-300">
            Password
            <input type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} required minLength={mode === 'register' ? 8 : undefined} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-amber-400" placeholder={mode === 'register' ? 'At least 8 characters' : 'Your password'} />
          </label>

          {error && <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p>}

          <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-3.5 text-sm font-extrabold text-black transition hover:bg-amber-400 disabled:cursor-wait disabled:opacity-60">
            {loading ? 'Please wait...' : mode === 'register' ? 'Create member account' : role === 'owner' ? 'Sign in to owner portal' : 'Sign in'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
            </form>

            {role === 'member' && (
              <p className="mt-5 text-center text-sm text-slate-400">
                {mode === 'register' ? 'Already have an account?' : 'New to ZID?'}{' '}
                <button type="button" onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(''); }} className="font-semibold text-amber-300 hover:text-amber-200">
                  {mode === 'register' ? 'Sign in' : 'Create an account'}
                </button>
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
}