'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight, Palette, Download, Users, Star, Sparkles,
  Eye, Heart, MessageSquare, ShieldCheck, Zap, Globe,
  ChevronRight, TrendingUp, Award
} from 'lucide-react'
import { useNavStore } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } }
}

const stats = [
  { icon: Users, label: 'Designers', value: '10K+', color: 'text-blue-500' },
  { icon: Download, label: 'Downloads', value: '500K+', color: 'text-green-500' },
  { icon: Palette, label: 'Designs', value: '100K+', color: 'text-purple-500' },
  { icon: Star, label: 'Rating', value: '4.9/5', color: 'text-amber-500' },
]

const categories = [
  { name: 'Logo Design', icon: '🎨', count: '12.5K', slug: 'logo-design' },
  { name: 'UI/UX Design', icon: '📱', count: '8.3K', slug: 'ui-ux' },
  { name: 'Illustrations', icon: '✏️', count: '15.2K', slug: 'illustrations' },
  { name: 'Typography', icon: '🔤', count: '6.1K', slug: 'typography' },
  { name: '3D Design', icon: '🧊', count: '4.7K', slug: '3d-design' },
  { name: 'Social Media', icon: '📲', count: '9.8K', slug: 'social-media' },
  { name: 'Print Design', icon: '🖨️', count: '7.2K', slug: 'print-design' },
  { name: 'Motion Design', icon: '🎬', count: '5.4K', slug: 'motion-design' },
]

const steps = [
  {
    step: '01',
    title: 'Discover Designs',
    description: 'Browse thousands of high-quality designs from talented designers worldwide.',
    icon: Globe,
  },
  {
    step: '02',
    title: 'Connect & Collaborate',
    description: 'Follow designers, leave comments, and collaborate on projects together.',
    icon: Users,
  },
  {
    step: '03',
    title: 'Download & Create',
    description: 'Get source files, customize designs, and bring your vision to life.',
    icon: Download,
  },
]

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Brand Designer',
    avatar: 'SC',
    content: 'Design Connect transformed my freelance career. I\'ve connected with amazing clients and the platform\'s exposure has been incredible.',
    rating: 5,
  },
  {
    name: 'Marcus Johnson',
    role: 'Startup Founder',
    avatar: 'MJ',
    content: 'Finding a designer for our startup was so easy. The quality of work on Design Connect is outstanding and the prices are fair.',
    rating: 5,
  },
  {
    name: 'Aisha Patel',
    role: 'UI/UX Designer',
    avatar: 'AP',
    content: 'The community here is so supportive. I\'ve grown so much as a designer since joining Design Connect. Highly recommend!',
    rating: 5,
  },
]

interface FeaturedDesign {
  id: string
  title: string
  thumbnail: string
  designer_name: string
  like_count: number
  view_count: number
  is_free: boolean
  price: number
}

