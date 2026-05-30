'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, LayoutGrid, List, FolderOpen, Globe, Lock,
  Pencil, Trash2, Share2, ArrowLeft, X, Eye, Heart, Clock,
  FolderPlus, GripVertical, Users, DollarSign, ArrowUpDown,
  Image as ImageIcon, ExternalLink, ChevronDown, Package, Sparkles
} from 'lucide-react'
import { useNavStore } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

/* ─── Types ─── */
interface DesignItem {
  id: string
  title: string
  category: string
  designerName: string
  likeCount: number
  price: number
  isFree: boolean
  image: string
}

interface Collection {
  id: string
  name: string
  description: string
  coverGradient: string
  isPublic: boolean
  designIds: string[]
  createdAt: string
  updatedAt: string
  sharedWith: number
  emoji?: string
}

/* ─── 6 Gradient presets for create dialog ─── */
const CREATE_GRADIENT_PRESETS = [
  { key: 'orange', gradient: 'from-orange-500 to-amber-400', css: 'linear-gradient(135deg, #f97316, #fbbf24)' },
  { key: 'blue', gradient: 'from-sky-500 to-cyan-400', css: 'linear-gradient(135deg, #0ea5e9, #22d3ee)' },
  { key: 'purple', gradient: 'from-violet-500 to-purple-400', css: 'linear-gradient(135deg, #8b5cf6, #c084fc)' },
  { key: 'green', gradient: 'from-emerald-500 to-teal-400', css: 'linear-gradient(135deg, #10b981, #2dd4bf)' },
  { key: 'pink', gradient: 'from-rose-500 to-pink-400', css: 'linear-gradient(135deg, #f43f5e, #f472b6)' },
  { key: 'cyan', gradient: 'from-cyan-500 to-sky-400', css: 'linear-gradient(135deg, #06b6d4, #38bdf8)' },
]

/* ─── Full gradient presets (for edit dialog) ─── */
const GRADIENT_PRESETS = [
  'from-orange-500 to-amber-400',
  'from-rose-500 to-pink-400',
  'from-violet-500 to-purple-400',
  'from-emerald-500 to-teal-400',
  'from-sky-500 to-cyan-400',
  'from-red-500 to-orange-400',
  'from-cyan-500 to-sky-400',
  'from-fuchsia-500 to-pink-400',
]

const GRADIENT_CSS: Record<string, string> = {
  'from-orange-500 to-amber-400': 'linear-gradient(135deg, #f97316, #fbbf24)',
  'from-rose-500 to-pink-400': 'linear-gradient(135deg, #f43f5e, #f472b6)',
  'from-violet-500 to-purple-400': 'linear-gradient(135deg, #8b5cf6, #c084fc)',
  'from-emerald-500 to-teal-400': 'linear-gradient(135deg, #10b981, #2dd4bf)',
  'from-sky-500 to-cyan-400': 'linear-gradient(135deg, #0ea5e9, #22d3ee)',
  'from-red-500 to-orange-400': 'linear-gradient(135deg, #ef4444, #fb923c)',
  'from-cyan-500 to-sky-400': 'linear-gradient(135deg, #06b6d4, #38bdf8)',
  'from-fuchsia-500 to-pink-400': 'linear-gradient(135deg, #d946ef, #f472b6)',
}

/* ─── Design data ─── */
const designData: Record<string, DesignItem> = {
  'sample-1': { id: 'sample-1', title: 'Modern Brand Identity', category: 'Logo Design', designerName: 'Sarah Chen', likeCount: 342, price: 29, isFree: false, image: '/designs/brand-identity.png' },
  'sample-2': { id: 'sample-2', title: 'Minimal Logo Pack', category: 'Logo Design', designerName: 'Alex Rivera', likeCount: 215, price: 0, isFree: true, image: '/designs/logo-pack.png' },
  'sample-3': { id: 'sample-3', title: 'Social Media Kit', category: 'Social Media', designerName: 'Maya Patel', likeCount: 189, price: 19, isFree: false, image: '/designs/social-media-kit.png' },
  'sample-4': { id: 'sample-4', title: 'App UI Template', category: 'UI/UX', designerName: 'James Wilson', likeCount: 456, price: 49, isFree: false, image: '/designs/app-ui.png' },
  'sample-5': { id: 'sample-5', title: 'Poster Collection', category: 'Print Design', designerName: 'Luna Kim', likeCount: 278, price: 0, isFree: true, image: '/designs/poster-collection.png' },
  'sample-6': { id: 'sample-6', title: 'Icon Set Premium', category: 'Icons', designerName: 'Omar Hassan', likeCount: 134, price: 15, isFree: false, image: '/designs/icon-set.png' },
  'sample-7': { id: 'sample-7', title: 'Business Card Template', category: 'Print Design', designerName: 'Emma Torres', likeCount: 97, price: 0, isFree: true, image: '/designs/business-card.png' },
  'sample-8': { id: 'sample-8', title: 'Website Hero Bundle', category: 'UI/UX', designerName: 'David Park', likeCount: 521, price: 39, isFree: false, image: '/designs/hero-bundle.png' },
}

