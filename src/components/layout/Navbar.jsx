import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn } from "../../lib/utils"

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
    <div className="flex items-center justify-between bg-[var(--color-background-primary)] border-[0.5px] border-[var(--color-border-tertiary)] rounded-xl py-2.5 px-4 mb-3.5">
      <div className="text-[15px] font-medium text-[var(--color-text-primary)] shrink-0">
        <span className="text-[#6d5cf7]">Cog</span>Guard
      </div>
      
      <div className="flex gap-1.5 hidden md:flex">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "text-[12px] px-2.5 py-1.5 rounded-md border-[0.5px] border-[var(--color-border-tertiary)] bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)] transition-colors",
                isActive && "bg-[var(--color-background-info)] text-[var(--color-text-info)] border-[var(--color-border-info)] hover:bg-[var(--color-background-info)]"
              )}
            >
              {item.name}
            </Link>
          )
        })}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)]">
          <div className="w-7 h-7 rounded-full bg-[var(--color-background-info)] flex items-center justify-center text-[11px] font-medium text-[var(--color-text-info)] shrink-0">
            {userName.substring(0, 2).toUpperCase()}
          </div>
          <span className="hidden sm:inline truncate max-w-[100px]">{userName}</span>
        </div>
        <button 
          onClick={handleLogout}
          className="text-xs text-[var(--color-text-tertiary)] hover:text-red-500 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
