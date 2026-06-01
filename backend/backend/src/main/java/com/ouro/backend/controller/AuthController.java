package com.ouro.backend.controller;

import com.ouro.backend.entity.User;
import com.ouro.backend.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserService userService;

    // REGISTER
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.register(user);
    }

    // LOGIN
    @PostMapping("/login")
    public String login(@RequestBody User user) {

        User existingUser = userService.findByEmail(user.getEmail());

        if (existingUser == null) {
            return "User not found";
        }

        if (!existingUser.getPassword().equals(user.getPassword())) {
            return "Wrong password";
        }

        return "Login successful";
    }

    // GET PROFILE - Retrieves the full user profile entity (including wallet) by email
    @GetMapping("/profile")
    public User getProfile(@RequestParam String email) {
        return userService.findByEmail(email);
    }

    // UPDATE ROLE - Dynamically toggles role between USER and SELLER, persist and return the updated user
    @PutMapping("/update-role")
    public User updateRole(@RequestBody java.util.Map<String, String> payload) {
        String email = payload.get("email");
        String role = payload.get("role");
        User user = userService.findByEmail(email);
        if (user != null) {
            user.setRole(role);
            return userService.register(user);
        }
        return null;
    }
}
// idk wth is going on just copy pasted from gpt