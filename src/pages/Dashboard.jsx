import { useState, useEffect } from "react"
import { Card, CardLabel, CardBigValue, SectionTitle, MiniLabel } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { TaskItem } from "../components/ui/TaskItem"
import api from "../api/axiosInstance"

/* ─── Heatmap ─── */
function Heatmap() {
  const colors = [
    "var(--color-background-secondary)",
    "#E1F5EE",
    "#9FE1CB",
    "#1D9E75",
    "#0F6E56"
  ];
  const days = Array.from({ length: 365 }, () => {
    const v = Math.random();
    return v < 0.3 ? 0 : v < 0.55 ? 1 : v < 0.75 ? 2 : v < 0.9 ? 3 : 4;
  });
  return (
    <div className="flex gap-[3px] flex-wrap mt-1">
      {days.map((val, i) => (
        <div key={i} className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: colors[val] }} />
      ))}
    </div>
  )
}

/* ─── ScoreCard ─── */
function ScoreCard({ title, score, total, subtitle, icon, colorClass, trendText }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${colorClass?.bg || 'bg-gray-100'}`}>
          {icon}
        </span>
        {trendText && (
          <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            {trendText}
          </span>
        )}
      </div>
      <div className="text-xs text-gray-500 font-medium mb-1">{title}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-extrabold text-gray-900">{score}</span>
        {total && <span className="text-xs text-gray-400">/ {total}</span>}
      </div>
      {subtitle && <div className="text-[10px] text-gray-400 mt-1">{subtitle}</div>}
    </div>
  )
}

/* ─── DailyProgressCalendar ─── */
function DailyProgressCalendar() {
  const today = new Date();
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const completedDays = new Set([1, 2, 3, 5, 6, 7, 8, 10, 11, 12, today.getDate()]);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h3 className="text-sm font-bold text-gray-900 mb-3">
        {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </h3>
      <div className="grid grid-cols-7 gap-1 text-center">
        {dayNames.map((d, i) => (
          <div key={i} className="text-[10px] text-gray-400 font-medium py-1">{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = day === today.getDate();
          const done = completedDays.has(day);
          return (
            <div
              key={day}
              className={`w-7 h-7 rounded-full text-[11px] font-medium flex items-center justify-center mx-auto
                ${isToday ? 'bg-indigo-600 text-white' : done ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── TasksListWidget ─── */
function TasksListWidget() {
  const widgetTasks = [
    { label: "Complete today's brain games", done: true, color: '#6d5cf7' },
    { label: "Chat with your AI companion", done: true, color: '#1D9E75' },
    { label: "5-minute gentle stretching", done: true, color: '#3B8BD4' },
    { label: "Name 5 things you can see", done: false, color: '#EF9F27' },
    { label: "Call a family member", done: false, color: '#1D9E75' },
  ];
  const doneCount = widgetTasks.filter(t => t.done).length;
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold text-gray-900">Today's Tasks</h3>
        <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
          {doneCount}/{widgetTasks.length}
        </span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${(doneCount / widgetTasks.length) * 100}%` }} />
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto">
        {widgetTasks.map((t, i) => (
          <div key={i} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg ${t.done ? 'opacity-60' : ''}`}>
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${t.done ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
              {t.done && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </div>
            <span className={`text-xs ${t.done ? 'line-through text-gray-400' : 'text-gray-700 font-medium'}`}>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── ProgressChart (pure SVG) ─── */
function ProgressChart({ title, data, dataKey, gradientColor }) {
  const values = data.map(d => d[dataKey]);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const w = 500, h = 160, pad = 30;
  const stepX = (w - pad * 2) / (data.length - 1);

  const points = values.map((v, i) => {
    const x = pad + i * stepX;
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `${pad},${h - pad} ${points} ${pad + (data.length - 1) * stepX},${h - pad}`;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h3 className="text-sm font-bold text-gray-900 mb-3">{title}</h3>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height: 160 }}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={gradientColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = pad + pct * (h - pad * 2);
          return <line key={i} x1={pad} y1={y} x2={w - pad} y2={y} stroke="rgba(0,0,0,0.06)" strokeWidth="1" />;
        })}
        {/* area */}
        <polygon points={areaPoints} fill={`url(#grad-${dataKey})`} />
        {/* line */}
        <polyline points={points} fill="none" stroke={gradientColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* dots */}
        {values.map((v, i) => {
          const x = pad + i * stepX;
          const y = h - pad - ((v - min) / range) * (h - pad * 2);
          return <circle key={i} cx={x} cy={y} r="4" fill={gradientColor} stroke="white" strokeWidth="2" />;
        })}
        {/* x labels */}
        {data.map((d, i) => (
          <text key={i} x={pad + i * stepX} y={h - 8} textAnchor="middle" fontSize="10" fill="#9ca3af">{d.name}</text>
        ))}
      </svg>
    </div>
  )
}

/* ─── Chart Data ─── */
const chartData = [
  { name: 'Mon', risk: 0.25, memory: 65 },
  { name: 'Tue', risk: 0.22, memory: 70 },
  { name: 'Wed', risk: 0.23, memory: 68 },
  { name: 'Thu', risk: 0.20, memory: 75 },
  { name: 'Fri', risk: 0.18, memory: 80 },
  { name: 'Sat', risk: 0.15, memory: 85 },
  { name: 'Sun', risk: 0.16, memory: 82 }
];

/* ═══════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════ */
export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'User';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  // Fallback values when API data isn't available
  const riskLevel = data?.riskLevel || 'Low';
  const riskScore = data?.riskScore ?? 0.22;
  const trend = data?.trend ?? '+0.01';
  const streak = data?.streak ?? '12 days';
  const analysis = data?.analysis || "Your cognitive patterns today suggest normal function. Continue your daily routine and test again tomorrow.";
  const tasks = data?.tasks || [];
  const doneCount = tasks.filter(t => t.done).length;
  const totalCount = tasks.length || 5;
  const gameScores = data?.gameScores || {};
  const wpmTrend = data?.wpmTrend || [];
  const riskBadges = data?.riskBadges || [];

  // Risk color mapping
  const riskColor = riskLevel === 'Low' ? '#1D9E75' : riskLevel === 'Medium' ? '#EF9F27' : '#E53E3E';
  const riskStage = riskLevel === 'Low' ? 'Stage 0 — Normal' : riskLevel === 'Medium' ? 'Stage 1 — Mild' : 'Stage 2+';
  const riskVariant = riskLevel === 'Low' ? 'low' : riskLevel === 'Medium' ? 'med' : 'high';

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-3">
        <Card>
          <CardLabel>Risk level</CardLabel>
          <CardBigValue style={{ color: riskColor }}>{riskLevel}</CardBigValue>
          <div className="mt-1">
            <Badge variant={riskVariant}>{riskStage}</Badge>
          </div>
        </Card>
        
        <Card>
          <CardLabel>Risk score</CardLabel>
          <CardBigValue>{typeof riskScore === 'number' ? riskScore.toFixed(2) : riskScore}</CardBigValue>
          <MiniLabel className="mt-1 block">out of 1.0</MiniLabel>
        </Card>
        
        <Card>
          <CardLabel>Trend (7 days)</CardLabel>
          <CardBigValue className="text-[#1D9E75]">{trend}</CardBigValue>
          <MiniLabel className="mt-1 block">Slight improvement</MiniLabel>
        </Card>
        
        <Card>
          <CardLabel>Task streak</CardLabel>
          <CardBigValue>{streak}</CardBigValue>
          <MiniLabel className="mt-1 block">Keep it up!</MiniLabel>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-3">
        <Card>
          <SectionTitle>Risk score — 30 days</SectionTitle>
          <div className="relative h-[110px] mt-1.5">
            <svg viewBox="0 0 300 90" preserveAspectRatio="none" className="w-full h-full">
              <polyline fill="none" stroke="#6d5cf7" strokeWidth="1.5" points="0,60 15,55 30,58 45,52 60,54 75,50 90,48 105,45 120,47 135,42 150,44 165,40 180,43 195,38 210,40 225,36 240,38 255,34 270,32 285,30 300,28"/>
              <polygon fill="#6d5cf7" fillOpacity="0.08" points="0,60 15,55 30,58 45,52 60,54 75,50 90,48 105,45 120,47 135,42 150,44 165,40 180,43 195,38 210,40 225,36 240,38 255,34 270,32 285,30 300,28 300,90 0,90"/>
              <line x1="0" y1="72" x2="300" y2="72" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5"/>
              <text x="0" y="88" style={{fontSize: "9px", fill: "#888780"}}>30d ago</text>
              <text x="240" y="88" style={{fontSize: "9px", fill: "#888780"}}>Today</text>
              <text x="246" y="26" style={{fontSize: "9px", fill: "#6d5cf7", fontWeight: 500}}>{typeof riskScore === 'number' ? riskScore.toFixed(2) : riskScore}</text>
            </svg>
          </div>
          
          <MiniLabel className="mt-2 block">MCI stage</MiniLabel>
          <div className="flex gap-1 mt-2">
            <div className="flex-1 h-1.5 rounded-full bg-[#1D9E75]"></div>
            <div className="flex-1 h-1.5 rounded-full bg-[var(--color-background-secondary)]"></div>
            <div className="flex-1 h-1.5 rounded-full bg-[var(--color-background-secondary)]"></div>
            <div className="flex-1 h-1.5 rounded-full bg-[var(--color-background-secondary)]"></div>
          </div>
          <div className="flex justify-between mt-1">
            <MiniLabel>Stage 0</MiniLabel>
            <MiniLabel>Stage 3</MiniLabel>
          </div>
        </Card>

        <Card>
          <SectionTitle>Memory performance — last 7 tests</SectionTitle>
          <div className="mb-3 space-y-1.5">
            {(gameScores.memory !== undefined ? [
              { label: 'Memory', score: gameScores.memory, color: '#6d5cf7' },
              { label: 'Language', score: gameScores.language, color: '#1D9E75' },
              { label: 'Pattern', score: gameScores.pattern, color: '#3B8BD4' },
            ] : [
              { label: 'Memory Mosaic', score: 0.84, color: '#6d5cf7' },
              { label: 'Word Garden', score: 0.72, color: '#1D9E75' },
              { label: 'Path Finder', score: 0.68, color: '#3B8BD4' },
            ]).map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <MiniLabel className="w-20 text-right">{item.label}</MiniLabel>
                <div className="flex-1 h-2 bg-[var(--color-background-secondary)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{width: `${(item.score * 100)}%`, backgroundColor: item.color}}></div>
                </div>
                <MiniLabel>{typeof item.score === 'number' ? item.score.toFixed(2) : item.score}</MiniLabel>
              </div>
            ))}
          </div>
          
          <SectionTitle>Typing speed trend (WPM)</SectionTitle>
          <div className="relative h-[70px]">
            <svg viewBox="0 0 300 60" preserveAspectRatio="none" className="w-full h-full">
              <polyline fill="none" stroke="#1D9E75" strokeWidth="1.5" points="0,40 50,36 100,38 150,30 200,32 250,28 300,25"/>
              <polygon fill="#1D9E75" fillOpacity="0.08" points="0,40 50,36 100,38 150,30 200,32 250,28 300,25 300,60 0,60"/>
              <text x="256" y="22" style={{fontSize: "9px", fill: "#1D9E75", fontWeight: 500}}>42 WPM</text>
            </svg>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-3">
        <Card>
          <div className="flex justify-between items-center mb-1.5">
            <SectionTitle className="mb-0">Today's tasks</SectionTitle>
            <MiniLabel>{doneCount} / {totalCount} done</MiniLabel>
          </div>
          
          <div className="flex flex-col">
            {tasks.length > 0 ? tasks.map((t, i) => (
              <TaskItem key={t._id || i} done={t.done} dotColor={t.dotColor || '#6d5cf7'} label={t.label || t.title} />
            )) : (
              <>
                <TaskItem done dotColor="#6d5cf7" label="Complete today's brain activity" />
                <TaskItem done dotColor="#1D9E75" label="Check in with your companion" />
                <TaskItem done dotColor="#3B8BD4" label="5-minute gentle stretching" />
                <TaskItem done={false} dotColor="#EF9F27" label="Name 5 things you can see right now" />
                <TaskItem done={false} dotColor="#1D9E75" label="Call a family member today" />
              </>
            )}
          </div>
        </Card>

        <Card>
          <SectionTitle>Activity — last 52 weeks</SectionTitle>
          <Heatmap />
          <div className="flex gap-1 mt-2 items-center">
            <MiniLabel>Less</MiniLabel>
            <div className="w-3 h-3 rounded-[2px] bg-[var(--color-background-secondary)]"></div>
            <div className="w-3 h-3 rounded-[2px] bg-[#9FE1CB]"></div>
            <div className="w-3 h-3 rounded-[2px] bg-[#1D9E75]"></div>
            <div className="w-3 h-3 rounded-[2px] bg-[#0F6E56]"></div>
            <MiniLabel>More</MiniLabel>
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle>Today's analysis</SectionTitle>
        <div className="bg-[var(--color-background-secondary)] border-[0.5px] border-[var(--color-border-secondary)] rounded-lg px-3 py-2.5 text-xs text-[var(--color-text-secondary)] mt-2.5 leading-relaxed">
          {analysis}
        </div>
        
        <div className="mt-2.5 flex gap-2 flex-wrap">
          {riskBadges.length > 0 ? riskBadges.map((b, i) => (
            <Badge key={i} variant={b.variant || 'low'} className="px-2.5 py-1 text-xs">{b.text}</Badge>
          )) : (
            <>
              <Badge variant="low" className="px-2.5 py-1 text-xs">Game: Low risk</Badge>
              <Badge variant="low" className="px-2.5 py-1 text-xs">Chat: Low risk</Badge>
              <Badge variant="low" className="px-2.5 py-1 text-xs">Webcam: Low risk</Badge>
            </>
          )}
        </div>
      </Card>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <ScoreCard 
          title="Overall Risk Score" 
          score="0.16" 
          total="1.0"
          subtitle="Stage 0 — Normal Cognitive Function" 
          icon="🛡️" 
          colorClass={{ bg: 'bg-green-100 text-green-600' }}
          trendText="-0.04 this week"
        />
        <ScoreCard 
          title="Average Game Score" 
          score="84" 
          total="100"
          subtitle="Top 15% for your age group" 
          icon="🎮" 
          colorClass={{ bg: 'bg-indigo-100 text-indigo-600' }}
          trendText="+5% from last week"
        />
        <ScoreCard 
          title="Chat Health Index" 
          score="92" 
          total="100"
          subtitle="High linguistic coherence & recall" 
          icon="💬" 
          colorClass={{ bg: 'bg-blue-100 text-blue-600' }}
        />
        <ScoreCard 
          title="Webcam Emotion Score" 
          score="Calm" 
          subtitle="Consistent positive baseline detected" 
          icon="📷" 
          colorClass={{ bg: 'bg-amber-100 text-amber-600' }}
        />
      </div>

      {/* Middle Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        
        {/* Left Column: Calendar & Tasks */}
        <div className="lg:col-span-1 space-y-6">
          <DailyProgressCalendar />
          
          <div className="h-[400px]">
            <TasksListWidget />
          </div>
        </div>

        {/* Right Column: Charts & Analysis */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          
          <ProgressChart 
            title="Memory Performance Trend" 
            data={chartData} 
            dataKey="memory" 
            gradientColor="#3B82F6" 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Detailed Analysis</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">⌨️</span>
                    <h4 className="font-semibold text-gray-800 text-sm">Typing Rhythm</h4>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Consistent speed with low backspace rate (8%). Fine motor skills remain stable.
                  </p>
                </div>
                
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🧠</span>
                    <h4 className="font-semibold text-gray-800 text-sm">Short-term Memory</h4>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Scored above the 70th percentile for the 66-75 age band in today's Sequence Game.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 shadow-sm border border-indigo-100 relative overflow-hidden">
              {/* Illustration graphic abstraction */}
              <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-1/4 translate-y-1/4">
                <svg width="150" height="150" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 0C77.6142 0 100 22.3858 100 50C100 77.6142 77.6142 100 50 100C22.3858 100 0 77.6142 0 50C0 22.3858 22.3858 0 50 0Z" fill="#818CF8"/>
                  <circle cx="30" cy="30" r="10" fill="white"/>
                  <circle cx="70" cy="70" r="15" fill="white"/>
                  <circle cx="20" cy="80" r="5" fill="white"/>
                </svg>
              </div>

              <h3 className="text-lg font-bold text-indigo-900 mb-2 relative z-10">Doctor's Note</h3>
              <p className="text-sm text-indigo-800/80 relative z-10 leading-relaxed mt-4">
                "Your test consistency this month is excellent. We are seeing sustained baseline stability in your reaction times. Keep up the daily check-ins — the AI chatbot is picking up very positive grammatical structures."
              </p>
              
              <div className="mt-6 flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-full bg-indigo-200 border-2 border-white shadow-sm flex items-center justify-center font-bold text-indigo-700">
                  Dr
                </div>
                <div>
                  <div className="text-xs font-bold text-indigo-900">Dr. Sarah Jenkins</div>
                  <div className="text-[10px] text-indigo-600">Neurologist</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