function getDesignById(id: string): DesignItem | undefined {
  if (designData[id]) return designData[id]
  const idx = Math.abs(id.split('').reduce((a, c) => a + c.charCodeAt(0), 0))
  const titles = ['Creative Pack', 'Design System', 'Motion Kit', 'Brand Guide', 'Illustration Set']
  const categories = ['Logo Design', 'UI/UX', 'Illustrations', 'Typography', '3D Design']
  const designers = ['Sarah Chen', 'Alex Rivera', 'Maya Patel', 'James Wilson', 'Luna Kim']
  const images = Object.values(designData).map(d => d.image)
  return {
    id,
    title: titles[idx % titles.length],
    category: categories[idx % categories.length],
    designerName: designers[idx % designers.length],
    likeCount: (idx % 500) + 20,
    price: idx % 3 === 0 ? 0 : (idx % 50) + 5,
    isFree: idx % 3 === 0,
    image: images[idx % images.length],
  }
}

/* ─── Default collections ─── */
const DEFAULT_COLLECTIONS: Collection[] = [
  {
    id: 'col-favorites',
    name: 'Favorites',
    description: 'Your all-time favorite designs in one place',
    coverGradient: 'from-orange-500 to-amber-400',
    isPublic: false,
    designIds: ['sample-1', 'sample-4', 'sample-8'],
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    sharedWith: 2,
    emoji: '❤️',
  },
  {
    id: 'col-brand-kits',
    name: 'Brand Kits',
    description: 'Complete brand identity and logo collections',
    coverGradient: 'from-violet-500 to-purple-400',
    isPublic: true,
    designIds: ['sample-2', 'sample-7'],
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    sharedWith: 0,
    emoji: '💼',
  },
  {
    id: 'col-ui-inspiration',
    name: 'UI Inspiration',
    description: 'Beautiful UI designs and templates for reference',
    coverGradient: 'from-sky-500 to-cyan-400',
    isPublic: true,
    designIds: ['sample-3', 'sample-5', 'sample-6'],
    createdAt: new Date(Date.now() - 21 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    sharedWith: 3,
    emoji: '🎨',
  },
]

/* ─── localStorage helpers ─── */
const STORAGE_KEY = 'dc_collections'

function loadCollections(): Collection[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((col: Record<string, unknown>) => ({
          id: col.id as string || `col-${Date.now()}`,
          name: col.name as string || 'Untitled',
          description: col.description as string || '',
          coverGradient: col.coverGradient as string || GRADIENT_PRESETS[0],
          isPublic: col.isPublic as boolean ?? false,
          designIds: col.designIds as string[] || [],
          createdAt: col.createdAt as string || new Date().toISOString(),
          updatedAt: col.updatedAt as string || new Date().toISOString(),
          sharedWith: (col.sharedWith as number) || 0,
          emoji: col.emoji as string | undefined,
        }))
      }
    }
  } catch { /* ignore */ }
  return DEFAULT_COLLECTIONS
}

function saveCollections(collections: Collection[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collections))
  } catch { /* ignore */ }
}

/* ─── Time helpers ─── */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

function daysAgo(dateStr: string): number {
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.floor(diff / 86400000)
}

