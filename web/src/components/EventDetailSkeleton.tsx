'use client';

export default function EventDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      {/* Hero Skeleton */}
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-800 via-gray-900 to-black animate-pulse" />
        
        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            {/* Category Badge Skeleton */}
            <div className="w-32 h-8 bg-white/20 rounded-full mb-4 animate-pulse" />
            
            {/* Title Skeleton */}
            <div className="w-3/4 h-12 bg-white/20 rounded-lg mb-4 animate-pulse" />
            
            {/* Info Skeleton */}
            <div className="flex flex-wrap gap-4">
              <div className="w-40 h-6 bg-white/20 rounded animate-pulse" />
              <div className="w-48 h-6 bg-white/20 rounded animate-pulse" />
              <div className="w-36 h-6 bg-white/20 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Countdown Skeleton */}
            <div className="glassmorphism rounded-3xl p-8">
              <div className="w-48 h-8 bg-white/20 rounded mb-4 animate-pulse" />
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="text-center">
                    <div className="w-full h-16 bg-white/20 rounded-lg mb-2 animate-pulse" />
                    <div className="w-16 h-4 bg-white/20 rounded mx-auto animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* About Skeleton */}
            <div className="glassmorphism rounded-3xl p-8">
              <div className="w-40 h-8 bg-white/20 rounded mb-4 animate-pulse" />
              <div className="space-y-3">
                <div className="w-full h-4 bg-white/20 rounded animate-pulse" />
                <div className="w-full h-4 bg-white/20 rounded animate-pulse" />
                <div className="w-3/4 h-4 bg-white/20 rounded animate-pulse" />
              </div>
            </div>

            {/* Details Skeleton */}
            <div className="glassmorphism rounded-3xl p-8">
              <div className="w-48 h-8 bg-white/20 rounded mb-6 animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="w-24 h-4 bg-white/20 rounded animate-pulse" />
                      <div className="w-32 h-5 bg-white/20 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Ticket Skeleton */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="glassmorphism rounded-3xl p-8">
                <div className="w-40 h-8 bg-white/20 rounded mb-6 animate-pulse" />
                
                {/* Ticket Cards */}
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 bg-white/5 rounded-xl">
                      <div className="w-full h-6 bg-white/20 rounded mb-2 animate-pulse" />
                      <div className="w-24 h-8 bg-white/20 rounded mb-3 animate-pulse" />
                      <div className="flex items-center justify-between">
                        <div className="w-20 h-4 bg-white/20 rounded animate-pulse" />
                        <div className="flex gap-2">
                          <div className="w-8 h-8 bg-white/20 rounded animate-pulse" />
                          <div className="w-8 h-8 bg-white/20 rounded animate-pulse" />
                          <div className="w-8 h-8 bg-white/20 rounded animate-pulse" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Purchase Button Skeleton */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-6 bg-white/20 rounded animate-pulse" />
                    <div className="w-32 h-8 bg-white/20 rounded animate-pulse" />
                  </div>
                  <div className="w-full h-12 bg-white/20 rounded-xl animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
