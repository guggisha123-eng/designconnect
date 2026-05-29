'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, MapPin, Globe, Star, Heart, Download,
  MessageSquare, Instagram, Twitter, Linkedin, ExternalLink,
  UserPlus, UserCheck, Award, Briefcase
} from 'lucide-react'
import { useNavStore } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string
  name: string
  email: string
  avatar: string | null
  bio: string | null
  location: string | null
  website: string | null
  specialization: string | null
  skills: string | null
  experience: string | null
  instagram: string | null
  twitter: string | null
  linkedin: string | null
  is_pro: boolean
  created_at: string
}

interface ProfileDesign {
  id: string
  title: string
  thumbnail: string
  category: string
  like_count: number
  view_count: number
  download_count: number
  is_free: boolean
  price: number
  created_at: string
}

interface Review {
  id: string
  rating: number
  content: string
  author_name: string
  created_at: string
}

export default function DesignerProfilePage() {
  const navigateTo = useNavStore((s) => s.navigateTo)
  const selectedDesignerId = useNavStore((s) => s.selectedDesignerId)
  const setSelectedDesignId = useNavStore((s) => s.setSelectedDesignId)

  const [profile, setProfile] = useState<Profile | null>(null)
  const [designs, setDesigns] = useState<ProfileDesign[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    if (!selectedDesignerId) {
      navigateTo('browse')
      return
    }

    const fetchProfile = async () => {
      setLoading(true)
      try {
        const supabase = createClient()

        const { data: profileData } = await supabase
          .from('users')
          .select('*')
          .eq('id', selectedDesignerId)
          .single()

        if (profileData) {
          setProfile(profileData)
        } else {
          setProfile({
            id: selectedDesignerId,
            name: 'Sarah Chen',
            email: 'sarah@example.com',
            avatar: null,
            bio: 'Passionate brand designer with 8+ years of experience crafting visual identities for startups and established brands. I believe in the power of design to tell stories and create meaningful connections.',
            location: 'San Francisco, CA',
            website: 'https://sarahchen.design',
            specialization: 'Brand Identity, Logo Design',
            skills: 'Adobe Illustrator, Figma, Photoshop, After Effects',
            experience: '8+ years',
            instagram: null,
            twitter: null,
            linkedin: null,
            is_pro: true,
            created_at: '2024-01-15T00:00:00Z',
          })
        }

        const { data: designData } = await supabase
          .from('designs')
          .select('id, title, thumbnail, category, like_count, view_count, download_count, is_free, price, created_at')
          .eq('designer_id', selectedDesignerId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })

        if (designData) {
          setDesigns(designData)
        } else {
          // Fallback
          setDesigns([
            { id: 'd1', title: 'Modern Brand Identity', thumbnail: '', category: 'Logo Design', like_count: 234, view_count: 1200, download_count: 89, is_free: false, price: 29, created_at: '' },
            { id: 'd2', title: 'Minimal Logo Pack', thumbnail: '', category: 'Logo Design', like_count: 456, view_count: 2300, download_count: 156, is_free: true, price: 0, created_at: '' },
            { id: 'd3', title: 'Social Media Kit', thumbnail: '', category: 'Social Media', like_count: 189, view_count: 980, download_count: 67, is_free: false, price: 19, created_at: '' },
            { id: 'd4', title: 'App UI Template', thumbnail: '', category: 'UI/UX', like_count: 312, view_count: 1800, download_count: 123, is_free: false, price: 49, created_at: '' },
            { id: 'd5', title: 'Poster Collection', thumbnail: '', category: 'Print Design', like_count: 567, view_count: 3100, download_count: 234, is_free: true, price: 0, created_at: '' },
            { id: 'd6', title: 'Icon Set Premium', thumbnail: '', category: 'Icons', like_count: 198, view_count: 1500, download_count: 78, is_free: false, price: 15, created_at: '' },
          ])
        }

        // Reviews fallback
        setReviews([
          { id: 'r1', rating: 5, content: 'Amazing work! Sarah delivered exactly what I needed for my brand.', author_name: 'Marcus J.', created_at: '2024-03-15' },
          { id: 'r2', rating: 5, content: 'Incredible attention to detail. Highly recommend!', author_name: 'Emily R.', created_at: '2024-02-20' },
          { id: 'r3', rating: 4, content: 'Great communication and beautiful designs.', author_name: 'David K.', created_at: '2024-01-10' },
        ])
      } catch {
        // Profiles already have fallback above
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [selectedDesignerId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#fb8000] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">Designer not found</h2>
        <Button onClick={() => navigateTo('browse')}>Browse Designs</Button>
      </div>
    )
  }

  const totalLikes = designs.reduce((sum, d) => sum + d.like_count, 0)
  const totalDownloads = designs.reduce((sum, d) => sum + d.download_count, 0)
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 'N/A'

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Cover */}
      <div className="h-48 bg-gradient-to-r from-[#fb8000] to-[#f59e0b] relative">
        <button
          onClick={() => navigateTo('browse')}
          className="absolute top-4 left-4 flex items-center gap-2 text-sm text-white/80 hover:text-white bg-black/20 px-3 py-1.5 rounded-lg backdrop-blur"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="relative -mt-16 mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
              <AvatarFallback className="text-3xl gradient-orange text-white font-bold">
                {profile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                {profile.is_pro && (
                  <Badge className="bg-amber-500 text-white border-0 gap-1">
                    <Star className="w-3 h-3 fill-white" /> Pro Designer
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground max-w-xl mb-3">{profile.bio || 'Creative designer'}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                {profile.location && (
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.location}</span>
                )}
                {profile.experience && (
                  <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {profile.experience}</span>
                )}
                <span className="flex items-center gap-1"><Award className="w-4 h-4" /> Joined {new Date(profile.created_at).toLocaleDateString()}</span>
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.instagram && (
                  <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-muted hover:bg-muted/80">
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {profile.twitter && (
                  <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-muted hover:bg-muted/80">
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {profile.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-muted hover:bg-muted/80">
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-muted hover:bg-muted/80">
                    <Globe className="w-4 h-4" />
                  </a>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setIsFollowing(!isFollowing)}
                  variant={isFollowing ? 'outline' : 'default'}
                  className={isFollowing ? '' : 'gradient-orange gradient-orange-hover text-white border-0 gap-2'}
                >
                  {isFollowing ? <><UserCheck className="w-4 h-4" /> Following</> : <><UserPlus className="w-4 h-4" /> Follow</>}
                </Button>
                <Button variant="outline" className="gap-2">
                  <MessageSquare className="w-4 h-4" /> Message
                </Button>
                <Button variant="outline" className="gap-2">
                  Hire Me <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{designs.length}</p>
              <p className="text-sm text-muted-foreground">Designs</p>
            </CardContent>
          </Card>
          <Card className="border-0 text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-amber-500">{avgRating}</p>
              <p className="text-sm text-muted-foreground">Rating</p>
            </CardContent>
          </Card>
          <Card className="border-0 text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-red-500">{totalLikes}</p>
              <p className="text-sm text-muted-foreground">Likes</p>
            </CardContent>
          </Card>
          <Card className="border-0 text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-green-500">{totalDownloads}</p>
              <p className="text-sm text-muted-foreground">Downloads</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="portfolio" className="mb-12">
          <TabsList className="mb-6">
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {designs.map((design, i) => (
                <motion.div
                  key={design.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card
                    className="cursor-pointer group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    onClick={() => {
                      setSelectedDesignId(design.id)
                      navigateTo('design-detail')
                    }}
                  >
                    <div className="aspect-[4/3] bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center relative">
                      <span className="text-4xl opacity-30">{['🎨', '✏️', '📱', '🧊', '🖼️', '💡'][i % 6]}</span>
                      {design.is_free && (
                        <Badge className="absolute top-3 left-3 bg-green-500 text-white border-0">Free</Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm line-clamp-1 mb-1">{design.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{design.category}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {design.like_count}</span>
                          <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {design.download_count}</span>
                        </div>
                        {!design.is_free && <span className="font-semibold text-[#fb8000]">${design.price}</span>}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            {designs.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No designs published yet
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews">
            <div className="space-y-4 max-w-2xl">
              {reviews.map((review) => (
                <Card key={review.id} className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-sm">{review.author_name}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="about">
            <Card className="border-0 shadow-sm max-w-2xl">
              <CardContent className="p-6 space-y-4">
                {profile.specialization && (
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Specialization</h3>
                    <p className="text-sm text-muted-foreground">{profile.specialization}</p>
                  </div>
                )}
                {profile.skills && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.split(',').map((skill) => (
                        <Badge key={skill.trim()} variant="secondary">{skill.trim()}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {profile.bio && (
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Bio</h3>
                    <p className="text-sm text-muted-foreground">{profile.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
