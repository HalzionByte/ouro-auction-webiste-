import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { fetchAdminAuctions, closeAuction, approveAuction, fetchAuditLogs, fetchCurrentUser, fetchReportedBids, dismissBidReport, deleteBid, deleteAuction, dismissAuctionReport, fetchReportedAuctions, Auction, Bid, User } from '../services/api';
import { Shield, Trophy, TrendingUp, AlertTriangle, XCircle, CheckCircle, Clock, Eye, Flag } from 'lucide-react';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [reportedBids, setReportedBids] = useState<any[]>([]);
  const [reportedAuctions, setReportedAuctions] = useState<Auction[]>([]);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [auditLogs, setAuditLogs] = useState<Bid[]>([]);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Dashboard filtering tab
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'ended' | 'reported_bids' | 'reported_auctions'>('pending');

  useEffect(() => {
    checkPermissionAndLoadData();
  }, []);

  const checkPermissionAndLoadData = async () => {
    setLoading(true);
    try {
      const user = await fetchCurrentUser();
      setCurrentUser(user);
      if (user.role !== 'ADMIN') {
        // Access Denied
        setLoading(false);
        return;
      }
      
      const allAuctions = await fetchAdminAuctions();
      setAuctions(allAuctions);
      const repBids = await fetchReportedBids();
      setReportedBids(repBids);
      const repAuctions = await fetchReportedAuctions();
      setReportedAuctions(repAuctions);
    } catch (error) {
      console.error('Failed to load admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (auctionId: string) => {
    try {
      const res = await approveAuction(auctionId);
      if (res.success) {
        setActionMessage({ type: 'success', text: res.message || 'Auction approved successfully!' });
        
        // Refresh local listings state
        const updated = auctions.map((a) => {
          if (a.id === auctionId) {
            return { ...a, status: 'active' as const };
          }
          return a;
        });
        setAuctions(updated);
      } else {
        setActionMessage({ type: 'error', text: res.message || 'Failed to approve auction.' });
      }
    } catch (error) {
      setActionMessage({ type: 'error', text: 'Error executing admin approval.' });
    } finally {
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const handleForceClose = async (auctionId: string) => {
    if (!window.confirm('Are you sure you want to force-close this auction listing? This will immediately end all bidding.')) {
      return;
    }
    
    try {
      const res = await closeAuction(auctionId);
      if (res.success) {
        setActionMessage({ type: 'success', text: res.message || 'Auction closed successfully!' });
        
        // Refresh local listings state
        const updated = auctions.map((a) => {
          if (a.id === auctionId) {
            return { ...a, status: 'ended' as const };
          }
          return a;
        });
        setAuctions(updated);
      } else {
        setActionMessage({ type: 'error', text: res.message || 'Failed to close auction.' });
      }
    } catch (error) {
      setActionMessage({ type: 'error', text: 'Error executing admin force-close.' });
    } finally {
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const handleDismissReport = async (bidId: string) => {
    try {
      const res = await dismissBidReport(bidId);
      if (res.success) {
        setActionMessage({ type: 'success', text: res.message || 'Report dismissed successfully!' });
        setReportedBids(reportedBids.filter((b) => b.id !== bidId));
      } else {
        setActionMessage({ type: 'error', text: res.message || 'Failed to dismiss report.' });
      }
    } catch (error) {
      setActionMessage({ type: 'error', text: 'Error dismissing report.' });
    } finally {
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const handleDeleteBid = async (bidId: string) => {
    if (!window.confirm('Are you sure you want to void this bid? This will delete the bid record, refund the bidder, and automatically adjust the auction highest bid.')) {
      return;
    }
    
    try {
      const res = await deleteBid(bidId);
      if (res.success) {
        setActionMessage({ type: 'success', text: res.message || 'Bid deleted and bidder refunded successfully!' });
        setReportedBids(reportedBids.filter((b) => b.id !== bidId));
        const allAuctions = await fetchAdminAuctions();
        setAuctions(allAuctions);
      } else {
        setActionMessage({ type: 'error', text: res.message || 'Failed to delete bid.' });
      }
    } catch (error) {
      setActionMessage({ type: 'error', text: 'Error deleting bid.' });
    } finally {
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const handleDismissAuctionReport = async (auctionId: string) => {
    try {
      const res = await dismissAuctionReport(auctionId);
      if (res.success) {
        setActionMessage({ type: 'success', text: res.message || 'Auction report dismissed successfully!' });
        setReportedAuctions(reportedAuctions.filter((a) => a.id !== auctionId));
        const updated = auctions.map((a) => a.id === auctionId ? { ...a, reported: false } : a);
        setAuctions(updated);
      } else {
        setActionMessage({ type: 'error', text: res.message || 'Failed to dismiss auction report.' });
      }
    } catch (error) {
      setActionMessage({ type: 'error', text: 'Error dismissing auction report.' });
    } finally {
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const handleDeleteAuction = async (auctionId: string) => {
    if (!window.confirm('Are you sure you want to delete this auction? This will permanently delete the auction and all its bid history.')) {
      return;
    }
    
    try {
      const res = await deleteAuction(auctionId);
      if (res.success) {
        setActionMessage({ type: 'success', text: res.message || 'Auction deleted successfully!' });
        setReportedAuctions(reportedAuctions.filter((a) => a.id !== auctionId));
        setAuctions(auctions.filter((a) => a.id !== auctionId));
      } else {
        setActionMessage({ type: 'error', text: res.message || 'Failed to delete auction.' });
      }
    } catch (error) {
      setActionMessage({ type: 'error', text: 'Error deleting auction.' });
    } finally {
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const handleOpenAuditLogs = async (auction: Auction) => {
    setSelectedAuction(auction);
    setShowAuditModal(true);
    setLogsLoading(true);
    try {
      const logs = await fetchAuditLogs(auction.id);
      setAuditLogs(logs);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-muted-foreground animate-pulse">Loading administrative interface...</p>
      </div>
    );
  }

  // Enforce access protection screen
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 shadow-md">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground text-sm mb-6">
            You do not possess the administrative privileges required to view this panel.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  const pendingCount = auctions.filter((a) => a.status === 'pending').length;
  const activeCount = auctions.filter((a) => a.status === 'active').length;
  const endedCount = auctions.filter((a) => a.status === 'ended' || a.status === 'cancelled').length;
  const totalBidsCount = auctions.reduce((acc, a) => acc + (a.currentBid > 0 ? 1 : 0), 0); // rough estimate

  // Filter listings based on selected tab
  const filteredAuctions = auctions.filter((a) => {
    if (activeTab === 'pending') return a.status === 'pending';
    if (activeTab === 'active') return a.status === 'active';
    return a.status === 'ended' || a.status === 'cancelled';
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 border-b border-border pb-6"
      >
        <div>
          <div className="flex items-center space-x-2.5 text-accent mb-1.5">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-semibold tracking-widest uppercase">Admin Terminal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">Ouro System Console</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-2 md:mt-0">
          LoggedIn: <span className="font-semibold text-foreground">{currentUser.email}</span>
        </p>
      </motion.div>

      {/* Global Admin Message Banner */}
      <AnimatePresence>
        {actionMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-6 p-4 rounded-lg flex items-center space-x-3 border ${
              actionMessage.type === 'success'
                ? 'bg-accent/10 text-accent border-accent/20'
                : 'bg-destructive/10 text-destructive border-destructive/20'
            }`}
          >
            {actionMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <p className="font-medium text-sm">{actionMessage.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* System Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Pending Approvals', value: pendingCount, icon: <AlertTriangle className="w-8 h-8 text-amber-500 opacity-40" /> },
          { label: 'Active Auctions', value: activeCount, icon: <Clock className="w-8 h-8 text-primary opacity-30" /> },
          { label: 'Completed Auctions', value: endedCount, icon: <Trophy className="w-8 h-8 text-accent opacity-30" /> },
          { label: 'Total Bidding Activity', value: totalBidsCount, icon: <TrendingUp className="w-8 h-8 text-primary opacity-30" /> },
        ].map((m, idx) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="bg-secondary rounded-xl p-5 border border-border flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">{m.label}</p>
              <p className="text-3xl font-extrabold text-foreground">{m.value}</p>
            </div>
            {m.icon}
          </motion.div>
        ))}
      </div>

      {/* Interactive Tabs */}
      <div className="flex border-b border-border mb-6">
        {[
          { id: 'pending', name: 'Pending Review', count: pendingCount },
          { id: 'active', name: 'Active Auctions', count: activeCount },
          { id: 'ended', name: 'Completed & Cancelled', count: endedCount },
          { id: 'reported_bids', name: 'Reported Bids', count: reportedBids.length },
          { id: 'reported_auctions', name: 'Reported Auctions', count: reportedAuctions.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-6 font-semibold border-b-2 text-sm transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{tab.name}</span>
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeTab === tab.id
                ? tab.id === 'pending' && tab.count > 0 
                  ? 'bg-amber-500 text-white' 
                  : (tab.id === 'reported_bids' || tab.id === 'reported_auctions') && tab.count > 0 
                  ? 'bg-destructive text-destructive-foreground' 
                  : 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Table: Listings Console */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-xl shadow-md overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border bg-secondary/30">
          <h2 className="font-bold text-foreground capitalize">
            {activeTab === 'reported_bids' ? 'Reported Bids' : activeTab === 'reported_auctions' ? 'Reported Auctions' : activeTab} Listings Management
          </h2>
          <p className="text-xs text-muted-foreground">
            {activeTab === 'reported_bids' 
              ? 'Review reported bids, dismiss false flags, or delete/void illegitimate bids' 
              : activeTab === 'reported_auctions'
              ? 'Review reported auction listings, dismiss false reports, or delete/void listings'
              : 'Monitor state machine, approve requests, force-close, or inspect bid audit logs'}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {activeTab === 'reported_bids' ? (
                <tr className="border-b border-border text-muted-foreground text-xs uppercase bg-secondary/10">
                  <th className="px-6 py-3.5 font-semibold">Auction Title</th>
                  <th className="px-6 py-3.5 font-semibold">Bidder Email</th>
                  <th className="px-6 py-3.5 font-semibold">Bid Amount</th>
                  <th className="px-6 py-3.5 font-semibold">Timestamp</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              ) : activeTab === 'reported_auctions' ? (
                <tr className="border-b border-border text-muted-foreground text-xs uppercase bg-secondary/10">
                  <th className="px-6 py-3.5 font-semibold">Auction Title</th>
                  <th className="px-6 py-3.5 font-semibold">Seller</th>
                  <th className="px-6 py-3.5 font-semibold">Current Bid</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              ) : (
                <tr className="border-b border-border text-muted-foreground text-xs uppercase bg-secondary/10">
                  <th className="px-6 py-3.5 font-semibold">Title</th>
                  <th className="px-6 py-3.5 font-semibold">Current/Starting Bid</th>
                  <th className="px-6 py-3.5 font-semibold">End Time</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {activeTab === 'reported_bids' ? (
                reportedBids.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                      No reported bids found.
                    </td>
                  </tr>
                ) : (
                  reportedBids.map((b) => (
                    <tr key={b.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        <Link to={`/auction/${b.auctionId}`} className="hover:underline hover:text-primary transition-colors">
                          {b.auctionTitle}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-semibold">
                        {b.username}
                      </td>
                      <td className="px-6 py-4 text-primary font-bold">
                        ${Number(b.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {new Date(b.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleDismissReport(b.id)}
                          className="px-3 py-1.5 rounded-lg text-xs bg-secondary text-foreground hover:bg-secondary/80 border border-border transition-colors cursor-pointer"
                          title="Dismiss this report"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleDeleteBid(b.id)}
                          className="px-3 py-1.5 rounded-lg text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 transition-colors cursor-pointer font-semibold shadow-sm"
                          title="Void bid and refund user"
                        >
                          Void Bid
                        </button>
                      </td>
                    </tr>
                  ))
                )
              ) : activeTab === 'reported_auctions' ? (
                reportedAuctions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                      No reported auctions found.
                    </td>
                  </tr>
                ) : (
                  reportedAuctions.map((a) => (
                    <tr key={a.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        <Link to={`/auction/${a.id}`} className="hover:underline hover:text-primary transition-colors">
                          {a.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs font-semibold">
                        {a.sellerName}
                      </td>
                      <td className="px-6 py-4 text-primary font-bold">
                        ${a.currentBid.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                            a.status === 'active'
                              ? 'bg-accent/10 text-accent'
                              : a.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-muted-foreground/15 text-muted-foreground'
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleDismissAuctionReport(a.id)}
                          className="px-3 py-1.5 rounded-lg text-xs bg-secondary text-foreground hover:bg-secondary/80 border border-border transition-colors cursor-pointer"
                          title="Dismiss report and clear flag"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleDeleteAuction(a.id)}
                          className="px-3 py-1.5 rounded-lg text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 transition-colors cursor-pointer font-semibold shadow-sm"
                          title="Delete/Reject this auction listing"
                        >
                          Delete Auction
                        </button>
                      </td>
                    </tr>
                  ))
                )
              ) : (
                filteredAuctions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                      No {activeTab} auctions found.
                    </td>
                  </tr>
                ) : (
                  filteredAuctions.map((a) => (
                    <tr key={a.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        <Link to={`/auction/${a.id}`} className="hover:underline hover:text-primary transition-colors">
                          {a.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-foreground font-semibold">
                        ${a.currentBid.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {new Date(a.endTime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                            a.status === 'active'
                              ? 'bg-accent/10 text-accent'
                              : a.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-muted-foreground/15 text-muted-foreground'
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenAuditLogs(a)}
                          className="px-3 py-1.5 rounded-lg text-xs bg-secondary text-foreground hover:bg-secondary/80 border border-border transition-colors cursor-pointer"
                          title="View Full Bidding Audit Trail"
                        >
                          Audit Trail
                        </button>
                        {a.status === 'pending' && (
                          <button
                            onClick={() => handleApprove(a.id)}
                            className="px-3 py-1.5 rounded-lg text-xs bg-accent text-accent-foreground hover:bg-accent/90 transition-colors cursor-pointer font-semibold shadow-sm"
                          >
                            Approve
                          </button>
                        )}
                        {a.status === 'active' && (
                          <button
                            onClick={() => handleForceClose(a.id)}
                            className="px-3 py-1.5 rounded-lg text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 transition-colors cursor-pointer"
                          >
                            Force Close
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Audit Log Modal */}
      <AnimatePresence>
        {showAuditModal && selectedAuction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              <div className="px-6 py-5 border-b border-border bg-secondary/30 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-foreground text-lg">Bid Audit Trail</h3>
                  <p className="text-xs text-muted-foreground truncate max-w-[500px]">
                    Auction: {selectedAuction.title} (ID: {selectedAuction.id})
                  </p>
                </div>
                <button
                  onClick={() => setShowAuditModal(false)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {logsLoading ? (
                  <p className="text-center text-muted-foreground animate-pulse py-10">
                    Loading dispute history...
                  </p>
                ) : auditLogs.length === 0 ? (
                  <div className="text-center text-muted-foreground py-10">
                    No bids have been placed on this listing yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground uppercase font-semibold">
                          <th className="pb-3 pr-4">Bidder Email</th>
                          <th className="pb-3 pr-4">Amount</th>
                          <th className="pb-3 pr-4">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-secondary/5">
                            <td className="py-3 font-medium text-foreground pr-4">{log.username}</td>
                            <td className="py-3 font-bold text-primary pr-4">
                              ${log.amount.toLocaleString()}
                            </td>
                            <td className="py-3 text-muted-foreground pr-4">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
