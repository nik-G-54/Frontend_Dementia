import React from 'react';
import { Card, CardLabel, SectionTitle, MiniLabel } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function Reports() {
  const riskData = [
    { day: 'Day 1', score: 0.35 },
    { day: 'Day 5', score: 0.32 },
    { day: 'Day 10', score: 0.33 },
    { day: 'Day 15', score: 0.28 },
    { day: 'Day 20', score: 0.25 },
    { day: 'Day 25', score: 0.24 },
    { day: 'Day 30', score: 0.22 },
  ];

  const gamePerformance = [
    { name: 'Memory', score: 84 },
    { name: 'Language', score: 72 },
    { name: 'Pattern', score: 68 },
    { name: 'Speed', score: 90 },
  ];

  return (
    <div className="w-full pb-10">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Cognitive Health Reports</h1>
          <p className="text-[var(--color-text-secondary)]">Your progress analysis and historical trends over time.</p>
        </div>
        <button className="bg-[#6d5cf7] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#5a4dd0] transition-all flex items-center gap-2 shadow-sm">
          <span>📄</span> Export Cognitive Passport
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="p-6">
          <SectionTitle className="text-lg mb-6">30-Day Risk Score Trend</SectionTitle>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-tertiary)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 1]} tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '12px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="score" stroke="#6d5cf7" strokeWidth={3} dot={{ r: 4, fill: '#6d5cf7' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-[var(--color-background-secondary)]/50 rounded-xl border-[0.5px] border-[var(--color-border-tertiary)]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#1D9E75] text-lg">●</span>
              <span className="text-sm font-bold text-[var(--color-text-primary)]">Steady Improvement Detected</span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Your risk score has decreased by 13% over the last 30 days. This trend suggests your cognitive engagement exercises are yielding positive results.
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <SectionTitle className="text-lg mb-6">Peak Cognitive performance</SectionTitle>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gamePerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-tertiary)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} />
                <Tooltip 
                  cursor={{ fill: 'var(--color-background-secondary)' }}
                  contentStyle={{ backgroundColor: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="score" fill="#1D9E75" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-[var(--color-background-secondary)]/50 rounded-xl border-[0.5px] border-[var(--color-border-tertiary)]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#3B8BD4] text-lg">●</span>
              <span className="text-sm font-bold text-[var(--color-text-primary)]">Domain Analysis</span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              You're excelling in 'Processing Speed' and 'Memory'. We suggest focusing more on 'Pattern Matching' to maintain balanced frontal-lobe activity.
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[var(--color-background-success)]/10 border-[var(--color-border-success)]">
          <CardLabel style={{ color: 'var(--color-text-success)' }}>Stage Progression</CardLabel>
          <div className="text-2xl font-bold mt-2">Stage 0</div>
          <Badge variant="low" className="mt-2">Normal Baseline</Badge>
          <p className="text-[10px] text-[var(--color-text-tertiary)] mt-3">Next assessment recommendation: 24h</p>
        </Card>

        <Card className="bg-[var(--color-background-info)]/10 border-[var(--color-border-info)]">
          <CardLabel style={{ color: 'var(--color-text-info)' }}>Avg Telemetry Score</CardLabel>
          <div className="text-2xl font-bold mt-2">42 WPM</div>
          <Badge variant="info" className="mt-2">Stable Cadence</Badge>
          <p className="text-[10px] text-[var(--color-text-tertiary)] mt-3">Measured over last 10 chat sessions.</p>
        </Card>

        <Card className="bg-[var(--color-background-warning)]/10 border-[var(--color-border-warning)]">
          <CardLabel style={{ color: 'var(--color-text-warning)' }}>Engagement Rate</CardLabel>
          <div className="text-2xl font-bold mt-2">92%</div>
          <Badge variant="med" className="mt-2">High Adherence</Badge>
          <p className="text-[10px] text-[var(--color-text-tertiary)] mt-3">Daily routine completion consistency.</p>
        </Card>
      </div>
    </div>
  );
}
