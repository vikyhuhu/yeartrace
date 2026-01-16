import { useState, useEffect } from 'react'

interface TextInputModalProps {
  isOpen: boolean
  title: string
  placeholder: string
  initialValue?: string
  onSave: (value: string) => void
  onCancel: () => void
}

export function TextInputModal({ isOpen, title, placeholder, initialValue, onSave, onCancel }: TextInputModalProps) {
  const [value, setValue] = useState('')

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue || '')
    }
  }, [isOpen, initialValue])

  const handleSave = () => {
    if (value.trim()) {
      onSave(value.trim())
      setValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
      setValue('')
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3>

        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-36 border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          autoFocus
        />

        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-gray-400">
            Ctrl+Enter 保存 · Esc 取消
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onCancel()
                setValue('')
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={!value.trim()}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
