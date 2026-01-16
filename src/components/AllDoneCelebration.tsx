import { useEffect, useState, useRef } from 'react'

interface AllDoneCelebrationProps {
  show: boolean
  onComplete?: () => void
}

export function AllDoneCelebration({ show, onComplete }: AllDoneCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        onCompleteRef.current?.()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [show])

  if (!isVisible) return null

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="animate-fade-in-out bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-full px-6 py-3 shadow-lg flex items-center gap-2">
        <span className="text-2xl">🎉</span>
        <span className="text-sm font-semibold text-amber-700">今日全勤</span>
      </div>
    </div>
  )
}
