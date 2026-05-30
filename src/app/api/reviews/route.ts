import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const designId = req.nextUrl.searchParams.get('designId')
    if (!designId) {
      return NextResponse.json({ error: 'designId is required' }, { status: 400 })
    }

    const reviews = await db.review.findMany({
      where: { designId },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    // Rating distribution
    const distribution = [1, 2, 3, 4, 5].map(star => ({
      star,
      count: reviews.filter(r => r.rating === star).length,
      percentage: reviews.length > 0
        ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100)
        : 0,
    }))

    return NextResponse.json({
      reviews,
      summary: {
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length,
        distribution,
      }
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { rating, title, content, designId, userId } = body

    if (!rating || !designId || !userId) {
      return NextResponse.json({ error: 'rating, designId, and userId are required' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Upsert: one review per user per design
    const review = await db.review.upsert({
      where: {
        designId_userId: { designId, userId }
      },
      update: {
        rating,
        title,
        content,
      },
      create: {
        rating,
        title,
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

    // Update design's average rating
    const allReviews = await db.review.findMany({ where: { designId } })
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    await db.design.update({
      where: { id: designId },
      data: {
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
      }
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
