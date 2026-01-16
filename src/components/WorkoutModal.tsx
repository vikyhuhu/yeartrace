import { useState, useEffect } from 'react'

interface WorkoutModalProps {
  isOpen: boolean
  initialValue?: string
  onSave: (content: string) => void
  onCancel: () => void
}

// 常用训练类型快捷标签
const WORKOUT_TYPES = [
  '力量训练',
  '有氧运动',
  'HIIT',
  '瑜伽',
  '拉伸',
  '跑步',
  '游泳',
  '骑行',
]

export function WorkoutModal({
  isOpen,
  initialValue = '',
  onSave,
  onCancel,
}: WorkoutModalProps) {
  const [content, setContent] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setContent(initialValue)
      setSelectedTags([])
      setHasChanges(false)
    }
  }, [isOpen, initialValue])

  const handleSave = () => {
    if (content.trim()) {
      onSave(content.trim())
      setContent('')
      setSelectedTags([])
      setHasChanges(false)
    }
  }

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('有未保存的内容，确定要关闭吗？')) {
        setContent('')
        setSelectedTags([])
        setHasChanges(false)
        onCancel()
      }
    } else {
      setContent('')
      setSelectedTags([])
      onCancel()
    }
  }

  const handleBackdropClick = () => {
    handleCancel()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel()
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave()
    }
  }

  // 添加快捷标签
  const handleAddTag = (tag: string) => {
    const newContent = content ? `${content} ${tag}` : tag
    setContent(newContent)
    setSelectedTags([...selectedTags, tag])
    setHasChanges(true)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 sm:items-center p-4 modal-backdrop overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 my-auto modal-slide-up sm:modal-fade-in"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">今日训练</h3>

        {/* 快捷标签 */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">快捷添加</label>
          <div className="flex flex-wrap gap-2">
            {WORKOUT_TYPES.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => handleAddTag(type)}
                className="px-3 py-1.5 text-sm rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                + {type}
              </button>
            ))}
          </div>
        </div>

        {/* 训练内容输入 */}
        <div className="mb-5">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            训练内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={e => {
              setContent(e.target.value)
              setHasChanges(true)
            }}
            placeholder="记录今天的训练内容，如：卧推 60kg x 8次 x 4组..."
            rows={6}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
            autoFocus
          />
          <div className="text-xs text-gray-400 mt-1">
            提示：可以记录训练项目、重量、组数、次数等
          </div>
        </div>

        {/* 字数统计 */}
        <div className="text-right text-xs text-gray-400 mb-4">
          {content.length} 字
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-900 font-medium rounded-xl hover:bg-gray-100 transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!content.trim()}
            className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
          >
            完成
          </button>
        </div>

        {/* 提示文字 */}
        <div className="text-center text-xs text-gray-400 mt-3">
          Ctrl+Enter 保存 · Esc 取消
        </div>
      </div>
    </div>
  )
}
