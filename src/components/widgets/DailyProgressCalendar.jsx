import React, { useState } from 'react';

const DailyProgressCalendar = () => {
  // Generate dummy data for the last 30 days
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  
  const generateDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const isCompleted = Math.random() > 0.3; // 70% completion rate for demo
      days.push({
        date: date.getDate(),
        month: date.toLocaleString('default', { month: 'short' }),
        completed: isCompleted,
        active: date.getDate() === selectedDate
      });
    }
    return days;
  };

  const [days] = useState(generateDays());

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Daily Progress</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Consistency is the key to cognitive health.</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-semibold px-4 py-2 rounded-full text-sm">
          🔥 12 Day Streak
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2 overflow-x-auto pb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="text-center text-xs font-semibold tracking-wider text-gray-400 mb-2 uppercase">
            {day}
          </div>
        ))}
        {/* Fill empty days for alignment randomly, not fully accurate to calendar but looks structural */}
        <div className="col-span-1"></div>
        <div className="col-span-1"></div>
        {days.slice(-14).map((d, i) => (
          <div 
            key={i}
            onClick={() => setSelectedDate(d.date)}
            className={`
              flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer transition-all duration-300
              ${d.active 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 transform scale-105' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
            `}
          >
            <span className={`text-[10px] font-bold mb-1 ${d.active ? 'text-blue-200' : 'text-gray-400'}`}>{d.month}</span>
            <span className={`text-lg font-bold ${d.active ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>{d.date}</span>
            <div className={`w-1.5 h-1.5 rounded-full mt-2 ${d.completed ? (d.active ? 'bg-white' : 'bg-green-500') : 'bg-transparent'}`}></div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Goals Met</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-transparent border border-gray-300"></div>
          <span className="text-gray-600 dark:text-gray-400">Incomplete</span>
        </div>
      </div>
    </div>
  );
};

export default DailyProgressCalendar;
