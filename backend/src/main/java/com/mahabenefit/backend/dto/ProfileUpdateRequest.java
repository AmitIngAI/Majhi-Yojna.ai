package com.mahabenefit.backend.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileUpdateRequest {

    // Personal Info
    private String fullName;
    private String email;
    private String mobile;
    private String phone;
    private Integer age;
    private String gender;
    private String dateOfBirth;

    // Address
    private String address;
    private String district;
    private String taluka;
    private String city;
    private String pincode;
    private String state;
    private String ruralUrban;

    // Category & Documents
    private String category;
    private String aadhaarNumber;
    private String panNumber;
    private String rationCard;
    private String bplCard;

    // Employment
    private String occupation;
    private BigDecimal annualIncome;
    private String employmentStatus;
    private String education;
    private String educationLevel;

    // Family
    private String maritalStatus;
    private Integer familySize;
    private Integer familyMembers;
    private String widowStatus;
    private String seniorCitizen;
    private String disability;
    private Integer disabilityPercentage;
    private String disabilityType;

    // Additional
    private BigDecimal landOwnership;
    private String houseOwnership;
    private String houseStatus;
    private String startupStatus;
    private String healthCondition;
}