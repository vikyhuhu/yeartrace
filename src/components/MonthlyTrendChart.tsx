import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts'
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
    <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg text-white">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📈</span>
        <h3 className="font-bold text-white text-lg">月度趋势</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          {/* 渐变定义 */}
          <defs>
            {displayTasks.map(task => (
              <linearGradient key={`grad-${task.id}`} id={`gradient-${task.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={task.color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={task.color} stopOpacity={0.05} />
              </linearGradient>
            ))}
          </defs>
          {/* 白色水平网格线 */}
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" horizontal={true} vertical={false} opacity={0.5} />
          <XAxis
            dataKey="monthName"
            stroke="rgba(255,255,255,0.8)"
            tick={{ fill: 'rgba(255,255,255,0.9)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="rgba(255,255,255,0.8)"
            tick={{ fill: 'rgba(255,255,255,0.9)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number | undefined, name: string | undefined) => {
              const task = displayTasks.find(t => t.id === name)
              return [`${value || 0}次`, task ? task.name : name]
            }}
            labelFormatter={(label: string) => `${label}`}
            contentStyle={{
              background: 'rgba(30, 41, 59, 0.95)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '16px',
              padding: '12px 16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              color: '#ffffff',
              fontSize: '14px',
            }}
            wrapperStyle={{ outline: 'none' }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '10px' }}
            iconType="circle"
            formatter={(value: string) => {
              const task = displayTasks.find(t => t.id === value)
              return <span style={{ color: 'rgba(255,255,255,0.9)' }}>{task ? task.name : value}</span>
            }}
          />
          {/* 各个任务的线条和渐变填充 */}
          {displayTasks.map(task => (
            <g key={task.id}>
              {/* 渐变填充区域 - 不在图例中显示 */}
              <Area
                type="monotone"
                dataKey={task.id}
                stroke="none"
                fill={`url(#gradient-${task.id})`}
                legendType="none"
                hide
              />
              {/* 折线 - 在图例中显示 */}
              <Line
                type="monotone"
                dataKey={task.id}
                stroke={task.color}
                name={task.id}
                strokeWidth={3}
                dot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 8, strokeWidth: 0, fill: task.color }}
                legendType="circle"
              />
            </g>
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
