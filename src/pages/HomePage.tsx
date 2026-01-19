import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useTasks } from '../hooks/useTasks'
import { useLogs } from '../hooks/useLogs'
import { useBooks } from '../hooks/useBooks'
import { Timeline } from '../components/Timeline'
import { TaskCard } from '../components/TaskCard'
import { AllDoneCelebration } from '../components/AllDoneCelebration'
import { getToday } from '../utils/helpers'

export function HomePage() {
  const navigate = useNavigate()
  const { tasks, loading: tasksLoading } = useTasks()
  const { logs, createLog, editLog, removeLog } = useLogs()
  // 自动同步：useBooks 会监听 logs 和 tasks 的变化并自动同步书单
  useBooks(logs, tasks)

  const [selectedDate, setSelectedDate] = useState(getToday())
  // 新增：呼吸动画日期（用于时间轴）
  const [breatheDate, setBreatheDate] = useState<string | undefined>()
  // 新增：全勤提示
  const [showAllDone, setShowAllDone] = useState(false)
  // 新增：违规任务展开状态
  const [showViolationTasks, setShowViolationTasks] = useState(false)
  // 记录上次未完成任务数量，用于检测全勤达成
  const prevIncompleteCountRef = useRef<number>(0)

  const todayTasks = useMemo(() => {
    return tasks.filter(t => {
      const start = new Date(t.startDate)
      const end = t.endDate ? new Date(t.endDate) : null
      const current = new Date(selectedDate)

      if (current < start) return false
      if (end && current > end) return false
      return true
    })
  }, [tasks, selectedDate])

  // 分离已完成和未完成任务（排除违规类型）
  const violationTasks = todayTasks.filter(task => task.type === 'violation')
  const regularTasks = todayTasks.filter(task => task.type !== 'violation')

  const completedTasks = regularTasks.filter(task =>
    logs.some(l => l.taskId === task.id && l.date === selectedDate)
  )
  const incompleteTasks = regularTasks.filter(task =>
    !logs.some(l => l.taskId === task.id && l.date === selectedDate)
  )

  // 初始化时记录当前未完成任务数
  useEffect(() => {
    prevIncompleteCountRef.current = incompleteTasks.length
  }, [])

  const handleLogCreate = (data: { taskId: string; date: string; value?: number; text?: string }) => {
    const wasIncomplete = prevIncompleteCountRef.current > 0

    createLog(data)
    // 触发时间轴呼吸动画
    setBreatheDate(data.date)
    setTimeout(() => setBreatheDate(undefined), 500)

    // 检查是否刚达成全勤：之前有未完成任务，且当前有常规任务
    if (wasIncomplete && regularTasks.length > 0) {
      // 计算剩余未完成数（不包括刚完成的任务，并手动考虑刚创建的日志）
      const remainingIncomplete = regularTasks.filter(task => {
        // 刚完成的任务跳过
        if (task.id === data.taskId) return false
        // 已有日志的任务跳过
        if (logs.some(l => l.taskId === task.id && l.date === data.date)) return false
        // 其余都是未完成的
        return true
      }).length

      if (remainingIncomplete === 0) {
        setShowAllDone(true)
      }

      // 更新记录
      prevIncompleteCountRef.current = remainingIncomplete
    }
  }

  const handleLogUpdate = (id: string, data: { value?: number; text?: string }) => {
    editLog(id, data)
  }

  const handlePrevDay = () => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() - 1)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const handleNextDay = () => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + 1)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const handleGoToday = () => {
    setSelectedDate(getToday())
  }

  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-400">加载中...</div>
      </div>
    )
  }

  const displayDate = new Date(selectedDate)
  const isTodayView = selectedDate === getToday()

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 全勤提示 */}
      <AllDoneCelebration show={showAllDone} />

      {/* 顶部导航 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">YearTrace</h1>
            <nav className="flex gap-4">
              <button
                onClick={() => navigate('/tasks')}
                className="text-sm text-gray-500 hover:text-gray-900 font-medium"
              >
                任务
              </button>
              <button
                onClick={() => navigate('/calendar')}
                className="text-sm text-gray-500 hover:text-gray-900 font-medium"
              >
                日历
              </button>
              <button
                onClick={() => navigate('/year')}
                className="text-sm text-gray-500 hover:text-gray-900 font-medium"
              >
                年度
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5">
        {/* 日期选择器 */}
        <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevDay}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="text-center">
              <div className="text-xs text-gray-500 font-medium">
                {isTodayView ? '今天' : format(displayDate, 'EEE', { locale: zhCN })}
              </div>
              <div className="text-base font-bold text-gray-900 flex items-center justify-center gap-2">
                {format(displayDate, 'MM月dd日', { locale: zhCN })}
                {isTodayView && (
                  <span className="text-sm font-normal text-gray-500">
                    {format(displayDate, 'EEE', { locale: zhCN })}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleNextDay}
              disabled={isTodayView}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-20"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {!isTodayView && (
            <button
              onClick={handleGoToday}
              className="mt-2 w-full text-xs text-gray-500 hover:text-gray-700 font-medium"
            >
              回到今天
            </button>
          )}
        </div>

        {/* 时间轴 - 次级导航 */}
        <div className="bg-white rounded-xl p-3 mb-5 border border-gray-200">
          <div className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">时间轴</div>
          <Timeline
            tasks={tasks}
            logs={logs}
            days={30}
            endDate={getToday()}
            onDateClick={setSelectedDate}
            selectedDate={selectedDate}
            breatheDate={breatheDate}
          />
        </div>

        {/* 今日任务 */}
        <div key={selectedDate} className="task-list-animate">
          {/* 未完成任务 - 视觉重心 */}
          {incompleteTasks.length > 0 && (
            <div className="mb-5">
              <h2 className="text-base font-bold text-gray-900 mb-3">今日任务</h2>
              <div className="space-y-2.5">
                {incompleteTasks.map(task => {
                  const log = logs.find(
                    l => l.taskId === task.id && l.date === selectedDate
                  ) || null

                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      date={selectedDate}
                      log={log}
                      allLogs={logs}
                      onLogCreate={handleLogCreate}
                      onLogUpdate={handleLogUpdate}
                      onLogDelete={removeLog}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* 已完成任务 - 视觉后退 */}
          {completedTasks.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 mb-3">已完成</h2>
              <div className="space-y-2 opacity-60">
                {completedTasks.map(task => {
                  const log = logs.find(
                    l => l.taskId === task.id && l.date === selectedDate
                  ) || null

                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      date={selectedDate}
                      log={log}
                      allLogs={logs}
                      onLogCreate={handleLogCreate}
                      onLogUpdate={handleLogUpdate}
                      onLogDelete={removeLog}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* 违规任务 - 可折叠区域 */}
          {violationTasks.length > 0 && (
            <div className="mt-5">
              <button
                onClick={() => setShowViolationTasks(!showViolationTasks)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors group"
              >
                <span className={`transform transition-transform ${showViolationTasks ? 'rotate-90' : ''}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
                <span>约束任务</span>
                <span className="text-xs">({violationTasks.length})</span>
              </button>

              {showViolationTasks && (
                <div className="mt-3 space-y-2.5 animate-[expand_0.2s_ease-out]">
                  {violationTasks.map(task => {
                    const log = logs.find(
                      l => l.taskId === task.id && l.date === selectedDate
                    ) || null

                    return (
                      <TaskCard
                        key={task.id}
                        task={task}
                        date={selectedDate}
                        log={log}
                        allLogs={logs}
                        onLogCreate={handleLogCreate}
                        onLogUpdate={handleLogUpdate}
                        onLogDelete={removeLog}
                      />
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* 空状态 */}
          {regularTasks.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
              <p className="text-gray-500 mb-2">暂无任务</p>
              <button
                onClick={() => navigate('/tasks')}
                className="text-sm text-gray-700 hover:text-gray-900 font-medium"
              >
                去添加任务 →
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
