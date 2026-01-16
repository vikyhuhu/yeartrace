import type { Task, Log } from '../types'

const STORAGE_KEYS = {
  TASKS: 'yeartrace_tasks',
  LOGS: 'yeartrace_logs',
}

// 生成唯一 ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ========== Tasks ==========

export function getTasks(): Task[] {
  const data = localStorage.getItem(STORAGE_KEYS.TASKS)
  if (!data) return []
  try {
    const tasks = JSON.parse(data) as Task[]

    // 去重：基于任务名称和类型，保留最早创建的任务
    const taskMap = new Map<string, Task>()
    for (const task of tasks) {
      const key = `${task.name}|${task.type}`
      const existing = taskMap.get(key)
      if (!existing) {
        taskMap.set(key, task)
      } else {
        // 保留较早创建的任务（ID时间戳更小的）
        const existingTime = Number(existing.id.split('-')[0]) || 0
        const newTime = Number(task.id.split('-')[0]) || 0
        if (newTime < existingTime) {
          taskMap.set(key, task)
        }
      }
    }

    const uniqueTasks = Array.from(taskMap.values())

    // 如果去重后有变化，更新存储
    if (uniqueTasks.length !== tasks.length) {
      saveTasks(uniqueTasks)
    }

    return uniqueTasks
  } catch {
    return []
  }
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
}

export function addTask(task: Omit<Task, 'id'>): Task {
  const tasks = getTasks()
  const newTask: Task = {
    ...task,
    id: generateId(),
  }
  tasks.push(newTask)
  saveTasks(tasks)
  return newTask
}

export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const tasks = getTasks()
  const index = tasks.findIndex(t => t.id === id)
  if (index === -1) return null

  tasks[index] = { ...tasks[index], ...updates }
  saveTasks(tasks)
  return tasks[index]
}

export function deleteTask(id: string): boolean {
  const tasks = getTasks()
  const filtered = tasks.filter(t => t.id !== id)
  if (filtered.length === tasks.length) return false

  saveTasks(filtered)
  // 同时删除相关记录
  const logs = getLogs()
  const filteredLogs = logs.filter(l => l.taskId !== id)
  saveLogs(filteredLogs)
  return true
}

export function getTask(id: string): Task | null {
  const tasks = getTasks()
  return tasks.find(t => t.id === id) || null
}

// ========== Logs ==========

export function getLogs(): Log[] {
  const data = localStorage.getItem(STORAGE_KEYS.LOGS)
  if (!data) return []
  try {
    return JSON.parse(data)
  } catch {
    return []
  }
}

export function saveLogs(logs: Log[]): void {
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs))
}

export function addLog(log: Omit<Log, 'id'>): Log {
  const logs = getLogs()
  const newLog: Log = {
    ...log,
    id: generateId(),
  }
  logs.push(newLog)
  saveLogs(logs)
  return newLog
}

export function updateLog(id: string, updates: Partial<Log>): Log | null {
  const logs = getLogs()
  const index = logs.findIndex(l => l.id === id)
  if (index === -1) return null

  logs[index] = { ...logs[index], ...updates }
  saveLogs(logs)
  return logs[index]
}

export function deleteLog(id: string): boolean {
  const logs = getLogs()
  const filtered = logs.filter(l => l.id !== id)
  if (filtered.length === logs.length) return false

  saveLogs(filtered)
  return true
}

// 获取某天某任务的记录
export function getLog(taskId: string, date: string): Log | null {
  const logs = getLogs()
  return logs.find(l => l.taskId === taskId && l.date === date) || null
}

// 获取某天的所有记录
export function getLogsByDate(date: string): Log[] {
  const logs = getLogs()
  return logs.filter(l => l.date === date)
}

// 获取某任务的所有记录
export function getLogsByTask(taskId: string): Log[] {
  const logs = getLogs()
  return logs.filter(l => l.taskId === taskId)
}

// ========== Export / Import ==========

export function exportData(): { tasks: Task[]; logs: Log[] } {
  return {
    tasks: getTasks(),
    logs: getLogs(),
  }
}

export function importData(data: { tasks: Task[]; logs: Log[] }): void {
  saveTasks(data.tasks)
  saveLogs(data.logs)
}

export function exportAsJSON(): string {
  return JSON.stringify(exportData(), null, 2)
}

