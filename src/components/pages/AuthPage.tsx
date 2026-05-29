'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, Palette, Loader2, CheckCircle } from 'lucide-react'
import { useNavStore, type UserRole } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isSupabaseConfigured, createClient } from '@/lib/supabase/client'
import WaterEffect from '@/components/layout/WaterEffect'

// Demo user storage
interface DemoUser {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
  avatar: string | null
  bio: string | null
  location: string | null
  isPro: boolean
  isAdmin: boolean
}

function getDemoUsers(): DemoUser[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem('dc_demo_users')
  if (stored) {
    try { return JSON.parse(stored) } catch { return [] }
  }
  // Default demo accounts
  const defaults: DemoUser[] = [
    {
      id: 'demo-1',
      name: 'Demo Designer',
      email: 'demo@designconnect.com',
      password: 'demo123',
      role: 'designer',
      avatar: null,
      bio: 'Creative designer with 5+ years of experience',
      location: 'Mumbai, India',
      isPro: false,
      isAdmin: false,
    },
    {
      id: 'demo-2',
      name: 'Demo Client',
      email: 'client@designconnect.com',
      password: 'demo123',
      role: 'client',
      avatar: null,
      bio: 'Looking for talented designers',
      location: 'Delhi, India',
      isPro: false,
      isAdmin: false,
    },
  ]
  localStorage.setItem('dc_demo_users', JSON.stringify(defaults))
  return defaults
}

function saveDemoUsers(users: DemoUser[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('dc_demo_users', JSON.stringify(users))
  }
}

