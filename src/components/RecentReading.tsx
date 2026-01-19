import { useMemo } from 'react'
import { format } from 'date-fns'
import type { Book, BookLog } from '../types'

interface RecentReadingProps {
  books: Book[]
  limit?: number
  year?: number
}

export function RecentReading({ books, limit = 10, year }: RecentReadingProps) {
  // 收集所有阅读记录并按日期排序
  const allRecords = useMemo(() => {
    const records: Array<{
      book: Book
      log: BookLog
      date: string
    }> = []

    books.forEach(book => {
      book.logs.forEach(log => {
        // 如果指定了年份，过滤该年份的记录
        if (year && !log.date.startsWith(year.toString())) {
          return
        }
        records.push({ book, log, date: log.date })
      })
    })

    // 按日期降序排序
    return records.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit)
  }, [books, limit, year])

  if (allRecords.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-[20px] p-6 border border-white/50 dark:border-gray-700 card-modern-static">
        <div className="text-center py-6 text-gray-400 dark:text-gray-500">
          <div className="text-3xl mb-2">📖</div>
          <p>暂无阅读记录</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[20px] p-5 border border-white/50 dark:border-gray-700 card-modern-static">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>📚</span>
          <span>最近阅读</span>
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          最近 {allRecords.length} 条记录
        </span>
      </div>

      <div className="space-y-3">
        {allRecords.map(({ book, log, date }, index) => (
          <div
            key={`${book.id}-${log.id}-${index}`}
            className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {/* 书籍信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-gray-900 dark:text-white truncate">
                  {book.name}
                </h4>
                {log.rating && (
                  <span className="text-xs text-amber-500 dark:text-amber-400 shrink-0">
                    {'⭐'.repeat(log.rating)}
                  </span>
                )}
              </div>

              {/* 日期和备注 */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4v4m0-4h.01M12 21l-4-4m4 4l4-4" />
                    </svg>
                    {format(new Date(date), 'MM月dd日 EEEE')}
                  </span>
                  {log.pages && (
                    <span>· {log.pages} 页</span>
                  )}
                </div>
                {log.note && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {log.note}
                  </p>
                )}
              </div>
            </div>

            {/* 类型标签 */}
            <div className="shrink-0">
              <span className={`text-xs px-2 py-1 rounded-full ${
                book.type === 'manga'
                  ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
                  : book.type === 'novel'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {book.type === 'manga' ? '漫画' : book.type === 'novel' ? '小说' : '其他'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 查看更多提示 */}
      {allRecords.length >= limit && (
        <div className="mt-3 text-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            查看书籍列表 →
          </button>
        </div>
      )}
    </div>
  )
}
