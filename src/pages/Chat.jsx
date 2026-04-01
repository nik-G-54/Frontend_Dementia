import React, { useState, useEffect, useRef } from 'react';
import { Card, CardLabel, SectionTitle, MiniLabel } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your CogGuard companion. How are you feeling today? We can talk about your day, your childhood, or anything on your mind." }
  ]);
  const [inputText, setInputText] = useState('');
  const [typingStats, setTypingStats] = useState({ wpm: 0, backspaces: 0, startTime: null, totalKeystrokes: 0 });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    const now = Date.now();

    // Start tracking on first keystroke
    if (typingStats.startTime === null && value.length > 0) {
      setTypingStats(prev => ({ ...prev, startTime: now }));
    }

    // Detect backspaces (simple proxy: if length decreased)
    if (value.length < inputText.length) {
      setTypingStats(prev => ({ ...prev, backspaces: prev.backspaces + 1 }));
    }

    setTypingStats(prev => ({ ...prev, totalKeystrokes: prev.totalKeystrokes + 1 }));
    setInputText(value);

    // Calculate WPM periodically (simple estimate)
    if (typingStats.startTime) {
      const minutesElapsed = (now - typingStats.startTime) / 60000;
      if (minutesElapsed > 0.01) {
        const words = value.split(' ').length;
        setTypingStats(prev => ({ ...prev, wpm: Math.round(words / minutesElapsed) }));
      }
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = { role: 'user', content: inputText };
    setMessages(prev => [...prev, newMessage]);
    
    // Simulate telemetry being sent (just for demo)
    console.log("Sending Telemetry:", {
      wpm: typingStats.wpm,
      backspaceRate: (typingStats.backspaces / (typingStats.totalKeystrokes || 1)) * 100,
      textLength: inputText.length
    });

    setInputText('');
    setTypingStats({ wpm: 0, backspaces: 0, startTime: null, totalKeystrokes: 0 });

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "That sounds interesting! Tell me more about how that made you feel." 
      }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col h-full">
          <Card className="flex-1 flex flex-col overflow-hidden p-0">
            <div className="p-4 border-b border-[var(--color-border-tertiary)] flex justify-between items-center bg-[var(--color-background-primary)]">
              <SectionTitle className="m-0">AI Companion Session</SectionTitle>
              <Badge variant="info">Active Analysis</Badge>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--color-background-secondary)]/30">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed",
                    m.role === 'user' 
                      ? "bg-[#6d5cf7] text-white rounded-tr-none" 
                      : "bg-[var(--color-background-primary)] text-[var(--color-text-primary)] border border-[var(--color-border-tertiary)] rounded-tl-none shadow-sm"
                  )}>
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-[var(--color-background-primary)] border-t border-[var(--color-border-tertiary)]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type your message here..."
                  className="w-full bg-[var(--color-background-secondary)] border-[0.5px] border-[var(--color-border-secondary)] rounded-xl py-4 px-5 pr-16 text-sm outline-none focus:border-[#6d5cf7] transition-all"
                  value={inputText}
                  onChange={handleInputChange}
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 bg-[#6d5cf7] text-white px-4 rounded-lg flex items-center justify-center hover:bg-[#5a4dd0] transition-colors"
                >
                  Send
                </button>
              </div>
              <p className="text-[10px] text-[var(--color-text-tertiary)] mt-2 text-center italic">
                Your typing cadence informs our cognitive assessment. Please type naturally.
              </p>
            </form>
          </Card>
        </div>

        {/* Telemetry Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-[#6d5cf7]/5 border-[#6d5cf7]/20">
            <CardLabel style={{ color: '#6d5cf7' }}>Real-time telemetry</CardLabel>
            <div className="mt-4 space-y-6">
              <div>
                <MiniLabel className="block mb-2">Typing Speed</MiniLabel>
                <div className="text-2xl font-bold text-[var(--color-text-primary)]">{typingStats.wpm} <span className="text-xs font-normal text-[var(--color-text-tertiary)]">WPM</span></div>
                <div className="w-full h-1 bg-[var(--color-background-secondary)] rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-[#6d5cf7] transition-all duration-300"
                    style={{ width: `${Math.min(100, (typingStats.wpm / 80) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <MiniLabel className="block mb-2">Hesitation (Backspace Rate)</MiniLabel>
                <div className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {typingStats.totalKeystrokes > 0 ? Math.round((typingStats.backspaces / typingStats.totalKeystrokes) * 100) : 0} 
                  <span className="text-xs font-normal text-[var(--color-text-tertiary)]">%</span>
                </div>
                <div className="w-full h-1 bg-[var(--color-background-secondary)] rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-[#EF9F27] transition-all duration-300"
                    style={{ width: `${Math.min(100, ((typingStats.backspaces / (typingStats.totalKeystrokes || 1)) * 100) * 4)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-[var(--color-background-success)]/10 border-[var(--color-border-success)]">
            <CardLabel style={{ color: 'var(--color-text-success)' }}>Sentiment pulse</CardLabel>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-2xl">😊</span>
              <div>
                <div className="text-sm font-bold text-[var(--color-text-success)]">Engaged & Calm</div>
                <div className="text-[10px] text-[var(--color-text-secondary)]">Sentiment Score: 0.88</div>
              </div>
            </div>
          </Card>

          <Card>
            <CardLabel>AI Analysis Status</CardLabel>
            <ul className="mt-3 space-y-2">
              <li className="flex items-center gap-2 text-[11px] text-[var(--color-text-secondary)]">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                Linguistic Coherence: Normal
              </li>
              <li className="flex items-center gap-2 text-[11px] text-[var(--color-text-secondary)]">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                Semantic Recall: Consistent
              </li>
              <li className="flex items-center gap-2 text-[11px] text-[var(--color-text-secondary)]">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                Emotional Stability: Stable
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
