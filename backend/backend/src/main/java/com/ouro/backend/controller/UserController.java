package com.ouro.backend.controller;

import com.ouro.backend.entity.User;
import com.ouro.backend.entity.Bid;
import com.ouro.backend.entity.Auction;
import com.ouro.backend.repository.UserRepository;
import com.ouro.backend.repository.BidRepository;
import com.ouro.backend.repository.AuctionRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private AuctionRepository auctionRepository;

    // GET ALL BIDS PLACED BY A USER
    @GetMapping("/{userId}/bids")
    public List<Map<String, Object>> getUserBids(@PathVariable UUID userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return new ArrayList<>();
        }

        List<Bid> bids = bidRepository.findByBidderOrderByBidIdDesc(user);
        List<Map<String, Object>> response = new ArrayList<>();

        for (Bid b : bids) {
            // Defensive check to prevent NullPointerException if an orphaned bid has a null auction
            if (b.getAuction() == null) continue;
            Map<String, Object> map = new HashMap<>();
            map.put("id", b.getBidId().toString());
            map.put("auctionId", b.getAuction().getAuctionId().toString());
            map.put("userId", user.getUserId().toString());
            map.put("username", user.getEmail());
            map.put("amount", b.getAmount());
            if (b.getTimestamp() != null) {
                map.put("timestamp", b.getTimestamp().atZone(java.time.ZoneId.systemDefault()).toInstant().toString());
            } else {
                map.put("timestamp", java.time.Instant.now().toString());
            }
            response.add(map);
        }

        return response;
    }

    // GET ALL AUCTIONS WON BY A USER
    @GetMapping("/{userId}/auctions/won")
    public List<Map<String, Object>> getWonAuctions(@PathVariable UUID userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return new ArrayList<>();
        }

        // Find all bids by this user
        List<Bid> bids = bidRepository.findByBidderOrderByBidIdDesc(user);
        
        // Find which auctions are ended and where this user was the highest bidder
        List<Auction> allAuctions = auctionRepository.findAll();
        List<Map<String, Object>> response = new ArrayList<>();
        Set<Long> processedAuctions = new HashSet<>();

        for (Auction a : allAuctions) {
            if (processedAuctions.contains(a.getAuctionId())) {
                continue;
            }
            // Check if user has bid on this auction and if their bid is the highest bid
            boolean hasBid = bids.stream().anyMatch(b -> b.getAuction().getAuctionId().equals(a.getAuctionId()));
            if (hasBid) {
                List<Bid> auctionBids = bidRepository.findByAuctionOrderByBidIdDesc(a);
                if (!auctionBids.isEmpty() && auctionBids.get(0).getBidder().getUserId().equals(userId)) {
                    // Check if auction is ended. For demo purposes, we consider ended if status is ended OR endTime is past
                    boolean isEnded = "ended".equalsIgnoreCase(a.getStatus()) || 
                                     (a.getEndTime() != null && a.getEndTime().isBefore(java.time.LocalDateTime.now()));
                    
                    if (isEnded) {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", a.getAuctionId().toString());
                        map.put("title", a.getTitle() != null ? a.getTitle() : "Untitled Auction");
                        map.put("currentBid", a.getCurrentHighBid());
                        map.put("description", "Won Auction");
                        map.put("imageUrl", a.getImageUrl() != null ? a.getImageUrl() : "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600");
                        map.put("images", a.getImagesJson());
                        map.put("category", "General");
                        response.add(map);
                        processedAuctions.add(a.getAuctionId());
                    }
                }
            }
        }

        return response;
    }

    // GET ALL AUCTIONS BEING SOLD BY A USER
    // Retrieves all active/ended listings created by a specific user from the PostgreSQL database
    @GetMapping("/{userId}/auctions/selling")
    public List<Map<String, Object>> getSellingAuctions(@PathVariable UUID userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return new ArrayList<>();
        }

        List<Auction> auctions = auctionRepository.findBySellerOrderByAuctionIdDesc(user);
        List<Map<String, Object>> response = new ArrayList<>();

        for (Auction a : auctions) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getAuctionId().toString());
            map.put("title", a.getTitle() != null ? a.getTitle() : "Untitled Auction");
            map.put("currentBid", a.getCurrentHighBid());
            map.put("startingBid", a.getCurrentHighBid());
            map.put("status", a.getStatus() != null ? a.getStatus() : "active");
            map.put("endTime", a.getEndTime() != null ? a.getEndTime().atZone(java.time.ZoneId.systemDefault()).toInstant().toString() : java.time.LocalDateTime.now().plusDays(7).atZone(java.time.ZoneId.systemDefault()).toInstant().toString());
            map.put("description", "Listing created by you");
            map.put("category", "General");
            map.put("imageUrl", a.getImageUrl() != null ? a.getImageUrl() : "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600");
            map.put("images", a.getImagesJson());
            map.put("sellerId", user.getUserId().toString());
            map.put("sellerName", user.getEmail());
            response.add(map);
        }

        return response;
    }

    // GET WATCHLIST FOR A USER
    @GetMapping("/{userId}/watchlist")
    public List<Map<String, Object>> getWatchlist(@PathVariable UUID userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return new ArrayList<>();
        }

        List<Auction> watchlist = user.getWatchlist();
        List<Map<String, Object>> response = new ArrayList<>();

        for (Auction a : watchlist) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getAuctionId().toString());
            map.put("title", a.getTitle() != null ? a.getTitle() : "Untitled Auction");
            map.put("currentBid", a.getCurrentHighBid());
            map.put("startingBid", a.getCurrentHighBid());
            map.put("status", a.getStatus() != null ? a.getStatus() : "active");
            map.put("endTime", a.getEndTime() != null ? a.getEndTime().atZone(java.time.ZoneId.systemDefault()).toInstant().toString() : java.time.LocalDateTime.now().plusDays(7).atZone(java.time.ZoneId.systemDefault()).toInstant().toString());
            map.put("description", "Direct from PostgreSQL database");
            map.put("category", "General");
            map.put("imageUrl", a.getImageUrl() != null ? a.getImageUrl() : "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600");
            map.put("images", a.getImagesJson());
            map.put("reported", a.getReported() != null && a.getReported());

            String sellerId = "1";
            String sellerName = "Unknown Seller";
            try {
                if (a.getSeller() != null) {
                    if (a.getSeller().getUserId() != null) {
                        sellerId = a.getSeller().getUserId().toString();
                    }
                    if (a.getSeller().getEmail() != null) {
                        sellerName = a.getSeller().getEmail();
                    }
                }
            } catch (Exception e) {
                // Ignore
            }
            map.put("sellerId", sellerId);
            map.put("sellerName", sellerName);
            response.add(map);
        }

        return response;
    }

    // ADD TO WATCHLIST
    @PostMapping("/{userId}/watchlist/{auctionId}")
    public Map<String, Object> addToWatchlist(@PathVariable UUID userId, @PathVariable Long auctionId) {
        Map<String, Object> response = new HashMap<>();
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            response.put("success", false);
            response.put("message", "User not found");
            return response;
        }

        Auction auction = auctionRepository.findById(auctionId).orElse(null);
        if (auction == null) {
            response.put("success", false);
            response.put("message", "Auction not found");
            return response;
        }

        if (user.getWatchlist().contains(auction)) {
            response.put("success", true);
            response.put("message", "Auction is already in watchlist");
            return response;
        }

        user.getWatchlist().add(auction);
        userRepository.save(user);

        response.put("success", true);
        response.put("message", "Auction added to watchlist successfully");
        return response;
    }

    // REMOVE FROM WATCHLIST
    @DeleteMapping("/{userId}/watchlist/{auctionId}")
    public Map<String, Object> removeFromWatchlist(@PathVariable UUID userId, @PathVariable Long auctionId) {
        Map<String, Object> response = new HashMap<>();
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            response.put("success", false);
            response.put("message", "User not found");
            return response;
        }

        Auction auction = auctionRepository.findById(auctionId).orElse(null);
        if (auction == null) {
            response.put("success", false);
            response.put("message", "Auction not found");
            return response;
        }

        if (!user.getWatchlist().contains(auction)) {
            response.put("success", true);
            response.put("message", "Auction is not in watchlist");
            return response;
        }

        user.getWatchlist().remove(auction);
        userRepository.save(user);

        response.put("success", true);
        response.put("message", "Auction removed from watchlist successfully");
        return response;
    }
}

