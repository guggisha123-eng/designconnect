'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, Medal, Crown, Star, TrendingUp, TrendingDown,
  MapPin, Heart, Download, Eye, Users, Flame, Award,
  CheckCircle2, ArrowUpRight, Zap, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavStore } from '@/store/nav-store'

/* ─── Types ─── */
interface DesignerStats {
  designs: number
  likes: string
  downloads: string
  rating: number
}

interface Designer {
  id: string
  rank: number
  name: string
  avatar: string
  specialty: string
  location: string
  stats: DesignerStats
  verified: boolean
  trending: 'up' | 'down' | 'neutral'
  trendingPercent: number
  category: string
  isRising?: boolean
  growthPercent?: number
  sparklineData?: number[]
}

/* ─── Demo Data ─── */
const allDesigners: Designer[] = [
  {
    id: 'sarah-chen',
    rank: 1,
    name: 'Sarah Chen',
    avatar: 'SC',
    specialty: 'Brand Identity & Logo Design',
    location: 'San Francisco, CA',
    stats: { designs: 85, likes: '15.6K', downloads: '89K', rating: 4.9 },
    verified: true,
    trending: 'up',
    trendingPercent: 12,
    category: 'Logo Design',
  },
  {
    id: 'alex-rivera',
    rank: 2,
    name: 'Alex Rivera',
    avatar: 'AR',
    specialty: 'UI/UX Design Systems',
    location: 'Austin, TX',
    stats: { designs: 72, likes: '12.3K', downloads: '67K', rating: 4.8 },
    verified: true,
    trending: 'up',
    trendingPercent: 8,
    category: 'UI/UX',
  },
  {
    id: 'maya-patel',
    rank: 3,
    name: 'Maya Patel',
    avatar: 'MP',
    specialty: 'Illustration & Visual Art',
    location: 'Mumbai, India',
    stats: { designs: 64, likes: '11.8K', downloads: '58K', rating: 4.8 },
    verified: true,
    trending: 'up',
    trendingPercent: 15,
    category: 'Illustrations',
  },
  {
    id: 'james-wilson',
    rank: 4,
    name: 'James Wilson',
    avatar: 'JW',
    specialty: '3D Design & Motion',
    location: 'London, UK',
    stats: { designs: 56, likes: '9.4K', downloads: '45K', rating: 4.7 },
    verified: true,
    trending: 'up',
    trendingPercent: 5,
    category: '3D Design',
  },
  {
    id: 'luna-kim',
    rank: 5,
    name: 'Luna Kim',
    avatar: 'LK',
    specialty: 'Typography & Lettering',
    location: 'Seoul, Korea',
    stats: { designs: 48, likes: '8.7K', downloads: '42K', rating: 4.7 },
    verified: true,
    trending: 'down',
    trendingPercent: 3,
    category: 'Typography',
  },
  {
    id: 'omar-hassan',
    rank: 6,
    name: 'Omar Hassan',
    avatar: 'OH',
    specialty: 'Logo & Brand Design',
    location: 'Dubai, UAE',
    stats: { designs: 42, likes: '7.2K', downloads: '34K', rating: 4.6 },
    verified: true,
    trending: 'up',
    trendingPercent: 7,
    category: 'Logo Design',
  },
  {
    id: 'emma-torres',
    rank: 7,
    name: 'Emma Torres',
    avatar: 'ET',
    specialty: 'UI/UX & Product Design',
    location: 'Barcelona, Spain',
    stats: { designs: 38, likes: '6.1K', downloads: '28K', rating: 4.6 },
    verified: false,
    trending: 'neutral',
    trendingPercent: 0,
    category: 'UI/UX',
  },
  {
    id: 'david-park',
    rank: 8,
    name: 'David Park',
    avatar: 'DP',
    specialty: '3D Modeling & Rendering',
    location: 'Tokyo, Japan',
    stats: { designs: 35, likes: '5.4K', downloads: '22K', rating: 4.5 },
    verified: false,
    trending: 'down',
    trendingPercent: 2,
    category: '3D Design',
  },
  {
    id: 'aisha-patel',
    rank: 9,
    name: 'Aisha Patel',
    avatar: 'AP',
    specialty: 'Illustration & Digital Art',
    location: 'Toronto, Canada',
    stats: { designs: 29, likes: '4.3K', downloads: '18K', rating: 4.5 },
    verified: false,
    trending: 'up',
    trendingPercent: 6,
    category: 'Illustrations',
  },
  {
    id: 'marcus-johnson',
    rank: 10,
    name: 'Marcus Johnson',
    avatar: 'MJ',
    specialty: 'Typography & Layout',
    location: 'Chicago, IL',
    stats: { designs: 22, likes: '3.1K', downloads: '12K', rating: 4.4 },
    verified: false,
    trending: 'up',
    trendingPercent: 4,
    category: 'Typography',
  },
  {
    id: 'sofia-rodriguez',
    rank: 11,
    name: 'Sofia Rodriguez',
    avatar: 'SR',
    specialty: 'Brand & Identity Design',
    location: 'Mexico City, Mexico',
    stats: { designs: 15, likes: '2.0K', downloads: '8K', rating: 4.3 },
    verified: false,
    trending: 'neutral',
    trendingPercent: 0,
    category: 'Logo Design',
  },
  {
    id: 'kenji-tanaka',
    rank: 12,
    name: 'Kenji Tanaka',
    avatar: 'KT',
    specialty: '3D & Motion Design',
    location: 'Osaka, Japan',
    stats: { designs: 8, likes: '1.2K', downloads: '5K', rating: 4.2 },
    verified: false,
    trending: 'down',
    trendingPercent: 1,
    category: '3D Design',
  },
]

