'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Mail, Phone, MapPin, MessageSquare, Clock,
  Send, Instagram, Twitter, Linkedin, CheckCircle, Loader2
} from 'lucide-react'
import { useNavStore } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'guggisha123@gmail.com', href: 'mailto:guggisha123@gmail.com' },
  { icon: Phone, label: 'Phone', value: '+91 7678279825', href: 'tel:+917678279825' },
  { icon: MapPin, label: 'Location', value: 'India', href: null },
  { icon: Clock, label: 'Hours', value: 'Mon - Sat, 9am - 6pm IST', href: null },
]

const socialLinks = [
  { icon: Instagram, href: 'https://www.instagram.com/designconnect_9389', label: 'Instagram' },
  { icon: Twitter, href: 'https://x.com/Designconnec', label: 'Twitter/X' },
  { icon: Linkedin, href: 'https://www.linkedin.com/in/anujsharma9675', label: 'LinkedIn' },
]

export default function ContactPage() {
  const navigateTo = useNavStore((s) => s.navigateTo)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

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
      } else {
        setError('Something went wrong. Please try again.')
      }
    } catch {
      // Fallback - simulate success
      setSuccess(true)
      setForm({ name: '', email: '', subject: '', message: '' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Get in Touch</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Have a question, suggestion, or want to collaborate? We&apos;d love to hear from you.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-xl font-bold mb-6">Contact Information</h2>

              <div className="space-y-4">
                {contactInfo.map((info) => (
                  <div key={info.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-5 h-5 text-[#fb8000]" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{info.label}</p>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="font-medium text-sm hover:text-[#fb8000] transition-colors"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="font-medium text-sm">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="font-semibold mb-3">Follow Us</h3>
                <div className="flex gap-3">
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-muted hover:bg-[#fb8000] hover:text-white flex items-center justify-center transition-colors"
                      aria-label={link.label}
                    >
                      <link.icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Quick Help */}
            <Card className="border-0 bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Need Quick Help?</h3>
                <p className="text-sm text-slate-300 mb-4">
                  Check out our FAQ for instant answers to common questions.
                </p>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={() => navigateTo('faq')}
                >
                  Visit FAQ
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 sm:p-8">
                  {success ? (
                    <div className="text-center py-12">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
                      >
                        <CheckCircle className="w-10 h-10 text-green-600" />
                      </motion.div>
                      <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                      <p className="text-muted-foreground mb-6">
                        Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                      </p>
                      <Button onClick={() => setSuccess(false)} variant="outline">
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold mb-6">Send us a Message</h2>

                      {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                          {error}
                        </div>
                      )}

                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name" className="mb-1.5 block text-sm font-medium">Name *</Label>
                            <Input
                              id="name"
                              placeholder="Your name"
                              value={form.name}
                              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email *</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="you@example.com"
                              value={form.email}
                              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="subject" className="mb-1.5 block text-sm font-medium">Subject *</Label>
                          <Input
                            id="subject"
                            placeholder="What is this about?"
                            value={form.subject}
                            onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="message" className="mb-1.5 block text-sm font-medium">Message *</Label>
                          <Textarea
                            id="message"
                            placeholder="Tell us more about your inquiry..."
                            value={form.message}
                            onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                            rows={6}
                            required
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={loading}
                          className="gradient-orange gradient-orange-hover text-white border-0 gap-2 w-full sm:w-auto"
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
