import { useState } from 'react'
import type { Task, TaskSortType } from '../types'

interface TaskSortFilterBarProps {
  tasks: Task[]
  selectedSort: TaskSortType
  onSortChange: (sort: TaskSortType) => void
  selectedColor: string | null
  onColorChange: (color: string | null) => void
}

const SORT_OPTIONS: { value: TaskSortType; label: string }[] = [
  { value: 'created', label: '创建时间' },
  { value: 'completed', label: '完成次数' },
  { value: 'lastRecord', label: '最近记录' },
]

export function TaskSortFilterBar({
  tasks,
  selectedSort,
  onSortChange,
  selectedColor,
  onColorChange,
}: TaskSortFilterBarProps) {
  const [showSortDropdown, setShowSortDropdown] = useState(false)

  // 获取任务使用的颜色（去重）
  const usedColors = Array.from(new Set(tasks.map(t => t.color)))

  return (
    <div className="bg-white rounded-[20px] p-4 border border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* 排序选择器 */}
        <div className="relative">
          <label className="text-xs text-gray-600 mb-1 block font-medium">
            排序方式
          </label>
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-900 font-medium transition-colors min-w-[140px]"
          >
            <span>{SORT_OPTIONS.find(o => o.value === selectedSort)?.label}</span>
            <svg
              className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showSortDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSortDropdown(false)}
              />
              <div className="absolute top-full left-0 mt-2 z-20 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden min-w-[140px]">
                {SORT_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSortChange(option.value)
                      setShowSortDropdown(false)
                    }}
                    className={`w-full px-4 py-2 text-left text-sm font-medium transition-colors ${
                      selectedSort === option.value
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 颜色筛选 */}
        <div className="flex-1">
          <label className="text-xs text-gray-600 mb-1 block font-medium">
            颜色筛选
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onColorChange(null)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                !selectedColor
                  ? 'border-blue-500 ring-2 ring-blue-300'
                  : 'border-gray-300 hover:border-gray-400'
              } bg-gradient-to-br from-gray-100 to-gray-300`}
              title="全部颜色"
            >
              <svg className="w-4 h-4 m-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
            {usedColors.map(color => (
              <button
                key={color}
                onClick={() => onColorChange(selectedColor === color ? null : color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  selectedColor === color
                    ? 'border-blue-500 ring-2 ring-blue-300 scale-110'
                    : 'border-transparent hover:border-gray-400 hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* 清除筛选 */}
        {(selectedSort !== 'created' || selectedColor) && (
          <button
            onClick={() => {
              if (selectedSort !== 'created') onSortChange('created')
              if (selectedColor) onColorChange(null)
            }}
            className="self-end px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            重置筛选
          </button>
        )}
      </div>
    </div>
  )
}
