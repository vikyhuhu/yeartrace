import type { YTTask, YTDayRecord, YTDetailedStatistics, ByTypeStatistics, WeeklyStatistics, MonthlyStatistics, YearlyStatistics, TaskStatItem as DetailedTaskStatItem, DailyRecord as DetailedDailyRecord } from '../types/yeartrace'

/**
 * 任务统计项（简化版，向后兼容）
 */
export interface TaskStatItem {
  taskId: string
  taskName: string
  completedDays: number
  totalExp: number // 保留用于向后兼容，现在值为 0
  currentStreak: number
  bestStreak: number
  completionRate: number
}

/**
 * 每日记录（简化版，向后兼容）
 */
export interface DailyRecord {
  date: string
  completedCount: number
  totalCount: number
  totalExp: number // 保留用于向后兼容，现在值为 completedCount
  completionRate: number
  taskIds: string[]
}

/**
 * YearTrace 统计数据
 */
export interface YTStatistics {
  totalDays: number // 总记录天数
  totalExp: number // 保留用于向后兼容，现在值为总完成次数
  avgDailyExp: number // 保留用于向后兼容，现在值为平均完成次数
  longestStreak: number // 最长连击天数
  currentStreak: number // 当前连击天数
  totalTasks: number // 任务总数
  taskStats: TaskStatItem[] // 每个任务的统计
  dailyRecords: DailyRecord[] // 每日记录
  bestDay: DailyRecord | null // 最好的一天
  recentWeekExp: number // 保留用于向后兼容
  recentMonthExp: number // 保留用于向后兼容
}

/**
 * 计算统计数据
 */
export function calculateStatistics(
  history: YTDayRecord[],
  tasks: YTTask[]
): YTStatistics {
  // 基本信息
  const totalDays = history.length
  // 向后兼容：如果旧数据有 totalExp 字段，使用它；否则使用 completedCount
  const totalExp = history.reduce((sum, r) => sum + ((r as any).totalExp || r.completedTaskIds.length), 0)
  const avgDailyExp = totalDays > 0 ? Math.round(totalExp / totalDays) : 0

  // 计算连击
  const { longestStreak, currentStreak } = calculateStreaks(history)

  // 每日记录详情
  const dailyRecords: DailyRecord[] = history.map(record => {
    const completedCount = record.completedTaskIds.length
    const totalCount = tasks.length
    const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
    // 向后兼容：使用 completedCount 作为 totalExp 的替代值
    const totalExp = completedCount

    return {
      date: record.date,
      completedCount,
      totalCount,
      totalExp,
      completionRate,
      taskIds: [...record.completedTaskIds],
    }
  })

  // 最好的一天（按完成数量排序）
  const bestDay =
    dailyRecords.length > 0
      ? dailyRecords.reduce((best, current) =>
          current.totalExp > best.totalExp ? current : best
        )
      : null

  // 每个任务的统计
  const taskStats: TaskStatItem[] = tasks.map(task => {
    // 计算该任务的总完成天数
    const completedDays = history.filter(record =>
      record.completedTaskIds.includes(task.id)
    ).length

    // 向后兼容：totalExp 设为 0（不再使用）
    const totalExp = 0

    // 当前连击
    const currentStreak = task.streak

    // 计算最佳连击（遍历历史记录）
    let bestStreak = 0
    let tempStreak = 0

    for (const record of [...history].reverse()) {
      if (record.completedTaskIds.includes(task.id)) {
        tempStreak++
        bestStreak = Math.max(bestStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    }

    // 完成率
    const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0

    return {
      taskId: task.id,
      taskName: task.name,
      completedDays,
      totalExp,
      currentStreak,
      bestStreak,
      completionRate,
    }
  })

  // 最近 7 天 EXP
  const recentWeekExp = calculateRecentExp(history, 7)

  // 最近 30 天 EXP
  const recentMonthExp = calculateRecentExp(history, 30)

  return {
    totalDays,
    totalExp,
    avgDailyExp,
    longestStreak,
    currentStreak,
    totalTasks: tasks.length,
    taskStats,
    dailyRecords,
    bestDay,
    recentWeekExp,
    recentMonthExp,
  }
}

/**
 * 计算连击数据
 */
function calculateStreaks(history: YTDayRecord[]): {
  longestStreak: number
  currentStreak: number
} {
  if (history.length === 0) {
    return { longestStreak: 0, currentStreak: 0 }
  }

  // 当前连击：从最近一天开始向前计算有完成任务的连续天数
  let currentStreak = 0

  for (let i = 0; i < history.length; i++) {
    const record = history[i]
    if (record.completedTaskIds.length > 0) {
      currentStreak++
    } else {
      break
    }
  }

  // 最长连击
  let longestStreak = 0
  let tempStreak = 0

  for (const record of [...history].reverse()) {
    if (record.completedTaskIds.length > 0) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 0
    }
  }

  return { longestStreak, currentStreak }
}

/**
 * 计算最近 N 天的 EXP
 */
function calculateRecentExp(history: YTDayRecord[], days: number): number {
  const recentRecords = history.slice(0, days)
  return recentRecords.reduce((sum, r) => sum + ((r as any).totalExp || r.completedTaskIds.length), 0)
}

/**
 * 获取日历热力图数据（最近一年）
 */
export interface CalendarHeatmapData {
  date: string
  level: number // 0-4，0 表示无数据，1-4 表示完成程度
  exp: number
}

export function getCalendarHeatmap(
  history: YTDayRecord[],
  tasks: YTTask[],
  days: number = 365
): CalendarHeatmapData[] {
  const today = new Date()
  const data: CalendarHeatmapData[] = []
  const historyMap = new Map<string, YTDayRecord>()

  // 建立历史记录映射
  history.forEach(record => {
    historyMap.set(record.date, record)
  })

  // 生成日期列表
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    const record = historyMap.get(dateStr)
    const exp = record ? ((record as any).totalExp || record.completedTaskIds.length) : 0

    // 计算热度等级（基于 EXP 占当日总 EXP 的比例）
    let level = 0
    if (record && record.completedTaskIds.length > 0) {
      const maxPossibleExp = tasks.length  // 使用任务数量作为替代
      const ratio = maxPossibleExp > 0 ? exp / maxPossibleExp : 0

      if (ratio >= 1) level = 4
      else if (ratio >= 0.75) level = 3
      else if (ratio >= 0.5) level = 2
      else if (ratio >= 0.25) level = 1
      else level = 1
    }

    data.push({ date: dateStr, level, exp })
  }

  return data
}

