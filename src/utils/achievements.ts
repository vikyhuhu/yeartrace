import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns'
import type { Achievement, AchievementStatus, Task, Log } from '../types'

// 成就定义配置
export const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  // 连续打卡类
  {
    id: 'streak_7',
    name: '早起之星',
    description: '连续打卡 7 天',
    icon: '⭐',
    category: 'streak',
    condition: { type: 'streak', days: 7 },
  },
  {
    id: 'streak_30',
    name: '月度王者',
    description: '连续打卡 30 天',
    icon: '🏆',
    category: 'streak',
    condition: { type: 'streak', days: 30 },
  },
  {
    id: 'streak_100',
    name: '百日征程',
    description: '连续打卡 100 天',
    icon: '👑',
    category: 'streak',
    condition: { type: 'streak', days: 100 },
  },

  // 总次数类
  {
    id: 'books_10',
    name: '阅读达人',
    description: '完成 10 本书',
    icon: '📚',
    category: 'total',
    condition: { type: 'total', count: 10 },
  },
  {
    id: 'total_100',
    name: '里程碑',
    description: '累计完成 100 次任务',
    icon: '🎯',
    category: 'total',
    condition: { type: 'total', count: 100 },
  },
  {
    id: 'total_365',
    name: '年度全勤',
    description: '累计完成 365 次任务',
    icon: '💎',
    category: 'total',
    condition: { type: 'total', count: 365 },
  },

  // 月度全勤类
  {
    id: 'perfect_jan',
    name: '一月完美',
    description: '一月全勤',
    icon: '🌟',
    category: 'perfect',
    condition: { type: 'monthly_perfect', month: 0, year: new Date().getFullYear() },
  },
  {
    id: 'perfect_feb',
    name: '二月完美',
    description: '二月全勤',
    icon: '🌟',
    category: 'perfect',
    condition: { type: 'monthly_perfect', month: 1, year: new Date().getFullYear() },
  },
  {
    id: 'perfect_mar',
    name: '三月完美',
    description: '三月全勤',
    icon: '🌟',
    category: 'perfect',
    condition: { type: 'monthly_perfect', month: 2, year: new Date().getFullYear() },
  },
  {
    id: 'perfect_apr',
    name: '四月完美',
    description: '四月全勤',
    icon: '🌟',
    category: 'perfect',
    condition: { type: 'monthly_perfect', month: 3, year: new Date().getFullYear() },
  },
  {
    id: 'perfect_may',
    name: '五月完美',
    description: '五月全勤',
    icon: '🌟',
    category: 'perfect',
    condition: { type: 'monthly_perfect', month: 4, year: new Date().getFullYear() },
  },
  {
    id: 'perfect_jun',
    name: '六月完美',
    description: '六月全勤',
    icon: '🌟',
    category: 'perfect',
    condition: { type: 'monthly_perfect', month: 5, year: new Date().getFullYear() },
  },
  {
    id: 'perfect_jul',
    name: '七月完美',
    description: '七月全勤',
    icon: '🌟',
    category: 'perfect',
    condition: { type: 'monthly_perfect', month: 6, year: new Date().getFullYear() },
  },
  {
    id: 'perfect_aug',
    name: '八月完美',
    description: '八月全勤',
    icon: '🌟',
    category: 'perfect',
    condition: { type: 'monthly_perfect', month: 7, year: new Date().getFullYear() },
  },
  {
    id: 'perfect_sep',
    name: '九月完美',
    description: '九月全勤',
    icon: '🌟',
    category: 'perfect',
    condition: { type: 'monthly_perfect', month: 8, year: new Date().getFullYear() },
  },
  {
    id: 'perfect_oct',
    name: '十月完美',
    description: '十月全勤',
    icon: '🌟',
    category: 'perfect',
    condition: { type: 'monthly_perfect', month: 9, year: new Date().getFullYear() },
  },
  {
    id: 'perfect_nov',
    name: '十一月完美',
    description: '十一月全勤',
    icon: '🌟',
    category: 'perfect',
    condition: { type: 'monthly_perfect', month: 10, year: new Date().getFullYear() },
  },
  {
    id: 'perfect_dec',
    name: '十二月完美',
    description: '十二月全勤',
    icon: '🌟',
    category: 'perfect',
    condition: { type: 'monthly_perfect', month: 11, year: new Date().getFullYear() },
  },
]

