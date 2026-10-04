package com.mahabenefit.backend.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EligibilityResult {
    private Long schemeId;
    private String schemeCode;
    private String schemeName;
    private String description;
    private String category;
    private String benefits;
    private String officialLink;
    private Double matchScore;
    private Double mlScore;
    private List<String> matchedRules;
}