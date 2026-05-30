'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Keyboard, Search, X } from 'lucide-react'
import { useNavStore } from '@/store/nav-store'

const shortcuts = [
  { keys: ['Ctrl', 'K'], description: 'Open search', macKeys: ['⌘', 'K'] },
  { keys: ['/'], description: 'Open search', macKeys: ['/'] },
  { keys: ['Esc'], description: 'Close modal/dialog', macKeys: ['Esc'] },
  { keys: ['G', 'H'], description: 'Go to Home', macKeys: ['G', 'H'] },
  { keys: ['G', 'B'], description: 'Go to Browse', macKeys: ['G', 'B'] },
  { keys: ['G', 'D'], description: 'Go to Dashboard', macKeys: ['G', 'D'] },
  { keys: ['←', '→'], description: 'Navigate images in lightbox', macKeys: ['←', '→'] },
  { keys: ['Ctrl', '/'], description: 'Show keyboard shortcuts', macKeys: ['⌘', '/'] },
]

export default function KeyboardShortcuts() {
  const [showDialog, setShowDialog] = useState(false)
  const [gPressed, setGPressed] = useState(false)
  const gTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const navigateTo = useNavStore((s) => s.navigateTo)

  const isMac = typeof window !== 'undefined' ? navigator.platform.toUpperCase().includes('MAC') : false

  const focusSearch = useCallback(() => {
    // Try to find and focus the search input in the Navbar
    const searchInput = document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')
    if (searchInput) {
      searchInput.focus()
      searchInput.click()
    } else {
      // Fallback: dispatch custom event for Navbar to handle
      window.dispatchEvent(new CustomEvent('focusSearch'))
    }
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input/textarea
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

      // Ctrl+K or Cmd+K: Open search (works even in inputs)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        focusSearch()
        return
      }

      // Ctrl+/ or Cmd+/: Toggle shortcuts dialog (works even in inputs)
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        setShowDialog((prev) => !prev)
        return
      }

      // Don't process other shortcuts when in input
      if (isInput) return

      // Escape: Close dialog/lightbox
      if (e.key === 'Escape') {
        if (showDialog) {
          setShowDialog(false)
        }
        // Other escape handling is done by individual components (lightbox, dialogs)
        return
      }

      // /: Open search
      if (e.key === '/') {
        e.preventDefault()
        focusSearch()
        return
      }

      // G followed by another key: Navigation shortcuts
      if (e.key === 'g' || e.key === 'G') {
        if (gPressed) {
          // Double G, ignore
          setGPressed(false)
          if (gTimeoutRef.current) clearTimeout(gTimeoutRef.current)
          return
        }
        setGPressed(true)
        // Reset G state after 500ms if no second key
        gTimeoutRef.current = setTimeout(() => {
          setGPressed(false)
        }, 500)
        return
      }

      // Handle second key after G
      if (gPressed) {
        setGPressed(false)
        if (gTimeoutRef.current) clearTimeout(gTimeoutRef.current)

        if (e.key === 'h' || e.key === 'H') {
          e.preventDefault()
          navigateTo('home')
        } else if (e.key === 'b' || e.key === 'B') {
          e.preventDefault()
          navigateTo('browse')
        } else if (e.key === 'd' || e.key === 'D') {
          e.preventDefault()
          navigateTo('dashboard')
        }
        return
      }

      // ? key: Toggle shortcuts dialog
      if (e.key === '?') {
        // Only if Shift is pressed (to avoid conflict with normal ?)
        if (e.shiftKey) {
          e.preventDefault()
          setShowDialog((prev) => !prev)
        }
      }
    },
    [focusSearch, gPressed, navigateTo, showDialog]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (gTimeoutRef.current) clearTimeout(gTimeoutRef.current)
    }
  }, [handleKeyDown])

  return (
    <>
      {/* Floating ? badge */}
      <motion.button
        onClick={() => setShowDialog(true)}
        className="fixed bottom-6 left-6 z-40 w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-border shadow-lg flex items-center justify-center text-muted-foreground hover:text-[#fb8000] hover:border-[#fb8000]/30 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.3 }}
        aria-label="Keyboard shortcuts"
        title="Keyboard shortcuts (Ctrl+/)"
      >
        <Keyboard className="w-4 h-4" />
      </motion.button>

      {/* Shortcuts dialog */}
      <AnimatePresence>
        {showDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowDialog(false)
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-border overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-[#fb8000]" />
                  <h2 className="text-lg font-semibold dark:text-white">Keyboard Shortcuts</h2>
                </div>
                <button
                  onClick={() => setShowDialog(false)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Shortcuts list */}
              <div className="px-6 py-4 space-y-1 max-h-[60vh] overflow-y-auto">
                {/* Search section */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Search
                  </p>
                  <div className="space-y-2">
                    {shortcuts.filter(s => s.description.includes('search') || s.description.includes('Search')).map((shortcut, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-foreground dark:text-slate-300">{shortcut.description}</span>
                        <div className="flex items-center gap-1">
                          {(isMac ? shortcut.macKeys : shortcut.keys).map((key, ki) => (
                            <span key={ki} className="flex items-center gap-1">
                              {ki > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  {shortcut.keys.length > 2 || (shortcut.keys.length === 2 && !shortcut.keys[0].includes('Ctrl') && shortcut.keys[0] !== '←') ? ' then ' : ''}
                                </span>
                              )}
                              <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 text-xs font-mono font-medium bg-muted dark:bg-slate-800 border border-border rounded-md shadow-sm">
                                {key}
                              </kbd>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation section */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Navigation
                  </p>
                  <div className="space-y-2">
                    {shortcuts.filter(s => s.description.includes('Go to')).map((shortcut, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-foreground dark:text-slate-300">{shortcut.description}</span>
                        <div className="flex items-center gap-1">
                          {(isMac ? shortcut.macKeys : shortcut.keys).map((key, ki) => (
                            <span key={ki} className="flex items-center gap-1">
                              {ki > 0 && (
                                <span className="text-xs text-muted-foreground">then</span>
                              )}
                              <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 text-xs font-mono font-medium bg-muted dark:bg-slate-800 border border-border rounded-md shadow-sm">
                                {key}
                              </kbd>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* General section */}
                <div className="mb-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    General
                  </p>
                  <div className="space-y-2">
                    {shortcuts.filter(s => !s.description.includes('Go to') && !s.description.includes('search') && !s.description.includes('Search')).map((shortcut, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-foreground dark:text-slate-300">{shortcut.description}</span>
                        <div className="flex items-center gap-1">
                          {(isMac ? shortcut.macKeys : shortcut.keys).map((key, ki) => (
                            <span key={ki} className="flex items-center gap-1">
                              {ki > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  {shortcut.keys[0] === '←' ? '' : ''}
                                </span>
                              )}
                              <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 text-xs font-mono font-medium bg-muted dark:bg-slate-800 border border-border rounded-md shadow-sm">
                                {key}
                              </kbd>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-muted/30 dark:bg-slate-800/50 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  Press <kbd className="inline-flex items-center justify-center px-1.5 h-5 text-[10px] font-mono font-medium bg-muted dark:bg-slate-700 border border-border rounded shadow-sm">Esc</kbd> to close
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
