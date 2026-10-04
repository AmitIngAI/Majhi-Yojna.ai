package com.mahabenefit.backend.controller;

import com.mahabenefit.backend.dto.ApiResponse;
import com.mahabenefit.backend.dto.ProfileUpdateRequest;
import com.mahabenefit.backend.entity.User;
import com.mahabenefit.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse> getProfile(
            Authentication auth) {
        User user = userService.getUserByEmail(auth.getName());
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .data(user)
                .build());
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse> updateProfile(
            Authentication auth,
            @RequestBody ProfileUpdateRequest request) {
        User updated = userService.updateProfile(auth.getName(), request);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Profile updated successfully")
                .data(updated)
                .build());
    }
}