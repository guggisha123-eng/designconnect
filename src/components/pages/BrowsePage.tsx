'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, SlidersHorizontal, Grid3X3, LayoutList, Heart, Eye,
  Download, Star, Filter, X, ChevronDown, GitCompare, Check
} from 'lucide-react'
import { useNavStore } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient, isSupabaseReady } from '@/lib/supabase/client'
import LazyImage from '@/components/ui/LazyImage'
import RecentlyViewed from '@/components/layout/RecentlyViewed'
import DesignCompare from '@/components/layout/DesignCompare'
import { toast } from '@/hooks/use-toast'
import { BadgeDisplay, type BadgeDesignData } from '@/components/layout/DesignBadges'

const designImageMap: Record<string, string> = {
  'sample-1': '/designs/brand-identity.png',
  'sample-2': '/designs/logo-pack.png',
  'sample-3': '/designs/social-media-kit.png',
  'sample-4': '/designs/app-ui.png',
  'sample-5': '/designs/poster-collection.png',
  'sample-6': '/designs/icon-set.png',
  'sample-7': '/designs/business-card.png',
  'sample-8': '/designs/hero-bundle.png',
  'sample-9': '/designs/brand-identity.png',
  'sample-10': '/designs/app-ui.png',
  'sample-11': '/designs/logo-pack.png',
  'sample-12': '/designs/social-media-kit.png',
}

const categories = [
  { name: 'All', emoji: '✨', count: 86 },
  { name: 'Logo Design', emoji: '🎨', count: 12 },
  { name: 'UI/UX', emoji: '📱', count: 15 },
  { name: 'Illustrations', emoji: '🖌️', count: 9 },
  { name: 'Typography', emoji: '🔤', count: 7 },
  { name: '3D Design', emoji: '🧊', count: 11 },
  { name: 'Social Media', emoji: '💬', count: 8 },
  { name: 'Print', emoji: '🖨️', count: 6 },
  { name: 'Motion', emoji: '🎬', count: 10 },
  { name: 'Icons', emoji: '⭐', count: 8 },
]

const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Most Downloads', value: 'downloads' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
]

interface Design {
  id: string
  title: string
  thumbnail: string
  thumbnail_url: string | null
  image_urls: string[] | null
  category: string
  designer_name: string
  like_count: number
  view_count: number
  download_count: number
  is_free: boolean
  price: number
  created_at: string
}

