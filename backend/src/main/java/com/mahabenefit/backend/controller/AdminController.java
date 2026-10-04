package com.mahabenefit.backend.controller;

import com.mahabenefit.backend.dto.ApiResponse;
import com.mahabenefit.backend.entity.Activity;
import com.mahabenefit.backend.entity.Scheme;
import com.mahabenefit.backend.entity.User;
import com.mahabenefit.backend.service.ActivityService;
import com.mahabenefit.backend.service.AdminService;
import com.mahabenefit.backend.service.NotificationService;
import com.mahabenefit.backend.service.SchemeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired private AdminService adminService;
    @Autowired private SchemeService schemeService;
    @Autowired private ActivityService activityService;
    @Autowired private NotificationService notificationService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse> getDashboard() {
        Map<String, Object> data = new HashMap<>(adminService.getDashboardStats());
        List<Activity> activities = activityService.getRecentActivities();
        data.put("recentActivities", activities);
        return ResponseEntity.ok(ApiResponse.builder().success(true).data(data).build());
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse> getAllUsers() {
        List<User> users = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.builder().success(true).data(users).build());
    }

    @PutMapping("/users/{userId}/toggle-status")
    public ResponseEntity<ApiResponse> toggleUserStatus(@PathVariable Long userId) {
        String newStatus = adminService.toggleUserStatus(userId);
        activityService.logActivity(
            "USER_STATUS_CHANGED",
            "User " + ("Blocked".equals(newStatus) ? "Blocked" : "Unblocked"),
            "Status changed to: " + newStatus,
            "Admin",
            userId
        );
        Map<String, Object> data = new HashMap<>();
        data.put("status", newStatus);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("User " + newStatus)
                .data(data)
                .build());
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable Long userId) {
        String name = adminService.deleteUser(userId);
        activityService.logActivity(
            "USER_DELETED",
            "User Deleted",
            name,
            "Admin",
            userId
        );
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("User " + name + " deleted")
                .build());
    }

    @GetMapping("/schemes")
    public ResponseEntity<ApiResponse> getAllSchemes() {
        List<Scheme> schemes = schemeService.getAllSchemes();
        return ResponseEntity.ok(ApiResponse.builder().success(true).data(schemes).build());
    }

    // ═══════ ADD SCHEME ═══════
    @PostMapping("/schemes")
    public ResponseEntity<ApiResponse> addScheme(@RequestBody Scheme scheme) {
        Scheme saved = schemeService.saveScheme(scheme);

        activityService.logActivity(
            "SCHEME_ADDED",
            "New Scheme Added",
            scheme.getSchemeName(),
            "Admin",
            null
        );

        notificationService.notifyAllUsers(
            "🎉 New Scheme Available",
            "A new scheme \"" + scheme.getSchemeName() + "\" has been added. Category: " + scheme.getCategory() + ". Check it now!",
            "SCHEME_ADDED",
            saved.getId()
        );

        return ResponseEntity.ok(ApiResponse.builder().success(true).data(saved).build());
    }

    // ═══════ UPDATE SCHEME ═══════
    @PutMapping("/schemes/{id}")
    public ResponseEntity<ApiResponse> updateScheme(@PathVariable Long id, @RequestBody Scheme updated) {
        Scheme existing = schemeService.getSchemeById(id);
        if (existing == null) {
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(false).message("Scheme not found").build());
        }

        // Detect what changed
        StringBuilder changes = new StringBuilder();

        if (existing.getSchemeName() != null && updated.getSchemeName() != null
                && !existing.getSchemeName().equals(updated.getSchemeName())) {
            changes.append("• Name changed from \"").append(existing.getSchemeName())
                    .append("\" to \"").append(updated.getSchemeName()).append("\"\n");
        }
        if (existing.getBenefits() != null && updated.getBenefits() != null
                && !existing.getBenefits().equals(updated.getBenefits())) {
            changes.append("• Benefits updated\n");
        }
        if (existing.getIncomeLimit() != null && updated.getIncomeLimit() != null
                && existing.getIncomeLimit().compareTo(updated.getIncomeLimit()) != 0) {
            changes.append("• Income limit changed to ₹").append(updated.getIncomeLimit()).append("\n");
        }
        if (existing.getAgeMin() != null && updated.getAgeMin() != null
                && existing.getAgeMax() != null && updated.getAgeMax() != null
                && (!existing.getAgeMin().equals(updated.getAgeMin())
                    || !existing.getAgeMax().equals(updated.getAgeMax()))) {
            changes.append("• Age range updated to ").append(updated.getAgeMin())
                    .append("-").append(updated.getAgeMax()).append(" years\n");
        }
        if (existing.getRequiredDocuments() != null && updated.getRequiredDocuments() != null
                && !existing.getRequiredDocuments().equals(updated.getRequiredDocuments())) {
            changes.append("• Required documents updated\n");
        }
        if (existing.getDescription() != null && updated.getDescription() != null
                && !existing.getDescription().equals(updated.getDescription())) {
            changes.append("• Description updated\n");
        }
        if (existing.getCategory() != null && updated.getCategory() != null
                && !existing.getCategory().equals(updated.getCategory())) {
            changes.append("• Category changed from \"").append(existing.getCategory())
                    .append("\" to \"").append(updated.getCategory()).append("\"\n");
        }
        if (existing.getStatus() != null && updated.getStatus() != null
                && !existing.getStatus().equals(updated.getStatus())) {
            changes.append("• Status changed to ").append(updated.getStatus()).append("\n");
        }

        updated.setId(id);
        Scheme saved = schemeService.saveScheme(updated);

        activityService.logActivity(
            "SCHEME_UPDATED",
            "Scheme Updated",
            saved.getSchemeName(),
            "Admin",
            null
        );

        String changesText = changes.length() > 0 ? changes.toString() : "General information updated";
        notificationService.notifyAllUsers(
            "📝 Scheme Updated: " + saved.getSchemeName(),
            "The scheme \"" + saved.getSchemeName() + "\" has been updated.\n\nChanges:\n" + changesText,
            "SCHEME_UPDATED",
            saved.getId()
        );

        return ResponseEntity.ok(ApiResponse.builder().success(true).data(saved).build());
    }

    // ═══════ DELETE SCHEME ═══════
    @DeleteMapping("/schemes/{id}")
    public ResponseEntity<ApiResponse> deleteScheme(@PathVariable Long id) {
        Scheme scheme = schemeService.getSchemeById(id);
        String name = scheme != null ? scheme.getSchemeName() : "Scheme #" + id;
        String category = scheme != null ? scheme.getCategory() : "Unknown";

        schemeService.deleteScheme(id);

        activityService.logActivity(
            "SCHEME_DELETED",
            "Scheme Removed",
            name,
            "Admin",
            null
        );

        notificationService.notifyAllUsers(
            "❌ Scheme Removed",
            "The scheme \"" + name + "\" (Category: " + category + ") has been removed from the portal. If you had saved this scheme, it's no longer available.",
            "SCHEME_DELETED",
            null
        );

        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Deleted").build());
    }

    @GetMapping("/activities")
    public ResponseEntity<ApiResponse> getRecentActivities() {
        List<Activity> activities = activityService.getRecentActivities();
        return ResponseEntity.ok(ApiResponse.builder().success(true).data(activities).build());
    }
}