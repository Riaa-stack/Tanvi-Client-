import { NavLink } from 'react-router-dom'
import { LucideIcon } from 'lucide-react'
import { useThemeStore } from '@/store/theme.store'

interface SidebarItemProps {
  label: string
  icon: LucideIcon
  to: string
}

export function SidebarItem({ label, icon: Icon, to }: SidebarItemProps) {
  const { sidebarCollapsed } = useThemeStore()

  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex items-center gap-3 px-3 py-2 my-1 rounded-md transition-colors relative group focus-ring
        ${isActive 
          ? 'bg-brand-accent text-brand-primary' 
          : 'text-secondary hover:bg-surface-sunken hover:text-primary'}
      `}
      title={sidebarCollapsed ? label : undefined}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute left-0 top-1 bottom-1 w-1 bg-brand-primary rounded-r-md" />
          )}
          <Icon size={18} className="shrink-0" />
          {!sidebarCollapsed && (
            <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
              {label}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}
