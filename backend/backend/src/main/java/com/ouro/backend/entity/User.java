package com.ouro.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.CascadeType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.JoinTable;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.UUID;
import java.util.List;
import java.util.ArrayList;


@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue
    private UUID userId;

    private String email;
    private String password;
    private String role;
    // Added name field to store user's full name
    private String name;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "wallet_id")
    private Wallet wallet;

    @OneToMany(mappedBy = "seller", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Auction> auctions = new ArrayList<>();

    @OneToMany(mappedBy = "bidder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Bid> bids = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_watchlist",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "auction_id")
    )
    @JsonIgnore
    private List<Auction> watchlist = new ArrayList<>();

    public User() {
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    // Getter and Setter for the name property
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Wallet getWallet() {
        return wallet;
    }

    public void setWallet(Wallet wallet) {
        this.wallet = wallet;
    }

    public List<Auction> getAuctions() {
        return auctions;
    }

    public void setAuctions(List<Auction> auctions) {
        this.auctions = auctions;
    }

    public List<Bid> getBids() {
        return bids;
    }

    public void setBids(List<Bid> bids) {
        this.bids = bids;
    }

    public List<Auction> getWatchlist() {
        return watchlist;
    }

    public void setWatchlist(List<Auction> watchlist) {
        this.watchlist = watchlist;
    }
}