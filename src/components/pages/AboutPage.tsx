'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Target, Eye, Heart, Users, Globe, Award, Sparkles, ArrowRight,
  Instagram, Twitter, Linkedin, Mail, Phone, Zap, Shield, Lightbulb,
  MapPin, Briefcase, Clock, ExternalLink, ChevronDown
} from 'lucide-react'
import { useNavStore } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

const teamMembers = [
  { name: 'Anuj Sharma', role: 'Founder & CEO', initials: 'AS', bio: 'Visionary leader passionate about connecting designers with opportunities', socials: { twitter: '#', linkedin: '#', mail: '#' }, skills: ['Strategy', 'Leadership', 'Product'] },
  { name: 'Priya Singh', role: 'Lead Designer', initials: 'PS', bio: 'Award-winning designer with 10+ years of experience in brand identity', socials: { twitter: '#', linkedin: '#', mail: '#' }, skills: ['Logo Design', 'UI/UX', 'Branding'] },
  { name: 'Rahul Mehta', role: 'Tech Lead', initials: 'RM', bio: 'Full-stack engineer focused on building scalable creative platforms', socials: { twitter: '#', linkedin: '#', mail: '#' }, skills: ['React', 'Node.js', 'DevOps'] },
  { name: 'Neha Gupta', role: 'Community Manager', initials: 'NG', bio: 'Building bridges between designers and clients worldwide', socials: { twitter: '#', linkedin: '#', mail: '#' }, skills: ['Marketing', 'Community', 'Content'] },
]

const stats = [
  { icon: Users, value: '10,000+', label: 'Active Designers' },
  { icon: Globe, value: '50+', label: 'Countries' },
  { icon: Heart, value: '500K+', label: 'Downloads' },
  { icon: Award, value: '4.9/5', label: 'User Rating' },
]

const missionCards = [
  { icon: Target, title: 'Mission-Driven', desc: 'Empowering creators globally', color: 'from-orange-500 to-amber-500' },
  { icon: Eye, title: 'Transparency', desc: 'Fair pricing, clear terms', color: 'from-green-500 to-emerald-500' },
  { icon: Zap, title: 'Innovation', desc: 'Pushing creative boundaries', color: 'from-blue-500 to-indigo-500' },
  { icon: Shield, title: 'Trust & Safety', desc: 'Protecting our community', color: 'from-purple-500 to-violet-500' },
]

const milestones = [
  { year: '2023', title: 'Founded', description: 'Design Connect was born with a mission to democratize design.', color: '#fb8000' },
  { year: '2023', title: '10K Users', description: 'Reached our first 10,000 registered users milestone.', color: '#f59e0b' },
  { year: '2024', title: 'Pro Launch', description: 'Launched the Pro plan with premium features for designers.', color: '#10b981' },
  { year: '2024', title: '100K Designs', description: 'Community collectively uploaded over 100,000 designs.', color: '#6366f1' },
  { year: '2025', title: 'Global Expansion', description: 'Expanded to serve designers in over 50 countries.', color: '#ec4899' },
]

const floatingShapes = [
  { size: 80, x: '10%', y: '20%', delay: 0, duration: 8 },
  { size: 50, x: '80%', y: '15%', delay: 1, duration: 10 },
  { size: 30, x: '70%', y: '60%', delay: 2, duration: 7 },
  { size: 60, x: '20%', y: '70%', delay: 0.5, duration: 9 },
  { size: 40, x: '90%', y: '45%', delay: 1.5, duration: 11 },
  { size: 20, x: '50%', y: '80%', delay: 3, duration: 6 },
]

const ctaParticles = Array.from({ length: 20 }, (_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 4,
  delay: Math.random() * 3,
  duration: 3 + Math.random() * 4,
}))

// Partner logos (SVG-based placeholders)
const partnerLogos = [
  { name: 'TechCorp', abbr: 'TC', color: '#3b82f6' },
  { name: 'DesignHub', abbr: 'DH', color: '#8b5cf6' },
  { name: 'CreativeIO', abbr: 'CIO', color: '#ec4899' },
  { name: 'PixelForge', abbr: 'PF', color: '#10b981' },
  { name: 'Artisian Co', abbr: 'AC', color: '#f59e0b' },
  { name: 'InnoSoft', abbr: 'IS', color: '#6366f1' },
]

// Open positions
const openPositions = [
  { title: 'Senior UI/UX Designer', department: 'Design', location: 'Remote', type: 'Full-time', color: 'from-orange-500 to-amber-500' },
  { title: 'Frontend Engineer (React)', department: 'Engineering', location: 'Remote', type: 'Full-time', color: 'from-blue-500 to-indigo-500' },
  { title: 'Community Manager', department: 'Marketing', location: 'Hybrid (India)', type: 'Full-time', color: 'from-green-500 to-emerald-500' },
  { title: 'Product Designer', department: 'Design', location: 'Remote', type: 'Full-time', color: 'from-purple-500 to-violet-500' },
]

