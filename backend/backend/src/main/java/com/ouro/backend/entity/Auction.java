package com.ouro.backend.entity;
import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "auctions")
public class Auction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long auctionId;


    private String title;

    private String status;

    private double currentHighBid;

    @Column(name = "end_time")
    private LocalDateTime endTime;
    
    @ManyToOne
    @JoinColumn(name = "seller_id")
    private User seller;


    


    public Auction() {
    }

    public Long getAuctionId() {
        return auctionId;
    }

    public void setAuctionId(Long auctionId) {
        this.auctionId = auctionId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public double getCurrentHighBid() {
        return currentHighBid;
    }

    public void setCurrentHighBid(double currentHighBid) {
        this.currentHighBid = currentHighBid;
    }

    public User getSeller() {
    return seller;
    }

    public void setSeller(User seller) {
        this.seller = seller;
    }
    public LocalDateTime getEndTime() {
    return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
    this.endTime = endTime;
    }
}