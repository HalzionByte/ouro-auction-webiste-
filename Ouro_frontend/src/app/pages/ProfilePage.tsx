import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { User as UserIcon, Wallet, Shield, ArrowLeft, Mail, CheckCircle, RefreshCw } from 'lucide-react';
import { fetchCurrentUser, updateUserRole, User } from '../services/api';

export function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState('USER');
    const [updating, setUpdating] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        setLoading(true);
        try {
            const profile = await fetchCurrentUser();
            setUser(profile);
            if (profile.role) {
                setSelectedRole(profile.role);
            }
        } catch (error) {
            console.error("Failed to load user profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async () => {
        if (!user || !user.email) return;
        setUpdating(true);
        setSuccessMessage('');
        try {
            await updateUserRole(user.email, selectedRole);
            setSuccessMessage(`Role successfully updated to ${selectedRole === 'USER' ? 'Buyer / Bidder' : 'Seller'}!`);
            await loadUserProfile();
            
            // Reload window after 1.5 seconds to refresh Navbar permissions
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            console.error("Failed to update role", error);
            alert("Failed to update role. Please try again.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <p className="text-muted-foreground animate-pulse text-lg">Loading your profile...</p>
            </div>
        );
    }

    if (!user || user.id === 'guest') {
        return (
            <div className="max-w-md mx-auto px-4 py-20 text-center">
                <div className="bg-card border border-border p-8 rounded-2xl shadow-xl">
                    <Shield className="w-16 h-16 text-destructive mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
                    <p className="text-muted-foreground mb-6">You must be logged in to view your profile page.</p>
                    <Link to="/login" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/95 transition-all shadow-md">
                        Log In Now
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Back Button */}
            <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-6"
            >
                <Link to="/" className="inline-flex items-center space-x-2 text-primary hover:underline">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Auctions</span>
                </Link>
            </motion.div>

            {/* Profile Header card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left side card: Profile Picture & Main info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="md:col-span-1 bg-card border border-border rounded-2xl p-6 text-center shadow-lg flex flex-col items-center justify-between"
                >
                    <div className="w-full flex flex-col items-center">
                        <div className="relative mb-4 group">
                            <img
                                src={user.avatarUrl}
                                alt="User Avatar"
                                className="w-28 h-28 rounded-full border-4 border-primary/20 bg-secondary"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium cursor-pointer">
                                Avatar
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-foreground truncate max-w-full">{user.name}</h2>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full mt-2 inline-block bg-primary/10 text-primary uppercase tracking-wider">
                            {user.role === 'ADMIN' ? 'Admin Account' : user.role === 'SELLER' ? 'Seller Account' : 'Buyer / Bidder'}
                        </span>
                    </div>

                    <div className="w-full border-t border-border mt-6 pt-4 text-left space-y-3">
                        <div className="flex items-center space-x-2 text-sm">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground truncate" title={user.email}>{user.email}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Right side cards: Detailed profile info & Role update */}
                <div className="md:col-span-2 flex flex-col gap-6">
                    {/* User Details & Wallet Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-6"
                    >
                        <h3 className="text-lg font-bold text-foreground border-b border-border pb-3 flex items-center space-x-2">
                            <UserIcon className="w-5 h-5 text-primary" />
                            <span>Account Details</span>
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">User ID</label>
                                <p className="font-mono text-sm text-foreground bg-secondary/50 p-2 rounded border border-border truncate mt-1">
                                    {user.id}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Address</label>
                                <p className="text-foreground p-2 rounded bg-secondary/50 border border-border truncate mt-1">
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        {/* Wallet Information */}
                        {user.role !== 'ADMIN' && (
                            <div className="bg-primary/5 border border-primary/10 rounded-xl p-5 mt-4">
                                <h4 className="font-semibold text-foreground flex items-center space-x-2 mb-3">
                                    <Wallet className="w-5 h-5 text-accent" />
                                    <span>Ouro Wallet Integration</span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground">Wallet ID</label>
                                        <p className="font-mono text-sm text-foreground bg-background p-2 rounded border border-border truncate mt-1">
                                            {user.wallet?.walletId ? `W-${user.wallet.walletId}` : 'Not Assigned'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground">Current Balance</label>
                                        <p className="text-xl font-bold text-primary p-2 rounded bg-background border border-border mt-1">
                                            ${user.wallet?.balance ? user.wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Change Role Card */}
                    {user.role !== 'ADMIN' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-6"
                        >
                            <h3 className="text-lg font-bold text-foreground border-b border-border pb-3 flex items-center space-x-2">
                                <Shield className="w-5 h-5 text-accent" />
                                <span>Role Management</span>
                            </h3>

                            <p className="text-sm text-muted-foreground">
                                You can switch your role below. Sellers can list new items, whereas Buyers can place bids. Switching roles will immediately update your privileges.
                            </p>

                            {successMessage && (
                                <div className="p-3 bg-accent/10 border border-accent/20 text-accent rounded-lg text-sm flex items-center space-x-2">
                                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>{successMessage}</span>
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-foreground">Select Active Role</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setSelectedRole('USER')}
                                        className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center gap-2 cursor-pointer ${
                                            selectedRole === 'USER'
                                                ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                                : 'border-border bg-background text-muted-foreground hover:bg-secondary/20'
                                        }`}
                                    >
                                        <UserIcon className="w-6 h-6" />
                                        <span className="font-semibold text-sm">Buyer / Bidder</span>
                                        <span className="text-[10px] opacity-75">Participate in auctions</span>
                                    </button>

                                    <button
                                        onClick={() => setSelectedRole('SELLER')}
                                        className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center gap-2 cursor-pointer ${
                                            selectedRole === 'SELLER'
                                                ? 'border-accent bg-accent/5 text-accent shadow-sm'
                                                : 'border-border bg-background text-muted-foreground hover:bg-secondary/20'
                                        }`}
                                    >
                                        <Shield className="w-6 h-6" />
                                        <span className="font-semibold text-sm">Seller</span>
                                        <span className="text-[10px] opacity-75">Create &amp; manage listings</span>
                                    </button>
                                </div>
                            </div>

                            {selectedRole !== user.role && (
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={handleRoleChange}
                                    disabled={updating}
                                    className="w-full bg-primary text-primary-foreground p-3 rounded-lg font-medium hover:bg-primary/95 transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                                >
                                    {updating ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            <span>Saving Changes...</span>
                                        </>
                                    ) : (
                                        <span>Update Active Role</span>
                                    )}
                                </motion.button>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
