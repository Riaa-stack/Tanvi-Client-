import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useAuthStore } from '@/store/auth.store'
import { InteractiveBackground } from '@/components/ui/InteractiveBackground'
import { AuthModal } from '@/components/auth/AuthModal'
import { BrainCircuit, BookOpen, TrendingUp, Search, Sparkles, Activity, Users, FileText } from 'lucide-react'

export default function LandingPage() {
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()
  
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'register' }>({
    isOpen: false,
    mode: 'login'
  })

  // Scroll parallax for main sections
  const { scrollYProgress } = useScroll()
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.5])
  const featuresScale = useTransform(scrollYProgress, [0.1, 0.3], [0.95, 1])

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <InteractiveBackground />
      
      {/* Auth Modal Overlay */}
      <AuthModal 
        isOpen={authModal.isOpen} 
        onClose={() => setAuthModal({ ...authModal, isOpen: false })} 
        initialMode={authModal.mode} 
      />
      
      {/* Header Area */}
      <header className="flex justify-between items-center p-6 lg:px-12 relative z-10">
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-info" size={32} />
          <span className="text-2xl font-bold tracking-tight text-primary">AAIP.</span>
        </div>
        <div>
          {isAuthenticated ? (
            <button 
              onClick={() => navigate(user?.role === 'student' ? '/dashboard' : '/admin')}
              className="clay-btn-primary px-6 py-2 text-sm"
            >
              Dashboard
            </button>
          ) : (
            <div className="flex gap-4 items-center">
              <button 
                onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
                className="font-medium text-secondary hover:text-primary transition-colors"
              >
                Login
              </button>
              <button 
                onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
                className="clay-btn-primary px-6 py-2 text-sm"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Hero Section */}
      <motion.main 
        style={{ scale: heroScale, opacity: heroOpacity }}
        className="flex-1 flex flex-col justify-center items-center px-6 lg:px-12 relative z-10 min-h-[85vh]"
      >
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center py-12">
          
          {/* Left Column: Copy */}
          <div className="space-y-8 text-left z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-card border border-info shadow-sm text-sm font-medium text-info mb-2"
            >
              <Sparkles size={16} /> 
              Next-Generation Study AI
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl lg:text-7xl font-bold text-primary tracking-tight leading-[1.1]"
            >
              Master your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-info to-success">
                examinations
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-secondary max-w-lg leading-relaxed"
            >
              Upload past papers. Analyze syllabus trends. Talk to your AI Tutor. Get highly probable exam predictions in seconds.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              {!isAuthenticated && (
                <>
                  <button 
                    onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
                    className="clay-btn-primary px-8 py-4 text-lg text-center flex items-center justify-center gap-2 group"
                  >
                    Start Learning Free
                    <TrendingUp size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
                    className="clay-card px-8 py-4 text-lg font-semibold text-primary text-center flex items-center justify-center hover:bg-surface-sunken transition-colors"
                  >
                    Sign In
                  </button>
                </>
              )}
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="pt-8 flex gap-8 text-sm font-medium text-secondary"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                10k+ Questions Processed
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-warning animate-pulse"></div>
                95% Prediction Accuracy
              </div>
            </motion.div>
          </div>

          {/* Right Column: Visual Elements */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: -2 }}
            transition={{ type: 'spring', damping: 20, delay: 0.2 }}
            className="relative w-full h-[500px] flex items-center justify-center"
          >
            {/* Main Mockup Card */}
            <div className="clay-card w-full max-w-[480px] p-6 relative z-10 hover:rotate-2 transition-transform duration-500 bg-surface-card/90 backdrop-blur">
              <div className="flex items-center gap-3 mb-6 border-b border-default pb-4">
                <div className="w-10 h-10 rounded-full bg-info-bg flex items-center justify-center text-info">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-primary">AI Tutor Response</h3>
                  <p className="text-xs text-muted">Data Structures • Unit 3</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="h-4 bg-surface-sunken rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-surface-sunken rounded w-full animate-pulse"></div>
                <div className="h-4 bg-surface-sunken rounded w-5/6 animate-pulse"></div>
              </div>
              
              <div className="clay-card bg-surface-page p-4 border border-default border-dashed">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-warning flex items-center gap-1"><Sparkles size={14}/> 92% Probable</span>
                  <span className="text-secondary">10 Marks</span>
                </div>
                <p className="mt-2 text-primary font-semibold text-sm leading-relaxed">
                  "Explain the difference between a B-Tree and a B+ Tree with examples."
                </p>
              </div>
            </div>

            {/* Floating Accents */}
            <motion.div 
              animate={{ y: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute top-10 right-10 clay-card p-4 text-success"
            >
              <TrendingUp size={24} />
            </motion.div>
            
            <motion.div 
              animate={{ y: [10, -10, 10] }}
              transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
              className="absolute bottom-20 left-4 clay-card p-4 text-danger"
            >
              <BookOpen size={24} />
            </motion.div>
          </motion.div>
        </div>
      </motion.main>

      {/* Statistics Section */}
      <div className="relative z-10 bg-info border-y border-info/20 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-white">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">50k+</div>
            <div className="text-info-bg/80 text-sm font-medium">Students Enrolled</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">12M+</div>
            <div className="text-info-bg/80 text-sm font-medium">Questions Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">95%</div>
            <div className="text-info-bg/80 text-sm font-medium">Prediction Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">24/7</div>
            <div className="text-info-bg/80 text-sm font-medium">AI Tutor Availability</div>
          </div>
        </div>
      </div>

      {/* Features Section with Parallax */}
      <motion.section 
        style={{ scale: featuresScale }}
        className="relative z-10 bg-surface-card py-24 px-6 lg:px-12 origin-bottom"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-4">Everything you need to ace finals</h2>
            <p className="text-secondary max-w-2xl mx-auto text-lg">We combine your university's exact syllabus with past paper data to build a custom intelligence layer just for you.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div whileHover={{ y: -8 }} className="clay-card p-8 group cursor-default">
              <div className="w-12 h-12 bg-info-bg text-info rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Search size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Semantic Search</h3>
              <p className="text-secondary leading-relaxed">Find any concept across all your past papers instantly using natural language queries. No more digging through PDFs.</p>
            </motion.div>
            
            <motion.div whileHover={{ y: -8 }} className="clay-card p-8 group cursor-default transform md:-translate-y-4">
              <div className="w-12 h-12 bg-warning-bg text-warning rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Predictions</h3>
              <p className="text-secondary leading-relaxed">Know exactly what to study. Our models predict the highest probability questions for the upcoming exam based on historical trends.</p>
            </motion.div>
            
            <motion.div whileHover={{ y: -8 }} className="clay-card p-8 group cursor-default">
              <div className="w-12 h-12 bg-success-bg text-success rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BrainCircuit size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Personal Tutor</h3>
              <p className="text-secondary leading-relaxed">Chat with an AI that intimately knows your syllabus. Ask it to explain topics, solve past paper questions, or grade your answers.</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* How it Works / Timeline Section */}
      <section className="relative z-10 bg-surface-page py-24 px-6 lg:px-12 border-t border-default">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">How it works</h2>
            <p className="text-secondary">Three simple steps to exam readiness.</p>
          </div>

          <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border-strong before:to-transparent">
            {/* Step 1 */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface-page bg-info text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                1
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] clay-card p-6">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="text-info" size={20} />
                  <h4 className="font-bold text-lg">Upload Data</h4>
                </div>
                <p className="text-secondary text-sm">Administrators upload university past papers and syllabus PDFs. AAIP extracts every question automatically.</p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface-page bg-warning text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                2
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] clay-card p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="text-warning" size={20} />
                  <h4 className="font-bold text-lg">AI Processing</h4>
                </div>
                <p className="text-secondary text-sm">Our AI classifies each question by topic, unit, and difficulty, linking them directly to the syllabus tree to find patterns.</p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface-page bg-success text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                3
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] clay-card p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="text-success" size={20} />
                  <h4 className="font-bold text-lg">Student Access</h4>
                </div>
                <p className="text-secondary text-sm">Students log in to search topics, view probability models, and chat with the AI tutor based solely on their university's curriculum.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      <footer className="bg-surface-card border-t border-default py-8 text-center text-sm text-secondary relative z-10">
        AAIP - AI Academic Intelligence Platform &copy; 2026. Built for students.
      </footer>
    </div>
  )
}