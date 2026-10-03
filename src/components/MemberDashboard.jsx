import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  Dumbbell,
  Flame,
  ImagePlus,
  LogOut,
  Save,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { normalizeIndianMobile } from '../../shared/phone.js';

const emptyProfile = { phone: '', goal: '', heightCm: '', startingWeightKg: '' };

function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

export default function MemberDashboard({ user, onExit, onLogout, onUserUpdated }) {
  const [account, setAccount] = useState(user);
  const [profile, setProfile] = useState(emptyProfile);
  const [progress, setProgress] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [photos, setPhotos] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [note, setNote] = useState('');
  const [weightKg, setWeightKg] = useState('');

  const loadProfile = async () => {
    const data = await api.member.getProfile();
    setAccount(data.user);
    setProfile({ ...emptyProfile, ...data.profile });
    setProgress(data.progress);
    setCurrentStreak(data.currentStreak);
    setLongestStreak(data.longestStreak);
    onUserUpdated(data.user);
    return data.progress;
  };

  useEffect(() => {
    let active = true;
    api.member.getProfile()
      .then((data) => {
        if (!active) return;
        setAccount(data.user);
        setProfile({ ...emptyProfile, ...data.profile });
        setProgress(data.progress);
        setCurrentStreak(data.currentStreak);
        setLongestStreak(data.longestStreak);
        onUserUpdated(data.user);
        setLoading(false);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError.message || 'Could not load your member profile.');
        setLoading(false);
      });
    return () => { active = false; };
  }, [onUserUpdated]);

  useEffect(() => {
    let active = true;
    const loadedPhotos = {};
    Promise.all(progress.slice(0, 9).map(async (entry) => {
      try {
        const url = await api.member.getProgressPhoto(entry.id);
        loadedPhotos[entry.id] = url;
      } catch {}
    })).then(() => {
      if (active) setPhotos(loadedPhotos);
      else Object.values(loadedPhotos).forEach(URL.revokeObjectURL);
    });
    return () => {
      active = false;
      Object.values(loadedPhotos).forEach(URL.revokeObjectURL);
    };
  }, [progress]);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview('');
      return undefined;
    }
    const previewUrl = URL.createObjectURL(photoFile);
    setPhotoPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [photoFile]);

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - (6 - index));
    return { date, key: dateKey(date) };
  });
  const progressDates = new Set(progress.map((entry) => entry.date));
  const weekCount = weekDays.filter((day) => progressDates.has(day.key)).length;
  const latestWeight = progress.find((entry) => entry.weightKg)?.weightKg;
  const todayKey = dateKey(new Date());
  const recordedToday = progress.some((entry) => entry.date === todayKey);
  const profileComplete = Boolean(profile.goal && profile.phone && profile.heightCm && profile.startingWeightKg);

  const handleProfileSave = async (event) => {
    event.preventDefault();
    const normalizedPhone = profile.phone?.trim() ? normalizeIndianMobile(profile.phone) : '';
    if (profile.phone?.trim() && !normalizedPhone) {
      setError('Enter a valid 10-digit Indian mobile number starting with 6–9.');
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const result = await api.member.updateProfile({ ...profile, phone: normalizedPhone });
      setAccount(result.user);
      onUserUpdated(result.user);
      setNotice('Profile saved. Your baseline is ready.');
    } catch (requestError) {
      setError(requestError.message || 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type)) {
      setError('Choose a JPG, PNG, or WebP image.');
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setError('Choose an image smaller than 5 MB.');
      return;
    }
    setError('');
    setPhotoFile(selected);
  };

  const handleProgressSubmit = async (event) => {
    event.preventDefault();
    if (!photoFile) {
      setError('Choose a progress photo before saving today’s entry.');
      return;
    }
    setUploading(true);
    setError('');
    setNotice('');
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);
      formData.append('note', note);
      formData.append('weightKg', weightKg);
      const result = await api.member.uploadProgress(formData);
      setPhotoFile(null);
      setNote('');
      setWeightKg('');
      const updatedProgress = await loadProfile();
      setNotice(`Progress saved. You’re on a ${result.currentStreak}-day streak.`);
      setProgress(updatedProgress);
    } catch (requestError) {
      setError(requestError.message || 'Could not save today’s progress.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090b0d] text-slate-100 selection:bg-amber-400 selection:text-black">
      <header className="border-b border-white/10 bg-[#0d1012]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-black"><Dumbbell className="h-5 w-5" /></div>
            <div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-white">ZID / MEMBER</div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Training record</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onExit} className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-amber-500/50 hover:text-white"><ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">Gym site</span></button>
            <button type="button" onClick={onLogout} aria-label="Sign out" title="Sign out" className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:border-rose-500/50 hover:text-rose-300"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-5 border-b border-white/10 pb-8 md:flex-row md:items-end">
          <div>
            <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400"><ShieldCheck className="h-3.5 w-3.5" />Private member space</p>
            <h1 className="text-4xl font-black uppercase leading-none text-white sm:text-5xl">Your work.<br /><span className="text-amber-400">Your record.</span></h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">Welcome back, {account?.name || user.name}. Build a clear record of the work you put in, one session at a time.</p>
          </div>
          <div className={`flex items-center gap-3 border-l-2 px-4 py-2 ${profileComplete ? 'border-emerald-400' : 'border-amber-400'}`}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${profileComplete ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-300'}`}>
              {profileComplete ? <Check className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-white">{profileComplete ? 'Profile ready' : 'Finish your baseline'}</div>
              <div className="mt-0.5 text-xs text-slate-400">{profileComplete ? 'Your progress has a starting point.' : 'Add your details to set your starting point.'}</div>
            </div>
          </div>
        </div>

        {error && <div role="alert" className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-rose-500/30 bg-rose-950/40 px-4 py-3 text-sm text-rose-200"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Dismiss error"><X className="h-4 w-4" /></button></div>}
        {notice && <div role="status" className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200"><Check className="h-4 w-4" />{notice}</div>}

        {loading ? (
          <div className="py-20 text-center text-sm text-slate-400">Loading your training record...</div>
        ) : (
          <>
            <section className="mb-8 grid grid-cols-2 border-y border-white/10 sm:grid-cols-4" aria-label="Progress overview">
              <div className="border-b border-r border-white/10 px-4 py-5 sm:border-b-0 sm:px-6">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500"><Flame className="h-3.5 w-3.5 text-amber-400" />Current streak</div>
                <div className="text-3xl font-black text-white">{currentStreak}<span className="ml-1 text-xs font-semibold text-slate-500">days</span></div>
              </div>
              <div className="border-b border-white/10 px-4 py-5 sm:border-b-0 sm:border-r sm:px-6">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500"><TrendingUp className="h-3.5 w-3.5 text-emerald-400" />Longest streak</div>
                <div className="text-3xl font-black text-white">{longestStreak}<span className="ml-1 text-xs font-semibold text-slate-500">days</span></div>
              </div>
              <div className="border-r border-white/10 px-4 py-5 sm:px-6">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500"><CalendarDays className="h-3.5 w-3.5 text-sky-400" />This week</div>
                <div className="text-3xl font-black text-white">{weekCount}<span className="ml-1 text-xs font-semibold text-slate-500">/ 7 days</span></div>
              </div>
              <div className="px-4 py-5 sm:px-6">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500"><ImagePlus className="h-3.5 w-3.5 text-rose-300" />Progress entries</div>
                <div className="text-3xl font-black text-white">{progress.length}<span className="ml-1 text-xs font-semibold text-slate-500">total</span></div>
              </div>
            </section>

            <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
              <section aria-labelledby="profile-heading" className="border-t-2 border-amber-500 pt-5">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">Member details</p>
                    <h2 id="profile-heading" className="mt-1 text-2xl font-bold text-white">Your profile</h2>
                  </div>
                  <UserRound className="h-5 w-5 text-slate-500" />
                </div>
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <label className="block text-xs font-semibold text-slate-300">Full name
                    <input required minLength={2} maxLength={80} value={account?.name || ''} onChange={(event) => setAccount((previous) => ({ ...previous, name: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#101317] px-3.5 py-3 text-sm text-white outline-none focus:border-amber-400" />
                  </label>
                  <label className="block text-xs font-semibold text-slate-300">Email address
                    <input value={account?.email || ''} disabled className="mt-1.5 w-full cursor-not-allowed rounded-lg border border-slate-800 bg-[#0c0f11] px-3.5 py-3 text-sm text-slate-500" />
                  </label>
                  <label className="block text-xs font-semibold text-slate-300">Phone number
                    <input type="tel" inputMode="tel" autoComplete="tel" maxLength={16} value={profile.phone || ''} onChange={(event) => setProfile((previous) => ({ ...previous, phone: event.target.value }))} placeholder="98765 43210 or +91" className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#101317] px-3.5 py-3 text-sm text-white outline-none focus:border-amber-400" />
                  </label>
                  <label className="block text-xs font-semibold text-slate-300">Main training goal
                    <input maxLength={120} value={profile.goal || ''} onChange={(event) => setProfile((previous) => ({ ...previous, goal: event.target.value }))} placeholder="Strength, mobility, endurance..." className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#101317] px-3.5 py-3 text-sm text-white outline-none focus:border-amber-400" />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block text-xs font-semibold text-slate-300">Height (cm)
                      <input type="number" min="100" max="250" value={profile.heightCm || ''} onChange={(event) => setProfile((previous) => ({ ...previous, heightCm: event.target.value }))} placeholder="175" className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#101317] px-3.5 py-3 text-sm text-white outline-none focus:border-amber-400" />
                    </label>
                    <label className="block text-xs font-semibold text-slate-300">Starting weight (kg)
                      <input type="number" min="20" max="400" step="0.1" value={profile.startingWeightKg || ''} onChange={(event) => setProfile((previous) => ({ ...previous, startingWeightKg: event.target.value }))} placeholder="72" className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#101317] px-3.5 py-3 text-sm text-white outline-none focus:border-amber-400" />
                    </label>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <span className="text-xs text-slate-500">{latestWeight ? `Latest check-in: ${latestWeight} kg` : 'Your details stay private.'}</span>
                    <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-xs font-bold text-black transition hover:bg-amber-400 disabled:opacity-60"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save profile'}</button>
                  </div>
                </form>
              </section>

              <div className="space-y-8">
                <section aria-labelledby="consistency-heading" className="border-t-2 border-emerald-400 pt-5">
                  <div className="mb-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">Consistency</p>
                      <h2 id="consistency-heading" className="mt-1 text-2xl font-bold text-white">Last seven days</h2>
                    </div>
                    <div className="text-right"><span className="text-2xl font-black text-white">{Math.round((weekCount / 7) * 100)}%</span><span className="ml-1 text-xs text-slate-500">logged</span></div>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((day) => {
                      const completed = progressDates.has(day.key);
                      return (
                        <div key={day.key} className="min-w-0 text-center">
                          <div className="mb-2 text-[10px] font-semibold uppercase text-slate-500">{day.date.toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' })}</div>
                          <div title={`${day.key}: ${completed ? 'progress recorded' : 'no entry'}`} className={`mx-auto flex aspect-square w-full max-w-12 items-center justify-center rounded-lg border ${completed ? 'border-emerald-400/50 bg-emerald-400/15 text-emerald-300' : 'border-slate-800 bg-[#101317] text-slate-700'}`}>
                            {completed ? <Check className="h-4 w-4" /> : <span className="text-xs">{day.date.getUTCDate()}</span>}
                          </div>
                          <div className="mt-2 text-[10px] text-slate-500">{day.date.getUTCDate()}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-500">
                    <span>One photo log counts per day</span>
                    <span className="flex items-center gap-1.5 text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-400" />Recorded</span>
                  </div>
                </section>

                <section aria-labelledby="daily-log-heading" className="border-t-2 border-sky-400 pt-5">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300">Today’s check-in</p>
                      <h2 id="daily-log-heading" className="mt-1 text-2xl font-bold text-white">Log your work</h2>
                    </div>
                    <Target className="h-5 w-5 text-sky-300" />
                  </div>
                  {recordedToday ? (
                    <div className="flex items-center gap-3 rounded-lg border border-emerald-500/25 bg-emerald-950/20 px-4 py-4 text-sm text-emerald-200"><Check className="h-5 w-5 shrink-0" /><span>Today is in the books. Your streak is protected; pick it up again tomorrow.</span></div>
                  ) : (
                    <form onSubmit={handleProgressSubmit} className="grid gap-4 sm:grid-cols-[0.85fr_1.15fr]">
                      <label className="group relative flex min-h-48 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-700 bg-[#0e1215] p-4 text-center transition hover:border-sky-400/60">
                        {photoPreview ? <img src={photoPreview} alt="Selected progress preview" className="absolute inset-0 h-full w-full object-cover opacity-70" /> : <ImagePlus className="mb-3 h-7 w-7 text-sky-300" />}
                        <span className="relative z-10 rounded bg-black/65 px-3 py-1.5 text-xs font-semibold text-white">{photoFile ? photoFile.name : 'Choose progress photo'}</span>
                        <span className="relative z-10 mt-1 text-[10px] text-slate-400">JPG, PNG or WebP · up to 5 MB</span>
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="sr-only" />
                      </label>
                      <div className="flex flex-col gap-3">
                        <label className="block text-xs font-semibold text-slate-300">Session note
                          <textarea maxLength={180} value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder="What did you work on today?" className="mt-1.5 w-full resize-y rounded-lg border border-slate-700 bg-[#101317] px-3 py-2.5 text-sm text-white outline-none focus:border-sky-400" />
                        </label>
                        <label className="block text-xs font-semibold text-slate-300">Weight check-in <span className="font-normal text-slate-500">(optional)</span>
                          <div className="relative mt-1.5"><input type="number" min="20" max="400" step="0.1" value={weightKg} onChange={(event) => setWeightKg(event.target.value)} placeholder="72.5" className="w-full rounded-lg border border-slate-700 bg-[#101317] px-3 py-2.5 pr-12 text-sm text-white outline-none focus:border-sky-400" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">kg</span></div>
                        </label>
                        <button type="submit" disabled={uploading || !photoFile} className="mt-auto flex items-center justify-center gap-2 rounded-lg bg-sky-300 px-4 py-3 text-xs font-extrabold uppercase tracking-wider text-[#071013] transition hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-50"><ImagePlus className="h-4 w-4" />{uploading ? 'Saving entry...' : 'Save today’s progress'}</button>
                      </div>
                    </form>
                  )}
                </section>
              </div>
            </div>

            <section aria-labelledby="history-heading" className="mt-12 border-t border-white/10 pt-6">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-300">Your consistency</p><h2 id="history-heading" className="mt-1 text-2xl font-bold text-white">Progress history</h2></div>
                <div className="hidden items-center gap-1 text-xs text-slate-500 sm:flex">Private to your account<ShieldCheck className="ml-1 h-4 w-4 text-emerald-400" /></div>
              </div>
              {progress.length === 0 ? (
                <div className="flex flex-col items-center border-y border-white/10 py-12 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-slate-500"><CalendarDays className="h-5 w-5" /></div>
                  <p className="text-sm font-semibold text-slate-300">Your first entry starts the record.</p>
                  <p className="mt-1 text-xs text-slate-500">Add a progress photo above to record today.</p>
                  <ChevronRight className="mt-3 h-4 w-4 rotate-90 text-slate-600" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {progress.slice(0, 9).map((entry) => (
                    <article key={entry.id} className="overflow-hidden rounded-lg border border-white/10 bg-[#0f1214]">
                      <div className="aspect-[4/3] bg-[#171b1e]">
                        {photos[entry.id] ? <img src={photos[entry.id]} alt={`Progress photo from ${entry.date}`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-600"><ImagePlus className="h-6 w-6" /></div>}
                      </div>
                      <div className="p-3">
                        <div className="flex items-center justify-between gap-2 text-xs font-bold text-white"><span>{new Date(`${entry.date}T00:00:00Z`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })}</span>{entry.weightKg && <span className="text-sky-300">{entry.weightKg} kg</span>}</div>
                        <p className="mt-1 line-clamp-2 min-h-8 text-[11px] leading-relaxed text-slate-400">{entry.note || 'Progress logged'}</p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400" />Your progress photos are private to your account.</span>
              <button type="button" onClick={onExit} className="flex items-center gap-1 font-semibold text-slate-300 transition hover:text-amber-300">Explore training at ZID <ArrowUpRight className="h-3.5 w-3.5" /></button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}