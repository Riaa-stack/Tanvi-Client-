import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { FormField } from '@/components/forms/FormField'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth()
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginValues) => {
    try {
      await login(data)
    } catch (e) {
      // Handled globally or can show local toast
    }
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-center mb-6 tracking-tight">Welcome Back</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Email Address" error={errors.email?.message} required>
          <input 
            {...register('email')}
            type="email"
            className="h-[var(--input-height)] px-3 rounded-[var(--input-radius)] border border-default bg-[var(--input-bg)] focus-ring transition-colors"
            placeholder="student@university.edu"
          />
        </FormField>
        
        <FormField label="Password" error={errors.password?.message} required>
          <input 
            {...register('password')}
            type="password"
            className="h-[var(--input-height)] px-3 rounded-[var(--input-radius)] border border-default bg-[var(--input-bg)] focus-ring transition-colors"
            placeholder="••••••••"
          />
        </FormField>
        
        <Button type="submit" className="w-full mt-6" isLoading={isLoggingIn}>
          Log In
        </Button>
      </form>
      
      <div className="mt-6 text-center text-sm text-secondary">
        Don't have an account? <Link to="/register" className="text-brand-primary hover:underline font-medium">Register here</Link>
      </div>
    </div>
  )
}