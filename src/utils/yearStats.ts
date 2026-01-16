import { format, startOfYear, endOfYear, eachMonthOfInterval, eachDayOfInterval } from 'date-fns'
import type { Task, Log, YearStatistics, HeatMapCell, TaskDetailStatistics } from '../types'

// ========== 年度核心统计 ==========

export function calculateYearStatistics(
  year: number,
  logs: Log[],
  tasks: Task[],
  filterTaskId?: string | null
): YearStatistics {
  const yearStart = startOfYear(new Date(year, 0, 1))
  const yearEnd = endOfYear(new Date(year, 0, 1))
  const yearLogs = logs.filter(l => {
    const logDate = new Date(l.date)
    return logDate >= yearStart && logDate <= yearEnd && (!filterTaskId || l.taskId === filterTaskId)
  })

  const daysWithLogs = new Set(yearLogs.map(l => l.date)).size
  const totalDays = eachDayOfInterval({ start: yearStart, end: yearEnd }).length

  // 计算最长连续打卡
  const longestStreak = calculateLongestStreak(yearLogs, tasks, filterTaskId)

  // 计算本月完成率
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  let monthlyCompletionRate = 0
  if (year === currentYear) {
    monthlyCompletionRate = calculateMonthlyCompletionRate(
      year,
      currentMonth,
      logs,
      tasks,
      filterTaskId
    )
  }

  // 计算最活跃任务 Top 3
  const topTasks = calculateTopTasks(yearLogs, tasks, 3)

  return {
    totalLogs: yearLogs.length,
    daysWithLogs,
    completionRate: totalDays > 0 ? (daysWithLogs / totalDays) * 100 : 0,
    longestStreak,
    monthlyCompletionRate,
    topTasks,
  }
}

// ========== 连续打卡计算 ==========

export function calculateLongestStreak(
  logs: Log[],
  _tasks: Task[],
  _filterTaskId?: string | null
): number {
  // 按日期分组
  const datesWithLogs = new Set(logs.map(l => l.date))
  const sortedDates = Array.from(datesWithLogs).sort()

  if (sortedDates.length === 0) return 0

  let maxStreak = 1
  let currentStreak = 1

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1])
    const currDate = new Date(sortedDates[i])
    const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)

    if (diffDays === 1) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }

  return maxStreak
}

// ========== 月度完成率计算 ==========

export function calculateMonthlyCompletionRate(
  year: number,
  month: number,
  logs: Log[],
  _tasks: Task[],
  _filterTaskId?: string | null
): number {
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0)
  const today = new Date()

  // 如果是当前月份,只计算到今天
  const endDate = today.getFullYear() === year && today.getMonth() === month
    ? today
    : monthEnd

  const totalDays = Math.floor((endDate.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)) + 1

  // 获取该月活跃的任务
  const activeTasks = _tasks.filter((t: Task) => {
    const taskStart = new Date(t.startDate)
    const taskEnd = t.endDate ? new Date(t.endDate) : null
    const checkDate = new Date(year, month, 15)

    if (checkDate < taskStart) return false
    if (taskEnd && checkDate > taskEnd) return false
    if (_filterTaskId && t.id !== _filterTaskId) return false
    return t.type !== 'violation'
  })

  if (activeTasks.length === 0) return 0

  // 计算理论上应该完成的总次数
  const theoreticalTotal = activeTasks.length * totalDays

  // 计算实际完成次数
  const monthLogs = logs.filter(l => {
    const logDate = new Date(l.date)
    return logDate >= monthStart && logDate <= endDate
  })

  const actualTotal = monthLogs.filter(l => {
    const task = _tasks.find((t: Task) => t.id === l.taskId)
    return task && task.type !== 'violation' && (!_filterTaskId || l.taskId === _filterTaskId)
  }).length

  return theoreticalTotal > 0 ? (actualTotal / theoreticalTotal) * 100 : 0
}

// ========== 最活跃任务计算 ==========

export function calculateTopTasks(
  logs: Log[],
  tasks: Task[],
  limit: number
): Array<{ taskId: string; taskName: string; count: number; color: string }> {
  const taskCounts = new Map<string, number>()

  logs.forEach(log => {
    taskCounts.set(log.taskId, (taskCounts.get(log.taskId) || 0) + 1)
  })

  return Array.from(taskCounts.entries())
    .map(([taskId, count]) => {
      const task = tasks.find(t => t.id === taskId)
      return {
        taskId,
        taskName: task?.name || '未知任务',
        count,
        color: task?.color || '#ccc',
      }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

// ========== 月度趋势数据 ==========

export function calculateMonthlyTrend(
  year: number,
  logs: Log[],
  _tasks: Task[],
  filterTaskIds?: string[]
): Array<{ month: number; monthName: string; [key: string]: any }> {
  const yearStart = startOfYear(new Date(year, 0, 1))
  const yearEnd = endOfYear(new Date(year, 0, 1))
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd })

  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ]

  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  return months.map((_date, idx) => {
    // 如果是当前年份，只显示到当前月份
    if (year === currentYear && idx > currentMonth) {
      return {
        month: idx + 1,
        monthName: monthNames[idx],
        total: 0,
      }
    }

    const monthStart = new Date(year, idx, 1)
    const monthEnd = new Date(year, idx + 1, 0)

    const monthLogs = logs.filter(l => {
      const logDate = new Date(l.date)
      return logDate >= monthStart && logDate <= monthEnd
    })

    const data: any = {
      month: idx + 1,
      monthName: monthNames[idx],
      total: monthLogs.length,
    }

    // 按任务分组统计
    if (filterTaskIds && filterTaskIds.length > 0) {
      filterTaskIds.forEach(taskId => {
        data[taskId] = monthLogs.filter(l => l.taskId === taskId).length
      })
    }

    return data
  })
}

