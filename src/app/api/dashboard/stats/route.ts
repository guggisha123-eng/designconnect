import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'designer'

    if (role === 'admin') {
      const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true })
      const { count: totalDesigners } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'designer')
      const { count: totalDesigns } = await supabase.from('designs').select('*', { count: 'exact', head: true })
      const { data: allOrders } = await supabase.from('orders').select('amount, status')
      const totalRevenue = allOrders?.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.amount, 0) || 0

      return NextResponse.json({
        role: 'admin',
        totalUsers: totalUsers || 0,
        totalDesigners: totalDesigners || 0,
        totalDesigns: totalDesigns || 0,
        totalRevenue,
      })
    }

    if (role === 'designer') {
      const { data: designs } = await supabase
        .from('designs')
        .select('id, title, view_count, like_count, download_count, created_at')
        .eq('designer_id', user.id)
        .order('created_at', { ascending: false })

      const { data: orders } = await supabase
        .from('orders')
        .select('id, amount, status, created_at, designs!orders_design_id_fkey(title)')
        .eq('designer_id', user.id)
        .order('created_at', { ascending: false })

      return NextResponse.json({
        role: 'designer',
        totalDesigns: designs?.length || 0,
        totalViews: designs?.reduce((sum, d) => sum + (d.view_count || 0), 0) || 0,
        totalLikes: designs?.reduce((sum, d) => sum + (d.like_count || 0), 0) || 0,
        totalDownloads: designs?.reduce((sum, d) => sum + (d.download_count || 0), 0) || 0,
        earnings: orders?.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.amount || 0), 0) || 0,
        recentDesigns: designs?.slice(0, 10) || [],
        recentOrders: orders?.slice(0, 5) || [],
      })
    }

    // Client
    const { count: purchases } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('buyer_id', user.id)

    const { data: likedDesigns } = await supabase
      .from('likes')
      .select('design_id, designs!likes_design_id_fkey(id, title, thumbnail)')
      .eq('user_id', user.id)

    return NextResponse.json({
      role: 'client',
      purchases: purchases || 0,
      favorites: likedDesigns?.length || 0,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
