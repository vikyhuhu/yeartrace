import { useEffect, useState, useRef } from 'react'

interface PlusOneAnimationProps {
  show: boolean
  x?: number
  y?: number
  onComplete?: () => void
}

export function PlusOneAnimation({ show, x = 0, y = 0, onComplete }: PlusOneAnimationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const onCompleteRef = useRef(onComplete)

  // 保持 onComplete 引用最新
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        onCompleteRef.current?.()
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [show])

  if (!isVisible) return null

  return (
    <div
      className="fixed pointer-events-none z-50 text-emerald-500 font-bold text-2xl"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        animation: 'float-up-fade 800ms ease-out forwards',
      }}
    >
      +1
    </div>
  )
}
