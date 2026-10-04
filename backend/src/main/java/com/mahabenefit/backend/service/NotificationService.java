package com.mahabenefit.backend.service;

import com.mahabenefit.backend.entity.Notification;
import com.mahabenefit.backend.entity.User;
import com.mahabenefit.backend.repository.NotificationRepository;
import com.mahabenefit.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Send notification to ALL users (with scheme ID for direct link)
     */
    public void notifyAllUsers(String title, String message, String type) {
        notifyAllUsers(title, message, type, null);
    }

    public void notifyAllUsers(String title, String message, String type, Long schemeId) {
        try {
            List<User> allUsers = userRepository.findAll();
            String enrichedMessage = message;
            if (schemeId != null) {
                enrichedMessage = message + " [SCHEME_ID:" + schemeId + "]";
            }
            for (User u : allUsers) {
                if ("USER".equals(u.getRole())) {
                    Notification n = Notification.builder()
                            .user(u)
                            .title(title)
                            .message(enrichedMessage)
                            .type(type)
                            .isRead(false)
                            .build();
                    notificationRepository.save(n);
                }
            }
        } catch (Exception e) {
            System.err.println("Notify all error: " + e.getMessage());
        }
    }

    public void notifyUser(User user, String title, String message, String type) {
        try {
            Notification n = Notification.builder()
                    .user(user)
                    .title(title)
                    .message(message)
                    .type(type)
                    .isRead(false)
                    .build();
            notificationRepository.save(n);
        } catch (Exception e) {
            System.err.println("Notify user error: " + e.getMessage());
        }
    }

    public List<Notification> getUserNotifications(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return List.of();
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public long getUnreadCount(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return 0;
        return notificationRepository.countByUserAndIsRead(user, false);
    }

    public void markAsRead(Long notificationId) {
        Notification n = notificationRepository.findById(notificationId).orElse(null);
        if (n != null) {
            n.setIsRead(true);
            notificationRepository.save(n);
        }
    }

    public void markAllAsRead(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;
        List<Notification> all = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        for (Notification n : all) {
            if (!n.getIsRead()) {
                n.setIsRead(true);
                notificationRepository.save(n);
            }
        }
    }

    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }
}