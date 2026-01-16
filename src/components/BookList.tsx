import { useState } from 'react'
import { format } from 'date-fns'
import type { Book } from '../types'

interface BookListProps {
  books: Book[]
}

export function BookList({ books }: BookListProps) {
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null)

  const typeLabels: Record<string, { label: string; color: string }> = {
    manga: { label: '漫画', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' },
    novel: { label: '小说', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
    other: { label: '其他', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
  }

  const generateCoverGradient = (book: Book) => {
    // 根据书籍ID和类型生成渐变色
    const hue1 = (book.id.charCodeAt(0) * 17) % 360
    const hue2 = (book.id.charCodeAt(1) * 23) % 360
    return `linear-gradient(135deg, hsl(${hue1}, 70%, 80%), hsl(${hue2}, 70%, 75%))`
  }

  return (
    <div className="space-y-3">
      {books.map(book => {
        const typeInfo = typeLabels[book.type] || typeLabels.other
        const latestLog = book.logs.length > 0 ? book.logs[book.logs.length - 1] : null
        const isExpanded = expandedBookId === book.id
        const avgRating =
          book.logs.filter(l => l.rating).length > 0
            ? book.logs.filter(l => l.rating).reduce((sum, l) => sum + (l.rating || 0), 0) / book.logs.filter(l => l.rating).length
            : 0

        return (
          <div
            key={book.id}
            className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
          >
            <button
              onClick={() => setExpandedBookId(isExpanded ? null : book.id)}
              className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              {/* 书籍封面占位图 */}
              <div
                className="w-16 h-20 rounded-lg flex items-center justify-center text-3xl shrink-0 shadow-sm"
                style={{ background: generateCoverGradient(book) }}
              >
                📖
              </div>

              {/* 书籍信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {book.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      {avgRating > 0 && (
                        <span className="text-xs text-amber-600 dark:text-amber-400">
                          ⭐ {avgRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {latestLog && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    最近阅读：{format(new Date(latestLog.date), 'yyyy年MM月dd日')}
                  </div>
                )}
              </div>
            </button>

            {/* 展开的阅读记录 */}
            {isExpanded && book.logs.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                {book.logs.map(log => (
                  <div key={log.id} className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            {format(new Date(log.date), 'yyyy年MM月dd日')}
                          </span>
                          {log.rating && (
                            <span className="text-xs text-amber-600 dark:text-amber-400">
                              {'⭐'.repeat(log.rating)}
                            </span>
                          )}
                        </div>
                        {log.note && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                            {log.note}
                          </p>
                        )}
                        {log.pages && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            阅读页数：{log.pages}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
