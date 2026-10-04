package com.mahabenefit.backend.service;

import com.mahabenefit.backend.entity.Scheme;
import com.mahabenefit.backend.repository.SchemeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SchemeService {

    @Autowired
    private SchemeRepository schemeRepository;

    public List<Scheme> getAllSchemes() {
        return schemeRepository.findAll();
    }

    public List<Scheme> getAllActiveSchemes() {
        return schemeRepository.findByStatus("Active");
    }

    public Scheme getSchemeById(Long id) {
        return schemeRepository.findById(id).orElse(null);
    }

    public List<Scheme> getSchemesByCategory(String category) {
        return schemeRepository.findByCategory(category);
    }

    public Scheme saveScheme(Scheme scheme) {
        return schemeRepository.save(scheme);
    }

    public void deleteScheme(Long id) {
        schemeRepository.deleteById(id);
    }
}