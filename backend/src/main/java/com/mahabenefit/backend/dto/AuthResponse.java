package com.mahabenefit.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String message;
    private String role;
    private String email;
    private String fullName;
    private Long userId;
    private Boolean profileComplete;
}