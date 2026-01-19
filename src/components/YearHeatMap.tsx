import { useState, useMemo } from 'react'
import { format, startOfYear } from 'date-fns'
import { generateHeatMapCells } from '../utils/yearStats'
import type { Task, Log, HeatMapCell } from '../types'

interface YearHeatMapProps {
  year: number
  logs: Log[]
  tasks: Task[]
  filterTaskId?: string | null
  onDateClick?: (date: string) => void
  selectedDate?: string
}

export function YearHeatMap({
  year,
  logs,
  tasks,
  filterTaskId,
  onDateClick,
  selectedDate,
}: YearHeatMapProps) {
  const [hoveredCell, setHoveredCell] = useState<HeatMapCell | null>(null)

  const cells = useMemo<HeatMapCell[]>(() => {
    return generateHeatMapCells(year, logs, tasks, filterTaskId)
  }, [year, logs, tasks, filterTaskId])

  // 按周分组
  const weeks = useMemo(() => {
    const yearStart = startOfYear(new Date(year, 0, 1))
    const firstDayOfWeek = yearStart.getDay()
    const weeks: HeatMapCell[][] = []
    let currentWeek: HeatMapCell[] = []

    // 填充第一周前的空白
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({
        date: '',
        logCount: 0,
        taskIds: [],
        hasViolation: false,
        isPerfectDay: false,
        color: 'transparent',
      })
    }

    // 填充日期
    for (const cell of cells) {
      currentWeek.push(cell)
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    }

    // 最后一周
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({
          date: '',
          logCount: 0,
          taskIds: [],
          hasViolation: false,
          isPerfectDay: false,
          color: 'transparent',
        })
      }
      weeks.push(currentWeek)
    }

    return weeks
  }, [cells])

  const weekDays = ['一', '二', '三', '四', '五', '六', '日']

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-[20px] p-6 border border-white/50 dark:border-gray-700 card-modern-static">
      <h3 className="font-bold text-gray-800 dark:text-white mb-4">年度时间轴</h3>

      {/* 星期标题 */}
      <div className="flex gap-1 mb-2 ml-8">
        {weekDays.map(day => (
          <div key={day} className="w-[10px] sm:w-3 text-[10px] text-gray-500 text-center leading-none">
            {day}
          </div>
        ))}
      </div>

      {/* 热力图网格 */}
      <div
        className="relative overflow-x-auto"
        onMouseLeave={() => setHoveredCell(null)}
      >
        <div className="inline-block min-w-full">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex gap-1 mb-1">
              {/* 周数标签 */}
              <div className="w-8 text-[10px] text-gray-400 flex items-center shrink-0">
                {weekIndex % 4 === 0 ? weekIndex + 1 : ''}
              </div>

              {/* 一周7天 */}
              <div className="flex gap-1 flex-1">
                {week.map((cell, dayIndex) => {
                  if (!cell.date) {
                    return <div key={`${weekIndex}-${dayIndex}`} className="w-[10px] sm:w-3 h-[10px] sm:h-3 shrink-0" />
                  }

                  const isSelected = cell.date === selectedDate
                  const isHovered = hoveredCell?.date === cell.date

                  return (
                    <div key={cell.date} className="relative w-[10px] sm:w-3 h-[10px] sm:h-3 shrink-0">
                      <button
                        onClick={() => onDateClick?.(cell.date)}
                        onMouseEnter={() => setHoveredCell(cell)}
                        className={`
                          w-full h-full rounded-sm transition-all hover:scale-125
                          ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                        `}
                        style={{ backgroundColor: cell.color }}
                      >
                        {/* 违规日红点 */}
                        {cell.hasViolation && (
                          <div className="absolute top-0 right-0 w-1 h-1 rounded-full bg-red-500" />
                        )}

                        {/* 全勤日金边 */}
                        {cell.isPerfectDay && (
                          <div className="absolute inset-0 rounded-sm border border-yellow-400 pointer-events-none" />
                        )}
                      </button>

                      {/* 悬停详情 */}
                      {isHovered && (
                        <div className="fixed z-50 bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
                          <div className="bg-gray-900/95 text-white text-xs rounded-lg py-2 px-3 shadow-xl whitespace-nowrap">
                            <div className="font-semibold">{format(new Date(cell.date), 'MM月dd日 EEEE')}</div>
                            <div className="mt-1">{cell.logCount} 个完成任务</div>
                            {cell.taskIds.length > 0 && (
                              <div className="mt-1 text-gray-300">
                                {cell.taskIds.slice(0, 3).map(id => {
                                  const task = tasks.find(t => t.id === id)
                                  return task?.name || ''
                                }).join(', ')}
                                {cell.taskIds.length > 3 && '...'}
                              </div>
                            )}
                            {cell.isPerfectDay && (
                              <div className="mt-1 text-yellow-400">✨ 全勤达成</div>
                            )}
                            {cell.hasViolation && (
                              <div className="mt-1 text-red-400">⚠️ 有违规</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 图例 */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
        <span>色块深浅代表完成任务数</span>
        <div className="flex gap-1 items-center">
          <span className="text-xs mr-1">少</span>
          <div className="w-3 h-3 rounded bg-gray-100" title="0个" />
          <div className="w-3 h-3 rounded bg-blue-200" title="1-2个" />
          <div className="w-3 h-3 rounded bg-blue-400" title="3-4个" />
          <div className="w-3 h-3 rounded bg-blue-600" title="5+个" />
          <span className="text-xs ml-1">多</span>
        </div>
      </div>
    </div>
  )
}
