package com.mahabenefit.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {
    private String fullName;
    private String email;
    private String mobile;
    private String password;
    private String gender;
    private Integer age;
    private String state;
}