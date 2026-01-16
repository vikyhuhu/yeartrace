import type { TaskTemplate, TaskType } from '../types'

export const TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: 'early',
    name: '早起',
    icon: '🌅',
    type: 'check',
    color: '#f59e0b',
  },
  {
    id: 'reading',
    name: '读书',
    icon: '📚',
    type: 'check+text',
    color: '#3b82f6',
  },
  {
    id: 'exercise',
    name: '运动',
    icon: '💪',
    type: 'check+text',
    color: '#10b981',
  },
  {
    id: 'meditation',
    name: '冥想',
    icon: '🧘',
    type: 'check',
    color: '#8b5cf6',
  },
  {
    id: 'weight',
    name: '体重',
    icon: '⚖️',
    type: 'number',
    color: '#ef4444',
    unit: 'kg',
  },
  {
    id: 'no-sugar',
    name: '戒糖',
    icon: '🚫',
    type: 'violation',
    color: '#6366f1',
  },
  {
    id: 'water',
    name: '喝水',
    icon: '💧',
    type: 'number',
    color: '#06b6d4',
    unit: 'ml',
    targetValue: 2000,
  },
  {
    id: 'sleep',
    name: '睡眠',
    icon: '😴',
    type: 'number',
    color: '#8b5cf6',
    unit: '小时',
  },
  {
    id: 'study',
    name: '学习',
    icon: '📖',
    type: 'check+text',
    color: '#f59e0b',
  },
  {
    id: 'run',
    name: '跑步',
    icon: '🏃',
    type: 'number',
    color: '#10b981',
    unit: 'km',
  },
]

/**
 * 获取任务类型的显示名称
 */
export function getTaskTypeName(type: TaskType): string {
  const typeNames: Record<TaskType, string> = {
    'check': '完成即记录',
    'check+text': '需输入文本',
    'number': '数值记录',
    'violation': '触犯记录',
  }
  return typeNames[type]
}
