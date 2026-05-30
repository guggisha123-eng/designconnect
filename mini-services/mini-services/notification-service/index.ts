import { createServer } from 'http'
import { Server } from 'socket.io'

const PORT = 3003

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

// ─── Notification Store (existing) ───
const notificationStore = new Map<string, Notification[]>()

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

const demoNotificationTemplates: { type: NotificationType; title: string; message: string; avatar: string; link: string }[] = [
  { type: 'like', title: 'New like on your design', message: 'Someone liked your "Modern Brand Identity" design', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', link: 'design-detail?id=1' },
  { type: 'follow', title: 'Sarah Chen started following you', message: 'You have a new follower! Sarah Chen is now following your work.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', link: 'designer-profile?designerId=sarah' },
  { type: 'comment', title: 'New comment on your design', message: 'Marcus Johnson commented on "App UI Template": "Love the clean layout!"', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus', link: 'design-detail?id=4' },
  { type: 'feature', title: 'Your design was featured', message: 'Congratulations! "Minimal Logo Pack" has been featured on the homepage.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=system', link: 'design-detail?id=2' },
  { type: 'download', title: 'New download: App UI Template', message: 'Someone purchased and downloaded your "App UI Template" design.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=buyer', link: 'design-detail?id=4' },
  { type: 'reference', title: 'Maya Patel referenced your design', message: 'Maya Patel used your "Social Media Kit" as a reference in their project.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maya', link: 'design-detail?id=3' },
  { type: 'like', title: 'Your design is trending', message: '"Poster Collection" is getting a lot of attention! 50 new likes today.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=trending', link: 'design-detail?id=5' },
  { type: 'system', title: 'Welcome to DesignConnect!', message: 'Thanks for joining! Start by uploading your first design or browsing our collection.', avatar: null, link: null },
  { type: 'follow', title: 'Alex Rivera started following you', message: 'A new designer is following your work. Check out their profile!', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', link: 'designer-profile?designerId=alex' },
  { type: 'comment', title: 'New reply to your comment', message: 'Luna Kim replied to your comment on "Icon Set Premium".', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luna', link: 'design-detail?id=6' },
]

let notifIdCounter = 0

function generateId(): string {
  notifIdCounter++
  return `notif-${Date.now()}-${notifIdCounter}`
}

function getNotificationsForUser(userId: string): Notification[] {
  if (!notificationStore.has(userId)) {
    const demoNotifications: Notification[] = demoNotificationTemplates.map((tmpl, i) => ({
      id: generateId(),
      type: tmpl.type,
      title: tmpl.title,
      message: tmpl.message,
      timestamp: new Date(Date.now() - (i * 15 * 60 * 1000)).toISOString(),
      read: i >= 4,
      avatar: tmpl.avatar,
      link: tmpl.link,
    }))
    notificationStore.set(userId, demoNotifications)
  }
  return notificationStore.get(userId)!
}

function addNotificationToUser(userId: string, notification: Notification): void {
  const existing = notificationStore.get(userId) || []
  existing.unshift(notification)
  if (existing.length > 100) {
    existing.splice(100)
  }
  notificationStore.set(userId, existing)
}

// ─── Chat Store (new) ───
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

let chatMsgIdCounter = 0

function generateChatId(): string {
  chatMsgIdCounter++
  return `chatmsg-${Date.now()}-${chatMsgIdCounter}`
}

// In-memory chat storage: Map<conversationId, ChatMessage[]>
const chatStore = new Map<string, ChatMessage[]>()

// Conversation metadata
const conversationMeta: Map<string, ConversationMeta> = new Map([
  ['conv-1', { id: 'conv-1', name: 'Sarah Chen', avatar: 'SC', online: true, participants: ['demo-user', 'conv-1'] }],
  ['conv-2', { id: 'conv-2', name: 'Alex Rivera', avatar: 'AR', online: true, participants: ['demo-user', 'conv-2'] }],
  ['conv-3', { id: 'conv-3', name: 'Maya Patel', avatar: 'MP', online: false, participants: ['demo-user', 'conv-3'] }],
  ['conv-4', { id: 'conv-4', name: 'James Wilson', avatar: 'JW', online: false, participants: ['demo-user', 'conv-4'] }],
  ['conv-5', { id: 'conv-5', name: 'Luna Kim', avatar: 'LK', online: false, participants: ['demo-user', 'conv-5'] }],
])

// Pre-seed 5 demo conversations with realistic messages
function seedChatStore(): void {
  const now = Date.now()

  chatStore.set('conv-1', [
    { id: generateChatId(), conversationId: 'conv-1', senderId: 'demo-user', content: 'Hi Sarah! I love the brand identity concept you shared.', timestamp: new Date(now - 3600000).toISOString(), read: true },
    { id: generateChatId(), conversationId: 'conv-1', senderId: 'conv-1', content: 'Thank you so much! I put a lot of thought into the color palette.', timestamp: new Date(now - 3500000).toISOString(), read: true },
    { id: generateChatId(), conversationId: 'conv-1', senderId: 'demo-user', content: 'The orange tones really pop. Could we try a version with slightly more muted tones?', timestamp: new Date(now - 3000000).toISOString(), read: true },
    { id: generateChatId(), conversationId: 'conv-1', senderId: 'conv-1', content: "Absolutely! I'll prepare a few variations for you to review.", timestamp: new Date(now - 2500000).toISOString(), read: true },
    { id: generateChatId(), conversationId: 'conv-1', senderId: 'demo-user', content: 'That would be perfect. Also, can we include a dark mode version?', timestamp: new Date(now - 2000000).toISOString(), read: true },
    { id: generateChatId(), conversationId: 'conv-1', senderId: 'conv-1', content: 'Sure, I can deliver the revised versions by tomorrow morning. Should I include the icon set too?', timestamp: new Date(now - 60000).toISOString(), read: false },
  ])

  chatStore.set('conv-2', [
    { id: generateChatId(), conversationId: 'conv-2', senderId: 'demo-user', content: "Hey Alex, how's the UI template coming along?", timestamp: new Date(now - 7200000).toISOString(), read: true },
    { id: generateChatId(), conversationId: 'conv-2', senderId: 'conv-2', content: "It's looking great! I've finished the dashboard screens.", timestamp: new Date(now - 7000000).toISOString(), read: true },
    { id: generateChatId(), conversationId: 'conv-2', senderId: 'demo-user', content: "Can you share a preview? I'd love to see the progress.", timestamp: new Date(now - 6500000).toISOString(), read: true },
    { id: generateChatId(), conversationId: 'conv-2', senderId: 'conv-2', content: 'The project files are ready. Let me upload them to the shared drive.', timestamp: new Date(now - 3600000).toISOString(), read: true },
  ])

  chatStore.set('conv-3', [
    { id: generateChatId(), conversationId: 'conv-3', senderId: 'demo-user', content: 'Maya, the social media kit looks fantastic!', timestamp: new Date(now - 14400000).toISOString(), read: true },
    { id: generateChatId(), conversationId: 'conv-3', senderId: 'conv-3', content: 'Oh that means a lot coming from you! 🎨', timestamp: new Date(now - 14000000).toISOString(), read: true },
    { id: generateChatId(), conversationId: 'conv-3', senderId: 'demo-user', content: 'I especially love the Instagram templates. The layout is very clean.', timestamp: new Date(now - 13000000).toISOString(), read: true },
    { id: generateChatId(), conversationId: 'conv-3', senderId: 'conv-3', content: 'Thanks for the feedback! I can customize them further if you need.', timestamp: new Date(now - 10800000).toISOString(), read: true },
  ])

  chatStore.set('conv-4', [
    { id: generateChatId(), conversationId: 'conv-4', senderId: 'demo-user', content: 'Hi James, are you still available for the website redesign project?', timestamp: new Date(now - 86400000).toISOString(), read: true },
    { id: generateChatId(), conversationId: 'conv-4', senderId: 'conv-4', content: "Yes, I'm interested! What's the scope?", timestamp: new Date(now - 86000000).toISOString(), read: true },
    { id: generateChatId(), conversationId: 'conv-4', senderId: 'demo-user', content: "It's a full redesign with about 12 pages. Timeline is 3 weeks.", timestamp: new Date(now - 85000000).toISOString(), read: true },
    { id: generateChatId(), conversationId: 'conv-4', senderId: 'conv-4', content: 'Let me check the timeline and get back to you by end of day.', timestamp: new Date(now - 80000000).toISOString(), read: true },
  ])

  chatStore.set('conv-5', [
    { id: generateChatId(), conversationId: 'conv-5', senderId: 'demo-user', content: "Luna, how's the poster collection coming along?", timestamp: new Date(now - 172800000).toISOString(), read: true },
    { id: generateChatId(), conversationId: 'conv-5', senderId: 'conv-5', content: 'Almost done! Just finalizing the typography on a few pieces.', timestamp: new Date(now - 170000000).toISOString(), read: true },
    { id: generateChatId(), conversationId: 'conv-5', senderId: 'demo-user', content: 'Take your time, quality over speed!', timestamp: new Date(now - 168000000).toISOString(), read: true },
    { id: generateChatId(), conversationId: 'conv-5', senderId: 'conv-5', content: "I've uploaded the final version. Check it out when you get a chance!", timestamp: new Date(now - 160000000).toISOString(), read: true },
  ])
}

seedChatStore()

// Auto-response messages
const autoResponses = [
  "That sounds great! Let me work on that.",
  "I'll send you the draft by tomorrow.",
  "Thanks for the feedback! I'll make those changes.",
  "Can we schedule a call to discuss this?",
  "I've already started working on it!",
  "No problem, I'll update the files right away.",
  "Great idea! Let me explore that direction.",
  "I appreciate your patience. Almost done!",
  "Let me check with the team and get back to you.",
  "Perfect! I'll have the final version ready soon.",
]

// Typing state: Map<conversationId, Set<userId>>
const typingUsers = new Map<string, Set<string>>()

// ─── Socket.io Event Handlers ───
io.on('connection', (socket) => {
  console.log(`[notification-service] Client connected: ${socket.id}`)

  let currentUserId: string | null = null
  let currentConversationId: string | null = null

  // ─── Existing notification events ───
  socket.on('join', (userId: string) => {
    currentUserId = userId
    socket.join(`user:${userId}`)
    console.log(`[notification-service] User ${userId} joined their notification room`)

    // Send existing notifications
    const notifications = getNotificationsForUser(userId)
    socket.emit('notifications:initial', notifications)
  })

  socket.on('notifications:read', (notificationIds: string[]) => {
    if (!currentUserId) return
    const notifications = notificationStore.get(currentUserId)
    if (notifications) {
      notificationIds.forEach((id) => {
        const notif = notifications.find((n) => n.id === id)
        if (notif) notif.read = true
      })
    }
    console.log(`[notification-service] User ${currentUserId} marked ${notificationIds.length} notifications as read`)
  })

  socket.on('notifications:readAll', () => {
    if (!currentUserId) return
    const notifications = notificationStore.get(currentUserId)
    if (notifications) {
      notifications.forEach((n) => {
        n.read = true
      })
    }
    console.log(`[notification-service] User ${currentUserId} marked all notifications as read`)
  })

  socket.on('notifications:clear', () => {
    if (!currentUserId) return
    notificationStore.set(currentUserId, [])
    console.log(`[notification-service] User ${currentUserId} cleared all notifications`)
  })

  // ─── New chat events ───
  socket.on('chat:join', (conversationId: string) => {
    // Leave previous conversation room if any
    if (currentConversationId) {
      socket.leave(`chat:${currentConversationId}`)
      // Clear typing for previous conversation
      const prevTyping = typingUsers.get(currentConversationId)
      if (prevTyping) {
        prevTyping.delete(currentUserId || 'demo-user')
        if (prevTyping.size === 0) {
          typingUsers.delete(currentConversationId)
        }
      }
    }

    currentConversationId = conversationId
    socket.join(`chat:${conversationId}`)
    console.log(`[notification-service] User ${currentUserId || 'unknown'} joined chat room: ${conversationId}`)

    // Send conversation history
    const messages = chatStore.get(conversationId) || []
    socket.emit('chat:history', { conversationId, messages })

    // Send conversation metadata
    const meta = conversationMeta.get(conversationId)
    if (meta) {
      socket.emit('chat:meta', meta)
    }
  })

  socket.on('chat:message', (data: { conversationId: string; senderId: string; content: string; timestamp?: string }) => {
    const { conversationId, senderId, content } = data

    const message: ChatMessage = {
      id: generateChatId(),
      conversationId,
      senderId,
      content,
      timestamp: new Date().toISOString(),
      read: false,
    }

    // Store message
    const existing = chatStore.get(conversationId) || []
    existing.push(message)
    chatStore.set(conversationId, existing)

    // Broadcast to all users in that room
    io.to(`chat:${conversationId}`).emit('chat:message', message)

    console.log(`[notification-service] Chat message in ${conversationId} from ${senderId}: ${content.substring(0, 50)}`)

    // Clear typing indicator for sender
    const typingSet = typingUsers.get(conversationId)
    if (typingSet) {
      typingSet.delete(senderId)
      if (typingSet.size === 0) {
        typingUsers.delete(conversationId)
      }
      // Broadcast typing stopped
      io.to(`chat:${conversationId}`).emit('chat:typing', { conversationId, userId: senderId, isTyping: false })
    }

    // Auto-response after 1-3 seconds (only for demo conversations)
    if (conversationId.startsWith('conv-')) {
      const responseDelay = 1000 + Math.random() * 2000

      // Start typing indicator for auto-responder
      setTimeout(() => {
        const responderId = conversationId // The conversation ID is also the responder's user ID
        let convTyping = typingUsers.get(conversationId)
        if (!convTyping) {
          convTyping = new Set()
          typingUsers.set(conversationId, convTyping)
        }
        convTyping.add(responderId)
        io.to(`chat:${conversationId}`).emit('chat:typing', { conversationId, userId: responderId, isTyping: true })

        // Send auto-response
        setTimeout(() => {
          // Remove typing
          const tSet = typingUsers.get(conversationId)
          if (tSet) {
            tSet.delete(responderId)
            if (tSet.size === 0) typingUsers.delete(conversationId)
          }
          io.to(`chat:${conversationId}`).emit('chat:typing', { conversationId, userId: responderId, isTyping: false })

          const responseContent = autoResponses[Math.floor(Math.random() * autoResponses.length)]
          const responseMessage: ChatMessage = {
            id: generateChatId(),
            conversationId,
            senderId: responderId,
            content: responseContent,
            timestamp: new Date().toISOString(),
            read: false,
          }

          // Store response
          const msgs = chatStore.get(conversationId) || []
          msgs.push(responseMessage)
          chatStore.set(conversationId, msgs)

          // Broadcast response
          io.to(`chat:${conversationId}`).emit('chat:message', responseMessage)

          console.log(`[notification-service] Auto-response in ${conversationId}: ${responseContent.substring(0, 50)}`)
        }, 800 + Math.random() * 1200)
      }, responseDelay)
    }
  })

  socket.on('chat:typing', (data: { conversationId: string; userId: string; isTyping: boolean }) => {
    const { conversationId, userId, isTyping } = data

    let convTyping = typingUsers.get(conversationId)
    if (isTyping) {
      if (!convTyping) {
        convTyping = new Set()
        typingUsers.set(conversationId, convTyping)
      }
      convTyping.add(userId)
    } else {
      if (convTyping) {
        convTyping.delete(userId)
        if (convTyping.size === 0) {
          typingUsers.delete(conversationId)
        }
      }
    }

    // Broadcast typing state to others in the room
    socket.to(`chat:${conversationId}`).emit('chat:typing', { conversationId, userId, isTyping })
  })

  socket.on('chat:read', (data: { conversationId: string; userId: string }) => {
    const { conversationId, userId } = data

    // Mark messages as read
    const messages = chatStore.get(conversationId)
    if (messages) {
      messages.forEach((msg) => {
        if (msg.senderId !== userId) {
          msg.read = true
        }
      })
    }

    // Notify others in the room that messages have been read
    io.to(`chat:${conversationId}`).emit('chat:read', { conversationId, userId })

    console.log(`[notification-service] User ${userId} marked messages as read in ${conversationId}`)
  })

  socket.on('chat:history', (conversationId: string) => {
    const messages = chatStore.get(conversationId) || []
    socket.emit('chat:history', { conversationId, messages })
  })

  socket.on('disconnect', () => {
    console.log(`[notification-service] Client disconnected: ${socket.id}`)

    // Clean up typing state
    if (currentConversationId && currentUserId) {
      const convTyping = typingUsers.get(currentConversationId)
      if (convTyping) {
        convTyping.delete(currentUserId)
        if (convTyping.size === 0) {
          typingUsers.delete(currentConversationId)
        }
        // Broadcast typing stopped
        io.to(`chat:${currentConversationId}`).emit('chat:typing', { conversationId: currentConversationId, userId: currentUserId, isTyping: false })
      }
    }
  })
})

// Generate demo notifications periodically (every 30 seconds) for demo users
const DEMO_USER_IDS = ['demo-designer', 'demo-client']

setInterval(() => {
  DEMO_USER_IDS.forEach((userId) => {
    const tmpl = demoNotificationTemplates[Math.floor(Math.random() * demoNotificationTemplates.length)]
    const notification: Notification = {
      id: generateId(),
      type: tmpl.type,
      title: tmpl.title,
      message: tmpl.message,
      timestamp: new Date().toISOString(),
      read: false,
      avatar: tmpl.avatar,
      link: tmpl.link,
    }

    addNotificationToUser(userId, notification)

    // Emit to the user's room
    io.to(`user:${userId}`).emit('notification', notification)
    console.log(`[notification-service] Sent demo notification to ${userId}: ${notification.title}`)
  })
}, 30000)

// Start the server
httpServer.listen(PORT, () => {
  console.log(`[notification-service] Server running on port ${PORT}`)
})
