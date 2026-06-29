import React, { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion'

export const InteractiveBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Motion values for smooth high-performance tracking
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Add spring physics for fluid movement
  const smoothX = useSpring(mouseX, { stiffness: 100, damping: 20 })
  const smoothY = useSpring(mouseY, { stiffness: 100, damping: 20 })
  const opacity = useSpring(0, { stiffness: 100, damping: 20 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    const handleMouseEnter = () => opacity.set(1)
    const handleMouseLeave = () => opacity.set(0)

    window.addEventListener('mousemove', handleMouseMove)
    document.body.addEventListener('mouseenter', handleMouseEnter)
    document.body.addEventListener('mouseleave', handleMouseLeave)

    // Initialize to screen center
    mouseX.set(window.innerWidth / 2)
    mouseY.set(window.innerHeight / 2)
    
    // Slight delay before fading in mask initially
    setTimeout(() => opacity.set(1), 1000)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.body.removeEventListener('mouseenter', handleMouseEnter)
      document.body.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [mouseX, mouseY, opacity])

  // Framer motion template string for dynamic CSS mask update
  const maskImage = useMotionTemplate`radial-gradient(400px circle at ${smoothX}px ${smoothY}px, black 15%, transparent 100%)`

  return (
    <div ref={containerRef} className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      {/* Base Gradient Background */}
      <div className="absolute inset-0 bg-surface-page transition-colors duration-500" />
      
      {/* Animated Colored Blobs */}
      <div 
        className="absolute w-[800px] h-[800px] rounded-full blur-[100px] opacity-30 mix-blend-multiply animate-pulse"
        style={{
          background: 'radial-gradient(circle, var(--color-brand-primary) 0%, transparent 70%)',
          top: '-200px',
          left: '-200px',
          animationDuration: '8s'
        }}
      />
      <div 
        className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-20 mix-blend-multiply animate-pulse"
        style={{
          background: 'radial-gradient(circle, var(--color-success) 0%, transparent 70%)',
          bottom: '-100px',
          right: '-100px',
          animationDuration: '10s',
          animationDelay: '1s'
        }}
      />
      
      {/* Dynamic Dotted Grid with Framer Motion Spotlight Mask */}
      <motion.div 
        className="absolute inset-0 z-10"
        style={{
          backgroundImage: 'radial-gradient(var(--border-strong) 2px, transparent 2px)',
          backgroundSize: '36px 36px',
          opacity: opacity,
          WebkitMaskImage: maskImage,
          maskImage: maskImage,
        }}
      />

      {/* Faint static grid for structure outside the spotlight */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(var(--border-strong) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />
    </div>
  )
}
