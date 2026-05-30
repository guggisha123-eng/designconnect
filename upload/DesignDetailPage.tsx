'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Heart, Eye, Download, Share2, MessageSquare, Flag,
  Bookmark, Copy, ExternalLink, Check
} from 'lucide-react'
import { useNavStore } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { isSupabaseReady, createClient } from '@/lib/supabase/client'

interface DesignDetail {
  id: string
  title: string
  description: string
  thumbnail: string
  thumbnail_url: string | null
  image_urls: string[] | null
  preview_images: string[]
  category: string
  subcategory: string
  price: number
  is_free: boolean
  source_files: string
  view_count: number
  download_count: number
  like_count: number
  reference_count: number
  created_at: string
  designer: {
    id: string
    name: string
    avatar: string | null
    bio: string | null
  }
}

interface Comment {
  id: string
  content: string
  user_name: string
  user_avatar: string | null
  created_at: string
}

// Local storage keys for demo mode
function getLocalLikes(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem('dc_likes') || '{}') } catch { return {} }
}
function saveLocalLikes(likes: Record<string, boolean>) {
  if (typeof window !== 'undefined') localStorage.setItem('dc_likes', JSON.stringify(likes))
}
// Per-design like-count offset, so the +1/-1 survives reload even when
// the Supabase write didn't happen (guest mode or offline).
function getLocalLikeOffsets(): Record<string, number> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem('dc_like_offsets') || '{}') } catch { return {} }
}
function saveLocalLikeOffsets(o: Record<string, number>) {
  if (typeof window !== 'undefined') localStorage.setItem('dc_like_offsets', JSON.stringify(o))
}
function getLocalSaves(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem('dc_saves') || '{}') } catch { return {} }
}
function saveLocalSaves(saves: Record<string, boolean>) {
  if (typeof window !== 'undefined') localStorage.setItem('dc_saves', JSON.stringify(saves))
}
function getLocalReferences(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem('dc_references') || '{}') } catch { return {} }
}
function saveLocalReferences(refs: Record<string, boolean>) {
  if (typeof window !== 'undefined') localStorage.setItem('dc_references', JSON.stringify(refs))
}

// Fallback design when Supabase is not available or design not found
function getFallbackDesign(id: string): DesignDetail {
  const sampleDesigns: Record<string, { title: string; desc: string; cat: string; sub: string; price: number; free: boolean }> = {
    'd1': { title: 'Modern Brand Identity', desc: 'A comprehensive brand identity package including logo variations, color palette, typography guidelines, and brand collateral templates. Perfect for startups and small businesses looking to establish a strong visual presence.\n\nThis design package includes:\n- Primary and secondary logo variations\n- Color palette with hex codes\n- Typography selection and usage guidelines\n- Business card template\n- Letterhead template\n- Social media profile templates\n- Brand guidelines document', cat: 'Logo Design', sub: 'Brand Identity', price: 29, free: false },
    'd2': { title: 'E-Commerce Dashboard UI', desc: 'A clean and modern dashboard interface designed for e-commerce platforms. Features real-time analytics, order management, inventory tracking, and customer insights.\n\nKey features:\n- Sales overview with interactive charts\n- Order management with filters\n- Product inventory dashboard\n- Customer analytics\n- Responsive design for all devices', cat: 'UI/UX Design', sub: 'Dashboard', price: 0, free: true },
    'd3': { title: 'Minimal Poster Series', desc: 'A set of minimalist posters designed for art exhibitions and cultural events. Each poster uses clean typography and limited color palettes to create striking visual compositions.\n\nIncludes:\n- 5 poster variations\n- Print-ready files (A2, A3 sizes)\n- Social media versions\n- Customizable templates', cat: 'Poster Design', sub: 'Minimalist', price: 19, free: false },
  }
  const sample = sampleDesigns[id] || sampleDesigns['d1']
  return {
    id: id,
    title: sample.title,
    description: sample.desc,
    thumbnail: '',
    thumbnail_url: null,
    image_urls: [],
    preview_images: [],
    category: sample.cat,
    subcategory: sample.sub,
    price: sample.price,
    is_free: sample.free,
    source_files: 'AI, EPS, SVG, PNG, PDF',
    view_count: 1234,
    download_count: 456,
    like_count: 78,
    reference_count: 23,
    created_at: new Date().toISOString(),
    designer: {
      id: 'designer-1',
      name: 'Sarah Chen',
      avatar: null,
      bio: 'Brand designer with 8+ years of experience',
    },
  }
}

