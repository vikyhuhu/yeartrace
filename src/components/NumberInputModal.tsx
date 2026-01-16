import { useState, useEffect } from 'react'

interface NumberInputModalProps {
  isOpen: boolean
  title: string
  unit?: string
  initialValue?: number
  targetValue?: number
  onSave: (value: number) => void
  onCancel: () => void
}

export function NumberInputModal({
  isOpen,
  title,
  unit = '',
  initialValue,
  targetValue,
  onSave,
  onCancel,
}: NumberInputModalProps) {
  const [value, setValue] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue?.toString() || '')
      setHasUnsavedChanges(false)
    }
  }, [isOpen, initialValue])

  // 验证输入是否为有效数字
  const isValidNumber = (str: string): boolean => {
    if (!str) return false
    const num = parseFloat(str)
    return !isNaN(num) && num > 0
  }

  const handleSave = () => {
    if (isValidNumber(value)) {
      const numValue = parseFloat(value)
      onSave(numValue)
      setValue('')
      setHasUnsavedChanges(false)
    }
  }

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (confirm('有未保存的输入，确定要关闭吗？')) {
        setValue('')
        setHasUnsavedChanges(false)
        onCancel()
      }
    } else {
      setValue('')
      onCancel()
    }
  }

  const handleBackdropClick = () => {
    handleCancel()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel()
    } else if (e.key === 'Enter') {
      handleSave()
    }
  }

  // 只允许数字和小数点
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    // 允许：空字符串、数字、小数点
    if (newValue === '' || /^\d*\.?\d*$/.test(newValue)) {
      setValue(newValue)
      setHasUnsavedChanges(true)
    }
  }

  // 计算差距
  const getDiffInfo = () => {
    if (!isValidNumber(value) || targetValue === undefined) return null
    const current = parseFloat(value)
    const diff = current - targetValue

    if (Math.abs(diff) < 0.01) {
      return { text: '已达成！', color: 'text-emerald-600' }
    } else if (diff > 0) {
      return { text: `还差 ${diff.toFixed(1)}${unit}`, color: 'text-amber-600' }
    } else {
      return { text: `超出 ${Math.abs(diff).toFixed(1)}${unit}`, color: 'text-red-500' }
    }
  }

  const diffInfo = getDiffInfo()

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 sm:items-center p-4 modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 modal-slide-up sm:modal-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

        {/* 大号数字输入框 */}
        <div className="mb-4">
          <input
            type="text"
            inputMode="decimal"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="0.0"
            className="w-full text-4xl font-bold text-center border-2 border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder:text-gray-400"
            autoFocus
          />
          {unit && (
            <div className="text-center text-sm text-gray-400 mt-2">单位：{unit}</div>
          )}
        </div>

        {/* 显示当前值和目标信息 */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          {isValidNumber(value) && (
            <div className="text-center mb-2">
              <span className="text-sm text-gray-500">当前值：</span>
              <span className="text-xl font-semibold text-gray-900 ml-1">
                {parseFloat(value).toFixed(1)}{unit}
              </span>
            </div>
          )}

          {targetValue !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">目标：{targetValue}{unit}</span>
              {diffInfo && (
                <span className={`font-medium ${diffInfo.color}`}>
                  {diffInfo.text}
                </span>
              )}
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-900 font-medium rounded-xl hover:bg-gray-100 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!isValidNumber(value)}
            className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
          >
            确认
          </button>
        </div>

        {/* 提示文字 */}
        <div className="text-center text-xs text-gray-400 mt-3">
          Enter 保存 · Esc 取消
        </div>
      </div>
    </div>
  )
}
