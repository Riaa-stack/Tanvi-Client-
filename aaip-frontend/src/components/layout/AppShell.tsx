import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { ContentArea } from './ContentArea'
import { useAuth } from '@/hooks/useAuth'
import { InteractiveBackground } from '@/components/ui/InteractiveBackground'

interface AppShellProps {
  role: 'student' | 'admin' | 'super_admin'
}

export function AppShell({ role }: AppShellProps) {
  const { user } = useAuth()
  
  // Ensure current user actually matches the shell's role requirement, fallback safely
  const actualRole = user?.role || role

  return (
    <div className="min-h-screen bg-transparent flex flex-col text-primary font-sans relative">
      <InteractiveBackground />
      <Header />
      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar role={actualRole as any} />
        <ContentArea>
          <div className="p-6 md:p-8">
            <Outlet />
          </div>
        </ContentArea>
      </div>
    </div>
  )
}
