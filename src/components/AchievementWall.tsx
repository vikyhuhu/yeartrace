import { useMemo } from 'react'
import { checkAchievementStatus, ACHIEVEMENT_DEFINITIONS } from '../utils/achievements'
import { AchievementBadge } from './AchievementBadge'
import type { Task, Log } from '../types'

interface AchievementWallProps {
  year: number
  logs: Log[]
  tasks: Task[]
}

export function AchievementWall({ year, logs, tasks }: AchievementWallProps) {
  const achievementStatus = useMemo(() => {
    // 只显示当年的成就
    const relevantAchievements = ACHIEVEMENT_DEFINITIONS.filter(a => {
      if (a.category === 'perfect') {
        // 月度全勤只显示当年的
        return a.condition.type === 'monthly_perfect' && a.condition.year === year
      }
      return true
    })

    return checkAchievementStatus(relevantAchievements, logs, tasks)
  }, [year, logs, tasks])

  // 按类别分组
  const groupedAchievements = useMemo(() => {
    const grouped = {
      streak: achievementStatus.filter(s => s.achievement.category === 'streak'),
      total: achievementStatus.filter(s => s.achievement.category === 'total'),
      perfect: achievementStatus.filter(s => s.achievement.category === 'perfect'),
      special: achievementStatus.filter(s => s.achievement.category === 'special'),
    }
    return grouped
  }, [achievementStatus])

  const unlockedCount = achievementStatus.filter(s => s.isUnlocked).length
  const totalCount = achievementStatus.length

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg border border-amber-200 dark:border-gray-700">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <h3 className="font-bold text-gray-800 dark:text-white text-lg">成就徽章</h3>
        </div>
        <div className="bg-white/60 dark:bg-gray-700/60 px-3 py-1 rounded-full">
          <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
            已解锁 {unlockedCount} / {totalCount}
          </span>
        </div>
      </div>

      {/* 连续打卡类 */}
      {groupedAchievements.streak.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🔥</span>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">连续打卡</h4>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {groupedAchievements.streak.map(status => (
              <AchievementBadge key={status.achievement.id} status={status} />
            ))}
          </div>
        </div>
      )}

      {/* 总次数类 */}
      {groupedAchievements.total.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🎯</span>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">累计成就</h4>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {groupedAchievements.total.map(status => (
              <AchievementBadge key={status.achievement.id} status={status} />
            ))}
          </div>
        </div>
      )}

      {/* 月度全勤类 */}
      {groupedAchievements.perfect.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">⭐</span>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">月度全勤</h4>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {groupedAchievements.perfect.map(status => (
              <AchievementBadge key={status.achievement.id} status={status} />
            ))}
          </div>
        </div>
      )}

      {/* 空状态 */}
      {achievementStatus.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">🏆</div>
          <p>暂无成就，开始打卡吧！</p>
        </div>
      )}
    </div>
  )
}