const risingStars: Designer[] = [
  {
    id: 'rising-1',
    rank: 0,
    name: 'Yuki Nakamura',
    avatar: 'YN',
    specialty: 'Minimalist Logo Design',
    location: 'Kyoto, Japan',
    stats: { designs: 12, likes: '1.8K', downloads: '7K', rating: 4.6 },
    verified: false,
    trending: 'up',
    trendingPercent: 47,
    category: 'Logo Design',
    isRising: true,
    growthPercent: 47,
    sparklineData: [10, 15, 20, 28, 35, 42, 47],
  },
  {
    id: 'rising-2',
    rank: 0,
    name: 'Priya Sharma',
    avatar: 'PS',
    specialty: 'Colorful Illustrations',
    location: 'Delhi, India',
    stats: { designs: 9, likes: '1.4K', downloads: '5K', rating: 4.5 },
    verified: false,
    trending: 'up',
    trendingPercent: 38,
    category: 'Illustrations',
    isRising: true,
    growthPercent: 38,
    sparklineData: [5, 8, 14, 18, 25, 30, 38],
  },
  {
    id: 'rising-3',
    rank: 0,
    name: 'Leo Martinez',
    avatar: 'LM',
    specialty: '3D Icon Design',
    location: 'Buenos Aires, Argentina',
    stats: { designs: 6, likes: '980', downloads: '3K', rating: 4.4 },
    verified: false,
    trending: 'up',
    trendingPercent: 62,
    category: '3D Design',
    isRising: true,
    growthPercent: 62,
    sparklineData: [8, 12, 22, 30, 40, 52, 62],
  },
  {
    id: 'rising-4',
    rank: 0,
    name: 'Zara Ahmed',
    avatar: 'ZA',
    specialty: 'UI Component Design',
    location: 'Lagos, Nigeria',
    stats: { designs: 11, likes: '1.6K', downloads: '6K', rating: 4.5 },
    verified: false,
    trending: 'up',
    trendingPercent: 29,
    category: 'UI/UX',
    isRising: true,
    growthPercent: 29,
    sparklineData: [5, 8, 10, 14, 18, 22, 29],
  },
]

/* ─── Time Filter ─── */
type TimeFilter = 'all' | 'month' | 'week'
type CategoryFilter = 'All' | 'Logo Design' | 'UI/UX' | 'Illustrations' | 'Typography' | '3D Design'

const timeFilters: { key: TimeFilter; label: string }[] = [
  { key: 'all', label: 'All Time' },
  { key: 'month', label: 'This Month' },
  { key: 'week', label: 'This Week' },
]

const categoryFilters: CategoryFilter[] = ['All', 'Logo Design', 'UI/UX', 'Illustrations', 'Typography', '3D Design']

