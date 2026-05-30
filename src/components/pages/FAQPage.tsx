'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ChevronDown, ChevronUp, MessageSquare, ThumbsUp, ThumbsDown,
  HelpCircle, Rocket, CreditCard, Palette, ShoppingBag, Shield,
  ArrowRight, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNavStore } from '@/store/nav-store'

const categoryIcons: Record<string, typeof Rocket> = {
  'Getting Started': Rocket,
  'Account & Billing': CreditCard,
  'Designs & Uploads': Palette,
  'Purchases & Downloads': ShoppingBag,
  'Community & Safety': Shield,
}

const categoryColors: Record<string, string> = {
  'Getting Started': 'from-orange-500 to-amber-500',
  'Account & Billing': 'from-blue-500 to-indigo-500',
  'Designs & Uploads': 'from-green-500 to-emerald-500',
  'Purchases & Downloads': 'from-purple-500 to-violet-500',
  'Community & Safety': 'from-pink-500 to-rose-500',
}

const categoryAccentColors: Record<string, string> = {
  'Getting Started': '#fb8000',
  'Account & Billing': '#6366f1',
  'Designs & Uploads': '#10b981',
  'Purchases & Downloads': '#8b5cf6',
  'Community & Safety': '#ec4899',
}

const faqCategories = [
  'All',
  'Getting Started',
  'Account & Billing',
  'Designs & Uploads',
  'Purchases & Downloads',
  'Community & Safety',
]

