package com.ouro.backend.service;

import com.ouro.backend.entity.Auction;
import com.ouro.backend.repository.AuctionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuctionService {

    @Autowired
    private AuctionRepository auctionRepository;

    public Auction createAuction(Auction auction) {
        return auctionRepository.save(auction);
    }

    public List<Auction> getAllAuctions() {
        return auctionRepository.findAll();
    }

    public java.util.Optional<Auction> getAuctionById(Long id) {
        return auctionRepository.findById(id);
    }

    public void deleteAuction(Long id) {
        auctionRepository.deleteById(id);
    }
}