import { useState, useMemo } from 'react'

interface DateTimelineProps {
  selectedDate: string
  onDateChange: (date: string) => void
  history: Array<{ date: string; hasData: boolean }>
}

export function DateTimeline({ selectedDate, onDateChange, history }: DateTimelineProps) {
  // 生成最近30天的日期列表
  const dates = useMemo(() => {
    const today = new Date()
    const result: Array<{ date: string; label: string; isToday: boolean; isPast: boolean }> = []

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const isToday = i === 0
      const isPast = i > 0

      let label = ''
      if (isToday) {
        label = '今天'
      } else if (i === 1) {
        label = '昨天'
      } else {
        label = date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
      }

      result.push({ date: dateStr, label, isToday, isPast })
    }

    return result
  }, [])

  // 检查日期是否有数据
  const hasDataMap = useMemo(() => {
    const map = new Map<string, boolean>()
    history.forEach(h => map.set(h.date, h.hasData))
    return map
  }, [history])

  const handleDateClick = (date: string) => {
    onDateChange(date)
  }

  return (
    <div className="bg-slate-800/50 border-b border-slate-700 py-3">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
          {/* 左侧渐变指示器 */}
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-slate-800 to-transparent" />

          {dates.map((item) => {
            const isSelected = selectedDate === item.date
            const hasData = hasDataMap.get(item.date)

            return (
              <button
                key={item.date}
                onClick={() => handleDateClick(item.date)}
                className={`
                  flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition
                  flex flex-col items-center justify-center min-w-[70px]
                  ${isSelected
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                    : 'bg-slate-700/50 text-gray-400 hover:bg-slate-700'
                  }
                `}
              >
                <span>{item.label}</span>
                {/* 数据指示点 */}
                {hasData && !isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1" />
                )}
              </button>
            )
          })}

          {/* 右侧渐变指示器 */}
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-l from-slate-800 to-transparent" />
        </div>

        {/* 选中日期的完整日期显示 */}
        <div className="text-center mt-2">
          <span className="text-sm text-gray-400">
            {new Date(selectedDate).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </span>
        </div>
      </div>
    </div>
  )
}
