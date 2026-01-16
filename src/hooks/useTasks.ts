import { useState, useEffect } from 'react'
import { getTasks, addTask, updateTask, deleteTask, initDefaultTasks } from '../lib/storage'
import type { Task } from '../types'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 初始化默认任务
    initDefaultTasks()
    loadTasks()
  }, [])

  function loadTasks() {
    const data = getTasks()
    setTasks(data)
    setLoading(false)
  }

  function createTask(task: Omit<Task, 'id'>) {
    const newTask = addTask(task)
    setTasks(prev => [...prev, newTask])
    return newTask
  }

  function editTask(id: string, updates: Partial<Task>) {
    const updated = updateTask(id, updates)
    if (updated) {
      setTasks(prev => prev.map(t => (t.id === id ? updated : t)))
    }
    return updated
  }

  function removeTask(id: string) {
    const success = deleteTask(id)
    if (success) {
      setTasks(prev => prev.filter(t => t.id !== id))
    }
    return success
  }

  function getTask(id: string): Task | undefined {
    return tasks.find(t => t.id === id)
  }

  function getActiveTasks(date: string): Task[] {
    return tasks.filter(t => {
      const taskStart = new Date(t.startDate)
      const taskEnd = t.endDate ? new Date(t.endDate) : null
      const checkDate = new Date(date)

      if (checkDate < taskStart) return false
      if (taskEnd && checkDate > taskEnd) return false
      return true
    })
  }

  return {
    tasks,
    loading,
    createTask,
    editTask,
    removeTask,
    getTask,
    getActiveTasks,
    reload: loadTasks,
  }
}
