import React, { useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { authApi } from '@/services/api/auth';
import { toast } from '@/store/useToastStore';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as 'STUDENT' | 'TEACHER') || 'STUDENT';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'TEACHER'>(initialRole);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Register user
      const regRes = await authApi.register({ name, email, password, role });
      if (!regRes.success) {
        setErrorMessage(regRes.error?.message || 'Registration failed.');
        setIsLoading(false);
        return;
      }

      // 2. Automatically log in after registration
      const loginRes = await authApi.login({ email, password });
      if (loginRes.success && loginRes.data) {
        const { access_token, refresh_token, user } = loginRes.data;
        login(access_token, refresh_token, user);
        toast.success(`Account created! Welcome, ${user.name}!`);

        if (user.role === 'TEACHER') {
          navigate('/teacher/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
          'Failed to register. Please ensure the email is unique and the backend is running.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f1e8] flex flex-col justify-center items-center p-4 selection:bg-brand-100">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <NavLink to="/" className="inline-flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md text-xl font-bold font-handwriting">
            ✏️
          </div>
          <div className="text-left">
            <div className="font-extrabold text-2xl text-ink font-sans tracking-tight">
              EduArchive AI <span className="text-xs text-brand-600 font-mono font-bold bg-brand-50 px-1.5 py-0.5 rounded-full border border-brand-200">2.0</span>
            </div>
            <div className="text-xs text-slate-500 font-handwriting">Smart Academic Intelligence</div>
          </div>
        </NavLink>
      </div>

      {/* Register Card */}
      <div className="w-full max-w-md bg-[#fdfbf7] notebook-ruled-bg rounded-3xl shadow-notebook border border-stone-300 p-8 relative overflow-hidden">
        <div className="mb-6">
          <h1 className="font-handwriting font-bold text-2xl md:text-3xl text-ink">
            Create Your Account ✨
          </h1>
          <p className="text-xs text-slate-600 font-sans mt-1">
            Join EduArchive to analyze past papers and study smarter.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-sans">
              I am registering as:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`p-3 rounded-xl border text-xs font-bold font-sans flex items-center justify-center gap-2 transition-all ${
                  role === 'STUDENT'
                    ? 'bg-brand-600 text-white border-brand-700 shadow-xs'
                    : 'bg-white text-slate-700 border-stone-300 hover:bg-stone-50'
                }`}
              >
                <span>🎓 Student</span>
                {role === 'STUDENT' && <Check size={14} />}
              </button>

              <button
                type="button"
                onClick={() => setRole('TEACHER')}
                className={`p-3 rounded-xl border text-xs font-bold font-sans flex items-center justify-center gap-2 transition-all ${
                  role === 'TEACHER'
                    ? 'bg-brand-600 text-white border-brand-700 shadow-xs'
                    : 'bg-white text-slate-700 border-stone-300 hover:bg-stone-50'
                }`}
              >
                <span>👨‍🏫 Teacher</span>
                {role === 'TEACHER' && <Check size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 font-sans">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User size={16} />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aarav Patel"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 bg-white/90 text-sm font-sans text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 font-sans">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail size={16} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 bg-white/90 text-sm font-sans text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 font-sans">
              Password (min. 8 characters)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={16} />
              </div>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 bg-white/90 text-sm font-sans text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 shadow-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md hover:shadow-brand-200 transition-all flex items-center justify-center gap-2 text-sm font-sans disabled:opacity-60"
          >
            {isLoading ? (
              <span>Creating account...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-600 font-sans">
          Already have an account?{' '}
          <NavLink to="/login" className="font-bold text-brand-600 hover:underline">
            Sign in
          </NavLink>
        </div>
      </div>
    </div>
  );
};
