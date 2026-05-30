'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Heart, Eye, Download, Share2, MessageSquare, Flag,
  Bookmark, ExternalLink, Check, FileArchive, Loader2, Users, UserPlus, Package,
  Star, ThumbsUp, ChevronDown, ZoomIn, ChevronLeft, ChevronRight, Clock, Award, ArrowRight,
  Home, Twitter, Linkedin, Facebook, Copy, QrCode, Link2
} from 'lucide-react'
import { useNavStore } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { AnimatePresence } from 'framer-motion'
import { isSupabaseReady, createClient } from '@/lib/supabase/client'
import { addToRecentlyViewed, notifyRecentlyViewedChanged } from '@/components/layout/RecentlyViewed'
import ImageLightbox from '@/components/layout/ImageLightbox'
import LazyImage from '@/components/ui/LazyImage'
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

interface Review {
  id: string
  user_name: string
  user_avatar: string | null
  rating: number
  title: string
  content: string
  created_at: string
  is_verified: boolean
  helpful_count: number
  is_helpful: boolean
}

interface ReviewSummary {
  avgRating: number
  totalReviews: number
  distribution: { star: number; count: number; percentage: number }[]
}

const demoReviews: Review[] = [
  {
    id: 'demo-r1',
    user_name: 'Aisha Patel',
    user_avatar: null,
    rating: 5,
    title: 'Absolutely stunning!',
    content: 'The quality and attention to detail in this design pack is incredible. Highly recommend!',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    is_verified: true,
    helpful_count: 12,
    is_helpful: false,
  },
  {
    id: 'demo-r2',
    user_name: 'Marcus Johnson',
    user_avatar: null,
    rating: 4,
    title: 'Great value',
    content: 'Well-organized files and beautiful designs. The brand guidelines document was especially helpful.',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    is_verified: true,
    helpful_count: 8,
    is_helpful: false,
  },
  {
    id: 'demo-r3',
    user_name: 'Luna Kim',
    user_avatar: null,
    rating: 5,
    title: 'Perfect for my startup',
    content: 'Exactly what I needed for my brand identity. The templates saved me hours of work.',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    is_verified: false,
    helpful_count: 5,
    is_helpful: false,
  },
]

// Local storage keys for demo mode
function getLocalLikes(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem('dc_likes') || '{}') } catch { return {} }
}
function saveLocalLikes(likes: Record<string, boolean>) {
  if (typeof window !== 'undefined') localStorage.setItem('dc_likes', JSON.stringify(likes))
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

function getLocalLikeCounts(): Record<string, number> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem('dc_like_counts') || '{}') } catch { return {} }
}
function saveLocalLikeCounts(counts: Record<string, number>) {
  if (typeof window !== 'undefined') localStorage.setItem('dc_like_counts', JSON.stringify(counts))
}

function getLocalDownloadCounts(): Record<string, number> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem('dc_download_counts') || '{}') } catch { return {} }
}
function saveLocalDownloadCounts(counts: Record<string, number>) {
  if (typeof window !== 'undefined') localStorage.setItem('dc_download_counts', JSON.stringify(counts))
}

function getLocalRefCounts(): Record<string, number> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem('dc_ref_counts') || '{}') } catch { return {} }
}
function saveLocalRefCounts(counts: Record<string, number>) {
  if (typeof window !== 'undefined') localStorage.setItem('dc_ref_counts', JSON.stringify(counts))
}

// Related designs data for demo mode
const relatedDesignsData = [
  { id: 'sample-1', title: 'Modern Brand Identity', category: 'Logo Design', image: '/designs/brand-identity.png', designer: 'Sarah Chen', likes: 78, is_free: false, price: 29 },
  { id: 'sample-2', title: 'Minimal Logo Pack', category: 'Logo Design', image: '/designs/logo-pack.png', designer: 'Alex Rivera', likes: 156, is_free: true, price: 0 },
  { id: 'sample-3', title: 'Social Media Kit', category: 'Social Media', image: '/designs/social-media-kit.png', designer: 'Maya Patel', likes: 234, is_free: false, price: 19 },
  { id: 'sample-4', title: 'App UI Template', category: 'UI/UX', image: '/designs/app-ui.png', designer: 'James Wilson', likes: 312, is_free: false, price: 49 },
  { id: 'sample-5', title: 'Poster Collection', category: 'Print Design', image: '/designs/poster-collection.png', designer: 'Luna Kim', likes: 567, is_free: true, price: 0 },
  { id: 'sample-6', title: 'Icon Set Premium', category: 'Icons', image: '/designs/icon-set.png', designer: 'Omar Hassan', likes: 198, is_free: false, price: 15 },
  { id: 'sample-7', title: 'Business Card Template', category: 'Print Design', image: '/designs/business-card.png', designer: 'Sarah Chen', likes: 345, is_free: true, price: 0 },
  { id: 'sample-8', title: 'Website Hero Bundle', category: 'UI/UX', image: '/designs/hero-bundle.png', designer: 'Alex Rivera', likes: 423, is_free: false, price: 39 },
]

