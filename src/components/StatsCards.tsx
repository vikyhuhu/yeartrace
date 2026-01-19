import { useMemo } from 'react'
import { calculateYearStatistics } from '../utils/yearStats'
import type { Task, Log, YearStatistics } from '../types'

interface StatsCardsProps {
  year: number
  logs: Log[]
  tasks: Task[]
  filterTaskId?: string | null
}

const cardStyles = [
  { gradient: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30', border: 'border-blue-200 dark:border-blue-700' },
  { gradient: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30', border: 'border-emerald-200 dark:border-emerald-700' },
  { gradient: 'from-violet-50 to-violet-100 dark:from-violet-900/30 dark:to-violet-800/30', border: 'border-violet-200 dark:border-violet-700' },
  { gradient: 'from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30', border: 'border-amber-200 dark:border-amber-700' },
  { gradient: 'from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/30', border: 'border-cyan-200 dark:border-cyan-700' },
  { gradient: 'from-rose-50 to-rose-100 dark:from-rose-900/30 dark:to-rose-800/30', border: 'border-rose-200 dark:border-rose-700' },
]

const cardIcons = ['📊', '📅', '📈', '🔥', '🎯', '⭐']

const cardTitles = ['总记录数', '有记录天数', '记录覆盖率', '最长连续', '本月完成率', '最活跃任务']

export function StatsCards({ year, logs, tasks, filterTaskId }: StatsCardsProps) {
  const stats = useMemo<YearStatistics>(() => {
    return calculateYearStatistics(year, logs, tasks, filterTaskId)
  }, [year, logs, tasks, filterTaskId])

  const cardValues = [
    stats.totalLogs.toString(),
    stats.daysWithLogs.toString(),
    `${stats.completionRate.toFixed(1)}%`,
    `${stats.longestStreak}天`,
    `${stats.monthlyCompletionRate.toFixed(0)}%`,
    stats.topTasks.length > 0 ? `${stats.topTasks[0].taskName} (${stats.topTasks[0].count}次)` : '暂无',
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cardStyles.map((style, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${style.gradient} rounded-2xl p-4 shadow-md border ${style.border} hover:shadow-lg transition-shadow`}
        >
          <div className="text-2xl mb-2">{cardIcons[index]}</div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {cardValues[index]}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 font-medium">
            {cardTitles[index]}
          </div>
        </div>
      ))}
    </div>
  )
}
