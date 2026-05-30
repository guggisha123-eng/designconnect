'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, SlidersHorizontal, X, ChevronDown, Heart, Eye,
  Download, Star, ArrowRight
} from 'lucide-react'
import { useNavStore } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from '@/components/ui/sheet'

/* ─── Design Image Map (same as BrowsePage) ─── */
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

/* ─── Categories ─── */
const allCategories = [
  'Logo Design', 'UI/UX', 'Illustrations', 'Typography',
  '3D Design', 'Social Media', 'Print', 'Motion', 'Icons',
]

/* ─── Price Ranges ─── */
const priceRanges = [
  { label: 'Free', value: 'free' as const },
  { label: 'Under $20', value: 'under20' as const },
  { label: '$20 - $40', value: '20to40' as const },
  { label: 'Over $40', value: 'over40' as const },
]

/* ─── Sort Options ─── */
const sortOptions = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Newest', value: 'newest' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Most Downloads', value: 'downloads' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
]

/* ─── Design Interface ─── */
interface Design {
  id: string
  title: string
  category: string
  designer_name: string
  like_count: number
  view_count: number
  download_count: number
  is_free: boolean
  price: number
  created_at: string
}

/* ─── Demo Designs (12 designs, same as BrowsePage) ─── */
function generateDemoDesigns(): Design[] {
  return [
    { id: 'sample-1', title: 'Modern Brand Identity', category: 'Logo Design', designer_name: 'Sarah Chen', like_count: 342, view_count: 3200, download_count: 890, is_free: true, price: 0, created_at: '2025-01-15T10:00:00Z' },
    { id: 'sample-2', title: 'Minimal Logo Pack', category: 'Logo Design', designer_name: 'Alex Rivera', like_count: 218, view_count: 2800, download_count: 650, is_free: false, price: 29, created_at: '2025-01-12T08:30:00Z' },
    { id: 'sample-3', title: 'Social Media Kit', category: 'Social Media', designer_name: 'Maya Patel', like_count: 456, view_count: 4100, download_count: 1200, is_free: false, price: 19, created_at: '2025-01-10T14:00:00Z' },
    { id: 'sample-4', title: 'App UI Template', category: 'UI/UX', designer_name: 'James Wilson', like_count: 189, view_count: 2500, download_count: 560, is_free: false, price: 49, created_at: '2025-01-08T09:15:00Z' },
    { id: 'sample-5', title: 'Poster Collection', category: 'Print', designer_name: 'Luna Kim', like_count: 567, view_count: 5200, download_count: 1500, is_free: true, price: 0, created_at: '2025-01-05T16:45:00Z' },
    { id: 'sample-6', title: 'Icon Set Premium', category: 'Icons', designer_name: 'Omar Hassan', like_count: 234, view_count: 1900, download_count: 720, is_free: false, price: 15, created_at: '2025-01-03T11:00:00Z' },
    { id: 'sample-7', title: 'Business Card Template', category: 'Print', designer_name: 'Sarah Chen', like_count: 412, view_count: 3800, download_count: 1100, is_free: true, price: 0, created_at: '2024-12-28T13:30:00Z' },
    { id: 'sample-8', title: 'Website Hero Bundle', category: 'UI/UX', designer_name: 'Alex Rivera', like_count: 321, view_count: 3400, download_count: 870, is_free: false, price: 39, created_at: '2024-12-25T07:00:00Z' },
    { id: 'sample-9', title: 'Typography Poster', category: 'Typography', designer_name: 'Maya Patel', like_count: 278, view_count: 2100, download_count: 630, is_free: true, price: 0, created_at: '2024-12-20T15:20:00Z' },
    { id: 'sample-10', title: '3D Illustration Pack', category: '3D Design', designer_name: 'James Wilson', like_count: 145, view_count: 1800, download_count: 410, is_free: false, price: 25, created_at: '2024-12-18T10:00:00Z' },
    { id: 'sample-11', title: 'Resume Template', category: 'Typography', designer_name: 'Luna Kim', like_count: 389, view_count: 4500, download_count: 1300, is_free: false, price: 35, created_at: '2024-12-15T12:00:00Z' },
    { id: 'sample-12', title: 'Newsletter Template', category: 'Illustrations', designer_name: 'Omar Hassan', like_count: 198, view_count: 2200, download_count: 580, is_free: false, price: 59, created_at: '2024-12-10T09:00:00Z' },
  ]
}

/* ─── CountUp Animation ─── */
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

/* ─── Suggested Searches ─── */
const suggestedSearches = [
  'Logo Design', 'UI/UX', 'Free templates', '3D Illustration', 'Typography', 'Social Media Kit',
]

