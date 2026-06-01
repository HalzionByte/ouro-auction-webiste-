import { motion } from 'motion/react';

export function SkeletonCard({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="bg-card rounded-lg shadow-md overflow-hidden border-l-4 border-l-border"
    >
      {/* Image skeleton */}
      <div className="relative h-40 bg-secondary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.6s_infinite]" />
      </div>

      {/* Content skeleton */}
      <div className="p-3 space-y-3">
        {/* Title */}
        <div className="h-4 bg-secondary rounded-md w-3/4 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.6s_infinite]" />
        </div>

        <div className="space-y-2">
          {/* Bid row */}
          <div className="flex items-center justify-between">
            <div className="h-3 bg-secondary rounded w-1/4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.6s_infinite]" />
            </div>
            <div className="h-5 bg-secondary rounded w-1/4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.6s_infinite]" />
            </div>
          </div>

          {/* Timer + button row */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="h-4 bg-secondary rounded w-1/3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.6s_infinite]" />
            </div>
            <div className="h-7 bg-secondary rounded-lg w-20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.6s_infinite]" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
