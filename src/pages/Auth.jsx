import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { GraduationCap, Lock, Mail, User, ShieldAlert, ArrowRight, BookOpen } from 'lucide-react';

export default function Auth() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');

  // Error / Loading State
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      if (!email || !password) {
        setError('Please enter both your email and password.');
        setLoading(false);
        return;
      }
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error);
      }
    } else {
      // Validate registration
      if (!name || !email || !password || !confirmPassword) {
        setError('All registration fields are required.');
        setLoading(false);
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Confirm password must match the original password.');
        setLoading(false);
        return;
      }

      const res = await register(name, email, password, confirmPassword, role);
      if (!res.success) {
        setError(res.error);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950 font-sans">
      {/* Visual Left Banner (Interactive/Modern Display Card) */}
      <div className="hidden lg:flex w-1/2 bg-indigo-600 dark:bg-indigo-950 relative flex-col justify-between p-12 text-white overflow-hidden">
        {/* Abstract background blobs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse delay-75"></div>

        <div className="relative flex items-center gap-3">
          <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl text-white flex items-center justify-center border border-white/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">EDUARCHIVE AI 2.0</span>
        </div>

        <div className="relative space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/20">University Intelligence Hub</span>
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
            Predict exam patterns and master academic syllabi with Gemini-powered AI models.
          </h2>
          <p className="text-indigo-200 text-sm max-w-md font-medium leading-relaxed">
            Upload previous year exam papers, extract structured questions instantly via OCR, map core curriculum units, and interact with your personal AI study assistant.
          </p>
        </div>

        <div className="relative flex items-center gap-6 text-sm text-indigo-100 font-medium">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-8 w-8 rounded-full border-2 border-indigo-600 dark:border-indigo-950 bg-indigo-400 flex items-center justify-center font-bold text-xs">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <span>Trusted by 450+ students & educators</span>
        </div>
      </div>

      {/* Form Right Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-left">
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="font-extrabold tracking-tight dark:text-white">EDUARCHIVE AI</span>
            </div>
            <h3 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1.5">
              {isLogin 
                ? 'Sign in to access academic models and papers repository.' 
                : 'Get started and explore academic intelligence tools.'}
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <span className="text-sm font-semibold text-red-700 dark:text-red-300">{error}</span>
              </div>
            )}

            {/* Registration Fields */}
            {!isLogin && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Dr. Alexander Wright"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white transition-all"
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Role Assignment</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`py-2.5 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        role === 'student'
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                          : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900'
                      }`}
                    >
                      <BookOpen className="h-4 w-4" />
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`py-2.5 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        role === 'admin'
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                          : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900'
                      }`}
                    >
                      <ShieldAlert className="h-4 w-4" />
                      Academic Admin
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@eduarchive.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white transition-all"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white transition-all"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Confirm Password (Registration Only) */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Confirm Password</label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Verify password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white transition-all"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch Tab */}
          <div className="text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
