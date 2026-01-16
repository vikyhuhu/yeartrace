import { useState, useEffect } from 'react'

interface BookReadingModalProps {
  isOpen: boolean
  bookName?: string
  rating?: number
  note?: string
  onSave: (bookName: string, rating: number, note?: string) => void
  onCancel: () => void
}

// 书籍类型标签
const BOOK_TYPES = ['【漫画】', '【小说】', '【文学】', '【历史】', '【传记】', '【经管】', '【心理】']

export function BookReadingModal({
  isOpen,
  bookName: initialBookName = '',
  rating: initialRating = 0,
  note: initialNote = '',
  onSave,
  onCancel,
}: BookReadingModalProps) {
  const [bookName, setBookName] = useState('')
  const [rating, setRating] = useState(0)
  const [note, setNote] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [isCustomType, setIsCustomType] = useState(false)
  const [customType, setCustomType] = useState('')

  useEffect(() => {
    if (isOpen) {
      setBookName(initialBookName)
      setRating(initialRating)
      setNote(initialNote)
      setHasChanges(false)
      setIsCustomType(false)
      setCustomType('')

      // 重置类型选择
      setSelectedType(null)

      // 检测已有的书籍类型
      for (const type of BOOK_TYPES) {
        if (initialBookName.includes(type)) {
          setSelectedType(type)
          setIsCustomType(false)
          break
        }
      }
      // 如果不是预定义类型，可能是自定义类型
      const match = initialBookName.match(/【(.+?)】/)
      if (match && !BOOK_TYPES.includes(`【${match[1]}】`)) {
        setSelectedType(`【${match[1]}】`)
        setCustomType(match[1])
        setIsCustomType(true)
      }
    }
  }, [isOpen, initialBookName, initialRating, initialNote])

  const handleSave = () => {
    let finalType = selectedType
    if (isCustomType && customType.trim()) {
      finalType = `【${customType.trim()}】`
    }

    const finalBookName = finalType
      ? `${finalType}${bookName}`
      : bookName

    if (finalBookName.trim() && rating > 0) {
      onSave(finalBookName.trim(), rating, note.trim() || undefined)
      resetForm()
    }
  }

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('有未保存的内容，确定要关闭吗？')) {
        resetForm()
        onCancel()
      }
    } else {
      resetForm()
      onCancel()
    }
  }

  const resetForm = () => {
    setBookName('')
    setRating(0)
    setNote('')
    setSelectedType(null)
    setHasChanges(false)
    setIsCustomType(false)
    setCustomType('')
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

  // 星级评分渲染
  const renderStars = () => {
    return (
      <div className="flex gap-1 justify-center">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => {
              setRating(star)
              setHasChanges(true)
            }}
            className="text-2xl transition-transform hover:scale-110 focus:outline-none"
          >
            {star <= rating ? (
              // 实心星
              <svg className="w-8 h-8 text-amber-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ) : (
              // 空心星
              <svg className="w-8 h-8 text-gray-300 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
          </button>
        ))}
      </div>
    )
  }

  // 添加快捷标签
  const handleAddTag = (tag: string) => {
    if (tag === '其它') {
      setIsCustomType(true)
      setSelectedType('【其它】')
    } else {
      setIsCustomType(false)
      setSelectedType(tag)
    }
    setHasChanges(true)
  }

  if (!isOpen) return null

  // 提取书名（去掉类型标签）
  const getDisplayBookName = () => {
    let name = bookName
    if (selectedType) {
      name = name.replace(selectedType, '')
    }
    return name
  }

  const displayBookName = getDisplayBookName()

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 sm:items-center p-4 modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 modal-slide-up sm:modal-fade-in relative"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">今日阅读</h3>

        {/* 书籍类型选择 */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">书籍类型</label>
          <div className="flex flex-wrap gap-2">
            {BOOK_TYPES.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => handleAddTag(type)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                  selectedType === type && !isCustomType
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                }`}
              >
                {type.replace('【', '').replace('】', '')}
              </button>
            ))}
            {/* 其它/自定义类型 */}
            <button
              type="button"
              onClick={() => handleAddTag('其它')}
              className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                selectedType === '【其它】' || (isCustomType && selectedType === '【其它】')
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                }`}
            >
              其它
            </button>
          </div>
          {/* 自定义类型输入框 */}
          {isCustomType && (
            <div className="mt-2">
              <input
                type="text"
                value={customType}
                onChange={e => {
                  setCustomType(e.target.value)
                  setHasChanges(true)
                }}
                placeholder="输入类型（如：科幻、诗歌...）"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={10}
              />
              <div className="text-xs text-gray-400 mt-1">
                将自动添加方括号，如输入"科幻"会显示为【科幻】
              </div>
            </div>
          )}
        </div>

        {/* 书名输入 */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            书名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={displayBookName}
            onChange={e => {
              setBookName(e.target.value)
              setHasChanges(true)
            }}
            placeholder="输入书名"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
            autoFocus
          />
        </div>

        {/* 星级评分 */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            评分 <span className="text-red-500">*</span>
          </label>
          {renderStars()}
          {rating > 0 && (
            <div className="text-center text-sm text-gray-500 mt-1">
              {rating === 5 && '非常棒！'}
              {rating === 4 && '很不错的书'}
              {rating === 3 && '还行'}
              {rating === 2 && '一般般'}
              {rating === 1 && '不太推荐'}
            </div>
          )}
        </div>

        {/* 备注输入 */}
        <div className="mb-5">
          <label className="text-sm font-medium text-gray-700 mb-2 block">备注（可选）</label>
          <textarea
            value={note}
            onChange={e => {
              setNote(e.target.value)
              setHasChanges(true)
            }}
            placeholder="写点什么..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
          />
        </div>

        {/* 预览 */}
        {(displayBookName || rating > 0) && (
          <div className="bg-blue-50 rounded-xl p-3 mb-4">
            <div className="text-xs text-gray-500 mb-1">预览：</div>
            <div className="text-sm text-gray-800">
              {(() => {
                let typeDisplay = '【类型】'
                if (selectedType) {
                  if (isCustomType && customType.trim()) {
                    typeDisplay = `【${customType.trim()}】`
                  } else {
                    typeDisplay = selectedType
                  }
                }
                return typeDisplay
              })()}
              {displayBookName || '书名'}{' '}
              <span className="text-amber-500">
                {'⭐️'.repeat(rating || 0)}
              </span>
            </div>
          </div>
        )}

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
            disabled={!displayBookName.trim() || rating === 0}
            className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
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
