package com.mahabenefit.backend.controller;

import com.mahabenefit.backend.dto.ApiResponse;
import com.mahabenefit.backend.entity.Scheme;
import com.mahabenefit.backend.service.SchemeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schemes")
@CrossOrigin(origins = "http://localhost:3000")
public class SchemeController {

    @Autowired
    private SchemeService schemeService;

    @GetMapping("/all")
    public ResponseEntity<ApiResponse> getAllSchemes() {
        List<Scheme> schemes = schemeService.getAllActiveSchemes();
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Schemes fetched successfully")
                .data(schemes)
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getScheme(
            @PathVariable Long id) {
        Scheme scheme = schemeService.getSchemeById(id);
        if (scheme == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .data(scheme)
                .build());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse> getByCategory(
            @PathVariable String category) {
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .data(schemeService.getSchemesByCategory(category))
                .build());
    }
}