import { useState, useEffect, useRef } from 'react'
import { useSoundEffects } from '../utils/soundEffects'

export interface CheckTextData {
  text: string
  rating: number
}

interface CheckTextModalProps {
  isOpen: boolean
  taskName: string
  maxLength?: number
  placeholder?: string
  onSubmit: (data: CheckTextData) => void
  onClose: () => void
}

export function CheckTextModal({
  isOpen,
  taskName,
  maxLength = 200,
  placeholder = '记录今天的想法...',
  onSubmit,
  onClose,
}: CheckTextModalProps) {
  const { play } = useSoundEffects()
  const [text, setText] = useState('')
  const [rating, setRating] = useState(5)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 当弹窗打开时，聚焦到输入框
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isOpen])

  // 重置表单
  useEffect(() => {
    if (!isOpen) {
      setText('')
      setRating(5)
    }
  }, [isOpen])

  const handleSubmit = () => {
    if (text.trim()) {
      play('complete')
      onSubmit({ text: text.trim(), rating })
    }
  }

  const handleRatingClick = (value: number) => {
    play('click')
    setRating(value)
  }

  if (!isOpen) return null

  const textLength = text.length
  const isMaxLengthReached = textLength >= maxLength

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
          {/* 文本输入区 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              今日记录
            </label>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={placeholder}
              maxLength={maxLength}
              rows={4}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            />
            <div className="flex justify-end mt-1">
              <span className={`text-xs ${isMaxLengthReached ? 'text-red-400' : 'text-gray-500'}`}>
                {textLength} / {maxLength}
              </span>
            </div>
          </div>

          {/* 评分区 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              今日评分
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(value => (
                <button
                  key={value}
                  onClick={() => handleRatingClick(value)}
                  className={`w-10 h-10 rounded-lg font-bold transition ${
                    rating >= value
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>很差</span>
              <span>很好</span>
            </div>
          </div>
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
            disabled={!text.trim()}
            className="flex-1 py-2.5 px-4 rounded-lg font-bold text-white bg-cyan-500 hover:bg-cyan-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            确认完成
          </button>
        </div>
      </div>
    </div>
  )
}
