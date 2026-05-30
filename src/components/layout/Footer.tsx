'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Palette, Heart, Send, Loader2, ArrowUp, Check, Lock } from 'lucide-react'
import { useNavStore, type Page } from '@/store/nav-store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

const footerLinks = {
  Platform: [
    { label: 'Browse Designs', page: 'browse' as Page },
    { label: 'Categories', page: 'categories' as Page },
    { label: 'Pricing', page: 'pricing' as Page },
    { label: 'Upload Design', page: 'upload' as Page },
  ],
  Company: [
    { label: 'About Us', page: 'about' as Page },
    { label: 'Contact', page: 'contact' as Page },
    { label: 'FAQ', page: 'faq' as Page },
  ],
  Legal: [
    { label: 'Privacy Policy', page: 'about' as Page },
    { label: 'Terms of Service', page: 'about' as Page },
    { label: 'Cookie Policy', page: 'about' as Page },
  ],
}

// Social SVG icons
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TwitterXIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function DribbbleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94" />
      <path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32" />
      <path d="M8.56 2.75c4.37 6 6 9.42 8 17.72" />
    </svg>
  )
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

const socialLinks = [
  { Icon: InstagramIcon, href: 'https://www.instagram.com/designconnect_9389', label: 'Instagram', gradient: 'from-pink-500 to-purple-500', followers: '12.5K' },
  { Icon: TwitterXIcon, href: 'https://x.com/Designconnec', label: 'Twitter/X', gradient: 'from-slate-600 to-slate-800', followers: '8.2K' },
  { Icon: LinkedInIcon, href: 'https://www.linkedin.com/in/anujsharma9675', label: 'LinkedIn', gradient: 'from-blue-600 to-blue-700', followers: '5.1K' },
  { Icon: DribbbleIcon, href: '#', label: 'Dribbble', gradient: 'from-pink-400 to-pink-600', followers: '3.8K' },
  { Icon: GitHubIcon, href: '#', label: 'GitHub', gradient: 'from-gray-600 to-gray-800', followers: '2.4K' },
]

const statsData = [
  { value: 10000, suffix: '+', label: 'Designers' },
  { value: 500000, suffix: '+', label: 'Downloads' },
  { value: 100000, suffix: '+', label: 'Designs' },
  { value: 4.9, suffix: '/5', label: 'Rating', decimal: true },
]

function AnimatedCounter({ target, suffix, decimal }: { target: number; suffix: string; decimal?: boolean }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    const duration = 2000
    const startTime = Date.now()

    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(decimal ? target * eased : Math.floor(target * eased))

      if (progress < 1) {
        requestAnimationFrame(tick)
      }
    }

    requestAnimationFrame(tick)
  }, [isInView, target, decimal])

  const format = (n: number) => {
    if (decimal) return n.toFixed(1)
    if (n >= 1000) return n.toLocaleString()
    return n.toString()
  }

  return (
    <span ref={ref} className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#fb8000] to-[#f59e0b] bg-clip-text text-transparent">
      {format(count)}{suffix}
    </span>
  )
}

