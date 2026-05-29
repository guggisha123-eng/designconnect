import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'INR', planName, userId } = await req.json()

    if (!amount || !userId) {
      return NextResponse.json(
        { error: 'Amount and userId are required' },
        { status: 400 }
      )
    }

    const razorpayKey = process.env.RAZORPAY_KEY_ID
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET

    if (!razorpayKey || !razorpaySecret) {
      return NextResponse.json(
        { error: 'Razorpay credentials not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your environment variables.' },
        { status: 500 }
      )
    }

    const razorpay = new Razorpay({
      key_id: razorpayKey,
      key_secret: razorpaySecret,
    })

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise (smallest currency unit)
      currency,
      receipt: `dc_${planName.toLowerCase()}_${userId}_${Date.now()}`,
      notes: {
        planName,
        userId,
        platform: 'design-connect',
      },
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: razorpayKey,
    })
  } catch (error: any) {
    console.error('Razorpay order creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment order' },
      { status: 500 }
    )
  }
}
