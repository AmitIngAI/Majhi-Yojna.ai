package com.mahabenefit.backend.repository;

import com.mahabenefit.backend.entity.Activity;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {

    List<Activity> findTop5ByOrderByCreatedAtDesc();

    List<Activity> findTop10ByOrderByCreatedAtDesc();

    @Query("SELECT a FROM Activity a ORDER BY a.createdAt DESC")
    List<Activity> findAllOrderByCreatedAtDesc();
}