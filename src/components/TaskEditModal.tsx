import { useState, useEffect, useRef } from 'react'
import type { YTTask, TaskType } from '../types/yeartrace'

interface TaskEditModalProps {
  isOpen: boolean
  task: YTTask | null
  onSave: (taskId: string, updates: {
    name?: string
    type?: TaskType
    color?: string
    unit?: string
    targetValue?: number
    metadata?: { min?: number; max?: number; step?: number; placeholder?: string; maxLength?: number }
  }) => void
  onClose: () => void
}

const TASK_TYPES: Array<{ value: TaskType; label: string; icon: string; description: string }> = [
  { value: 'check', label: '打卡', icon: '✅', description: '点击即可完成任务' },
  { value: 'check+text', label: '打卡+记录', icon: '📝', description: '完成后填写文本和评分' },
  { value: 'number', label: '数值', icon: '🔢', description: '记录数值（如运动时长、阅读页数）' },
  { value: 'violation', label: '违规', icon: '⚠️', description: '记录违规情况' },
]

export function TaskEditModal({ isOpen, task, onSave, onClose }: TaskEditModalProps) {
  const [name, setName] = useState('')
  const [taskType, setTaskType] = useState<TaskType>('check')
  const [color, setColor] = useState('')
  const [unit, setUnit] = useState('')
  const [targetValue, setTargetValue] = useState('')
  const [nameError, setNameError] = useState('')
  const nameInputRef = useRef<HTMLInputElement>(null)

  // 初始化表单数据
  useEffect(() => {
    if (task) {
      setName(task.name)
      setTaskType(task.type)
      setColor(task.color || '')
      setUnit(task.unit || '')
      setTargetValue(task.targetValue?.toString() || '')
      setNameError('')
    }
  }, [task])

  // 打开时自动聚焦
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => nameInputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // 验证名称
  const validateName = (value: string): string => {
    if (!value.trim()) return '任务名称不能为空'
    if (value.length > 20) return '任务名称不能超过 20 个字符'
    return ''
  }

  // 保存处理
  const handleSave = () => {
    if (!task) return

    const nameErr = validateName(name)

    setNameError(nameErr)

    if (nameErr) return

    const updates: {
      name?: string
      type?: TaskType
      color?: string
      unit?: string
      targetValue?: number
    } = {
      name: name.trim(),
      type: taskType,
    }

    if (color) updates.color = color
    if (unit) updates.unit = unit
    if (taskType === 'number' && targetValue) updates.targetValue = parseFloat(targetValue)

    onSave(task.id, updates)
  }

  // 键盘处理
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !nameError) {
      handleSave()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen || !task) return null

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
        <h2 className="text-xl font-bold text-white mb-6">编辑任务</h2>

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
              className={`w-full px-4 py-2.5 rounded-lg bg-slate-700 border ${
                nameError ? 'border-red-500' : 'border-slate-600'
              } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition`}
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
                  className={`
                    p-3 rounded-lg border-2 transition text-left
                    ${taskType === type.value
                      ? 'border-cyan-500 bg-cyan-900/30'
                      : 'border-slate-600 bg-slate-700/50 hover:bg-slate-700'
                    }
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
                className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
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
                className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              />
              <p className="mt-1 text-xs text-gray-500">
                用于计算进度百分比
              </p>
            </div>
          )}

          {/* 颜色选择（所有类型） */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              卡片颜色（可选）
            </label>
            <div className="flex gap-2">
              {[
                { value: '', label: '默认' },
                { value: 'from-red-400 to-red-500', label: '红' },
                { value: 'from-orange-400 to-orange-500', label: '橙' },
                { value: 'from-yellow-400 to-yellow-500', label: '黄' },
                { value: 'from-green-400 to-green-500', label: '绿' },
                { value: 'from-blue-400 to-blue-500', label: '蓝' },
                { value: 'from-purple-400 to-purple-500', label: '紫' },
                { value: 'from-pink-400 to-pink-500', label: '粉' },
              ].map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setColor(colorOption.value)}
                  className={`
                    w-8 h-8 rounded-lg transition
                    ${color === colorOption.value
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800'
                      : ''
                    }
                    ${colorOption.value
                      ? `bg-gradient-to-r ${colorOption.value}`
                      : 'bg-slate-600'
                    }
                  `}
                  title={colorOption.label}
                />
              ))}
            </div>
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
            onClick={handleSave}
            disabled={!!nameError}
            className="flex-1 py-2.5 px-4 rounded-lg font-medium text-white bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            保存
          </button>
        </div>

        {/* 快捷键提示 */}
        <p className="mt-4 text-center text-xs text-gray-500">
          Enter 保存 · Esc 取消
        </p>
      </div>
    </div>
  )
}