export default function HomePage() {
  const navigateTo = useNavStore((s) => s.navigateTo)
  const [featuredDesigns, setFeaturedDesigns] = useState<FeaturedDesign[]>([])
  const [loadingDesigns, setLoadingDesigns] = useState(true)
  const [animatedStats, setAnimatedStats] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedStats(true), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('designs')
          .select('id, title, thumbnail, designer_id, like_count, view_count, is_free, price, users!designs_designer_id_fkey(name)')
          .eq('is_featured', true)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(8)

        if (data && !error) {
          const mapped: FeaturedDesign[] = data.map((d: any) => ({
            id: d.id,
            title: d.title,
            thumbnail: d.thumbnail,
            designer_name: d.users?.name || 'Unknown',
            like_count: d.like_count || 0,
            view_count: d.view_count || 0,
            is_free: d.is_free,
            price: d.price || 0,
          }))
          setFeaturedDesigns(mapped)
        }
      } catch {
        // Fallback: show placeholder designs
        setFeaturedDesigns([
          { id: '1', title: 'Modern Brand Identity', thumbnail: '/placeholder-1.jpg', designer_name: 'Sarah Chen', like_count: 234, view_count: 1200, is_free: false, price: 29 },
          { id: '2', title: 'Minimal Logo Pack', thumbnail: '/placeholder-2.jpg', designer_name: 'Alex Rivera', like_count: 456, view_count: 2300, is_free: true, price: 0 },
          { id: '3', title: 'Social Media Kit', thumbnail: '/placeholder-3.jpg', designer_name: 'Maya Patel', like_count: 189, view_count: 980, is_free: false, price: 19 },
          { id: '4', title: 'App UI Template', thumbnail: '/placeholder-4.jpg', designer_name: 'James Wilson', like_count: 312, view_count: 1800, is_free: false, price: 49 },
          { id: '5', title: 'Poster Collection', thumbnail: '/placeholder-5.jpg', designer_name: 'Luna Kim', like_count: 567, view_count: 3100, is_free: true, price: 0 },
          { id: '6', title: 'Icon Set Premium', thumbnail: '/placeholder-6.jpg', designer_name: 'Omar Hassan', like_count: 198, view_count: 1500, is_free: false, price: 15 },
          { id: '7', title: 'Business Card Template', thumbnail: '/placeholder-7.jpg', designer_name: 'Emma Torres', like_count: 345, view_count: 2100, is_free: true, price: 0 },
          { id: '8', title: 'Website Hero Bundle', thumbnail: '/placeholder-8.jpg', designer_name: 'David Park', like_count: 423, view_count: 2800, is_free: false, price: 39 },
        ])
      } finally {
        setLoadingDesigns(false)
      }
    }
    fetchFeatured()
  }, [])

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-100/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-sm font-medium text-orange-700 mb-6">
                <Sparkles className="w-4 h-4" />
                Join 10,000+ creative designers
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Where{' '}
                <span className="bg-gradient-to-r from-[#fb8000] to-[#f59e0b] bg-clip-text text-transparent">
                  creativity
                </span>{' '}
                meets{' '}
                <span className="bg-gradient-to-r from-[#fb8000] to-[#e57600] bg-clip-text text-transparent">
                  opportunity
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
                Discover, share, and sell your creative designs. Connect with talented designers
                worldwide and find the perfect design for your next project.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => navigateTo('browse')}
                  className="gradient-orange gradient-orange-hover text-white border-0 gap-2 text-base px-8 h-12"
                >
                  Explore Designs <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigateTo('upload')}
                  className="gap-2 text-base px-8 h-12"
                >
                  Start Selling
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 mt-10 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  Secure Payments
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Instant Downloads
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-500" />
                  Global Community
                </div>
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                {/* Main Card */}
                <Card className="shadow-2xl shadow-orange-200/50 border-0 p-0 overflow-hidden">
                  <div className="aspect-[4/3] bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                    <Palette className="w-24 h-24 text-white/80" />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Featured Collection</h3>
                        <p className="text-sm text-muted-foreground">Trending designs this week</p>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        4.9
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Floating Cards */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-6 -left-6 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Earnings</p>
                    <p className="font-bold text-green-600">$24,580</p>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Award className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Designers</p>
                    <p className="font-bold text-orange-600">10,200+</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={animatedStats ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Designs */}
      <section className="py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Featured Designs</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hand-picked designs from our community of talented creators
            </p>
          </motion.div>

          {loadingDesigns ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredDesigns.map((design, i) => (
                <motion.div
                  key={design.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card
                    className="cursor-pointer group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    onClick={() => {
                      useNavStore.getState().setSelectedDesignId(design.id)
                      navigateTo('design-detail')
                    }}
                  >
                    <div className="aspect-[4/3] bg-gradient-to-br from-orange-100 to-amber-100 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Palette className="w-12 h-12 text-orange-300" />
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ opacity: 1, scale: 1 }}
                          className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="w-5 h-5 text-dark" />
                        </motion.div>
                      </div>
                      {design.is_free && (
                        <span className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                          Free
                        </span>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm line-clamp-1 mb-1">{design.title}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{design.designer_name}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" /> {design.like_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {design.view_count}
                          </span>
                        </div>
                        {!design.is_free && (
                          <span className="font-semibold text-[#fb8000]">${design.price}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Button
              variant="outline"
              onClick={() => navigateTo('browse')}
              className="gap-2"
            >
              View All Designs <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Browse by Category</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find the perfect design in your preferred category
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className="cursor-pointer group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-slate-50 hover:bg-white"
                  onClick={() => navigateTo('categories')}
                >
                  <CardContent className="p-6 text-center">
                    <span className="text-3xl mb-3 block">{cat.icon}</span>
                    <h3 className="font-semibold text-sm mb-1">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground">{cat.count} designs</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button
              variant="outline"
              onClick={() => navigateTo('categories')}
              className="gap-2"
            >
              All Categories <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative"
              >
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 text-center hover:bg-slate-800 transition-colors">
                  <div className="w-16 h-16 rounded-2xl gradient-orange flex items-center justify-center mx-auto mb-6">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-sm font-bold text-[#fb8000] mb-2 block">{step.step}</span>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 text-slate-600">
                    <ChevronRight className="w-8 h-8" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Loved by Designers</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hear what our community has to say
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-0 shadow-sm hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                      &ldquo;{t.content}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-orange flex items-center justify-center">
                        <span className="text-sm font-bold text-white">{t.avatar}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to showcase your creativity?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of designers who are already earning and growing on Design Connect.
              Start your creative journey today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigateTo('auth')}
                className="gradient-orange gradient-orange-hover text-white border-0 gap-2 text-base px-8 h-12"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigateTo('pricing')}
                className="gap-2 text-base px-8 h-12"
              >
                View Pricing
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
