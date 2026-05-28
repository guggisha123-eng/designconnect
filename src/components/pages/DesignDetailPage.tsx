'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Heart, Eye, Download, Star, Share2, MessageSquare,
  Flag, Calendar, Tag, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useNavStore } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'

interface DesignDetail {
  id: string
  title: string
  description: string
  thumbnail: string
  preview_images: string[]
  category: string
  subcategory: string
  price: number
  is_free: boolean
  source_files: string
  view_count: number
  download_count: number
  like_count: number
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

export default function DesignDetailPage() {
  const navigateTo = useNavStore((s) => s.navigateTo)
  const selectedDesignId = useNavStore((s) => s.selectedDesignId)
  const setSelectedDesignerId = useNavStore((s) => s.setSelectedDesignerId)
  const isLoggedIn = useNavStore((s) => s.isLoggedIn)

  const [design, setDesign] = useState<DesignDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [liked, setLiked] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    if (!selectedDesignId) {
      navigateTo('browse')
      return
    }

    const fetchDesign = async () => {
      setLoading(true)
      try {
        const supabase = createClient()

        // Fetch design with designer info
        const { data, error } = await supabase
          .from('designs')
          .select('*, users!designs_designer_id_fkey(id, name, avatar, bio)')
          .eq('id', selectedDesignId)
          .single()

        if (data && !error) {
          setDesign({
            id: data.id,
            title: data.title,
            description: data.description || 'No description available.',
            thumbnail: data.thumbnail,
            preview_images: data.preview_images ? JSON.parse(data.preview_images) : [],
            category: data.category || 'Design',
            subcategory: data.subcategory || '',
            price: data.price || 0,
            is_free: data.is_free,
            source_files: data.source_files || '',
            view_count: (data.view_count || 0) + 1,
            download_count: data.download_count || 0,
            like_count: data.like_count || 0,
            created_at: data.created_at,
            designer: {
              id: data.users?.id || '',
              name: data.users?.name || 'Unknown',
              avatar: data.users?.avatar || null,
              bio: data.users?.bio || null,
            },
          })

          // Increment view count
          await supabase
            .from('designs')
            .update({ view_count: data.view_count + 1 })
            .eq('id', data.id)
        } else {
          // Fallback sample design
          setDesign({
            id: selectedDesignId,
            title: 'Modern Brand Identity',
            description: 'A comprehensive brand identity package including logo variations, color palette, typography guidelines, and brand collateral templates. Perfect for startups and small businesses looking to establish a strong visual presence.\n\nThis design package includes:\n- Primary and secondary logo variations\n- Color palette with hex codes\n- Typography selection and usage guidelines\n- Business card template\n- Letterhead template\n- Social media profile templates\n- Brand guidelines document',
            thumbnail: '',
            preview_images: [],
            category: 'Logo Design',
            subcategory: 'Brand Identity',
            price: 29,
            is_free: false,
            source_files: 'AI, EPS, SVG, PNG, PDF',
            view_count: 1234,
            download_count: 456,
            like_count: 78,
            created_at: new Date().toISOString(),
            designer: {
              id: 'designer-1',
              name: 'Sarah Chen',
              avatar: null,
              bio: 'Brand designer with 8+ years of experience',
            },
          })
        }

        // Fetch comments
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
      } catch {
        // Already have fallback above
      } finally {
        setLoading(false)
      }
    }

    fetchDesign()
  }, [selectedDesignId])

  const handleComment = async () => {
    if (!newComment.trim() || !isLoggedIn) return
    setSubmittingComment(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('comments')
        .insert({
          content: newComment,
          design_id: selectedDesignId,
          user_id: user.id,
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
        user_name: 'You',
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

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Image Section */}
          <div className="lg:col-span-3">
            <Card className="border-0 overflow-hidden shadow-sm">
              <div className="aspect-[16/10] bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center relative">
                <span className="text-6xl opacity-30">🎨</span>
                {design.is_free && (
                  <Badge className="absolute top-4 left-4 bg-green-500 text-white border-0">Free</Badge>
                )}
              </div>
            </Card>

            {/* Image Navigation */}
            <div className="flex gap-2 mt-3 overflow-x-auto custom-scrollbar">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  onClick={() => setCurrentImageIndex(i)}
                  className={`w-20 h-14 rounded-lg bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center cursor-pointer flex-shrink-0 transition-all ${
                    currentImageIndex === i ? 'ring-2 ring-[#fb8000]' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <span className="text-lg opacity-30">🎨</span>
                </div>
              ))}
            </div>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <h1 className="text-2xl font-bold mb-3">{design.title}</h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{design.category}</Badge>
                {design.subcategory && <Badge variant="outline">{design.subcategory}</Badge>}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 mb-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {design.like_count}</span>
                <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {design.view_count}</span>
                <span className="flex items-center gap-1"><Download className="w-4 h-4" /> {design.download_count}</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                {design.is_free ? (
                  <span className="text-3xl font-bold text-green-500">Free</span>
                ) : (
                  <span className="text-3xl font-bold text-[#fb8000]">${design.price}</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <Button className="flex-1 gradient-orange gradient-orange-hover text-white border-0 gap-2">
                  <Download className="w-4 h-4" />
                  {design.is_free ? 'Download Free' : `Buy for $${design.price}`}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setLiked(!liked)}
                  className={liked ? 'text-red-500 border-red-500' : ''}
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Flag className="w-4 h-4" />
                </Button>
              </div>

              <Separator className="my-6" />

              {/* Designer Info */}
              <div
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedDesignerId(design.designer.id)
                  navigateTo('designer-profile')
                }}
              >
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="gradient-orange text-white font-bold">
                    {design.designer.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{design.designer.name}</p>
                  <p className="text-sm text-muted-foreground">{design.designer.bio || 'Designer'}</p>
                </div>
              </div>

              {/* File Info */}
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Tag className="w-4 h-4" />
                  <span>Source files: {design.source_files || 'Not available'}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Published: {new Date(design.created_at).toLocaleDateString()}</span>
                </div>
              </div>
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
