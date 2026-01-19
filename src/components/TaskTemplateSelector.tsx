import { useState } from 'react'
import { TASK_TEMPLATES, getTaskTypeName } from '../constants/taskTemplates'
import type { TaskTemplate, TaskType } from '../types'

interface TaskTemplateSelectorProps {
  onSelect: (template: TaskTemplate) => void
  onCustom: () => void
  onClose: () => void
}

export function TaskTemplateSelector({ onSelect, onCustom, onClose }: TaskTemplateSelectorProps) {
  const [selectedType, setSelectedType] = useState<TaskType | 'all'>('all')

  const filteredTemplates = TASK_TEMPLATES.filter(t =>
    selectedType === 'all' || t.type === selectedType
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">选择任务模板</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 类型筛选 */}
        <div className="flex gap-2 p-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              selectedType === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setSelectedType('check')}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              selectedType === 'check'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            完成即记录
          </button>
          <button
            onClick={() => setSelectedType('check+text')}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              selectedType === 'check+text'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            需输入文本
          </button>
          <button
            onClick={() => setSelectedType('number')}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              selectedType === 'number'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            数值记录
          </button>
          <button
            onClick={() => setSelectedType('violation')}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              selectedType === 'violation'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            触犯记录
          </button>
        </div>

        {/* 模板网格 */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredTemplates.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              没有找到相关模板
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => onSelect(template)}
                  className="group relative bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-[20px] p-4 text-center transition-all border-2 border-transparent hover:border-blue-300 card-modern"
                >
                  <div className="text-3xl mb-2">{template.icon}</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {template.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {getTaskTypeName(template.type)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 底部自定义按钮 */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onCustom}
            className="w-full py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
          >
            自定义任务
          </button>
        </div>
      </div>
    </div>
  )
}
