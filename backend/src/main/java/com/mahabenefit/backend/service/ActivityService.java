package com.mahabenefit.backend.service;

import com.mahabenefit.backend.entity.Activity;
import com.mahabenefit.backend.repository.ActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ActivityService {

    @Autowired
    private ActivityRepository activityRepository;

    /**
     * Log a new activity and auto-delete old ones (keep only latest 5)
     */
    @Transactional
    public void logActivity(String type, String title, String description, String userName, Long userId) {
        try {
            Activity activity = Activity.builder()
                    .activityType(type)
                    .title(title)
                    .description(description)
                    .userName(userName)
                    .userId(userId)
                    .createdAt(LocalDateTime.now())
                    .build();

            activityRepository.save(activity);

            // Keep only latest 5 — delete older ones
            List<Activity> allActivities = activityRepository.findAllOrderByCreatedAtDesc();
            if (allActivities.size() > 5) {
                List<Activity> toDelete = allActivities.subList(5, allActivities.size());
                activityRepository.deleteAll(toDelete);
            }
        } catch (Exception e) {
            System.err.println("Error logging activity: " + e.getMessage());
        }
    }

    /**
     * Get latest 5 activities for admin dashboard
     */
    public List<Activity> getRecentActivities() {
        return activityRepository.findTop5ByOrderByCreatedAtDesc();
    }
}