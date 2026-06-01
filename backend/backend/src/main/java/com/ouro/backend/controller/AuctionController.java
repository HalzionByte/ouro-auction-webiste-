package com.ouro.backend.controller;

import com.ouro.backend.entity.Auction;
import com.ouro.backend.entity.Bid;
import com.ouro.backend.entity.User;
import com.ouro.backend.entity.Wallet;
import com.ouro.backend.repository.AuctionRepository;
import com.ouro.backend.repository.BidRepository;
import com.ouro.backend.repository.UserRepository;
import com.ouro.backend.service.AuctionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/auctions")
public class AuctionController {

    @Autowired
    private AuctionService auctionService;

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private UserRepository userRepository;

    // CREATE AUCTION - Allows Sellers to list new auctions
    @PostMapping("/create")
    public Auction createAuction(@RequestBody Map<String, Object> body) {
        // Map properties and associate seller by email
        Auction auction = new Auction();
        auction.setTitle((String) body.get("title"));
        auction.setStatus("active");
        
        double startBid = 0.0;
        try {
            Object startingBidObj = body.get("startingBid");
            if (startingBidObj != null) {
                startBid = Double.parseDouble(startingBidObj.toString());
            }
        } catch (Exception e) {
            // Ignore
        }
        auction.setCurrentHighBid(startBid);
        
        String endTimeStr = (String) body.get("endTime");
        if (endTimeStr != null) {
            try {
                if (endTimeStr.contains("T")) {
                    auction.setEndTime(java.time.LocalDateTime.parse(endTimeStr));
                }
            } catch (Exception e) {
                try {
                    java.time.ZonedDateTime zdt = java.time.ZonedDateTime.parse(endTimeStr);
                    auction.setEndTime(zdt.toLocalDateTime());
                } catch (Exception ex) {
                    auction.setEndTime(java.time.LocalDateTime.now().plusDays(7));
                }
            }
        } else {
            auction.setEndTime(java.time.LocalDateTime.now().plusDays(7));
        }

        String email = (String) body.get("email");
        if (email != null) {
            User seller = userRepository.findByEmailIgnoreCase(email);
            auction.setSeller(seller);
        }
        
        return auctionService.createAuction(auction);
    }

    // GET ALL AUCTIONS (FRONTEND FRIENDLY RESPONSE)
    @GetMapping
    public List<Map<String, Object>> getAllAuctions() {

        List<Auction> auctions = auctionService.getAllAuctions();
        List<Map<String, Object>> response = new ArrayList<>();

        for (Auction a : auctions) {
            // Check if the auction duration has expired
            boolean expired = a.getEndTime() != null && a.getEndTime().isBefore(java.time.LocalDateTime.now());
            if (expired && !"ended".equalsIgnoreCase(a.getStatus())) {
                a.setStatus("ended");
                auctionRepository.save(a);
            }

            // Exclude ended auctions from the active list
            if ("ended".equalsIgnoreCase(a.getStatus())) {
                continue;
            }

            Map<String, Object> map = new HashMap<>();

            // DB FIELDS
            map.put("id", a.getAuctionId());
            map.put("title", a.getTitle() != null ? a.getTitle() : "Untitled Auction");
            //changd this 
            map.put("currentBid", a.getCurrentHighBid());
            map.put("startingBid", a.getCurrentHighBid());

            map.put("status", a.getStatus() != null ? a.getStatus() : "active");
            map.put("endTime",
                    a.getEndTime() != null
                    ? a.getEndTime().toString()
                    : java.time.LocalDateTime.now().plusDays(7).toString()
                    );
            // FRONTEND SAFE FIELDS (so UI never breaks)
            map.put("description", "Direct from PostgreSQL database");
            map.put("category", "General");
            map.put("imageUrl", "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600");
            map.put("sellerId", "1");
            map.put("sellerName", "Unknown Seller");
            // safe timestamp for React
            //map.put("endTime", java.time.ZonedDateTime.now().plusDays(7).toString());

            response.add(map);
        }

        return response;
    }

    // GET BY ID
    @GetMapping("/{id}")
    public Map<String, Object> getAuctionById(@PathVariable Long id) {
        Auction a = auctionService.getAuctionById(id).orElse(null);
        if (a == null) {
            return null;
        }

        // Dynamically update status if expired
        boolean expired = a.getEndTime() != null && a.getEndTime().isBefore(java.time.LocalDateTime.now());
        if (expired && !"ended".equalsIgnoreCase(a.getStatus())) {
            a.setStatus("ended");
            auctionRepository.save(a);
        }

        Map<String, Object> map = new HashMap<>();

        try {
            // DB FIELDS
            map.put("id", a.getAuctionId());
            map.put("title", a.getTitle() != null ? a.getTitle() : "Untitled Auction");
            map.put("currentBid", a.getCurrentHighBid());
            map.put("startingBid", a.getCurrentHighBid());

            map.put("status", a.getStatus() != null ? a.getStatus() : "active");
            map.put("endTime",
                    a.getEndTime() != null
                    ? a.getEndTime().toString()
                    : java.time.LocalDateTime.now().plusDays(7).toString()
                    );
            // FRONTEND SAFE FIELDS (so UI never breaks)
            map.put("description", "Direct from PostgreSQL database");
            map.put("category", "General");
            map.put("imageUrl", "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600");
            
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
                // Ignore lazy loading/session errors
            }
            map.put("sellerId", sellerId);
            map.put("sellerName", sellerName);
        } catch (Exception e) {
            // Safe fallback
        }

