import { useState, useRef, useEffect } from 'react'
import type { Task, Log } from '../types'
import {
  calculatePersistedDays,
  calculateWeeklyCompletion,
  getLastRecordTime,
  formatRelativeTime,
  getLatestNumberValue,
} from '../utils/taskStats'

interface TaskManageCardProps {
  task: Task
  logs: Log[]
  onEdit: (task: Task) => void
  onPause: (task: Task) => void
  onDelete: (task: Task) => void
  onQuickRecord: (task: Task) => void
  onSelect?: (task: Task) => void
  isSelected?: boolean
}

export function TaskManageCard({
  task,
  logs,
  onEdit,
  onPause,
  onDelete,
  onQuickRecord,
  onSelect,
  isSelected = false,
}: TaskManageCardProps) {
  const [longPressTriggered, setLongPressTriggered] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const persistedDays = calculatePersistedDays(task)
  const weeklyCompletion = calculateWeeklyCompletion(task.id, logs)
  const lastRecordTime = getLastRecordTime(task.id, logs)
  const latestValue = task.type === 'number' ? getLatestNumberValue(task.id, logs) : undefined

  // 长按处理
  const handleMouseDown = () => {
    setLongPressTriggered(false)
    timerRef.current = setTimeout(() => {
      setLongPressTriggered(true)
      onSelect?.(task)
    }, 500)
  }

  const handleMouseUp = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const handleClick = () => {
    if (!longPressTriggered && !isSelected) {
      onQuickRecord(task)
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return (
    <div
      className={`group relative bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border-2 transition-all ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-300'
          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
      }`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* 选中标记 */}
      {isSelected && (
        <div className="absolute top-3 right-3 z-10">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}

      {/* 任务头部 */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ backgroundColor: `${task.color}20` }}
        >
          📋
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white text-base truncate">
            {task.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {task.type === 'check' && '完成即记录'}
              {task.type === 'check+text' && '需输入文本'}
              {task.type === 'number' && '数值记录'}
              {task.type === 'violation' && '触犯记录'}
            </span>
            {task.status === 'paused' && (
              <span className="px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full">
                已暂停
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="space-y-2 mb-3">
        {/* 已坚持天数 */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">已坚持</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {persistedDays} 天
          </span>
        </div>

        {/* 本周完成情况 */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">本周</span>
          <div className="flex gap-1">
            {weeklyCompletion.map((completed, index) => (
              <div
                key={index}
                className={`w-2.5 h-2.5 rounded-full ${
                  completed
                    ? 'bg-blue-500'
                    : 'bg-gray-200 dark:bg-gray-600'
                }`}
                title={
                  index === 6
                    ? '今天'
                    : index === 5
                    ? '昨天'
                    : `${6 - index}天前`
                }
              />
            ))}
          </div>
        </div>

        {/* 最近记录时间 */}
        {lastRecordTime && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">最近记录</span>
            <span className="text-gray-700 dark:text-gray-300">
              {formatRelativeTime(lastRecordTime)}
            </span>
          </div>
        )}

        {/* 数值类任务显示最新数值 */}
        {latestValue !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">当前</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {latestValue} {task.unit}
            </span>
          </div>
        )}
      </div>

      {/* 快捷操作按钮 - 移动端始终显示，桌面端悬停显示 */}
      <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onQuickRecord(task)
          }}
          className="flex-1 py-2 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          记录
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPause(task)
          }}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            task.status === 'paused'
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-yellow-500 hover:bg-yellow-600 text-white'
          }`}
        >
          {task.status === 'paused' ? '恢复' : '暂停'}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(task)
          }}
          className="px-3 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
        >
          编辑
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(task)
          }}
          className="px-3 py-2 text-sm font-medium bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-colors"
        >
          删除
        </button>
      </div>

      {/* 触摸提示 */}
      <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="text-[10px] text-gray-400 dark:text-gray-500">
          {onSelect ? '长按选择' : '点击卡片或按钮'}
        </div>
      </div>
    </div>
  )
}
