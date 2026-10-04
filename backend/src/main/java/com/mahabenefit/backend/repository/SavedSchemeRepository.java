package com.mahabenefit.backend.repository;

import com.mahabenefit.backend.entity.SavedScheme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedSchemeRepository extends JpaRepository<SavedScheme, Long> {

    List<SavedScheme> findByUserId(Long userId);

    Optional<SavedScheme> findByUserIdAndSchemeId(Long userId, Long schemeId);

    @Transactional
    void deleteByUserIdAndSchemeId(Long userId, Long schemeId);
}