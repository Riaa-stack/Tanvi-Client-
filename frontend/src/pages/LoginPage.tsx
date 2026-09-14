import React, { useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { authApi } from '@/services/api/auth';
import { StickyNote } from '@/components/notebook/StickyNote';
import { toast } from '@/store/useToastStore';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await authApi.login({ email, password });
      if (res.success && res.data) {
        const { access_token, refresh_token, user } = res.data;
        login(access_token, refresh_token, user);
        toast.success(`Welcome back, ${user.name}!`);

        if (user.role === 'TEACHER') {
          navigate('/teacher/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        setErrorMessage(res.error?.message || 'Invalid email or password.');
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
          'Failed to connect to server. Please ensure the backend is running.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (role: 'STUDENT' | 'TEACHER') => {
    if (role === 'STUDENT') {
      setEmail('student@eduarchive.ai');
      setPassword('StudentPassword123!');
    } else {
      setEmail('teacher@eduarchive.ai');
      setPassword('TeacherPassword123!');
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

      {/* Login Card */}
      <div className="w-full max-w-md bg-[#fdfbf7] notebook-ruled-bg rounded-3xl shadow-notebook border border-stone-300 p-8 relative overflow-hidden">
        {/* Session Expired Banner */}
        {searchParams.get('expired') && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
            Your session has expired. Please sign in again.
          </div>
        )}

        <div className="mb-6">
          <h1 className="font-handwriting font-bold text-2xl md:text-3xl text-ink">
            Open Your Notebook 📖
          </h1>
          <p className="text-xs text-slate-600 font-sans mt-1">
            Sign in to access your study intelligence and past papers.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
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
                placeholder="you@eduarchive.ai"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 bg-white/90 text-sm font-sans text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 font-sans">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={16} />
              </div>
              <input
                type="password"
                required
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
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* One-Click Demo Accounts Sticky Note */}
        <div className="mt-6 pt-4 border-t border-stone-200">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono text-center">
            ⚡ Quick Demo Accounts
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('STUDENT')}
              className="p-2 text-xs font-semibold rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-center transition-colors font-sans"
            >
              🎓 Student Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('TEACHER')}
              className="p-2 text-xs font-semibold rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-center transition-colors font-sans"
            >
              👨‍🏫 Teacher Demo
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-5 text-center text-xs text-slate-600 font-sans">
          Don't have an account?{' '}
          <NavLink to="/register" className="font-bold text-brand-600 hover:underline">
            Register here
          </NavLink>
        </div>
      </div>
    </div>
  );
};
