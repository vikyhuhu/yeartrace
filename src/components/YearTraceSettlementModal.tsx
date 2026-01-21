import { useEffect } from 'react'
import type { YTSettlementData } from '../types/yeartrace'
import { useSoundEffects } from '../utils/soundEffects'

interface YearTraceSettlementModalProps {
  data: YTSettlementData
  onClose: () => void
}

export function YearTraceSettlementModal({ data, onClose }: YearTraceSettlementModalProps) {
  const { play } = useSoundEffects()

  useEffect(() => {
    // 播放结算音效
    play('settlement')
  }, [play])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 yt-backdrop-fade yt-settlement-backdrop"
        onClick={onClose}
      />

      {/* 结算面板 */}
      <div className="yt-settlement-panel yt-settlement-enter relative rounded-2xl p-8 max-w-md w-full">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 标题 */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-cyan-400 tracking-wider">
            MISSION COMPLETE
          </h2>
          <p className="text-gray-400 mt-1">今日任务完成</p>
        </div>

        {/* 内容 */}
        <div className="space-y-6">
          {/* 完成任务数 */}
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">完成进度</p>
            <p className="text-3xl font-bold text-white">
              {data.completedCount} / {data.totalCount}
            </p>
          </div>

          {/* 连击变化 */}
          {data.streakAfter > data.streakBefore && (
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">连击增长</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-orange-400 text-xl">🔥</span>
                <p className="text-2xl font-bold text-orange-400">
                  {data.streakBefore} → {data.streakAfter}
                </p>
              </div>
            </div>
          )}

          {/* 系统评价 */}
          <div className="mt-6 pt-6 border-t border-cyan-900/50">
            <p className="text-center text-cyan-300 tracking-wide">
              「今日任务已全部完成，继续保持。」
            </p>
          </div>
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="yt-complete-btn w-full mt-6 py-3 rounded-lg font-bold"
        >
          关闭
        </button>
      </div>
    </div>
  )
}