export default function DesignDetailPage() {
  const navigateTo = useNavStore((s) => s.navigateTo)
  const selectedDesignId = useNavStore((s) => s.selectedDesignId)
  const setSelectedDesignerId = useNavStore((s) => s.setSelectedDesignerId)
  const isLoggedIn = useNavStore((s) => s.isLoggedIn)
  const user = useNavStore((s) => s.user)

  const [design, setDesign] = useState<DesignDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [referenced, setReferenced] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareMsg, setShareMsg] = useState('')

  // Load saved states from localStorage
  useEffect(() => {
    if (selectedDesignId) {
      const likes = getLocalLikes()
      const saves = getLocalSaves()
      const refs = getLocalReferences()
      if (likes[selectedDesignId]) setLiked(true)
      if (saves[selectedDesignId]) setSaved(true)
      if (refs[selectedDesignId]) setReferenced(true)
    }
  }, [selectedDesignId])

  // Fetch design
  useEffect(() => {
    if (!selectedDesignId) {
      navigateTo('browse')
      return
    }

    const fetchDesign = async () => {
      setLoading(true)
      try {
        if (isSupabaseReady()) {
          try {
            const supabase = createClient()

            // Fetch design with designer info
            const { data, error } = await supabase
              .from('designs')
              .select('*, users!designs_designer_id_fkey(id, name, avatar, bio)')
              .eq('id', selectedDesignId)
              .single()

            if (data && !error) {
              const imageUrls = data.image_urls || []
              const likeOffset = getLocalLikeOffsets()[data.id] || 0
              setDesign({
                id: data.id,
                title: data.title,
                description: data.description || 'No description available.',
                thumbnail: data.thumbnail,
                thumbnail_url: data.thumbnail_url || imageUrls[0] || null,
                image_urls: imageUrls,
                preview_images: data.preview_images ? JSON.parse(data.preview_images) : [],
                category: data.category || 'Design',
                subcategory: data.subcategory || '',
                price: data.price || 0,
                is_free: data.is_free,
                source_files: data.source_files || '',
                view_count: (data.view_count || 0) + 1,
                download_count: data.download_count || 0,
                like_count: Math.max(0, (data.like_count || 0) + likeOffset),
                reference_count: data.reference_count || 0,
                created_at: data.created_at,
                designer: {
                  id: data.users?.id || '',
                  name: data.users?.name || 'Unknown',
                  avatar: data.users?.avatar || null,
                  bio: data.users?.bio || null,
                },
              })

              // Increment view count
              try {
                await supabase
                  .from('designs')
                  .update({ view_count: data.view_count + 1 })
                  .eq('id', data.id)
              } catch { /* ignore */ }
            } else {
              setDesign(getFallbackDesign(selectedDesignId))
            }

            // Fetch comments
            try {
              const { data: commentData } = await supabase
                .from('comments')
                .select('*, users!comments_user_id_fkey(name, avatar)')
                .eq('design_id', selectedDesignId)
                .order('created_at', { ascending: false })

              if (commentData) {
                setComments(commentData.map((c: any) => ({
                  id: c.id,
                  content: c.content,
                  user_name: c.users?.name || 'Anonymous',
                  user_avatar: c.users?.avatar || null,
                  created_at: c.created_at,
                })))
              }
            } catch { /* ignore */ }
          } catch (dbErr) {
            console.warn('Supabase fetch failed, using fallback:', dbErr)
            setDesign(getFallbackDesign(selectedDesignId))
          }
        } else {
          // No Supabase configured — use fallback data
          const fb = getFallbackDesign(selectedDesignId)
          const off = getLocalLikeOffsets()[fb.id] || 0
          setDesign({ ...fb, like_count: Math.max(0, fb.like_count + off) })
        }
      } catch {
        const fb = getFallbackDesign(selectedDesignId)
        const off = getLocalLikeOffsets()[fb.id] || 0
        setDesign({ ...fb, like_count: Math.max(0, fb.like_count + off) })
      } finally {
        setLoading(false)
      }
    }

    fetchDesign()
  }, [selectedDesignId])

  // Like handler
  const handleLike = useCallback(async () => {
    if (!design) return
    if (!isLoggedIn) { navigateTo('auth'); return }

    const newLiked = !liked

    // Update local state immediately
    setLiked(newLiked)
    setDesign(prev => prev ? {
      ...prev,
      like_count: prev.like_count + (newLiked ? 1 : -1)
    } : null)

    // Save to localStorage
    const likes = getLocalLikes()
    if (newLiked) likes[design.id] = true
    else delete likes[design.id]
    saveLocalLikes(likes)

    // Persist the count delta so reload keeps the number
    const offsets = getLocalLikeOffsets()
    offsets[design.id] = (offsets[design.id] || 0) + (newLiked ? 1 : -1)
    if (offsets[design.id] === 0) delete offsets[design.id]
    saveLocalLikeOffsets(offsets)

    // Try Supabase if configured
    if (isSupabaseReady() && user) {
      try {
        const supabase = createClient()
        if (newLiked) {
          await supabase.from('likes').insert({ design_id: design.id, user_id: user.id })
          await supabase.from('designs').update({ like_count: design.like_count + 1 }).eq('id', design.id)
        } else {
          await supabase.from('likes').delete().eq('design_id', design.id).eq('user_id', user.id)
          await supabase.from('designs').update({ like_count: Math.max(0, design.like_count - 1) }).eq('id', design.id)
        }
      } catch { /* local state already updated */ }
    }
  }, [design, liked, isLoggedIn, user, navigateTo])

  // Save handler
  const handleSave = useCallback(async () => {
    if (!design) return
    if (!isLoggedIn) { navigateTo('auth'); return }

    const newSaved = !saved
    setSaved(newSaved)

    // Save to localStorage
    const saves = getLocalSaves()
    if (newSaved) saves[design.id] = true
    else delete saves[design.id]
    saveLocalSaves(saves)

    setShareMsg(newSaved ? 'Saved to collection!' : 'Removed from collection')
    setTimeout(() => setShareMsg(''), 2000)
  }, [design, saved, isLoggedIn, navigateTo])

  // Reference handler
  const handleReference = useCallback(async () => {
    if (!design) return
    if (!isLoggedIn) { navigateTo('auth'); return }

    const newRef = !referenced
    setReferenced(newRef)

    // Save to localStorage
    const refs = getLocalReferences()
    if (newRef) refs[design.id] = true
    else delete refs[design.id]
    saveLocalReferences(refs)

    // Update reference count
    setDesign(prev => prev ? {
      ...prev,
      reference_count: prev.reference_count + (newRef ? 1 : -1)
    } : null)

    setShareMsg(newRef ? 'Added to references!' : 'Removed from references')
    setTimeout(() => setShareMsg(''), 2000)

    // Try Supabase
    if (isSupabaseReady() && user) {
      try {
        const supabase = createClient()
        if (newRef) {
          await supabase.from('design_references').insert({ design_id: design.id, user_id: user.id })
          await supabase.from('designs').update({ reference_count: (design.reference_count || 0) + 1 }).eq('id', design.id)
        } else {
          await supabase.from('design_references').delete().eq('design_id', design.id).eq('user_id', user.id)
          await supabase.from('designs').update({ reference_count: Math.max(0, (design.reference_count || 0) - 1) }).eq('id', design.id)
        }
      } catch { /* local state already updated */ }
    }
  }, [design, referenced, isLoggedIn, user, navigateTo])

  // Share handler
  const handleShare = useCallback(async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setShareMsg('Link copied!')
      setTimeout(() => { setCopied(false); setShareMsg('') }, 2000)
    } catch {
      setShareMsg('Could not copy link')
      setTimeout(() => setShareMsg(''), 2000)
    }
  }, [])

  const handleComment = async () => {
    if (!newComment.trim() || !isLoggedIn) return
    setSubmittingComment(true)

    // If Supabase not configured, add comment locally
    if (!isSupabaseReady()) {
      setComments(prev => [{
        id: `local-${Date.now()}`,
        content: newComment,
        user_name: user?.name || 'You',
        user_avatar: null,
        created_at: new Date().toISOString(),
      }, ...prev])
      setNewComment('')
      setSubmittingComment(false)
      return
    }

    try {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      const { data } = await supabase
        .from('comments')
        .insert({
          content: newComment,
          design_id: selectedDesignId,
          user_id: authUser.id,
        })
        .select('*, users!comments_user_id_fkey(name, avatar)')
        .single()

      if (data) {
        setComments(prev => [{
          id: data.id,
          content: data.content,
          user_name: data.users?.name || 'You',
          user_avatar: data.users?.avatar || null,
          created_at: data.created_at,
        }, ...prev])
        setNewComment('')
      }
    } catch {
      // Fallback: add locally
      setComments(prev => [{
        id: `local-${Date.now()}`,
        content: newComment,
        user_name: user?.name || 'You',
        user_avatar: null,
        created_at: new Date().toISOString(),
      }, ...prev])
      setNewComment('')
    } finally {
      setSubmittingComment(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#fb8000] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!design) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">Design not found</h2>
        <Button onClick={() => navigateTo('browse')}>Browse Designs</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigateTo('browse')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Browse
        </button>

        {/* Title & Meta */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold mb-3">{design.title}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => {
                setSelectedDesignerId(design.designer.id)
                navigateTo('designer-profile')
              }}
            >
              <Avatar className="w-10 h-10">
                <AvatarFallback className="gradient-orange text-white font-bold text-sm">
                  {design.designer.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold group-hover:text-[#fb8000] transition-colors">{design.designer.name}</p>
                <p className="text-xs text-muted-foreground">{design.designer.bio || 'Designer'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground ml-auto flex-wrap">
              <span className="flex items-center gap-1">
                <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                {design.like_count}
              </span>
              <span className="mx-1">·</span>
              <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {design.view_count}</span>
              <span className="mx-1">·</span>
              <span className="flex items-center gap-1"><Download className="w-4 h-4" /> {design.download_count}</span>
              <span className="mx-1">·</span>
              <span className="flex items-center gap-1">
                <ExternalLink className="w-4 h-4" /> {design.reference_count}
              </span>
            </div>
          </div>
        </div>

        {/* Feedback message toast */}
        {shareMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm px-4 py-2 rounded-full shadow-lg"
          >
            {shareMsg}
          </motion.div>
        )}

        {/* Behance Style - Vertical Image Gallery */}
        <div className="space-y-2 mb-10">
          {(design.image_urls && design.image_urls.length > 0 ? design.image_urls : design.thumbnail_url ? [design.thumbnail_url] : []).filter(Boolean).map((url, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative group overflow-hidden rounded-xl bg-muted"
            >
              <img
                src={url}
                alt={`${design.title} - Image ${i + 1}`}
                className="w-full h-auto max-h-[90vh] object-contain"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            </motion.div>
          ))}
          {/* If no images */}
          {(!design.image_urls || design.image_urls.length === 0) && !design.thumbnail_url && (
            <div className="aspect-[16/10] bg-gradient-to-br from-orange-100 to-amber-50 rounded-xl flex items-center justify-center">
              <span className="text-6xl opacity-30">🎨</span>
            </div>
          )}
        </div>

        {/* Action Bar - Sticky bottom */}
        <div className="sticky bottom-0 z-10 bg-white/80 backdrop-blur-xl border-t border-border/50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 mb-10">
          {/* Mobile Layout */}
          <div className="flex sm:hidden items-center gap-2">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <Badge variant="secondary" className="text-xs">{design.category}</Badge>
              {design.is_free ? (
                <span className="text-sm font-bold text-green-500">Free</span>
              ) : (
                <span className="text-sm font-bold text-[#fb8000]">${design.price}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Button size="icon" variant="ghost" onClick={handleLike}
                className={liked ? 'text-red-500' : ''}>
                <Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} />
              </Button>
              <Button size="icon" variant="ghost" onClick={handleSave}
                className={saved ? 'text-amber-500' : ''}>
                <Bookmark className={`w-5 h-5 ${saved ? 'fill-amber-500' : ''}`} />
              </Button>
              <Button size="icon" variant="ghost" onClick={handleReference}
                className={referenced ? 'text-blue-500' : ''}>
                <ExternalLink className={`w-5 h-5 ${referenced ? 'text-blue-500' : ''}`} />
              </Button>
              <Button size="icon" variant="ghost" onClick={handleShare}>
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
              </Button>
            </div>
          </div>
          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center gap-3 flex-wrap">
            <div className="flex flex-wrap gap-2 mr-2">
              <Badge variant="secondary">{design.category}</Badge>
              {design.subcategory && <Badge variant="outline">{design.subcategory}</Badge>}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="mr-2">
                {design.is_free ? (
                  <span className="text-xl font-bold text-green-500">Free</span>
                ) : (
                  <span className="text-xl font-bold text-[#fb8000]">${design.price}</span>
                )}
              </div>
              <Button className="gradient-orange gradient-orange-hover text-white border-0 gap-2">
                <Download className="w-4 h-4" />
                {design.is_free ? 'Download Free' : `Buy for $${design.price}`}
              </Button>
              <Button variant="outline" size="icon" onClick={handleLike}
                className={liked ? 'text-red-500 border-red-500 bg-red-50' : ''} title="Like">
                <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
              </Button>
              <Button variant="outline" size="icon" onClick={handleSave}
                className={saved ? 'text-amber-500 border-amber-500 bg-amber-50' : ''} title="Save">
                <Bookmark className={`w-4 h-4 ${saved ? 'fill-amber-500' : ''}`} />
              </Button>
              <Button variant="outline" size="icon" onClick={handleReference}
                className={referenced ? 'text-blue-500 border-blue-500 bg-blue-50' : ''} title="Reference">
                <ExternalLink className={`w-4 h-4 ${referenced ? 'text-blue-500' : ''}`} />
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare} title="Share">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="icon" title="Report">
                <Flag className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">Description</h2>
          <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
            {design.description}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Heart, label: 'Likes', value: design.like_count, color: liked ? 'text-red-500' : '' },
            { icon: Eye, label: 'Views', value: design.view_count, color: '' },
            { icon: Download, label: 'Downloads', value: design.download_count, color: '' },
            { icon: ExternalLink, label: 'References', value: design.reference_count, color: referenced ? 'text-blue-500' : '' },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4 bg-slate-50 rounded-xl">
              <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color || 'text-muted-foreground'}`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Comments Section */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Comments ({comments.length})
          </h2>

          {/* Add Comment */}
          {isLoggedIn ? (
            <div className="flex gap-3 mb-6">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 min-h-[80px]"
              />
              <Button
                onClick={handleComment}
                disabled={submittingComment || !newComment.trim()}
                className="gradient-orange gradient-orange-hover text-white border-0 self-end"
              >
                {submittingComment ? 'Posting...' : 'Post'}
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-muted rounded-xl text-sm text-muted-foreground mb-6">
              <button onClick={() => navigateTo('auth')} className="text-[#fb8000] font-medium hover:underline">
                Sign in
              </button>{' '}
              to leave a comment
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex gap-3 p-4 bg-slate-50 rounded-xl">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs bg-muted">
                      {comment.user_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{comment.user_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            {comments.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
