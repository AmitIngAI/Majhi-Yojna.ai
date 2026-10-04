package com.mahabenefit.backend.service;

import com.mahabenefit.backend.dto.EligibilityResult;
import com.mahabenefit.backend.entity.Scheme;
import com.mahabenefit.backend.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.math.BigDecimal;
import java.util.*;

@Service
public class EligibilityService {

    @Autowired(required = false)
    private RestTemplate restTemplate;

    private static final String ML_API_URL = "http://localhost:5000/api/recommend";

    // ── Call Python ML Model ──────────────────────────────
    public EligibilityResult calculateEligibility(User user, Scheme scheme) {
        List<String> matchedRules   = new ArrayList<>();
        List<String> missingCriteria = new ArrayList<>();
        int score = 0;

        // 1. Age Check
        if (user.getAge() != null) {
            int age = user.getAge();
            if (age >= scheme.getAgeMin() && age <= scheme.getAgeMax()) {
                matchedRules.add("✅ Age " + age + " within range "
                        + scheme.getAgeMin() + "-" + scheme.getAgeMax());
                score += 20;
            } else {
                missingCriteria.add("❌ Age requirement not met");
            }
        }

        // 2. Income Check
        if (user.getAnnualIncome() != null
                && scheme.getIncomeLimit().compareTo(BigDecimal.ZERO) > 0) {
            if (user.getAnnualIncome()
                    .compareTo(scheme.getIncomeLimit()) <= 0) {
                matchedRules.add("✅ Income Rs "
                        + user.getAnnualIncome()
                        + " within limit Rs "
                        + scheme.getIncomeLimit());
                score += 20;
            } else {
                missingCriteria.add("❌ Income exceeds scheme limit");
            }
        } else {
            score += 20;
        }

        // 3. Gender Check
        if ("All".equals(scheme.getGenderRequired())
                || scheme.getGenderRequired() == null) {
            matchedRules.add("✅ Open to all genders");
            score += 15;
        } else if (scheme.getGenderRequired()
                .equalsIgnoreCase(user.getGender())) {
            matchedRules.add("✅ Gender matches");
            score += 15;
        } else {
            missingCriteria.add("❌ Gender requirement not met");
        }

        // 4. Category Check
        if ("All".equals(scheme.getCategoryRequired())
                || scheme.getCategoryRequired() == null) {
            matchedRules.add("✅ Open to all categories");
            score += 15;
        } else if (user.getCategory() != null
                && scheme.getCategoryRequired().contains(user.getCategory())) {
            matchedRules.add("✅ Category "
                    + user.getCategory() + " matches");
            score += 15;
        } else {
            missingCriteria.add("❌ Category requirement not met");
        }

        // 5. Occupation Check
        if ("Any".equals(scheme.getOccupationRequired())
                || scheme.getOccupationRequired() == null) {
            matchedRules.add("✅ Open to all occupations");
            score += 15;
        } else if (user.getOccupation() != null
                && scheme.getOccupationRequired()
                        .equalsIgnoreCase(user.getOccupation())) {
            matchedRules.add("✅ Occupation matches");
            score += 15;
        } else {
            missingCriteria.add("❌ Occupation requirement not met");
        }

        // 6. BPL Check
        if ("Any".equals(scheme.getBplRequired())
                || scheme.getBplRequired() == null) {
            score += 15;
        } else if (scheme.getBplRequired()
                .equalsIgnoreCase(user.getBplCard())) {
            matchedRules.add("✅ BPL status matches");
            score += 15;
        } else {
            missingCriteria.add("❌ BPL card requirement not met");
        }

        boolean eligible = missingCriteria.isEmpty() && score >= 60;

        EligibilityResult result = new EligibilityResult();
        result.setSchemeId(scheme.getId());
        result.setSchemeName(scheme.getSchemeName());
        result.setCategory(scheme.getCategory());
        result.setDescription(scheme.getDescription());
        result.setBenefits(scheme.getBenefits());
        result.setOfficialLink(scheme.getOfficialLink());
        result.setMatchScore((double) score);
        result.setMlScore(0.0);
        result.setMatchedRules(matchedRules);

        return result;
    }

    // ── Get ML Recommendations from Python ───────────────
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getMLRecommendations(User user) {
        try {
            if (restTemplate == null) {
                restTemplate = new RestTemplate();
            }

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("age",
                    user.getAge() != null ? user.getAge() : 25);
            requestBody.put("gender",
                    user.getGender() != null ? user.getGender() : "Male");
            requestBody.put("annual_income",
                    user.getAnnualIncome() != null
                            ? user.getAnnualIncome().intValue() : 200000);
            requestBody.put("category",
                    user.getCategory() != null ? user.getCategory() : "General");
            requestBody.put("occupation",
                    user.getOccupation() != null
                            ? user.getOccupation() : "Unemployed");
            requestBody.put("state", "Maharashtra");
            requestBody.put("is_bpl",
                    "Yes".equalsIgnoreCase(user.getBplCard()) ? 1 : 0);
            requestBody.put("is_disabled",
                    "Yes".equalsIgnoreCase(user.getDisability()) ? 1 : 0);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity =
                    new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    ML_API_URL, entity, Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK
                    && response.getBody() != null) {
                Object recommendations =
                        response.getBody().get("recommendations");
                if (recommendations instanceof List) {
                    return (List<Map<String, Object>>) recommendations;
                }
            }
        } catch (Exception e) {
            System.out.println(
                    "⚠️ ML Model not available: " + e.getMessage()
            );
        }
        return new ArrayList<>();
    }
}