/* ─── Filter Sidebar Content ─── */
function FilterSidebarContent({
  selectedCategories,
  onToggleCategory,
  selectedPriceRanges,
  onTogglePriceRange,
  sortBy,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
}: {
  selectedCategories: string[]
  onToggleCategory: (cat: string) => void
  selectedPriceRanges: string[]
  onTogglePriceRange: (range: string) => void
  sortBy: string
  onSortChange: (val: string) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
}) {
  return (
    <div className="space-y-6">
      {/* Sort By */}
      <div>
        <Label className="text-sm font-semibold mb-3 block dark:text-white">Sort By</Label>
        <div className="space-y-1.5">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                sortBy === opt.value
                  ? 'bg-[#fb8000]/10 text-[#fb8000] font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {opt.label}
              {sortBy === opt.value && (
                <motion.div
                  layoutId="search-sort-indicator"
                  className="w-1.5 h-1.5 rounded-full bg-[#fb8000]"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <Label className="text-sm font-semibold mb-3 block dark:text-white">Category</Label>
        <div className="space-y-2.5">
          {allCategories.map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <Checkbox
                checked={selectedCategories.includes(cat)}
                onCheckedChange={() => onToggleCategory(cat)}
                className="data-[state=checked]:bg-[#fb8000] data-[state=checked]:border-[#fb8000]"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <Label className="text-sm font-semibold mb-3 block dark:text-white">Price Range</Label>
        <div className="space-y-2.5">
          {priceRanges.map((range) => (
            <label
              key={range.value}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <Checkbox
                checked={selectedPriceRanges.includes(range.value)}
                onCheckedChange={() => onTogglePriceRange(range.value)}
                className="data-[state=checked]:bg-[#fb8000] data-[state=checked]:border-[#fb8000]"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="w-full gap-2 text-muted-foreground hover:text-[#fb8000]"
          >
            <X className="w-4 h-4" /> Clear All Filters
          </Button>
        </motion.div>
      )}
    </div>
  )
}

/* ─── Main SearchPage Component ─── */
export default function SearchPage() {
  const navigateTo = useNavStore((s) => s.navigateTo)
  const searchQuery = useNavStore((s) => s.searchQuery)
  const setSearchQuery = useNavStore((s) => s.setSearchQuery)
  const setSelectedDesignId = useNavStore((s) => s.setSelectedDesignId)

  const [localSearch, setLocalSearch] = useState(searchQuery)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('relevance')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Sync with nav store search query
  useEffect(() => {
    setLocalSearch(searchQuery)
  }, [searchQuery])

  const allDesigns = useMemo(() => generateDemoDesigns(), [])

  // Filter and sort designs
  const filteredDesigns = useMemo(() => {
    let results = allDesigns

    // Filter by search query
    if (localSearch.trim()) {
      const q = localSearch.toLowerCase()
      results = results.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q) ||
          d.designer_name.toLowerCase().includes(q)
      )
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      results = results.filter((d) => selectedCategories.includes(d.category))
    }

    // Filter by price ranges
    if (selectedPriceRanges.length > 0) {
      results = results.filter((d) => {
        return selectedPriceRanges.some((range) => {
          switch (range) {
            case 'free': return d.is_free
            case 'under20': return !d.is_free && d.price < 20
            case '20to40': return !d.is_free && d.price >= 20 && d.price <= 40
            case 'over40': return !d.is_free && d.price > 40
            default: return false
          }
        })
      })
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        results = [...results].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'popular':
        results = [...results].sort((a, b) => b.like_count - a.like_count)
        break
      case 'downloads':
        results = [...results].sort((a, b) => b.download_count - a.download_count)
        break
      case 'price-asc':
        results = [...results].sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        results = [...results].sort((a, b) => b.price - a.price)
        break
      default: // relevance - keep original order
        break
    }

    return results
  }, [allDesigns, localSearch, selectedCategories, selectedPriceRanges, sortBy])

  const hasActiveFilters = selectedCategories.length > 0 || selectedPriceRanges.length > 0 || sortBy !== 'relevance'

  const handleToggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const handleTogglePriceRange = (range: string) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    )
  }

  const handleClearFilters = () => {
    setSelectedCategories([])
    setSelectedPriceRanges([])
    setSortBy('relevance')
  }

  const handleSearchSubmit = () => {
    if (localSearch.trim()) {
      setSearchQuery(localSearch.trim())
    }
  }

  const handleSuggestedSearch = (term: string) => {
    setLocalSearch(term)
    setSearchQuery(term)
  }

  const getDesignImage = (design: Design): string | null => {
    return designImageMap[design.id] || null
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      {/* Hero Section with Search Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid-bg opacity-30" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 dark:text-white">
              <span className="gradient-underline">Search Designs</span>
            </h1>
            <p className="text-muted-foreground mb-8">
              Find the perfect design for your next project
            </p>

            {/* Prominent Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
              <Input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearchSubmit()
                }}
                placeholder="Search designs, categories, designers..."
                className="pl-12 pr-4 py-6 text-base rounded-2xl shadow-lg border-border/50 focus:ring-2 focus:ring-[#fb8000]/50 bg-white dark:bg-slate-800"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Results Count + Filter Toggle */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <motion.p
            key={filteredDesigns.length}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-muted-foreground"
          >
            Showing <span className="font-semibold text-foreground dark:text-white"><CountUp target={filteredDesigns.length} /></span> results
            {localSearch && (
              <span> for &ldquo;<span className="text-[#fb8000] font-medium">{localSearch}</span>&rdquo;</span>
            )}
          </motion.p>

          {/* Mobile Filter Button */}
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden gap-2"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-5 h-5 rounded-full bg-[#fb8000] text-white text-xs flex items-center justify-center">
                {selectedCategories.length + selectedPriceRanges.length}
              </span>
            )}
          </Button>
        </div>

        {/* Main Content: Sidebar + Grid */}
        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="hidden lg:block w-64 flex-shrink-0"
          >
            <div className="sticky top-24 glass-card rounded-2xl p-5 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm dark:text-white">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs text-[#fb8000] hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <FilterSidebarContent
                selectedCategories={selectedCategories}
                onToggleCategory={handleToggleCategory}
                selectedPriceRanges={selectedPriceRanges}
                onTogglePriceRange={handleTogglePriceRange}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onClearFilters={handleClearFilters}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
          </motion.aside>

          {/* Results Grid */}
          <div className="flex-1 min-w-0">
            {filteredDesigns.length === 0 ? (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                  <Search className="w-9 h-9 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">
                  No designs found for &ldquo;{localSearch}&rdquo;
                </h3>
                <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto">
                  We couldn&apos;t find any designs matching your search. Try adjusting your filters or try a different search term.
                </p>

                {/* Suggested Searches */}
                <div className="mb-6">
                  <p className="text-sm font-medium mb-3 dark:text-white">Suggested searches:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestedSearches.map((term) => (
                      <Badge
                        key={term}
                        variant="secondary"
                        className="cursor-pointer hover:bg-[#fb8000]/10 hover:text-[#fb8000] transition-colors px-3 py-1.5"
                        onClick={() => handleSuggestedSearch(term)}
                      >
                        {term}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="gap-2"
                >
                  <X className="w-4 h-4" /> Clear Filters
                </Button>
              </motion.div>
            ) : (
              /* Design Cards Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDesigns.map((design, i) => {
                  const imgSrc = getDesignImage(design)
                  return (
                    <motion.div
                      key={design.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Card
                        className="cursor-pointer group overflow-hidden border-0 shadow-sm hover:shadow-xl hover:shadow-orange-100/50 dark:hover:shadow-orange-900/20 transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-900 glow-card"
                        onClick={() => {
                          setSelectedDesignId(design.id)
                          navigateTo('design-detail')
                        }}
                      >
                        <div className="aspect-[4/3] bg-gradient-to-br from-orange-100 to-amber-50 dark:from-slate-800 dark:to-slate-800 relative overflow-hidden">
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={design.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-4xl opacity-30">
                                {['🎨', '✏️', '📱', '🧊', '🖼️', '🔤', '🖨️', '🎬'][i % 8]}
                              </div>
                            </div>
                          )}
                          {/* Bottom gradient overlay */}
                          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                          {/* Free badge */}
                          {design.is_free && (
                            <Badge className="absolute top-3 left-3 bg-green-500 text-white border-0 shadow-sm shadow-green-500/20">
                              Free
                            </Badge>
                          )}
                          {/* Quick-view overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                              <div className="glassmorphism-overlay rounded-full p-3 shadow-lg">
                                <Eye className="w-5 h-5 text-[#fb8000]" />
                              </div>
                            </div>
                          </div>
                          {/* Category badge */}
                          <Badge variant="secondary" className="absolute top-3 right-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm">
                            {design.category}
                          </Badge>
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
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="left" className="w-80 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Refine your search results</SheetDescription>
          </SheetHeader>
          <div className="px-4 py-2">
            <FilterSidebarContent
              selectedCategories={selectedCategories}
              onToggleCategory={handleToggleCategory}
              selectedPriceRanges={selectedPriceRanges}
              onTogglePriceRange={handleTogglePriceRange}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onClearFilters={handleClearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
          <SheetFooter>
            <Button
              className="w-full bg-[#fb8000] hover:bg-[#e57300] text-white"
              onClick={() => setMobileFiltersOpen(false)}
            >
              Show {filteredDesigns.length} Results
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
