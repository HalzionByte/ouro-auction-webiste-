package com.ouro.backend.service;

import com.ouro.backend.entity.Auction;
import com.ouro.backend.entity.Bid;
import com.ouro.backend.entity.User;
import com.ouro.backend.repository.AuctionRepository;
import com.ouro.backend.repository.BidRepository;
import com.ouro.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BidService {

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private UserRepository userRepository;

    public String placeBid(Bid bid) {

        Auction auction = auctionRepository
                .findById(bid.getAuction().getAuctionId())
                .orElse(null);

        User bidder = userRepository
                .findById(bid.getBidder().getUserId())
                .orElse(null);

        if (auction == null || bidder == null) {
            return "Auction or User not found";
        }

        if (!auction.getStatus().equals("OPEN")) {
            return "Auction is closed";
        }

        if (bid.getAmount() <= auction.getCurrentHighBid()) {
            return "Bid must be higher than current highest bid";
        }

        if (bidder.getWallet().getBalance() < bid.getAmount()) {
            return "Insufficient wallet balance";
        }

        bidder.getWallet().setBalance(
                bidder.getWallet().getBalance() - bid.getAmount()
        );

        auction.setCurrentHighBid(bid.getAmount());

        bidRepository.save(bid);

        auctionRepository.save(auction);

        userRepository.save(bidder);

        return "Bid placed successfully";
    }
}