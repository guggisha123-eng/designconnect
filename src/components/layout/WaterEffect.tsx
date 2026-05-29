'use client'

import { useEffect, useRef } from 'react'

export default function WaterEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let mouseX = 0
    let mouseY = 0
    const ripples: { x: number; y: number; radius: number; opacity: number; maxRadius: number }[] = []

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resize()
    window.addEventListener('resize', resize)

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
      if (Math.random() > 0.85) {
        ripples.push({
          x: mouseX,
          y: mouseY,
          radius: 0,
          opacity: 0.4,
          maxRadius: 80 + Math.random() * 60,
        })
      }
    }

    canvas.addEventListener('mousemove', handleMouseMove)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.offsetWidth, canvas.offsetHeight)
      gradient.addColorStop(0, '#0f172a')
      gradient.addColorStop(0.5, '#1e293b')
      gradient.addColorStop(1, '#0f172a')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      // Subtle animated circles in background
      const time = Date.now() * 0.001
      for (let i = 0; i < 5; i++) {
        const cx = canvas.offsetWidth * (0.2 + 0.15 * i) + Math.sin(time + i) * 30
        const cy = canvas.offsetHeight * 0.5 + Math.cos(time * 0.7 + i * 2) * 50
        const r = 60 + Math.sin(time * 0.5 + i) * 20
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        g.addColorStop(0, 'rgba(251, 128, 0, 0.06)')
        g.addColorStop(1, 'rgba(251, 128, 0, 0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i]
        ripple.radius += 1.5
        ripple.opacity -= 0.008

        if (ripple.opacity <= 0 || ripple.radius > ripple.maxRadius) {
          ripples.splice(i, 1)
          continue
        }

        ctx.beginPath()
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(251, 128, 0, ${ripple.opacity})`
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Inner ring
        if (ripple.radius > 10) {
          ctx.beginPath()
          ctx.arc(ripple.x, ripple.y, ripple.radius * 0.6, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(251, 128, 0, ${ripple.opacity * 0.5})`
          ctx.lineWidth = 0.8
          ctx.stroke()
        }
      }

      // Mouse glow
      const mouseGlow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 120)
      mouseGlow.addColorStop(0, 'rgba(251, 128, 0, 0.08)')
      mouseGlow.addColorStop(1, 'rgba(251, 128, 0, 0)')
      ctx.fillStyle = mouseGlow
      ctx.beginPath()
      ctx.arc(mouseX, mouseY, 120, 0, Math.PI * 2)
      ctx.fill()

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'auto' }}
    />
  )
}
