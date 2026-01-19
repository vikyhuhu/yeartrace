import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts'
import { format } from 'date-fns'
import { calculateTaskDetailStatistics } from '../utils/yearStats'
import type { Task, Log } from '../types'

interface TaskDetailPanelProps {
  task: Task
  year: number
  logs: Log[]
  onClose: () => void
}

export function TaskDetailPanel({ task, year, logs, onClose }: TaskDetailPanelProps) {
  const currentMonth = new Date().getMonth()

  const stats = useMemo(() => {
    return calculateTaskDetailStatistics(task, year, currentMonth, logs)
  }, [task, year, currentMonth, logs])

  const statCardStyles = [
    { gradient: 'from-blue-50 to-blue-100', border: 'border-blue-200', text: 'text-blue-600' },
    { gradient: 'from-emerald-50 to-emerald-100', border: 'border-emerald-200', text: 'text-emerald-600' },
    { gradient: 'from-violet-50 to-violet-100', border: 'border-violet-200', text: 'text-violet-600' },
    { gradient: 'from-amber-50 to-amber-100', border: 'border-amber-200', text: 'text-amber-600' },
  ]

  const statIcons = ['📊', '📈', '🔥', '🎯']
  const statTitles = ['总完成次数', '平均每周/次', '最长连续/天', '本月完成']
  const statValues = [
    stats.totalCompletions.toString(),
    stats.avgWeeklyCompletions.toFixed(1),
    stats.longestStreak.toString(),
    stats.monthlyCompletions.toString(),
  ]

  return (
    <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg text-white">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full shadow-md"
            style={{ backgroundColor: task.color }}
          />
          <h3 className="text-xl font-bold text-white">{task.name}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 核心统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCardStyles.map((style, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${style.gradient} rounded-2xl p-5 text-center border ${style.border} shadow-md hover:shadow-lg transition-shadow`}
          >
            <div className="text-3xl mb-2">{statIcons[index]}</div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{statValues[index]}</div>
            <div className="text-sm text-gray-700 font-semibold">{statTitles[index]}</div>
          </div>
        ))}
      </div>

      {/* 数字类型任务：趋势图 */}
      {task.type === 'number' && stats.trendData && stats.trendData.length > 0 && (
        <div className="mb-6 bg-white/10 rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📈</span>
            <h4 className="text-sm font-semibold text-white">年度趋势</h4>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats.trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              {/* 渐变定义 */}
              <defs>
                <linearGradient id="gradient-trend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={task.color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={task.color} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              {/* 白色水平网格线 */}
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={true} vertical={false} opacity={0.5} />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(new Date(value), 'MM/dd')}
                stroke="rgba(255,255,255,0.6)"
                tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value) => `${value}${task.unit || ''}`}
                stroke="rgba(255,255,255,0.6)"
                tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: number | undefined) => [`${value || 0}${task.unit || ''}`, task.unit || '数值']}
                labelFormatter={(value) => format(new Date(value), 'MM月dd日')}
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
              {/* 渐变填充区域 */}
              <Area
                type="monotone"
                dataKey="value"
                stroke="none"
                fill="url(#gradient-trend)"
              />
              {/* 折线 */}
              <Line
                type="monotone"
                dataKey="value"
                stroke={task.color}
                strokeWidth={3}
                dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: task.color }}
                activeDot={{ r: 7, strokeWidth: 0, fill: task.color }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 文本类型任务：列表 */}
      {task.type === 'check+text' && stats.textEntries && stats.textEntries.length > 0 && (
        <div className="mb-6 bg-white/10 rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📝</span>
            <h4 className="text-sm font-semibold text-white">记录列表</h4>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {stats.textEntries.slice(0, 20).map((entry, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-white/10 to-white/5 rounded-lg p-3 border border-white/10"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-300">{format(new Date(entry.date), 'MM月dd日')}</span>
                  {entry.rating && (
                    <span className="text-yellow-400 text-sm">{'★'.repeat(entry.rating)}</span>
                  )}
                </div>
                <p className="text-sm text-white">{entry.text}</p>
              </div>
            ))}
            {stats.textEntries.length > 20 && (
              <div className="text-center text-xs text-gray-400 py-2">
                显示最近 20 条记录，共 {stats.textEntries.length} 条
              </div>
            )}
          </div>
        </div>
      )}

      {/* 评分分布 */}
      {stats.ratingDistribution && stats.ratingDistribution.length > 0 && (
        <div className="bg-white/10 rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">⭐</span>
            <h4 className="text-sm font-semibold text-white">评分分布</h4>
          </div>
          <div className="flex items-end gap-2">
            {stats.ratingDistribution.map(({ rating, count }) => {
              const maxCount = Math.max(...stats.ratingDistribution!.map(r => r.count))
              return (
                <div key={rating} className="flex-1 flex flex-col items-center">
                  <div className="text-xs text-white mb-1 font-medium">{rating}星</div>
                  <div className="w-full bg-white/10 rounded-t-lg relative" style={{ height: `${Math.max((count / maxCount) * 100, 10)}%`, minHeight: '40px' }}>
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg transition-all"
                      style={{ height: '100%' }}
                    />
                  </div>
                  <div className="text-xs text-white mt-2 font-semibold">{count}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
