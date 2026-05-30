'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { io, Socket } from 'socket.io-client'
import {
  Heart, UserPlus, MessageSquare, Award, Download, Bookmark, Bell,
  Settings, Check, Trash2, ChevronDown, Filter
} from 'lucide-react'
import { useNavStore } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

type NotificationType = 'like' | 'follow' | 'comment' | 'feature' | 'download' | 'reference' | 'system'

interface Notification {
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
  follow: { icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  comment: { icon: MessageSquare, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
  feature: { icon: Award, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  download: { icon: Download, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  reference: { icon: Bookmark, color: 'text-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/30' },
  system: { icon: Bell, color: 'text-[#fb8000]', bg: 'bg-orange-100 dark:bg-orange-900/30' },
}

const filterTabs = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'like', label: 'Likes' },
  { value: 'follow', label: 'Follows' },
  { value: 'comment', label: 'Comments' },
  { value: 'reference', label: 'Mentions' },
]

// Demo notifications for when WebSocket is not connected
const demoNotifications: Notification[] = [
  {
    id: 'demo-1', type: 'like', title: 'New like on your design',
    message: 'Someone liked your "Modern Brand Identity" design',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    read: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', link: 'design-detail?id=1'
  },
  {
    id: 'demo-2', type: 'follow', title: 'Sarah Chen started following you',
    message: 'You have a new follower! Sarah Chen is now following your work.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', link: 'designer-profile?designerId=sarah'
  },
  {
    id: 'demo-3', type: 'comment', title: 'New comment on your design',
    message: 'Marcus Johnson commented on "App UI Template": "Love the clean layout!"',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus', link: 'design-detail?id=4'
  },
  {
    id: 'demo-4', type: 'feature', title: 'Your design was featured',
    message: 'Congratulations! "Minimal Logo Pack" has been featured on the homepage.',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    read: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=system', link: 'design-detail?id=2'
  },
  {
    id: 'demo-5', type: 'download', title: 'New download: App UI Template',
    message: 'Someone purchased and downloaded your "App UI Template" design.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: true, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=buyer', link: 'design-detail?id=4'
  },
  {
    id: 'demo-6', type: 'reference', title: 'Maya Patel referenced your design',
    message: 'Maya Patel used your "Social Media Kit" as a reference in their project.',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    read: true, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maya', link: 'design-detail?id=3'
  },
  {
    id: 'demo-7', type: 'like', title: 'Your design is trending',
    message: '"Poster Collection" is getting a lot of attention! 50 new likes today.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    read: true, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=trending', link: 'design-detail?id=5'
  },
  {
    id: 'demo-8', type: 'system', title: 'Welcome to DesignConnect!',
    message: 'Thanks for joining! Start by uploading your first design or browsing our collection.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    read: true, avatar: null, link: null
  },
  {
    id: 'demo-9', type: 'follow', title: 'Alex Rivera started following you',
    message: 'A new designer is following your work. Check out their profile!',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    read: true, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', link: 'designer-profile?designerId=alex'
  },
  {
    id: 'demo-10', type: 'comment', title: 'New reply to your comment',
    message: 'Luna Kim replied to your comment on "Icon Set Premium".',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    read: true, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luna', link: 'design-detail?id=6'
  },
  {
    id: 'demo-11', type: 'like', title: 'Multiple likes on your design',
    message: '"Business Card Template" received 12 new likes in the last hour.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=likes', link: 'design-detail?id=7'
  },
  {
    id: 'demo-12', type: 'download', title: 'New download: Website Hero Bundle',
    message: 'A customer just purchased your "Website Hero Bundle" for $39.',
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    read: true, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=buyer2', link: 'design-detail?id=8'
  },
]

function formatTimeAgo(timestamp: string): string {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diffMs = now - then

  const minutes = Math.floor(diffMs / (1000 * 60))
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}

export default function NotificationCenterPage() {
  const { isLoggedIn, user, navigateTo, setSelectedDesignId, setSelectedDesignerId } = useNavStore()
  const [notifications, setNotifications] = useState<Notification[]>(demoNotifications)
  const [activeFilter, setActiveFilter] = useState('all')
  const [displayCount, setDisplayCount] = useState(10)
  const [isConnected, setIsConnected] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  // WebSocket connection
  useEffect(() => {
    if (!isLoggedIn || !user) return

    const socket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      console.log('[NotificationCenter] Connected to notification service')
      setIsConnected(true)
      socket.emit('join', user.id)
    })

    socket.on('disconnect', () => {
      console.log('[NotificationCenter] Disconnected from notification service')
      setIsConnected(false)
    })

    socket.on('notifications:initial', (initialNotifications: Notification[]) => {
      setNotifications(initialNotifications)
    })

    socket.on('notification', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev])
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [isLoggedIn, user])

