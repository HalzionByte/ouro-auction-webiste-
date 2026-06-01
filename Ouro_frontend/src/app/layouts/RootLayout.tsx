import { Outlet, useNavigate, useLocation } from 'react-router';
import { Navbar } from '../components/Navbar';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';

function OuroLogoFooter() {
  return (
    <svg width="24" height="24" viewBox="0 0 30 30" fill="none" aria-hidden="true">
      <circle cx="15" cy="15" r="13" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="15" cy="15" r="6.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="15" cy="15" r="2.5" fill="currentColor" />
    </svg>
  );
}

export function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Scroll-to-top visibility
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 320);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const handleSearchChange = (query: string) => {
    if (window.location.pathname !== '/') {
      navigate('/');
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onSearchChange={handleSearchChange} />
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2.5">
                <OuroLogoFooter />
                <span className="text-lg font-semibold tracking-wide">Ouro</span>
              </div>
              <p className="text-primary-foreground/70 text-sm leading-relaxed">
                Fair, transparent auctions with anti-sniping protection. Bid with confidence.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-medium mb-3 text-primary-foreground/90">Platform</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/65">
                <li><a href="/" className="hover:text-primary-foreground transition-colors">Browse Auctions</a></li>
                <li><a href="/create-auction" className="hover:text-primary-foreground transition-colors">Create Auction</a></li>
                <li><a href="/dashboard" className="hover:text-primary-foreground transition-colors">My Dashboard</a></li>
              </ul>
            </div>

            {/* Trust signals */}
            <div>
              <h4 className="font-medium mb-3 text-primary-foreground/90">Why Ouro?</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/65">
                <li>⚔️ Anti-sniping protection</li>
                <li>📋 Full bid history transparency</li>
                <li>🌙 Dark &amp; light mode</li>
                <li>⚡ Real-time countdowns</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-primary-foreground/50">
            <span>© 2026 Ouro — Fair &amp; Transparent Auction Platform</span>
            <span>Built with React · Tailwind CSS · Spring Boot ready</span>
          </div>
        </div>
      </footer>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            key="scroll-top"
            initial={{ opacity: 0, scale: 0.7, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.93 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center border border-white/10 hover:bg-primary/90 transition-colors"
            aria-label="Back to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
