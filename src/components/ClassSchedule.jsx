import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Flame, Users, CheckCircle2, ChevronRight, User } from 'lucide-react';
import { api } from '../services/api';

export default function ClassSchedule({ onBookClass }) {
  const [classes, setClasses] = useState([]);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [loading, setLoading] = useState(true);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    async function loadClasses() {
      try {
        const data = await api.getClasses();
        setClasses(data);
      } catch (err) {
        console.error('Failed to load classes', err);
      } finally {
        setLoading(false);
      }
    }
    loadClasses();
  }, []);

  const dayClasses = classes.filter(c => c.days && c.days.includes(selectedDay));

  return (
    <section id="schedule" className="py-20 relative bg-slate-950/60 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-amber-400 font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 inline-block mb-3">
            WEEKLY TIMETABLE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-wide uppercase text-white">
            LIVE CLASS <span className="gold-gradient-text">SCHEDULE</span>
          </h2>
          <p className="mt-3 text-slate-400 text-base sm:text-lg">
            Train alongside Punjab's most committed athletes. Reserve your spot early before studio capacity fills up.
          </p>
        </div>

        {/* Day Selector Tabs */}
        <div className="flex overflow-x-auto pb-4 gap-2 mb-10 scrollbar-none justify-start md:justify-center">
          {daysOfWeek.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-6 py-3 rounded-xl font-bold text-sm tracking-wider uppercase whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedDay === day
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/25 scale-105'
                  : 'bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{day}</span>
            </button>
          ))}
        </div>

        {/* Classes List */}
        {dayClasses.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center max-w-xl mx-auto border border-white/5">
            <p className="text-slate-400 text-lg">No group classes scheduled for {selectedDay}.</p>
            <p className="text-slate-500 text-sm mt-1">Open gym floor, cardio zone, and steam spa remain open normal hours.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dayClasses.map((item) => {
              const spotsLeft = item.capacity - item.enrolled;
              const fillPercentage = Math.round((item.enrolled / item.capacity) * 100);

              return (
                <div
                  key={item.id}
                  className="glass-card rounded-2xl p-6 border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: Category & Intensity */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                        {item.category}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        {item.level}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                      {item.title}
                    </h3>
                    
                    <p className="text-slate-400 text-xs leading-relaxed mb-4">
                      {item.description}
                    </p>

                    {/* Metadata chips */}
                    <div className="grid grid-cols-2 gap-2 py-3 border-y border-white/5 mb-4 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{item.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-rose-400" />
                        <span>{item.calories}</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <User className="w-3.5 h-3.5 text-sky-400" />
                        <span>Coach: <strong className="text-white">{item.instructor}</strong></span>
                      </div>
                    </div>

                    {/* Capacity progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>Spots Filled</span>
                        </span>
                        <span className={`font-bold ${spotsLeft <= 3 ? 'text-rose-400' : 'text-amber-400'}`}>
                          {item.enrolled}/{item.capacity} ({spotsLeft} Left)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            fillPercentage >= 90 ? 'bg-rose-500' : fillPercentage >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${fillPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Reserve Button */}
                  <button
                    disabled={spotsLeft <= 0}
                    onClick={() => onBookClass(item)}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${
                      spotsLeft <= 0
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-md shadow-amber-500/20'
                    }`}
                  >
                    <span>{spotsLeft <= 0 ? 'CLASS FULL' : 'RESERVE SPOT'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
