package com.mahabenefit.backend.controller;

import com.mahabenefit.backend.dto.ApiResponse;
import com.mahabenefit.backend.dto.AuthResponse;
import com.mahabenefit.backend.dto.LoginRequest;
import com.mahabenefit.backend.dto.RegisterRequest;
import com.mahabenefit.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "OK"));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse> changePassword(
            Authentication auth,
            @RequestBody Map<String, String> body) {
        String result = authService.changePassword(
                auth.getName(),
                body.get("oldPassword"),
                body.get("newPassword")
        );
        return ResponseEntity.ok(ApiResponse.builder()
                .success(result.equals("success"))
                .message(result.equals("success") ? "Password changed successfully" : result)
                .build());
    }

    @PutMapping("/update-profile")
    public ResponseEntity<ApiResponse> updateProfile(
            Authentication auth,
            @RequestBody Map<String, String> body) {
        String result = authService.updateAdminProfile(
                auth.getName(),
                body.get("fullName"),
                body.get("mobile")
        );
        return ResponseEntity.ok(ApiResponse.builder()
                .success(result.equals("success"))
                .message(result.equals("success") ? "Profile updated successfully" : result)
                .build());
    }
}