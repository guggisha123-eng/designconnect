'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { io, Socket } from 'socket.io-client'
import {
  MessageCircle, Send, Paperclip, ArrowLeft, Phone, Video,
  MoreVertical, Check, CheckCheck, Search, Smile, Image as ImageIcon,
  Bookmark, Pin, Trash2, BellOff, ChevronDown
} from 'lucide-react'
import { useNavStore } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'

/* ─── Types ─── */
interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  content: string
  timestamp: string
  read: boolean
}

interface ConversationMeta {
  id: string
  name: string
  avatar: string
  online: boolean
  participants: string[]
}

interface LocalConversation {
  id: string
  name: string
  avatar: string
  online: boolean
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isTyping: boolean
}

/* ─── Helper: format message time ─── */
function formatMessageTime(isoString: string): string {
  try {
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

/* ─── Helper: time ago ─── */
function timeAgo(isoString: string): string {
  try {
    const now = Date.now()
    const then = new Date(isoString).getTime()
    const diff = now - then

    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`

    const days = Math.floor(hours / 24)
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`

    return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

/* ─── Typing indicator component ─── */
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="flex items-center gap-1 px-4 py-2"
    >
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl rounded-bl-md px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-1.5">
          <motion.span
            className="w-2 h-2 bg-[#fb8000]/60 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
          />
          <motion.span
            className="w-2 h-2 bg-[#fb8000]/60 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
          />
          <motion.span
            className="w-2 h-2 bg-[#fb8000]/60 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
          />
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Main component ─── */
export default function MessagesPage() {
  const navigateTo = useNavStore((s) => s.navigateTo)
  const isLoggedIn = useNavStore((s) => s.isLoggedIn)
  const user = useNavStore((s) => s.user)
  const { toast } = useToast()

  // Socket ref
  const socketRef = useRef<Socket | null>(null)

  // State
  const [conversations, setConversations] = useState<LocalConversation[]>([
    { id: 'conv-1', name: 'Sarah Chen', avatar: 'SC', online: true, lastMessage: 'Sure, I can deliver the revised...', lastMessageTime: new Date(Date.now() - 60000).toISOString(), unreadCount: 1, isTyping: false },
    { id: 'conv-2', name: 'Alex Rivera', avatar: 'AR', online: true, lastMessage: 'The project files are ready', lastMessageTime: new Date(Date.now() - 3600000).toISOString(), unreadCount: 0, isTyping: false },
    { id: 'conv-3', name: 'Maya Patel', avatar: 'MP', online: false, lastMessage: 'Thanks for the feedback!', lastMessageTime: new Date(Date.now() - 10800000).toISOString(), unreadCount: 0, isTyping: false },
    { id: 'conv-4', name: 'James Wilson', avatar: 'JW', online: false, lastMessage: 'Let me check the timeline', lastMessageTime: new Date(Date.now() - 80000000).toISOString(), unreadCount: 0, isTyping: false },
    { id: 'conv-5', name: 'Luna Kim', avatar: 'LK', online: false, lastMessage: "I've uploaded the final version", lastMessageTime: new Date(Date.now() - 160000000).toISOString(), unreadCount: 0, isTyping: false },
  ])
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [messageSearch, setMessageSearch] = useState('')
  const [showMessageSearch, setShowMessageSearch] = useState(false)
  const [mobileShowChat, setMobileShowChat] = useState(false)
  const [connected, setConnected] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const messageListRef = useRef<HTMLDivElement>(null)

  const myId = user?.id || 'demo-user'
  const selectedConv = conversations.find(c => c.id === selectedConvId) || null

  // Filter conversations by search
  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Filter messages by search
  const filteredMessages = messageSearch
    ? messages.filter(m => m.content.toLowerCase().includes(messageSearch.toLowerCase()))
    : messages

  // Total unread count
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  // ─── Socket.io connection ───
  useEffect(() => {
    const socket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('[chat] Connected to socket server')
      setConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('[chat] Disconnected from socket server')
      setConnected(false)
    })

    // Notification join if logged in
    if (isLoggedIn && user?.id) {
      socket.emit('join', user.id)
    }

    // Chat history received
    socket.on('chat:history', (data: { conversationId: string; messages: ChatMessage[] }) => {
      setMessages(data.messages)
      // Scroll to bottom after loading history
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    })

    // New message received
    socket.on('chat:message', (message: ChatMessage) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(m => m.id === message.id)) return prev
        return [...prev, message]
      })

      // Update conversation list
      setConversations(prev => prev.map(c => {
        if (c.id === message.conversationId) {
          return {
            ...c,
            lastMessage: message.content.slice(0, 45) + (message.content.length > 45 ? '...' : ''),
            lastMessageTime: message.timestamp,
            unreadCount: message.senderId !== myId && message.conversationId !== selectedConvId
              ? c.unreadCount + 1
              : c.unreadCount,
          }
        }
        return c
      }))

      // Auto scroll if in current conversation
      if (message.conversationId === selectedConvId) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 50)
      }
    })

    // Typing indicator
    socket.on('chat:typing', (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      if (data.userId === myId) return // Don't show own typing

      if (data.conversationId === selectedConvId) {
        setIsTyping(data.isTyping)
      }

      // Update conversation list typing state
      setConversations(prev => prev.map(c => {
        if (c.id === data.conversationId) {
          return { ...c, isTyping: data.isTyping }
        }
        return c
      }))
    })

    // Read receipts
    socket.on('chat:read', (data: { conversationId: string; userId: string }) => {
      if (data.userId !== myId) {
        // Someone else read our messages - mark as read
        setMessages(prev => prev.map(m =>
          m.senderId === myId ? { ...m, read: true } : m
        ))
      }
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, []) // Connect once on mount

  // ─── Join conversation room when selecting ───
  useEffect(() => {
    if (!selectedConvId || !socketRef.current) return

    socketRef.current.emit('chat:join', selectedConvId)

    // Mark as read
    socketRef.current.emit('chat:read', { conversationId: selectedConvId, userId: myId })

    // Update unread count locally
    setConversations(prev => prev.map(c =>
      c.id === selectedConvId ? { ...c, unreadCount: 0, isTyping: false } : c
    ))
  }, [selectedConvId])

  // ─── Auto-scroll on new messages ───
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, isTyping])

  // ─── Auto-resize textarea ───
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [messageInput])

  const handleSelectConversation = useCallback((convId: string) => {
    setSelectedConvId(convId)
    setMobileShowChat(true)
    setMessages([])
    setIsTyping(false)
    setMessageSearch('')
    setShowMessageSearch(false)

    // Focus textarea after a short delay
    setTimeout(() => textareaRef.current?.focus(), 200)
  }, [])

  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim() || !selectedConvId || !socketRef.current) return

    const content = messageInput.trim()
    setSendingMessage(true)

    socketRef.current.emit('chat:message', {
      conversationId: selectedConvId,
      senderId: myId,
      content,
      timestamp: new Date().toISOString(),
    })

    setMessageInput('')

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    // Clear typing state
    socketRef.current.emit('chat:typing', {
      conversationId: selectedConvId,
      userId: myId,
      isTyping: false,
    })

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }

    setSendingMessage(false)
  }, [messageInput, selectedConvId, myId])

  const handleInputChange = useCallback((value: string) => {
    setMessageInput(value)

    // Emit typing event
    if (socketRef.current && selectedConvId) {
      socketRef.current.emit('chat:typing', {
        conversationId: selectedConvId,
        userId: myId,
        isTyping: true,
      })

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('chat:typing', {
          conversationId: selectedConvId!,
          userId: myId,
          isTyping: false,
        })
      }, 2000)
    }
  }, [selectedConvId, myId])

  const handleBack = useCallback(() => {
    setMobileShowChat(false)
    setSelectedConvId(null)
    setMessages([])
    setIsTyping(false)
  }, [])

  const handleMarkAsRead = useCallback((convId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('chat:read', { conversationId: convId, userId: myId })
    }
    setConversations(prev => prev.map(c =>
      c.id === convId ? { ...c, unreadCount: 0 } : c
    ))
    toast({ title: 'Marked as read' })
  }, [myId, toast])

  // ─── Message search highlight ───
  const highlightText = (text: string, query: string) => {
    if (!query) return text
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, i) =>
      regex.test(part)
        ? <mark key={i} className="bg-[#fb8000]/30 dark:bg-[#fb8000]/40 rounded px-0.5">{part}</mark>
        : part
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-border/50 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => navigateTo('home')}
                aria-label="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl sm:text-3xl font-bold">Messages</h1>
              {totalUnread > 0 && (
                <Badge className="bg-gradient-to-r from-[#fb8000] to-orange-500 text-white border-0 text-xs">
                  {totalUnread} new
                </Badge>
              )}
              <div className="ml-auto flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-400'}`} />
                <span className="text-xs text-muted-foreground">{connected ? 'Connected' : 'Reconnecting...'}</span>
              </div>
            </div>
            <p className="text-muted-foreground ml-11 text-sm">
              Chat with designers about projects and collaborations
            </p>
          </motion.div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-slate-800/50 overflow-hidden"
          style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}
        >
          <div className="flex h-full">
            {/* ─── Conversation List - Left Panel ─── */}
            <div className={`w-full md:w-80 lg:w-96 border-r border-border/30 dark:border-slate-800/50 flex flex-col ${
              mobileShowChat ? 'hidden md:flex' : 'flex'
            }`}>
              {/* Search */}
              <div className="p-3 sm:p-4 border-b border-border/30 dark:border-slate-800/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#fb8000]/40 border border-transparent focus:border-[#fb8000]/30 transition-all"
                  />
                </div>
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <AnimatePresence>
                  {filteredConversations.map((conv, i) => (
                    <motion.div
                      key={conv.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`relative ${
                        selectedConvId === conv.id ? 'border-l-[3px] border-l-[#fb8000]' : 'border-l-[3px] border-l-transparent'
                      }`}
                    >
                      <button
                        onClick={() => handleSelectConversation(conv.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all duration-200 hover:bg-white/60 dark:hover:bg-slate-800/40 ${
                          selectedConvId === conv.id
                            ? 'bg-gradient-to-r from-[#fb8000]/10 to-orange-50/30 dark:from-[#fb8000]/15 dark:to-orange-900/10'
                            : ''
                        } ${conv.unreadCount > 0 ? 'bg-orange-50/30 dark:bg-orange-900/5' : ''}`}
                      >
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <Avatar className="w-12 h-12 ring-2 ring-white/50 dark:ring-slate-800/50">
                            <AvatarFallback className="bg-gradient-to-br from-[#fb8000] to-orange-400 text-white font-semibold text-sm">
                              {conv.avatar}
                            </AvatarFallback>
                          </Avatar>
                          {conv.online && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm shadow-green-500/30" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={`text-sm ${conv.unreadCount > 0 ? 'font-bold' : 'font-medium'} truncate`}>
                              {conv.name}
                            </span>
                            <span className="text-[11px] text-muted-foreground flex-shrink-0 ml-2">
                              {timeAgo(conv.lastMessageTime)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            {conv.isTyping ? (
                              <p className="text-xs text-[#fb8000] font-medium italic">
                                typing...
                              </p>
                            ) : (
                              <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                {conv.lastMessage}
                              </p>
                            )}
                            {conv.unreadCount > 0 && (
                              <span className="min-w-[20px] h-5 flex items-center justify-center rounded-full bg-gradient-to-r from-[#fb8000] to-orange-500 text-white text-[10px] font-bold flex-shrink-0 ml-2 px-1.5 shadow-sm shadow-[#fb8000]/30">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Context menu trigger */}
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleMarkAsRead(conv.id)}>
                              <CheckCheck className="w-4 h-4 mr-2" />
                              Mark as Read
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast({ title: 'Coming soon', description: 'Pin conversation feature coming soon!' })}>
                              <Pin className="w-4 h-4 mr-2" />
                              Pin Conversation
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast({ title: 'Coming soon', description: 'Mute conversation feature coming soon!' })}>
                              <BellOff className="w-4 h-4 mr-2" />
                              Mute
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {filteredConversations.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <Search className="w-8 h-8 text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">No conversations found</p>
                  </div>
                )}
              </div>
            </div>

            {/* ─── Chat Area - Right Panel ─── */}
            <div className={`flex-1 flex flex-col ${
              mobileShowChat ? 'flex' : 'hidden md:flex'
            }`}>
              {selectedConv ? (
                <>
                  {/* Chat Header */}
                  <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-border/30 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 md:hidden"
                        onClick={handleBack}
                        aria-label="Back"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <div className="relative">
                        <Avatar className="w-10 h-10 ring-2 ring-white/30 dark:ring-slate-800/30">
                          <AvatarFallback className="bg-gradient-to-br from-[#fb8000] to-orange-400 text-white font-semibold text-sm">
                            {selectedConv.avatar}
                          </AvatarFallback>
                        </Avatar>
                        {selectedConv.online && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">{selectedConv.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {isTyping ? (
                            <span className="text-[#fb8000] font-medium">typing...</span>
                          ) : selectedConv.online ? (
                            <span className="text-green-500 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                              Online
                            </span>
                          ) : (
                            'Offline'
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 hidden sm:flex"
                        onClick={() => toast({ title: 'Coming soon', description: 'Voice calls coming soon!' })}
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 hidden sm:flex"
                        onClick={() => toast({ title: 'Coming soon', description: 'Video calls coming soon!' })}
                      >
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0"
                        onClick={() => setShowMessageSearch(!showMessageSearch)}
                      >
                        <Search className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleMarkAsRead(selectedConv.id)}>
                            <CheckCheck className="w-4 h-4 mr-2" />
                            Mark as Read
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast({ title: 'Coming soon', description: 'Bookmark feature coming soon!' })}>
                            <Bookmark className="w-4 h-4 mr-2" />
                            Bookmark Chat
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast({ title: 'Coming soon', description: 'Clear chat feature coming soon!' })}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear Chat
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Message Search Bar */}
                  <AnimatePresence>
                    {showMessageSearch && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-b border-border/30 dark:border-slate-800/50"
                      >
                        <div className="px-4 py-2 bg-white/30 dark:bg-slate-800/30">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <input
                              type="text"
                              value={messageSearch}
                              onChange={(e) => setMessageSearch(e.target.value)}
                              placeholder="Search in conversation..."
                              className="w-full pl-9 pr-8 py-1.5 bg-white/60 dark:bg-slate-800/60 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#fb8000]/40"
                              autoFocus
                            />
                            {messageSearch && (
                              <button
                                onClick={() => setMessageSearch('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          {messageSearch && (
                            <p className="text-[10px] text-muted-foreground mt-1 pl-1">
                              {filteredMessages.length} result{filteredMessages.length !== 1 ? 's' : ''} found
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Messages Area */}
                  <div
                    ref={messageListRef}
                    className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 py-4 space-y-1 bg-gradient-to-b from-slate-50/30 to-white/30 dark:from-slate-950/30 dark:to-slate-900/30"
                  >
                    {filteredMessages.length === 0 && messages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="space-y-3"
                        >
                          <div className="text-5xl">👋</div>
                          <h3 className="text-lg font-semibold">Start the conversation!</h3>
                          <p className="text-sm text-muted-foreground max-w-xs">
                            Send a message to {selectedConv.name} to begin chatting
                          </p>
                        </motion.div>
                      </div>
                    )}

                    {filteredMessages.map((msg, i) => {
                      const isMe = msg.senderId === myId
                      const showAvatar = !isMe && (
                        i === 0 || filteredMessages[i - 1]?.senderId === 'me'
                      )
                      const isLastInGroup = i === filteredMessages.length - 1 || filteredMessages[i + 1]?.senderId !== msg.senderId

                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-4' : 'mt-0.5'}`}
                        >
                          {!isMe && (
                            <div className="w-8 flex-shrink-0 mr-2">
                              {showAvatar && (
                                <Avatar className="w-8 h-8 ring-1 ring-white/30 dark:ring-slate-800/30">
                                  <AvatarFallback className="bg-gradient-to-br from-[#fb8000] to-orange-400 text-white font-semibold text-[10px]">
                                    {selectedConv.avatar}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          )}
                          <div className={`max-w-[75%] sm:max-w-[65%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div
                              className={`px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                                isMe
                                  ? 'bg-gradient-to-br from-[#fb8000] to-orange-500 text-white rounded-2xl rounded-br-md'
                                  : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-foreground rounded-2xl rounded-bl-md border border-white/30 dark:border-slate-700/30'
                              }`}
                            >
                              {messageSearch ? highlightText(msg.content, messageSearch) : msg.content}
                            </div>
                            {isLastInGroup && (
                              <div className={`flex items-center gap-1.5 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-[10px] text-muted-foreground/70">
                                  {formatMessageTime(msg.timestamp)}
                                </span>
                                {isMe && (
                                  msg.read
                                    ? <CheckCheck className="w-3.5 h-3.5 text-[#fb8000]" />
                                    : <Check className="w-3.5 h-3.5 text-muted-foreground/50" />
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                    <AnimatePresence>
                      {isTyping && <TypingIndicator />}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="border-t border-border/30 dark:border-slate-800/50 p-3 sm:p-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
                    <div className="flex items-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 flex-shrink-0 hidden sm:flex"
                        onClick={() => toast({ title: 'Coming soon', description: 'File attachments coming soon!' })}
                      >
                        <Paperclip className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 flex-shrink-0 hidden sm:flex"
                        onClick={() => toast({ title: 'Coming soon', description: 'Emoji picker coming soon!' })}
                      >
                        <Smile className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <div className="flex-1 relative">
                        <textarea
                          ref={textareaRef}
                          value={messageInput}
                          onChange={(e) => handleInputChange(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSendMessage()
                            }
                          }}
                          placeholder="Type a message..."
                          rows={1}
                          className="w-full px-4 py-2.5 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#fb8000]/30 border border-transparent focus:border-[#fb8000]/20 resize-none transition-all max-h-[120px]"
                          style={{ minHeight: '42px' }}
                        />
                      </div>
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || sendingMessage}
                        className={`h-10 w-10 p-0 rounded-xl flex-shrink-0 transition-all duration-300 border-0 ${
                          messageInput.trim()
                            ? 'bg-gradient-to-r from-[#fb8000] to-orange-500 hover:from-[#fb8000]/90 hover:to-orange-500/90 shadow-md shadow-[#fb8000]/30 hover:shadow-lg hover:shadow-[#fb8000]/40'
                            : 'bg-muted text-muted-foreground'
                        }`}
                        aria-label="Send message"
                      >
                        <Send className={`w-4 h-4 transition-transform ${messageInput.trim() ? 'translate-x-0.5 -translate-y-0.5' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                /* Empty State */
                <div className="flex-1 flex flex-col items-center justify-center px-4 bg-gradient-to-b from-slate-50/30 to-white/30 dark:from-slate-950/30 dark:to-slate-900/30">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center"
                  >
                    <div className="relative mb-6">
                      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#fb8000] to-orange-400 flex items-center justify-center mx-auto shadow-xl shadow-orange-500/25">
                        <MessageCircle className="w-12 h-12 text-white" />
                      </div>
                      <motion.div
                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <span className="text-white text-sm">💬</span>
                      </motion.div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Your Messages</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
                      Select a conversation to start chatting with designers about your projects
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        variant="outline"
                        className="gap-2 border-[#fb8000]/30 hover:bg-[#fb8000]/5"
                        onClick={() => navigateTo('browse')}
                      >
                        <Search className="w-4 h-4" />
                        Find Designers
                      </Button>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
