import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Auction } from '../services/api';
import { CountdownTimer } from './CountdownTimer';

interface AuctionCardProps {
  auction: Auction;
  index?: number;
}

function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    Electronics: 'border-l-slate-400',
    Fashion: 'border-l-rose-400',
    Music: 'border-l-purple-500',
    Gaming: 'border-l-blue-500',
    Furniture: 'border-l-amber-500',
    Art: 'border-l-indigo-500',
    Sports: 'border-l-green-500',
  };
  return colorMap[category] || 'border-l-gray-400';
}

function getCategoryBadgeColor(category: string): string {
  const colorMap: Record<string, string> = {
    Electronics: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    Fashion: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200',
    Music: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
    Gaming: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
    Furniture: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
    Art: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200',
    Sports: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
  };
  return colorMap[category] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200';
}

export function AuctionCard({ auction, index = 0 }: AuctionCardProps) {
  const isEnded = auction.status === 'ended' || new Date(auction.endTime).getTime() <= Date.now();

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/auction/${auction.id}`}>
        <div className={`bg-card rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer border-l-4 ${getCategoryColor(auction.category)}`}>
          {/* Image */}
          <div className="relative h-40 overflow-hidden bg-secondary">
            <motion.img
              src={auction.imageUrl}
              alt={auction.title}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.4 }}
            />
            <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(auction.category)}`}>
              {auction.category}
            </div>
          </div>

          {/* Content */}
          <div className="p-3">
            <h3 className="font-semibold text-card-foreground mb-1.5 truncate text-sm">
              {auction.title}
            </h3>

            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">Current Bid:</span>
                <span className="text-lg font-semibold text-primary">
                  ${(auction.currentBid ?? 0).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1.5 border-t border-border">
                
                {/* ONLY ONE CLEAN FIXED COUNTDOWN */}
                <CountdownTimer
                  endTime={
                    auction.endTime
                    ? auction.endTime
                    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                  }
                />
                
                {isEnded ? (
                  <span className="text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded bg-destructive/10 text-destructive border border-destructive/20">
                    Ended
                  </span>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-accent text-accent-foreground px-3 py-1.5 rounded-lg hover:bg-accent/90 transition-colors text-sm"
                  >
                    Place Bid
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );


}
