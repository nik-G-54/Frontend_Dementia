// ============================================================
// CogGuard — Games.jsx
// Cognitive games matching HumanCognition.io design + flow.
// 6 games: Reaction Time, Sequence Memory, Number Memory,
//          Verbal Memory, Chimp Test, Target Practice
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";
import TargetPracticeGame from "../components/games/TargetPracticeGame";

/* ─── Injected CSS ─── */
const GAME_STYLES = `
  @keyframes fadeScaleIn {
    from { opacity:0; transform: scale(0.92); }
    to   { opacity:1; transform: scale(1); }
  }
  @keyframes tileFlash {
    0%   { background: var(--tile-flash-color, #4f6bff); }
    100% { background: transparent; }
  }
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @keyframes numberPop {
    0%   { transform: scale(0.5); opacity:0; }
    50%  { transform: scale(1.1); }
    100% { transform: scale(1); opacity:1; }
  }
  .cg-modal-enter { animation: fadeScaleIn 250ms ease forwards; }
  .cg-number-pop  { animation: numberPop 350ms ease forwards; }
  .cg-skeleton {
    background: linear-gradient(90deg, #e8eaf0 25%, #f0f2f5 50%, #e8eaf0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 12px;
  }
  .cg-game-card {
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
    padding: 40px;
    max-width: 90vw;
    min-height: 60vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 0 auto;
    width: 100%;
  }
  .cg-game-page {
    min-height: calc(100vh - 80px);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 16px 40px;
    width: 100%;
  }
  .cg-gradient-btn {
    background: linear-gradient(135deg, #60a5fa, #6366f1);
    color: #fff; border: none; border-radius: 12px;
    padding: 14px 40px; font-size: 16px; font-weight: 600;
    cursor: pointer; transition: opacity 0.2s, transform 0.15s;
    width: 100%;
  }
  .cg-gradient-btn:hover { opacity: 0.92; }
  .cg-gradient-btn:active { transform: scale(0.97); }
  .cg-instruction-box {
    background: #fefce8; border-left: 4px solid #facc15;
    padding: 14px 18px; border-radius: 0 8px 8px 0;
    margin-bottom: 24px; font-size: 14px; color: #713f12;
    line-height: 1.6;
  }
  .cg-home-card {
    background: #fff; border-radius: 16px; padding: 28px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);
    transition: transform 0.2s, box-shadow 0.2s; cursor: pointer;
  }
  .cg-home-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  }
`;

/* ─── API helpers ─── */
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem("token") || "";
const GAME_TO_SCORE_ID = {
  reaction: "reaction", number: "number",
  verbal: "colorWord", chimp: "wordScramble",
};

