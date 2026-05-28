'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, Image, FileText, Tag, Check, ChevronRight,
  ChevronLeft, Loader2, X, DollarSign, Sparkles
} from 'lucide-react'
import { useNavStore } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const designCategories = [
  'Logo Design', 'UI/UX Design', 'Illustrations', 'Typography',
  '3D Design', 'Social Media', 'Print Design', 'Motion Design',
  'Icon Sets', 'Web Templates', 'Business Cards', 'Posters'
]

export default function UploadPage() {
  const { navigateTo, isLoggedIn } = useNavStore()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Step 1: Images
  const [images, setImages] = useState<string[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  // Step 2: Details
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  // Step 3: Category & Pricing
  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [isFree, setIsFree] = useState(true)
  const [price, setPrice] = useState('')
  const [sourceFiles, setSourceFiles] = useState('')

  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-16 h-16 rounded-2xl gradient-orange flex items-center justify-center mb-4">
          <Upload className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold">Sign in to Upload</h2>
        <p className="text-muted-foreground text-center max-w-md">
          You need to be signed in to upload designs to Design Connect.
        </p>
        <Button onClick={() => navigateTo('auth')} className="gradient-orange gradient-orange-hover text-white border-0 gap-2">
          Sign In <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const result = ev.target?.result as string
        setImagePreviews(prev => [...prev, result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)

    try {
      // In a real app, upload to Supabase Storage first, then insert design record
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Please sign in to upload')
        return
      }

      // Simulate upload with delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      setSuccess(true)
      setTimeout(() => navigateTo('dashboard'), 2000)
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4"
        >
          <Check className="w-10 h-10 text-green-600" />
        </motion.div>
        <h2 className="text-2xl font-bold">Design Published!</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Your design has been successfully published and is now visible to the community.
        </p>
        <Button onClick={() => navigateTo('dashboard')} className="gradient-orange gradient-orange-hover text-white border-0">
          Go to Dashboard
        </Button>
      </div>
    )
  }

  const steps = [
    { num: 1, title: 'Upload Images', icon: Image },
    { num: 2, title: 'Design Details', icon: FileText },
    { num: 3, title: 'Category & Price', icon: Tag },
    { num: 4, title: 'Publish', icon: Sparkles },
  ]

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Design</h1>
          <p className="text-muted-foreground">Share your creative work with the world</p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-10">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <button
                onClick={() => s.num < step && setStep(s.num)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  step === s.num
                    ? 'bg-[#fb8000] text-white'
                    : step > s.num
                    ? 'bg-green-100 text-green-700'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step > s.num ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <s.icon className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{s.title}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={`w-8 sm:w-16 h-0.5 mx-2 ${step > s.num ? 'bg-green-300' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
            {error}
          </div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 sm:p-8">
                {step === 1 && (
                  <div>
                    <h2 className="text-xl font-bold mb-2">Upload Your Design</h2>
                    <p className="text-muted-foreground text-sm mb-6">
                      Upload screenshots, mockups, or source files for your design. Accepts PNG, JPG, SVG, and PDF.
                    </p>

                    <div
                      className="border-2 border-dashed border-muted-foreground/20 rounded-2xl p-12 text-center hover:border-[#fb8000]/50 transition-colors cursor-pointer"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="font-medium mb-1">Click to upload or drag and drop</p>
                      <p className="text-sm text-muted-foreground">PNG, JPG, SVG, PDF up to 50MB</p>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept="image/*,.pdf,.svg"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>

                    {imagePreviews.length > 0 && (
                      <div className="mt-6">
                        <p className="text-sm font-medium mb-3">
                          {imagePreviews.length} file(s) selected
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                          {imagePreviews.map((preview, i) => (
                            <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-muted">
                              <img
                                src={preview}
                                alt={`Preview ${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() => removeImage(i)}
                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold mb-2">Design Details</h2>
                    <p className="text-muted-foreground text-sm mb-6">
                      Add a title and description for your design to help others discover it.
                    </p>

                    <div>
                      <Label htmlFor="title" className="mb-1.5 block text-sm font-medium">Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Modern Brand Identity Kit"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="description" className="mb-1.5 block text-sm font-medium">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your design, what's included, and how it can be used..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={5}
                      />
                    </div>

                    <div>
                      <Label htmlFor="source-files" className="mb-1.5 block text-sm font-medium">Source File Formats</Label>
                      <Input
                        id="source-files"
                        placeholder="e.g., AI, EPS, SVG, PNG, PDF"
                        value={sourceFiles}
                        onChange={(e) => setSourceFiles(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">List the file formats included</p>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold mb-2">Category & Pricing</h2>
                    <p className="text-muted-foreground text-sm mb-6">
                      Select a category and set your price.
                    </p>

                    <div>
                      <Label className="mb-2 block text-sm font-medium">Category *</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {designCategories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${
                              category === cat
                                ? 'border-[#fb8000] bg-orange-50 text-[#fb8000]'
                                : 'border-transparent bg-muted text-muted-foreground hover:border-border'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subcategory" className="mb-1.5 block text-sm font-medium">Subcategory</Label>
                      <Input
                        id="subcategory"
                        placeholder="e.g., Minimalist, Flat, Corporate"
                        value={subcategory}
                        onChange={(e) => setSubcategory(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label className="mb-2 block text-sm font-medium">Pricing</Label>
                      <div className="flex gap-3 mb-3">
                        <button
                          onClick={() => setIsFree(true)}
                          className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all border-2 ${
                            isFree
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-transparent bg-muted text-muted-foreground'
                          }`}
                        >
                          🆓 Free Download
                        </button>
                        <button
                          onClick={() => setIsFree(false)}
                          className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all border-2 ${
                            !isFree
                              ? 'border-[#fb8000] bg-orange-50 text-[#fb8000]'
                              : 'border-transparent bg-muted text-muted-foreground'
                          }`}
                        >
                          💰 Paid Download
                        </button>
                      </div>
                      {!isFree && (
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="pl-10"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div>
                    <h2 className="text-xl font-bold mb-2">Review & Publish</h2>
                    <p className="text-muted-foreground text-sm mb-6">
                      Review your design details before publishing.
                    </p>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card className="border-0 bg-slate-50">
                          <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground mb-1">Title</p>
                            <p className="font-medium text-sm">{title || 'Untitled'}</p>
                          </CardContent>
                        </Card>
                        <Card className="border-0 bg-slate-50">
                          <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground mb-1">Category</p>
                            <p className="font-medium text-sm">{category || 'Not selected'}</p>
                          </CardContent>
                        </Card>
                      </div>

                      <Card className="border-0 bg-slate-50">
                        <CardContent className="p-4">
                          <p className="text-xs text-muted-foreground mb-1">Description</p>
                          <p className="text-sm">{description || 'No description'}</p>
                        </CardContent>
                      </Card>

                      <div className="grid grid-cols-3 gap-4">
                        <Card className="border-0 bg-slate-50">
                          <CardContent className="p-4 text-center">
                            <p className="text-xs text-muted-foreground mb-1">Price</p>
                            <p className="font-bold text-sm">{isFree ? 'Free' : `$${price || '0'}`}</p>
                          </CardContent>
                        </Card>
                        <Card className="border-0 bg-slate-50">
                          <CardContent className="p-4 text-center">
                            <p className="text-xs text-muted-foreground mb-1">Files</p>
                            <p className="font-bold text-sm">{imagePreviews.length} image(s)</p>
                          </CardContent>
                        </Card>
                        <Card className="border-0 bg-slate-50">
                          <CardContent className="p-4 text-center">
                            <p className="text-xs text-muted-foreground mb-1">Formats</p>
                            <p className="font-bold text-sm">{sourceFiles || 'N/A'}</p>
                          </CardContent>
                        </Card>
                      </div>

                      {imagePreviews.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Preview</p>
                          <div className="flex gap-2 overflow-x-auto custom-scrollbar">
                            {imagePreviews.map((preview, i) => (
                              <img
                                key={i}
                                src={preview}
                                alt={`Preview ${i + 1}`}
                                className="h-24 rounded-lg object-cover flex-shrink-0"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setStep(s => s - 1)}
            disabled={step <= 1}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>
          {step < 4 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              className="gradient-orange gradient-orange-hover text-white border-0 gap-2"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading || !title || !category}
              className="gradient-orange gradient-orange-hover text-white border-0 gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Publish Design</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
