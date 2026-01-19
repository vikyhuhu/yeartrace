import { useState, useEffect } from 'react'
import type { Book, BookLog, BookStatistics, BookType, Log } from '../types'
import { importBooksFromLogs } from '../utils/bookMigration'

const BOOKS_STORAGE_KEY = 'yeartrace_books'

export function useBooks(allLogs: Log[] = [], allTasks: any[] = []) {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  // 从 localStorage 加载书籍数据
  useEffect(() => {
    const stored = localStorage.getItem(BOOKS_STORAGE_KEY)
    if (stored) {
      try {
        setBooks(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse books data:', e)
      }
    }
    setLoading(false)
  }, [])

  // 自动同步：当读书任务的日志更新时，自动同步到书单
  useEffect(() => {
    if (loading) return

    // 提取读书任务的日志
    const readingTask = allTasks.find(task =>
      (task.name === '读书' || task.name.includes('读书') || task.name.includes('阅读')) &&
      task.type === 'check+text'
    )

    if (!readingTask) return

    const readingLogs = allLogs.filter(log => log.taskId === readingTask.id)

    // 如果有读书日志，自动同步（使用函数式更新避免依赖 books）
    if (readingLogs.length > 0) {
      setBooks(currentBooks => {
        const syncedBooks = importBooksFromLogs(readingLogs, currentBooks)
        // 只有当书籍数量变化时才更新（避免不必要的重渲染）
        if (syncedBooks.length !== currentBooks.length) {
          return syncedBooks
        }
        return currentBooks
      })
    }
  }, [allLogs, allTasks, loading])

  // 保存到 localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books))
    }
  }, [books, loading])

  // 生成唯一ID
  const generateId = () => `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // 添加新书
  const createBook = (data: Omit<Book, 'id' | 'logs'>) => {
    const newBook: Book = {
      ...data,
      id: generateId(),
      logs: [],
    }
    setBooks(prev => [...prev, newBook])
    return newBook
  }

  // 添加阅读记录
  const addBookLog = (bookId: string, log: Omit<BookLog, 'id'>) => {
    const newLog: BookLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }

    setBooks(prev =>
      prev.map(book => {
        if (book.id === bookId) {
          return {
            ...book,
            logs: [...book.logs, newLog],
          }
        }
        return book
      })
    )
  }

  // 更新阅读记录
  const updateBookLog = (bookId: string, logId: string, data: Partial<BookLog>) => {
    setBooks(prev =>
      prev.map(book => {
        if (book.id === bookId) {
          return {
            ...book,
            logs: book.logs.map(log =>
              log.id === logId ? { ...log, ...data } : log
            ),
          }
        }
        return book
      })
    )
  }

  // 删除阅读记录
  const removeBookLog = (bookId: string, logId: string) => {
    setBooks(prev =>
      prev.map(book => {
        if (book.id === bookId) {
          return {
            ...book,
            logs: book.logs.filter(log => log.id !== logId),
          }
        }
        return book
      })
    )
  }

  // 删除书籍
  const removeBook = (bookId: string) => {
    setBooks(prev => prev.filter(book => book.id !== bookId))
  }

  // 根据日期查找所有书籍记录（用于首页读书任务）
  const getBooksByDate = (date: string) => {
    const results: Array<{ book: Book; log: BookLog }> = []

    books.forEach(book => {
      const log = book.logs.find(l => l.date === date)
      if (log) {
        results.push({ book, log })
      }
    })

    return results
  }

  // 获取书籍名称列表（用于搜索建议）
  const getBookNames = () => {
    return books.map(book => book.name)
  }

  // 计算统计数据
  const getStatistics = (year?: number): BookStatistics => {
    const targetYear = year || new Date().getFullYear()

    console.log('=== getStatistics 开始 ===')
    console.log('目标年份:', targetYear)
    console.log('当前书籍数量:', books.length)

    // 统计今年的阅读记录
    const yearLogs: Array<{ book: Book; log: BookLog }> = []

    books.forEach(book => {
      book.logs.forEach(log => {
        const logYear = new Date(log.date).getFullYear()
        console.log(`检查日志: 书籍=${book.name}, 日期=${log.date}, 年份=${logYear}, 评分=${log.rating}, 目标年份=${targetYear}, 匹配=${logYear === targetYear}`)
        if (logYear === targetYear) {
          yearLogs.push({ book, log })
        }
      })
    })

    console.log(`${targetYear}年的日志数量:`, yearLogs.length)
    console.log('有评分的日志数量:', yearLogs.filter(item => item.log.rating !== undefined).length)

    // 按书籍去重（同一本书只算一次）
    const uniqueBooks = new Map<string, typeof yearLogs[0]>()
    yearLogs.forEach(item => {
      if (!uniqueBooks.has(item.book.id)) {
        uniqueBooks.set(item.book.id, item)
      }
    })

    const totalRead = uniqueBooks.size

    // 计算平均评分
    const ratedLogs = yearLogs.filter(item => item.log.rating !== undefined)
    const avgRating =
      ratedLogs.length > 0
        ? ratedLogs.reduce((sum, item) => sum + (item.log.rating || 0), 0) / ratedLogs.length
        : 0

    // 统计类型分布
    const typeDistribution: Record<BookType, number> = {
      manga: 0,
      novel: 0,
      other: 0,
    }

    uniqueBooks.forEach(item => {
      typeDistribution[item.book.type]++
    })

    // 找出最爱类型
    let favoriteType: BookType | null = null
    let maxCount = 0
    Object.entries(typeDistribution).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count
        favoriteType = type as BookType
      }
    })

    // 评分分布
    const ratingDistribution: Array<{ rating: number; count: number }> = []
    console.log('计算评分分布...')
    console.log('所有 yearLogs 的评分详情:', yearLogs.map(item => ({ book: item.book.name, rating: item.log.rating, ratingType: typeof item.log.rating })))
    for (let i = 1; i <= 5; i++) {
      const matchingLogs = yearLogs.filter(item => item.log.rating === i)
      const count = matchingLogs.length
      console.log(`  ${i}星: ${count}条`, matchingLogs.map(l => ({ book: l.book.name, rating: l.log.rating })))
      ratingDistribution.push({ rating: i, count })
    }

    // 计算总页数
    const totalPages = yearLogs.reduce((sum, item) => sum + (item.log.pages || 0), 0)

    // 计算最长连续阅读天数
    const readingDates = Array.from(new Set(yearLogs.map(item => item.log.date))).sort()
    let longestStreak = 0
    let currentStreak = 0
    let prevDate = ''

    readingDates.forEach(date => {
      if (!prevDate) {
        currentStreak = 1
      } else {
        const prev = new Date(prevDate)
        const curr = new Date(date)
        const diffTime = curr.getTime() - prev.getTime()
        const diffDays = diffTime / (1000 * 60 * 60 * 24)

        if (diffDays === 1) {
          currentStreak++
        } else {
          longestStreak = Math.max(longestStreak, currentStreak)
          currentStreak = 1
        }
      }
      prevDate = date
    })
    longestStreak = Math.max(longestStreak, currentStreak)

    console.log('=== getStatistics 完成 ===')

    return {
      totalRead,
      avgRating: Math.round(avgRating * 10) / 10,
      favoriteType,
      typeDistribution,
      ratingDistribution,
      longestStreak,
      totalPages,
    }
  }

  // 获取阅读日历数据
  const getReadingCalendar = (year?: number) => {
    const targetYear = year || new Date().getFullYear()
    const calendar: Record<string, { count: number; pages: number }> = {}

    books.forEach(book => {
      book.logs.forEach(log => {
        const logYear = new Date(log.date).getFullYear()
        if (logYear === targetYear) {
          if (!calendar[log.date]) {
            calendar[log.date] = { count: 0, pages: 0 }
          }
          calendar[log.date].count++
          calendar[log.date].pages += log.pages || 0
        }
      })
    })

    return calendar
  }

  return {
    books,
    loading,
    createBook,
    addBookLog,
    updateBookLog,
    removeBookLog,
    removeBook,
    getBooksByDate,
    getBookNames,
    getStatistics,
    getReadingCalendar,
  }
}
