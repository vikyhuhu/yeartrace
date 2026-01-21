import type { YTTask, YTDayRecord, YTTaskRecord, TaskType, YTUser } from '../types/yeartrace'

/**
 * 迁移结果
 */
export interface MigrationResult {
  tasks: YTTask[]
  history: YTDayRecord[]
  user?: YTUser
  migrated: boolean
}

/**
 * 检测并迁移数据到最新格式
 * @param data 从 localStorage 加载的原始数据
 * @returns 迁移后的数据
 */
export function detectAndMigrate(data: any): MigrationResult {
  // 如果数据已经是 V3 格式（任务没有 expValue 字段）
  if (isV3Format(data)) {
    return {
      tasks: data.tasks,
      history: data.history,
      user: data.user,
      migrated: false,
    }
  }

  // 如果是 V2 格式，迁移到 V3
  if (isV2Format(data)) {
    return migrateV2ToV3(data)
  }

  // 执行 V1 到 V3 的迁移
  return migrateV1ToV3(data)
}

/**
 * 检查数据是否是 V3 格式（移除了等级和经验值）
 */
function isV3Format(data: any): boolean {
  if (!data || !data.tasks || !Array.isArray(data.tasks)) {
    return false
  }

  // V3 格式的任务没有 expValue 字段
  const hasNoExpValue = data.tasks.length === 0 || data.tasks[0]?.expValue === undefined

  // 检查历史记录是否有 records 字段
  const hasRecords =
    !data.history ||
    data.history.length === 0 ||
    data.history[0]?.records !== undefined

  // 检查用户数据没有 level, currentExp, maxExp
  const hasNoExpInUser = !data.user || (
    data.user.level === undefined &&
    data.user.currentExp === undefined &&
    data.user.maxExp === undefined
  )

  return hasNoExpValue && hasRecords && hasNoExpInUser
}

/**
 * 检查数据是否是 V2 格式
 */
function isV2Format(data: any): boolean {
  if (!data || !data.tasks || !Array.isArray(data.tasks)) {
    return false
  }

  // 检查任务是否有 type 字段
  const hasTaskType = data.tasks.length === 0 || data.tasks[0]?.type !== undefined

  // 检查历史记录是否有 records 字段
  const hasRecords =
    !data.history ||
    data.history.length === 0 ||
    data.history[0]?.records !== undefined

  return hasTaskType && hasRecords
}

/**
 * V2 到 V3 数据迁移
 * - 移除任务的 expValue 字段
 * - 移除历史记录的 totalExp 字段
 * - 移除用户的 level, currentExp, maxExp 字段
 */
function migrateV2ToV3(data: any): MigrationResult {
  const v2Tasks = data.tasks || []
  const v2History = data.history || []
  const v2User = data.user || {}

  // 迁移任务：移除 expValue 字段
  const v3Tasks: YTTask[] = v2Tasks.map((task: any) => {
    const { expValue, ...rest } = task
    return rest as YTTask
  })

  // 迁移历史记录：移除 totalExp 字段
  const v3History: YTDayRecord[] = v2History.map((record: any) => {
    const { totalExp, ...rest } = record
    return rest as YTDayRecord
  })

  // 迁移用户数据：移除等级和经验值相关字段
  const { level, currentExp, maxExp, ...restUser } = v2User
  const v3User: YTUser = {
    streak: restUser.streak || 0,
  }

  return {
    tasks: v3Tasks,
    history: v3History,
    user: v3User,
    migrated: true,
  }
}

/**
 * V1 到 V3 数据迁移
 * - 为任务添加 type 字段，默认为 'check'
 * - 为历史记录添加 records 字段
 * - 移除所有等级和经验值相关字段
 */
