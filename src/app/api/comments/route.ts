import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const designId = req.nextUrl.searchParams.get('designId')
    if (!designId) {
      return NextResponse.json({ error: 'designId is required' }, { status: 400 })
    }

    const comments = await db.comment.findMany({
      where: { designId },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { content, designId, userId, userName, userAvatar } = body

    if (!content || !designId || !userId) {
      return NextResponse.json({ error: 'content, designId, and userId are required' }, { status: 400 })
    }

    const comment = await db.comment.create({
      data: {
        content,
        designId,
        userId,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        }
      }
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const commentId = req.nextUrl.searchParams.get('id')
    if (!commentId) {
      return NextResponse.json({ error: 'comment id is required' }, { status: 400 })
    }

    await db.comment.delete({ where: { id: commentId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
}
