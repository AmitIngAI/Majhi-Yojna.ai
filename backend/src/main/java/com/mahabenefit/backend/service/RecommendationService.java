package com.mahabenefit.backend.service;

import com.mahabenefit.backend.dto.EligibilityResult;
import com.mahabenefit.backend.entity.User;
import com.mahabenefit.backend.repository.UserRepository;
import com.mahabenefit.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class RecommendationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Value("${ml.api.url:http://localhost:5000}")
    private String mlApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<EligibilityResult> getRecommendationsForUser(Long userId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                System.err.println("❌ User not found: " + userId);
                return new ArrayList<>();
            }

            // Check profile is at least 80% complete
            int completion = userService.calculateProfileCompletionPercentage(user);
            System.out.println("📊 User " + userId + " profile: " + completion + "%");

            if (completion < 50) {
                System.out.println("⚠️  Profile too incomplete for recommendations");
                return new ArrayList<>();
            }

            Map<String, Object> citizen = buildCitizenProfile(user);
            System.out.println("📤 Sending to ML: " + citizen);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(citizen, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                mlApiUrl + "/api/recommend",
                request,
                Map.class
            );

            Map<String, Object> body = response.getBody();
            if (body == null) {
                System.err.println("❌ ML returned null");
                return new ArrayList<>();
            }

            System.out.println("📥 ML Response success: " + body.get("success"));
            System.out.println("📥 Total eligible: " + body.get("total_eligible"));

            List<Map<String, Object>> mlRecs =
                (List<Map<String, Object>>) body.get("recommendations");

            if (mlRecs == null || mlRecs.isEmpty()) {
                System.out.println("⚠️  No recommendations from ML");
                return new ArrayList<>();
            }

            List<EligibilityResult> results = new ArrayList<>();
            for (Map<String, Object> rec : mlRecs) {
                EligibilityResult r = new EligibilityResult();
                r.setSchemeId(getLongValue(rec.get("scheme_id")));
                r.setSchemeCode((String) rec.get("scheme_code"));
                r.setSchemeName((String) rec.get("scheme_name"));
                r.setDescription((String) rec.get("benefits"));
                r.setCategory((String) rec.get("ministry"));
                r.setBenefits((String) rec.get("benefits"));
                r.setOfficialLink((String) rec.get("application_link"));
                Double matchScore = getDoubleValue(rec.get("match_score"));
                if (matchScore == 0) matchScore = getDoubleValue(rec.get("match_percentage"));
                if (matchScore == 0) matchScore = 85.0; // Default
                r.setMatchScore(matchScore);
                r.setMlScore(getDoubleValue(rec.get("ml_score")));

                List<String> matched = (List<String>) rec.get("matched_rules");
                r.setMatchedRules(matched != null ? matched : new ArrayList<>());
                results.add(r);
            }

            System.out.println("✅ Returning " + results.size() + " recommendations");
            return results;

        } catch (Exception e) {
            System.err.println("❌ ML API Error: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public List<EligibilityResult> getEligibleSchemes(Long userId) {
        return getRecommendationsForUser(userId);
    }

    public List<Map<String, String>> getLifeEventSuggestions(Long userId) {
    List<Map<String, String>> events = new ArrayList<>();
    try {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return events;

        // Age-based events
        if (user.getAge() != null) {
            int age = user.getAge();
            if (age >= 60) events.add(makeEvent(
                "Senior Citizen Benefits Available",
                "You're eligible for senior citizen pension, free healthcare, tax benefits and welfare schemes exclusively for citizens above 60."));
            if (age >= 18 && age <= 30) events.add(makeEvent(
                "Young Adult Opportunities",
                "Explore scholarships for higher education, skill development programs, first-job training and startup loans for youth."));
            if (age >= 21 && age <= 45) events.add(makeEvent(
                "Business & Loan Schemes",
                "Check Annasaheb Patil loan, Mudra Yojana, and entrepreneurship schemes to start or grow your business."));
            if (age >= 18 && age <= 25) events.add(makeEvent(
                "Student Scholarships Available",
                "MahaDBT portal offers post-matric scholarships, EBC benefits and merit-based awards for your studies."));
        }

        // Gender-based
        if ("Female".equalsIgnoreCase(user.getGender())) {
            events.add(makeEvent(
                "Women Empowerment Schemes",
                "Savitribai Phule scholarship, Kishori Shakti, self-employment loans and safety schemes for women in Maharashtra."));
        }

        // Marital status
        if ("Widowed".equalsIgnoreCase(user.getMaritalStatus())) {
            events.add(makeEvent(
                "Widow Support Schemes",
                "Sanjay Gandhi Niradhar pension, financial assistance, healthcare and housing schemes for widows."));
        }

        // Occupation-based
        String occ = user.getOccupation();
        if ("Farmer".equalsIgnoreCase(occ)) {
            events.add(makeEvent(
                "Farmer-Specific Benefits",
                "PM Kisan, crop insurance, solar pump subsidies, loan waiver and Nanaji Deshmukh Krishi Sanjivani schemes."));
        }
        if ("Student".equalsIgnoreCase(occ)) {
            events.add(makeEvent(
                "Student Scholarships",
                "Post-matric scholarships, EBC benefits, minority scholarships and merit awards through MahaDBT portal."));
        }
        if ("Unemployed".equalsIgnoreCase(occ)) {
            events.add(makeEvent(
                "Employment Support Available",
                "Berojgar Bhatta (unemployment allowance), free skill training, job placement and self-employment loans."));
        }
        if ("Small Business Owner".equalsIgnoreCase(occ) || "Self Employed".equalsIgnoreCase(occ)) {
            events.add(makeEvent(
                "Business Growth Schemes",
                "Mudra loans, Annasaheb Patil scheme, industrial subsidies and marketing support for entrepreneurs."));
        }
        if ("Daily Wage Worker".equalsIgnoreCase(occ)) {
            events.add(makeEvent(
                "Worker Welfare Benefits",
                "Mathadi worker scheme, social security, health insurance and housing benefits for unorganised workers."));
        }

        // Category-based
        if ("SC".equalsIgnoreCase(user.getCategory()) || "ST".equalsIgnoreCase(user.getCategory())) {
            events.add(makeEvent(
                "SC/ST Welfare Programs",
                "Ramai Awas housing, Yashwantrao Chavan Mukt Vasahat, post-matric scholarships and business loans."));
        }
        if ("OBC".equalsIgnoreCase(user.getCategory())) {
            events.add(makeEvent(
                "OBC Welfare Schemes",
                "OBC scholarships, self-employment loans, coaching classes and financial assistance for OBC community."));
        }

        // BPL
        if ("Yes".equalsIgnoreCase(user.getBplCard())) {
            events.add(makeEvent(
                "BPL Card Benefits",
                "Free ration, subsidized housing (Gharkul), free medical treatment and priority in government schemes."));
        }

        // Disability
        if ("Yes".equalsIgnoreCase(user.getDisability())) {
            events.add(makeEvent(
                "Divyang (Disability) Schemes",
                "Disability pension, scholarship, assistive devices, employment reservation and healthcare benefits."));
        }

        } catch (Exception e) {
            System.err.println("Life events error: " + e.getMessage());
        }
        return events;
    }

    private Map<String, String> makeEvent(String event, String suggestion) {
        Map<String, String> m = new HashMap<>();
        m.put("event", event);
        m.put("suggestion", suggestion);
        return m;
    }

    /**
     * Build FULL citizen profile for ML API
     * ML expects: age, gender, annual_income, category, occupation, state, is_bpl, is_disabled
     */
    private Map<String, Object> buildCitizenProfile(User user) {
        Map<String, Object> c = new HashMap<>();

        c.put("age", user.getAge() != null ? user.getAge() : 25);
        c.put("gender", nvl(user.getGender(), "Male"));
        c.put("annual_income",
            user.getAnnualIncome() != null ? user.getAnnualIncome().intValue() : 100000);
        c.put("category", nvl(user.getCategory(), "General"));
        c.put("occupation", nvl(user.getOccupation(), "Unemployed"));
        c.put("state", "Maharashtra"); // ML strictly checks this
        c.put("is_bpl", "Yes".equalsIgnoreCase(user.getBplCard()) ? 1 : 0);
        c.put("is_disabled", "Yes".equalsIgnoreCase(user.getDisability()) ? 1 : 0);

        return c;
    }

    private String nvl(String s, String def) {
        return (s == null || s.trim().isEmpty()) ? def : s;
    }

    private Long getLongValue(Object obj) {
        if (obj == null) return 0L;
        if (obj instanceof Number) return ((Number) obj).longValue();
        try { return Long.parseLong(obj.toString()); }
        catch (Exception e) { return 0L; }
    }

    private Double getDoubleValue(Object obj) {
        if (obj == null) return 0.0;
        if (obj instanceof Number) return ((Number) obj).doubleValue();
        try { return Double.parseDouble(obj.toString()); }
        catch (Exception e) { return 0.0; }
    }
}