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
    <div style={styles.page}>
      {/* ── Animations + Responsive ── */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .chat-grid {
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 900px;
          margin: 0 auto;
        }
        .slide-panel {
          position: fixed;
          top: 0; right: 0; bottom: 0;
          width: 400px;
          max-width: 100vw;
          background: #faf9f7;
          border-left: 1px solid rgba(0,0,0,0.1);
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

      <div className="chat-grid">
        {/* ════════════ LEFT: CHAT ════════════ */}
        <div style={{ ...styles.leftCol, width: "100%" }}>
          <div style={styles.card}>
            {/* Header */}
            <div style={styles.chatHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>Daily check-in</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <select value={language} onChange={e => setLanguage(e.target.value)} style={{ padding: '6px 12px', outline: 'none', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', background: '#f5f4f0', fontSize: 14, fontWeight: 500, color: '#5f5e5a' }}>
                    <option value="english">English</option>
                    <option value="hindi">Hindi</option>
                    <option value="hinglish">Hinglish</option>
                  </select>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e',
                      display: 'inline-block', animation: 'pulse 2s infinite'
                    }} />
                    <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 500 }}>Active</span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 500, color: '#5f5e5a', fontVariantNumeric: 'tabular-nums' }}>
                {fmtTimer(sessionTimer)}
              </div>
            </div>

            {/* Messages */}
            <div style={styles.messageList}>
              {messages.map((m, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                  animation: 'fadeInUp 0.3s ease-out'
                }}>
                  {m.role === 'assistant' && (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                      <div style={styles.avatar}>CG</div>
                      <div>
                        <div style={styles.botBubble}>{m.content}</div>
                        <div style={styles.timestamp}>{fmtTime(new Date())}</div>
                      </div>
                    </div>
                  )}
                  {m.role === 'user' && (
                    <div>
                      <div style={styles.userBubble}>{m.content}</div>
                      <div style={{ ...styles.timestamp, textAlign: 'right' }}>{fmtTime(new Date())}</div>
                    </div>
                  )}
                </div>
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div style={styles.inputArea}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                

                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  disabled={sessionEnded}
                  rows={2}
                  style={styles.textarea}
                  aria-label="Chat message input"
                />

                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || sessionEnded}
                  aria-label="Send message"
                  style={{
                    ...styles.sendBtn,
                    opacity: inputText.trim() && !sessionEnded ? 1 : 0.5,
                    cursor: inputText.trim() && !sessionEnded ? 'pointer' : 'not-allowed'
                  }}
                >
                  <SendIcon />
                  <span style={{ marginLeft: 6 }}>Send</span>
                </button>
              </div>

              <p style={styles.hintText}>
                Press Enter to send · Session ends automatically after 10 minutes
              </p>
            </div>

            {/* End session button */}
            {userMsgCount >= 3 && !sessionEnded && !result && (
              <div style={{ padding: '0 16px 16px' }}>
                <button
                  onClick={handleEndSession}
                  aria-label="End session and get results"
                  style={styles.endSessionBtn}
                >
                  End session &amp; get results
                </button>
              </div>
            )}

            {/* Processing indicator */}
            {isProcessing && (
              <div style={styles.processingCard}>
                <div style={{
                  width: 28, height: 28, border: '3px solid #eeece6',
                  borderTopColor: '#6d5cf7', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                <span style={{ fontSize: 14, color: '#5f5e5a' }}>{processingText}</span>
              </div>
            )}

            {/* Result card */}
            {result && (
              <div style={styles.resultCard}>
                <div style={{ marginBottom: 8 }}>
                  {riskBadge(result.riskLevel)}
                </div>
                {result.languageScore != null && (
                  <p style={{ fontSize: 14, color: '#1a1a18', margin: '6px 0' }}>
                    Language Score: <strong>{result.languageScore}</strong>
                  </p>
                )}
                {result.explanation && (
                  <p style={{ fontSize: 13, fontStyle: 'italic', color: '#5f5e5a', margin: '6px 0' }}>
                    {result.explanation}
                  </p>
                )}
                <p style={{ fontSize: 11, color: '#888780', marginTop: 8 }}>
                  This is a cognitive wellness indicator only. Not a medical diagnosis.
                </p>
                <button
                  onClick={() => navigate('/reports')}
                  aria-label="View full report"
                  style={styles.viewReportBtn}
                >
                  View full report
                </button>
              </div>
            )}

            {/* Non-submission processing text fallback */}
            {!isProcessing && processingText && !result && (
              <div style={{ padding: '0 16px 16px' }}>
                <p style={{ fontSize: 13, color: '#854f0b', textAlign: 'center' }}>
                  {processingText}
                </p>
              </div>
            )}
          </div>
        </div>

        
        {/* PROGRESS DIALOG */}
        <div className={`overlay ${isProgressOpen ? 'open' : ''}`} onClick={() => setIsProgressOpen(false)} />
        <div className={`slide-panel ${isProgressOpen ? 'open' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, margin: 0 }}>Progress Report</h2>
            <button onClick={() => setIsProgressOpen(false)} style={{ background: '#fcebeb', color: '#e53e3e', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={styles.rightCol}>
          {/* Metric cards 2×2 */}
          <div style={styles.card}>
            <div style={styles.metricsGrid}>
              <MetricCard label="words / min" value={liveMetrics.avgWPM} />
              <MetricCard label="messages sent" value={liveMetrics.msgCount} />
              <MetricCard
                label="avg pause"
                value={liveMetrics.avgPause > 0 ? (liveMetrics.avgPause / 1000).toFixed(1) + 's' : '—'}
              />
              <MetricCard
                label="backspace rate"
                value={(liveMetrics.backspaceRate * 100).toFixed(0) + '%'}
              />
            </div>
          </div>

          {/* WPM Sparkline */}
          <div style={styles.card}>
            <WpmSparkline wpmHistory={liveMetrics.wpmHistory} />
          </div>

          {/* All signals table */}
          <div style={styles.card}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#5f5e5a', marginBottom: 10 }}>
              All signals
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <tbody>
                {[
                  ['avgWPM', liveMetrics.avgWPM],
                  ['wpmDelta', liveMetrics.wpmDelta],
                  ['backspaceRate', liveMetrics.backspaceRate?.toFixed(3)],
                  ['avgPause', liveMetrics.avgPause > 0 ? (liveMetrics.avgPause / 1000).toFixed(1) + 's' : '—'],
                  ['repetitionCount', liveMetrics.repetitionCount],
                  ['avgSentenceLength', liveMetrics.avgSentenceLength],
                  ['messageCount', liveMetrics.msgCount],
                  ['timeOfDay', liveMetrics.timeOfDay],
                  ['sessionDuration', fmtTimer(Math.floor((liveMetrics.sessionDuration || 0) / 1000))],
                ].map(([key, val]) => (
                  <tr key={key} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <td style={{
                      padding: '6px 4px', color: '#5f5e5a', fontWeight: 400
                    }}>{key}</td>
                    <td style={{
                      padding: '6px 4px', textAlign: 'right', fontWeight: 500,
                      fontVariantNumeric: 'tabular-nums',
                      color: key === 'wpmDelta' && val < 0 ? '#854f0b' : '#1a1a18'
                    }}>
                      {val}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Privacy note */}
          <div style={{
            fontSize: 11, color: '#888780', lineHeight: 1.5,
            padding: '8px 0'
          }}>
            We measure typing patterns to support cognitive wellness.
            Your messages are never stored after analysis is complete.
          </div>
          </div>
          </div>
        </div> {/* end slide-panel */}

        {/* BOTTOM PROGRESS BUTTON */}
        <div style={{ width: '100%', marginTop: 12 }}>
           <button onClick={() => setIsProgressOpen(true)} style={{ width: '100%', padding: 20, background: '#f5f4f0', border: '2px dashed #ccc', borderRadius: 12, fontSize: 18, color: '#5f5e5a', cursor: 'pointer', fontWeight: 600 }}>
             View Live Metrics & Progress Report
           </button>
        </div>
      </div>
    </div>
  )
}

/* ───────── Metric card sub-component ───────── */
function MetricCard({ label, value }) {
  return (
    <div style={{
      backgroundColor: '#f9f8f6', borderRadius: 10, padding: 14,
      display: 'flex', flexDirection: 'column', gap: 2
    }}>
      <div style={{ fontSize: 26, fontWeight: 600, color: '#1a1a18', lineHeight: 1.1 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: '#888780', fontWeight: 400 }}>
        {label}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   STYLES  (inline for zero-dependency simplicity)
   ═══════════════════════════════════════════════ */
const styles = {
  page: {
    minHeight: 'calc(100vh - 100px)',
    padding: '12px 0',
  },
  // grid is now handled by CSS class .chat-grid
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    border: '0.5px solid rgba(0,0,0,0.12)',
    borderRadius: 12,
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
  },
  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    borderBottom: '1px solid rgba(0,0,0,0.08)',
  },
  messageList: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    minHeight: 300,
    maxHeight: 'calc(100vh - 360px)',
    backgroundColor: '#faf9f7',
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    backgroundColor: '#EEEDFE',
    color: '#3C3489',
    fontSize: 10,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  botBubble: {
    backgroundColor: '#f5f4f0',
    color: '#1a1a18',
    padding: '18px 24px',
    borderRadius: '16px 16px 16px 4px',
    borderLeft: '4px solid #6d5cf7',
    fontSize: 20,
    lineHeight: 1.55,
    maxWidth: 480,
  },
  userBubble: {
    backgroundColor: '#E6F1FB',
    color: '#185fa5',
    padding: '18px 24px',
    borderRadius: '16px 16px 4px 16px',
    fontSize: 20,
    lineHeight: 1.55,
    maxWidth: 480,
    marginLeft: 'auto',
  },
  timestamp: {
    fontSize: 10,
    color: '#aaa',
    marginTop: 3,
    paddingLeft: 4,
    paddingRight: 4,
  },
  inputArea: {
    padding: '12px 16px',
    borderTop: '1px solid rgba(0,0,0,0.08)',
  },
  iconBtn: {
    width: 44,
    height: 60,
    minWidth: 44,
    borderRadius: 10,
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  textarea: {
    flex: 1,
    fontSize: 20,
    lineHeight: 1.5,
    padding: '16px 20px',
    border: '1px solid rgba(0,0,0,0.15)',
    borderRadius: 10,
    resize: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    backgroundColor: '#faf9f7',
    minHeight: 60,
  },
  sendBtn: {
    height: 60,
    minWidth: 90,
    backgroundColor: '#6d5cf7',
    color: '#ffffff',
    border: 'none',
    borderRadius: 10,
    fontSize: 18,
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.15s',
  },
  hintText: {
    fontSize: 11,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 0,
  },
  endSessionBtn: {
    width: '100%',
    height: 46,
    backgroundColor: 'transparent',
    color: '#6d5cf7',
    border: '1.5px solid #6d5cf7',
    borderRadius: 10,
    fontSize: 18,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.15s, color 0.15s',
  },
  processingCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
    padding: '14px 16px',
    borderTop: '1px solid rgba(0,0,0,0.06)',
  },
  resultCard: {
    margin: '0 16px 16px',
    padding: 16,
    backgroundColor: '#faf9f7',
    borderRadius: 10,
    border: '1px solid rgba(0,0,0,0.08)',
    animation: 'fadeInUp 0.4s ease-out',
  },
  viewReportBtn: {
    marginTop: 10,
    padding: '10px 20px',
    backgroundColor: '#6d5cf7',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
}

