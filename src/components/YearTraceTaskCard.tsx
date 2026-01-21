import { useState, useRef } from 'react'
import type { YTTask, YTTaskRecord } from '../types/yeartrace'
import { useSoundEffects } from '../utils/soundEffects'
import { CheckTextModal } from './CheckTextModal'
import { NumberModal } from './NumberModal'
import { ViolationModal } from './ViolationModal'

interface CompleteResult {
  streakBefore: number
  streakAfter: number
}

interface UncompleteResult {
  streakBefore: number
  streakAfter: number
}

interface YearTraceTaskCardProps {
  task: YTTask
  todayRecord?: YTTaskRecord
  onComplete: (taskId: string, record?: Omit<YTTaskRecord, 'taskId' | 'completed' | 'completedAt'>) => CompleteResult | null
  onUncomplete?: (taskId: string) => UncompleteResult | null
  onEdit?: (taskId: string) => void
}

export function YearTraceTaskCard({
  task,
  todayRecord,
  onComplete,
  onUncomplete,
  onEdit,
}: YearTraceTaskCardProps) {
  const { play } = useSoundEffects()
  const [isAnimating, setIsAnimating] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Modal 显示状态
  const [showCheckTextModal, setShowCheckTextModal] = useState(false)
  const [showNumberModal, setShowNumberModal] = useState(false)
  const [showViolationModal, setShowViolationModal] = useState(false)

  // 获取任务类型颜色
  const getTypeColor = () => {
    if (task.color) return task.color
    switch (task.type) {
      case 'check+text':
        return 'from-purple-400 to-purple-500'
      case 'number':
        return 'from-green-400 to-green-500'
      case 'violation':
        return 'from-red-400 to-red-500'
      default:
        return 'from-cyan-400 to-cyan-500'
    }
  }

  // 获取任务类型图标（移除了默认的 check 图标）
  const getTypeIcon = () => {
    switch (task.type) {
      case 'check+text':
        return '📝'
      case 'number':
        return '🔢'
      case 'violation':
        return '⚠️'
      default:
        return '' // check 类型不显示图标
    }
  }

  // 处理完成按钮点击
  const handleCompleteClick = () => {
    if (task.status === 'completed') {
      // 已完成任务：取消完成
      handleUncomplete()
      return
    }

    // 根据任务类型显示对应的 Modal
    play('click')

    switch (task.type) {
      case 'check+text':
        setShowCheckTextModal(true)
        break
      case 'number':
        setShowNumberModal(true)
        break
      case 'violation':
        setShowViolationModal(true)
        break
      default:
        // check 类型直接完成
        handleComplete()
    }
  }

  // 直接完成任务（check 类型）
  const handleComplete = () => {
    setIsAnimating(true)

    setTimeout(() => {
      const result = onComplete(task.id)

      if (result) {
        cardRef.current?.classList.add('yt-complete-burst')
        play('complete')

        setTimeout(() => {
          cardRef.current?.classList.remove('yt-complete-burst')
        }, 400)
      }

      setIsAnimating(false)
    }, 100)
  }

  // 取消完成
  const handleUncomplete = () => {
    if (!onUncomplete) return

    setIsAnimating(true)
    play('click')

    setTimeout(() => {
      const result = onUncomplete(task.id)
      if (result) {
        cardRef.current?.classList.add('yt-uncomplete-burst')
        play('cancel')

        setTimeout(() => {
          cardRef.current?.classList.remove('yt-uncomplete-burst')
        }, 400)
      }

      setIsAnimating(false)
    }, 100)
  }

  // 处理 check+text 提交
  const handleCheckTextSubmit = (data: { text: string; rating: number }) => {
    onComplete(task.id, { text: data.text, rating: data.rating })
    setShowCheckTextModal(false)
    triggerCompleteAnimation()
  }

  // 处理 number 提交
  const handleNumberSubmit = (value: number) => {
    onComplete(task.id, { value })
    setShowNumberModal(false)
    triggerCompleteAnimation()
  }

  // 处理 violation 提交
  const handleViolationSubmit = () => {
    onComplete(task.id)
    setShowViolationModal(false)
    triggerCompleteAnimation()
  }

  // 触发完成动画
  const triggerCompleteAnimation = () => {
    setIsAnimating(true)
    setTimeout(() => {
      cardRef.current?.classList.add('yt-complete-burst')
      play('complete')

      setTimeout(() => {
        cardRef.current?.classList.remove('yt-complete-burst')
      }, 400)

      setIsAnimating(false)
    }, 100)
  }

  // 获取按钮文本
  const getButtonText = () => {
    if (task.status === 'completed') {
      switch (task.type) {
        case 'violation':
          return '取消记录'
        default:
          return '取消完成'
      }
    }
    switch (task.type) {
      case 'check+text':
        return '记录今日'
      case 'number':
        return '输入数值'
      case 'violation':
        return '记录违规'
      default:
        return '完成任务'
    }
  }

  return (
    <>
      <div
        ref={cardRef}
        className={`
          yt-task-card rounded-xl p-5 relative overflow-hidden
          ${task.status === 'completed' ? 'completed' : ''}
        `}
      >
        {/* 顶部状态条 */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getTypeColor()}`}
        />

        {/* 编辑按钮 */}
        {onEdit && (
          <button
            onClick={() => onEdit(task.id)}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-700/50 hover:bg-slate-600/80 flex items-center justify-center text-gray-400 hover:text-white transition"
            title="编辑任务"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}

        <div className="flex flex-col gap-3">
          {/* 任务名称和类型图标 */}
          <div className="flex items-center gap-2">
            {getTypeIcon() && <span className="text-lg">{getTypeIcon()}</span>}
            <h3 className="text-lg font-bold text-white tracking-wide">
              {task.name}
            </h3>
          </div>

          {/* 已完成时的详情显示 */}
          {task.status === 'completed' && todayRecord && (
            <div className="bg-slate-700/50 rounded-lg p-2 text-sm">
              {task.type === 'check+text' && todayRecord.text && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-gray-400">
                    <span>评分:</span>
                    <span className="text-cyan-400">
                      {'★'.repeat(todayRecord.rating || 5)}
                      {'☆'.repeat(5 - (todayRecord.rating || 5))}
                    </span>
                  </div>
                  {todayRecord.text && (
                    <p className="text-gray-300 line-clamp-2">{todayRecord.text}</p>
                  )}
                </div>
              )}
              {task.type === 'number' && todayRecord.value !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">今日数值:</span>
                  <span className="text-cyan-400 font-bold">
                    {todayRecord.value} {task.unit || ''}
                  </span>
                </div>
              )}
              {task.type === 'violation' && (
                <p className="text-red-400">已记录违规</p>
              )}
            </div>
          )}

          {/* 连击显示 */}
          <div className="flex items-center gap-2">
            <div className="yt-streak-counter rounded-md px-2 py-1 flex items-center gap-1.5">
              <span className="yt-flame-icon text-orange-500 text-sm">🔥</span>
              <span className="text-orange-400 font-mono font-bold">
                {task.streak} 日连击
              </span>
            </div>
          </div>

          {/* 目标值显示（number 类型） */}
          {task.type === 'number' && task.targetValue && (
            <div className="text-xs text-gray-400">
              目标: {task.targetValue} {task.unit || ''}
            </div>
          )}

          {/* 完成按钮 */}
          <button
            onClick={handleCompleteClick}
            disabled={isAnimating}
            className={`
              yt-complete-btn mt-2 py-2.5 px-4 rounded-lg font-bold
              ${task.status === 'completed' ? 'yt-btn-uncomplete' : ''}
              ${task.type === 'violation' ? 'bg-red-600 hover:bg-red-700' : ''}
              disabled:opacity-50
              ${isAnimating ? 'yt-button-press' : ''}
            `}
          >
            {getButtonText()}
          </button>
        </div>
      </div>

      {/* check+text 弹窗 */}
      <CheckTextModal
        isOpen={showCheckTextModal}
        taskName={task.name}
        maxLength={task.metadata?.maxLength}
        placeholder={task.metadata?.placeholder}
        onSubmit={handleCheckTextSubmit}
        onClose={() => setShowCheckTextModal(false)}
      />

      {/* number 弹窗 */}
      <NumberModal
        isOpen={showNumberModal}
        taskName={task.name}
        unit={task.unit}
        targetValue={task.targetValue}
        min={task.metadata?.min}
        max={task.metadata?.max}
        step={task.metadata?.step}
        placeholder={task.metadata?.placeholder}
        currentValue={todayRecord?.value}
        onSubmit={handleNumberSubmit}
        onClose={() => setShowNumberModal(false)}
      />

      {/* violation 弹窗 */}
      <ViolationModal
        isOpen={showViolationModal}
        taskName={task.name}
        requireConfirm={task.metadata?.requireConfirm}
        onSubmit={handleViolationSubmit}
        onClose={() => setShowViolationModal(false)}
      />
    </>
  )
}
