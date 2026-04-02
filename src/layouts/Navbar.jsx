import { Link, useLocation, useNavigate } from "react-router-dom"
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// Quick utility for class names inside Navbar
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const userData = JSON.parse(localStorage.getItem('user') || '{}')
  const userName = userData.name || "User"
  
  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "Games", path: "/games" },
    { name: "Chat", path: "/chat" },
    { name: "Tasks", path: "/tasks" },
    { name: "Reports", path: "/reports" },
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 border-[0.5px] border-gray-200 dark:border-gray-700 rounded-2xl py-3 px-6 mb-6 shadow-sm">
      <div className="text-xl font-bold text-gray-900 dark:text-white shrink-0">
        <span className="text-indigo-600">Cog</span>Guard
      </div>
      
      <div className="flex gap-2 hidden md:flex">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "text-sm font-semibold px-4 py-2 rounded-xl border border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all",
                isActive && "bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800"
              )}
            >
              {item.name}
            </Link>
          )
        })}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
          <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
            {userName.substring(0, 2).toUpperCase()}
          </div>
          <span className="hidden sm:inline truncate max-w-[120px]">{userName}</span>
        </div>
        <button 
          onClick={handleLogout}
          className="text-sm font-semibold text-gray-400 hover:text-red-500 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
