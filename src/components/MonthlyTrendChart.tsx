import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { calculateMonthlyTrend } from '../utils/yearStats'
import type { Task, Log } from '../types'

interface MonthlyTrendChartProps {
  year: number
  logs: Log[]
  tasks: Task[]
  filterTaskId?: string | null
}

export function MonthlyTrendChart({ year, logs, tasks, filterTaskId }: MonthlyTrendChartProps) {
  // 计算要显示的任务ID列表
  const taskIds = useMemo(() => {
    if (filterTaskId) return [filterTaskId]
    return tasks.filter(t => t.status === 'active').map(t => t.id)
  }, [filterTaskId, tasks])

  const monthlyData = useMemo(() => {
    return calculateMonthlyTrend(year, logs, tasks, taskIds)
  }, [year, logs, tasks, taskIds])

  // 要显示的任务
  const displayTasks = filterTaskId
    ? tasks.filter(t => t.id === filterTaskId)
    : tasks.filter(t => t.status === 'active')

  return (
    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg border border-teal-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📈</span>
        <h3 className="font-bold text-gray-800 dark:text-white text-lg">月度趋势</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ccfbf1" />
          <XAxis
            dataKey="monthName"
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <YAxis
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number | undefined, name: string | undefined) => [`${value || 0}次`, name || '']}
            labelFormatter={(label: string) => `${label}`}
            contentStyle={{
              backgroundColor: 'rgba(20, 184, 166, 0.95)',
              color: '#fff',
              borderRadius: '12px',
              padding: '10px 14px',
              border: 'none',
            }}
          />
          <Legend />
          {/* 各个任务的线条 */}
          {displayTasks.map(task => (
            <Line
              key={task.id}
              type="monotone"
              dataKey={task.id}
              stroke={task.color}
              name={task.name}
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 7, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
