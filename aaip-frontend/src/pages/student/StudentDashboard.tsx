import React from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { studentApi } from '@/api/student.api'
import { queryKeys } from '@/config/queryClient'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { BookOpen, TrendingUp, Sparkles, AlertCircle } from 'lucide-react'

export default function StudentDashboard() {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: queryKeys.student.recommendations,
    queryFn: () => studentApi.getRecommendations().then(r => r.data.data),
  })

  return (
    <div>
      <PageHeader 
        title="Dashboard" 
        subtitle="Welcome back. Here is your study overview for today."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card-base flex flex-col items-center text-center p-6 bg-brand-primary text-text-on-brand">
          <BookOpen size={32} className="mb-4 opacity-80" />
          <h3 className="text-xl font-bold mb-2">Resume Study</h3>
          <p className="text-sm opacity-90 mb-6">Continue where you left off in Data Structures</p>
          <Link to="/subjects" className="w-full">
            <Button variant="secondary" className="w-full text-brand-primary hover:text-brand-secondary">View Subjects</Button>
          </Link>
        </div>

        <div className="card-base flex flex-col items-center text-center p-6 bg-surface-elevated">
          <TrendingUp size={32} className="mb-4 text-warning" />
          <h3 className="text-xl font-bold mb-2 text-primary">Exam Predictions</h3>
          <p className="text-sm text-secondary mb-6">See what topics are likely to appear this year</p>
          <Link to="/predictions" className="w-full">
            <Button variant="outline" className="w-full">Explore Predictions</Button>
          </Link>
        </div>

        <div className="card-base flex flex-col items-center text-center p-6 bg-surface-elevated">
          <Sparkles size={32} className="mb-4 text-brand-primary" />
          <h3 className="text-xl font-bold mb-2 text-primary">AI Tutor</h3>
          <p className="text-sm text-secondary mb-6">Stuck on a concept? Chat with our AI.</p>
          <Link to="/chat" className="w-full">
            <Button variant="outline" className="w-full">Open Chat</Button>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <AlertCircle size={20} className="text-brand-primary" />
          Recommended for you
        </h2>
        {isLoading ? (
          <div className="h-32 animate-shimmer rounded-md bg-surface-sunken"></div>
        ) : recommendations && recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map(rec => (
              <div key={rec.id} className="card-base p-4 hover:border-strong transition-colors cursor-pointer flex justify-between items-start">
                <div>
                  <h4 className="font-medium mb-1">
                    {rec.entity_type === 'topic' ? rec.topic?.name : `Review ${rec.entity_type}`}
                  </h4>
                  <p className="text-sm text-secondary">{rec.reason}</p>
                </div>
                <div className="bg-brand-accent text-brand-primary px-2 py-1 rounded text-xs font-bold">
                  Score: {rec.score}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-secondary">No recommendations right now. Start studying to generate some!</p>
        )}
      </div>
    </div>
  )
}