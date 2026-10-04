package com.mahabenefit.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "applied_schemes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppliedScheme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "scheme_id", nullable = false)
    private Long schemeId;

    @Builder.Default
    private String status = "Pending";

    @Column(name = "applied_at")
    private LocalDateTime appliedAt;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @PrePersist
    protected void onCreate() {
        if (appliedAt == null) {
            appliedAt = LocalDateTime.now();
        }
    }
}