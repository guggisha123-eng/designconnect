'use client'

import { useState, useCallback, useSyncExternalStore, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, Bookmark, ExternalLink, Trash2, ArrowLeft, Palette, Eye, X,
  LayoutGrid, List, Search, FolderPlus, Folder, MoreHorizontal,
  Plus, Check, ChevronDown, Image as ImageIcon
} from 'lucide-react'
import { useNavStore } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

/* ─── Design data with real images ─── */
interface SavedDesign {
  id: string
  title: string
  category: string
  designerName: string
  likeCount: number
  viewCount: number
  price: number
  isFree: boolean
  image: string
}

const savedDesignData: Record<string, SavedDesign> = {
  'sample-1': { id: 'sample-1', title: 'Modern Brand Identity', category: 'Logo Design', designerName: 'Sarah Chen', likeCount: 342, viewCount: 2890, price: 29, isFree: false, image: '/designs/brand-identity.png' },
  'sample-2': { id: 'sample-2', title: 'Minimal Logo Pack', category: 'Logo Design', designerName: 'Alex Rivera', likeCount: 215, viewCount: 1540, price: 0, isFree: true, image: '/designs/logo-pack.png' },
  'sample-3': { id: 'sample-3', title: 'Social Media Kit', category: 'Social Media', designerName: 'Maya Patel', likeCount: 189, viewCount: 2100, price: 19, isFree: false, image: '/designs/social-media-kit.png' },
  'sample-4': { id: 'sample-4', title: 'App UI Template', category: 'UI/UX', designerName: 'James Wilson', likeCount: 456, viewCount: 5200, price: 49, isFree: false, image: '/designs/app-ui.png' },
  'sample-5': { id: 'sample-5', title: 'Poster Collection', category: 'Print Design', designerName: 'Luna Kim', likeCount: 278, viewCount: 3100, price: 0, isFree: true, image: '/designs/poster-collection.png' },
  'sample-6': { id: 'sample-6', title: 'Icon Set Premium', category: 'Icons', designerName: 'Omar Hassan', likeCount: 134, viewCount: 980, price: 15, isFree: false, image: '/designs/icon-set.png' },
  'sample-7': { id: 'sample-7', title: 'Business Card Template', category: 'Print Design', designerName: 'Emma Torres', likeCount: 97, viewCount: 720, price: 0, isFree: true, image: '/designs/business-card.png' },
  'sample-8': { id: 'sample-8', title: 'Website Hero Bundle', category: 'UI/UX', designerName: 'David Park', likeCount: 521, viewCount: 6400, price: 39, isFree: false, image: '/designs/hero-bundle.png' },
}

function getDesignById(id: string): SavedDesign | undefined {
  if (savedDesignData[id]) return savedDesignData[id]
  // For IDs not in the map, generate a synthetic entry with fallback image
  const idx = Math.abs(id.split('').reduce((a, c) => a + c.charCodeAt(0), 0))
  const titles = ['Creative Pack', 'Design System', 'Motion Kit', 'Brand Guide', 'Illustration Set', 'UI Component', 'Dashboard UI', 'Landing Page']
  const categories = ['Logo Design', 'UI/UX', 'Illustrations', 'Typography', '3D Design', 'Social Media', 'Print', 'Motion', 'Icons']
  const designers = ['Sarah Chen', 'Alex Rivera', 'Maya Patel', 'James Wilson', 'Luna Kim', 'Omar Hassan']
  return {
    id,
    title: titles[idx % titles.length],
    category: categories[idx % categories.length],
    designerName: designers[idx % designers.length],
    likeCount: (idx % 500) + 20,
    viewCount: (idx % 5000) + 200,
    price: idx % 3 === 0 ? 0 : (idx % 50) + 5,
    isFree: idx % 3 === 0,
    image: '/designs/brand-identity.png',
  }
}

/* ─── localStorage helpers ─── */
const emptyObj: Record<string, boolean> = {}
const snapshotCache = new Map<string, { raw: string | null; parsed: Record<string, boolean> }>()

