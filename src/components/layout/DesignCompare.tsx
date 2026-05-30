'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GitCompare, X, Check, ArrowRight, Crown,
  Heart, Download, Eye, Star, FileArchive, Trash2
} from 'lucide-react'
import { useNavStore } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'

// Same design image map as BrowsePage
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

// Fallback demo data for compare details
const designDetailsMap: Record<string, {
  title: string
  designer_name: string
  category: string
  is_free: boolean
  price: number
  like_count: number
  download_count: number
  view_count: number
  rating: number
  source_files: boolean
}> = {
  'sample-1': { title: 'Modern Brand Identity', designer_name: 'Sarah Chen', category: 'Logo Design', is_free: true, price: 0, like_count: 342, download_count: 890, view_count: 4200, rating: 4.8, source_files: true },
  'sample-2': { title: 'Minimal Logo Pack', designer_name: 'Alex Rivera', category: 'Logo Design', is_free: false, price: 29, like_count: 278, download_count: 456, view_count: 3100, rating: 4.5, source_files: true },
  'sample-3': { title: 'Social Media Kit', designer_name: 'Maya Patel', category: 'Social Media', is_free: false, price: 19, like_count: 198, download_count: 623, view_count: 2800, rating: 4.3, source_files: true },
  'sample-4': { title: 'App UI Template', designer_name: 'James Wilson', category: 'UI/UX', is_free: true, price: 0, like_count: 456, download_count: 1200, view_count: 5600, rating: 4.9, source_files: true },
  'sample-5': { title: 'Poster Collection', designer_name: 'Luna Kim', category: 'Print', is_free: false, price: 49, like_count: 167, download_count: 345, view_count: 2300, rating: 4.2, source_files: false },
  'sample-6': { title: 'Icon Set Premium', designer_name: 'Omar Hassan', category: 'Icons', is_free: false, price: 15, like_count: 523, download_count: 1560, view_count: 6200, rating: 4.7, source_files: true },
  'sample-7': { title: 'Business Card Template', designer_name: 'Sarah Chen', category: 'Print', is_free: true, price: 0, like_count: 234, download_count: 780, view_count: 3400, rating: 4.4, source_files: true },
  'sample-8': { title: 'Website Hero Bundle', designer_name: 'Alex Rivera', category: 'UI/UX', is_free: false, price: 39, like_count: 312, download_count: 890, view_count: 4100, rating: 4.6, source_files: true },
  'sample-9': { title: 'Typography Poster', designer_name: 'Maya Patel', category: 'Typography', is_free: false, price: 25, like_count: 145, download_count: 432, view_count: 2100, rating: 4.1, source_files: false },
  'sample-10': { title: '3D Illustration Pack', designer_name: 'James Wilson', category: '3D Design', is_free: false, price: 59, like_count: 389, download_count: 980, view_count: 4900, rating: 4.8, source_files: true },
  'sample-11': { title: 'Resume Template', designer_name: 'Luna Kim', category: 'Print', is_free: true, price: 0, like_count: 567, download_count: 2100, view_count: 7800, rating: 4.9, source_files: true },
  'sample-12': { title: 'Newsletter Template', designer_name: 'Omar Hassan', category: 'UI/UX', is_free: false, price: 35, like_count: 223, download_count: 670, view_count: 3600, rating: 4.5, source_files: true },
}

interface CompareItemProps {
  designId: string
  isWinner: Record<string, boolean>
  onRemove: () => void
  onViewDetails: () => void
}

