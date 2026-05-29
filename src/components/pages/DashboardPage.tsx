'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Eye, Heart, Download, DollarSign, Users,
  Palette, Star, TrendingUp, ShoppingBag, MessageSquare,
  Settings, Upload, BarChart3, PieChart, ArrowUpRight,
  Clock, FileText, CreditCard, ShieldCheck
} from 'lucide-react'
import { useNavStore } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'

interface DesignItem {
  id: string
  title: string
  thumbnail_url: string | null
  image_urls: string[] | null
  view_count: number
  like_count: number
  download_count: number
  is_free: boolean
  price: number
  status: string
  created_at: string
}

interface OrderItem {
  id: string
  amount: number
  status: string
  created_at: string
  designs?: { title: string } | null
}

interface Stats {
  totalDesigns: number
  totalViews: number
  totalLikes: number
  totalDownloads: number
  earnings: number
  recentOrders: OrderItem[]
  recentDesigns: DesignItem[]
}

export default function DashboardPage() {
  const { navigateTo, isLoggedIn, user } = useNavStore()
  const [stats, setStats] = useState<Stats>({
    totalDesigns: 0, totalViews: 0, totalLikes: 0,
    totalDownloads: 0, earnings: 0, recentOrders: [], recentDesigns: [],
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!isLoggedIn) {
      navigateTo('auth')
      return
    }

    const fetchStats = async () => {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (authUser) {
          const role = user?.role || 'designer'

          if (role === 'designer' || role === 'admin') {
            // Fetch user's designs
            const { data: designs, error: designError } = await supabase
              .from('designs')
              .select('id, title, thumbnail_url, image_urls, view_count, like_count, download_count, is_free, price, status, created_at')
              .eq('designer_id', authUser.id)
              .order('created_at', { ascending: false })
              .limit(50)

            if (!designError && designs) {
              const totalViews = designs.reduce((sum, d) => sum + (d.view_count || 0), 0)
              const totalLikes = designs.reduce((sum, d) => sum + (d.like_count || 0), 0)
              const totalDownloads = designs.reduce((sum, d) => sum + (d.download_count || 0), 0)

              // Fetch orders
              let orders: OrderItem[] = []
              const { data: orderData } = await supabase
                .from('orders')
                .select('id, amount, status, created_at')
                .eq('designer_id', authUser.id)
                .order('created_at', { ascending: false })
                .limit(10)

              if (orderData) orders = orderData

              const earnings = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.amount || 0), 0)

              setStats({
                totalDesigns: designs.length,
                totalViews,
                totalLikes,
                totalDownloads,
                earnings,
                recentOrders: orders,
                recentDesigns: designs as DesignItem[],
              })
            }
          }
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [isLoggedIn, user])

  if (!isLoggedIn) return null

  const designerStats = [
    { label: 'Total Designs', value: stats.totalDesigns, icon: Palette, color: 'text-blue-500', bgColor: 'bg-blue-100', change: stats.totalDesigns > 0 ? `+${stats.totalDesigns}` : '0' },
    { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'text-green-500', bgColor: 'bg-green-100', change: '+8%' },
    { label: 'Total Likes', value: stats.totalLikes.toLocaleString(), icon: Heart, color: 'text-red-500', bgColor: 'bg-red-100', change: '+15%' },
    { label: 'Downloads', value: stats.totalDownloads.toLocaleString(), icon: Download, color: 'text-purple-500', bgColor: 'bg-purple-100', change: '+5%' },
    { label: 'Earnings', value: `$${stats.earnings.toFixed(2)}`, icon: DollarSign, color: 'text-amber-500', bgColor: 'bg-amber-100', change: stats.earnings > 0 ? `+$${stats.earnings.toFixed(0)}` : '$0' },
    { label: 'Rating', value: '4.8/5', icon: Star, color: 'text-orange-500', bgColor: 'bg-orange-100', change: '+0.2' },
  ]

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14 border-2 border-[#fb8000]">
                <AvatarFallback className="text-xl gradient-orange text-white font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'User'}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs bg-white/10 text-white border-0">
                    {user?.role || 'Designer'}
                  </Badge>
                  {user?.isPro && (
                    <Badge className="bg-amber-500 text-white border-0 text-xs gap-1">
                      <Star className="w-3 h-3" /> Pro
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              onClick={() => navigateTo('upload')}
              className="gradient-orange gradient-orange-hover text-white border-0 gap-2 hidden sm:flex"
            >
              <Upload className="w-4 h-4" /> Upload Design
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="designs" className="gap-2">
              <Palette className="w-4 h-4" /> My Designs
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingBag className="w-4 h-4" /> Orders
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {designerStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-xl font-bold">{stat.value}</p>
                      </div>
                      <div className="flex items-center gap-1 text-green-500 text-xs font-medium">
                        <ArrowUpRight className="w-3 h-3" />
                        {stat.change}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm mb-8">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button variant="outline" className="h-auto p-4 flex-col gap-2" onClick={() => navigateTo('upload')}>
                    <Upload className="w-5 h-5 text-[#fb8000]" />
                    <span className="text-sm">Upload Design</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex-col gap-2" onClick={() => navigateTo('pricing')}>
                    <Star className="w-5 h-5 text-amber-500" />
                    <span className="text-sm">Upgrade to Pro</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex-col gap-2" onClick={() => navigateTo('browse')}>
                    <Eye className="w-5 h-5 text-blue-500" />
                    <span className="text-sm">Browse Designs</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5" /> Recent Designs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Loading designs...
                    </div>
                  ) : stats.recentDesigns.length > 0 ? (
                    <div className="space-y-3">
                      {stats.recentDesigns.slice(0, 5).map((d) => (
                        <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors cursor-pointer"
                          onClick={() => {
                            useNavStore.getState().setSelectedDesignId(d.id)
                            navigateTo('design-detail')
                          }}>
                          {d.thumbnail_url ? (
                            <img src={d.thumbnail_url} alt={d.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center flex-shrink-0">
                              <Palette className="w-5 h-5 text-orange-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">{d.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {d.view_count || 0} views · {d.like_count || 0} likes · {d.download_count || 0} downloads
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs flex-shrink-0">
                            {d.is_free ? 'Free' : `$${d.price}`}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No designs yet.{' '}
                      <button onClick={() => navigateTo('upload')} className="text-[#fb8000] font-medium hover:underline">
                        Upload your first design
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5" /> Recent Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.recentOrders.length > 0 ? (
                    <div className="space-y-3">
                      {stats.recentOrders.slice(0, 5).map((o) => (
                        <div key={o.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                            <DollarSign className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">
                              {(o.designs as any)?.title || 'Design Purchase'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ${o.amount} · {o.status}
                            </p>
                          </div>
                          <Badge
                            variant={o.status === 'completed' ? 'default' : o.status === 'pending' ? 'secondary' : 'destructive'}
                            className={o.status === 'completed' ? 'bg-green-500 text-white border-0' : ''}
                          >
                            {o.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No orders yet. Start uploading designs to earn!
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="designs">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                {loading ? (
                  <div className="text-center py-12 text-muted-foreground">Loading...</div>
                ) : stats.recentDesigns.length > 0 ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">{stats.totalDesigns} design(s) uploaded</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {stats.recentDesigns.map((d) => (
                        <div key={d.id} className="rounded-xl overflow-hidden border bg-white hover:shadow-lg transition-all cursor-pointer group"
                          onClick={() => {
                            useNavStore.getState().setSelectedDesignId(d.id)
                            navigateTo('design-detail')
                          }}>
                          {/* Thumbnail */}
                          <div className="aspect-video bg-gradient-to-br from-orange-100 to-amber-50 relative overflow-hidden">
                            {d.thumbnail_url ? (
                              <img src={d.thumbnail_url} alt={d.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Palette className="w-8 h-8 text-orange-300" />
                              </div>
                            )}
                            <Badge className="absolute top-2 right-2 text-xs" variant={d.is_free ? 'secondary' : 'default'}>
                              {d.is_free ? 'Free' : `$${d.price}`}
                            </Badge>
                          </div>
                          {/* Info */}
                          <div className="p-3">
                            <p className="font-medium text-sm line-clamp-1">{d.title}</p>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{d.view_count || 0}</span>
                              <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{d.like_count || 0}</span>
                              <span className="flex items-center gap-1"><Download className="w-3 h-3" />{d.download_count || 0}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Palette className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No designs yet</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Upload your first design to start earning
                    </p>
                    <Button onClick={() => navigateTo('upload')} className="gradient-orange gradient-orange-hover text-white border-0 gap-2">
                      <Upload className="w-4 h-4" /> Upload Design
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                {stats.recentOrders.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentOrders.map((o) => (
                      <div key={o.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{(o.designs as any)?.title || 'Design'}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(o.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="font-bold">${o.amount}</span>
                        <Badge variant={o.status === 'completed' ? 'default' : 'secondary'}>
                          {o.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                    <p className="text-muted-foreground text-sm">
                      Orders will appear here when someone purchases your designs
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="border-0 shadow-sm max-w-2xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">Email Verified</p>
                        <p className="text-xs text-muted-foreground">Your email is verified</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500 text-white border-0">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="text-sm font-medium">Pro Plan</p>
                        <p className="text-xs text-muted-foreground">
                          {user?.isPro ? 'You are a Pro member' : 'Upgrade for premium features'}
                        </p>
                      </div>
                    </div>
                    {!user?.isPro && (
                      <Button size="sm" onClick={() => navigateTo('pricing')} className="gradient-orange gradient-orange-hover text-white border-0">
                        Upgrade
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">Payout Method</p>
                        <p className="text-xs text-muted-foreground">Set up your payout method</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Configure</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
