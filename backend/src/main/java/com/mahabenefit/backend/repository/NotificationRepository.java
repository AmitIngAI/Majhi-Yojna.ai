package com.mahabenefit.backend.repository;

import com.mahabenefit.backend.entity.Notification;
import com.mahabenefit.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    Long countByUserAndIsRead(User user, Boolean isRead);
}