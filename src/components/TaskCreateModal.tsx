import { useState, useEffect, useRef } from 'react'
import type { TaskType } from '../types/yeartrace'

interface TaskCreateModalProps {
  isOpen: boolean
  onCreate: (name: string, type: TaskType, options?: {
    color?: string
    unit?: string
    targetValue?: number
    startDate?: string
  }) => void
  onClose: () => void
  maxTasks: number
  currentTasksCount: number
}

const TASK_TYPES: Array<{ value: TaskType; label: string; icon: string; description: string }> = [
  { value: 'check', label: '打卡', icon: '✅', description: '点击即可完成任务' },
  { value: 'check+text', label: '打卡+记录', icon: '📝', description: '完成后填写文本和评分' },
  { value: 'number', label: '数值', icon: '🔢', description: '记录数值（如运动时长、阅读页数）' },
  { value: 'violation', label: '违规', icon: '⚠️', description: '记录违规情况' },
]

export function TaskCreateModal({
  isOpen,
  onCreate,
  onClose,
  maxTasks,
  currentTasksCount,
}: TaskCreateModalProps) {
  const [name, setName] = useState('')
  const [taskType, setTaskType] = useState<TaskType>('check')
  const [color, setColor] = useState('')
  const [unit, setUnit] = useState('')
  const [targetValue, setTargetValue] = useState('')
  const [startDate, setStartDate] = useState('')
  const [nameError, setNameError] = useState('')
  const nameInputRef = useRef<HTMLInputElement>(null)

  // 重置表单
  useEffect(() => {
    if (isOpen) {
      setName('')
      setTaskType('check')
      setColor('')
      setUnit('')
      setTargetValue('')
      setStartDate(new Date().toISOString().split('T')[0])
      setNameError('')
      setTimeout(() => nameInputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // 验证名称
  const validateName = (value: string): string => {
    if (!value.trim()) return '任务名称不能为空'
    if (value.length > 20) return '任务名称不能超过 20 个字符'
    return ''
  }

  // 创建处理
  const handleCreate = () => {
    const nameErr = validateName(name)

    setNameError(nameErr)

    if (nameErr) return

    const options: {
      color?: string
      unit?: string
      targetValue?: number
      startDate?: string
    } = {}

    if (color) options.color = color
    if (unit) options.unit = unit
    if (taskType === 'number' && targetValue) options.targetValue = parseFloat(targetValue)
    if (startDate) options.startDate = startDate

    onCreate(name.trim(), taskType, Object.keys(options).length > 0 ? options : undefined)
  }

  // 键盘处理
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !nameError) {
      handleCreate()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  const isAtMax = currentTasksCount >= maxTasks
  const isNumberType = taskType === 'number'
  const showUnitField = isNumberType
  const showTargetValueField = isNumberType

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 弹窗 */}
      <div
        className="relative bg-slate-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-slate-700 max-h-[90vh] overflow-y-auto"
        onKeyDown={handleKeyDown}
      >
        {/* 标题 */}
        <h2 className="text-xl font-bold text-white mb-6">创建新任务</h2>

        {/* 任务数量提示 */}
        <div className="mb-4 px-3 py-2 rounded-lg bg-slate-700/50 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            当前任务数量: <span className="text-cyan-400 font-medium">{currentTasksCount}</span> / {maxTasks}
          </span>
        </div>

        {/* 表单 */}
        <div className="space-y-4">
          {/* 任务名称 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              任务名称
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setNameError(validateName(e.target.value))
              }}
              placeholder="请输入任务名称"
              maxLength={20}
              disabled={isAtMax}
              className={`w-full px-4 py-2.5 rounded-lg bg-slate-700 border ${
                nameError ? 'border-red-500' : 'border-slate-600'
              } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {nameError && (
              <p className="mt-1 text-sm text-red-400">{nameError}</p>
            )}
          </div>

          {/* 任务类型选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              任务类型
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TASK_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setTaskType(type.value)}
                  disabled={isAtMax}
                  className={`
                    p-3 rounded-lg border-2 transition text-left
                    ${taskType === type.value
                      ? 'border-cyan-500 bg-cyan-900/30'
                      : 'border-slate-600 bg-slate-700/50 hover:bg-slate-700'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{type.icon}</span>
                    <span className="font-medium text-white text-sm">{type.label}</span>
                  </div>
                  <p className="text-xs text-gray-400">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 单位（number 类型） */}
          {showUnitField && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                数值单位（可选）
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="如：分钟、页数、公里"
                disabled={isAtMax}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          )}

          {/* 目标值（number 类型） */}
          {showTargetValueField && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                每日目标值（可选）
              </label>
              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="如：30、100、5"
                min={0}
                disabled={isAtMax}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">
                用于计算进度百分比
              </p>
            </div>
          )}

          {/* 开始日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              开始日期
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isAtMax}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* 按钮组 */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-lg font-medium text-gray-300 bg-slate-700 hover:bg-slate-600 transition"
          >
            取消
          </button>
          <button
            onClick={handleCreate}
            disabled={!!nameError || isAtMax}
            className="flex-1 py-2.5 px-4 rounded-lg font-medium text-white bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            创建
          </button>
        </div>

        {/* 快捷键提示 */}
        <p className="mt-4 text-center text-xs text-gray-500">
          Enter 创建 · Esc 取消
        </p>
      </div>
    </div>
  )
}
