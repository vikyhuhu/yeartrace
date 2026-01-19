import { useEffect, useState, useRef } from 'react'
import { Confetti } from './Confetti'

interface AllDoneCelebrationProps {
  show: boolean
  onComplete?: () => void
}

// 随机鼓励文案
const CELEBRATION_MESSAGES = [
  { emoji: '🎉🏆', text: '今天也是闪闪发光的一天！' },
  { emoji: '⭐✨', text: '太棒了，全部完成！' },
  { emoji: '🌟💪', text: '完美达成，继续保持！' },
  { emoji: '🎊👏', text: '自律的你最优秀！' },
  { emoji: '💫🙌', text: '努力的样子真好看！' },
  { emoji: '🏅🔥', text: '今天也超越了昨天的自己！' },
  { emoji: '✅💯', text: '满分解锁！继续加油！' },
  { emoji: '🌈💖', text: '每一天都是新的开始！' },
  { emoji: '🎯🚀', text: '目标达成，下一个巅峰见！' },
  { emoji: '💪⛽', text: '为坚持的自己鼓掌！' },
]

export function AllDoneCelebration({ show, onComplete }: AllDoneCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [message, setMessage] = useState(CELEBRATION_MESSAGES[0])
  const onCompleteRef = useRef(onComplete)
  const hasTriggeredConfetti = useRef(false)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (show && !hasTriggeredConfetti.current) {
      // 随机选择一条鼓励文案
      const randomIndex = Math.floor(Math.random() * CELEBRATION_MESSAGES.length)
      setMessage(CELEBRATION_MESSAGES[randomIndex])

      setIsVisible(true)
      hasTriggeredConfetti.current = true

      const timer = setTimeout(() => {
        setIsVisible(false)
        onCompleteRef.current?.()
        // 3秒后重置，以便下次可以再次触发
        setTimeout(() => {
          hasTriggeredConfetti.current = false
        }, 500)
      }, 3000)

      return () => clearTimeout(timer)
    } else if (!show) {
      setIsVisible(false)
      hasTriggeredConfetti.current = false
    }
  }, [show])

  if (!isVisible) return null

  return (
    <>
      {/* 五彩纸屑动画 */}
      <Confetti active={true} duration={2500} />

      {/* 庆祝卡片 */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-celebration-pop">
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/30 dark:via-orange-900/30 dark:to-yellow-900/30 backdrop-blur-md border border-amber-200 dark:border-amber-700 rounded-3xl px-8 py-5 shadow-2xl flex items-center gap-4">
          {/* Emoji 组合 */}
          <span className="text-4xl animate-bounce" style={{ animationDelay: '0s' }}>
            {message.emoji.split('')[0]}
          </span>
          <span className="text-4xl animate-bounce" style={{ animationDelay: '0.1s' }}>
            {message.emoji.split('')[1]}
          </span>

          {/* 鼓励文案 */}
          <span className="text-base font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-300 dark:to-orange-300 bg-clip-text text-transparent">
            {message.text}
          </span>

          {/* 装饰星星 */}
          <span className="text-xl animate-pulse">⭐</span>
        </div>

        {/* 装饰光晕 */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 blur-3xl -z-10 rounded-full animate-pulse" />
      </div>
    </>
  )
}