export default function Footer() {
  const navigateTo = useNavStore((s) => s.navigateTo)
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const { toast } = useToast()

  const handleSubscribe = async () => {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' })
      return
    }

    const subscribedEmails = JSON.parse(localStorage.getItem('dc_newsletter') || '[]') as string[]
    if (subscribedEmails.includes(trimmedEmail.toLowerCase())) {
      toast({ title: "You're already subscribed!", description: 'This email is already on our list.' })
      setEmail('')
      return
    }

    setIsSubscribing(true)
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')

      subscribedEmails.push(trimmedEmail.toLowerCase())
      localStorage.setItem('dc_newsletter', JSON.stringify(subscribedEmails))
      setSubscribed(true)
      toast({ title: 'Thanks for subscribing!', description: "You'll receive weekly design inspiration in your inbox." })
      setEmail('')
    } catch {
      toast({ title: 'Subscription failed', description: 'Please try again later.', variant: 'destructive' })
    } finally {
      setIsSubscribing(false)
    }
  }

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <footer className="bg-[#0f172a] dark:bg-slate-950 text-white relative">
      {/* Accent line above footer */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#fb8000] to-transparent" />

      {/* Animated Stats Counter */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statsData.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <AnimatedCounter target={stat.value} suffix={stat.suffix} decimal={stat.decimal} />
                <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-slate-800/60 dark:bg-slate-900/60 wavy-top-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="newsletter-glass p-6 sm:p-8 relative">
            {/* Animated border glow */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ border: '1px solid rgba(251, 128, 0, 0.15)' }}
              animate={{ boxShadow: ['0 0 0px rgba(251,128,0,0)', '0 0 20px rgba(251,128,0,0.15)', '0 0 0px rgba(251,128,0,0)'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-md">
                <h3 className="text-xl font-bold mb-2">Stay Inspired</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Get weekly design inspiration and tips delivered to your inbox
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSubscribe() }}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus-visible:ring-[#fb8000]/50 focus-visible:border-[#fb8000] h-11 sm:w-72 transition-shadow focus-visible:shadow-[0_0_0_3px_rgba(251,128,0,0.15),0_4px_20px_rgba(251,128,0,0.1)]"
                />
                <Button
                  onClick={handleSubscribe}
                  disabled={isSubscribing || !email.trim()}
                  className="gradient-orange gradient-orange-hover text-white border-0 gap-2 h-11 px-6 shrink-0"
                >
                  {subscribed ? <Check className="w-4 h-4" /> : isSubscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {subscribed ? 'Subscribed!' : 'Subscribe'}
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Lock className="w-3 h-3 text-slate-500" />
              <p className="text-xs text-slate-500">Privacy guaranteed. No spam, unsubscribe anytime.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-800/30 to-transparent">
        {/* Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <button onClick={() => navigateTo('home')} className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl gradient-orange flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Design Connect</span>
            </button>
            <p className="text-slate-400 dark:text-slate-500 text-sm leading-relaxed mb-6 max-w-md">
              Where creativity meets opportunity. Discover, share, and sell creative designs.
              Connect with talented designers worldwide and find the perfect design for your next project.
            </p>

            {/* Social Links - Circular Icon Buttons with Tooltips */}
            <div className="flex items-center gap-3 mb-6">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-800 dark:bg-slate-800 flex items-center justify-center transition-all duration-300 hover:shadow-lg group relative overflow-hidden"
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={link.label}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${link.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full`} />
                  <link.Icon className="w-4 h-4 relative z-10" />
                  {/* Tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                    {link.label} · {link.followers}
                  </div>
                </motion.a>
              ))}
            </div>

            {/* App Download Badges */}
            <div className="flex items-center gap-3 mb-6">
              <button className="app-badge text-white" aria-label="Download on App Store">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="text-left">
                  <p className="text-[9px] leading-tight opacity-70">Download on the</p>
                  <p className="text-xs font-semibold leading-tight">App Store</p>
                </div>
              </button>
              <button className="app-badge text-white" aria-label="Get it on Google Play">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.396 12l2.302-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
                </svg>
                <div className="text-left">
                  <p className="text-[9px] leading-tight opacity-70">GET IT ON</p>
                  <p className="text-xs font-semibold leading-tight">Google Play</p>
                </div>
              </button>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-slate-300 dark:text-slate-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#fb8000] flex-shrink-0" />
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label} className="group">
                    <button
                      onClick={() => navigateTo(link.page)}
                      className="text-sm text-slate-400 dark:text-slate-500 hover:text-[#fb8000] transition-all duration-200 relative inline-block"
                    >
                      <span className="relative">
                        {link.label}
                        <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#fb8000] group-hover:w-full transition-all duration-300" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Bar */}
        <div className="border-t border-slate-800 dark:border-slate-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm text-slate-400 dark:text-slate-500">
            <a href="mailto:guggisha123@gmail.com" className="hover:text-[#fb8000] transition-colors">
              guggisha123@gmail.com
            </a>
            <a href="tel:+917678279825" className="hover:text-[#fb8000] transition-colors">
              +91 7678279825
            </a>
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800"
            >
              <span>🌐</span>
              <span>English (US)</span>
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none"><path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
            {showLangMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowLangMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-full mb-2 right-0 bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl z-20 min-w-[180px]"
                >
                  <p className="text-xs text-slate-400 mb-2">Language</p>
                  <button
                    className="w-full text-left text-sm px-3 py-2 rounded-md bg-[#fb8000]/10 text-[#fb8000] flex items-center gap-2"
                    onClick={() => {
                      toast({ title: 'Coming soon', description: 'More languages will be available soon!' })
                      setShowLangMenu(false)
                    }}
                  >
                    🌐 English (US)
                  </button>
                  <button
                    className="w-full text-left text-sm px-3 py-2 rounded-md text-slate-400 hover:bg-slate-700 transition-colors flex items-center gap-2"
                    onClick={() => {
                      toast({ title: 'Coming soon', description: 'More languages will be available soon!' })
                      setShowLangMenu(false)
                    }}
                  >
                    🇪🇸 Español
                  </button>
                  <button
                    className="w-full text-left text-sm px-3 py-2 rounded-md text-slate-400 hover:bg-slate-700 transition-colors flex items-center gap-2"
                    onClick={() => {
                      toast({ title: 'Coming soon', description: 'More languages will be available soon!' })
                      setShowLangMenu(false)
                    }}
                  >
                    🇫🇷 Français
                  </button>
                  <button
                    className="w-full text-left text-sm px-3 py-2 rounded-md text-slate-400 hover:bg-slate-700 transition-colors flex items-center gap-2"
                    onClick={() => {
                      toast({ title: 'Coming soon', description: 'More languages will be available soon!' })
                      setShowLangMenu(false)
                    }}
                  >
                    🇮🇳 हिन्दी
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 dark:border-slate-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 relative">
          {/* Gradient line above */}
          <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#fb8000]/30 to-transparent" />
          <p className="text-sm text-slate-500 dark:text-slate-600">
            © {new Date().getFullYear()} Design Connect. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-600 flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> by Design Connect Team
            </p>
            <span className="text-slate-700">·</span>
            <span className="text-xs text-slate-600">v2.0.0</span>
            <span className="text-slate-700">·</span>
            <button
              onClick={scrollToTop}
              className="text-sm text-slate-400 hover:text-[#fb8000] transition-colors flex items-center gap-1 group"
            >
              Back to top
              <span className="bounce-arrow inline-block group-hover:-translate-y-1 transition-transform">
                <ArrowUp className="w-3 h-3" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
