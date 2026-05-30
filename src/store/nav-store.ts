import { create } from 'zustand'

export type Page =
  | 'home'
  | 'browse'
  | 'categories'
  | 'design-detail'
  | 'designer-profile'
  | 'upload'
  | 'auth'
  | 'pricing'
  | 'about'
  | 'contact'
  | 'faq'
  | 'dashboard'
  | 'freelance'
  | 'messages'
  | 'hire'
  | 'admin'
  | 'saved'
  | 'search'
  | 'collections'
  | 'notifications'
  | 'inspiration'
  | 'settings'
  | 'wishlist'
  | 'leaderboard'

export type AuthMode = 'login' | 'signup'
export type UserRole = 'designer' | 'client' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar: string | null
  bio: string | null
  location: string | null
  isPro: boolean
  isAdmin: boolean
}

// Helper: parse current URL hash to determine page state
function parseHash(): { page: Page; designId: string | null; designerId: string | null } {
  if (typeof window === 'undefined') return { page: 'home', designId: null, designerId: null }

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

// Helper: build hash URL from page state
function buildHash(page: Page, designId?: string | null, designerId?: string | null): string {
  let hash = `#${page}`
  const params: string[] = []
  if (designId) params.push(`id=${designId}`)
  if (designerId) params.push(`designerId=${designerId}`)
  if (params.length > 0) hash += '?' + params.join('&')
  return hash
}

// Save nav state to localStorage for persistence across page refreshes
function saveNavState(state: { currentPage: Page; selectedDesignId: string | null; selectedDesignerId: string | null }) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('dc_nav', JSON.stringify(state))
  } catch { /* ignore */ }
}

// Load nav state from localStorage
function loadNavState(): { currentPage: Page; selectedDesignId: string | null; selectedDesignerId: string | null } | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem('dc_nav')
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return null
}

interface NavState {
  currentPage: Page
  previousPages: Page[]
  selectedDesignId: string | null
  selectedDesignerId: string | null
  authMode: AuthMode
  searchQuery: string

  isLoggedIn: boolean
  user: User | null

  // Compare state
  compareDesigns: string[]

  setCurrentPage: (page: Page) => void
  goBack: () => void
  setSelectedDesignId: (id: string | null) => void
  setSelectedDesignerId: (id: string | null) => void
  setAuthMode: (mode: AuthMode) => void
  setSearchQuery: (query: string) => void
  navigateTo: (page: Page) => void

  login: (user: User) => void
  logout: () => void
  setUser: (user: User | null) => void
  upgradeToPro: () => void

  // Compare actions
  addToCompare: (designId: string) => void
  removeFromCompare: (designId: string) => void
  clearCompare: () => void
}

// Flag to prevent popstate handler from re-pushing to history
let isNavigating = false

