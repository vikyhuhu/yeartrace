import { useSoundEffects } from '../utils/soundEffects'

interface ViolationModalProps {
  isOpen: boolean
  taskName: string
  requireConfirm?: boolean
  onSubmit: () => void
  onClose: () => void
}

export function ViolationModal({
  isOpen,
  taskName,
  requireConfirm = true,
  onSubmit,
  onClose,
}: ViolationModalProps) {
  const { play } = useSoundEffects()

  const handleConfirm = () => {
    play('complete')
    onSubmit()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 弹窗 */}
      <div className="relative bg-slate-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-red-900/50">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            <h2 className="text-lg font-bold text-white">记录违规</h2>
          </div>
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
          {/* 警告提示 */}
          <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🚫</span>
              <div>
                <p className="text-white font-medium mb-1">确认记录违规？</p>
                <p className="text-gray-400 text-sm">
                  这将记录 <span className="text-red-400 font-medium">{taskName}</span> 的违规情况
                </p>
              </div>
            </div>
          </div>

          {/* 说明文字 */}
          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="text-gray-300 text-sm">
              违规记录不会获得经验值，但会保留在历史记录中以便追踪。
            </p>
            {requireConfirm && (
              <p className="text-orange-400 text-xs mt-2">
                此操作需要二次确认
              </p>
            )}
          </div>

          {/* 违规统计提示（如果有的话） */}
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              坚持记录，保持自律！💪
            </p>
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
            onClick={handleConfirm}
            className="flex-1 py-2.5 px-4 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 transition"
          >
            确认记录
          </button>
        </div>
      </div>
    </div>
  )
}
