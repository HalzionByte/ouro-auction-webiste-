import { motion, AnimatePresence } from 'motion/react';
import { Bid } from '../services/api';
import { TrendingUp } from 'lucide-react';

interface BidHistoryProps {
  bids: Bid[];
  currentUserId?: string;
}

export function BidHistory({ bids, currentUserId }: BidHistoryProps) {
  if (bids.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8 text-muted-foreground"
      >
        <p>No bids yet. Be the first to bid!</p>
      </motion.div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm text-muted-foreground">Bidder</th>
            <th className="text-left py-3 px-4 text-sm text-muted-foreground">Amount</th>
            <th className="text-left py-3 px-4 text-sm text-muted-foreground">Time</th>
            <th className="text-left py-3 px-4 text-sm text-muted-foreground">Status</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {bids.map((bid, index) => {
              const isHighest = index === 0;
              const isCurrentUser = bid.userId === currentUserId;
              const timeAgo = getTimeAgo(bid.timestamp);

              return (
                <motion.tr
                  key={bid.id}
                  initial={{ opacity: 0, x: -24, backgroundColor: 'rgba(16,185,129,0.15)' }}
                  animate={{ opacity: 1, x: 0, backgroundColor: 'rgba(16,185,129,0)' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.38, delay: index * 0.04, ease: 'easeOut' }}
                  className={`border-b border-border ${
                    isCurrentUser ? 'bg-accent/10' : ''
                  } ${isHighest ? 'font-semibold' : ''}`}
                >
                  <td className="py-3 px-4">
                    {bid.username}
                    {isCurrentUser && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                        className="ml-2 text-xs bg-accent text-accent-foreground px-2 py-1 rounded"
                      >
                        You
                      </motion.span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-primary">
                    ${bid.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{timeAgo}</td>
                  <td className="py-3 px-4">
                    {isHighest && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="flex items-center space-x-1 text-accent"
                      >
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">Highest</span>
                      </motion.div>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}

function getTimeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = now - then;

  const minutes = Math.floor(diff / (60 * 1000));
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}
