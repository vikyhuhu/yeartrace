import { useState, useEffect, useRef } from 'react'
import { useSoundEffects } from '../utils/soundEffects'

interface NumberModalProps {
  isOpen: boolean
  taskName: string
  unit?: string
  targetValue?: number
  min?: number
  max?: number
  step?: number
  placeholder?: string
  currentValue?: number
  onSubmit: (value: number) => void
  onClose: () => void
}

export function NumberModal({
  isOpen,
  taskName,
  unit = '',
  targetValue,
  min = 0,
  max,
  step = 1,
  placeholder = '请输入数值',
  currentValue,
  onSubmit,
  onClose,
}: NumberModalProps) {
  const { play } = useSoundEffects()
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // 当弹窗打开时，聚焦到输入框
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // 重置表单
  useEffect(() => {
    if (!isOpen) {
      setValue('')
    } else if (currentValue !== undefined) {
      setValue(currentValue.toString())
    }
  }, [isOpen, currentValue])

  const handleSubmit = () => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= min) {
      if (max === undefined || numValue <= max) {
        play('complete')
        onSubmit(numValue)
      }
    }
  }

  const handleQuickAdd = (delta: number) => {
    play('click')
    const currentValue = parseFloat(value) || 0
    const newValue = currentValue + delta
    if (newValue >= min && (max === undefined || newValue <= max)) {
      setValue(newValue.toString())
    }
  }

  const isValid = (() => {
    const numValue = parseFloat(value)
    return !isNaN(numValue) && numValue >= min && (max === undefined || numValue <= max)
  })()

  // 计算进度百分比
  const progress = (() => {
    if (targetValue === undefined) return null
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return 0
    return Math.min(100, Math.max(0, (numValue / targetValue) * 100))
  })()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 弹窗 */}
      <div className="relative bg-slate-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-slate-700">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white">{taskName}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-gray-400 hover:text-white transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 内容区 */}
        <div className="p-4 space-y-4">
          {/* 数值输入区 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              今日数值
            </label>
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="number"
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder={placeholder}
                min={min}
                max={max}
                step={step}
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {unit && (
                <span className="text-gray-400 font-medium min-w-fit">{unit}</span>
              )}
            </div>

            {/* 快速加减按钮 */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleQuickAdd(-step)}
                className="flex-1 py-1.5 px-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-300 transition"
              >
                -{step}
              </button>
              <button
                onClick={() => handleQuickAdd(step)}
                className="flex-1 py-1.5 px-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-300 transition"
              >
                +{step}
              </button>
            </div>

            {/* 范围提示 */}
            {(min > 0 || max !== undefined) && (
              <div className="text-xs text-gray-500 mt-1">
                范围: {min} ~ {max ?? '∞'}
              </div>
            )}
          </div>

          {/* 目标进度 */}
          {targetValue !== undefined && progress !== null && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">目标进度</span>
                <span className="text-gray-300">{progress.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {parseFloat(value) > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  {parseFloat(value).toFixed(1)} / {targetValue} {unit}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 按钮区 */}
        <div className="flex gap-3 p-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-lg font-medium text-gray-300 bg-slate-700 hover:bg-slate-600 transition"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className="flex-1 py-2.5 px-4 rounded-lg font-bold text-white bg-cyan-500 hover:bg-cyan-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            确认完成
          </button>
        </div>
      </div>
    </div>
  )
}
