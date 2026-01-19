// 任务类型定义
export type TaskType = 'check' | 'check+text' | 'number' | 'violation'

// 任务状态
export type TaskStatus = 'active' | 'paused' | 'ended'

// 任务模板
export interface TaskTemplate {
  id: string
  name: string
  icon: string
  type: TaskType
  color: string
  unit?: string
  targetValue?: number
}

// 任务排序类型
export type TaskSortType = 'created' | 'completed' | 'lastRecord'

// 任务数据结构
export interface Task {
  id: string
  name: string
  type: TaskType
  startDate: string // YYYY-MM-DD
  endDate?: string
  color: string
  unit?: string // number 类型专用，如 'kg'
  initialValue?: number // number 类型专用
  targetValue?: number // number 类型专用
  status: TaskStatus
}

// 记录数据结构
export interface Log {
  id: string
  taskId: string
  date: string // YYYY-MM-DD
  value?: number // number 类型专用
  text?: string // check+text 类型专用
  rating?: number // 可选评分 1-5
}

// 时间轴上的点
export interface TimelineDot {
  date: string
  taskId: string
  color: string
  isViolation?: boolean
}

// 日期统计
export interface DayStats {
  date: string
  logs: Log[]
  tasks: Task[]
}

// ========== 成就系统类型 ==========

// 成就条件类型
export type AchievementCondition =
  | { type: 'streak'; days: number; taskId?: string; taskName?: string }
  | { type: 'total'; count: number; taskId?: string; taskName?: string }
  | { type: 'monthly_perfect'; month: number; year: number }

// 成就定义
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'streak' | 'total' | 'perfect' | 'special'
  condition: AchievementCondition
}

// 成就状态
export interface AchievementStatus {
  achievement: Achievement
  isUnlocked: boolean
  unlockedDate?: string
  progress?: number
  progressMax?: number
}

// ========== 年度统计类型 ==========

// 年度统计
export interface YearStatistics {
  totalLogs: number
  daysWithLogs: number
  completionRate: number
  longestStreak: number
  monthlyCompletionRate: number
  topTasks: Array<{
    taskId: string
    taskName: string
    count: number
    color: string
  }>
}

// 月度数据
export interface MonthlyData {
  month: number
  monthName: string
  year: number
  totalLogs: number
  taskBreakdown: Record<string, number>
}

// 热力图单元格
export interface HeatMapCell {
  date: string
  logCount: number
  taskIds: string[]
  hasViolation: boolean
  isPerfectDay: boolean
  color: string
}

// 任务详情统计
export interface TaskDetailStatistics {
  totalCompletions: number
  avgWeeklyCompletions: number
  longestStreak: number
  currentStreak: number
  monthlyCompletions: number
  trendData?: Array<{ date: string; value: number }>
  textEntries?: Array<{ date: string; text: string; rating?: number }>
  ratingDistribution?: Array<{ rating: number; count: number }>
}

// ========== 书籍系统类型 ==========

// 书籍类型
export type BookType = 'manga' | 'novel' | 'other'

// 书籍数据结构
export interface Book {
  id: string
  name: string
  type: BookType
  coverColor?: string // 封面颜色（用于占位图）
  logs: BookLog[] // 阅读记录
}

// 书籍阅读记录
export interface BookLog {
  id: string
  date: string // YYYY-MM-DD
  rating?: number // 1-5 星评分
  note?: string // 备注
  pages?: number // 阅读页数（可选）
}

// 书籍统计
export interface BookStatistics {
  totalRead: number
  avgRating: number
  favoriteType: BookType | null
  typeDistribution: Record<BookType, number>
  ratingDistribution: Array<{ rating: number; count: number }>
  longestStreak: number // 最长连续阅读天数
  totalPages: number // 总阅读页数
}