        return map;
    }

    // DELETE
    @DeleteMapping("/delete/{id}")
    public String deleteAuction(@PathVariable Long id) {
        auctionService.deleteAuction(id);
        return "Auction deleted successfully";
    }

    // GET BIDS FOR AN AUCTION
    @GetMapping("/{id}/bids")
    public List<Map<String, Object>> getBidHistory(@PathVariable Long id) {
        Auction auction = auctionService.getAuctionById(id).orElse(null);
        if (auction == null) {
            return new ArrayList<>();
        }
        List<Bid> bids = bidRepository.findByAuctionOrderByBidIdDesc(auction);
        List<Map<String, Object>> response = new ArrayList<>();
        for (Bid b : bids) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", b.getBidId().toString());
            map.put("auctionId", auction.getAuctionId().toString());
            map.put("userId", b.getBidder().getUserId().toString());
            map.put("username", b.getBidder().getEmail());
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

    // PLACE A BID ON AN AUCTION
    @PostMapping("/{id}/bids")
    public Map<String, Object> placeBid(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        
        Auction auction = auctionService.getAuctionById(id).orElse(null);
        if (auction == null) {
            response.put("success", false);
            response.put("message", "Auction not found");
            return response;
        }

        if (!"OPEN".equalsIgnoreCase(auction.getStatus()) && !"active".equalsIgnoreCase(auction.getStatus())) {
            response.put("success", false);
            response.put("message", "Auction is closed");
            return response;
        }

        // Strict Check: If the auction's end time is in the past, block bidding and set status to "ended"
        if (auction.getEndTime() != null && auction.getEndTime().isBefore(java.time.LocalDateTime.now())) {
            auction.setStatus("ended");
            auctionRepository.save(auction);
            response.put("success", false);
            response.put("message", "Auction has ended and is closed for bidding!");
            return response;
        }

        Object amountObj = body.get("amount");
        if (amountObj == null) {
            response.put("success", false);
            response.put("message", "Bid amount is required");
            return response;
        }
        
        double amount = ((Number) amountObj).doubleValue();

        if (amount <= auction.getCurrentHighBid()) {
            response.put("success", false);
            response.put("message", "Bid must be higher than current highest bid of $" + auction.getCurrentHighBid());
            return response;
        }

        // Find the bidder by email passed from the frontend
        User bidder = null;
        Object emailObj = body.get("email");
        if (emailObj != null) {
            bidder = userRepository.findByEmailIgnoreCase(emailObj.toString());
        }

        if (bidder == null) {
            List<User> users = userRepository.findAll();
            if (!users.isEmpty()) {
                bidder = users.get(0);
            } else {
                bidder = new User();
                bidder.setEmail("user@example.com");
                bidder.setPassword("password");
                bidder.setRole("USER");
                
                Wallet wallet = new Wallet();
                wallet.setBalance(10000.0);
                bidder.setWallet(wallet);
                
                bidder = userRepository.save(bidder);
            }
        }

        // Enforce that a seller cannot bid on their own listing (robust check using both UUID and case-insensitive email comparison)
        if (auction.getSeller() != null && bidder != null) {
            boolean isSameUser = false;
            if (auction.getSeller().getUserId() != null && bidder.getUserId() != null) {
                if (auction.getSeller().getUserId().equals(bidder.getUserId())) {
                    isSameUser = true;
                }
            }
            if (auction.getSeller().getEmail() != null && bidder.getEmail() != null) {
                if (auction.getSeller().getEmail().equalsIgnoreCase(bidder.getEmail())) {
                    isSameUser = true;
                }
            }
            if (isSameUser) {
                response.put("success", false);
                response.put("message", "Sellers are not allowed to bid on their own listings!");
                return response;
            }
        }

        if (bidder.getWallet() == null) {
            Wallet wallet = new Wallet();
            wallet.setBalance(10000.0);
            bidder.setWallet(wallet);
            bidder = userRepository.save(bidder);
        }

        // Enforce actual wallet balance check
        if (bidder.getWallet().getBalance() < amount) {
            response.put("success", false);
            response.put("message", "Insufficient wallet balance! Your balance is $" + bidder.getWallet().getBalance());
            return response;
        }

        // Deduct bid amount from user's wallet
        bidder.getWallet().setBalance(bidder.getWallet().getBalance() - amount);
        userRepository.save(bidder);

        // Anti-sniping logic: if bid placed in last 15 seconds, extend time by 30 seconds
        boolean timeExtended = false;
        if (auction.getEndTime() != null) {
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            long secondsRemaining = java.time.Duration.between(now, auction.getEndTime()).getSeconds();
            if (secondsRemaining > 0 && secondsRemaining < 15) {
                auction.setEndTime(now.plusSeconds(30));
                timeExtended = true;
            }
        }

        // Update auction highest bid
        auction.setCurrentHighBid(amount);
        auctionRepository.save(auction);

        // Save new bid
        Bid bid = new Bid();
        bid.setAmount(amount);
        bid.setBidder(bidder);
        bid.setAuction(auction);
        bid.setTimestamp(java.time.LocalDateTime.now());
        bidRepository.save(bid);

        response.put("success", true);
        response.put("message", timeExtended ? "Bid placed successfully! Time extended due to late bid." : "Bid placed successfully!");
        response.put("timeExtended", timeExtended);

        Map<String, Object> bidMap = new HashMap<>();
        bidMap.put("id", bid.getBidId().toString());
        bidMap.put("auctionId", auction.getAuctionId().toString());
        bidMap.put("userId", bidder.getUserId().toString());
        bidMap.put("username", bidder.getEmail());
        bidMap.put("amount", bid.getAmount());
        bidMap.put("timestamp", bid.getTimestamp().atZone(java.time.ZoneId.systemDefault()).toInstant().toString());
        response.put("bid", bidMap);

        return response;
    }
}