export default function AuthPage() {
  const { authMode, setAuthMode, navigateTo, login } = useNavStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [accountType, setAccountType] = useState<UserRole>('designer')
  const [demoMode] = useState(!isSupabaseConfigured)

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Signup fields
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      if (isSupabaseConfigured) {
        try {
          const supabase = createClient()
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            const meta = session.user.user_metadata
            login({
              id: session.user.id,
              name: meta?.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              role: meta?.role || 'designer',
              avatar: meta?.avatar || null,
              bio: meta?.bio || null,
              location: meta?.location || null,
              isPro: meta?.is_pro || false,
              isAdmin: meta?.is_admin || false,
            })
            navigateTo('dashboard')
          }
        } catch (err) {
          console.warn('[Auth] Session check failed:', err)
        }
      }
      // Demo mode: session already hydrated from localStorage via nav-store
    }
    checkSession()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Always try demo auth first for known demo emails
      const demoUsers = getDemoUsers()
      const demoUser = demoUsers.find(u => u.email.toLowerCase() === loginEmail.toLowerCase() && u.password === loginPassword)

      if (demoUser) {
        // === DEMO AUTH (always works for demo accounts) ===
        await new Promise(r => setTimeout(r, 500))
        login({
          id: demoUser.id,
          name: demoUser.name,
          email: demoUser.email,
          role: demoUser.role,
          avatar: demoUser.avatar,
          bio: demoUser.bio,
          location: demoUser.location,
          isPro: demoUser.isPro,
          isAdmin: demoUser.isAdmin,
        })
        navigateTo('dashboard')
        return
      }

      if (isSupabaseConfigured) {
        // === SUPABASE AUTH ===
        const supabase = createClient()
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: loginPassword,
        })

        if (authError) {
          setError(authError.message)
          return
        }

        if (data.user) {
          const meta = data.user.user_metadata
          try {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single()

            login({
              id: data.user.id,
              name: profile?.name || meta?.name || data.user.email?.split('@')[0] || 'User',
              email: data.user.email || '',
              role: profile?.role || meta?.role || 'designer',
              avatar: profile?.avatar || null,
              bio: profile?.bio || null,
              location: profile?.location || null,
              isPro: profile?.is_pro || false,
              isAdmin: profile?.is_admin || false,
            })
          } catch {
            login({
              id: data.user.id,
              name: meta?.name || data.user.email?.split('@')[0] || 'User',
              email: data.user.email || '',
              role: meta?.role || 'designer',
              avatar: null,
              bio: null,
              location: null,
              isPro: false,
              isAdmin: false,
            })
          }
          navigateTo('dashboard')
        }
      } else {
        // === DEMO AUTH ===
        const users = getDemoUsers()
        const user = users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase() && u.password === loginPassword)
        if (!user) {
          setError('Invalid email or password. Try demo@designconnect.com / demo123')
          return
        }
        // Simulate network delay
        await new Promise(r => setTimeout(r, 500))
        login({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          bio: user.bio,
          location: user.location,
          isPro: user.isPro,
          isAdmin: user.isAdmin,
        })
        navigateTo('dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      if (isSupabaseConfigured) {
        // === SUPABASE AUTH ===
        const supabase = createClient()
        const { data, error: authError } = await supabase.auth.signUp({
          email: signupEmail,
          password: signupPassword,
          options: {
            data: { name: signupName, role: accountType },
            emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          },
        })

        if (authError) {
          setError(authError.message)
          return
        }

        if (data.user) {
          try {
            await supabase.from('users').upsert({
              id: data.user.id,
              email: signupEmail,
              name: signupName,
              role: accountType,
            }, { onConflict: 'id' })
          } catch { /* ignore */ }

          if (data.session) {
            login({
              id: data.user.id,
              name: signupName,
              email: signupEmail,
              role: accountType,
              avatar: null,
              bio: null,
              location: null,
              isPro: false,
              isAdmin: false,
            })
            navigateTo('dashboard')
          } else {
            setSuccessMsg('Account created! Please check your email to verify.')
          }
        }
      } else {
        // === DEMO AUTH ===
        const users = getDemoUsers()
        const exists = users.find(u => u.email.toLowerCase() === signupEmail.toLowerCase())
        if (exists) {
          setError('An account with this email already exists.')
          return
        }
        await new Promise(r => setTimeout(r, 500))

        const newUser: DemoUser = {
          id: `demo-${Date.now()}`,
          name: signupName,
          email: signupEmail,
          password: signupPassword,
          role: accountType,
          avatar: null,
          bio: null,
          location: null,
          isPro: false,
          isAdmin: false,
        }
        saveDemoUsers([...users, newUser])

        login({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          avatar: null,
          bio: null,
          location: null,
          isPro: false,
          isAdmin: false,
        })
        navigateTo('dashboard')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left - Visual */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <WaterEffect />
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-2xl gradient-orange flex items-center justify-center mx-auto mb-6">
              <Palette className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Join Design Connect</h2>
            <p className="text-slate-300 max-w-sm mx-auto leading-relaxed">
              Connect with 10,000+ designers, showcase your portfolio, and grow your creative career.
            </p>

            <div className="mt-10 space-y-4">
              {[
                'Free to get started',
                'Access to 100K+ designs',
                'Direct designer collaborations',
                'Secure payments & downloads',
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3 text-sm"
                >
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  {item}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right - Auth Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl gradient-orange flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#fb8000] to-[#e57600] bg-clip-text text-transparent">
              Design Connect
            </span>
          </div>

          {/* Demo Mode Banner */}
          {demoMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl"
            >
              Demo Mode - Use <strong>demo@designconnect.com</strong> / <strong>demo123</strong> to login, or create a new account.
            </motion.div>
          )}

          {/* Tabs */}
          <div className="flex bg-muted rounded-xl p-1 mb-8">
            <button
              onClick={() => { setAuthMode('login'); setError(''); setSuccessMsg('') }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                authMode === 'login'
                  ? 'bg-white shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode('signup'); setError(''); setSuccessMsg('') }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                authMode === 'signup'
                  ? 'bg-white shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          <h1 className="text-2xl font-bold mb-2">
            {authMode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            {authMode === 'login'
              ? 'Sign in to your Design Connect account'
              : 'Join the creative community today'}
          </p>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl"
            >
              {error}
            </motion.div>
          )}

          {/* Success */}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded-xl"
            >
              {successMsg}
            </motion.div>
          )}

          {/* Login Form */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-email" className="mb-1.5 block text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="login-password" className="mb-1.5 block text-sm">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full gradient-orange gradient-orange-hover text-white border-0 h-11"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          )}

          {/* Signup Form */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="signup-name" className="mb-1.5 block text-sm">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="signup-email" className="mb-1.5 block text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="mb-1.5 block text-sm">Account Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccountType('designer')}
                    className={`p-3 rounded-xl border-2 text-sm text-center transition-all ${
                      accountType === 'designer'
                        ? 'border-[#fb8000] bg-orange-50 text-[#fb8000]'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    Designer
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('client')}
                    className={`p-3 rounded-xl border-2 text-sm text-center transition-all ${
                      accountType === 'client'
                        ? 'border-[#fb8000] bg-orange-50 text-[#fb8000]'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    Client
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="signup-password" className="mb-1.5 block text-sm">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirm-password" className="mb-1.5 block text-sm">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full gradient-orange gradient-orange-hover text-white border-0 h-11"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            {authMode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => { setAuthMode('signup'); setError(''); setSuccessMsg('') }}
                  className="text-[#fb8000] font-medium hover:underline"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => { setAuthMode('login'); setError(''); setSuccessMsg('') }}
                  className="text-[#fb8000] font-medium hover:underline"
                >
                  Sign In
                </button>
              </>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
