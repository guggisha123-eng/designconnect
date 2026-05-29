import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('dc_session')?.value

    if (!sessionId) {
      return NextResponse.json({ authenticated: false, user: null })
    }

    const user = await db.user.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        bio: true,
        location: true,
        isPro: true,
        isVerified: true,
        isAdmin: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null })
    }

    return NextResponse.json({ authenticated: true, user })
  } catch (error) {
    console.error('Check error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
