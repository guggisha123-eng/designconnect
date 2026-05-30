'use client'

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, X, ChevronRight, History } from 'lucide-react'
import { useNavStore } from '@/store/nav-store'
import { Button } from '@/components/ui/button'

interface RecentlyViewedItem {
  id: string
  title: string
  image: string
  viewedAt: number
}

const STORAGE_KEY = 'dc_recently_viewed'
const MAX_ITEMS = 10

function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return []
}

export function addToRecentlyViewed(id: string, title: string, image: string) {
  if (typeof window === 'undefined') return
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const views: RecentlyViewedItem[] = stored ? JSON.parse(stored) : []
    const filtered = views.filter((v) => v.id !== id)
    filtered.unshift({ id, title, image, viewedAt: Date.now() })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS)))
  } catch { /* ignore */ }
}

export function clearRecentlyViewed() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch { /* ignore */ }
}

// External store for recently viewed items
let listeners: (() => void)[] = []

function subscribe(callback: () => void) {
  listeners.push(callback)
  // Also listen for native storage events (cross-tab)
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback()
  }
  window.addEventListener('storage', handleStorage)
  return () => {
    listeners = listeners.filter(l => l !== callback)
    window.removeEventListener('storage', handleStorage)
  }
}

function getSnapshot(): string {
  if (typeof window === 'undefined') return '[]'
  return localStorage.getItem(STORAGE_KEY) || '[]'
}

function getServerSnapshot(): string {
  return '[]'
}

// Notify all subscribers when recently viewed changes
export function notifyRecentlyViewedChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dc_recently_viewed_updated'))
  }
  listeners.forEach(l => l())
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}

interface RecentlyViewedProps {
  /** Optional title override */
  title?: string
  /** Whether to show the clear button */
  showClear?: boolean
  /** Max number of items to display */
  maxItems?: number
}

export default function RecentlyViewed({ title = 'Recently Viewed', showClear = true, maxItems = 10 }: RecentlyViewedProps) {
  const navigateTo = useNavStore((s) => s.navigateTo)
  const setSelectedDesignId = useNavStore((s) => s.setSelectedDesignId)

  // Use useSyncExternalStore to subscribe to localStorage changes
  const rawData = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // Parse the data
  let items: RecentlyViewedItem[] = []
  try {
    const parsed = JSON.parse(rawData)
    if (Array.isArray(parsed)) items = parsed.slice(0, maxItems)
  } catch { /* ignore */ }

  const handleClear = useCallback(() => {
    clearRecentlyViewed()
    notifyRecentlyViewedChanged()
  }, [])

  const handleCardClick = useCallback((id: string) => {
    setSelectedDesignId(id)
    navigateTo('design-detail')
  }, [navigateTo, setSelectedDesignId])

  // Don't render if no items
  if (items.length === 0) return null

  return (
    <AnimatePresence>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="py-12 bg-white dark:bg-slate-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <History className="w-5 h-5 text-[#fb8000]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold dark:text-white">{title}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{items.length} design{items.length !== 1 ? 's' : ''} viewed</p>
              </div>
            </div>
            {showClear && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-muted-foreground hover:text-red-500 gap-1.5 text-xs"
              >
                <X className="w-3.5 h-3.5" />
                Clear All
              </Button>
            )}
          </div>

          {/* Horizontal scrollable row */}
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="flex-shrink-0 w-[160px] sm:w-[180px] snap-start"
              >
                <button
                  onClick={() => handleCardClick(item.id)}
                  className="group w-full text-left"
                >
                  {/* Thumbnail */}
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2.5 relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <ChevronRight className="w-5 h-5 text-white drop-shadow-lg" />
                      </div>
                    </div>
                    {/* Time badge */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/50 backdrop-blur-sm rounded-md">
                      <Clock className="w-2.5 h-2.5 text-white/80" />
                      <span className="text-[10px] text-white/90 font-medium">{formatTimeAgo(item.viewedAt)}</span>
                    </div>
                  </div>
                  {/* Title */}
                  <p className="text-sm font-medium line-clamp-1 group-hover:text-[#fb8000] transition-colors dark:text-white">
                    {item.title}
                  </p>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </AnimatePresence>
  )
}