// 检查成就解锁状态
export function checkAchievementStatus(
  achievements: Achievement[],
  logs: Log[],
  tasks: Task[]
): AchievementStatus[] {
  return achievements.map(achievement => {
    const { isUnlocked, unlockedDate, progress, progressMax } =
      checkSingleAchievement(achievement, logs, tasks)

    return {
      achievement,
      isUnlocked,
      unlockedDate,
      progress,
      progressMax,
    }
  })
}

function checkSingleAchievement(
  achievement: Achievement,
  logs: Log[],
  tasks: Task[]
): { isUnlocked: boolean; unlockedDate?: string; progress?: number; progressMax?: number } {
  const condition = achievement.condition

  // 连续打卡类
  if (condition.type === 'streak') {
    const currentStreak = calculateOverallStreak(logs, tasks)

    const isUnlocked = currentStreak >= condition.days
    return {
      isUnlocked,
      progress: currentStreak,
      progressMax: condition.days,
    }
  }

  // 总次数类
  if (condition.type === 'total') {
    const filteredLogs = logs.filter(l => {
      const task = tasks.find(t => t.id === l.taskId)
      return task && task.type !== 'violation'
    })

    const count = filteredLogs.length
    const isUnlocked = count >= condition.count

    // 获取解锁日期
    let unlockedDate: string | undefined
    if (isUnlocked) {
      const sortedLogs = [...filteredLogs].sort((a, b) => a.date.localeCompare(b.date))
      unlockedDate = sortedLogs[condition.count - 1]?.date
    }

    return {
      isUnlocked,
      unlockedDate,
      progress: count,
      progressMax: condition.count,
    }
  }

  // 月度全勤类
  if (condition.type === 'monthly_perfect') {
    const monthStart = startOfMonth(new Date(condition.year, condition.month, 1))
    const monthEnd = endOfMonth(new Date(condition.year, condition.month))

    // 获取该月活跃的任务
    const activeTasks = tasks.filter(t => {
      if (t.type === 'violation') return false
      const taskStart = new Date(t.startDate)
      const taskEnd = t.endDate ? new Date(t.endDate) : null
      const checkDate = new Date(condition.year, condition.month, 15)
      if (checkDate < taskStart) return false
      if (taskEnd && checkDate > taskEnd) return false
      return true
    })

    if (activeTasks.length === 0) {
      return { isUnlocked: false }
    }

    // 检查每一天是否全勤
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
    const today = new Date()
    const checkDays = monthDays.filter(d => d <= today)

    let perfectDays = 0
    for (const day of checkDays) {
      const dateStr = format(day, 'yyyy-MM-dd')
      const dayLogs = logs.filter(l => l.date === dateStr)
      const allCompleted = activeTasks.every(task =>
        dayLogs.some(l => l.taskId === task.id)
      )
      if (allCompleted) perfectDays++
    }

    const isUnlocked = perfectDays === checkDays.length && checkDays.length > 0
    return {
      isUnlocked,
      progress: perfectDays,
      progressMax: checkDays.length,
    }
  }

  return { isUnlocked: false }
}

// 计算整体连续打卡(所有任务)
function calculateOverallStreak(logs: Log[], tasks: Task[]): number {
  const regularTasks = tasks.filter(t => t.type !== 'violation')
  if (regularTasks.length === 0) return 0

  // 按日期分组
  const datesMap = new Map<string, Set<string>>()
  logs.forEach(log => {
    if (!datesMap.has(log.date)) {
      datesMap.set(log.date, new Set())
    }
    datesMap.get(log.date)!.add(log.taskId)
  })

  // 从今天开始往前推
  const today = new Date()
  let streak = 0
  let checkDate = new Date(today)

  while (true) {
    const dateStr = format(checkDate, 'yyyy-MM-dd')
    const completedTasks = datesMap.get(dateStr)

    // 检查当天是否完成了所有活跃任务
    const activeTasks = regularTasks.filter(t => {
      const taskStart = new Date(t.startDate)
      const taskEnd = t.endDate ? new Date(t.endDate) : null
      if (checkDate < taskStart) return false
      if (taskEnd && checkDate > taskEnd) return false
      return true
    })

    const allCompleted = activeTasks.length > 0 &&
      activeTasks.every(t => completedTasks?.has(t.id))

    if (allCompleted) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}
