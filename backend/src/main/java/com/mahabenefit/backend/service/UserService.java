package com.mahabenefit.backend.service;

import com.mahabenefit.backend.dto.ProfileUpdateRequest;
import com.mahabenefit.backend.entity.User;
import com.mahabenefit.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired private UserRepository userRepository;
    @Autowired private ActivityService activityService;


    public User getUserByEmail(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null) {
            // Auto-update completion % on every fetch
            int pct = calculateProfileCompletionPercentage(user);
            user.setProfileCompletionPercentage(pct);
            user.setProfileComplete(pct >= 80);
        }
        return user;
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User updateProfile(String email, ProfileUpdateRequest r) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return null;

        // Personal
        if (notBlank(r.getFullName())) user.setFullName(r.getFullName());
        if (notBlank(r.getMobile())) user.setMobile(r.getMobile());
        if (notBlank(r.getPhone())) user.setMobile(r.getPhone());
        if (r.getAge() != null) user.setAge(r.getAge());
        if (notBlank(r.getGender())) user.setGender(r.getGender());
        if (notBlank(r.getDateOfBirth())) user.setDateOfBirth(r.getDateOfBirth());

        // Address
        if (notBlank(r.getAddress())) user.setAddress(r.getAddress());
        if (notBlank(r.getDistrict())) user.setDistrict(r.getDistrict());
        if (notBlank(r.getTaluka())) user.setTaluka(r.getTaluka());
        if (notBlank(r.getCity())) user.setCity(r.getCity());
        if (notBlank(r.getPincode())) user.setPincode(r.getPincode());
        if (notBlank(r.getRuralUrban())) user.setRuralUrban(r.getRuralUrban());

        // Documents
        if (notBlank(r.getCategory())) user.setCategory(r.getCategory());
        if (notBlank(r.getAadhaarNumber())) user.setAadhaarNumber(r.getAadhaarNumber());
        if (notBlank(r.getPanNumber())) user.setPanNumber(r.getPanNumber());
        if (notBlank(r.getRationCard())) user.setRationCard(r.getRationCard());
        if (notBlank(r.getBplCard())) user.setBplCard(r.getBplCard());

        // Employment
        if (notBlank(r.getOccupation())) user.setOccupation(r.getOccupation());
        if (r.getAnnualIncome() != null) user.setAnnualIncome(r.getAnnualIncome());
        if (notBlank(r.getEmploymentStatus())) user.setEmploymentStatus(r.getEmploymentStatus());
        if (notBlank(r.getEducation())) user.setEducation(r.getEducation());
        if (notBlank(r.getEducationLevel())) user.setEducation(r.getEducationLevel());

        // Family
        if (notBlank(r.getMaritalStatus())) user.setMaritalStatus(r.getMaritalStatus());
        if (r.getFamilySize() != null) user.setFamilySize(r.getFamilySize());
        if (r.getFamilyMembers() != null) user.setFamilySize(r.getFamilyMembers());
        if (notBlank(r.getWidowStatus())) user.setWidowStatus(r.getWidowStatus());
        if (notBlank(r.getSeniorCitizen())) user.setSeniorCitizen(r.getSeniorCitizen());
        if (notBlank(r.getDisability())) user.setDisability(r.getDisability());
        if (notBlank(r.getDisabilityType())) user.setDisabilityType(r.getDisabilityType());
        if (r.getDisabilityPercentage() != null) user.setDisabilityPercentage(r.getDisabilityPercentage());

        // Additional
        if (r.getLandOwnership() != null) user.setLandOwnership(r.getLandOwnership());
        if (notBlank(r.getHouseOwnership())) user.setHouseOwnership(r.getHouseOwnership());
        if (notBlank(r.getHouseStatus())) user.setHouseOwnership(r.getHouseStatus());
        if (notBlank(r.getStartupStatus())) user.setStartupStatus(r.getStartupStatus());
        if (notBlank(r.getHealthCondition())) user.setHealthCondition(r.getHealthCondition());

        user.setState("Maharashtra");

        // ══ CENTRAL COMPLETION CALCULATION ══
        int pct = calculateProfileCompletionPercentage(user);
        user.setProfileCompletionPercentage(pct);
        user.setProfileComplete(pct >= 80);

        try {
            activityService.logActivity(
                "PROFILE_UPDATED",
                "Profile Updated",
                user.getFullName(),
                user.getFullName(),
                user.getId()
            );
        } catch (Exception e) { /* silent */ }
        return userRepository.save(user);
    }

    /**
     * SINGLE SOURCE OF TRUTH — Profile completion %
     * Same 11 fields as frontend profileUtils.js
     */
    public int calculateProfileCompletionPercentage(User u) {
        int total = 11;
        int filled = 0;

        if (notBlank(u.getFullName())) filled++;
        if (notBlank(u.getEmail())) filled++;
        if (notBlank(u.getMobile())) filled++;
        if (u.getAge() != null && u.getAge() > 0) filled++;
        if (notBlank(u.getGender())) filled++;
        if (notBlank(u.getDistrict())) filled++;
        if (notBlank(u.getCategory())) filled++;
        if (notBlank(u.getOccupation())) filled++;
        if (u.getAnnualIncome() != null) filled++;
        if (notBlank(u.getEducation())) filled++;
        if (notBlank(u.getMaritalStatus())) filled++;

        return (int) Math.round((filled * 100.0) / total);
    }

    private boolean notBlank(String s) {
        return s != null && !s.trim().isEmpty();
    }
}