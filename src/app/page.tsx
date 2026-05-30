'use client'

import { useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavStore, type Page } from '@/store/nav-store'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ScrollToTop from '@/components/layout/ScrollToTop'
import KeyboardShortcuts from '@/components/layout/KeyboardShortcuts'
import OnboardingTour from '@/components/layout/OnboardingTour'
import HomePage from '@/components/pages/HomePage'
import AuthPage from '@/components/pages/AuthPage'
import BrowsePage from '@/components/pages/BrowsePage'
import CategoriesPage from '@/components/pages/CategoriesPage'
import DesignDetailPage from '@/components/pages/DesignDetailPage'
import DesignerProfilePage from '@/components/pages/DesignerProfilePage'
import UploadPage from '@/components/pages/UploadPage'
import DashboardPage from '@/components/pages/DashboardPage'
import PricingPage from '@/components/pages/PricingPage'
import AboutPage from '@/components/pages/AboutPage'
import ContactPage from '@/components/pages/ContactPage'
import FAQPage from '@/components/pages/FAQPage'
import SavedPage from '@/components/pages/SavedPage'
import MessagesPage from '@/components/pages/MessagesPage'
import SearchPage from '@/components/pages/SearchPage'
import CollectionsPage from '@/components/pages/CollectionsPage'
import NotificationCenterPage from '@/components/pages/NotificationCenterPage'
import InspirationPage from '@/components/pages/InspirationPage'
import SettingsPage from '@/components/pages/SettingsPage'
import AnnouncementBanner from '@/components/layout/AnnouncementBanner'
import WishlistPage from '@/components/pages/WishlistPage'
import LeaderboardPage from '@/components/pages/LeaderboardPage'

const pageComponents: Record<string, React.ComponentType> = {
  home: HomePage,
  auth: AuthPage,
  browse: BrowsePage,
  categories: CategoriesPage,
  'design-detail': DesignDetailPage,
  'designer-profile': DesignerProfilePage,
  upload: UploadPage,
  dashboard: DashboardPage,
  pricing: PricingPage,
  about: AboutPage,
  contact: ContactPage,
  faq: FAQPage,
  saved: SavedPage,
  messages: MessagesPage,
  search: SearchPage,
  collections: CollectionsPage,
  notifications: NotificationCenterPage,
  inspiration: InspirationPage,
  settings: SettingsPage,
  wishlist: WishlistPage,
  leaderboard: LeaderboardPage,
}

// Parse URL hash to determine which page should be displayed
function parseUrlHash(): { page: Page; designId: string | null; designerId: string | null } {
  const hash = window.location.hash.replace('#', '') || ''
  const [path, query] = hash.split('?')
  const params = new URLSearchParams(query || '')

  const pageMap: Record<string, Page> = {
    '': 'home',
    home: 'home',
    browse: 'browse',
    categories: 'categories',
    'design-detail': 'design-detail',
    'designer-profile': 'designer-profile',
    upload: 'upload',
    auth: 'auth',
    pricing: 'pricing',
    about: 'about',
    contact: 'contact',
    faq: 'faq',
    dashboard: 'dashboard',
    saved: 'saved',
    messages: 'messages',
    search: 'search',
    collections: 'collections',
    notifications: 'notifications',
    inspiration: 'inspiration',
    settings: 'settings',
    wishlist: 'wishlist',
    leaderboard: 'leaderboard',
  }

  const page = pageMap[path] || 'home'
  const designId = params.get('id')
  const designerId = params.get('designerId')

  return { page, designId, designerId }
}

export default function Page() {
  const currentPage = useNavStore((s) => s.currentPage)
  const previousPages = useNavStore((s) => s.previousPages)
  const PageComponent = pageComponents[currentPage] || HomePage

  // Determine navigation direction based on previousPages
  const direction = useMemo(() => {
    const prevPage = previousPages[previousPages.length - 1]
    if (!prevPage) return 0 // initial load
    // Deep pages: design-detail, designer-profile, dashboard, etc.
    const deepPages: Page[] = ['design-detail', 'designer-profile', 'dashboard', 'saved', 'messages', 'collections', 'notifications', 'search', 'upload', 'inspiration']
    const wasDeep = deepPages.includes(prevPage)
    const isDeep = deepPages.includes(currentPage)
    if (isDeep && !wasDeep) return -1 // going forward (deeper): slide left
    if (!isDeep && wasDeep) return 1 // going back: slide right
    return 0 // same-level: fade + slight scale
  }, [currentPage, previousPages])

  // Sync zustand state with URL hash on mount and hash changes
  useEffect(() => {
    const syncWithHash = () => {
      const { page, designId, designerId } = parseUrlHash()
      const state = useNavStore.getState()

      if (page !== state.currentPage || designId !== state.selectedDesignId || designerId !== state.selectedDesignerId) {
        useNavStore.setState({
          currentPage: page,
          selectedDesignId: designId,
          selectedDesignerId: designerId,
        })
      }
    }

    // Sync immediately on mount
    syncWithHash()

    // Listen for hash changes
    window.addEventListener('hashchange', syncWithHash)
    window.addEventListener('popstate', syncWithHash)

    return () => {
      window.removeEventListener('hashchange', syncWithHash)
      window.removeEventListener('popstate', syncWithHash)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navbar />
      <AnnouncementBanner />
      <main id="main-content" className="flex-1 pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: direction * 40, scale: direction === 0 ? 0.99 : 1 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction * -20, scale: direction === 0 ? 0.99 : 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <PageComponent />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <ScrollToTop />
      <KeyboardShortcuts />
      <OnboardingTour />
    </div>
  )
}
