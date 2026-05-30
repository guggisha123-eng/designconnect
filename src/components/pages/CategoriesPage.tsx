'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { useNavStore } from '@/store/nav-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient, isSupabaseReady } from '@/lib/supabase/client'

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  design_count: number
}

const defaultCategories: Category[] = [
  { id: '1', name: 'Logo Design', slug: 'logo-design', icon: '🎨', design_count: 12500 },
  { id: '2', name: 'UI/UX Design', slug: 'ui-ux', icon: '📱', design_count: 8300 },
  { id: '3', name: 'Illustrations', slug: 'illustrations', icon: '✏️', design_count: 15200 },
  { id: '4', name: 'Typography', slug: 'typography', icon: '🔤', design_count: 6100 },
  { id: '5', name: '3D Design', slug: '3d-design', icon: '🧊', design_count: 4700 },
  { id: '6', name: 'Social Media', slug: 'social-media', icon: '📲', design_count: 9800 },
  { id: '7', name: 'Print Design', slug: 'print-design', icon: '🖨️', design_count: 7200 },
  { id: '8', name: 'Motion Design', slug: 'motion-design', icon: '🎬', design_count: 5400 },
  { id: '9', name: 'Icon Sets', slug: 'icons', icon: '💡', design_count: 11200 },
  { id: '10', name: 'Web Templates', slug: 'web-templates', icon: '🌐', design_count: 14500 },
  { id: '11', name: 'Business Cards', slug: 'business-cards', icon: '💳', design_count: 8900 },
  { id: '12', name: 'Posters', slug: 'posters', icon: '🖼️', design_count: 7800 },
]

export default function CategoriesPage() {
  const navigateTo = useNavStore((s) => s.navigateTo)
  const setSearchQuery = useNavStore((s) => s.setSearchQuery)
  const [categories, setCategories] = useState<Category[]>(defaultCategories)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (!isSupabaseReady()) {
          // Use default categories if Supabase is not configured
          return
        }
        const supabase = createClient()
        const { data } = await supabase.from('categories').select('*').order('name')
        if (data && data.length > 0) {
          setCategories(data.map(c => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            icon: c.icon || '📁',
            design_count: 0,
          })))
        }
      } catch {
        // Use default categories
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const handleCategoryClick = (cat: Category) => {
    setSearchQuery(cat.name)
    navigateTo('browse')
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-950 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Categories</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse designs by category to find exactly what you need for your next project
            </p>
          </motion.div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className="cursor-pointer group hover:shadow-lg dark:shadow-slate-900/30 dark:hover:shadow-slate-900/50 transition-all duration-300 hover:-translate-y-1 border-0 overflow-hidden dark:bg-slate-900"
                onClick={() => handleCategoryClick(cat)}
              >
                <CardContent className="p-0">
                  <div className="h-32 bg-gradient-to-br from-orange-100 to-amber-50 dark:from-slate-800 dark:to-slate-800/50 flex items-center justify-center relative overflow-hidden">
                    <span className="text-5xl group-hover:scale-125 transition-transform duration-300">
                      {cat.icon}
                    </span>
                  </div>
                  <div className="p-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{cat.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {cat.design_count > 0 ? `${(cat.design_count / 1000).toFixed(1)}K designs` : 'Explore'}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-[#fb8000] group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
