// ========================================
// YearTrace V2 统一任务系统数据类型定义
// ========================================

/**
 * 任务状态
 */
export type TaskStatus = 'pending' | 'completed'

/**
 * 任务类型
 */
export type TaskType = 'check' | 'check+text' | 'number' | 'violation'

/**
 * 任务记录（每日完成详情）
 */
export interface YTTaskRecord {
  taskId: string
  completed: boolean
  value?: number      // number 类型的数值
  text?: string       // check+text 类型的文本
  rating?: number     // 评分 1-5
  completedAt?: string
}

/**
 * 任务数据结构
 */
export interface YTTask {
  id: string
  name: string
  type: TaskType      // 任务类型
  status: TaskStatus
  streak: number // 连续完成天数
  order: number // 显示顺序
  color?: string           // 任务颜色
  unit?: string            // number 类型单位
  targetValue?: number     // number 类型目标值
  metadata?: {             // 灵活配置
    min?: number
    max?: number
    step?: number
    placeholder?: string
    maxLength?: number
    requireConfirm?: boolean
  }
}

/**
 * 用户状态
 */
export interface YTUser {
  streak: number // 总连击天数
}

/**
 * 每日历史记录
 */
export interface YTDayRecord {
  date: string // YYYY-MM-DD
  completedTaskIds: string[] // 已完成任务ID列表（向后兼容）
  records: YTTaskRecord[] // 详细记录数据
}

/**
 * 结算数据
 */
export interface YTSettlementData {
  date: string
  completedCount: number
  totalCount: number
  streakBefore: number
  streakAfter: number
}

/**
 * 音效类型
 */
export type SoundEffectType = 'click' | 'complete' | 'settlement'

/**
 * 按类型统计
 */
export interface ByTypeStatistics {
  check: number
  checkText: number
  number: number
  violation: number
}

/**
 * 任务统计项（扩展版）
 */
export interface TaskStatItem {
  taskId: string
  taskName: string
  taskType: TaskType
  completedDays: number
  currentStreak: number
  bestStreak: number
  completionRate: number
}

/**
 * 每日记录（扩展版）
 */
export interface DailyRecord {
  date: string
  completedCount: number
  totalCount: number
  completionRate: number
  taskIds: string[]
  records: YTTaskRecord[]
}

/**
 * 周统计
 */
export interface WeeklyStatistics {
  thisWeek: number
  lastWeek: number
  trend: 'up' | 'down' | 'stable'
}

/**
 * 月统计
 */
export interface MonthlyStatistics {
  thisMonth: number
  lastMonth: number
  trend: string
  dailyAvg: number
}

/**
 * 年度统计
 */
export interface YearlyStatistics {
  totalTasks: number
  completionRate: number
  bestMonth: string
}

/**
 * 详细统计数据
 */
export interface YTDetailedStatistics {
  totalDays: number
  longestStreak: number
  currentStreak: number
  weekly: WeeklyStatistics
  monthly: MonthlyStatistics
  yearly: YearlyStatistics
  byType: ByTypeStatistics
  taskStats: TaskStatItem[]
  dailyRecords: DailyRecord[]
}
