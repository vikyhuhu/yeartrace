import { format, subDays, differenceInDays, parseISO } from 'date-fns'
import type { Task, Log } from '../types'

/**
 * 计算已坚持天数
 * 从任务开始日期到今天的天数
 */
export function calculatePersistedDays(task: Task): number {
  const today = new Date()
  const startDate = parseISO(task.startDate)

  // 如果开始日期在未来，返回0
  if (startDate > today) return 0

  return differenceInDays(today, startDate) + 1
}

/**
 * 计算本周完成情况
 * 返回7天布尔数组，从今天开始倒推（今天是最右边）
 * 例如: [true, false, true, true, false, true, true]
 *      6天前 5天前 4天前 3天前 2天前 昨天 今天
 */
export function calculateWeeklyCompletion(taskId: string, logs: Log[]): boolean[] {
  const weekDays: boolean[] = []

  for (let i = 6; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
    const hasLog = logs.some(l => l.taskId === taskId && l.date === date)
    weekDays.push(hasLog)
  }

  return weekDays
}

/**
 * 获取最近记录时间
 * 返回最近一次记录的日期，如果没有记录返回 null
 */
export function getLastRecordTime(taskId: string, logs: Log[]): Date | null {
  const taskLogs = logs.filter(l => l.taskId === taskId)

  if (taskLogs.length === 0) return null

  // 按日期降序排序
  const sortedLogs = taskLogs.sort((a, b) => b.date.localeCompare(a.date))
  const latestLog = sortedLogs[0]

  // 如果日期字符串包含时间，解析完整日期；否则只解析日期部分
  if (latestLog.date.includes('T')) {
    return new Date(latestLog.date)
  }

  // 如果只有日期没有时间，假设是在当天记录的
  // 这里我们返回日期的0点，实际使用时可以结合其他逻辑
  return parseISO(latestLog.date)
}

/**
 * 格式化相对时间
 * 将日期转换为相对时间描述
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`

  return format(date, 'MM月dd日')
}

/**
 * 获取任务完成次数
 * 统计任务的总记录数
 */
export function getTaskCompletionCount(taskId: string, logs: Log[]): number {
  return logs.filter(l => l.taskId === taskId).length
}

/**
 * 获取任务创建顺序
 * 用于按创建时间排序
 */
export function getTaskOrder(taskId: string, tasks: Task[]): number {
  const index = tasks.findIndex(t => t.id === taskId)
  return index >= 0 ? index : Number.MAX_VALUE
}

/**
 * 获取任务的最新数值（用于 number 类型任务）
 * 返回最近一次记录的数值，如果没有记录返回 undefined
 */
export function getLatestNumberValue(taskId: string, logs: Log[]): number | undefined {
  const taskLogs = logs.filter(l => l.taskId === taskId && l.value !== undefined)

  if (taskLogs.length === 0) return undefined

  // 按日期降序排序，获取最新的数值
  const sortedLogs = taskLogs.sort((a, b) => b.date.localeCompare(a.date))
  return sortedLogs[0].value
}
