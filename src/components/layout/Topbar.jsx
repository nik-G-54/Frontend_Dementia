import React, { useEffect, useState } from 'react';

export function Topbar() {
  const [userName, setUserName] = useState('Demo User');
  const [initials, setInitials] = useState('DU');
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const mode = localStorage.getItem('mode');
    if (mode === 'demo') {
      setIsDemo(true);
      setUserName('Demo User');
      setInitials('DU');
    } else {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          const name = user.name || 'User';
          setUserName(name);
          const nameParts = name.trim().split(' ');
          const firstInitial = nameParts[0] ? nameParts[0][0].toUpperCase() : 'U';
          const secondInitial = nameParts.length > 1 ? nameParts[1][0].toUpperCase() : '';
          setInitials(firstInitial + secondInitial);
        }
      } catch (e) {
        // Fallback
        setUserName('User');
        setInitials('U');
      }
    }
  }, []);

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-5rem)] z-40 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl flex justify-between items-center px-8 h-20 shadow-sm dark:shadow-none">
      <div className="flex items-center gap-8">
        <h1 className="text-2xl font-bold text-[#3B9EE8] dark:text-blue-300">Manasveda</h1>
        {/* <div className="relative w-64 hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            className="w-full bg-surface-container-lowest border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none ring-1 ring-outline-variant/20"
            placeholder="Search insights..."
            type="text"
          />
        </div> */}
      </div>
      <div className="flex items-center gap-4">
        {isDemo && (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-yellow-200">
            Demo Mode
          </span>
        )}
        <button className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-2 transition-all">
          <span className="material-symbols-outlined text-primary">notifications</span>
        </button>
        <div className="flex items-center gap-3 ml-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-on-surface leading-none">{userName}</p>
            <p className="text-xs text-on-surface-variant">{isDemo ? 'Exploring Features' : 'Cognitive Baseline Set'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold border-2 border-primary-fixed shadow-sm">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