/* ─── Mini Sparkline Component ─── */
function Sparkline({ data, color = '#fb8000' }: { data: number[]; color?: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 80
  const height = 32
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')
  const areaPoints = `0,${height} ${points} ${width},${height}`

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#sparkGrad)" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ─── Star Rating ─── */
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${s} ${i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
        />
      ))}
    </div>
  )
}

/* ─── Podium Card (Top 3) ─── */
function PodiumCard({ designer, index }: { designer: Designer; index: number }) {
  const { navigateTo, setSelectedDesignerId } = useNavStore()
  const isFirst = index === 1 // 1st place is center
  const rank = designer.rank

  const borderColors: Record<number, string> = {
    1: 'from-yellow-400 via-amber-400 to-yellow-500',
    2: 'from-slate-300 via-gray-300 to-slate-400',
    3: 'from-amber-600 via-orange-700 to-amber-800',
  }
  const glowColors: Record<number, string> = {
    1: 'shadow-[0_0_30px_rgba(234,179,8,0.3)]',
    2: 'shadow-[0_0_20px_rgba(148,163,184,0.3)]',
    3: 'shadow-[0_0_20px_rgba(180,83,9,0.3)]',
  }
  const medalColors: Record<number, string> = {
    1: 'text-yellow-500',
    2: 'text-slate-400',
    3: 'text-amber-700',
  }
  const bgAccents: Record<number, string> = {
    1: 'from-yellow-50/80 to-amber-50/50 dark:from-yellow-900/20 dark:to-amber-900/10',
    2: 'from-slate-50/80 to-gray-50/50 dark:from-slate-800/30 dark:to-gray-800/20',
    3: 'from-orange-50/80 to-amber-50/50 dark:from-orange-900/20 dark:to-amber-900/10',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 + index * 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 + index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={`relative flex flex-col items-center ${isFirst ? 'md:-mt-8' : 'md:mt-6'}`}
    >
      <div
        className={`relative w-full rounded-2xl p-[2px] bg-gradient-to-br ${borderColors[rank]} ${glowColors[rank]}`}
      >
        <div className={`rounded-2xl bg-gradient-to-br ${bgAccents[rank]} backdrop-blur-sm p-6 text-center`}>
          {/* Rank Number */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${borderColors[rank]} flex items-center justify-center shadow-lg`}>
              <span className="text-white font-bold text-lg">{rank}</span>
            </div>
          </div>

          {/* Crown for 1st place */}
          {rank === 1 && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2">
              <Crown className="w-8 h-8 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
            </div>
          )}

          {/* Designer of the Month badge */}
          {rank === 1 && (
            <div className="flex justify-center mb-3">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-semibold shadow-md">
                <Award className="w-3 h-3" /> Designer of the Month
              </span>
            </div>
          )}

          {/* Avatar */}
          <div className="mt-4 mb-3 relative">
            <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${borderColors[rank]} flex items-center justify-center p-[3px]`}>
              <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center">
                <span className={`text-2xl font-bold ${medalColors[rank]}`}>{designer.avatar}</span>
              </div>
            </div>
            {/* Medal icon */}
            <div className="absolute -bottom-1 -right-1 left-1/2 ml-4">
              <Medal className={`w-6 h-6 ${medalColors[rank]} drop-shadow-sm`} />
            </div>
            {/* Verified */}
            {designer.verified && (
              <div className="absolute -bottom-1 -left-1 left-1/2 -ml-10">
                <CheckCircle2 className="w-5 h-5 text-blue-500 fill-blue-500 stroke-white dark:stroke-slate-800" />
              </div>
            )}
          </div>

          {/* Name & Specialty */}
          <h3 className="text-lg font-bold text-foreground mt-2">{designer.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{designer.specialty}</p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{designer.stats.designs}</p>
              <p className="text-xs text-muted-foreground">Designs</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{designer.stats.likes}</p>
              <p className="text-xs text-muted-foreground">Likes</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{designer.stats.downloads}</p>
              <p className="text-xs text-muted-foreground">Downloads</p>
            </div>
            <div className="text-center flex flex-col items-center">
              <p className="text-lg font-bold text-foreground">{designer.stats.rating}</p>
              <StarRating rating={designer.stats.rating} size="sm" />
            </div>
          </div>

          {/* Follow Button */}
          <Button
            onClick={() => {
              setSelectedDesignerId(designer.id)
              navigateTo('designer-profile')
            }}
            className="mt-4 w-full gradient-orange gradient-orange-hover text-white border-0 text-sm font-medium"
          >
            View Profile
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Ranked Designer Card (4-12) ─── */
function RankedCard({ designer }: { designer: Designer }) {
  const { navigateTo, setSelectedDesignerId } = useNavStore()
  const [followed, setFollowed] = useState(false)
  const isTop5 = designer.rank <= 5

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 + (designer.rank - 4) * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card glow-card rounded-xl p-4 hover-lift group cursor-pointer"
      onClick={() => {
        setSelectedDesignerId(designer.id)
        navigateTo('designer-profile')
      }}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-lg ${
          isTop5
            ? 'bg-gradient-to-br from-[#fb8000] to-[#e57600] text-white shadow-md shadow-orange-500/20'
            : 'bg-muted text-muted-foreground'
        }`}>
          {designer.rank}
        </div>

        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center flex-shrink-0 relative">
          <span className="text-sm font-bold text-foreground">{designer.avatar}</span>
          {designer.verified && (
            <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500 stroke-white dark:stroke-slate-600 absolute -bottom-0.5 -right-0.5" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-foreground truncate">{designer.name}</h4>
            {/* Trending */}
            {designer.trending === 'up' && (
              <span className="inline-flex items-center gap-0.5 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" /> {designer.trendingPercent}%
              </span>
            )}
            {designer.trending === 'down' && (
              <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded-full">
                <TrendingDown className="w-3 h-3" /> {designer.trendingPercent}%
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">{designer.specialty}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <MapPin className="w-3 h-3" /> {designer.location}
          </div>
        </div>

        {/* Follow Button */}
        <Button
          variant={followed ? 'secondary' : 'outline'}
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            setFollowed(!followed)
          }}
          className={`flex-shrink-0 text-xs font-medium transition-all ${
            followed
              ? 'bg-[#fb8000] text-white border-[#fb8000] hover:bg-[#e57600]'
              : 'hover:border-[#fb8000] hover:text-[#fb8000]'
          }`}
        >
          {followed ? 'Following' : 'Follow'}
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center gap-1.5 text-sm">
          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="font-medium text-foreground">{designer.stats.designs}</span>
          <span className="text-muted-foreground text-xs hidden sm:inline">designs</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <Heart className="w-3.5 h-3.5 text-red-400" />
          <span className="font-medium text-foreground">{designer.stats.likes}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <Download className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-medium text-foreground">{designer.stats.downloads}</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <StarRating rating={designer.stats.rating} size="sm" />
          <span className="font-medium text-foreground text-xs">{designer.stats.rating}</span>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Rising Star Card ─── */
function RisingStarCard({ designer, index }: { designer: Designer; index: number }) {
  const { navigateTo, setSelectedDesignerId } = useNavStore()
  const [watching, setWatching] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card glow-card rounded-xl p-5 hover-lift group"
    >
      {/* Rising Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold shadow-sm shadow-orange-500/20">
          <Flame className="w-3 h-3" /> Rising
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-bold text-green-600 dark:text-green-400">
          <TrendingUp className="w-4 h-4" /> +{designer.growthPercent}%
        </span>
      </div>

      {/* Designer Info */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-200 to-amber-200 dark:from-orange-800 dark:to-amber-800 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-orange-700 dark:text-orange-200">{designer.avatar}</span>
        </div>
        <div>
          <h4 className="font-semibold text-foreground">{designer.name}</h4>
          <p className="text-sm text-muted-foreground">{designer.specialty}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <MapPin className="w-3 h-3" /> {designer.location}
          </div>
        </div>
      </div>

      {/* Sparkline */}
      {designer.sparklineData && (
        <div className="mb-3 p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Growth Trend</span>
            <span className="text-xs font-medium text-[#fb8000]">This month</span>
          </div>
          <Sparkline data={designer.sparklineData} />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div>
          <p className="font-bold text-foreground">{designer.stats.designs}</p>
          <p className="text-xs text-muted-foreground">Designs</p>
        </div>
        <div>
          <p className="font-bold text-foreground">{designer.stats.likes}</p>
          <p className="text-xs text-muted-foreground">Likes</p>
        </div>
        <div>
          <p className="font-bold text-foreground">{designer.stats.rating}</p>
          <p className="text-xs text-muted-foreground">Rating</p>
        </div>
      </div>

      {/* Watch Button */}
      <Button
        onClick={() => {
          if (!watching) {
            setSelectedDesignerId(designer.id)
            navigateTo('designer-profile')
          }
          setWatching(!watching)
        }}
        className={`w-full text-sm font-medium border-0 transition-all ${
          watching
            ? 'bg-[#fb8000] text-white hover:bg-[#e57600]'
            : 'gradient-orange gradient-orange-hover text-white'
        }`}
      >
        {watching ? (
          <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Watching</span>
        ) : (
          <span className="inline-flex items-center gap-1.5"><Zap className="w-4 h-4" /> Watch</span>
        )}
      </Button>
    </motion.div>
  )
}

/* ─── Main LeaderboardPage Component ─── */
export default function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All')

  // Filter designers based on category
  const filteredDesigners = useMemo(() => {
    if (categoryFilter === 'All') return allDesigners
    return allDesigners.filter((d) => d.category === categoryFilter)
  }, [categoryFilter])

  // Filter rising stars based on category
  const filteredRising = useMemo(() => {
    if (categoryFilter === 'All') return risingStars
    return risingStars.filter((d) => d.category === categoryFilter)
  }, [categoryFilter])

  // Split for podium (top 3) and ranked list (4+)
  const podiumDesigners = filteredDesigners.slice(0, 3)
  const rankedDesigners = filteredDesigners.slice(3)

  // Reorder podium for display: 2nd, 1st, 3rd
  const podiumOrder = podiumDesigners.length >= 3
    ? [podiumDesigners[1], podiumDesigners[0], podiumDesigners[2]]
    : podiumDesigners

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden dot-grid-bg">
        {/* Decorative shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#fb8000]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Trophy Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#fb8000] to-[#e57600] mb-6 shadow-lg shadow-orange-500/20">
              <Trophy className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold gradient-text-animate mb-4">
              Designer Leaderboard
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the most talented designers on the platform. Ranked by their impact,
              creativity, and community engagement.
            </p>
          </motion.div>

          {/* Time Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center gap-2 mt-8"
          >
            {timeFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => setTimeFilter(f.key)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  timeFilter === f.key
                    ? 'bg-gradient-to-r from-[#fb8000] to-[#e57600] text-white shadow-md shadow-orange-500/20'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </motion.div>

          {/* Category Filter Pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-2 mt-4"
          >
            {categoryFilters.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  categoryFilter === cat
                    ? 'bg-[#fb8000] text-white shadow-sm shadow-orange-500/20 scale-105'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Top 3 Podium */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        {podiumOrder.length >= 3 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {podiumOrder.map((designer, idx) => (
              <PodiumCard key={designer.id} designer={designer} index={idx} />
            ))}
          </div>
        ) : podiumOrder.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            {podiumOrder.map((designer, idx) => (
              <PodiumCard key={designer.id} designer={designer} index={idx} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No designers found for this category.</p>
          </div>
        )}
      </section>

      {/* Ranked List (4-12) */}
      {rankedDesigners.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground gradient-underline inline-block pb-1">
                Top Designers
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{filteredDesigners.length} designers</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {rankedDesigners.map((designer) => (
                <RankedCard key={designer.id} designer={designer} />
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Rising Stars Section */}
      {filteredRising.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground gradient-underline inline-block pb-1">
                  Rising Stars
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Up-and-coming designers with impressive growth
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredRising.map((designer, idx) => (
                <RisingStarCard key={designer.id} designer={designer} index={idx} />
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative overflow-hidden">
        <div className="animated-gradient-bg py-16">
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm mb-4">
                <ArrowUpRight className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Ready to Climb the Ranks?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Upload your designs, engage with the community, and showcase your talent
                to rise through the leaderboard.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Button
                  onClick={() => {
                    const store = useNavStore.getState()
                    if (store.isLoggedIn) {
                      store.navigateTo('upload')
                    } else {
                      store.navigateTo('auth')
                    }
                  }}
                  className="bg-white text-[#fb8000] hover:bg-white/90 font-semibold text-base px-8 py-3 shadow-lg btn-glow"
                >
                  Start Uploading
                </Button>
                <Button
                  onClick={() => useNavStore.getState().navigateTo('browse')}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 font-semibold text-base px-8 py-3"
                >
                  Explore Designs
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
