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
    <div className="bg-white rounded-[20px] p-2 border border-gray-200 shadow-sm">
      <div className="flex gap-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onSelectStatus(tab.key)}
            className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all ${
              selectedStatus === tab.key
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  selectedStatus === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-700'
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
