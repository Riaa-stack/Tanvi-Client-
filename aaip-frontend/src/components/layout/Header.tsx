import { Menu, Search, Sun, Moon, LogOut } from 'lucide-react'
import { useThemeStore } from '@/store/theme.store'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function Header() {
  const { theme, toggleTheme, sidebarCollapsed, setSidebarCollapsed } = useThemeStore()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="h-[var(--header-height)] bg-surface-card border-b border-default sticky top-0 z-30 px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1.5 rounded-md text-secondary hover:bg-surface-sunken transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        
        <div 
          className="text-brand-primary font-bold text-xl cursor-pointer tracking-tight"
          onClick={() => navigate(user?.role === 'student' ? '/dashboard' : '/admin')}
        >
          AAIP
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-8 hidden md:block">
        <div 
          onClick={() => navigate('/search')}
          className="w-full bg-surface-sunken border border-default rounded-md px-4 py-1.5 flex items-center gap-2 text-muted cursor-text hover:border-strong transition-colors"
        >
          <Search size={16} />
          <span className="text-sm">Search questions...</span>
          <div className="ml-auto flex gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] rounded border border-default bg-surface-card text-secondary">⌘</kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] rounded border border-default bg-surface-card text-secondary">K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />

        <div className="h-6 w-[1px] bg-border-default mx-2"></div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-medium text-primary leading-tight">{user?.full_name}</span>
            <span className="text-xs text-muted leading-tight capitalize">{user?.role.replace('_', ' ')}</span>
          </div>
          
          <button 
            onClick={() => logout()}
            className="p-2 rounded-md text-danger hover:bg-danger-bg transition-colors focus-ring"
            title="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