export const useNavStore = create<NavState>((set, get) => ({
  currentPage: 'home',
  previousPages: [],
  selectedDesignId: null,
  selectedDesignerId: null,
  authMode: 'login',
  searchQuery: '',

  isLoggedIn: false,
  user: null,

  compareDesigns: [],

  setCurrentPage: (page: Page) => {
    const { currentPage } = get()
    const newState = {
      currentPage: page,
      previousPages: [...get().previousPages, currentPage],
    }
    set(newState)
    saveNavState({ currentPage: page, selectedDesignId: get().selectedDesignId, selectedDesignerId: get().selectedDesignerId })
  },

  goBack: () => {
    if (typeof window !== 'undefined') {
      window.history.back()
    }
  },

  setSelectedDesignId: (id) => {
    set({ selectedDesignId: id })
    saveNavState({ currentPage: get().currentPage, selectedDesignId: id, selectedDesignerId: get().selectedDesignerId })
  },

  setSelectedDesignerId: (id) => {
    set({ selectedDesignerId: id })
    saveNavState({ currentPage: get().currentPage, selectedDesignId: get().selectedDesignId, selectedDesignerId: id })
  },

  setAuthMode: (mode) => set({ authMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  navigateTo: (page: Page) => {
    const { currentPage, selectedDesignId, selectedDesignerId } = get()
    if (page === currentPage) return

    const newState = {
      currentPage: page,
      previousPages: [...get().previousPages, currentPage],
    }
    set(newState)

    // Update browser URL
    const hash = buildHash(page, 
      page === 'design-detail' ? selectedDesignId : null, 
      page === 'designer-profile' ? selectedDesignerId : null
    )
    if (typeof window !== 'undefined') {
      isNavigating = true
      window.history.pushState({ page, selectedDesignId, selectedDesignerId }, '', hash)
      isNavigating = false
    }

    saveNavState({ currentPage: page, selectedDesignId, selectedDesignerId })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  },

  login: (user: User) => {
    set({ isLoggedIn: true, user })
    if (typeof window !== 'undefined') {
      localStorage.setItem('dc_user', JSON.stringify(user))
      localStorage.setItem('dc_logged_in', 'true')
    }
  },

  logout: () => {
    set({ isLoggedIn: false, user: null })
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dc_user')
      localStorage.removeItem('dc_logged_in')
    }
  },

  setUser: (user: User | null) => {
    set({ user, isLoggedIn: !!user })
    if (user && typeof window !== 'undefined') {
      localStorage.setItem('dc_user', JSON.stringify(user))
    }
  },

  upgradeToPro: () => {
    const { user } = get()
    if (user) {
      const updated = { ...user, isPro: true }
      set({ user: updated })
      if (typeof window !== 'undefined') {
        localStorage.setItem('dc_user', JSON.stringify(updated))
      }
    }
  },

  addToCompare: (designId: string) => {
    const { compareDesigns } = get()
    if (compareDesigns.length >= 2) return
    if (compareDesigns.includes(designId)) return
    set({ compareDesigns: [...compareDesigns, designId] })
  },

  removeFromCompare: (designId: string) => {
    const { compareDesigns } = get()
    set({ compareDesigns: compareDesigns.filter((id) => id !== designId) })
  },

  clearCompare: () => {
    set({ compareDesigns: [] })
  },
}))

// Hydrate from URL hash or localStorage on initial load
if (typeof window !== 'undefined') {
  // First try URL hash, then localStorage
  const hashState = parseHash()
  const savedNav = loadNavState()

  // Determine initial page from URL hash
  let initialPage: Page = 'home'
  let initialDesignId: string | null = null
  let initialDesignerId: string | null = null

  if (hashState.page !== 'home' || window.location.hash) {
    // URL has a hash - use it
    initialPage = hashState.page
    initialDesignId = hashState.designId
    initialDesignerId = hashState.designerId
  } else if (savedNav) {
    // No hash but we have saved state - use saved state
    initialPage = savedNav.currentPage
    initialDesignId = savedNav.selectedDesignId
    initialDesignerId = savedNav.selectedDesignerId
  }

  // Hydrate user state from localStorage
  const stored = localStorage.getItem('dc_user')
  const loggedIn = localStorage.getItem('dc_logged_in')
  let user: User | null = null
  let isLoggedIn = false
  if (stored && loggedIn === 'true') {
    try {
      user = JSON.parse(stored) as User
      isLoggedIn = true
    } catch {
      localStorage.removeItem('dc_user')
      localStorage.removeItem('dc_logged_in')
    }
  }

  // Set initial state
  useNavStore.setState({
    currentPage: initialPage,
    selectedDesignId: initialDesignId,
    selectedDesignerId: initialDesignerId,
    isLoggedIn,
    user,
  })

  // Replace the current history entry with proper state
  const currentHash = buildHash(initialPage, initialDesignId, initialDesignerId)
  if (window.location.hash !== currentHash.replace('#', '')) {
    window.history.replaceState({ page: initialPage, selectedDesignId: initialDesignId, selectedDesignerId: initialDesignerId }, '', currentHash)
  }

  // Listen for browser back/forward
  window.addEventListener('popstate', (event) => {
    if (isNavigating) return

    if (event.state && event.state.page) {
      const { page, selectedDesignId: dId, selectedDesignerId: drId } = event.state
      set({
        currentPage: page as Page,
        selectedDesignId: dId || null,
        selectedDesignerId: drId || null,
      })
    } else {
      // Fallback: parse the hash
      const parsed = parseHash()
      set({
        currentPage: parsed.page,
        selectedDesignId: parsed.designId,
        selectedDesignerId: parsed.designerId,
      })
    }
  })

  // Listen for hashchange events (covers direct URL hash navigation)
  window.addEventListener('hashchange', () => {
    if (isNavigating) return
    const parsed = parseHash()
    const { currentPage } = get()
    // Only update if the parsed page is different from current
    if (parsed.page !== currentPage) {
      set({
        currentPage: parsed.page,
        selectedDesignId: parsed.designId,
        selectedDesignerId: parsed.designerId,
      })
    }
  })
}
