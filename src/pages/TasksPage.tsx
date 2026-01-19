import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTasks } from '../hooks/useTasks'
import { useLogs } from '../hooks/useLogs'
import { getRandomColor } from '../utils/helpers'
import { getTaskCompletionCount, getLastRecordTime, getTaskOrder } from '../utils/taskStats'
import { TaskTemplateSelector } from '../components/TaskTemplateSelector'
import { TaskManageCard } from '../components/TaskManageCard'
import { TaskStatusTabs } from '../components/TaskStatusTabs'
import { TaskSortFilterBar } from '../components/TaskSortFilterBar'
import type { Task, TaskType, TaskStatus, TaskSortType } from '../types'
import type { TaskTemplate } from '../types'

export function TasksPage() {
  const navigate = useNavigate()
  const { tasks, createTask, editTask, removeTask } = useTasks()
  const { logs } = useLogs()

  // UI 状态
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'all'>('all')
  const [selectedSort, setSelectedSort] = useState<TaskSortType>('created')
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [batchMode, setBatchMode] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())

  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    type: 'check' as TaskType,
    startDate: new Date().toISOString().split('T')[0],
    color: getRandomColor(),
    unit: '',
    initialValue: '',
    targetValue: '',
  })

  // 筛选和排序任务
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks

    // 状态筛选
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(t => t.status === selectedStatus)
    }

    // 颜色筛选
    if (selectedColor) {
      filtered = filtered.filter(t => t.color === selectedColor)
    }

    // 排序
    const sorted = [...filtered].sort((a, b) => {
      switch (selectedSort) {
        case 'completed':
          return getTaskCompletionCount(b.id, logs) - getTaskCompletionCount(a.id, logs)
        case 'lastRecord':
          const aTime = getLastRecordTime(a.id, logs)
          const bTime = getLastRecordTime(b.id, logs)
          if (!aTime) return 1
          if (!bTime) return -1
          return bTime.getTime() - aTime.getTime()
        case 'created':
        default:
          return getTaskOrder(a.id, tasks) - getTaskOrder(b.id, tasks)
      }
    })

    return sorted
  }, [tasks, selectedStatus, selectedSort, selectedColor, logs])

  // 处理模板选择
  const handleTemplateSelect = (template: TaskTemplate) => {
    setFormData({
      name: template.name,
      type: template.type,
      startDate: new Date().toISOString().split('T')[0],
      color: template.color,
      unit: template.unit || '',
      initialValue: '',
      targetValue: template.targetValue?.toString() || '',
    })
    setShowTemplateSelector(false)
    setShowAddForm(true)
  }

  const handleCustomTask = () => {
    setFormData({
      name: '',
      type: 'check',
      startDate: new Date().toISOString().split('T')[0],
      color: getRandomColor(),
      unit: '',
      initialValue: '',
      targetValue: '',
    })
    setShowTemplateSelector(false)
    setShowAddForm(true)
  }

  const handleAddTask = () => {
    if (!formData.name.trim()) return

    const newTask: Omit<Task, 'id'> = {
      name: formData.name,
      type: formData.type,
      startDate: formData.startDate,
      color: formData.color,
      status: 'active',
    }

    if (formData.type === 'number') {
      if (formData.unit) newTask.unit = formData.unit
      if (formData.initialValue) newTask.initialValue = parseFloat(formData.initialValue)
      if (formData.targetValue) newTask.targetValue = parseFloat(formData.targetValue)
    }

    createTask(newTask)
    resetForm()
  }

  const handleEditTask = () => {
    if (!editingTask || !formData.name.trim()) return

    const updates: Partial<Task> = {
      name: formData.name,
      type: formData.type,
      startDate: formData.startDate,
      color: formData.color,
    }

    if (formData.type === 'number') {
      updates.unit = formData.unit || undefined
      updates.initialValue = formData.initialValue ? parseFloat(formData.initialValue) : undefined
      updates.targetValue = formData.targetValue ? parseFloat(formData.targetValue) : undefined
    } else {
      updates.unit = undefined
      updates.initialValue = undefined
      updates.targetValue = undefined
    }

    editTask(editingTask.id, updates)
    resetForm()
  }

  const handleDeleteTask = (task: Task) => {
    if (confirm(`确定要删除任务「${task.name}」吗？相关记录也会被删除。`)) {
      removeTask(task.id)
    }
  }

  const handlePauseTask = (task: Task) => {
    if (task.status === 'paused') {
      editTask(task.id, { status: 'active' })
    } else {
      editTask(task.id, { status: 'paused' })
    }
  }

  const handleQuickRecord = (task: Task) => {
    navigate(`/task/${task.id}`)
  }

  const startEdit = (task: Task) => {
    setEditingTask(task)
    setFormData({
      name: task.name,
      type: task.type,
      startDate: task.startDate,
      color: task.color,
      unit: task.unit || '',
      initialValue: task.initialValue?.toString() || '',
      targetValue: task.targetValue?.toString() || '',
    })
    setShowAddForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'check',
      startDate: new Date().toISOString().split('T')[0],
      color: getRandomColor(),
      unit: '',
      initialValue: '',
      targetValue: '',
    })
    setShowAddForm(false)
    setEditingTask(null)
  }

  const handleTaskSelect = (task: Task) => {
    const newSelected = new Set(selectedTasks)
    if (newSelected.has(task.id)) {
      newSelected.delete(task.id)
    } else {
      newSelected.add(task.id)
    }
    setSelectedTasks(newSelected)
  }

  const handleBatchDelete = () => {
    if (confirm(`确定要删除选中的 ${selectedTasks.size} 个任务吗？`)) {
      selectedTasks.forEach(id => removeTask(id))
      setSelectedTasks(new Set())
      setBatchMode(false)
    }
  }

  const handleBatchPause = () => {
    selectedTasks.forEach(id => {
      const task = tasks.find(t => t.id === id)
      if (task && task.status === 'active') {
        editTask(id, { status: 'paused' })
      }
    })
    setSelectedTasks(new Set())
    setBatchMode(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* 顶部导航 */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
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
              <span className="text-2xl">📋</span>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">任务管理</h1>
            </div>
            <button
              onClick={() => setBatchMode(!batchMode)}
              className={`p-2 rounded-lg transition-colors ${
                batchMode
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* 新建任务按钮 */}
        <button
          onClick={() => setShowTemplateSelector(true)}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 rounded-xl shadow-md transition-all hover:shadow-lg"
        >
          + 新建任务
        </button>

        {/* 模板选择器 */}
        {showTemplateSelector && (
          <TaskTemplateSelector
            onSelect={handleTemplateSelect}
            onCustom={handleCustomTask}
            onClose={() => setShowTemplateSelector(false)}
          />
        )}

        {/* 排序和筛选 */}
        <TaskSortFilterBar
          tasks={tasks}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
        />

        {/* 状态分组 Tabs */}
        <TaskStatusTabs
          tasks={tasks}
          selectedStatus={selectedStatus}
          onSelectStatus={setSelectedStatus}
        />

        {/* 添加/编辑表单 */}
        {showAddForm && (
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingTask ? '编辑任务' : '新建任务'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  任务名称
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：早起、读书、健身"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  任务类型
                </label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as TaskType })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="check">完成即记录（如：早起、冥想）</option>
                  <option value="check+text">完成需输入文本（如：读书）</option>
                  <option value="number">数值型记录（如：体重）</option>
                  <option value="violation">触犯才记录（如：忌冰）</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  开始日期
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {formData.type === 'number' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      单位（可选）
                    </label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={e => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="kg"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      初始值（可选）
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.initialValue}
                      onChange={e => setFormData({ ...formData, initialValue: e.target.value })}
                      placeholder="54.2"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      目标值（可选）
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.targetValue}
                      onChange={e => setFormData({ ...formData, targetValue: e.target.value })}
                      placeholder="48"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  颜色标识
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#6366f1',
                    '#ef4444', '#14b8a6', '#f97316', '#ec4899', '#06b6d4'
                  ].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full transition-all ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={editingTask ? handleEditTask : handleAddTask}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  {editingTask ? '保存' : '创建'}
                </button>
                <button
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 rounded-lg transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 批量操作栏 */}
        {batchMode && selectedTasks.size > 0 && (
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-4 shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div className="font-medium">
                已选择 {selectedTasks.size} 个任务
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBatchPause}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  暂停
                </button>
                <button
                  onClick={handleBatchDelete}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                >
                  删除
                </button>
                <button
                  onClick={() => {
                    setSelectedTasks(new Set())
                    setBatchMode(false)
                  }}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 任务列表 */}
        {filteredAndSortedTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-500 shadow-md border border-gray-200">
            <div className="text-4xl mb-3">📭</div>
            <p>暂无任务</p>
            <p className="text-sm mt-1">点击上方「新建任务」开始创建</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAndSortedTasks.map(task => (
              <TaskManageCard
                key={task.id}
                task={task}
                logs={logs}
                onEdit={startEdit}
                onPause={handlePauseTask}
                onDelete={handleDeleteTask}
                onQuickRecord={handleQuickRecord}
                onSelect={batchMode ? handleTaskSelect : undefined}
                isSelected={selectedTasks.has(task.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
