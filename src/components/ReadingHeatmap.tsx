import { useMemo } from 'react'

interface ReadingHeatmapProps {
  calendarData: Record<string, { count: number; pages: number }>
  year: number
}

interface DayData {
  date: string
  count: number
  pages: number
  level: number // 0-5 for coloring
}

export function ReadingHeatmap({ calendarData, year }: ReadingHeatmapProps) {
  // 生成一年的日期数据
  const weeks = useMemo(() => {
    const weeksData: Array<Array<DayData>> = []

    // 找到该年第一天是星期几（0=周日，1=周一...）
    const firstDayOfYear = new Date(year, 0, 1)
    let startDay = firstDayOfYear.getDay()
    // 调整为周一为一周的开始
    startDay = startDay === 0 ? 6 : startDay - 1

    // 初始化第一周（空白占位）
    let currentWeek: DayData[] = []
    for (let i = 0; i < startDay; i++) {
      currentWeek.push({ date: '', count: 0, pages: 0, level: 0 })
    }

    // 填充一年的日期
    const currentDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31)

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const data = calendarData[dateStr] || { count: 0, pages: 0 }

      // 计算颜色等级 (0-5)
      let level = 0
      if (data.count > 0) {
        if (data.pages >= 50) level = 5
        else if (data.pages >= 30) level = 4
        else if (data.pages >= 10) level = 3
        else if (data.count >= 2) level = 2
        else level = 1
      }

      currentWeek.push({
        date: dateStr,
        count: data.count,
        pages: data.pages,
        level,
      })

      // 如果一周满了，开始新的一周
      if (currentWeek.length === 7) {
        weeksData.push(currentWeek)
        currentWeek = []
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    // 添加最后一周
    if (currentWeek.length > 0) {
      weeksData.push(currentWeek)
    }

    return weeksData
  }, [calendarData, year])

  // 根据等级获取颜色样式
  const getColorClass = (level: number) => {
    const colors = [
      'bg-gray-100 dark:bg-gray-700', // 0: 无数据
      'bg-emerald-200 dark:bg-emerald-900/30', // 1: 少量
      'bg-emerald-300 dark:bg-emerald-800/40', // 2: 中等
      'bg-emerald-400 dark:bg-emerald-700/50', // 3: 较多
      'bg-emerald-500 dark:bg-emerald-600/60', // 4: 很多
      'bg-emerald-600 dark:bg-emerald-500/70', // 5: 极多
    ]
    return colors[level] || colors[0]
  }

  // 计算总阅读天数
  const totalDays = Object.keys(calendarData).length

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">阅读热力图</h3>
        <div className="flex items-center gap-2">
          {/* 总天数徽章 */}
          <div className="flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-full">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {totalDays} 天
            </span>
          </div>
          {/* 图例 */}
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <span>少</span>
            {[0, 1, 2, 3, 4, 5].map(level => (
              <div
                key={level}
                className={`w-3 h-3 rounded-sm ${getColorClass(level)}`}
              />
            ))}
            <span>多</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-hide">
        <div className="min-w-max">
          {/* 热力图 */}
          <div className="flex gap-1">
            {/* 周数据 */}
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => {
                  if (day.date === '') {
                    return <div key={dayIndex} className="w-3 h-3" />
                  }

                  const colorClass = getColorClass(day.level)
                  const hasData = day.count > 0

                  return (
                    <div
                      key={day.date}
                      className={`w-3 h-3 rounded-sm transition-all duration-200 ${colorClass} ${
                        hasData
                          ? 'cursor-pointer hover:scale-125 hover:shadow-md hover:ring-2 hover:ring-emerald-400'
                          : ''
                      }`}
                      title={`${day.date}: ${day.count}次记录${day.pages > 0 ? `，${day.pages}页` : ''}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