/**
 * 格式化统计数据为显示文本
 */
export function formatStats(stats: YTStatistics): {
  totalDaysLabel: string
  totalExpLabel: string
  avgDailyExpLabel: string
  longestStreakLabel: string
  currentStreakLabel: string
} {
  return {
    totalDaysLabel: `${stats.totalDays} 天`,
    totalExpLabel: `${stats.totalExp} EXP`,
    avgDailyExpLabel: `${stats.avgDailyExp} EXP/天`,
    longestStreakLabel: `${stats.longestStreak} 天`,
    currentStreakLabel: `${stats.currentStreak} 天`,
  }
}

// ========================================
// V2 详细统计功能
// ========================================

/**
 * 计算详细统计数据（V2）
 */
export function calculateDetailedStatistics(
  history: YTDayRecord[],
  tasks: YTTask[]
): YTDetailedStatistics {
  const today = new Date()

  // 基本统计
  const totalDays = history.length
  // 计算总完成次数（替代 totalExp）
  history.reduce((sum, r) => sum + ((r as any).totalExp || r.completedTaskIds.length), 0)
  // avgDailyExp 不再使用

  // 连击统计
  const { longestStreak, currentStreak } = calculateDetailedStreaks(history, tasks)

  // 周统计
  const weekly = calculateWeeklyStatistics(history, today)

  // 月统计
  const monthly = calculateMonthlyStatistics(history, today)

  // 年度统计
  const yearly = calculateYearlyStatistics(history, tasks, today)

  // 按类型统计
  const byType = calculateByTypeStatistics(history, tasks)

  // 任务详细统计
  const taskStats = calculateDetailedTaskStats(history, tasks)

  // 每日记录（包含 records）
  const dailyRecords = calculateDetailedDailyRecords(history, tasks)

  return {
    totalDays,
    longestStreak,
    currentStreak,
    weekly,
    monthly,
    yearly,
    byType,
    taskStats,
    dailyRecords,
  }
}

