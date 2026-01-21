import { useState, useEffect, useCallback } from 'react'
import type { YTTask, YTUser, YTDayRecord, YTTaskRecord, TaskType, TaskStatus } from '../types/yeartrace'
import { detectAndMigrate, createInitialV2Data, recalculateAllStreaks } from '../utils/yearTraceMigration'

const STORAGE_KEY = 'yeartrove_data'
const MAX_TASKS = 8 // 最大任务数量

// 默认任务（V2 硬编码 4 个，全部为 check 类型）
const DEFAULT_TASKS: YTTask[] = [
  { id: '1', name: '每日阅读', type: 'check', status: 'pending', streak: 0, order: 1 },
  { id: '2', name: '每日运动', type: 'check', status: 'pending', streak: 0, order: 2 },
  { id: '3', name: '每日冥想', type: 'check', status: 'pending', streak: 0, order: 3 },
  { id: '4', name: '每日学习', type: 'check', status: 'pending', streak: 0, order: 4 },
]

const DEFAULT_USER: YTUser = {
  streak: 0,
}

interface YearTraceData {
  tasks: YTTask[]
  user: YTUser
  history: YTDayRecord[]
}

const getTodayDate = () => new Date().toISOString().split('T')[0]

// 从 localStorage 加载数据
const loadData = (): YearTraceData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const rawData = JSON.parse(stored)

      // 使用迁移工具检测并迁移数据
      const { tasks, history, user, migrated } = detectAndMigrate(rawData)

      // 如果发生了迁移，保存迁移后的数据
      if (migrated) {
        console.log('YearTrace: 数据已迁移到最新格式')
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, user: user || DEFAULT_USER, history }))
      }

      // 检查是否是新的一天，如果是则重置任务状态
      const today = getTodayDate()
      const lastRecord = history[0]

      if (lastRecord && lastRecord.date !== today) {
        // 新的一天，重置所有任务为未完成
        const resetTasks = tasks.map(task => ({ ...task, status: 'pending' as TaskStatus }))
        return { tasks: resetTasks, user: rawData.user || DEFAULT_USER, history }
      }

      return { tasks, user: rawData.user || DEFAULT_USER, history }
    }
  } catch (e) {
    console.error('Failed to load YearTrace data:', e)
  }

  // 返回默认数据
  const initialData = createInitialV2Data(DEFAULT_TASKS)
  return {
    tasks: initialData.tasks,
    user: DEFAULT_USER,
    history: initialData.history,
  }
}

// 保存数据到 localStorage
const saveData = (data: YearTraceData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save YearTrace data:', e)
  }
}

/**
 * YearTrace 状态管理 Hook
 */
