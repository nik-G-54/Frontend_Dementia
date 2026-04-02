import React from 'react';
import ScoreCard from '../components/widgets/ScoreCard';
import { ProgressChart } from '../components/charts/ProgressChart';
import DailyProgressCalendar from '../components/widgets/DailyProgressCalendar';
import TasksListWidget from '../components/widgets/TasksListWidget';

const chartData = [
  { name: 'Mon', risk: 0.25, memory: 65 },
  { name: 'Tue', risk: 0.22, memory: 70 },
  { name: 'Wed', risk: 0.23, memory: 68 },
  { name: 'Thu', risk: 0.20, memory: 75 },
  { name: 'Fri', risk: 0.18, memory: 80 },
  { name: 'Sat', risk: 0.15, memory: 85 },
  { name: 'Sun', risk: 0.16, memory: 82 }
];

export default function Dashboard() {
  const userName = localStorage.getItem('userName') || 'Friend';

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg overflow-hidden relative">
        {/* Decorative background shapes */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-400 opacity-20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome back, {userName}! 👋</h1>
          <p className="text-blue-100 max-w-xl text-sm leading-relaxed">
            Your cognitive patterns today suggest normal function for your age group. Keep up the great work with your daily exercises to maintain neuroplasticity.
          </p>
        </div>
        
        <div className="relative z-10 flex gap-3">
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur text-white px-5 py-2.5 rounded-xl font-semibold transition-all">
            View Report
          </button>
          <button className="bg-white text-indigo-600 hover:bg-gray-50 px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all transform hover:scale-105">
            Start Training
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard 
          title="Overall Risk Score" 
          score="0.16" 
          total="1.0"
          subtitle="Stage 0 — Normal Cognitive Function" 
          icon="🛡️" 
          colorClass={{ bg: 'bg-green-100 text-green-600 dark:bg-green-900/30' }}
          trendText="-0.04 this week"
        />
        <ScoreCard 
          title="Average Game Score" 
          score="84" 
          total="100"
          subtitle="Top 15% for your age group" 
          icon="🎮" 
          colorClass={{ bg: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30' }}
          trendText="+5% from last week"
        />
        <ScoreCard 
          title="Chat Health Index" 
          score="92" 
          total="100"
          subtitle="High linguistic coherence & recall" 
          icon="💬" 
          colorClass={{ bg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' }}
        />
        <ScoreCard 
          title="Webcam Emotion Score" 
          score="Calm" 
          subtitle="Consistent positive baseline detected" 
          icon="📷" 
          colorClass={{ bg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' }}
        />
      </div>

      {/* Middle Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Calendar & Tasks */}
        <div className="lg:col-span-1 space-y-6">
          <DailyProgressCalendar />
          
          <div className="h-[400px]">
            <TasksListWidget />
          </div>
        </div>

        {/* Right Column: Charts & Analysis */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          
          <ProgressChart 
            title="Memory Performance Trend" 
            data={chartData} 
            dataKey="memory" 
            gradientColor="#3B82F6" 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Detailed Analysis</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">⌨️</span>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Typing Rhythm</h4>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Consistent speed with low backspace rate (8%). Fine motor skills remain stable.
                  </p>
                </div>
                
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🧠</span>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Short-term Memory</h4>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Scored above the 70th percentile for the 66-75 age band in today's Sequence Game.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-6 shadow-sm border border-indigo-100 dark:border-gray-700 relative overflow-hidden">
               {/* Illustration graphic abstraction */}
              <div className="absolute right-0 bottom-0 opacity-20 dark:opacity-10 transform translate-x-1/4 translate-y-1/4">
                <svg width="150" height="150" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 0C77.6142 0 100 22.3858 100 50C100 77.6142 77.6142 100 50 100C22.3858 100 0 77.6142 0 50C0 22.3858 22.3858 0 50 0Z" fill="#818CF8"/>
                  <circle cx="30" cy="30" r="10" fill="white"/>
                  <circle cx="70" cy="70" r="15" fill="white"/>
                  <circle cx="20" cy="80" r="5" fill="white"/>
                </svg>
              </div>

              <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-400 mb-2 relative z-10">Doctor's Note</h3>
              <p className="text-sm text-indigo-800/80 dark:text-gray-300 relative z-10 leading-relaxed mt-4">
                "Your test consistency this month is excellent. We are seeing sustained baseline stability in your reaction times. Keep up the daily check-ins — the AI chatbot is picking up very positive grammatical structures."
              </p>
              
              <div className="mt-6 flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-full bg-indigo-200 border-2 border-white shadow-sm flex items-center justify-center font-bold text-indigo-700">
                  Dr
                </div>
                <div>
                  <div className="text-xs font-bold text-indigo-900 dark:text-gray-200">Dr. Sarah Jenkins</div>
                  <div className="text-[10px] text-indigo-600 dark:text-gray-400">Neurologist</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
