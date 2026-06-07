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

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "images_json", columnDefinition = "TEXT")
    private String imagesJson;

    private Boolean reported = false;


    


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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getImagesJson() {
        return imagesJson;
    }

    public void setImagesJson(String imagesJson) {
        this.imagesJson = imagesJson;
    }

    public Boolean getReported() {
        return reported != null && reported;
    }

    public void setReported(Boolean reported) {
        this.reported = reported;
    }
}