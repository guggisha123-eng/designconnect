'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check, X, Sparkles, Zap, Shield, Download, Star,
  Users, Palette, ArrowRight, Crown, CreditCard,
  Loader2, AlertCircle, CheckCircle2, XCircle,
  Smartphone, Building2, Wallet, QrCode, Lock,
  ChevronLeft, CircleDot
} from 'lucide-react'
import { useNavStore } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

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
    monthlyPrice: 499,
    yearlyPrice: 3999,
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
    monthlyPrice: 1499,
    yearlyPrice: 11999,
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
  { q: 'What payment methods do you accept?', a: 'We accept UPI, Credit Cards, Debit Cards, Net Banking, and all popular wallets. All payments are 100% secure and encrypted.' },
  { q: 'Is there a free trial for Pro?', a: 'Yes! We offer a 7-day free trial for the Pro plan. No credit card required to start.' },
  { q: 'What happens to my designs if I downgrade?', a: 'Your designs remain published. If you have more than the free limit, older designs will remain visible but you won\'t be able to upload new ones until you free up space or upgrade again.' },
  { q: 'Do you offer refunds?', a: 'We offer a 30-day money-back guarantee on all paid plans. If you\'re not satisfied, contact support for a full refund.' },
]

type PayMethod = 'upi' | 'card' | 'netbanking' | 'wallet'
type CheckoutStep = 'idle' | 'method' | 'processing' | 'success' | 'failed'

const paymentMethods: { id: PayMethod; label: string; icon: any; desc: string }[] = [
  { id: 'upi', label: 'UPI', icon: Smartphone, desc: 'Google Pay, PhonePe, Paytm, BHIM' },
  { id: 'card', label: 'Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net Banking', icon: Building2, desc: 'All major banks supported' },
  { id: 'wallet', label: 'Wallet', icon: Wallet, desc: 'Paytm, Amazon Pay, Mobikwik' },
]

