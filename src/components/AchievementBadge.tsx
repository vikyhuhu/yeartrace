import type { AchievementStatus } from '../types'

interface AchievementBadgeProps {
  status: AchievementStatus
}

export function AchievementBadge({ status }: AchievementBadgeProps) {
  const { achievement, isUnlocked, progress, progressMax } = status

  return (
    <div
      className={`
        relative rounded-[20px] p-4 transition-all duration-200
        ${isUnlocked
          ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 shadow-md'
          : 'bg-gray-100 dark:bg-gray-700 border-2 border-transparent'
        }
      `}
      style={{
        boxShadow: isUnlocked
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
          : 'none'
      }}
    >
      {/* 图标 */}
      <div
        className={`
          text-4xl mb-2 text-center
          ${isUnlocked ? 'filter-none' : 'grayscale opacity-30'}
        `}
      >
        {achievement.icon}
      </div>

      {/* 名称 */}
      <div
        className={`
          text-sm font-bold text-center mb-1
          ${isUnlocked ? 'text-gray-800 dark:text-white' : 'text-gray-400'}
        `}
      >
        {achievement.name}
      </div>

      {/* 描述 */}
      <div
        className={`
          text-xs text-center mb-2
          ${isUnlocked ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}
        `}
      >
        {achievement.description}
      </div>

      {/* 进度条 */}
      {progress !== undefined && progressMax !== undefined && !isUnlocked && (
        <div className="mt-2">
          <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${Math.min((progress / progressMax) * 100, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 text-center mt-1">
            {progress} / {progressMax}
          </div>
        </div>
      )}

      {/* 解锁日期 */}
      {isUnlocked && status.unlockedDate && (
        <div className="text-xs text-yellow-600 dark:text-yellow-400 text-center mt-1">
          已解锁 • {new Date(status.unlockedDate).toLocaleDateString()}
        </div>
      )}

      {/* 未解锁标记 */}
      {!isUnlocked && (
        <div className="absolute top-2 right-2">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      )}
    </div>
  )
}
