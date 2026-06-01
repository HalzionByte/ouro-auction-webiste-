import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Search, User, Plus } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { fetchCurrentUser, User as ApiUser } from '../services/api';

interface NavbarProps {
  onSearchChange?: (query: string) => void;
}

function OuroLogo() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
      <circle cx="15" cy="15" r="13" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="15" cy="15" r="6.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="15" cy="15" r="2.5" fill="currentColor" />
    </svg>
  );
}

export function Navbar({ onSearchChange }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  // [ADDED BY ANTIGRAVITY] Local states to track dynamic log-in status and user details
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<ApiUser | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // [ADDED BY ANTIGRAVITY] Dynamic login authentication check on mount
  useEffect(() => {
    const isLogged = localStorage.getItem("loggedIn") === "true";
    setLoggedIn(isLogged);
    if (isLogged) {
      fetchCurrentUser().then((u) => {
        setUser(u);
      }).catch(err => {
        console.error("Failed to load user info in Navbar", err);
      });
    }
  }, []);

  // [ADDED BY ANTIGRAVITY] Clear credential state on logout
  const handleLogout = () => {
    localStorage.clear();
    setLoggedIn(false);
    setUser(null);
    window.location.href = "/";
  };

  // Press "/" to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <nav
      className={`bg-primary text-primary-foreground sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-xl' : 'shadow-md'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 hover:opacity-85 transition-opacity">
            <OuroLogo />
            <span className="text-xl font-semibold tracking-wide">Ouro</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search auctions…"
                className="w-full pl-10 pr-16 py-2 rounded-lg bg-white text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono text-gray-400 bg-gray-100 border border-gray-200 select-none">
                /
              </kbd>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center space-x-2">
            {!loggedIn ? (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-lg hover:bg-white/15 transition-colors text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium border border-white/20"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/profile"
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg hover:bg-white/15 transition-colors text-sm font-medium"
                >
                  <User className="w-4 h-4 text-accent" />
                  <span className="max-w-[120px] truncate">{user?.name || user?.email || 'Profile'}</span>
                </Link>
                
                <Link
                  to="/dashboard"
                  className="px-3 py-2 rounded-lg hover:bg-white/15 transition-colors text-sm font-medium"
                >
                  My Bids
                </Link>

                {user?.role === "SELLER" && (
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link
                      to="/create-auction"
                      className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors text-sm font-semibold shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden md:inline">Create Auction</span>
                    </Link>
                  </motion.div>
                )}

                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-lg hover:bg-destructive/20 text-destructive-foreground hover:text-destructive transition-colors text-sm font-medium cursor-pointer"
                >
                  Logout
                </button>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search auctions…"
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent text-sm"
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