export default function PricingPage() {
  const { navigateTo, isLoggedIn, user, upgradeToPro } = useNavStore()
  const [isYearly, setIsYearly] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('idle')
  const [selectedMethod, setSelectedMethod] = useState<PayMethod>('upi')
  const [selectedPlanName, setSelectedPlanName] = useState('')
  const [selectedAmount, setSelectedAmount] = useState(0)
  const [upiId, setUpiId] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardName, setCardName] = useState('')
  const [bannerMsg, setBannerMsg] = useState('')
  const [bannerType, setBannerType] = useState<'info' | 'success' | 'error'>('info')

  const showBanner = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setBannerMsg(msg)
    setBannerType(type)
    setTimeout(() => setBannerMsg(''), 4000)
  }

  const openCheckout = (planName: string) => {
    if (!isLoggedIn || !user) {
      showBanner('Please sign in first to upgrade!', 'error')
      setTimeout(() => navigateTo('auth'), 1500)
      return
    }
    if (user?.isPro) {
      showBanner('You are already a Pro member!', 'error')
      return
    }
    if (planName === 'Free') {
      showBanner('You are already on the Free plan!', 'info')
      return
    }

    const plan = plans.find(p => p.name === planName)
    if (!plan) return

    const amount = isYearly ? plan.yearlyPrice : plan.monthlyPrice
    setSelectedPlanName(planName)
    setSelectedAmount(amount)
    setCheckoutStep('method')
    setUpiId('')
    setCardNumber('')
    setCardExpiry('')
    setCardCvv('')
    setCardName('')
  }

  const processPayment = () => {
    // Validate inputs
    if (selectedMethod === 'upi' && !upiId.includes('@')) {
      showBanner('Please enter a valid UPI ID (e.g. name@upi)', 'error')
      return
    }
    if (selectedMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) {
        showBanner('Please enter a valid 16-digit card number', 'error')
        return
      }
      if (!cardExpiry || cardCvv.length < 3) {
        showBanner('Please enter card expiry and CVV', 'error')
        return
      }
    }

    // Start processing
    setCheckoutStep('processing')

    // Simulate payment processing (2-3 seconds)
    setTimeout(() => {
      // 90% success rate simulation
      const isSuccess = Math.random() > 0.1
      if (isSuccess) {
        setCheckoutStep('success')
        upgradeToPro()
        showBanner('Payment successful! Welcome to Pro!', 'success')
      } else {
        setCheckoutStep('failed')
        showBanner('Payment failed. Please try again.', 'error')
      }
    }, 2500)
  }

  const closeCheckout = () => {
    setCheckoutStep('idle')
    setBannerMsg('')
  }

  const handlePlanSelect = (planName: string) => {
    if (planName === 'Enterprise') {
      navigateTo('contact')
    } else {
      openCheckout(planName)
    }
  }

  const currentAmount = selectedAmount
  const isProPlan = selectedPlanName === 'Pro'

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
              <span className={cn('text-sm', !isYearly ? 'font-medium' : 'text-muted-foreground')}>Monthly</span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={cn('relative w-14 h-7 rounded-full transition-colors', isYearly ? 'bg-[#fb8000]' : 'bg-muted')}
              >
                <div className={cn('absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform', isYearly ? 'left-8' : 'left-1')} />
              </button>
              <span className={cn('text-sm', isYearly ? 'font-medium' : 'text-muted-foreground')}>Yearly</span>
              {isYearly && <Badge className="bg-green-100 text-green-700 border-0">Save 33%</Badge>}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Banner */}
      <AnimatePresence>
        {bannerMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
            <div className={cn(
              'p-4 rounded-xl flex items-center gap-3 border',
              bannerType === 'info' && 'bg-blue-50 text-blue-700 border-blue-200',
              bannerType === 'success' && 'bg-green-50 text-green-700 border-green-200',
              bannerType === 'error' && 'bg-red-50 text-red-700 border-red-200',
            )}>
              {bannerType === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
              {bannerType === 'error' && <XCircle className="w-5 h-5 flex-shrink-0" />}
              {bannerType === 'info' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              <span className="text-sm font-medium">{bannerMsg}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 pb-16">
        <div className="grid md:grid-cols-3 gap-6 mt-4">
          {plans.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className={cn(
                'relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all',
                plan.popular && 'ring-2 ring-[#fb8000] scale-105 shadow-xl'
              )}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 gradient-orange text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                    Most Popular
                  </div>
                )}
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', plan.popular ? 'gradient-orange' : 'bg-muted')}>
                      <plan.icon className={cn('w-5 h-5', plan.popular ? 'text-white' : 'text-muted-foreground')} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-medium">₹</span>
                      <span className="text-4xl font-bold">{isYearly ? plan.yearlyPrice : plan.monthlyPrice}</span>
                      {plan.monthlyPrice > 0 && (
                        <span className="text-muted-foreground text-sm">/{isYearly ? 'year' : 'month'}</span>
                      )}
                    </div>
                    {isYearly && plan.monthlyPrice > 0 && (
                      <p className="text-xs text-green-600 mt-1">₹{Math.round(plan.yearlyPrice / 12)}/month billed annually</p>
                    )}
                  </div>

                  {plan.monthlyPrice > 0 && (
                    <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
                      <Shield className="w-3 h-3" />
                      <span>Secure payment (UPI, Cards, Net Banking, Wallet)</span>
                    </div>
                  )}

                  <Button
                    className={cn(
                      'w-full mb-6',
                      plan.popular ? 'gradient-orange gradient-orange-hover text-white border-0' : 'border',
                    )}
                    onClick={() => handlePlanSelect(plan.name)}
                  >
                    {plan.cta}
                  </Button>

                  <div className="space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature.text} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground/30 mt-0.5 flex-shrink-0" />
                        )}
                        <span className={cn('text-sm', !feature.included && 'text-muted-foreground/50')}>{feature.text}</span>
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
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
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
              <p className="text-slate-400 mb-6">Our team is ready to help you find the perfect plan.</p>
              <Button onClick={() => navigateTo('contact')} variant="outline" className="border-white/20 text-white hover:bg-white/10 gap-2">
                Contact Sales <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ==================== PAYMENT CHECKOUT MODAL ==================== */}
      <AnimatePresence>
        {checkoutStep !== 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && checkoutStep !== 'processing' && closeCheckout()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >

              {/* ========== SUCCESS SCREEN ========== */}
              {checkoutStep === 'success' && (
                <div className="p-8 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                  </motion.div>
                  <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-2xl font-bold text-green-800 mb-2">
                    Payment Successful!
                  </motion.h2>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-muted-foreground mb-1">
                    Welcome to Design Connect Pro
                  </motion.p>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                    className="inline-block mt-2 px-4 py-1 rounded-full gradient-orange text-white text-sm font-bold">
                    Pro Member
                  </motion.div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                    className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-muted-foreground space-y-1">
                    <p>Order ID: DC{Date.now().toString().slice(-8)}</p>
                    <p>Amount Paid: ₹{currentAmount}</p>
                    <p>Plan: {selectedPlanName} ({isYearly ? 'Yearly' : 'Monthly'})</p>
                  </motion.div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-6">
                    <Button className="w-full gradient-orange text-white border-0" onClick={closeCheckout}>
                      Start Exploring Pro Features
                    </Button>
                  </motion.div>
                </div>
              )}

              {/* ========== FAILED SCREEN ========== */}
              {checkoutStep === 'failed' && (
                <div className="p-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-red-800 mb-2">Payment Failed</h2>
                  <p className="text-muted-foreground mb-6">
                    Your payment could not be processed. Please try again with a different method.
                  </p>
                  <div className="space-y-3">
                    <Button className="w-full gradient-orange text-white border-0" onClick={() => setCheckoutStep('method')}>
                      Try Again
                    </Button>
                    <Button variant="outline" className="w-full" onClick={closeCheckout}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* ========== PROCESSING SCREEN ========== */}
              {checkoutStep === 'processing' && (
                <div className="p-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-100 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-[#fb8000] animate-spin" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">Processing Payment...</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Please wait while we process your payment. Do not close this window.
                  </p>
                  <div className="flex justify-center gap-2">
                    <CircleDot className="w-3 h-3 text-[#fb8000] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <CircleDot className="w-3 h-3 text-[#fb8000] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <CircleDot className="w-3 h-3 text-[#fb8000] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-muted-foreground">
                    <div className="flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Encrypted & Secure Connection</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ========== PAYMENT METHOD SELECTION SCREEN ========== */}
              {checkoutStep === 'method' && (
                <div>
                  {/* Header */}
                  <div className="gradient-orange p-5 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <button onClick={closeCheckout} className="p-1 hover:bg-white/20 rounded-lg transition">
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-medium opacity-80">Back</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Lock className="w-3 h-3 opacity-70" />
                        <span className="text-xs opacity-70">Secure</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold">Design Connect {selectedPlanName}</h2>
                        <p className="text-sm opacity-80">{isYearly ? 'Yearly Plan' : 'Monthly Plan'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">₹{currentAmount}</p>
                        {isYearly && <p className="text-xs opacity-70">₹{Math.round(currentAmount / 12)}/mo</p>}
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="p-5 space-y-3">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Select Payment Method</p>
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left',
                          selectedMethod === method.id
                            ? 'border-[#fb8000] bg-orange-50'
                            : 'border-gray-100 hover:border-gray-200 bg-white'
                        )}
                      >
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          selectedMethod === method.id ? 'gradient-orange text-white' : 'bg-slate-100 text-slate-500'
                        )}>
                          <method.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{method.label}</p>
                          <p className="text-xs text-muted-foreground">{method.desc}</p>
                        </div>
                        <div className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                          selectedMethod === method.id ? 'border-[#fb8000]' : 'border-gray-300'
                        )}>
                          {selectedMethod === method.id && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#fb8000]" />
                          )}
                        </div>
                      </button>
                    ))}

                    {/* UPI Input */}
                    {selectedMethod === 'upi' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                          <label className="text-sm font-medium">Enter UPI ID</label>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="yourname@upi"
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#fb8000] focus:ring-1 focus:ring-[#fb8000] transition"
                          />
                          <div className="flex gap-2">
                            {['gpay', 'phonepe', 'paytm'].map(app => (
                              <div key={app} className="flex-1 py-2 rounded-lg bg-white border border-gray-100 text-center text-xs text-muted-foreground">
                                {app === 'gpay' ? 'GPay' : app === 'phonepe' ? 'PhonePe' : 'Paytm'}
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Card Input */}
                    {selectedMethod === 'card' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                          <label className="text-sm font-medium">Card Details</label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19))}
                            placeholder="1234 5678 9012 3456"
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#fb8000] focus:ring-1 focus:ring-[#fb8000] transition"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => {
                                let v = e.target.value.replace(/\D/g, '').slice(0, 4)
                                if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2)
                                setCardExpiry(v)
                              }}
                              placeholder="MM/YY"
                              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#fb8000] focus:ring-1 focus:ring-[#fb8000] transition"
                            />
                            <input
                              type="password"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                              placeholder="CVV"
                              maxLength={3}
                              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#fb8000] focus:ring-1 focus:ring-[#fb8000] transition"
                            />
                          </div>
                          <input
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="Cardholder Name"
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#fb8000] focus:ring-1 focus:ring-[#fb8000] transition"
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Net Banking Selection */}
                    {selectedMethod === 'netbanking' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                          <label className="text-sm font-medium">Popular Banks</label>
                          {['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank', 'Kotak Mahindra'].map(bank => (
                            <button key={bank} className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white transition text-left">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                                {bank.slice(0, 2)}
                              </div>
                              <span className="text-sm">{bank}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Wallet Selection */}
                    {selectedMethod === 'wallet' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                          <label className="text-sm font-medium">Select Wallet</label>
                          {['Paytm Wallet', 'Amazon Pay', 'Mobikwik', 'Freecharge', 'Ola Money'].map(w => (
                            <button key={w} className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white transition text-left">
                              <Wallet className="w-4 h-4 text-slate-500" />
                              <span className="text-sm">{w}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Pay Button */}
                  <div className="px-5 pb-5">
                    <Button
                      className="w-full gradient-orange gradient-orange-hover text-white border-0 py-6 text-base font-bold"
                      onClick={processPayment}
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Pay ₹{currentAmount}
                    </Button>
                    <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> 256-bit SSL</span>
                      <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> PCI DSS</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3" /> 100% Secure</span>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