  // Filter notifications
  const filteredNotifications = notifications.filter((notif) => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'unread') return !notif.read
    if (activeFilter === 'reference') return notif.type === 'reference' || notif.type === 'system'
    return notif.type === activeFilter
  })

  const displayedNotifications = filteredNotifications.slice(0, displayCount)
  const hasMore = filteredNotifications.length > displayCount
  const unreadCount = notifications.filter((n) => !n.read).length

  const handleNotificationClick = useCallback((notif: Notification) => {
    // Mark as read locally
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    )

    // Mark as read via WebSocket
    if (socketRef.current?.connected) {
      socketRef.current.emit('notifications:read', [notif.id])
    }

    // Navigate if there's a link
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
  }, [navigateTo, setSelectedDesignId, setSelectedDesignerId])

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    if (socketRef.current?.connected) {
      socketRef.current.emit('notifications:readAll')
    }
  }, [])

  const handleClearAll = useCallback(() => {
    setNotifications([])
    if (socketRef.current?.connected) {
      socketRef.current.emit('notifications:clear')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#fb8000] to-[#e57600] flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Notifications</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  {isConnected ? (
                    <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Live
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                      Offline
                    </span>
                  )}
                  {unreadCount > 0 && (
                    <Badge className="bg-[#fb8000] text-white border-0 text-xs px-2 py-0 ml-1">
                      {unreadCount} unread
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllRead}
                  className="gap-1.5 text-xs hover:border-[#fb8000] hover:text-[#fb8000]"
                >
                  <Check className="w-3.5 h-3.5" />
                  Mark All Read
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
                className="text-muted-foreground hover:text-[#fb8000]"
              >
                <Settings className="w-4.5 h-4.5" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-6 overflow-hidden"
            >
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold">Notification Settings</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear All
                  </Button>
                </div>
                <div className="space-y-3">
                  {[
                    { type: 'like' as NotificationType, label: 'Likes', desc: 'When someone likes your design' },
                    { type: 'follow' as NotificationType, label: 'Follows', desc: 'When someone follows you' },
                    { type: 'comment' as NotificationType, label: 'Comments', desc: 'When someone comments on your design' },
                    { type: 'feature' as NotificationType, label: 'Features', desc: 'When your design gets featured' },
                    { type: 'download' as NotificationType, label: 'Downloads', desc: 'When someone downloads your design' },
                    { type: 'reference' as NotificationType, label: 'References', desc: 'When someone references your work' },
                  ].map((setting) => {
                    const Icon = typeIconMap[setting.type].icon
                    return (
                      <div key={setting.type} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${typeIconMap[setting.type].bg} flex items-center justify-center`}>
                            <Icon className={`w-4 h-4 ${typeIconMap[setting.type].color}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{setting.label}</p>
                            <p className="text-xs text-muted-foreground">{setting.desc}</p>
                          </div>
                        </div>
                        <div className="w-10 h-5 rounded-full bg-[#fb8000] flex items-center px-0.5 cursor-pointer">
                          <div className="w-4 h-4 rounded-full bg-white shadow ml-auto" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6"
        >
          <Tabs value={activeFilter} onValueChange={setActiveFilter}>
            <TabsList className="w-full justify-start overflow-x-auto bg-muted/50 p-1 rounded-xl h-auto gap-1">
              {filterTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:bg-[#fb8000] data-[state=active]:text-white text-xs sm:text-sm px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
                >
                  {tab.label}
                  {tab.value === 'unread' && unreadCount > 0 && (
                    <span className="ml-1.5 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Notification List */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {displayedNotifications.map((notif, index) => {
              const { icon: Icon, color, bg } = typeIconMap[notif.type]
              return (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, x: -20, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.98 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.03,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Card
                    className={`group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-[#fb8000]/30 ${
                      notif.read
                        ? 'bg-card/50'
                        : 'bg-card border-l-2 border-l-[#fb8000]'
                    }`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="p-4 flex items-start gap-3">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium leading-snug ${notif.read ? 'text-foreground/80' : 'text-foreground'}`}>
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <span className="w-2.5 h-2.5 rounded-full bg-[#fb8000] flex-shrink-0 mt-1 animate-pulse" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-muted-foreground/70">
                            {formatTimeAgo(notif.timestamp)}
                          </span>
                          {notif.type && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0 h-4 capitalize bg-muted/80"
                            >
                              {notif.type}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Avatar */}
                      {notif.avatar && (
                        <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                          <img
                            src={notif.avatar}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {/* Empty State */}
          {filteredNotifications.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="py-20 text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Bell className="w-10 h-10 text-[#fb8000]/60" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No notifications yet</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                {activeFilter === 'all'
                  ? "You're all caught up! When you get notifications, they'll show up here."
                  : `No ${activeFilter === 'unread' ? 'unread' : activeFilter} notifications at the moment.`}
              </p>
              {activeFilter !== 'all' && (
                <Button
                  variant="outline"
                  onClick={() => setActiveFilter('all')}
                  className="mt-4 gap-1.5 hover:border-[#fb8000] hover:text-[#fb8000]"
                >
                  <Filter className="w-3.5 h-3.5" />
                  View All Notifications
                </Button>
              )}
            </motion.div>
          )}

          {/* Load More */}
          {hasMore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pt-4 pb-8 text-center"
            >
              <Button
                variant="outline"
                onClick={() => setDisplayCount((prev) => prev + 10)}
                className="gap-2 hover:border-[#fb8000] hover:text-[#fb8000]"
              >
                <ChevronDown className="w-4 h-4" />
                Load More ({filteredNotifications.length - displayCount} remaining)
              </Button>
            </motion.div>
          )}

          {/* Summary footer */}
          {filteredNotifications.length > 0 && !hasMore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pt-4 pb-8 text-center"
            >
              <p className="text-xs text-muted-foreground">
                Showing all {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                {activeFilter !== 'all' && ` in ${activeFilter}`}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
