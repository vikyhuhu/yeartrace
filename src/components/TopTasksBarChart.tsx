import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { calculateYearStatistics } from '../utils/yearStats'
import type { Task, Log } from '../types'

interface TopTasksBarChartProps {
  year: number
  logs: Log[]
  tasks: Task[]
  filterTaskId?: string | null
}

export function TopTasksBarChart({ year, logs, tasks, filterTaskId }: TopTasksBarChartProps) {
  const topTasks = useMemo(() => {
    const stats = calculateYearStatistics(year, logs, tasks, filterTaskId)
    return stats.topTasks
  }, [year, logs, tasks, filterTaskId])

  if (topTasks.length === 0) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg border border-indigo-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📊</span>
          <h3 className="font-bold text-gray-800 dark:text-white text-lg">最活跃任务 Top 3</h3>
        </div>
        <div className="text-center py-8 text-gray-400">暂无数据</div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg border border-indigo-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📊</span>
        <h3 className="font-bold text-gray-800 dark:text-white text-lg">最活跃任务 Top 3</h3>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart
          data={topTasks}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
          <XAxis type="number" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
          <YAxis
            dataKey="taskName"
            type="category"
            width={80}
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number | undefined) => [`${value || 0}次`, '完成次数']}
            contentStyle={{
              backgroundColor: 'rgba(79, 70, 229, 0.95)',
              color: '#fff',
              borderRadius: '12px',
              padding: '10px 14px',
              border: 'none',
            }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
            {topTasks.map((task, index) => (
              <Cell key={`cell-${index}`} fill={task.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
