/**
 * API Service for Spring Boot Integration
 *
 * This file contains all API endpoints and mock data.
 * Replace the mock implementations with actual Spring Boot REST API calls.
 *
 * Spring Boot Base URL: http://localhost:8080/api
 */

export interface Auction {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  currentBid: number;
  startingBid: number;
  endTime: string; // ISO timestamp
  category: string;
  sellerId: string;
  sellerName: string;
  status: 'active' | 'ended' | 'cancelled';
  
}

export interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  username: string;
  amount: number;
  timestamp: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  // [ADDED BY ANTIGRAVITY] New properties mapping directly to database fields
  name?: string;
  role?: string;
  wallet?: {
    walletId: number;
    balance: number;
  };
}

export interface BidResponse {
  success: boolean;
  message: string;
  bid?: Bid;
  timeExtended?: boolean;
}

// Mock Data
const mockAuctions: Auction[] = [
  {
    id: '1',
    title: 'Vintage Camera Leica M6',
    description: 'Beautiful vintage Leica M6 camera in excellent condition. Perfect for film photography enthusiasts.',
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=400&fit=crop',
    currentBid: 1250,
    startingBid: 800,
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    category: 'Electronics',
    sellerId: 'seller1',
    sellerName: 'John Doe',
    status: 'active',
  },
  {
    id: '2',
    title: 'MacBook Pro 16" M3 Max',
    description: 'Brand new MacBook Pro with M3 Max chip, 64GB RAM, 2TB SSD. Still in original packaging.',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop',
    currentBid: 3200,
    startingBid: 2500,
    endTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(), // 45 minutes
    category: 'Electronics',
    sellerId: 'seller2',
    sellerName: 'Tech Store',
    status: 'active',
  },
  {
    id: '3',
    title: 'Designer Watch Rolex Submariner',
    description: 'Authentic Rolex Submariner with certificate of authenticity. Excellent condition.',
    imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&h=400&fit=crop',
    currentBid: 8500,
    startingBid: 7000,
    endTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes (for urgency testing)
    category: 'Fashion',
    sellerId: 'seller3',
    sellerName: 'Luxury Items',
    status: 'active',
  },
  {
    id: '4',
    title: 'Vintage Vinyl Record Collection',
    description: 'Rare collection of 50+ vintage vinyl records from the 70s and 80s. Includes classics from Pink Floyd, Led Zeppelin, and more.',
    imageUrl: 'https://images.unsplash.com/photo-1603048297172-c92544798d5f?w=600&h=400&fit=crop',
    currentBid: 450,
    startingBid: 300,
    endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    category: 'Music',
    sellerId: 'seller4',
    sellerName: 'Music Collector',
    status: 'active',
  },
  {
    id: '5',
    title: 'Gaming Console PlayStation 5 Pro',
    description: 'PS5 Pro with 2 controllers and 5 games. Like new condition, barely used.',
    imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&h=400&fit=crop',
    currentBid: 650,
    startingBid: 500,
    endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    category: 'Gaming',
    sellerId: 'seller5',
    sellerName: 'Gaming Store',
    status: 'active',
  },
  {
    id: '6',
    title: 'Antique Wooden Desk',
    description: 'Beautiful 19th century oak writing desk with intricate carvings. Restored to original condition.',
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&h=400&fit=crop',
    currentBid: 1800,
    startingBid: 1200,
    endTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    category: 'Furniture',
    sellerId: 'seller6',
    sellerName: 'Antique Dealer',
    status: 'active',
  },
];

