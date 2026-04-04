import React, { useState, useEffect, useRef } from "react";
import api from "../../api/axiosInstance";

export default function SequenceMemoryGame({ age, onGameOver }) {
  const MAX_LIVES = 3;
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

  // AI & Extra data mapped similarly to Number Memory
  const [aiInsight, setAiInsight] = useState("Focus on the center tile. Your prefrontal cortex is showing high engagement today!");

  useEffect(() => {
    // Attempt to fetch ML insight if available (just reusing dashboard insight)
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
        api.get("/dashboard").then(res => {
            if(res && res.data && res.data.aiSummary) {
                setAiInsight(res.data.aiSummary);
            }
        }).catch(()=>{});
    }

    const first = [Math.floor(Math.random() * 9)];
    setSequence(first);
    playSequence(first);
    return () => clearTimeout(timerRef.current);
  }, []);

  function playSequence(seq) {
    setPhase("watch");
    setUserSeq([]);
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
          onGameOver({ score, level, errors: newErrors, duration: Date.now() - gameStart.current, displayScore: `Level ${level}`, unit: "level reached" });
        }, 500);
      } else {
        setTimeout(() => {
          setTiles(t => { const n = [...t]; n[idx] = "idle"; return n; });
          playSequence(sequence);
        }, 1000);
      }
    }
  }

  function getTileClass(state) {
    if (state === "active") {
        return "w-32 h-32 md:w-36 md:h-36 rounded-lg bg-gradient-to-br from-[#0058bf] to-[#006fef] shadow-[0px_0px_30px_rgba(0,88,191,0.4)] flex items-center justify-center transform scale-105 border-0 transition-all duration-300 group ring-4 ring-[#d8e2ff]";
    } else if (state === "correct") {
        return "w-32 h-32 md:w-36 md:h-36 rounded-lg bg-[#86f2e4] border border-[#006f66] flex items-center justify-center transform scale-105 transition-all duration-300";
    } else if (state === "wrong") {
        return "w-32 h-32 md:w-36 md:h-36 rounded-lg bg-[#ffdad6] border border-[#ba1a1a] flex items-center justify-center transform scale-95 transition-all duration-300 animate-shake";
    }
    // Idle
    return "w-32 h-32 md:w-36 md:h-36 rounded-lg bg-[#f2f3ff] border border-[#c1c6d7]/20 flex items-center justify-center transition-all duration-300 hover:bg-[#e2e7ff] active:scale-95 group cursor-pointer";
  }

  function getInnerCircle(state) {
      if (state === "active") return "w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm animate-pulse";
      if (state === "correct") return "w-12 h-12 rounded-full bg-[#006f66]/30";
      if (state === "wrong") return "w-12 h-12 rounded-full bg-[#ba1a1a]/30";
      return "w-12 h-12 rounded-full bg-[#c1c6d7]/30 group-hover:bg-[#c1c6d7]/50 transition-colors";
  }

  return (
    <div className="w-full flex flex-col items-center justify-center max-w-7xl mx-auto py-8">
      
      {/* Game Header Section */}
      <div className="w-full max-w-4xl mb-12 text-center relative">
        {/* Asymmetric AI Insight Card */}
        <div className="absolute -top-16 -right-8 bg-[#dae2fd]/60 backdrop-blur-md border border-[#c1c6d7]/20 p-6 rounded-lg max-w-[240px] hidden lg:block transform rotate-2">
            <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-[#4b41e1]" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                <span className="text-xs font-bold uppercase tracking-widest text-[#414755]">AI Coach</span>
            </div>
            <p className="text-sm text-[#131b2e] leading-relaxed">{aiInsight}</p>
            <div className="mt-4 w-full h-1 bg-[#e2e7ff] rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-[#4b41e1]"></div>
            </div>
        </div>
        
        <h1 className="text-5xl font-extrabold tracking-tighter text-[#131b2e] mb-4">Memory Sequence</h1>
        <p className="text-xl text-[#414755] max-w-xl mx-auto">Observe the sequence of light and repeat the pattern precisely.</p>
      </div>

      {/* Instruction & Progress Container */}
      <div className="w-full max-w-lg mb-8 flex flex-col items-center gap-6">
        <div className="bg-[#f2f3ff] px-8 py-3 rounded-full flex items-center gap-4">
            <span className="text-sm font-bold text-[#0058bf] uppercase tracking-wider">Level {level}</span>
            <div className="flex gap-1">
                {Array.from({ length: Math.min(10, level) }).map((_, idx) => (
                    <div key={idx} className={`w-2 h-2 rounded-full ${idx === level - 1 ? 'bg-[#0058bf] animate-pulse' : 'bg-[#0058bf]'}`}></div>
                ))}
            </div>
            <div className="h-6 w-[1px] bg-[#c1c6d7] mx-2"></div>
            <span className="text-sm font-bold text-[#ba1a1a] uppercase tracking-wider">Lives: {lives}</span>
        </div>
        <div className="text-2xl font-semibold text-[#131b2e] flex items-center gap-3 h-10">
            {phase === "watch" ? (
                <>
                    <span className="material-symbols-outlined text-[#0058bf] text-3xl">visibility</span>
                    Observe the sequence.
                </>
            ) : (
                <>
                    <span className="material-symbols-outlined text-[#006f66] text-3xl">touch_app</span>
                    Your turn. Repeat it.
                    <span className="text-lg text-[#414755] ml-2">({userSeq.length} / {sequence.length})</span>
                </>
            )}
        </div>
      </div>

      {/* The Memory Grid */}
      <section className="relative">
        {/* Background Decorative Glow */}
        <div className="absolute -inset-20 bg-[#0058bf]/5 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
        <div className="grid grid-cols-3 gap-4 md:gap-6 p-6 md:p-8 bg-[#ffffff] rounded-xl shadow-[0px_20px_40px_rgba(19,27,46,0.06)] border border-[#c1c6d7]/20">
            {tiles.map((state, i) => (
                <button 
                  key={i} 
                  onClick={() => handleTile(i)}
                  className={getTileClass(state)}
                  disabled={phase !== "input"}
                >
                    <div className={getInnerCircle(state)}></div>
                </button>
            ))}
        </div>
      </section>

      {/* Session Controls / Footer */}
      <div className="mt-16 w-full max-w-2xl flex flex-col md:flex-row items-center justify-between gap-8 opacity-60 pointer-events-none">
        <div className="flex items-center gap-6 p-4 bg-[#e2e7ff]/50 rounded-lg">
            <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-[#414755] uppercase tracking-widest">Difficulty</span>
                <span className="text-lg font-semibold text-[#131b2e]">Level {level}</span>
            </div>
            <div className="h-10 w-[1px] bg-[#c1c6d7]"></div>
            <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-[#414755] uppercase tracking-widest">Speed</span>
                <span className="text-lg font-semibold text-[#131b2e]">0.6s</span>
            </div>
        </div>
      </div>
      
    </div>
  );
}
