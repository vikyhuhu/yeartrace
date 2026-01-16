import { useParams, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useTasks } from '../hooks/useTasks'
import { useLogs } from '../hooks/useLogs'
import { getTaskStats, getNumberTaskStats, getViolationStats } from '../utils/helpers'
import { Timeline } from '../components/Timeline'

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tasks, getTask } = useTasks()
  const { logs, removeLog } = useLogs()

  const task = useMemo(() => (id ? getTask(id) : null), [id, tasks, getTask])

  const taskLogs = useMemo(() => {
    if (!task) return []
    return logs.filter(l => l.taskId === task.id).sort((a, b) => a.date.localeCompare(b.date))
  }, [logs, task])

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">任务不存在</p>
          <button
            onClick={() => navigate('/tasks')}
            className="text-blue-600 hover:underline"
          >
            返回任务列表
          </button>
        </div>
      </div>
    )
  }

  const stats = getTaskStats(task.id, taskLogs)

  const handleDeleteLog = (logId: string) => {
    if (confirm('确定删除这条记录吗？')) {
      removeLog(logId)
    }
  }

  const renderStats = () => {
    if (task.type === 'number') {
      const numberStats = getNumberTaskStats(task.id, taskLogs)

      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-4">
          <h3 className="font-bold mb-3">数据统计</h3>
                          {numberStats.currentValue !== null && (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {numberStats.currentValue}
                  <span className="text-sm text-gray-500 ml-1">{task.unit}</span>
                </div>
                <div className="text-sm text-gray-500">当前值</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {numberStats.minValue}
                  <span className="text-sm text-gray-500 ml-1">{task.unit}</span>
                </div>
                <div className="text-sm text-gray-500">最小值</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {numberStats.maxValue}
                  <span className="text-sm text-gray-500 ml-1">{task.unit}</span>
                </div>
                <div className="text-sm text-gray-500">最大值</div>
              </div>
            </div>
          )}

          {/* 折线图 */}
          {numberStats.trend.length > 1 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">趋势图</h4>
              <div className="h-32 flex items-end gap-1">
                {numberStats.trend.map((point, idx) => {
                  const min = numberStats.minValue!
                  const max = numberStats.maxValue!
                  const range = max - min || 1
                  const height = ((point.value - min) / range) * 100

                  return (
                    <div
                      key={`${point.date}-${idx}`}
                      className="flex-1 bg-blue-400 hover:bg-blue-500 rounded-t transition-colors"
                      style={{ height: `${height}%` }}
                      title={`${point.date}: ${point.value}${task.unit}`}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )
    }

    if (task.type === 'violation') {
      const vStats = getViolationStats(task.id, taskLogs)

      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-4">
          <h3 className="font-bold mb-3">违规统计</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{vStats.count}</div>
            <div className="text-sm text-gray-500">累计违规次数</div>
          </div>
        </div>
      )
    }

    // check / check+text
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-4">
        <h3 className="font-bold mb-3">完成统计</h3>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{stats.totalLogs}</div>
          <div className="text-sm text-gray-500">累计完成次数</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400"
            >
              ← 返回
            </button>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white truncate px-4">
              {task.name}
            </h1>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* 任务基本信息 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: task.color }}
            />
            <div>
              <div className="font-bold text-lg">{task.name}</div>
              <div className="text-sm text-gray-500">
                {task.type} · {task.startDate} 开始
                {task.endDate && ` · ${task.endDate} 结束`}
              </div>
            </div>
          </div>

          {task.type === 'number' && (
            <div className="text-sm text-gray-600">
              {task.initialValue !== undefined && (
                <span>初始: {task.initialValue}{task.unit}</span>
              )}
              {task.targetValue !== undefined && (
                <span className="ml-3">目标: {task.targetValue}{task.unit}</span>
              )}
            </div>
          )}
        </div>

        {/* 统计信息 */}
        {renderStats()}

        {/* 时间轴 */}
        {taskLogs.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-4">
            <h3 className="font-bold mb-3">时间轴</h3>
            <Timeline
              tasks={[task]}
              logs={taskLogs}
              days={taskLogs.length > 30 ? taskLogs.length : 30}
              endDate={stats.lastLog || undefined}
            />
          </div>
        )}

        {/* 记录列表 */}
        <div>
          <h3 className="font-bold mb-3">记录明细</h3>

          {taskLogs.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center text-gray-500">
              暂无记录
            </div>
          ) : (
            <div className="space-y-2">
              {taskLogs.map(log => (
                <div
                  key={log.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">
                      {format(new Date(log.date), 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
                    </div>
                    {log.text && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">{log.text}</div>
                    )}
                    {log.value !== undefined && (
                      <div className="text-sm text-gray-600">
                        {log.value} {task.unit}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="text-sm text-red-600 hover:text-red-700 px-2 py-1"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
