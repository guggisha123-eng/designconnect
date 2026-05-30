'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, Palette, Download, Users, Star, Sparkles,
  Eye, Heart, MessageSquare, ShieldCheck, Zap, Globe,
  ChevronRight, TrendingUp, Award, UserPlus, Check, RefreshCw, Wand2,
  ChevronDown, DownloadCloud
} from 'lucide-react'
import { useNavStore, type Page } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { isSupabaseReady, createClient } from '@/lib/supabase/client'
import RecentlyViewed from '@/components/layout/RecentlyViewed'
import LazyImage from '@/components/ui/LazyImage'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const stats = [
  { icon: Users, label: 'Designers', value: 10000, suffix: '+', color: 'text-blue-500', bgColor: 'bg-blue-500/10', iconLabel: 'Users' },
  { icon: Download, label: 'Downloads', value: 500000, suffix: '+', color: 'text-green-500', bgColor: 'bg-green-500/10', iconLabel: 'Download' },
  { icon: Star, label: 'Rating', value: 4.9, suffix: '/5', color: 'text-amber-500', bgColor: 'bg-amber-500/10', iconLabel: 'Star' },
  { icon: Globe, label: 'Countries', value: 120, suffix: '+', color: 'text-cyan-500', bgColor: 'bg-cyan-500/10', iconLabel: 'Globe' },
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

const trendingDesigners = [
  { id: 'd1', name: 'Sarah Chen', specialization: 'Logo Design', designCount: 45, avatar: 'SC', color: 'from-orange-500 to-amber-500' },
  { id: 'd2', name: 'Alex Rivera', specialization: 'UI/UX', designCount: 38, avatar: 'AR', color: 'from-blue-500 to-cyan-500' },
  { id: 'd3', name: 'Maya Patel', specialization: 'Illustrations', designCount: 52, avatar: 'MP', color: 'from-purple-500 to-pink-500' },
  { id: 'd4', name: 'James Wilson', specialization: '3D Design', designCount: 29, avatar: 'JW', color: 'from-green-500 to-emerald-500' },
]

const aiRecommendations = [
  { id: '5', title: 'Poster Collection', designer: 'Luna Kim', image: '/designs/poster-collection.png', likes: 567, isFree: true, price: 0, reason: 'Trending in print design this week' },
  { id: '4', title: 'App UI Template', designer: 'James Wilson', image: '/designs/app-ui.png', likes: 312, isFree: false, price: 49, reason: 'Top-rated in UI/UX category' },
  { id: '1', title: 'Modern Brand Identity', designer: 'Sarah Chen', image: '/designs/brand-identity.png', likes: 234, isFree: false, price: 29, reason: 'Most downloaded brand kit' },
  { id: '6', title: 'Icon Set Premium', designer: 'Omar Hassan', image: '/designs/icon-set.png', likes: 198, isFree: false, price: 15, reason: 'Best value for premium icons' },
]

const designImageMap: Record<string, string> = {
  '1': '/designs/brand-identity.png',
  '2': '/designs/logo-pack.png',
  '3': '/designs/social-media-kit.png',
  '4': '/designs/app-ui.png',
  '5': '/designs/poster-collection.png',
  '6': '/designs/icon-set.png',
  '7': '/designs/business-card.png',
  '8': '/designs/hero-bundle.png',
}

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

// Animated counter hook
function useAnimatedCounter(target: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!start) return
    let startTime: number | null = null
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target * 100) / 100)
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(target)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [target, duration, start])

  return count
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'K'
  }
  return num.toString()
}

// Stat counter component
function StatCounter({ stat, isInView }: { stat: typeof stats[0], isInView: boolean }) {
  const count = useAnimatedCounter(stat.value, 2000, isInView)

  const displayValue = stat.value >= 1000
    ? formatNumber(Math.round(count))
    : count % 1 === 0
      ? Math.round(count).toString()
      : count.toFixed(1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="text-center group"
    >
      <div className={`w-14 h-14 rounded-2xl ${stat.bgColor} flex items-center justify-center mx-auto mb-3 transition-transform duration-300 ${isInView ? 'animate-pulse-once' : ''}`}>
        <stat.icon className={`w-7 h-7 ${stat.color}`} />
      </div>
      <p className="text-3xl sm:text-4xl font-bold tabular-nums stat-gradient-number">
        {displayValue}{stat.suffix}
      </p>
      <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
    </motion.div>
  )
}