const mockBids: Record<string, Bid[]> = {
  '1': [
    { id: 'b1', auctionId: '1', userId: 'user1', username: 'bidder123', amount: 1250, timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
    { id: 'b2', auctionId: '1', userId: 'user2', username: 'collector99', amount: 1150, timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString() },
    { id: 'b3', auctionId: '1', userId: 'user3', username: 'photoenthusiast', amount: 1000, timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString() },
  ],
  '2': [
    { id: 'b4', auctionId: '2', userId: 'user4', username: 'techguru', amount: 3200, timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
    { id: 'b5', auctionId: '2', userId: 'user5', username: 'developer_pro', amount: 3000, timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
  ],
  '3': [
    { id: 'b6', auctionId: '3', userId: 'user6', username: 'watchcollector', amount: 8500, timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
    { id: 'b7', auctionId: '3', userId: 'user7', username: 'luxury_buyer', amount: 8200, timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString() },
    { id: 'b8', auctionId: '3', userId: 'user8', username: 'rolex_fan', amount: 7800, timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString() },
  ],
};

const currentUser: User = {
  id: 'currentUser',
  username: 'you',
  email: 'user@example.com',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current',
};

// ==========================================
// API Functions
// ==========================================

// @ts-ignore
const SPRING_BOOT_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * GET /api/auctions
 * Fetch all active auctions with optional filters from Spring Boot
 */
export async function fetchAuctions(filters?: any): Promise<Auction[]> {
  const params = new URLSearchParams();
  
  // Attach any filters the user applied
  if (filters?.category && filters.category !== 'All') params.append('category', filters.category);
  if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
  if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
  if (filters?.search) params.append('search', filters.search);
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  
  // Temporarily fallback to mock data if fetch fails (e.g., backend is not running yet)
  try {
    const response = await fetch(`${SPRING_BOOT_BASE_URL}/auctions?${params}`);
    
    if (!response.ok) {
      console.warn("Backend returned an error. Is Spring Boot running?");
      throw new Error('Failed to fetch auctions from the backend');
    }
    return await response.json(); 
  } catch (error) {
    console.error("Could not connect to Spring Boot. Falling back to mock data for now.", error);
    
    // --- Mock Fallback Logic (so your UI doesn't break while developing) ---
    let filtered = [...mockAuctions];
    if (filters?.category && filters.category !== 'All') filtered = filtered.filter(a => a.category === filters.category);
    if (filters?.minPrice) filtered = filtered.filter(a => a.currentBid >= filters.minPrice);
    if (filters?.maxPrice) filtered = filtered.filter(a => a.currentBid <= filters.maxPrice);
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(a => a.title.toLowerCase().includes(search) || a.description.toLowerCase().includes(search));
    }
    if (filters?.sortBy === 'endingSoon') filtered.sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime());
    else if (filters?.sortBy === 'priceLow') filtered.sort((a, b) => a.currentBid - b.currentBid);
    else if (filters?.sortBy === 'priceHigh') filtered.sort((a, b) => b.currentBid - a.currentBid);
    return filtered;
  }
}

/**
 * GET /api/auctions/:id
 * Fetch a single auction by ID
 */
export async function fetchAuctionById(id: string): Promise<Auction | null> {
  try {
    const response = await fetch(`${SPRING_BOOT_BASE_URL}/auctions/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch auction by id: ${id}`);
    }
    const data = await response.json();
    if (!data) return null;
    
    // Support both frontend-friendly maps and raw backend entities defensively
    return {
      id: String(data.id || data.auctionId || id),
      title: data.title || 'Untitled Auction',
      description: data.description || 'Direct from PostgreSQL database',
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600',
      currentBid: typeof data.currentBid === 'number' ? data.currentBid : (data.currentHighBid || 0),
      startingBid: typeof data.startingBid === 'number' ? data.startingBid : (data.currentHighBid || 0),
      endTime: data.endTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      category: data.category || 'General',
      sellerId: data.sellerId || (data.seller?.userId || '1'),
      sellerName: data.sellerName || (data.seller?.email || 'Unknown Seller'),
      status: data.status || 'active',
    };
  } catch (error) {
    console.error(`Could not connect to Spring Boot for fetchAuctionById(${id}). Falling back to mock data.`, error);
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockAuctions.find(a => a.id === id) || null;
  }
}

/**
 * GET /api/auctions/:id/bids
 * Fetch all bids for a specific auction
 */
export async function fetchBidHistory(auctionId: string): Promise<Bid[]> {
  try {
    const response = await fetch(`${SPRING_BOOT_BASE_URL}/auctions/${auctionId}/bids`);
    if (!response.ok) {
      throw new Error(`Failed to fetch bids for auction: ${auctionId}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Could not connect to Spring Boot for fetchBidHistory(${auctionId}). Falling back to mock data.`, error);
    await new Promise(resolve => setTimeout(resolve, 200));
    const bids = mockBids[auctionId] || [];
    return [...bids].sort((a, b) => b.amount - a.amount);
  }
}

/**
 * POST /api/auctions/:id/bids
 * Place a new bid on an auction
 * Body: { amount: number }
 */
export async function placeBid(auctionId: string, amount: number): Promise<BidResponse> {
  const email = localStorage.getItem("email");
  try {
    const response = await fetch(`${SPRING_BOOT_BASE_URL}/auctions/${auctionId}/bids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, email })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to place bid on auction ${auctionId}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Could not connect to Spring Boot to place bid. Falling back to mock implementation.`, error);
    await new Promise(resolve => setTimeout(resolve, 500));

    const auction = mockAuctions.find(a => a.id === auctionId);
    if (!auction) {
      return { success: false, message: 'Auction not found' };
    }

    if (amount <= auction.currentBid) {
      return { success: false, message: `Bid must be higher than current bid of $${auction.currentBid}` };
    }

    const newBid: Bid = {
      id: `b${Date.now()}`,
      auctionId,
      userId: currentUser.id,
      username: currentUser.username,
      amount,
      timestamp: new Date().toISOString(),
    };

    // Update mock data
    if (!mockBids[auctionId]) {
      mockBids[auctionId] = [];
    }
    mockBids[auctionId].unshift(newBid);
    auction.currentBid = amount;

    // Anti-sniping: extend time if bid placed in last 15 seconds
    const timeRemaining = new Date(auction.endTime).getTime() - Date.now();
    let timeExtended = false;

    if (timeRemaining < 15 * 1000 && timeRemaining > 0) {
      auction.endTime = new Date(Date.now() + 30 * 1000).toISOString(); // Extend by 30 seconds
      timeExtended = true;
    }

    return {
      success: true,
      message: timeExtended ? 'Bid placed successfully! Time extended due to late bid.' : 'Bid placed successfully!',
      bid: newBid,
      timeExtended,
    };
  }
}

/**
 * GET /api/users/current
 * Get current logged-in user
 */
export async function fetchCurrentUser(): Promise<User> {
  const email = localStorage.getItem("email");
  if (!email) {
    return {
      id: 'guest',
      username: 'Guest',
      email: '',
      role: 'USER',
    };
  }

  // [ADDED BY ANTIGRAVITY] Fetches active user profile and sets roles/wallets directly from DB
  try {
    const response = await fetch(`${SPRING_BOOT_BASE_URL.replace('/api', '')}/auth/profile?email=${encodeURIComponent(email)}`);
    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }
    const data = await response.json();
    
    // Save to local storage for quick access
    if (data.role) {
      localStorage.setItem("role", data.role);
    }
    if (data.name) {
      localStorage.setItem("name", data.name);
    }

    return {
      id: data.userId || 'currentUser',
      username: data.name || data.email || 'You',
      email: data.email,
      name: data.name || 'Anonymous User',
      role: data.role || 'USER',
      wallet: data.wallet ? {
        walletId: data.wallet.walletId,
        balance: data.wallet.balance
      } : undefined,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`
    };
  } catch (error) {
    console.error("Could not fetch actual user profile, using local storage cache", error);
    const cachedRole = localStorage.getItem("role") || "USER";
    const cachedName = localStorage.getItem("name") || email.split('@')[0];
    return {
      id: 'currentUser',
      username: cachedName,
      email: email,
      name: cachedName,
      role: cachedRole,
      wallet: {
        walletId: 101,
        balance: 10000.0
      },
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
    };
  }
}

/**
 * PUT /auth/update-role
 * Update user's role on the backend
 */
export async function updateUserRole(email: string, role: string): Promise<User> {
  // [ADDED BY ANTIGRAVITY] Hits PUT /auth/update-role endpoint to modify active role in Postgres
  const response = await fetch(`${SPRING_BOOT_BASE_URL.replace('/api', '')}/auth/update-role`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, role })
  });
  if (!response.ok) {
    throw new Error('Failed to update user role');
  }
  const data = await response.json();
  if (data.role) {
    localStorage.setItem("role", data.role);
  }
  return data;
}

/**
 * POST /api/auctions/create
 * Create a new auction in the Spring Boot backend
 */
export async function createAuction(auctionData: any): Promise<any> {
  // [ADDED BY ANTIGRAVITY] Posts new auction mapping structure containing title, startingBid, endTime, and seller email
  const response = await fetch(`${SPRING_BOOT_BASE_URL}/auctions/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(auctionData)
  });
  if (!response.ok) {
    throw new Error('Failed to create auction');
  }
  return await response.json();
}

/**
 * GET /api/users/:id/bids
 * Get all bids placed by a user
 */
export async function fetchUserBids(userId: string): Promise<Bid[]> {
  // [ADDED BY ANTIGRAVITY] Fetches user's bids from the database using active UUID
  try {
    const response = await fetch(`${SPRING_BOOT_BASE_URL}/users/${userId}/bids`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user bids`);
    }
    return await response.json();
  } catch (error) {
    console.error("Could not fetch user bids from database. Using mock fallback.", error);
    await new Promise(resolve => setTimeout(resolve, 200));
    const allBids: Bid[] = [];
    Object.values(mockBids).forEach(bidArray => {
      allBids.push(...bidArray.filter(b => b.userId === userId));
    });
    return allBids.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

/**
 * GET /api/users/:id/auctions/won
 * Get all auctions won by a user
 */
export async function fetchWonAuctions(userId: string): Promise<Auction[]> {
  // [ADDED BY ANTIGRAVITY] Fetches auctions won by user from database using active UUID
  try {
    const response = await fetch(`${SPRING_BOOT_BASE_URL}/users/${userId}/auctions/won`);
    if (!response.ok) {
      throw new Error(`Failed to fetch won auctions`);
    }
    return await response.json();
  } catch (error) {
    console.error("Could not fetch won auctions from database. Using mock fallback.", error);
    await new Promise(resolve => setTimeout(resolve, 200));
    return [];
  }
}

/**
 * GET /api/users/:id/auctions/selling
 * Get all auctions created by a user (seller)
 */
export async function fetchUserSelling(userId: string): Promise<Auction[]> {
  // [ADDED BY ANTIGRAVITY] Fetches all auctions created by this seller from the PostgreSQL database using dynamic UUID
  try {
    const response = await fetch(`${SPRING_BOOT_BASE_URL}/users/${userId}/auctions/selling`);
    if (!response.ok) {
      throw new Error(`Failed to fetch selling auctions`);
    }
    return await response.json();
  } catch (error) {
    console.error("Could not fetch selling auctions from database. Using mock fallback.", error);
    await new Promise(resolve => setTimeout(resolve, 200));
    return [];
  }
}

/**
 * GET /api/categories
 * Get all available categories
 */
export async function fetchCategories(): Promise<string[]> {
  // TODO: Replace with actual Spring Boot API call
  // const response = await fetch(`${SPRING_BOOT_BASE_URL}/categories`);
  // return response.json();

  await new Promise(resolve => setTimeout(resolve, 100));
  return ['All', 'Electronics', 'Fashion', 'Music', 'Gaming', 'Furniture', 'Art', 'Sports'];
}