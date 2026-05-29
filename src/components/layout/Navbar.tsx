'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, Search, ChevronDown, User, LogOut, Upload,
  LayoutDashboard, Sparkles, Palette
} from 'lucide-react'
import { useNavStore, type Page } from '@/store/nav-store'
import { Button } from '@/components/ui/button'

const navLinks: { label: string; page: Page }[] = [
  { label: 'Home', page: 'home' },
  { label: 'Browse', page: 'browse' },
  { label: 'Categories', page: 'categories' },
  { label: 'Pricing', page: 'pricing' },
  { label: 'About', page: 'about' },
]

export default function Navbar() {
  const { currentPage, navigateTo, isLoggedIn, user, logout, setSearchQuery, setSelectedDesignerId } = useNavStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState('')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = () => {
    if (localSearch.trim()) {
      setSearchQuery(localSearch.trim())
      navigateTo('browse')
      setSearchOpen(false)
      setLocalSearch('')
    }
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'glass-card shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => navigateTo('home')}
              className="flex items-center gap-2 group"
            >
              <div className="w-9 h-9 rounded-xl gradient-orange flex items-center justify-center group-hover:scale-110 transition-transform">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#fb8000] to-[#e57600] bg-clip-text text-transparent">
                Design Connect
              </span>
            </button>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.page}
                  onClick={() => navigateTo(link.page)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === link.page
                      ? 'text-[#fb8000] bg-orange-50'
                      : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Right Side */}
            <div className="hidden md:flex items-center gap-3">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Search className="w-5 h-5 text-foreground/70" />
              </button>

              {isLoggedIn && user ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigateTo('upload')}
                    className="gap-2 text-foreground/70"
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </Button>
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full gradient-orange flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="text-sm font-medium max-w-[100px] truncate">
                        {user.name}
                      </span>
                      <ChevronDown className="w-4 h-4 text-foreground/50" />
                    </button>
                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-border/50 overflow-hidden"
                        >
                          <div className="p-3 border-b border-border/50">
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                            {user.isPro && (
                              <span className="inline-flex items-center gap-1 mt-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                <Sparkles className="w-3 h-3" /> Pro
                              </span>
                            )}
                          </div>
                          <div className="p-1">
                            <button
                              onClick={() => {
                                navigateTo('dashboard')
                                setUserMenuOpen(false)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-lg transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4" /> Dashboard
                            </button>
                            <button
                              onClick={() => {
                                navigateTo('pricing')
                                setUserMenuOpen(false)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-lg transition-colors"
                            >
                              <Sparkles className="w-4 h-4" /> Upgrade to Pro
                            </button>
                            <button
                              onClick={() => {
                                navigateTo('designer-profile')
                                setSelectedDesignerId(user.id)
                                setUserMenuOpen(false)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-lg transition-colors"
                            >
                              <User className="w-4 h-4" /> My Profile
                            </button>
                          </div>
                          <div className="p-1 border-t border-border/50">
                            <button
                              onClick={() => {
                                logout()
                                setUserMenuOpen(false)
                                navigateTo('home')
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={() => navigateTo('auth')}>
                    Sign In
                  </Button>
                  <Button onClick={() => navigateTo('auth')} className="gradient-orange gradient-orange-hover text-white border-0">
                    Get Started
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border/50 overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search designs, categories, designers..."
                    className="w-full pl-10 pr-4 py-2.5 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#fb8000]/50"
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl"
            >
              <div className="p-4 pt-20">
                {/* Mobile Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearch()
                    }}
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2.5 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#fb8000]/50"
                  />
                </div>

                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <button
                      key={link.page}
                      onClick={() => {
                        navigateTo(link.page)
                        setMobileOpen(false)
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        currentPage === link.page
                          ? 'text-[#fb8000] bg-orange-50'
                          : 'text-foreground/70 hover:bg-muted'
                      }`}
                    >
                      {link.label}
                    </button>
                  ))}
                </div>

                <div className="border-t border-border/50 mt-4 pt-4 space-y-2">
                  {isLoggedIn ? (
                    <>
                      <button
                        onClick={() => {
                          navigateTo('dashboard')
                          setMobileOpen(false)
                        }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-muted rounded-xl"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </button>
                      <button
                        onClick={() => {
                          navigateTo('upload')
                          setMobileOpen(false)
                        }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-muted rounded-xl"
                      >
                        <Upload className="w-4 h-4" /> Upload
                      </button>
                      <button
                        onClick={() => {
                          logout()
                          setMobileOpen(false)
                          navigateTo('home')
                        }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 rounded-xl"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          navigateTo('auth')
                          setMobileOpen(false)
                        }}
                      >
                        Sign In
                      </Button>
                      <Button
                        className="w-full gradient-orange gradient-orange-hover text-white border-0"
                        onClick={() => {
                          navigateTo('auth')
                          setMobileOpen(false)
                        }}
                      >
                        Get Started
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
