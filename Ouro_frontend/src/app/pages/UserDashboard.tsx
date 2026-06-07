import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
// [ADDED BY ANTIGRAVITY] Imported fetchUserSelling helper function to query active listings from database
import { fetchUserBids, fetchWonAuctions, fetchUserSelling, fetchCurrentUser, fetchAuctionById, fetchWatchlist, User, Bid, Auction } from '../services/api';
import { CountdownTimer } from '../components/CountdownTimer';
// [ADDED BY ANTIGRAVITY] Imported ShoppingBag and Heart for listings representation
import { Trophy, TrendingUp, AlertCircle, ShoppingBag, Heart } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.1, ease: 'easeOut' },
  }),
};

export function UserDashboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userBids, setUserBids] = useState<Bid[]>([]);
  const [activeBids, setActiveBids] = useState<Array<{ auction: Auction; bid: Bid; isWinning: boolean }>>([]);
  const [wonAuctions, setWonAuctions] = useState<Auction[]>([]);
  // [ADDED BY ANTIGRAVITY] Local state for user listings and tab filtering
  const [sellingAuctions, setSellingAuctions] = useState<Auction[]>([]);
  const [watchlistAuctions, setWatchlistAuctions] = useState<Auction[]>([]);
  const [activeTab, setActiveTab] = useState<'bids' | 'won' | 'selling' | 'watchlist'>('bids');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const userData = await fetchCurrentUser();
      setCurrentUser(userData);

      // [ADDED BY ANTIGRAVITY] Concurrently fetch bids, won auctions, selling listings, and watchlist from database
      const [bidsData, wonData, sellingData, watchlistData] = await Promise.all([
        fetchUserBids(userData.id),
        fetchWonAuctions(userData.id),
        fetchUserSelling(userData.id),
        fetchWatchlist(userData.id),
      ]);

      setUserBids(bidsData);
      setWonAuctions(wonData);
      setSellingAuctions(sellingData);
      setWatchlistAuctions(watchlistData);

      const auctionIds = [...new Set(bidsData.map((bid) => bid.auctionId))];

      const activeBidsData = await Promise.all(
        auctionIds.map(async (auctionId) => {
          const auction = await fetchAuctionById(auctionId);
          if (!auction) return null;

          // Exclude ended or expired auctions from the Active Bids list
          const isExpired = auction.status === 'ended' || new Date(auction.endTime).getTime() <= Date.now();
          if (isExpired) return null;

          const userBid = bidsData.find((bid) => bid.auctionId === auctionId);
          if (!userBid) return null;

          const isWinning = auction.currentBid === userBid.amount;
          return { auction, bid: userBid, isWinning };
        })
      );

      setActiveBids(activeBidsData.filter(Boolean) as any);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">My Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {currentUser?.username}!</p>
      </motion.div>

      {/* Stats Cards */}
      {/* [ADDED BY ANTIGRAVITY] Updated stats cards layout to support 5 columns for bids, wins, selling listings, and watchlist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {[
          {
            label: 'Active Bids',
            value: activeBids.length,
            icon: <TrendingUp className="w-10 h-10 text-primary opacity-20" />,
            color: 'text-primary',
          },
          {
            label: 'Winning',
            value: activeBids.filter((b) => b.isWinning).length,
            icon: <Trophy className="w-10 h-10 text-accent opacity-20" />,
            color: 'text-accent',
          },
          {
            label: 'Auctions Won',
            value: wonAuctions.length,
            icon: <Trophy className="w-10 h-10 text-primary opacity-20" />,
            color: 'text-primary',
          },
          // [ADDED BY ANTIGRAVITY] Listings created stat card
          {
            label: 'Your Listings',
            value: sellingAuctions.length,
            icon: <ShoppingBag className="w-10 h-10 text-accent opacity-20" />,
            color: 'text-accent',
          },
          {
            label: 'Watchlist',
            value: watchlistAuctions.length,
            icon: <Heart className="w-10 h-10 text-rose-500 opacity-20" />,
            color: 'text-rose-500',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="bg-secondary rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <motion.p
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 18, delay: i * 0.1 + 0.25 }}
                  className={`text-3xl font-bold ${stat.color}`}
                >
                  {stat.value}
                </motion.p>
              </div>
              {stat.icon}
            </div>
          </motion.div>
        ))}
      </div>

      {/* [ADDED BY ANTIGRAVITY] Interactive Tabbed Interface for User's Dashboard Actions */}
      <div className="bg-card rounded-xl shadow-md border border-border overflow-hidden mb-8">
        <div className="flex border-b border-border bg-secondary/20">
          <button
            onClick={() => setActiveTab('bids')}
            className={`flex-1 py-4 px-6 font-semibold transition-all relative cursor-pointer ${
              activeTab === 'bids' ? 'text-primary bg-secondary/50' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Active Bids ({activeBids.length})
            {activeTab === 'bids' && (
              <motion.div
                layoutId="dashboard-tab-line"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('won')}
            className={`flex-1 py-4 px-6 font-semibold transition-all relative cursor-pointer ${
              activeTab === 'won' ? 'text-primary bg-secondary/50' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Won Auctions ({wonAuctions.length})
            {activeTab === 'won' && (
              <motion.div
                layoutId="dashboard-tab-line"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('selling')}
            className={`flex-1 py-4 px-6 font-semibold transition-all relative cursor-pointer ${
              activeTab === 'selling' ? 'text-primary bg-secondary/50' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Your Listings ({sellingAuctions.length})
            {activeTab === 'selling' && (
              <motion.div
                layoutId="dashboard-tab-line"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('watchlist')}
            className={`flex-1 py-4 px-6 font-semibold transition-all relative cursor-pointer ${
              activeTab === 'watchlist' ? 'text-primary bg-secondary/50' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Watchlist ({watchlistAuctions.length})
            {activeTab === 'watchlist' && (
              <motion.div
                layoutId="dashboard-tab-line"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Active Bids Tab */}
            {activeTab === 'bids' && (
              <motion.div
                key="bids-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {activeBids.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground mb-4">You haven't placed any bids yet.</p>
                    <Link to="/" className="text-primary hover:underline font-semibold">
                      Browse Active Auctions
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeBids.map(({ auction, bid, isWinning }, index) => (
                      <motion.div
                        key={auction.id}
                        initial={{ opacity: 0, x: -24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
                        whileHover={{ x: 4 }}
                      >
                        <Link
                          to={`/auction/${auction.id}`}
                          className="block bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                            <div className="flex items-start space-x-4 flex-1">
                              <img
                                src={auction.imageUrl}
                                alt={auction.title}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <h3 className="font-semibold text-foreground mb-1">{auction.title}</h3>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <span>Your bid: ${bid.amount.toLocaleString()}</span>
                                  <span>Current: ${auction.currentBid.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4">
                              {isWinning ? (
                                <div className="flex items-center space-x-2 bg-accent/10 text-accent px-4 py-2 rounded-lg">
                                  <Trophy className="w-4 h-4" />
                                  <span className="font-medium">Winning</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2 bg-destructive/10 text-destructive px-4 py-2 rounded-lg">
                                  <AlertCircle className="w-4 h-4" />
                                  <span className="font-medium">Outbid</span>
                                </div>
                              )}
                            </div>

                            <div className="md:text-right">
                              <div className="text-sm text-muted-foreground mb-1">Time Remaining</div>
                              <CountdownTimer endTime={auction.endTime} showIcon={false} />
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Won Auctions Tab */}
            {activeTab === 'won' && (
              <motion.div
                key="won-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {wonAuctions.length === 0 ? (
                  <div className="text-center py-10">
                    <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No auctions won yet. Keep bidding!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wonAuctions.map((auction, index) => (
                      <motion.div
                        key={auction.id}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
                        whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
                        className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                      >
                        <img
                          src={auction.imageUrl}
                          alt={auction.title}
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground mb-2 truncate">{auction.title}</h3>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-sm text-muted-foreground">Winning Bid:</span>
                              <span className="font-semibold text-primary">
                                ${auction.currentBid.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-center space-x-2 bg-accent/10 text-accent px-3 py-2 rounded-lg">
                            <Trophy className="w-4 h-4" />
                            <span className="text-sm font-medium">Won</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Selling / Your Listings Tab */}
            {activeTab === 'selling' && (
              <motion.div
                key="selling-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {sellingAuctions.length === 0 ? (
                  <div className="text-center py-10">
                    <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-55" />
                    <p className="text-muted-foreground">You haven't listed any auctions for sale yet.</p>
                    <Link to="/create-auction" className="text-primary hover:underline mt-2 inline-block font-semibold">
                      Create Your First Listing
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sellingAuctions.map((auction, index) => (
                      <motion.div
                        key={auction.id}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
                        whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
                        className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                      >
                        <img
                          src={auction.imageUrl || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600"}
                          alt={auction.title}
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <h3 className="font-semibold text-foreground mb-1.5 truncate">{auction.title}</h3>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
                              {auction.status || 'Active'}
                            </span>
                          </div>
                          <div className="border-t border-border pt-3 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Current Bid:</span>
                            <span className="font-semibold text-primary">
                              ${auction.currentBid.toLocaleString()}
                            </span>
                          </div>
                          <Link
                            to={`/auction/${auction.id}`}
                            className="bg-secondary text-secondary-foreground text-center py-2.5 rounded-lg font-medium hover:bg-secondary/80 transition-colors text-sm w-full block shadow-sm border border-border"
                          >
                            View Listing Details
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Watchlist Tab */}
            {activeTab === 'watchlist' && (
              <motion.div
                key="watchlist-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {watchlistAuctions.length === 0 ? (
                  <div className="text-center py-10">
                    <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-55 animate-pulse text-rose-500" />
                    <p className="text-muted-foreground">Your watchlist is empty.</p>
                    <Link to="/" className="text-primary hover:underline mt-2 inline-block font-semibold">
                      Browse Active Auctions
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {watchlistAuctions.map((auction, index) => (
                      <motion.div
                        key={auction.id}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
                        whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
                        className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                      >
                        <img
                          src={auction.imageUrl || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600"}
                          alt={auction.title}
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <h3 className="font-semibold text-foreground mb-1.5 truncate">{auction.title}</h3>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
                              {auction.status || 'Active'}
                            </span>
                          </div>
                          <div className="border-t border-border pt-3 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Current Bid:</span>
                            <span className="font-semibold text-primary">
                              ${auction.currentBid.toLocaleString()}
                            </span>
                          </div>
                          <Link
                            to={`/auction/${auction.id}`}
                            className="bg-secondary text-secondary-foreground text-center py-2.5 rounded-lg font-medium hover:bg-secondary/80 transition-colors text-sm w-full block shadow-sm border border-border"
                          >
                            View Listing Details
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
