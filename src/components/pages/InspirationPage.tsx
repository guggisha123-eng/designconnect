'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Wand2, RefreshCw, Bookmark, Download, Image as ImageIcon,
  Minus, Bold, Palmtree, Building2, Palette, Clock, Heart,
  ArrowRight, Loader2, Eye, Lightbulb, Copy
} from 'lucide-react'
import { useNavStore } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

/* ─── Types ─── */
interface GeneratedImage {
  id: string
  imageUrl: string
  prompt: string
  enhancedPrompt: string
  style: string | null
  colorMood: string | null
  saved: boolean
  timestamp: number
}

/* ─── Style Presets ─── */
const STYLES = [
  { id: 'minimal', label: 'Minimal', icon: Minus, desc: 'Clean & simple', color: 'from-slate-400 to-slate-600' },
  { id: 'bold', label: 'Bold', icon: Bold, desc: 'Strong & impactful', color: 'from-red-500 to-orange-600' },
  { id: 'playful', label: 'Playful', icon: Palmtree, desc: 'Fun & creative', color: 'from-pink-400 to-purple-500' },
  { id: 'corporate', label: 'Corporate', icon: Building2, desc: 'Professional', color: 'from-blue-500 to-indigo-600' },
  { id: 'artistic', label: 'Artistic', icon: Palette, desc: 'Expressive', color: 'from-amber-400 to-rose-500' },
  { id: 'retro', label: 'Retro', icon: Clock, desc: 'Vintage charm', color: 'from-yellow-500 to-amber-700' },
]

/* ─── Color Moods ─── */
const COLOR_MOODS = [
  { id: 'warm', label: 'Warm', colors: ['#ef4444', '#f97316', '#eab308'] },
  { id: 'cool', label: 'Cool', colors: ['#3b82f6', '#06b6d4', '#8b5cf6'] },
  { id: 'earthy', label: 'Earthy', colors: ['#92400e', '#65a30d', '#a16207'] },
  { id: 'vibrant', label: 'Vibrant', colors: ['#ec4899', '#8b5cf6', '#06b6d4'] },
  { id: 'monochrome', label: 'Mono', colors: ['#171717', '#737373', '#e5e5e5'] },
]

/* ─── Trending Prompts ─── */
const TRENDING_PROMPTS = [
  { prompt: 'Minimalist tech startup logo', image: '/designs/logo-pack.png', style: 'minimal' },
  { prompt: 'Vibrant social media campaign', image: '/designs/social-media-kit.png', style: 'bold' },
  { prompt: 'Elegant restaurant branding', image: '/designs/brand-identity.png', style: 'corporate' },
  { prompt: 'Playful children\'s app UI', image: '/designs/app-ui.png', style: 'playful' },
  { prompt: 'Retro vintage poster design', image: '/designs/poster-collection.png', style: 'retro' },
  { prompt: 'Corporate annual report cover', image: '/designs/business-card.png', style: 'corporate' },
  { prompt: 'Artistic portfolio website', image: '/designs/hero-bundle.png', style: 'artistic' },
  { prompt: 'Bold e-commerce landing page', image: '/designs/icon-set.png', style: 'bold' },
]

/* ─── Community Inspiration ─── */
const COMMUNITY_DESIGNS = [
  { id: 'c1', prompt: 'Futuristic dashboard UI with neon accents', image: '/designs/app-ui.png', likes: 284, style: 'bold' },
  { id: 'c2', prompt: 'Organic skincare brand identity with pastel tones', image: '/designs/brand-identity.png', likes: 193, style: 'minimal' },
  { id: 'c3', prompt: 'Music festival poster with psychedelic art', image: '/designs/poster-collection.png', likes: 356, style: 'artistic' },
  { id: 'c4', prompt: 'Fitness app onboarding screens', image: '/designs/social-media-kit.png', likes: 147, style: 'playful' },
  { id: 'c5', prompt: 'Luxury watch brand visual identity', image: '/designs/business-card.png', likes: 221, style: 'corporate' },
  { id: 'c6', prompt: '80s synthwave album cover', image: '/designs/hero-bundle.png', likes: 412, style: 'retro' },
]