/* ─── Main Component ─── */
export default function CollectionsPage() {
  const navigateTo = useNavStore((s) => s.navigateTo)
  const setSelectedDesignId = useNavStore((s) => s.setSelectedDesignId)

  // Collections state
  const [collections, setCollections] = useState<Collection[]>(loadCollections)
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<string>('recent')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Create dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newGradient, setNewGradient] = useState(CREATE_GRADIENT_PRESETS[0].gradient)
  const [newIsPublic, setNewIsPublic] = useState(false)

  // Edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editGradient, setEditGradient] = useState(GRADIENT_PRESETS[0])
  const [editIsPublic, setEditIsPublic] = useState(false)

  // Drag state (visual only)
  const [dragId, setDragId] = useState<string | null>(null)

  // Persist collections on change
  useEffect(() => {
    saveCollections(collections)
  }, [collections])

  // Active collection
  const activeCollection = useMemo(
    () => collections.find(c => c.id === activeCollectionId) || null,
    [collections, activeCollectionId]
  )

  // Filtered & sorted collections
  const filteredCollections = useMemo(() => {
    let result = collections
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      )
    }
    switch (sortBy) {
      case 'name-az':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-za':
        result = [...result].sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'newest':
        result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'most-items':
        result = [...result].sort((a, b) => b.designIds.length - a.designIds.length)
        break
      case 'recently-updated':
        result = [...result].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        break
      case 'recent':
      default:
        result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }
    return result
  }, [collections, searchQuery, sortBy])

  // Global stats
  const totalDesigns = useMemo(
    () => new Set(collections.flatMap(c => c.designIds)).size,
    [collections]
  )
  const totalValue = useMemo(
    () => collections.reduce((sum, c) => {
      return sum + c.designIds.reduce((s, id) => {
        const d = getDesignById(id)
        return s + (d ? d.price : 0)
      }, 0)
    }, 0),
    [collections]
  )
  const mostPopularCategory = useMemo(() => {
    const cats: Record<string, number> = {}
    collections.forEach(c =>
      c.designIds.forEach(id => {
        const design = getDesignById(id)
        if (design) {
          cats[design.category] = (cats[design.category] || 0) + 1
        }
      })
    )
    const entries = Object.entries(cats)
    if (entries.length === 0) return 'N/A'
    return entries.sort((a, b) => b[1] - a[1])[0][0]
  }, [collections])

  // Per-collection helpers
  function getCollectionValue(col: Collection): number {
    return col.designIds.reduce((sum, id) => {
      const d = getDesignById(id)
      return sum + (d ? d.price : 0)
    }, 0)
  }

  // CRUD handlers
  const handleCreate = useCallback(() => {
    if (!newName.trim()) return
    const now = new Date().toISOString()
    const newCol: Collection = {
      id: `col-${Date.now()}`,
      name: newName.trim(),
      description: newDescription.trim(),
      coverGradient: newGradient,
      isPublic: newIsPublic,
      designIds: [],
      createdAt: now,
      updatedAt: now,
      sharedWith: 0,
    }
    setCollections(prev => [...prev, newCol])
    setNewName('')
    setNewDescription('')
    setNewGradient(CREATE_GRADIENT_PRESETS[0].gradient)
    setNewIsPublic(false)
    setCreateDialogOpen(false)
  }, [newName, newDescription, newGradient, newIsPublic])

  const handleEdit = useCallback(() => {
    if (!editId || !editName.trim()) return
    setCollections(prev =>
      prev.map(c =>
        c.id === editId
          ? { ...c, name: editName.trim(), description: editDescription.trim(), coverGradient: editGradient, isPublic: editIsPublic, updatedAt: new Date().toISOString() }
          : c
      )
    )
    setEditDialogOpen(false)
    setEditId(null)
  }, [editId, editName, editDescription, editGradient, editIsPublic])

  const handleDelete = useCallback((id: string) => {
    setCollections(prev => prev.filter(c => c.id !== id))
    if (activeCollectionId === id) setActiveCollectionId(null)
  }, [activeCollectionId])

  const handleShare = useCallback((col: Collection) => {
    const text = `Check out my collection "${col.name}" on DesignConnect! ${col.designIds.length} designs included.`
    if (navigator.share) {
      navigator.share({ title: col.name, text }).catch(() => { /* ignore */ })
    } else {
      navigator.clipboard.writeText(text).then(() => {
        // Simple feedback
      }).catch(() => { /* ignore */ })
    }
  }, [])

  const handleRemoveDesign = useCallback((collectionId: string, designId: string) => {
    setCollections(prev =>
      prev.map(c =>
        c.id === collectionId
          ? { ...c, designIds: c.designIds.filter(id => id !== designId), updatedAt: new Date().toISOString() }
          : c
      )
    )
  }, [])

  const openEditDialog = useCallback((col: Collection) => {
    setEditId(col.id)
    setEditName(col.name)
    setEditDescription(col.description)
    setEditGradient(col.coverGradient)
    setEditIsPublic(col.isPublic)
    setEditDialogOpen(true)
  }, [])

  // Visual drag-and-drop reorder
  const handleDragStart = useCallback((id: string) => {
    setDragId(id)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!dragId || dragId === targetId) return
    setCollections(prev => {
      const dragIdx = prev.findIndex(c => c.id === dragId)
      const targetIdx = prev.findIndex(c => c.id === targetId)
      if (dragIdx === -1 || targetIdx === -1) return prev
      const next = [...prev]
      const [removed] = next.splice(dragIdx, 1)
      next.splice(targetIdx, 0, removed)
      return next
    })
  }, [dragId])

  const handleDragEnd = useCallback(() => {
    setDragId(null)
  }, [])

  // Navigate to design detail
  const goToDesign = useCallback((designId: string) => {
    setSelectedDesignId(designId)
    navigateTo('design-detail')
  }, [navigateTo, setSelectedDesignId])

  /* ─── Render cover mosaic ─── */
  function renderCoverMosaic(col: Collection, size: 'sm' | 'lg' = 'sm') {
    const designs = col.designIds.slice(0, 4).map(getDesignById).filter(Boolean) as DesignItem[]
    const gradientCss = GRADIENT_CSS[col.coverGradient] || GRADIENT_CSS[GRADIENT_PRESETS[0]]

    if (designs.length === 0) {
      return (
        <div
          className={`w-full ${size === 'lg' ? 'h-52' : 'h-40'} rounded-t-2xl flex items-center justify-center`}
          style={{ background: gradientCss }}
        >
          <FolderOpen className="w-12 h-12 text-white/40" />
        </div>
      )
    }

    if (designs.length === 1) {
      return (
        <div className={`w-full ${size === 'lg' ? 'h-52' : 'h-40'} rounded-t-2xl overflow-hidden relative`}>
          <img src={designs[0].image} alt={designs[0].title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
      )
    }

    // 2x2 grid mosaic
    return (
      <div className={`w-full ${size === 'lg' ? 'h-52' : 'h-40'} rounded-t-2xl overflow-hidden grid grid-cols-2 grid-rows-2 gap-0.5`}>
        {designs.map((design, i) => (
          <div key={design.id} className="relative overflow-hidden">
            <img
              src={design.image}
              alt={design.title}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            {i === 3 && col.designIds.length > 4 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                <span className="text-white font-bold text-lg">+{col.designIds.length - 4}</span>
              </div>
            )}
          </div>
        ))}
        {/* Fill empty cells with gradient */}
        {Array.from({ length: 4 - designs.length }).map((_, i) => (
          <div key={`empty-${i}`} className="flex items-center justify-center" style={{ background: gradientCss }}>
            <Sparkles className="w-4 h-4 text-white/30" />
          </div>
        ))}
      </div>
    )
  }

  /* ─── Render collection card ─── */
  function renderCollectionCard(col: Collection, i: number) {
    const value = getCollectionValue(col)
    return (
      <motion.div
        key={col.id}
        layout
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        draggable
        onDragStart={() => handleDragStart(col.id)}
        onDragOver={(e) => handleDragOver(e, col.id)}
        onDragEnd={handleDragEnd}
        className={dragId === col.id ? 'opacity-50' : ''}
      >
        <Card className="group cursor-pointer overflow-hidden border border-white/20 dark:border-slate-700/50 shadow-sm hover:shadow-xl dark:shadow-slate-900/30 dark:hover:shadow-slate-900/50 transition-all duration-300 hover:-translate-y-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          {/* Cover Mosaic */}
          <div
            className="relative"
            onClick={() => setActiveCollectionId(col.id)}
          >
            {renderCoverMosaic(col)}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-t-2xl" />

            {/* Badges row */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              {/* Visibility badge */}
              <Badge className={`backdrop-blur-md text-xs border-0 px-2 py-0.5 ${col.isPublic ? 'bg-emerald-500/80 text-white' : 'bg-slate-700/80 text-white'}`}>
                {col.isPublic ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                {col.isPublic ? 'Public' : 'Private'}
              </Badge>

              {/* Items count */}
              <Badge className="bg-black/60 text-white border-0 backdrop-blur-md text-xs px-2 py-0.5">
                <Package className="w-3 h-3 mr-1" />
                {col.designIds.length} item{col.designIds.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            {/* Shared badge (if > 0) */}
            {col.sharedWith > 0 && (
              <Badge className="absolute bottom-3 left-3 bg-blue-500/80 text-white border-0 backdrop-blur-md text-xs px-2 py-0.5">
                <Users className="w-3 h-3 mr-1" />
                Shared with {col.sharedWith}
              </Badge>
            )}

            {/* Hover action buttons */}
            <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={(e) => { e.stopPropagation(); openEditDialog(col) }}
                className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                aria-label="Edit collection"
              >
                <Pencil className="w-3.5 h-3.5 text-foreground" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(col.id) }}
                className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md flex items-center justify-center shadow-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                aria-label="Delete collection"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleShare(col) }}
                className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                aria-label="Share collection"
              >
                <Share2 className="w-3.5 h-3.5 text-foreground" />
              </button>
            </div>
          </div>

          {/* Card content */}
          <CardContent className="p-4">
            <h3
              className="font-semibold text-base line-clamp-1 mb-1.5 group-hover:text-[#fb8000] transition-colors cursor-pointer"
              onClick={() => setActiveCollectionId(col.id)}
            >
              {col.emoji && <span className="mr-1.5">{col.emoji}</span>}
              {col.name}
            </h3>
            {col.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{col.description}</p>
            )}

            {/* Per-collection stats row */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {daysAgo(col.updatedAt) === 0 ? 'Updated today' : `Updated ${daysAgo(col.updatedAt)}d ago`}
              </span>
              {value > 0 && (
                <span className="flex items-center gap-1 text-[#fb8000] font-medium">
                  <DollarSign className="w-3 h-3" />
                  ${value}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  /* ─── Render collection list item ─── */
  function renderCollectionListItem(col: Collection, i: number) {
    const gradientCss = GRADIENT_CSS[col.coverGradient] || GRADIENT_CSS[GRADIENT_PRESETS[0]]
    const value = getCollectionValue(col)
    return (
      <motion.div
        key={col.id}
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
        draggable
        onDragStart={() => handleDragStart(col.id)}
        onDragOver={(e) => handleDragOver(e, col.id)}
        onDragEnd={handleDragEnd}
        className={dragId === col.id ? 'opacity-50' : ''}
      >
        <Card className="group overflow-hidden border border-white/20 dark:border-slate-700/50 shadow-sm hover:shadow-md dark:shadow-slate-900/30 dark:hover:shadow-slate-900/50 transition-all bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-4 p-4">
            {/* Grip handle */}
            <div className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors">
              <GripVertical className="w-4 h-4" />
            </div>

            {/* Gradient thumbnail */}
            <div
              className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center cursor-pointer"
              style={{ background: gradientCss }}
              onClick={() => setActiveCollectionId(col.id)}
            >
              {col.emoji ? (
                <span className="text-2xl">{col.emoji}</span>
              ) : (
                <FolderOpen className="w-6 h-6 text-white/70" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setActiveCollectionId(col.id)}>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-[#fb8000] transition-colors">
                  {col.name}
                </h3>
                <Badge variant="outline" className={`text-[10px] h-5 ${col.isPublic ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'border-slate-400/30 text-muted-foreground'}`}>
                  {col.isPublic ? <Globe className="w-2.5 h-2.5 mr-1" /> : <Lock className="w-2.5 h-2.5 mr-1" />}
                  {col.isPublic ? 'Public' : 'Private'}
                </Badge>
                {col.sharedWith > 0 && (
                  <Badge variant="outline" className="text-[10px] h-5 border-blue-500/30 text-blue-600 dark:text-blue-400">
                    <Users className="w-2.5 h-2.5 mr-1" />
                    Shared
                  </Badge>
                )}
              </div>
              {col.description && (
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{col.description}</p>
              )}
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {col.designIds.length} designs</span>
                {value > 0 && (
                  <span className="flex items-center gap-1 text-[#fb8000] font-medium"><DollarSign className="w-3 h-3" /> ${value}</span>
                )}
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {timeAgo(col.updatedAt)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-[#fb8000]"
                onClick={(e) => { e.stopPropagation(); openEditDialog(col) }}
                aria-label="Edit"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                onClick={(e) => { e.stopPropagation(); handleDelete(col.id) }}
                aria-label="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

  /* ─── Render collection detail view ─── */
  function renderDetailView() {
    if (!activeCollection) return null
    const gradientCss = GRADIENT_CSS[activeCollection.coverGradient] || GRADIENT_CSS[GRADIENT_PRESETS[0]]
    const designs = activeCollection.designIds.map(getDesignById).filter(Boolean) as DesignItem[]
    const totalVal = designs.reduce((sum, d) => sum + d.price, 0)
    const freeCount = designs.filter(d => d.isFree).length

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Cover banner with mosaic */}
        <div className="relative h-52 sm:h-64 rounded-2xl overflow-hidden mb-6">
          {/* Mosaic background */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5">
            {designs.slice(0, 4).map((design) => (
              <div key={design.id} className="overflow-hidden">
                <img
                  src={design.image}
                  alt={design.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>
            ))}
            {designs.length === 0 && (
              <>
                <div style={{ background: gradientCss }} />
                <div style={{ background: gradientCss }} />
                <div style={{ background: gradientCss }} />
                <div style={{ background: gradientCss }} />
              </>
            )}
            {designs.length > 0 && designs.length < 4 && Array.from({ length: 4 - Math.min(designs.length, 4) }).map((_, i) => (
              <div key={`fill-${i}`} style={{ background: gradientCss }} />
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

          {/* Decorative shapes */}
          <div className="absolute top-4 right-8 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute bottom-4 left-12 w-28 h-28 rounded-full bg-white/5 blur-xl" />

          <div className="absolute inset-0 flex items-end p-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-white/20 text-white border-0 backdrop-blur-md">
                  {activeCollection.isPublic ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                  {activeCollection.isPublic ? 'Public' : 'Private'}
                </Badge>
                {activeCollection.sharedWith > 0 && (
                  <Badge className="bg-blue-500/30 text-white border-0 backdrop-blur-md">
                    <Users className="w-3 h-3 mr-1" />
                    Shared with {activeCollection.sharedWith}
                  </Badge>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {activeCollection.emoji && <span className="mr-2">{activeCollection.emoji}</span>}
                {activeCollection.name}
              </h2>
              {activeCollection.description && (
                <p className="text-white/80 text-sm line-clamp-2 max-w-lg">{activeCollection.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 text-white hover:bg-white/30 border-0 backdrop-blur-md gap-1"
                onClick={() => openEditDialog(activeCollection)}
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 text-white hover:bg-red-500/40 border-0 backdrop-blur-md gap-1"
                onClick={() => handleDelete(activeCollection.id)}
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 text-white hover:bg-white/30 border-0 backdrop-blur-md gap-1"
                onClick={() => handleShare(activeCollection)}
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </Button>
            </div>
          </div>
        </div>

        {/* Stats row with glassmorphism */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card className="border border-white/20 dark:border-slate-700/50 shadow-sm bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 rounded-lg gradient-orange flex items-center justify-center mx-auto mb-2">
                <Package className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#fb8000]">{designs.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Designs</p>
            </CardContent>
          </Card>
          <Card className="border border-white/20 dark:border-slate-700/50 shadow-sm bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center mx-auto mb-2">
                <Eye className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#fb8000]">{freeCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Free Designs</p>
            </CardContent>
          </Card>
          <Card className="border border-white/20 dark:border-slate-700/50 shadow-sm bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center mx-auto mb-2">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#fb8000]">${totalVal}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total Value</p>
            </CardContent>
          </Card>
          <Card className="border border-white/20 dark:border-slate-700/50 shadow-sm bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center mx-auto mb-2">
                <Users className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#fb8000]">{activeCollection.sharedWith}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Collaborators</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-dashed"
              onClick={() => navigateTo('browse')}
            >
              <FolderPlus className="w-4 h-4" /> Add Designs
            </Button>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <GripVertical className="w-3 h-3" /> Drag to reorder items
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setActiveCollectionId(null)}
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Collections
          </Button>
        </div>

        {/* Designs grid */}
        {designs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 rounded-2xl gradient-orange flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
              <ImageIcon className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No designs yet</h3>
            <p className="text-muted-foreground text-sm text-center max-w-xs mb-4">
              Add some designs to this collection from the browse page
            </p>
            <Button
              className="gradient-orange gradient-orange-hover text-white border-0 gap-2"
              onClick={() => navigateTo('browse')}
            >
              <ExternalLink className="w-4 h-4" /> Browse Designs
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <AnimatePresence mode="popLayout">
                {designs.map((design, i) => (
                  <motion.div
                    key={design.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    draggable
                    onDragStart={() => handleDragStart(design.id)}
                    onDragOver={(e) => {
                      e.preventDefault()
                      if (!dragId || dragId === design.id) return
                      setCollections(prev => prev.map(c => {
                        if (c.id !== activeCollection.id) return c
                        const ids = [...c.designIds]
                        const fromIdx = ids.indexOf(dragId)
                        const toIdx = ids.indexOf(design.id)
                        if (fromIdx === -1 || toIdx === -1) return c
                        const [removed] = ids.splice(fromIdx, 1)
                        ids.splice(toIdx, 0, removed)
                        return { ...c, designIds: ids }
                      }))
                    }}
                    onDragEnd={handleDragEnd}
                  >
                    <Card className="group cursor-pointer overflow-hidden border border-white/20 dark:border-slate-700/50 shadow-sm hover:shadow-lg dark:shadow-slate-900/30 dark:hover:shadow-slate-900/50 transition-all duration-300 hover:-translate-y-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <div className="aspect-[4/3] relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={design.image}
                          alt={design.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        {design.isFree && (
                          <Badge className="absolute top-3 left-3 bg-green-500 text-white border-0 text-xs shadow-sm shadow-green-500/20">Free</Badge>
                        )}
                        {/* Remove button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveDesign(activeCollection.id, design.id)
                          }}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-red-50 dark:hover:bg-red-900/50 flex items-center justify-center shadow-sm transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
                          aria-label="Remove from collection"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                        {/* Drag handle */}
                        <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="flex items-center gap-1 text-[10px] bg-black/50 text-white px-2 py-1 rounded-full backdrop-blur-sm">
                            <GripVertical className="w-3 h-3" /> Drag to reorder
                          </span>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3
                          className="font-semibold text-sm line-clamp-1 mb-1 cursor-pointer hover:text-[#fb8000] transition-colors"
                          onClick={() => goToDesign(design.id)}
                        >
                          {design.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2">{design.designerName}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" /> {design.likeCount}
                            </span>
                          </div>
                          {!design.isFree ? (
                            <span className="font-semibold text-sm text-[#fb8000]">${design.price}</span>
                          ) : (
                            <span className="font-medium text-sm text-green-500">Free</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Total value footer */}
            <div className="mt-8 p-4 rounded-xl border border-white/20 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg gradient-orange flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">Collection Value</p>
                  <p className="text-xs text-muted-foreground">{designs.length} designs &middot; {freeCount} free</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-[#fb8000]">${totalVal}</p>
            </div>
          </>
        )}
      </motion.div>
    )
  }

  /* ─── Main render ─── */
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      {/* Header with dot-grid background and gradient */}
      <div className="relative bg-gradient-to-br from-white via-orange-50/30 to-amber-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border-b border-border/50 dark:border-slate-800 overflow-hidden">
        {/* Dot-grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fb8000 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Decorative blurred shapes */}
        <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full bg-orange-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-amber-400/10 blur-2xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold">
                  <span className="bg-gradient-to-r from-[#fb8000] to-[#e57600] bg-clip-text text-transparent">
                    My Collections
                  </span>
                </h1>
                <p className="text-muted-foreground mt-1">Organize and manage your saved designs</p>
              </div>
              <Button
                className="gradient-orange gradient-orange-hover text-white border-0 gap-2 px-6 shadow-lg shadow-orange-500/20"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="w-4 h-4" /> Create Collection
              </Button>
            </div>

            {/* Stats row with glassmorphism */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/40 dark:border-slate-700/40 shadow-sm">
                <div className="w-10 h-10 rounded-lg gradient-orange flex items-center justify-center flex-shrink-0">
                  <FolderOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold">{collections.length}</p>
                  <p className="text-xs text-muted-foreground">Collections</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/40 dark:border-slate-700/40 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold">{totalDesigns}</p>
                  <p className="text-xs text-muted-foreground">Designs Saved</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/40 dark:border-slate-700/40 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-rose-500 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold">${totalValue}</p>
                  <p className="text-xs text-muted-foreground">Total Value</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/40 dark:border-slate-700/40 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-rose-500 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-sm leading-6">{mostPopularCategory}</p>
                  <p className="text-xs text-muted-foreground">Top Category</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeCollection ? (
            <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderDetailView()}
            </motion.div>
          ) : (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search collections..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 w-56 text-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-white/40 dark:border-slate-700/40"
                    />
                  </div>

                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-9 w-48 text-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-white/40 dark:border-slate-700/40">
                      <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Newest</SelectItem>
                      <SelectItem value="name-az">Name A-Z</SelectItem>
                      <SelectItem value="name-za">Name Z-A</SelectItem>
                      <SelectItem value="most-items">Most Items</SelectItem>
                      <SelectItem value="recently-updated">Recently Updated</SelectItem>
                    </SelectContent>
                  </Select>

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
                    {filteredCollections.length} collection{filteredCollections.length !== 1 ? 's' : ''}
                    {searchQuery.trim() && ' found'}
                  </p>
                </div>
              </div>

              {/* Collections */}
              {filteredCollections.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-24 px-4">
                  <div className="w-24 h-24 rounded-3xl gradient-orange flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20">
                    <FolderOpen className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No collections yet</h3>
                  <p className="text-muted-foreground text-sm max-w-xs text-center mb-6">
                    Start organizing your saved designs into collections
                  </p>
                  <Button
                    className="gradient-orange gradient-orange-hover text-white border-0 gap-2 px-6"
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4" /> Create Collection
                  </Button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <AnimatePresence mode="popLayout">
                    {filteredCollections.map((col, i) => renderCollectionCard(col, i))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {filteredCollections.map((col, i) => renderCollectionListItem(col, i))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Collection Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-[#fb8000]" />
              Create New Collection
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4">
            {/* Left: Form fields */}
            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Collection Name</label>
                <Input
                  placeholder="e.g., Favorites, Brand Kits..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Description</label>
                <Textarea
                  placeholder="What's this collection about?"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Color theme selector - 6 gradient presets */}
              <div>
                <label className="text-sm font-medium mb-2 block">Color Theme</label>
                <div className="grid grid-cols-6 gap-2">
                  {CREATE_GRADIENT_PRESETS.map((preset) => (
                    <button
                      key={preset.key}
                      onClick={() => setNewGradient(preset.gradient)}
                      className={`h-10 rounded-xl transition-all duration-200 ${
                        newGradient === preset.gradient ? 'ring-2 ring-[#fb8000] ring-offset-2 dark:ring-offset-slate-900 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ background: preset.css }}
                      aria-label={`Select ${preset.key} gradient`}
                    />
                  ))}
                </div>
              </div>

              {/* Visibility */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 dark:bg-slate-800">
                <div className="flex items-center gap-3">
                  {newIsPublic ? (
                    <Globe className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {newIsPublic ? 'Public' : 'Private'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {newIsPublic ? 'Anyone can view this collection' : 'Only you can see this collection'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={newIsPublic}
                  onCheckedChange={setNewIsPublic}
                />
              </div>
            </div>

            {/* Right: Live preview card */}
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Preview
              </label>
              <Card className="overflow-hidden border border-white/20 dark:border-slate-700/50 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                {/* Cover preview */}
                <div
                  className="h-32 flex items-center justify-center relative"
                  style={{ background: GRADIENT_CSS[newGradient] }}
                >
                  <div className="absolute inset-0 bg-black/10" />
                  {newName.trim() ? (
                    <span className="relative text-white font-semibold text-lg drop-shadow-md">
                      {newName}
                    </span>
                  ) : (
                    <FolderOpen className="relative w-10 h-10 text-white/40" />
                  )}
                  {/* Badges */}
                  <Badge className={`absolute top-2 left-2 backdrop-blur-md text-[10px] border-0 px-1.5 py-0 ${newIsPublic ? 'bg-emerald-500/80 text-white' : 'bg-slate-700/80 text-white'}`}>
                    {newIsPublic ? <Globe className="w-2.5 h-2.5 mr-0.5" /> : <Lock className="w-2.5 h-2.5 mr-0.5" />}
                    {newIsPublic ? 'Public' : 'Private'}
                  </Badge>
                  <Badge className="absolute top-2 right-2 bg-black/60 text-white border-0 backdrop-blur-md text-[10px] px-1.5 py-0">
                    <Package className="w-2.5 h-2.5 mr-0.5" /> 0 items
                  </Badge>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-1">
                    {newName || 'Collection Name'}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {newDescription || 'Add a description...'}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-2">
                    <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> Just now</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="gradient-orange gradient-orange-hover text-white border-0"
            >
              Create Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Collection Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-[#fb8000]" />
              Edit Collection
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            {/* Name */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Collection Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Description</label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Color theme selector */}
            <div>
              <label className="text-sm font-medium mb-2 block">Color Theme</label>
              <div className="grid grid-cols-4 gap-3">
                {GRADIENT_PRESETS.map((gradient) => (
                  <button
                    key={gradient}
                    onClick={() => setEditGradient(gradient)}
                    className={`h-12 rounded-xl transition-all duration-200 ${
                      editGradient === gradient ? 'ring-2 ring-[#fb8000] ring-offset-2 dark:ring-offset-slate-900 scale-105' : 'hover:scale-105'
                    }`}
                    style={{ background: GRADIENT_CSS[gradient] }}
                    aria-label="Select gradient theme"
                  />
                ))}
              </div>
            </div>

            {/* Visibility */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 dark:bg-slate-800">
              <div className="flex items-center gap-3">
                {editIsPublic ? (
                  <Globe className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {editIsPublic ? 'Public' : 'Private'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {editIsPublic ? 'Anyone can view this collection' : 'Only you can see this collection'}
                  </p>
                </div>
              </div>
              <Switch
                checked={editIsPublic}
                onCheckedChange={setEditIsPublic}
              />
            </div>

            {/* Cover preview */}
            <div>
              <label className="text-sm font-medium mb-2 block">Cover Preview</label>
              <div
                className="h-24 rounded-xl flex items-center justify-center relative overflow-hidden"
                style={{ background: GRADIENT_CSS[editGradient] }}
              >
                <div className="absolute inset-0 bg-black/10" />
                <span className="relative text-white/80 font-medium text-sm">
                  {editName || 'Collection Name'}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleEdit}
              disabled={!editName.trim()}
              className="gradient-orange gradient-orange-hover text-white border-0"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