function CountUp({ target, duration = 600 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const prevTarget = useRef(0)

  useEffect(() => {
    const start = prevTarget.current
    const diff = target - start
    if (diff === 0) return
    const startTime = performance.now()
    let raf: number
    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(start + diff * eased))
      if (progress < 1) raf = requestAnimationFrame(animate)
      else prevTarget.current = target
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return <span>{count || target}</span>
}

export default function BrowsePage() {
  const navigateTo = useNavStore((s) => s.navigateTo)
  const searchQuery = useNavStore((s) => s.searchQuery)
  const setSelectedDesignId = useNavStore((s) => s.setSelectedDesignId)
  const compareDesigns = useNavStore((s) => s.compareDesigns)
  const addToCompare = useNavStore((s) => s.addToCompare)
  const removeFromCompare = useNavStore((s) => s.removeFromCompare)

  const [designs, setDesigns] = useState<Design[]>([])
  const [loading, setLoading] = useState(true)
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [priceRange, setPriceRange] = useState<'all' | 'free' | 'paid'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [bouncingPill, setBouncingPill] = useState<string | null>(null)
  const perPage = 12

  const handleToggleCompare = (designId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (compareDesigns.includes(designId)) {
      removeFromCompare(designId)
    } else {
      if (compareDesigns.length >= 2) {
        toast({
          title: 'Compare limit reached',
          description: 'You can only compare 2 designs at a time. Remove one first.',
          variant: 'destructive',
        })
        return
      }
      addToCompare(designId)
      if (compareDesigns.length === 1) {
        toast({
          title: '2 selected — Compare now!',
          description: 'Click the Compare button to see the side-by-side comparison.',
        })
      }
    }
  }

  useEffect(() => {
    setLocalSearch(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    const fetchDesigns = async () => {
      setLoading(true)
      try {
        if (!isSupabaseReady()) {
          generateFallbackDesigns()
          return
        }
        const supabase = createClient()
        let query = supabase
          .from('designs')
          .select('id, title, thumbnail, thumbnail_url, image_urls, category, like_count, view_count, download_count, is_free, price, created_at, users!designs_designer_id_fkey(name)')
          .neq('status', 'rejected')

        if (localSearch.trim()) {
          query = query.or(`title.ilike.%${localSearch}%,category.ilike.%${localSearch}%`)
        }

        if (selectedCategory !== 'All') {
          query = query.eq('category', selectedCategory)
        }

        if (priceRange === 'free') {
          query = query.eq('is_free', true)
        } else if (priceRange === 'paid') {
          query = query.eq('is_free', false).gt('price', 0)
        }

        switch (sortBy) {
          case 'popular': query = query.order('like_count', { ascending: false }); break
          case 'downloads': query = query.order('download_count', { ascending: false }); break
          case 'price-asc': query = query.order('price', { ascending: true }); break
          case 'price-desc': query = query.order('price', { ascending: false }); break
          default: query = query.order('created_at', { ascending: false }); break
        }

        const from = (currentPage - 1) * perPage
        query = query.range(from, from + perPage - 1)

        const { data, error } = await query

        if (data && !error) {
          setDesigns(data.map((d: any) => ({
            id: d.id,
            title: d.title,
            thumbnail: d.thumbnail,
            thumbnail_url: d.thumbnail_url || d.image_urls?.[0] || null,
            image_urls: d.image_urls || null,
            category: d.category,
            designer_name: d.users?.name || 'Unknown',
            like_count: d.like_count || 0,
            view_count: d.view_count || 0,
            download_count: d.download_count || 0,
            is_free: d.is_free,
            price: d.price || 0,
            created_at: d.created_at,
          })))
        } else {
          generateFallbackDesigns()
        }
      } catch {
        generateFallbackDesigns()
      } finally {
        setLoading(false)
      }
    }

    const generateFallbackDesigns = () => {
      const sampleDesigns: Design[] = Array.from({ length: 12 }, (_, i) => ({
        id: `sample-${i + 1}`,
        title: [
          'Modern Brand Identity', 'Minimal Logo Pack', 'Social Media Kit', 'App UI Template',
          'Poster Collection', 'Icon Set Premium', 'Business Card Template', 'Website Hero Bundle',
          'Typography Poster', '3D Illustration Pack', 'Resume Template', 'Newsletter Template'
        ][i],
        thumbnail: '',
        category: ['All', 'Logo Design', 'UI/UX', 'Illustrations', 'Typography',
          '3D Design', 'Social Media', 'Print', 'Motion', 'Icons'][i % categories.length === 0 ? 1 : i % categories.length],
        designer_name: ['Sarah Chen', 'Alex Rivera', 'Maya Patel', 'James Wilson', 'Luna Kim', 'Omar Hassan'][i % 6],
        like_count: Math.floor(Math.random() * 500) + 50,
        view_count: Math.floor(Math.random() * 5000) + 500,
        download_count: Math.floor(Math.random() * 1000) + 100,
        is_free: i % 3 === 0,
        price: i % 3 === 0 ? 0 : [29, 19, 49, 15, 39, 25, 59, 35][i % 8],
        created_at: new Date().toISOString(),
      }))
      setDesigns(sampleDesigns)
    }

    fetchDesigns()
  }, [localSearch, selectedCategory, sortBy, priceRange, currentPage])

  const filteredDesigns = useMemo(() => designs, [designs])

  const getDesignImage = (design: Design, fallbackIndex: number): string | null => {
    if (design.thumbnail_url) return design.thumbnail_url
    return designImageMap[design.id] || null
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-border/50 relative overflow-hidden">
        {/* Subtle pattern background */}
        <div className="absolute inset-0 dot-grid-bg opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold mb-2 dark:text-white gradient-underline">Browse Designs</h1>
            <p className="text-muted-foreground">Discover amazing designs from our creative community</p>
          </motion.div>

          {/* Search + Controls */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search designs..."
                value={localSearch}
                onChange={(e) => { setLocalSearch(e.target.value); setCurrentPage(1) }}
                onKeyDown={(e) => e.key === 'Enter' && setCurrentPage(1)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={showFilters ? 'default' : 'outline'}
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </Button>
              <div className="flex bg-muted dark:bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow text-foreground' : 'text-muted-foreground'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow text-foreground' : 'text-muted-foreground'}`}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 custom-scrollbar">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-pill h-9 w-24 flex-shrink-0" />
              ))
            ) : (
              categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => { setSelectedCategory(cat.name); setCurrentPage(1); setBouncingPill(cat.name); setTimeout(() => setBouncingPill(null), 400) }}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 category-pill-underline ${
                    selectedCategory === cat.name
                      ? 'bg-[#fb8000] text-white shadow-md shadow-[#fb8000]/25 scale-105 active category-pill-active-shadow'
                      : 'bg-muted dark:bg-slate-800 text-muted-foreground hover:bg-muted/80 dark:hover:bg-slate-700 hover:scale-[1.02]'
                  }`}
                >
                  <span className={`mr-1.5 category-pill-emoji ${bouncingPill === cat.name ? 'bouncing' : ''}`}>{cat.emoji}</span>{cat.name}
                  <span className="ml-1.5 text-xs opacity-70">({cat.count})</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border/50 bg-white dark:bg-slate-900"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Sort By</Label>
                  <select
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1) }}
                    className="w-full px-3 py-2 bg-muted dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#fb8000]/50"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Price</Label>
                  <div className="flex gap-2">
                    {(['all', 'free', 'paid'] as const).map((range) => (
                      <button
                        key={range}
                        onClick={() => { setPriceRange(range); setCurrentPage(1) }}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                          priceRange === range
                            ? 'bg-[#fb8000] text-white'
                            : 'bg-muted dark:bg-slate-800 text-muted-foreground'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedCategory('All')
                      setSortBy('newest')
                      setPriceRange('all')
                      setLocalSearch('')
                      setCurrentPage(1)
                    }}
                    className="gap-2 w-full"
                  >
                    <X className="w-4 h-4" /> Clear All Filters
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <motion.p
            key={filteredDesigns.length}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-muted-foreground"
          >
            Showing <span className="font-semibold text-foreground dark:text-white tabular-nums"><CountUp target={filteredDesigns.length} /></span> results
            {localSearch && <span> for &ldquo;<span className="text-[#fb8000] font-medium">{localSearch}</span>&rdquo;</span>}
          </motion.p>
        </div>

        {loading ? (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {Array.from({ length: 8 }).map((_, i) => (
              viewMode === 'grid' ? (
                <div key={i} className="space-y-3">
                  <div className="aspect-[4/3] w-full rounded-xl shimmer" />
                  <div className="space-y-2 px-1">
                    <div className="h-4 w-3/4 shimmer rounded" />
                    <div className="h-3 w-1/2 shimmer rounded" />
                    <div className="flex gap-3">
                      <div className="h-3 w-12 shimmer rounded" />
                      <div className="h-3 w-12 shimmer rounded" />
                      <div className="h-3 w-12 shimmer rounded" />
                    </div>
                  </div>
                </div>
              ) : (
                <div key={i} className="flex gap-4 p-4">
                  <div className="w-24 h-24 rounded-lg shimmer flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 shimmer rounded" />
                    <div className="h-3 w-1/4 shimmer rounded" />
                    <div className="flex gap-4">
                      <div className="h-3 w-16 shimmer rounded" />
                      <div className="h-3 w-16 shimmer rounded" />
                      <div className="h-3 w-16 shimmer rounded" />
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        ) : filteredDesigns.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 dark:text-white">No designs found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {filteredDesigns.map((design, i) => {
              const imgSrc = getDesignImage(design, i)
              return (
                <motion.div
                  key={design.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Card
                    className={`cursor-pointer group overflow-hidden border-0 shadow-sm hover:shadow-xl hover:shadow-orange-100/50 dark:hover:shadow-orange-900/20 transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-900 glow-card border-gradient-bottom ${compareDesigns.includes(design.id) ? 'ring-2 ring-[#fb8000] ring-offset-2' : ''}`}
                    onClick={() => {
                      setSelectedDesignId(design.id)
                      navigateTo('design-detail')
                    }}
                  >
                    {viewMode === 'grid' ? (
                      <>
                        <div className="aspect-[4/3] bg-gradient-to-br from-orange-100 to-amber-50 dark:from-slate-800 dark:to-slate-800 relative overflow-hidden inner-shadow">
                          {imgSrc ? (
                            <LazyImage
                              src={imgSrc}
                              alt={design.title}
                              className="w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-4xl opacity-30">
                                {['🎨', '✏️', '📱', '🧊', '🖼️', '🔤', '🖨️', '🎬'][i % 8]}
                              </div>
                            </div>
                          )}
                          {/* Bottom gradient overlay for readability */}
                          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                          {/* NEW badge for first 3 designs */}
                          {i < 3 && (
                            <span className="new-design-badge">NEW</span>
                          )}
                          {/* Compare checkbox */}
                          <button
                            onClick={(e) => handleToggleCompare(design.id, e)}
                            className={`absolute top-3 left-3 z-10 w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200 ${
                              compareDesigns.includes(design.id)
                                ? 'bg-[#fb8000] text-white shadow-md scale-110'
                                : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-muted-foreground hover:bg-white hover:text-[#fb8000] shadow-sm opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            {compareDesigns.includes(design.id) ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <GitCompare className="w-3.5 h-3.5" />
                            )}
                          </button>
                          {design.is_free && !compareDesigns.includes(design.id) && (
                            <Badge className="absolute top-3 left-12 bg-green-500 text-white border-0 shadow-sm px-3 py-1 text-xs font-bold shadow-green-500/20">
                              Free
                            </Badge>
                          )}
                          {/* Quick Download button on hover */}
                          <button
                            className="quick-download-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              toast({ title: 'Download started', description: `Downloading ${design.title}...` })
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          {/* Quick-view overlay on hover with glassmorphism */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                              <div className="glassmorphism-overlay rounded-full p-3 shadow-lg">
                                <Eye className="w-5 h-5 text-[#fb8000]" />
                              </div>
                            </div>
                          </div>
                          <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                            <BadgeDisplay design={design as BadgeDesignData} size="sm" maxBadges={2} />
                            <Badge variant="secondary" className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm">
                              {design.category}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-sm line-clamp-1 mb-1 dark:text-white">{design.title}</h3>
                          <p className="text-xs text-muted-foreground mb-3">{design.designer_name}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {design.like_count}</span>
                              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {design.view_count}</span>
                              <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {design.download_count}</span>
                            </div>
                            {!design.is_free && (
                              <span className="font-semibold text-[#fb8000]">${design.price}</span>
                            )}
                          </div>
                        </CardContent>
                      </>
                    ) : (
                      <CardContent className="p-4 flex gap-4 border-b border-border/30 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        {/* Compare checkbox for list view */}
                        <button
                          onClick={(e) => handleToggleCompare(design.id, e)}
                          className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200 self-center ${
                            compareDesigns.includes(design.id)
                              ? 'bg-[#fb8000] text-white shadow-md'
                              : 'bg-muted dark:bg-slate-700 text-muted-foreground hover:text-[#fb8000] hover:bg-orange-50 dark:hover:bg-orange-950/20'
                          }`}
                        >
                          {compareDesigns.includes(design.id) ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <GitCompare className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-orange-100 to-amber-50 dark:from-slate-800 dark:to-slate-800 flex-shrink-0 overflow-hidden inner-shadow">
                          {imgSrc ? (
                            <LazyImage src={imgSrc} alt={design.title} className="w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-2xl opacity-30">{['🎨', '✏️', '📱', '🧊'][i % 4]}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm line-clamp-1 dark:text-white">{design.title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{design.designer_name} · {design.category}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {design.like_count}</span>
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {design.view_count}</span>
                            <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {design.download_count}</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {design.is_free ? (
                            <Badge className="bg-green-500 text-white border-0 px-3 py-1 text-xs font-bold shadow-sm shadow-green-500/20">Free</Badge>
                          ) : (
                            <span className="font-bold text-lg text-[#fb8000] px-2 py-1 bg-orange-50 dark:bg-orange-950/20 rounded-md">${design.price}</span>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {filteredDesigns.length > perPage && (
          <div className="flex justify-center gap-2 mt-10">
            <Button
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              className="bg-[#fb8000] text-white border-[#fb8000]"
            >
              {currentPage}
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Compare Mode Bar */}
      <AnimatePresence>
        {compareDesigns.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#fb8000]/10 flex items-center justify-center">
                  <GitCompare className="w-4 h-4 text-[#fb8000]" />
                </div>
                <div>
                  <p className="text-sm font-semibold dark:text-white">
                    {compareDesigns.length === 1
                      ? '1 design selected'
                      : '2 designs selected — Compare now!'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {compareDesigns.length === 1
                      ? 'Select 1 more design to compare'
                      : 'Click Compare to see side-by-side'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => useNavStore.getState().clearCompare()}
                  className="text-muted-foreground"
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  className="bg-[#fb8000] hover:bg-[#e57300] text-white gap-1.5"
                  onClick={() => {
                    const event = new CustomEvent('openCompare')
                    window.dispatchEvent(event)
                  }}
                >
                  <GitCompare className="w-4 h-4" />
                  Compare {compareDesigns.length}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recently Viewed */}
      <RecentlyViewed />

      {/* Design Compare Component */}
      <DesignCompare />
    </div>
  )
}
