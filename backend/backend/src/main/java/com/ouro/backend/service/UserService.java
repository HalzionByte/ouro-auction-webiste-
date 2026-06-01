package com.ouro.backend.service;

import com.ouro.backend.entity.User;
import com.ouro.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User register(User user) {
        // Every registered user automatically receives a Wallet with a starting balance of $10,000.00
        if (user.getWallet() == null) {
            com.ouro.backend.entity.Wallet wallet = new com.ouro.backend.entity.Wallet();
            wallet.setBalance(10000.0);
            user.setWallet(wallet);
        }
        return userRepository.save(user);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email);
    }
}