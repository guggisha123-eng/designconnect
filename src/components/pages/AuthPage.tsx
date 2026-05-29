'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, Palette, Loader2, CheckCircle } from 'lucide-react'
import { useNavStore, type UserRole } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient, isSupabaseReady } from '@/lib/supabase/client'
import WaterEffect from '@/components/layout/WaterEffect'

export default function AuthPage() {
  const { authMode, setAuthMode, navigateTo, login } = useNavStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [accountType, setAccountType] = useState<UserRole>('designer')
  const [supabaseReady, setSupabaseReady] = useState(true)

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Signup fields
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Check Supabase readiness
  useEffect(() => {
    setSupabaseReady(isSupabaseReady())
  }, [])

  // Check session on mount
  useEffect(() => {
    if (!isSupabaseReady()) return

    const checkSession = async () => {
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
      } catch {
        // Session check failed silently
      }
    }
    checkSession()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!isSupabaseReady()) {
      setError('Authentication service is being configured. Please try again later.')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      })

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check and try again.')
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Please verify your email address first. Check your inbox.')
        } else if (authError.message.includes('Too many requests')) {
          setError('Too many attempts. Please wait a moment and try again.')
        } else {
          setError(authError.message)
        }
        return
      }

      if (data.user) {
        const meta = data.user.user_metadata
        let profileData = null

        // Try to fetch profile (non-blocking)
        try {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single()
          profileData = profile
        } catch {
          // Profile table might not exist yet, use auth metadata
        }

        login({
          id: data.user.id,
          name: profileData?.name || meta?.name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || '',
          role: profileData?.role || meta?.role || 'designer',
          avatar: profileData?.avatar || meta?.avatar || null,
          bio: profileData?.bio || meta?.bio || null,
          location: profileData?.location || meta?.location || null,
          isPro: profileData?.is_pro || false,
          isAdmin: profileData?.is_admin || false,
        })
        navigateTo('dashboard')
      }
    } catch (err) {
      setError('Connection error. Please check your internet and try again.')
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

    if (!isSupabaseReady()) {
      setError('Authentication service is being configured. Please try again later.')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      const { data, error: authError } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            name: signupName,
            role: accountType,
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('An account with this email already exists. Try signing in instead.')
        } else {
          setError(authError.message)
        }
        return
      }

      if (data.user) {
        // Try to create profile in public.users table
        try {
          await supabase.from('users').upsert({
            id: data.user.id,
            email: signupEmail,
            name: signupName,
            role: accountType,
          }, { onConflict: 'id' })
        } catch {
          // Profile table might not exist yet
        }

        if (data.session) {
          // Auto-confirmed (email verification disabled in Supabase)
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
          setSuccessMsg('Account created successfully! Please check your email to verify your account, then sign in.')
        }
      }
    } catch {
      setError('Connection error. Please check your internet and try again.')
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

          {/* Supabase not configured warning */}
          {!supabaseReady && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl"
            >
              <p className="font-semibold mb-1">Authentication Not Configured</p>
              <p className="text-red-600">
                The admin needs to set up Supabase credentials in the deployment settings. Please contact support or try again later.
              </p>
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
                disabled={loading || !supabaseReady}
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
                disabled={loading || !supabaseReady}
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