export function exportAsCSV(): string {
  const tasks = getTasks()
  const logs = getLogs()

  // CSV header
  let csv = 'Date,Task,Type,Value,Text\n'

  // CSV rows
  for (const log of logs) {
    const task = tasks.find(t => t.id === log.taskId)
    if (!task) continue

    csv += `${log.date},"${task.name}",${task.type}`
    if (log.value !== undefined) csv += `,${log.value}`
    if (log.text !== undefined) csv += `,"${log.text}"`
    csv += '\n'
  }

  return csv
}

// ========== Initial Data ==========

export function initReadingLogs(): void {
  const tasks = getTasks()
  const readingTask = tasks.find(t => t.name === '读书')

  if (!readingTask) return

  const logs = getLogs()
  const readingLogs = logs.filter(l => l.taskId === readingTask.id)

  // 如果已有记录，不再添加
  if (readingLogs.length > 0) return

  const today = new Date()

  const newLogs: Omit<Log, 'id'>[] = [
    { taskId: readingTask.id, date: offsetDateStr(today, -11), text: '【漫画】我是你的小狗【1/1】⭐️⭐️⭐️⭐️' },
    { taskId: readingTask.id, date: offsetDateStr(today, -10), text: '【漫画】半小时漫画《红楼梦》【1/2】⭐️⭐️⭐️⭐️⭐️' },
    { taskId: readingTask.id, date: offsetDateStr(today, -9), text: '【漫画】你可以按下暂停键【1/3】⭐️⭐️⭐️⭐️' },
    { taskId: readingTask.id, date: offsetDateStr(today, -8), text: '【漫画】半小时漫画《红楼梦》2【1/4】⭐️⭐️⭐️⭐️⭐️' },
    { taskId: readingTask.id, date: offsetDateStr(today, -7), text: '纳瓦尔宝典【1/5】⭐️⭐️⭐️⭐️' },
    { taskId: readingTask.id, date: offsetDateStr(today, -6), text: '金钱的艺术【1/6】⭐️⭐️⭐️' },
    { taskId: readingTask.id, date: offsetDateStr(today, -5), text: '局外人【1/7】⭐️⭐️' },
    { taskId: readingTask.id, date: offsetDateStr(today, -4), text: '棋王【1/8】⭐️⭐️⭐️' },
    { taskId: readingTask.id, date: offsetDateStr(today, -3), text: '人鼠之间【1/9】⭐️⭐️⭐️⭐️' },
    { taskId: readingTask.id, date: offsetDateStr(today, -2), text: '【漫画】我是你的小狗2【1/10】⭐️⭐️⭐️⭐️' },
    { taskId: readingTask.id, date: offsetDateStr(today, -1), text: '窄门【1/11】⭐️⭐️' },
    { taskId: readingTask.id, date: offsetDateStr(today, 0), text: '认知觉醒【1/12】⭐️⭐️⭐️⭐️⭐️' },
  ]

  for (const log of newLogs) {
    addLog(log)
  }
}

function offsetDateStr(date: Date, days: number): string {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result.toISOString().split('T')[0]
}

export function initDefaultTasks(): void {
  const tasks = getTasks()
  if (tasks.length > 0) return // 已有数据则不初始化

  const defaultTasks: Omit<Task, 'id'>[] = [
    {
      name: '早起',
      type: 'check',
      startDate: '2025-12-03',
      color: '#f59e0b',
      status: 'active',
    },
    {
      name: '读书',
      type: 'check+text',
      startDate: '2025-12-15',
      color: '#3b82f6',
      status: 'active',
    },
    {
      name: '健身',
      type: 'number',
      startDate: '2025-12-25',
      color: '#10b981',
      unit: 'kg',
      initialValue: 54.2,
      targetValue: 48,
      status: 'active',
    },
    {
      name: '泡脚',
      type: 'check',
      startDate: '2025-12-25',
      color: '#8b5cf6',
      status: 'active',
    },
    {
      name: '早睡',
      type: 'check',
      startDate: '2026-01-01',
      color: '#6366f1',
      status: 'active',
    },
    {
      name: '忌冰',
      type: 'violation',
      startDate: '2026-01-01',
      color: '#ef4444',
      status: 'active',
    },
    {
      name: '冥想',
      type: 'check',
      startDate: '2026-01-14',
      color: '#14b8a6',
      status: 'active',
    },
  ]

  for (const task of defaultTasks) {
    addTask(task)
  }
}