const departments = ['All', 'Design', 'Engineering', 'Marketing']

export default function AboutPage() {
  const navigateTo = useNavStore((s) => s.navigateTo)
  const heroRef = useRef<HTMLElement>(null)
  const { toast } = useToast()
  const [selectedDept, setSelectedDept] = useState('All')

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150])

  const filteredPositions = selectedDept === 'All'
    ? openPositions
    : openPositions.filter(p => p.department === selectedDept)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section ref={heroRef} className="relative bg-gradient-to-br from-[#0f172a] via-[#1a1f3a] to-[#1e293b] text-white overflow-hidden">
        {/* Animated floating shapes */}
        {floatingShapes.map((shape, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-white/5"
            style={{
              width: shape.size,
              height: shape.size,
              left: shape.x,
              top: shape.y,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: shape.duration,
              delay: shape.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[100px]"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Dot pattern overlay */}
        <div className="absolute inset-0 dot-pattern opacity-30" />

        <motion.div style={{ y: heroY }} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-sm badge-pulse">
                <Sparkles className="w-3 h-3 mr-1" /> Our Story
              </Badge>
            </motion.div>
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Empowering{' '}
              <span className="gradient-text-flow">
                Creativity
              </span>{' '}
              Worldwide
            </motion.h1>
            <motion.p
              className="text-slate-300 max-w-2xl mx-auto text-lg leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Design Connect is the premier platform for designers to showcase their work,
              connect with clients, and build thriving creative careers.
            </motion.p>
          </motion.div>

          {/* Decorative right illustration */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden xl:block opacity-10">
            <svg width="300" height="400" viewBox="0 0 300 400" fill="none">
              <circle cx="150" cy="100" r="80" stroke="white" strokeWidth="1" />
              <circle cx="150" cy="100" r="50" stroke="white" strokeWidth="0.5" />
              <rect x="80" y="200" width="140" height="100" rx="10" stroke="white" strokeWidth="1" />
              <line x1="100" y1="230" x2="200" y2="230" stroke="white" strokeWidth="0.5" />
              <line x1="100" y1="250" x2="180" y2="250" stroke="white" strokeWidth="0.5" />
              <line x1="100" y1="270" x2="160" y2="270" stroke="white" strokeWidth="0.5" />
              <polygon points="150,320 130,360 170,360" stroke="white" strokeWidth="1" fill="none" />
            </svg>
          </div>
        </motion.div>
      </section>

      {/* Mission */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-40" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-0">Our Mission</Badge>
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
                {missionCards.map((card, i) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.5 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="relative group"
                  >
                    <Card className="border-0 glass-card overflow-hidden hover-lift cursor-default">
                      <CardContent className="p-5 text-center">
                        <motion.div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}
                          whileHover={{ scale: 1.2, rotate: 5 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <card.icon className="w-5 h-5 text-white" />
                        </motion.div>
                        <h3 className="font-semibold text-sm">{card.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
                      </CardContent>
                    </Card>
                    {i < missionCards.length - 1 && i % 2 === 0 && (
                      <div className="connecting-line hidden lg:block" />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 gap-4"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ y: -6, scale: 1.03 }}
                >
                  <Card className="border-0 shadow-sm dark:bg-slate-900 glow-card hover-lift cursor-default">
                    <CardContent className="p-6 text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 + 0.3, type: 'spring', stiffness: 200 }}
                      >
                        <stat.icon className="w-8 h-8 text-[#fb8000] mx-auto mb-3" />
                      </motion.div>
                      <p className="text-3xl font-bold bg-gradient-to-r from-[#fb8000] to-[#f59e0b] bg-clip-text text-transparent">{stat.value}</p>
                      <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Partner Logos Section */}
      <section className="py-16 bg-slate-50/50 dark:bg-slate-900/30 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Trusted by leading companies</p>
          </motion.div>

          <div className="marquee">
            <div className="marquee-content">
              {[...partnerLogos, ...partnerLogos].map((logo, i) => (
                <div key={i} className="flex-shrink-0 mx-8">
                  <div className="partner-logo flex items-center gap-2 py-4 px-6 rounded-xl">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                      style={{ background: `linear-gradient(135deg, ${logo.color}, ${logo.color}cc)` }}
                    >
                      {logo.abbr}
                    </div>
                    <span className="text-lg font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">{logo.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-slate-50/50 dark:bg-slate-900/50 relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <Badge className="mb-4 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-0">Our People</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The passionate people behind Design Connect
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="group"
              >
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="glow-border rounded-2xl"
                >
                  <Card className="border-0 shadow-sm dark:shadow-slate-900/30 dark:hover:shadow-slate-900/50 transition-all text-center dark:bg-slate-900 rounded-2xl overflow-hidden">
                    <CardContent className="p-6 relative">
                      {/* Gradient avatar */}
                      <motion.div
                        className="w-20 h-20 rounded-full mx-auto mb-4 relative overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, #fb8000, #f59e0b)`,
                        }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <span className="text-2xl font-bold text-white flex items-center justify-center h-full">{member.initials}</span>
                        {/* Shine effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.6 }}
                        />
                      </motion.div>

                      <h3 className="font-bold">{member.name}</h3>
                      <p className="text-sm text-[#fb8000] mb-2">{member.role}</p>
                      <p className="text-sm text-muted-foreground">{member.bio}</p>

                      {/* Skill tags */}
                      <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                        {member.skills.map(skill => (
                          <Badge key={skill} variant="secondary" className="text-[10px] px-2 py-0.5 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-0">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      {/* Social links that appear on hover */}
                      <motion.div
                        className="flex justify-center gap-2 mt-4"
                        initial={{ opacity: 0, y: 10 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ opacity: 0 }}
                      >
                        <div className="group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                          {[
                            { Icon: Twitter, href: member.socials.twitter },
                            { Icon: Linkedin, href: member.socials.linkedin },
                            { Icon: Mail, href: member.socials.mail },
                          ].map(({ Icon, href }, idx) => (
                            <a
                              key={idx}
                              href={href}
                              className="w-8 h-8 rounded-lg bg-muted/50 hover:bg-[#fb8000] hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </a>
                          ))}
                          <button
                            onClick={() => {
                              toast({ title: 'Coming soon', description: 'Portfolio pages will be available soon!' })
                            }}
                            className="text-[10px] text-[#fb8000] hover:underline font-medium ml-1"
                          >
                            View Portfolio
                          </button>
                        </div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <Badge className="mb-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-0 badge-shine">
              <Briefcase className="w-3 h-3 mr-1" /> We&apos;re Hiring
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Join Our Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Help us shape the future of design. We&apos;re looking for passionate people.
            </p>
          </motion.div>

          {/* Department filter */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {departments.map(dept => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedDept === dept
                    ? 'bg-[#fb8000] text-white shadow-md'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Job listings */}
          <div className="space-y-4">
            {filteredPositions.map((pos, i) => (
              <motion.div
                key={pos.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-0 shadow-sm dark:bg-slate-900 job-card cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pos.color} flex items-center justify-center flex-shrink-0`}>
                          <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base group-hover:text-[#fb8000] transition-colors">{pos.title}</h3>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" /> {pos.location}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" /> {pos.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 shrink-0 border-[#fb8000]/30 text-[#fb8000] hover:bg-[#fb8000] hover:text-white"
                        onClick={() => {
                          toast({ title: 'Coming soon', description: 'Application form will be available soon!' })
                        }}
                      >
                        Apply <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredPositions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No open positions in this department right now.</p>
            </div>
          )}
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <Badge className="mb-4 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-0">Our History</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Journey</h2>
            <p className="text-muted-foreground">Key milestones in Design Connect&apos;s growth</p>
          </motion.div>

          <div className="relative">
            {/* Animated gradient line */}
            <motion.div
              className="absolute left-8 top-0 bottom-0 w-0.5"
              style={{
                background: 'linear-gradient(to bottom, #fb8000, #f59e0b, #10b981, #6366f1, #ec4899)',
              }}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />

            <div className="space-y-10">
              {milestones.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="flex gap-6 items-start"
                >
                  <div className="flex flex-col items-center flex-shrink-0 z-10">
                    <motion.div
                      className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${m.color}, ${m.color}dd)` }}
                      whileHover={{ scale: 1.15 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <span className="text-xs font-bold text-white">{m.year}</span>
                    </motion.div>
                    {/* Pulse dot */}
                    <motion.div
                      className="mt-1"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                    </motion.div>
                  </div>
                  <motion.div whileHover={{ x: 4 }} className="flex-1">
                    <Card className="border-0 shadow-sm dark:bg-slate-900 hover-lift glow-card cursor-default">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                          <h3 className="font-semibold">{m.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{m.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden animated-gradient-bg">
        {/* Particle effects */}
        {ctaParticles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <motion.h2
              className="text-3xl sm:text-4xl font-bold mb-4 text-white"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Join Our Growing Community
            </motion.h2>
            <p className="text-white/80 mb-8 text-lg">
              Be part of the next generation of creative professionals
            </p>
            <Button
              onClick={() => navigateTo('auth')}
              size="lg"
              className="bg-white text-[#fb8000] hover:bg-white/90 border-0 gap-2 px-8 btn-glow font-semibold shadow-xl hover:shadow-2xl transition-shadow"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
