package com.ouro.backend.config;

import com.ouro.backend.entity.Auction;
import com.ouro.backend.entity.User;
import com.ouro.backend.entity.Wallet;
import com.ouro.backend.repository.AuctionRepository;
import com.ouro.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private jakarta.persistence.EntityManager entityManager;

    @Override
    @jakarta.transaction.Transactional
    public void run(String... args) throws Exception {
        System.out.println("Checking/seeding demo accounts...");

        // 1. Seed Admin
        User admin = userRepository.findByEmailIgnoreCase("admin@ouro.com");
        if (admin == null) {
            System.out.println("Seeding admin account admin@ouro.com...");
            admin = new User();
            admin.setEmail("admin@ouro.com");
            admin.setPassword("admin123");
            admin.setRole("ADMIN");
            admin.setName("Ouro Administrator");
            Wallet adminWallet = new Wallet();
            adminWallet.setBalance(50000.0);
            admin.setWallet(adminWallet);
            admin = userRepository.save(admin);
        }

        // 2. Seed Seller
        User seller = userRepository.findByEmailIgnoreCase("seller@ouro.com");
        if (seller == null) {
            System.out.println("Seeding seller account seller@ouro.com...");
            seller = new User();
            seller.setEmail("seller@ouro.com");
            seller.setPassword("seller123");
            seller.setRole("SELLER");
            seller.setName("Sample Seller");
            Wallet sellerWallet = new Wallet();
            sellerWallet.setBalance(10000.0);
            seller.setWallet(sellerWallet);
            seller = userRepository.save(seller);
        }

        // 3. Seed Bidders
        for (int i = 1; i <= 4; i++) {
            String email = "bidder" + i + "@ouro.com";
            User bidder = userRepository.findByEmailIgnoreCase(email);
            if (bidder == null) {
                System.out.println("Seeding bidder account " + email + "...");
                bidder = new User();
                bidder.setEmail(email);
                bidder.setPassword("bidder123");
                bidder.setRole("USER");
                bidder.setName("Bidder " + i);
                Wallet bidderWallet = new Wallet();
                bidderWallet.setBalance(5000.0);
                bidder.setWallet(bidderWallet);
                userRepository.save(bidder);
            }
        }

        // 4. Seed Sample Auctions if empty
        if (auctionRepository.count() == 0) {
            System.out.println("Seeding sample auctions...");
            Auction auction1 = new Auction();
            auction1.setTitle("Vintage Leica M6 Camera");
            auction1.setStatus("active");
            auction1.setCurrentHighBid(800.0);
            auction1.setEndTime(LocalDateTime.now().plusDays(2));
            auction1.setSeller(seller);
            auctionRepository.save(auction1);

            Auction auction2 = new Auction();
            auction2.setTitle("MacBook Pro 16\" M3 Max");
            auction2.setStatus("active");
            auction2.setCurrentHighBid(2500.0);
            auction2.setEndTime(LocalDateTime.now().plusHours(4));
            auction2.setSeller(seller);
            auctionRepository.save(auction2);

            Auction auction3 = new Auction();
            auction3.setTitle("Rolex Submariner Watch");
            auction3.setStatus("active");
            auction3.setCurrentHighBid(7000.0);
            auction3.setEndTime(LocalDateTime.now().plusMinutes(10));
            auction3.setSeller(seller);
            auctionRepository.save(auction3);
        }

        System.out.println("Database seeding check completed successfully!");

        // 5. Synchronize sequences to prevent duplicate key constraint violations when creating new records
        syncSequences();
    }

    private void syncSequences() {
        System.out.println("Synchronizing database sequences...");
        try {
            entityManager.createNativeQuery(
                "SELECT setval('auctions_auction_id_seq', COALESCE((SELECT MAX(auction_id) FROM auctions), 0) + 1, false)"
            ).getSingleResult();
            System.out.println("PostgreSQL auctions sequence synchronized.");
        } catch (Exception e) {
            System.out.println("Failed to sync auctions sequence: " + e.getMessage());
        }

        try {
            entityManager.createNativeQuery(
                "SELECT setval('bids_bid_id_seq', COALESCE((SELECT MAX(bid_id) FROM bids), 0) + 1, false)"
            ).getSingleResult();
            System.out.println("PostgreSQL bids sequence synchronized.");
        } catch (Exception e) {
            System.out.println("Failed to sync bids sequence: " + e.getMessage());
        }

        try {
            entityManager.createNativeQuery(
                "SELECT setval('wallet_wallet_id_seq', COALESCE((SELECT MAX(wallet_id) FROM wallet), 0) + 1, false)"
            ).getSingleResult();
            System.out.println("PostgreSQL wallet sequence synchronized.");
        } catch (Exception e) {
            System.out.println("Failed to sync wallet sequence: " + e.getMessage());
        }
    }
}
