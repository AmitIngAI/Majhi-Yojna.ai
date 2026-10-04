package com.mahabenefit.backend.service;

import com.mahabenefit.backend.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class MLApiService {

    @Value("${ml.api.url:http://localhost:5000}")
    private String mlApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Get AI-powered recommendations for a user
     */
    public Map<String, Object> getRecommendations(User user) {
        try {
            // Build citizen profile for ML API
            Map<String, Object> citizen = new HashMap<>();
            citizen.put("age", user.getAge() != null ? user.getAge() : 25);
            citizen.put("gender", user.getGender() != null ? user.getGender() : "Male");
            citizen.put("annual_income",
                user.getAnnualIncome() != null ? user.getAnnualIncome().intValue() : 100000);
            citizen.put("category", user.getCategory() != null ? user.getCategory() : "General");
            citizen.put("occupation", user.getOccupation() != null ? user.getOccupation() : "Unemployed");
            citizen.put("state", "Maharashtra");

            // ✅ FIXED: Use correct method names from User.java
            citizen.put("is_bpl",
                "Yes".equalsIgnoreCase(user.getBplCard()) ? 1 : 0);
            citizen.put("is_disabled",
                "Yes".equalsIgnoreCase(user.getDisability()) ? 1 : 0);

            // Call ML API
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(citizen, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                mlApiUrl + "/api/recommend",
                request,
                Map.class
            );

            return response.getBody();

        } catch (Exception e) {
            System.err.println("ML API Error: " + e.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("success", false);
            fallback.put("error", "ML API not available: " + e.getMessage());
            fallback.put("recommendations", new ArrayList<>());
            fallback.put("total_eligible", 0);
            return fallback;
        }
    }

    /**
     * Simulate eligibility with different profile
     */
    public Map<String, Object> checkEligibility(Map<String, Object> profile) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(profile, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                mlApiUrl + "/api/eligibility-check",
                request,
                Map.class
            );

            return response.getBody();

        } catch (Exception e) {
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("success", false);
            fallback.put("error", e.getMessage());
            fallback.put("schemes", new ArrayList<>());
            return fallback;
        }
    }

    /**
     * Check if ML API is available
     */
    public boolean isMLApiHealthy() {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                mlApiUrl + "/api/health",
                Map.class
            );
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            return false;
        }
    }
}