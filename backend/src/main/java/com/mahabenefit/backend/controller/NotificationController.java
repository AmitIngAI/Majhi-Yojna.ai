package com.mahabenefit.backend.controller;

import com.mahabenefit.backend.dto.ApiResponse;
import com.mahabenefit.backend.entity.Notification;
import com.mahabenefit.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse> getUserNotifications(@PathVariable Long userId) {
        List<Notification> list = notificationService.getUserNotifications(userId);

        // Debug log
        System.out.println("📬 Fetching notifications for user: " + userId);
        System.out.println("📬 Total notifications found: " + list.size());

        List<Map<String, Object>> result = new ArrayList<>();
        for (Notification n : list) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", n.getId());
            m.put("title", n.getTitle());
            m.put("message", n.getMessage());
            m.put("type", n.getType());
            m.put("isRead", n.getIsRead());
            m.put("createdAt", n.getCreatedAt());

            // Debug each notification
            System.out.println("  → Notification #" + n.getId() + ": " + n.getTitle());
            System.out.println("     Message: " + n.getMessage());

            result.add(m);
        }

        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .data(result)
                .build());
    }

    @GetMapping("/{userId}/unread-count")
    public ResponseEntity<ApiResponse> getUnreadCount(@PathVariable Long userId) {
        long count = notificationService.getUnreadCount(userId);
        Map<String, Object> data = new HashMap<>();
        data.put("count", count);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .data(data)
                .build());
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse> markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Marked as read")
                .build());
    }

    @PutMapping("/{userId}/read-all")
    public ResponseEntity<ApiResponse> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("All marked as read")
                .build());
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<ApiResponse> deleteNotification(@PathVariable Long notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Deleted")
                .build());
    }
}