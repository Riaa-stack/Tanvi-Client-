import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface DifficultyDonutProps {
  easy: number
  medium: number
  hard: number
}

const COLORS = {
  easy: 'var(--difficulty-easy)',
  medium: 'var(--difficulty-medium)',
  hard: 'var(--difficulty-hard)'
}

export function DifficultyDonut({ easy, medium, hard }: DifficultyDonutProps) {
  const data = [
    { name: 'Easy', value: easy, color: COLORS.easy },
    { name: 'Medium', value: medium, color: COLORS.medium },
    { name: 'Hard', value: hard, color: COLORS.hard },
  ].filter(d => d.value > 0)

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
