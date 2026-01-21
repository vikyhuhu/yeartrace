import { useState, useMemo } from 'react'
import { useYearTrace } from '../hooks/useYearTrace'
import { YearTraceTaskCard } from '../components/YearTraceTaskCard'
import { YearTraceSettlementModal } from '../components/YearTraceSettlementModal'
import { TaskEditModal } from '../components/TaskEditModal'
import { TaskManageModal } from '../components/TaskManageModal'
import { TaskCreateModal } from '../components/TaskCreateModal'
import { HistoryModal } from '../components/HistoryModal'
import { DateTimeline } from '../components/DateTimeline'
import type { YTSettlementData, YTTaskRecord, YTTask, TaskType, TaskStatus } from '../types/yeartrace'

type ManageMode = 'manage' | 'create' | null

export function YearTracePage() {
  const { tasks, user, history, completeTask, uncompleteTask, updateTask, addTask, deleteTask, MAX_TASKS } = useYearTrace()
  const [showSettlement, setShowSettlement] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [editingTask, setEditingTask] = useState<YTTask | null>(null)
  const [manageMode, setManageMode] = useState<ManageMode>(null)
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0])

  // 检查是否是今天
  const today = new Date().toISOString().split('T')[0]
  const isToday = selectedDate === today

  // 获取选中日期的任务记录映射
  const dateTaskRecords = useMemo(() => {
    const dayRecord = history.find(h => h.date === selectedDate)
    const recordMap = new Map<string, YTTaskRecord>()
    dayRecord?.records.forEach(r => recordMap.set(r.taskId, r))
    return recordMap
  }, [history, selectedDate])

  // 计算选中日期的任务状态
  const tasksWithStatus = useMemo(() => {
    return tasks.map(task => {
      const record = dateTaskRecords.get(task.id)
      const isCompleted = record?.completed ?? false
      return {
        ...task,
        status: (isCompleted ? 'completed' : 'pending') as TaskStatus,
      }
    })
  }, [tasks, dateTaskRecords])

  // 用于显示的历史记录摘要（带是否有数据的标记）
  const historySummary = useMemo(() => {
    return history.map(h => ({
      date: h.date,
      hasData: h.records.some(r => r.completed),
    }))
  }, [history])

  // 切换日期时重新计算连击
  const handleDateChange = (date: string) => {
    setSelectedDate(date)
  }

  const handleCompleteTask = (taskId: string, record?: Omit<YTTaskRecord, 'taskId' | 'completed' | 'completedAt'>) => {
    // 传递当前选择的日期
    const result = completeTask(taskId, record, isToday ? undefined : selectedDate)

    // 检查是否今天全部完成
    if (isToday) {
      setTimeout(() => {
        const allCompleted = tasks.every(t => {
          const r = dateTaskRecords.get(t.id)
          return r?.completed || t.status === 'completed'
        })
        if (allCompleted) {
          setShowSettlement(true)
        }
      }, 800)
    }

    return result
  }

  const handleUncompleteTask = (taskId: string) => {
    // 传递当前选择的日期
    const result = uncompleteTask(taskId, isToday ? undefined : selectedDate)

    // 取消完成时关闭结算弹层（因为不再全部完成）
    if (result && showSettlement) {
      setShowSettlement(false)
    }

    return result
  }

  const handleCloseSettlement = () => {
    setShowSettlement(false)
  }

  const handleEditTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      setEditingTask(task)
    }
  }

  const handleCloseEdit = () => {
    setEditingTask(null)
  }

  const handleSaveTask = (taskId: string, updates: {
    name?: string
    expValue?: number
    type?: TaskType
    color?: string
    unit?: string
    targetValue?: number
  }) => {
    updateTask(taskId, updates)
    setEditingTask(null)
  }

  const handleManageTasks = () => {
    setManageMode('manage')
  }

  const handleCloseManage = () => {
    setManageMode(null)
  }

  const handleCreateTask = () => {
    setManageMode('create')
  }

  const handleSaveNewTask = (
    name: string,
    type: TaskType,
    options?: {
      color?: string
      unit?: string
      targetValue?: number
      startDate?: string
    }
  ) => {
    addTask(name, type, options)
    setManageMode(null)
  }

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId)
  }

  // 切换回今天
  const handleBackToToday = () => {
    setSelectedDate(today)
  }

  // 准备结算数据
  const getSettlementData = (): YTSettlementData | null => {
    if (!isToday) return null

    const allCompleted = tasksWithStatus.every(t => t.status === 'completed')
    if (!allCompleted) return null

    const maxStreak = Math.max(...tasksWithStatus.map(t => t.streak))

    return {
      date: selectedDate,
      completedCount: tasksWithStatus.length,
      totalCount: tasksWithStatus.length,
      streakBefore: maxStreak - 1,
      streakAfter: maxStreak,
    }
  }

  // 计算选中日期的总进度
  const selectedDateProgress = useMemo(() => {
    const completed = tasksWithStatus.filter(t => t.status === 'completed').length
    return {
      completed,
      total: tasksWithStatus.length,
      percentage: tasksWithStatus.length > 0 ? (completed / tasksWithStatus.length) * 100 : 0,
    }
  }, [tasksWithStatus])

  // 计算选中日期的累计记录天数
  const totalRecordDays = useMemo(() => {
    return history.filter(h => h.records.some(r => r.completed)).length
  }, [history])

  return (
    <div className="yt-root min-h-screen">
      {/* 顶部 HUD 栏 */}
      <div className="yt-hud-bar">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            {/* 日期 + 返回今天按钮 + 管理按钮 + 历史按钮 */}
            <div className="flex items-center gap-3">
              {!isToday && (
                <button
                  onClick={handleBackToToday}
                  className="px-2 py-1 rounded bg-cyan-600/50 hover:bg-cyan-500/50 text-cyan-400 text-xs transition flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  回今天
                </button>
              )}
              <button
                onClick={handleManageTasks}
                className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-gray-400 hover:text-white text-xs transition"
                title="管理任务"
              >
                管理
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-gray-400 hover:text-white text-xs transition"
                title="查看历史"
              >
                历史
              </button>
            </div>

            {/* 连击天数 */}
            <div className="flex items-center gap-1.5">
              <span className="yt-flame-icon text-orange-500">🔥</span>
              <span className="text-orange-400 font-mono font-bold">{user.streak}</span>
            </div>

            {/* 累计记录天数 */}
            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
              <span>累计</span>
              <span className="text-cyan-400 font-mono font-bold">{totalRecordDays}</span>
              <span>天</span>
            </div>
          </div>
        </div>
      </div>

      {/* 时间轴 */}
      <DateTimeline
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        history={historySummary}
      />

      {/* 选中日期的进度条 */}
      {selectedDateProgress.completed > 0 && (
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="bg-slate-800/50 rounded-lg px-4 py-2 flex items-center justify-between">
            <span className="text-sm text-gray-400">
              {!isToday && (
                <span className="mr-2">{new Date(selectedDate).toLocaleDateString('zh-CN', { weekday: 'short' })} · </span>
              )}
              已完成 {selectedDateProgress.completed} / {selectedDateProgress.total} 个任务
            </span>
            <span className="text-sm font-bold text-cyan-400">
              {Math.round(selectedDateProgress.percentage)}%
            </span>
          </div>
        </div>
      )}

      {/* 主内容区 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 任务网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasksWithStatus.map((task) => (
            <YearTraceTaskCard
              key={task.id}
              task={task}
              todayRecord={dateTaskRecords.get(task.id)}
              onComplete={(taskId, record) => handleCompleteTask(taskId, record)}
              onUncomplete={handleUncompleteTask}
              onEdit={handleEditTask}
            />
          ))}
        </div>

        {/* 结算按钮（仅今天且全部完成时显示） */}
        {isToday && selectedDateProgress.completed === selectedDateProgress.total && selectedDateProgress.total > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowSettlement(true)}
              className="yt-complete-btn px-8 py-3 rounded-lg font-bold text-lg"
            >
              查看今日结算
            </button>
          </div>
        )}
      </div>

      {/* 结算弹层 */}
      {showSettlement && getSettlementData() && (
        <YearTraceSettlementModal
          data={getSettlementData()!}
          onClose={handleCloseSettlement}
        />
      )}

      {/* 编辑任务弹层 */}
      <TaskEditModal
        isOpen={editingTask !== null}
        task={editingTask}
        onSave={handleSaveTask}
        onClose={handleCloseEdit}
      />

      {/* 管理任务弹层 */}
      <TaskManageModal
        isOpen={manageMode === 'manage'}
        tasks={tasks}
        onCreateTask={handleCreateTask}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        onClose={handleCloseManage}
        maxTasks={MAX_TASKS}
      />

      {/* 创建任务弹层 */}
      <TaskCreateModal
        isOpen={manageMode === 'create'}
        onCreate={handleSaveNewTask}
        onClose={handleCloseManage}
        maxTasks={MAX_TASKS}
        currentTasksCount={tasks.length}
      />

      {/* 历史记录弹层 */}
      <HistoryModal
        isOpen={showHistory}
        tasks={tasks}
        history={history}
        onClose={() => setShowHistory(false)}
      />
    </div>
  )
}