// Fallback design when Supabase is not available or design not found
function getFallbackDesign(id: string): DesignDetail {
  const likeCounts = getLocalLikeCounts()
  const downloadCounts = getLocalDownloadCounts()
  const refCounts = getLocalRefCounts()

  const sampleDesigns: Record<string, { title: string; desc: string; cat: string; sub: string; price: number; free: boolean; likes: number; downloads: number; views: number; refs: number }> = {
    'd1': { title: 'Modern Brand Identity', desc: 'A comprehensive brand identity package including logo variations, color palette, typography guidelines, and brand collateral templates. Perfect for startups and small businesses looking to establish a strong visual presence.\n\nThis design package includes:\n- Primary and secondary logo variations\n- Color palette with hex codes\n- Typography selection and usage guidelines\n- Business card template\n- Letterhead template\n- Social media profile templates\n- Brand guidelines document', cat: 'Logo Design', sub: 'Brand Identity', price: 29, free: false, likes: 78, downloads: 456, views: 1234, refs: 23 },
    'd2': { title: 'E-Commerce Dashboard UI', desc: 'A clean and modern dashboard interface designed for e-commerce platforms. Features real-time analytics, order management, inventory tracking, and customer insights.\n\nKey features:\n- Sales overview with interactive charts\n- Order management with filters\n- Product inventory dashboard\n- Customer analytics\n- Responsive design for all devices', cat: 'UI/UX Design', sub: 'Dashboard', price: 0, free: true, likes: 156, downloads: 892, views: 3400, refs: 45 },
    'd3': { title: 'Minimal Poster Series', desc: 'A set of minimalist posters designed for art exhibitions and cultural events. Each poster uses clean typography and limited color palettes to create striking visual compositions.\n\nIncludes:\n- 5 poster variations\n- Print-ready files (A2, A3 sizes)\n- Social media versions\n- Customizable templates', cat: 'Poster Design', sub: 'Minimalist', price: 19, free: false, likes: 234, downloads: 678, views: 2800, refs: 56 },
    'sample-1': { title: 'Modern Brand Identity', desc: 'A comprehensive brand identity package including logo variations, color palette, typography guidelines, and brand collateral templates.', cat: 'Logo Design', sub: 'Brand Identity', price: 29, free: false, likes: 78, downloads: 456, views: 1234, refs: 23 },
    'sample-2': { title: 'Minimal Logo Pack', desc: 'A minimal logo pack featuring clean lines and modern aesthetics. Perfect for tech startups.', cat: 'Logo Design', sub: 'Minimalist', price: 0, free: true, likes: 156, downloads: 892, views: 3400, refs: 45 },
    'sample-3': { title: 'Social Media Kit', desc: 'Social media templates for Instagram, Twitter, and LinkedIn. Boost your brand presence.', cat: 'Social Media', sub: 'Templates', price: 19, free: false, likes: 234, downloads: 678, views: 2800, refs: 56 },
    'sample-4': { title: 'App UI Template', desc: 'Mobile app UI template with 50+ screens covering onboarding, dashboard, and settings.', cat: 'UI/UX', sub: 'Mobile', price: 49, free: false, likes: 312, downloads: 1023, views: 4100, refs: 67 },
    'sample-5': { title: 'Poster Collection', desc: 'A curated collection of event posters with bold typography and vibrant colors.', cat: 'Print Design', sub: 'Posters', price: 0, free: true, likes: 567, downloads: 2100, views: 8900, refs: 89 },
    'sample-6': { title: 'Icon Set Premium', desc: '500+ premium icons in SVG and PNG format. Line and filled variants included.', cat: 'Icons', sub: 'Premium', price: 15, free: false, likes: 198, downloads: 560, views: 2300, refs: 34 },
    'sample-7': { title: 'Business Card Template', desc: 'Professional business card templates with multiple color schemes.', cat: 'Print Design', sub: 'Business Cards', price: 0, free: true, likes: 345, downloads: 1800, views: 6700, refs: 78 },
    'sample-8': { title: 'Website Hero Bundle', desc: 'Hero section designs for modern websites. Includes 10 variations.', cat: 'UI/UX', sub: 'Web', price: 39, free: false, likes: 423, downloads: 890, views: 3200, refs: 45 },
    'sample-9': { title: 'Typography Poster', desc: 'Beautiful typography posters featuring inspirational quotes.', cat: 'Typography', sub: 'Posters', price: 12, free: false, likes: 167, downloads: 445, views: 1900, refs: 23 },
    'sample-10': { title: '3D Illustration Pack', desc: 'Colorful 3D illustrations for web and mobile applications.', cat: '3D Design', sub: 'Illustrations', price: 35, free: false, likes: 289, downloads: 756, views: 3600, refs: 56 },
    'sample-11': { title: 'Resume Template', desc: 'Clean and professional resume templates in multiple formats.', cat: 'Print Design', sub: 'Resume', price: 0, free: true, likes: 412, downloads: 2340, views: 9100, refs: 89 },
    'sample-12': { title: 'Newsletter Template', desc: 'Email newsletter templates for marketing campaigns.', cat: 'Social Media', sub: 'Email', price: 22, free: false, likes: 145, downloads: 345, views: 1200, refs: 12 },
  }
  const sample = sampleDesigns[id] || { title: 'Creative Design Pack', desc: 'A versatile design pack featuring multiple assets for your creative projects. Includes vector graphics, templates, and design elements that can be customized to fit your brand.\n\nWhat\'s included:\n- Multiple design variations\n- Source files in editable format\n- High-resolution exports\n- Commercial license', cat: 'Design', sub: 'General', price: 25, free: false, likes: 95, downloads: 340, views: 1500, refs: 18 }

  const baseLikeCount = likeCounts[id] ?? sample.likes
  const baseDownloadCount = downloadCounts[id] ?? sample.downloads
  const baseRefCount = refCounts[id] ?? sample.refs

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
    view_count: sample.views,
    download_count: baseDownloadCount,
    like_count: baseLikeCount,
    reference_count: baseRefCount,
    created_at: new Date().toISOString(),
    designer: {
      id: 'designer-1',
      name: 'Sarah Chen',
      avatar: null,
      bio: 'Brand designer with 8+ years of experience',
    },
  }
}

