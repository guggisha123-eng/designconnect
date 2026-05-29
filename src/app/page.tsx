'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useNavStore } from '@/store/nav-store'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
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
}

export default function Page() {
  const currentPage = useNavStore((s) => s.currentPage)
  const PageComponent = pageComponents[currentPage] || HomePage

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <PageComponent />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
