'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft, Sparkles, Eye, Search, Upload, MessageCircle, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

const ONBOARDING_KEY = 'dc_onboarding_complete'

interface TourStep {
  id: string
  title: string
  description: string
  targetSelector: string | null
  fallbackSelector: string | null // fallback when target not found
  icon: React.ReactNode
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to DesignConnect!',
    description: 'Your creative marketplace for premium design resources. Discover, share, and sell stunning designs from talented creators around the world. Let us show you around!',
    targetSelector: null,
    fallbackSelector: null,
    icon: <Sparkles className="w-5 h-5" />,
    position: 'center',
  },
  {
    id: 'browse',
    title: 'Browse Designs',
    description: 'Explore thousands of curated designs across multiple categories. Find the perfect asset for your next project — from logos to UI kits.',
    targetSelector: '[data-tour-id="browse-link"]',
    fallbackSelector: null,
    icon: <Eye className="w-5 h-5" />,
    position: 'bottom',
  },
  {
    id: 'search',
    title: 'Search for anything',
    description: 'Quickly find designs, categories, or designers using our powerful search. Just click the search icon and start typing!',
    targetSelector: '[data-tour-id="search-button"]',
    fallbackSelector: null,
    icon: <Search className="w-5 h-5" />,
    position: 'bottom',
  },
  {
    id: 'upload',
    title: 'Upload your designs',
    description: 'Share your creative work with the community. Sign in to upload designs, set your price, and start earning from your talent.',
    targetSelector: '[data-tour-id="upload-button"]',
    fallbackSelector: '[data-tour-id="get-started-button"]',
    icon: <Upload className="w-5 h-5" />,
    position: 'bottom',
  },
  {
    id: 'messages',
    title: 'Check your messages',
    description: 'Stay connected with clients and fellow designers. Sign in to chat about projects, negotiate deals, and build lasting creative relationships.',
    targetSelector: '[data-tour-id="messages-button"]',
    fallbackSelector: '[data-tour-id="sign-in-button"]',
    icon: <MessageCircle className="w-5 h-5" />,
    position: 'bottom',
  },
  {
    id: 'complete',
    title: "You're all set!",
    description: "You've got the basics down! Start exploring, uploading, and connecting with the DesignConnect community. Happy creating!",
    targetSelector: null,
    fallbackSelector: null,
    icon: <PartyPopper className="w-5 h-5" />,
    position: 'center',
  },
]

function isOnboardingComplete(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(ONBOARDING_KEY) === 'true'
  } catch {
    return false
  }
}

function markOnboardingComplete() {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(ONBOARDING_KEY, 'true')
  } catch { /* ignore */ }
}

export function resetOnboarding() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(ONBOARDING_KEY)
  } catch { /* ignore */ }
}

