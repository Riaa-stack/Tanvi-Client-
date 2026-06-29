import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TopicTrend } from '@/types/models'

interface TrendLineChartProps {
  data: TopicTrend[]
}

export function TrendLineChart({ data }: TrendLineChartProps) {
  // Transform data into series if needed, assuming simple flat for now
  // In a real app we might group by topic_name and have multiple lines
  // Let's do a basic single line for demonstration or aggregated view
  
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
          <XAxis dataKey="exam_year" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}
            itemStyle={{ color: 'var(--text-primary)' }}
          />
          <Line type="monotone" dataKey="question_count" stroke="var(--brand-primary)" strokeWidth={3} dot={{ fill: 'var(--brand-primary)', r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
