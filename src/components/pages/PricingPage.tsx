'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check, X, Sparkles, Zap, Shield, Download, Star,
  Users, Palette, ArrowRight, Crown, CreditCard,
  Loader2, AlertCircle, CheckCircle2, XCircle
} from 'lucide-react'
import { useNavStore } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

// Declare Razorpay global type
declare global {
  interface Window {
    Razorpay: any
  }
}

const plans = [
  {
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Perfect for getting started',
    icon: Palette,
    features: [
      { text: 'Upload up to 10 designs', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'Community support', included: true },
      { text: 'Standard download speed', included: true },
      { text: 'Pro badge on profile', included: false },
      { text: 'Featured design placement', included: false },
      { text: 'Priority support', included: false },
      { text: 'Custom profile themes', included: false },
      { text: 'Advanced analytics', included: false },
      { text: '0% commission on sales', included: false },
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    monthlyPrice: 499,   // INR per month
    yearlyPrice: 3999,    // INR per year (save ~33%)
    description: 'For serious designers',
    icon: Zap,
    features: [
      { text: 'Unlimited design uploads', included: true },
      { text: 'Advanced analytics & insights', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Fast download speed', included: true },
      { text: 'Pro badge on profile', included: true },
      { text: 'Featured design placement', included: true },
      { text: 'Priority support', included: true },
      { text: 'Custom profile themes', included: false },
      { text: 'Advanced analytics', included: true },
      { text: '5% commission on sales', included: false },
    ],
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    name: 'Enterprise',
    monthlyPrice: 1499,   // INR per month
    yearlyPrice: 11999,   // INR per year
    description: 'For teams and agencies',
    icon: Crown,
    features: [
      { text: 'Unlimited uploads', included: true },
      { text: 'Team collaboration tools', included: true },
      { text: '24/7 priority support', included: true },
      { text: 'Fastest download speed', included: true },
      { text: 'Pro badge on profile', included: true },
      { text: 'Featured design placement', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Custom profile themes', included: true },
      { text: 'Enterprise analytics', included: true },
      { text: '0% commission on sales', included: true },
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

const faqs = [
  { q: 'Can I cancel my subscription at any time?', a: 'Yes, you can cancel your Pro or Enterprise subscription at any time. Your benefits will continue until the end of your billing period.' },
  { q: 'What payment methods do you accept?', a: 'We accept UPI, Credit Cards, Debit Cards, Net Banking, and all popular wallets through Razorpay. All payments are 100% secure.' },
  { q: 'Is there a free trial for Pro?', a: 'Yes! We offer a 7-day free trial for the Pro plan. No credit card required to start.' },
  { q: 'What happens to my designs if I downgrade?', a: 'Your designs remain published. If you have more than the free limit, older designs will remain visible but you won\'t be able to upload new ones until you free up space or upgrade again.' },
  { q: 'Do you offer refunds?', a: 'We offer a 30-day money-back guarantee on all paid plans. If you\'re not satisfied, contact support for a full refund.' },
]

type PaymentStatus = 'idle' | 'loading' | 'success' | 'error'

export default function PricingPage() {
  const { navigateTo, isLoggedIn, user, upgradeToPro } = useNavStore()
  const [isYearly, setIsYearly] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle')
  const [paymentMessage, setPaymentMessage] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const initiatePayment = async (planName: string, amount: number) => {
    if (!isLoggedIn || !user) {
      setPaymentStatus('error')
      setPaymentMessage('Please sign in first to upgrade!')
      setTimeout(() => navigateTo('auth'), 1500)
      return
    }

    if (user?.isPro) {
      setPaymentStatus('error')
      setPaymentMessage('You are already a Pro member!')
      setTimeout(() => setPaymentStatus('idle'), 3000)
      return
    }

    setPaymentStatus('loading')
    setPaymentMessage('Opening payment gateway...')
    setSelectedPlan(planName)

    try {
      // Step 1: Create Razorpay order from our backend
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: 'INR',
          planName: isYearly ? `${planName} Yearly` : planName,
          userId: user.id,
        }),
      })

      const orderData = await res.json()

      if (!res.ok) {
        // If Razorpay not configured, show helpful message
        if (orderData.error?.includes('not configured')) {
          setPaymentStatus('error')
          setPaymentMessage('Payment gateway is being set up. Please try again later or contact support.')
          return
        }
        throw new Error(orderData.error || 'Failed to create order')
      }

      // Step 2: Load Razorpay script and open checkout
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        setPaymentStatus('error')
        setPaymentMessage('Failed to load payment gateway. Please check your internet connection.')
        return
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Design Connect',
        description: `${planName} Plan${isYearly ? ' (Yearly)' : ' (Monthly)'}`,
        image: '/logo.svg',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // Step 3: Verify payment on backend
          setPaymentMessage('Verifying payment...')
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user.id,
                planName: isYearly ? `${planName} Yearly` : planName,
              }),
            })

            const verifyData = await verifyRes.json()

            if (verifyRes.ok && verifyData.success) {
              // Payment successful! Upgrade user locally
              upgradeToPro()
              setPaymentStatus('success')
              setPaymentMessage('Payment successful! Welcome to Pro! 🎉')
            } else {
              setPaymentStatus('error')
              setPaymentMessage('Payment verification failed. Contact support with your payment ID.')
            }
          } catch (err) {
            console.error('Verification error:', err)
            setPaymentStatus('error')
            setPaymentMessage('Payment received but verification failed. We will confirm shortly.')
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#fb8000',
        },
        modal: {
          ondismiss: function () {
            setPaymentStatus('idle')
            setPaymentMessage('Payment cancelled.')
            setTimeout(() => setPaymentMessage(''), 3000)
          },
        },
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.on('payment.failed', function (response: any) {
        setPaymentStatus('error')
        setPaymentMessage(`Payment failed: ${response.error.description}. Please try again.`)
      })

      paymentObject.open()

    } catch (error: any) {
      console.error('Payment initiation error:', error)
      setPaymentStatus('error')
      setPaymentMessage(error.message || 'Something went wrong. Please try again.')
    }
  }

  const handlePlanSelect = (planName: string) => {
    setPaymentMessage('')
    setPaymentStatus('idle')

    if (planName === 'Free') {
      if (isLoggedIn) {
        setPaymentMessage('You are already on the Free plan!')
      } else {
        navigateTo('auth')
      }
    } else if (planName === 'Pro') {
      const amount = isYearly ? plans[1].yearlyPrice : plans[1].monthlyPrice
      initiatePayment('Pro', amount)
    } else if (planName === 'Enterprise') {
      navigateTo('contact')
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-orange-100 text-orange-700 border-0">
              <Sparkles className="w-3 h-3 mr-1" /> Simple, transparent pricing
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Choose Your{' '}
              <span className="bg-gradient-to-r from-[#fb8000] to-[#f59e0b] bg-clip-text text-transparent">
                Creative Plan
              </span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Start free and scale as you grow. All prices are in INR. No hidden fees, cancel anytime.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={`text-sm ${!isYearly ? 'font-medium' : 'text-muted-foreground'}`}>Monthly</span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  isYearly ? 'bg-[#fb8000]' : 'bg-muted'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    isYearly ? 'left-8' : 'left-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${isYearly ? 'font-medium' : 'text-muted-foreground'}`}>
                Yearly
              </span>
              {isYearly && (
                <Badge className="bg-green-100 text-green-700 border-0">Save 33%</Badge>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Payment Status Banner */}
      <AnimatePresence>
        {paymentMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6',
            )}
          >
            <div className={cn(
              'p-4 rounded-xl flex items-center gap-3 border',
              paymentStatus === 'loading' && 'bg-blue-50 text-blue-700 border-blue-200',
              paymentStatus === 'success' && 'bg-green-50 text-green-700 border-green-200',
              paymentStatus === 'error' && 'bg-red-50 text-red-700 border-red-200',
              paymentStatus === 'idle' && 'bg-slate-50 text-slate-600 border-slate-200',
            )}>
              {paymentStatus === 'loading' && <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />}
              {paymentStatus === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
              {paymentStatus === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              {paymentStatus === 'idle' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              <span className="text-sm font-medium">{paymentMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 pb-16">
        <div className="grid md:grid-cols-3 gap-6 mt-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className={cn(
                  'relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all',
                  plan.popular && 'ring-2 ring-[#fb8000] scale-105 shadow-xl'
                )}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 gradient-orange text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                    Most Popular
                  </div>
                )}
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      plan.popular ? 'gradient-orange' : 'bg-muted'
                    )}>
                      <plan.icon className={cn(
                        'w-5 h-5',
                        plan.popular ? 'text-white' : 'text-muted-foreground'
                      )} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-medium">₹</span>
                      <span className="text-4xl font-bold">
                        {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                      </span>
                      {plan.monthlyPrice > 0 && (
                        <span className="text-muted-foreground text-sm">
                          /{isYearly ? 'year' : 'month'}
                        </span>
                      )}
                    </div>
                    {isYearly && plan.monthlyPrice > 0 && (
                      <p className="text-xs text-green-600 mt-1">
                        ₹{Math.round(plan.yearlyPrice / 12)}/month billed annually
                      </p>
                    )}
                  </div>

                  {plan.monthlyPrice > 0 && (
                    <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
                      <Shield className="w-3 h-3" />
                      <span>Secure payment via Razorpay (UPI, Cards, Net Banking)</span>
                    </div>
                  )}

                  <Button
                    className={cn(
                      'w-full mb-6',
                      plan.popular
                        ? 'gradient-orange gradient-orange-hover text-white border-0'
                        : 'border',
                      paymentStatus === 'loading' && selectedPlan === plan.name && 'opacity-70 pointer-events-none'
                    )}
                    onClick={() => handlePlanSelect(plan.name)}
                    disabled={paymentStatus === 'loading' && selectedPlan === plan.name}
                  >
                    {paymentStatus === 'loading' && selectedPlan === plan.name ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      plan.cta
                    )}
                  </Button>

                  <div className="space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature.text} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground/30 mt-0.5 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${feature.included ? '' : 'text-muted-foreground/50'}`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">{faq.q}</h3>
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Card className="border-0 bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white overflow-hidden">
            <CardContent className="p-10">
              <h3 className="text-2xl font-bold mb-2">Still have questions?</h3>
              <p className="text-slate-400 mb-6">
                Our team is ready to help you find the perfect plan.
              </p>
              <Button
                onClick={() => navigateTo('contact')}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 gap-2"
              >
                Contact Sales <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