const faqs = [
  { q: 'What is Design Connect?', a: 'Design Connect is a creative marketplace and portfolio platform where designers can showcase, share, and sell their designs. It\'s like Behance meets Freepik — a place where creativity meets opportunity.', category: 'Getting Started' },
  { q: 'How do I create an account?', a: 'Click the "Get Started" or "Sign Up" button on the homepage. You can sign up as a Designer or Client. Fill in your name, email, and password, then verify your email address to get started.', category: 'Getting Started' },
  { q: 'Is Design Connect free to use?', a: 'Yes! Design Connect offers a free tier that allows you to upload up to 10 designs, access basic analytics, and browse all designs. We also offer Pro and Enterprise plans for advanced features.', category: 'Getting Started' },
  { q: 'How do I upload my first design?', a: 'After signing in, click the "Upload" button in the navigation. Follow the 4-step wizard: upload images → add details → select category & pricing → publish. Your design will be visible to the community immediately.', category: 'Designs & Uploads' },
  { q: 'What file formats are supported?', a: 'We support PNG, JPG, SVG, PDF, AI, and EPS files for uploads. For source files, you can include any format. When listing your design, specify the included file formats.', category: 'Designs & Uploads' },
  { q: 'How do I price my designs?', a: 'You can offer designs for free or set a price. Consider the complexity, usage rights, and market rates. Pro designers typically earn more with premium pricing. Enterprise sellers enjoy 0% commission.', category: 'Designs & Uploads' },
  { q: 'How do I download a design?', a: 'Simply browse designs, click on one you like, and click the "Download" or "Buy" button. Free designs download instantly. Paid designs require payment via our secure checkout.', category: 'Purchases & Downloads' },
  { q: 'What payment methods are accepted?', a: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers. All payments are processed securely through our platform.', category: 'Purchases & Downloads' },
  { q: 'Can I get a refund on purchased designs?', a: 'Refund requests are reviewed on a case-by-case basis. If a design significantly differs from its description, we offer full refunds within 7 days of purchase.', category: 'Purchases & Downloads' },
  { q: 'How do I upgrade to Pro?', a: 'Navigate to the Pricing page or Dashboard → Settings. Choose the Pro plan and complete the payment. Pro gives you unlimited uploads, advanced analytics, and featured placement.', category: 'Account & Billing' },
  { q: 'Can I cancel my subscription?', a: 'Yes, you can cancel anytime from your Dashboard settings. Your Pro benefits continue until the end of your billing period. No partial refunds are issued for unused time.', category: 'Account & Billing' },
  { q: 'How do I update my profile?', a: 'Go to your Dashboard → Settings or click on your profile in the top-right navigation. You can update your name, bio, location, skills, social links, and avatar.', category: 'Account & Billing' },
  { q: 'How do I contact a designer?', a: 'Visit their profile page and click the "Message" button. Both parties need to be registered users. Messages are private and not visible to other users.', category: 'Community & Safety' },
  { q: 'How do I report a design or user?', a: 'Click the flag icon on any design or user profile. Provide a reason for the report. Our team reviews all reports within 48 hours and takes appropriate action.', category: 'Community & Safety' },
  { q: 'What is the copyright policy?', a: 'Designers retain full ownership of their designs. By uploading, you grant buyers a license to use the design as specified. Free designs typically allow personal use, while paid designs may include commercial licenses.', category: 'Community & Safety' },
  { q: 'How do I follow a designer?', a: 'Visit their profile and click "Follow". You\'ll see their new designs in your feed and get notified about their uploads. Following is free and unlimited.', category: 'Community & Safety' },
  { q: 'What does the Pro badge mean?', a: 'The Pro badge indicates a verified designer who has subscribed to our Pro or Enterprise plan. Pro designers typically offer higher-quality work and have access to premium features.', category: 'Getting Started' },
  { q: 'How are featured designs selected?', a: 'Featured designs are curated by our editorial team and selected Pro designers. High-quality, popular, and trending designs are prioritized for featuring.', category: 'Designs & Uploads' },
  { q: 'Can I edit my design after publishing?', a: 'Yes, go to your Dashboard → My Designs, click on a design, and select "Edit". You can update the title, description, category, pricing, and images. Changes are reflected immediately.', category: 'Designs & Uploads' },
  { q: 'How do I delete my design?', a: 'Go to Dashboard → My Designs, click on the design, and select "Delete". This action is permanent. Note that if the design has active purchases, deletion may be restricted.', category: 'Designs & Uploads' },
  { q: 'How do I leave a review?', a: 'After purchasing a design, you can leave a rating (1-5 stars) and a written review on the design detail page. Reviews help other buyers and provide feedback to designers.', category: 'Purchases & Downloads' },
  { q: 'Is there a limit on downloads?', a: 'Free users have standard download speed. Pro users get faster downloads and no daily limits. Enterprise users have the fastest speeds and unlimited downloads.', category: 'Account & Billing' },
  { q: 'How do payouts work for designers?', a: 'Designers earn from each sale (minus platform commission). Pro sellers pay 5% commission; free accounts pay 15%. Withdrawals can be requested once your balance reaches $25.', category: 'Account & Billing' },
  { q: 'Can I use designs commercially?', a: 'Check the license type specified by the designer. Most paid designs include commercial use rights. Free designs are typically for personal use only unless specified otherwise.', category: 'Purchases & Downloads' },
  { q: 'How do I become a verified designer?', a: 'Upgrade to Pro plan and complete the verification process. This includes verifying your email, adding a profile photo, and having at least 5 published designs.', category: 'Getting Started' },
]

export default function FAQPage() {
  const navigateTo = useNavStore((s) => s.navigateTo)
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [helpfulState, setHelpfulState] = useState<Record<number, 'up' | 'down' | null>>({})

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = activeCategory === 'All' || faq.category === activeCategory
      const matchesSearch = !searchQuery.trim() ||
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, searchQuery])

  const getCategoryCount = (cat: string) => {
    if (cat === 'All') return faqs.length
    return faqs.filter(f => f.category === cat).length
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0f172a] via-[#1a1f3a] to-[#1e293b] text-white overflow-hidden">
        {/* Question mark decorative shapes */}
        <motion.div
          className="absolute top-12 left-[10%] text-8xl font-bold text-white/3 select-none"
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          ?
        </motion.div>
        <motion.div
          className="absolute bottom-8 right-[12%] text-6xl font-bold text-white/3 select-none"
          animate={{ y: [0, -10, 0], rotate: [0, -3, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          ?
        </motion.div>
        <motion.div
          className="absolute top-1/2 right-[30%] text-4xl font-bold text-white/3 select-none"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        >
          ?
        </motion.div>

        {/* Gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-10 right-20 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 left-10 w-80 h-80 bg-amber-500/8 rounded-full blur-3xl"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-sm">
                <HelpCircle className="w-3 h-3 mr-1" /> Help Center
              </Badge>
            </motion.div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              Frequently Asked{' '}
              <span className="gradient-text-flow">Questions</span>
            </h1>
            <p className="text-slate-300 max-w-2xl mx-auto mb-8 text-lg">
              Find answers to common questions about Design Connect
            </p>

            {/* Animated Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative max-w-lg mx-auto"
            >
              <div className="search-glow rounded-xl transition-all duration-300">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 text-base rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder:text-slate-400 focus:border-[#fb8000]"
                  />
                  {searchQuery && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <Badge variant="secondary" className="text-xs bg-[#fb8000] text-white">
                        {filteredFaqs.length}
                      </Badge>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Category badges for quick navigation */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-2 mt-6"
            >
              {faqCategories.filter(c => c !== 'All').map((cat) => {
                const Icon = categoryIcons[cat] || HelpCircle
                const color = categoryColors[cat] || 'from-gray-500 to-gray-600'
                return (
                  <motion.button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setSearchQuery('') }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      activeCategory === cat
                        ? `bg-gradient-to-r ${color} text-white shadow-md`
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-3 h-3" />
                    {cat}
                    <span className={`ml-1 text-[10px] ${activeCategory === cat ? 'text-white/80' : 'text-slate-400'}`}>
                      {getCategoryCount(cat)}
                    </span>
                  </motion.button>
                )
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {faqCategories.map((cat) => {
            const isActive = activeCategory === cat
            const accentColor = cat === 'All' ? '#fb8000' : categoryAccentColors[cat] || '#fb8000'
            return (
              <motion.button
                key={cat}
                onClick={() => { setActiveCategory(cat); setSearchQuery('') }}
                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  isActive
                    ? 'text-white shadow-lg'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                style={isActive ? { background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` } : undefined}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {cat !== 'All' && (() => {
                  const Icon = categoryIcons[cat] || HelpCircle
                  return <Icon className="w-3.5 h-3.5" />
                })()}
                {cat}
                <span className={`text-xs ml-0.5 ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
                  {getCategoryCount(cat)}
                </span>
                {/* Animated underline indicator */}
                {isActive && (
                  <motion.div
                    layoutId="category-underline"
                    className="absolute -bottom-1 left-1/4 right-1/4 h-0.5 rounded-full bg-white/50"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            )
          })}
        </motion.div>

        {/* FAQ List */}
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {filteredFaqs.map((faq, i) => {
              const isOpen = openIndex === i
              const accentColor = categoryAccentColors[faq.category] || '#fb8000'
              return (
                <motion.div
                  key={`${faq.q}-${activeCategory}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.03 }}
                  layout
                >
                  <Card className={`border-0 shadow-sm overflow-hidden dark:bg-slate-900 transition-all duration-300 ${isOpen ? 'ring-1' : ''}`} style={isOpen ? { ringColor: `${accentColor}30` } : undefined}>
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      className="w-full text-left p-5 flex items-center gap-4 hover:bg-muted/50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Number badge */}
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                        style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)` }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm pr-4">{faq.q}</p>
                      </div>
                      {/* Animated chevron */}
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="flex-shrink-0"
                      >
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 border-t border-border/50 pt-4">
                            {/* Subtle gradient on open state */}
                            <div
                              className="absolute inset-0 opacity-5 pointer-events-none"
                              style={{ background: `linear-gradient(135deg, ${accentColor}, transparent)` }}
                            />
                            <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                            <div className="flex items-center justify-between mt-4">
                              <Badge
                                variant="secondary"
                                className="text-xs"
                                style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                              >
                                {faq.category}
                              </Badge>
                              {/* Helpful buttons */}
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground mr-2">Was this helpful?</span>
                                <motion.button
                                  className={`helpful-btn p-1.5 rounded-lg ${helpfulState[i] === 'up' ? 'active text-[#fb8000]' : 'text-muted-foreground hover:text-green-500'} hover:bg-muted/50`}
                                  onClick={() => setHelpfulState(s => ({ ...s, [i]: s[i] === 'up' ? null : 'up' }))}
                                  whileTap={{ scale: 0.85 }}
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                </motion.button>
                                <motion.button
                                  className={`helpful-btn p-1.5 rounded-lg ${helpfulState[i] === 'down' ? 'active text-red-500' : 'text-muted-foreground hover:text-red-500'} hover:bg-muted/50`}
                                  onClick={() => setHelpfulState(s => ({ ...s, [i]: s[i] === 'down' ? null : 'down' }))}
                                  whileTap={{ scale: 0.85 }}
                                >
                                  <ThumbsDown className="w-3.5 h-3.5" />
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {filteredFaqs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No questions found</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Try a different search term or category
              </p>
            </motion.div>
          )}
        </div>

        {/* Still need help - glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Card className="border-0 bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white overflow-hidden relative">
            {/* Animated decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 opacity-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <HelpCircle className="w-full h-full" />
              </motion.div>
            </div>

            <CardContent className="p-10 relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="w-14 h-14 rounded-2xl bg-[#fb8000]/20 flex items-center justify-center mx-auto mb-4"
              >
                <Sparkles className="w-7 h-7 text-[#fb8000]" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
              <p className="text-slate-400 mb-6 text-sm">
                Can&apos;t find the answer you&apos;re looking for? Our team is here to help.
              </p>
              <div className="flex justify-center gap-3">
                <Button
                  onClick={() => navigateTo('contact')}
                  className="gradient-orange gradient-orange-hover text-white border-0 gap-2 btn-glow px-6"
                >
                  Contact Support <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
