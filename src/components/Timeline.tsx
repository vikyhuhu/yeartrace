import { useMemo, useRef, useEffect } from 'react'
import { generateTimelineData, getDateRange } from '../utils/helpers'
import type { Task, Log } from '../types'

interface TimelineProps {
  tasks: Task[]
  logs: Log[]
  days?: number
  endDate?: string
  onDateClick?: (date: string) => void
  selectedDate?: string
  // 新增：触发呼吸动画的日期
  breatheDate?: string
}

export function Timeline({ tasks, logs, days = 30, endDate, onDateClick, selectedDate, breatheDate }: TimelineProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { start, end } = useMemo(() => getDateRange(days, endDate), [days, endDate])

  const timelineData = useMemo(() => {
    return generateTimelineData(tasks, logs, start, end)
  }, [tasks, logs, start, end])

  const allDates = useMemo(() => {
    const dates: string[] = []
    const current = new Date(start)
    const end_ = new Date(end)

    while (current <= end_) {
      dates.push(current.toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }

    return dates
  }, [start, end])

  const getDotsForDate = (date: string) => {
    return timelineData.filter(dot => dot.date === date)
  }

  // 自动滚动到最右边（显示今天的日期）
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth
    }
  }, [allDates.length])

  // 当选中日期变化时，也滚动到对应位置
  useEffect(() => {
    if (scrollContainerRef.current && selectedDate) {
      const container = scrollContainerRef.current
      const dateButtons = container.querySelectorAll('button[data-date]')
      const selectedButton = Array.from(dateButtons).find(
        btn => btn.getAttribute('data-date') === selectedDate
      ) as HTMLButtonElement

      if (selectedButton) {
        selectedButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }, [selectedDate])

  return (
    <div ref={scrollContainerRef} className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 min-w-max px-1">
        {allDates.map(date => {
          const dots = getDotsForDate(date)
          const isSelected = date === selectedDate
          const isToday = date === new Date().toISOString().split('T')[0]
          const dayNum = new Date(date).getDate()

          return (
            <button
              key={date}
              data-date={date}
              onClick={() => onDateClick?.(date)}
              className={`
                relative flex flex-col items-center gap-1.5 px-3 py-2 rounded-full transition-all duration-200
                ${isSelected
                  ? 'bg-blue-500 shadow-md shadow-blue-500/30'
                  : 'hover:bg-gray-100'
                }
              `}
            >
              {/* 日期数字 */}
              <span className={`text-sm font-semibold transition-colors ${
                isSelected ? 'text-white' : isToday ? 'text-blue-500' : 'text-gray-500'
              }`}>
                {dayNum}
              </span>

              {/* 状态指示点 */}
              <div className="flex gap-0.5 items-center h-2">
                {dots.length === 0 ? (
                  <div className={`w-1 h-1 rounded-full transition-colors ${
                    isSelected ? 'bg-white/60' : 'bg-gray-200'
                  }`} />
                ) : (
                  dots.slice(0, 3).map((dot, idx) => (
                    <div
                      key={`${dot.date}-${dot.taskId}-${idx}`}
                      className={`w-1 h-1 rounded-full transition-colors ${
                        date === breatheDate && idx === dots.length - 1 ? 'animate-breathe' : ''
                      }`}
                      style={{ backgroundColor: isSelected ? 'white' : dot.color }}
                    />
                  ))
                )}
              </div>

              {/* 今天指示器 - 优先级低于选中态 */}
              {isToday && !isSelected && (
                <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-blue-500" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
