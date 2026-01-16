import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useTasks } from '../hooks/useTasks'
import { useLogs } from '../hooks/useLogs'
import { CalendarDayCell } from '../components/CalendarDayCell'
import { DateDetailDrawer } from '../components/DateDetailDrawer'

export function CalendarPage() {
  const navigate = useNavigate()
  const { tasks } = useTasks()
  const { getLogsForDate } = useLogs()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    setCurrentDate(new Date())
  }, [])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const weeks = useMemo(() => {
    const weeks: Date[][] = []
    let currentWeek: Date[] = []

    const firstDayOfWeek = monthStart.getDay()
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(new Date(0))
    }

    for (const day of calendarDays) {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(new Date(0))
      }
      weeks.push(currentWeek)
    }

    return weeks
  }, [monthStart, monthEnd, calendarDays])

  const getDayLogs = (date: Date) => {
    if (date.getTime() === 0) return []
    const dateStr = format(date, 'yyyy-MM-dd')
    return getLogsForDate(dateStr)
  }

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleGoToday = () => {
    setCurrentDate(new Date())
  }

  const handleDateClick = (date: Date) => {
    if (date.getTime() === 0) return
    const dateStr = format(date, 'yyyy-MM-dd')
    setSelectedDate(dateStr)
  }

  const handleCloseDrawer = () => {
    setSelectedDate(null)
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* 头部导航 */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900">日历</h1>
              <div className="w-5" />
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6">
          {/* 月份选择器 */}
          <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {format(currentDate, 'yyyy年 MM月', { locale: zhCN })}
                </div>
              </div>

              <button
                onClick={handleNextMonth}
                disabled={addMonths(currentDate, 1) > new Date()}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {!isSameMonth(currentDate, new Date()) && (
              <button
                onClick={handleGoToday}
                className="mt-4 w-full py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
              >
                回到本月
              </button>
            )}
          </div>

          {/* 日历网格 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            {/* 星期标题 */}
            <div className="grid grid-cols-7 bg-gray-50">
              {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                <div key={day} className="text-center py-3">
                  <span className="text-xs font-bold text-gray-500">{day}</span>
                </div>
              ))}
            </div>

            {/* 日期网格 */}
            <div className="divide-y divide-gray-50">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7">
                  {week.map((date, dayIndex) => {
                    if (date.getTime() === 0) {
                      return (
                        <div key={`empty-${dayIndex}`} className="aspect-square bg-gray-50/50" />
                      )
                    }

                    const dateStr = format(date, 'yyyy-MM-dd')
                    const isTodayView = isSameDay(date, new Date())
                    const isSelected = selectedDate === dateStr
                    const isCurrentMonth = isSameMonth(date, currentDate)
                    const dayLogs = getDayLogs(date)

                    return (
                      <CalendarDayCell
                        key={dateStr}
                        date={date}
                        logs={dayLogs}
                        tasks={tasks}
                        isToday={isTodayView}
                        isSelected={isSelected}
                        isCurrentMonth={isCurrentMonth}
                        onClick={() => handleDateClick(date)}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* 图例说明 */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="text-sm font-semibold text-gray-700 mb-3">图例</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-start pl-2">
                  <span className="text-base font-semibold text-red-600">14</span>
                </div>
                <span className="text-sm text-gray-600">今天</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 border-2 border-emerald-400" />
                <span className="text-sm text-gray-600">全勤</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-50 relative">
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500" />
                </div>
                <span className="text-sm text-gray-600">有违规</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex flex-wrap items-center justify-center gap-1 p-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400 shadow-sm" />
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm" />
                  <div className="w-2 h-2 rounded-full bg-purple-400 shadow-sm" />
                </div>
                <span className="text-sm text-gray-600">已完成</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 日期详情抽屉 */}
      {selectedDate && (
        <DateDetailDrawer
          isOpen={!!selectedDate}
          date={selectedDate}
          logs={getLogsForDate(selectedDate)}
          tasks={tasks}
          onClose={handleCloseDrawer}
        />
      )}
    </>
  )
}
