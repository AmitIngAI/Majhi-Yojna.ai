package com.mahabenefit.backend.controller;

import com.mahabenefit.backend.dto.ApiResponse;
import com.mahabenefit.backend.dto.ContactRequest;
import com.mahabenefit.backend.entity.ContactMessage;
import com.mahabenefit.backend.repository.ContactMessageRepository;
import com.mahabenefit.backend.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "http://localhost:3000")
public class ContactController {

    @Autowired
    private ContactMessageRepository contactMessageRepository;

    @Autowired
    private ActivityService activityService;

    // ═══ PUBLIC: Submit contact form ═══
    @PostMapping
    public ResponseEntity<ApiResponse> submitContact(@RequestBody ContactRequest request) {
        try {
            ContactMessage msg = ContactMessage.builder()
                    .name(request.getName())
                    .email(request.getEmail())
                    .phone(request.getPhone() != null ? request.getPhone() : "")
                    .subject(request.getSubject() != null ? request.getSubject() : "General Inquiry")
                    .message(request.getMessage())
                    .status("Unread")
                    .createdAt(LocalDateTime.now())
                    .build();

            contactMessageRepository.save(msg);

            // Log activity for admin
            activityService.logActivity(
                "CONTACT_MESSAGE",
                "New Contact Message",
                request.getName() + " sent a message",
                request.getName(),
                null
            );

            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Message sent successfully. We will contact you soon!")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(false)
                    .message("Failed to send message: " + e.getMessage())
                    .build());
        }
    }

    // ═══ ADMIN: Get all messages ═══
    @GetMapping("/admin/all")
    public ResponseEntity<ApiResponse> getAllMessages() {
        List<ContactMessage> messages = contactMessageRepository.findAllByOrderByCreatedAtDesc();

        // Statistics
        long total = messages.size();
        long unread = messages.stream().filter(m -> "Unread".equals(m.getStatus())).count();
        long replied = messages.stream().filter(m -> "Replied".equals(m.getStatus())).count();
        long resolved = messages.stream().filter(m -> "Resolved".equals(m.getStatus())).count();

        Map<String, Object> data = new HashMap<>();
        data.put("messages", messages);
        data.put("stats", Map.of(
            "total", total,
            "unread", unread,
            "replied", replied,
            "resolved", resolved
        ));

        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .data(data)
                .build());
    }

    // ═══ ADMIN: Get unread count (for sidebar badge) ═══
    @GetMapping("/admin/unread-count")
    public ResponseEntity<ApiResponse> getUnreadCount() {
        long count = contactMessageRepository.countByStatus("Unread");
        Map<String, Object> data = new HashMap<>();
        data.put("count", count);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .data(data)
                .build());
    }

    // ═══ ADMIN: Mark as read ═══
    @PutMapping("/admin/{id}/mark-read")
    public ResponseEntity<ApiResponse> markAsRead(@PathVariable Long id) {
        ContactMessage msg = contactMessageRepository.findById(id).orElse(null);
        if (msg == null) {
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(false)
                    .message("Message not found")
                    .build());
        }
        if ("Unread".equals(msg.getStatus())) {
            msg.setStatus("Read");
            contactMessageRepository.save(msg);
        }
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Marked as read")
                .build());
    }

    // ═══ ADMIN: Reply to message ═══
    @PutMapping("/admin/{id}/reply")
    public ResponseEntity<ApiResponse> replyToMessage(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        ContactMessage msg = contactMessageRepository.findById(id).orElse(null);
        if (msg == null) {
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(false)
                    .message("Message not found")
                    .build());
        }

        String reply = body.get("reply");
        if (reply == null || reply.trim().isEmpty()) {
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(false)
                    .message("Reply cannot be empty")
                    .build());
        }

        msg.setAdminReply(reply);
        msg.setStatus("Replied");
        msg.setRepliedAt(LocalDateTime.now());
        contactMessageRepository.save(msg);

        activityService.logActivity(
            "MESSAGE_REPLIED",
            "Message Replied",
            "Replied to " + msg.getName(),
            "Admin",
            null
        );

        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Reply sent successfully")
                .build());
    }

    // ═══ ADMIN: Mark as resolved ═══
    @PutMapping("/admin/{id}/resolve")
    public ResponseEntity<ApiResponse> markAsResolved(@PathVariable Long id) {
        ContactMessage msg = contactMessageRepository.findById(id).orElse(null);
        if (msg == null) {
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(false)
                    .message("Message not found")
                    .build());
        }
        msg.setStatus("Resolved");
        msg.setResolvedAt(LocalDateTime.now());
        contactMessageRepository.save(msg);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Marked as resolved")
                .build());
    }

    // ═══ ADMIN: Delete message ═══
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<ApiResponse> deleteMessage(@PathVariable Long id) {
        if (!contactMessageRepository.existsById(id)) {
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(false)
                    .message("Message not found")
                    .build());
        }
        contactMessageRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Message deleted")
                .build());
    }
}