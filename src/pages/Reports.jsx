import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { Card, CardLabel, SectionTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import api from '../api/axiosInstance';

// ─── Skeleton loader ───────────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded-xl ${className}`}
      style={{ background: 'var(--color-background-secondary)' }}
    />
  );
}

// ─── Empty state card ──────────────────────────────────────────────────────────
function EmptyState({ icon = '📊', title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{title}</p>
      {subtitle && (
        <p className="text-xs max-w-xs" style={{ color: 'var(--color-text-secondary)' }}>{subtitle}</p>
      )}
    </div>
  );
}

// ─── Risk badge colour helper ──────────────────────────────────────────────────
function riskVariant(level) {
  if (!level) return 'info';
  const l = level.toLowerCase();
  if (l === 'high')   return 'high';
  if (l === 'medium') return 'med';
  return 'low';
}

// ─── Stage → colour helper ────────────────────────────────────────────────────
function stageColour(stage) {
  if (stage === 3) return '#EF4444';
  if (stage === 2) return '#F59E0B';
  if (stage === 1) return '#3B82F6';
  return '#1D9E75';
}

// ─── Insight generator ────────────────────────────────────────────────────────
function buildTrendInsight(riskTrend) {
  if (!riskTrend || riskTrend.length < 2) {
    return {
      icon: '📈',
      colour: '#6d5cf7',
      title: 'Keep Going',
      body: 'Complete more sessions to see your personal trend analysis.',
    };
  }
  const first = riskTrend[0].score;
  const last  = riskTrend[riskTrend.length - 1].score;
  const delta = ((first - last) / first * 100).toFixed(0);
  if (last < first) {
    return {
      icon: '✅',
      colour: '#1D9E75',
      title: `${delta}% Improvement Detected`,
      body: `Your risk score dropped from ${(first * 100).toFixed(0)} to ${(last * 100).toFixed(0)} over ${riskTrend.length} sessions. Your cognitive engagement exercises are working.`,
    };
  } else if (last > first) {
    return {
      icon: '⚠️',
      colour: '#F59E0B',
      title: 'Slight Increase Noted',
      body: `Your risk score rose by ${Math.abs(Number(delta))}% over ${riskTrend.length} sessions. Consider completing all daily activities consistently.`,
    };
  }
  return {
    icon: '📊',
    colour: '#3B82F6',
    title: 'Stable Pattern',
    body: 'Your cognitive risk score is holding steady. Maintain your current routine.',
  };
}

function buildDomainInsight(gamePerformance) {
  if (!gamePerformance || gamePerformance.length === 0) {
    return {
      icon: '🎮',
      colour: '#6d5cf7',
      title: 'No Game Data Yet',
      body: 'Play some cognitive games to see your domain-specific performance breakdown.',
    };
  }
  const sorted    = [...gamePerformance].sort((a, b) => b.score - a.score);
  const strongest = sorted[0];
  const weakest   = sorted[sorted.length - 1];
  return {
    icon: '🧠',
    colour: '#3B8BD4',
    title: 'Domain Analysis',
    body: `You're performing best in "${strongest.name}" (${strongest.score}%). ${
      weakest.score < 70
        ? `Consider focusing more on "${weakest.name}" (${weakest.score}%) to balance cognitive domains.`
        : 'All domains are performing well — great balanced progress!'
    }`,
  };
}

// ─── Demo Data ────────────────────────────────────────────────────────────────
const demoHistoryRes = {
  riskTrend: [
    { day: "Day 1", score: 0.8 },
    { day: "Day 2", score: 0.75 },
    { day: "Day 3", score: 0.7 },
    { day: "Day 4", score: 0.65 },
    { day: "Day 5", score: 0.6 },
    { day: "Day 6", score: 0.58 },
    { day: "Day 7", score: 0.55 },
  ],
  gamePerformance: [
    { name: "Memory", score: 84 },
    { name: "Language", score: 72 },
    { name: "Pattern", score: 68 },
    { name: "Speed", score: 90 }
  ],
  chatHistory: [
    { riskLevel: "Low", recordedAt: new Date().toISOString(), explanation: "The patient demonstrates excellent semantic fluency and maintains topic coherence without notable hesitation or repetition. Word retrieval is prompt and contextually accurate.", languageScore: 92, avgWPM: 64 },
    { riskLevel: "Low", recordedAt: new Date(Date.now() - 86400000).toISOString(), explanation: "Vocabulary remains diverse and grammar is well-structured. No signs of cognitive decline or speech impairement detected during conversational exchange.", languageScore: 89, avgWPM: 62 },
  ]
};

