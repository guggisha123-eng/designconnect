import { NextRequest, NextResponse } from 'next/server'

// In-memory store for recently viewed designs (per session/user)
// In production this would use a database
const recentlyViewedStore: Record<string, { designId: string; viewedAt: number }[]> = {}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId') || 'anonymous'
    const views = recentlyViewedStore[userId] || []
    // Return last 10 viewed designs
    return NextResponse.json(views.slice(0, 10))
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch recently viewed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, designId } = body

    if (!designId) {
      return NextResponse.json({ error: 'designId is required' }, { status: 400 })
    }

    const uid = userId || 'anonymous'
    if (!recentlyViewedStore[uid]) {
      recentlyViewedStore[uid] = []
    }

    // Remove existing entry for this design (avoid duplicates)
    recentlyViewedStore[uid] = recentlyViewedStore[uid].filter(v => v.designId !== designId)

    // Add to front
    recentlyViewedStore[uid].unshift({ designId, viewedAt: Date.now() })

    // Keep only last 20
    recentlyViewedStore[uid] = recentlyViewedStore[uid].slice(0, 20)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 })
  }
}