/* ─── Stagger Animation ─── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
}

export default function InspirationPage() {
  const navigateTo = useNavStore((s) => s.navigateTo)
  const { toast } = useToast()

  const [prompt, setPrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [selectedColorMood, setSelectedColorMood] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())

  /* ─── Generate Image ─── */
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast({ title: 'Please enter a prompt', description: 'Describe your design idea to get started', variant: 'destructive' })
      return
    }
    setGenerating(true)
    try {
      const res = await fetch('/api/generate-inspiration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style: selectedStyle,
          colorMood: selectedColorMood,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Generation failed')
      }
      const newImage: GeneratedImage = {
        id: `gen_${Date.now()}`,
        imageUrl: data.imageUrl,
        prompt: data.prompt,
        enhancedPrompt: data.enhancedPrompt,
        style: data.style,
        colorMood: data.colorMood,
        saved: false,
        timestamp: Date.now(),
      }
      setGeneratedImages((prev) => [newImage, ...prev])
      toast({ title: 'Inspiration generated!', description: 'Your design concept is ready' })
    } catch (err) {
      console.error(err)
      toast({ title: 'Generation failed', description: 'Please try again with a different prompt', variant: 'destructive' })
    } finally {
      setGenerating(false)
    }
  }, [prompt, selectedStyle, selectedColorMood, toast])

  /* ─── Regenerate ─── */
  const handleRegenerate = useCallback(async (img: GeneratedImage) => {
    setGenerating(true)
    try {
      const res = await fetch('/api/generate-inspiration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: img.prompt,
          style: img.style,
          colorMood: img.colorMood,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Regeneration failed')
      }
      const newImage: GeneratedImage = {
        id: `gen_${Date.now()}`,
        imageUrl: data.imageUrl,
        prompt: data.prompt,
        enhancedPrompt: data.enhancedPrompt,
        style: data.style,
        colorMood: data.colorMood,
        saved: false,
        timestamp: Date.now(),
      }
      setGeneratedImages((prev) => [newImage, ...prev])
      toast({ title: 'New variation generated!' })
    } catch {
      toast({ title: 'Regeneration failed', variant: 'destructive' })
    } finally {
      setGenerating(false)
    }
  }, [toast])

  /* ─── Save to Collection ─── */
  const handleSave = useCallback((img: GeneratedImage) => {
    setSavingIds((prev) => new Set(prev).add(img.id))
    setTimeout(() => {
      setGeneratedImages((prev) =>
        prev.map((i) => (i.id === img.id ? { ...i, saved: !i.saved } : i))
      )
      setSavingIds((prev) => {
        const next = new Set(prev)
        next.delete(img.id)
        return next
      })
      toast({
        title: img.saved ? 'Removed from collection' : 'Saved to collection',
        description: img.saved ? 'Design removed from your saved items' : 'Design added to your saved collection',
      })
    }, 400)
  }, [toast])

  /* ─── Download ─── */
  const handleDownload = useCallback(async (img: GeneratedImage) => {
    try {
      const response = await fetch(img.imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `inspiration_${img.id}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast({ title: 'Downloaded!', description: 'Image saved to your device' })
    } catch {
      toast({ title: 'Download failed', variant: 'destructive' })
    }
  }, [toast])

  /* ─── Use as Reference ─── */
  const handleUseAsReference = useCallback((_img: GeneratedImage) => {
    toast({ title: 'Reference applied', description: 'This design will be used as a reference for your next upload' })
  }, [toast])

  /* ─── Auto-fill from Trending ─── */
  const handleTrendingClick = useCallback((item: typeof TRENDING_PROMPTS[number]) => {
    setPrompt(item.prompt)
    setSelectedStyle(item.style)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  /* ─── Try Community Prompt ─── */
  const handleTryCommunityPrompt = useCallback((item: typeof COMMUNITY_DESIGNS[number]) => {
    setPrompt(item.prompt)
    setSelectedStyle(item.style)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-[#fb8000]/20 to-amber-400/10 blur-3xl"
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 -right-32 w-80 h-80 rounded-full bg-gradient-to-bl from-purple-500/15 to-pink-400/10 blur-3xl"
            animate={{ x: [0, -25, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-gradient-to-tr from-amber-300/15 to-orange-400/10 blur-3xl"
            animate={{ x: [0, 20, 0], y: [0, -25, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fb8000]/10 border border-[#fb8000]/20 text-[#fb8000] text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#fb8000] via-amber-500 to-[#fb8000] bg-clip-text text-transparent">
                AI Design Inspiration
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Let AI spark your creativity. Generate unique design concepts instantly.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Prompt Input Area */}
      <section className="max-w-4xl mx-auto px-4 -mt-4 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-border/50 shadow-xl p-6 sm:p-8"
        >
          {/* Textarea */}
          <div className="mb-6">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your design idea... (e.g., 'A modern logo for a coffee shop with warm colors')"
              className="min-h-[100px] text-base resize-none focus:ring-2 focus:ring-[#fb8000]/50 border-border/50"
            />
          </div>

          {/* Style Selector */}
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-3 block">Style</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {STYLES.map((style) => {
                const Icon = style.icon
                const isActive = selectedStyle === style.id
                return (
                  <motion.button
                    key={style.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedStyle(isActive ? null : style.id)}
                    className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                      isActive
                        ? 'border-[#fb8000] bg-orange-50 dark:bg-orange-900/20 shadow-md shadow-[#fb8000]/10'
                        : 'border-border/50 hover:border-border bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${style.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className={`text-xs font-medium ${isActive ? 'text-[#fb8000]' : 'text-foreground/70'}`}>
                      {style.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="style-indicator"
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#fb8000] flex items-center justify-center"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      >
                        <Sparkles className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Color Mood Selector */}
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-3 block">Color Mood</label>
            <div className="flex flex-wrap gap-3">
              {COLOR_MOODS.map((mood) => {
                const isActive = selectedColorMood === mood.id
                return (
                  <motion.button
                    key={mood.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedColorMood(isActive ? null : mood.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-200 ${
                      isActive
                        ? 'border-[#fb8000] bg-orange-50 dark:bg-orange-900/20 shadow-md shadow-[#fb8000]/10'
                        : 'border-border/50 hover:border-border bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex -space-x-1.5">
                      {mood.colors.map((color, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-900"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className={`text-xs font-medium ${isActive ? 'text-[#fb8000]' : 'text-foreground/70'}`}>
                      {mood.label}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Generate Button */}
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className="w-full h-14 text-base font-semibold gradient-orange gradient-orange-hover text-white border-0 rounded-xl shadow-lg shadow-[#fb8000]/20 disabled:opacity-50 disabled:shadow-none"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Inspiration...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Inspiration
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>

        {/* Loading Shimmer */}
        <AnimatePresence>
          {generating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-border/50 bg-white dark:bg-slate-900">
                  <div className="aspect-square shimmer" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 w-3/4 rounded shimmer" />
                    <div className="h-3 w-1/2 rounded shimmer" />
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Generated Results Gallery */}
      {generatedImages.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Your Inspirations</h2>
            <span className="text-sm text-muted-foreground">{generatedImages.length} generated</span>
          </div>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {generatedImages.map((img) => (
              <motion.div
                key={img.id}
                variants={itemVariants}
                layout
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={img.imageUrl}
                    alt={img.prompt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/designs/creative-workspace.png'
                    }}
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-sm font-medium line-clamp-2 mb-2">{img.prompt}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {img.style && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-[#fb8000]">
                        <Sparkles className="w-3 h-3" />
                        {img.style}
                      </span>
                    )}
                    {img.colorMood && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-foreground/70">
                        <Eye className="w-3 h-3" />
                        {img.colorMood}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSave(img)}
                      className={`flex-1 gap-1.5 ${img.saved ? 'text-[#fb8000]' : ''}`}
                    >
                      {savingIds.has(img.id) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Bookmark className={`w-4 h-4 ${img.saved ? 'fill-[#fb8000]' : ''}`} />
                      )}
                      {img.saved ? 'Saved' : 'Save'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(img)}
                      className="gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRegenerate(img)}
                      disabled={generating}
                      className="gap-1.5"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span className="hidden sm:inline">Remix</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUseAsReference(img)}
                      className="gap-1.5"
                    >
                      <Lightbulb className="w-4 h-4" />
                      <span className="hidden sm:inline">Ref</span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* Empty State */}
      {generatedImages.length === 0 && !generating && (
        <section className="max-w-2xl mx-auto px-4 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#fb8000] to-amber-500 flex items-center justify-center shadow-lg shadow-[#fb8000]/20">
              <Wand2 className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No inspiration generated yet</h3>
            <p className="text-muted-foreground">
              Enter a prompt or choose a trending idea to get started
            </p>
          </motion.div>
        </section>
      )}

      {/* Trending Prompts Section */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#fb8000] to-amber-500 flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Trending Prompts</h2>
              <p className="text-sm text-muted-foreground">Click to auto-fill and start generating</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TRENDING_PROMPTS.map((item, index) => (
              <motion.button
                key={item.prompt}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                whileHover={{ y: -4, scale: 1.02 }}
                onClick={() => handleTrendingClick(item)}
                className="group text-left bg-white dark:bg-slate-900 rounded-xl border border-border/50 overflow-hidden hover:shadow-lg hover:shadow-[#fb8000]/5 transition-all duration-300"
              >
                <div className="aspect-video overflow-hidden relative">
                  <img
                    src={item.image}
                    alt={item.prompt}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-2 left-2 text-xs px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white font-medium">
                    {item.style}
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium line-clamp-2">{item.prompt}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Community Inspiration */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Community Inspiration</h2>
              <p className="text-sm text-muted-foreground">See what others have created</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMMUNITY_DESIGNS.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.4 }}
                whileHover={{ y: -4 }}
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.prompt}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white font-medium">
                      <Sparkles className="w-3 h-3" />
                      {item.style}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-white/90">
                      <Heart className="w-3 h-3 fill-white/80" />
                      {item.likes}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium line-clamp-2 mb-3">{item.prompt}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTryCommunityPrompt(item)}
                    className="w-full gap-2 border-[#fb8000]/30 text-[#fb8000] hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Try this prompt
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-16 mb-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#fb8000] to-amber-500 opacity-5 dark:opacity-10" />
        <div className="relative max-w-4xl mx-auto text-center px-4">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-[#fb8000]" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to Create?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Upload your designs and share them with the DesignConnect community
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigateTo('upload')}
              className="gradient-orange gradient-orange-hover text-white border-0 px-8"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Upload Design
            </Button>
            <Button
              variant="outline"
              onClick={() => navigateTo('browse')}
              className="px-8"
            >
              Browse Designs
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
