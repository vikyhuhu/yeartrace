import type { Log, Book, BookType, BookLog } from '../types'

/**
 * 解析日志文本，提取书籍信息
 * 支持格式：
 * - 【漫画】书名
 * - 【小说】书名
 * - 【其他】书名
 * - 书名 ⭐️⭐️ 备注
 * - 书名（无类型标签）
 */
function parseBookFromText(text: string): { name: string; type: BookType; rating?: number; note?: string } {
  let type: BookType = 'other'
  let name = text
  let rating: number | undefined
  let note: string | undefined

  console.log('解析书籍文本:', text)

  // 提取类型标签
  const typeMatch = text.match(/^【(漫画|小说|其他)】(.*)/)
  if (typeMatch) {
    type = typeMatch[1] as BookType
    name = typeMatch[2]
  }

  // 提取评分（支持 ⭐️ 和 ★ 两种格式）
  // ⭐️ = U+2605 + U+FE0F (variation selector), ★ = U+2603
  // 使用精确匹配避免多字节字符被重复计数
  // 移除变体选择符后匹配
  const textWithoutVS = text.replace(/\uFE0F/g, '')
  const ratingMatch = textWithoutVS.match(/[★⭐]/g)
  const ratingCount = ratingMatch ? ratingMatch.length : 0
  if (ratingCount > 0 && ratingCount <= 5) {
    rating = ratingCount
  }

  console.log('评分提取:', { originalText: text, ratingCount, rating })

  // 提取备注内容
  let remainingText = textWithoutVS  // 使用已移除变体选择符的文本
    .replace(/【(漫画|小说|其他)】/, '') // 移除类型标签
    .replace(/[★⭐]/g, '') // 移除评分
    .trim()

  // 移除序号（如【1/1】）及之后的内容
  const serialMatch = remainingText.match(/【\d+\/\d+】(.*)/)
  if (serialMatch) {
    remainingText = serialMatch[1].trim()
  } else {
    remainingText = remainingText.replace(/【\d+\/\d+】.*$/, '').trim()
  }

  // 如果剩余文本不为空且不等于书名，则作为备注
  if (remainingText && remainingText !== name) {
    note = remainingText
  }

  // 如果没有类型标签且书名为空，使用剩余文本作为书名
  if (!name || name.trim().length === 0) {
    name = remainingText || text
  }

  // 清理书名
  name = name.trim()

  console.log('解析结果:', { name, type, rating, note })

  return { name, type, rating, note }
}

/**
 * 生成书籍封面颜色
 */
function generateCoverColor(bookName: string): string {
  const hue1 = (bookName.charCodeAt(0) * 17) % 360
  return `hsl(${hue1}, 70%, 80%)`
}

/**
 * 从日志记录中导入书籍数据
 * @param logs 读书任务的所有日志记录
 * @param existingBooks 已有的书籍列表（避免重复导入）
 * @returns 新的书籍列表
 */
export function importBooksFromLogs(
  logs: Log[],
  existingBooks: Book[] = []
): Book[] {
  console.log('开始导入书籍，日志数量:', logs.length, '已有书籍:', existingBooks.length)

  // 创建已有书籍的映射（按名称）
  const existingBooksMap = new Map<string, Book>()
  existingBooks.forEach(book => {
    existingBooksMap.set(book.name.toLowerCase(), book)
    console.log('已有书籍:', book.name)
  })

  // 处理每条日志
  logs.forEach(log => {
    if (!log.text) return

    console.log('处理日志:', log.date, log.text)
    const parsed = parseBookFromText(log.text)
    const bookKey = parsed.name.toLowerCase()

    // 查找或创建书籍
    let book = existingBooksMap.get(bookKey)
    if (!book) {
      book = {
        id: `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: parsed.name,
        type: parsed.type,
        coverColor: generateCoverColor(parsed.name),
        logs: [],
      }
      existingBooksMap.set(bookKey, book)
      console.log('创建新书籍:', parsed.name)
    }

    // 检查是否已有该日期的记录
    const hasLogForDate = book.logs.some(l => l.date === log.date)
    if (!hasLogForDate) {
      const bookLog: BookLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date: log.date,
        rating: parsed.rating,
        note: parsed.note,
      }
      book.logs.push(bookLog)
      console.log('添加书籍日志:', log.date, parsed.rating)
    }
  })

  // 按日志日期排序
  const importedBooks = Array.from(existingBooksMap.values())
  importedBooks.forEach(book => {
    book.logs.sort((a, b) => a.date.localeCompare(b.date))
  })

  console.log('导入完成，共', importedBooks.length, '本书籍')
  return importedBooks
}
