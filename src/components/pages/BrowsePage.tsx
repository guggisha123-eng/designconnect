'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, SlidersHorizontal, Grid3X3, LayoutList, Heart, Eye,
  Download, Star, Filter, X, ChevronDown
} from 'lucide-react'
import { useNavStore } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

const categories = [
  'All', 'Logo Design', 'UI/UX', 'Illustrations', 'Typography',
  '3D Design', 'Social Media', 'Print', 'Motion', 'Icons'
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

export default function BrowsePage() {
  const navigateTo = useNavStore((s) => s.navigateTo)
  const searchQuery = useNavStore((s) => s.searchQuery)
  const setSelectedDesignId = useNavStore((s) => s.setSelectedDesignId)

  const [designs, setDesigns] = useState<Design[]>([])
  const [loading, setLoading] = useState(true)
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [priceRange, setPriceRange] = useState<'all' | 'free' | 'paid'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 12

  useEffect(() => {
    setLocalSearch(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    const fetchDesigns = async () => {
      setLoading(true)
      try {
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
          // Fallback sample data
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
        category: categories[i % categories.length === 0 ? 1 : i % categories.length],
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

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="bg-white border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold mb-2">Browse Designs</h1>
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
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow' : 'text-muted-foreground'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow' : 'text-muted-foreground'}`}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setCurrentPage(1) }}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#fb8000] text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat}
              </button>
            ))}
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
            className="overflow-hidden border-b border-border/50 bg-white"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Sort By</Label>
                  <select
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1) }}
                    className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#fb8000]/50"
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
                            : 'bg-muted text-muted-foreground'
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
          <p className="text-sm text-muted-foreground">
            Showing {filteredDesigns.length} results
            {localSearch && <span> for &ldquo;{localSearch}&rdquo;</span>}
          </p>
        </div>

        {loading ? (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={viewMode === 'grid' ? 'aspect-[4/3] bg-muted rounded-xl animate-pulse' : 'h-32 bg-muted rounded-xl animate-pulse'} />
            ))}
          </div>
        ) : filteredDesigns.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No designs found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {filteredDesigns.map((design, i) => (
              <motion.div
                key={design.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card
                  className="cursor-pointer group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  onClick={() => {
                    setSelectedDesignId(design.id)
                    navigateTo('design-detail')
                  }}
                >
                  {viewMode === 'grid' ? (
                    <>
                      <div className="aspect-[4/3] bg-gradient-to-br from-orange-100 to-amber-50 relative overflow-hidden">
                        {design.thumbnail_url ? (
                          <img src={design.thumbnail_url} alt={design.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-4xl opacity-30">
                              {['🎨', '✏️', '📱', '🧊', '🖼️', '🔤', '🖨️', '🎬'][i % 8]}
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        {design.is_free && (
                          <Badge className="absolute top-3 left-3 bg-green-500 text-white border-0">
                            Free
                          </Badge>
                        )}
                        <Badge variant="secondary" className="absolute top-3 right-3">
                          {design.category}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm line-clamp-1 mb-1">{design.title}</h3>
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
                    <CardContent className="p-4 flex gap-4">
                      <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-orange-100 to-amber-50 flex-shrink-0 overflow-hidden">
                        {design.thumbnail_url ? (
                          <img src={design.thumbnail_url} alt={design.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl opacity-30">{['🎨', '✏️', '📱', '🧊'][i % 4]}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm line-clamp-1">{design.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{design.designer_name} · {design.category}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {design.like_count}</span>
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {design.view_count}</span>
                          <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {design.download_count}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {design.is_free ? (
                          <Badge className="bg-green-500 text-white border-0">Free</Badge>
                        ) : (
                          <span className="font-semibold text-[#fb8000]">${design.price}</span>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            ))}
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
    </div>
  )
}

function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement> & { className?: string }) {
  return <label className={className} {...props}>{children}</label>
}
