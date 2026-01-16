import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
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
    <div className="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full shadow-md"
            style={{ backgroundColor: task.color }}
          />
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">{task.name}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 核心统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {statCardStyles.map((style, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${style.gradient} rounded-xl p-4 text-center border ${style.border} shadow-sm`}
          >
            <div className="text-lg mb-1">{statIcons[index]}</div>
            <div className={`text-2xl font-bold ${style.text} dark:text-white`}>{statValues[index]}</div>
            <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">{statTitles[index]}</div>
          </div>
        ))}
      </div>

      {/* 数字类型任务：趋势图 */}
      {task.type === 'number' && stats.trendData && stats.trendData.length > 0 && (
        <div className="mb-6 bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📈</span>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">年度趋势</h4>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats.trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(new Date(value), 'MM/dd')}
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
              />
              <YAxis
                tickFormatter={(value) => `${value}${task.unit || ''}`}
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
              />
              <Tooltip
                formatter={(value: number | undefined) => [`${value || 0}${task.unit || ''}`, task.unit || '数值']}
                labelFormatter={(value) => format(new Date(value), 'MM月dd日')}
                contentStyle={{
                  backgroundColor: 'rgba(71, 85, 105, 0.95)',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  border: 'none',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={task.color}
                strokeWidth={2.5}
                dot={{ r: 4, fill: task.color, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 文本类型任务：列表 */}
      {task.type === 'check+text' && stats.textEntries && stats.textEntries.length > 0 && (
        <div className="mb-6 bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📝</span>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">记录列表</h4>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {stats.textEntries.slice(0, 20).map((entry, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{format(new Date(entry.date), 'MM月dd日')}</span>
                  {entry.rating && (
                    <span className="text-yellow-500 text-sm">{'★'.repeat(entry.rating)}</span>
                  )}
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-200">{entry.text}</p>
              </div>
            ))}
            {stats.textEntries.length > 20 && (
              <div className="text-center text-xs text-gray-500 dark:text-gray-400 py-2">
                显示最近 20 条记录，共 {stats.textEntries.length} 条
              </div>
            )}
          </div>
        </div>
      )}

      {/* 评分分布 */}
      {stats.ratingDistribution && stats.ratingDistribution.length > 0 && (
        <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">⭐</span>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">评分分布</h4>
          </div>
          <div className="flex items-end gap-2">
            {stats.ratingDistribution.map(({ rating, count }) => {
              const maxCount = Math.max(...stats.ratingDistribution!.map(r => r.count))
              return (
                <div key={rating} className="flex-1 flex flex-col items-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{rating}星</div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-t-lg relative" style={{ height: `${Math.max((count / maxCount) * 100, 10)}%`, minHeight: '40px' }}>
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all"
                      style={{ height: '100%' }}
                    />
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 mt-2 font-medium">{count}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