export default function OnboardingTour() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const [useCenterPos, setUseCenterPos] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Check if onboarding should show
  useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => {
      if (!isOnboardingComplete()) {
        setIsVisible(true)
      }
    }, 1500) // Delay 1.5s for page to fully render
    return () => clearTimeout(timer)
  }, [])

  // Find target element position
  const updateTargetPosition = useCallback(() => {
    const step = tourSteps[currentStep]
    if (!step) return

    // Try primary selector, then fallback
    let el: Element | null = null
    if (step.targetSelector) {
      el = document.querySelector(step.targetSelector)
    }
    if (!el && step.fallbackSelector) {
      el = document.querySelector(step.fallbackSelector)
    }

    if (!el) {
      setTargetRect(null)
      setUseCenterPos(true)
      return
    }

    const rect = el.getBoundingClientRect()
    setTargetRect(rect)
    setUseCenterPos(false)

    // Calculate tooltip position
    const tooltipWidth = 360
    const tooltipHeight = 260
    const padding = 16
    const viewportW = window.innerWidth
    const viewportH = window.innerHeight

    let top = 0
    let left = 0

    if (step.position === 'center') {
      top = viewportH / 2 - tooltipHeight / 2
      left = viewportW / 2 - tooltipWidth / 2
    } else if (step.position === 'bottom') {
      top = rect.bottom + padding
      left = rect.left + rect.width / 2 - tooltipWidth / 2
    } else if (step.position === 'top') {
      top = rect.top - tooltipHeight - padding
      left = rect.left + rect.width / 2 - tooltipWidth / 2
    } else if (step.position === 'left') {
      top = rect.top + rect.height / 2 - tooltipHeight / 2
      left = rect.left - tooltipWidth - padding
    } else if (step.position === 'right') {
      top = rect.top + rect.height / 2 - tooltipHeight / 2
      left = rect.right + padding
    }

    // Clamp to viewport
    left = Math.max(padding, Math.min(left, viewportW - tooltipWidth - padding))
    top = Math.max(padding, Math.min(top, viewportH - tooltipHeight - padding))

    // On mobile, center the tooltip horizontally
    if (viewportW < 640) {
      left = Math.max(8, (viewportW - Math.min(tooltipWidth, viewportW - 32)) / 2)
    }

    setTooltipPos({ top, left })
  }, [currentStep])

  useEffect(() => {
    if (isVisible) {
      updateTargetPosition()
    }
  }, [isVisible, currentStep, updateTargetPosition])

  // Update on resize/scroll
  useEffect(() => {
    if (!isVisible) return
    const handleUpdate = () => updateTargetPosition()
    window.addEventListener('resize', handleUpdate)
    window.addEventListener('scroll', handleUpdate, true)
    return () => {
      window.removeEventListener('resize', handleUpdate)
      window.removeEventListener('scroll', handleUpdate, true)
    }
  }, [isVisible, updateTargetPosition])

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSkip = () => {
    markOnboardingComplete()
    setIsVisible(false)
    toast({
      title: 'Tour skipped',
      description: 'You can restart the tour anytime from settings.',
    })
  }

  const handleComplete = () => {
    markOnboardingComplete()
    setIsVisible(false)
    toast({
      title: 'Tour complete!',
      description: "Welcome to DesignConnect! You're ready to start creating.",
    })
  }

  // Keyboard navigation
  useEffect(() => {
    if (!isVisible) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip()
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        handlePrev()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isVisible, currentStep, dontShowAgain])

  if (!mounted || !isVisible) return null

  const step = tourSteps[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === tourSteps.length - 1
  const hasTarget = targetRect !== null && !useCenterPos
  const isCenterStep = step.position === 'center' || useCenterPos

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100]"
        >
          {/* Backdrop overlay with spotlight cutout */}
          <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'auto' }}>
            <defs>
              <mask id="tour-spotlight-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                {hasTarget && targetRect && (
                  <rect
                    x={targetRect.left - 8}
                    y={targetRect.top - 8}
                    width={targetRect.width + 16}
                    height={targetRect.height + 16}
                    rx="14"
                    fill="black"
                  >
                    <animate
                      attributeName="rx"
                      values="14;18;14"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </rect>
                )}
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              className="fill-black/60 dark:fill-black/80"
              mask="url(#tour-spotlight-mask)"
            />
          </svg>

          {/* Pulsing ring around highlighted element */}
          {hasTarget && targetRect && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute pointer-events-none"
              style={{
                top: targetRect.top - 8,
                left: targetRect.left - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
              }}
            >
              {/* Outer pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-[#fb8000]"
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1, 1.06, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              {/* Inner solid ring */}
              <div className="absolute inset-0 rounded-2xl border-2 border-[#fb8000] shadow-[0_0_24px_rgba(251,128,0,0.5)]" />
            </motion.div>
          )}

          {/* Clickable overlay for highlighted element */}
          {hasTarget && targetRect && (
            <div
              className="absolute"
              style={{
                top: targetRect.top - 8,
                left: targetRect.left - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
                borderRadius: 16,
                zIndex: 101,
              }}
            />
          )}

          {/* Tooltip card */}
          <motion.div
            ref={tooltipRef}
            key={step.id}
            initial={{ opacity: 0, y: isCenterStep ? 0 : -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isCenterStep ? 0 : -12, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-[102]"
            style={{
              top: isCenterStep ? '50%' : tooltipPos.top,
              left: isCenterStep ? '50%' : tooltipPos.left,
              transform: isCenterStep ? 'translate(-50%, -50%)' : undefined,
              width: 'min(380px, calc(100vw - 32px))',
            }}
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/20 dark:border-white/10 shadow-2xl shadow-[#fb8000]/10">
              {/* Glassmorphism background */}
              <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl" />

              {/* Decorative top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#fb8000] via-[#ff9a3c] to-[#fb8000]" />

              <div className="relative p-6">
                {/* Close button */}
                <button
                  onClick={handleSkip}
                  className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-10"
                  aria-label="Close tour"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Step icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#fb8000] to-[#e57600] flex items-center justify-center text-white mb-4 shadow-lg shadow-[#fb8000]/30"
                >
                  {step.icon}
                </motion.div>

                {/* Step title */}
                <h3 className="text-lg font-bold text-foreground mb-2 pr-8">
                  {step.title}
                </h3>

                {/* Step description */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  {step.description}
                </p>

                {/* Step progress dots */}
                <div className="flex items-center gap-1.5 mb-5">
                  {tourSteps.map((_, idx) => (
                    <div key={idx} className="relative">
                      <motion.div
                        className="rounded-full"
                        animate={{
                          width: idx === currentStep ? 24 : 8,
                          height: 8,
                          backgroundColor: idx === currentStep
                            ? '#fb8000'
                            : idx < currentStep
                              ? '#fb8000'
                              : 'rgba(251,128,0,0.2)',
                        }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      />
                      {idx === currentStep && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-[#fb8000]/30"
                          animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </div>
                  ))}
                  <span className="text-xs text-muted-foreground ml-2">
                    {currentStep + 1} / {tourSteps.length}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {!isFirst && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePrev}
                        className="gap-1 text-muted-foreground hover:text-foreground h-8"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Don't show again checkbox */}
                    {!isLast && (
                      <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={dontShowAgain}
                          onChange={(e) => setDontShowAgain(e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-muted-foreground/40 accent-[#fb8000]"
                        />
                        <span className="hidden sm:inline">Don&apos;t show again</span>
                        <span className="sm:hidden">No repeat</span>
                      </label>
                    )}

                    {!isLast && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSkip}
                        className="text-muted-foreground hover:text-foreground h-8"
                      >
                        Skip Tour
                      </Button>
                    )}

                    <Button
                      size="sm"
                      onClick={handleNext}
                      className="gap-1 bg-gradient-to-r from-[#fb8000] to-[#e57600] hover:from-[#e57600] hover:to-[#d06a00] text-white border-0 shadow-md shadow-[#fb8000]/20 h-8"
                    >
                      {isLast ? (
                        <>
                          Get Started
                          <Sparkles className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          Next
                          <ChevronRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow indicator for non-center positions */}
            {hasTarget && !isCenterStep && (
              <div
                className="absolute z-[103]"
                style={{
                  ...(step.position === 'bottom' ? {
                    top: -7,
                    left: '50%',
                    transform: 'translateX(-50%)',
                  } : step.position === 'top' ? {
                    bottom: -7,
                    left: '50%',
                    transform: 'translateX(-50%) rotate(180deg)',
                  } : {}),
                }}
              >
                <div className="w-3.5 h-3.5 bg-white/90 dark:bg-slate-900/90 border-l border-t border-white/20 dark:border-white/10 rotate-45 -translate-y-1/2" />
              </div>
            )}
          </motion.div>

          {/* Confetti for final step */}
          <AnimatePresence>
            {isLast && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none overflow-hidden"
              >
                {Array.from({ length: 24 }).map((_, i) => {
                  const confettiColors = ['#fb8000', '#ff9a3c', '#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa', '#fb7185']
                  const size = 3 + Math.random() * 5
                  return (
                    <motion.div
                      key={i}
                      className="absolute rounded-sm"
                      style={{
                        left: `${5 + Math.random() * 90}%`,
                        top: '-2%',
                        width: size,
                        height: size,
                        backgroundColor: confettiColors[i % confettiColors.length],
                        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                      }}
                      animate={{
                        y: [0, typeof window !== 'undefined' ? window.innerHeight + 100 : 1000],
                        x: [0, (Math.random() - 0.5) * 300],
                        rotate: [0, Math.random() * 1080],
                        opacity: [1, 0.8, 0],
                      }}
                      transition={{
                        duration: 2.5 + Math.random() * 2.5,
                        repeat: Infinity,
                        delay: Math.random() * 3,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                    />
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
