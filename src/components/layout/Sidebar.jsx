import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('mode');
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Games',     path: '/games',     icon: 'extension' },
    { name: 'Reports',   path: '/reports',   icon: 'assessment' },
    { name: 'Chat',      path: '/chat',      icon: 'forum' },
    { name: 'Profile',   path: '/profile',   icon: 'person' },
  ];

  return (
    <aside className="h-screen w-20 fixed left-0 top-0 z-50 bg-slate-50 dark:bg-slate-900 flex flex-col items-center py-8">
      <div className="mb-10">
        <span className="text-xl font-bold text-blue-700 dark:text-blue-400">MV</span>
      </div>
      <nav className="flex flex-col items-center gap-8 w-full">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={
                isActive
                  ? 'text-blue-700 dark:text-blue-400 border-r-4 border-blue-700 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors duration-200 scale-95 active:scale-90 w-full py-2 flex flex-col items-center'
                  : 'text-slate-400 dark:text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors duration-200 scale-95 active:scale-90 w-full py-2 flex flex-col items-center'
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-[10px] font-medium tracking-wider uppercase mt-1">{item.name}</span>
            </button>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-6">
        <button className="text-slate-400 dark:text-slate-500 hover:text-blue-600">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <button onClick={handleLogout} className="text-slate-400 dark:text-slate-500 hover:text-blue-600">
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </aside>
  );
}
