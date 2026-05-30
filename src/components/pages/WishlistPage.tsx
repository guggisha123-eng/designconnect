'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, Plus, Trash2, Share2, Lock, Globe, ChevronUp, ChevronDown,
  X, Gift, Copy, FolderHeart, ShoppingBag, ArrowRight, Sparkles, Search,
  ShoppingCart, Calendar, MessageSquare, SortAsc, TrendingUp, DollarSign,
  Clock, Star
} from 'lucide-react'
import { useNavStore } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from '@/hooks/use-toast'

// ─── Types ──────────────────────────────────────────────

interface WishlistDesign {
  id: string
  title: string
  designer: string
  price: number
  is_free: boolean
  image: string
  likes: number
  category: string
  addedOn: string
  notes: string
}

interface Wishlist {
  id: string
  name: string
  isPublic: boolean
  designs: WishlistDesign[]
  createdAt: string
  sharedWith: number
}

// ─── Image map ──────────────────────────────────────────

const designImageMap: Record<string, string> = {
  'sample-1': '/designs/brand-identity.png',
  'sample-2': '/designs/logo-pack.png',
  'sample-3': '/designs/social-media-kit.png',
  'sample-4': '/designs/app-ui.png',
  'sample-5': '/designs/poster-collection.png',
  'sample-6': '/designs/icon-set.png',
  'sample-7': '/designs/business-card.png',
  'sample-8': '/designs/hero-bundle.png',
}

// ─── Local storage helpers ─────────────────────────────

const STORAGE_KEY = 'dc_wishlists'

function loadWishlists(): Wishlist[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return getDefaultWishlists()
}

function saveWishlists(wishlists: Wishlist[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlists))
  } catch { /* ignore */ }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getDefaultWishlists(): Wishlist[] {
  const now = Date.now()
  return [
    {
      id: 'wl-birthday',
      name: 'Birthday Gift Ideas',
      isPublic: true,
      designs: [
        { id: 'sample-1', title: 'Modern Brand Identity', designer: 'Sarah Chen', price: 29, is_free: false, image: '/designs/brand-identity.png', likes: 342, category: 'Logo Design', addedOn: new Date(now - 2 * 86400000).toISOString(), notes: '' },
        { id: 'sample-4', title: 'App UI Template', designer: 'James Wilson', price: 49, is_free: false, image: '/designs/app-ui.png', likes: 456, category: 'UI/UX', addedOn: new Date(now - 3 * 86400000).toISOString(), notes: 'For Mike' },
        { id: 'sample-6', title: 'Icon Set Premium', designer: 'Omar Hassan', price: 15, is_free: false, image: '/designs/icon-set.png', likes: 134, category: 'Icons', addedOn: new Date(now - 5 * 86400000).toISOString(), notes: '' },
      ],
      createdAt: new Date(now - 3 * 86400000).toISOString(),
      sharedWith: 2,
    },
    {
      id: 'wl-work',
      name: 'Work Resources',
      isPublic: false,
      designs: [
        { id: 'sample-2', title: 'Minimal Logo Pack', designer: 'Alex Rivera', price: 0, is_free: true, image: '/designs/logo-pack.png', likes: 215, category: 'Logo Design', addedOn: new Date(now - 7 * 86400000).toISOString(), notes: '' },
        { id: 'sample-3', title: 'Social Media Kit', designer: 'Maya Patel', price: 19, is_free: false, image: '/designs/social-media-kit.png', likes: 189, category: 'Social Media', addedOn: new Date(now - 8 * 86400000).toISOString(), notes: 'For Q2 campaign' },
        { id: 'sample-5', title: 'Poster Collection', designer: 'Luna Kim', price: 0, is_free: true, image: '/designs/poster-collection.png', likes: 278, category: 'Print Design', addedOn: new Date(now - 10 * 86400000).toISOString(), notes: '' },
        { id: 'sample-8', title: 'Website Hero Bundle', designer: 'Alex Rivera', price: 39, is_free: false, image: '/designs/hero-bundle.png', likes: 521, category: 'UI/UX', addedOn: new Date(now - 12 * 86400000).toISOString(), notes: '' },
      ],
      createdAt: new Date(now - 7 * 86400000).toISOString(),
      sharedWith: 0,
    },
  ]
}

// ─── Animated Counter Hook ──────────────────────────────

