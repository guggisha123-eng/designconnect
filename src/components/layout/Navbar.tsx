'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { io, Socket } from 'socket.io-client'
import {
  Menu, X, Search, ChevronDown, User, LogOut, Upload, FolderOpen,
  LayoutDashboard, Sparkles, Palette, Pencil, Bookmark, Moon, Sun,
  Bell, Heart, ShoppingBag, Star, Clock, Hash, Trash2, MessageCircle,
  Check, Settings, Trophy
} from 'lucide-react'
import { useNavStore, type Page } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { createClient, isSupabaseReady } from '@/lib/supabase/client'
import ThemeToggle from '@/components/layout/ThemeToggle'
import ProfileEditDialog from '@/components/pages/ProfileEditDialog'

const navLinks: { label: string; page: Page; icon?: typeof Trophy }[] = [
  { label: 'Home', page: 'home' },
  { label: 'Browse', page: 'browse' },
  { label: 'Categories', page: 'categories' },
  { label: 'Leaderboard', page: 'leaderboard', icon: Trophy },
  { label: 'Pricing', page: 'pricing' },
  { label: 'About', page: 'about' },
]

type NotificationType = 'like' | 'follow' | 'comment' | 'feature' | 'download' | 'reference' | 'system'

interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: string
  read: boolean
  avatar: string | null
  link: string | null
}

const typeIconMap: Record<NotificationType, { icon: typeof Heart; color: string; bg: string }> = {
  like: { icon: Heart, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
  follow: { icon: User, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  comment: { icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
  feature: { icon: Star, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  download: { icon: ShoppingBag, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  reference: { icon: Bookmark, color: 'text-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/30' },
  system: { icon: Bell, color: 'text-[#fb8000]', bg: 'bg-orange-100 dark:bg-orange-900/30' },
}

const defaultNotifications: NotificationItem[] = [
  { id: 'n1', type: 'like', title: 'Sarah Chen liked your design', message: 'Someone liked your "Modern Brand Identity" design', timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), read: false, avatar: null, link: 'design-detail?id=1' },
  { id: 'n2', type: 'download', title: 'New order: Modern Brand Identity purchased', message: 'Someone purchased your design', timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), read: false, avatar: null, link: 'design-detail?id=1' },
  { id: 'n3', type: 'feature', title: 'Your design was featured!', message: 'Your design has been featured on the homepage', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), read: false, avatar: null, link: 'design-detail?id=2' },
  { id: 'n4', type: 'follow', title: 'Alex Rivera started following you', message: 'You have a new follower', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), read: true, avatar: null, link: 'designer-profile?designerId=alex' },
]

/* ─── Search autocomplete data ─── */
const searchableDesigns = [
  { id: '1', title: 'Modern Brand Identity', category: 'Logo Design', image: '/designs/brand-identity.png', price: 29 },
  { id: '2', title: 'Minimal Logo Pack', category: 'Logo Design', image: '/designs/logo-pack.png', price: 0 },
  { id: '3', title: 'Social Media Kit', category: 'Social Media', image: '/designs/social-media-kit.png', price: 19 },
  { id: '4', title: 'App UI Template', category: 'UI/UX', image: '/designs/app-ui.png', price: 49 },
  { id: '5', title: 'Poster Collection', category: 'Print Design', image: '/designs/poster-collection.png', price: 0 },
  { id: '6', title: 'Icon Set Premium', category: 'Icons', image: '/designs/icon-set.png', price: 15 },
  { id: '7', title: 'Business Card Template', category: 'Print Design', image: '/designs/business-card.png', price: 0 },
  { id: '8', title: 'Website Hero Bundle', category: 'UI/UX', image: '/designs/hero-bundle.png', price: 39 },
]

const searchableCategories = ['Logo Design', 'UI/UX', 'Illustrations', 'Typography', '3D Design', 'Social Media', 'Print Design', 'Motion Design', 'Icons']

/* ─── Recent searches localStorage helpers ─── */
const RECENT_SEARCHES_KEY = 'dc_recent_searches'
const MAX_RECENT = 5

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return []
}

function saveRecentSearch(query: string) {
  if (typeof window === 'undefined') return
  try {
    const current = getRecentSearches()
    const filtered = current.filter(s => s.toLowerCase() !== query.toLowerCase())
    const updated = [query, ...filtered].slice(0, MAX_RECENT)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
  } catch { /* ignore */ }
}

