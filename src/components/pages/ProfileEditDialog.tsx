'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Camera, Loader2 } from 'lucide-react'
import { useNavStore } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { isSupabaseReady, createClient } from '@/lib/supabase/client'

interface ProfileEditProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile?: {
    id: string
    name: string
    email: string
    avatar: string | null
    bio: string | null
    location: string | null
    website: string | null
    specialization: string | null
    skills: string | null
    experience: string | null
    instagram: string | null
    twitter: string | null
    linkedin: string | null
  }
  onProfileUpdated?: (updated: any) => void
}

export default function ProfileEditDialog({ open, onOpenChange, profile, onProfileUpdated }: ProfileEditProps) {
  const { user, setUser } = useNavStore()

  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [website, setWebsite] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [skills, setSkills] = useState('')
  const [experience, setExperience] = useState('')
  const [instagram, setInstagram] = useState('')
  const [twitter, setTwitter] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Initialize form with current profile data
  useEffect(() => {
    if (open) {
      const p = profile || {
        name: user?.name || '',
        email: user?.email || '',
        avatar: user?.avatar || null,
        bio: user?.bio || null,
        location: user?.location || null,
        website: null,
        specialization: null,
        skills: null,
        experience: null,
        instagram: null,
        twitter: null,
        linkedin: null,
      }
      setName(p.name || '')
      setBio(p.bio || '')
      setLocation(p.location || '')
      setWebsite(p.website || '')
      setSpecialization(p.specialization || '')
      setSkills(p.skills || '')
      setExperience(p.experience || '')
      setInstagram(p.instagram || '')
      setTwitter(p.twitter || '')
      setLinkedin(p.linkedin || '')
      setError('')
      setSuccess('')
    }
  }, [open, profile, user])

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      if (isSupabaseReady() && user) {
        const supabase = createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (authUser) {
          // Update auth metadata
          await supabase.auth.updateUser({
            data: { name, bio, location }
          })

          // Update public profile
          const { error: profileError } = await supabase
            .from('users')
            .upsert({
              id: authUser.id,
              name,
              bio: bio || null,
              location: location || null,
              website: website || null,
              specialization: specialization || null,
              skills: skills || null,
              experience: experience || null,
              instagram: instagram || null,
              twitter: twitter || null,
              linkedin: linkedin || null,
            }, { onConflict: 'id' })

          if (profileError) throw profileError
        }
      }

      // Update local user state
      const updatedUser = {
        ...user!,
        name,
        bio: bio || null,
        location: location || null,
      }
      setUser(updatedUser)

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('dc_user', JSON.stringify(updatedUser))
        // Also save extended profile
        localStorage.setItem('dc_profile_extended', JSON.stringify({
          website,
          specialization,
          skills,
          experience,
          instagram,
          twitter,
          linkedin,
        }))
      }

      setSuccess('Profile updated successfully!')
      if (onProfileUpdated) {
        onProfileUpdated({
          name, bio, location, website, specialization, skills, experience, instagram, twitter, linkedin
        })
      }

      setTimeout(() => {
        setSuccess('')
        onOpenChange(false)
      }, 1500)
    } catch (err) {
      console.error('Profile update error:', err)
      setError('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded-xl"
          >
            {success}
          </motion.div>
        )}

        <div className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-xl gradient-orange text-white font-bold">
                {name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Profile Photo</p>
              <p className="text-xs text-muted-foreground">Photo upload coming soon</p>
            </div>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="edit-name" className="mb-1.5 block text-sm">Full Name *</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="edit-bio" className="mb-1.5 block text-sm">Bio</Label>
            <Textarea
              id="edit-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className="min-h-[80px]"
            />
          </div>

          {/* Location & Website */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-location" className="mb-1.5 block text-sm">Location</Label>
              <Input
                id="edit-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
              />
            </div>
            <div>
              <Label htmlFor="edit-website" className="mb-1.5 block text-sm">Website</Label>
              <Input
                id="edit-website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yoursite.com"
              />
            </div>
          </div>

          {/* Specialization & Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-spec" className="mb-1.5 block text-sm">Specialization</Label>
              <Input
                id="edit-spec"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Brand Identity, Logo Design"
              />
            </div>
            <div>
              <Label htmlFor="edit-exp" className="mb-1.5 block text-sm">Experience</Label>
              <Input
                id="edit-exp"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. 5+ years"
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <Label htmlFor="edit-skills" className="mb-1.5 block text-sm">Skills</Label>
            <Input
              id="edit-skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Comma-separated: Figma, Photoshop, Illustrator"
            />
            <p className="text-xs text-muted-foreground mt-1">Separate skills with commas</p>
          </div>

          {/* Social Links */}
          <div>
            <p className="text-sm font-medium mb-3">Social Links</p>
            <div className="space-y-3">
              <div>
                <Label htmlFor="edit-instagram" className="mb-1 block text-xs text-muted-foreground">Instagram</Label>
                <Input
                  id="edit-instagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/username"
                />
              </div>
              <div>
                <Label htmlFor="edit-twitter" className="mb-1 block text-xs text-muted-foreground">Twitter / X</Label>
                <Input
                  id="edit-twitter"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="https://x.com/username"
                />
              </div>
              <div>
                <Label htmlFor="edit-linkedin" className="mb-1 block text-xs text-muted-foreground">LinkedIn</Label>
                <Input
                  id="edit-linkedin"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 gradient-orange gradient-orange-hover text-white border-0"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
