package com.ouro.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "bids")
public class Bid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bidId;

    private double amount;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User bidder;

    @ManyToOne
    @JoinColumn(name = "auction_id")
    private Auction auction;

    private java.time.LocalDateTime timestamp = java.time.LocalDateTime.now();

    private Boolean reported = false;

    public Bid() {
    }

    public boolean isReported() {
        return reported != null && reported;
    }

    public void setReported(Boolean reported) {
        this.reported = reported;
    }

    public java.time.LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(java.time.LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Long getBidId() {
        return bidId;
    }

    public void setBidId(Long bidId) {
        this.bidId = bidId;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public User getBidder() {
        return bidder;
    }

    public void setBidder(User bidder) {
        this.bidder = bidder;
    }

    public Auction getAuction() {
        return auction;
    }

    public void setAuction(Auction auction) {
        this.auction = auction;
    }
}