// ========== 热力图数据生成 ==========

export function generateHeatMapCells(
  year: number,
  logs: Log[],
  tasks: Task[],
  filterTaskId?: string | null
): HeatMapCell[] {
  const yearStart = startOfYear(new Date(year, 0, 1))
  const yearEnd = endOfYear(new Date(year, 0, 1))
  const yearDays = eachDayOfInterval({ start: yearStart, end: yearEnd })

  return yearDays.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const dayLogs = logs.filter(l => l.date === dateStr && (!filterTaskId || l.taskId === filterTaskId))
    const logCount = dayLogs.length
    const taskIds = Array.from(new Set(dayLogs.map(l => l.taskId)))

    // 检查是否有违规记录
    const hasViolation = dayLogs.some(l => {
      const task = tasks.find(t => t.id === l.taskId)
      return task?.type === 'violation'
    })

    // 检查是否是全勤日
    const activeTasks = tasks.filter(t => {
      if (t.type === 'violation') return false
      if (filterTaskId && t.id !== filterTaskId) return false
      const taskStart = new Date(t.startDate)
      const taskEnd = t.endDate ? new Date(t.endDate) : null
      if (date < taskStart) return false
      if (taskEnd && date > taskEnd) return false
      return true
    })

    const isPerfectDay = activeTasks.length > 0 &&
      activeTasks.every(task => dayLogs.some(l => l.taskId === task.id))

    // 计算颜色
    let color = '#f3f4f6' // 0个
    if (logCount >= 1 && logCount <= 2) color = '#dbeafe'
    else if (logCount >= 3 && logCount <= 4) color = '#93c5fd'
    else if (logCount >= 5) color = '#3b82f6'

    return {
      date: dateStr,
      logCount,
      taskIds,
      hasViolation,
      isPerfectDay,
      color,
    }
  })
}

// ========== 任务详情统计 ==========

export function calculateTaskDetailStatistics(
  task: Task,
  year: number,
  currentMonth: number,
  allLogs: Log[]
): TaskDetailStatistics {
  const yearLogs = allLogs.filter(l => {
    const logDate = new Date(l.date)
    return logDate.getFullYear() === year && l.taskId === task.id
  })

  const totalCompletions = yearLogs.length
  const longestStreak = calculateLongestStreak(yearLogs, [task])

  // 计算当前连续天数
  const today = new Date()
  const sortedLogs = [...yearLogs].sort((a, b) => b.date.localeCompare(a.date))
  let currentStreak = 0
  for (let i = 0; i < sortedLogs.length; i++) {
    const logDate = new Date(sortedLogs[i].date)
    const expectedDate = new Date(today)
    expectedDate.setDate(expectedDate.getDate() - i)
    if (format(logDate, 'yyyy-MM-dd') === format(expectedDate, 'yyyy-MM-dd')) {
      currentStreak++
    } else {
      break
    }
  }

  // 计算平均每周完成次数
  const weeksInYear = 52
  const avgWeeklyCompletions = totalCompletions / weeksInYear

  // 计算本月完成次数
  const monthLogs = yearLogs.filter(l => {
    const logDate = new Date(l.date)
    return logDate.getMonth() === currentMonth
  })
  const monthlyCompletions = monthLogs.length

  const result: TaskDetailStatistics = {
    totalCompletions,
    avgWeeklyCompletions,
    longestStreak,
    currentStreak,
    monthlyCompletions,
  }

  // 数字类型任务: 计算趋势
  if (task.type === 'number') {
    result.trendData = yearLogs
      .filter(l => l.value !== undefined)
      .map(l => ({ date: l.date, value: l.value! }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  // 文本类型任务: 计算评分分布
  if (task.type === 'check+text') {
    result.textEntries = yearLogs
      .filter(l => l.text)
      .map(l => ({
        date: l.date,
        text: l.text!,
        rating: l.rating,
      }))
      .sort((a, b) => b.date.localeCompare(a.date))

    // 计算评分分布
    const ratings = yearLogs.filter(l => l.rating).map(l => l.rating!)
    const ratingCounts = new Map<number, number>()
    ratings.forEach(r => ratingCounts.set(r, (ratingCounts.get(r) || 0) + 1))
    result.ratingDistribution = Array.from(ratingCounts.entries())
      .map(([rating, count]) => ({ rating, count }))
      .sort((a, b) => a.rating - b.rating)
  }

  return result
}
