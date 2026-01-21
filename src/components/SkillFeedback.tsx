import { useEffect, useState } from 'react'

interface SkillFeedbackProps {
  show: boolean
  message: string
  x: number
  y: number
  onComplete?: () => void
}

export function SkillFeedback({ show, message, x, y, onComplete }: SkillFeedbackProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      // 1.5秒后自动消失
      const timer = setTimeout(() => {
        setVisible(false)
        onComplete?.()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!visible) return null

  return (
    <div
      className="fixed pointer-events-none z-50 skill-feedback-pop"
      style={{
        left: x,
        top: y - 60,
        transform: 'translateX(-50%)',
      }}
    >
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full shadow-lg">
        <span className="text-sm font-semibold">{message}</span>
      </div>
    </div>
  )
}
