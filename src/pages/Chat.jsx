import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChatTracker } from '../hooks/useChatTracker'
import api from '../api/axiosInstance'

/* ───────── SVG Icons ───────── */


const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)

/* ───────── Typing Indicator ───────── */
function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-end gap-2">
        <div style={styles.avatar}>CG</div>
        <div style={{ ...styles.botBubble, display: 'flex', alignItems: 'center', gap: 4, padding: '14px 20px' }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              width: 7, height: 7, borderRadius: '50%', backgroundColor: '#6d5cf7',
              display: 'inline-block',
              animation: `bounce 1.4s infinite ease-in-out ${i * 0.16}s`
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ───────── WPM Sparkline (pure SVG) ───────── */
function WpmSparkline({ wpmHistory }) {
  const slots = 8
  const barWidth = 28
  const gap = 6
  const maxH = 80
  const svgW = slots * (barWidth + gap) - gap
  const data = wpmHistory.slice(-slots)
  const maxVal = Math.max(...data, 30)

  return (
    <div>
      <div style={{ fontSize: 12, color: '#5f5e5a', marginBottom: 8, fontWeight: 500 }}>
        Typing speed per message (WPM)
      </div>
      <svg width={svgW} height={maxH + 20} viewBox={`0 0 ${svgW} ${maxH + 20}`}>
        {Array.from({ length: slots }).map((_, i) => {
          const x = i * (barWidth + gap)
          if (i < data.length) {
            const h = Math.max(4, (data[i] / maxVal) * maxH)
            return (
              <g key={i}>
                <rect x={x} y={maxH - h} width={barWidth} height={h} rx={4}
                  fill="#6d5cf7" opacity={0.85} />
                <text x={x + barWidth / 2} y={maxH + 14} textAnchor="middle"
                  fontSize="10" fill="#5f5e5a">{data[i]}</text>
              </g>
            )
          }
          return (
            <rect key={i} x={x} y={4} width={barWidth} height={maxH - 4} rx={4}
              fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={1.5}
              strokeDasharray="4 3" />
          )
        })}
      </svg>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   MAIN CHAT COMPONENT
   ═══════════════════════════════════════════════ */
export default function Chat() {
  const navigate = useNavigate()
  const { onKeyDown, onMessageSend, getPayload, getLiveMetrics, reset } = useChatTracker()

  /* ── State ── */
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingText, setProcessingText] = useState('')
  const [result, setResult] = useState(null)
  const [liveMetrics, setLiveMetrics] = useState({
    avgWPM: 0, msgCount: 0, avgPause: 0, backspaceRate: 0,
    wpmHistory: [], wpmDelta: 0, repetitionCount: 0,
    avgSentenceLength: 0, sessionDuration: 0, timeOfDay: 0
  })
  const [sessionTimer, setSessionTimer] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [sessionEnded, setSessionEnded] = useState(false)
  const [language, setLanguage] = useState('english')
  const [isProgressOpen, setIsProgressOpen] = useState(false)

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)
  const sessionStartRef = useRef(Date.now())
  const timerInterval = useRef(null)
  const userMsgCount = messages.filter(m => m.role === 'user').length

  /* ── Auto-scroll ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  /* ── Session timer ── */
  useEffect(() => {
    timerInterval.current = setInterval(() => {
      setSessionTimer(Math.floor((Date.now() - sessionStartRef.current) / 1000))
    }, 1000)
    return () => clearInterval(timerInterval.current)
  }, [])

  /* ── Auto-end after 10 minutes ── */
  useEffect(() => {
    if (sessionTimer >= 600 && !sessionEnded) {
      handleEndSession()
    }
  }, [sessionTimer, sessionEnded])

  /* ── Welcome greeting (page load) ── */
  useEffect(() => {
    async function init() {
      // Speak greeting
            // Fetch first bot message
      setIsTyping(true)
      try {
        const res = await api.post('/chat/message', {
          messages: [{ role: 'user', content: 'hello' }], language
        })
        const { reply } = res.data
        setMessages([{ role: 'assistant', content: reply }])
      } catch {
        setMessages([{
          role: 'assistant',
          content: "Hello! I'm your CogGuard companion. How are you feeling today? We can talk about your day, your morning routine, or anything on your mind."
        }])
      }
      setIsTyping(false)
    }
    init()
  }, [])

  /* ── Format timer ── */
  const fmtTimer = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }
  const fmtTime = (date) => {
    const d = date instanceof Date ? date : new Date(date)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  /* ── Send message ── */
  const handleSend = useCallback(async () => {
    const text = inputText.trim()
    if (!text || sessionEnded) return

    onMessageSend(text)

    const updatedMessages = [...messages, { role: 'user', content: text }]
    setMessages(updatedMessages)
    setInputText('')
    setIsTyping(true)

    // Update live metrics
    setLiveMetrics(getLiveMetrics())

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      const res = await api.post('/chat/message', {
        messages: updatedMessages, language
      })
      const { reply } = res.data
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'd love to hear more. Could you tell me a little more about that?"
      }])
    }
    setIsTyping(false)
    // Update metrics again after response
    setLiveMetrics(getLiveMetrics())
  }, [inputText, messages, onMessageSend, getLiveMetrics, sessionEnded])

  /* ── Keyboard shortcut ── */
  const handleKeyDown = useCallback((e) => {
    onKeyDown(e)
    if (!e.shiftKey && e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }, [onKeyDown, handleSend])

  /* ── Auto-resize textarea ── */
  const handleTextareaChange = (e) => {
    setInputText(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  /* ── End session ── */
  const handleEndSession = useCallback(async () => {
    if (sessionEnded) return
    setSessionEnded(true)
    clearInterval(timerInterval.current)

    const payload = getPayload()
    setIsProcessing(true)
    setProcessingText('Analysing your session...')

    try {
      const res = await api.post('/sessions/chat', payload)
      const { sessionId: sid } = res.data
      setSessionId(sid)

      // Poll every 2 seconds
      let elapsed = 0
      const interval = setInterval(async () => {
        elapsed += 2000
        if (elapsed > 30000) {
          clearInterval(interval)
          setIsProcessing(false)
          setProcessingText('Analysis took longer than expected. Check reports later.')
          return
        }
        try {
          const poll = await api.get(`/sessions/chat/${sid}`)
          const data = poll.data
          if (data.status === 'complete') {
            clearInterval(interval)
            setIsProcessing(false)
            setResult(data)
          }
        } catch {
          // keep polling
        }
      }, 2000)
    } catch {
      setIsProcessing(false)
      setProcessingText('Could not submit session. Please try again.')
    }
  }, [getPayload, sessionEnded])

  /* ── Risk badge helper ── */
  const riskBadge = (level) => {
    const map = {
      low: { bg: '#e1f5ee', color: '#0f6e56', label: 'Low risk' },
      medium: { bg: '#faeeda', color: '#854f0b', label: 'Medium risk' },
      high: { bg: '#fcebeb', color: '#a32d2d', label: 'High risk' },
    }
    const cfg = map[level] || map.low
    return (
      <span style={{
        display: 'inline-block', padding: '5px 14px', borderRadius: 20,
        fontSize: 14, fontWeight: 600, backgroundColor: cfg.bg, color: cfg.color
      }}>
        {cfg.label}
      </span>
    )
  }

  /* ═══════════ RENDER ═══════════ */
  return (
    <div className="flex flex-col bg-surface overflow-hidden w-full h-[calc(100vh-80px)] md:h-screen pt-20 pl-0 md:pl-20">
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .slide-panel {
          position: fixed;
          top: 0; right: 0; bottom: 0;
          width: 400px;
          max-width: 100vw;
          background: var(--color-surface);
          border-left: 1px solid var(--color-outline-variant);
          box-shadow: -10px 0 30px rgba(0,0,0,0.06);
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 100;
          overflow-y: auto;
          padding: 24px;
        }
        .slide-panel.open {
          transform: translateX(0);
        }
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          z-index: 99;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
        }
        .overlay.open {
          opacity: 1;
          pointer-events: auto;
        }
      `}</style>
      
      {/* Top Header inside Chat Canvas (Language & timer) */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant/10 bg-surface/50 backdrop-blur-sm z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-semibold text-on-surface">Daily check-in</h1>
          <select value={language} onChange={e => setLanguage(e.target.value)} className="bg-surface-container-high px-3 py-1.5 rounded-lg text-xs font-medium border-none outline-none text-on-surface-variant focus:ring-1 focus:ring-primary">
            <option value="english">English</option>
            <option value="hindi">Hindi</option>
            <option value="hinglish">Hinglish</option>
          </select>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs text-green-600 font-medium tracking-wide uppercase">Active</span>
          </div>
        </div>
        <div className="text-sm font-medium text-on-surface-variant tabular-nums">
          {fmtTimer(sessionTimer)}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-24 space-y-8 scroll-smooth relative">
        {/* Date/Context Indicator */}
        <div className="flex justify-center">
          <span className="text-[10px] font-medium tracking-wider uppercase bg-surface-container-high px-4 py-1 rounded-full text-on-surface-variant shadow-sm">Today - Cognitive Insight Session</span>
        </div>

        {/* Messages */}
        {messages.map((m, i) => (
          m.role === 'assistant' ? (
            <div key={i} className="flex flex-col items-start max-w-2xl gap-2 animate-[fadeInUp_0.3s_ease-out]">
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-tertiary-container p-1 rounded-md shadow-sm">
                  <span className="material-symbols-outlined text-white text-xs" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
                </div>
                <span className="text-xs font-semibold text-on-surface-variant tracking-wide uppercase">Lucid AI</span>
              </div>
              <div className="bg-surface-container-lowest text-on-surface p-5 rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-md leading-relaxed relative group border border-outline-variant/10 hover:border-primary/20 transition-colors">
                {m.content}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-tertiary blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
              </div>
              <span className="text-[10px] text-outline ml-1">{fmtTime(new Date())}</span>
            </div>
          ) : (
            <div key={i} className="flex flex-col items-end max-w-2xl ml-auto gap-2 animate-[fadeInUp_0.3s_ease-out] w-full">
              <div className="bg-primary text-on-primary p-5 rounded-tl-xl rounded-br-xl rounded-bl-xl shadow-md leading-relaxed ml-auto selection:bg-primary-container selection:text-on-primary-container">
                {m.content}
              </div>
              <span className="text-[10px] text-outline mr-1">{fmtTime(new Date())}</span>
            </div>
          )
        ))}

        {isTyping && (
          <div className="flex flex-col items-start max-w-2xl gap-2 animate-[fadeInUp_0.2s_ease-out]">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-tertiary-container p-1 rounded-md shadow-sm">
                <span className="material-symbols-outlined text-white text-xs" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
              </div>
              <span className="text-xs font-semibold text-on-surface-variant tracking-wide uppercase">Lucid AI</span>
            </div>
            <div className="bg-surface-container-lowest text-on-surface p-5 rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm border border-outline-variant/10 flex items-center gap-1.5 h-14">
              {[0, 1, 2].map(i => (
                <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-tertiary)', display: 'inline-block', animation: `bounce 1.4s infinite ease-in-out ${i * 0.16}s` }} />
              ))}
            </div>
          </div>
        )}
        
        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex justify-center items-center gap-3 p-4 bg-surface-container-lowest rounded-full shadow-lg border border-outline-variant/10 w-max mx-auto animate-[fadeInUp_0.3s_ease-out]">
            <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-on-surface-variant">{processingText}</span>
          </div>
        )}

        {/* Result Card */}
        {result && (
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-xl border border-outline-variant/20 max-w-sm mx-auto text-center mt-8 animate-[fadeInUp_0.4s_ease-out]">
            <div className="mb-4">{riskBadge(result.riskLevel)}</div>
            {result.languageScore != null && (
              <p className="text-sm text-on-surface my-2 font-medium">Language Score: <span className="text-primary font-bold text-lg ml-1">{result.languageScore}</span></p>
            )}
            {result.explanation && <p className="text-xs italic text-on-surface-variant my-3 px-2 leading-relaxed">{result.explanation}</p>}
            <p className="text-[10px] text-outline mt-4">This is a cognitive wellness indicator only. Not a medical diagnosis.</p>
            <button onClick={() => navigate('/reports')} className="mt-5 w-full bg-primary hover:bg-primary-container text-on-primary font-medium py-3 rounded-xl transition-colors shadow-sm">View full report</button>
          </div>
        )}

        {!isProcessing && processingText && !result && (
           <div className="text-xs text-warning text-center mt-4">{processingText}</div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Section */}
      <div className="p-6 md:px-24 md:pb-8 space-y-4 bg-gradient-to-t from-surface via-surface to-transparent shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.05)] z-10 relative">
        
        {/* Text Input Area */}
        <div className={`bg-surface-container-lowest rounded-3xl p-2 shadow-lg border border-outline-variant/20 flex items-center gap-3 max-w-4xl mx-auto transition-all duration-300 ${isListening ? 'ring-2 ring-primary border-transparent' : 'hover:border-outline-variant/40'}`}>
          <button className="text-outline hover:text-primary p-2 transition-colors shrink-0 ml-1 rounded-full hover:bg-surface-container">
            <span className="material-symbols-outlined text-xl">attach_file</span>
          </button>
          <input 
            type="text"
            ref={textareaRef}
            value={inputText}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            disabled={sessionEnded}
            className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-sm px-1 text-on-surface placeholder:text-on-surface-variant/50 min-w-0"
            placeholder={sessionEnded ? "Session has ended." : "Ask anything about your cognitive health..."}
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim() || sessionEnded}
            className={`bg-primary-container text-on-primary-container h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-inner ${inputText.trim() && !sessionEnded ? 'hover:scale-105 hover:shadow-md active:scale-95 cursor-pointer' : 'opacity-40 cursor-not-allowed grayscale'}`}
          >
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>send</span>
          </button>
        </div>

        {/* Suggestion Pills / Actions */}
        <div className="flex flex-wrap gap-2 justify-center pt-2">
          {userMsgCount >= 3 && !sessionEnded && !result && (
            <button onClick={handleEndSession} className="bg-primary/10 border border-primary/20 text-primary px-5 py-2 rounded-full text-xs font-semibold hover:bg-primary hover:text-on-primary transition-all shadow-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">stop_circle</span>
              End Session
            </button>
          )}
          <button onClick={() => setIsProgressOpen(true)} className="bg-surface border border-outline-variant/30 text-on-surface-variant px-5 py-2 rounded-full text-xs font-medium hover:bg-surface-container-high hover:text-primary transition-all shadow-sm flex items-center gap-2 group">
            <span className="material-symbols-outlined text-[16px] group-hover:text-primary transition-colors">monitoring</span>
            View Dashboard
          </button>
        </div>

        <p className="text-[10px] text-center text-on-surface-variant/60 tracking-wide pt-2">
          Lucid AI provides insights based on your data. Consult a specialist for clinical diagnoses.
        </p>
      </div>

      {/* PROGRESS DIALOG */}
      <div className={`overlay ${isProgressOpen ? 'open' : ''}`} onClick={() => setIsProgressOpen(false)} />
      <div className={`slide-panel ${isProgressOpen ? 'open' : ''}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">assessment</span>
            Live Metrics
          </h2>
          <button onClick={() => setIsProgressOpen(false)} className="bg-surface-container-highest text-on-surface-variant hover:text-error hover:bg-error-container rounded-full w-8 h-8 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        
        <div className="flex flex-col gap-5">
          {/* Metric cards 2×2 */}
          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <MetricCard label="Words / Min" value={liveMetrics.avgWPM} />
              <MetricCard label="Messages" value={liveMetrics.msgCount} />
              <MetricCard label="Avg Pause" value={liveMetrics.avgPause > 0 ? (liveMetrics.avgPause / 1000).toFixed(1) + 's' : '—'} />
              <MetricCard label="Backspace" value={(liveMetrics.backspaceRate * 100).toFixed(0) + '%'} />
            </div>
          </div>

          {/* WPM Sparkline */}
          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-4 shadow-sm w-full overflow-hidden">
            <WpmSparkline wpmHistory={liveMetrics.wpmHistory} />
          </div>

          {/* All signals table */}
          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              All Signals Tracker
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <tbody>
                  {[
                    ['Average WPM', liveMetrics.avgWPM],
                    ['WPM Variance', liveMetrics.wpmDelta],
                    ['Backspace rate', liveMetrics.backspaceRate?.toFixed(3)],
                    ['Average pause', liveMetrics.avgPause > 0 ? (liveMetrics.avgPause / 1000).toFixed(1) + 's' : '—'],
                    ['Repetitions', liveMetrics.repetitionCount],
                    ['Avg Sentences', liveMetrics.avgSentenceLength],
                    ['Total Msgs', liveMetrics.msgCount],
                    ['Time code', liveMetrics.timeOfDay],
                    ['Duration', fmtTimer(Math.floor((liveMetrics.sessionDuration || 0) / 1000))],
                  ].map(([label, val]) => (
                    <tr key={label} className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container/50 transition-colors">
                      <td className="py-2.5 px-1 text-on-surface-variant font-medium text-xs">{label}</td>
                      <td className={`py-2.5 px-1 text-right font-semibold tabular-nums text-sm ${label === 'WPM Variance' && val < 0 ? 'text-warning' : 'text-on-surface'}`}>
                        {val}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-[10px] text-outline text-center px-4 leading-relaxed bg-surface-container-high rounded-xl p-3 mb-6">
            <strong className="block text-on-surface-variant mb-1 font-semibold space-x-1 flex items-center justify-center">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              <span>Privacy Focused</span>
            </strong>
            We measure typing patterns to support cognitive wellness. Your messages are never stored permanently.
          </div>
        </div>
      </div>
    </div>
  )
}

/* ───────── Metric card sub-component ───────── */
function MetricCard({ label, value }) {
  return (
    <div className="bg-surface-container rounded-xl p-3 flex flex-col gap-1 border border-outline-variant/10 hover:shadow-sm transition-shadow">
      <div className="text-2xl font-bold text-on-surface tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-primary to-tertiary w-max">
        {value}
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant/80">
        {label}
      </div>
    </div>
  )
}

