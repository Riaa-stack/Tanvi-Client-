import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormField } from '@/components/forms/FormField'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { X, BrainCircuit } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

const registerSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginValues = z.infer<typeof loginSchema>
type RegisterValues = z.infer<typeof registerSchema>

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'register'
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const { login, register: registerAccount, isLoggingIn, isRegistering } = useAuth()
  
  const loginForm = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })
  const registerForm = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) })

  const onLoginSubmit = async (data: LoginValues) => {
    try {
      await login(data)
      onClose()
    } catch (e) {
      // handled globally
    }
  }

  const onRegisterSubmit = async (data: RegisterValues) => {
    try {
      await registerAccount(data)
      onClose()
    } catch (e) {
      // handled globally
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="clay-card w-full max-w-md bg-surface-card p-8 pointer-events-auto relative"
            >
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-muted hover:text-primary rounded-full hover:bg-surface-sunken transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center mb-8">
                <div className="w-12 h-12 bg-info-bg text-info rounded-full flex items-center justify-center mb-4">
                  <BrainCircuit size={24} />
                </div>
                <h2 className="text-2xl font-bold text-primary tracking-tight">
                  {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-secondary text-sm mt-1">
                  {mode === 'login' ? 'Enter your credentials to continue' : 'Join AAIP to master your exams'}
                </p>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {mode === 'login' ? (
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField label="Email Address" error={loginForm.formState.errors.email?.message} required>
                        <input 
                          {...loginForm.register('email')}
                          type="email"
                          className="h-[var(--input-height)] w-full px-3 rounded-[var(--input-radius)] border border-default bg-[var(--input-bg)] focus-ring transition-colors"
                          placeholder="student@university.edu"
                        />
                      </FormField>
                      
                      <FormField label="Password" error={loginForm.formState.errors.password?.message} required>
                        <input 
                          {...loginForm.register('password')}
                          type="password"
                          className="h-[var(--input-height)] w-full px-3 rounded-[var(--input-radius)] border border-default bg-[var(--input-bg)] focus-ring transition-colors"
                          placeholder="••••••••"
                        />
                      </FormField>
                      
                      <Button type="submit" className="clay-btn-primary w-full mt-6 h-12 text-base" isLoading={isLoggingIn}>
                        Log In
                      </Button>
                      
                      <div className="mt-6 text-center text-sm text-secondary">
                        Don't have an account?{' '}
                        <button type="button" onClick={() => setMode('register')} className="text-info hover:underline font-semibold">
                          Register here
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField label="Full Name" error={registerForm.formState.errors.full_name?.message} required>
                        <input 
                          {...registerForm.register('full_name')}
                          type="text"
                          className="h-[var(--input-height)] w-full px-3 rounded-[var(--input-radius)] border border-default bg-[var(--input-bg)] focus-ring transition-colors"
                          placeholder="John Doe"
                        />
                      </FormField>

                      <FormField label="Email Address" error={registerForm.formState.errors.email?.message} required>
                        <input 
                          {...registerForm.register('email')}
                          type="email"
                          className="h-[var(--input-height)] w-full px-3 rounded-[var(--input-radius)] border border-default bg-[var(--input-bg)] focus-ring transition-colors"
                          placeholder="student@university.edu"
                        />
                      </FormField>
                      
                      <FormField label="Password" error={registerForm.formState.errors.password?.message} required>
                        <input 
                          {...registerForm.register('password')}
                          type="password"
                          className="h-[var(--input-height)] w-full px-3 rounded-[var(--input-radius)] border border-default bg-[var(--input-bg)] focus-ring transition-colors"
                          placeholder="••••••••"
                        />
                      </FormField>
                      
                      <Button type="submit" className="clay-btn-primary w-full mt-6 h-12 text-base" isLoading={isRegistering}>
                        Create Account
                      </Button>
                      
                      <div className="mt-6 text-center text-sm text-secondary">
                        Already have an account?{' '}
                        <button type="button" onClick={() => setMode('login')} className="text-info hover:underline font-semibold">
                          Log in
                        </button>
                      </div>
                    </form>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