/**
 * 计算详细连击（基于每个任务的完成情况）
 */
function calculateDetailedStreaks(history: YTDayRecord[], tasks: YTTask[]): {
  longestStreak: number
  currentStreak: number
} {
  if (history.length === 0 || tasks.length === 0) {
    return { longestStreak: 0, currentStreak: 0 }
  }

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  // 当前连击：检查是否有连续的完成任务天数
  let currentStreak = 0

  // 从今天开始检查
  for (let i = 0; i < history.length; i++) {
    const record = history[i]
    const hasCompletedTasks = record.records.some(r => r.completed)

    if (hasCompletedTasks) {
      // 检查日期是否连续
      if (i === 0) {
        const isTodayOrYesterday = record.date === today || record.date === yesterday
        if (isTodayOrYesterday) {
          currentStreak++
        } else {
          break
        }
      } else {
        const prevRecord = history[i - 1]
        const prevDate = new Date(prevRecord.date)
        const currDate = new Date(record.date)
        const dayDiff = Math.abs((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24))

        if (dayDiff <= 1) {
          currentStreak++
        } else {
          break
        }
      }
    } else {
      break
    }
  }

  // 最长连击
  let longestStreak = 0
  let tempStreak = 0

  for (let i = 0; i < history.length; i++) {
    const record = history[i]
    const hasCompletedTasks = record.records.some(r => r.completed)

    if (hasCompletedTasks) {
      if (i === 0) {
        tempStreak = 1
      } else {
        const prevRecord = history[i - 1]
        const prevDate = new Date(prevRecord.date)
        const currDate = new Date(record.date)
        const dayDiff = Math.abs((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24))

        if (dayDiff <= 1) {
          tempStreak++
        } else {
          tempStreak = 1
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 0
    }
  }

  return { longestStreak, currentStreak }
}

/**
 * 计算周统计
 */
function calculateWeeklyStatistics(history: YTDayRecord[], today: Date): WeeklyStatistics {
  const thisWeekExp = calculateExpInDateRange(
    history,
    getWeekStart(today),
    getWeekEnd(today)
  )

  const lastWeekDate = new Date(today)
  lastWeekDate.setDate(lastWeekDate.getDate() - 7)
  const lastWeekExp = calculateExpInDateRange(
    history,
    getWeekStart(lastWeekDate),
    getWeekEnd(lastWeekDate)
  )

  let trend: 'up' | 'down' | 'stable' = 'stable'
  if (thisWeekExp > lastWeekExp * 1.1) trend = 'up'
  else if (thisWeekExp < lastWeekExp * 0.9) trend = 'down'

  return {
    thisWeek: thisWeekExp,
    lastWeek: lastWeekExp,
    trend,
  }
}

/**
 * 计算月统计
 */
function calculateMonthlyStatistics(history: YTDayRecord[], today: Date): MonthlyStatistics {
  const thisMonthExp = calculateExpInDateRange(
    history,
    getMonthStart(today),
    getMonthEnd(today)
  )

  const lastMonthDate = new Date(today)
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)
  const lastMonthExp = calculateExpInDateRange(
    history,
    getMonthStart(lastMonthDate),
    getMonthEnd(lastMonthDate)
  )

  let trend = 'stable'
  if (thisMonthExp > lastMonthExp * 1.1) trend = '上升'
  else if (thisMonthExp < lastMonthExp * 0.9) trend = '下降'

  return {
    thisMonth: thisMonthExp,
    lastMonth: lastMonthExp,
    trend,
    dailyAvg: 0,
  }
}

/**
 * 计算年度统计
 */
function calculateYearlyStatistics(
  history: YTDayRecord[],
  tasks: YTTask[],
  today: Date
): YearlyStatistics {
  const yearStart = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0]
  const yearEnd = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0]

  const yearHistory = history.filter(h => h.date >= yearStart && h.date <= yearEnd)
  // totalExp 未使用，移除
  yearHistory.reduce((sum, r) => sum + ((r as any).totalExp || r.completedTaskIds.length), 0)
  const totalTasks = tasks.length

  // 计算完成率
  const totalPossibleCompletions = yearHistory.length * totalTasks
  const actualCompletions = yearHistory.reduce((sum, r) => sum + r.records.filter(rec => rec.completed).length, 0)
  const completionRate = totalPossibleCompletions > 0 ? (actualCompletions / totalPossibleCompletions) * 100 : 0

  // 找出最佳月份
  const monthExpMap = new Map<number, number>()
  yearHistory.forEach(record => {
    const month = new Date(record.date).getMonth()
    monthExpMap.set(month, (monthExpMap.get(month) || 0) + ((record as any).totalExp || record.completedTaskIds.length))
  })

  let bestMonth = '无数据'
  let maxMonthExp = 0
  monthExpMap.forEach((exp, month) => {
    if (exp > maxMonthExp) {
      maxMonthExp = exp
      bestMonth = `${month + 1}月`
    }
  })

  return {
    totalTasks,
    completionRate: Math.round(completionRate),
    bestMonth,
  }
}

