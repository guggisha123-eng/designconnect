'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Phone, MapPin, MessageSquare, Clock,
  Send, Instagram, Twitter, Linkedin, CheckCircle, Loader2,
  ChevronDown, HelpCircle, ArrowRight, Globe, Paperclip,
  Check, Navigation
} from 'lucide-react'
import { useNavStore } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'guggisha123@gmail.com', href: 'mailto:guggisha123@gmail.com', color: 'from-orange-500 to-amber-500', responseTime: 'Usually responds in 2h' },
  { icon: Phone, label: 'Phone', value: '+91 7678279825', href: 'tel:+917678279825', color: 'from-blue-500 to-indigo-500', responseTime: 'Mon-Sat, 9am-6pm IST' },
  { icon: MapPin, label: 'Location', value: 'India', href: null, color: 'from-green-500 to-emerald-500', responseTime: 'Remote-first team' },
  { icon: Clock, label: 'Hours', value: 'Mon - Sat, 9am - 6pm IST', href: null, color: 'from-purple-500 to-violet-500', responseTime: 'Same-day response' },
]

const socialLinks = [
  { icon: Instagram, href: 'https://www.instagram.com/designconnect_9389', label: 'Instagram', color: 'from-pink-500 to-purple-500' },
  { icon: Twitter, href: 'https://x.com/Designconnec', label: 'Twitter/X', color: 'from-sky-400 to-blue-500' },
  { icon: Linkedin, href: 'https://www.linkedin.com/in/anujsharma9675', label: 'LinkedIn', color: 'from-blue-600 to-blue-700' },
]

const popularFaqs = [
  { q: 'How do I create an account?', a: 'Click "Get Started" and sign up as a Designer or Client. It takes less than 30 seconds.' },
  { q: 'Is Design Connect free?', a: 'Yes! We offer a free tier with basic features. You can upgrade to Pro anytime for premium features.' },
  { q: 'How do I upload designs?', a: 'Click "Upload" in the navigation and follow the step-by-step wizard. Drag and drop is supported!' },
]

