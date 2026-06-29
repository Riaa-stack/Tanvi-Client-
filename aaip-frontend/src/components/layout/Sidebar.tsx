import { 
  LayoutDashboard, BookOpen, FileText, Search, MessageSquare, 
  Lightbulb, Bookmark, User, Settings, Users, BarChart3, Database, Workflow
} from 'lucide-react'
import { SidebarItem } from './SidebarItem'
import { useAuth } from '@/hooks/useAuth'
import { useThemeStore } from '@/store/theme.store'

interface SidebarProps {
  role: 'student' | 'admin' | 'super_admin'
}

export function Sidebar({ role }: SidebarProps) {
  const { sidebarCollapsed } = useThemeStore()
  
  const studentLinks = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { type: 'divider', label: 'Study' },
    { label: 'Subjects', to: '/subjects', icon: BookOpen },
    { label: 'Papers', to: '/papers', icon: FileText },
    { label: 'Search', to: '/search', icon: Search },
    { type: 'divider', label: 'AI Tools' },
    { label: 'AI Tutor', to: '/chat', icon: MessageSquare },
    { label: 'Predictions', to: '/predictions', icon: Lightbulb },
    { type: 'divider', label: 'Personal' },
    { label: 'Bookmarks', to: '/bookmarks', icon: Bookmark },
    { label: 'Profile', to: '/profile', icon: User },
  ]

  const adminLinks = [
    { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
    { type: 'divider', label: 'Content' },
    { label: 'Papers', to: '/admin/papers', icon: FileText },
    { label: 'Subjects', to: '/admin/subjects', icon: BookOpen },
    { label: 'Semesters', to: '/admin/semesters', icon: Database },
    { type: 'divider', label: 'Analytics' },
    { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
    { label: 'AI Jobs', to: '/admin/ai-jobs', icon: Workflow },
  ]

  const superAdminLinks = [
    ...adminLinks,
    { type: 'divider', label: 'Admin' },
    { label: 'Users', to: '/admin/users', icon: Users },
  ]

  const links = role === 'student' ? studentLinks : (role === 'admin' ? adminLinks : superAdminLinks)

  return (
    <aside 
      className={`
        bg-surface-card border-r border-default h-[calc(100vh-var(--header-height))]
        overflow-y-auto overflow-x-hidden transition-all duration-300
        ${sidebarCollapsed ? 'w-[var(--sidebar-collapsed)]' : 'w-[var(--sidebar-width)]'}
      `}
    >
      <nav className="p-3">
        {links.map((link, i) => {
          if (link.type === 'divider') {
            return (
              <div key={`div-${i}`} className="mt-6 mb-2">
                {!sidebarCollapsed ? (
                  <h4 className="px-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    {link.label}
                  </h4>
                ) : (
                  <div className="h-px bg-border-default mx-3" />
                )}
              </div>
            )
          }
          return <SidebarItem key={link.to} label={link.label!} icon={link.icon!} to={link.to!} />
        })}
      </nav>
    </aside>
  )
}
