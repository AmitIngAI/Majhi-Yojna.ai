package com.mahabenefit.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String mobile;

    @Column(nullable = false)
    private String password;

    private Integer age;
    private String gender;

    @Column(name = "date_of_birth")
    private String dateOfBirth;

    private String occupation;

    @Column(name = "annual_income")
    private BigDecimal annualIncome;

    private String education;
    private String category;

    @Builder.Default
    private String state = "Maharashtra";

    private String district;
    private String taluka;
    private String city;
    private String pincode;
    private String address;

    @Column(name = "aadhaar_number")
    private String aadhaarNumber;

    @Column(name = "pan_number")
    private String panNumber;

    @Column(name = "ration_card")
    private String rationCard;

    @Builder.Default
    private String disability = "No";

    @Column(name = "disability_type")
    private String disabilityType;

    @Column(name = "disability_percentage")
    @Builder.Default
    private Integer disabilityPercentage = 0;

    @Column(name = "marital_status")
    private String maritalStatus;

    @Column(name = "widow_status")
    @Builder.Default
    private String widowStatus = "No";

    @Column(name = "senior_citizen")
    @Builder.Default
    private String seniorCitizen = "No";

    @Column(name = "employment_status")
    private String employmentStatus;

    @Column(name = "startup_status")
    @Builder.Default
    private String startupStatus = "No";

    @Column(name = "land_ownership")
    @Builder.Default
    private BigDecimal landOwnership = BigDecimal.ZERO;

    @Column(name = "house_ownership")
    @Builder.Default
    private String houseOwnership = "No";

    @Column(name = "rural_urban")
    @Builder.Default
    private String ruralUrban = "Urban";

    @Column(name = "family_size")
    @Builder.Default
    private Integer familySize = 1;

    @Column(name = "health_condition")
    private String healthCondition;

    @Column(name = "bpl_card")
    @Builder.Default
    private String bplCard = "No";

    @Builder.Default
    private String role = "USER";

    @Builder.Default
    private String status = "Active";

    @Column(name = "profile_complete")
    @Builder.Default
    private Boolean profileComplete = false;

    @Column(name = "profile_completion_percentage")
    @Builder.Default
    private Integer profileCompletionPercentage = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}