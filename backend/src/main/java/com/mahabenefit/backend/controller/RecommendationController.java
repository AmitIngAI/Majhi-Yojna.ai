package com.mahabenefit.backend.controller;

import com.mahabenefit.backend.dto.EligibilityResult;
import com.mahabenefit.backend.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "http://localhost:3000")
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<EligibilityResult>> getRecommendations(@PathVariable Long userId) {
        return ResponseEntity.ok(recommendationService.getRecommendationsForUser(userId));
    }

    @GetMapping("/{userId}/eligible")
    public ResponseEntity<List<EligibilityResult>> getEligibleSchemes(@PathVariable Long userId) {
        return ResponseEntity.ok(recommendationService.getEligibleSchemes(userId));
    }

    @GetMapping("/{userId}/life-events")
    public ResponseEntity<List<Map<String, String>>> getLifeEvents(@PathVariable Long userId) {
        return ResponseEntity.ok(recommendationService.getLifeEventSuggestions(userId));
    }
}
