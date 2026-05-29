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

interface NavState {
  currentPage: Page
  previousPages: Page[]
  selectedDesignId: string | null
  selectedDesignerId: string | null
  authMode: AuthMode
  searchQuery: string

  isLoggedIn: boolean
  user: User | null

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
}

export const useNavStore = create<NavState>((set, get) => ({
  currentPage: 'home',
  previousPages: [],
  selectedDesignId: null,
  selectedDesignerId: null,
  authMode: 'login',
  searchQuery: '',

  isLoggedIn: false,
  user: null,

  setCurrentPage: (page: Page) => {
    const { currentPage } = get()
    set({
      currentPage: page,
      previousPages: [...get().previousPages, currentPage],
    })
  },

  goBack: () => {
    const { previousPages } = get()
    if (previousPages.length > 0) {
      const newPrevious = [...previousPages]
      const previousPage = newPrevious.pop()!
      set({ currentPage: previousPage, previousPages: newPrevious })
    }
  },

  setSelectedDesignId: (id) => set({ selectedDesignId: id }),
  setSelectedDesignerId: (id) => set({ selectedDesignerId: id }),
  setAuthMode: (mode) => set({ authMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  navigateTo: (page: Page) => {
    const { currentPage } = get()
    if (page === currentPage) return
    set({
      currentPage: page,
      previousPages: [...get().previousPages, currentPage],
    })
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
}))

// Hydrate from localStorage
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('dc_user')
  const loggedIn = localStorage.getItem('dc_logged_in')
  if (stored && loggedIn === 'true') {
    try {
      const user = JSON.parse(stored) as User
      useNavStore.setState({ isLoggedIn: true, user })
    } catch {
      localStorage.removeItem('dc_user')
      localStorage.removeItem('dc_logged_in')
    }
  }
}
