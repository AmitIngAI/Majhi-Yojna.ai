package com.mahabenefit.backend.controller;

import com.mahabenefit.backend.dto.ApiResponse;
import com.mahabenefit.backend.entity.SavedScheme;
import com.mahabenefit.backend.entity.Scheme;
import com.mahabenefit.backend.service.SavedSchemeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/saved")
@CrossOrigin(origins = "http://localhost:3000")
public class SavedSchemeController {

    @Autowired
    private SavedSchemeService savedSchemeService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse> getSaved(@PathVariable Long userId) {
        List<SavedScheme> savedList = savedSchemeService.getSavedSchemesByUser(userId);

        List<Map<String, Object>> result = new ArrayList<>();
        for (SavedScheme ss : savedList) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", ss.getId());
            item.put("savedAt", ss.getSavedAt());
            item.put("schemeId", ss.getSchemeId());

            Scheme scheme = savedSchemeService.getSchemeById(ss.getSchemeId());
            if (scheme != null) {
                item.put("scheme", scheme);
                item.put("schemeName", scheme.getSchemeName());
                item.put("category", scheme.getCategory());
                item.put("description", scheme.getDescription());
                item.put("benefits", scheme.getBenefits());
                item.put("officialLink", scheme.getOfficialLink());
            }
            result.add(item);
        }

        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .data(result)
                .build());
    }

    @PostMapping("/{userId}/toggle/{schemeId}")
    public ResponseEntity<ApiResponse> toggleSave(
            @PathVariable Long userId,
            @PathVariable Long schemeId) {

        boolean saved = savedSchemeService.toggleSave(userId, schemeId);

        Map<String, Object> data = new HashMap<>();
        data.put("saved", saved);
        data.put("schemeId", schemeId);

        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message(saved ? "Scheme saved" : "Scheme removed")
                .data(data)
                .build());
    }
}