import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { fetchAuctionById, fetchBidHistory, placeBid, fetchCurrentUser, approveAuction, deleteAuction, reportBid, reportAuction, closeAuction, cancelAuction, fetchWatchlist, addToWatchlist, removeFromWatchlist, Auction, Bid, User } from '../services/api';
import { CountdownTimer } from '../components/CountdownTimer';
import { BidHistory } from '../components/BidHistory';
import { ArrowLeft, AlertCircle, CheckCircle, Clock, Flag } from 'lucide-react';

export function AuctionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'description' | 'bidHistory'>('description');
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  // [ADDED BY ANTIGRAVITY] Local state to dynamically track if bidding is closed for this auction
  const [isEnded, setIsEnded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isWatchlisted, setIsWatchlisted] = useState(false);


  useEffect(() => {
    if (id) {
      loadAuctionData();
    }
  }, [id]);

  const loadAuctionData = async () => {
    if (!id) return;

    try {
      const [auctionData, bidsData, userData] = await Promise.all([
        fetchAuctionById(id),
        fetchBidHistory(id),
        fetchCurrentUser(),
      ]);

      setAuction(auctionData);
      setBids(bidsData);
      setCurrentUser(userData);

      if (userData && userData.id && userData.id !== 'guest') {
        const watchlistData = await fetchWatchlist(userData.id);
        const inWatchlist = watchlistData.some((a) => String(a.id) === String(id));
        setIsWatchlisted(inWatchlist);
      }

      if (auctionData) {
        // [ADDED BY ANTIGRAVITY] Initialize isEnded based on database status and endTime past check
        const expired = auctionData.status === 'ended' || new Date(auctionData.endTime).getTime() <= Date.now();
        setIsEnded(expired);
        const suggestedBid = auctionData.currentBid + 10;
        setBidAmount(suggestedBid.toString());
      }
    } catch (error) {
      console.error('Failed to load auction data:', error);
    }
  };

  const handlePlaceBid = async () => {

    const loggedIn = localStorage.getItem("loggedIn");

    if (!loggedIn) {
      setNotification({
        type: 'error',
        message: 'Please login first to place a bid',
      });
      return;
    }

    if (!id || !auction) return;

    // [ADDED BY ANTIGRAVITY] Defensive Check: Block placing a bid if the auction has expired
    if (isEnded) {
      setNotification({
        type: 'error',
        message: 'This auction has ended. Bidding is closed.',
      });
      return;
    }

    const amount = Number(bidAmount);

    if (isNaN(amount) || amount <= auction.currentBid) {
      setNotification({
        type: 'error',
        message: `Bid must be higher than current bid of $${auction.currentBid}`,
      });
      return;
    }




    setLoading(true);
    try {
      const response = await placeBid(id, amount);

      if (response.success) {
        setNotification({
          type: response.timeExtended ? 'info' : 'success',
          message: response.message,
        });

        await loadAuctionData();

        const newSuggestedBid = amount + 10;
        setBidAmount(newSuggestedBid.toString());
      } else {
        setNotification({
          type: 'error',
          message: response.message,
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to place bid. Please try again.',
      });
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  if (!auction) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center py-20"
        >
          <p className="text-muted-foreground">Auction not found.</p>
          <Link to="/" className="text-primary hover:underline mt-4 inline-block">
            Return to Homepage
          </Link>
        </motion.div>
      </div>
    );
  }

  // Prevent normal users from accessing pending auctions
  if (auction.status === 'pending' && currentUser?.role !== 'ADMIN') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center py-20 bg-destructive/5 border border-destructive/10 rounded-2xl p-8"
        >
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-foreground text-lg font-semibold">Access Denied</p>
          <p className="text-muted-foreground text-sm mt-1">This auction listing is currently pending administrative review.</p>
          <Link to="/" className="text-primary hover:underline mt-6 inline-block font-medium">
            Return to Homepage
          </Link>
        </motion.div>
      </div>
    );
  }

  const handleApproveAuction = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await approveAuction(id);
      if (res.success) {
        setNotification({
          type: 'success',
          message: res.message || 'Auction approved successfully!',
        });
        await loadAuctionData();
      } else {
        setNotification({
          type: 'error',
          message: res.message || 'Failed to approve auction',
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to approve auction. Please try again.',
      });
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleRemoveAuction = async () => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to reject and delete this pending auction?")) {
      return;
    }
    setLoading(true);
    try {
      const res = await deleteAuction(id);
      if (res.success) {
        setNotification({
          type: 'success',
          message: res.message || 'Auction removed successfully!',
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } else {
        setNotification({
          type: 'error',
          message: res.message || 'Failed to delete auction',
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to delete auction. Please try again.',
      });
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleEndAuction = async () => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to end this auction early? This action cannot be undone and will finalize the highest bidder as the winner.")) {
      return;
    }
    setLoading(true);
    try {
      const res = await closeAuction(id);
      if (res.success) {
        setNotification({
          type: 'success',
          message: res.message || 'Auction ended successfully!',
        });
        await loadAuctionData();
      } else {
        setNotification({
          type: 'error',
          message: res.message || 'Failed to end auction',
        });
      }
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.message || 'Failed to end auction. Please try again.',
      });
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleCancelAuction = async () => {
    if (!id) return;
    if (!window.confirm(
      "Are you sure you want to CANCEL this auction?\n\n" +
      "• The auction will be marked as cancelled.\n" +
      "• ALL bidders will receive a full refund immediately.\n\n" +
      "This action cannot be undone."
    )) {
      return;
    }
    setLoading(true);
    try {
      const res = await cancelAuction(id);
      if (res.success) {
        setNotification({
          type: 'success',
          message: res.message || 'Auction cancelled and all bids refunded.',
        });
        await loadAuctionData();
      } else {
        setNotification({
          type: 'error',
          message: res.message || 'Failed to cancel auction.',
        });
      }
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.message || 'Failed to cancel auction. Please try again.',
      });
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleReportBid = async (bidId: string) => {
    if (!currentUser || !currentUser.email) {
      setNotification({
        type: 'error',
        message: 'Please login first to report a bid.',
      });
      return;
    }

    try {
      const response = await reportBid(bidId, currentUser.email);
      if (response.success) {
        setNotification({
          type: 'success',
          message: response.message || 'Bid reported successfully.',
        });
        await loadAuctionData();
      } else {
        setNotification({
          type: 'error',
          message: response.message || 'Failed to report bid.',
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to report bid. Please try again.',
      });
    } finally {
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleReportAuction = async () => {
    if (!currentUser || !currentUser.email) {
      setNotification({
        type: 'error',
        message: 'Please login first to report this auction.',
      });
      return;
    }

    if (!id) return;

    if (!window.confirm("Are you sure you want to report this auction for violations?")) {
      return;
    }

    try {
      const response = await reportAuction(id, currentUser.email);
      if (response.success) {
        setNotification({
          type: 'success',
          message: response.message || 'Auction reported successfully.',
        });
        await loadAuctionData();
      } else {
        setNotification({
          type: 'error',
          message: response.message || 'Failed to report auction.',
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to report auction. Please try again.',
      });
    } finally {
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleToggleWatchlist = async () => {
    if (!currentUser || !currentUser.email || currentUser.id === 'guest') {
      setNotification({
        type: 'error',
        message: 'Please login first to manage your watchlist.',
      });
      return;
    }

    if (!id) return;

    setLoading(true);
    try {
      if (isWatchlisted) {
        const res = await removeFromWatchlist(currentUser.id, id);
        if (res.success) {
          setIsWatchlisted(false);
          setNotification({
            type: 'success',
            message: 'Removed from watchlist successfully.',
          });
        } else {
          setNotification({
            type: 'error',
            message: res.message || 'Failed to remove from watchlist.',
          });
        }
      } else {
        const res = await addToWatchlist(currentUser.id, id);
        if (res.success) {
          setIsWatchlisted(true);
          setNotification({
            type: 'success',
            message: 'Added to watchlist successfully.',
          });
        } else {
          setNotification({
            type: 'error',
            message: res.message || 'Failed to add to watchlist.',
          });
        }
      }
      await loadAuctionData();
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.message || 'Failed to update watchlist.',
      });
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const isOwner = currentUser && (
    (currentUser.id && auction.sellerId && currentUser.id === auction.sellerId) ||
    (currentUser.email && auction.sellerName && currentUser.email.toLowerCase() === auction.sellerName.toLowerCase())
  );

  const isHighestBidder = bids.length > 0 && bids[0].userId === currentUser?.id;
  const hasBeenOutbid = bids.some((bid) => bid.userId === currentUser?.id) && !isHighestBidder;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Link to="/" className="inline-flex items-center space-x-2 text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Auctions</span>
        </Link>
      </motion.div>

      {/* Notification — slides in from the right */}
      <div className="fixed top-20 right-4 z-50 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {notification && (
            <motion.div
              key="notification"
              initial={{ opacity: 0, x: 120, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 120, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className={`pointer-events-auto p-4 rounded-lg flex items-start space-x-3 shadow-xl border ${notification.type === 'success'
                  ? 'bg-accent/10 text-accent border-accent/20 dark:bg-accent/20'
                  : notification.type === 'error'
                    ? 'bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20'
                    : 'bg-warning/10 text-warning border-warning/20 dark:bg-warning/20'
                }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : notification.type === 'info' ? (
                <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <p>{notification.message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bidding Status Alerts */}
      <AnimatePresence>
        {isHighestBidder && (
          <motion.div
            key="highest-bidder"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="mb-6 p-4 rounded-lg bg-accent/10 text-accent border border-accent/20 flex items-start space-x-3"
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="font-medium">You are currently the highest bidder!</p>
          </motion.div>
        )}

        {hasBeenOutbid && (
          <motion.div
            key="outbid"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 flex items-start space-x-3"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="font-medium">You have been outbid!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left: Image & Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-4"
        >
          <div className="bg-secondary rounded-xl overflow-hidden shadow-lg aspect-[4/3] flex items-center justify-center">
            <img 
              src={auction.images && auction.images[activeImageIndex] ? auction.images[activeImageIndex] : auction.imageUrl} 
              alt={auction.title} 
              className="w-full h-full object-cover" 
            />
          </div>
          
          {auction.images && auction.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2">
              {auction.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                    activeImageIndex === idx ? 'border-primary scale-95 shadow-md' : 'border-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${auction.title} thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right: Bidding Info */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="space-y-6"
        >
          <div>
            <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-muted-foreground mb-1">{auction.category}</div>
              <h1 className="text-3xl font-bold text-foreground mb-4">{auction.title}</h1>
            </div>
            {/* Action buttons (Watchlist and Report) */}
            <div className="flex gap-2 items-center">
              {currentUser && currentUser.id !== 'guest' && (
                <button
                  id="toggle-watchlist"
                  onClick={handleToggleWatchlist}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    isWatchlisted
                      ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 hover:bg-rose-500/20'
                      : 'bg-secondary text-muted-foreground border-border hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/25'
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={isWatchlisted ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-3.5 h-3.5"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span>{isWatchlisted ? 'Watchlisted' : 'Watchlist'}</span>
                </button>
              )}

              {/* Show report button to anyone EXCEPT the seller of this auction */}
              {currentUser && currentUser.id !== auction.sellerId && (
                <button
                  onClick={handleReportAuction}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    auction.reported
                      ? 'bg-destructive/10 text-destructive border-destructive/20 cursor-not-allowed'
                      : 'bg-secondary text-muted-foreground border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/25'
                  }`}
                  disabled={auction.reported}
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{auction.reported ? 'Reported' : 'Report Listing'}</span>
                </button>
              )}
            </div>
          </div>

            <div className="bg-secondary rounded-xl p-6 space-y-4">
              {/* Current Bid — animates when value changes */}
              <div>
                <div className="text-sm text-muted-foreground mb-1">Current Highest Bid</div>
                <motion.div
                  key={auction.currentBid}
                  initial={{ scale: 1.18, color: '#10B981' }}
                  animate={{ scale: 1, color: 'var(--color-primary)' }}
                  transition={{ type: 'spring', stiffness: 320, damping: 20, duration: 0.5 }}
                  className="text-4xl font-bold text-primary"
                >
                  ${auction.currentBid.toLocaleString()}
                </motion.div>
              </div>

              {/* Countdown */}
              <div className="pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground mb-1">Time Remaining</div>
                <div className="text-2xl">
                  {/* [ADDED BY ANTIGRAVITY] Wire onExpire callback to set isEnded state dynamically when clock ticks to 0 */}
                  <CountdownTimer endTime={auction.endTime} showIcon={false} onExpire={() => setIsEnded(true)} />
                </div>
              </div>

              {/* Bid Input */}
              <div className="pt-4 border-t border-border">
                {auction.status === 'pending' ? (
                  currentUser?.role === 'ADMIN' ? (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center shadow-inner flex flex-col items-center justify-center gap-3">
                      <AlertCircle className="w-6 h-6 text-amber-500" />
                      <p className="font-semibold text-amber-500 text-sm">Pending Administrative Review</p>
                      <p className="text-xs text-muted-foreground mb-1">Please inspect this listing details and choose an action:</p>
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={handleApproveAuction}
                          disabled={loading}
                          className="flex-1 bg-accent text-accent-foreground py-2.5 rounded-lg font-medium hover:bg-accent/90 transition-colors shadow-sm text-sm cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={handleRemoveAuction}
                          disabled={loading}
                          className="flex-1 bg-destructive text-destructive-foreground py-2.5 rounded-lg font-medium hover:bg-destructive/90 transition-colors shadow-sm text-sm cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-destructive/15 border border-destructive/20 rounded-xl text-center shadow-inner flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-6 h-6 text-destructive" />
                      <p className="font-semibold text-destructive text-sm">Access Denied</p>
                      <p className="text-xs text-muted-foreground">This auction is not yet active.</p>
                    </div>
                  )
                ) : isEnded ? (
                  <div className="p-4 bg-destructive/15 border border-destructive/20 rounded-xl text-center shadow-inner flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-6 h-6 text-destructive animate-pulse" />
                    <p className="font-semibold text-destructive text-sm">Bidding is Closed</p>
                    <p className="text-xs text-muted-foreground">This auction's duration has ended and no further bids are accepted.</p>
                  </div>
                ) : isOwner ? (
                  <div className="p-4 bg-secondary/35 border border-border rounded-xl text-center shadow-inner flex flex-col items-center justify-center gap-3">
                    <Clock className="w-6 h-6 text-primary animate-pulse" />
                    <p className="font-semibold text-foreground text-sm">You are the seller of this auction</p>
                    <p className="text-xs text-muted-foreground mb-1">As the seller, you cannot bid on this item. Choose an action below:</p>
                    <div className="flex flex-col gap-2 w-full">
                      <button
                        id={`end-auction-${id}`}
                        onClick={handleEndAuction}
                        disabled={loading}
                        className="w-full bg-accent text-accent-foreground py-2.5 rounded-lg font-medium hover:bg-accent/90 transition-colors shadow-sm text-sm cursor-pointer"
                      >
                        {loading ? 'Processing...' : '⏱ End Auction Early'}
                      </button>
                      <button
                        id={`cancel-auction-${id}`}
                        onClick={handleCancelAuction}
                        disabled={loading}
                        className="w-full bg-destructive/10 text-destructive border border-destructive/30 py-2.5 rounded-lg font-medium hover:bg-destructive/20 transition-colors shadow-sm text-sm cursor-pointer"
                      >
                        {loading ? 'Processing...' : '✕ Cancel Auction & Refund All'}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      <strong>End Early</strong> finalizes the highest bidder as winner.<br/>
                      <strong>Cancel</strong> refunds every bidder in full.
                    </p>
                  </div>
                ) : currentUser?.role === 'ADMIN' ? (
                  <div className="p-4 bg-destructive/15 border border-destructive/20 rounded-xl text-center shadow-inner flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-6 h-6 text-destructive" />
                    <p className="font-semibold text-destructive text-sm">Bidding Restricted</p>
                    <p className="text-xs text-muted-foreground">Administrators are not permitted to place bids on auctions.</p>
                  </div>
                ) : localStorage.getItem("loggedIn") !== "true" ? (
                  <div className="text-center py-4 space-y-3">
                    <p className="text-sm text-muted-foreground">You must be logged in to bid on this auction.</p>
                    <Link
                      to="/login"
                      className="inline-block bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/95 transition-all shadow-md w-full text-center"
                    >
                      Login to Place Bid
                    </Link>
                  </div>
                ) : (
                  <>
                    <label className="block text-sm text-muted-foreground mb-2">Your Bid</label>

                    {/* Quick increment buttons */}
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {[10, 50, 100, 500].map((inc) => (
                        <motion.button
                          key={inc}
                          whileHover={{ scale: 1.06 }}
                          whileTap={{ scale: 0.94 }}
                          onClick={() => setBidAmount((prev) => String((Number(prev) || auction.currentBid) + inc))}
                          className="px-3 py-1.5 rounded-md text-xs font-medium bg-secondary text-foreground border border-border hover:border-primary hover:text-primary transition-colors"
                        >
                          +${inc}
                        </motion.button>
                      ))}
                      <motion.button
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => setBidAmount(String(auction.currentBid + 10))}
                        className="px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-colors ml-auto"
                        title="Reset to minimum"
                      >
                        Reset
                      </motion.button>
                    </div>

                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <input
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="w-full pl-8 pr-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder={`Minimum: $${auction.currentBid + 1}`}
                        />
                      </div>
                      <motion.button
                        onClick={handlePlaceBid}
                        disabled={loading || Number(bidAmount) <= auction.currentBid}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        className="bg-accent text-accent-foreground px-6 py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Placing...' : 'Place Bid'}
                      </motion.button>
                    </div>
                    {Number(bidAmount) <= auction.currentBid && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-destructive mt-2"
                      >
                        Bid must be higher than ${auction.currentBid}
                      </motion.p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Seller Info */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-secondary rounded-xl p-4"
          >
            <div className="text-sm text-muted-foreground">Seller</div>
            <div className="font-medium">{auction.sellerName}</div>
          </motion.div>
        </motion.div>
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.25, ease: 'easeOut' }}
        className="bg-card rounded-xl shadow-md overflow-hidden"
      >
        <div className="border-b border-border">
          <div className="flex">
            <button
              onClick={() => setActiveTab('description')}
              className={`flex-1 px-6 py-4 font-medium transition-colors relative ${activeTab === 'description'
                  ? 'text-primary bg-secondary/50'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Description
              {activeTab === 'description' && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('bidHistory')}
              className={`flex-1 px-6 py-4 font-medium transition-colors relative ${activeTab === 'bidHistory'
                  ? 'text-primary bg-secondary/50'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Bid History ({bids.length})
              {activeTab === 'bidHistory' && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="p-6"
          >
            {activeTab === 'description' ? (
              <p className="text-foreground leading-relaxed">{auction.description}</p>
            ) : (
              <BidHistory bids={bids} currentUserId={currentUser?.id} auctionSellerId={auction.sellerId} onReport={handleReportBid} />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}