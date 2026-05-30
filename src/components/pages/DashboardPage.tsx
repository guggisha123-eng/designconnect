'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Eye, Heart, Download, DollarSign, Users,
  Palette, Star, TrendingUp, ShoppingBag, MessageSquare,
  Settings, Upload, BarChart3, PieChart, ArrowUpRight,
  ArrowDownRight, Clock, FileText, CreditCard, ShieldCheck, Pencil,
  Search, Filter, Trash2, Bell, Link2, Github, Chrome,
  AlertTriangle, Activity, CheckCircle2, XCircle, User,
  Crown, Mail, Zap, Image, Sparkles, Award, CircleDot,
  Wallet, ShoppingCart, BarChart2, Navigation
} from 'lucide-react'
import { useNavStore } from '@/store/nav-store'
import ProfileEditDialog from '@/components/pages/ProfileEditDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { createClient, isSupabaseReady } from '@/lib/supabase/client'

interface DesignItem {
  id: string
  title: string
  thumbnail_url: string | null
  image_urls: string[] | null
  view_count: number
  like_count: number
  download_count: number
  is_free: boolean
  price: number
  status: string
  created_at: string
}

interface OrderItem {
  id: string
  amount: number
  status: string
  created_at: string
  designs?: { title: string } | null
}

interface Stats {
  totalDesigns: number
  totalViews: number
  totalLikes: number
  totalDownloads: number
  earnings: number
  recentOrders: OrderItem[]
  recentDesigns: DesignItem[]
}

// Demo data for when Supabase is not configured
const demoDesigns: DesignItem[] = [
  { id: 'demo-1', title: 'Modern Brand Identity', thumbnail_url: null, image_urls: null, view_count: 1240, like_count: 89, download_count: 34, is_free: false, price: 29.99, status: 'active', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'demo-2', title: 'App UI Template', thumbnail_url: null, image_urls: null, view_count: 876, like_count: 64, download_count: 21, is_free: false, price: 19.99, status: 'active', created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 'demo-3', title: 'Social Media Kit', thumbnail_url: null, image_urls: null, view_count: 2100, like_count: 156, download_count: 72, is_free: true, price: 0, status: 'active', created_at: new Date(Date.now() - 86400000 * 7).toISOString() },
  { id: 'demo-4', title: 'E-commerce Icons Pack', thumbnail_url: null, image_urls: null, view_count: 534, like_count: 31, download_count: 18, is_free: false, price: 14.99, status: 'draft', created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 'demo-5', title: 'Portfolio Website Design', thumbnail_url: null, image_urls: null, view_count: 1890, like_count: 112, download_count: 45, is_free: false, price: 39.99, status: 'active', created_at: new Date(Date.now() - 86400000 * 10).toISOString() },
  { id: 'demo-6', title: 'Minimalist Logo Collection', thumbnail_url: null, image_urls: null, view_count: 423, like_count: 28, download_count: 9, is_free: false, price: 24.99, status: 'under_review', created_at: new Date(Date.now() - 86400000 * 1).toISOString() },
]

const demoOrders: OrderItem[] = [
  { id: 'order-1', amount: 29.99, status: 'completed', created_at: new Date(Date.now() - 3600000 * 4).toISOString(), designs: { title: 'Modern Brand Identity' } },
  { id: 'order-2', amount: 19.99, status: 'completed', created_at: new Date(Date.now() - 86400000 * 1).toISOString(), designs: { title: 'App UI Template' } },
  { id: 'order-3', amount: 39.99, status: 'pending', created_at: new Date(Date.now() - 3600000 * 2).toISOString(), designs: { title: 'Portfolio Website Design' } },
  { id: 'order-4', amount: 14.99, status: 'completed', created_at: new Date(Date.now() - 86400000 * 3).toISOString(), designs: { title: 'E-commerce Icons Pack' } },
]

// ─── SVG Chart Components ───────────────────────────────────────────────

