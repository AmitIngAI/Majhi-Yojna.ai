package com.mahabenefit.backend.repository;

import com.mahabenefit.backend.entity.ChatHistory;
import com.mahabenefit.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {
    List<ChatHistory> findByUserOrderByCreatedAtDesc(User user);
}