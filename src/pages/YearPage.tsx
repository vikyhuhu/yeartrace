import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useTasks } from '../hooks/useTasks'
import { useLogs } from '../hooks/useLogs'
import { StatsCards } from '../components/StatsCards'
import { MonthlyTrendChart } from '../components/MonthlyTrendChart'
import { TaskDetailPanel } from '../components/TaskDetailPanel'
import type { Task } from '../types'

export function YearPage() {
  const navigate = useNavigate()
  const { tasks } = useTasks()
  const { logs } = useLogs()

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null)
  const [filterTaskId, setFilterTaskId] = useState<string | null>(null)

  const handlePrevYear = () => {
    setSelectedYear(selectedYear - 1)
  }

  const handleNextYear = () => {
    if (selectedYear < new Date().getFullYear()) {
      setSelectedYear(selectedYear + 1)
    }
  }

  const handleTaskClick = (task: Task) => {
    if (selectedTaskForDetail?.id === task.id) {
      setSelectedTaskForDetail(null)
    } else {
      setSelectedTaskForDetail(task)
    }
  }

  const selectedDateLogs = selectedDate
    ? logs.filter(l => l.date === selectedDate && (!filterTaskId || l.taskId === filterTaskId))
    : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* 顶部导航 */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📅</span>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">年度总览</h1>
            </div>
            <div className="w-9" />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        {/* 年份选择器 */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-2xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevYear}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="text-center">
              <div className="text-3xl font-bold mb-1">
                {selectedYear}
              </div>
              <div className="text-sm text-blue-100">
                这一年，真的留下了什么
              </div>
            </div>

            <button
              onClick={handleNextYear}
              disabled={selectedYear >= new Date().getFullYear()}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {selectedYear !== new Date().getFullYear() && (
            <button
              onClick={() => setSelectedYear(new Date().getFullYear())}
              className="mt-4 w-full py-2 text-sm font-medium bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
            >
              回到今年
            </button>
          )}
        </div>

        {/* 1. 统计卡片 */}
        <StatsCards
          year={selectedYear}
          logs={logs}
          tasks={tasks}
          filterTaskId={filterTaskId}
        />

        {/* 2. 任务筛选器 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterTaskId(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !filterTaskId
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              全部任务
            </button>
            {tasks.filter(t => t.status === 'active').map(task => (
              <button
                key={task.id}
                onClick={() => handleTaskClick(task)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  filterTaskId === task.id || selectedTaskForDetail?.id === task.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: task.color }}
                />
                {task.name}
              </button>
            ))}
          </div>
        </div>

        {/* 3. 月度趋势图 */}
        <MonthlyTrendChart
          year={selectedYear}
          logs={logs}
          tasks={tasks}
          filterTaskId={filterTaskId}
        />

        {/* 4. 任务详情面板 */}
        {selectedTaskForDetail && (
          <TaskDetailPanel
            task={selectedTaskForDetail}
            year={selectedYear}
            logs={logs}
            onClose={() => setSelectedTaskForDetail(null)}
          />
        )}

        {/* 6. 选中日期的详情 */}
        {selectedDate && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                {format(new Date(selectedDate), 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                关闭
              </button>
            </div>

            {selectedDateLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">暂无记录</p>
            ) : (
              <div className="space-y-2">
                {selectedDateLogs.map(log => {
                  const task = tasks.find(t => t.id === log.taskId)
                  if (!task) return null

                  return (
                    <div
                      key={log.id}
                      className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border border-gray-200 dark:border-gray-600"
                    >
                      <div
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: task.color }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{task.name}</div>
                        {log.text && (
                          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">"{log.text}"</div>
                        )}
                        {log.value !== undefined && (
                          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {log.value} {task.unit}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
