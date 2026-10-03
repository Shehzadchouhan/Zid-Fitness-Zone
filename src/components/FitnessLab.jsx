import React, { useState } from 'react';
import { Activity, Flame, Dumbbell, Sparkles, Scale, Info, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function FitnessLab({ onConsultWithStats }) {
  const [activeTab, setActiveTab] = useState('bmi');

  // BMI State
  const [weight, setWeight] = useState('75');
  const [height, setHeight] = useState('175');
  const [age, setAge] = useState('25');
  const [gender, setGender] = useState('male');
  const [activity, setActivity] = useState('moderate');
  const [bmiResult, setBmiResult] = useState(null);

  // TDEE & Macro State
  const [tdeeGoal, setTdeeGoal] = useState('fatloss');
  const [tdeeResult, setTdeeResult] = useState(null);

  // 1RM State
  const [liftName, setLiftName] = useState('bench');
  const [liftWeight, setLiftWeight] = useState('80');
  const [liftReps, setLiftReps] = useState('5');
  const [oneRmResult, setOneRmResult] = useState(null);

  // Calculate BMI
  const handleCalculateBMI = (e) => {
    e?.preventDefault();
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    const a = parseInt(age) || 25;

    if (!w || !h || h <= 0) return;

    const bmi = w / (h * h);
    let category = '';
    let color = '';
    let recommendation = '';

    if (bmi < 18.5) {
      category = 'Below healthy range';
      color = 'text-sky-400';
      recommendation = 'To gain weight, try regular strength training and add nourishing, protein-rich foods to your meals.';
    } else if (bmi < 24.9) {
      category = 'Healthy range';
      color = 'text-emerald-400';
      recommendation = 'You are in a healthy weight range. Keep moving regularly and build strength at a pace that feels right.';
    } else if (bmi < 29.9) {
      category = 'Above healthy range';
      color = 'text-amber-400';
      recommendation = 'Regular movement, strength training, and balanced meals can support gradual weight loss.';
    } else {
      category = 'Well above healthy range';
      color = 'text-rose-400';
      recommendation = 'Start gently with low-impact movement and balanced meals. A health professional can help you choose a safe plan.';
    }

    // Ideal weight range for height (BMI 18.5 - 24.9)
    const minIdeal = (18.5 * h * h).toFixed(1);
    const maxIdeal = (24.9 * h * h).toFixed(1);

    // Estimated Body Fat % (Deurenberg formula)
    const sexFactor = gender === 'male' ? 1 : 0;
    const estBodyFat = (1.20 * bmi + 0.23 * a - 10.8 * sexFactor - 5.4).toFixed(1);

    setBmiResult({
      bmi: bmi.toFixed(1),
      category,
      color,
      recommendation,
      minIdeal,
      maxIdeal,
      estBodyFat: Math.max(estBodyFat, 6)
    });
  };

  // Calculate daily calorie and food targets
  const handleCalculateTDEE = (e) => {
    e?.preventDefault();
    const w = parseFloat(weight) || 75;
    const h = parseFloat(height) || 175;
    const a = parseInt(age) || 25;

    // Mifflin-St Jeor formula for BMR
    let bmr = (10 * w) + (6.25 * h) - (5 * a);
    bmr += (gender === 'male' ? 5 : -161);

    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very: 1.725,
      athlete: 1.9
    };

    const maintenance = Math.round(bmr * (multipliers[activity] || 1.55));
    let targetCalories = maintenance;

    if (tdeeGoal === 'fatloss') targetCalories = maintenance - 500;
    if (tdeeGoal === 'muscle') targetCalories = maintenance + 350;

    // Macro distribution:
    // Protein: 2.0g per kg
    const proteinGrams = Math.round(w * 2.0);
    const proteinCals = proteinGrams * 4;

    // Fat: 25% of total cals
    const fatCals = Math.round(targetCalories * 0.25);
    const fatGrams = Math.round(fatCals / 9);

    // Carbs: remainder
    const carbCals = Math.max(0, targetCalories - (proteinCals + fatCals));
    const carbGrams = Math.round(carbCals / 4);

    setTdeeResult({
      bmr: Math.round(bmr),
      maintenance,
      targetCalories,
      proteinGrams,
      fatGrams,
      carbGrams,
      goal: tdeeGoal
    });
  };

  // Estimate maximum lifting weight
  const handleCalculate1RM = (e) => {
    e?.preventDefault();
    const w = parseFloat(liftWeight);
    const r = parseInt(liftReps);
    if (!w || !r || r < 1) return;

    // Brzycki formula: 1RM = weight / (1.0278 - (0.0278 * reps))
    const oneRm = Math.round(w / (1.0278 - (0.0278 * Math.min(r, 12))));

    const percentages = [
      { pct: 95, reps: '1-2 reps (very heavy)', load: Math.round(oneRm * 0.95) },
      { pct: 90, reps: '3-4 reps (heavy)', load: Math.round(oneRm * 0.90) },
      { pct: 85, reps: '5-6 reps (strength)', load: Math.round(oneRm * 0.85) },
      { pct: 80, reps: '7-8 reps (muscle building)', load: Math.round(oneRm * 0.80) },
      { pct: 75, reps: '9-10 reps (muscle building)', load: Math.round(oneRm * 0.75) },
      { pct: 70, reps: '12+ reps (endurance and form)', load: Math.round(oneRm * 0.70) }
    ];

    setOneRmResult({
      oneRm,
      percentages,
      liftWeight: w,
      liftReps: r
    });
  };

  return (
    <section id="fitness-lab" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-amber-400 font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 inline-block mb-3">
            SIMPLE FITNESS TOOLS
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-wide uppercase text-white">
            ZID <span className="gold-gradient-text">FITNESS LAB</span>
          </h2>
          <p className="mt-3 text-slate-400 text-base sm:text-lg">
            Get a simple guide to your weight, daily food needs, and lifting strength. Use the results as a starting point, not a diagnosis.
          </p>
        </div>

        {/* Multi-Tool Tab Switcher */}
        <div className="flex justify-center mb-10">
          <div role="tablist" aria-label="Fitness tools" className="grid w-full max-w-4xl grid-cols-1 gap-2 rounded-xl border border-slate-800 bg-slate-900 p-2 sm:grid-cols-3">
            <button
              role="tab"
              aria-selected={activeTab === 'bmi'}
              onClick={() => setActiveTab('bmi')}
              className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-bold transition-all ${
                activeTab === 'bmi'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Weight guide</span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'tdee'}
              onClick={() => {
                setActiveTab('tdee');
                if (!tdeeResult) handleCalculateTDEE();
              }}
              className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-bold transition-all ${
                activeTab === 'tdee'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>Daily food guide</span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === '1rm'}
              onClick={() => {
                setActiveTab('1rm');
                if (!oneRmResult) handleCalculate1RM();
              }}
              className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-bold transition-all ${
                activeTab === '1rm'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              <span>Lifting strength</span>
            </button>
          </div>
        </div>

        {/* Tab 1: BMI Calculator */}
        {activeTab === 'bmi' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Input Form */}
            <div className="lg:col-span-5 glass-card rounded-2xl p-6 sm:p-8 border border-white/10 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                <span>Enter your details</span>
              </h3>

              <form onSubmit={handleCalculateBMI} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white focus:border-amber-500 focus:outline-none transition-colors"
                      placeholder="e.g. 75"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white focus:border-amber-500 focus:outline-none transition-colors"
                      placeholder="e.g. 175"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                      Age
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white focus:border-amber-500 focus:outline-none transition-colors"
                      placeholder="e.g. 25"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white focus:border-amber-500 focus:outline-none transition-colors"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                      How active are you most weeks?
                  </label>
                  <select
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white focus:border-amber-500 focus:outline-none transition-colors text-sm"
                  >
                    <option value="sedentary">Mostly sitting, little exercise</option>
                    <option value="light">Some walks or workouts (1-3 days/week)</option>
                    <option value="moderate">Regular workouts (3-5 days/week)</option>
                    <option value="very">Hard training (6-7 days/week)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all mt-4"
                >
                  See my weight guide
                </button>
              </form>
            </div>

            {/* Results Display */}
            <div className="lg:col-span-7 glass-card rounded-2xl p-6 sm:p-8 border border-white/10 shadow-xl flex flex-col justify-between">
              {bmiResult ? (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                    <div>
                      <span className="text-xs uppercase tracking-widest text-slate-400 block mb-1">
                        Weight-for-height score
                      </span>
                      <div className="flex items-baseline gap-3">
                        <span className="text-5xl font-bebas text-amber-400 tracking-wider">
                          {bmiResult.bmi}
                        </span>
                        <span className={`text-lg font-bold ${bmiResult.color}`}>
                          {bmiResult.category}
                        </span>
                      </div>
                    </div>

                    <div className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-right">
                      <span className="text-xs text-slate-400 block">Estimated body fat</span>
                      <span className="text-2xl font-bold text-white">{bmiResult.estBodyFat}%</span>
                    </div>
                  </div>

                  {/* Visual Range Indicator Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                      <span>Below range</span>
                      <span>Healthy range</span>
                      <span>Above range</span>
                      <span>Well above</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-800 overflow-hidden flex">
                      <div className="w-[18.5%] bg-sky-500" title="Underweight" />
                      <div className="w-[25%] bg-emerald-500" title="Normal" />
                      <div className="w-[20%] bg-amber-500" title="Overweight" />
                      <div className="w-[36.5%] bg-rose-500" title="Obese" />
                    </div>
                  </div>

                  {/* Metrics Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-xs text-slate-400 block mb-1">Suggested weight range</span>
                      <span className="text-lg font-bold text-white">{bmiResult.minIdeal} - {bmiResult.maxIdeal} kg</span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-xs text-slate-400 block mb-1">Suggested next step</span>
                      <span className="text-sm font-semibold text-amber-300">Targeted Transformation</span>
                    </div>
                  </div>

                  {/* Advice Box */}
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-300 text-sm leading-relaxed">
                    <strong className="text-amber-400 block mb-1">A simple next step:</strong>
                    {bmiResult.recommendation}
                  </div>

                  {/* Quick Action Button */}
                  <button
                    onClick={() => onConsultWithStats({ bmi: bmiResult.bmi, category: bmiResult.category })}
                    className="w-full py-3 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-black text-amber-400 font-bold text-sm tracking-wide border border-amber-500/30 hover:border-amber-500 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Talk to a ZID coach about my results</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                </div>
              ) : (
                <div className="py-16 text-center space-y-3">
                  <Activity className="w-12 h-12 text-amber-400/50 mx-auto" />
                  <h4 className="text-xl font-bold text-white">Ready to check your starting point?</h4>
                  <p className="text-slate-400 text-sm max-w-md mx-auto">
                    Enter your height and weight to see your weight range, a body-fat estimate, and a suggested next step.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 2: Daily food guide */}
        {activeTab === 'tdee' && (
          <div className="glass-card rounded-2xl p-6 sm:p-10 border border-white/10 shadow-xl max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Flame className="w-6 h-6 text-amber-400" />
                  <span>Your daily calorie and food guide</span>
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  Based on your weight, age, and usual activity level.
                </p>
              </div>

              {/* Goal Switcher */}
              <div className="grid grid-cols-1 gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1 sm:grid-cols-3">
                <button
                  onClick={() => {
                    setTdeeGoal('fatloss');
                    setTimeout(handleCalculateTDEE, 50);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    tdeeGoal === 'fatloss' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Lose weight gradually
                </button>
                <button
                  onClick={() => {
                    setTdeeGoal('maintenance');
                    setTimeout(handleCalculateTDEE, 50);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    tdeeGoal === 'maintenance' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Stay at this weight
                </button>
                <button
                  onClick={() => {
                    setTdeeGoal('muscle');
                    setTimeout(handleCalculateTDEE, 50);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    tdeeGoal === 'muscle' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Build muscle
                </button>
              </div>
            </div>

            {tdeeResult && (
              <div className="space-y-8">
                {/* Total Calories Highlight */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">Calories used at rest</span>
                    <span className="text-2xl font-bebas text-slate-200 tracking-wider">{tdeeResult.bmr.toLocaleString('en-IN')} calories/day</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">Calories to stay the same weight</span>
                    <span className="text-2xl font-bebas text-slate-200 tracking-wider">{tdeeResult.maintenance.toLocaleString('en-IN')} calories/day</span>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <span className="text-xs text-amber-300 block mb-1 uppercase font-bold">Your daily calorie goal</span>
                    <span className="text-3xl font-bebas text-amber-400 tracking-wider">{tdeeResult.targetCalories.toLocaleString('en-IN')} calories/day</span>
                  </div>
                </div>

                {/* Macro Split Cards */}
                <div>
                  <h4 className="text-sm uppercase tracking-wider font-bold text-slate-300 mb-3">
                    Daily food targets
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    <div className="p-5 rounded-xl bg-slate-900 border border-blue-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-blue-400 uppercase">Protein for muscle recovery</span>
                        <span className="text-xs text-slate-400">Helps your muscles</span>
                      </div>
                      <div className="text-3xl font-bebas text-white tracking-wider">
                        {tdeeResult.proteinGrams} <span className="text-base text-slate-400 font-sans">grams</span>
                      </div>
                      <span className="text-xs text-slate-500 block mt-1">{tdeeResult.proteinGrams * 4} calories</span>
                    </div>

                    <div className="p-5 rounded-xl bg-slate-900 border border-emerald-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-emerald-400 uppercase">Carbs for energy</span>
                        <span className="text-xs text-slate-400">Fuel for activity</span>
                      </div>
                      <div className="text-3xl font-bebas text-white tracking-wider">
                        {tdeeResult.carbGrams} <span className="text-base text-slate-400 font-sans">grams</span>
                      </div>
                      <span className="text-xs text-slate-500 block mt-1">{tdeeResult.carbGrams * 4} calories</span>
                    </div>

                    <div className="p-5 rounded-xl bg-slate-900 border border-amber-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-amber-400 uppercase">Healthy fats</span>
                        <span className="text-xs text-slate-400">Important for health</span>
                      </div>
                      <div className="text-3xl font-bebas text-white tracking-wider">
                        {tdeeResult.fatGrams} <span className="text-base text-slate-400 font-sans">grams</span>
                      </div>
                      <span className="text-xs text-slate-500 block mt-1">{tdeeResult.fatGrams * 9} calories</span>
                    </div>

                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-400 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    A ZID coach can turn these numbers into everyday meals with foods like paneer, eggs, chicken, lentils, and oats.
                  </span>
                </div>

              </div>
            )}
          </div>
        )}

        {/* Tab 3: Lifting strength estimate */}
        {activeTab === '1rm' && (
          <div className="glass-card rounded-2xl p-6 sm:p-10 border border-white/10 shadow-xl max-w-4xl mx-auto">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-6 h-6 text-amber-400" />
                <span>Estimate your lifting strength</span>
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                Enter a weight you can lift several times. We’ll estimate what you might lift once with good form. Don’t try this if you feel pain.
              </p>
            </div>

            <form onSubmit={handleCalculate1RM} className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Exercise</label>
                <select
                  value={liftName}
                  onChange={(e) => setLiftName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
                >
                  <option value="bench">Bench press</option>
                  <option value="squat">Squat</option>
                  <option value="deadlift">Deadlift</option>
                  <option value="ohp">Overhead press</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Weight you lifted (kg)</label>
                <input
                  type="number"
                  value={liftWeight}
                  onChange={(e) => setLiftWeight(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  placeholder="e.g. 80"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">How many times (reps)</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={liftReps}
                  onChange={(e) => setLiftReps(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  placeholder="e.g. 5"
                  required
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25"
                >
                  Estimate my strength
                </button>
              </div>
            </form>

            {oneRmResult && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-amber-300 uppercase font-bold tracking-wider block">Estimated maximum lift</span>
                    <span className="text-5xl font-bebas text-amber-400 tracking-wider">{oneRmResult.oneRm} KG</span>
                  </div>
                  <span className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    An estimate, not a guarantee
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-xs text-slate-400 uppercase">
                        <th className="py-3 px-4">Part of your max</th>
                        <th className="py-3 px-4">Suggested weight</th>
                        <th className="py-3 px-4">Reps to try</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {oneRmResult.percentages.map((p) => (
                        <tr key={p.pct} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-4 font-bold text-amber-400">{p.pct}%</td>
                          <td className="py-3 px-4 font-extrabold text-white text-base">{p.load} kg</td>
                          <td className="py-3 px-4 text-slate-300">{p.reps}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
