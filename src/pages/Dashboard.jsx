import { useState, useEffect } from "react"
import { Card, CardLabel, CardBigValue, SectionTitle, MiniLabel } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { TaskItem } from "../components/ui/TaskItem"
import api from "../api/axiosInstance"

function Heatmap() {
  const colors = [
    "var(--color-background-secondary)",
    "#E1F5EE",
    "#9FE1CB",
    "#1D9E75",
    "#0F6E56"
  ];
  
  // Generate random data for demo
  const days = Array.from({ length: 365 }, () => {
    const v = Math.random();
    return v < 0.3 ? 0 : v < 0.55 ? 1 : v < 0.75 ? 2 : v < 0.9 ? 3 : 4;
  });

  return (
    <div className="flex gap-[3px] flex-wrap mt-1">
      {days.map((val, i) => (
        <div 
          key={i} 
          className="w-3 h-3 rounded-[2px]" 
          style={{ backgroundColor: colors[val] }}
        />
      ))}
    </div>
  )
}

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
        
        <p className="text-[11px] text-[var(--color-text-tertiary)] mt-2 italic">
          This tool provides risk indicators only. It is not a medical diagnosis. Please consult a healthcare professional.
        </p>
      </Card>
    </div>
  )
}
