import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { name: 'Games',     path: '/games',     icon: 'extension' },
  { name: 'Reports',   path: '/reports',   icon: 'assessment' },
  { name: 'Chat',      path: '/chat',      icon: 'forum' },
  { name: 'Tasks',     path: '/tasks',     icon: 'person' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('mode');
    navigate('/');
  };

  return (
    <aside className="h-screen w-20 fixed left-0 top-0 z-50 bg-slate-50 flex flex-col items-center py-8 border-r border-slate-100">
      {/* Logo */}
      <div className="mb-10">
        <img src="/logo.jpeg" alt="Manasveda Logo" className="w-10 h-10 object-cover rounded-full shadow-sm" />
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col items-center gap-2 w-full flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`w-full py-2.5 flex flex-col items-center transition-colors duration-200 group
                ${isActive
                  ? 'text-blue-700 border-r-[3px] border-blue-700 bg-blue-50/50'
                  : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50/30 border-r-[3px] border-transparent'
                }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span className="text-[9px] font-semibold tracking-wider uppercase mt-1">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col items-center gap-5 mt-auto">
        <button className="text-slate-400 hover:text-blue-600 transition-colors">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <button
          onClick={handleLogout}
          className="text-slate-400 hover:text-red-500 transition-colors"
          title="Logout"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </aside>
  );
}
