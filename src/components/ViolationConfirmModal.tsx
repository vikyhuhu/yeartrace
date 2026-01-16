import { useEffect, useState } from 'react'

interface ViolationConfirmModalProps {
  isOpen: boolean
  taskName: string
  onConfirm: () => void
  onCancel: () => void
}

export function ViolationConfirmModal({
  isOpen,
  taskName,
  onConfirm,
  onCancel,
}: ViolationConfirmModalProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
    }
  }, [isOpen])

  const handleConfirm = () => {
    onConfirm()
    setIsAnimating(false)
  }

  const handleCancel = () => {
    setIsAnimating(false)
    // 等待动画完成后调用 onCancel
    setTimeout(() => {
      onCancel()
    }, 150)
  }

  const handleBackdropClick = () => {
    handleCancel()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 sm:items-center p-4 modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 modal-slide-up sm:modal-fade-in ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* 警告图标 */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* 标题 */}
        <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
          确认记录违规？
        </h3>

        {/* 描述文字 */}
        <p className="text-center text-gray-600 mb-6">
          确认要记录"<span className="font-semibold text-red-500">{taskName}</span>"的违规行为吗？
        </p>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-900 font-medium rounded-xl hover:bg-gray-100 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors"
          >
            确认违规
          </button>
        </div>

        {/* 提示文字 */}
        <div className="text-center text-xs text-gray-400 mt-4">
          此记录将显示为违规状态
        </div>
      </div>
    </div>
  )
}