async function apiPost(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function apiGet(path) {
  const res = await fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${getToken()}` } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/* ─── Constants ─── */
const MAX_LIVES = 5;

const ALL_GAMES = [
  { id: "reaction", title: "Reaction Time",   icon: "⚡", iconBg: "#dcfce7", iconColor: "#16a34a", desc: "Test how quickly you can respond to a visual stimulus. Average human reaction time is around 250ms." },
  { id: "number",   title: "Number Memory",    icon: "#",  iconBg: "#fce7f3", iconColor: "#db2777", desc: "Test your numerical memory by memorizing increasingly long numbers and typing them back." },
  { id: "verbal",   title: "Verbal Memory",    icon: "Aa", iconBg: "#dbeafe", iconColor: "#2563eb", desc: "Keep as many words in short-term memory as possible. You'll see words one at a time — decide if each is NEW or SEEN." },
  { id: "chimp",    title: "Chimp Test",       icon: "🐵", iconBg: "#fef9c3", iconColor: "#ca8a04", desc: "Click the numbers in ascending order. After clicking '1', all other numbers become hidden. Beat the chimps!" },
  { id: "target",   title: "Target Practice",  icon: "◎",  iconBg: "#fee2e2", iconColor: "#dc2626", desc: "Click the red target as quickly as possible in 15 rounds. Test your visual processing speed and hand-eye coordination." }
];

/* ─── Local storage helpers ─── */
function todayKey() { return new Date().toISOString().split("T")[0]; }
function saveDayScore(gameId, score, errors) {
  const key = `cg_scores_${gameId}`;
  const data = JSON.parse(localStorage.getItem(key) || "{}");
  const today = todayKey();
  if (!data[today] || data[today].score < score) {
    data[today] = { score, errors, ts: Date.now() };
    localStorage.setItem(key, JSON.stringify(data));
  }
}
function getBestToday(gameId) {
  return (JSON.parse(localStorage.getItem(`cg_scores_${gameId}`) || "{}"))[todayKey()] || null;
}
function getLast7Days(gameId) {
  const data = JSON.parse(localStorage.getItem(`cg_scores_${gameId}`) || "{}");
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const k = d.toISOString().split("T")[0];
    days.push({ date: k.slice(5), score: data[k]?.score || 0 });
  }
  return days;
}

/* ─── Lives Display (hearts) ─── */
function LivesBar({ lives, max = MAX_LIVES }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className="text-lg transition-all duration-200"
              style={{ opacity: i < lives ? 1 : 0.2, transform: i < lives ? 'scale(1)' : 'scale(0.75)' }}>
          {i < lives ? '❤️' : '🖤'}
        </span>
      ))}
    </div>
  );
}

/* ─── Instruction Screen (before each game) ─── */
function GameStartScreen({ game, onStart }) {
  const [countdown, setCountdown] = useState(2);
  useEffect(() => {
    const t = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 0), 1000);
    const s = setTimeout(onStart, 2000);
    return () => { clearInterval(t); clearTimeout(s); };
  }, [onStart]);

  return (
    <div className="cg-game-card cg-modal-enter text-center">
      <div className="w-32 h-32 rounded-3xl flex items-center justify-center text-6xl mx-auto mb-8"
           style={{ background: game.iconBg, color: game.iconColor }}>
        {game.icon}
      </div>
      <h2 className="text-4xl font-bold text-gray-900 mb-4">{game.title}</h2>
      <p className="text-gray-500 text-lg lg:text-xl mb-8 max-w-xl mx-auto">{game.desc}</p>

      <div className="cg-instruction-box text-left">
        <strong>How to play:</strong><br />
        {game.id === "reaction" && "Wait for the red screen to turn green, then click as fast as you can. You have 5 rounds."}
        {game.id === "sequence" && "Watch the tiles flash in a sequence, then repeat the sequence by clicking the same tiles in order."}
        {game.id === "number" && "A number will appear briefly. Memorize it and type it back. Numbers get longer each round."}
        {game.id === "verbal" && "Words appear one at a time. Click 'NEW' if you haven't seen the word, or 'SEEN' if you have. You get 5 lives."}
        {game.id === "chimp" && "Numbers appear on the grid. Click them in ascending order (1, 2, 3…). After you click '1', the rest are hidden."}
        {game.id === "target" && "Click the red target as fast as you can. 15 rounds total."}
      </div>

      <button className="cg-gradient-btn text-2xl py-6" onClick={onStart}>Start Game ({countdown})</button>
    </div>
  );
}

/* ─── Result Screen ─── */
function ResultScreen({ game, result, onPlayAgain, onGoBack, onNext }) {
  const [apiMsg, setApiMsg] = useState("Saving...");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onNext) onNext();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onNext]);

  useEffect(() => {
    saveDayScore(game.id, result.score, result.errors || 0);
    (async () => {
      try {
        await apiPost("/sessions/game", {
          testType: GAME_TO_SCORE_ID[game.id] || "reaction",
          score: Math.min(1, result.score / 20), timeTaken: result.duration || 10000,
          errors: result.errors || 0, hesitationGaps: [],
        });
        await apiPost("/game-scores", {
          gameId: GAME_TO_SCORE_ID[game.id] || game.id,
          score: result.score, errors: result.errors || 0, level: result.level || 1,
          ...(result.accuracy !== undefined && { accuracy: result.accuracy }),
          ...(result.reactionTime !== undefined && { reactionTime: result.reactionTime }),
          ...(result.duration !== undefined && { duration: result.duration }),
        });
        setApiMsg("Score saved ✓");
      } catch { setApiMsg("Saved locally"); }
    })();
  }, []);

  const rating = result.score > 15 ? { text: "Excellent", color: "#16a34a" }
               : result.score > 8  ? { text: "Above Average", color: "#f59e0b" }
               : result.score > 3  ? { text: "Average", color: "#6366f1" }
                                    : { text: "Below Average", color: "#ef4444" };

  return (
    <div className="cg-game-card cg-modal-enter text-center">
      <div className="text-5xl mb-3">🏆</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">{game.title}</h2>

      <div className="my-6">
        <div className="text-6xl font-extrabold" style={{ color: "#6366f1" }}>
          {result.displayScore || result.score}
        </div>
        <div className="text-sm text-gray-500 mt-1">{result.unit || "points"}</div>
      </div>

      <div className="text-lg font-semibold mb-6" style={{ color: rating.color }}>{rating.text}</div>

      {/* Data breakdown */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Performance Details</div>
        <div className="space-y-2">
          {[
            { label: "Level", value: result.level },
            { label: "Errors", value: result.errors || 0 },
            { label: "Lives Remaining", value: `${MAX_LIVES - (result.errors || 0)}/${MAX_LIVES}` },
            result.accuracy !== undefined && { label: "Accuracy", value: `${result.accuracy}%` },
            result.reactionTime !== undefined && { label: "Avg Reaction", value: `${result.reactionTime}ms` },
            result.duration !== undefined && { label: "Duration", value: `${(result.duration / 1000).toFixed(1)}s` },
          ].filter(Boolean).map((d, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-500">{d.label}</span>
              <span className="font-semibold text-gray-800">{d.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-400 mb-4">{apiMsg}</div>

      <button className="cg-gradient-btn mb-3" onClick={onPlayAgain}>Play Again</button>
      <button className="w-full bg-gray-100 text-gray-700 rounded-xl py-3.5 text-sm font-semibold hover:bg-gray-200 transition-colors"
              onClick={onGoBack}>← Back to Games</button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   GAME 1: REACTION TIME
   Red bg → wait → Green bg → click!
═══════════════════════════════════════════ */
function ReactionTimeGame({ onGameOver }) {
  const TOTAL_ROUNDS = 5;
  const [phase, setPhase] = useState("idle"); // idle, waiting, ready, tooearly, result
  const [round, setRound] = useState(0);
  const [times, setTimes] = useState([]);
  const [lives, setLives] = useState(MAX_LIVES);
  const [errors, setErrors] = useState(0);
  const startRef = useRef(null);
  const timerRef = useRef(null);
  const gameStart = useRef(Date.now());

  function startRound() {
    setPhase("waiting");
    const delay = 1500 + Math.random() * 3000;
    timerRef.current = setTimeout(() => { setPhase("ready"); startRef.current = Date.now(); }, delay);
  }

  function handleClick() {
    if (phase === "idle") { gameStart.current = Date.now(); setRound(1); startRound(); return; }
    if (phase === "waiting") {
      clearTimeout(timerRef.current);
      setPhase("tooearly");
      const newLives = lives - 1;
      setLives(newLives);
      const newErrors = errors + 1;
      setErrors(newErrors);
      if (newLives <= 0) {
        setTimeout(() => {
          const avg = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
          const score = avg ? Math.max(0, Math.round((1000 - avg) / 50)) : 0;
          onGameOver({ score, displayScore: `${avg || 0}ms`, unit: "average", errors: newErrors, level: round, reactionTime: avg, duration: Date.now() - gameStart.current });
        }, 1200);
      } else {
        setTimeout(() => startRound(), 1200);
      }
      return;
    }
    if (phase === "ready") {
      const ms = Date.now() - startRef.current;
      setPhase("result");
      const next = [...times, ms];
      setTimes(next);
      const r = round + 1;
      setRound(r);
      if (r > TOTAL_ROUNDS) {
        const avg = Math.round(next.reduce((a, b) => a + b, 0) / next.length);
        const score = Math.max(0, Math.round((1000 - avg) / 50));
        setTimeout(() => onGameOver({
          score, displayScore: `${avg}ms`, unit: "average",
          errors: errors, level: TOTAL_ROUNDS, reactionTime: avg,
          duration: Date.now() - gameStart.current
        }), 600);
      } else {
        setTimeout(startRound, 1000);
      }
    }
  }

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const avgRT = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : "--";
  const bestRT = times.length > 0 ? Math.min(...times) : "--";
  const lastResult = times.length > 0 ? times[times.length - 1] : "--";

  const phaseColors = {
    idle: "bg-surface-container-high text-on-surface",
    waiting: "bg-[#ba1a1a] text-white", // error
    ready: "bg-[#006a61] text-white", // secondary
    tooearly: "bg-[#ba1a1a] text-white",
    result: "bg-primary text-white"
  };

  const texts = {
    idle: { main: "Welcome", sub: "Click the circular interaction zone to begin" },
    waiting: { main: "Wait...", sub: "Wait for the background to illuminate" },
    ready: { main: "Click!", sub: "Click as fast as you can!" },
    tooearly: { main: "Too Early!", sub: "Click to try again" },
    result: { main: `${lastResult} ms`, sub: `Round ${Math.max(1, round - 1)} of ${TOTAL_ROUNDS} completed` },
  };

  return (
    <div className="w-full flex flex-col animate-[fadeScaleIn_0.3s_ease-out]">
      {/* Header Section */}
      <div className="w-full mb-8 flex flex-col md:flex-row items-end justify-between gap-6">
        <div>
          <span className="text-primary font-bold tracking-[0.1em] text-xs uppercase mb-2 block">Reaction Protocol 04-A</span>
          <h2 className="text-3xl md:text-5xl font-bold text-on-surface tracking-tighter">Neuro-Reflex Test</h2>
        </div>
        <div className="flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/10 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">LIVES:</span>
          <LivesBar lives={lives} max={MAX_LIVES} />
        </div>
      </div>

      <div className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Clinical Insights / Stats */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="bg-surface-container-low px-6 py-4 rounded-xl flex flex-col shadow-sm border border-outline-variant/10">
              <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mb-1">Average RT</span>
              <span className="text-3xl font-bold text-primary">{avgRT}<span className="text-sm font-medium opacity-60 ml-1">ms</span></span>
            </div>
            <div className="bg-surface-container-low px-6 py-4 rounded-xl flex flex-col shadow-sm border border-outline-variant/10">
              <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mb-1">Best RT</span>
              <span className="text-3xl font-bold text-secondary">{bestRT}<span className="text-sm font-medium opacity-60 ml-1">ms</span></span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 mt-2 hidden lg:block">
            <div className="flex items-center gap-2 mb-4 text-tertiary">
              <span className="material-symbols-outlined text-xl">psychology</span>
              <span className="text-xs font-bold uppercase tracking-widest">Cognitive State</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Neural baseline reacting to visual stimuli. Keep focus sharpened on the interaction zone for optimal tracking metrics during this protocol.
            </p>
          </div>
        </div>

        {/* Center: Core Game Area */}
        <div className="lg:col-span-9 relative">
          <div 
            onClick={handleClick}
            className={`w-full min-h-[400px] md:min-h-[500px] rounded-2xl overflow-hidden relative flex flex-col items-center justify-center p-6 md:p-12 transition-colors duration-200 cursor-pointer shadow-sm ${phaseColors[phase]}`}
          >
            {/* Subtle glow elements */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 blur-[100px] rounded-full"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 blur-[100px] rounded-full"></div>

            <div className="z-10 text-center flex flex-col items-center gap-8 w-full max-w-2xl pointer-events-none">
              <div className="space-y-3">
                <h3 className="text-4xl md:text-6xl font-bold tracking-tighter">{texts[phase].main}</h3>
                <p className="text-base md:text-lg font-medium max-w-md mx-auto opacity-90">
                  {texts[phase].sub}
                </p>
              </div>

              {/* Central Interaction Button Graphic */}
              <div className="group relative w-40 h-40 md:w-56 md:h-56 rounded-full flex items-center justify-center shadow-lg border-8 border-current/10 transition-transform">
                <div className="absolute inset-2 md:inset-4 rounded-full border border-current/20 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-current/10 backdrop-blur-sm flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl opacity-80">touch_app</span>
                  </div>
                </div>
                {phase === "waiting" && <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-pulse"></div>}
                {phase === "ready" && <div className="absolute inset-0 rounded-full border-4 border-white/60 animate-ping"></div>}
              </div>

              {/* Status Overlay */}
              <div className="flex items-center gap-4 md:gap-6 py-2 px-6 bg-black/5 backdrop-blur-md rounded-full mt-4 border border-current/10">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${phase === 'waiting' ? 'bg-orange-400' : 'bg-green-400'}`}></span>
                  <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">Sensor Active</span>
                </div>
                <div className="w-px h-4 bg-current/20"></div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold opacity-60">Last:</span>
                  <span className="text-xs font-bold">{lastResult} ms</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Footer */}
      {times.length > 0 && (
        <div className="w-full mt-8 animate-[fadeInUp_0.3s_ease-out]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-bold text-on-surface uppercase tracking-widest">Recent Session Telemetry</h4>
            <span className="text-[10px] font-medium text-on-surface-variant bg-surface-container-high px-2 py-1 rounded">Session #{Date.now().toString().slice(-4)}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {times.map((ms, idx) => (
              <div key={idx} className="flex flex-col bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-[10px] font-bold text-outline uppercase mb-1">TRIAL {idx + 1}</span>
                <div className="flex justify-between items-end">
                  <span className="text-base font-bold text-on-surface">{ms} <span className="text-[10px] font-normal text-on-surface-variant">ms</span></span>
                  <span className={`text-xs ${ms < 250 ? 'text-secondary' : ms > 400 ? 'text-error' : 'text-primary'}`}>
                    {ms < 250 ? 'FAST' : ms > 400 ? 'SLOW' : 'AVG'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}



/* ═══════════════════════════════════════════
   GAME 3: NUMBER MEMORY
   Show number → timer bar → type it back
═══════════════════════════════════════════ */
function NumberMemoryGame({ onGameOver }) {
  const [phase, setPhase] = useState("show"); // show, input
  const [digits, setDigits] = useState(3);
  const [number, setNumber] = useState("");
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [bestScore, setBestScore] = useState(0);
  const timerRef = useRef(null);
  const gameStart = useRef(Date.now());
  const [aiInsight, setAiInsight] = useState("Try grouping numbers into pairs to extend your working memory capacity.");
  const [accuracy, setAccuracy] = useState(92);
  const [focus, setFocus] = useState("High");

  useEffect(() => {
    // Attempt to fetch from stats
    apiGet("/game-scores/summary").then(res => {
        if(res && res.number) {
            setBestScore(res.number.bestScore || 0);
            if(res.number.accuracy) setAccuracy(res.number.accuracy);
        }
    }).catch(()=>{});
    
    // ML fallback/placeholder insight
    apiGet("/dashboard").then(res => {
        if(res && res.data) {
           if(res.data.aiSummary) setAiInsight(res.data.aiSummary);
        }
    }).catch(()=>{});

    startRound(3); 
    return () => clearInterval(timerRef.current);
  }, []);

  function genNumber(len) {
    let n = String(Math.floor(Math.random() * 9) + 1);
    while (n.length < len) n += String(Math.floor(Math.random() * 10));
    return n;
  }

  function startRound(d) {
    const n = genNumber(d);
    setNumber(n); setInput(""); setPhase("show");
  }

  function handleReady() {
    setPhase("input");
  }

  function handleKeypad(val) {
    if (val === 'backspace') {
      setInput(prev => prev.slice(0, -1));
    } else if (val === 'check') {
      handleSubmit();
    } else {
      if (input.length < number.length) {
        setInput(prev => prev + val);
      }
    }
  }

  function handleSubmit() {
    if (!input) return;
    if (input === number) {
      setScore(s => s + digits);
      const nextD = digits + 1; 
      setDigits(nextD); 
      setLevel(l => l + 1);
      if (nextD > bestScore) setBestScore(nextD);
      startRound(nextD);
    } else {
      onGameOver({ score, level, errors: 1, displayScore: `Level ${level}`, unit: "level reached", duration: Date.now() - gameStart.current });
    }
  }

  const renderInputSlots = () => {
    let text = "";
    for(let i=0; i<number.length; i++) {
        if (input[i]) text += input[i] + " ";
        else text += "_ ";
    }
    return text.trim();
  };

  return (
    <div className="w-full max-w-screen-xl relative mx-auto">
      <div className="flex flex-col items-center mb-16 text-center">
        <span className="bg-[#86f2e4] text-[#006f66] px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase mb-4">
          Round {level}: Recall
        </span>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#131b2e] mb-2">Number Memory</h2>
        <p className="text-[#414755] text-lg">Retain the sequence precisely as shown.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 flex flex-col items-stretch">
          {phase === "show" && (
            <div className="bg-[#f2f3ff] rounded-xl p-12 flex flex-col items-center justify-center h-full min-h-[400px] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#d8e2ff]/20 rounded-full -mr-20 -mt-20 blur-3xl"></div>
              <div className="z-10 flex flex-col items-center">
                <div className="text-7xl md:text-9xl font-black text-[#0058bf] tracking-[0.2em] mb-12 drop-shadow-sm">
                  {number.split('').join(' ')}
                </div>
                <button onClick={handleReady} className="bg-gradient-to-r from-[#0058bf] to-[#006fef] text-[#ffffff] px-12 py-4 rounded-full font-bold text-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center gap-3">
                  <span>I'm Ready</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {phase === "input" && (
            <div className="bg-[#ffffff] rounded-xl p-8 h-full shadow-sm ring-1 ring-[#c1c6d7]/30">
              <div className="mb-8">
                <p className="text-sm font-bold text-[#414755] uppercase tracking-widest mb-4">Instruction</p>
                <h3 className="text-2xl font-bold text-[#131b2e]">Enter the number you just saw.</h3>
              </div>
              <div className="bg-[#f2f3ff] rounded-lg p-6 mb-8 min-h-[80px] flex items-center justify-center mx-auto">
                <span className="text-5xl font-mono font-bold tracking-widest text-[#0058bf]">
                  {renderInputSlots()}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button key={num} onClick={() => handleKeypad(num.toString())} className="h-20 bg-[#eaedff] text-2xl font-bold rounded-xl hover:bg-[#e2e7ff] transition-colors active:scale-90 text-[#131b2e]">
                    {num}
                  </button>
                ))}
                <button onClick={() => handleKeypad('backspace')} className="h-20 bg-[#ffdad6] text-[#ba1a1a] rounded-xl flex items-center justify-center hover:bg-[#ffdad6]/80 transition-colors">
                  <span className="material-symbols-outlined">backspace</span>
                </button>
                <button onClick={() => handleKeypad('0')} className="h-20 bg-[#eaedff] text-2xl font-bold rounded-xl hover:bg-[#e2e7ff] transition-colors active:scale-90 text-[#131b2e]">
                  0
                </button>
                <button onClick={() => handleKeypad('check')} className="h-20 bg-[#006a61] text-[#ffffff] rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity">
                  <span className="material-symbols-outlined">check</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* AI Insights / Sidebar */}
        <div className="lg:col-span-5 flex flex-col gap-8 h-full">
          <div className="bg-[#dae2fd]/60 backdrop-blur-md border border-[#c1c6d7]/20 p-8 rounded-xl relative overflow-hidden shadow-sm">
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#4b41e1]/20 blur-3xl rounded-full"></div>
            <div className="flex items-start gap-4 mb-6 relative z-10">
              <div className="p-3 bg-[#645efb] rounded-full text-white">
                <span className="material-symbols-outlined">auto_awesome</span>
              </div>
              <div>
                <h4 className="font-bold text-lg text-[#131b2e]">AI Performance Insight</h4>
                <p className="text-sm text-[#414755]">Real-time memory analysis</p>
              </div>
            </div>
            <div className="bg-white/50 p-4 rounded-lg border border-white/20 relative z-10">
              <p className="text-sm leading-relaxed italic text-[#131b2e]">"{aiInsight}"</p>
            </div>
          </div>

          <div className="bg-[#f2f3ff] p-8 rounded-xl shadow-sm">
            <h4 className="font-bold text-[#131b2e] mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006a61]">trending_up</span>
              Daily Progress
            </h4>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-gray-800">Accuracy</span>
                  <span className="text-[#006a61]">{accuracy}%</span>
                </div>
                <div className="w-full h-2 bg-[#e2e7ff] rounded-full overflow-hidden">
                  <div className="bg-[#006a61] h-full rounded-full transition-all duration-500" style={{ width: `${accuracy}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-gray-800">Focus Level</span>
                  <span className="text-[#4b41e1]">{focus}</span>
                </div>
                <div className="w-full h-2 bg-[#e2e7ff] rounded-full overflow-hidden">
                  <div className="bg-[#4b41e1] h-full w-[85%] rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-[#c1c6d7]/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#e2e7ff] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#4b41e1]">emoji_events</span>
                </div>
                <div>
                  <p className="text-xs text-[#414755] uppercase tracking-widest font-bold">Best Score</p>
                  <p className="text-lg font-bold text-[#131b2e]">{bestScore || 0} Digits</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   GAME 4: VERBAL MEMORY
   NEW / SEEN — lives (hearts) + trophy score
═══════════════════════════════════════════ */
const VERBAL_WORDS = [
  "OCEAN","CHAIR","FLAME","RIVER","STONE","MUSIC","CLOUD","TIGER","PLANT","BREAD",
  "DREAM","GLASS","LIGHT","EARTH","STORM","BRAIN","CLOCK","GRAPE","HORSE","KNIFE",
  "LEMON","METAL","PAINT","QUEEN","SCALE","TRAIN","VOICE","WHEEL","BEACH","FROST",
  "DANCE","MAPLE","PEARL","SNAKE","TABLE","WATCH","ANGEL","CORAL","FIELD","HONEY",
];

function VerbalMemoryGame({ onGameOver }) {
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [seen, setSeen] = useState(new Set());
  const [current, setCurrent] = useState("");
  const [feedback, setFeedback] = useState(null);
  const wordPool = useRef([...VERBAL_WORDS].sort(() => Math.random() - 0.5));
  const gameStart = useRef(Date.now());

  function nextWord() {
    // 40% chance to show a seen word if we have any
    if (seen.size > 0 && Math.random() < 0.4) {
      const seenArr = [...seen];
      setCurrent(seenArr[Math.floor(Math.random() * seenArr.length)]);
    } else {
      const fresh = wordPool.current.pop() || VERBAL_WORDS[Math.floor(Math.random() * VERBAL_WORDS.length)];
      setCurrent(fresh);
    }
    setFeedback(null);
  }

  useEffect(() => { nextWord(); }, []);

  function handleAnswer(answer) {
    if (feedback) return;
    const wasSeen = seen.has(current);
    const correct = (answer === "seen" && wasSeen) || (answer === "new" && !wasSeen);

    if (correct) {
      setScore(s => s + 1);
      setFeedback("correct");
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      setFeedback("wrong");
      if (newLives <= 0) {
        setTimeout(() => onGameOver({
          score, level: score, errors: MAX_LIVES, duration: Date.now() - gameStart.current,
          displayScore: `${score}`, unit: "words"
        }), 600);
        return;
      }
    }

    if (!wasSeen) setSeen(s => new Set(s).add(current));
    setTimeout(nextWord, 500);
  }

  return (
    <div>
      {/* Top bar: Trophy + Score | Lives */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏆</span>
          <span className="text-xl font-bold text-gray-900">{score}</span>
        </div>
        <LivesBar lives={lives} />
      </div>

      {/* Word card */}
      <div className="flex items-center justify-center rounded-2xl bg-white border-2 border-gray-200 shadow-sm mb-6 w-full"
           style={{
             minHeight: "45vh",
             background: feedback === "correct" ? "#dcfce7" : feedback === "wrong" ? "#fee2e2" : "#fff",
             transition: "background 0.3s"
           }}>
        <span className="text-6xl md:text-8xl font-extrabold tracking-wider text-gray-900">{current}</span>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-6 mt-4">
        <button onClick={() => handleAnswer("new")}
                className="py-10 rounded-2xl text-4xl font-bold border-4 border-blue-400 text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
          NEW
        </button>
        <button onClick={() => handleAnswer("seen")}
                className="py-10 rounded-2xl text-4xl font-bold border-4 border-indigo-400 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors">
          SEEN
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   GAME 5: CHIMP TEST
   Scattered numbered squares, click in order
═══════════════════════════════════════════ */
function ChimpTestGame({ onGameOver }) {
  const [level, setLevel] = useState(4);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [squares, setSquares] = useState([]);
  const [hidden, setHidden] = useState(false);
  const [nextClick, setNextClick] = useState(1);
  const gameStart = useRef(Date.now());

  function generateSquares(count) {
    const positions = [];
    const size = 100; // Increased square logic size
    for (let i = 0; i < count; i++) {
      let x, y, overlap;
      let attempts = 0;
      do {
        x = Math.random() * (800 - size);
        y = Math.random() * (500 - size);
        overlap = positions.some(p => Math.abs(p.x - x) < size + 10 && Math.abs(p.y - y) < size + 10);
        attempts++;
      } while (overlap && attempts < 100);
      positions.push({ x, y, num: i + 1, clicked: false });
    }
    return positions;
  }

  useEffect(() => {
    setSquares(generateSquares(level));
    setHidden(false); setNextClick(1);
  }, [level]);

  function handleSquareClick(num) {
    if (num !== nextClick) {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        onGameOver({ score, level, errors: 3, duration: Date.now() - gameStart.current,
                     displayScore: `Level ${level}`, unit: "level reached" });
      } else {
        setSquares(generateSquares(level)); setHidden(false); setNextClick(1);
      }
      return;
    }

    if (num === 1) setHidden(true);
    setSquares(sq => sq.map(s => s.num === num ? { ...s, clicked: true } : s));
    const next = nextClick + 1;
    setNextClick(next);

    if (next > level) {
      setScore(s => s + level);
      setTimeout(() => {
        setLevel(l => l + 1);
      }, 400);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-sm font-semibold text-gray-500">Numbers: {level}</span>
        <LivesBar lives={lives} max={3} />
      </div>
      <div className="relative bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden w-full mx-auto"
           style={{ height: "65vh", minHeight: 600, maxWidth: "100%" }}>
        {squares.map(sq => !sq.clicked && (
          <div key={sq.num}
               onClick={() => handleSquareClick(sq.num)}
               className="absolute flex items-center justify-center text-white font-bold text-3xl rounded-xl cursor-pointer select-none transition-transform hover:scale-105 cg-number-pop"
               style={{
                 left: sq.x, top: sq.y, width: 80, height: 80,
                 background: "linear-gradient(135deg, #60a5fa, #6366f1)",
                 boxShadow: "0 3px 10px rgba(99,102,241,0.3)",
               }}>
            {hidden ? "" : sq.num}
          </div>
        ))}
      </div>
    </div>
  );
}



/* ═══════════════════════════════════════════
   GAME ACTIVITY DIALOG
═══════════════════════════════════════════ */
function GameActivityDialog({ onClose }) {
  const [todayData, setTodayData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiGet("/game-scores/today").catch(() => null),
      apiGet("/game-scores/summary").catch(() => null),
    ]).then(([t, s]) => { setTodayData(t); setSummary(s); setLoading(false); });
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-5">
      <div className="cg-modal-enter cg-game-card max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">📊 Game Activity</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl bg-transparent border-none cursor-pointer">✕</button>
        </div>

        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="cg-skeleton h-16" />)}</div>
        ) : (
          <div className="space-y-3">
            {ALL_GAMES.map(game => {
              const testType = GAME_TO_SCORE_ID[game.id];
              const today = todayData?.[testType];
              const sum = summary?.[testType];
              const localBest = getBestToday(game.id);

              return (
                <div key={game.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2.5 px-4 py-3 bg-gray-50" style={{ borderLeft: `4px solid ${game.iconColor}` }}>
                    <span className="text-lg">{game.icon}</span>
                    <span className="text-sm font-semibold text-gray-800">{game.title}</span>
                    {(today || localBest) ? (
                      <span className="ml-auto text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Played ✓</span>
                    ) : (
                      <span className="ml-auto text-xs text-gray-400">Not played</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-gray-100">
                    <div className="p-3">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Today</div>
                      {today || localBest ? (
                        <div className="space-y-0.5 text-xs text-gray-600">
                          <div>Score: <strong className="text-indigo-600">{today?.score ?? localBest?.score ?? 0}</strong></div>
                          <div>Errors: <strong className="text-red-500">{today?.errors ?? localBest?.errors ?? 0}</strong></div>
                        </div>
                      ) : <span className="text-xs text-gray-300">—</span>}
                    </div>
                    <div className="p-3">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Lifetime</div>
                      {sum?.totalSessions > 0 ? (
                        <div className="space-y-0.5 text-xs text-gray-600">
                          <div>Sessions: <strong>{sum.totalSessions}</strong></div>
                          <div>Best: <strong className="text-indigo-600">{sum.bestScore}</strong></div>
                        </div>
                      ) : <span className="text-xs text-gray-300">No data</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   HOME GRID — game cards
═══════════════════════════════════════════ */
function HomeGrid({ games, onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {games.map(game => {
        const best = getBestToday(game.id);
        return (
          <div key={game.id} className="cg-home-card" onClick={() => onSelect(game.id)}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold mb-5"
                 style={{ background: game.iconBg, color: game.iconColor }}>
              {game.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1.5">{game.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{game.desc}</p>
            {best && (
              <div className="text-xs font-semibold text-indigo-600 bg-indigo-50 inline-block px-2.5 py-1 rounded-full">
                Today: {best.score} pts
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════
   REPORT DASHBOARD
═══════════════════════════════════════════ */
function ReportDashboard({ onShowActivity }) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    apiGet("/game-scores/summary").catch(() => null)
      .then(s => { setSummary(s); setLoading(false); });
  }, []);

  const localTrend = getLast7Days("reaction");
  const allStats = summary ? Object.values(summary) : [];
  const totalSessions = allStats.reduce((a, g) => a + (g.totalSessions || 0), 0);
  const bestScore = allStats.reduce((a, g) => Math.max(a, g.bestScore || 0), 0);

  return (
    <div className="mt-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">Performance</h2>
        <button onClick={onShowActivity}
                className="cg-gradient-btn !w-auto !py-2.5 !px-5 !text-sm">
          📊 Game Activity
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Sessions", value: loading ? "–" : totalSessions },
          { label: "Best Score", value: loading ? "–" : bestScore },
          { label: "Games Available", value: ALL_GAMES.length },
        ].map((c, i) => (
          <div key={i} className="cg-home-card !p-5 text-center !cursor-default">
            <div className="text-2xl font-extrabold text-indigo-600">{c.value}</div>
            <div className="text-xs text-gray-400 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="cg-home-card !cursor-default mb-6">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Score Trend (last 7 days)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={localTrend}>
            <CartesianGrid stroke="rgba(0,0,0,0.04)" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} />
            <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
            <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 12 }} />
            <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: "#6366f1" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN GAMES PAGE
═══════════════════════════════════════════ */
export default function GamesPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!document.getElementById("cg-games-css")) {
      const s = document.createElement("style");
      s.id = "cg-games-css"; s.textContent = GAME_STYLES;
      document.head.appendChild(s);
    }
  }, []);

  const userAge = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}").age || null; } catch { return null; }
  })();

  const [activeGame, setActiveGame] = useState(null);
  const [phase, setPhase] = useState("home"); // home, start, playing, result
  const [result, setResult] = useState(null);
  const [showActivity, setShowActivity] = useState(false);

  const gameMeta = ALL_GAMES.find(g => g.id === activeGame);

  function selectGame(id) { setActiveGame(id); setPhase("start"); setResult(null); }
  function startPlaying() { setPhase("playing"); }
  function handleGameOver(res) { setResult(res); setPhase("result"); }
  function playAgain() { setPhase("start"); setResult(null); }
  function goHome() { setActiveGame(null); setPhase("home"); setResult(null); }

  function playNext() {
    const gameIndex = ALL_GAMES.findIndex(g => g.id === activeGame);
    const nextGame = ALL_GAMES[gameIndex + 1];
    if (nextGame) {
      setActiveGame(nextGame.id);
      setPhase("start");
      setResult(null);
    } else {
      goHome();
    }
  }

  const GameComponents = {
    reaction: ReactionTimeGame,
    number: NumberMemoryGame, verbal: VerbalMemoryGame,
    chimp: ChimpTestGame, target: TargetPracticeGame,
  };
  const ActiveComponent = activeGame ? GameComponents[activeGame] : null;

  return (
    <div className="cg-game-page flex-1 w-full">
      {showActivity && <GameActivityDialog onClose={() => setShowActivity(false)} />}

      {phase === "home" && (
        <div className="flex-grow max-w-screen-2xl mx-auto w-full pb-8">
          {/* Hero Header Section */}
          <section className="mb-12 relative overflow-hidden rounded-xl p-8 lg:p-12 bg-gradient-to-br from-[#0058bf] to-[#006fef] text-white">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">Neuralis Training</h2>
              <p className="text-lg opacity-90 font-light leading-relaxed mb-8">
                Our clinically validated cognitive exercises are designed to sharpen pattern recognition, memory retention, and processing speed.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button onClick={() => selectGame('number')} className="bg-white text-[#0058bf] px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined">play_arrow</span>
                  Daily Drill
                </button>
                <button onClick={() => navigate('/reports')} className="bg-transparent border border-white/30 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-all">
                  View Progress
                </button>
              </div>
            </div>
            {/* Abstract visual element */}
            <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 pointer-events-none hidden md:block">
              <img alt="Neural Pattern" className="object-cover h-full w-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1YZCc5X44dQ7kbsIi7pvVkHQWaPr6M_oOWceeDL3aEXVJHFgOzd4iyeA89cOYFMtPq8KHBL996SLuRtCMX4VK_OFvyIajm3xBJvXJIM4tZdw_7k5mEQ0BGCWNuIcz_Y3X1sXGBuIZjCJhnC-gSLk3e3YHWvkia3ddJ3SHGj9916btxSdQxDoKlNp2TOSGnIw6eodneDlNGy3ikV_N7bxjje3D52Rn9PiXqUGjbKzc69tJJS_8PTvEgaMPNnKGYQ3WZPhJa2Yy3mI"/>
            </div>
          </section>

          {/* Grid of Game Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {/* Game 1: Pattern Recognition */}
            <div className="bg-white/60 backdrop-blur-xl border border-[#c1c6d7]/20 p-8 rounded-lg flex flex-col group hover:shadow-xl transition-all duration-500 cursor-pointer" onClick={() => selectGame('chimp')}>
              <div className="w-14 h-14 rounded-2xl bg-[#006fef]/10 flex items-center justify-center text-[#006fef] mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">grid_view</span>
              </div>
              <div className="mb-auto">
                <h3 className="text-xl font-bold mb-2 text-[#131b2e]">Pattern Recognition</h3>
                <div className="inline-flex px-3 py-1 bg-[#86f2e4] text-[#006f66] text-[10px] uppercase font-bold tracking-wider rounded-full mb-4">
                  Visual-Spatial
                </div>
                <p className="text-[#414755] text-sm leading-relaxed mb-6">
                  Analyze complex visual sequences and predict the next logical iteration to strengthen your perceptual reasoning.
                </p>
              </div>
              <button className="w-full py-4 bg-[#0058bf] text-white rounded-full font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform">
                Start Game
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            {/* Game 2: Target Practice */}
            <div className="bg-white/60 backdrop-blur-xl border border-[#c1c6d7]/20 p-8 rounded-lg flex flex-col group hover:shadow-xl transition-all duration-500 cursor-pointer" onClick={() => selectGame('target')}>
              <div className="w-14 h-14 rounded-2xl bg-[#dc2626]/10 flex items-center justify-center text-[#dc2626] mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">track_changes</span>
              </div>
              <div className="mb-auto">
                <h3 className="text-xl font-bold mb-2 text-[#131b2e]">Target Practice</h3>
                <div className="inline-flex px-3 py-1 bg-[#fee2e2] text-[#dc2626] text-[10px] uppercase font-bold tracking-wider rounded-full mb-4">
                  Visual-Motor Speed
                </div>
                <p className="text-[#414755] text-sm leading-relaxed mb-6">
                  Click the red target as quickly as possible in 15 rounds. Test your visual processing speed and hand-eye coordination.
                </p>
              </div>
              <button className="w-full py-4 bg-[#fee2e2] text-[#dc2626] rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-[#dc2626] hover:text-white transition-all active:scale-95">
                Start Game
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            {/* Game 3: Number Memory */}
            <div className="bg-white/60 backdrop-blur-xl border border-[#c1c6d7]/20 p-8 rounded-lg flex flex-col group hover:shadow-xl transition-all duration-500 cursor-pointer" onClick={() => selectGame('number')}>
              <div className="w-14 h-14 rounded-2xl bg-[#006a61]/10 flex items-center justify-center text-[#006a61] mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">123</span>
              </div>
              <div className="mb-auto">
                <h3 className="text-xl font-bold mb-2 text-[#131b2e]">Number Memory</h3>
                <div className="inline-flex px-3 py-1 bg-[#86f2e4] text-[#006f66] text-[10px] uppercase font-bold tracking-wider rounded-full mb-4">
                  Executive Function
                </div>
                <p className="text-[#414755] text-sm leading-relaxed mb-6">
                  Recall long strings of digits with precision. A classic diagnostic for measuring information processing span.
                </p>
              </div>
              <button className="w-full py-4 bg-[#dae2fd] text-[#0058bf] rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-[#0058bf] hover:text-white transition-all active:scale-95">
                Start Game
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            {/* Game 4: Verbal Memory */}
            <div className="bg-white/60 backdrop-blur-xl border border-[#c1c6d7]/20 p-8 rounded-lg flex flex-col group hover:shadow-xl transition-all duration-500 cursor-pointer" onClick={() => selectGame('verbal')}>
              <div className="w-14 h-14 rounded-2xl bg-[#0058bf]/10 flex items-center justify-center text-[#0058bf] mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">spellcheck</span>
              </div>
              <div className="mb-auto">
                <h3 className="text-xl font-bold mb-2 text-[#131b2e]">Verbal Memory</h3>
                <div className="inline-flex px-3 py-1 bg-[#dae2fd] text-[#0058bf] text-[10px] uppercase font-bold tracking-wider rounded-full mb-4">
                  Linguistic Center
                </div>
                <p className="text-[#414755] text-sm leading-relaxed mb-6">
                  Test your ability to distinguish between seen and new words in a rapidly scrolling list. Improves semantic recognition.
                </p>
              </div>
              <button className="w-full py-4 bg-[#dae2fd] text-[#0058bf] rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-[#0058bf] hover:text-white transition-all active:scale-95">
                Start Game
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            {/* Game 5: Reaction Time */}
            {/* <div className="bg-white/60 backdrop-blur-xl border border-[#c1c6d7]/20 p-8 rounded-lg flex flex-col group hover:shadow-xl transition-all duration-500 cursor-pointer" onClick={() => selectGame('reaction')}>
              <div className="w-14 h-14 rounded-2xl bg-[#645efb]/10 flex items-center justify-center text-[#645efb] mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">bolt</span>
              </div>
              <div className="mb-auto">
                <h3 className="text-xl font-bold mb-2 text-[#131b2e]">Neuro-Reflex Test</h3>
                <div className="inline-flex px-3 py-1 bg-[#86f2e4] text-[#006f66] text-[10px] uppercase font-bold tracking-wider rounded-full mb-4">
                  Processing Speed
                </div>
                <p className="text-[#414755] text-sm leading-relaxed mb-6">
                  Click as fast as possible when visual cues change. Vital for monitoring neuro-motor response efficiency.
                </p>
              </div>
              <button className="w-full py-4 bg-[#dae2fd] text-[#0058bf] rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-[#0058bf] hover:text-white transition-all active:scale-95">
                Start Game
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div> */}

            {/* Custom Bento Card: AI Insights */}
            <div className="bg-[#e2dfff] border border-[#c1c6d7]/20 p-8 rounded-lg flex flex-col justify-between overflow-hidden relative shadow-sm">
              <div className="relative z-10">
                <span className="material-symbols-outlined text-[#4b41e1] mb-4">auto_awesome</span>
                <h3 className="text-xl font-bold text-[#0f0069] mb-2">Personalized Path</h3>
                <p className="text-[#3323cc] text-sm">Your performance in <span className="font-bold">Verbal Memory</span> is in the top 5% of users today. Try the Daily Drill to maintain your streak.</p>
              </div>
              <div className="mt-8 relative z-10">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-[#89f5e7] border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-[#d8e2ff] border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-[#c3c0ff] border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-[#dae2fd] border-2 border-white flex items-center justify-center text-[10px] font-bold text-[#0058bf]">+12</div>
                </div>
                <p className="text-[10px] text-[#3323cc] mt-2 opacity-70">Clinicians monitoring this session</p>
              </div>
              <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-[#0058bf]/10 rounded-full blur-3xl"></div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
              <p>© 2024 Manasveda • Medical Grade Cognitive Diagnostics</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a className="hover:text-[#0058bf] transition-colors" href="#">Privacy Protocol</a>
                <a className="hover:text-[#0058bf] transition-colors" href="#">Clinical Standards</a>
                <a className="hover:text-[#0058bf] transition-colors" href="#">Support</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === "start" && gameMeta && (
        <div className="w-full max-w-screen-2xl mx-auto px-4 lg:px-8">
          <button onClick={goHome} className="text-gray-400 text-sm mb-5 hover:text-indigo-600 transition-colors bg-transparent border-none cursor-pointer">
            ← Back to Games
          </button>
          <GameStartScreen game={gameMeta} onStart={startPlaying} />
        </div>
      )}

      {phase === "playing" && gameMeta && ActiveComponent && (
        <div className="w-full max-w-screen-2xl mx-auto px-4 lg:px-8">
          <button onClick={goHome} className="text-gray-400 text-sm mb-4 hover:text-indigo-600 transition-colors bg-transparent border-none cursor-pointer">
            ← Quit
          </button>
          <div className={activeGame === "number" ? "mt-4" : "cg-game-card"}>
            <ActiveComponent key={activeGame} age={userAge} onGameOver={handleGameOver} />
          </div>
        </div>
      )}

      {phase === "result" && gameMeta && result && (
        <div className="w-full max-w-screen-2xl mx-auto px-4 lg:px-8">
          <ResultScreen game={gameMeta} result={result} onPlayAgain={playAgain} onGoBack={goHome} onNext={playNext} />
        </div>
      )}
    </div>
  );
}
