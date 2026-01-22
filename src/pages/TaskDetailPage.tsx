import { useParams, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts'
import { useTasks } from '../hooks/useTasks'
import { useLogs } from '../hooks/useLogs'
import { getTaskStats, getNumberTaskStats, getViolationStats, calculateStreak } from '../utils/helpers'
import { TaskProgressRing } from '../components/TaskProgressRing'
import { TaskHeatmap } from '../components/TaskHeatmap'
import { ReadingCards } from '../components/ReadingCards'

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

  // 计算统计数据
  const stats = useMemo(() => {
    if (!task) return null
    const basic = getTaskStats(task.id, taskLogs)
    const streak = calculateStreak(task.id, taskLogs)

    // 本月完成数
    const today = new Date()
    const monthStart = format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd')
    const monthLogs = taskLogs.filter(l => l.date >= monthStart)

    return {
      ...basic,
      streak,
      monthlyCount: monthLogs.length
    }
  }, [task, taskLogs])

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

  const handleDeleteLog = (logId: string) => {
    if (confirm('确定删除这条记录吗？')) {
      removeLog(logId)
    }
  }

  // 渲染统计卡片
  const renderStatCards = () => {
    if (!stats) return null

    const cards = [
      { icon: '📊', title: '总完成', value: stats.totalLogs.toString(), color: 'from-blue-50 to-blue-100', textColor: 'text-blue-600' },
      { icon: '🔥', title: '最长连续', value: `${stats.streak}天`, color: 'from-orange-50 to-orange-100', textColor: 'text-orange-600' },
      { icon: '📅', title: '本月完成', value: stats.monthlyCount.toString(), color: 'from-green-50 to-green-100', textColor: 'text-green-600' },
      { icon: '✨', title: '首次记录', value: stats.firstLog ? format(new Date(stats.firstLog), 'MM/dd') : '-', color: 'from-purple-50 to-purple-100', textColor: 'text-purple-600' },
    ]

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-br ${card.color} rounded-xl p-4 text-center`}
          >
            <div className="text-2xl mb-1">{card.icon}</div>
            <div className={`text-2xl font-bold ${card.textColor}`}>{card.value}</div>
            <div className="text-xs text-gray-600">{card.title}</div>
          </div>
        ))}
      </div>
    )
  }

  // 渲染 number 类型的趋势图和进度环
  const renderNumberStats = () => {
    if (task.type !== 'number') return null
    const numberStats = getNumberTaskStats(task.id, taskLogs)

    if (numberStats.trend.length === 0) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center text-gray-500 mb-4">
          暂无数据记录
        </div>
      )
    }

    return (
      <div className="space-y-4 mb-6">
        {/* 进度环 */}
        {task.initialValue !== undefined && task.targetValue !== undefined && numberStats.currentValue !== null && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <span>🎯</span>
              <span>目标进度</span>
            </h3>
            <TaskProgressRing
              current={numberStats.currentValue}
              initial={task.initialValue}
              target={task.targetValue}
              unit={task.unit}
              color={task.color}
            />
          </div>
        )}

        {/* 趋势折线图 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <span>📈</span>
            <span>趋势变化</span>
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={numberStats.trend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={task.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={task.color} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(new Date(value), 'MM/dd')}
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value) => `${value}${task.unit || ''}`}
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [`${value || 0}${task.unit || ''}`, task.name]}
                labelFormatter={(value) => format(new Date(value), 'MM月dd日')}
                contentStyle={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="none"
                fill="url(#gradient-area)"
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={task.color}
                strokeWidth={3}
                dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: task.color }}
                activeDot={{ r: 6, strokeWidth: 0, fill: task.color }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* 数值统计 */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{numberStats.currentValue}{task.unit}</div>
              <div className="text-xs text-gray-500">当前值</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{numberStats.minValue}{task.unit}</div>
              <div className="text-xs text-gray-500">最小值</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{numberStats.maxValue}{task.unit}</div>
              <div className="text-xs text-gray-500">最大值</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 渲染 check+text 类型的读书卡片墙
  const renderTextStats = () => {
    if (task.type !== 'check+text') return null
    return (
      <div className="mb-6">
        <ReadingCards logs={taskLogs} color={task.color} />
      </div>
    )
  }

  // 渲染 violation 类型的违规统计
  const renderViolationStats = () => {
    if (task.type !== 'violation') return null
    const vStats = getViolationStats(task.id, taskLogs)

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
        <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <span>⚠️</span>
          <span>违规统计</span>
        </h3>
        <div className="text-center mb-4">
          <div className="text-5xl font-bold text-red-500">{vStats.count}</div>
          <div className="text-sm text-gray-500 mt-1">累计违规次数</div>
        </div>

        {vStats.dates.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">违规时间点</h4>
            <div className="flex flex-wrap gap-2">
              {vStats.dates.slice(-10).map((date, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded-full"
                >
                  {format(new Date(date), 'MM/dd')}
                </span>
              ))}
              {vStats.dates.length > 10 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                  +{vStats.dates.length - 10} 更多
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // 渲染年度日历视图（check 类型）
  const renderCheckStats = () => {
    if (task.type !== 'check') return null
    return (
      <div className="mb-6">
        <TaskHeatmap
          logs={taskLogs}
          color={task.color}
          days={365}
          taskName={task.name}
        />
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
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 flex items-center gap-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回
            </button>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white truncate px-4">
              {task.name}
            </h1>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* 任务概览卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${task.color}20` }}
            >
              {task.type === 'check' && '✅'}
              {task.type === 'check+text' && '📝'}
              {task.type === 'number' && '📊'}
              {task.type === 'violation' && '⚠️'}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">{task.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="px-2 py-0.5 text-xs rounded-full"
                  style={{ backgroundColor: `${task.color}20`, color: task.color }}
                >
                  {task.type === 'check' && '打卡'}
                  {task.type === 'check+text' && '记录'}
                  {task.type === 'number' && '数值'}
                  {task.type === 'violation' && '约束'}
                </span>
                <span className="text-xs text-gray-500">
                  {task.startDate} 开始
                </span>
              </div>
            </div>
          </div>

          {/* number 类型显示初始值和目标值 */}
          {task.type === 'number' && (task.initialValue !== undefined || task.targetValue !== undefined) && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-around text-center">
              {task.initialValue !== undefined && (
                <div>
                  <div className="text-sm text-gray-500">初始值</div>
                  <div className="font-bold text-gray-800 dark:text-white">
                    {task.initialValue}{task.unit}
                  </div>
                </div>
              )}
              {task.targetValue !== undefined && (
                <div>
                  <div className="text-sm text-gray-500">目标值</div>
                  <div className="font-bold" style={{ color: task.color }}>
                    {task.targetValue}{task.unit}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 统计卡片 */}
        {renderStatCards()}

        {/* 差异化可视化区域 */}
        {renderNumberStats()}
        {renderTextStats()}
        {renderViolationStats()}
        {renderCheckStats()}

        {/* 记录列表 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span>📋</span>
              <span>记录明细</span>
              <span className="text-sm font-normal text-gray-500">({taskLogs.length})</span>
            </h3>
          </div>

          {taskLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <span className="text-4xl block mb-2">📭</span>
              暂无记录
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {[...taskLogs].reverse().slice(0, 20).map(log => (
                <div
                  key={log.id}
                  className="px-4 py-3 flex justify-between items-start hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 dark:text-white">
                      {format(new Date(log.date), 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
                    </div>
                    {log.text && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {log.text}
                      </div>
                    )}
                    {log.value !== undefined && (
                      <div className="text-sm mt-1" style={{ color: task.color }}>
                        {log.value} {task.unit}
                      </div>
                    )}
                    {log.rating && (
                      <div className="text-yellow-500 text-sm mt-1">
                        {'★'.repeat(log.rating)}{'☆'.repeat(5 - log.rating)}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="ml-2 text-sm text-gray-400 hover:text-red-500 transition-colors p-1"
                  >
                    删除
                  </button>
                </div>
              ))}
              {taskLogs.length > 20 && (
                <div className="px-4 py-3 text-center text-sm text-gray-500">
                  显示最近 20 条，共 {taskLogs.length} 条记录
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
