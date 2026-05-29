'use client'

import { motion } from 'framer-motion'
import {
  Target, Eye, Heart, Users, Globe, Award, Sparkles, ArrowRight,
  Instagram, Twitter, Linkedin, Mail, Phone
} from 'lucide-react'
import { useNavStore } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const teamMembers = [
  { name: 'Anuj Sharma', role: 'Founder & CEO', initials: 'AS', bio: 'Visionary leader passionate about connecting designers with opportunities' },
  { name: 'Priya Singh', role: 'Lead Designer', initials: 'PS', bio: 'Award-winning designer with 10+ years of experience in brand identity' },
  { name: 'Rahul Mehta', role: 'Tech Lead', initials: 'RM', bio: 'Full-stack engineer focused on building scalable creative platforms' },
  { name: 'Neha Gupta', role: 'Community Manager', initials: 'NG', bio: 'Building bridges between designers and clients worldwide' },
]

const stats = [
  { icon: Users, value: '10,000+', label: 'Active Designers' },
  { icon: Globe, value: '50+', label: 'Countries' },
  { icon: Heart, value: '500K+', label: 'Downloads' },
  { icon: Award, value: '4.9/5', label: 'User Rating' },
]

const milestones = [
  { year: '2023', title: 'Founded', description: 'Design Connect was born with a mission to democratize design.' },
  { year: '2023', title: '10K Users', description: 'Reached our first 10,000 registered users milestone.' },
  { year: '2024', title: 'Pro Launch', description: 'Launched the Pro plan with premium features for designers.' },
  { year: '2024', title: '100K Designs', description: 'Community collectively uploaded over 100,000 designs.' },
  { year: '2025', title: 'Global Expansion', description: 'Expanded to serve designers in over 50 countries.' },
]

export default function AboutPage() {
  const navigateTo = useNavStore((s) => s.navigateTo)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-6 bg-white/10 text-white border-white/20">
              <Sparkles className="w-3 h-3 mr-1" /> Our Story
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Empowering{' '}
              <span className="bg-gradient-to-r from-[#fb8000] to-[#f59e0b] bg-clip-text text-transparent">
                Creativity
              </span>{' '}
              Worldwide
            </h1>
            <p className="text-slate-300 max-w-2xl mx-auto text-lg leading-relaxed">
              Design Connect is the premier platform for designers to showcase their work,
              connect with clients, and build thriving creative careers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 bg-orange-100 text-orange-700 border-0">Our Mission</Badge>
              <h2 className="text-3xl font-bold mb-6">
                Making design accessible to everyone
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We believe that great design should be accessible to everyone — whether you&apos;re a
                startup founder needing a logo, a marketer looking for social media templates,
                or a designer wanting to share your work with the world.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Design Connect bridges the gap between creative talent and business needs,
                creating a thriving marketplace where designers can earn a living doing what they love.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-0 bg-orange-50">
                  <CardContent className="p-4 text-center">
                    <Target className="w-6 h-6 text-[#fb8000] mx-auto mb-2" />
                    <h3 className="font-semibold text-sm">Mission-Driven</h3>
                    <p className="text-xs text-muted-foreground mt-1">Empowering creators globally</p>
                  </CardContent>
                </Card>
                <Card className="border-0 bg-green-50">
                  <CardContent className="p-4 text-center">
                    <Eye className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <h3 className="font-semibold text-sm">Transparency</h3>
                    <p className="text-xs text-muted-foreground mt-1">Fair pricing, clear terms</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {stats.map((stat, i) => (
                <Card key={i} className="border-0 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <stat.icon className="w-8 h-8 text-[#fb8000] mx-auto mb-3" />
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The passionate people behind Design Connect
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-0 shadow-sm hover:shadow-lg transition-shadow text-center">
                  <CardContent className="p-6">
                    <div className="w-20 h-20 rounded-full gradient-orange flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-white">{member.initials}</span>
                    </div>
                    <h3 className="font-bold">{member.name}</h3>
                    <p className="text-sm text-[#fb8000] mb-2">{member.role}</p>
                    <p className="text-sm text-muted-foreground">{member.bio}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Journey</h2>
            <p className="text-muted-foreground">Key milestones in Design Connect&apos;s growth</p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-6 items-start"
                >
                  <div className="w-16 h-16 rounded-full gradient-orange flex items-center justify-center flex-shrink-0 z-10">
                    <span className="text-xs font-bold text-white">{m.year}</span>
                  </div>
                  <Card className="flex-1 border-0 shadow-sm">
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{m.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{m.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold mb-4">Join Our Growing Community</h2>
            <p className="text-muted-foreground mb-8">
              Be part of the next generation of creative professionals
            </p>
            <Button
              onClick={() => navigateTo('auth')}
              size="lg"
              className="gradient-orange gradient-orange-hover text-white border-0 gap-2 px-8"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
