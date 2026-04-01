import { useRef, useCallback } from 'react'

export function useChatTracker() {
  const state = useRef({
    keystrokes: 0,
    backspaces: 0,
    messages: [],
    msgTimestamps: [],
    wordCounts: [],
    sessionStart: Date.now(),
  })

  const onKeyDown = useCallback((e) => {
    state.current.keystrokes++
    if (e.key === 'Backspace') state.current.backspaces++
  }, [])

  const onMessageSend = useCallback((text) => {
    const s = state.current
    s.messages.push(text)
    s.msgTimestamps.push(Date.now())
    s.wordCounts.push(text.trim().split(/\s+/).filter(Boolean).length)
  }, [])

  const getPayload = useCallback(() => {
    const s = state.current
    const now = Date.now()
    const sessionDuration = now - s.sessionStart
    const messageCount = s.messages.length
    const totalWords = s.wordCounts.reduce((a, b) => a + b, 0)
    const minutes = sessionDuration / 60000

    const avgWPM = minutes > 0 ? Math.round(totalWords / minutes) : 0

    const mid = Math.floor(s.wordCounts.length / 2)
    const wpm1 = mid > 0
      ? s.wordCounts.slice(0, mid).reduce((a, b) => a + b, 0) / mid : 0
    const half2 = s.wordCounts.slice(mid)
    const wpm2 = half2.length > 0
      ? half2.reduce((a, b) => a + b, 0) / half2.length : 0
    const wpmDelta = parseFloat((wpm2 - wpm1).toFixed(2))

    const backspaceRate = s.keystrokes > 0
      ? parseFloat((s.backspaces / s.keystrokes).toFixed(3)) : 0

    let totalPause = 0
    for (let i = 1; i < s.msgTimestamps.length; i++)
      totalPause += s.msgTimestamps[i] - s.msgTimestamps[i - 1]
    const avgPauseBetweenMessages = messageCount > 1
      ? Math.round(totalPause / (messageCount - 1)) : 0

    let repetitionCount = 0
    for (let i = 1; i < s.messages.length; i++) {
      const words = s.messages[i].toLowerCase().split(/\s+/)
      for (let j = 0; j < i; j++) {
        const prev = s.messages[j].toLowerCase()
        for (let k = 0; k <= words.length - 3; k++) {
          if (prev.includes(words.slice(k, k + 3).join(' '))) {
            repetitionCount++
            break
          }
        }
      }
    }

    const avgSentenceLength = messageCount > 0
      ? parseFloat((totalWords / messageCount).toFixed(1)) : 0

    return {
      avgWPM,
      wpmDelta,
      backspaceRate,
      avgPauseBetweenMessages,
      repetitionCount,
      avgSentenceLength,
      sessionDuration,
      messageCount,
      timeOfDay: new Date().getHours(),
      messages: [...s.messages],
    }
  }, [])

  const getLiveMetrics = useCallback(() => {
    const s = state.current
    const now = Date.now()
    const sessionDuration = now - s.sessionStart
    const messageCount = s.messages.length
    const totalWords = s.wordCounts.reduce((a, b) => a + b, 0)
    const minutes = sessionDuration / 60000

    const avgWPM = minutes > 0 ? Math.round(totalWords / minutes) : 0

    const backspaceRate = s.keystrokes > 0
      ? parseFloat((s.backspaces / s.keystrokes).toFixed(3)) : 0

    let totalPause = 0
    for (let i = 1; i < s.msgTimestamps.length; i++)
      totalPause += s.msgTimestamps[i] - s.msgTimestamps[i - 1]
    const avgPauseBetweenMessages = messageCount > 1
      ? Math.round(totalPause / (messageCount - 1)) : 0

    const mid = Math.floor(s.wordCounts.length / 2)
    const wpm1 = mid > 0
      ? s.wordCounts.slice(0, mid).reduce((a, b) => a + b, 0) / mid : 0
    const half2 = s.wordCounts.slice(mid)
    const wpm2 = half2.length > 0
      ? half2.reduce((a, b) => a + b, 0) / half2.length : 0
    const wpmDelta = parseFloat((wpm2 - wpm1).toFixed(2))

    let repetitionCount = 0
    for (let i = 1; i < s.messages.length; i++) {
      const words = s.messages[i].toLowerCase().split(/\s+/)
      for (let j = 0; j < i; j++) {
        const prev = s.messages[j].toLowerCase()
        for (let k = 0; k <= words.length - 3; k++) {
          if (prev.includes(words.slice(k, k + 3).join(' '))) {
            repetitionCount++
            break
          }
        }
      }
    }

    const avgSentenceLength = messageCount > 0
      ? parseFloat((totalWords / messageCount).toFixed(1)) : 0

    // Per-message WPM for sparkline (last 8)
    const wpmHistory = s.wordCounts.map((wc, idx) => {
      if (idx === 0) return wc * 10 // rough estimate for first message
      const gap = s.msgTimestamps[idx] - s.msgTimestamps[idx - 1]
      const gapMin = gap / 60000
      return gapMin > 0 ? Math.round(wc / gapMin) : wc * 10
    })

    return {
      avgWPM,
      msgCount: messageCount,
      avgPause: avgPauseBetweenMessages,
      backspaceRate,
      wpmHistory,
      wpmDelta,
      repetitionCount,
      avgSentenceLength,
      sessionDuration,
      timeOfDay: new Date().getHours(),
    }
  }, [])

  const reset = useCallback(() => {
    state.current = {
      keystrokes: 0, backspaces: 0,
      messages: [], msgTimestamps: [],
      wordCounts: [], sessionStart: Date.now(),
    }
  }, [])

  return { onKeyDown, onMessageSend, getPayload, getLiveMetrics, reset }
}
