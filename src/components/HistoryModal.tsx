import { useState, useMemo } from 'react'
import type { YTTask, YTDayRecord } from '../types/yeartrace'
import { calculateStatistics, getCalendarHeatmap, calculateDetailedStatistics } from '../utils/yearTraceStats'

interface HistoryModalProps {
  isOpen: boolean
  tasks: YTTask[]
  history: YTDayRecord[]
  onClose: () => void
}

type TabType = 'overview' | 'trends' | 'tasks' | 'calendar'

export function HistoryModal({ isOpen, tasks, history, onClose }: HistoryModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // 计算统计数据
  const stats = useMemo(() => calculateStatistics(history, tasks), [history, tasks])

  // 计算详细统计数据（V2）
  const detailedStats = useMemo(() => calculateDetailedStatistics(history, tasks), [history, tasks])

  // 日历热力图数据
  const heatmapData = useMemo(() => getCalendarHeatmap(history, tasks), [history, tasks])

  if (!isOpen) return null

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  // 热力图颜色
  const getHeatmapColor = (level: number) => {
    switch (level) {
      case 0:
        return 'bg-slate-700/30'
      case 1:
        return 'bg-cyan-900/50'
      case 2:
        return 'bg-cyan-700/70'
      case 3:
        return 'bg-cyan-500/80'
      case 4:
        return 'bg-cyan-400'
      default:
        return 'bg-slate-700/30'
    }
  }

  // 概览标签页
  const OverviewTab = () => (
    <div className="space-y-4">
      {/* 核心指标卡片 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">总天数</p>
          <p className="text-xl font-bold text-white">{stats.totalDays}</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">最长连击</p>
          <p className="text-xl font-bold text-orange-400">{stats.longestStreak} 天</p>
        </div>
      </div>

      {/* 最近趋势 */}
      <div className="bg-slate-700/50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-white mb-3">最近趋势</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">最近 7 天完成</span>
            <span className="text-sm font-medium text-cyan-400">{stats.recentWeekExp} 次</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">最近 30 天完成</span>
            <span className="text-sm font-medium text-cyan-400">{stats.recentMonthExp} 次</span>
          </div>
        </div>
      </div>

      {/* 最好的一天 */}
      {stats.bestDay && (
        <div className="bg-gradient-to-r from-cyan-900/30 to-cyan-800/30 rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-2">最好的一天</h3>
          <p className="text-xs text-gray-400 mb-1">{formatDate(stats.bestDay.date)}</p>
          <p className="text-lg font-bold text-cyan-400">
            完成了 {stats.bestDay.completedCount} / {stats.bestDay.totalCount} 个任务
          </p>
        </div>
      )}
    </div>
  )

  // 任务统计标签页
  const TasksTab = () => (
    <div className="space-y-3">
      {stats.taskStats.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>暂无任务数据</p>
        </div>
      ) : (
        stats.taskStats.map(stat => (
          <div key={stat.taskId} className="bg-slate-700/50 rounded-lg p-3">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-white">{stat.taskName}</h3>
              <span className="text-xs px-2 py-1 rounded bg-cyan-900/50 text-cyan-400">
                {stat.completedDays} 天
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-gray-500">当前连击</p>
                <p className="text-orange-400 font-medium">{stat.currentStreak}</p>
              </div>
              <div>
                <p className="text-gray-500">最佳连击</p>
                <p className="text-white font-medium">{stat.bestStreak}</p>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">完成率</span>
                <span className="text-gray-300">{stat.completionRate.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 bg-slate-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all"
                  style={{ width: `${stat.completionRate}%` }}
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )

  // 趋势统计标签页（V2 新增）
  const TrendsTab = () => (
    <div className="space-y-4">
      {/* 周统计 */}
      <div className="bg-slate-700/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white">本周 vs 上周</h3>
          <span className={`text-xs px-2 py-1 rounded ${
            detailedStats.weekly.trend === 'up' ? 'bg-green-900/50 text-green-400' :
            detailedStats.weekly.trend === 'down' ? 'bg-red-900/50 text-red-400' :
            'bg-slate-600/50 text-gray-400'
          }`}>
            {detailedStats.weekly.trend === 'up' ? '↑ 上升' :
             detailedStats.weekly.trend === 'down' ? '↓ 下降' : '→ 持平'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400">本周完成</p>
            <p className="text-lg font-bold text-cyan-400">{detailedStats.weekly.thisWeek} 次</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">上周完成</p>
            <p className="text-lg font-bold text-gray-300">{detailedStats.weekly.lastWeek} 次</p>
          </div>
        </div>
      </div>

      {/* 月统计 */}
      <div className="bg-slate-700/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white">本月 vs 上月</h3>
          <span className={`text-xs px-2 py-1 rounded ${
            detailedStats.monthly.trend === '上升' ? 'bg-green-900/50 text-green-400' :
            detailedStats.monthly.trend === '下降' ? 'bg-red-900/50 text-red-400' :
            'bg-slate-600/50 text-gray-400'
          }`}>
            {detailedStats.monthly.trend === '上升' ? '↑' :
             detailedStats.monthly.trend === '下降' ? '↓' : '→'} {detailedStats.monthly.trend}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400">本月完成</p>
            <p className="text-lg font-bold text-cyan-400">{detailedStats.monthly.thisMonth} 次</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">上月完成</p>
            <p className="text-lg font-bold text-gray-300">{detailedStats.monthly.lastMonth} 次</p>
          </div>
        </div>
      </div>

      {/* 年度统计 */}
      <div className="bg-gradient-to-r from-purple-900/30 to-purple-800/30 rounded-lg p-4">
        <h3 className="text-sm font-medium text-white mb-3">年度总览</h3>
        <div className="text-xs text-gray-400">
          完成率: <span className="text-purple-400 font-medium">{detailedStats.yearly.completionRate}%</span>
        </div>
        <div className="text-xs text-gray-400 mt-2">
          最佳月份: <span className="text-purple-400 font-medium">{detailedStats.yearly.bestMonth}</span>
        </div>
      </div>
    </div>
  )

  // 日历热力图标签页
  const CalendarTab = () => (
    <div className="space-y-4">
      {/* 热度图 */}
      <div className="bg-slate-700/50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-white">活动热力图</h3>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>少</span>
            <div className="flex gap-0.5">
              <div className="w-3 h-3 rounded bg-slate-700/30" />
              <div className="w-3 h-3 rounded bg-cyan-900/50" />
              <div className="w-3 h-3 rounded bg-cyan-700/70" />
              <div className="w-3 h-3 rounded bg-cyan-500/80" />
              <div className="w-3 h-3 rounded bg-cyan-400" />
            </div>
            <span>多</span>
          </div>
        </div>

        {/* 按周显示的热力图 */}
        <div className="overflow-x-auto">
          <div className="flex gap-0.5 min-w-max">
            {heatmapData.map((day) => (
              <div
                key={day.date}
                className={`w-6 h-6 rounded ${getHeatmapColor(day.level)} cursor-pointer hover:ring-2 hover:ring-cyan-500 transition`}
                title={`${day.date}: 完成 ${day.exp} 个任务`}
                onClick={() => setSelectedDate(day.date)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 选中日期详情 */}
      {selectedDate && (
        <div className="bg-slate-700/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-2">
            {formatDate(selectedDate)}
          </h3>
          {(() => {
            const record = history.find(h => h.date === selectedDate)
            if (!record || record.completedTaskIds.length === 0) {
              return <p className="text-sm text-gray-500">当天没有完成任务</p>
            }

            const completedTasks = record.completedTaskIds
              .map(id => tasks.find(t => t.id === id))
              .filter(Boolean) as YTTask[]

            return (
              <div className="space-y-2">
                <p className="text-sm text-gray-400">
                  完成了 <span className="text-cyan-400 font-medium">{record.completedTaskIds.length}</span> 个任务
                </p>
                {completedTasks.length > 0 && (
                  <div className="space-y-1">
                    {completedTasks.map(task => (
                      <div
                        key={task.id}
                        className="text-xs text-gray-300"
                      >
                        • {task.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* 弹窗 */}
      <div className="relative bg-slate-800 rounded-2xl w-full max-w-lg mx-4 shadow-2xl border border-slate-700 max-h-[85vh] flex flex-col">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white">历史记录</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-gray-400 hover:text-white transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 标签页切换 */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 text-sm font-medium transition ${
              activeTab === 'overview'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            概览
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`flex-1 py-3 text-sm font-medium transition ${
              activeTab === 'trends'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            趋势
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-3 text-sm font-medium transition ${
              activeTab === 'tasks'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            任务
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 py-3 text-sm font-medium transition ${
              activeTab === 'calendar'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            日历
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'trends' && <TrendsTab />}
          {activeTab === 'tasks' && <TasksTab />}
          {activeTab === 'calendar' && <CalendarTab />}
        </div>
      </div>
    </div>
  )
}