/**
 * 按类型统计
 */
function calculateByTypeStatistics(history: YTDayRecord[], tasks: YTTask[]): ByTypeStatistics {
  const stats: ByTypeStatistics = {
    check: 0,
    checkText: 0,
    number: 0,
    violation: 0,
  }

  history.forEach(record => {
    record.records.forEach(taskRecord => {
      if (taskRecord.completed) {
        const task = tasks.find(t => t.id === taskRecord.taskId)
        if (task) {
          // 使用完成次数 1 作为替代值（不再使用 expValue）
          const value = 1
          switch (task.type) {
            case 'check':
              stats.check += value
              break
            case 'check+text':
              stats.checkText += value
              break
            case 'number':
              stats.number += value
              break
            case 'violation':
              stats.violation += value
              break
          }
        }
      }
    })
  })

  return stats
}

/**
 * 计算详细任务统计
 */
function calculateDetailedTaskStats(history: YTDayRecord[], tasks: YTTask[]): DetailedTaskStatItem[] {
  return tasks.map(task => {
    const completedDays = history.filter(record =>
      record.records.some(r => r.taskId === task.id && r.completed)
    ).length

    // 使用完成天数作为替代值（不再使用 expValue）
    const totalExp = completedDays
    const currentStreak = task.streak

    // 计算最佳连击
    let bestStreak = 0
    let tempStreak = 0

    for (const record of [...history].reverse()) {
      if (record.records.some(r => r.taskId === task.id && r.completed)) {
        tempStreak++
        bestStreak = Math.max(bestStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    }

    const completionRate = history.length > 0 ? (completedDays / history.length) * 100 : 0

    return {
      taskId: task.id,
      taskName: task.name,
      taskType: task.type,
      completedDays,
      totalExp,
      currentStreak,
      bestStreak,
      completionRate,
    }
  })
}

/**
 * 计算详细每日记录
 */
function calculateDetailedDailyRecords(history: YTDayRecord[], tasks: YTTask[]): DetailedDailyRecord[] {
  return history.map(record => {
    const completedCount = record.records.filter(r => r.completed).length
    const totalCount = tasks.length
    const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

    return {
      date: record.date,
      completedCount,
      totalCount,
      totalExp: ((record as any).totalExp || record.completedTaskIds.length),
      completionRate,
      taskIds: [...record.completedTaskIds],
      records: [...record.records],
    }
  })
}

// ========================================
// 辅助函数
// ========================================

/**
 * 计算日期范围内的 EXP
 */
function calculateExpInDateRange(history: YTDayRecord[], startDate: string, endDate: string): number {
  return history
    .filter(record => record.date >= startDate && record.date <= endDate)
    .reduce((sum, r) => sum + ((r as any).totalExp || r.completedTaskIds.length), 0)
}

/**
 * 获取周的开始日期（周一）
 */
function getWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

/**
 * 获取周的结束日期（周日）
 */
function getWeekEnd(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? 0 : 7)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

/**
 * 获取月的开始日期
 */
function getMonthStart(date: Date): string {
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]
}

/**
 * 获取月的结束日期
 */
function getMonthEnd(date: Date): string {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0]
}
