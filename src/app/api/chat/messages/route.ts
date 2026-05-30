import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/chat/messages?conversationId=xxx&userId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const userId = searchParams.get('userId')

    if (!conversationId || !userId) {
      return NextResponse.json({ error: 'conversationId and userId are required' }, { status: 400 })
    }

    const messages = await db.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 100,
    })

    // Mark messages as read
    await db.chatMessage.updateMany({
      where: {
        conversationId,
        receiverId: userId,
        isRead: false,
      },
      data: { isRead: true },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching chat messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST /api/chat/messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, senderId, receiverId, conversationId } = body

    if (!content || !senderId || !receiverId || !conversationId) {
      return NextResponse.json({ error: 'content, senderId, receiverId, and conversationId are required' }, { status: 400 })
    }

    const message = await db.chatMessage.create({
      data: {
        content,
        senderId,
        receiverId,
        conversationId,
      },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Error creating chat message:', error)
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
}
