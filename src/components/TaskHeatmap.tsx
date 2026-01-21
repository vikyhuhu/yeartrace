import { useMemo } from 'react'
import { format, subDays, startOfWeek, addDays } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { Log } from '../types'

interface TaskHeatmapProps {
    logs: Log[]
    color?: string
    days?: number
    taskName?: string
}

/**
 * 任务年度日历视图组件
 * 显示近一年的打卡记录，有记录显示颜色，无记录不显示
 */
export function TaskHeatmap({
    logs,
    color = '#10b981',
    days = 365,
    taskName = '任务'
}: TaskHeatmapProps) {
    const calendarData = useMemo(() => {
        const today = new Date()
        const logDates = new Set(logs.map(l => l.date))

        // 找到起始周的周一（使用周一作为一周开始）
        const startDate = startOfWeek(subDays(today, days), { weekStartsOn: 1 })
        const result: Array<{ date: string; hasLog: boolean; weekIndex: number; dayIndex: number }> = []

        let currentDate = startDate
        let weekIndex = 0

        while (currentDate <= today) {
            const dateStr = format(currentDate, 'yyyy-MM-dd')
            const dayOfWeek = (currentDate.getDay() + 6) % 7 // 转换为周一=0

            if (dayOfWeek === 0 && result.length > 0) {
                weekIndex++
            }

            result.push({
                date: dateStr,
                hasLog: logDates.has(dateStr),
                weekIndex,
                dayIndex: dayOfWeek
            })

            currentDate = addDays(currentDate, 1)
        }

        return result
    }, [logs, days])

    // 按周分组
    const weeks = useMemo(() => {
        const weekMap = new Map<number, typeof calendarData>()
        calendarData.forEach(day => {
            if (!weekMap.has(day.weekIndex)) {
                weekMap.set(day.weekIndex, [])
            }
            weekMap.get(day.weekIndex)!.push(day)
        })
        return Array.from(weekMap.values())
    }, [calendarData])

    // 统计
    const stats = useMemo(() => {
        const total = calendarData.filter(d => d.hasLog).length
        const rate = ((total / calendarData.length) * 100).toFixed(0)
        return { total, rate }
    }, [calendarData])

    // 周一到周日（只显示一、三、五）
    const dayLabels = ['一', '三', '五']

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <span>📅</span>
                    <span>年度打卡记录</span>
                </h4>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    完成 <span className="font-bold" style={{ color }}>{stats.total}</span> 天
                    （{stats.rate}%）
                </div>
            </div>

            <div className="flex gap-[2px] overflow-x-auto pb-2">
                {/* 星期标签 */}
                <div className="flex flex-col gap-[2px] text-xs text-gray-400 mr-1 shrink-0">
                    {[0, 1, 2, 3, 4, 5, 6].map((idx) => (
                        <div key={idx} className="w-3 h-3 flex items-center justify-center text-[10px]">
                            {idx === 0 ? '一' : idx === 2 ? '三' : idx === 4 ? '五' : ''}
                        </div>
                    ))}
                </div>

                {/* 日历格子 */}
                {weeks.map((week, weekIdx) => (
                    <div key={weekIdx} className="flex flex-col gap-[2px]">
                        {[0, 1, 2, 3, 4, 5, 6].map(dayIdx => {
                            const day = week.find(d => d.dayIndex === dayIdx)
                            if (!day) {
                                return <div key={dayIdx} className="w-3 h-3" />
                            }
                            return (
                                <div
                                    key={dayIdx}
                                    className="w-3 h-3 rounded-sm transition-colors cursor-pointer hover:ring-2 hover:ring-offset-1"
                                    style={{
                                        backgroundColor: day.hasLog ? color : 'rgba(0,0,0,0.06)',
                                    }}
                                    title={`${format(new Date(day.date), 'MM月dd日 EEEE', { locale: zhCN })} - ${day.hasLog ? '已完成' : '未记录'}`}
                                />
                            )
                        })}
                    </div>
                ))}
            </div>

            {/* 简化后的图例 - 只显示有/无 */}
            <div className="flex items-center justify-end gap-2 mt-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(0,0,0,0.06)' }} />
                    <span>未完成</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                    <span>已完成</span>
                </div>
            </div>
        </div>
    )
}