const confettiColors = ['#fb8000', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#3b82f6']

export default function ContactPage() {
  const navigateTo = useNavStore((s) => s.navigateTo)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [attachedFile, setAttachedFile] = useState<string | null>(null)

  const charCount = form.message.length
  const maxChars = 1000

  // Form progress
  const formStep = useMemo(() => {
    if (form.name && form.email) {
      if (form.subject) {
        if (form.message) return 3
        return 2
      }
      return 1
    }
    return 0
  }, [form])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSuccess(true)
        setForm({ name: '', email: '', subject: '', message: '' })
        setAttachedFile(null)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } catch {
      setSuccess(true)
      setForm({ name: '', email: '', subject: '', message: '' })
      setAttachedFile(null)
    } finally {
      setLoading(false)
    }
  }

  const handleAttachFile = () => {
    // Mock file attachment
    setAttachedFile(attachedFile ? null : 'design-brief.pdf')
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0f172a] via-[#1a1f3a] to-[#1e293b] text-white overflow-hidden">
        {/* Floating contact badges */}
        <motion.div
          className="absolute top-16 left-[15%]"
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="glass-card rounded-2xl px-4 py-2 flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-[#fb8000]" /> Email
          </div>
        </motion.div>
        <motion.div
          className="absolute top-24 right-[15%]"
          animate={{ y: [0, -12, 0], rotate: [0, -3, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          <div className="glass-card rounded-2xl px-4 py-2 flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-[#fb8000]" /> Phone
          </div>
        </motion.div>
        <motion.div
          className="absolute bottom-16 left-[25%]"
          animate={{ y: [0, -10, 0], rotate: [0, 3, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        >
          <div className="glass-card rounded-2xl px-4 py-2 flex items-center gap-2 text-sm">
            <MessageSquare className="w-4 h-4 text-[#fb8000]" /> Chat
          </div>
        </motion.div>

        {/* Gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-10 right-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 left-10 w-72 h-72 bg-amber-500/8 rounded-full blur-3xl"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}>
              <Badge className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-sm">
                <MessageSquare className="w-3 h-3 mr-1" /> Contact Us
              </Badge>
            </motion.div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              Get in{' '}
              <span className="gradient-text-flow">Touch</span>
            </h1>
            <p className="text-slate-300 max-w-2xl mx-auto text-lg">
              Have a question, suggestion, or want to collaborate? We&apos;d love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <h2 className="text-xl font-bold mb-6">Contact Information</h2>

              <div className="space-y-4">
                {contactInfo.map((info, i) => (
                  <motion.div
                    key={info.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ x: 4, scale: 1.01 }}
                    className="group"
                  >
                    <Card className="border-0 shadow-sm dark:bg-slate-900 hover-lift card-3d-hover overflow-hidden cursor-default transition-shadow hover:shadow-[0_8px_30px_rgba(251,128,0,0.12)]">
                      <div className={`h-1 bg-gradient-to-r ${info.color}`} />
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <motion.div
                            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center flex-shrink-0 shadow-md`}
                            whileHover={{ scale: 1.15, rotate: 5 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                          >
                            <info.icon className="w-5 h-5 text-white" />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{info.label}</p>
                            {info.href ? (
                              <a href={info.href} className="font-medium text-sm hover:text-[#fb8000] transition-colors inline-block">
                                {info.value}
                              </a>
                            ) : (
                              <p className="font-medium text-sm">{info.value}</p>
                            )}
                            {/* Response time badge */}
                            <Badge variant="secondary" className="mt-2 text-[10px] response-badge bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-0">
                              <Clock className="w-2.5 h-2.5 mr-1" /> {info.responseTime}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="font-semibold mb-3">Follow Us</h3>
                <div className="flex gap-3">
                  {socialLinks.map((link) => (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center transition-all shadow-md`}
                      whileHover={{ scale: 1.15, y: -2, boxShadow: '0 8px 25px rgba(251, 128, 0, 0.25)' }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={link.label}
                    >
                      <link.icon className="w-4 h-4 text-white" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Interactive Map Placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-sm dark:bg-slate-900 overflow-hidden">
                <div className="relative h-56 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 overflow-hidden">
                  {/* Animated SVG Map */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200" fill="none">
                    {/* Landmass shapes */}
                    <motion.ellipse
                      cx="200" cy="100" rx="180" ry="80"
                      fill="rgba(251,128,0,0.05)"
                      stroke="rgba(251,128,0,0.1)"
                      strokeWidth="1"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                    {/* India region highlight */}
                    <motion.path
                      d="M260 70 C270 55, 290 60, 285 75 C280 90, 275 95, 270 85 C265 78, 262 72, 260 70Z"
                      fill="rgba(251,128,0,0.15)"
                      stroke="rgba(251,128,0,0.3)"
                      strokeWidth="1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    />
                    {/* Grid lines */}
                    {Array.from({ length: 6 }).map((_, i) => (
                      <motion.line
                        key={`h-${i}`}
                        x1="20" y1={30 + i * 28} x2="380" y2={30 + i * 28}
                        stroke="rgba(148,163,184,0.15)"
                        strokeWidth="0.5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                      />
                    ))}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <motion.line
                        key={`v-${i}`}
                        x1={50 + i * 45} y1="20" x2={50 + i * 45} y2="180"
                        stroke="rgba(148,163,184,0.15)"
                        strokeWidth="0.5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.5 + i * 0.08, duration: 0.8 }}
                      />
                    ))}
                    {/* Pulsing circle around location */}
                    <motion.circle
                      cx="268" cy="78"
                      r="20"
                      fill="none"
                      stroke="rgba(251,128,0,0.3)"
                      strokeWidth="2"
                      animate={{ r: [20, 35, 20], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.circle
                      cx="268" cy="78"
                      r="15"
                      fill="none"
                      stroke="rgba(251,128,0,0.2)"
                      strokeWidth="1"
                      animate={{ r: [15, 25, 15], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    />
                  </svg>

                  {/* Pin drop animation */}
                  <motion.div
                    className="absolute top-[35%] left-[66%] z-10"
                    initial={{ y: -40, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1, type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <MapPin className="w-8 h-8 text-[#fb8000] fill-[#fb8000] drop-shadow-lg" />
                    </motion.div>
                    <motion.div
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-3 bg-[#fb8000]/20 rounded-full blur-sm"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/50 dark:from-slate-800/50 to-transparent" />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#fb8000]" />
                      <p className="text-sm font-medium">Based in India</p>
                    </div>
                    <button className="flex items-center gap-1 text-xs text-[#fb8000] hover:underline font-medium">
                      <Navigation className="w-3 h-3" /> Get Directions
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Serving designers worldwide remotely</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* FAQ Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <HelpCircle className="w-5 h-5 text-[#fb8000]" />
                    <h3 className="font-semibold">Frequently Asked Questions</h3>
                  </div>
                  <p className="text-sm text-slate-300 mb-4">
                    Popular questions from our FAQ
                  </p>
                  <div className="space-y-2">
                    {popularFaqs.map((faq, i) => (
                      <div key={i} className="rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                          className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-medium">{faq.q}</p>
                            <motion.div
                              animate={{ rotate: expandedFaq === i ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            </motion.div>
                          </div>
                          <AnimatePresence>
                            {expandedFaq === i && (
                              <motion.p
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="text-xs text-slate-400 mt-2 overflow-hidden"
                              >
                                {faq.a}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 mt-4 w-full gap-2"
                    onClick={() => navigateTo('faq')}
                  >
                    View All FAQs <ArrowRight className="w-3 h-3" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-0 shadow-sm dark:bg-slate-900 glass-card overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  {success ? (
                    <div className="text-center py-12 relative">
                      {/* Confetti */}
                      {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="confetti-piece"
                          style={{
                            left: `${30 + Math.random() * 40}%`,
                            top: `${20 + Math.random() * 30}%`,
                            backgroundColor: confettiColors[i % confettiColors.length],
                            animationDelay: `${Math.random() * 0.5}s`,
                          }}
                          initial={{ scale: 0, y: 0 }}
                          animate={{ scale: 1, y: [0, -30, 20], x: [(Math.random() - 0.5) * 50], opacity: [1, 1, 0] }}
                          transition={{ duration: 1.5, delay: i * 0.05, ease: 'easeOut' }}
                        />
                      ))}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6"
                      >
                        <CheckCircle className="w-10 h-10 text-green-600" />
                      </motion.div>
                      <motion.h3
                        className="text-xl font-bold mb-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        Message Sent!
                      </motion.h3>
                      <motion.p
                        className="text-muted-foreground mb-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                      </motion.p>
                      <Button onClick={() => setSuccess(false)} variant="outline" className="gap-2">
                        <Send className="w-4 h-4" /> Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Send us a Message</h2>
                      </div>

                      {/* Form Progress Indicator */}
                      <div className="flex items-center gap-1 mb-6">
                        <div className="flex items-center gap-1">
                          <div className={`form-progress-step ${formStep >= 0 ? 'active' : ''} ${formStep > 0 ? 'completed' : ''}`}>
                            {formStep > 0 ? <Check className="w-3 h-3" /> : '1'}
                          </div>
                          <div className={`form-progress-line ${formStep >= 1 ? 'active' : ''} ${formStep > 1 ? 'completed' : ''}`} />
                          <div className={`form-progress-step ${formStep >= 1 ? 'active' : ''} ${formStep > 1 ? 'completed' : ''}`}>
                            {formStep > 1 ? <Check className="w-3 h-3" /> : '2'}
                          </div>
                          <div className={`form-progress-line ${formStep >= 2 ? 'active' : ''} ${formStep > 2 ? 'completed' : ''}`} />
                          <div className={`form-progress-step ${formStep >= 2 ? 'active' : ''} ${formStep > 2 ? 'completed' : ''}`}>
                            {formStep > 2 ? <Check className="w-3 h-3" /> : '3'}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground ml-3">
                          {formStep === 0 ? 'Step 1: Details' : formStep === 1 ? 'Step 2: Message' : formStep === 2 ? 'Step 3: Submit' : 'Ready!'}
                        </span>
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl"
                        >
                          {error}
                        </motion.div>
                      )}

                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="floating-label">
                            <Input
                              id="name"
                              placeholder=" "
                              value={form.name}
                              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                              required
                              className="h-12"
                            />
                            <label htmlFor="name">Your name *</label>
                          </div>
                          <div className="floating-label">
                            <Input
                              id="email"
                              type="email"
                              placeholder=" "
                              value={form.email}
                              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                              required
                              className="h-12"
                            />
                            <label htmlFor="email">Email address *</label>
                          </div>
                        </div>

                        <div className="floating-label">
                          <Input
                            id="subject"
                            placeholder=" "
                            value={form.subject}
                            onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                            required
                            className="h-12"
                          />
                          <label htmlFor="subject">Subject *</label>
                        </div>

                        <div className="floating-label">
                          <Textarea
                            id="message"
                            placeholder=" "
                            value={form.message}
                            onChange={(e) => setForm(f => ({ ...f, message: e.target.value.slice(0, maxChars) }))}
                            rows={6}
                            required
                            className="min-h-[140px] resize-none"
                          />
                          <label htmlFor="message">Message *</label>
                          <div className="flex items-center justify-between mt-1">
                            {/* Attach file button */}
                            <button
                              type="button"
                              onClick={handleAttachFile}
                              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#fb8000] transition-colors"
                            >
                              <Paperclip className="w-3.5 h-3.5" />
                              {attachedFile ? attachedFile : 'Attach file'}
                            </button>
                            <span className={`text-xs ${charCount > maxChars * 0.9 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                              {charCount}/{maxChars}
                            </span>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          disabled={loading}
                          className="gradient-orange gradient-orange-hover text-white border-0 gap-2 w-full sm:w-auto btn-glow px-8 h-12 font-semibold"
                        >
                          {loading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                          ) : (
                            <><Send className="w-4 h-4" /> Send Message</>
                          )}
                        </Button>
                      </form>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
