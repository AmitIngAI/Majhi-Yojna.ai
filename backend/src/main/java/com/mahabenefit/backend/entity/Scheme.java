package com.mahabenefit.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "schemes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Scheme {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "scheme_name", nullable = false)
    private String schemeName;
    
    @Column(nullable = false)
    private String category;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String benefits;
    
    @Column(name = "eligibility_criteria", columnDefinition = "TEXT")
    private String eligibilityCriteria;
    
    @Column(name = "required_documents", columnDefinition = "TEXT")
    private String requiredDocuments;
    
    @Column(name = "application_process", columnDefinition = "TEXT")
    private String applicationProcess;
    
    @Column(name = "official_link", length = 500)
    private String officialLink;
    
    @Column(name = "age_min")
    @Builder.Default
    private Integer ageMin = 0;
    
    @Column(name = "age_max")
    @Builder.Default
    private Integer ageMax = 100;
    
    @Column(name = "income_limit")
    @Builder.Default
    private BigDecimal incomeLimit = BigDecimal.ZERO;
    
    @Column(name = "gender_required")
    @Builder.Default
    private String genderRequired = "All";
    
    @Column(name = "category_required")
    @Builder.Default
    private String categoryRequired = "All";
    
    @Column(name = "occupation_required")
    @Builder.Default
    private String occupationRequired = "Any";
    
    @Column(name = "education_required")
    @Builder.Default
    private String educationRequired = "Any";
    
    @Column(name = "disability_required")
    @Builder.Default
    private String disabilityRequired = "Any";
    
    @Column(name = "marital_status_required")
    @Builder.Default
    private String maritalStatusRequired = "Any";
    
    @Column(name = "widow_required")
    @Builder.Default
    private String widowRequired = "Any";
    
    @Column(name = "senior_citizen_required")
    @Builder.Default
    private String seniorCitizenRequired = "Any";
    
    @Column(name = "employment_status_required")
    @Builder.Default
    private String employmentStatusRequired = "Any";
    
    @Column(name = "startup_required")
    @Builder.Default
    private String startupRequired = "Any";
    
    @Column(name = "land_required")
    @Builder.Default
    private BigDecimal landRequired = BigDecimal.ZERO;
    
    @Column(name = "house_status_required")
    @Builder.Default
    private String houseStatusRequired = "Any";
    
    @Column(name = "rural_urban_required")
    @Builder.Default
    private String ruralUrbanRequired = "Any";
    
    @Column(name = "bpl_required")
    @Builder.Default
    private String bplRequired = "Any";
    
    @Column(name = "training_type")
    private String trainingType;
    
    @Column(name = "startup_type")
    private String startupType;
    
    @Column(name = "special_conditions", columnDefinition = "TEXT")
    private String specialConditions;
    
    @Column(name = "health_coverage", columnDefinition = "TEXT")
    private String healthCoverage;
    
    @Builder.Default
    private String state = "Maharashtra";
    
    @Builder.Default
    private String status = "Active";
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}