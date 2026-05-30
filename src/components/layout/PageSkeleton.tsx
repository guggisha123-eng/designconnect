'use client'

interface PageSkeletonProps {
  variant: 'home' | 'browse' | 'detail' | 'dashboard' | 'generic'
}

function ShimmerBlock({ className = '' }: { className?: string }) {
  return <div className={`shimmer rounded-lg ${className}`} />
}

function ShimmerLine({ className = '' }: { className?: string }) {
  return <div className={`shimmer rounded ${className}`} />
}

function HomeSkeleton() {
  return (
    <div className="space-y-0">
      {/* Hero block */}
      <div className="min-h-[90vh] flex items-center justify-center px-4">
        <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <ShimmerLine className="h-5 w-48" />
            <div className="space-y-3">
              <ShimmerLine className="h-12 w-full" />
              <ShimmerLine className="h-12 w-3/4" />
            </div>
            <ShimmerLine className="h-5 w-full max-w-lg" />
            <ShimmerLine className="h-5 w-2/3 max-w-lg" />
            <div className="flex gap-4 pt-2">
              <ShimmerBlock className="h-12 w-44 rounded-xl" />
              <ShimmerBlock className="h-12 w-36 rounded-xl" />
            </div>
            <div className="flex gap-6 pt-4">
              <ShimmerLine className="h-4 w-28" />
              <ShimmerLine className="h-4 w-32" />
              <ShimmerLine className="h-4 w-28" />
            </div>
          </div>
          <div className="hidden lg:block">
            <ShimmerBlock className="aspect-[4/3] w-full rounded-2xl" />
          </div>
        </div>
      </div>

      {/* Stats section */}
      <div className="py-16 border-y border-border/30">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="text-center space-y-3">
              <ShimmerBlock className="w-14 h-14 rounded-2xl mx-auto" />
              <ShimmerLine className="h-8 w-20 mx-auto" />
              <ShimmerLine className="h-4 w-16 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* 4-card row */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 space-y-3">
            <ShimmerLine className="h-8 w-52 mx-auto" />
            <ShimmerLine className="h-4 w-72 mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <ShimmerBlock className="aspect-[4/3] w-full rounded-xl" />
                <ShimmerLine className="h-4 w-3/4" />
                <ShimmerLine className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category row */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 space-y-3">
            <ShimmerLine className="h-8 w-44 mx-auto" />
            <ShimmerLine className="h-4 w-64 mx-auto" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="space-y-2 text-center">
                <ShimmerBlock className="w-12 h-12 rounded-xl mx-auto" />
                <ShimmerLine className="h-3 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function BrowseSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-border/50 px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <ShimmerLine className="h-8 w-48" />
          <ShimmerLine className="h-4 w-72" />
          <div className="flex gap-3 pt-2">
            <ShimmerBlock className="h-10 flex-1 rounded-lg" />
            <ShimmerBlock className="h-10 w-24 rounded-lg" />
            <ShimmerBlock className="h-10 w-10 rounded-lg" />
          </div>
          {/* Filter row */}
          <div className="flex gap-2 pt-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <ShimmerBlock key={i} className="h-9 w-24 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* 3x4 Card grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <ShimmerBlock className="aspect-[4/3] w-full rounded-xl" />
              <div className="space-y-2 px-1">
                <ShimmerLine className="h-4 w-3/4" />
                <ShimmerLine className="h-3 w-1/2" />
                <div className="flex gap-3">
                  <ShimmerLine className="h-3 w-12" />
                  <ShimmerLine className="h-3 w-12" />
                  <ShimmerLine className="h-3 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Image block */}
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <ShimmerBlock className="aspect-video w-full rounded-2xl" />
      </div>

      {/* Title & description */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
        <ShimmerLine className="h-8 w-2/3" />
        <ShimmerLine className="h-4 w-1/3" />
        <div className="space-y-2">
          <ShimmerLine className="h-4 w-full" />
          <ShimmerLine className="h-4 w-full" />
          <ShimmerLine className="h-4 w-3/4" />
        </div>
      </div>

      {/* Action bar */}
      <div className="max-w-7xl mx-auto px-4 py-4 border-t border-border/30">
        <div className="flex gap-4">
          <ShimmerBlock className="h-12 w-48 rounded-xl" />
          <ShimmerBlock className="h-12 w-36 rounded-xl" />
          <ShimmerBlock className="h-12 w-12 rounded-xl" />
          <ShimmerBlock className="h-12 w-12 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <ShimmerLine className="h-8 w-48" />
            <ShimmerLine className="h-4 w-64" />
          </div>
          <ShimmerBlock className="h-10 w-32 rounded-lg" />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="p-6 border border-border/30 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <ShimmerLine className="h-4 w-20" />
                <ShimmerBlock className="w-8 h-8 rounded-lg" />
              </div>
              <ShimmerLine className="h-8 w-24" />
              <ShimmerLine className="h-3 w-16" />
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div className="p-6 border border-border/30 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <ShimmerLine className="h-5 w-32" />
            <ShimmerLine className="h-4 w-20" />
          </div>
          <ShimmerBlock className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

function GenericSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl w-full space-y-6">
        <ShimmerLine className="h-8 w-2/3 mx-auto" />
        <ShimmerLine className="h-4 w-full mx-auto" />
        <ShimmerLine className="h-4 w-3/4 mx-auto" />
        <div className="space-y-3 pt-4">
          <ShimmerBlock className="h-12 w-full rounded-xl" />
          <ShimmerBlock className="h-12 w-full rounded-xl" />
          <ShimmerBlock className="h-12 w-2/3 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export default function PageSkeleton({ variant }: PageSkeletonProps) {
  switch (variant) {
    case 'home':
      return <HomeSkeleton />
    case 'browse':
      return <BrowseSkeleton />
    case 'detail':
      return <DetailSkeleton />
    case 'dashboard':
      return <DashboardSkeleton />
    case 'generic':
      return <GenericSkeleton />
    default:
      return <GenericSkeleton />
  }
}
