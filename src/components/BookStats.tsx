import type { BookStatistics } from '../types'

interface BookStatsProps {
  stats: BookStatistics
}

export function BookStats({ stats }: BookStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* 今年已读 */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-[20px] p-4 border border-white/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-2xl">📖</div>
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">今年已读</div>
        </div>
        <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
          {stats.totalRead}
        </div>
        <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">本</div>
      </div>

      {/* 最长连续 */}
      <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/30 rounded-[20px] p-4 border border-white/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-2xl">🔥</div>
          <div className="text-sm text-teal-600 dark:text-teal-400 font-medium">最长连续</div>
        </div>
        <div className="text-3xl font-bold text-teal-700 dark:text-teal-300">
          {stats.longestStreak}
        </div>
        <div className="text-xs text-teal-500 dark:text-teal-400 mt-1">天</div>
      </div>

      {/* 平均评分 */}
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-[20px] p-4 border border-white/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-2xl">⭐</div>
          <div className="text-sm text-amber-600 dark:text-amber-400 font-medium">平均评分</div>
        </div>
        <div className="text-3xl font-bold text-amber-700 dark:text-amber-300">
          {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '-'}
        </div>
        {stats.avgRating > 0 && (
          <div className="text-xs text-amber-500 dark:text-amber-400 mt-1">
            {'★'.repeat(Math.round(stats.avgRating))}
          </div>
        )}
      </div>
    </div>
  )
}
