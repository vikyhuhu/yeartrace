interface RatingDistributionProps {
  ratingDistribution: Array<{ rating: number; count: number }>
}

export function RatingDistribution({ ratingDistribution }: RatingDistributionProps) {
  const totalCount = ratingDistribution.reduce((sum, item) => sum + item.count, 0)

  if (totalCount === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-200 dark:border-gray-700">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">评分分布</h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>暂无评分数据</p>
        </div>
      </div>
    )
  }

  const maxCount = Math.max(...ratingDistribution.map(item => item.count))

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-200 dark:border-gray-700">
      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">评分分布</h3>

      <div className="space-y-3">
        {ratingDistribution.map(item => {
          const percentage = totalCount > 0 ? (item.count / totalCount) * 100 : 0
          const barWidth = maxCount > 0 ? (item.count / maxCount) * 100 : 0

          return (
            <div key={item.rating} className="flex items-center gap-3">
              {/* 星级标签 */}
              <div className="w-20 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <span>{'⭐️'.repeat(item.rating)}</span>
              </div>

              {/* 进度条 */}
              <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 dark:from-amber-500 dark:to-amber-600 rounded-full transition-all duration-500"
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              {/* 数量 */}
              <div className="w-12 text-right">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {item.count}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                  ({percentage.toFixed(0)}%)
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* 总计 */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          总计 <span className="font-bold text-gray-900 dark:text-white">{totalCount}</span> 条评分
        </span>
      </div>
    </div>
  )
}
