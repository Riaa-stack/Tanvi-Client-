import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-surface-page flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-primary tracking-tight">AAIP</h1>
      </div>
      <div className="w-full max-w-[400px] card-base shadow-lg">
        <Outlet />
      </div>
    </div>
  )
}
