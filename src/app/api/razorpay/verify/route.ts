import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      planName,
    } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment verification fields' },
        { status: 400 }
      )
    }

    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET

    if (!razorpaySecret) {
      return NextResponse.json(
        { error: 'Razorpay secret not configured' },
        { status: 500 }
      )
    }

    // Verify the payment signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Payment verification failed - invalid signature' },
        { status: 400 }
      )
    }

    // Payment is verified! Now update user's Pro status in Supabase
    // Using server client with auth cookies for RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      const cookieStore = req.cookies
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {
            // No need to set cookies back for update
          },
        },
      })

      // Calculate expiry date (30 days from now for monthly, 365 days for yearly)
      const isYearly = planName === 'Pro Yearly'
      const proExpiresAt = new Date()
      proExpiresAt.setDate(proExpiresAt.getDate() + (isYearly ? 365 : 30))

      const { error: dbError } = await supabase
        .from('users')
        .update({
          is_pro: true,
          pro_plan: planName,
          pro_expiry: proExpiresAt.toISOString(),
        })
        .eq('id', userId)

      if (dbError) {
        console.error('Database update error:', dbError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and Pro activated successfully!',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    })
  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 500 }
    )
  }
}
