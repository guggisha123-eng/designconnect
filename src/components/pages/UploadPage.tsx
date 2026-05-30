'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, Image, FileText, Tag, Check, ChevronRight,
  ChevronLeft, Loader2, X, DollarSign, Sparkles, Info, CloudUpload
} from 'lucide-react'
import { useNavStore } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient, isSupabaseReady } from '@/lib/supabase/client'

const designCategories = [
  'Logo Design', 'UI/UX Design', 'Illustrations', 'Typography',
  '3D Design', 'Social Media', 'Print Design', 'Motion Design',
  'Icon Sets', 'Web Templates', 'Business Cards', 'Posters'
]

export default function UploadPage() {
  const { navigateTo, isLoggedIn, user } = useNavStore()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false)
  const dragCounterRef = useRef(0)

  // Demo mode check
  const demoMode = !isSupabaseReady()

  // Step 1: Images (store actual File objects)
  const [imageFiles, setImageFiles] = useState<File[]>([])
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
  const [uploadProgress, setUploadProgress] = useState('')

  const processFiles = useCallback((files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/') && !file.name.endsWith('.svg') && !file.name.endsWith('.pdf')) {
        return
      }

      // Store actual File object
      setImageFiles(prev => [...prev, file])

      // Create preview URL
      const reader = new FileReader()
      reader.onload = (ev) => {
        const result = ev.target?.result as string
        setImagePreviews(prev => [...prev, result])
      }
      reader.readAsDataURL(file)
    })

    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    processFiles(files)
  }

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current += 1
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current -= 1
    if (dragCounterRef.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    dragCounterRef.current = 0

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      processFiles(files)
    }
  }, [processFiles])

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

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

  const handleDemoSubmit = async () => {
    if (!title.trim() || !category) {
      setError('Title and Category are required')
      return
    }

    if (imageFiles.length === 0) {
      setError('Please upload at least one image')
      return
    }

    setError('')
    setLoading(true)
    setUploadProgress('Preparing upload...')

    // Simulate upload progress
    await new Promise(resolve => setTimeout(resolve, 800))
    setUploadProgress('Processing images...')

    await new Promise(resolve => setTimeout(resolve, 600))
    setUploadProgress('Saving design...')

    // Store to localStorage
    try {
      const storedDesigns = localStorage.getItem('dc_uploaded_designs')
      const existingDesigns = storedDesigns ? JSON.parse(storedDesigns) : []

      const newDesign = {
        id: `demo-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        category,
        subcategory: subcategory.trim(),
        isFree,
        price: isFree ? 0 : parseFloat(price) || 0,
        sourceFiles: sourceFiles.trim(),
        imageCount: imageFiles.length,
        previewImages: imagePreviews.slice(0, 3),
        designer_id: user?.id || 'demo-user',
        designer_name: user?.name || 'Demo User',
        status: 'active',
        like_count: 0,
        view_count: 0,
        download_count: 0,
        created_at: new Date().toISOString(),
      }

      existingDesigns.unshift(newDesign)
      localStorage.setItem('dc_uploaded_designs', JSON.stringify(existingDesigns))

      setUploadProgress('')
      setSuccess(true)
    } catch {
      setError('Failed to save design. Please try again.')
      setUploadProgress('')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (demoMode) {
      await handleDemoSubmit()
      return
    }

    if (!title.trim() || !category) {
      setError('Title and Category are required')
      return
    }

    if (imageFiles.length === 0) {
      setError('Please upload at least one image')
      return
    }

    setError('')
    setLoading(true)
    setUploadProgress('Preparing upload...')

    try {
      // Get authenticated user from Supabase
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (!user) {
        setError('Please sign in again to upload')
        setLoading(false)
        return
      }

      setUploadProgress('Uploading images...')

      // Build FormData with actual files
      const formData = new FormData()
      formData.append('userId', user.id)
      formData.append('title', title.trim())
      formData.append('description', description.trim())
      formData.append('category', category)
      formData.append('subcategory', subcategory.trim())
      formData.append('isFree', String(isFree))
      formData.append('price', price || '0')
      formData.append('sourceFiles', sourceFiles.trim())

      imageFiles.forEach((file) => {
        formData.append('images', file)
      })

      // Call our API route
      const response = await fetch('/api/upload-design', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setUploadProgress('')
      setSuccess(true)
    } catch (err: any) {
      console.error('Upload error:', err)
      setUploadProgress('')

      // Check if it's a storage bucket issue
      if (err.message?.includes('bucket') || err.message?.includes('storage')) {
        setError('Storage is being configured. Please try again in a moment.')
      } else {
        setError(err.message || 'Upload failed. Please try again.')
      }
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
          {demoMode
            ? 'Your design has been saved locally. It will appear in the browse section during this session.'
            : 'Your design has been saved and is now visible on your dashboard and in the browse section.'
          }
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigateTo('browse')}>
            Browse Designs
          </Button>
          <Button onClick={() => navigateTo('dashboard')} className="gradient-orange gradient-orange-hover text-white border-0">
            Go to Dashboard
          </Button>
        </div>
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
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl gradient-orange flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Upload Design</h1>
              <p className="text-muted-foreground text-sm">Share your creative work with the world</p>
            </div>
          </div>
          {/* Gradient accent line */}
          <div className="h-1 w-24 rounded-full bg-gradient-to-r from-[#fb8000] to-[#f59e0b]" />
        </motion.div>

        {/* Demo mode notice */}
        {demoMode && (
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
                  Full upload functionality will be available once Supabase is configured. In the meantime, your uploads will be saved locally and visible during this session.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-10">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <button
                onClick={() => s.num < step && setStep(s.num)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  step === s.num
                    ? 'bg-[#fb8000] text-white shadow-lg shadow-orange-500/20'
                    : step > s.num
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
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
                <div className="relative w-8 sm:w-16 h-0.5 mx-2 bg-muted overflow-hidden rounded-full">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-green-400 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: step > s.num ? '100%' : '0%' }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-center gap-2">
            <X className="w-4 h-4 flex-shrink-0" />
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
            <Card className="border-0 shadow-sm dark:bg-slate-900">
              <CardContent className="p-6 sm:p-8">
                {step === 1 && (
                  <div>
                    <h2 className="text-xl font-bold mb-2">Upload Your Design</h2>
                    <p className="text-muted-foreground text-sm mb-6">
                      Upload screenshots, mockups, or source files. Accepts PNG, JPG, SVG, and PDF.
                    </p>

                    <div
                      className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer relative overflow-hidden ${
                        isDragging
                          ? 'border-[#fb8000] bg-orange-50/50 dark:bg-orange-900/10 scale-[1.01]'
                          : 'border-muted-foreground/20 hover:border-[#fb8000]/50 dark:border-muted-foreground/30 dark:hover:border-[#fb8000]/50 dark:bg-slate-900/50'
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      {/* Animated background when dragging */}
                      <AnimatePresence>
                        {isDragging && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gradient-to-b from-[#fb8000]/5 to-transparent pointer-events-none"
                          />
                        )}
                      </AnimatePresence>

                      <motion.div
                        animate={isDragging ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {isDragging ? (
                          <CloudUpload className="w-14 h-14 text-[#fb8000] mx-auto mb-4" />
                        ) : (
                          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        )}
                      </motion.div>

                      <p className="font-medium mb-1">
                        {isDragging ? 'Drop your files here!' : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isDragging ? 'Release to add your design files' : 'PNG, JPG, SVG, PDF up to 50MB'}
                      </p>

                      <input
                        ref={fileInputRef}
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
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeImage(i)
                                }}
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
                      Add a title and description for your design.
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
                                ? 'border-[#fb8000] bg-orange-50 dark:bg-orange-900/20 text-[#fb8000]'
                                : 'border-transparent bg-muted dark:bg-slate-800 text-muted-foreground hover:border-border dark:hover:border-slate-600'
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
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                              : 'border-transparent bg-muted dark:bg-slate-800 text-muted-foreground'
                          }`}
                        >
                          Free Download
                        </button>
                        <button
                          onClick={() => setIsFree(false)}
                          className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all border-2 ${
                            !isFree
                              ? 'border-[#fb8000] bg-orange-50 dark:bg-orange-900/20 text-[#fb8000]'
                              : 'border-transparent bg-muted dark:bg-slate-800 text-muted-foreground'
                          }`}
                        >
                          Paid Download
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
                        <Card className="border-0 bg-slate-50 dark:bg-slate-800">
                          <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground mb-1">Title</p>
                            <p className="font-medium text-sm">{title || 'Untitled'}</p>
                          </CardContent>
                        </Card>
                        <Card className="border-0 bg-slate-50 dark:bg-slate-800">
                          <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground mb-1">Category</p>
                            <p className="font-medium text-sm">{category || 'Not selected'}</p>
                          </CardContent>
                        </Card>
                      </div>

                      <Card className="border-0 bg-slate-50 dark:bg-slate-800">
                        <CardContent className="p-4">
                          <p className="text-xs text-muted-foreground mb-1">Description</p>
                          <p className="text-sm">{description || 'No description'}</p>
                        </CardContent>
                      </Card>

                      <div className="grid grid-cols-3 gap-4">
                        <Card className="border-0 bg-slate-50 dark:bg-slate-800">
                          <CardContent className="p-4 text-center">
                            <p className="text-xs text-muted-foreground mb-1">Price</p>
                            <p className="font-bold text-sm">{isFree ? 'Free' : `$${price || '0'}`}</p>
                          </CardContent>
                        </Card>
                        <Card className="border-0 bg-slate-50 dark:bg-slate-800">
                          <CardContent className="p-4 text-center">
                            <p className="text-xs text-muted-foreground mb-1">Files</p>
                            <p className="font-bold text-sm">{imageFiles.length} image(s)</p>
                          </CardContent>
                        </Card>
                        <Card className="border-0 bg-slate-50 dark:bg-slate-800">
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

                      {demoMode && (
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs rounded-xl flex items-center gap-2">
                          <Info className="w-3.5 h-3.5 flex-shrink-0" />
                          This design will be saved locally in demo mode. Connect Supabase for persistent storage.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Upload Progress */}
        {uploadProgress && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-sm rounded-xl flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {uploadProgress}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setStep(s => s - 1)}
            disabled={step <= 1 || loading}
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
              disabled={loading || !title || !category || imageFiles.length === 0}
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
