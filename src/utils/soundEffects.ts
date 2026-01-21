/**
 * YearTrace V1 MVP 音效系统
 * 使用 Web Audio API 生成音效，无需外部音频文件
 */

type SoundEffectType = 'click' | 'complete' | 'settlement' | 'cancel'

class SoundManager {
  private context: AudioContext | null = null
  private enabled: boolean = true

  constructor() {
    // 延迟初始化 AudioContext（需要用户交互）
    if (typeof window !== 'undefined') {
      this.init()
    }
  }

  private init() {
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (e) {
      console.warn('Web Audio API not supported')
    }
  }

  /**
   * 确保音频上下文已激活
   */
  private ensureContext() {
    if (!this.context) {
      this.init()
    }
    if (this.context && this.context.state === 'suspended') {
      this.context.resume()
    }
  }

  /**
   * 点击音效 - 短促清音
   */
  private playClick() {
    this.ensureContext()
    if (!this.context || !this.enabled) return

    const osc = this.context.createOscillator()
    const gain = this.context.createGain()

    osc.connect(gain)
    gain.connect(this.context.destination)

    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, this.context.currentTime)
    osc.frequency.exponentialRampToValueAtTime(400, this.context.currentTime + 0.05)

    gain.gain.setValueAtTime(0.1, this.context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.05)

    osc.start(this.context.currentTime)
    osc.stop(this.context.currentTime + 0.05)
  }

  /**
   * 完成音效 - 成功提示音
   */
  private playComplete() {
    this.ensureContext()
    if (!this.context || !this.enabled) return

    const now = this.context.currentTime

    // 主音
    const osc1 = this.context.createOscillator()
    const gain1 = this.context.createGain()
    osc1.connect(gain1)
    gain1.connect(this.context.destination)

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(523.25, now) // C5
    osc1.frequency.setValueAtTime(659.25, now + 0.1) // E5
    osc1.frequency.setValueAtTime(783.99, now + 0.2) // G5

    gain1.gain.setValueAtTime(0.15, now)
    gain1.gain.linearRampToValueAtTime(0.1, now + 0.1)
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3)

    osc1.start(now)
    osc1.stop(now + 0.3)

    // 和音
    const osc2 = this.context.createOscillator()
    const gain2 = this.context.createGain()
    osc2.connect(gain2)
    gain2.connect(this.context.destination)

    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(659.25, now) // E5
    osc2.frequency.setValueAtTime(783.99, now + 0.15) // G5

    gain2.gain.setValueAtTime(0.08, now)
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.25)

    osc2.start(now)
    osc2.stop(now + 0.25)
  }

  /**
   * 结算音效 - 胜利/完成音效
   */
  private playSettlement() {
    this.ensureContext()
    if (!this.context || !this.enabled) return

    const now = this.context.currentTime
    const ctx = this.context // 保存引用避免 null 检查问题

    // 三音符上升和弦
    const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.type = i === 3 ? 'sine' : 'triangle'
      osc.frequency.setValueAtTime(freq, now + i * 0.1)

      const startTime = now + i * 0.1
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4)

      osc.start(startTime)
      osc.stop(startTime + 0.4)
    })
  }

  /**
   * 取消完成音效 - 下降音调
   */
  private playCancel() {
    this.ensureContext()
    if (!this.context || !this.enabled) return

    const osc = this.context.createOscillator()
    const gain = this.context.createGain()

    osc.connect(gain)
    gain.connect(this.context.destination)

    osc.type = 'sine'
    osc.frequency.setValueAtTime(400, this.context.currentTime)
    osc.frequency.exponentialRampToValueAtTime(200, this.context.currentTime + 0.15)

    gain.gain.setValueAtTime(0.1, this.context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.15)

    osc.start(this.context.currentTime)
    osc.stop(this.context.currentTime + 0.15)
  }

  /**
   * 播放音效
   */
  play(type: SoundEffectType) {
    if (!this.enabled) return

    switch (type) {
      case 'click':
        this.playClick()
        break
      case 'complete':
        this.playComplete()
        break
      case 'settlement':
        this.playSettlement()
        break
      case 'cancel':
        this.playCancel()
        break
    }
  }

  /**
   * 启用/禁用音效
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  /**
   * 获取音效状态
   */
  isEnabled(): boolean {
    return this.enabled
  }
}

// 导出单例
export const soundManager = new SoundManager()

/**
 * Hook: 使用音效
 */
export function useSoundEffects() {
  const play = (type: SoundEffectType) => {
    soundManager.play(type)
  }

  return { play }
}
