import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { Task, Log, TimelineDot } from '../types'

// ========== 日期格式化 ==========

export function formatDate(date: Date | string, formatStr: string = 'yyyy-MM-dd'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, formatStr, { locale: zhCN })
}

export function getToday(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function isToday(date: string): boolean {
  return date === getToday()
}

// ========== 任务状态判断 ==========

// 判断任务在某天是否激活
export function isTaskActiveOn(task: Task, date: string): boolean {
  const d = parseISO(date)
  const start = parseISO(task.startDate)
  const end = task.endDate ? parseISO(task.endDate) : null

  if (d < start) return false
  if (end && d > end) return false
  return true
}

// 获取某天所有激活的任务
export function getActiveTasksForDate(tasks: Task[], date: string): Task[] {
  return tasks.filter(t => isTaskActiveOn(t, date))
}

// ========== 时间轴数据处理 ==========

// 生成时间轴数据
export function generateTimelineData(
  tasks: Task[],
  logs: Log[],
  startDate: string,
  endDate: string
): TimelineDot[] {
  const dots: TimelineDot[] = []
  const start = parseISO(startDate)
  const end = parseISO(endDate)

  for (const log of logs) {
    const logDate = parseISO(log.date)
    if (logDate < start || logDate > end) continue

    const task = tasks.find(t => t.id === log.taskId)
    if (!task) continue

    dots.push({
      date: log.date,
      taskId: log.taskId,
      color: task.color,
      isViolation: task.type === 'violation',
    })
  }

  return dots.sort((a, b) => a.date.localeCompare(b.date))
}

// 获取日期范围
export function getDateRange(days: number, endDate: string = getToday()): { start: string; end: string } {
  const end = parseISO(endDate)
  const start = new Date(end)
  start.setDate(start.getDate() - days + 1)

  return {
    start: format(start, 'yyyy-MM-dd'),
    end: endDate,
  }
}

// ========== 任务统计 ==========

export function getTaskStats(taskId: string, logs: Log[]) {
  const taskLogs = logs.filter(l => l.taskId === taskId)

  return {
    totalLogs: taskLogs.length,
    firstLog: taskLogs[0]?.date || null,
    lastLog: taskLogs[taskLogs.length - 1]?.date || null,
    logs: taskLogs,
  }
}

// ========== 数值型任务处理 ==========

export function getNumberTaskStats(taskId: string, logs: Log[]) {
  const taskLogs = logs.filter(l => l.taskId === taskId && l.value !== undefined)

  if (taskLogs.length === 0) {
    return {
      currentValue: null,
      minValue: null,
      maxValue: null,
      trend: [],
    }
  }

  const values = taskLogs.map(l => ({ date: l.date, value: l.value! }))
  const sortedValues = values.sort((a, b) => a.date.localeCompare(b.date))

  return {
    currentValue: sortedValues[sortedValues.length - 1].value,
    minValue: Math.min(...values.map(v => v.value)),
    maxValue: Math.max(...values.map(v => v.value)),
    trend: sortedValues,
  }
}

// ========== 违规型任务统计 ==========

export function getViolationStats(taskId: string, logs: Log[]) {
  const violationLogs = logs.filter(l => l.taskId === taskId)

  return {
    count: violationLogs.length,
    dates: violationLogs.map(l => l.date).sort(),
  }
}

// ========== 颜色工具 ==========

const DEFAULT_COLORS = [
  '#f59e0b', // amber-500
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#8b5cf6', // violet-500
  '#6366f1', // indigo-500
  '#ef4444', // red-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
]

export function getRandomColor(excluding: string[] = []): string {
  const available = DEFAULT_COLORS.filter(c => !excluding.includes(c))
  return available[Math.floor(Math.random() * available.length)] || DEFAULT_COLORS[0]
}

// ========== 连续打卡计算 ==========

// 计算单个任务的连续打卡天数（截止到指定日期）
export function calculateStreak(taskId: string, logs: Log[], endDate: string = getToday()): number {
  const taskLogs = logs
    .filter(l => l.taskId === taskId)
    .sort((a, b) => a.date.localeCompare(b.date))

  if (taskLogs.length === 0) return 0

  let streak = 0
  const checkDate = new Date(endDate)

  // 从结束日期开始倒推
  for (let i = 0; i < 365; i++) {
    const dateStr = format(checkDate, 'yyyy-MM-dd')
    const hasLog = taskLogs.some(l => l.date === dateStr)

    if (hasLog) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

// 判断是否是里程碑节点
export function isMilestoneStreak(streak: number): boolean {
  return [3, 7, 14, 21, 30, 50, 66, 100].includes(streak)
}

// 获取里程碑样式文本
export function getMilestoneText(streak: number): string | null {
  if (streak === 3) return '🔥 三连击'
  if (streak === 7) return '⭐ 坚持一周'
  if (streak === 14) return '🏆 双周达成'
  if (streak === 21) return '💪 三周习惯'
  if (streak === 30) return '🎯 月度目标'
  if (streak >= 50) return '👑 半年征程'
  return null
}

// ========== 读书任务解析 ==========

// 解析书籍名称列表
export function parseBooksFromLogs(logs: Log[]): Array<{name: string; date: string; count: number}> {
  const books: Map<string, {name: string; date: string; count: number}> = new Map()

  for (const log of logs) {
    if (!log.text) continue

    // 解析格式：【类型】书名【序号】评分
    const match = log.text.match(/【(.*?)】(.+?)【(\d+)\/\d+】/)
    if (match) {
      const [, type, name] = match
      const bookName = `${type}·${name}`
      const existing = books.get(bookName)

      if (existing) {
        existing.count++
        if (log.date > existing.date) {
          existing.date = log.date
        }
      } else {
        books.set(bookName, {
          name: bookName,
          date: log.date,
          count: 1
        })
      }
    }
  }

  return Array.from(books.values()).sort((a, b) => b.count - a.count)
}

// ========== 7天趋势数据 ==========

// 获取最近7天的趋势数据
export function getLast7DaysTrend(taskId: string, logs: Log[], endDate: string = getToday()) {
  const trend: Array<{date: string; value?: number}> = []
  const checkDate = new Date(endDate)

  for (let i = 6; i >= 0; i--) {
    const dateStr = format(checkDate, 'yyyy-MM-dd')
    const log = logs.find(l => l.taskId === taskId && l.date === dateStr)
    trend.push({
      date: dateStr,
      value: log?.value
    })
    checkDate.setDate(checkDate.getDate() - 1)
  }

  return trend
}

// ========== 反馈文案 ==========

const FEEDBACK_MESSAGES = [
  '干得漂亮',
  '又坚持了一天',
  '优秀如你',
  '时间记得',
  '继续保持',
  '超棒',
  '为你点赞',
  '进步可见',
  '每一天都重要',
  '你是最棒的',
  '太强了',
  '不负时光',
  '今日达成',
]

export function getRandomFeedback(): string {
  return FEEDBACK_MESSAGES[Math.floor(Math.random() * FEEDBACK_MESSAGES.length)]
}