// Revenue Line Chart - 12 months with bezier curves, gradient fill, tooltips
function RevenueLineChart() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const currentMonth = new Date().getMonth()

  const data = [
    { month: 'Jan', value: 320 },
    { month: 'Feb', value: 480 },
    { month: 'Mar', value: 390 },
    { month: 'Apr', value: 560 },
    { month: 'May', value: 720 },
    { month: 'Jun', value: 610 },
    { month: 'Jul', value: 850 },
    { month: 'Aug', value: 780 },
    { month: 'Sep', value: 920 },
    { month: 'Oct', value: 680 },
    { month: 'Nov', value: 540 },
    { month: 'Dec', value: 890 },
  ]

  const chartW = 600
  const chartH = 220
  const padX = 40
  const padY = 30
  const innerW = chartW - padX * 2
  const innerH = chartH - padY * 2

  const maxVal = Math.max(...data.map(d => d.value))
  const minVal = 0
  const range = maxVal - minVal || 1

  const points = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * innerW,
    y: chartH - padY - ((d.value - minVal) / range) * innerH,
    ...d,
  }))

  // Build smooth bezier path
  const buildSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return ''
    let path = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i]
      const next = pts[i + 1]
      const cpx1 = curr.x + (next.x - curr.x) * 0.4
      const cpx2 = next.x - (next.x - curr.x) * 0.4
      path += ` C ${cpx1} ${curr.y}, ${cpx2} ${next.y}, ${next.x} ${next.y}`
    }
    return path
  }

  const linePath = buildSmoothPath(points)
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartH - padY} L ${points[0].x} ${chartH - padY} Z`

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${chartW} ${chartH + 30}`} className="w-full min-w-[400px]" style={{ maxHeight: 280 }}>
        <defs>
          <linearGradient id="revLineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fb8000" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="revAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb8000" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#fb8000" stopOpacity="0.02" />
          </linearGradient>
          <filter id="glowDot">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = chartH - padY - ratio * innerH
          const label = Math.round(maxVal * ratio)
          return (
            <g key={ratio}>
              <line x1={padX} y1={y} x2={chartW - padX} y2={y} stroke="currentColor" className="text-border/20" strokeWidth="0.5" />
              <text x={padX - 6} y={y + 3} textAnchor="end" className="fill-muted-foreground text-[9px]">${label}</text>
            </g>
          )
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#revAreaGrad)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="url(#revLineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((p, i) => (
          <g
            key={i}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="cursor-pointer"
          >
            {/* Invisible hit area */}
            <circle cx={p.x} cy={p.y} r="14" fill="transparent" />
            {/* Glow ring for current month */}
            {i === currentMonth && (
              <circle cx={p.x} cy={p.y} r="10" fill="none" stroke="#fb8000" strokeWidth="1.5" opacity="0.4">
                <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            {/* Dot */}
            <circle
              cx={p.x} cy={p.y}
              r={hoveredIndex === i ? 5 : i === currentMonth ? 4.5 : 3}
              fill={i === currentMonth ? '#fb8000' : hoveredIndex === i ? '#fb8000' : '#f59e0b'}
              className="transition-all duration-200"
              filter={hoveredIndex === i ? 'url(#glowDot)' : undefined}
            />
            {/* Hover ring */}
            {hoveredIndex === i && (
              <circle cx={p.x} cy={p.y} r="8" fill="#fb8000" opacity="0.12" />
            )}
            {/* Tooltip */}
            {hoveredIndex === i && (
              <g>
                <rect
                  x={p.x - 38}
                  y={p.y - 38}
                  width="76"
                  height="26"
                  rx="6"
                  className="fill-popover stroke-border"
                  strokeWidth="0.5"
                />
                <text x={p.x} y={p.y - 27} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
                  ${data[i].value}
                </text>
                <text x={p.x} y={p.y - 17} textAnchor="middle" className="fill-muted-foreground text-[8px]">
                  {data[i].month}
                </text>
              </g>
            )}
          </g>
        ))}

        {/* Month labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={chartH - padY + 16}
            textAnchor="middle"
            className={`text-[9px] ${i === currentMonth ? 'fill-[#fb8000] font-bold' : 'fill-muted-foreground'}`}
          >
            {data[i].month}
          </text>
        ))}
      </svg>
    </div>
  )
}

// Category Donut Chart - animated segments, center text, legend
function CategoryDonutChart() {
  const segments = [
    { label: 'Logo', percentage: 35, color: '#fb8000', count: 21 },
    { label: 'UI/UX', percentage: 25, color: '#f59e0b', count: 15 },
    { label: 'Illustrations', percentage: 20, color: '#22c55e', count: 12 },
    { label: 'Typography', percentage: 12, color: '#8b5cf6', count: 7 },
    { label: 'Other', percentage: 8, color: '#6b7280', count: 5 },
  ]

  const size = 180
  const strokeWidth = 28
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const total = segments.reduce((s, seg) => s + seg.count, 0)

  let cumulativeOffset = 0
  const arcs = segments.map((seg) => {
    const dashLength = (seg.percentage / 100) * circumference
    const gap = 3
    const offset = cumulativeOffset
    cumulativeOffset += dashLength
    return {
      ...seg,
      dashLength: dashLength - gap,
      gap,
      offset,
      circumference,
    }
  })

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background ring */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            className="stroke-muted/30"
            strokeWidth={strokeWidth}
          />
          {/* Segments */}
          {arcs.map((arc, i) => (
            <motion.circle
              key={arc.label}
              cx={size / 2} cy={size / 2} r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${arc.dashLength} ${arc.circumference - arc.dashLength}`}
              strokeDashoffset={-arc.offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              initial={{ strokeDasharray: `0 ${arc.circumference}` }}
              animate={{ strokeDasharray: `${arc.dashLength} ${arc.circumference - arc.dashLength}` }}
              transition={{ duration: 1, delay: i * 0.15, ease: 'easeOut' }}
            />
          ))}
          {/* Center text */}
          <motion.text
            x={size / 2} y={size / 2 - 8}
            textAnchor="middle"
            className="fill-foreground text-2xl font-bold"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            {total}
          </motion.text>
          <text x={size / 2} y={size / 2 + 12} textAnchor="middle" className="fill-muted-foreground text-[10px]">
            Designs
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: seg.color }} />
            <span className="text-muted-foreground truncate">{seg.label}</span>
            <span className="font-semibold ml-auto">{seg.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Weekly Activity Heatmap - 7x4 grid like GitHub contribution graph
function WeeklyActivityHeatmap() {
  const [hoveredCell, setHoveredCell] = useState<{ day: number; week: number } | null>(null)

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const weeks = ['W1', 'W2', 'W3', 'W4']

  // Activity levels: 0-4
  const activityData = [
    [2, 3, 1, 2], // Mon
    [4, 2, 3, 1], // Tue
    [1, 1, 2, 3], // Wed
    [3, 4, 4, 2], // Thu
    [2, 3, 2, 4], // Fri
    [4, 2, 1, 3], // Sat
    [1, 1, 3, 2], // Sun
  ]

  const levelLabels = ['No activity', 'Low', 'Medium', 'High', 'Very high']
  const levelColors = [
    'bg-muted/30 dark:bg-muted/20',
    'bg-[#fb8000]/20',
    'bg-[#fb8000]/40',
    'bg-[#fb8000]/65',
    'bg-[#fb8000]',
  ]

  const cellSize = 32
  const gap = 4
  const labelW = 30
  const headerH = 20

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1 min-w-fit mx-auto">
          {/* Week headers */}
          <div className="flex gap-1 ml-[30px]">
            {weeks.map((w) => (
              <div
                key={w}
                className="text-[9px] text-muted-foreground text-center font-medium"
                style={{ width: cellSize, height: headerH, lineHeight: `${headerH}px` }}
              >
                {w}
              </div>
            ))}
          </div>
          {/* Rows */}
          {days.map((day, di) => (
            <div key={day} className="flex items-center gap-1">
              <div className="text-[9px] text-muted-foreground font-medium text-right pr-1" style={{ width: labelW }}>
                {day}
              </div>
              {activityData[di].map((level, wi) => (
                <motion.div
                  key={`${di}-${wi}`}
                  className={`rounded-[4px] ${levelColors[level]} cursor-pointer relative transition-all duration-150`}
                  style={{ width: cellSize, height: cellSize }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: (di * 4 + wi) * 0.02, duration: 0.2 }}
                  whileHover={{ scale: 1.15 }}
                  onMouseEnter={() => setHoveredCell({ day: di, week: wi })}
                  onMouseLeave={() => setHoveredCell(null)}
                >
                  {hoveredCell?.day === di && hoveredCell?.week === wi && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover border border-border rounded-md px-2 py-1 text-[9px] font-medium shadow-lg whitespace-nowrap z-10">
                      {levelLabels[level]} · {day} {weeks[wi]}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-center">
        <span className="text-[9px] text-muted-foreground">Less</span>
        {levelColors.map((cls, i) => (
          <div key={i} className={`w-3 h-3 rounded-[2px] ${cls}`} />
        ))}
        <span className="text-[9px] text-muted-foreground">More</span>
      </div>
    </div>
  )
}

// SVG sparkline component
function Sparkline({ data, color, width = 80, height = 28 }: { data: number[]; color: string; width?: number; height?: number }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const padding = 2

  const points = data.map((value, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - ((value - min) / range) * (height - padding * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`${padding},${height - padding} ${points} ${padding + (data.length - 1) / (data.length - 1) * (width - padding * 2)},${height - padding}`}
        fill={`url(#spark-${color.replace('#', '')})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Animated number component
function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0)
  const prevValue = useRef(0)
  const startTime = useRef<number | null>(null)
  const rafId = useRef<number>()

  useEffect(() => {
    const startVal = prevValue.current
    startTime.current = null

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp
      const progress = Math.min((timestamp - startTime.current) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setDisplayValue(startVal + (value - startVal) * eased)
      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate)
      } else {
        prevValue.current = value
      }
    }

    rafId.current = requestAnimationFrame(animate)
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [value, duration])

  if (value >= 1000) {
    return <>{displayValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</>
  }
  if (value % 1 !== 0) {
    return <>{displayValue.toFixed(2)}</>
  }
  return <>{Math.round(displayValue).toLocaleString()}</>
}

// Status badge helper
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-500 text-white border-0 text-xs gap-1"><CheckCircle2 className="w-3 h-3" />Active</Badge>
    case 'draft':
      return <Badge variant="secondary" className="text-xs gap-1"><XCircle className="w-3 h-3" />Draft</Badge>
    case 'under_review':
      return <Badge className="bg-amber-500 text-white border-0 text-xs gap-1"><Clock className="w-3 h-3" />Under Review</Badge>
    default:
      return <Badge variant="secondary" className="text-xs">{status}</Badge>
  }
}

// Activity timeline data
type ActivityKind = 'sale' | 'follower' | 'review' | 'approved' | 'payment'

const activityFeedData: {
  kind: ActivityKind
  title: string
  description: string
  timestamp: string
}[] = [
  { kind: 'sale', title: 'New Sale', description: 'Portfolio Website Design purchased for $39.99', timestamp: '5 min ago' },
  { kind: 'follower', title: 'New Follower', description: 'Sarah Chen started following you', timestamp: '22 min ago' },
  { kind: 'review', title: 'New Review', description: 'Aisha Patel rated Social Media Kit 5 stars', timestamp: '1 hour ago' },
  { kind: 'approved', title: 'Design Approved', description: 'Minimalist Logo Collection is now live!', timestamp: '2 hours ago' },
  { kind: 'payment', title: 'Payment Received', description: '$29.99 from Brand Identity sale deposited', timestamp: '4 hours ago' },
  { kind: 'sale', title: 'New Sale', description: 'App UI Template purchased for $19.99', timestamp: '6 hours ago' },
]

const activityKindConfig: Record<ActivityKind, { icon: typeof Heart; color: string; bgColor: string }> = {
  sale: { icon: DollarSign, color: 'text-green-500', bgColor: 'bg-green-500' },
  follower: { icon: Users, color: 'text-purple-500', bgColor: 'bg-purple-500' },
  review: { icon: Star, color: 'text-amber-500', bgColor: 'bg-amber-500' },
  approved: { icon: CheckCircle2, color: 'text-[#fb8000]', bgColor: 'bg-[#fb8000]' },
  payment: { icon: Wallet, color: 'text-emerald-500', bgColor: 'bg-emerald-500' },
}

// Top performing designs
const topDesigns = [
  {
    title: 'Social Media Kit',
    image: '/designs/social-media-kit.png',
    sales: 72,
    revenue: 1368,
    trend: 'up' as const,
    trendPct: '+18%',
    sparkData: [3, 5, 8, 6, 9, 12, 10],
  },
  {
    title: 'Portfolio Website',
    image: '/designs/brand-identity.png',
    sales: 45,
    revenue: 1799,
    trend: 'up' as const,
    trendPct: '+12%',
    sparkData: [2, 4, 6, 8, 5, 7, 9],
  },
  {
    title: 'App UI Template',
    image: '/designs/app-ui.png',
    sales: 34,
    revenue: 1019,
    trend: 'down' as const,
    trendPct: '-5%',
    sparkData: [1, 3, 2, 5, 4, 6, 3],
  },
]

// Quick actions data
const quickActions = [
  { label: 'Upload Design', desc: 'Share your work', icon: Upload, page: 'upload' as const, gradient: 'from-[#fb8000] to-amber-500' },
  { label: 'View Analytics', desc: 'Track performance', icon: BarChart2, page: 'dashboard' as const, gradient: 'from-violet-500 to-purple-600' },
  { label: 'Manage Orders', desc: 'View transactions', icon: ShoppingCart, page: 'dashboard' as const, gradient: 'from-emerald-500 to-green-600' },
  { label: 'Edit Profile', desc: 'Update your info', icon: Pencil, page: 'dashboard' as const, gradient: 'from-blue-500 to-cyan-600' },
]

// Earnings breakdown data
const earningsBreakdown = [
  { label: 'Direct Sales', amount: 5160, color: '#fb8000', pct: 60 },
  { label: 'Subscriptions', amount: 2150, color: '#f59e0b', pct: 25 },
  { label: 'Tips', amount: 1290, color: '#22c55e', pct: 15 },
]

export default function DashboardPage() {
  const { navigateTo, isLoggedIn, user } = useNavStore()
  const [stats, setStats] = useState<Stats>({
    totalDesigns: 0, totalViews: 0, totalLikes: 0,
    totalDownloads: 0, earnings: 0, recentOrders: [], recentDesigns: [],
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [designSearch, setDesignSearch] = useState('')
  const [designFilter, setDesignFilter] = useState<'all' | 'active' | 'draft' | 'under_review'>('all')
  const [notifPrefs, setNotifPrefs] = useState({
    email_likes: true,
    email_downloads: true,
    email_orders: true,
    email_follows: false,
    push_likes: true,
    push_orders: true,
  })
  const [activeOrdersTab, setActiveOrdersTab] = useState<'all' | 'completed' | 'pending'>('all')

  useEffect(() => {
    if (!isLoggedIn) {
      navigateTo('auth')
      return
    }

    const fetchStats = async () => {
      setLoading(true)
      try {
        if (!isSupabaseReady()) {
          setStats({
            totalDesigns: demoDesigns.length,
            totalViews: demoDesigns.reduce((sum, d) => sum + d.view_count, 0),
            totalLikes: demoDesigns.reduce((sum, d) => sum + d.like_count, 0),
            totalDownloads: demoDesigns.reduce((sum, d) => sum + d.download_count, 0),
            earnings: demoOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.amount, 0),
            recentOrders: demoOrders,
            recentDesigns: demoDesigns,
          })
          setLoading(false)
          return
        }
        const supabase = createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (authUser) {
          const role = user?.role || 'designer'

          if (role === 'designer' || role === 'admin') {
            const { data: designs, error: designError } = await supabase
              .from('designs')
              .select('id, title, thumbnail_url, image_urls, view_count, like_count, download_count, is_free, price, status, created_at')
              .eq('designer_id', authUser.id)
              .order('created_at', { ascending: false })
              .limit(50)

            if (!designError && designs) {
              const totalViews = designs.reduce((sum, d) => sum + (d.view_count || 0), 0)
              const totalLikes = designs.reduce((sum, d) => sum + (d.like_count || 0), 0)
              const totalDownloads = designs.reduce((sum, d) => sum + (d.download_count || 0), 0)

              let orders: OrderItem[] = []
              const { data: orderData } = await supabase
                .from('orders')
                .select('id, amount, status, created_at')
                .eq('designer_id', authUser.id)
                .order('created_at', { ascending: false })
                .limit(10)

              if (orderData) orders = orderData

              const earnings = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.amount || 0), 0)

              setStats({
                totalDesigns: designs.length,
                totalViews,
                totalLikes,
                totalDownloads,
                earnings,
                recentOrders: orders,
                recentDesigns: designs as DesignItem[],
              })
            }
          }
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [isLoggedIn, user])

  const handleQuickAction = useCallback((action: typeof quickActions[number]) => {
    if (action.label === 'Edit Profile') {
      setEditDialogOpen(true)
    } else if (action.label === 'Manage Orders') {
      setActiveTab('orders')
    } else {
      navigateTo(action.page)
    }
  }, [navigateTo])

  if (!isLoggedIn) return null

  // Filter designs for My Designs tab
  const filteredDesigns = stats.recentDesigns.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(designSearch.toLowerCase())
    const matchesFilter = designFilter === 'all' || d.status === designFilter
    return matchesSearch && matchesFilter
  })

  const filteredOrders = stats.recentOrders.filter(o => {
    return activeOrdersTab === 'all' || o.status === activeOrdersTab
  })

  const designerStats = [
    { label: 'Total Designs', value: stats.totalDesigns, icon: Palette, color: 'text-blue-500', bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600', sparkData: [2, 5, 3, 7, 4, 6, stats.totalDesigns], sparkColor: '#3b82f6', trend: 'up' as const, percentChange: '+12%' },
    { label: 'Total Views', value: stats.totalViews, icon: Eye, color: 'text-white', bgColor: 'bg-gradient-to-br from-green-500 to-emerald-600', sparkData: [120, 180, 150, 210, 190, 240, stats.totalViews > 0 ? stats.totalViews / 10 : 200], sparkColor: '#22c55e', trend: 'up' as const, percentChange: '+8%' },
    { label: 'Total Likes', value: stats.totalLikes, icon: Heart, color: 'text-white', bgColor: 'bg-gradient-to-br from-red-500 to-rose-600', sparkData: [30, 45, 38, 52, 48, 60, stats.totalLikes > 0 ? stats.totalLikes / 5 : 55], sparkColor: '#ef4444', trend: 'up' as const, percentChange: '+15%' },
    { label: 'Downloads', value: stats.totalDownloads, icon: Download, color: 'text-white', bgColor: 'bg-gradient-to-br from-purple-500 to-violet-600', sparkData: [8, 12, 10, 15, 13, 18, stats.totalDownloads > 0 ? stats.totalDownloads / 3 : 14], sparkColor: '#a855f7', trend: 'down' as const, percentChange: '-5%' },
    { label: 'Earnings', value: stats.earnings, icon: DollarSign, color: 'text-white', bgColor: 'bg-gradient-to-br from-amber-500 to-orange-600', sparkData: [20, 35, 28, 45, 38, 52, stats.earnings > 0 ? stats.earnings : 40], sparkColor: '#f59e0b', trend: 'up' as const, percentChange: '+12%' },
    { label: 'Rating', value: 4.8, icon: Star, color: 'text-white', bgColor: 'bg-gradient-to-br from-[#fb8000] to-orange-600', sparkData: [4.5, 4.6, 4.5, 4.7, 4.6, 4.8, 4.8], sparkColor: '#fb8000', trend: 'up' as const, percentChange: '+0.2' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#fb8000]/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-amber-500/5 rounded-full translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <Avatar className="w-14 h-14 border-2 border-[#fb8000]">
                  <AvatarFallback className="text-xl bg-gradient-to-br from-[#fb8000] to-amber-500 text-white font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'User'}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs bg-white/10 text-white border-0">
                    {user?.role || 'Designer'}
                  </Badge>
                  {user?.isPro && (
                    <Badge className="bg-amber-500 text-white border-0 text-xs gap-1">
                      <Star className="w-3 h-3" /> Pro
                    </Badge>
                  )}
                  <span className="text-xs text-white/60">Here&apos;s what&apos;s happening today</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(true)}
                className="gap-2 hidden sm:flex bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                <Pencil className="w-4 h-4" /> Edit Profile
              </Button>
              <Button
                onClick={() => navigateTo('upload')}
                className="bg-gradient-to-r from-[#fb8000] to-amber-500 hover:from-[#e67300] hover:to-amber-600 text-white border-0 gap-2 shadow-lg shadow-[#fb8000]/20"
              >
                <Upload className="w-4 h-4" /> Upload Design
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="designs" className="gap-2">
              <Palette className="w-4 h-4" /> My Designs
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingBag className="w-4 h-4" /> Orders
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" /> Settings
            </TabsTrigger>
          </TabsList>

          {/* ===== OVERVIEW TAB ===== */}
          <TabsContent value="overview">
            <motion.div variants={containerVariants} initial="hidden" animate="visible">

              {/* ─── Stats Grid ─── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {designerStats.map((stat) => (
                  <motion.div key={stat.label} variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="transition-shadow hover:shadow-lg">
                    <Card className="border border-border/30 bg-card/80 backdrop-blur-sm overflow-hidden relative group">
                      {/* Subtle gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#fb8000]/0 to-[#fb8000]/0 group-hover:from-[#fb8000]/3 group-hover:to-amber-500/3 transition-all duration-300" />
                      <CardContent className="p-5 relative">
                        <div className="flex items-center gap-4 mb-3">
                          {/* Gradient icon with pulse */}
                          <div className={`w-11 h-11 rounded-xl ${stat.bgColor} flex items-center justify-center relative`}>
                            <stat.icon className="w-5 h-5 text-white" />
                            <div className={`absolute inset-0 rounded-xl ${stat.bgColor} opacity-0 group-hover:opacity-40 animate-pulse`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                            <p className="text-xl font-bold">
                              {stat.label === 'Rating' ? (
                                '4.8/5'
                              ) : stat.label === 'Earnings' ? (
                                <><span className="text-sm font-normal text-muted-foreground mr-0.5">$</span><AnimatedNumber value={stat.value} /></>
                              ) : (
                                <AnimatedNumber value={stat.value} />
                              )}
                            </p>
                          </div>
                          {/* Comparison badge */}
                          <div className={`flex items-center gap-0.5 text-[11px] font-semibold px-2 py-1 rounded-full ${
                            stat.trend === 'up'
                              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                              : 'text-red-500 bg-red-50 dark:bg-red-900/20'
                          }`}>
                            {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {stat.percentChange}
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground/60 mb-2">vs last month</p>
                        <div className="border-t border-border/20 pt-2">
                          <Sparkline data={stat.sparkData} color={stat.sparkColor} />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* ─── Revenue Line Chart + Category Donut ─── */}
              <div className="grid lg:grid-cols-5 gap-6 mb-8">
                {/* Revenue Line Chart */}
                <motion.div variants={itemVariants} className="lg:col-span-3">
                  <Card className="border border-border/30 bg-card/80 backdrop-blur-sm h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-[#fb8000]" /> Revenue Trend
                        </CardTitle>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#fb8000]" />
                          <span>12-month revenue</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-2xl font-bold">
                            <span className="text-sm font-normal text-muted-foreground mr-0.5">$</span>
                            <AnimatedNumber value={8600} />
                          </p>
                          <p className="text-xs text-muted-foreground">Total lifetime earnings</p>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20">
                          <ArrowUpRight className="w-4 h-4" />
                          +12.5%
                        </div>
                      </div>
                      <RevenueLineChart />
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Category Donut Chart */}
                <motion.div variants={itemVariants} className="lg:col-span-2">
                  <Card className="border border-border/30 bg-card/80 backdrop-blur-sm h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-[#fb8000]" /> Design Categories
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CategoryDonutChart />
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* ─── Weekly Activity Heatmap + Earnings Breakdown ─── */}
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Heatmap */}
                <motion.div variants={itemVariants}>
                  <Card className="border border-border/30 bg-card/80 backdrop-blur-sm h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-[#fb8000]" /> Weekly Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <WeeklyActivityHeatmap />
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Earnings Breakdown Card */}
                <motion.div variants={itemVariants}>
                  <Card className="border border-border/30 bg-card/80 backdrop-blur-sm h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-[#fb8000]" /> Earnings Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-5">
                        <p className="text-xs text-muted-foreground mb-1">Total Earnings</p>
                        <p className="text-3xl font-bold">
                          <span className="text-base font-normal text-muted-foreground mr-0.5">$</span>
                          <AnimatedNumber value={8600} />
                        </p>
                      </div>

                      <div className="space-y-4 mb-5">
                        {earningsBreakdown.map((item) => (
                          <div key={item.label}>
                            <div className="flex items-center justify-between text-sm mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                                <span className="text-muted-foreground">{item.label}</span>
                              </div>
                              <span className="font-semibold">${item.amount.toLocaleString()}</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: item.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${item.pct}%` }}
                                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button
                        onClick={() => toast({ title: 'Coming soon', description: 'Withdrawal feature is coming soon!' })}
                        className="w-full bg-gradient-to-r from-[#fb8000] to-amber-500 hover:from-[#e67300] hover:to-amber-600 text-white border-0 gap-2 shadow-md shadow-[#fb8000]/10"
                      >
                        <Wallet className="w-4 h-4" /> Withdraw
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* ─── Top Performing Designs ─── */}
              <motion.div variants={itemVariants} className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#fb8000]" /> Top Performing Designs
                  </h2>
                  <button
                    onClick={() => setActiveTab('designs')}
                    className="text-sm text-[#fb8000] hover:underline font-medium flex items-center gap-1"
                  >
                    View All <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {topDesigns.map((design, i) => {
                    const maxSpark = Math.max(...design.sparkData)
                    return (
                      <motion.div
                        key={design.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -6, transition: { duration: 0.2 } }}
                        className="group"
                      >
                        <Card className="border border-border/30 bg-card/80 backdrop-blur-sm overflow-hidden hover:shadow-xl transition-shadow">
                          {/* Thumbnail */}
                          <div className="aspect-video relative overflow-hidden">
                            <img
                              src={design.image}
                              alt={design.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute top-3 left-3">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-md ${
                                i === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                                i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400' :
                                'bg-gradient-to-br from-amber-600 to-amber-700'
                              }`}>
                                #{i + 1}
                              </div>
                            </div>
                            <div className="absolute bottom-3 left-3 right-3">
                              <p className="text-white font-semibold text-sm drop-shadow-md">{design.title}</p>
                            </div>
                          </div>
                          {/* Stats */}
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                              <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" />{design.sales} sales</span>
                              <span className="font-bold text-[#fb8000]">${design.revenue.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              {/* Mini bar chart - last 7 days */}
                              <div className="flex items-end gap-[2px] h-5">
                                {design.sparkData.map((bar, j) => (
                                  <div
                                    key={j}
                                    className="bg-gradient-to-t from-[#fb8000] to-[#f59e0b] rounded-[1px] transition-all duration-300"
                                    style={{ width: '5px', height: `${(bar / maxSpark) * 100}%`, minWidth: '3px' }}
                                  />
                                ))}
                              </div>
                              {/* Trend arrow */}
                              <div className={`flex items-center gap-0.5 text-xs font-semibold ${
                                design.trend === 'up' ? 'text-emerald-500' : 'text-red-500'
                              }`}>
                                {design.trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                {design.trendPct}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>

              {/* ─── Activity Feed + Quick Actions ─── */}
              <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* Activity Feed */}
                <motion.div variants={itemVariants} className="lg:col-span-2">
                  <Card className="border border-border/30 bg-card/80 backdrop-blur-sm h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-[#fb8000]" /> Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative max-h-[380px] overflow-y-auto custom-scrollbar pr-2">
                        {/* Vertical line */}
                        <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-[#fb8000]/40 via-border/30 to-transparent" />
                        <div className="space-y-1">
                          {activityFeedData.map((item, i) => {
                            const config = activityKindConfig[item.kind]
                            const IconComponent = config.icon
                            return (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.07, duration: 0.3 }}
                                className="flex items-start gap-4 p-2.5 rounded-xl hover:bg-muted/50 transition-all group cursor-pointer"
                              >
                                <div className="relative z-10 flex-shrink-0">
                                  <div className={`w-[32px] h-[32px] rounded-full ${config.bgColor}/15 flex items-center justify-center ring-2 ring-background`}>
                                    <IconComponent className={`w-4 h-4 ${config.color}`} />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium group-hover:text-[#fb8000] transition-colors">{item.title}</p>
                                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                                      {item.kind}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                                </div>
                                <span className="text-[10px] text-muted-foreground flex-shrink-0 pt-1">{item.timestamp}</span>
                              </motion.div>
                            )
                          })}
                        </div>
                        <div className="mt-3 pt-3 border-t border-border/30 text-center">
                          <button className="text-sm text-[#fb8000] hover:underline font-medium flex items-center gap-1 mx-auto">
                            View All Activity <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Quick Actions Panel */}
                <motion.div variants={itemVariants}>
                  <Card className="border border-border/30 bg-card/80 backdrop-blur-sm h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Zap className="w-5 h-5 text-[#fb8000]" /> Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {quickActions.map((action) => (
                          <motion.button
                            key={action.label}
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleQuickAction(action)}
                            className="relative p-4 rounded-xl bg-gradient-to-br text-white overflow-hidden group cursor-pointer text-left"
                            style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
                          >
                            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-100`} />
                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                            <div className="relative z-10">
                              <action.icon className="w-6 h-6 mb-2 group-hover:animate-bounce" />
                              <p className="text-xs font-semibold">{action.label}</p>
                              <p className="text-[9px] text-white/70 mt-0.5">{action.desc}</p>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* ─── Recent Reviews ─── */}
              <motion.div variants={itemVariants} className="mb-8">
                <Card className="border border-border/30 bg-card/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Star className="w-5 h-5 text-[#fb8000]" /> Recent Reviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { name: 'Aisha Patel', rating: 5, text: 'Absolutely stunning design quality!', time: '2 days ago' },
                        { name: 'Marcus Johnson', rating: 4, text: 'Great value, well-organized files.', time: '1 week ago' },
                        { name: 'Luna Kim', rating: 5, text: 'Perfect for my startup brand!', time: '2 weeks ago' },
                      ].map((review, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08 }}
                          whileHover={{ y: -2 }}
                          className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all border border-transparent hover:border-border/30"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#fb8000] to-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                              {review.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{review.name}</p>
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, si) => (
                                  <Star key={si} className={`w-2.5 h-2.5 ${si < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">&ldquo;{review.text}&rdquo;</p>
                          <p className="text-[10px] text-muted-foreground mt-1.5">{review.time}</p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ─── Recent Designs + Orders ─── */}
              <div className="grid lg:grid-cols-2 gap-6">
                <motion.div variants={itemVariants}>
                  <Card className="border border-border/30 bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="w-5 h-5 text-[#fb8000]" /> Recent Designs
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">Loading designs...</div>
                      ) : stats.recentDesigns.length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                          {stats.recentDesigns.slice(0, 5).map((d) => (
                            <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors cursor-pointer"
                              onClick={() => {
                                useNavStore.getState().setSelectedDesignId(d.id)
                                navigateTo('design-detail')
                              }}>
                              {d.thumbnail_url ? (
                                <img src={d.thumbnail_url} alt={d.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#fb8000]/20 to-amber-50 dark:from-[#fb8000]/20 dark:to-amber-900/10 flex items-center justify-center flex-shrink-0">
                                  <Palette className="w-5 h-5 text-[#fb8000]" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium line-clamp-1">{d.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {d.view_count || 0} views · {d.like_count || 0} likes · {d.download_count || 0} downloads
                                </p>
                              </div>
                              <Badge variant="secondary" className="text-xs flex-shrink-0">
                                {d.is_free ? 'Free' : `$${d.price}`}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          No designs yet.{' '}
                          <button onClick={() => navigateTo('upload')} className="text-[#fb8000] font-medium hover:underline">
                            Upload your first design
                          </button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="border border-border/30 bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-[#fb8000]" /> Recent Orders
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {stats.recentOrders.length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                          {stats.recentOrders.slice(0, 5).map((o) => (
                            <div key={o.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-50 dark:from-green-900/30 dark:to-green-800/20 flex items-center justify-center flex-shrink-0">
                                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium line-clamp-1">
                                  {(o.designs as { title: string } | null)?.title || 'Design Purchase'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  ${o.amount} · {o.status}
                                </p>
                              </div>
                              <Badge
                                variant={o.status === 'completed' ? 'default' : o.status === 'pending' ? 'secondary' : 'destructive'}
                                className={o.status === 'completed' ? 'bg-green-500 text-white border-0' : ''}
                              >
                                {o.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          No orders yet. Start uploading designs to earn!
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </TabsContent>

          {/* ===== MY DESIGNS TAB ===== */}
          <TabsContent value="designs">
            <Card className="border border-border/30 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6">
                {loading ? (
                  <div className="text-center py-12 text-muted-foreground">Loading...</div>
                ) : stats.recentDesigns.length > 0 ? (
                  <>
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          value={designSearch}
                          onChange={(e) => setDesignSearch(e.target.value)}
                          placeholder="Search your designs..."
                          className="pl-10"
                        />
                      </div>
                      <div className="flex gap-2">
                        {(['all', 'active', 'draft', 'under_review'] as const).map((filter) => (
                          <Button
                            key={filter}
                            variant={designFilter === filter ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setDesignFilter(filter)}
                            className={designFilter === filter ? 'bg-gradient-to-r from-[#fb8000] to-amber-500 hover:from-[#e67300] hover:to-amber-600 text-white border-0' : ''}
                          >
                            <Filter className="w-3 h-3 mr-1" />
                            {filter === 'all' ? 'All' : filter === 'under_review' ? 'Review' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">
                      {filteredDesigns.length} of {stats.totalDesigns} design(s)
                    </p>

                    {filteredDesigns.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredDesigns.map((d, i) => (
                          <motion.div
                            key={d.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            whileHover={{ scale: 1.02, y: -4 }}
                            className="rounded-xl overflow-hidden border border-border/30 bg-card hover:shadow-lg transition-all cursor-pointer group"
                            onClick={() => {
                              useNavStore.getState().setSelectedDesignId(d.id)
                              navigateTo('design-detail')
                            }}
                          >
                            <div className="aspect-video bg-gradient-to-br from-[#fb8000]/10 to-amber-50 dark:from-[#fb8000]/10 dark:to-amber-900/5 relative overflow-hidden">
                              {d.thumbnail_url ? (
                                <img src={d.thumbnail_url} alt={d.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Palette className="w-8 h-8 text-[#fb8000]/40" />
                                </div>
                              )}
                              <div className="absolute top-2 left-2">
                                <StatusBadge status={d.status} />
                              </div>
                              <Badge className="absolute top-2 right-2 text-xs" variant={d.is_free ? 'secondary' : 'default'}>
                                {d.is_free ? 'Free' : `$${d.price}`}
                              </Badge>
                            </div>
                            <div className="p-3">
                              <p className="font-medium text-sm line-clamp-1">{d.title}</p>
                              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{d.view_count || 0}</span>
                                <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{d.like_count || 0}</span>
                                <span className="flex items-center gap-1"><Download className="w-3 h-3" />{d.download_count || 0}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No designs match your search or filter</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Palette className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No designs yet</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Upload your first design to start earning
                    </p>
                    <Button onClick={() => navigateTo('upload')} className="bg-gradient-to-r from-[#fb8000] to-amber-500 hover:from-[#e67300] hover:to-amber-600 text-white border-0 gap-2">
                      <Upload className="w-4 h-4" /> Upload Design
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== ORDERS TAB ===== */}
          <TabsContent value="orders">
            <Card className="border border-border/30 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  {(['all', 'completed', 'pending'] as const).map((tab) => (
                    <Button
                      key={tab}
                      variant={activeOrdersTab === tab ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveOrdersTab(tab)}
                      className={activeOrdersTab === tab ? 'bg-gradient-to-r from-[#fb8000] to-amber-500 hover:from-[#e67300] hover:to-amber-600 text-white border-0' : ''}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      {tab !== 'all' && (
                        <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1.5">
                          {stats.recentOrders.filter(o => o.status === tab).length}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>

                {filteredOrders.length > 0 ? (
                  <div className="space-y-3">
                    {filteredOrders.map((o, i) => (
                      <motion.div
                        key={o.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-50 dark:from-green-900/30 dark:to-green-800/20 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{(o.designs as { title: string } | null)?.title || 'Design'}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(o.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="font-bold text-[#fb8000]">${o.amount}</span>
                        <Badge
                          variant={o.status === 'completed' ? 'default' : 'secondary'}
                          className={o.status === 'completed' ? 'bg-green-500 text-white border-0' : ''}
                        >
                          {o.status}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                    <p className="text-muted-foreground text-sm">
                      Orders will appear here when someone purchases your designs
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== SETTINGS TAB ===== */}
          <TabsContent value="settings">
            <div className="max-w-2xl space-y-6">
              {/* Profile Section */}
              <Card className="border border-border/30 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#fb8000]" /> Profile
                  </h3>
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="w-16 h-16 border-2 border-[#fb8000]">
                      <AvatarFallback className="text-xl bg-gradient-to-br from-[#fb8000] to-amber-500 text-white font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{user?.name || 'User'}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {user?.role || 'Designer'}
                        </Badge>
                        {user?.isPro && (
                          <Badge className="bg-amber-500 text-white border-0 text-xs gap-1">
                            <Star className="w-3 h-3" /> Pro
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button onClick={() => setEditDialogOpen(true)} className="bg-gradient-to-r from-[#fb8000] to-amber-500 hover:from-[#e67300] hover:to-amber-600 text-white border-0 gap-2">
                      <Pencil className="w-4 h-4" /> Edit Profile
                    </Button>
                  </div>
                  {user?.bio && (
                    <p className="text-sm text-muted-foreground mb-4">{user.bio}</p>
                  )}
                  {user?.location && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                      📍 {user.location}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Notification Preferences */}
              <Card className="border border-border/30 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[#fb8000]" /> Notification Preferences
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-3">Email Notifications</p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm">New likes</p>
                            <p className="text-xs text-muted-foreground">Get notified when someone likes your design</p>
                          </div>
                          <Switch
                            checked={notifPrefs.email_likes}
                            onCheckedChange={(checked) => setNotifPrefs(prev => ({ ...prev, email_likes: checked }))}
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm">New downloads</p>
                            <p className="text-xs text-muted-foreground">Get notified when someone downloads your design</p>
                          </div>
                          <Switch
                            checked={notifPrefs.email_downloads}
                            onCheckedChange={(checked) => setNotifPrefs(prev => ({ ...prev, email_downloads: checked }))}
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm">New orders</p>
                            <p className="text-xs text-muted-foreground">Get notified when someone purchases your design</p>
                          </div>
                          <Switch
                            checked={notifPrefs.email_orders}
                            onCheckedChange={(checked) => setNotifPrefs(prev => ({ ...prev, email_orders: checked }))}
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm">New followers</p>
                            <p className="text-xs text-muted-foreground">Get notified when someone follows you</p>
                          </div>
                          <Switch
                            checked={notifPrefs.email_follows}
                            onCheckedChange={(checked) => setNotifPrefs(prev => ({ ...prev, email_follows: checked }))}
                          />
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-3">Push Notifications</p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm">New likes</p>
                            <p className="text-xs text-muted-foreground">Push notification for new likes</p>
                          </div>
                          <Switch
                            checked={notifPrefs.push_likes}
                            onCheckedChange={(checked) => setNotifPrefs(prev => ({ ...prev, push_likes: checked }))}
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm">New orders</p>
                            <p className="text-xs text-muted-foreground">Push notification for new orders</p>
                          </div>
                          <Switch
                            checked={notifPrefs.push_orders}
                            onCheckedChange={(checked) => setNotifPrefs(prev => ({ ...prev, push_orders: checked }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Connected Accounts */}
              <Card className="border border-border/30 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-[#fb8000]" /> Connected Accounts
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center">
                          <Github className="w-4 h-4 text-white dark:text-black" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">GitHub</p>
                          <p className="text-xs text-muted-foreground">Connect to showcase your repos</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">Connect</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                          <Chrome className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Google</p>
                          <p className="text-xs text-muted-foreground">Sign in with Google</p>
                        </div>
                      </div>
                      <Badge className="bg-green-500 text-white border-0 text-xs">Connected</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Settings */}
              <Card className="border border-border/30 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#fb8000]" /> Account
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">Email Verified</p>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-500 text-white border-0">Verified</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-amber-500" />
                        <div>
                          <p className="text-sm font-medium">Pro Plan</p>
                          <p className="text-xs text-muted-foreground">
                            {user?.isPro ? 'You are a Pro member' : 'Upgrade for premium features'}
                          </p>
                        </div>
                      </div>
                      {!user?.isPro && (
                        <Button size="sm" onClick={() => navigateTo('pricing')} className="bg-gradient-to-r from-[#fb8000] to-amber-500 hover:from-[#e67300] hover:to-amber-600 text-white border-0">
                          Upgrade
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">Payout Method</p>
                          <p className="text-xs text-muted-foreground">Set up your payout method</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">Configure</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border border-red-200 dark:border-red-900/50 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-red-500">
                    <AlertTriangle className="w-5 h-5" /> Danger Zone
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you delete your account, there is no going back. All your designs, orders, and data will be permanently removed.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="gap-2">
                        <Trash2 className="w-4 h-4" /> Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account and remove all of your data from our servers, including your designs, orders, and profile information.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-500 hover:bg-red-600">
                          Yes, delete my account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Profile Edit Dialog */}
      <ProfileEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </div>
  )
}