function useAnimatedCounter(target: number, duration = 800) {
  const [count, setCount] = useState(0)
  const ref = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    const startTime = Date.now()
    const startVal = 0
    const diff = target - startVal

    if (ref.current) clearInterval(ref.current)

    ref.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(startVal + diff * eased))
      if (progress >= 1 && ref.current) clearInterval(ref.current)
    }, 16)

    return () => { if (ref.current) clearInterval(ref.current) }
  }, [target, duration])

  return count
}

// ─── Sort types ─────────────────────────────────────────

type SortOption = 'date-added' | 'price-low' | 'price-high' | 'popular'

function sortDesigns(designs: WishlistDesign[], sortBy: SortOption): WishlistDesign[] {
  const sorted = [...designs]
  switch (sortBy) {
    case 'price-low': return sorted.sort((a, b) => a.price - b.price)
    case 'price-high': return sorted.sort((a, b) => b.price - a.price)
    case 'popular': return sorted.sort((a, b) => b.likes - a.likes)
    case 'date-added':
    default: return sorted.sort((a, b) => new Date(b.addedOn).getTime() - new Date(a.addedOn).getTime())
  }
}

// ─── Component ──────────────────────────────────────────

export default function WishlistPage() {
  const navigateTo = useNavStore((s) => s.navigateTo)
  const setSelectedDesignId = useNavStore((s) => s.setSelectedDesignId)

  const [wishlists, setWishlists] = useState<Wishlist[]>(() => loadWishlists())
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const loaded = loadWishlists()
    return loaded.length > 0 ? loaded[0].id : null
  })
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('date-added')
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [noteValue, setNoteValue] = useState('')

  // Persist whenever wishlists change
  useEffect(() => {
    if (wishlists.length > 0) {
      saveWishlists(wishlists)
    }
  }, [wishlists])

  const selectedWishlist = wishlists.find((w) => w.id === selectedId) || null

  const totalValue = selectedWishlist
    ? selectedWishlist.designs.reduce((sum, d) => sum + d.price, 0)
    : 0

  const animatedTotal = useAnimatedCounter(totalValue)

  // ─── Actions ───────────────────────────────────────

  const handleCreate = useCallback(() => {
    if (!newName.trim()) return
    const newWishlist: Wishlist = {
      id: `wl-${Date.now()}`,
      name: newName.trim(),
      isPublic: false,
      designs: [],
      createdAt: new Date().toISOString(),
      sharedWith: 0,
    }
    setWishlists((prev) => [...prev, newWishlist])
    setSelectedId(newWishlist.id)
    setNewName('')
    setCreateOpen(false)
    toast({ title: 'Wishlist created!', description: `"${newWishlist.name}" is ready.` })
  }, [newName])

  const handleDelete = useCallback(() => {
    if (!selectedId) return
    const name = selectedWishlist?.name || 'Wishlist'
    setWishlists((prev) => prev.filter((w) => w.id !== selectedId))
    setSelectedId((prev) => {
      const remaining = wishlists.filter((w) => w.id !== prev)
      return remaining.length > 0 ? remaining[0].id : null
    })
    setDeleteConfirmOpen(false)
    toast({ title: 'Wishlist deleted', description: `"${name}" has been removed.` })
  }, [selectedId, selectedWishlist, wishlists])

  const handleTogglePublic = useCallback(() => {
    if (!selectedId) return
    setWishlists((prev) =>
      prev.map((w) => (w.id === selectedId ? { ...w, isPublic: !w.isPublic } : w))
    )
  }, [selectedId])

  const handleShare = useCallback(() => {
    if (!selectedWishlist) return
    const url = `${window.location.origin}${window.location.pathname}#wishlist?id=${selectedWishlist.id}`
    navigator.clipboard.writeText(url).then(() => {
      toast({ title: 'Link copied!', description: 'Share this wishlist link with friends.' })
    }).catch(() => {
      toast({ title: 'Could not copy link', variant: 'destructive' })
    })
  }, [selectedWishlist])

  const handleRemoveDesign = useCallback((designId: string) => {
    if (!selectedId) return
    setWishlists((prev) =>
      prev.map((w) =>
        w.id === selectedId
          ? { ...w, designs: w.designs.filter((d) => d.id !== designId) }
          : w
      )
    )
  }, [selectedId])

  const handleAddToCart = useCallback((design: WishlistDesign) => {
    toast({ title: 'Added to cart!', description: `"${design.title}" has been added to your cart.` })
  }, [])

  const handleMoveDesign = useCallback((designId: string, direction: 'up' | 'down') => {
    if (!selectedId) return
    setWishlists((prev) =>
      prev.map((w) => {
        if (w.id !== selectedId) return w
        const idx = w.designs.findIndex((d) => d.id === designId)
        if (idx === -1) return w
        const newIdx = direction === 'up' ? idx - 1 : idx + 1
        if (newIdx < 0 || newIdx >= w.designs.length) return w
        const newDesigns = [...w.designs]
        const temp = newDesigns[idx]
        newDesigns[idx] = newDesigns[newIdx]
        newDesigns[newIdx] = temp
        return { ...w, designs: newDesigns }
      })
    )
  }, [selectedId])

  const handleViewDesign = useCallback((designId: string) => {
    setSelectedDesignId(designId)
    navigateTo('design-detail')
  }, [navigateTo, setSelectedDesignId])

  const handleSaveNote = useCallback((designId: string) => {
    if (!selectedId) return
    setWishlists((prev) =>
      prev.map((w) =>
        w.id === selectedId
          ? { ...w, designs: w.designs.map((d) => d.id === designId ? { ...d, notes: noteValue } : d) }
          : w
      )
    )
    setEditingNote(null)
    toast({ title: 'Note saved!' })
  }, [selectedId, noteValue])

  // ─── Render ────────────────────────────────────────

  const sortedDesigns = selectedWishlist ? sortDesigns(selectedWishlist.designs, sortBy) : []

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      {/* Gradient Header */}
      <div className="bg-gradient-to-br from-[#fb8000] via-[#e57300] to-[#f59e0b] relative overflow-hidden">
        <div className="absolute inset-0 dot-grid-bg opacity-20" />
        <div className="absolute top-4 right-12 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-2 left-8 w-24 h-24 rounded-full bg-white/10 blur-xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">Wishlist & Gifts</h1>
            </div>
            <p className="text-white/80 ml-15">Curate your favorite designs and share gift ideas with friends</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ─── Sidebar ──── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:w-72 flex-shrink-0"
          >
            {/* Mobile toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden w-full flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-border/50 mb-2"
            >
              <span className="text-sm font-medium">My Wishlists</span>
              <ChevronUp className={`w-4 h-4 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} />
            </button>

            <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block space-y-2`}>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-border/50 p-3 shadow-sm glass-card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">My Wishlists</h3>
                  <Button
                    size="sm"
                    onClick={() => setCreateOpen(true)}
                    className="h-7 gap-1 bg-[#fb8000] hover:bg-[#e57300] text-white text-xs"
                  >
                    <Plus className="w-3 h-3" /> New
                  </Button>
                </div>
                <div className="space-y-1 max-h-80 overflow-y-auto custom-scrollbar">
                  <AnimatePresence>
                    {wishlists.map((wl) => (
                      <motion.button
                        key={wl.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        onClick={() => setSelectedId(wl.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedId === wl.id
                            ? 'bg-[#fb8000]/10 text-[#fb8000] border border-[#fb8000]/20'
                            : 'text-foreground/70 hover:bg-muted border border-transparent'
                        }`}
                      >
                        <FolderHeart className={`w-4 h-4 flex-shrink-0 ${selectedId === wl.id ? 'text-[#fb8000]' : 'text-muted-foreground'}`} />
                        <span className="truncate flex-1 text-left">{wl.name}</span>
                        <span className="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">{wl.designs.length}</span>
                        {wl.isPublic ? (
                          <Globe className="w-3 h-3 text-green-500 flex-shrink-0" />
                        ) : (
                          <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        )}
                      </motion.button>
                    ))}
                  </AnimatePresence>
                  {wishlists.length === 0 && (
                    <div className="text-center py-6">
                      <FolderHeart className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">No wishlists yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ─── Main Content ──── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex-1 min-w-0"
          >
            {selectedWishlist ? (
              <>
                {/* Wishlist Top Bar */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-border/50 p-4 mb-4 shadow-sm glass-card">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold dark:text-white">{selectedWishlist.name}</h2>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3" />
                          {selectedWishlist.designs.length} design{selectedWishlist.designs.length !== 1 ? 's' : ''}
                        </span>
                        {totalValue > 0 && (
                          <span className="text-xs font-semibold wishlist-value-counter bg-orange-50 dark:bg-orange-950/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <DollarSign className="w-3 h-3 text-[#fb8000]" />
                            <span className="text-[#fb8000]">${animatedTotal}</span>
                            <span className="text-[#fb8000]/60 font-normal">total value</span>
                          </span>
                        )}
                        <Badge variant="outline" className={`text-[10px] ${selectedWishlist.isPublic ? 'border-green-500/30 text-green-600 dark:text-green-400' : 'border-border text-muted-foreground'}`}>
                          {selectedWishlist.isPublic ? 'Public' : 'Private'}
                        </Badge>
                        {selectedWishlist.sharedWith > 0 && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Share2 className="w-3 h-3" />
                            Shared with {selectedWishlist.sharedWith}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Sort dropdown */}
                      <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                        <SelectTrigger className="h-8 w-36 text-xs bg-white dark:bg-slate-800">
                          <SortAsc className="w-3 h-3 mr-1 text-muted-foreground" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date-added"><Clock className="w-3 h-3 mr-1.5 inline" />Date Added</SelectItem>
                          <SelectItem value="price-low"><TrendingUp className="w-3 h-3 mr-1.5 inline" />Price: Low-High</SelectItem>
                          <SelectItem value="price-high"><TrendingUp className="w-3 h-3 mr-1.5 inline rotate-180" />Price: High-Low</SelectItem>
                          <SelectItem value="popular"><Star className="w-3 h-3 mr-1.5 inline" />Most Popular</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                        className="gap-1.5 text-xs"
                      >
                        <Share2 className="w-3.5 h-3.5" /> Share
                      </Button>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 dark:bg-slate-800 rounded-lg">
                        <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                        <Switch
                          checked={selectedWishlist.isPublic}
                          onCheckedChange={handleTogglePublic}
                          className="data-[state=checked]:bg-green-500"
                        />
                        <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirmOpen(true)}
                        className="gap-1.5 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Design Grid */}
                {selectedWishlist.designs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    <AnimatePresence mode="popLayout">
                      {sortedDesigns.map((design, i) => (
                        <motion.div
                          key={design.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: i * 0.05, duration: 0.3 }}
                        >
                          <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl hover:shadow-orange-100/50 dark:hover:shadow-orange-900/20 transition-all duration-300 hover:-translate-y-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm card-shine">
                            <div className="aspect-[4/3] bg-gradient-to-br from-orange-100 to-amber-50 dark:from-slate-800 dark:to-slate-800 relative overflow-hidden">
                              <img
                                src={design.image || designImageMap[design.id] || ''}
                                alt={design.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                              {/* Remove button */}
                              <button
                                onClick={(e) => { e.stopPropagation(); handleRemoveDesign(design.id) }}
                                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 shadow-md"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                              {/* Price badge */}
                              {!design.is_free && (
                                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-md">
                                  ${design.price}
                                </div>
                              )}
                              {design.is_free && (
                                <Badge className="absolute top-2 left-2 bg-emerald-500 text-white border-0 text-[10px]">
                                  Free
                                </Badge>
                              )}
                              {/* Quick actions on hover */}
                              <div className="absolute bottom-2 left-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Button
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); handleAddToCart(design) }}
                                  className="flex-1 h-8 gap-1.5 text-xs bg-[#fb8000] hover:bg-[#e57300] text-white"
                                >
                                  <ShoppingCart className="w-3 h-3" /> Add to Cart
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => { e.stopPropagation(); handleRemoveDesign(design.id) }}
                                  className="h-8 gap-1.5 text-xs bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-900/50 text-red-500"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                              {/* Reorder buttons */}
                              <div className="absolute bottom-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-0 transition-opacity duration-200" style={{ opacity: 0 }}>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleMoveDesign(design.id, 'up') }}
                                  disabled={i === 0}
                                  className="w-6 h-6 rounded bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm flex items-center justify-center shadow-sm disabled:opacity-30 hover:bg-white dark:hover:bg-slate-700"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleMoveDesign(design.id, 'down') }}
                                  disabled={i === selectedWishlist.designs.length - 1}
                                  className="w-6 h-6 rounded bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm flex items-center justify-center shadow-sm disabled:opacity-30 hover:bg-white dark:hover:bg-slate-700"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h3
                                  className="font-semibold text-sm line-clamp-1 cursor-pointer hover:text-[#fb8000] transition-colors dark:text-white"
                                  onClick={() => handleViewDesign(design.id)}
                                >
                                  {design.title}
                                </h3>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <Avatar className="w-5 h-5">
                                  <AvatarFallback className="text-[8px] bg-[#fb8000]/10 text-[#fb8000] font-semibold">
                                    {design.designer.split(' ').map((n) => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">{design.designer}</span>
                              </div>
                              <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-2">
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(design.addedOn)}</span>
                                <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {design.likes}</span>
                              </div>
                              {/* Notes field */}
                              <div className="border-t border-border/50 pt-2">
                                {editingNote === design.id ? (
                                  <div className="flex gap-1.5">
                                    <Input
                                      value={noteValue}
                                      onChange={(e) => setNoteValue(e.target.value)}
                                      placeholder="Add a note..."
                                      className="h-7 text-xs"
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveNote(design.id)
                                        if (e.key === 'Escape') setEditingNote(null)
                                      }}
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => handleSaveNote(design.id)}
                                      className="h-7 px-2 text-xs bg-[#fb8000] hover:bg-[#e57300] text-white"
                                    >
                                      Save
                                    </Button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => { setEditingNote(design.id); setNoteValue(design.notes) }}
                                    className="w-full text-left text-xs text-muted-foreground hover:text-[#fb8000] transition-colors flex items-center gap-1"
                                  >
                                    <MessageSquare className="w-3 h-3 flex-shrink-0" />
                                    {design.notes || 'Add a note...'}
                                  </button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Add Design Card */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Card
                        className="h-full min-h-[280px] flex items-center justify-center border-2 border-dashed border-border/50 hover:border-[#fb8000]/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm cursor-pointer transition-all duration-300 group hover-lift"
                        onClick={() => navigateTo('browse')}
                      >
                        <div className="text-center p-6">
                          <div className="w-14 h-14 rounded-full bg-[#fb8000]/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6 text-[#fb8000]" />
                          </div>
                          <p className="text-sm font-semibold dark:text-white">Add Design</p>
                          <p className="text-xs text-muted-foreground mt-1">Browse designs to add to this wishlist</p>
                        </div>
                      </Card>
                    </motion.div>
                  </div>
                ) : (
                  /* Empty State - Large illustration */
                  <div className="text-center py-20">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="empty-state-illustration mb-8">
                        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 flex items-center justify-center mx-auto relative">
                          <Heart className="w-16 h-16 text-[#fb8000]/60" />
                          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#fb8000]/20 flex items-center justify-center">
                            <Plus className="w-4 h-4 text-[#fb8000]" />
                          </div>
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold mb-2 dark:text-white">Your wishlist is empty</h3>
                      <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                        Start adding designs you love! Browse our collection and add items to curate your perfect wishlist.
                      </p>
                      <Button
                        onClick={() => navigateTo('browse')}
                        className="gap-2 bg-[#fb8000] hover:bg-[#e57300] text-white btn-glow"
                      >
                        <Search className="w-4 h-4" /> Browse Designs
                      </Button>
                    </motion.div>
                  </div>
                )}
              </>
            ) : (
              /* No wishlist selected - Big empty state */
              <div className="text-center py-20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="empty-state-illustration mb-8">
                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 flex items-center justify-center mx-auto relative">
                      <Gift className="w-16 h-16 text-[#fb8000]/60" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-pink-400/40 flex items-center justify-center">
                        <Heart className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 dark:text-white">No wishlists yet</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                    Create your first wishlist to start curating designs and sharing gift ideas with friends and family.
                  </p>
                  <Button
                    onClick={() => setCreateOpen(true)}
                    className="gap-2 bg-[#fb8000] hover:bg-[#e57300] text-white btn-glow"
                  >
                    <Plus className="w-4 h-4" /> Create Wishlist
                  </Button>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ─── Create Wishlist Dialog ──── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#fb8000]" />
              Create New Wishlist
            </DialogTitle>
            <DialogDescription>
              Give your wishlist a name, like &quot;Birthday Gift Ideas&quot; or &quot;Work Resources&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Wishlist name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate()
              }}
              autoFocus
              className="focus-visible:ring-[#fb8000]/50"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="bg-[#fb8000] hover:bg-[#e57300] text-white"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation Dialog ──── */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Wishlist?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedWishlist?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