function CompareItem({ designId, isWinner, onRemove, onViewDetails }: CompareItemProps) {
  const details = designDetailsMap[designId]
  const imageUrl = designImageMap[designId]

  if (!details) return null

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= Math.floor(rating)
                ? 'fill-[#fb8000] text-[#fb8000]'
                : star - 0.5 <= rating
                ? 'fill-[#fb8000]/50 text-[#fb8000]'
                : 'text-muted-foreground/30'
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">{rating}</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex-1 min-w-0"
    >
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl overflow-hidden border border-border/50 backdrop-blur-sm shadow-lg">
        {/* Image */}
        <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-orange-100 to-amber-50 dark:from-slate-700 dark:to-slate-800">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={details.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">
              🎨
            </div>
          )}
          {/* Remove button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/90 text-white hover:bg-red-600 transition-colors shadow-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          {/* Price badge */}
          <div className="absolute bottom-2 left-2">
            {details.is_free ? (
              <Badge className="bg-green-500 text-white border-0 shadow-md text-xs">
                Free
              </Badge>
            ) : (
              <Badge className="bg-orange-500 text-white border-0 shadow-md text-xs">
                ${details.price}
              </Badge>
            )}
          </div>
          {/* Winner banner */}
          {(isWinner.likes || isWinner.downloads || isWinner.views || isWinner.rating) && (
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute top-2 left-2 bg-[#fb8000] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1"
            >
              <Crown className="w-3 h-3" />
              Winner
            </motion.div>
          )}
        </div>

        {/* Details */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-sm line-clamp-1 dark:text-white">{details.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{details.designer_name}</p>
          </div>

          <Badge variant="secondary" className="text-xs">{details.category}</Badge>

          <Separator className="opacity-50" />

          {/* Stats */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Heart className="w-3.5 h-3.5" /> Likes
              </span>
              <div className="flex items-center gap-1.5">
                {isWinner.likes && <Crown className="w-3.5 h-3.5 text-[#fb8000]" />}
                <span className={`text-xs font-semibold ${isWinner.likes ? 'text-green-600 dark:text-green-400' : 'dark:text-white'}`}>
                  {details.like_count.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Download className="w-3.5 h-3.5" /> Downloads
              </span>
              <div className="flex items-center gap-1.5">
                {isWinner.downloads && <Crown className="w-3.5 h-3.5 text-[#fb8000]" />}
                <span className={`text-xs font-semibold ${isWinner.downloads ? 'text-green-600 dark:text-green-400' : 'dark:text-white'}`}>
                  {details.download_count.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Eye className="w-3.5 h-3.5" /> Views
              </span>
              <div className="flex items-center gap-1.5">
                {isWinner.views && <Crown className="w-3.5 h-3.5 text-[#fb8000]" />}
                <span className={`text-xs font-semibold ${isWinner.views ? 'text-green-600 dark:text-green-400' : 'dark:text-white'}`}>
                  {details.view_count.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Star className="w-3.5 h-3.5" /> Rating
              </span>
              <div className="flex items-center gap-1.5">
                {isWinner.rating && <Crown className="w-3.5 h-3.5 text-[#fb8000]" />}
                {renderStars(details.rating)}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileArchive className="w-3.5 h-3.5" /> Source Files
              </span>
              <div className="flex items-center gap-1.5">
                {details.source_files ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-xs text-green-600 dark:text-green-400">Included</span>
                  </>
                ) : (
                  <>
                    <X className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-xs text-red-500">Not included</span>
                  </>
                )}
              </div>
            </div>

            <Separator className="opacity-30" />

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Price</span>
              <span className={`text-sm font-bold ${details.is_free ? 'text-green-600 dark:text-green-400' : 'text-orange-500'}`}>
                {details.is_free ? 'Free' : `$${details.price}`}
              </span>
            </div>
          </div>

          <Separator className="opacity-50" />

          <Button
            onClick={onViewDetails}
            className="w-full bg-[#fb8000] hover:bg-[#e57300] text-white gap-2"
            size="sm"
          >
            View Details <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export default function DesignCompare() {
  const compareDesigns = useNavStore((s) => s.compareDesigns)
  const removeFromCompare = useNavStore((s) => s.removeFromCompare)
  const clearCompare = useNavStore((s) => s.clearCompare)
  const setSelectedDesignId = useNavStore((s) => s.setSelectedDesignId)
  const navigateTo = useNavStore((s) => s.navigateTo)

  const [open, setOpen] = useState(false)

  // Listen for custom event to open compare sheet
  useEffect(() => {
    const handleOpenCompare = () => {
      if (compareDesigns.length > 0) {
        setOpen(true)
      }
    }
    window.addEventListener('openCompare', handleOpenCompare)
    return () => window.removeEventListener('openCompare', handleOpenCompare)
  }, [compareDesigns.length])

  // Calculate winners between two designs
  const winnerMap = useMemo(() => {
    const result: Record<string, Record<string, boolean>> = {}

    if (compareDesigns.length !== 2) return result

    const [id1, id2] = compareDesigns
    const d1 = designDetailsMap[id1]
    const d2 = designDetailsMap[id2]

    if (!d1 || !d2) return result

    // Count wins for each design
    let wins1 = 0
    let wins2 = 0

    const categories = ['likes', 'downloads', 'views', 'rating'] as const
    for (const cat of categories) {
      const key1 = cat as keyof typeof d1
      const key2 = cat as keyof typeof d2
      if (d1[key1] > d2[key2]) wins1++
      else if (d2[key2] > d1[key1]) wins2++
    }

    result[id1] = {
      likes: d1.like_count > d2.like_count,
      downloads: d1.download_count > d2.download_count,
      views: d1.view_count > d2.view_count,
      rating: d1.rating > d2.rating,
      _isOverallWinner: wins1 > wins2,
    }
    result[id2] = {
      likes: d2.like_count > d1.like_count,
      downloads: d2.download_count > d1.download_count,
      views: d2.view_count > d1.view_count,
      rating: d2.rating > d1.rating,
      _isOverallWinner: wins2 > wins1,
    }

    return result
  }, [compareDesigns])

  const handleViewDetails = (designId: string) => {
    setSelectedDesignId(designId)
    navigateTo('design-detail')
    setOpen(false)
  }

  const handleRemove = (designId: string) => {
    removeFromCompare(designId)
    if (compareDesigns.length <= 1) {
      setOpen(false)
    }
  }

  const handleClearAll = () => {
    clearCompare()
    setOpen(false)
  }

  return (
    <>
      {/* Floating Compare Button */}
      <AnimatePresence>
        {compareDesigns.length > 0 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-24 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-[#fb8000] text-white shadow-lg shadow-[#fb8000]/30 hover:shadow-xl hover:shadow-[#fb8000]/40 transition-shadow"
          >
            <GitCompare className="w-5 h-5" />
            <span className="text-sm font-semibold">Compare</span>
            <Badge className="bg-white text-[#fb8000] border-0 ml-1 min-w-[20px] h-5 flex items-center justify-center text-xs font-bold">
              {compareDesigns.length}
            </Badge>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Comparison Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="h-[85vh] sm:h-[80vh] lg:h-[75vh] max-w-full p-0 gap-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl"
        >
          <SheetHeader className="px-6 pt-6 pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <SheetTitle className="text-xl flex items-center gap-2 dark:text-white">
                <GitCompare className="w-5 h-5 text-[#fb8000]" />
                Design Comparison
              </SheetTitle>
              <SheetDescription className="text-sm mt-1">
                Compare two designs side by side
              </SheetDescription>
            </div>
            <div className="flex items-center gap-2">
              {compareDesigns.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All
                </Button>
              )}
            </div>
          </SheetHeader>

          <Separator />

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {compareDesigns.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center h-full text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-20 h-20 rounded-full bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center mb-4"
                >
                  <GitCompare className="w-10 h-10 text-[#fb8000]/50" />
                </motion.div>
                <h3 className="text-lg font-semibold mb-2 dark:text-white">No Designs Selected</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Select 2 designs to compare by clicking the compare checkbox on design cards
                </p>
              </div>
            ) : compareDesigns.length === 1 ? (
              /* Only 1 selected */
              <div className="flex flex-col items-center">
                <div className="w-full max-w-sm mx-auto">
                  <CompareItem
                    designId={compareDesigns[0]}
                    isWinner={{}}
                    onRemove={() => handleRemove(compareDesigns[0])}
                    onViewDetails={() => handleViewDetails(compareDesigns[0])}
                  />
                </div>
                <div className="mt-6 text-center">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center mx-auto mb-3"
                  >
                    <GitCompare className="w-6 h-6 text-[#fb8000]/50" />
                  </motion.div>
                  <p className="text-sm text-muted-foreground">
                    Select 1 more design to start comparing
                  </p>
                </div>
              </div>
            ) : (
              /* Two designs - side by side comparison */
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                {compareDesigns.map((designId) => {
                  const winner = winnerMap[designId] || {}
                  const isOverallWinner = (winner as any)._isOverallWinner
                  return (
                    <div key={designId} className="flex-1 min-w-0">
                      {isOverallWinner && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 mb-3 px-1"
                        >
                          <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                            <Crown className="w-3.5 h-3.5" />
                            Overall Winner
                          </div>
                        </motion.div>
                      )}
                      <CompareItem
                        designId={designId}
                        isWinner={winner}
                        onRemove={() => handleRemove(designId)}
                        onViewDetails={() => handleViewDetails(designId)}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
