import type { BookStatistics } from '../types'

interface BookStatsProps {
  stats: BookStatistics
}

export function BookStats({ stats }: BookStatsProps) {
  const typeLabels: Record<string, string> = {
    manga: '漫画',
    novel: '小说',
    other: '其他',
  }

  // 计算最爱类型的占比
  const getFavoritePercentage = () => {
    if (!stats.favoriteType) return 0
    const total = Object.values(stats.typeDistribution).reduce((a, b) => a + b, 0)
    if (total === 0) return 0
    return Math.round((stats.typeDistribution[stats.favoriteType] / total) * 100)
  }

  const favoritePercentage = getFavoritePercentage()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* 今年已读 */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-2xl">📖</div>
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">今年已读</div>
        </div>
        <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
          {stats.totalRead}
        </div>
        <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">本</div>
      </div>

      {/* 平均评分 */}
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-xl p-4 border border-amber-200 dark:border-amber-700">
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

      {/* 最爱类型 */}
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-2xl">🏷️</div>
          <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">最爱类型</div>
        </div>
        <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
          {stats.favoriteType ? typeLabels[stats.favoriteType] : '-'}
        </div>
        {stats.favoriteType && favoritePercentage > 0 && (
          <div className="text-xs text-emerald-500 dark:text-emerald-400 mt-1">
            占 {favoritePercentage}%
          </div>
        )}
      </div>
    </div>
  )
}
