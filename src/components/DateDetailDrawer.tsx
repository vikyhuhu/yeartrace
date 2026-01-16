import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { Task, Log } from '../types'

interface DateDetailDrawerProps {
  isOpen: boolean
  date: string
  logs: Log[]
  tasks: Task[]
  onClose: () => void
}

export function DateDetailDrawer({ isOpen, date, logs, tasks, onClose }: DateDetailDrawerProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  if (!isOpen) return null

  const dateObj = new Date(date)

  // 获取该日期的所有有效任务
  const validTasks = tasks.filter(task => {
    const taskStartStr = format(new Date(task.startDate), 'yyyy-MM-dd')
    const taskEndStr = task.endDate ? format(new Date(task.endDate), 'yyyy-MM-dd') : null
    if (date < taskStartStr) return false
    if (taskEndStr && date > taskEndStr) return false
    return true
  })

  const regularTasks = validTasks.filter(t => t.type !== 'violation')
  const violationTasks = validTasks.filter(t => t.type === 'violation')

  const completedRegularTasks = regularTasks
    .map(task => ({ task, log: logs.find(l => l.taskId === task.id) }))
    .filter(item => item.log)

  const incompleteRegularTasks = regularTasks
    .filter(task => !logs.some(l => l.taskId === task.id))

  const completedViolations = violationTasks
    .map(task => ({ task, log: logs.find(l => l.taskId === task.id) }))
    .filter(item => item.log)

  const isAllDone = incompleteRegularTasks.length === 0 && regularTasks.length > 0

  return (
    <>
      {/* 蒙层 */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* 抽屉 */}
      <div
        className={`fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:w-[480px] bg-white rounded-t-3xl shadow-2xl z-[100] transition-transform duration-300 ease-out max-h-[85vh] overflow-hidden flex flex-col ${isAnimating ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* 拖拽条 */}
        <div className="flex-shrink-0 flex justify-center pt-3 pb-1" onClick={handleClose}>
          <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
        </div>

        {/* 日期头部 */}
        <div className="flex-shrink-0 px-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* 日期圆形标识 */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <span className="text-white text-lg font-bold">{format(dateObj, 'd')}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {format(dateObj, 'MM月dd日', { locale: zhCN })}
                </h2>
                <p className="text-sm text-gray-500">
                  {format(dateObj, 'EEEE', { locale: zhCN })}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 全勤徽章 */}
          {isAllDone && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-sm font-semibold rounded-full border border-emerald-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              全勤达成
            </div>
          )}

          {/* 统计摘要 */}
          <div className="mt-4 flex gap-3">
            <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{completedRegularTasks.length}</div>
              <div className="text-xs text-gray-500 mt-1">已完成</div>
            </div>
            <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{incompleteRegularTasks.length}</div>
              <div className="text-xs text-gray-500 mt-1">未完成</div>
            </div>
            {completedViolations.length > 0 && (
              <div className="flex-1 bg-red-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-red-600">{completedViolations.length}</div>
                <div className="text-xs text-red-400 mt-1">违规</div>
              </div>
            )}
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {/* 已完成任务 */}
          {completedRegularTasks.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full bg-emerald-500" />
                <h3 className="text-sm font-bold text-gray-700">已完成</h3>
                <span className="text-xs text-gray-400">({completedRegularTasks.length})</span>
              </div>
              <div className="space-y-2">
                {completedRegularTasks.map(({ task, log }) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: task.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900">{task.name}</div>
                      {log?.text && (
                        <div className="text-xs text-gray-600 mt-1 line-clamp-2">{log.text}</div>
                      )}
                      {log?.value !== undefined && (
                        <div className="text-xs font-medium text-gray-700 mt-1">
                          {log.value} {task.unit}
                        </div>
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 违规记录 */}
          {completedViolations.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full bg-red-500" />
                <h3 className="text-sm font-bold text-red-600">违规记录</h3>
                <span className="text-xs text-red-400">({completedViolations.length})</span>
              </div>
              <div className="space-y-2">
                {completedViolations.map(({ task }) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-white rounded-2xl border border-red-100"
                  >
                    <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
                    <div className="flex-1 text-sm font-semibold text-red-700">{task.name}</div>
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 未完成任务 */}
          {incompleteRegularTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full bg-gray-300" />
                <h3 className="text-sm font-bold text-gray-500">未完成</h3>
                <span className="text-xs text-gray-400">({incompleteRegularTasks.length})</span>
              </div>
              <div className="space-y-2">
                {incompleteRegularTasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 opacity-60"
                  >
                    <div className="w-3 h-3 rounded-full bg-gray-300 flex-shrink-0" />
                    <div className="text-sm text-gray-500">{task.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 空状态 */}
          {completedRegularTasks.length === 0 && completedViolations.length === 0 && incompleteRegularTasks.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-400">该日期没有任务</p>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-white">
          <button
            onClick={handleClose}
            className="w-full px-6 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-2xl transition-colors shadow-lg shadow-gray-200"
          >
            关闭
          </button>
        </div>
      </div>
    </>
  )
}
