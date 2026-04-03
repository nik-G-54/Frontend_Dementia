// ============================================================
// CogGuard — Games.jsx
// Cognitive games matching HumanCognition.io design + flow.
// 6 games: Reaction Time, Sequence Memory, Number Memory,
//          Verbal Memory, Chimp Test, Target Practice
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";

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
  reaction: "reaction", sequence: "sequence", number: "number",
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
  { id: "target",   title: "Target Practice",  icon: "◎",  iconBg: "#fee2e2", iconColor: "#dc2626", desc: "Click the red target as quickly as possible in 15 rounds. Test your visual processing speed and hand-eye coordination." },
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

  const bgColors = { idle: "#f0f4f8", waiting: "#dc2626", ready: "#16a34a", tooearly: "#dc2626", result: "#3b82f6" };
  const texts = {
    idle: { main: "Click to Start", sub: "When you see green, click as fast as you can" },
    waiting: { main: "Wait...", sub: "Wait for green" },
    ready: { main: "Click!", sub: "Click as fast as you can!" },
    tooearly: { main: "Too Early!", sub: "Click to try again" },
    result: { main: `${times[times.length - 1]}ms`, sub: `Round ${round - 1} of ${TOTAL_ROUNDS}` },
  };

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-sm font-semibold text-gray-500">Round {Math.max(1, round)} of {TOTAL_ROUNDS}</span>
        <LivesBar lives={lives} max={MAX_LIVES} />
      </div>
      <div onClick={handleClick}
           className="rounded-2xl flex items-center justify-center flex-col cursor-pointer select-none transition-colors duration-300 w-full"
           style={{ background: bgColors[phase], minHeight: "65vh", color: phase === "idle" ? "#374151" : "#fff" }}>
        <div className="text-6xl md:text-8xl font-extrabold mb-6">{texts[phase].main}</div>
        <div className="text-2xl mt-4 opacity-80">{texts[phase].sub}</div>
        {times.length > 0 && phase !== "result" && (
          <div className="mt-4 flex gap-2 flex-wrap justify-center">
            {times.map((ms, i) => (
              <span key={i} className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">{ms}ms</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   GAME 2: SEQUENCE MEMORY
   3×3 grid, tiles flash, repeat sequence
═══════════════════════════════════════════ */
function SequenceMemoryGame({ onGameOver }) {
  const [tiles, setTiles] = useState(Array(9).fill("idle"));
  const [phase, setPhase] = useState("watch"); // watch, input
  const [sequence, setSequence] = useState([]);
  const [userSeq, setUserSeq] = useState([]);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [errors, setErrors] = useState(0);
  const timerRef = useRef(null);
  const gameStart = useRef(Date.now());

  function playSequence(seq) {
    setPhase("watch"); setUserSeq([]);
    let i = 0;
    function next() {
      if (i > 0) setTiles(t => { const n = [...t]; n[seq[i - 1]] = "idle"; return n; });
      if (i >= seq.length) { setTimeout(() => setPhase("input"), 300); return; }
      setTiles(t => { const n = [...t]; n[seq[i]] = "active"; return n; });
      i++;
      timerRef.current = setTimeout(next, 600);
    }
    timerRef.current = setTimeout(next, 500);
  }

  useEffect(() => {
    const first = [Math.floor(Math.random() * 9)];
    setSequence(first);
    playSequence(first);
    return () => clearTimeout(timerRef.current);
  }, []);

  function handleTile(idx) {
    if (phase !== "input") return;
    const expected = sequence[userSeq.length];
    if (idx === expected) {
      setTiles(t => { const n = [...t]; n[idx] = "correct"; return n; });
      setTimeout(() => setTiles(t => { const n = [...t]; n[idx] = "idle"; return n; }), 250);
      const next = [...userSeq, idx];
      setUserSeq(next);
      if (next.length === sequence.length) {
        const newScore = score + level;
        setScore(newScore);
        const newLevel = level + 1;
        setLevel(newLevel);
        const newSeq = [...sequence, Math.floor(Math.random() * 9)];
        setSequence(newSeq);
        setTimeout(() => playSequence(newSeq), 500);
      }
    } else {
      setTiles(t => { const n = [...t]; n[idx] = "wrong"; return n; });
      const newLives = lives - 1;
      setLives(newLives);
      const newErrors = errors + 1;
      setErrors(newErrors);

      if (newLives <= 0) {
        setTimeout(() => {
          onGameOver({ score, level, errors: newErrors, duration: Date.now() - gameStart.current });
        }, 500);
      } else {
        setTimeout(() => {
          playSequence(sequence);
        }, 1000);
      }
    }
  }

  const tileStyle = (state) => ({
    background: state === "active" ? "linear-gradient(135deg, #60a5fa, #6366f1)"
              : state === "correct" ? "#22c55e"
              : state === "wrong" ? "#ef4444"
              : "#fff",
    border: state === "idle" ? "2px solid #c7d2e0" : "2px solid transparent",
    borderRadius: 14,
    cursor: phase === "input" ? "pointer" : "default",
    transition: "all 0.15s",
    boxShadow: state === "active" ? "0 4px 16px rgba(99,102,241,0.4)" : "none",
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <span className="text-sm font-semibold text-gray-500">Level {level}</span>
          <span className="text-xs text-gray-400 ml-3">{phase === "watch" ? "Watch carefully..." : "Your turn!"}</span>
        </div>
        <LivesBar lives={lives} max={MAX_LIVES} />
      </div>
      <div className="grid grid-cols-3 gap-6 max-w-[650px] w-full mx-auto aspect-square">
        {tiles.map((state, i) => (
          <div key={i} onClick={() => handleTile(i)}
               className="aspect-square rounded-xl"
               style={tileStyle(state)} />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   GAME 3: NUMBER MEMORY
   Show number → timer bar → type it back
═══════════════════════════════════════════ */
function NumberMemoryGame({ onGameOver }) {
  const [phase, setPhase] = useState("show"); // show, input, correct, wrong
  const [digits, setDigits] = useState(3);
  const [number, setNumber] = useState("");
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [progress, setProgress] = useState(100);
  const [lives, setLives] = useState(MAX_LIVES);
  const [errors, setErrors] = useState(0);
  const timerRef = useRef(null);
  const gameStart = useRef(Date.now());

  function genNumber(len) {
    let n = String(Math.floor(Math.random() * 9) + 1);
    while (n.length < len) n += String(Math.floor(Math.random() * 10));
    return n;
  }

  function startRound(d) {
    const n = genNumber(d);
    setNumber(n); setInput(""); setPhase("show"); setProgress(100);
    const totalMs = 1200 + d * 400;
    const step = 50;
    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed += step;
      setProgress(Math.max(0, 100 - (elapsed / totalMs) * 100));
      if (elapsed >= totalMs) {
        clearInterval(timerRef.current);
        setPhase("input");
      }
    }, step);
  }

  useEffect(() => { startRound(3); return () => clearInterval(timerRef.current); }, []);

  function handleSubmit() {
    if (!input) return;
    if (input === number) {
      setPhase("correct"); setScore(s => s + digits);
      const nextD = digits + 1; setDigits(nextD); setLevel(l => l + 1);
      setTimeout(() => startRound(nextD), 900);
    } else {
      setPhase("wrong");
      const newLives = lives - 1;
      setLives(newLives);
      const newErrors = errors + 1;
      setErrors(newErrors);

      if (newLives <= 0) {
        setTimeout(() => {
          onGameOver({ score, level, errors: newErrors, displayScore: `Level ${level}`, unit: "level reached", duration: Date.now() - gameStart.current });
        }, 1200);
      } else {
        setTimeout(() => {
          startRound(digits);
        }, 1500);
      }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-sm font-semibold text-gray-500">Level {level}</span>
        <LivesBar lives={lives} max={MAX_LIVES} />
      </div>
      {phase === "show" && (
        <div className="text-center">
          <div className="text-xs text-gray-400 mb-1">Memorize this number</div>
          <div className="text-7xl md:text-9xl font-extrabold text-gray-900 cg-number-pop tracking-widest my-14 h-[25vh] flex items-center justify-center font-mono">{number}</div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden max-w-2xl mx-auto">
            <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-50"
                 style={{ width: `${progress}%` }} />
          </div>
          <div className="text-xs text-gray-400 mt-2">{digits} digits</div>
        </div>
      )}

      {(phase === "input" || phase === "correct" || phase === "wrong") && (
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 mb-1">Enter the number</div>
          <div className="text-sm text-gray-400 mb-4">{digits} digits</div>
          <input type="number" autoFocus value={input}
                 onChange={e => setInput(e.target.value)}
                 onKeyDown={e => e.key === "Enter" && handleSubmit()}
                 className="w-full max-w-2xl mx-auto block border-4 border-blue-300 rounded-2xl px-6 py-5 text-4xl text-gray-900 font-mono text-center outline-none focus:border-indigo-500 transition-colors mb-6"
                 style={{ background: phase === "correct" ? "#dcfce7" : phase === "wrong" ? "#fee2e2" : "#fff" }} />
          {phase === "input" && (
            <button className="cg-gradient-btn max-w-sm mx-auto block" onClick={handleSubmit}>Submit</button>
          )}
          {phase === "correct" && <div className="text-green-600 font-bold text-lg">✓ Correct!</div>}
          {phase === "wrong" && (
            <div>
              <div className="text-red-500 font-bold text-lg mb-1">✗ Incorrect</div>
              <div className="text-sm text-gray-500">The number was <strong className="text-gray-800">{number}</strong></div>
            </div>
          )}
        </div>
      )}
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
           style={{ height: "60vh", minHeight: 500, maxWidth: 900 }}>
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
   GAME 6: TARGET PRACTICE
   Navy bg, click red targets, 15 rounds
═══════════════════════════════════════════ */
function TargetPracticeGame({ onGameOver }) {
  const TOTAL = 15;
  const [round, setRound] = useState(1);
  const [target, setTarget] = useState(null);
  const [times, setTimes] = useState([]);
  const startRef = useRef(null);
  const gameStart = useRef(Date.now());
  const areaRef = useRef(null);

  function placeTarget() {
    const x = 50 + Math.random() * 800; // scaled for larger width
    const y = 50 + Math.random() * 400; // scaled for larger height
    setTarget({ x, y });
    startRef.current = Date.now();
  }

  useEffect(() => { placeTarget(); }, []);

  function handleTargetClick(e) {
    e.stopPropagation();
    const ms = Date.now() - startRef.current;
    const next = [...times, ms];
    setTimes(next);
    const r = round + 1;
    setRound(r);
    if (r > TOTAL) {
      const avg = Math.round(next.reduce((a, b) => a + b, 0) / next.length);
      onGameOver({
        score: Math.max(0, Math.round((800 - avg) / 40)),
        displayScore: `${avg}ms`, unit: "average time",
        level: TOTAL, errors: 0, reactionTime: avg,
        duration: Date.now() - gameStart.current
      });
    } else {
      placeTarget();
    }
  }

  return (
    <div>
      <div className="text-center text-sm font-semibold text-gray-300 mb-3">Round {round} / {TOTAL}</div>
      <div ref={areaRef}
           className="relative rounded-2xl overflow-hidden shadow-inner"
           style={{ background: "#0f172a", width: "100%", height: "60vh", minHeight: 500, maxWidth: 1000, margin: "0 auto" }}>
        {target && (
          <div onClick={handleTargetClick}
               className="absolute cursor-pointer"
               style={{
                 left: target.x - 50, top: target.y - 50,
                 width: 100, height: 100, borderRadius: "50%",
                 background: "radial-gradient(circle at 40% 38%, #f87171, #dc2626)",
                 boxShadow: "0 0 24px rgba(220,38,38,0.5)",
                 display: "flex", alignItems: "center", justifyContent: "center",
               }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff" }} />
          </div>
        )}
      </div>
      {times.length > 0 && (
        <div className="text-center mt-3 text-sm text-gray-500">
          Last: <strong className="text-gray-700">{times[times.length - 1]}ms</strong>
          {times.length >= 2 && <span className="ml-3">Avg: <strong className="text-indigo-600">{Math.round(times.reduce((a, b) => a + b, 0) / times.length)}ms</strong></span>}
        </div>
      )}
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
    reaction: ReactionTimeGame, sequence: SequenceMemoryGame,
    number: NumberMemoryGame, verbal: VerbalMemoryGame,
    chimp: ChimpTestGame, target: TargetPracticeGame,
  };
  const ActiveComponent = activeGame ? GameComponents[activeGame] : null;

  return (
    <div className="cg-game-page">
      {showActivity && <GameActivityDialog onClose={() => setShowActivity(false)} />}

      {phase === "home" && (
        <div className="w-full max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Test your cognitive limits</h1>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">
              Your brain is capable of amazing things — CogGuard offers free, fun tests to measure and improve your cognitive performance
            </p>
          </div>
          <HomeGrid games={ALL_GAMES} onSelect={selectGame} />
          <ReportDashboard onShowActivity={() => setShowActivity(true)} />
        </div>
      )}

      {phase === "start" && gameMeta && (
        <div className="w-full max-w-5xl mx-auto px-4">
          <button onClick={goHome} className="text-gray-400 text-sm mb-5 hover:text-indigo-600 transition-colors bg-transparent border-none cursor-pointer">
            ← Back to Games
          </button>
          <GameStartScreen game={gameMeta} onStart={startPlaying} />
        </div>
      )}

      {phase === "playing" && gameMeta && ActiveComponent && (
        <div className="w-full max-w-5xl mx-auto px-4">
          <button onClick={goHome} className="text-gray-400 text-sm mb-4 hover:text-indigo-600 transition-colors bg-transparent border-none cursor-pointer">
            ← Quit
          </button>
          <div className="cg-game-card">
            <ActiveComponent key={activeGame} age={userAge} onGameOver={handleGameOver} />
          </div>
        </div>
      )}

      {phase === "result" && gameMeta && result && (
        <div className="w-full max-w-5xl mx-auto px-4">
          <ResultScreen game={gameMeta} result={result} onPlayAgain={playAgain} onGoBack={goHome} onNext={playNext} />
        </div>
      )}
    </div>
  );
}
