import type { Task, TaskStatus } from '../types'

interface TaskStatusTabsProps {
  tasks: Task[]
  selectedStatus: TaskStatus | 'all'
  onSelectStatus: (status: TaskStatus | 'all') => void
}

export function TaskStatusTabs({ tasks, selectedStatus, onSelectStatus }: TaskStatusTabsProps) {
  const activeCount = tasks.filter(t => t.status === 'active').length
  const pausedCount = tasks.filter(t => t.status === 'paused').length
  const endedCount = tasks.filter(t => t.status === 'ended').length
  const totalCount = tasks.length

  const tabs = [
    { key: 'all' as const, label: '全部', count: totalCount },
    { key: 'active' as const, label: '进行中', count: activeCount },
    { key: 'paused' as const, label: '已暂停', count: pausedCount },
    { key: 'ended' as const, label: '已完成', count: endedCount },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex gap-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onSelectStatus(tab.key)}
            className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all ${
              selectedStatus === tab.key
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  selectedStatus === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                {tab.count}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
