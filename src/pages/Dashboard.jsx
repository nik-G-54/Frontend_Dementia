import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

const demoData = {
  today: {
    todayScore: 72,
    overallScore: 68,
    progress: 72
  },
  weekly: [
    { day: "Mon", score: 60 },
    { day: "Tue", score: 65 },
    { day: "Wed", score: 70 },
    { day: "Thu", score: 68 },
    { day: "Fri", score: 75 },
    { day: "Sat", score: 80 },
    { day: "Sun", score: 72 }
  ],
  distribution: {
    focus: 42,
    memory: 38,
    logic: 20
  },
  risk: {
    level: "Low",
    value: 25
  },
  aiSummary: "Your cognitive performance is stable with strong focus levels. Slight fatigue observed in memory tasks."
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('real');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    const currentMode = localStorage.getItem('mode') || 'real';
    setMode(currentMode);

    if (currentMode === 'demo') {
      setData(demoData);
      setUserName('Demo User');
      setLoading(false);
    } else {
      // Real mode
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) setUserName(JSON.parse(userStr).name || 'User');
      } catch (e) {}

      api.get('/dashboard')
        .then(res => {
          if (res.data && Object.keys(res.data).length > 0) {
            setData({
              today: {
                todayScore: res.data.todayScore || 0,
                overallScore: res.data.overallScore || 0,
                progress: res.data.progress || 0
              },
              weekly: res.data.weekly || [],
              distribution: res.data.distribution || { focus: 0, memory: 0, logic: 0 },
              risk: res.data.risk || { level: "Low", value: 0 },
              aiSummary: res.data.aiSummary || "We need more data to generate insights."
            });
          } else {
            setData(null); // Empty state
          }
        })
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    }
  }, []);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Handle empty state for new real user
  const isEmpty = mode === 'real' && !data;
  const displayData = data || {
    today: { todayScore: 0, overallScore: 0, progress: 0 },
    weekly: [],
    distribution: { focus: 0, memory: 0, logic: 0 },
    risk: { level: "Low", value: 0 },
    aiSummary: "Start your first test to see insights."
  };

  // Calendar mapping logic for Demo vs Real
  const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);
  const activeDays = mode === 'demo' ? [2, 4, 6, 7, 9, 10] : (displayData.activeDays || []);

  // Compute SVG chart path dynamically
  const maxWeeklyScore = Math.max(...displayData.weekly.map(d => d.score), 100);
  const points = displayData.weekly.map((d, index) => {
    const x = (index / Math.max(displayData.weekly.length - 1, 1)) * 800;
    const y = 200 - (d.score / maxWeeklyScore) * 160; 
    return `${x},${y}`;
  }).join(' L ');

  const chartPath = points.length > 0 ? `M ${points}` : 'M0,200 L800,200';
  const fillPath = points.length > 0 ? `${chartPath} L 800,200 L 0,200 Z` : 'M0,200 L800,200 Z';

  return (
    <>
      <div className="flex-1 p-8 overflow-y-auto w-full">
        <section className="mb-12">
          <div className="mb-8">
            <h2 className="text-4xl font-extrabold tracking-tight text-on-surface">Good morning, {userName.split(' ')[0]}.</h2>
            <p className="text-on-surface-variant mt-2 text-lg">
              {isEmpty 
                ? "Start your first test to track your mental readiness." 
                : "Your cognitive clarity is 4% higher than last week."}
            </p>
          </div>

          <div className="relative bg-gradient-to-br from-primary to-primary-container rounded-xl p-8 text-white flex flex-col md:flex-row items-center justify-between overflow-hidden shadow-xl group">
            <div className="relative z-10 max-w-md">
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">Daily Assessment</span>
              <h3 className="text-3xl font-bold mb-4">Start your morning cognitive checkup.</h3>
              <p className="text-white/80 mb-8">It takes only 5 minutes to track your mental readiness and focus levels for the day ahead.</p>
              <button 
                onClick={() => navigate('/games')}
                className="bg-white text-primary px-8 py-3 rounded-full font-bold shadow-lg hover:bg-surface transition-all flex items-center gap-2 group-hover:scale-105"
              >
                Start Cognitive Test
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
            
            <div className="relative mt-8 md:mt-0 opacity-80 group-hover:opacity-100 transition-opacity">
              <div className="w-64 h-64 bg-secondary-container/30 rounded-full blur-3xl absolute -right-20 -top-20"></div>
              <div className="w-48 h-48 bg-tertiary-container/20 rounded-full blur-2xl absolute -left-10 -bottom-10"></div>
              <div className="relative z-10 p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 transform rotate-3">
                <img alt="Assessment Graphic" className="rounded-lg shadow-2xl w-48 h-48 object-cover" src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80&w=300" />
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Card 1 */}
          <div className="bg-surface-container-lowest p-6 rounded-lg ring-1 ring-outline-variant/10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-on-surface-variant text-sm font-medium">Today's Score</span>
              <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-lg">psychology</span>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">{displayData.today.todayScore}</span>
              {!isEmpty && (
                <span className="text-secondary text-sm font-bold flex items-center mb-1">
                  <span className="material-symbols-outlined text-sm">trending_up</span> 2%
                </span>
              )}
            </div>
            <div className="mt-4 w-full bg-surface-container-low h-1.5 rounded-full">
              <div className="bg-primary h-full rounded-full transition-all" style={{width: `${displayData.today.todayScore}%`}}></div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-surface-container-lowest p-6 rounded-lg ring-1 ring-outline-variant/10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-on-surface-variant text-sm font-medium">Overall Score</span>
              <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary text-lg">bolt</span>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">{displayData.today.overallScore}</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-surface-container-lowest p-6 rounded-lg ring-1 ring-outline-variant/10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-on-surface-variant text-sm font-medium">Progress</span>
              <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary text-lg">memory</span>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">{displayData.today.progress}%</span>
              {!isEmpty && (
                <span className="text-secondary text-sm font-bold flex items-center mb-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span> stable
                </span>
              )}
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-surface-container-lowest p-6 rounded-lg ring-1 ring-outline-variant/10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-on-surface-variant text-sm font-medium">Risk Level</span>
              <div className="w-8 h-8 rounded-full bg-error-container flex items-center justify-center">
                <span className="material-symbols-outlined text-error text-lg">shield</span>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className={`text-xl font-bold uppercase tracking-tight ${isEmpty ? 'text-gray-400' : 'text-secondary'}`}>
                {isEmpty ? 'N/A' : displayData.risk.level}
              </span>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Line Chart Area */}
          <div className="lg:col-span-8 bg-surface-container-lowest p-8 rounded-xl ring-1 ring-outline-variant/10 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-xl font-bold">Weekly Performance</h3>
                <p className="text-sm text-on-surface-variant">Your score trends over the last 7 days</p>
              </div>
            </div>
            {isEmpty ? (
              <div className="w-full h-64 flex items-center justify-center text-gray-400">
                Complete assessments to see your chart here.
              </div>
            ) : (
              <div className="w-full h-64 bg-surface-container-low/50 rounded-lg flex items-end justify-between px-8 pb-4 relative overflow-hidden">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                  <path d={chartPath} fill="none" stroke="#0058bf" strokeLinecap="round" strokeWidth="4" />
                  <path d={fillPath} fill="url(#grad1)" opacity="0.1" />
                  <defs>
                    <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" style={{stopColor: '#0058bf', stopOpacity: 1}} />
                      <stop offset="100%" style={{stopColor: '#0058bf', stopOpacity: 0}} />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="text-[10px] text-on-surface-variant absolute bottom-2 left-0 w-full flex justify-between px-4">
                  {displayData.weekly.map((d, i) => <span key={i}>{d.day}</span>)}
                </div>
              </div>
            )}
          </div>

          {/* Donut Chart */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="bg-surface-container-lowest p-8 rounded-xl ring-1 ring-outline-variant/10 shadow-sm flex-1">
              <h3 className="text-xl font-bold mb-6">Cognitive Distribution</h3>
              
              {isEmpty ? (
                <div className="flex h-32 items-center justify-center text-gray-400 mb-6">No data yet</div>
              ) : (
                <>
                  <div className="flex justify-center mb-6">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" fill="transparent" r="54" stroke="#e2e7ff" strokeWidth="12" />
                        <circle cx="64" cy="64" fill="transparent" r="54" stroke="#4b41e1" strokeDasharray="339" strokeDashoffset={339 * (1 - displayData.distribution.focus/100)} strokeWidth="12" />
                        <circle cx="64" cy="64" fill="transparent" r="54" stroke="#006a61" strokeDasharray="339" strokeDashoffset={339 * (1 - displayData.distribution.memory/100)} strokeWidth="12" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold border rounded-full px-2" style={{borderColor: 'transparent'}}>Data</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-tertiary"></span>
                        <span>Focus</span>
                      </div>
                      <span className="font-bold">{displayData.distribution.focus}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-secondary"></span>
                        <span>Memory</span>
                      </div>
                      <span className="font-bold">{displayData.distribution.memory}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-primary-fixed"></span>
                        <span>Logic</span>
                      </div>
                      <span className="font-bold">{displayData.distribution.logic}%</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Right Side Panel */}
      <aside className="w-80 bg-surface-container-low p-6 hidden xl:flex flex-col gap-6 font-body shrink-0">
        <div className="bg-surface-container-lowest p-6 rounded-xl ring-1 ring-outline-variant/10 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-on-surface">Daily Presence</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">This Month</span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-center">
            {['Mo','Tu','We','Th','Fr','Sa','Su'].map(day => (
              <span key={day} className="text-[10px] font-bold text-on-surface-variant">{day}</span>
            ))}
            {Array.from({length: 3}, (_, i) => (
              <span key={`empty-${i}`} className="text-xs text-transparent py-1">.</span>
            ))}
            {calendarDays.map((day) => {
              const isActive = activeDays.includes(day);
              const isToday = day === new Date().getDate() && mode === 'real'; // Rough today indicator
              return (
                <span 
                  key={day} 
                  className={`text-xs flex items-center justify-center rounded-full w-8 h-8 mx-auto font-medium
                    ${isActive ? 'bg-primary-fixed/30 text-on-surface' : 'text-on-surface-variant'}
                    ${isToday ? 'bg-primary text-white font-bold ring-2 ring-primary-fixed' : ''}
                  `}
                >
                  {day}
                </span>
              );
            })}
          </div>
        </div>

        {/* AI Insight */}
        <div className="bg-surface-container-lowest/60 backdrop-blur-sm border border-outline-variant/20 p-6 rounded-lg relative overflow-hidden shadow-sm">
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-tertiary blur-2xl opacity-50"></div>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-tertiary">auto_awesome</span>
            <span className="text-xs font-bold uppercase tracking-widest text-tertiary">AI Summary</span>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
            {displayData.aiSummary}
          </p>
        </div>

        {/* Risk Status Visual */}
        <div className="bg-surface-container-lowest p-6 rounded-lg ring-1 ring-outline-variant/10 shadow-sm text-center">
          <h4 className="text-sm font-medium text-on-surface-variant mb-4">Cognitive Risk Status</h4>
          <div className="flex justify-center mb-4">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform rotate-180">
                <circle cx="48" cy="48" fill="transparent" r="40" stroke="#e2e7ff" strokeDasharray="125 251" strokeWidth="8"/>
                {(!isEmpty) && (
                  <circle cx="48" cy="48" fill="transparent" r="40" stroke={displayData.risk.level.includes("Low") ? "#006a61" : "#ba1a1a"} strokeDasharray={`${displayData.risk.value * 2.5} 251`} strokeWidth="8"/>
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center mt-2">
                <span className="text-lg font-bold text-secondary">{isEmpty ? 'N/A' : 'Optimum'}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-on-surface-variant">No cognitive stressors detected.</p>
        </div>
      </aside>
    </>
  );
}
