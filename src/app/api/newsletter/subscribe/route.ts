import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const trimmedEmail = email.trim().toLowerCase()

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Check if already subscribed in database
    const existing = await db.newsletterSubscriber.findUnique({
      where: { email: trimmedEmail }
    })

    if (existing) {
      return NextResponse.json(
        { message: "You're already subscribed!", alreadySubscribed: true },
        { status: 200 }
      )
    }

    // Store the email in database
    await db.newsletterSubscriber.create({
      data: { email: trimmedEmail }
    })

    return NextResponse.json(
      { message: 'Thanks for subscribing!', email: trimmedEmail },
      { status: 200 }
    )
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const subscribers = await db.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ count: subscribers.length })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
