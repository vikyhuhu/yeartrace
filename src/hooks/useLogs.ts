import { useState, useEffect } from 'react'
import { getLogs, addLog, updateLog, deleteLog, initReadingLogs } from '../lib/storage'
import type { Log } from '../types'

export function useLogs() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 初始化读书记录
    initReadingLogs()
    loadLogs()
  }, [])

  function loadLogs() {
    const data = getLogs()
    setLogs(data)
    setLoading(false)
  }

  function createLog(log: Omit<Log, 'id'>) {
    const newLog = addLog(log)
    setLogs(prev => [...prev, newLog])
    return newLog
  }

  function editLog(id: string, updates: Partial<Log>) {
    const updated = updateLog(id, updates)
    if (updated) {
      setLogs(prev => prev.map(l => (l.id === id ? updated : l)))
    }
    return updated
  }

  function removeLog(id: string) {
    const success = deleteLog(id)
    if (success) {
      setLogs(prev => prev.filter(l => l.id !== id))
    }
    return success
  }

  function getLogsForDate(date: string): Log[] {
    return logs.filter(l => l.date === date)
  }

  function getLogsForTask(taskId: string): Log[] {
    return logs.filter(l => l.taskId === taskId)
  }

  function getLogForTaskAndDate(taskId: string, date: string): Log | undefined {
    return logs.find(l => l.taskId === taskId && l.date === date)
  }

  function hasLogForTaskAndDate(taskId: string, date: string): boolean {
    return logs.some(l => l.taskId === taskId && l.date === date)
  }

  return {
    logs,
    loading,
    createLog,
    editLog,
    removeLog,
    getLogsForDate,
    getLogsForTask,
    getLogForTaskAndDate,
    hasLogForTaskAndDate,
    reload: loadLogs,
  }
}
