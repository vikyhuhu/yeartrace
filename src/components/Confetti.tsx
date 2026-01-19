import { useEffect, useRef } from 'react'

interface ConfettiProps {
  active: boolean
  duration?: number
}

export function Confetti({ active, duration = 3000 }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    if (!active) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置 canvas 尺寸
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // 创建五彩纸屑粒子
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE']
    const particles: Particle[] = []

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 3,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 1) * 15 - 5,
        size: Math.random() * 10 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
      })
    }

    particlesRef.current = particles

    let startTime: number | null = null

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime

      if (elapsed > duration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        // 更新位置
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vy += 0.3 // 重力
        particle.rotation += particle.rotationSpeed

        // 更新透明度
        particle.opacity = 1 - elapsed / duration

        // 绘制粒子
        ctx.save()
        ctx.translate(particle.x, particle.y)
        ctx.rotate((particle.rotation * Math.PI) / 180)
        ctx.globalAlpha = particle.opacity
        ctx.fillStyle = particle.color

        // 绘制纸屑形状
        ctx.beginPath()
        ctx.moveTo(0, -particle.size / 2)
        ctx.lineTo(particle.size / 2, 0)
        ctx.lineTo(0, particle.size / 2)
        ctx.lineTo(-particle.size / 2, 0)
        ctx.closePath()
        ctx.fill()

        ctx.restore()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [active, duration])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ mixBlendMode: 'multiply' }}
    />
  )
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rotation: number
  rotationSpeed: number
  opacity: number
}
