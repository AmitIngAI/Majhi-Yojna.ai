package com.mahabenefit.backend.repository;

import com.mahabenefit.backend.entity.Scheme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SchemeRepository extends JpaRepository<Scheme, Long> {

    List<Scheme> findByStatus(String status);

    List<Scheme> findByCategory(String category);

    List<Scheme> findByCategoryAndStatus(String category, String status);

    long countByStatus(String status);
}