package com.mahabenefit.backend.repository;

import com.mahabenefit.backend.entity.AppliedScheme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppliedSchemeRepository extends JpaRepository<AppliedScheme, Long> {

    List<AppliedScheme> findByUserId(Long userId);

    List<AppliedScheme> findByStatus(String status);

    long countByStatus(String status);
}