function subscribeToStorage(callback: () => void) {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

function getStorageSnapshot(key: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(key)
    const cached = snapshotCache.get(key)
    if (cached && cached.raw === raw) return cached.parsed
    if (!raw) {
      snapshotCache.set(key, { raw: null, parsed: emptyObj })
      return emptyObj
    }
    const parsed = JSON.parse(raw)
    if (typeof parsed === 'object' && parsed !== null) {
      snapshotCache.set(key, { raw, parsed })
      return parsed
    }
  } catch { /* ignore */ }
  return emptyObj
}

function getServerSnapshot(): Record<string, boolean> {
  return emptyObj
}

function useLocalStorageMap(key: string): [Record<string, boolean>, (updated: Record<string, boolean>) => void] {
  const data = useSyncExternalStore(
    subscribeToStorage,
    () => getStorageSnapshot(key),
    getServerSnapshot,
  )

  const setData = useCallback((updated: Record<string, boolean>) => {
    try {
      localStorage.setItem(key, JSON.stringify(updated))
      window.dispatchEvent(new StorageEvent('storage', { key }))
    } catch { /* ignore */ }
  }, [key])

  return [data, setData]
}

/* ─── Collection types ─── */
interface Collection {
  id: string
  name: string
  emoji: string
  designIds: string[]
  gradient: string
  updatedAt: string
}

const COLLECTION_GRADIENTS = [
  'from-orange-500 to-amber-400',
  'from-rose-500 to-pink-400',
  'from-violet-500 to-purple-400',
  'from-emerald-500 to-teal-400',
  'from-sky-500 to-cyan-400',
  'from-red-500 to-orange-400',
]

const COLLECTION_GRADIENT_CSS: Record<string, string> = {
  'from-orange-500 to-amber-400': 'linear-gradient(135deg, #f97316, #fbbf24)',
  'from-rose-500 to-pink-400': 'linear-gradient(135deg, #f43f5e, #f472b6)',
  'from-violet-500 to-purple-400': 'linear-gradient(135deg, #8b5cf6, #c084fc)',
  'from-emerald-500 to-teal-400': 'linear-gradient(135deg, #10b981, #2dd4bf)',
  'from-sky-500 to-cyan-400': 'linear-gradient(135deg, #0ea5e9, #22d3ee)',
  'from-red-500 to-orange-400': 'linear-gradient(135deg, #ef4444, #fb923c)',
}

const DEFAULT_COLLECTIONS: Collection[] = [
  { id: 'favorites', name: 'Favorites', emoji: '❤️', designIds: [], gradient: 'from-orange-500 to-amber-400', updatedAt: new Date().toISOString() },
  { id: 'inspiration', name: 'Inspiration', emoji: '✨', designIds: [], gradient: 'from-violet-500 to-purple-400', updatedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'for-later', name: 'For Later', emoji: '📌', designIds: [], gradient: 'from-emerald-500 to-teal-400', updatedAt: new Date(Date.now() - 2 * 86400000).toISOString() },
]

function loadCollections(): Collection[] {
  try {
    const stored = localStorage.getItem('dc_collections')
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return DEFAULT_COLLECTIONS
}

function saveCollections(collections: Collection[]) {
  try {
    localStorage.setItem('dc_collections', JSON.stringify(collections))
  } catch { /* ignore */ }
}

/* ─── Empty state component with custom illustration ─── */
function EmptyState({ icon: Icon, title, description, illustration }: { icon: React.ElementType; title: string; description: string; illustration?: string }) {
  const navigateTo = useNavStore((s) => s.navigateTo)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 px-4"
    >
      <div className="empty-state-illustration mb-8">
        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 flex items-center justify-center relative">
          <Icon className="w-16 h-16 text-[#fb8000]/60" />
          {illustration && <span className="absolute -bottom-1 -right-1 text-2xl">{illustration}</span>}
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-xs text-center mb-6">{description}</p>
      <Button
        className="gradient-orange gradient-orange-hover text-white border-0 gap-2 px-6 btn-glow"
        onClick={() => navigateTo('browse')}
      >
        <ExternalLink className="w-4 h-4" /> Browse Designs
      </Button>
    </motion.div>
  )
}

