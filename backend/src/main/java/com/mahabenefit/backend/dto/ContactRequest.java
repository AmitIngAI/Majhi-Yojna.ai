package com.mahabenefit.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactRequest {

    private String name;
    private String email;
    private String phone;
    private String subject;
    private String message;
}