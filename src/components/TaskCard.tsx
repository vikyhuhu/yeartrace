import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Task, Log } from '../types'
import { calculateStreak, getMilestoneText, parseBooksFromLogs, getLast7DaysTrend } from '../utils/helpers'
import { PlusOneAnimation } from './PlusOneAnimation'
import { SkillFeedback } from './SkillFeedback'
import { NumberInputModal } from './NumberInputModal'
import { BookReadingModal } from './BookReadingModal'
import { WorkoutModal } from './WorkoutModal'
import { ViolationConfirmModal } from './ViolationConfirmModal'

// 震动反馈工具函数
function triggerHapticFeedback() {
  if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
    navigator.vibrate(50)
  }
}

interface TaskCardProps {
  task: Task
  date: string
  log: Log | null
  allLogs: Log[]
  onLogCreate: (data: Omit<Log, 'id'>) => void
  onLogUpdate: (id: string, data: Partial<Log>) => void
  onLogDelete: (id: string) => void
}

export function TaskCard({ task, date, log, allLogs, onLogCreate, onLogUpdate, onLogDelete }: TaskCardProps) {
  const navigate = useNavigate()
  const cardRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const [isExpanded, setIsExpanded] = useState(false)
  const [checked, setChecked] = useState(!!log)
  const [pulse, setPulse] = useState(false)
  const [checkmarkAnim, setCheckmarkAnim] = useState(false)
  const [checkboxBounceAnim, setCheckboxBounceAnim] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [selectedBook, setSelectedBook] = useState<string | null>(null)
  const [isCustomInput, setIsCustomInput] = useState(false)

  // 新增：动画状态
  const [showPlusOne, setShowPlusOne] = useState(false)
  const [plusOnePosition, setPlusOnePosition] = useState({ x: 0, y: 0 })
  const [slideInAnim, setSlideInAnim] = useState(false)
  const [buttonScaleAnim, setButtonScaleAnim] = useState(false)
  const [buttonPressed, setButtonPressed] = useState(false)

  // 技能释放动画状态
  const [skillPress, setSkillPress] = useState(false)
  const [skillHit, setSkillHit] = useState(false)
  const [skillComplete, setSkillComplete] = useState(false)

  // 反馈浮层状态
  const [showSkillFeedback, setShowSkillFeedback] = useState(false)
  const [skillFeedbackMsg, setSkillFeedbackMsg] = useState('')
  const [skillFeedbackPos, setSkillFeedbackPos] = useState({ x: 0, y: 0 })

  // 弹窗状态
  const [showNumberModal, setShowNumberModal] = useState(false)
  const [showBookModal, setShowBookModal] = useState(false)
  const [showWorkoutModal, setShowWorkoutModal] = useState(false)
  const [showViolationModal, setShowViolationModal] = useState(false)

  // 解析已有书籍列表（check+text 类型）
  const bookList = useMemo(() => {
    if (task.type !== 'check+text') return []
    const taskLogs = allLogs.filter(l => l.taskId === task.id)
    return parseBooksFromLogs(taskLogs.map(l => ({ ...l, text: l.text || '' })))
  }, [task.id, task.type, allLogs])

  // 计算连续打卡天数（非违规类型任务）
  const streakData = useMemo(() => {
    if (task.type === 'violation') return null
    const streak = calculateStreak(task.id, allLogs, date)
    const milestoneText = getMilestoneText(streak)
    return { streak, milestoneText }
  }, [task.id, allLogs, date, task.type])

  // 计算7天趋势（数值型任务）
  const trendData = useMemo(() => {
    if (task.type !== 'number') return null
    return getLast7DaysTrend(task.id, allLogs, date)
  }, [task.id, allLogs, date, task.type])

  // 游戏化：是否为可记录任务（未完成的非违规任务）
  const isRecordable = !checked && task.type !== 'violation'

  useEffect(() => {
    setChecked(!!log)
  }, [log])

  // 生成情绪化反馈文案
  const getEmotionalFeedback = (): string => {
    // 手动计算新的 streak（因为状态更新是异步的）
    const newStreak = calculateStreak(task.id, allLogs, date) + 1

    // 优先显示里程碑/连续打卡
    if (newStreak >= 3) {
      if (newStreak >= 30) return `连续 ${newStreak} 天！太强了！`
      if (newStreak >= 21) return `连续 ${newStreak} 天！坚持就是胜利`
      if (newStreak >= 14) return `连续 ${newStreak} 天！习惯已养成`
      if (newStreak >= 7) return `连续 ${newStreak} 天！你正在变强`
      if (newStreak >= 3) return `连续 ${newStreak} 天！`
    }

    // 普通鼓励
    const feedbacks = [
      '太棒了！',
      '完成！',
      '不错哦！',
      '继续保持！',
      '又完成了！',
      '做得好！',
    ]
    return feedbacks[Math.floor(Math.random() * feedbacks.length)]
  }

  // 技能释放动画序列
  const triggerSkillRelease = () => {
    // 阶段1：按下瞬间（100ms）
    triggerHapticFeedback()
    setSkillPress(true)
    setTimeout(() => setSkillPress(false), 100)

    // 阶段2：命中瞬间（400ms）
    setTimeout(() => {
      setSkillHit(true)

      // +1 数字弹出
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        setPlusOnePosition({ x: rect.left + rect.width / 2, y: rect.top })
        setShowPlusOne(true)

        // 情绪化反馈浮层
        setSkillFeedbackPos({ x: rect.left + rect.width / 2, y: rect.top })
        setSkillFeedbackMsg(getEmotionalFeedback())
        setShowSkillFeedback(true)
      }
      setTimeout(() => setSkillHit(false), 400)
    }, 100)

    // 阶段3：结算（300ms）
    setTimeout(() => {
      setSkillComplete(true)
      setPulse(true)
      setCheckmarkAnim(true)
      setTimeout(() => setPulse(false), 500)
      setTimeout(() => setCheckmarkAnim(false), 1000)
      setTimeout(() => setSkillComplete(false), 300)
    }, 500)
  }

  // 数字弹窗保存处理
  const handleNumberSave = (value: number) => {
    const wasChecked = checked
    const data: Omit<Log, 'id'> = { taskId: task.id, date, value }
    if (log) {
      onLogUpdate(log.id, data)
    } else {
      onLogCreate(data)
    }
    setChecked(true)
    if (!wasChecked) {
      triggerSkillRelease()
    }
    setShowNumberModal(false)
  }

  // 读书记录弹窗保存处理
  const handleBookSave = (bookName: string, rating: number, note?: string) => {
    const wasChecked = checked
    const text = `${bookName} ${'⭐️'.repeat(rating)}${note ? ` ${note}` : ''}`.trim()
    const data: Omit<Log, 'id'> = { taskId: task.id, date, text }
    if (log) {
      onLogUpdate(log.id, data)
    } else {
      onLogCreate(data)
    }
    setChecked(true)
    if (!wasChecked) {
      triggerSkillRelease()
    }
    setShowBookModal(false)
  }

  // 健身记录弹窗保存处理
  const handleWorkoutSave = (content: string) => {
    const wasChecked = checked
    const text = content
    const data: Omit<Log, 'id'> = { taskId: task.id, date, text }
    if (log) {
      onLogUpdate(log.id, data)
    } else {
      onLogCreate(data)
    }
    setChecked(true)
    if (!wasChecked) {
      triggerSkillRelease()
    }
    setShowWorkoutModal(false)
  }

  // 违规确认处理
  const handleViolationConfirm = () => {
    const wasChecked = checked
    onLogCreate({ taskId: task.id, date })
    setChecked(true)
    // 违规使用简化版动画，不显示鼓励文案
    if (!wasChecked) {
      triggerHapticFeedback()
      setSkillPress(true)
      setTimeout(() => setSkillPress(false), 100)
      setSkillHit(true)
      setTimeout(() => setSkillHit(false), 400)
      setSkillComplete(true)
      setTimeout(() => setSkillComplete(false), 300)
    }
    setShowViolationModal(false)
  }

  // 打开记录弹窗（根据任务类型）
  const openRecordModal = () => {
    // 先触发按下视觉反馈
    setButtonPressed(true)
    triggerHapticFeedback()

    // 延迟 150ms 后再打开弹窗，让用户看到按下效果
    setTimeout(() => {
      setButtonPressed(false)

      if (task.type === 'number') {
        setShowNumberModal(true)
      } else if (task.type === 'check+text') {
        if (task.name === '读书') {
          setShowBookModal(true)
        } else if (task.name === '健身') {
          setShowWorkoutModal(true)
        } else {
          // 其他 check+text 类型使用原有展开方式
          handleExpand()
        }
      } else if (task.type === 'violation') {
        setShowViolationModal(true)
      } else {
        // check 类型直接记录
        handleQuickCheck()
      }
    }, 150)
  }
  const handleExpand = () => {
    if (checked && (task.type === 'check+text' || task.type === 'number')) {
      // 已完成的可编辑任务，展开显示编辑界面
      const existingText = log?.text || ''
      setInputValue(
        task.type === 'number' && log?.value !== undefined
          ? log.value.toString()
          : existingText
      )
      // 对于 check+text，检查是否匹配已有书籍
      if (task.type === 'check+text' && existingText) {
        const matchedBook = bookList.find(b => existingText.startsWith(b.name))
        if (matchedBook) {
          setSelectedBook(matchedBook.name)
          setIsCustomInput(false)
        } else {
          setSelectedBook(null)
          setIsCustomInput(true)
        }
      }
    } else {
      setInputValue('')
      setSelectedBook(null)
      setIsCustomInput(false)
    }
    setIsExpanded(true)
  }

  // 处理记录完成
  const handleComplete = () => {
    const data: Omit<Log, 'id'> = { taskId: task.id, date }

    if (task.type === 'check+text') {
      if (!inputValue.trim()) return
      data.text = inputValue.trim()
    } else if (task.type === 'number') {
      const numValue = parseFloat(inputValue)
      if (isNaN(numValue) || numValue === 0) return
      data.value = numValue
    }

    // 保存记录
    const wasChecked = checked
    if (log && (task.type === 'check+text' || task.type === 'number')) {
      onLogUpdate(log.id, data)
    } else {
      onLogCreate(data)
    }

    setChecked(true)

    // 首次完成触发技能释放动画
    if (!wasChecked) {
      triggerSkillRelease()
    }

    // 收起展开区域
    setIsExpanded(false)
    setInputValue('')
    setSelectedBook(null)
    setIsCustomInput(false)
  }

  // 处理直接打卡（check 类型）
  const handleQuickCheck = () => {
    const newChecked = !checked
    setChecked(newChecked)

    if (newChecked) {
      onLogCreate({ taskId: task.id, date })
      // Checkbox 弹跳动画
      setCheckboxBounceAnim(true)
      setTimeout(() => setCheckboxBounceAnim(false), 400)
      // 触发技能释放动画
      triggerSkillRelease()
    } else {
      if (log) onLogDelete(log.id)
    }
  }

  // 取消展开
  const handleCancel = () => {
    setIsExpanded(false)
    setInputValue('')
    setSelectedBook(null)
    setIsCustomInput(false)
  }

  // 判断是否是违规记录
  const isViolation = task.type === 'violation' && checked

  // 里程碑样式计算
  const milestoneStyle = useMemo(() => {
    if (!streakData || streakData.streak < 3) return null

    const streak = streakData.streak
    if (streak >= 14) return 'ring-2 ring-amber-400 shadow-amber-200/50 shadow-lg bg-gradient-to-r from-amber-50 to-orange-50'
    if (streak >= 7) return 'ring-2 ring-blue-400 shadow-blue-200/50 shadow-md bg-gradient-to-r from-blue-50 to-indigo-50'
    if (streak >= 3) return 'ring-2 ring-emerald-400 shadow-emerald-200/50 shadow-md bg-gradient-to-r from-emerald-50 to-teal-50'
    return null
  }, [streakData])

  // 渲染展开后的输入区域
  const renderExpandedContent = () => {
    // check 类型：直接确认按钮
    if (task.type === 'check') {
      return (
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            取消
          </button>
          <button
            ref={buttonRef}
            onClick={() => {
              // 震动反馈
              triggerHapticFeedback()

              // 按钮缩放动画
              setButtonScaleAnim(true)
              setTimeout(() => setButtonScaleAnim(false), 300)

              onLogCreate({ taskId: task.id, date })

              // 滑入动画
              setSlideInAnim(true)
              setTimeout(() => setSlideInAnim(false), 300)

              // +1 浮动数字
              const rect = buttonRef.current?.getBoundingClientRect()
              if (rect) {
                setPlusOnePosition({ x: rect.left + rect.width / 2, y: rect.top })
                setShowPlusOne(true)
              }

              setChecked(true)
              setPulse(true)
              setCheckmarkAnim(true)
              setTimeout(() => setPulse(false), 500)
              setTimeout(() => setCheckmarkAnim(false), 1000)
              setIsExpanded(false)
            }}
            className={`px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-all duration-200 ${buttonScaleAnim ? 'animate-button-scale' : ''}`}
          >
            完成
          </button>
        </div>
      )
    }

    // check+text 类型：书籍选择或简短文本输入
    if (task.type === 'check+text') {
      const hasBooks = bookList.length > 0

      return (
        <div className="pt-3 border-t border-gray-100">
          {hasBooks && !isCustomInput ? (
            // 书籍选择模式
            <div className="space-y-2">
              <div className="text-xs text-gray-500">选择已读过的书籍</div>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {bookList.slice(0, 6).map(book => (
                  <button
                    key={book.name}
                    onClick={() => {
                      setSelectedBook(book.name)
                      setInputValue(`${book.name}【${book.count + 1}/${book.count + 1}】`)
                    }}
                    className={`
                      text-left px-3 py-2 rounded-lg text-xs border transition-all
                      ${selectedBook === book.name
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="font-medium truncate">{book.name}</div>
                    <div className="text-gray-400 mt-0.5">{book.count}次</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setIsCustomInput(true)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                + 输入新书籍
              </button>
            </div>
          ) : (
            // 自定义输入模式
            <>
              <textarea
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder={hasBooks ? "格式：【类型】书名【序号/总数】评分" : "记录今天的内容..."}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                rows={2}
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Escape') handleCancel()
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleComplete()
                }}
              />
              {hasBooks && (
                <button
                  onClick={() => {
                    setIsCustomInput(false)
                    setSelectedBook(null)
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600 mt-1"
                >
                  ← 返回选择书籍
                </button>
              )}
            </>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">Ctrl+Enter 保存</span>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
              >
                取消
              </button>
              <button
                onClick={handleComplete}
                disabled={!inputValue.trim()}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )
    }

    // number 类型：数字步进器 + 目标进度 + 7天趋势
    if (task.type === 'number') {
      const value = parseFloat(inputValue) || 0
      const step = 0.1
      const { targetValue, unit } = task

      // 目标进度计算
      const progress = targetValue && value > 0 ? Math.min(100, (value / targetValue) * 100) : null
      const isGoalReached = progress !== null && progress >= 100

      // 7天趋势数据
      const trendValues = trendData?.map(d => d.value).filter((v): v is number => v !== undefined) || []
      const hasTrendData = trendValues.length > 0
      const avgTrend = hasTrendData ? trendValues.reduce((a, b) => a + b, 0) / trendValues.length : 0

      return (
        <div className="pt-3 border-t border-gray-100">
          {/* 目标进度条 */}
          {targetValue && (progress !== null) && (
            <div className="mb-3 pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-500">目标进度</span>
                <span className={`text-xs font-semibold ${isGoalReached ? 'text-emerald-600' : 'text-gray-700'}`}>
                  {value.toFixed(1)} / {targetValue}{unit}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isGoalReached ? 'bg-emerald-500' : 'bg-blue-500'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              {!isGoalReached && (
                <div className="text-xs text-gray-400 mt-1">
                  还差 {(targetValue - value).toFixed(1)}{unit}
                </div>
              )}
            </div>
          )}

          {/* 7天趋势迷你图 */}
          {hasTrendData && (
            <div className="mb-3 pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">近7天</span>
                <span className="text-xs text-gray-600">平均 {avgTrend.toFixed(1)}{unit}</span>
              </div>
              <div className="flex items-end gap-1 h-10">
                {trendData!.map((d, i) => {
                  const val = d.value
                  if (val === undefined) return (
                    <div key={i} className="flex-1 bg-gray-100 rounded-sm" style={{ height: '4px' }} />
                  )
                  const maxVal = Math.max(...trendValues, val)
                  const heightPercent = maxVal > 0 ? (val / maxVal) * 100 : 0
                  const isLast = i === trendData!.length - 1

                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-sm transition-all ${isLast ? 'bg-emerald-500' : 'bg-blue-400'}`}
                      style={{ height: `${Math.max(4, heightPercent)}%` }}
                      title={`${d.date}: ${val}${unit}`}
                    />
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{task.name}</span>
            <div className="flex items-center gap-2">
              {/* 减少按钮 */}
              <button
                onClick={() => setInputValue(Math.max(0, value - step).toString())}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600"
              >
                −
              </button>

              {/* 数字输入 */}
              <input
                type="number"
                step={step}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                className="w-20 px-2 py-1 text-center text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Escape') handleCancel()
                  if (e.key === 'Enter') handleComplete()
                }}
              />

              {/* 增加按钮 */}
              <button
                onClick={() => setInputValue((value + step).toFixed(1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600"
              >
                +
              </button>

              <span className="text-sm text-gray-400">{unit}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-3">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
            >
              取消
            </button>
            <button
              onClick={handleComplete}
              disabled={!inputValue || isNaN(parseFloat(inputValue))}
              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      )
    }

    // violation 类型
    if (task.type === 'violation') {
      return (
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            取消
          </button>
          <button
            onClick={() => {
              onLogCreate({ taskId: task.id, date })
              setChecked(true)
              setPulse(true)
              setCheckmarkAnim(true)
              setTimeout(() => setPulse(false), 500)
              setTimeout(() => setCheckmarkAnim(false), 1000)
              setIsExpanded(false)
            }}
            className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            记录违规
          </button>
        </div>
      )
    }

    return null
  }

  // 渲染状态显示
  const renderStatus = () => {
    // violation 类型：约束任务
    if (task.type === 'violation') {
      return checked ? (
        <button
          onClick={() => {
            if (log) onLogDelete(log.id)
          }}
          className="text-gray-400 text-xs font-medium hover:text-gray-600 transition-colors"
        >
          撤销
        </button>
      ) : (
        <button
          ref={buttonRef}
          onClick={openRecordModal}
          className={`px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl shadow-[0_4px_12px_rgba(16,185,129,0.3)] transition-all ${buttonPressed ? 'scale-95 shadow-[0_2px_6px_rgba(16,185,129,0.2)]' : ''} ${buttonScaleAnim ? 'animate-button-scale' : ''}`}
        >
          记录
        </button>
      )
    }

    // check 类型：已有复选框，但为保持一致性仍显示记录按钮
    if (task.type === 'check') {
      return checked ? null : (
        <button
          ref={buttonRef}
          onClick={openRecordModal}
          className={`
            px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold
            rounded-xl shadow-[0_4px_12px_rgba(16,185,129,0.3)]
            ${skillPress ? 'skill-press-down' : ''}
            transition-all
          `}
        >
          记录
        </button>
      )
    }

    if (task.type === 'check+text') {
      if (checked && log?.text) {
        return (
          <button
            onClick={() => {
              // 已完成，点击可以编辑
              if (task.name === '读书') {
                setShowBookModal(true)
                // TODO: 需要传递初始值到弹窗，后续优化
              } else if (task.name === '健身') {
                setShowWorkoutModal(true)
              } else {
                handleExpand()
              }
            }}
            className="text-right hover:opacity-70 transition-opacity"
          >
            <span className="text-gray-500 text-xs font-medium">已记录</span>
            <p className="text-xs text-gray-500 mt-0.5 max-w-[140px] truncate text-left">
              {log.text}
            </p>
          </button>
        )
      }
      return (
        <button
          ref={buttonRef}
          onClick={openRecordModal}
          className={`
            px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold
            rounded-xl shadow-[0_4px_12px_rgba(16,185,129,0.3)]
            ${skillPress ? 'skill-press-down' : ''}
            transition-all
          `}
        >
          记录
        </button>
      )
    }

    if (task.type === 'number') {
      if (checked && log?.value !== undefined) {
        const { targetValue, unit } = task
        const diff = targetValue !== undefined
          ? targetValue - log.value
          : null

        return (
          <button
            onClick={() => setShowNumberModal(true)}
            className="text-right hover:opacity-70 transition-opacity"
          >
            <span className="text-gray-500 text-xs font-medium">已记录</span>
            <p className="text-xs text-gray-500 mt-0.5">
              {log.value} {unit}
              {diff !== null && diff > 0 && (
                <span className="text-gray-400 ml-1">
                  (距目标 {diff.toFixed(1)}{unit})
                </span>
              )}
            </p>
          </button>
        )
      }
      return (
        <button
          ref={buttonRef}
          onClick={openRecordModal}
          className={`
            px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold
            rounded-xl shadow-[0_4px_12px_rgba(16,185,129,0.3)]
            ${skillPress ? 'skill-press-down' : ''}
            transition-all
          `}
        >
          记录
        </button>
      )
    }

    return null
  }

  return (
    <>
    <div
      ref={cardRef}
      className={`
        rounded-[20px] border overflow-hidden transition-all duration-300
        ${checked && !isViolation
          ? 'bg-gray-50/80 border-gray-100/50 shadow-sm opacity-85'
          : 'bg-white border-white/50'
        }
        ${pulse ? 'scale-[1.02] shadow-lg ring-2 ring-emerald-400' : ''}
        ${isViolation ? 'border-red-200 bg-red-50/50' : ''}
        ${slideInAnim ? 'animate-slide-in' : ''}
        ${milestoneStyle || ''}
        ${skillHit ? 'skill-hit-burst' : ''}
        ${skillComplete ? 'skill-card-complete' : ''}
        ${isRecordable
          ? 'pulse-subtle shadow-[0_8px_25px_-1px_rgba(16,185,129,0.25),0_4px_15px_-1px_rgba(16,185,129,0.15)] border-emerald-200/50'
          : !checked ? 'shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]' : ''
        }
        active:scale-[0.98]
      `}
    >
      {/* +1 浮动数字动画 */}
      <PlusOneAnimation
        show={showPlusOne}
        x={plusOnePosition.x}
        y={plusOnePosition.y}
      />

      {/* 情绪化反馈浮层 */}
      <SkillFeedback
        show={showSkillFeedback}
        message={skillFeedbackMsg}
        x={skillFeedbackPos.x}
        y={skillFeedbackPos.y}
        onComplete={() => setShowSkillFeedback(false)}
      />

      {/* 主卡片内容 */}
      <div className={`px-4 py-3 ${isExpanded ? 'pb-0' : ''}`}>
        <div className="flex items-center gap-3">
          {/* 复选框 */}
          {task.type === 'check' ? (
            <button
              onClick={handleQuickCheck}
              className={`
                w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all relative
                ${checked
                  ? 'border-gray-300 bg-gray-200'
                  : 'border-emerald-400 hover:border-emerald-500'
                }
                ${checkboxBounceAnim ? 'animate-checkbox-bounce' : ''}
                ${!checked ? 'animate-checkbox-glow' : ''}
              `}
            >
              {checked && (
                <svg className={`w-3.5 h-3.5 text-gray-600 ${checkmarkAnim ? 'skill-checkmark-pop' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ) : (
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              {checked ? (
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${checkmarkAnim ? 'skill-checkmark-pop' : ''} ${task.type === 'violation' ? 'bg-red-100' : 'bg-gray-200'}`}>
                  {task.type === 'violation' ? (
                    <svg className="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              ) : (
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: task.color }}
                />
              )}
            </div>
          )}

          {/* 任务名称 + 书单按钮 */}
          <div className="flex items-center gap-2 flex-1">
            <span className={`
              text-sm font-medium transition-all duration-300 ease
              ${checked ? 'text-gray-500 line-through' : 'text-gray-900'}
            `}>
              {task.name}
            </span>
            {/* 读书任务专属：书单入口 */}
            {task.name === '读书' && !checked && (
              <button
                onClick={() => navigate('/books')}
                className="px-2 py-1 text-xs bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-100 hover:to-indigo-100 rounded-lg font-medium transition-all flex items-center gap-1"
              >
                📚 书单
              </button>
            )}
          </div>

          {/* 右侧区域：徽章 + 按钮 */}
          <div className="flex items-center gap-2">
            {/* 连续打卡徽章 */}
            {streakData && streakData.streak >= 3 && (
              <div className="flex items-center gap-1 flex-shrink-0">
                {streakData.milestoneText && (
                  <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                    {streakData.milestoneText}
                  </span>
                )}
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {streakData.streak}天
                </span>
              </div>
            )}

            {/* 状态显示（按钮） */}
            {renderStatus()}
          </div>
        </div>
      </div>

      {/* 展开的输入区域 */}
      {isExpanded && (
        <div className="px-4 pb-4 animate-[expand_0.2s_ease-out]">
          {renderExpandedContent()}
        </div>
      )}
    </div>

    {/* 数字输入弹窗 */}
    <NumberInputModal
      isOpen={showNumberModal}
      title={task.name}
      unit={task.unit}
      initialValue={log?.value}
      targetValue={task.targetValue}
      onSave={handleNumberSave}
      onCancel={() => setShowNumberModal(false)}
    />

    {/* 读书记录弹窗 */}
    <BookReadingModal
      isOpen={showBookModal}
      bookName={(() => {
        if (!log?.text) return ''
        // 移除评分、序号等，只保留类型标签和书名
        let text = log.text
        // 移除评分
        text = text.replace(/⭐️/g, '').trim()
        // 移除序号和之后的内容
        text = text.replace(/【\d+\/\d+】.*$/g, '').trim()
        return text
      })()}
      rating={log?.text?.match(/⭐️/g)?.length || 0}
      note={(() => {
        if (!log?.text) return ''
        // 提取备注部分（在序号之后的内容）
        const match = log.text.match(/【\d+\/\d+】(.*)/)
        if (match) {
          const note = match[1].trim()
          // 移除评分
          return note.replace(/⭐️/g, '').trim() || ''
        }
        return ''
      })()}
      onSave={handleBookSave}
      onCancel={() => setShowBookModal(false)}
    />

    {/* 健身训练记录弹窗 */}
    <WorkoutModal
      isOpen={showWorkoutModal}
      initialValue={log?.text}
      onSave={handleWorkoutSave}
      onCancel={() => setShowWorkoutModal(false)}
    />

    {/* 违规确认弹窗 */}
    <ViolationConfirmModal
      isOpen={showViolationModal}
      taskName={task.name}
      onConfirm={handleViolationConfirm}
      onCancel={() => setShowViolationModal(false)}
    />
  </>
  )
}