function migrateV1ToV3(data: any): MigrationResult {
  const v1Tasks = data.tasks || []
  const v1History = data.history || []
  const v1User = data.user || {}

  // 迁移任务：添加 type 字段，默认为 'check'，移除 expValue
  const v3Tasks: YTTask[] = v1Tasks.map((task: any) => {
    const { expValue, ...rest } = task
    return {
      ...rest,
      type: (task.type as TaskType) || 'check',
      color: task.color || undefined,
      unit: task.unit || undefined,
      targetValue: task.targetValue || undefined,
      metadata: task.metadata || undefined,
    } as YTTask
  })

  // 迁移历史记录：添加 records 字段，移除 totalExp
  const v3History: YTDayRecord[] = v1History.map((record: any) => {
    const { totalExp, ...rest } = record
    const records: YTTaskRecord[] = (record.completedTaskIds || []).map(
      (taskId: string) => ({
        taskId,
        completed: true,
        completedAt: undefined,
      })
    )

    return {
      ...rest,
      records,
    } as YTDayRecord
  })

  // 迁移用户数据：只保留 streak
  const v3User: YTUser = {
    streak: v1User.streak || 0,
  }

  return {
    tasks: v3Tasks,
    history: v3History,
    user: v3User,
    migrated: true,
  }
}

/**
 * 创建新的 V2 数据
 */
export function createInitialV2Data(tasks: YTTask[]): {
  tasks: YTTask[]
  history: YTDayRecord[]
} {
  return {
    tasks,
    history: [],
  }
}

/**
 * 为新任务创建默认记录
 */
export function createTaskRecord(taskId: string): YTTaskRecord {
  return {
    taskId,
    completed: false,
  }
}

/**
 * 创建 check+text 类型的记录
 */
export function createCheckTextRecord(
  taskId: string,
  text: string,
  rating: number
): YTTaskRecord {
  return {
    taskId,
    completed: true,
    text,
    rating,
    completedAt: new Date().toISOString(),
  }
}

/**
 * 创建 number 类型的记录
 */
export function createNumberRecord(taskId: string, value: number): YTTaskRecord {
  return {
    taskId,
    completed: true,
    value,
    completedAt: new Date().toISOString(),
  }
}

/**
 * 创建 violation 类型的记录
 */
export function createViolationRecord(taskId: string): YTTaskRecord {
  return {
    taskId,
    completed: true,
    completedAt: new Date().toISOString(),
  }
}

/**
 * 重新计算所有任务的连击数
 * 基于历史记录重新计算 streak
 */
export function recalculateAllStreaks(
  tasks: YTTask[],
  history: YTDayRecord[]
): YTTask[] {
  const today = new Date().toISOString().split('T')[0]

  return tasks.map(task => {
    let currentStreak = 0
    let bestStreak = 0
    let tempStreak = 0

    // 按日期排序（从最新到最旧）
    const sortedHistory = [...history].sort((a, b) =>
      b.date.localeCompare(a.date)
    )

    // 计算当前连击（从今天开始，连续有记录的天数）
    for (const record of sortedHistory) {
      const taskRecord = record.records.find(r => r.taskId === task.id)
      if (taskRecord?.completed) {
        // 检查是否是连续的日期
        if (currentStreak === 0) {
          if (record.date === today || record.date === getYesterday(today)) {
            currentStreak = 1
          }
        } else {
          currentStreak++
        }
      } else {
        if (currentStreak > 0) break
      }
    }

    // 计算最佳连击
    for (const record of sortedHistory) {
      const taskRecord = record.records.find(r => r.taskId === task.id)
      if (taskRecord?.completed) {
        tempStreak++
        bestStreak = Math.max(bestStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    }

    return {
      ...task,
      streak: currentStreak,
    }
  })
}

/**
 * 获取昨天的日期字符串
 */
function getYesterday(today: string): string {
  const date = new Date(today)
  date.setDate(date.getDate() - 1)
  return date.toISOString().split('T')[0]
}

/**
 * 获取周的日期范围
 */
export function getWeekRange(date: Date): { start: string; end: string } {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // 周一作为一周的开始

  const monday = new Date(d.setDate(diff))
  const sunday = new Date(d.setDate(diff + 6))

  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
  }
}

/**
 * 获取月的日期范围
 */
export function getMonthRange(date: Date): { start: string; end: string } {
  const year = date.getFullYear()
  const month = date.getMonth()

  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}
