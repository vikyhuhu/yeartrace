import { useMemo } from 'react'

interface TaskProgressRingProps {
  current: number
  initial: number
  target: number
  unit?: string
  color?: string
}

/**
 * 目标进度环组件
 * 用于展示 number 类型任务从初始值到目标值的进度
 */
export function TaskProgressRing({
  current,
  initial,
  target,
  unit = '',
  color = '#10b981'
}: TaskProgressRingProps) {
  const { progress, displayText, isAchieved } = useMemo(() => {
    // 计算进度百分比
    const total = Math.abs(target - initial)
    const achieved = Math.abs(current - initial)
    const progress = total > 0 ? Math.min((achieved / total) * 100, 100) : 0
    const isAchieved = (initial > target) 
      ? current <= target 
      : current >= target

    return {
      progress,
      displayText: `${current}${unit}`,
      isAchieved
    }
  }, [current, initial, target, unit])

  // SVG 圆环参数
  const size = 160
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* 背景圆环 */}
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* 进度圆环 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isAchieved ? '#10b981' : color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
              transition: 'stroke-dashoffset 0.8s ease-out',
            }}
          />
        </svg>

        {/* 中心内容 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-800 dark:text-white">
            {displayText}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {isAchieved ? '🎉 已达成' : `目标 ${target}${unit}`}
          </span>
        </div>
      </div>

      {/* 进度条补充信息 */}
      <div className="mt-4 w-full max-w-[200px]">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>起始 {initial}{unit}</span>
          <span>目标 {target}{unit}</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              backgroundColor: isAchieved ? '#10b981' : color
            }}
          />
        </div>
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
          已完成 <span className="font-bold" style={{ color }}>{progress.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  )
}
