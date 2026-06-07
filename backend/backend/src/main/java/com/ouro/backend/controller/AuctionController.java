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
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

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

    @Autowired
    private JavaMailSender mailSender;

    // CREATE AUCTION - Allows Sellers to list new auctions
    @PostMapping("/create")
    public Auction createAuction(@RequestBody Map<String, Object> body) {
        // Map properties and associate seller by email
        Auction auction = new Auction();
        auction.setTitle((String) body.get("title"));
        auction.setStatus("pending");
        
        String imageUrl = (String) body.get("imageUrl");
        if (imageUrl != null) {
            auction.setImageUrl(imageUrl);
        }
        
        String imagesJson = (String) body.get("images");
        if (imagesJson != null) {
            auction.setImagesJson(imagesJson);
        }
        
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
                // Try parsing as ISO ZonedDateTime (usually sent by browsers as .toISOString())
                java.time.ZonedDateTime zdt = java.time.ZonedDateTime.parse(endTimeStr);
                auction.setEndTime(zdt.withZoneSameInstant(java.time.ZoneId.systemDefault()).toLocalDateTime());
            } catch (Exception e) {
                try {
                    if (endTimeStr.contains("T")) {
                        auction.setEndTime(java.time.LocalDateTime.parse(endTimeStr));
                    } else {
                        auction.setEndTime(java.time.LocalDateTime.now().plusDays(7));
                    }
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
            if (seller != null && "ADMIN".equalsIgnoreCase(seller.getRole())) {
                throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, 
                    "Administrators cannot create auctions."
                );
            }
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
            checkAndExpireAuction(a);

            // Exclude ended and pending auctions from the active list
            if ("ended".equalsIgnoreCase(a.getStatus()) || "pending".equalsIgnoreCase(a.getStatus())) {
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
                    ? a.getEndTime().atZone(java.time.ZoneId.systemDefault()).toInstant().toString()
                    : java.time.LocalDateTime.now().plusDays(7).atZone(java.time.ZoneId.systemDefault()).toInstant().toString()
                    );
            // FRONTEND SAFE FIELDS (so UI never breaks)
            map.put("description", "Direct from PostgreSQL database");
            map.put("category", "General");
            map.put("imageUrl", a.getImageUrl() != null ? a.getImageUrl() : "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600");
            map.put("images", a.getImagesJson());
            map.put("reported", a.getReported() != null && a.getReported());
            map.put("sellerId", "1");
            map.put("sellerName", "Unknown Seller");
            // safe timestamp for React
            //map.put("endTime", java.time.ZonedDateTime.now().plusDays(7).toString());

            response.add(map);
        }

        return response;
    }

    // GET ALL AUCTIONS FOR ADMIN (INCLUDING PENDING/ENDED)
    @GetMapping("/all")
    public List<Map<String, Object>> getAllAuctionsForAdmin() {
        List<Auction> auctions = auctionService.getAllAuctions();
        List<Map<String, Object>> response = new ArrayList<>();

        for (Auction a : auctions) {
            checkAndExpireAuction(a);

            Map<String, Object> map = new HashMap<>();

            // DB FIELDS
            map.put("id", a.getAuctionId());
            map.put("title", a.getTitle() != null ? a.getTitle() : "Untitled Auction");
            map.put("currentBid", a.getCurrentHighBid());
            map.put("startingBid", a.getCurrentHighBid());
            map.put("status", a.getStatus() != null ? a.getStatus() : "active");
            map.put("endTime",
                    a.getEndTime() != null
                    ? a.getEndTime().atZone(java.time.ZoneId.systemDefault()).toInstant().toString()
                    : java.time.LocalDateTime.now().plusDays(7).atZone(java.time.ZoneId.systemDefault()).toInstant().toString()
                    );
            // FRONTEND SAFE FIELDS (so UI never breaks)
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

    // GET BY ID
    @GetMapping("/{id}")
    public Map<String, Object> getAuctionById(@PathVariable Long id) {
        Auction a = auctionService.getAuctionById(id).orElse(null);
        if (a == null) {
            return null;
        }

        checkAndExpireAuction(a);

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
                    ? a.getEndTime().atZone(java.time.ZoneId.systemDefault()).toInstant().toString()
                    : java.time.LocalDateTime.now().plusDays(7).atZone(java.time.ZoneId.systemDefault()).toInstant().toString()
                    );
            // FRONTEND SAFE FIELDS (so UI never breaks)
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
    public Map<String, Object> deleteAuction(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        Auction auction = auctionService.getAuctionById(id).orElse(null);
        if (auction == null) {
            response.put("success", false);
            response.put("message", "Auction not found");
            return response;
        }

        // Delete associated bids first to avoid foreign key violations
        List<Bid> bids = bidRepository.findByAuctionOrderByAmountDesc(auction);
        if (bids != null && !bids.isEmpty()) {
            bidRepository.deleteAll(bids);
        }

        auctionService.deleteAuction(id);
        response.put("success", true);
        response.put("message", "Auction deleted successfully");
        return response;
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
        if (auction.getEndTime() != null && auction.getEndTime().isBefore(java.time.LocalDateTime.now()) && !"ended".equalsIgnoreCase(auction.getStatus())) {
            auction.setStatus("ended");
            auctionRepository.save(auction);
            refundLosers(auction);
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

        if (bidder != null && "ADMIN".equalsIgnoreCase(bidder.getRole())) {
            response.put("success", false);
            response.put("message", "Administrators are not permitted to bid on auctions!");
            return response;
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

        // Find previous bids placed by this user on this auction to calculate previous max bid
        List<Bid> previousBids = bidRepository.findByAuctionAndBidder(auction, bidder);
        double previousMaxBid = 0.0;
        for (Bid b : previousBids) {
            if (b.getAmount() > previousMaxBid) {
                previousMaxBid = b.getAmount();
            }
        }
        double deduction = amount - previousMaxBid;

        // Enforce actual wallet balance check using only the incremental deduction amount
        if (bidder.getWallet().getBalance() < deduction) {
            response.put("success", false);
            response.put("message", "Insufficient wallet balance! Your balance is $" + bidder.getWallet().getBalance());
            return response;
        }

        // Deduct only the difference from user's wallet
        bidder.getWallet().setBalance(bidder.getWallet().getBalance() - deduction);
        userRepository.save(bidder);

        // Action extension: if bid in last 60 sec of auction then extend time by 2 mins
        boolean timeExtended = false;
        if (auction.getEndTime() != null) {
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            long secondsRemaining = java.time.Duration.between(now, auction.getEndTime()).getSeconds();
            if (secondsRemaining > 0 && secondsRemaining < 60) {
                auction.setEndTime(auction.getEndTime().plusMinutes(2));
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
        response.put("message", timeExtended ? "Bid placed successfully! Auction extended by 2 minutes." : "Bid placed successfully!");
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

    // CLOSE AN AUCTION (ADMIN OR SELLER OWNER ONLY)
    @PutMapping("/{id}/close")
    public Map<String, Object> closeAuction(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        Auction auction = auctionService.getAuctionById(id).orElse(null);
        if (auction == null) {
            response.put("success", false);
            response.put("message", "Auction not found");
            return response;
        }

        // Validate that caller is either the seller or an administrator
        String email = null;
        if (body != null && body.containsKey("email")) {
            email = (String) body.get("email");
        }

        if (email == null) {
            response.put("success", false);
            response.put("message", "Authentication required to close auction.");
            return response;
        }

        User caller = userRepository.findByEmailIgnoreCase(email);
        if (caller == null) {
            response.put("success", false);
            response.put("message", "User not found.");
            return response;
        }

        boolean isSeller = auction.getSeller() != null && auction.getSeller().getUserId().equals(caller.getUserId());
        boolean isAdmin = "ADMIN".equalsIgnoreCase(caller.getRole());
        if (!isSeller && !isAdmin) {
            response.put("success", false);
            response.put("message", "You are not authorized to close this auction!");
            return response;
        }

        if (!"ended".equalsIgnoreCase(auction.getStatus())) {
            auction.setStatus("ended");
            auctionRepository.save(auction);
            refundLosers(auction);
        }

        response.put("success", true);
        response.put("message", "Auction closed successfully!");
        return response;
    }

    // CANCEL AN AUCTION (SELLER ONLY) — refunds ALL bidders
    @PutMapping("/{id}/cancel")
    public Map<String, Object> cancelAuction(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        Auction auction = auctionService.getAuctionById(id).orElse(null);
        if (auction == null) {
            response.put("success", false);
            response.put("message", "Auction not found.");
            return response;
        }

        // Only the seller may cancel
        String email = null;
        if (body != null && body.containsKey("email")) {
            email = (String) body.get("email");
        }
        if (email == null) {
            response.put("success", false);
            response.put("message", "Authentication required to cancel auction.");
            return response;
        }

        User caller = userRepository.findByEmailIgnoreCase(email);
        if (caller == null) {
            response.put("success", false);
            response.put("message", "User not found.");
            return response;
        }

        boolean isSeller = auction.getSeller() != null && auction.getSeller().getUserId().equals(caller.getUserId());
        if (!isSeller) {
            response.put("success", false);
            response.put("message", "Only the seller can cancel this auction.");
            return response;
        }

        if ("ended".equalsIgnoreCase(auction.getStatus()) || "cancelled".equalsIgnoreCase(auction.getStatus())) {
            response.put("success", false);
            response.put("message", "This auction is already closed and cannot be cancelled.");
            return response;
        }

        // Mark as cancelled
        auction.setStatus("cancelled");
        auctionRepository.save(auction);

        // Refund EVERY bidder their highest bid amount
        refundAllBidders(auction);

        response.put("success", true);
        response.put("message", "Auction cancelled. All bids have been fully refunded.");
        return response;
    }

    // APPROVE AN AUCTION (ADMIN ONLY)
    @PutMapping("/{id}/approve")
    public Map<String, Object> approveAuction(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        Auction auction = auctionService.getAuctionById(id).orElse(null);
        if (auction == null) {
            response.put("success", false);
            response.put("message", "Auction not found");
            return response;
        }

        auction.setStatus("active");
        // Reset endTime only if it is null or in the past
        if (auction.getEndTime() == null || auction.getEndTime().isBefore(java.time.LocalDateTime.now())) {
            auction.setEndTime(java.time.LocalDateTime.now().plusDays(7));
        }
        auctionRepository.save(auction);

        response.put("success", true);
        response.put("message", "Auction approved and is now active!");
        return response;
    }

    // GET AUDIT LOGS FOR AN AUCTION (ADMIN ONLY)
    @GetMapping("/{id}/audit")
    public List<Map<String, Object>> getAuditLog(@PathVariable Long id) {
        // Return full bid history for audit trail
        return getBidHistory(id);
    }

    private void refundLosers(Auction auction) {
        List<Bid> bids = bidRepository.findByAuctionOrderByBidIdDesc(auction);
        if (bids.isEmpty()) {
            return;
        }
        
        // The newest bid is the highest bid (since bid amounts must increase)
        Bid winningBid = bids.get(0);
        UUID winnerId = winningBid.getBidder().getUserId();
        
        // Track the highest bid for each loser
        Map<UUID, Double> loserMaxBids = new HashMap<>();
        Map<UUID, User> loserEntities = new HashMap<>();
        
        for (Bid b : bids) {
            User bidder = b.getBidder();
            if (bidder.getUserId().equals(winnerId)) {
                continue; // skip the winner
            }
            
            UUID bidderId = bidder.getUserId();
            double bidAmount = b.getAmount();
            
            if (!loserMaxBids.containsKey(bidderId) || bidAmount > loserMaxBids.get(bidderId)) {
                loserMaxBids.put(bidderId, bidAmount);
                loserEntities.put(bidderId, bidder);
            }
        }
        
        // Refund each loser's highest bid to their wallet
        for (Map.Entry<UUID, Double> entry : loserMaxBids.entrySet()) {
            UUID bidderId = entry.getKey();
            double refundAmount = entry.getValue();
            User bidder = loserEntities.get(bidderId);
            
            if (bidder.getWallet() != null) {
                bidder.getWallet().setBalance(bidder.getWallet().getBalance() + refundAmount);
                userRepository.save(bidder);
                System.out.println("Refunded $" + refundAmount + " to user: " + bidder.getEmail());
            }
        }
    }

    // Refund EVERY bidder's highest bid — used on seller cancellation
    private void refundAllBidders(Auction auction) {
        List<Bid> bids = bidRepository.findByAuctionOrderByBidIdDesc(auction);
        if (bids.isEmpty()) {
            return;
        }

        // Track each bidder's highest bid amount
        Map<UUID, Double> maxBids = new HashMap<>();
        Map<UUID, User> bidderEntities = new HashMap<>();

        for (Bid b : bids) {
            User bidder = b.getBidder();
            UUID bidderId = bidder.getUserId();
            double bidAmount = b.getAmount();

            if (!maxBids.containsKey(bidderId) || bidAmount > maxBids.get(bidderId)) {
                maxBids.put(bidderId, bidAmount);
                bidderEntities.put(bidderId, bidder);
            }
        }

        // Refund everyone (including whoever had the highest bid)
        for (Map.Entry<UUID, Double> entry : maxBids.entrySet()) {
            UUID bidderId = entry.getKey();
            double refundAmount = entry.getValue();
            User bidder = bidderEntities.get(bidderId);

            if (bidder.getWallet() != null) {
                bidder.getWallet().setBalance(bidder.getWallet().getBalance() + refundAmount);
                userRepository.save(bidder);
                System.out.println("[cancelAuction] Refunded $" + refundAmount + " to user: " + bidder.getEmail());
            }
        }
    }

    private void checkAndExpireAuction(Auction a) {

        boolean expired = a.getEndTime() != null && a.getEndTime().isBefore(java.time.LocalDateTime.now());
        if (expired && !"ended".equalsIgnoreCase(a.getStatus())) {
            a.setStatus("ended");
            auctionRepository.save(a);
            refundLosers(a);
        }
    }

    // REPORT A BID
    @PostMapping("/bids/{bidId}/report")
    public Map<String, Object> reportBid(@PathVariable Long bidId, @RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        
        Bid bid = bidRepository.findById(bidId).orElse(null);
        if (bid == null) {
            response.put("success", false);
            response.put("message", "Bid not found.");
            return response;
        }

        Object emailObj = body.get("email");
        if (emailObj == null) {
            response.put("success", false);
            response.put("message", "Reporter email is required.");
            return response;
        }

        User reporter = userRepository.findByEmailIgnoreCase(emailObj.toString());
        if (reporter == null) {
            response.put("success", false);
            response.put("message", "Reporter account not found.");
            return response;
        }

        // Rule: The bidder cannot report their own bid
        if (bid.getBidder() != null && bid.getBidder().getUserId().equals(reporter.getUserId())) {
            response.put("success", false);
            response.put("message", "You cannot report your own bid!");
            return response;
        }

        // Rule: The seller of the auction cannot report bids on their own auction
        Auction auction = bid.getAuction();
        if (auction != null && auction.getSeller() != null && auction.getSeller().getUserId().equals(reporter.getUserId())) {
            response.put("success", false);
            response.put("message", "As the seller of this auction, you cannot report bids on your own listing.");
            return response;
        }

        bid.setReported(true);
        bidRepository.save(bid);

        response.put("success", true);
        response.put("message", "Bid reported successfully.");
        return response;
    }

    // GET ALL REPORTED BIDS (ADMIN ONLY)
    @GetMapping("/bids/reported")
    public List<Map<String, Object>> getReportedBids() {
        List<Bid> reportedBids = bidRepository.findByReportedTrue();
        List<Map<String, Object>> response = new ArrayList<>();
        
        for (Bid b : reportedBids) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", b.getBidId().toString());
            map.put("amount", b.getAmount());
            if (b.getTimestamp() != null) {
                map.put("timestamp", b.getTimestamp().atZone(java.time.ZoneId.systemDefault()).toInstant().toString());
            } else {
                map.put("timestamp", java.time.Instant.now().toString());
            }
            
            if (b.getBidder() != null) {
                map.put("userId", b.getBidder().getUserId().toString());
                map.put("username", b.getBidder().getEmail());
            } else {
                map.put("userId", "");
                map.put("username", "Unknown");
            }
            
            if (b.getAuction() != null) {
                map.put("auctionId", b.getAuction().getAuctionId().toString());
                map.put("auctionTitle", b.getAuction().getTitle());
            } else {
                map.put("auctionId", "");
                map.put("auctionTitle", "Unknown");
            }
            response.add(map);
        }
        return response;
    }

    // DISMISS REPORT (ADMIN ONLY)
    @PutMapping("/bids/{bidId}/dismiss-report")
    public Map<String, Object> dismissReport(@PathVariable Long bidId) {
        Map<String, Object> response = new HashMap<>();
        Bid bid = bidRepository.findById(bidId).orElse(null);
        if (bid == null) {
            response.put("success", false);
            response.put("message", "Bid not found.");
            return response;
        }

        bid.setReported(false);
        bidRepository.save(bid);

        response.put("success", true);
        response.put("message", "Report dismissed successfully.");
        return response;
    }

    // DELETE/VOID BID (ADMIN ONLY)
    @DeleteMapping("/bids/{bidId}")
    public Map<String, Object> deleteBid(@PathVariable Long bidId) {
        Map<String, Object> response = new HashMap<>();
        Bid bid = bidRepository.findById(bidId).orElse(null);
        if (bid == null) {
            response.put("success", false);
            response.put("message", "Bid not found.");
            return response;
        }

        Auction auction = bid.getAuction();
        User bidder = bid.getBidder();
        double refundAmount = bid.getAmount();

        // 1. Refund the bidder
        if (bidder != null && bidder.getWallet() != null) {
            bidder.getWallet().setBalance(bidder.getWallet().getBalance() + refundAmount);
            userRepository.save(bidder);
        }

        // 2. Recalculate highest bid if this bid is currently the high bid
        boolean isHighBid = false;
        if (auction != null && auction.getCurrentHighBid() == bid.getAmount()) {
            isHighBid = true;
        }

        // 3. Delete the bid
        bidRepository.delete(bid);

        // 4. Update the high bid if it was the highest
        if (isHighBid && auction != null) {
            List<Bid> remainingBids = bidRepository.findByAuctionOrderByAmountDesc(auction);
            if (!remainingBids.isEmpty()) {
                auction.setCurrentHighBid(remainingBids.get(0).getAmount());
            } else {
                // No bids left, set current high bid back to starting bid (or 0.0)
                auction.setCurrentHighBid(0.0);
            }
            auctionRepository.save(auction);
        }

        response.put("success", true);
        response.put("message", "Bid deleted and bidder refunded successfully.");
        return response;
    }

    // REPORT AN AUCTION
    @PostMapping("/{id}/report")
    public Map<String, Object> reportAuction(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        Auction auction = auctionService.getAuctionById(id).orElse(null);
        if (auction == null) {
            response.put("success", false);
            response.put("message", "Auction not found.");
            return response;
        }
        String email = (String) body.get("email");
        if (email == null) {
            response.put("success", false);
            response.put("message", "Reporter email is required.");
            return response;
        }
        User reporter = userRepository.findByEmailIgnoreCase(email);
        if (reporter == null) {
            response.put("success", false);
            response.put("message", "Reporter account not found.");
            return response;
        }
        if (auction.getSeller() != null && auction.getSeller().getUserId().equals(reporter.getUserId())) {
            response.put("success", false);
            response.put("message", "You cannot report your own auction!");
            return response;
        }
        auction.setReported(true);
        auctionRepository.save(auction);

        // ── Send alert email to admin ────────────────────────────────
        try {
            String auctionId = auction.getAuctionId().toString();
            String sellerId = (auction.getSeller() != null && auction.getSeller().getUserId() != null)
                    ? auction.getSeller().getUserId().toString()
                    : "Unknown";
            String sellerEmail = (auction.getSeller() != null && auction.getSeller().getEmail() != null)
                    ? auction.getSeller().getEmail()
                    : "Unknown";

            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo("admin@gmail.com");
            mail.setSubject("[Ouro Auction] Auction Reported — ID #" + auctionId);
            mail.setText(
                "An auction has been reported and requires your review.\n\n" +
                "Auction ID  : " + auctionId + "\n" +
                "Auction Title: " + (auction.getTitle() != null ? auction.getTitle() : "N/A") + "\n" +
                "Seller ID   : " + sellerId + "\n" +
                "Seller Email: " + sellerEmail + "\n" +
                "Reported by : " + email + "\n\n" +
                "Please log in to the admin dashboard to review this report."
            );
            mailSender.send(mail);
        } catch (Exception ex) {
            // Log but do not fail the request if email delivery fails
            System.err.println("[reportAuction] Failed to send admin email: " + ex.getMessage());
        }
        // ─────────────────────────────────────────────────────────────

        response.put("success", true);
        response.put("message", "Auction reported successfully.");
        return response;
    }

    // DISMISS AUCTION REPORT (ADMIN ONLY)
    @PutMapping("/{id}/dismiss-report")
    public Map<String, Object> dismissAuctionReport(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        Auction auction = auctionService.getAuctionById(id).orElse(null);
        if (auction == null) {
            response.put("success", false);
            response.put("message", "Auction not found.");
            return response;
        }
        auction.setReported(false);
        auctionRepository.save(auction);
        response.put("success", true);
        response.put("message", "Auction report dismissed successfully.");
        return response;
    }

    // GET ALL REPORTED AUCTIONS (ADMIN ONLY)
    @GetMapping("/reported")
    public List<Map<String, Object>> getReportedAuctions() {
        List<Auction> reportedAuctions = auctionRepository.findByReportedTrue();
        List<Map<String, Object>> response = new ArrayList<>();
        for (Auction a : reportedAuctions) {
            checkAndExpireAuction(a);
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getAuctionId());
            map.put("title", a.getTitle() != null ? a.getTitle() : "Untitled Auction");
            map.put("currentBid", a.getCurrentHighBid());
            map.put("startingBid", a.getCurrentHighBid());
            map.put("status", a.getStatus() != null ? a.getStatus() : "active");
            map.put("endTime",
                    a.getEndTime() != null
                    ? a.getEndTime().atZone(java.time.ZoneId.systemDefault()).toInstant().toString()
                    : java.time.LocalDateTime.now().plusDays(7).atZone(java.time.ZoneId.systemDefault()).toInstant().toString()
                    );
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
}