const demoTodayRes = {
  stage: "Stage 0",
  stageVariant: "low",
  stageBadge: "Normal Baseline",
  avgWpm: "64 WPM",
  wpmVariant: "low",
  wpmBadge: "Stable Cadence",
  engagement: "100%",
  engagementVariant: "low",
  engagementBadge: "High Adherence",
  sessionCount: { hasData: true }
};

const demoSummaryRes = {
  latestRisk: {
    compositeRiskScore: 0.55,
    riskLevel: "Low",
    stage: 0,
    date: new Date().toISOString().split('T')[0],
    explanation: "Cognitive performance remains exceptionally stable. No indicators of early-stage decline.",
    sources: { gameScore: 0.84, chatScore: 0.92, webcamScore: 0.95, taskRate: 1.0 }
  },
  stats: { totalSessions: 14 },
  last7Days: [
    { date: new Date(Date.now() - 86400000 * 6).toISOString().split('T')[0], score: 0.8, stage: 0 },
    { date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], score: 0.75, stage: 0 },
    { date: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0], score: 0.7, stage: 0 },
    { date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], score: 0.65, stage: 0 },
    { date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], score: 0.6, stage: 0 },
    { date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0], score: 0.58, stage: 0 },
    { date: new Date().toISOString().split('T')[0], score: 0.55, stage: 0 }
  ].reverse(),
  streakDay: 7
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function Reports() {
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [riskTrend, setRiskTrend]           = useState([]);
  const [gamePerformance, setGamePerformance] = useState([]);
  const [chatHistory, setChatHistory]         = useState([]);
  const [todayReport, setTodayReport]       = useState(null);
  const [summary, setSummary]               = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const currentMode = localStorage.getItem('mode');
    if (currentMode === 'demo') {
      // Demo Mode Fallback
      if (demoHistoryRes.riskTrend) setRiskTrend(demoHistoryRes.riskTrend);
      if (demoHistoryRes.gamePerformance) setGamePerformance(demoHistoryRes.gamePerformance);
      if (demoHistoryRes.chatHistory) setChatHistory(demoHistoryRes.chatHistory);
      setTodayReport(demoTodayRes);
      setSummary(demoSummaryRes);
      setLoading(false);
      return;
    }

    Promise.all([
      api.get('/dashboard/reports/history').catch(() => ({ data: null })),
      api.get('/dashboard/reports/today').catch(() => ({ data: null })),
      api.get('/dashboard/reports/summary').catch(() => ({ data: null })),
    ])
      .then(([historyRes, todayRes, summaryRes]) => {
        const history = historyRes.data;
        const today   = todayRes.data;
        const sum     = summaryRes.data;

        // Risk trend
        if (history?.riskTrend?.length) {
          setRiskTrend(history.riskTrend);
        }

        // Game performance
        if (history?.gamePerformance?.length) {
          setGamePerformance(history.gamePerformance);
        }

        // Chat history
        if (history?.chatHistory?.length) {
          setChatHistory(history.chatHistory);
        }

        // Today's report
        if (today) setTodayReport(today);

        // Full summary
        if (sum) setSummary(sum);
      })
      .catch(() => setError('Unable to load your reports. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  // ── Derived values ──────────────────────────────────────────────────────────
  const isNewUser   = !loading && riskTrend.length === 0 && !todayReport?.sessionCount?.hasData;
  const trendInsight  = buildTrendInsight(riskTrend);
  const domainInsight = buildDomainInsight(gamePerformance);

  // Today card values — backend returns exact strings OR we show defaults
  const stageText        = todayReport?.stage          ?? 'Stage 0';
  const stageVariant     = todayReport?.stageVariant   ?? 'low';
  const stageBadge       = todayReport?.stageBadge     ?? 'Normal Baseline';
  const avgWpm           = todayReport?.avgWpm         ?? 'No Data';
  const wpmVariant       = todayReport?.wpmVariant     ?? 'info';
  const wpmBadge         = todayReport?.wpmBadge       ?? 'No Session Yet';
  const engagement       = todayReport?.engagement     ?? 'No Data';
  const engagementVariant= todayReport?.engagementVariant ?? 'med';
  const engagementBadge  = todayReport?.engagementBadge  ?? 'No Activity Yet';

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="w-full pb-10">

      {/* ── Header ── */}
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Cognitive Health Reports
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Your progress analysis and historical trends over time.
          </p>
        </div>
        <button
          className="bg-[#6d5cf7] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#5a4dd0] transition-all flex items-center gap-2 shadow-sm"
          onClick={() => window.print()}
        >
          <span>📄</span> Export Cognitive Passport
        </button>
      </header>

      {/* ── Global Error ── */}
      {error && (
        <div className="mb-6 p-4 rounded-xl border text-sm"
          style={{ background: 'var(--color-background-warning, #fff7ed)', borderColor: 'var(--color-border-warning, #fcd34d)', color: 'var(--color-text-warning, #92400e)' }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── New User Banner ── */}
      {isNewUser && !loading && (
        <div className="mb-8 p-6 rounded-2xl border text-center"
          style={{ background: 'var(--color-background-info, #eff6ff)', borderColor: 'var(--color-border-info, #bfdbfe)' }}>
          <p className="text-2xl mb-2">👋</p>
          <p className="font-semibold text-base" style={{ color: 'var(--color-text-primary)' }}>
            Welcome — No Data Yet
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Complete your first game session and daily chat to see your cognitive health report here.
          </p>
        </div>
      )}

      {/* ── Overall Summary Card (only when data exists) ── */}
      {!loading && summary?.latestRisk && (
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <SectionTitle className="text-lg mb-1">Overall Cognitive Profile</SectionTitle>
              <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Based on {summary.stats.totalSessions} total session{summary.stats.totalSessions !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <div>
                  <span className="text-4xl font-extrabold" style={{ color: stageColour(summary.latestRisk.stage) }}>
                    {(summary.latestRisk.compositeRiskScore * 100).toFixed(0)}
                  </span>
                  <span className="text-lg font-bold ml-1" style={{ color: 'var(--color-text-secondary)' }}>/100</span>
                </div>
                <div>
                  <Badge variant={riskVariant(summary.latestRisk.riskLevel)}>
                    {summary.latestRisk.riskLevel} Risk
                  </Badge>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                    Stage {summary.latestRisk.stage} · {summary.latestRisk.date}
                  </p>
                </div>
              </div>
            </div>
            {summary.latestRisk.explanation && (
              <div className="md:max-w-sm p-4 rounded-xl"
                style={{ background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-tertiary)' }}>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  💬 {summary.latestRisk.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Source breakdown */}
          {summary.latestRisk.sources && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Game',   value: summary.latestRisk.sources.gameScore,   icon: '🎮', weight: '40%' },
                { label: 'Chat',   value: summary.latestRisk.sources.chatScore,   icon: '💬', weight: '30%' },
                { label: 'Webcam', value: summary.latestRisk.sources.webcamScore, icon: '📷', weight: '20%' },
                { label: 'Tasks',  value: summary.latestRisk.sources.taskRate,    icon: '✅', weight: '10%' },
              ].map(({ label, value, icon, weight }) => (
                <div key={label} className="p-3 rounded-xl text-center"
                  style={{ background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-tertiary)' }}>
                  <p className="text-lg">{icon}</p>
                  <p className="text-xs font-medium mt-1" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
                  <p className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {value !== undefined && value !== null ? (value * 100).toFixed(0) : '–'}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>weight {weight}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

        {/* Risk Trend Chart */}
        <Card className="p-6">
          <SectionTitle className="text-lg mb-6">30-Day Risk Score Trend</SectionTitle>
          {loading ? (
            <Skeleton className="h-[250px] w-full" />
          ) : riskTrend.length === 0 ? (
            <EmptyState icon="📈" title="No Trend Data Yet" subtitle="Your risk score trend will appear here after several sessions." />
          ) : (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={riskTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-tertiary)" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false}
                    tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} />
                  <YAxis axisLine={false} tickLine={false} domain={[0, 1]}
                    tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} />
                  <Tooltip
                    formatter={(value) => [(value * 100).toFixed(0) + '%', 'Risk Score']}
                    contentStyle={{
                      backgroundColor: 'var(--color-background-primary)',
                      border: '0.5px solid var(--color-border-tertiary)',
                      borderRadius: '12px', fontSize: '12px'
                    }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#6d5cf7" strokeWidth={3}
                    dot={{ r: 4, fill: '#6d5cf7' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* Dynamic insight */}
          {!loading && riskTrend.length > 0 && (
            <div className="mt-4 p-4 rounded-xl border-[0.5px]"
              style={{ background: 'var(--color-background-secondary)', borderColor: 'var(--color-border-tertiary)' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{trendInsight.icon}</span>
                <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {trendInsight.title}
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {trendInsight.body}
              </p>
            </div>
          )}
        </Card>

        {/* Game Performance Chart */}
        <Card className="p-6">
          <SectionTitle className="text-lg mb-6">Peak Cognitive Performance</SectionTitle>
          {loading ? (
            <Skeleton className="h-[250px] w-full" />
          ) : gamePerformance.length === 0 ? (
            <EmptyState icon="🎮" title="No Game Data Yet" subtitle="Your domain performance chart will appear after playing cognitive games." />
          ) : (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gamePerformance}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-tertiary)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false}
                    tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} />
                  <YAxis axisLine={false} tickLine={false} domain={[0, 100]}
                    tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }}
                    tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    formatter={(value) => [`${value}%`, 'Score']}
                    cursor={{ fill: 'var(--color-background-secondary)' }}
                    contentStyle={{
                      backgroundColor: 'var(--color-background-primary)',
                      border: '0.5px solid var(--color-border-tertiary)',
                      borderRadius: '12px', fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="score" fill="#1D9E75" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* Dynamic domain insight */}
          {!loading && gamePerformance.length > 0 && (
            <div className="mt-4 p-4 rounded-xl border-[0.5px]"
              style={{ background: 'var(--color-background-secondary)', borderColor: 'var(--color-border-tertiary)' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{domainInsight.icon}</span>
                <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {domainInsight.title}
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {domainInsight.body}
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* ── Today's Metric Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {/* Stage Card */}
        {loading ? (
          <Skeleton className="h-32" />
        ) : (
          <Card style={{ background: 'var(--color-background-success, #f0fdf4)', borderColor: 'var(--color-border-success, #bbf7d0)' }}>
            <CardLabel style={{ color: 'var(--color-text-success, #065f46)' }}>Stage Progression</CardLabel>
            <div className="text-2xl font-bold mt-2" style={{ color: 'var(--color-text-primary)' }}>
              {stageText}
            </div>
            <Badge variant={stageVariant} className="mt-2">{stageBadge}</Badge>
            <p className="text-[10px] mt-3" style={{ color: 'var(--color-text-tertiary)' }}>
              Next assessment recommendation: 24h
            </p>
          </Card>
        )}

        {/* WPM Card */}
        {loading ? (
          <Skeleton className="h-32" />
        ) : (
          <Card style={{ background: 'var(--color-background-info, #eff6ff)', borderColor: 'var(--color-border-info, #bfdbfe)' }}>
            <CardLabel style={{ color: 'var(--color-text-info, #1e40af)' }}>Avg Typing Speed</CardLabel>
            <div className="text-2xl font-bold mt-2" style={{ color: 'var(--color-text-primary)' }}>
              {avgWpm}
            </div>
            <Badge variant={wpmVariant} className="mt-2">{wpmBadge}</Badge>
            <p className="text-[10px] mt-3" style={{ color: 'var(--color-text-tertiary)' }}>
              Measured over today's chat sessions.
            </p>
          </Card>
        )}

        {/* Engagement Card */}
        {loading ? (
          <Skeleton className="h-32" />
        ) : (
          <Card style={{ background: 'var(--color-background-warning, #fffbeb)', borderColor: 'var(--color-border-warning, #fde68a)' }}>
            <CardLabel style={{ color: 'var(--color-text-warning, #92400e)' }}>Engagement Rate</CardLabel>
            <div className="text-2xl font-bold mt-2" style={{ color: 'var(--color-text-primary)' }}>
              {engagement}
            </div>
            <Badge variant={engagementVariant} className="mt-2">{engagementBadge}</Badge>
            <p className="text-[10px] mt-3" style={{ color: 'var(--color-text-tertiary)' }}>
              Daily routine completion consistency.
            </p>
          </Card>
        )}
      </div>

      {/* ── 7-Day Snapshot Table ── */}
      {!loading && summary?.last7Days?.length > 0 && (
        <Card className="p-6 mb-8">
          <SectionTitle className="text-lg mb-4">7-Day History</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b" style={{ borderColor: 'var(--color-border-tertiary)' }}>
                  {['Date', 'Risk Score', 'Stage', 'Status'].map(h => (
                    <th key={h} className="pb-3 pr-4 text-xs font-semibold"
                      style={{ color: 'var(--color-text-tertiary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...summary.last7Days].reverse().map((row, i) => (
                  <tr key={i} className="border-b last:border-0"
                    style={{ borderColor: 'var(--color-border-tertiary)' }}>
                    <td className="py-3 pr-4 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {row.date}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full overflow-hidden"
                          style={{ background: 'var(--color-background-secondary)' }}>
                          <div className="h-full rounded-full"
                            style={{ width: `${(row.score * 100).toFixed(0)}%`, background: stageColour(row.stage) }} />
                        </div>
                        <span className="text-xs font-mono font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          {(row.score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-xs" style={{ color: 'var(--color-text-primary)' }}>
                      Stage {row.stage}
                    </td>
                    <td className="py-3">
                      <Badge variant={row.stage === 0 ? 'low' : row.stage === 1 ? 'info' : row.stage === 2 ? 'med' : 'high'}>
                        {row.stage === 0 ? 'Normal' : row.stage === 1 ? 'Mild' : row.stage === 2 ? 'Moderate' : 'High Risk'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── Chat Insight History ── */}
      {!loading && chatHistory.length > 0 && (
        <Card className="p-6 mb-8">
          <SectionTitle className="text-lg mb-4">Recent Chat Insights</SectionTitle>
          <div className="grid gap-4">
            {chatHistory.map((chat, i) => (
              <div key={i} className="p-4 rounded-xl border flex flex-col md:flex-row gap-4 justify-between items-start"
                   style={{ background: 'var(--color-background-secondary)', borderColor: 'var(--color-border-tertiary)' }}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant={riskVariant(chat.riskLevel)}>{chat.riskLevel || 'Unknown'} Risk</Badge>
                    <span className="text-xs font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>
                      {new Date(chat.recordedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    {chat.explanation}
                  </p>
                </div>
                <div className="flex shrink-0 gap-4">
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>Language Score</p>
                    <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{chat.languageScore || 'N/A'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>Avg WPM</p>
                    <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{chat.avgWPM ? Math.round(chat.avgWPM) : 'N/A'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Streak + Tips ── */}
      {!loading && (summary?.streakDay ?? 0) > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                🔥 Current Streak
              </p>
              <p className="text-3xl font-extrabold" style={{ color: 'var(--color-text-primary)' }}>
                {summary.streakDay} day{summary.streakDay !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex-1 p-4 rounded-xl"
              style={{ background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-tertiary)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                💡 Personalised Tip
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {summary.streakDay >= 7
                  ? 'Outstanding consistency! 7+ days of engagement significantly improve the accuracy of your cognitive baseline.'
                  : summary.streakDay >= 3
                  ? 'Great momentum! Keep your streak going — consistent daily sessions produce the most accurate trend data.'
                  : 'Good start! Try to complete a game, chat, and task every day to build your cognitive health baseline.'}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
