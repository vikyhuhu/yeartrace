import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { Log } from '../types'

interface ReadingCardsProps {
    logs: Log[]
    color?: string
}

interface BookEntry {
    name: string
    type: string
    logs: Array<{
        date: string
        rating?: number
        text?: string
    }>
    lastRead: string
    avgRating: number
}

/**
 * 读书任务卡片墙组件
 * 展示已读书籍列表，支持查看详情
 */
export function ReadingCards({ logs, color = '#10b981' }: ReadingCardsProps) {
    const [selectedBook, setSelectedBook] = useState<BookEntry | null>(null)

    // 解析书籍数据
    const books = useMemo(() => {
        const bookMap = new Map<string, BookEntry>()

        logs.forEach(log => {
            if (!log.text) return

            // 尝试解析格式：【类型】书名【序号】或其他格式
            const match = log.text.match(/【(.*?)】(.*?)(?:【|$)/)
            if (match) {
                const [, type, name] = match
                const bookKey = `${type}|${name.trim()}`

                if (!bookMap.has(bookKey)) {
                    bookMap.set(bookKey, {
                        name: name.trim(),
                        type: type,
                        logs: [],
                        lastRead: log.date,
                        avgRating: 0
                    })
                }

                const book = bookMap.get(bookKey)!
                book.logs.push({
                    date: log.date,
                    rating: log.rating,
                    text: log.text
                })
                if (log.date > book.lastRead) {
                    book.lastRead = log.date
                }
            } else {
                // 无法解析的格式，作为单独书籍
                const bookKey = log.text.slice(0, 20)
                if (!bookMap.has(bookKey)) {
                    bookMap.set(bookKey, {
                        name: log.text.slice(0, 30),
                        type: '其他',
                        logs: [],
                        lastRead: log.date,
                        avgRating: 0
                    })
                }
                const book = bookMap.get(bookKey)!
                book.logs.push({
                    date: log.date,
                    rating: log.rating,
                    text: log.text
                })
            }
        })

        // 计算平均评分
        bookMap.forEach(book => {
            const ratings = book.logs.filter(l => l.rating).map(l => l.rating!)
            book.avgRating = ratings.length > 0
                ? ratings.reduce((a, b) => a + b, 0) / ratings.length
                : 0
        })

        return Array.from(bookMap.values()).sort((a, b) =>
            b.lastRead.localeCompare(a.lastRead)
        )
    }, [logs])

    // 获取类型图标
    const getTypeIcon = (type: string) => {
        if (type.includes('漫画') || type.includes('manga')) return '📚'
        if (type.includes('小说') || type.includes('novel')) return '📖'
        return '📕'
    }

    // 获取类型颜色
    const getTypeColor = (type: string) => {
        if (type.includes('漫画')) return '#f97316'
        if (type.includes('小说')) return '#8b5cf6'
        return '#10b981'
    }

    if (books.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center text-gray-500">
                <span className="text-4xl mb-2 block">📚</span>
                暂无阅读记录
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* 统计概览 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                        <span>📖</span>
                        <span>书籍墙</span>
                    </h4>
                    <div className="text-sm text-gray-500">
                        共 <span className="font-bold" style={{ color }}>{books.length}</span> 本
                    </div>
                </div>
            </div>

            {/* 书籍卡片网格 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {books.map((book, idx) => (
                    <div
                        key={idx}
                        onClick={() => setSelectedBook(book)}
                        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm cursor-pointer 
                       hover:shadow-md transition-all hover:scale-[1.02] border border-transparent
                       hover:border-gray-200 dark:hover:border-gray-700"
                    >
                        {/* 书籍图标 */}
                        <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-3"
                            style={{ backgroundColor: `${getTypeColor(book.type)}20` }}
                        >
                            {getTypeIcon(book.type)}
                        </div>

                        {/* 书名 */}
                        <h5 className="font-medium text-gray-800 dark:text-white text-sm line-clamp-2 mb-2">
                            {book.name}
                        </h5>

                        {/* 类型标签 */}
                        <span
                            className="inline-block text-xs px-2 py-0.5 rounded-full mb-2"
                            style={{
                                backgroundColor: `${getTypeColor(book.type)}20`,
                                color: getTypeColor(book.type)
                            }}
                        >
                            {book.type}
                        </span>

                        {/* 阅读次数和评分 */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{book.logs.length} 次记录</span>
                            {book.avgRating > 0 && (
                                <span className="text-yellow-500">
                                    {'★'.repeat(Math.round(book.avgRating))}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* 书籍详情弹窗 */}
            {selectedBook && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedBook(null)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                                    {selectedBook.name}
                                </h3>
                                <span
                                    className="inline-block text-xs px-2 py-0.5 rounded-full mt-1"
                                    style={{
                                        backgroundColor: `${getTypeColor(selectedBook.type)}20`,
                                        color: getTypeColor(selectedBook.type)
                                    }}
                                >
                                    {selectedBook.type}
                                </span>
                            </div>
                            <button
                                onClick={() => setSelectedBook(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        {/* 统计信息 */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold" style={{ color }}>
                                    {selectedBook.logs.length}
                                </div>
                                <div className="text-xs text-gray-500">阅读次数</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-yellow-500">
                                    {selectedBook.avgRating > 0 ? selectedBook.avgRating.toFixed(1) : '-'}
                                </div>
                                <div className="text-xs text-gray-500">平均评分</div>
                            </div>
                        </div>

                        {/* 阅读记录列表 */}
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                            阅读记录
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {selectedBook.logs.map((log, idx) => (
                                <div
                                    key={idx}
                                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-500">
                                            {format(new Date(log.date), 'MM月dd日', { locale: zhCN })}
                                        </span>
                                        {log.rating && (
                                            <span className="text-yellow-500 text-sm">
                                                {'★'.repeat(log.rating)}
                                            </span>
                                        )}
                                    </div>
                                    {log.text && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                                            {log.text}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
