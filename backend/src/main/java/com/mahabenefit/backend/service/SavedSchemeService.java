package com.mahabenefit.backend.service;

import com.mahabenefit.backend.entity.SavedScheme;
import com.mahabenefit.backend.entity.Scheme;
import com.mahabenefit.backend.repository.SavedSchemeRepository;
import com.mahabenefit.backend.repository.SchemeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SavedSchemeService {


    @Autowired 
    private ActivityService activityService;

    @Autowired
    private com.mahabenefit.backend.repository.UserRepository userRepository;
    
    @Autowired
    private SavedSchemeRepository savedSchemeRepository;

    @Autowired
    private SchemeRepository schemeRepository;

    public List<SavedScheme> getSavedSchemesByUser(Long userId) {
        return savedSchemeRepository.findByUserId(userId);
    }

    public Scheme getSchemeById(Long schemeId) {
        return schemeRepository.findById(schemeId).orElse(null);
    }

    @Transactional
    public boolean toggleSave(Long userId, Long schemeId) {
    Optional<SavedScheme> existing =
            savedSchemeRepository.findByUserIdAndSchemeId(userId, schemeId);

    if (existing.isPresent()) {
        savedSchemeRepository.delete(existing.get());
        return false;
    } else {
        SavedScheme newSave = SavedScheme.builder()
                .userId(userId)
                .schemeId(schemeId)
                .savedAt(LocalDateTime.now())
                .build();
        savedSchemeRepository.save(newSave);

        // Log activity
        try {
            Scheme scheme = schemeRepository.findById(schemeId).orElse(null);
            String userName = userRepository.findById(userId)
                    .map(u -> u.getFullName()).orElse("User");
            String schemeName = scheme != null ? scheme.getSchemeName() : "Scheme";
            activityService.logActivity(
                "SCHEME_SAVED",
                "Scheme Saved",
                schemeName,
                userName,
                userId
            );
        } catch (Exception e) { /* silent */ }

        return true;
    }
    }

    

    public boolean isSaved(Long userId, Long schemeId) {
        return savedSchemeRepository.findByUserIdAndSchemeId(userId, schemeId).isPresent();
    }
}