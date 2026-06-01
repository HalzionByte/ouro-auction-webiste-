package com.ouro.backend.repository;

import com.ouro.backend.entity.Auction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuctionRepository
        extends JpaRepository<Auction, Long> {

    // Find auctions created by a specific seller ordered by newest
    java.util.List<Auction> findBySellerOrderByAuctionIdDesc(com.ouro.backend.entity.User seller);
}