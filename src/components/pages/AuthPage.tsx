'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Lock, User, Eye, EyeOff, Palette, Loader2, CheckCircle,
  Chrome, Github, Sparkles, Shield, Info,
} from 'lucide-react'
import { useNavStore, type UserRole, type User } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { createClient, isSupabaseReady } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import WaterEffect from '@/components/layout/WaterEffect'

// Demo user accounts
const DEMO_DESIGNER: User = {
  id: 'demo-designer',
  name: 'Demo Designer',
  email: 'demo@designconnect.com',
  role: 'designer',
  avatar: null,
  bio: 'Demo designer account',
  location: 'San Francisco, CA',
  isPro: false,
  isAdmin: false,
}

const DEMO_CLIENT: User = {
  id: 'demo-client',
  name: 'Demo Client',
  email: 'client@designconnect.com',
  role: 'client',
  avatar: null,
  bio: 'Demo client account',
  location: 'New York, NY',
  isPro: false,
  isAdmin: false,
}

export default function AuthPage() {
  const { authMode, setAuthMode, navigateTo, login } = useNavStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [accountType, setAccountType] = useState<UserRole>('designer')
  // Initialize supabaseReady from isSupabaseReady() directly to avoid flicker
  const [supabaseReady, setSupabaseReady] = useState(() => {
    if (typeof window === 'undefined') return false
    return isSupabaseReady()
  })
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [demoLoading, setDemoLoading] = useState<string | null>(null)

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Signup fields
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Supabase readiness is now initialized in useState to avoid UI flicker

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

  // Demo login handler
  const handleDemoLogin = (demoUser: User) => {
    setDemoLoading(demoUser.role)
    // Small delay for visual feedback
    setTimeout(() => {
      login(demoUser)
      navigateTo('dashboard')
      toast({
        title: `Welcome, ${demoUser.name}!`,
        description: 'You are now exploring in demo mode.',
      })
      setDemoLoading(null)
    }, 600)
  }

  // Social login click handler
  const handleSocialLogin = (provider: string) => {
    toast({
      title: 'Coming soon',
      description: `${provider} sign-in will be available once the service is fully configured.`,
    })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!isSupabaseReady()) {
      setError('Authentication service is being configured. Please try again later or use demo mode.')
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
    } catch {
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
      setError('Authentication service is being configured. Please try again later or use demo mode.')
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

          {/* Demo mode info banner */}
          {!supabaseReady && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl"
            >
              <div className="flex items-start gap-2.5">
                <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Running in demo mode</p>
                  <p className="text-amber-700">
                    Full authentication will be available once the service is configured. In the meantime, explore the app using the demo accounts below.
                  </p>
                </div>
              </div>
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

          <AnimatePresence mode="wait">
            <motion.div
              key={authMode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
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

              {/* Demo Login Section */}
              {!supabaseReady && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6"
                >
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200/60 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-[#fb8000]" />
                      <span className="font-semibold text-sm text-foreground">Try the Demo</span>
                    </div>
                    <p className="text-muted-foreground text-xs mb-4 leading-relaxed">
                      Explore all features with a pre-configured demo account. No sign-up required.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        onClick={() => handleDemoLogin(DEMO_DESIGNER)}
                        disabled={demoLoading !== null}
                        className="h-auto py-3 flex-col gap-1.5 gradient-orange gradient-orange-hover text-white border-0"
                      >
                        {demoLoading === 'designer' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Palette className="w-5 h-5" />
                        )}
                        <span className="text-xs font-medium">
                          {demoLoading === 'designer' ? 'Signing in...' : 'Designer'}
                        </span>
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleDemoLogin(DEMO_CLIENT)}
                        disabled={demoLoading !== null}
                        className="h-auto py-3 flex-col gap-1.5 bg-slate-800 hover:bg-slate-700 text-white border-0"
                      >
                        {demoLoading === 'client' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Shield className="w-5 h-5" />
                        )}
                        <span className="text-xs font-medium">
                          {demoLoading === 'client' ? 'Signing in...' : 'Client'}
                        </span>
                      </Button>
                    </div>
                  </div>

                  {/* Divider with "or" */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-background px-3 text-muted-foreground">or continue with credentials</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Social Login Buttons */}
              {authMode === 'login' && supabaseReady && (
                <div className="space-y-3 mb-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('Google')}
                    className="w-full h-11 text-sm font-medium"
                  >
                    <Chrome className="w-4 h-4 mr-2" />
                    Continue with Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('GitHub')}
                    className="w-full h-11 text-sm font-medium"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    Continue with GitHub
                  </Button>

                  {/* Divider with "or" */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-background px-3 text-muted-foreground">or</span>
                    </div>
                  </div>
                </div>
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

                  {/* Forgot Password Link */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-xs text-muted-foreground hover:text-[#fb8000] transition-colors"
                    >
                      Forgot password?
                    </button>
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
            </motion.div>
          </AnimatePresence>

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

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              Password reset will be available once email service is configured.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground">
              In the meantime, you can use the demo accounts to explore the app, or contact your administrator for assistance.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForgotPassword(false)}
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
