import { useState } from 'react'
import type { YTTask } from '../types/yeartrace'

interface TaskManageModalProps {
  isOpen: boolean
  tasks: YTTask[]
  onCreateTask: () => void
  onEditTask: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
  onClose: () => void
  maxTasks: number
}

export function TaskManageModal({
  isOpen,
  tasks,
  onCreateTask,
  onEditTask,
  onDeleteTask,
  onClose,
  maxTasks,
}: TaskManageModalProps) {
  const [pendingDeleteTaskId, setPendingDeleteTaskId] = useState<string | null>(null)

  if (!isOpen) return null

  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order)

  const handleDeleteClick = (taskId: string) => {
    setPendingDeleteTaskId(taskId)
  }

  const handleConfirmDelete = () => {
    if (pendingDeleteTaskId) {
      onDeleteTask(pendingDeleteTaskId)
      setPendingDeleteTaskId(null)
    }
  }

  const handleCancelDelete = () => {
    setPendingDeleteTaskId(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={pendingDeleteTaskId ? handleCancelDelete : onClose}
      />

      {/* 弹窗 */}
      <div className="relative bg-slate-800 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl border border-slate-700 max-h-[80vh] flex flex-col">
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">管理任务</h2>
          <button
            onClick={pendingDeleteTaskId ? handleCancelDelete : onClose}
            className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-gray-400 hover:text-white transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 任务数量提示 */}
        <div className="mb-4 px-3 py-2 rounded-lg bg-slate-700/50 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            当前: <span className="text-cyan-400 font-medium">{tasks.length}</span> / {maxTasks}
          </span>
          {tasks.length < maxTasks && (
            <button
              onClick={onCreateTask}
              className="px-3 py-1 text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-400 rounded-lg transition"
            >
              + 添加任务
            </button>
          )}
        </div>

        {/* 任务列表 */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>暂无任务</p>
              <p className="text-sm mt-1">点击"添加任务"创建第一个任务</p>
            </div>
          ) : (
            sortedTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold text-gray-400">
                    {task.order}
                  </span>
                  <div>
                    <h3 className="font-medium text-white">{task.name}</h3>
                    <p className="text-xs text-gray-400">
                      {task.type === 'check' && '打卡'}
                      {task.type === 'check+text' && '记录'}
                      {task.type === 'number' && '数值'}
                      {task.type === 'violation' && '约束'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => onEditTask(task.id)}
                    className="p-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-gray-300 hover:text-white transition"
                    title="编辑"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(task.id)}
                    className="p-2 rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 transition"
                    title="删除"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 删除确认弹窗 */}
        {pendingDeleteTaskId && (
          <div className="absolute inset-0 bg-slate-800/95 rounded-2xl flex items-center justify-center p-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-900/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">确认删除任务？</h3>
              <p className="text-sm text-gray-400 mb-4">
                删除后将从历史记录中移除该任务的相关数据，此操作不可恢复
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 py-2 px-4 rounded-lg font-medium text-gray-300 bg-slate-700 hover:bg-slate-600 transition"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2 px-4 rounded-lg font-medium text-white bg-red-500 hover:bg-red-400 transition"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
