'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings, User, Bell, Palette, Shield, Link2, Camera, MapPin, Globe,
  ChevronRight, X, Trash2, AlertTriangle, Clock, Save, Mail, Smartphone,
  MessageSquare, Megaphone, ShieldAlert, Check, Github, ExternalLink,
  Sun, Moon, Monitor, Eye, EyeOff, Lock, Unlock, Dribbble, Palette as PaletteIcon
} from 'lucide-react'
import { useNavStore } from '@/store/nav-store'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/* ─── Settings type ─── */
interface SettingsState {
  profile: {
    name: string
    bio: string
    location: string
    website: string
    specialization: string
    skills: string[]
    socialLinks: {
      twitter: string
      linkedin: string
      dribbble: string
      behance: string
    }
  }
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    designUpdates: boolean
    marketing: boolean
    security: boolean
    newFollower: boolean
    messages: boolean
    weeklyDigest: boolean
  }
  appearance: {
    theme: 'light' | 'dark' | 'system'
    fontSize: 'small' | 'medium' | 'large'
    compactMode: boolean
    reduceMotion: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private'
    showEmail: boolean
    showLocation: boolean
    twoFactor: boolean
  }
  connectedAccounts: {
    google: boolean
    github: boolean
    dribbble: boolean
    behance: boolean
  }
}

const SETTINGS_KEY = 'dc_settings'

const defaultSettings: SettingsState = {
  profile: {
    name: '',
    bio: '',
    location: '',
    website: '',
    specialization: '',
    skills: [],
    socialLinks: { twitter: '', linkedin: '', dribbble: '', behance: '' },
  },
  notifications: {
    email: true,
    push: true,
    sms: false,
    designUpdates: true,
    marketing: false,
    security: true,
    newFollower: true,
    messages: true,
    weeklyDigest: false,
  },
  appearance: {
    theme: 'system',
    fontSize: 'medium',
    compactMode: false,
    reduceMotion: false,
  },
  privacy: {
    profileVisibility: 'public',
    showEmail: false,
    showLocation: true,
    twoFactor: false,
  },
  connectedAccounts: {
    google: false,
    github: false,
    dribbble: false,
    behance: false,
  },
}

function loadSettings(): SettingsState {
  if (typeof window === 'undefined') return defaultSettings
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (stored) return { ...defaultSettings, ...JSON.parse(stored) }
  } catch { /* ignore */ }
  return defaultSettings
}

function saveSettings(settings: SettingsState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch { /* ignore */ }
}

const specializations = [
  'UI/UX Design', 'Logo Design', 'Illustration', 'Typography',
  '3D Design', 'Motion Design', 'Print Design', 'Social Media',
  'Web Design', 'Brand Identity', 'Icon Design', 'Packaging',
]

/* ─── Sidebar tabs for desktop ─── */
const settingTabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'privacy', label: 'Privacy & Security', icon: Shield },
  { id: 'connected', label: 'Connected Accounts', icon: Link2 },
]

/* ─── Profile completeness calculator ─── */
function getProfileCompleteness(s: SettingsState): number {
  let filled = 0
  const total = 8
  if (s.profile.name) filled++
  if (s.profile.bio) filled++
  if (s.profile.location) filled++
  if (s.profile.website) filled++
  if (s.profile.specialization) filled++
  if (s.profile.skills.length > 0) filled++
  if (s.profile.socialLinks.twitter || s.profile.socialLinks.linkedin) filled++
  if (s.profile.socialLinks.dribbble || s.profile.socialLinks.behance) filled++
  return Math.round((filled / total) * 100)
}

