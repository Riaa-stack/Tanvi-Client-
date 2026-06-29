import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { FormField } from '@/components/forms/FormField'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

const registerSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type RegisterValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const { register: registerAccount, isRegistering } = useAuth()
  
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema)
  })

  const onSubmit = async (data: RegisterValues) => {
    try {
      await registerAccount(data)
    } catch (e) {
      // errors handled by interceptor or component
    }
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-center mb-6 tracking-tight">Create Account</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Full Name" error={errors.full_name?.message} required>
          <input 
            {...register('full_name')}
            type="text"
            className="h-[var(--input-height)] px-3 rounded-[var(--input-radius)] border border-default bg-[var(--input-bg)] focus-ring transition-colors"
            placeholder="John Doe"
          />
        </FormField>

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
        
        <Button type="submit" className="w-full mt-6" isLoading={isRegistering}>
          Register
        </Button>
      </form>
      
      <div className="mt-6 text-center text-sm text-secondary">
        Already have an account? <Link to="/login" className="text-brand-primary hover:underline font-medium">Log in</Link>
      </div>
    </div>
  )
}