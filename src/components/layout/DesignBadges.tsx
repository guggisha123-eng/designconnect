'use client'

import { motion } from 'framer-motion'
import { Flame, Star, Trophy, Gem, Sparkles, Gift } from 'lucide-react'

export interface BadgeDesignData {
  id: string
  like_count: number
  download_count: number
  avgRating?: number
  price: number
  is_free: boolean
  created_at: string
}

export interface BadgeDef {
  key: string
  label: string
  icon: typeof Flame
  bgColor: string
  textColor: string
  darkBgColor: string
  darkTextColor: string
  emoji: string
  check: (d: BadgeDesignData) => boolean
}

const BADGE_DEFINITIONS: BadgeDef[] = [
  {
    key: 'trending',
    label: 'Trending',
    icon: Flame,
    bgColor: 'bg-orange-500',
    textColor: 'text-white',
    darkBgColor: 'dark:bg-orange-600',
    darkTextColor: 'dark:text-white',
    emoji: '🔥',
    check: (d) => d.like_count >= 100,
  },
  {
    key: 'top-rated',
    label: 'Top Rated',
    icon: Star,
    bgColor: 'bg-amber-500',
    textColor: 'text-white',
    darkBgColor: 'dark:bg-amber-600',
    darkTextColor: 'dark:text-white',
    emoji: '⭐',
    check: (d) => (d.avgRating ?? 0) >= 4.5,
  },
  {
    key: 'best-seller',
    label: 'Best Seller',
    icon: Trophy,
    bgColor: 'bg-green-500',
    textColor: 'text-white',
    darkBgColor: 'dark:bg-green-600',
    darkTextColor: 'dark:text-white',
    emoji: '🏆',
    check: (d) => d.download_count >= 50,
  },
  {
    key: 'premium',
    label: 'Premium',
    icon: Gem,
    bgColor: 'bg-purple-500',
    textColor: 'text-white',
    darkBgColor: 'dark:bg-purple-600',
    darkTextColor: 'dark:text-white',
    emoji: '💎',
    check: (d) => !d.is_free && d.price > 30,
  },
  {
    key: 'new',
    label: 'New',
    icon: Sparkles,
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
    darkBgColor: 'dark:bg-blue-600',
    darkTextColor: 'dark:text-white',
    emoji: '🆕',
    check: (d) => {
      const created = new Date(d.created_at)
      const now = new Date()
      const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
      return diffDays <= 7
    },
  },
  {
    key: 'free',
    label: 'Free',
    icon: Gift,
    bgColor: 'bg-emerald-500',
    textColor: 'text-white',
    darkBgColor: 'dark:bg-emerald-600',
    darkTextColor: 'dark:text-white',
    emoji: '🎁',
    check: (d) => d.is_free,
  },
]

export function getEarnedBadges(design: BadgeDesignData): BadgeDef[] {
  return BADGE_DEFINITIONS.filter((b) => b.check(design))
}

interface BadgeDisplayProps {
  design: BadgeDesignData
  size?: 'sm' | 'md'
  className?: string
  maxBadges?: number
}

export function BadgeDisplay({ design, size = 'sm', className = '', maxBadges }: BadgeDisplayProps) {
  const earned = getEarnedBadges(design)
  const badges = maxBadges ? earned.slice(0, maxBadges) : earned

  if (badges.length === 0) return null

  const isSm = size === 'sm'

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {badges.map((badge, i) => {
        const Icon = badge.icon
        return (
          <motion.span
            key={badge.key}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: i * 0.08,
              duration: 0.3,
              type: 'spring',
              stiffness: 400,
              damping: 20,
            }}
            className={`
              inline-flex items-center gap-1 rounded-full font-semibold shadow-sm
              ${badge.bgColor} ${badge.textColor} ${badge.darkBgColor} ${badge.darkTextColor}
              ${isSm ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2.5 py-1'}
            `}
          >
            <Icon className={isSm ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
            <span>{badge.label}</span>
          </motion.span>
        )
      })}
    </div>
  )
}