// Designer card component
function DesignerCard({ designer }: { designer: typeof trendingDesigners[0] }) {
  const [followed, setFollowed] = useState(false)

  return (
    <Card className="border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${designer.color} flex items-center justify-center shrink-0 shadow-lg shadow-black/10`}>
            <span className="text-lg font-bold text-white">{designer.avatar}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{designer.name}</h3>
            <p className="text-xs text-muted-foreground">{designer.specialization}</p>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-medium text-foreground">{designer.designCount}</span> designs
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant={followed ? 'outline' : 'default'}
          className={`w-full mt-4 gap-1.5 text-xs h-8 transition-all duration-200 ${
            followed
              ? 'border-green-300 text-green-600 hover:text-green-700 hover:border-green-400'
              : 'gradient-orange gradient-orange-hover text-white border-0'
          }`}
          onClick={(e) => {
            e.stopPropagation()
            setFollowed(!followed)
          }}
        >
          {followed ? (
            <>
              <Check className="w-3 h-3" /> Following
            </>
          ) : (
            <>
              <UserPlus className="w-3 h-3" /> Follow
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

// AI Recommendation Card Component
function AIRecommendationCard({
  rec,
  index,
  navigateTo,
}: {
  rec: typeof aiRecommendations[0]
  index: number
  navigateTo: (page: Page) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className="cursor-pointer group overflow-hidden border-0 shadow-sm hover:shadow-xl hover:shadow-purple-200/40 dark:hover:shadow-purple-900/30 transition-all duration-300 hover:-translate-y-1"
            onClick={() => {
              useNavStore.getState().setSelectedDesignId(rec.id)
              navigateTo('design-detail')
            }}
          >
            <div className="aspect-[4/3] relative overflow-hidden">
              <LazyImage
                src={rec.image}
                alt={rec.title}
                className="w-full h-full transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              {/* AI Pick Badge */}
              <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-purple-600 to-violet-500 text-white text-xs font-medium rounded-full shadow-lg shadow-purple-500/30">
                <Sparkles className="w-3 h-3" />
                AI Pick
              </span>
              {rec.isFree && (
                <span className="absolute top-3 right-3 px-2.5 py-1 bg-green-500 text-white text-xs font-medium rounded-full shadow-lg shadow-green-500/30">
                  Free
                </span>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="w-11 h-11 rounded-full bg-white/90 dark:bg-slate-800/90 flex items-center justify-center shadow-lg">
                  <Eye className="w-5 h-5" />
                </div>
              </div>
            </div>
            <CardContent className="p-4 bg-white dark:bg-slate-900">
              <h3 className="font-semibold text-sm mb-1 line-clamp-1">{rec.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">{rec.designer}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" /> {rec.likes}
                </span>
                {!rec.isFree && (
                  <span className="font-semibold text-[#fb8000]">${rec.price}</span>
                )}
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-gradient-to-r from-purple-600 to-violet-500 text-white border-0 shadow-xl shadow-purple-500/20 max-w-[200px]"
        >
          <div className="flex items-center gap-1.5">
            <Wand2 className="w-3 h-3 shrink-0" />
            <span>{rec.reason}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </motion.div>
  )
}

// AI Recommendations Section Component
function AIRecommendationsSection({ navigateTo }: { navigateTo: (page: Page) => void }) {
  const [recommendations, setRecommendations] = useState(aiRecommendations)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Shuffle the array
    setTimeout(() => {
      setRecommendations((prev) => {
        const shuffled = [...prev]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled
      })
      setIsRefreshing(false)
    }, 500)
  }

  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-br from-purple-50/30 via-white to-orange-50/30 dark:from-purple-950/20 dark:via-slate-950 dark:to-orange-950/20">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-purple-200/20 dark:bg-purple-800/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-orange-200/20 dark:bg-orange-800/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeInUp} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-sm font-medium text-purple-700 dark:text-purple-400 mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            AI-Curated{' '}
            <span className="bg-gradient-to-r from-purple-600 to-violet-500 bg-clip-text text-transparent">
              For You
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Personalized picks powered by AI
          </p>
        </motion.div>

        {/* Cards - horizontal scroll on mobile, 4-col grid on desktop */}
        <div className="flex gap-6 overflow-x-auto pb-4 lg:overflow-visible lg:grid lg:grid-cols-4 lg:pb-0 snap-x snap-mandatory scrollbar-hide">
          {recommendations.map((rec, i) => (
            <div key={rec.id} className="min-w-[260px] snap-start lg:min-w-0">
              <AIRecommendationCard rec={rec} index={i} navigateTo={navigateTo} />
            </div>
          ))}
        </div>

        {/* Refresh button */}
        <div className="text-center mt-10">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Picks'}
          </Button>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const navigateTo = useNavStore((s) => s.navigateTo)
  const [featuredDesigns, setFeaturedDesigns] = useState<FeaturedDesign[]>([])
  const [loadingDesigns, setLoadingDesigns] = useState(true)
  const [statsInView, setStatsInView] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const [likedDesigns, setLikedDesigns] = useState<Set<string>>(new Set())

  // Social proof counter animation state
  const [socialProofCount, setSocialProofCount] = useState(0)
  const [socialProofStarted, setSocialProofStarted] = useState(false)

  // Typing effect state
  const [typedText, setTypedText] = useState('')
  const subtitleText = 'Discover, share, and sell your creative designs. Connect with talented designers worldwide and find the perfect design for your next project.'
  const [typingComplete, setTypingComplete] = useState(false)

  // Word cycling effect state
  const cyclingWords = ['creativity', 'innovation', 'design', 'art']
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [wordState, setWordState] = useState<'entering' | 'stable' | 'exiting'>('stable')

  // Mouse move parallax for hero image
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const heroEl = heroRef.current
    if (!heroEl) return
    const rect = heroEl.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setMousePos({ x, y })
  }, [])

  useEffect(() => {
    const heroEl = heroRef.current
    if (!heroEl) return
    heroEl.addEventListener('mousemove', handleMouseMove)
    return () => heroEl.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  // Typing effect
  useEffect(() => {
    const delay = 800 // start after hero animation
    const charDelay = 25
    const timer = setTimeout(() => {
      let i = 0
      const interval = setInterval(() => {
        if (i < subtitleText.length) {
          setTypedText(subtitleText.slice(0, i + 1))
          i++
        } else {
          clearInterval(interval)
          setTypingComplete(true)
        }
      }, charDelay)
      return () => clearInterval(interval)
    }, delay)
    return () => clearTimeout(timer)
  }, [])

  // Word cycling effect
  useEffect(() => {
    if (!typingComplete) return
    const cycleInterval = setInterval(() => {
      setWordState('exiting')
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % cyclingWords.length)
        setWordState('entering')
        setTimeout(() => setWordState('stable'), 400)
      }, 300)
    }, 3000)
    return () => clearInterval(cycleInterval)
  }, [typingComplete, cyclingWords.length])

  // Social proof counter animation
  useEffect(() => {
    const timer = setTimeout(() => setSocialProofStarted(true), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!socialProofStarted) return
    const target = 10000
    const duration = 2000
    let startTime: number | null = null
    let animationFrame: number
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setSocialProofCount(Math.round(eased * target))
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }
    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [socialProofStarted])

  // Parallax for hero image (scroll)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  })
  const heroImageY = useTransform(scrollYProgress, [0, 1], [0, 80])

  // Stats intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  // Featured designs fetch
  useEffect(() => {
    const fallbackDesigns: FeaturedDesign[] = [
      { id: '1', title: 'Modern Brand Identity', thumbnail: '/designs/brand-identity.png', designer_name: 'Sarah Chen', like_count: 234, view_count: 1200, is_free: false, price: 29 },
      { id: '2', title: 'Minimal Logo Pack', thumbnail: '/designs/logo-pack.png', designer_name: 'Alex Rivera', like_count: 456, view_count: 2300, is_free: true, price: 0 },
      { id: '3', title: 'Social Media Kit', thumbnail: '/designs/social-media-kit.png', designer_name: 'Maya Patel', like_count: 189, view_count: 980, is_free: false, price: 19 },
      { id: '4', title: 'App UI Template', thumbnail: '/designs/app-ui.png', designer_name: 'James Wilson', like_count: 312, view_count: 1800, is_free: false, price: 49 },
      { id: '5', title: 'Poster Collection', thumbnail: '/designs/poster-collection.png', designer_name: 'Luna Kim', like_count: 567, view_count: 3100, is_free: true, price: 0 },
      { id: '6', title: 'Icon Set Premium', thumbnail: '/designs/icon-set.png', designer_name: 'Omar Hassan', like_count: 198, view_count: 1500, is_free: false, price: 15 },
      { id: '7', title: 'Business Card Template', thumbnail: '/designs/business-card.png', designer_name: 'Emma Torres', like_count: 345, view_count: 2100, is_free: true, price: 0 },
      { id: '8', title: 'Website Hero Bundle', thumbnail: '/designs/hero-bundle.png', designer_name: 'David Park', like_count: 423, view_count: 2800, is_free: false, price: 39 },
    ]

    const fetchFeatured = async () => {
      try {
        if (!isSupabaseReady()) {
          setFeaturedDesigns(fallbackDesigns)
          return
        }

        const supabase = createClient()
        const { data, error } = await supabase
          .from('designs')
          .select('id, title, thumbnail, designer_id, like_count, view_count, is_free, price, users!designs_designer_id_fkey(name)')
          .eq('is_featured', true)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(8)

        if (data && !error) {
          const mapped: FeaturedDesign[] = data.map((d: Record<string, unknown>) => ({
            id: d.id as string,
            title: d.title as string,
            thumbnail: (d.thumbnail as string) || (designImageMap[d.id as string] || '/designs/brand-identity.png'),
            designer_name: ((d.users as Record<string, string>)?.name) || 'Unknown',
            like_count: (d.like_count as number) || 0,
            view_count: (d.view_count as number) || 0,
            is_free: d.is_free as boolean,
            price: (d.price as number) || 0,
          }))
          setFeaturedDesigns(mapped)
        }
      } catch {
        setFeaturedDesigns(fallbackDesigns)
      } finally {
        setLoadingDesigns(false)
      }
    }
    fetchFeatured()
  }, [])

  const toggleLike = useCallback((designId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setLikedDesigns(prev => {
      const next = new Set(prev)
      if (next.has(designId)) next.delete(designId)
      else next.add(designId)
      return next
    })
  }, [])

  const getDesignImage = useCallback((design: FeaturedDesign) => {
    // Use real image from map if thumbnail is a placeholder
    if (design.thumbnail.startsWith('/placeholder') || !design.thumbnail) {
      return designImageMap[design.id] || '/designs/brand-identity.png'
    }
    return design.thumbnail
  }, [])

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
        {/* Gradient mesh background */}
        <div className="absolute inset-0 gradient-mesh-bg" />
        {/* Dot grid background */}
        <div className="absolute inset-0 dot-grid-bg opacity-60" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 dark:bg-orange-900/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-200/30 dark:bg-amber-900/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-100/20 dark:bg-orange-900/10 rounded-full blur-3xl" />
          {/* Particle dots */}
          <div className="particle-dot" style={{ top: '12%', left: '15%', '--particle-size': '5px', '--particle-opacity': '0.35', '--particle-duration': '7s', '--particle-delay': '0s', '--particle-x': '15px', '--particle-y': '-25px' } as React.CSSProperties} />
          <div className="particle-dot" style={{ top: '25%', left: '70%', '--particle-size': '3px', '--particle-opacity': '0.25', '--particle-duration': '9s', '--particle-delay': '1.5s', '--particle-x': '-10px', '--particle-y': '-15px' } as React.CSSProperties} />
          <div className="particle-dot" style={{ top: '60%', left: '25%', '--particle-size': '6px', '--particle-opacity': '0.2', '--particle-duration': '11s', '--particle-delay': '3s', '--particle-x': '20px', '--particle-y': '-30px' } as React.CSSProperties} />
          <div className="particle-dot" style={{ top: '80%', left: '80%', '--particle-size': '4px', '--particle-opacity': '0.3', '--particle-duration': '8s', '--particle-delay': '2s', '--particle-x': '-12px', '--particle-y': '20px' } as React.CSSProperties} />
          <div className="particle-dot" style={{ top: '40%', left: '50%', '--particle-size': '3px', '--particle-opacity': '0.2', '--particle-duration': '10s', '--particle-delay': '4s', '--particle-x': '8px', '--particle-y': '-18px' } as React.CSSProperties} />
          <div className="particle-dot" style={{ top: '70%', left: '10%', '--particle-size': '5px', '--particle-opacity': '0.25', '--particle-duration': '12s', '--particle-delay': '1s', '--particle-x': '-15px', '--particle-y': '12px' } as React.CSSProperties} />
          <div className="particle-dot" style={{ top: '15%', left: '85%', '--particle-size': '4px', '--particle-opacity': '0.3', '--particle-duration': '9s', '--particle-delay': '5s', '--particle-x': '10px', '--particle-y': '-22px' } as React.CSSProperties} />
          <div className="particle-dot" style={{ top: '50%', left: '90%', '--particle-size': '3px', '--particle-opacity': '0.15', '--particle-duration': '13s', '--particle-delay': '2.5s', '--particle-x': '-8px', '--particle-y': '16px' } as React.CSSProperties} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-full text-sm font-medium text-orange-700 dark:text-orange-400 mb-6 badge-pulse">
                <Sparkles className="w-4 h-4 animate-pulse" />
                Join {socialProofCount.toLocaleString()}+ creative designers
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-shadow-subtle">
                Where{' '}
                <span className="gradient-text-animate word-cycle-container">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={cyclingWords[currentWordIndex]}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.3 }}
                      className="inline-block"
                    >
                      {cyclingWords[currentWordIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>{' '}
                meets{' '}
                <span className="gradient-text-animate" style={{ animationDelay: '2s' }}>
                  opportunity
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed">
                {typedText}
                {!typingComplete && <span className="inline-block w-0.5 h-5 bg-[#fb8000] ml-0.5 animate-pulse" />}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => navigateTo('browse')}
                  className="gradient-orange gradient-orange-hover text-white border-0 gap-2 text-base px-8 h-12 pulse-glow-btn btn-glow cta-prominent"
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
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-10 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 transition-transform duration-200 hover:scale-105 cursor-default">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  Secure Payments
                </div>
                <div className="flex items-center gap-2 transition-transform duration-200 hover:scale-105 cursor-default">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Instant Downloads
                </div>
                <div className="flex items-center gap-2 transition-transform duration-200 hover:scale-105 cursor-default">
                  <Globe className="w-4 h-4 text-blue-500" />
                  Global Community
                </div>
              </div>

              {/* Scroll indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="hidden lg:flex items-center gap-2 mt-12 text-muted-foreground text-sm"
              >
                <ChevronDown className="w-4 h-4 bounce-scroll-indicator" />
                <span className="text-xs">Scroll to explore</span>
              </motion.div>
            </motion.div>

            {/* Hero Visual - Real image with parallax */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                {/* Main Card with real image */}
                <motion.div style={{ y: heroImageY, x: mousePos.x * 20, rotateY: mousePos.x * 5, rotateX: -mousePos.y * 5 }}>
                  <Card className="shadow-2xl shadow-orange-200/50 dark:shadow-orange-900/30 border-0 p-0 overflow-hidden gradient-border-glow hero-card-deep-shadow cursor-particle" style={{ transformStyle: 'preserve-3d', transition: 'transform 0.15s ease-out' }}>
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <LazyImage
                        src="/designs/creative-workspace.png"
                        alt="Creative workspace showcasing design tools and projects"
                        className="w-full h-full object-cover"
                      />
                      {/* AI Studio Badge */}
                      <button
                        onClick={(e) => { e.stopPropagation(); navigateTo('inspiration') }}
                        className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-violet-500 text-white text-xs font-semibold rounded-full shadow-lg shadow-purple-500/30 badge-enhanced hover:from-purple-500 hover:to-violet-400 transition-colors"
                      >
                        <Sparkles className="w-3 h-3" />
                        New: AI Studio
                      </button>
                    </div>
                    <CardContent className="p-4 bg-white dark:bg-slate-900">
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
                </motion.div>

                {/* Floating Cards */}
                <motion.div
                  animate={{ y: [0, -8, 0], x: [0, 2, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-6 -left-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-3 flex items-center gap-3 glass-card"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Earnings</p>
                    <p className="font-bold text-green-600 dark:text-green-400">$24,580</p>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 8, 0], x: [0, -2, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-4 -right-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-3 flex items-center gap-3 glass-card"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Award className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Designers</p>
                    <p className="font-bold text-orange-600 dark:text-orange-400">10,200+</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-16 bg-gradient-to-r from-white via-orange-50/30 to-white dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 border-y border-border/50 relative overflow-hidden">
        {/* Subtle decorative shapes */}
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-orange-100/20 dark:bg-orange-900/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-blue-100/20 dark:bg-blue-900/10 rounded-full blur-2xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            {stats.map((stat, i) => (
              <div key={stat.label} className={`stagger-${i + 1} flex flex-col items-center`}>
                <StatCounter stat={stat} isInView={statsInView} />
                {/* Gradient divider between stats (not after last) */}
                {i < stats.length - 1 && (
                  <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2">
                    <div className="stat-divider" />
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Mobile dividers */}
          <div className="grid grid-cols-2 md:hidden mt-6">
            <div className="border-r border-border/30" />
            <div />
          </div>
        </div>
      </section>

      {/* Featured Designs */}
      <section className="py-20 bg-slate-50/50 dark:bg-slate-950/50">
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
                <div key={i} className="aspect-[4/3] rounded-xl shimmer" />
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
                    className="cursor-pointer group overflow-hidden border-0 shadow-sm hover:shadow-xl hover:shadow-orange-100/50 dark:hover:shadow-orange-900/20 transition-all duration-300 hover:-translate-y-1 glow-card"
                    onClick={() => {
                      useNavStore.getState().setSelectedDesignId(design.id)
                      navigateTo('design-detail')
                    }}
                  >
                    <div className="aspect-[4/3] relative overflow-hidden">
                      {/* Real design image */}
                      <LazyImage
                        src={getDesignImage(design)}
                        alt={design.title}
                        className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Bottom overlay gradient for text readability */}
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      {/* Hover overlay with actions */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-start justify-end p-3">
                        {/* Heart / Like button */}
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => toggleLike(design.id, e)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                            likedDesigns.has(design.id)
                              ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                              : 'bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${likedDesigns.has(design.id) ? 'fill-current' : ''}`} />
                        </motion.button>
                      </div>
                      {/* View button in center on hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ opacity: 1, scale: 1 }}
                          className="w-11 h-11 rounded-full bg-white/90 dark:bg-slate-800/90 flex items-center justify-center shadow-lg"
                        >
                          <Eye className="w-5 h-5" />
                        </motion.div>
                      </div>
                      {design.is_free && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-green-500 text-white text-xs font-medium rounded-full shadow-lg shadow-green-500/30">
                          Free
                        </span>
                      )}
                      {/* Title overlay at bottom */}
                      <div className="absolute bottom-0 inset-x-0 p-3">
                        <h3 className="font-semibold text-sm text-white line-clamp-1 drop-shadow-md">{design.title}</h3>
                      </div>
                    </div>
                    <CardContent className="p-4 bg-white dark:bg-slate-900">
                      <p className="text-xs text-muted-foreground mb-3">{design.designer_name}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Heart className={`w-3 h-3 ${likedDesigns.has(design.id) ? 'text-red-500 fill-red-500' : ''}`} />
                            {likedDesigns.has(design.id) ? design.like_count + 1 : design.like_count}
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

      {/* Trending Designers */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-full text-xs font-medium text-orange-700 dark:text-orange-400 mb-4">
              <TrendingUp className="w-3.5 h-3.5" />
              Trending Now
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Trending Designers</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Follow top creators and stay inspired by their latest work
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingDesigners.map((designer, i) => (
              <motion.div
                key={designer.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <DesignerCard designer={designer} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-slate-50/50 dark:bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Browse by Category</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find the perfect design in your preferred category
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat, i) => {
              const accentClasses = ['cat-accent-orange', 'cat-accent-blue', 'cat-accent-purple', 'cat-accent-amber', 'cat-accent-cyan', 'cat-accent-pink', 'cat-accent-green', 'cat-accent-red']
              const bgColors = ['bg-orange-50 dark:bg-orange-950/20', 'bg-blue-50 dark:bg-blue-950/20', 'bg-purple-50 dark:bg-purple-950/20', 'bg-amber-50 dark:bg-amber-950/20', 'bg-cyan-50 dark:bg-cyan-950/20', 'bg-pink-50 dark:bg-pink-950/20', 'bg-green-50 dark:bg-green-950/20', 'bg-red-50 dark:bg-red-950/20']
              return (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className={`cursor-pointer group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 ${bgColors[i % bgColors.length]} hover:bg-white dark:hover:bg-slate-800 icon-bounce ${accentClasses[i % accentClasses.length]}`}
                  onClick={() => navigateTo('categories')}
                >
                  <CardContent className="p-6 text-center">
                    <span className="text-3xl mb-3 block cat-icon transition-transform duration-300 group-hover:scale-110">{cat.icon}</span>
                    <h3 className="font-semibold text-sm mb-1">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground">{cat.count} designs</p>
                  </CardContent>
                </Card>
              </motion.div>
            )})}
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

      {/* Recently Viewed */}
      <RecentlyViewed />

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
      <section className="py-20 bg-white dark:bg-slate-900">
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
                <Card className="border-0 shadow-sm hover:shadow-lg hover:shadow-orange-100/30 dark:hover:shadow-orange-900/10 transition-all duration-300 h-full bg-white dark:bg-slate-800 group hover:-translate-y-1 quote-bg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className={`w-4 h-4 transition-colors duration-300 ${j < t.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-200 dark:text-gray-700'}`} />
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

      {/* AI-Curated For You */}
      <AIRecommendationsSection navigateTo={navigateTo} />

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 animated-gradient-bg" />
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
              <pattern id="cta-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-grid)" />
            <rect width="100%" height="100%" fill="url(#cta-dots)" />
          </svg>
        </div>
        {/* Decorative circles & shapes */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full" />
        {/* Additional decorative shapes */}
        <div className="absolute top-1/4 left-10 w-4 h-24 bg-white/10 rounded-full rotate-12" />
        <div className="absolute bottom-1/4 right-16 w-3 h-16 bg-white/10 rounded-full -rotate-12" />
        <div className="absolute top-12 right-1/4 w-20 h-20 border-2 border-white/10 rounded-full" />
        <div className="absolute bottom-16 left-1/3 w-12 h-12 border-2 border-white/10 rounded-full" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full text-sm font-medium text-white mb-6">
              <Sparkles className="w-4 h-4" />
              Free to get started
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white">
              Ready to showcase your creativity?
            </h2>
            <p className="text-white/80 mb-10 max-w-xl mx-auto text-lg leading-relaxed">
              Join thousands of designers who are already earning and growing on Design Connect.
              Start your creative journey today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigateTo('auth')}
                className="bg-white text-[#fb8000] hover:bg-white/90 border-0 gap-2 text-base px-8 h-12 shadow-xl shadow-black/10 btn-glow"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigateTo('pricing')}
                className="gap-2 text-base px-8 h-12 border-white/30 text-white hover:bg-white/10 hover:text-white btn-glow"
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
