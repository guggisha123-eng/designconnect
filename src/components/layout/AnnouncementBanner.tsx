'use client'

import { useState, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Megaphone, X } from 'lucide-react'
import { useNavStore } from '@/store/nav-store'

const DISMISSED_KEY = 'dc_announcement_dismissed'

function subscribe(cb: () => void) {
  window.addEventListener('storage', cb)
  return () => window.removeEventListener('storage', cb)
}

function getSnapshot() {
  if (typeof window === 'undefined') return 'true'
  try {
    return localStorage.getItem(DISMISSED_KEY) || ''
  } catch {
    return ''
  }
}

function getServerSnapshot() {
  return 'true'
}

export default function AnnouncementBanner() {
  const dismissedValue = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const dismissed = dismissedValue === 'true'
  const [manuallyDismissed, setManuallyDismissed] = useState(false)
  const navigateTo = useNavStore((s) => s.navigateTo)

  const isVisible = !dismissed && !manuallyDismissed

  const handleDismiss = () => {
    setManuallyDismissed(true)
    try {
      localStorage.setItem(DISMISSED_KEY, 'true')
    } catch { /* ignore */ }
  }

  const handleClick = () => {
    navigateTo('inspiration')
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0, y: -40 }}
          animate={{ height: 'auto', opacity: 1, y: 0 }}
          exit={{ height: 0, opacity: 0, y: -40 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div
            onClick={handleClick}
            className="relative cursor-pointer bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 text-white"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-center gap-2 sm:gap-3">
              <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 animate-pulse" />
              <p className="text-xs sm:text-sm font-medium text-center">
                🎉 New: AI Design Inspiration is here! Try generating unique designs with AI.
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDismiss()
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Dismiss announcement"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
