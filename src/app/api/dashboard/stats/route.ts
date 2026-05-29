import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'client'

    if (role === 'admin') {
      const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true })
      const { count: totalDesigners } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'designer')
      const { count: totalDesigns } = await supabase.from('designs').select('*', { count: 'exact', head: true })
      const { data: orders } = await supabase.from('orders').select('amount')
      const totalRevenue = (orders || []).reduce((sum: number, o: any) => sum + (o.amount || 0), 0)

      const { data: recentOrders } = await supabase
        .from('orders')
        .select('*, buyer:users!orders_buyer_id_fkey(name), designer:users!orders_designer_id_fkey(name)')
        .order('created_at', { ascending: false })
        .limit(5)

      return NextResponse.json({
        role: 'admin',
        totalUsers: totalUsers || 0,
        totalDesigners: totalDesigners || 0,
        totalDesigns: totalDesigns || 0,
        totalRevenue: totalRevenue || 0,
        recentOrders: recentOrders || [],
      })
    }

    if (role === 'designer') {
      const { count: myDesigns } = await supabase.from('designs').select('*', { count: 'exact', head: true }).eq('designer_id', user.id)
      const { data: designs } = await supabase.from('designs').select('view_count, like_count').eq('designer_id', user.id)
      const totalViews = (designs || []).reduce((sum: number, d: any) => sum + (d.view_count || 0), 0)
      const totalLikes = (designs || []).reduce((sum: number, d: any) => sum + (d.like_count || 0), 0)
      const { data: soldOrders } = await supabase.from('orders').select('amount').eq('designer_id', user.id).eq('status', 'completed')
      const earnings = (soldOrders || []).reduce((sum: number, o: any) => sum + (o.amount || 0), 0)

      return NextResponse.json({
        role: 'designer',
        myDesigns: myDesigns || 0,
        totalViews,
        totalLikes,
        earnings,
      })
    }

    // Client
    const { count: purchases } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('buyer_id', user.id)

    return NextResponse.json({
      role: 'client',
      purchases: purchases || 0,
    })
  } catch (error: any) {
    console.error('Dashboard stats error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
