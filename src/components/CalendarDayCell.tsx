import { useState, useRef } from 'react'
import { format } from 'date-fns'
import type { Task, Log } from '../types'

interface CalendarDayCellProps {
  date: Date
  logs: Log[]
  tasks: Task[]
  isToday: boolean
  isSelected: boolean
  isCurrentMonth: boolean
  onClick: () => void
}

interface DayStatus {
  totalTasks: number
  completedCount: number
  hasViolation: boolean
  isAllDone: boolean
  taskColors: string[]
  taskNames: string[]
  violationTaskNames: string[]
}

export function CalendarDayCell({
  date,
  logs,
  tasks,
  isToday,
  isSelected,
  isCurrentMonth,
  onClick,
}: CalendarDayCellProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const cellRef = useRef<HTMLButtonElement>(null)

  const currentDateStr = format(date, 'yyyy-MM-dd')

  const getDayStatus = (): DayStatus | null => {
    const validTasks = tasks.filter(task => {
      const taskStartStr = format(new Date(task.startDate), 'yyyy-MM-dd')
      const taskEndStr = task.endDate ? format(new Date(task.endDate), 'yyyy-MM-dd') : null
      if (currentDateStr < taskStartStr) return false
      if (taskEndStr && currentDateStr > taskEndStr) return false
      return true
    })

    const regularTasks = validTasks.filter(t => t.type !== 'violation')
    const violationTasks = validTasks.filter(t => t.type === 'violation')

    const completedRegularTasks = regularTasks.filter(task =>
      logs.some(l => l.taskId === task.id)
    )

    const completedViolationTasks = violationTasks.filter(task =>
      logs.some(l => l.taskId === task.id)
    )

    if (completedRegularTasks.length === 0 && completedViolationTasks.length === 0) {
      return null
    }

    const taskColors = [
      ...completedRegularTasks.map(t => t.color),
      ...completedViolationTasks.map(() => '#ef4444')
    ]

    return {
      totalTasks: regularTasks.length,
      completedCount: completedRegularTasks.length,
      hasViolation: completedViolationTasks.length > 0,
      isAllDone: regularTasks.length > 0 && completedRegularTasks.length === regularTasks.length,
      taskColors,
      taskNames: completedRegularTasks.map(t => t.name),
      violationTaskNames: completedViolationTasks.map(t => t.name)
    }
  }

  const status = getDayStatus()

  const handleMouseEnter = () => setShowTooltip(true)
  const handleMouseLeave = () => setShowTooltip(false)

  const dayNum = format(date, 'd')

  return (
    <div className="relative aspect-square p-1">
      <button
        ref={cellRef}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          w-full h-full relative rounded-xl transition-all duration-200
          ${status?.isAllDone
            ? 'bg-gradient-to-br from-emerald-100 to-teal-100 border-2 border-emerald-400'
            : isSelected
              ? 'bg-blue-50'
              : 'bg-gray-50 hover:bg-gray-100'
          }
          ${!isCurrentMonth ? 'opacity-40' : 'opacity-100'}
          ${status ? 'cursor-pointer' : 'cursor-default'}
        `}
      >
        {/* 日期数字 */}
        <span className={`
          absolute top-2 left-2 text-base font-semibold
          ${isToday ? 'text-red-600' : 'text-gray-700'}
        `}>
          {dayNum}
        </span>

        {/* 违规红点 */}
        {status?.hasViolation && (
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-sm" />
          </div>
        )}

        {/* 任务指示器 - 圆点阵列 */}
        {status && status.taskColors.length > 0 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <div className="flex flex-wrap justify-center gap-1 w-[85%]">
              {status.taskColors.map((color, idx) => (
                <div
                  key={idx}
                  className="w-2 h-2 rounded-full shadow-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && status && cellRef.current && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none">
          <div className="bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-xl py-2 px-3 shadow-xl min-w-max">
            <div className="space-y-1">
              {status.taskNames.map(name => (
                <div key={name} className="flex items-center gap-2">
                  <span className="text-emerald-400 text-lg leading-none">✓</span>
                  <span className="font-medium">{name}</span>
                </div>
              ))}
              {status.violationTaskNames.map(name => (
                <div key={name} className="flex items-center gap-2">
                  <span className="text-red-400 text-lg leading-none">✗</span>
                  <span className="font-medium">{name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/95 mx-auto" />
        </div>
      )}
    </div>
  )
}