function removeRecentSearch(query: string) {
  if (typeof window === 'undefined') return
  try {
    const current = getRecentSearches()
    const updated = current.filter(s => s !== query)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
  } catch { /* ignore */ }
}

function clearRecentSearches() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY)
  } catch { /* ignore */ }
}

export default function Navbar() {
  const { currentPage, navigateTo, isLoggedIn, user, logout, setSearchQuery, setSelectedDesignerId, setSelectedDesignId } = useNavStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [scrollIntensity, setScrollIntensity] = useState(0)
  const [isDark, setIsDark] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState('')
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    return getRecentSearches()
  })
  const [notifOpen, setNotifOpen] = useState(false)
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>(defaultNotifications)
  const notifSocketRef = useRef<Socket | null>(null)

  const userMenuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSuggestionsOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // WebSocket connection for notifications
  useEffect(() => {
    if (!isLoggedIn || !user) return

    const socket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
    })

    socket.on('connect', () => {
      socket.emit('join', user.id)
    })

    socket.on('notifications:initial', (initialNotifs: NotificationItem[]) => {
      setNotifications(initialNotifs)
    })

    socket.on('notification', (notif: NotificationItem) => {
      setNotifications((prev) => [notif, ...prev])
    })

    notifSocketRef.current = socket

    return () => {
      socket.disconnect()
      notifSocketRef.current = null
    }
  }, [isLoggedIn, user])

  // Listen for focusSearch custom event (from KeyboardShortcuts)
  useEffect(() => {
    const handleFocusSearch = () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus()
        setSuggestionsOpen(true)
      }
    }
    window.addEventListener('focusSearch', handleFocusSearch)
    return () => window.removeEventListener('focusSearch', handleFocusSearch)
  }, [])

  // Close suggestions on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSuggestionsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      setScrolled(y > 20)
      // Calculate scroll intensity 0-1 for progressive blur
      setScrollIntensity(Math.min(y / 200, 1))
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Detect dark mode
  useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.classList.contains('dark'))
    checkDark()
    const observer = new MutationObserver(checkDark)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const refreshRecentSearches = useCallback(() => {
    setRecentSearches(getRecentSearches())
  }, [])

  const handleSearch = () => {
    if (localSearch.trim()) {
      saveRecentSearch(localSearch.trim())
      refreshRecentSearches()
      setSearchQuery(localSearch.trim())
      navigateTo('search')
      setSearchOpen(false)
      setSuggestionsOpen(false)
      setLocalSearch('')
    }
  }

  const handleRecentSearchClick = (query: string) => {
    setLocalSearch(query)
    setSearchQuery(query)
    saveRecentSearch(query)
    refreshRecentSearches()
    navigateTo('search')
    setSearchOpen(false)
    setSuggestionsOpen(false)
    setLocalSearch('')
  }

  const handleRemoveRecentSearch = (query: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeRecentSearch(query)
    refreshRecentSearches()
  }

  const handleClearRecentSearches = () => {
    clearRecentSearches()
    refreshRecentSearches()
  }

  const handleCategoryClick = (category: string) => {
    setSearchQuery(category)
    saveRecentSearch(category)
    refreshRecentSearches()
    navigateTo('search')
    setSearchOpen(false)
    setSuggestionsOpen(false)
    setLocalSearch('')
  }

  const handleDesignClick = (designId: string) => {
    setSelectedDesignId(designId)
    navigateTo('design-detail')
    setSearchOpen(false)
    setSuggestionsOpen(false)
    setLocalSearch('')
  }

  // Filter suggestions based on query
  const filteredCategories = localSearch.trim()
    ? searchableCategories.filter(c => c.toLowerCase().includes(localSearch.toLowerCase()))
    : []

  const filteredDesigns = localSearch.trim()
    ? searchableDesigns.filter(d =>
        d.title.toLowerCase().includes(localSearch.toLowerCase()) ||
        d.category.toLowerCase().includes(localSearch.toLowerCase())
      )
    : []

  const hasSuggestions = recentSearches.length > 0 || filteredCategories.length > 0 || filteredDesigns.length > 0
  const showSuggestions = suggestionsOpen && hasSuggestions

  const handleSignOut = async () => {
    try {
      if (isSupabaseReady()) {
        const supabase = createClient()
        await supabase.auth.signOut()
      }
    } catch (err) {
      console.error('Supabase sign out error:', err)
    }
    logout()
    setUserMenuOpen(false)
    setNotifOpen(false)
    setMobileOpen(false)
    navigateTo('auth')
  }

  const unreadCount = notifications.filter(n => !n.read).length

  /* ─── Suggestions dropdown content ─── */
  const renderSuggestions = () => (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-border/50 overflow-hidden z-50"
    >
      <div className="max-h-96 overflow-y-auto custom-scrollbar">
        {/* Recent Searches */}
        {(localSearch.trim() === '' || filteredCategories.length > 0 || filteredDesigns.length > 0) && recentSearches.length > 0 && (
          <div>
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> Recent
            </div>
            {recentSearches.slice(0, 5).map((query) => (
              <button
                key={query}
                onClick={() => handleRecentSearchClick(query)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left group"
              >
                <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm flex-1 truncate">{query}</span>
                <button
                  onClick={(e) => handleRemoveRecentSearch(query, e)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-muted-foreground/10 transition-all"
                  aria-label="Remove search"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              </button>
            ))}
            <div className="px-4 pb-2">
              <button
                onClick={handleClearRecentSearches}
                className="text-xs text-muted-foreground hover:text-[#fb8000] transition-colors"
              >
                Clear recent searches
              </button>
            </div>
          </div>
        )}

        {/* Suggested Categories */}
        {filteredCategories.length > 0 && (
          <div className={recentSearches.length > 0 ? 'border-t border-border/50' : ''}>
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Hash className="w-3 h-3" /> Categories
            </div>
            {filteredCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
              >
                <Hash className="w-4 h-4 text-[#fb8000] flex-shrink-0" />
                <span className="text-sm">{category}</span>
              </button>
            ))}
          </div>
        )}

        {/* Suggested Designs */}
        {filteredDesigns.length > 0 && (
          <div className={(recentSearches.length > 0 || filteredCategories.length > 0) ? 'border-t border-border/50' : ''}>
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Designs
            </div>
            {filteredDesigns.map((design) => (
              <button
                key={design.id}
                onClick={() => handleDesignClick(design.id)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                  <img
                    src={design.image}
                    alt={design.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{design.title}</p>
                  <p className="text-xs text-muted-foreground">{design.category}</p>
                </div>
                {design.price > 0 ? (
                  <span className="text-xs font-semibold text-[#fb8000] bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-full">
                    ${design.price}
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                    Free
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'shadow-lg border-b border-border/30'
            : 'border-b border-transparent'
        }`}
        style={{
          backgroundColor: scrolled
            ? `rgba(${isDark ? '15, 23, 42' : '255, 255, 255'}, ${0.7 + scrollIntensity * 0.25})`
            : 'transparent',
          backdropFilter: `blur(${8 + scrollIntensity * 12}px)`,
          WebkitBackdropFilter: `blur(${8 + scrollIntensity * 12}px)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => navigateTo('home')}
              className="flex items-center gap-2 group"
            >
              <div className="w-9 h-9 rounded-xl gradient-orange flex items-center justify-center group-hover:scale-110 transition-transform">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#fb8000] to-[#e57600] bg-clip-text text-transparent">
                Design Connect
              </span>
            </button>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = currentPage === link.page
                return (
                  <button
                    key={link.page}
                    onClick={() => navigateTo(link.page)}
                    data-tour-id={link.page === 'browse' ? 'browse-link' : undefined}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-[#fb8000] bg-orange-50/80 dark:bg-orange-900/20'
                        : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {link.icon && <link.icon className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />}
                    {link.label}
                    {/* Active indicator dot */}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-active-indicator"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#fb8000] shadow-[0_0_6px_rgba(251,128,0,0.6)]"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Right Side */}
            <div className="hidden md:flex items-center gap-3">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                data-tour-id="search-button"
                className="p-2 rounded-lg hover:bg-muted transition-colors relative"
              >
                <Search className="w-5 h-5 text-foreground/70" />
                <span className="absolute -top-0.5 -right-0.5 text-[9px] font-medium bg-muted text-muted-foreground px-1 py-0.5 rounded border border-border/50 leading-none opacity-60">⌘K</span>
              </button>
              {/* Theme Toggle */}
              <ThemeToggle />

              {isLoggedIn && user ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigateTo('upload')}
                    data-tour-id="upload-button"
                    className="gap-2 text-foreground/70"
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </Button>

                  {/* Messages */}
                  <Button
                    variant="ghost"
                    onClick={() => navigateTo('messages')}
                    data-tour-id="messages-button"
                    className="p-2 relative"
                    aria-label="Messages"
                  >
                    <MessageCircle className="w-5 h-5 text-foreground/70" />
                  </Button>

                  {/* Notification Bell */}
                  <div className="relative" ref={notifRef}>
                    <button
                      onClick={() => {
                        setNotifOpen(!notifOpen)
                        setUserMenuOpen(false)
                      }}
                      className="relative p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Bell className="w-5 h-5 text-foreground/70" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
                      )}
                    </button>
                    <AnimatePresence>
                      {notifOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-80 bg-popover rounded-xl shadow-xl border border-border/50 overflow-hidden"
                        >
                          <div className="p-3 border-b border-border/50 flex items-center justify-between">
                            <h3 className="text-sm font-semibold">Notifications</h3>
                            {unreadCount > 0 && (
                              <span className="text-xs bg-[#fb8000] text-white px-2 py-0.5 rounded-full font-medium">
                                {unreadCount} new
                              </span>
                            )}
                          </div>
                          <div className="max-h-80 overflow-y-auto custom-scrollbar">
                            {notifications.slice(0, 5).map((notif) => {
                              const { icon: NotifIcon, color, bg } = typeIconMap[notif.type]
                              const timeAgo = (() => {
                                const diff = Date.now() - new Date(notif.timestamp).getTime()
                                const mins = Math.floor(diff / 60000)
                                if (mins < 1) return 'Just now'
                                if (mins < 60) return `${mins}m ago`
                                const hrs = Math.floor(mins / 60)
                                if (hrs < 24) return `${hrs}h ago`
                                return `${Math.floor(hrs / 24)}d ago`
                              })()
                              return (
                                <button
                                  key={notif.id}
                                  className={`w-full flex items-start gap-3 px-3 py-3 text-left hover:bg-muted transition-colors ${
                                    !notif.read ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''
                                  }`}
                                  onClick={() => {
                                    setNotifOpen(false)
                                    if (!notif.read && notifSocketRef.current?.connected) {
                                      notifSocketRef.current.emit('notifications:read', [notif.id])
                                    }
                                    setNotifications((prev) =>
                                      prev.map((n) => n.id === notif.id ? { ...n, read: true } : n)
                                    )
                                    if (notif.link) {
                                      const [page, query] = notif.link.split('?')
                                      const params = new URLSearchParams(query || '')
                                      if (page === 'design-detail') {
                                        const id = params.get('id')
                                        if (id) setSelectedDesignId(id)
                                        navigateTo('design-detail')
                                      } else if (page === 'designer-profile') {
                                        const designerId = params.get('designerId')
                                        if (designerId) setSelectedDesignerId(designerId)
                                        navigateTo('designer-profile')
                                      }
                                    }
                                  }}
                                >
                                  <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                    <NotifIcon className={`w-4 h-4 ${color}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm leading-snug">{notif.title}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{timeAgo}</p>
                                  </div>
                                  {!notif.read && (
                                    <span className="w-2 h-2 rounded-full bg-[#fb8000] flex-shrink-0 mt-2" />
                                  )}
                                </button>
                              )
                            })}
                          </div>
                          <div className="p-2 border-t border-border/50">
                            <button
                              className="w-full text-center text-sm text-[#fb8000] font-medium py-1.5 hover:bg-muted rounded-lg transition-colors"
                              onClick={() => {
                                setNotifOpen(false)
                                navigateTo('notifications')
                              }}
                            >
                              View all notifications
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* User Menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => {
                        setUserMenuOpen(!userMenuOpen)
                        setNotifOpen(false)
                      }}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors relative"
                    >
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full gradient-orange flex items-center justify-center ring-2 ring-transparent bg-clip-padding">
                          <span className="text-sm font-bold text-white">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
                      </div>
                      <span className="text-sm font-medium max-w-[100px] truncate">
                        {user.name}
                      </span>
                      <ChevronDown className="w-4 h-4 text-foreground/50" />
                    </button>
                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-56 bg-popover rounded-xl shadow-xl border border-border/50 overflow-hidden"
                        >
                          <div className="p-3 border-b border-border/50 relative">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-10 h-10 rounded-full gradient-orange flex items-center justify-center ring-2 ring-gradient-to-r from-[#fb8000] to-[#f59e0b] p-[2px]">
                                  <span className="text-sm font-bold text-white">
                                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                              </div>
                            </div>
                            {user.isPro && (
                              <span className="inline-flex items-center gap-1 mt-2 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                                <Sparkles className="w-3 h-3" /> Pro
                              </span>
                            )}
                          </div>
                          {/* Account Section */}
                          <div className="px-1 pt-1 pb-0.5">
                            <div className="px-3 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Account</div>
                          </div>
                          <div className="px-1">
                            <button
                              onClick={() => {
                                navigateTo('dashboard')
                                setUserMenuOpen(false)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted hover:translate-x-1 rounded-lg transition-all duration-200"
                            >
                              <LayoutDashboard className="w-4 h-4" /> Dashboard
                            </button>
                            <button
                              onClick={() => {
                                navigateTo('designer-profile')
                                setSelectedDesignerId(user.id)
                                setUserMenuOpen(false)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted hover:translate-x-1 rounded-lg transition-all duration-200"
                            >
                              <User className="w-4 h-4" /> My Profile
                            </button>
                            <button
                              onClick={() => {
                                setUserMenuOpen(false)
                                setEditProfileOpen(true)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted hover:translate-x-1 rounded-lg transition-all duration-200"
                            >
                              <Pencil className="w-4 h-4" /> Edit Profile
                            </button>
                          </div>
                          {/* Content Section */}
                          <div className="px-1 pt-1 pb-0.5 border-t border-border/50">
                            <div className="px-3 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Content</div>
                          </div>
                          <div className="px-1">
                            <button
                              onClick={() => {
                                navigateTo('messages')
                                setUserMenuOpen(false)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted hover:translate-x-1 rounded-lg transition-all duration-200"
                            >
                              <MessageCircle className="w-4 h-4" /> Messages
                            </button>
                            <button
                              onClick={() => {
                                navigateTo('saved')
                                setUserMenuOpen(false)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted hover:translate-x-1 rounded-lg transition-all duration-200"
                            >
                              <Bookmark className="w-4 h-4" /> My Collection
                            </button>
                            <button
                              onClick={() => {
                                navigateTo('collections')
                                setUserMenuOpen(false)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted hover:translate-x-1 rounded-lg transition-all duration-200"
                            >
                              <FolderOpen className="w-4 h-4" /> Collections
                            </button>
                            <button
                              onClick={() => {
                                navigateTo('upload')
                                setUserMenuOpen(false)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted hover:translate-x-1 rounded-lg transition-all duration-200"
                            >
                              <Upload className="w-4 h-4" /> Upload
                            </button>
                          </div>
                          {/* Preferences Section */}
                          <div className="px-1 pt-1 pb-0.5 border-t border-border/50">
                            <div className="px-3 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Preferences</div>
                          </div>
                          <div className="px-1">
                            <button
                              onClick={() => {
                                navigateTo('pricing')
                                setUserMenuOpen(false)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted hover:translate-x-1 rounded-lg transition-all duration-200"
                            >
                              <Sparkles className="w-4 h-4" /> Upgrade to Pro
                            </button>
                            <button
                              onClick={() => {
                                navigateTo('inspiration')
                                setUserMenuOpen(false)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted hover:translate-x-1 rounded-lg transition-all duration-200"
                            >
                              <Sparkles className="w-4 h-4 text-[#fb8000]" /> AI Studio
                            </button>
                            <button
                              onClick={() => {
                                navigateTo('settings')
                                setUserMenuOpen(false)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted hover:translate-x-1 rounded-lg transition-all duration-200"
                            >
                              <Settings className="w-4 h-4" /> Settings
                            </button>
                          </div>
                          <div className="p-1 border-t border-border/50">
                            <button
                              onClick={handleSignOut}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:translate-x-1 rounded-lg transition-all duration-200"
                            >
                              <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={() => navigateTo('auth')} data-tour-id="sign-in-button">
                    Sign In
                  </Button>
                  <Button onClick={() => navigateTo('auth')} data-tour-id="get-started-button" className="gradient-orange gradient-orange-hover text-white border-0">
                    Get Started
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search Bar with Autocomplete */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border/50 overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="relative" ref={searchRef}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={localSearch}
                    onChange={(e) => {
                      setLocalSearch(e.target.value)
                      setSuggestionsOpen(true)
                    }}
                    onFocus={() => { setSuggestionsOpen(true); setSearchFocused(true) }}
                    onBlur={() => setSearchFocused(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearch()
                      if (e.key === 'Escape') setSuggestionsOpen(false)
                    }}
                    placeholder="Search designs, categories, designers..."
                    className={`w-full pl-10 pr-4 py-2.5 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#fb8000]/50 transition-shadow duration-300 ${searchFocused ? 'shadow-[0_0_0_3px_rgba(251,128,0,0.15),0_4px_20px_rgba(251,128,0,0.1)]' : ''}`}
                    autoFocus
                  />
                  <AnimatePresence>
                    {showSuggestions && renderSuggestions()}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-md"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-popover shadow-2xl flex flex-col"
            >
              {/* Close button with animated X */}
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <span className="text-sm font-semibold">Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors group"
                  aria-label="Close menu"
                >
                  <motion.div
                    whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-4 h-4 transition-transform group-hover:text-[#fb8000]" />
                  </motion.div>
                </button>
              </div>
              <div className="p-4 flex-1 overflow-y-auto custom-scrollbar relative">
                {/* Mobile Search */}
                <div className="relative mb-4" ref={searchRef}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={localSearch}
                    onChange={(e) => {
                      setLocalSearch(e.target.value)
                      setSuggestionsOpen(true)
                    }}
                    onFocus={() => setSuggestionsOpen(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearch()
                      if (e.key === 'Escape') setSuggestionsOpen(false)
                    }}
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2.5 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#fb8000]/50"
                  />
                  <AnimatePresence>
                    {showSuggestions && renderSuggestions()}
                  </AnimatePresence>
                </div>

                <div className="space-y-1">
                  {navLinks.map((link, index) => {
                    const isActive = currentPage === link.page
                    return (
                      <motion.button
                        key={link.page}
                        initial={{ x: 40, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.05 * index, duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        onClick={() => {
                          navigateTo(link.page)
                          setMobileOpen(false)
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                          isActive
                            ? 'text-[#fb8000] bg-orange-50 dark:bg-orange-900/20'
                            : 'text-foreground/70 hover:bg-muted'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {link.icon && <link.icon className="w-4 h-4" />}
                          {link.label}
                        </span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#fb8000] shadow-[0_0_6px_rgba(251,128,0,0.6)]" />
                        )}
                      </motion.button>
                    )
                  })}
                </div>

                <div className="border-t border-border/50 mt-4 pt-4 space-y-1">
                  {isLoggedIn ? (
                    <>
                      <button
                        onClick={() => {
                          navigateTo('dashboard')
                          setMobileOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm rounded-xl transition-colors ${
                          currentPage === 'dashboard' ? 'text-[#fb8000] bg-orange-50 dark:bg-orange-900/20' : 'hover:bg-muted'
                        }`}
                      >
                        <span className="flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> Dashboard</span>
                        {currentPage === 'dashboard' && <span className="w-1.5 h-1.5 rounded-full bg-[#fb8000]" />}
                      </button>
                      <button
                        onClick={() => {
                          navigateTo('messages')
                          setMobileOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm rounded-xl transition-colors ${
                          currentPage === 'messages' ? 'text-[#fb8000] bg-orange-50 dark:bg-orange-900/20' : 'hover:bg-muted'
                        }`}
                      >
                        <span className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Messages</span>
                        {currentPage === 'messages' && <span className="w-1.5 h-1.5 rounded-full bg-[#fb8000]" />}
                      </button>
                      <button
                        onClick={() => {
                          navigateTo('notifications')
                          setMobileOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm rounded-xl transition-colors ${
                          currentPage === 'notifications' ? 'text-[#fb8000] bg-orange-50 dark:bg-orange-900/20' : 'hover:bg-muted'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Bell className="w-4 h-4" /> Notifications
                          {unreadCount > 0 && (
                            <span className="text-[10px] bg-[#fb8000] text-white px-1.5 py-0.5 rounded-full font-medium">{unreadCount}</span>
                          )}
                        </span>
                        {currentPage === 'notifications' && <span className="w-1.5 h-1.5 rounded-full bg-[#fb8000]" />}
                      </button>
                      <button
                        onClick={() => {
                          setMobileOpen(false)
                          setEditProfileOpen(true)
                        }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-muted rounded-xl"
                      >
                        <Pencil className="w-4 h-4" /> Edit Profile
                      </button>
                      <button
                        onClick={() => {
                          navigateTo('inspiration')
                          setMobileOpen(false)
                        }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-muted rounded-xl"
                      >
                        <Sparkles className="w-4 h-4 text-[#fb8000]" /> AI Studio
                      </button>
                      <button
                        onClick={() => {
                          navigateTo('saved')
                          setMobileOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm rounded-xl transition-colors ${
                          currentPage === 'saved' ? 'text-[#fb8000] bg-orange-50 dark:bg-orange-900/20' : 'hover:bg-muted'
                        }`}
                      >
                        <span className="flex items-center gap-2"><Bookmark className="w-4 h-4" /> My Collection</span>
                        {currentPage === 'saved' && <span className="w-1.5 h-1.5 rounded-full bg-[#fb8000]" />}
                      </button>
                      <button
                        onClick={() => {
                          navigateTo('collections')
                          setMobileOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm rounded-xl transition-colors ${
                          currentPage === 'collections' ? 'text-[#fb8000] bg-orange-50 dark:bg-orange-900/20' : 'hover:bg-muted'
                        }`}
                      >
                        <span className="flex items-center gap-2"><FolderOpen className="w-4 h-4" /> Collections</span>
                        {currentPage === 'collections' && <span className="w-1.5 h-1.5 rounded-full bg-[#fb8000]" />}
                      </button>
                      <button
                        onClick={() => {
                          navigateTo('wishlist')
                          setMobileOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm rounded-xl transition-colors ${
                          currentPage === 'wishlist' ? 'text-[#fb8000] bg-orange-50 dark:bg-orange-900/20' : 'hover:bg-muted'
                        }`}
                      >
                        <span className="flex items-center gap-2"><Heart className="w-4 h-4" /> Wishlist</span>
                        {currentPage === 'wishlist' && <span className="w-1.5 h-1.5 rounded-full bg-[#fb8000]" />}
                      </button>
                      <button
                        onClick={() => {
                          navigateTo('upload')
                          setMobileOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm rounded-xl transition-colors ${
                          currentPage === 'upload' ? 'text-[#fb8000] bg-orange-50 dark:bg-orange-900/20' : 'hover:bg-muted'
                        }`}
                      >
                        <span className="flex items-center gap-2"><Upload className="w-4 h-4" /> Upload</span>
                        {currentPage === 'upload' && <span className="w-1.5 h-1.5 rounded-full bg-[#fb8000]" />}
                      </button>
                      <button
                        onClick={() => {
                          navigateTo('settings')
                          setMobileOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm rounded-xl transition-colors ${
                          currentPage === 'settings' ? 'text-[#fb8000] bg-orange-50 dark:bg-orange-900/20' : 'hover:bg-muted'
                        }`}
                      >
                        <span className="flex items-center gap-2"><Settings className="w-4 h-4" /> Settings</span>
                        {currentPage === 'settings' && <span className="w-1.5 h-1.5 rounded-full bg-[#fb8000]" />}
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          navigateTo('auth')
                          setMobileOpen(false)
                        }}
                      >
                        Sign In
                      </Button>
                      <Button
                        className="w-full gradient-orange gradient-orange-hover text-white border-0"
                        onClick={() => {
                          navigateTo('auth')
                          setMobileOpen(false)
                        }}
                      >
                        Get Started
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {/* Gradient overlay at bottom */}
              <div className="h-12 bg-gradient-to-t from-popover to-transparent pointer-events-none flex-shrink-0" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Edit Dialog */}
      <ProfileEditDialog
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
      />
    </>
  )
}
