import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooks } from '../hooks/useBooks'
import { BookStats } from '../components/BookStats'
import { BookList } from '../components/BookList'
import { RatingDistribution } from '../components/RatingDistribution'

type BookFilter = 'all' | 'manga' | 'novel' | 'other'
type BookSort = 'date' | 'rating'

export function BooksPage() {
  const navigate = useNavigate()
  const { books, getStatistics } = useBooks()

  const [selectedFilter, setSelectedFilter] = useState<BookFilter>('all')
  const [selectedSort, setSelectedSort] = useState<BookSort>('date')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // 过滤和排序书籍
  const filteredAndSortedBooks = useMemo(() => {
    let filtered = books

    // 类型筛选
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(book => book.type === selectedFilter)
    }

    // 排序
    const sorted = [...filtered].sort((a, b) => {
      if (selectedSort === 'date') {
        // 按最新阅读日期排序
        const aLatest = a.logs.length > 0 ? a.logs[a.logs.length - 1].date : ''
        const bLatest = b.logs.length > 0 ? b.logs[b.logs.length - 1].date : ''
        return bLatest.localeCompare(aLatest)
      } else if (selectedSort === 'rating') {
        // 按平均评分排序
        const aAvg = a.logs.filter(l => l.rating).length > 0
          ? a.logs.filter(l => l.rating).reduce((sum, l) => sum + (l.rating || 0), 0) / a.logs.filter(l => l.rating).length
          : 0
        const bAvg = b.logs.filter(l => l.rating).length > 0
          ? b.logs.filter(l => l.rating).reduce((sum, l) => sum + (l.rating || 0), 0) / b.logs.filter(l => l.rating).length
          : 0
        return bAvg - aAvg
      }
      return 0
    })

    return sorted
  }, [books, selectedFilter, selectedSort])

  const handlePrevYear = () => {
    setSelectedYear(selectedYear - 1)
  }

  const handleNextYear = () => {
    if (selectedYear < new Date().getFullYear()) {
      setSelectedYear(selectedYear + 1)
    }
  }

  const stats = useMemo(() => getStatistics(selectedYear), [getStatistics, selectedYear])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* 顶部导航 */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📚</span>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">我的书单</h1>
            </div>
            <div className="w-9" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* 年份选择器 */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-2xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevYear}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="text-center">
              <div className="text-3xl font-bold mb-1">
                {selectedYear}
              </div>
              <div className="text-sm text-blue-100">
                阅读记录
              </div>
            </div>

            <button
              onClick={handleNextYear}
              disabled={selectedYear >= new Date().getFullYear()}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {selectedYear !== new Date().getFullYear() && (
            <button
              onClick={() => setSelectedYear(new Date().getFullYear())}
              className="mt-4 w-full py-2 text-sm font-medium bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
            >
              回到今年
            </button>
          )}
        </div>

        {/* 顶部统计 */}
        <BookStats stats={stats} />

        {/* 评分分布 */}
        <RatingDistribution ratingDistribution={stats.ratingDistribution} />

        {/* 筛选和排序 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* 类型筛选 */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedFilter === 'all'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setSelectedFilter('manga')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedFilter === 'manga'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                漫画
              </button>
              <button
                onClick={() => setSelectedFilter('novel')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedFilter === 'novel'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                小说
              </button>
              <button
                onClick={() => setSelectedFilter('other')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedFilter === 'other'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                其他
              </button>
            </div>

            {/* 排序 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">排序：</span>
              <button
                onClick={() => setSelectedSort('date')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedSort === 'date'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                按日期
              </button>
              <button
                onClick={() => setSelectedSort('rating')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedSort === 'rating'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                按评分
              </button>
            </div>
          </div>
        </div>

        {/* 书籍列表 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            书籍列表 ({filteredAndSortedBooks.length})
          </h2>

          {filteredAndSortedBooks.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-3">📚</div>
              <p className="mb-4">暂无书籍记录</p>
              <div className="space-y-2">
                <p className="text-sm mt-1">在首页"读书"任务中记录阅读</p>
                <p className="text-xs text-gray-400">记录后会自动同步到此页面</p>
              </div>
            </div>
          ) : (
            <BookList books={filteredAndSortedBooks} />
          )}
        </div>
      </main>
    </div>
  )
}
