import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Auction, reportAuction, fetchWatchlist, addToWatchlist, removeFromWatchlist, fetchCurrentUser } from '../services/api';
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
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadWatchlistState() {
      const email = localStorage.getItem('email');
      if (!email) return;
      try {
        const userData = await fetchCurrentUser();
        if (userData && userData.id && userData.id !== 'guest') {
          setUserId(userData.id);
          const watchlistData = await fetchWatchlist(userData.id);
          const inWatchlist = watchlistData.some((a) => String(a.id) === String(auction.id));
          setIsWatchlisted(inWatchlist);
        }
      } catch (error) {
        console.error('Failed to load watchlist status in AuctionCard:', error);
      }
    }
    loadWatchlistState();
  }, [auction.id]);

  const handleWatchlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // stop navigation to detail page
    e.stopPropagation();

    if (!userId) {
      alert('Please log in first to manage your watchlist.');
      return;
    }

    try {
      if (isWatchlisted) {
        const res = await removeFromWatchlist(userId, auction.id);
        if (res.success) {
          setIsWatchlisted(false);
        }
      } else {
        const res = await addToWatchlist(userId, auction.id);
        if (res.success) {
          setIsWatchlisted(true);
        }
      }
    } catch (error) {
      console.error('Failed to toggle watchlist in card:', error);
    }
  };

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
            {/* Heart/Watchlist Button Overlay */}
            {localStorage.getItem('loggedIn') === 'true' && (
              <button
                onClick={handleWatchlistToggle}
                className={`absolute top-2 left-2 p-1.5 rounded-full backdrop-blur-md border shadow-md transition-all duration-200 z-10 cursor-pointer ${
                  isWatchlisted
                    ? 'bg-rose-500/25 border-rose-500/40 text-rose-500 hover:bg-rose-500/35 hover:scale-110'
                    : 'bg-black/30 border-white/10 text-white/70 hover:bg-black/50 hover:text-white hover:scale-110'
                }`}
                title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={isWatchlisted ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>
            )}

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
                {/* Countdown timer */}
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

              {/* ── Report Button ── */}
              <ReportButton auctionId={auction.id} alreadyReported={!!auction.reported} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Standalone Report Button (stops link propagation) ────────────────────────
function ReportButton({ auctionId, alreadyReported }: { auctionId: string; alreadyReported: boolean }) {
  const [reported, setReported] = useState(alreadyReported);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleReport(e: React.MouseEvent) {
    e.preventDefault();   // stop the Link navigation
    e.stopPropagation();

    if (reported) return;

    const email = localStorage.getItem('email');
    if (!email) {
      setFeedback('Please log in to report an auction.');
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    setLoading(true);
    try {
      const result = await reportAuction(auctionId, email);
      if (result.success) {
        setReported(true);
        setFeedback('Reported — admin notified.');
      } else {
        setFeedback(result.message || 'Could not report auction.');
      }
    } catch {
      setFeedback('Failed to report. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback(null), 3500);
    }
  }

  return (
    <div className="pt-1">
      {feedback && (
        <p className="text-xs text-center mb-1 text-muted-foreground animate-pulse">{feedback}</p>
      )}
      <motion.button
        id={`report-auction-${auctionId}`}
        onClick={handleReport}
        disabled={reported || loading}
        whileHover={!reported ? { scale: 1.03 } : {}}
        whileTap={!reported ? { scale: 0.97 } : {}}
        className={`w-full flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-md border transition-all duration-200 font-medium
          ${reported
            ? 'border-orange-300 bg-orange-50 text-orange-400 dark:bg-orange-950/30 dark:border-orange-700 dark:text-orange-500 cursor-default'
            : 'border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 dark:border-red-700 dark:text-red-400 cursor-pointer'
          }`}
      >
        {/* Flag icon (inline SVG, no extra package needed) */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18M3 5l9 4-9 4" />
        </svg>
        {loading ? 'Reporting…' : reported ? 'Reported' : 'Report Auction'}
      </motion.button>
    </div>
  );
}
