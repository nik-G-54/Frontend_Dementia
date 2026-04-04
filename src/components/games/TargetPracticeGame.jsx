import React, { useState, useEffect, useRef } from "react";
import api from "../../api/axiosInstance";

export default function TargetPracticeGame({ onGameOver }) {
  const TOTAL = 15;
  const [round, setRound] = useState(1);
  const [target, setTarget] = useState(null);
  const [times, setTimes] = useState([]);
  const [toast, setToast] = useState(null);
  
  const startRef = useRef(null);
  const gameStart = useRef(Date.now());
  const [aiInsight, setAiInsight] = useState("Response time is consistent. Focus remains stable.");

  useEffect(() => {
    // Try to fetch AI insight
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
        api.get("/dashboard").then(res => {
            if(res && res.data && res.data.aiSummary) {
                setAiInsight(res.data.aiSummary);
            }
        }).catch(()=>{});
    }

    placeTarget();
  }, []);

  function placeTarget() {
    // Generate valid percentages to keep target strictly inside the box.
    // Box dimensions are variable, so we use percentages. The visual circle is 32 tailwind units (128px max pulse).
    const x = 10 + Math.random() * 75; // 10% to 85%
    const y = 10 + Math.random() * 70; // 10% to 80%
    setTarget({ x, y });
    startRef.current = Date.now();
  }

  function handleTargetClick(e) {
    if (e) e.stopPropagation();
    
    // Safety check just in case.
    if (!startRef.current) return;
    
    const ms = Date.now() - startRef.current;
    const next = [...times, ms];
    setTimes(next);
    
    const r = round + 1;
    setRound(r);
    
    // Show Toast
    setToast(`Great catch! Speed: ${ms}ms`);
    setTimeout(() => {
      setToast(null);
    }, 1500);

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

  const avgSpeed = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

  return (
    <div className="w-full flex-grow relative overflow-hidden bg-[#faf8ff] rounded-2xl min-h-[550px] flex flex-col mx-auto border border-[#c1c6d7]/10">
      
      {/* Game Header Overlay */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl px-6 opacity-90 pointer-events-none">
        <div className="bg-[#dae2fd]/60 backdrop-blur-md border border-[#c1c6d7]/20 rounded-lg p-6 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="font-bold text-2xl tracking-tight text-[#131b2e]">Target Practice</h1>
            <p className="text-[#414755] font-medium uppercase tracking-widest text-[10px] mt-1">Cognitive Speed Training • Round {Math.min(round, TOTAL)} of {TOTAL}</p>
          </div>
          <div className="text-right">
            <p className="text-[#414755] text-sm font-medium">Instruction:</p>
            <p className="text-[#0058bf] font-semibold">Click the target as quickly as it appears.</p>
          </div>
        </div>
      </div>

      {/* Metric Sidebar (Floating) */}
      <div className="absolute right-8 top-32 z-10 flex flex-col gap-4 pointer-events-none hidden md:flex">
        <div className="bg-[#ffffff] rounded-md p-5 w-48 shadow-sm border border-[#c1c6d7]/10">
          <span className="text-[10px] font-bold uppercase tracking-tighter text-[#727786] mb-1 block">Targets Hit</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#131b2e]">{round - 1}</span>
            <span className="material-symbols-outlined text-[#006a61] text-lg">check_circle</span>
          </div>
        </div>

        <div className="bg-[#ffffff] rounded-md p-5 w-48 shadow-sm border border-[#c1c6d7]/10">
          <span className="text-[10px] font-bold uppercase tracking-tighter text-[#727786] mb-1 block">Average Speed</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#131b2e]">{avgSpeed > 0 ? avgSpeed : "--"}</span>
            <span className="text-sm font-semibold text-[#414755]">ms</span>
          </div>
        </div>

        {/* AI Insight Overlay */}
        <div className="bg-[#dae2fd]/60 backdrop-blur-md border border-[#c1c6d7]/20 rounded-md p-5 w-48 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#4b41e1] rounded-full opacity-10 blur-xl"></div>
          <span className="text-[10px] font-bold uppercase tracking-tighter text-[#4b41e1] mb-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            AI Insight
          </span>
          <p className="text-xs text-[#414755] leading-relaxed line-clamp-3">{aiInsight}</p>
        </div>
      </div>

      {/* Interaction Zone */}
      <div className="flex-grow flex items-stretch justify-center relative p-6 md:p-12 mt-20 md:mt-24" style={{ cursor: 'crosshair' }} onClick={() => {
         // Miss logic could be added here if desired. For now, it stays strictly identical logic to origin.
      }}>
        {/* Background Texture/Gradient for focus */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 50%, #eaedff 0%, #faf8ff 70%)" }}></div>
        
        {/* The Central Zone (Restricted Area) */}
        <div className="w-full min-h-[350px] sm:min-h-[450px] lg:min-h-[500px] max-w-5xl border border-gray-300/30 rounded-xl relative overflow-hidden bg-[#f2f3ff]/30 backdrop-blur-sm shadow-inner group">
          {/* Default Decorative Subtle Crosshairs inside box */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#c1c6d7]/5 pointer-events-none group-hover:bg-[#0058bf]/5 transition-colors"></div>
          <div className="absolute left-1/2 top-0 h-full w-[1px] bg-[#c1c6d7]/5 pointer-events-none group-hover:bg-[#0058bf]/5 transition-colors"></div>

          {/* Target Implementation */}
          {target && round <= TOTAL && (
            <button 
                className="absolute focus:outline-none z-10 cursor-crosshair transform -translate-x-1/2 -translate-y-1/2"
                style={{ top: target.y + "%", left: target.x + "%" }}
                onClick={handleTargetClick}
            >
              <div className="relative flex items-center justify-center">
                {/* Outer Pulse */}
                <div className="absolute w-24 h-24 md:w-32 md:h-32 bg-[#86f2e4]/20 rounded-full animate-pulse"></div>
                {/* Secondary Ring */}
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-2 border-[#006a61]/30 flex items-center justify-center">
                  {/* Main High-Contrast Circle */}
                  <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-[#006a61]/90 hover:bg-[#006a61] flex items-center justify-center shadow-lg active:scale-95 transition-all duration-75">
                    <div className="w-3 h-3 md:w-6 md:h-6 rounded-full bg-white/30 backdrop-blur-sm"></div>
                  </div>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Ghost Grid Background Decoration */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#131b2e 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>

      {/* Bottom Notification Toast */}
      {toast && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[100] animate-[fadeScaleIn_0.2s_ease-out]">
          <div className="bg-[#131b2e] text-[#fefcff] px-6 py-3 rounded-full flex items-center gap-3 shadow-xl">
            <span className="material-symbols-outlined text-[#89f5e7]">bolt</span>
            <span className="text-sm font-semibold tracking-tight">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
