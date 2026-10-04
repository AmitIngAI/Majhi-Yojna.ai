package com.mahabenefit.backend.service;

import com.mahabenefit.backend.dto.AuthResponse;
import com.mahabenefit.backend.dto.LoginRequest;
import com.mahabenefit.backend.dto.RegisterRequest;
import com.mahabenefit.backend.entity.User;
import com.mahabenefit.backend.repository.UserRepository;
import com.mahabenefit.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private ActivityService activityService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return AuthResponse.builder().message("Email already registered").build();
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .mobile(request.getMobile())
                .password(passwordEncoder.encode(request.getPassword()))
                .gender(request.getGender())
                .age(request.getAge())
                .state("Maharashtra")
                .role("USER")
                .status("Active")
                .profileComplete(false)
                .build();

        userRepository.save(user);

        activityService.logActivity(
            "USER_REGISTERED",
            "New User Registered",
            user.getFullName(),
            user.getFullName(),
            user.getId()
        );

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .token(token)
                .message("Registration successful")
                .role(user.getRole())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .userId(user.getId())
                .profileComplete(false)
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            return AuthResponse.builder().message("Invalid email or password").build();
        }

        if ("Blocked".equalsIgnoreCase(user.getStatus())) {
            return AuthResponse.builder()
                    .message("🚫 Your account has been blocked by admin. Please contact support for assistance.")
                    .build();
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return AuthResponse.builder().message("Invalid email or password").build();
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .token(token)
                .message("Login successful")
                .role(user.getRole())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .userId(user.getId())
                .profileComplete(user.getProfileComplete())
                .build();
    }

    public String changePassword(String email, String oldPassword, String newPassword) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return "User not found";
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return "Old password is incorrect";
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return "success";
    }

    public String updateAdminProfile(String email, String newName, String newMobile) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return "User not found";
        if (newName != null && !newName.isEmpty()) user.setFullName(newName);
        if (newMobile != null && !newMobile.isEmpty()) user.setMobile(newMobile);
        userRepository.save(user);
        return "success";
    }
}