export function useYearTrace() {
  const [tasks, setTasks] = useState<YTTask[]>([])
  const [user, setUser] = useState<YTUser>({ ...DEFAULT_USER })
  const [history, setHistory] = useState<YTDayRecord[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // 初始化：加载数据
  useEffect(() => {
    const data = loadData()
    setTasks(data.tasks)
    setUser(data.user)
    setHistory(data.history)
    setIsLoaded(true)
  }, [])

  // 保存数据（当状态变化时）
  useEffect(() => {
    if (isLoaded) {
      saveData({ tasks, user, history })
    }
  }, [tasks, user, history, isLoaded])

  /**
   * 完成任务（V2: 支持记录详情，支持指定日期）
   */
  const completeTask = (
    taskId: string,
    record?: Omit<YTTaskRecord, 'taskId' | 'completed' | 'completedAt'>,
    targetDate?: string
  ): {
    streakBefore: number
    streakAfter: number
  } | null => {
    const taskIndex = tasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) return null

    const task = tasks[taskIndex]
    const date = targetDate || getTodayDate()
    const isToday = date === getTodayDate()

    // 获取目标日期的记录
    const dayRecord = history.find(h => h.date === date)
    const existingRecord = dayRecord?.records.find(r => r.taskId === taskId)

    // 如果已经完成，返回null
    if (existingRecord?.completed) return null

    // 创建任务记录
    const taskRecord: YTTaskRecord = {
      taskId,
      completed: true,
      ...record,
      completedAt: new Date().toISOString(),
    }

    // 只在操作今天时更新任务状态
    if (isToday) {
      // 计算新的连击数
      const newStreak = task.streak + 1

      // 更新任务状态
      const updatedTasks = [...tasks]
      updatedTasks[taskIndex] = {
        ...task,
        status: 'completed',
        streak: newStreak,
      }
      setTasks(updatedTasks)

      // 更新总连击（取所有任务的最大连击）
      const newUser = { ...user }
      newUser.streak = Math.max(...updatedTasks.map(t => t.streak))
      setUser(newUser)

      return {
        streakBefore: task.streak,
        streakAfter: newStreak,
      }
    }

    // 更新目标日期的历史记录
    if (dayRecord) {
      const updatedHistory = history.map(h =>
        h.date === date
          ? {
              ...h,
              completedTaskIds: [...h.completedTaskIds, taskId],
              records: [...h.records, taskRecord],
            }
          : h
      )
      setHistory(updatedHistory)
    } else {
      // 创建新的历史记录
      setHistory([
        {
          date,
          completedTaskIds: [taskId],
          records: [taskRecord],
        },
        ...history,
      ].sort((a, b) => b.date.localeCompare(a.date)))
    }

    // 如果不是今天，重新计算连击
    if (!isToday) {
      setTimeout(() => {
        recalculateStreaks()
      }, 0)
    }

    return {
      streakBefore: task.streak,
      streakAfter: task.streak + 1,
    }
  }

  /**
   * 取消完成任务（V2: 支持记录详情，支持指定日期）
   */
  const uncompleteTask = (taskId: string, targetDate?: string): {
    streakBefore: number
    streakAfter: number
  } | null => {
    const taskIndex = tasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) return null

    const task = tasks[taskIndex]
    const date = targetDate || getTodayDate()
    const isToday = date === getTodayDate()

    // 获取目标日期的记录
    const dayRecord = history.find(h => h.date === date)
    const existingRecord = dayRecord?.records.find(r => r.taskId === taskId)

    // 如果没有完成，返回null
    if (!existingRecord?.completed) return null

    // 只在操作今天时更新任务状态
    if (isToday) {
      // 计算回退后的连击数（最小为 0）
      const newStreak = Math.max(0, task.streak - 1)

      // 更新任务状态
      const updatedTasks = [...tasks]
      updatedTasks[taskIndex] = {
        ...task,
        status: 'pending',
        streak: newStreak,
      }
      setTasks(updatedTasks)

      // 更新总连击（取所有任务的最大连击）
      const newUser = { ...user }
      newUser.streak = Math.max(...updatedTasks.map(t => t.streak), 0)
      setUser(newUser)

      return {
        streakBefore: task.streak,
        streakAfter: newStreak,
      }
    }

    // 更新目标日期的历史记录（从记录中移除该任务）
    if (dayRecord) {
      const filteredTaskIds = dayRecord.completedTaskIds.filter(id => id !== taskId)
      const filteredRecords = dayRecord.records.filter(r => r.taskId !== taskId)

      if (filteredTaskIds.length === 0) {
        // 如果该日期没有已完成的任务，移除该记录
        setHistory(history.filter(h => h.date !== date))
      } else {
        // 否则更新记录
        const updatedHistory = history.map(h =>
          h.date === date
            ? {
                ...h,
                completedTaskIds: filteredTaskIds,
                records: filteredRecords,
              }
            : h
        )
        setHistory(updatedHistory)
      }
    }

    // 如果不是今天，重新计算连击
    if (!isToday) {
      setTimeout(() => {
        recalculateStreaks()
      }, 0)
    }

    return {
      streakBefore: task.streak,
      streakAfter: Math.max(0, task.streak - 1),
    }
  }

  /**
   * 更新任务（V2: 支持所有字段）
   */
  const updateTask = (
    taskId: string,
    updates: Partial<Pick<YTTask, 'name' | 'type' | 'color' | 'unit' | 'targetValue' | 'metadata'>>
  ): boolean => {
    const taskIndex = tasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) return false

    const updatedTasks = [...tasks]
    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], ...updates }
    setTasks(updatedTasks)
    return true
  }

  /**
   * 检查是否所有任务都已完成
   */
  const isAllCompleted = () => {
    return tasks.length > 0 && tasks.every(t => t.status === 'completed')
  }

  /**
   * 获取今日进度
   */
  const getTodayProgress = () => {
    const completed = tasks.filter(t => t.status === 'completed').length
    return {
      completed,
      total: tasks.length,
      percentage: tasks.length > 0 ? (completed / tasks.length) * 100 : 0,
    }
  }

  /**
   * 添加新任务（V2: 支持 type 和其他字段）
   */
  const addTask = (
    name: string,
    type: TaskType = 'check',
    options?: Partial<Pick<YTTask, 'color' | 'unit' | 'targetValue' | 'metadata'>>
  ): { success: boolean; taskId?: string; error?: string } => {
    if (tasks.length >= MAX_TASKS) {
      return { success: false, error: `最多只能创建 ${MAX_TASKS} 个任务` }
    }

    // 生成唯一 ID
    const newId = Date.now().toString()
    // 获取下一个 order 值
    const maxOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.order)) : 0

    const newTask: YTTask = {
      id: newId,
      name,
      type,
      status: 'pending',
      streak: 0,
      order: maxOrder + 1,
      ...options,
    }

    setTasks([...tasks, newTask])
    return { success: true, taskId: newId }
  }

  /**
   * 删除任务（V2: 同时移除 records）
   */
  const deleteTask = (taskId: string): { success: boolean; error?: string } => {
    const taskIndex = tasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) {
      return { success: false, error: '任务不存在' }
    }

    // 从历史记录中移除该任务
    const updatedHistory = history.map(record => {
      const taskWasCompleted = record.completedTaskIds.includes(taskId)
      if (!taskWasCompleted) return record

      const newCompletedTaskIds = record.completedTaskIds.filter(id => id !== taskId)
      const newRecords = record.records.filter(r => r.taskId !== taskId)

      return {
        ...record,
        completedTaskIds: newCompletedTaskIds,
        records: newRecords,
      }
    })

    setHistory(updatedHistory)

    // 删除任务并重新排序
    const remainingTasks = tasks.filter(t => t.id !== taskId)
    const reorderedTasks = remainingTasks.map((t, i) => ({ ...t, order: i + 1 }))
    setTasks(reorderedTasks)

    return { success: true }
  }

  /**
   * 重新排序任务
   */
  const reorderTasks = (fromIndex: number, toIndex: number): void => {
    if (fromIndex < 0 || fromIndex >= tasks.length || toIndex < 0 || toIndex >= tasks.length) {
      return
    }

    const newTasks = [...tasks]
    const [movedTask] = newTasks.splice(fromIndex, 1)
    newTasks.splice(toIndex, 0, movedTask)

    // 更新 order 值
    const reorderedTasks = newTasks.map((t, i) => ({ ...t, order: i + 1 }))
    setTasks(reorderedTasks)
  }

  /**
   * 获取指定日期的任务记录
   */
  const getTaskRecord = useCallback((date: string, taskId: string): YTTaskRecord | undefined => {
    const dayRecord = history.find(h => h.date === date)
    return dayRecord?.records.find(r => r.taskId === taskId)
  }, [history])

  /**
   * 补录历史记录
   */
  const backfillHistory = useCallback((
    date: string,
    records: YTTaskRecord[]
  ): { success: boolean; error?: string } => {
    // 验证日期格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return { success: false, error: '日期格式无效，请使用 YYYY-MM-DD 格式' }
    }

    // 检查日期是否已存在
    const existingIndex = history.findIndex(h => h.date === date)

    // 获取已完成的任务ID列表
    const completedTaskIds: string[] = []

    records.forEach(record => {
      if (record.completed) {
        const task = tasks.find(t => t.id === record.taskId)
        if (task) {
          completedTaskIds.push(record.taskId)
        }
      }
    })

    if (existingIndex >= 0) {
      // 更新现有记录
      const updatedHistory = [...history]
      updatedHistory[existingIndex] = {
        date,
        completedTaskIds,
        records,
      }
      setHistory(updatedHistory)
    } else {
      // 插入新记录（按日期排序）
      const newRecord: YTDayRecord = {
        date,
        completedTaskIds,
        records,
      }
      const newHistory = [...history, newRecord].sort((a, b) => b.date.localeCompare(a.date))
      setHistory(newHistory)
    }

    // 重新计算所有任务的连击数
    const recalculatedTasks = recalculateAllStreaks(tasks, [...history, {
      date,
      completedTaskIds,
      records,
    }].sort((a, b) => b.date.localeCompare(a.date)))
    setTasks(recalculatedTasks)

    return { success: true }
  }, [tasks, history])

  /**
   * 重新计算所有任务的连击数
   */
  const recalculateStreaks = useCallback(() => {
    const recalculatedTasks = recalculateAllStreaks(tasks, history)
    setTasks(recalculatedTasks)
  }, [tasks, history])

  /**
   * 获取任务的详细历史记录
   */
  const getTaskHistory = useCallback((taskId: string): Array<{ date: string; record: YTTaskRecord }> => {
    const result: Array<{ date: string; record: YTTaskRecord }> = []
    history.forEach(dayRecord => {
      const taskRecord = dayRecord.records.find(r => r.taskId === taskId)
      if (taskRecord) {
        result.push({ date: dayRecord.date, record: taskRecord })
      }
    })
    return result.sort((a, b) => b.date.localeCompare(a.date))
  }, [history])

  return {
    tasks,
    user,
    history,
    isLoaded,
    MAX_TASKS,
    completeTask,
    uncompleteTask,
    updateTask,
    addTask,
    deleteTask,
    reorderTasks,
    isAllCompleted,
    getTodayProgress,
    getTaskRecord,
    backfillHistory,
    recalculateStreaks,
    getTaskHistory,
  }
}