export default function SettingsPage() {
  const user = useNavStore((s) => s.user)
  const [settings, setSettings] = useState<SettingsState>(() => loadSettings())
  const [activeTab, setActiveTab] = useState('profile')
  const [skillInput, setSkillInput] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [profileDirty, setProfileDirty] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const pendingDomRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (pendingDomRef.current) {
      pendingDomRef.current()
      pendingDomRef.current = null
    }
  })

  const profileCompleteness = getProfileCompleteness(settings)

  const updateSettings = useCallback((updater: (prev: SettingsState) => SettingsState) => {
    setSettings((prev) => {
      const next = updater(prev)
      saveSettings(next)
      return next
    })
  }, [])

  /* ─── Profile Section ─── */
  const handleAddSkill = () => {
    const skill = skillInput.trim()
    if (!skill) return
    if (settings.profile.skills.includes(skill)) {
      toast({ title: 'Skill already added', variant: 'destructive' })
      return
    }
    updateSettings((prev) => ({
      ...prev,
      profile: { ...prev.profile, skills: [...prev.profile.skills, skill] },
    }))
    setSkillInput('')
  }

  const handleRemoveSkill = (skill: string) => {
    updateSettings((prev) => ({
      ...prev,
      profile: { ...prev.profile, skills: prev.profile.skills.filter((s) => s !== skill) },
    }))
  }

  const handleSaveProfile = () => {
    setProfileDirty(false)
    toast({ title: 'Profile settings saved!' })
  }

  /* ─── Notifications Section ─── */
  const toggleNotification = (key: keyof SettingsState['notifications']) => {
    updateSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: !prev.notifications[key] },
    }))
  }

  /* ─── Appearance Section ─── */
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings((prev) => ({
      ...prev,
      appearance: { ...prev.appearance, theme },
    }))
    pendingDomRef.current = () => {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else if (theme === 'light') {
        document.documentElement.classList.remove('dark')
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    }
  }

  const handleFontSizeChange = (fontSize: 'small' | 'medium' | 'large') => {
    updateSettings((prev) => ({
      ...prev,
      appearance: { ...prev.appearance, fontSize },
    }))
    pendingDomRef.current = () => {
      const sizeMap = { small: '14px', medium: '16px', large: '18px' }
      document.documentElement.style.fontSize = sizeMap[fontSize]
    }
  }

  /* ─── Privacy Section ─── */
  const handleVisibilityChange = (visibility: 'public' | 'private') => {
    updateSettings((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, profileVisibility: visibility },
    }))
  }

  const handleDeleteAccount = () => {
    setDeleteDialogOpen(false)
    toast({ title: 'Account deletion is not available in demo mode', variant: 'destructive' })
  }

  /* ─── Connected Accounts ─── */
  const toggleConnectedAccount = (key: keyof SettingsState['connectedAccounts']) => {
    updateSettings((prev) => ({
      ...prev,
      connectedAccounts: { ...prev.connectedAccounts, [key]: !prev.connectedAccounts[key] },
    }))
    toast({ title: 'Connected accounts are coming soon!' })
  }

  /* ─── Render sidebar tab button ─── */
  const renderSidebarButton = (tab: typeof settingTabs[number]) => {
    const Icon = tab.icon
    const isActive = activeTab === tab.id
    return (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
          isActive
            ? 'bg-orange-50 dark:bg-orange-900/20 text-[#fb8000] shadow-sm'
            : 'text-foreground/70 hover:bg-muted hover:text-foreground'
        }`}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1">{tab.label}</span>
        {isActive && <ChevronRight className="w-4 h-4" />}
      </button>
    )
  }

  const notificationItems = [
    { key: 'email' as const, label: 'Email Notifications', desc: 'Receive notifications via email', icon: Mail },
    { key: 'push' as const, label: 'Push Notifications', desc: 'Receive push notifications in your browser', icon: Bell },
    { key: 'sms' as const, label: 'SMS Notifications', desc: 'Get text messages for important updates', icon: Smartphone },
    { key: 'designUpdates' as const, label: 'Design Updates', desc: 'New versions, comments, and reviews on your designs', icon: PaletteIcon },
    { key: 'marketing' as const, label: 'Marketing Emails', desc: 'Product updates, tips, and promotional content', icon: Megaphone },
    { key: 'security' as const, label: 'Security Alerts', desc: 'Login alerts, password changes, and security warnings', icon: ShieldAlert },
    { key: 'newFollower' as const, label: 'New Follower Alerts', desc: 'Get notified when someone follows you', icon: User },
    { key: 'messages' as const, label: 'Message Notifications', desc: 'Get notified when you receive a message', icon: MessageSquare },
    { key: 'weeklyDigest' as const, label: 'Weekly Digest', desc: 'Receive a weekly summary of activity', icon: Clock },
  ]

  const connectedAccounts = [
    { key: 'google' as const, label: 'Google', desc: 'Sign in with your Google account', color: 'bg-red-100 dark:bg-red-900/30', icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    )},
    { key: 'github' as const, label: 'GitHub', desc: 'Connect your GitHub account', color: 'bg-slate-100 dark:bg-slate-800', icon: (
      <svg className="w-5 h-5 dark:fill-white fill-current" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    )},
    { key: 'dribbble' as const, label: 'Dribbble', desc: 'Showcase your design portfolio', color: 'bg-pink-100 dark:bg-pink-900/30', icon: <Dribbble className="w-5 h-5 text-pink-500" /> },
    { key: 'behance' as const, label: 'Behance', desc: 'Connect your Adobe portfolio', color: 'bg-blue-100 dark:bg-blue-900/30', icon: (
      <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.021h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zM3 11h3.584c2.508 0 2.906-3-.312-3H3v3zm3.391 3H3v3.016h3.341c3.055 0 2.868-3.016.05-3.016z"/>
      </svg>
    )},
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-16 z-30">
        <div className="absolute inset-0 dot-grid-bg opacity-20" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-orange flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your account preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        {/* Mobile Tabs */}
        <div className="md:hidden mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {settingTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#fb8000] text-white shadow-md'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <Card className="sticky top-36">
              <CardContent className="p-2">
                <div className="space-y-1">
                  {settingTabs.map(renderSidebarButton)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'profile' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-[#fb8000]" />
                        Profile Settings
                      </CardTitle>
                      <CardDescription>Update your personal information and public profile</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Avatar + Upload */}
                      <div className="flex items-center gap-4">
                        <div className="relative group">
                          <div className="w-20 h-20 rounded-full gradient-orange flex items-center justify-center text-2xl font-bold text-white">
                            {settings.profile.name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <button
                            className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            onClick={() => toast({ title: 'Avatar upload coming soon!' })}
                          >
                            <Camera className="w-5 h-5 text-white" />
                          </button>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Profile Photo</p>
                          <p className="text-xs text-muted-foreground">Click to change your avatar</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 h-7 text-xs gap-1"
                            onClick={() => toast({ title: 'Avatar upload coming soon!' })}
                          >
                            <Camera className="w-3 h-3" /> Upload Photo
                          </Button>
                        </div>
                      </div>

                      {/* Profile Completeness */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Profile Completeness</Label>
                          <span className="text-sm font-semibold text-[#fb8000]">{profileCompleteness}%</span>
                        </div>
                        <Progress value={profileCompleteness} className="h-2 progress-bar-animate" />
                        <p className="text-xs text-muted-foreground">
                          {profileCompleteness < 50
                            ? 'Add more details to help others find and connect with you'
                            : profileCompleteness < 100
                            ? 'Almost there! Add the remaining details to complete your profile'
                            : 'Your profile is complete! Great job!'}
                        </p>
                      </div>

                      <Separator />

                      {/* Name */}
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={settings.profile.name}
                          onChange={(e) => {
                            updateSettings((prev) => ({
                              ...prev,
                              profile: { ...prev.profile, name: e.target.value },
                            }))
                            setProfileDirty(true)
                          }}
                          placeholder="Your name"
                        />
                      </div>

                      {/* Bio */}
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <textarea
                          id="bio"
                          value={settings.profile.bio}
                          onChange={(e) => {
                            updateSettings((prev) => ({
                              ...prev,
                              profile: { ...prev.profile, bio: e.target.value },
                            }))
                            setProfileDirty(true)
                          }}
                          placeholder="Tell us about yourself..."
                          rows={3}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                        />
                      </div>

                      {/* Location & Website */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="location" className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5" /> Location
                          </Label>
                          <Input
                            id="location"
                            value={settings.profile.location}
                            onChange={(e) => {
                              updateSettings((prev) => ({
                                ...prev,
                                profile: { ...prev.profile, location: e.target.value },
                              }))
                              setProfileDirty(true)
                            }}
                            placeholder="City, Country"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website" className="flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5" /> Website
                          </Label>
                          <Input
                            id="website"
                            value={settings.profile.website}
                            onChange={(e) => {
                              updateSettings((prev) => ({
                                ...prev,
                                profile: { ...prev.profile, website: e.target.value },
                              }))
                              setProfileDirty(true)
                            }}
                            placeholder="https://yoursite.com"
                          />
                        </div>
                      </div>

                      {/* Specialization */}
                      <div className="space-y-2">
                        <Label>Specialization</Label>
                        <Select
                          value={settings.profile.specialization}
                          onValueChange={(value) => {
                            updateSettings((prev) => ({
                              ...prev,
                              profile: { ...prev.profile, specialization: value },
                            }))
                            setProfileDirty(true)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your specialization" />
                          </SelectTrigger>
                          <SelectContent>
                            {specializations.map((spec) => (
                              <SelectItem key={spec} value={spec}>
                                {spec}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Skills */}
                      <div className="space-y-2">
                        <Label>Skills</Label>
                        <div className="flex gap-2">
                          <Input
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAddSkill()
                              }
                            }}
                            placeholder="Type a skill and press Enter"
                          />
                          <Button
                            variant="outline"
                            onClick={handleAddSkill}
                            className="flex-shrink-0"
                          >
                            Add
                          </Button>
                        </div>
                        {settings.profile.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {settings.profile.skills.map((skill) => (
                              <Badge
                                key={skill}
                                variant="secondary"
                                className="gap-1 pr-1 bg-orange-50 dark:bg-orange-900/20 text-[#fb8000] border-orange-200 dark:border-orange-800"
                              >
                                {skill}
                                <button
                                  onClick={() => handleRemoveSkill(skill)}
                                  className="ml-1 rounded-full hover:bg-orange-200 dark:hover:bg-orange-800 p-0.5 transition-colors"
                                  aria-label={`Remove ${skill}`}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Social Links */}
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-base font-medium">
                          <ExternalLink className="w-4 h-4" /> Social Links
                        </Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="twitter" className="text-xs text-muted-foreground">Twitter / X</Label>
                            <Input
                              id="twitter"
                              value={settings.profile.socialLinks.twitter}
                              onChange={(e) => {
                                updateSettings((prev) => ({
                                  ...prev,
                                  profile: { ...prev.profile, socialLinks: { ...prev.profile.socialLinks, twitter: e.target.value } },
                                }))
                                setProfileDirty(true)
                              }}
                              placeholder="@username"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="linkedin" className="text-xs text-muted-foreground">LinkedIn</Label>
                            <Input
                              id="linkedin"
                              value={settings.profile.socialLinks.linkedin}
                              onChange={(e) => {
                                updateSettings((prev) => ({
                                  ...prev,
                                  profile: { ...prev.profile, socialLinks: { ...prev.profile.socialLinks, linkedin: e.target.value } },
                                }))
                                setProfileDirty(true)
                              }}
                              placeholder="linkedin.com/in/username"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="dribbble" className="text-xs text-muted-foreground">Dribbble</Label>
                            <Input
                              id="dribbble"
                              value={settings.profile.socialLinks.dribbble}
                              onChange={(e) => {
                                updateSettings((prev) => ({
                                  ...prev,
                                  profile: { ...prev.profile, socialLinks: { ...prev.profile.socialLinks, dribbble: e.target.value } },
                                }))
                                setProfileDirty(true)
                              }}
                              placeholder="dribbble.com/username"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="behance" className="text-xs text-muted-foreground">Behance</Label>
                            <Input
                              id="behance"
                              value={settings.profile.socialLinks.behance}
                              onChange={(e) => {
                                updateSettings((prev) => ({
                                  ...prev,
                                  profile: { ...prev.profile, socialLinks: { ...prev.profile.socialLinks, behance: e.target.value } },
                                }))
                                setProfileDirty(true)
                              }}
                              placeholder="behance.net/username"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Save / Cancel */}
                      <div className="flex gap-3 pt-4 border-t border-border/50">
                        <Button
                          onClick={handleSaveProfile}
                          className="gradient-orange gradient-orange-hover text-white border-0 gap-2"
                          disabled={!profileDirty}
                        >
                          <Save className="w-4 h-4" /> Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSettings(loadSettings())
                            setProfileDirty(false)
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'notifications' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-[#fb8000]" />
                        Notification Preferences
                      </CardTitle>
                      <CardDescription>Choose how and when you want to be notified</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      {notificationItems.map((item, index) => {
                        const Icon = item.icon
                        return (
                          <div
                            key={item.key}
                            className={`flex items-center justify-between py-4 ${
                              index < notificationItems.length - 1 ? 'border-b border-border/50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3 flex-1 min-w-0 pr-4">
                              <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Icon className="w-4 h-4 text-[#fb8000]" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{item.label}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                              </div>
                            </div>
                            <Switch
                              checked={settings.notifications[item.key]}
                              onCheckedChange={() => toggleNotification(item.key)}
                            />
                          </div>
                        )
                      })}
                      <div className="pt-4">
                        <Button
                          onClick={() => toast({ title: 'Notification preferences saved!' })}
                          className="gradient-orange gradient-orange-hover text-white border-0 gap-2"
                        >
                          <Save className="w-4 h-4" /> Save Preferences
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'appearance' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-[#fb8000]" />
                        Appearance
                      </CardTitle>
                      <CardDescription>Customize how DesignConnect looks for you</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      {/* Theme with visual preview cards */}
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Theme</Label>
                        <div className="grid grid-cols-3 gap-4">
                          {(['light', 'dark', 'system'] as const).map((theme) => (
                            <button
                              key={theme}
                              onClick={() => handleThemeChange(theme)}
                              className={`theme-preview-card p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                                settings.appearance.theme === theme
                                  ? 'selected border-[#fb8000] shadow-md'
                                  : 'border-border hover:border-[#fb8000]/40'
                              }`}
                            >
                              {/* Visual preview */}
                              <div className="w-full h-16 rounded-lg mb-3 overflow-hidden border border-border/30">
                                {theme === 'light' && (
                                  <div className="w-full h-full bg-white p-2 flex flex-col gap-1">
                                    <div className="w-3/4 h-2 bg-slate-200 rounded" />
                                    <div className="flex gap-1 flex-1">
                                      <div className="w-1/3 bg-orange-100 rounded" />
                                      <div className="w-1/3 bg-blue-50 rounded" />
                                      <div className="w-1/3 bg-green-50 rounded" />
                                    </div>
                                  </div>
                                )}
                                {theme === 'dark' && (
                                  <div className="w-full h-full bg-slate-900 p-2 flex flex-col gap-1">
                                    <div className="w-3/4 h-2 bg-slate-700 rounded" />
                                    <div className="flex gap-1 flex-1">
                                      <div className="w-1/3 bg-orange-900/40 rounded" />
                                      <div className="w-1/3 bg-blue-900/40 rounded" />
                                      <div className="w-1/3 bg-green-900/40 rounded" />
                                    </div>
                                  </div>
                                )}
                                {theme === 'system' && (
                                  <div className="w-full h-full flex">
                                    <div className="w-1/2 h-full bg-white p-1.5 flex flex-col gap-0.5">
                                      <div className="w-3/4 h-1.5 bg-slate-200 rounded" />
                                      <div className="flex-1 bg-orange-100 rounded" />
                                    </div>
                                    <div className="w-1/2 h-full bg-slate-900 p-1.5 flex flex-col gap-0.5">
                                      <div className="w-3/4 h-1.5 bg-slate-700 rounded" />
                                      <div className="flex-1 bg-orange-900/40 rounded" />
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-lg">{theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '💻'}</span>
                                <p className="text-sm font-medium capitalize">{theme}</p>
                              </div>
                              {settings.appearance.theme === theme && (
                                <motion.div
                                  layoutId="theme-indicator"
                                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-orange flex items-center justify-center"
                                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                >
                                  <Check className="w-3 h-3 text-white" />
                                </motion.div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Font Size */}
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Font Size</Label>
                        <div className="grid grid-cols-3 gap-3">
                          {(['small', 'medium', 'large'] as const).map((size) => (
                            <button
                              key={size}
                              onClick={() => handleFontSizeChange(size)}
                              className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                                settings.appearance.fontSize === size
                                  ? 'border-[#fb8000] bg-orange-50 dark:bg-orange-900/20 shadow-md'
                                  : 'border-border hover:border-[#fb8000]/40'
                              }`}
                            >
                              <p className={`font-medium capitalize ${size === 'small' ? 'text-xs' : size === 'medium' ? 'text-sm' : 'text-base'}`}>
                                Aa
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 capitalize">{size}</p>
                              {settings.appearance.fontSize === size && (
                                <motion.div
                                  layoutId="font-indicator"
                                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-orange flex items-center justify-center"
                                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                >
                                  <Check className="w-3 h-3 text-white" />
                                </motion.div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Compact Mode */}
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium">Compact Mode</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Reduce spacing and padding for denser layout</p>
                        </div>
                        <Switch
                          checked={settings.appearance.compactMode}
                          onCheckedChange={() =>
                            updateSettings((prev) => ({
                              ...prev,
                              appearance: { ...prev.appearance, compactMode: !prev.appearance.compactMode },
                            }))
                          }
                        />
                      </div>

                      {/* Reduce Motion */}
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium">Reduce Motion</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Minimize animations for accessibility</p>
                        </div>
                        <Switch
                          checked={settings.appearance.reduceMotion}
                          onCheckedChange={(checked) => {
                            updateSettings((prev) => ({
                              ...prev,
                              appearance: { ...prev.appearance, reduceMotion: checked },
                            }))
                            pendingDomRef.current = () => {
                              if (checked) {
                                document.documentElement.style.setProperty('--motion-duration', '0s')
                              } else {
                                document.documentElement.style.removeProperty('--motion-duration')
                              }
                            }
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'privacy' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-[#fb8000]" />
                        Privacy & Security
                      </CardTitle>
                      <CardDescription>Control your privacy settings and secure your account</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Profile Visibility */}
                      <div className="space-y-3">
                        <Label className="text-base font-medium flex items-center gap-2">
                          {settings.privacy.profileVisibility === 'public' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          Profile Visibility
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          {(['public', 'private'] as const).map((visibility) => (
                            <button
                              key={visibility}
                              onClick={() => handleVisibilityChange(visibility)}
                              className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                                settings.privacy.profileVisibility === visibility
                                  ? 'border-[#fb8000] bg-orange-50 dark:bg-orange-900/20 shadow-md'
                                  : 'border-border hover:border-[#fb8000]/40'
                              }`}
                            >
                              <div className="text-2xl mb-2">
                                {visibility === 'public' ? '🌍' : '🔒'}
                              </div>
                              <p className="text-sm font-medium capitalize">{visibility}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {visibility === 'public' ? 'Anyone can view your profile' : 'Only you can see your profile'}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Show Email */}
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                            <Mail className="w-4 h-4 text-[#fb8000]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Show Email</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Display your email on your public profile</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.privacy.showEmail}
                          onCheckedChange={() =>
                            updateSettings((prev) => ({
                              ...prev,
                              privacy: { ...prev.privacy, showEmail: !prev.privacy.showEmail },
                            }))
                          }
                        />
                      </div>

                      {/* Show Location */}
                      <div className="flex items-center justify-between py-2 border-t border-border/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-[#fb8000]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Show Location</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Display your location on your public profile</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.privacy.showLocation}
                          onCheckedChange={() =>
                            updateSettings((prev) => ({
                              ...prev,
                              privacy: { ...prev.privacy, showLocation: !prev.privacy.showLocation },
                            }))
                          }
                        />
                      </div>

                      {/* Two Factor Auth */}
                      <div className="flex items-center justify-between py-2 border-t border-border/50">
                        <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                            <Lock className="w-4 h-4 text-[#fb8000]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">Two-Factor Authentication</p>
                              <Badge variant="outline" className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                                Coming Soon
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">Add an extra layer of security to your account</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.privacy.twoFactor}
                          onCheckedChange={() => toast({ title: 'Two-factor authentication is coming soon!' })}
                          disabled
                        />
                      </div>

                      <Separator />

                      {/* Danger Zone */}
                      <div className="danger-zone p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                          <Button variant="destructive" className="gap-2" onClick={() => setDeleteDialogOpen(true)}>
                            <Trash2 className="w-4 h-4" />
                            Delete Account
                          </Button>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-destructive" />
                                Delete Account
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="py-2">
                              <Label htmlFor="confirm-delete" className="text-sm text-muted-foreground">
                                Type &quot;DELETE&quot; to confirm
                              </Label>
                              <Input
                                id="confirm-delete"
                                placeholder="DELETE"
                                className="mt-2"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                              />
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== 'DELETE'}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete Account
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'connected' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Link2 className="w-5 h-5 text-[#fb8000]" />
                        Connected Accounts
                      </CardTitle>
                      <CardDescription>Manage your linked social accounts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {connectedAccounts.map((account) => (
                        <div
                          key={account.key}
                          className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-border transition-colors social-connect-btn-container"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg ${account.color} flex items-center justify-center`}>
                              {account.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">{account.label}</p>
                                {settings.connectedAccounts[account.key] ? (
                                  <Badge className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 border">
                                    <Check className="w-3 h-3 mr-0.5" /> Connected
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                                    Not Connected
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{account.desc}</p>
                            </div>
                          </div>
                          <Button
                            variant={settings.connectedAccounts[account.key] ? 'outline' : 'default'}
                            size="sm"
                            onClick={() => toggleConnectedAccount(account.key)}
                            className={settings.connectedAccounts[account.key] ? 'text-red-500 border-red-200 dark:border-red-800' : 'gradient-orange gradient-orange-hover text-white border-0'}
                          >
                            {settings.connectedAccounts[account.key] ? 'Disconnect' : 'Connect'}
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Sticky Save Bar */}
      {profileDirty && activeTab === 'profile' && (
        <div className="sticky-save-bar">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">You have unsaved changes</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSettings(loadSettings())
                  setProfileDirty(false)
                }}
              >
                Discard
              </Button>
              <Button
                size="sm"
                onClick={handleSaveProfile}
                className="gradient-orange gradient-orange-hover text-white border-0 gap-2"
              >
                <Save className="w-4 h-4" /> Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
