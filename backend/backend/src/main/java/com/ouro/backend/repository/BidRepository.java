package com.ouro.backend.repository;

import com.ouro.backend.entity.Auction;
import com.ouro.backend.entity.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findByAuctionOrderByBidIdDesc(Auction auction);
    
    // Find bids placed by a specific user ordered by newest
    List<Bid> findByBidderOrderByBidIdDesc(com.ouro.backend.entity.User bidder);

    List<Bid> findByAuctionAndBidder(Auction auction, com.ouro.backend.entity.User bidder);

    List<Bid> findByReportedTrue();

    List<Bid> findByAuctionOrderByAmountDesc(Auction auction);
}