/* ─── Main component ─── */
export default function SavedPage() {
  const navigateTo = useNavStore((s) => s.navigateTo)
  const setSelectedDesignId = useNavStore((s) => s.setSelectedDesignId)
  const goBack = useNavStore((s) => s.goBack)

  const [activeTab, setActiveTab] = useState<string>('saved')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [collectionSort, setCollectionSort] = useState<'name' | 'date' | 'count'>('date')
  const [selectedBulkItems, setSelectedBulkItems] = useState<Set<string>>(new Set())

  // Saved/liked/referenced design IDs
  const [savedIds, setSavedIds] = useLocalStorageMap('dc_saves')
  const [likedIds, setLikedIds] = useLocalStorageMap('dc_likes')
  const [referencedIds, setReferencedIds] = useLocalStorageMap('dc_references')

  // Collections
  const [collections, setCollections] = useState<Collection[]>(loadCollections)
  const [activeCollection, setActiveCollection] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [newCollectionEmoji, setNewCollectionEmoji] = useState('📁')
  const [newCollectionGradient, setNewCollectionGradient] = useState(COLLECTION_GRADIENTS[0])

  // Derive design lists
  const savedDesigns = useMemo(() =>
    Object.keys(savedIds).filter((k) => savedIds[k]).map(getDesignById).filter(Boolean) as SavedDesign[],
    [savedIds]
  )
  const likedDesigns = useMemo(() =>
    Object.keys(likedIds).filter((k) => likedIds[k]).map(getDesignById).filter(Boolean) as SavedDesign[],
    [likedIds]
  )
  const referencedDesigns = useMemo(() =>
    Object.keys(referencedIds).filter((k) => referencedIds[k]).map(getDesignById).filter(Boolean) as SavedDesign[],
    [referencedIds]
  )

  // Search filter
  const filterBySearch = useCallback((designs: SavedDesign[]) => {
    if (!searchQuery.trim()) return designs
    const q = searchQuery.toLowerCase()
    return designs.filter(d =>
      d.title.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      d.designerName.toLowerCase().includes(q)
    )
  }, [searchQuery])

  // Collection-filtered saved designs
  const collectionFilteredDesigns = useMemo(() => {
    let designs = filterBySearch(savedDesigns)
    if (activeCollection) {
      const col = collections.find(c => c.id === activeCollection)
      if (col) {
        designs = designs.filter(d => col.designIds.includes(d.id))
      }
    }
    return designs
  }, [savedDesigns, activeCollection, collections, filterBySearch])

  const filteredLikedDesigns = useMemo(() => filterBySearch(likedDesigns), [likedDesigns, filterBySearch])
  const filteredReferencedDesigns = useMemo(() => filterBySearch(referencedDesigns), [referencedDesigns, filterBySearch])

  // Current tab designs
  const currentDesigns = activeTab === 'saved' ? collectionFilteredDesigns
    : activeTab === 'liked' ? filteredLikedDesigns
    : filteredReferencedDesigns

  // Remove handlers
  const removeSaved = useCallback((id: string) => {
    const updated = { ...savedIds }
    delete updated[id]
    setSavedIds(updated)
    // Also remove from all collections
    setCollections(prev => {
      const next = prev.map(col => ({
        ...col,
        designIds: col.designIds.filter(dId => dId !== id),
      }))
      saveCollections(next)
      return next
    })
  }, [savedIds, setSavedIds])

  const removeLiked = useCallback((id: string) => {
    const updated = { ...likedIds }
    delete updated[id]
    setLikedIds(updated)
  }, [likedIds, setLikedIds])

  const removeReferenced = useCallback((id: string) => {
    const updated = { ...referencedIds }
    delete updated[id]
    setReferencedIds(updated)
  }, [referencedIds, setReferencedIds])

  const currentRemoveHandler = activeTab === 'saved' ? removeSaved
    : activeTab === 'liked' ? removeLiked
    : removeReferenced

  // Collection management
  const addToCollection = useCallback((collectionId: string, designId: string) => {
    setCollections(prev => {
      const next = prev.map(col => {
        if (col.id === collectionId && !col.designIds.includes(designId)) {
          return { ...col, designIds: [...col.designIds, designId] }
        }
        return col
      })
      saveCollections(next)
      return next
    })
  }, [])

  const removeFromCollection = useCallback((collectionId: string, designId: string) => {
    setCollections(prev => {
      const next = prev.map(col => {
        if (col.id === collectionId) {
          return { ...col, designIds: col.designIds.filter(id => id !== designId) }
        }
        return col
      })
      saveCollections(next)
      return next
    })
  }, [])

  const deleteCollection = useCallback((collectionId: string) => {
    setCollections(prev => {
      const next = prev.filter(col => col.id !== collectionId)
      saveCollections(next)
      return next
    })
    if (activeCollection === collectionId) setActiveCollection(null)
  }, [activeCollection])

  const handleCreateCollection = useCallback(() => {
    if (!newCollectionName.trim()) return
    const newCol: Collection = {
      id: `col-${Date.now()}`,
      name: newCollectionName.trim(),
      emoji: newCollectionEmoji,
      designIds: [],
      gradient: newCollectionGradient,
      updatedAt: new Date().toISOString(),
    }
    const next = [...collections, newCol]
    saveCollections(next)
    setCollections(next)
    setNewCollectionName('')
    setNewCollectionEmoji('📁')
    setNewCollectionGradient(COLLECTION_GRADIENTS[0])
    setCreateDialogOpen(false)
    toast({ title: 'Collection created!' })
  }, [newCollectionName, newCollectionEmoji, newCollectionGradient, collections])

  const getDesignCollections = useCallback((designId: string) => {
    return collections.filter(col => col.designIds.includes(designId))
  }, [collections])

  /* ─── Render grid item ─── */
  function renderGridItem(design: SavedDesign, i: number, onRemove: (id: string) => void) {
    const designCollections = getDesignCollections(design.id)
    return (
      <motion.div
        key={design.id}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ delay: i * 0.03 }}
      >
        <Card className="cursor-pointer group overflow-hidden border-0 shadow-sm hover:shadow-xl dark:shadow-slate-900/30 dark:hover:shadow-slate-900/50 transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-900">
          {/* Thumbnail area */}
          <div
            className="aspect-[4/3] relative overflow-hidden bg-slate-100 dark:bg-slate-800"
            onClick={() => {
              setSelectedDesignId(design.id)
              navigateTo('design-detail')
            }}
          >
            <img
              src={design.image}
              alt={design.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            {/* Category badge */}
            <Badge variant="secondary" className="absolute top-3 left-3 bg-white/90 dark:bg-slate-800/90 text-xs">
              {design.category}
            </Badge>
            {/* Free badge */}
            {design.isFree && (
              <Badge className="absolute top-3 right-12 bg-green-500 text-white border-0 text-xs">Free</Badge>
            )}
            {/* Remove button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove(design.id)
              }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-red-50 dark:hover:bg-red-900/50 flex items-center justify-center shadow-sm transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Remove"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
            {/* Collection badge */}
            {designCollections.length > 0 && (
              <div className="absolute bottom-3 left-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {designCollections.slice(0, 2).map(col => (
                  <span key={col.id} className="text-xs bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {col.emoji} {col.name}
                  </span>
                ))}
                {designCollections.length > 2 && (
                  <span className="text-xs bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                    +{designCollections.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Card content */}
          <CardContent className="p-4">
            <h3
              className="font-semibold text-sm line-clamp-1 mb-1 cursor-pointer hover:text-[#fb8000] transition-colors"
              onClick={() => {
                setSelectedDesignId(design.id)
                navigateTo('design-detail')
              }}
            >
              {design.title}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="w-5 h-5">
                <AvatarFallback className="text-[10px] bg-[#fb8000]/10 text-[#fb8000] font-semibold">
                  {design.designerName.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{design.designerName}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" /> {design.likeCount}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {design.viewCount}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {!design.isFree && (
                  <span className="font-semibold text-[#fb8000]">${design.price}</span>
                )}
                {/* Add to collection dropdown (only in saved tab) */}
                {activeTab === 'saved' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-[#fb8000]"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Add to collection"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Add to collection</div>
                      <DropdownMenuSeparator />
                      {collections.map(col => {
                        const isInCollection = col.designIds.includes(design.id)
                        return (
                          <DropdownMenuItem
                            key={col.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (isInCollection) {
                                removeFromCollection(col.id, design.id)
                              } else {
                                addToCollection(col.id, design.id)
                              }
                            }}
                          >
                            <span className="mr-2">{col.emoji}</span>
                            <span className="flex-1">{col.name}</span>
                            {isInCollection && <Check className="w-3 h-3 text-[#fb8000]" />}
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove(design.id)
                  }}
                  aria-label="Remove design"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  /* ─── Render list item ─── */
  function renderListItem(design: SavedDesign, i: number, onRemove: (id: string) => void) {
    const designCollections = getDesignCollections(design.id)
    return (
      <motion.div
        key={design.id}
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ delay: i * 0.03 }}
      >
        <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-md dark:shadow-slate-900/30 dark:hover:shadow-slate-900/50 transition-all bg-white dark:bg-slate-900">
          <div className="flex items-center gap-4 p-3 sm:p-4">
            {/* Thumbnail */}
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800 cursor-pointer"
              onClick={() => {
                setSelectedDesignId(design.id)
                navigateTo('design-detail')
              }}
            >
              <img
                src={design.image}
                alt={design.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3
                className="font-semibold text-sm sm:text-base line-clamp-1 cursor-pointer hover:text-[#fb8000] transition-colors"
                onClick={() => {
                  setSelectedDesignId(design.id)
                  navigateTo('design-detail')
                }}
              >
                {design.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="w-4 h-4">
                  <AvatarFallback className="text-[8px] bg-[#fb8000]/10 text-[#fb8000] font-semibold">
                    {design.designerName.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{design.designerName}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <Badge variant="secondary" className="text-[10px] h-5">{design.category}</Badge>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {design.likeCount}</span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {design.viewCount}</span>
                {!design.isFree ? (
                  <span className="font-semibold text-[#fb8000]">${design.price}</span>
                ) : (
                  <Badge className="bg-green-500 text-white border-0 text-[10px] h-5">Free</Badge>
                )}
              </div>
              {/* Collection tags */}
              {designCollections.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {designCollections.map(col => (
                    <span key={col.id} className="text-[10px] bg-orange-50 dark:bg-orange-900/20 text-[#fb8000] px-2 py-0.5 rounded-full">
                      {col.emoji} {col.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {activeTab === 'saved' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-[#fb8000]"
                      aria-label="Add to collection"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Add to collection</div>
                    <DropdownMenuSeparator />
                    {collections.map(col => {
                      const isInCollection = col.designIds.includes(design.id)
                      return (
                        <DropdownMenuItem
                          key={col.id}
                          onClick={() => {
                            if (isInCollection) {
                              removeFromCollection(col.id, design.id)
                            } else {
                              addToCollection(col.id, design.id)
                            }
                          }}
                        >
                          <span className="mr-2">{col.emoji}</span>
                          <span className="flex-1">{col.name}</span>
                          {isInCollection && <Check className="w-3 h-3 text-[#fb8000]" />}
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                onClick={() => onRemove(design.id)}
                aria-label="Remove design"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

  /* ─── Render designs list/grid ─── */
  function renderDesigns(designs: SavedDesign[], onRemove: (id: string) => void) {
    if (designs.length === 0) {
      if (searchQuery.trim()) {
        return (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <Search className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No results found</h3>
            <p className="text-muted-foreground text-sm">Try a different search term</p>
          </div>
        )
      }
      const emptyConfig = {
        saved: { icon: Bookmark, title: 'No saved designs yet', description: 'Start saving designs you love and they\'ll appear here for easy access.', illustration: '💾' },
        liked: { icon: Heart, title: 'No liked designs yet', description: 'Like designs to show appreciation and find them quickly later.', illustration: '👍' },
        referenced: { icon: Palette, title: 'No referenced designs', description: 'Reference designs for inspiration and they\'ll be collected here.', illustration: '🔗' },
      }[activeTab] ?? { icon: Bookmark, title: 'Nothing here yet', description: 'Check back later.' }

      return <EmptyState icon={emptyConfig.icon} title={emptyConfig.title} description={emptyConfig.description} illustration={emptyConfig.illustration} />
    }

    if (viewMode === 'list') {
      return (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {designs.map((design, i) => renderListItem(design, i, onRemove))}
          </AnimatePresence>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {designs.map((design, i) => renderGridItem(design, i, onRemove))}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-border/50 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={goBack}
                aria-label="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-3xl font-bold">My Collection</h1>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto gap-1.5 text-xs h-8"
                onClick={() => navigateTo('collections')}
              >
                <FolderPlus className="w-3.5 h-3.5" /> Manage Collections
              </Button>
            </div>
            <p className="text-muted-foreground ml-11">
              Manage your saved, liked, and referenced designs
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="mt-6">
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setActiveCollection(null); setSearchQuery(''); }}>
              <TabsList className="bg-muted/70 dark:bg-slate-800">
                <TabsTrigger value="saved" className="gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
                  <Bookmark className="w-4 h-4" />
                  Saved
                  {savedDesigns.length > 0 && (
                    <Badge className="ml-1 h-5 min-w-5 px-1.5 text-[10px] gradient-orange text-white border-0">
                      {savedDesigns.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="liked" className="gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
                  <Heart className="w-4 h-4" />
                  Liked
                  {likedDesigns.length > 0 && (
                    <Badge className="ml-1 h-5 min-w-5 px-1.5 text-[10px] gradient-orange text-white border-0">
                      {likedDesigns.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="referenced" className="gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
                  <Palette className="w-4 h-4" />
                  Referenced
                  {referencedDesigns.length > 0 && (
                    <Badge className="ml-1 h-5 min-w-5 px-1.5 text-[10px] gradient-orange text-white border-0">
                      {referencedDesigns.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="saved" className="mt-0" />
              <TabsContent value="liked" className="mt-0" />
              <TabsContent value="referenced" className="mt-0" />
            </Tabs>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search saved designs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 w-56 text-sm bg-white dark:bg-slate-900"
              />
            </div>

            {/* View toggle */}
            <div className="flex items-center bg-muted/50 dark:bg-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Count */}
            <p className="text-sm text-muted-foreground">
              {currentDesigns.length} design{currentDesigns.length !== 1 ? 's' : ''}
              {searchQuery.trim() && ' found'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Collection selector (only for saved tab) */}
            {activeTab === 'saved' && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 h-9">
                      <Folder className="w-4 h-4" />
                      {activeCollection
                        ? collections.find(c => c.id === activeCollection)?.name ?? 'All Collections'
                        : 'All Collections'}
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => setActiveCollection(null)}>
                      <Bookmark className="w-4 h-4 mr-2" />
                      <span className="flex-1">All Saved</span>
                      {!activeCollection && <Check className="w-3 h-3 text-[#fb8000]" />}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {collections.map(col => (
                      <DropdownMenuItem key={col.id} onClick={() => setActiveCollection(col.id)}>
                        <span className="mr-2">{col.emoji}</span>
                        <span className="flex-1">{col.name}</span>
                        <span className="text-xs text-muted-foreground mr-2">({col.designIds.length})</span>
                        {activeCollection === col.id && <Check className="w-3 h-3 text-[#fb8000]" />}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setCreateDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      New Collection
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 h-9"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <FolderPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">New</span>
                </Button>
              </>
            )}

            {/* Clear All */}
            {((activeTab === 'saved' && savedDesigns.length > 0) ||
              (activeTab === 'liked' && likedDesigns.length > 0) ||
              (activeTab === 'referenced' && referencedDesigns.length > 0)) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-red-500 h-9"
                onClick={() => {
                  const setter = activeTab === 'saved' ? setSavedIds : activeTab === 'liked' ? setLikedIds : setReferencedIds
                  setter({})
                }}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Collections strip (only for saved tab) */}
        {activeTab === 'saved' && collections.length > 0 && (
          <div className="space-y-3 mb-6">
            {/* Sort bar */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Collections</span>
              <div className="flex-1" />
              <div className="flex items-center gap-1 bg-muted/50 dark:bg-slate-800 rounded-lg p-0.5">
                {(['name', 'date', 'count'] as const).map((sort) => (
                  <button
                    key={sort}
                    onClick={() => setCollectionSort(sort)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${
                      collectionSort === sort
                        ? 'bg-white dark:bg-slate-700 shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {sort === 'name' ? 'Name' : sort === 'date' ? 'Recent' : 'Items'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              <button
                onClick={() => setActiveCollection(null)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  !activeCollection
                    ? 'bg-[#fb8000] text-white shadow-md shadow-orange-200/50'
                    : 'bg-white dark:bg-slate-800 text-muted-foreground hover:text-foreground border border-border dark:border-slate-700'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                All Saved ({savedDesigns.length})
              </button>
              {[...collections].sort((a, b) => {
                if (collectionSort === 'name') return a.name.localeCompare(b.name)
                if (collectionSort === 'count') return b.designIds.length - a.designIds.length
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
              }).map(col => {
                const gradientCss = COLLECTION_GRADIENT_CSS[col.gradient] || COLLECTION_GRADIENT_CSS[COLLECTION_GRADIENTS[0]]
                const isActive = activeCollection === col.id
                return (
                  <div key={col.id} className="relative group/col">
                    <button
                      onClick={() => setActiveCollection(isActive ? null : col.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                        isActive
                          ? 'text-white shadow-md'
                          : 'bg-white dark:bg-slate-800 text-muted-foreground hover:text-foreground border border-border dark:border-slate-700'
                      }`}
                      style={isActive ? { background: gradientCss } : undefined}
                    >
                      {/* Mini mosaic indicator */}
                      {col.designIds.length > 0 && (
                        <div className="flex -space-x-1">
                          {col.designIds.slice(0, 3).map((dId, idx) => {
                            const d = savedDesignData[dId]
                            return d ? (
                              <div key={dId} className="w-4 h-4 rounded-sm overflow-hidden border border-white dark:border-slate-700">
                                <img src={d.image} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                              </div>
                            ) : <div key={idx} className="w-4 h-4 rounded-sm bg-muted" />
                          })}
                        </div>
                      )}
                      <span>{col.emoji}</span>
                      {col.name}
                      <span className="text-xs opacity-70">({col.designIds.length})</span>
                    </button>
                    {/* Delete collection button */}
                    {!DEFAULT_COLLECTIONS.find(dc => dc.id === col.id) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteCollection(col.id); }}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/col:opacity-100 transition-opacity"
                        aria-label="Delete collection"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Designs */}
        {renderDesigns(currentDesigns, currentRemoveHandler)}
      </div>

      {/* Create Collection Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-[#fb8000]" />
              Create New Collection
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Collection Emoji</label>
              <div className="flex gap-2 flex-wrap">
                {['📁', '❤️', '✨', '📌', '🎯', '💡', '🎨', '🔥', '⭐', '💼', '🌟', '🎬'].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setNewCollectionEmoji(emoji)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${
                      newCollectionEmoji === emoji
                        ? 'bg-[#fb8000]/10 ring-2 ring-[#fb8000] scale-110'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Collection Name</label>
              <Input
                placeholder="e.g., Work Projects, Brand Ideas..."
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreateCollection}
              disabled={!newCollectionName.trim()}
              className="gradient-orange gradient-orange-hover text-white border-0"
            >
              Create Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