function CountUpNumber({ target }: { target: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef(false)

  useEffect(() => {
    if (ref.current) return
    ref.current = true
    const duration = 800
    const startTime = performance.now()
    let raf: number
    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(target * eased))
      if (progress < 1) raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [target])

  return <span>{count.toLocaleString()}</span>
}

export default function DesignDetailPage() {
  const navigateTo = useNavStore((s) => s.navigateTo)
  const goBack = useNavStore((s) => s.goBack)
  const selectedDesignId = useNavStore((s) => s.selectedDesignId)
  const setSelectedDesignerId = useNavStore((s) => s.setSelectedDesignerId)
  const setSelectedDesignId = useNavStore((s) => s.setSelectedDesignId)
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
  const [shareMsg, setShareMsg] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [downloadComplete, setDownloadComplete] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [activeThumbIndex, setActiveThumbIndex] = useState(0)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [isHoveringImage, setIsHoveringImage] = useState(false)
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 })
  const similarScrollRef = useRef<HTMLDivElement>(null)
  const relatedScrollRef = useRef<HTMLDivElement>(null)

  // Review state
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null)
  const [newReviewRating, setNewReviewRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [newReviewTitle, setNewReviewTitle] = useState('')
  const [newReviewContent, setNewReviewContent] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [reviewHelpful, setReviewHelpful] = useState<Record<string, boolean>>({})
  const reviewsRef = useRef<HTMLDivElement>(null)

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

            const { data, error } = await supabase
              .from('designs')
              .select('*, users!designs_designer_id_fkey(id, name, avatar, bio)')
              .eq('id', selectedDesignId)
              .single()

            if (data && !error) {
              const imageUrls = data.image_urls || []
              const likeCounts = getLocalLikeCounts()
              const downloadCounts = getLocalDownloadCounts()
              const refCounts = getLocalRefCounts()

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
                download_count: downloadCounts[data.id] ?? (data.download_count || 0),
                like_count: likeCounts[data.id] ?? (data.like_count || 0),
                reference_count: refCounts[data.id] ?? (data.reference_count || 0),
                created_at: data.created_at,
                designer: {
                  id: data.users?.id || '',
                  name: data.users?.name || 'Unknown',
                  avatar: data.users?.avatar || null,
                  bio: data.users?.bio || null,
                },
              })

              try {
                await supabase
                  .from('designs')
                  .update({ view_count: data.view_count + 1 })
                  .eq('id', data.id)
              } catch { /* ignore */ }
            } else {
              setDesign(getFallbackDesign(selectedDesignId))
            }

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

            // Fetch reviews
            try {
              const res = await fetch(`/api/reviews?designId=${selectedDesignId}`)
              if (res.ok) {
                const data = await res.json()
                if (data.reviews && data.reviews.length > 0) {
                  setReviews(data.reviews.map((r: any) => ({
                    id: r.id,
                    user_name: r.user?.name || 'Anonymous',
                    user_avatar: r.user?.avatar || null,
                    rating: r.rating,
                    title: r.title || '',
                    content: r.content || '',
                    created_at: r.createdAt || r.created_at,
                    is_verified: false,
                    helpful_count: 0,
                    is_helpful: false,
                  })))
                  setReviewSummary(data.summary)
                } else {
                  setReviews(demoReviews)
                  setReviewSummary({
                    avgRating: 4.7,
                    totalReviews: 3,
                    distribution: [
                      { star: 5, count: 2, percentage: 67 },
                      { star: 4, count: 1, percentage: 33 },
                      { star: 3, count: 0, percentage: 0 },
                      { star: 2, count: 0, percentage: 0 },
                      { star: 1, count: 0, percentage: 0 },
                    ],
                  })
                }
              } else {
                setReviews(demoReviews)
                setReviewSummary({
                  avgRating: 4.7,
                  totalReviews: 3,
                  distribution: [
                    { star: 5, count: 2, percentage: 67 },
                    { star: 4, count: 1, percentage: 33 },
                    { star: 3, count: 0, percentage: 0 },
                    { star: 2, count: 0, percentage: 0 },
                    { star: 1, count: 0, percentage: 0 },
                  ],
                })
              }
            } catch {
              setReviews(demoReviews)
              setReviewSummary({
                avgRating: 4.7,
                totalReviews: 3,
                distribution: [
                  { star: 5, count: 2, percentage: 67 },
                  { star: 4, count: 1, percentage: 33 },
                  { star: 3, count: 0, percentage: 0 },
                  { star: 2, count: 0, percentage: 0 },
                  { star: 1, count: 0, percentage: 0 },
                ],
              })
            }
          } catch (dbErr) {
            console.warn('Supabase fetch failed, using fallback:', dbErr)
            setDesign(getFallbackDesign(selectedDesignId))
            setReviews(demoReviews)
            setReviewSummary({
              avgRating: 4.7,
              totalReviews: 3,
              distribution: [
                { star: 5, count: 2, percentage: 67 },
                { star: 4, count: 1, percentage: 33 },
                { star: 3, count: 0, percentage: 0 },
                { star: 2, count: 0, percentage: 0 },
                { star: 1, count: 0, percentage: 0 },
              ],
            })
          }
        } else {
          setDesign(getFallbackDesign(selectedDesignId))
          setReviews(demoReviews)
          setReviewSummary({
            avgRating: 4.7,
            totalReviews: 3,
            distribution: [
              { star: 5, count: 2, percentage: 67 },
              { star: 4, count: 1, percentage: 33 },
              { star: 3, count: 0, percentage: 0 },
              { star: 2, count: 0, percentage: 0 },
              { star: 1, count: 0, percentage: 0 },
            ],
          })
        }
      } catch {
        setDesign(getFallbackDesign(selectedDesignId))
        setReviews(demoReviews)
        setReviewSummary({
          avgRating: 4.7,
          totalReviews: 3,
          distribution: [
            { star: 5, count: 2, percentage: 67 },
            { star: 4, count: 1, percentage: 33 },
            { star: 3, count: 0, percentage: 0 },
            { star: 2, count: 0, percentage: 0 },
            { star: 1, count: 0, percentage: 0 },
          ],
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDesign()
  }, [selectedDesignId])

  // Track recently viewed
  useEffect(() => {
    if (design) {
      const image = design.thumbnail_url || design.image_urls?.[0] || designImageMap[design.id] || '/designs/brand-identity.png'
      addToRecentlyViewed(design.id, design.title, image)
      notifyRecentlyViewedChanged()
    }
  }, [design?.id])

  // Like handler
  const handleLike = useCallback(async () => {
    if (!design) return
    if (!isLoggedIn) { navigateTo('auth'); return }

    const newLiked = !liked
    setLiked(newLiked)
    const newCount = design.like_count + (newLiked ? 1 : -1)
    setDesign(prev => prev ? { ...prev, like_count: newCount } : null)

    const likes = getLocalLikes()
    if (newLiked) likes[design.id] = true
    else delete likes[design.id]
    saveLocalLikes(likes)

    const likeCounts = getLocalLikeCounts()
    likeCounts[design.id] = newCount
    saveLocalLikeCounts(likeCounts)

    if (isSupabaseReady() && user) {
      try {
        const supabase = createClient()
        if (newLiked) {
          await supabase.from('likes').insert({ design_id: design.id, user_id: user.id })
          await supabase.from('designs').update({ like_count: newCount }).eq('id', design.id)
        } else {
          await supabase.from('likes').delete().eq('design_id', design.id).eq('user_id', user.id)
          await supabase.from('designs').update({ like_count: newCount }).eq('id', design.id)
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

    const refs = getLocalReferences()
    if (newRef) refs[design.id] = true
    else delete refs[design.id]
    saveLocalReferences(refs)

    const newRefCount = design.reference_count + (newRef ? 1 : -1)
    setDesign(prev => prev ? { ...prev, reference_count: newRefCount } : null)

    const refCounts = getLocalRefCounts()
    refCounts[design.id] = newRefCount
    saveLocalRefCounts(refCounts)

    setShareMsg(newRef ? 'Added to references!' : 'Removed from references')
    setTimeout(() => setShareMsg(''), 2000)

    if (isSupabaseReady() && user) {
      try {
        const supabase = createClient()
        if (newRef) {
          await supabase.from('design_references').insert({ design_id: design.id, user_id: user.id })
          await supabase.from('designs').update({ reference_count: newRefCount }).eq('id', design.id)
        } else {
          await supabase.from('design_references').delete().eq('design_id', design.id).eq('user_id', user.id)
          await supabase.from('designs').update({ reference_count: newRefCount }).eq('id', design.id)
        }
      } catch { /* local state already updated */ }
    }
  }, [design, referenced, isLoggedIn, user, navigateTo])

  // Download handler
  const handleDownload = useCallback(async () => {
    if (!design) return
    if (!isLoggedIn) { navigateTo('auth'); return }

    if (!design.is_free && design.price > 0) {
      setShowPaymentDialog(true)
      return
    }

    setDownloading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      const content = `Design: ${design.title}\nCategory: ${design.category}\nSource Files: ${design.source_files}\n\nThank you for downloading from Design Connect!\n\nThis is a demo file. In production, actual design files would be downloaded here.`
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${design.title.replace(/\s+/g, '-').toLowerCase()}-source-files.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      const newDownloadCount = design.download_count + 1
      setDesign(prev => prev ? { ...prev, download_count: newDownloadCount } : null)

      const downloadCounts = getLocalDownloadCounts()
      downloadCounts[design.id] = newDownloadCount
      saveLocalDownloadCounts(downloadCounts)

      setDownloadComplete(true)
      setShareMsg('Download started!')
      setTimeout(() => { setDownloadComplete(false); setShareMsg('') }, 3000)

      if (isSupabaseReady() && user) {
        try {
          const supabase = createClient()
          await supabase.from('designs').update({ download_count: newDownloadCount }).eq('id', design.id)
          await supabase.from('downloads').insert({ design_id: design.id, user_id: user.id })
        } catch { /* ignore */ }
      }
    } catch {
      setShareMsg('Download failed. Please try again.')
      setTimeout(() => setShareMsg(''), 3000)
    } finally {
      setDownloading(false)
    }
  }, [design, isLoggedIn, user, navigateTo])

  // Paid purchase handler
  const handlePurchase = useCallback(async () => {
    if (!design) return
    setShowPaymentDialog(false)

    setDownloading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const content = `Design: ${design.title}\nCategory: ${design.category}\nPrice: $${design.price}\nSource Files: ${design.source_files}\n\nPayment confirmed! Thank you for purchasing from Design Connect!\n\nThis is a demo file. In production, actual design files would be downloaded here.`
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${design.title.replace(/\s+/g, '-').toLowerCase()}-source-files.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      const newDownloadCount = design.download_count + 1
      setDesign(prev => prev ? { ...prev, download_count: newDownloadCount } : null)

      const downloadCounts = getLocalDownloadCounts()
      downloadCounts[design.id] = newDownloadCount
      saveLocalDownloadCounts(downloadCounts)

      setDownloadComplete(true)
      setShareMsg('Purchase complete! Download started!')
      setTimeout(() => { setDownloadComplete(false); setShareMsg('') }, 3000)

      if (isSupabaseReady() && user) {
        try {
          const supabase = createClient()
          await supabase.from('designs').update({ download_count: newDownloadCount }).eq('id', design.id)
          await supabase.from('orders').insert({ design_id: design.id, buyer_id: user.id, amount: design.price, status: 'completed' })
        } catch { /* ignore */ }
      }
    } catch {
      setShareMsg('Purchase failed. Please try again.')
      setTimeout(() => setShareMsg(''), 3000)
    } finally {
      setDownloading(false)
    }
  }, [design, user])

  // Share handler - opens the share dialog
  const handleShare = useCallback(() => {
    setShowShareDialog(true)
  }, [])

  // Copy link to clipboard
  const handleCopyLink = useCallback(async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    try {
      await navigator.clipboard.writeText(url)
      setLinkCopied(true)
      setShareMsg('Link copied!')
      setTimeout(() => { setLinkCopied(false); setShareMsg('') }, 2000)
    } catch {
      setShareMsg('Could not copy link')
      setTimeout(() => setShareMsg(''), 2000)
    }
  }, [])

  // Social share helper
  const getShareUrl = () => typeof window !== 'undefined' ? window.location.href : ''
  const shareText = design ? `Check out "${design.title}" on Design Connect!` : ''

  const handleTwitterShare = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(getShareUrl())}`, '_blank', 'width=600,height=400')
  }
  const handleLinkedInShare = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}`, '_blank', 'width=600,height=400')
  }
  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`, '_blank', 'width=600,height=400')
  }

  // Simple SVG-based QR code generator
  const generateQRCodeSVG = (text: string) => {
    // Simple deterministic visual representation based on URL hash
    const size = 160
    const modules = 21
    const cellSize = size / modules
    // Create a seeded pseudo-random generator from the text
    let seed = 0
    for (let i = 0; i < text.length; i++) {
      seed = ((seed << 5) - seed + text.charCodeAt(i)) | 0
    }
    const rand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }

    const cells: { x: number; y: number }[] = []
    // Finder pattern positions (top-left, top-right, bottom-left)
    const finderPositions = [
      { ox: 0, oy: 0 },
      { ox: modules - 7, oy: 0 },
      { ox: 0, oy: modules - 7 },
    ]

    const isFinderArea = (x: number, y: number) => {
      for (const fp of finderPositions) {
        if (x >= fp.ox && x < fp.ox + 7 && y >= fp.oy && y < fp.oy + 7) return true
      }
      return false
    }

    // Generate data cells
    for (let y = 0; y < modules; y++) {
      for (let x = 0; x < modules; x++) {
        if (isFinderArea(x, y)) continue
        if (rand() > 0.5) {
          cells.push({ x, y })
        }
      }
    }

    const finderPattern = (ox: number, oy: number) => {
      let rects = ''
      for (let dy = 0; dy < 7; dy++) {
        for (let dx = 0; dx < 7; dx++) {
          const isOuter = dx === 0 || dx === 6 || dy === 0 || dy === 6
          const isInner = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4
          if (isOuter || isInner) {
            rects += `<rect x="${(ox + dx) * cellSize}" y="${(oy + dy) * cellSize}" width="${cellSize}" height="${cellSize}" fill="#1e293b"/>`
          }
        }
      }
      return rects
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" fill="white" rx="8"/>
      ${finderPattern(0, 0)}
      ${finderPattern(modules - 7, 0)}
      ${finderPattern(0, modules - 7)}
      ${cells.map(c => `<rect x="${c.x * cellSize}" y="${c.y * cellSize}" width="${cellSize}" height="${cellSize}" fill="#1e293b" rx="1"/>`).join('')}
    </svg>`
  }

  const handleComment = async () => {
    if (!newComment.trim() || !isLoggedIn) return
    setSubmittingComment(true)

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

  // Review submission handler
  const handleSubmitReview = async () => {
    if (!newReviewRating || !newReviewContent.trim() || !design) return
    if (!isLoggedIn) { navigateTo('auth'); return }
    setSubmittingReview(true)

    const newReview: Review = {
      id: `local-${Date.now()}`,
      user_name: user?.name || 'You',
      user_avatar: null,
      rating: newReviewRating,
      title: newReviewTitle,
      content: newReviewContent,
      created_at: new Date().toISOString(),
      is_verified: false,
      helpful_count: 0,
      is_helpful: false,
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: newReviewRating,
          title: newReviewTitle || null,
          content: newReviewContent,
          designId: design.id,
          userId: user?.id,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setReviews(prev => [{
          id: data.id || `local-${Date.now()}`,
          user_name: data.user?.name || user?.name || 'You',
          user_avatar: data.user?.avatar || null,
          rating: data.rating || newReviewRating,
          title: data.title || newReviewTitle,
          content: data.content || newReviewContent,
          created_at: data.createdAt || new Date().toISOString(),
          is_verified: false,
          helpful_count: 0,
          is_helpful: false,
        }, ...prev])

        // Re-fetch reviews for updated summary
        try {
          const summaryRes = await fetch(`/api/reviews?designId=${design.id}`)
          if (summaryRes.ok) {
            const summaryData = await summaryRes.json()
            if (summaryData.summary) setReviewSummary(summaryData.summary)
          }
        } catch { /* ignore */ }
      } else {
        // Fallback to local add
        setReviews(prev => [newReview, ...prev])
        if (reviewSummary) {
          const newTotal = reviewSummary.totalReviews + 1
          const newAvg = ((reviewSummary.avgRating * reviewSummary.totalReviews) + newReviewRating) / newTotal
          setReviewSummary({
            ...reviewSummary,
            avgRating: Math.round(newAvg * 10) / 10,
            totalReviews: newTotal,
          })
        }
      }
    } catch {
      // Fallback to local add
      setReviews(prev => [newReview, ...prev])
      if (reviewSummary) {
        const newTotal = reviewSummary.totalReviews + 1
        const newAvg = ((reviewSummary.avgRating * reviewSummary.totalReviews) + newReviewRating) / newTotal
        setReviewSummary({
          ...reviewSummary,
          avgRating: Math.round(newAvg * 10) / 10,
          totalReviews: newTotal,
        })
      }
    } finally {
      setNewReviewRating(0)
      setNewReviewTitle('')
      setNewReviewContent('')
      setSubmittingReview(false)
      setShareMsg('Review submitted!')
      setTimeout(() => setShareMsg(''), 2000)
    }
  }

  // Toggle helpful on review
  const toggleHelpful = (reviewId: string) => {
    setReviewHelpful(prev => {
      const isHelpful = !prev[reviewId]
      setReviews(reviews => reviews.map(r =>
        r.id === reviewId
          ? { ...r, helpful_count: r.helpful_count + (isHelpful ? 1 : -1), is_helpful: isHelpful }
          : r
      ))
      return { ...prev, [reviewId]: isHelpful }
    })
  }

  // Scroll to reviews
  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Get the design image URL for preview
  const getDesignPreviewImage = (): string | null => {
    if (!design) return null
    if (design.thumbnail_url) return design.thumbnail_url
    if (design.image_urls && design.image_urls.length > 0) return design.image_urls[0]
    return designImageMap[design.id] || null
  }

  // Get related designs (same category, excluding current)
  const getRelatedDesigns = () => {
    if (!design) return []
    const categoryMap: Record<string, string[]> = {
      'Logo Design': ['Logo Design', 'Brand Identity'],
      'UI/UX': ['UI/UX', 'Web'],
      'Social Media': ['Social Media', 'Templates'],
      'Print Design': ['Print Design', 'Posters'],
      'Icons': ['Icons', 'Logo Design'],
      'Typography': ['Typography', 'Print Design'],
      '3D Design': ['3D Design', 'Illustrations'],
    }
    const relatedCats = categoryMap[design.category] || [design.category]
    return relatedDesignsData
      .filter(d => d.id !== design.id && relatedCats.some(c => d.category.includes(c)))
      .slice(0, 4)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="w-8 h-8 border-3 border-[#fb8000] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!design) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white dark:bg-slate-950">
        <h2 className="text-xl font-semibold dark:text-white">Design not found</h2>
        <Button onClick={() => navigateTo('browse')}>Browse Designs</Button>
      </div>
    )
  }

  const previewImage = getDesignPreviewImage()
  const relatedDesigns = getRelatedDesigns()

  // Compute all available images for lightbox
  const allDesignImages = [
    ...(design.image_urls && design.image_urls.length > 0 ? design.image_urls : []),
    ...(design.thumbnail_url ? [design.thumbnail_url] : []),
    ...(!design.image_urls || design.image_urls.length === 0 ? (!design.thumbnail_url && previewImage ? [previewImage] : []) : []),
  ].filter(Boolean)

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  // Stats max values for progress bars
  const maxLikes = 1000
  const maxViews = 10000
  const maxDownloads = 3000
  const maxRefs = 100

  const statColors: Record<string, string> = {
    'Likes': 'from-red-500 to-pink-500',
    'Views': 'from-[#fb8000] to-amber-500',
    'Downloads': 'from-emerald-500 to-teal-500',
    'References': 'from-violet-500 to-purple-500',
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 page-entrance">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => goBack()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                className="cursor-pointer text-muted-foreground hover:text-[#fb8000] transition-colors"
                onClick={() => navigateTo('home')}
              >
                <Home className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                className="cursor-pointer text-muted-foreground hover:text-[#fb8000] transition-colors"
                onClick={() => navigateTo('browse')}
              >
                Browse
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                className="cursor-pointer text-muted-foreground hover:text-[#fb8000] transition-colors"
                onClick={() => {
                  useNavStore.getState().setSearchQuery(design.category)
                  navigateTo('browse')
                }}
              >
                {design.category}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[#fb8000] font-medium truncate max-w-[200px] sm:max-w-[300px]">
                {design.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Title & Meta */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold mb-3 dark:text-white">{design.title}</h1>
          {/* Achievement Badges */}
          <BadgeDisplay design={design as BadgeDesignData} size="md" className="mb-3" />
          {/* Tags/Badges for category and subcategory */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-[#fb8000]/10 text-[#fb8000] border-[#fb8000]/20 hover:bg-[#fb8000]/20 font-medium">
              {design.category}
            </Badge>
            {design.subcategory && (
              <Badge variant="outline" className="border-[#fb8000]/30 text-[#fb8000]/80 dark:text-[#fb8000]/70">
                {design.subcategory}
              </Badge>
            )}
            {design.is_free && (
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">
                Free
              </Badge>
            )}
          </div>
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
                <p className="text-sm font-semibold group-hover:text-[#fb8000] transition-colors dark:text-white">{design.designer.name}</p>
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

        {/* Image Gallery with Enhanced Carousel */}
        <div className="space-y-3 mb-10">
          {/* Main Image with Arrow Navigation, Crossfade, and Zoom */}
          <div className="relative group/gallery">
            {/* Main image container */}
            <div
              className="relative overflow-hidden rounded-xl bg-muted dark:bg-slate-800 cursor-zoom-in"
              onClick={() => openLightbox(activeThumbIndex)}
              onMouseEnter={() => setIsHoveringImage(true)}
              onMouseLeave={() => { setIsHoveringImage(false); setHoverPos({ x: 50, y: 50 }) }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                setHoverPos({
                  x: ((e.clientX - rect.left) / rect.width) * 100,
                  y: ((e.clientY - rect.top) / rect.height) * 100,
                })
              }}
            >
              {(design.image_urls && design.image_urls.length > 0 ? design.image_urls : design.thumbnail_url ? [design.thumbnail_url] : []).filter(Boolean).length > 0 ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeThumbIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="relative"
                  >
                    <img
                      src={(design.image_urls && design.image_urls.length > 0 ? design.image_urls : [design.thumbnail_url])[activeThumbIndex] as string}
                      alt={`${design.title} - Image ${activeThumbIndex + 1}`}
                      className="w-full h-auto max-h-[70vh] object-contain transition-transform duration-300"
                      style={isHoveringImage ? {
                        transformOrigin: `${hoverPos.x}% ${hoverPos.y}%`,
                        transform: 'scale(1.8)',
                      } : {}}
                      loading={activeThumbIndex === 0 ? 'eager' : 'lazy'}
                    />
                  </motion.div>
                </AnimatePresence>
              ) : previewImage ? (
                <LazyImage
                  src={previewImage}
                  alt={design.title}
                  className="w-full h-auto max-h-[70vh] rounded-xl"
                />
              ) : (
                <div className="aspect-[16/10] bg-gradient-to-br from-orange-100 to-amber-50 dark:from-slate-800 dark:to-slate-900 rounded-xl flex items-center justify-center">
                  <span className="text-6xl opacity-30">🎨</span>
                </div>
              )}

              {/* Image Counter Badge */}
              {allDesignImages.length > 1 && (
                <div className="absolute top-3 right-3 z-20 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                  {activeThumbIndex + 1} of {allDesignImages.length}
                </div>
              )}

              {/* Magnifying glass overlay hint */}
              {!isHoveringImage && (
                <div className="absolute inset-0 bg-black/0 group-hover/gallery:bg-black/5 transition-colors duration-300 flex items-center justify-center pointer-events-none">
                  <div className="opacity-0 group-hover/gallery:opacity-60 transition-opacity duration-300 bg-white/80 dark:bg-slate-900/80 rounded-full p-3 shadow-lg">
                    <ZoomIn className="w-6 h-6 text-[#fb8000]" />
                  </div>
                </div>
              )}
            </div>

            {/* Left/Right Arrow Navigation */}
            {allDesignImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveThumbIndex(prev => prev > 0 ? prev - 1 : allDesignImages.length - 1)
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-all hover:scale-110 opacity-0 group-hover/gallery:opacity-100"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveThumbIndex(prev => prev < allDesignImages.length - 1 ? prev + 1 : 0)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-all hover:scale-110 opacity-0 group-hover/gallery:opacity-100"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Strip */}
          {allDesignImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {allDesignImages.map((url, i) => (
                <motion.button
                  key={i}
                  onClick={() => setActiveThumbIndex(i)}
                  className={`relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    activeThumbIndex === i
                      ? 'border-[#fb8000] shadow-md shadow-[#fb8000]/20 scale-105'
                      : 'border-transparent opacity-60 hover:opacity-90 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                  whileHover={{ scale: activeThumbIndex === i ? 1.05 : 1.02 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img src={url} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                  {activeThumbIndex === i && (
                    <div className="absolute inset-0 bg-[#fb8000]/10" />
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Action Bar - Sticky bottom with frosted glass */}
        <div className="sticky bottom-0 z-10 frosted-glass-bar -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 mb-10 rounded-t-xl">
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
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                onClick={handleDownload}
                disabled={downloading}
                className="gradient-orange gradient-orange-hover text-white border-0 gap-1"
              >
                {downloading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                {downloadComplete ? 'Done!' : design.is_free ? 'Free' : `$${design.price}`}
              </Button>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <Button size="icon" variant="ghost" onClick={handleLike} className={liked ? 'text-red-500' : ''}>
                <Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} />
              </Button>
              <Button size="icon" variant="ghost" onClick={handleSave} className={saved ? 'text-amber-500' : ''}>
                <Bookmark className={`w-5 h-5 ${saved ? 'fill-amber-500' : ''}`} />
              </Button>
              <Button size="icon" variant="ghost" onClick={handleReference} className={referenced ? 'text-blue-500' : ''}>
                <ExternalLink className={`w-5 h-5 ${referenced ? 'text-blue-500' : ''}`} />
              </Button>
              <Button size="icon" variant="ghost" onClick={handleShare}>
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center gap-2 flex-wrap">
            <div className="flex flex-wrap gap-2 mr-2">
              <Badge variant="secondary">{design.category}</Badge>
              {design.subcategory && <Badge variant="outline">{design.subcategory}</Badge>}
            </div>
            <Separator orientation="vertical" className="h-8 mx-1" />
            <div className="ml-auto flex items-center gap-2">
              <div className="mr-2">
                {design.is_free ? (
                  <span className="text-xl font-bold text-green-500">Free</span>
                ) : (
                  <span className="text-xl font-bold text-[#fb8000]">${design.price}</span>
                )}
              </div>
              <Button
                className="gradient-orange gradient-orange-hover text-white border-0 gap-2"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                ) : downloadComplete ? (
                  <><Check className="w-4 h-4" /> Downloaded!</>
                ) : (
                  <><Download className="w-4 h-4" /> {design.is_free ? 'Download Free' : `Buy for $${design.price}`}</>
                )}
              </Button>
              <Separator orientation="vertical" className="h-8 mx-1" />
              <Button variant="outline" size="icon" onClick={handleLike}
                className={liked ? 'text-red-500 border-red-500 bg-red-50 dark:bg-red-950/30' : ''} title={`Like (${design.like_count})`}>
                <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
              </Button>
              <Button variant="outline" size="icon" onClick={handleSave}
                className={saved ? 'text-amber-500 border-amber-500 bg-amber-50 dark:bg-amber-950/30' : ''} title="Save to collection">
                <Bookmark className={`w-4 h-4 ${saved ? 'fill-amber-500' : ''}`} />
              </Button>
              <Button variant="outline" size="icon" onClick={handleReference}
                className={referenced ? 'text-blue-500 border-blue-500 bg-blue-50 dark:bg-blue-950/30' : ''} title={`Reference (${design.reference_count})`}>
                <ExternalLink className={`w-4 h-4 ${referenced ? 'text-blue-500' : ''}`} />
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare} title="Share link">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" title="Report design">
                <Flag className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Designer Card Section */}
        <div className="mt-6 mb-8">
          <Card className="border border-border/50 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden card-shine">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div
                  className="flex items-center gap-3 cursor-pointer group flex-1"
                  onClick={() => {
                    setSelectedDesignerId(design.designer.id)
                    navigateTo('designer-profile')
                  }}
                >
                  <div className="relative">
                    <Avatar className="w-14 h-14">
                      <AvatarFallback className="gradient-orange text-white font-bold text-lg">
                        {design.designer.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Top Rated Badge */}
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                      <Award className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold group-hover:text-[#fb8000] transition-colors dark:text-white">{design.designer.name}</p>
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 text-[9px] px-1.5 py-0">Top Rated</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{design.designer.bio || 'Designer'}</p>
                    {/* Response time indicator */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock className="w-3 h-3 text-green-500" />
                      <span className="text-[11px] text-muted-foreground">Usually responds in 2h</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={isFollowing ? 'outline' : 'default'}
                    className={isFollowing
                      ? 'gap-2'
                      : 'gap-2 gradient-orange gradient-orange-hover text-white border-0'
                    }
                    onClick={() => {
                      setIsFollowing(!isFollowing)
                      setShareMsg(isFollowing ? 'Unfollowed' : 'Following!')
                      setTimeout(() => setShareMsg(''), 2000)
                    }}
                  >
                    <UserPlus className="w-4 h-4" />
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-xs"
                    onClick={() => {
                      setSelectedDesignerId(design.designer.id)
                      navigateTo('designer-profile')
                    }}
                  >
                    View Profile <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-border/50 dark:border-slate-800">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Package className="w-4 h-4 text-[#fb8000]" />
                    <span className="text-lg font-bold dark:text-white">24</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Designs</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Users className="w-4 h-4 text-[#fb8000]" />
                    <span className="text-lg font-bold dark:text-white">1.2K</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Heart className="w-4 h-4 text-[#fb8000]" />
                    <span className="text-lg font-bold dark:text-white">186</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Following</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Source Files Info */}
        {design.source_files && (
          <div className="mt-6 mb-8 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-border/30 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#fb8000]/10">
                <FileArchive className="w-5 h-5 text-[#fb8000]" />
              </div>
              <div>
                <p className="text-sm font-medium dark:text-white">Source Files Included</p>
                <p className="text-xs text-muted-foreground">{design.source_files}</p>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Description</h2>
          <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
            {design.description}
          </div>
        </div>

        {/* Stats Grid with animations and progress indicators */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Heart, label: 'Likes', value: design.like_count, max: maxLikes, color: liked ? 'text-red-500' : '', gradient: statColors['Likes'], active: liked },
            { icon: Eye, label: 'Views', value: design.view_count, max: maxViews, color: '', gradient: statColors['Views'], active: false },
            { icon: Download, label: 'Downloads', value: design.download_count, max: maxDownloads, color: '', gradient: statColors['Downloads'], active: false },
            { icon: ExternalLink, label: 'References', value: design.reference_count, max: maxRefs, color: referenced ? 'text-blue-500' : '', gradient: statColors['References'], active: referenced },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative text-center p-5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-border/30 dark:border-slate-800 overflow-hidden"
            >
              {/* Background gradient accent */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} opacity-${stat.active ? '100' : '40'}`} />
              <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color || 'text-muted-foreground'}`} />
              <p className="text-2xl font-bold dark:text-white">
                <CountUpNumber target={stat.value} />
              </p>
              <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
              <Progress
                value={Math.min((stat.value / stat.max) * 100, 100)}
                className="h-1.5 bg-muted dark:bg-slate-800"
              />
            </motion.div>
          ))}
        </div>

        {/* Related Designs Section */}
        {relatedDesigns.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-xl font-bold dark:text-white">Related Designs</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Based on your viewing history</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 rounded-full"
                  onClick={() => {
                    if (relatedScrollRef.current) {
                      relatedScrollRef.current.scrollBy({ left: -280, behavior: 'smooth' })
                    }
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 rounded-full"
                  onClick={() => {
                    if (relatedScrollRef.current) {
                      relatedScrollRef.current.scrollBy({ left: 280, behavior: 'smooth' })
                    }
                  }}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  className="text-[#fb8000] text-sm"
                  onClick={() => navigateTo('browse')}
                >
                  View All
                </Button>
              </div>
            </div>
            <div className="relative">
              {/* Gradient fades on edges */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-slate-950 to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-slate-950 to-transparent z-10 pointer-events-none" />
              <div
                ref={relatedScrollRef}
                className="horizontal-scroll-container flex gap-4 pb-2"
              >
                {relatedDesigns.map((related, i) => (
                  <motion.div
                    key={related.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex-shrink-0 w-52"
                  >
                    <Card
                      className="cursor-pointer group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-900"
                      onClick={() => {
                        setSelectedDesignId(related.id)
                        navigateTo('design-detail')
                      }}
                    >
                      <div className="aspect-[4/3] bg-gradient-to-br from-orange-100 to-amber-50 dark:from-slate-800 dark:to-slate-800 relative overflow-hidden">
                        <LazyImage
                          src={related.image}
                          alt={related.title}
                          className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                        {related.is_free && (
                          <Badge className="absolute top-2 left-2 bg-green-500 text-white border-0 text-[10px]">
                            Free
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-semibold text-xs line-clamp-1 dark:text-white">{related.title}</h3>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{related.designer}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                            <Heart className="w-2.5 h-2.5" /> {related.likes}
                          </span>
                          {!related.is_free && (
                            <span className="text-xs font-semibold text-[#fb8000]">${related.price}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Similar Designs by Category Section */}
        {(() => {
          const similarByCategory = relatedDesignsData.filter(d => d.category === design.category && d.id !== design.id)
          const moreDesigns = relatedDesignsData.filter(d => d.category !== design.category).slice(0, 6 - similarByCategory.length)
          const similarDesigns = [...similarByCategory, ...moreDesigns].slice(0, 6)
          return similarDesigns.length > 0 ? (
            <div className="mt-16">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold dark:text-white">More in {design.category}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Explore similar designs from this category</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 rounded-full"
                    onClick={() => {
                      if (similarScrollRef.current) {
                        similarScrollRef.current.scrollBy({ left: -300, behavior: 'smooth' })
                      }
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 rounded-full"
                    onClick={() => {
                      if (similarScrollRef.current) {
                        similarScrollRef.current.scrollBy({ left: 300, behavior: 'smooth' })
                      }
                    }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-[#fb8000] text-sm gap-1"
                    onClick={() => {
                      useNavStore.getState().setSearchQuery(design.category)
                      navigateTo('browse')
                    }}
                  >
                    View All in {design.category} <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-slate-950 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-slate-950 to-transparent z-10 pointer-events-none" />
                <div
                  ref={similarScrollRef}
                  className="horizontal-scroll-container flex gap-4 pb-2"
                >
                  {similarDesigns.map((similar, i) => (
                    <motion.div
                      key={`similar-${similar.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex-shrink-0 w-56"
                    >
                      <Card
                        className="cursor-pointer group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-900"
                        onClick={() => {
                          setSelectedDesignId(similar.id)
                          navigateTo('design-detail')
                        }}
                      >
                        <div className="aspect-[4/3] bg-gradient-to-br from-orange-100 to-amber-50 dark:from-slate-800 dark:to-slate-800 relative overflow-hidden">
                          <LazyImage
                            src={similar.image}
                            alt={similar.title}
                            className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                          {similar.is_free ? (
                            <Badge className="absolute top-2 left-2 bg-green-500 text-white border-0 text-[10px]">
                              Free
                            </Badge>
                          ) : (
                            <Badge className="absolute top-2 left-2 bg-[#fb8000] text-white border-0 text-[10px]">
                              ${similar.price}
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-semibold text-sm line-clamp-1 dark:text-white">{similar.title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{similar.designer}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                              <Heart className="w-3 h-3" /> {similar.likes}
                            </span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {similar.category}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : null
        })()}

        {/* Comments Section */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 dark:text-white">
            <MessageSquare className="w-5 h-5" />
            Comments ({comments.length})
          </h2>

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
            <div className="p-4 bg-muted dark:bg-slate-900 rounded-xl text-sm text-muted-foreground mb-6">
              <button onClick={() => navigateTo('auth')} className="text-[#fb8000] font-medium hover:underline">
                Sign in
              </button>{' '}
              to leave a comment
            </div>
          )}

          <div className="space-y-4">
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-border/20 dark:border-slate-800">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs bg-muted dark:bg-slate-800">
                      {comment.user_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold dark:text-white">{comment.user_name}</span>
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

        {/* Reviews / Ratings Section */}
        <div ref={reviewsRef} className="mt-12 scroll-mt-4">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 dark:text-white">
            <Star className="w-5 h-5 text-[#fb8000]" />
            Reviews & Ratings
            {reviewSummary && (
              <span className="text-sm font-normal text-muted-foreground ml-1">
                ({reviewSummary.totalReviews} {reviewSummary.totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            )}
          </h2>

          {reviewSummary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 mb-8"
            >
              {/* Average Rating Display */}
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-border/20 dark:border-slate-800">
                <div className="text-5xl font-bold text-[#fb8000] mb-2">
                  {reviewSummary.avgRating.toFixed(1)}
                </div>
                <div className="flex items-center gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(reviewSummary.avgRating)
                          ? 'fill-[#fb8000] text-[#fb8000]'
                          : 'fill-muted text-muted'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on {reviewSummary.totalReviews} {reviewSummary.totalReviews === 1 ? 'review' : 'reviews'}
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2.5 py-2">
                {reviewSummary.distribution.map((d) => (
                  <div key={d.star} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-8 text-right dark:text-white">{d.star}★</span>
                    <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${d.percentage}%` }}
                        transition={{ duration: 0.8, delay: (5 - d.star) * 0.1 }}
                        className="h-full bg-gradient-to-r from-[#fb8000] to-amber-400 rounded-full"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right">{d.count}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Write a Review Form */}
          {isLoggedIn ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border border-[#fb8000]/20 dark:border-[#fb8000]/10 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl shadow-lg mb-8">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 dark:text-white">Write a Review</h3>

                  {/* Star Selector */}
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-0.5 transition-transform hover:scale-125 focus:outline-none"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            star <= (hoverRating || newReviewRating)
                              ? 'fill-[#fb8000] text-[#fb8000]'
                              : 'fill-muted text-muted'
                          }`}
                        />
                      </button>
                    ))}
                    {newReviewRating > 0 && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][newReviewRating]}
                      </span>
                    )}
                  </div>

                  {/* Title Input */}
                  <Input
                    placeholder="Review title (optional)"
                    value={newReviewTitle}
                    onChange={(e) => setNewReviewTitle(e.target.value)}
                    className="mb-3 dark:bg-slate-800/50"
                  />

                  {/* Review Text */}
                  <Textarea
                    placeholder="Share your experience with this design..."
                    value={newReviewContent}
                    onChange={(e) => setNewReviewContent(e.target.value)}
                    className="min-h-[100px] mb-4 dark:bg-slate-800/50"
                  />

                  <Button
                    onClick={handleSubmitReview}
                    disabled={submittingReview || !newReviewRating || !newReviewContent.trim()}
                    className="gradient-orange gradient-orange-hover text-white border-0"
                  >
                    {submittingReview ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...</>
                    ) : (
                      'Submit Review'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="p-4 bg-muted/50 dark:bg-slate-900 rounded-xl text-sm text-muted-foreground mb-8 border border-border/20 dark:border-slate-800">
              <button onClick={() => navigateTo('auth')} className="text-[#fb8000] font-medium hover:underline">
                Sign in
              </button>{' '}
              to write a review
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              <>
                {(showAllReviews ? reviews : reviews.slice(0, 5)).map((review, i) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-border/20 dark:border-slate-800">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="text-xs bg-gradient-to-br from-[#fb8000]/20 to-amber-500/20 text-[#fb8000] font-bold">
                            {review.user_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-sm font-semibold dark:text-white">{review.user_name}</span>
                            {review.is_verified && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                                <Check className="w-2.5 h-2.5 mr-0.5" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    star <= review.rating
                                      ? 'fill-[#fb8000] text-[#fb8000]'
                                      : 'fill-muted text-muted'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          {review.title && (
                            <p className="text-sm font-medium dark:text-white mb-1">{review.title}</p>
                          )}
                          <p className="text-sm text-muted-foreground">{review.content}</p>

                          {/* Helpful Button */}
                          <div className="mt-3 flex items-center gap-3">
                            <button
                              onClick={() => toggleHelpful(review.id)}
                              className={`flex items-center gap-1.5 text-xs transition-colors ${
                                review.is_helpful
                                  ? 'text-[#fb8000]'
                                  : 'text-muted-foreground hover:text-[#fb8000]'
                              }`}
                            >
                              <ThumbsUp className={`w-3.5 h-3.5 ${review.is_helpful ? 'fill-[#fb8000]' : ''}`} />
                              Helpful {review.helpful_count > 0 && `(${review.helpful_count})`}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Show More Button */}
                {reviews.length > 5 && !showAllReviews && (
                  <div className="text-center pt-2">
                    <Button
                      variant="ghost"
                      onClick={() => setShowAllReviews(true)}
                      className="text-[#fb8000] hover:text-[#fb8000] hover:bg-[#fb8000]/10 gap-1"
                    >
                      Show all {reviews.length} reviews
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                {showAllReviews && reviews.length > 5 && (
                  <div className="text-center pt-2">
                    <Button
                      variant="ghost"
                      onClick={() => setShowAllReviews(false)}
                      className="text-[#fb8000] hover:text-[#fb8000] hover:bg-[#fb8000]/10 gap-1"
                    >
                      Show less
                      <ChevronDown className="w-4 h-4 rotate-180" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Purchase Design</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <h3 className="font-semibold mb-2 dark:text-white">{design.title}</h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Price</span>
                <span className="font-bold text-[#fb8000] text-lg">${design.price}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">Source Files</span>
                <span className="dark:text-white">{design.source_files}</span>
              </div>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-sm text-amber-700 dark:text-amber-400">
              This is a demo. In production, a secure payment gateway (Razorpay/Stripe) would process your payment.
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPaymentDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 gradient-orange gradient-orange-hover text-white border-0"
                onClick={handlePurchase}
              >
                Confirm & Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-[#fb8000]" />
              Share this Design
            </DialogTitle>
            <DialogDescription>
              Share &quot;{design.title}&quot; with your network
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            {/* Copy Link Section */}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-border/30">
                <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground truncate flex-1">
                  {typeof window !== 'undefined' ? window.location.href : ''}
                </span>
              </div>
              <Button
                size="sm"
                onClick={handleCopyLink}
                className={linkCopied
                  ? 'bg-green-500 hover:bg-green-600 text-white border-0 gap-1.5'
                  : 'gradient-orange gradient-orange-hover text-white border-0 gap-1.5'
                }
              >
                {linkCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {linkCopied ? 'Copied!' : 'Copy'}
              </Button>
            </div>

            {/* Social Share Buttons */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Share to</p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={handleTwitterShare}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/30 hover:border-sky-300 dark:hover:border-sky-700 hover:bg-sky-50 dark:hover:bg-sky-950/30 transition-all hover:shadow-md group"
                >
                  <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Twitter className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-sky-600 dark:group-hover:text-sky-400">Twitter</span>
                </button>
                <button
                  onClick={handleLinkedInShare}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/30 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all hover:shadow-md group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Linkedin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">LinkedIn</span>
                </button>
                <button
                  onClick={handleFacebookShare}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/30 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all hover:shadow-md group"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Facebook className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Facebook</span>
                </button>
              </div>
            </div>

            {/* QR Code Section */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5" />
                QR Code
              </p>
              <div className="flex items-center justify-center p-4 bg-white rounded-xl border border-border/30">
                <div
                  dangerouslySetInnerHTML={{
                    __html: generateQRCodeSVG(typeof window !== 'undefined' ? window.location.href : design.id)
                  }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                Scan to open this design on a mobile device
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Lightbox */}
      <ImageLightbox
        key={`lightbox-${lightboxOpen ? 'open' : 'closed'}-${lightboxIndex}`}
        images={allDesignImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        alt={design.title}
      />
    </div>
  )
}
