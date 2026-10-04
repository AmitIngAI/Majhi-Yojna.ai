import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [currentLang, setCurrentLang] = useState(() => {
        const saved = sessionStorage.getItem('preferredLanguage');
        if (saved === 'hi') return 'en';
        return saved || 'en';
    });

    const languages = [
        { code: 'en', label: 'English', flag: '🇬🇧', native: 'English' },
        { code: 'mr', label: 'Marathi', flag: '🇮🇳', native: 'मराठी' }
    ];

    const setGoogTransCookie = (langCode) => {
        const value = langCode === 'en' ? '/en/en' : `/en/${langCode}`;
        const hostname = window.location.hostname;

        document.cookie = `googtrans=; path=/; max-age=0`;
        document.cookie = `googtrans=; domain=${hostname}; path=/; max-age=0`;

        document.cookie = `googtrans=${value}; path=/;`;
        document.cookie = `googtrans=${value}; domain=${hostname}; path=/;`;
    };

    const triggerGoogleSelect = (langCode) => {
        const selectBox = document.querySelector('.goog-te-combo');
        if (!selectBox) return false;
        selectBox.value = langCode;
        selectBox.dispatchEvent(new Event('change'));
        return true;
    };

    const changeLanguage = useCallback((langCode) => {
        if (langCode === currentLang) return;

        setCurrentLang(langCode);
        sessionStorage.setItem('preferredLanguage', langCode);
        setGoogTransCookie(langCode);

        if (langCode === 'en') {
            window.location.reload();
            return;
        }

        const tryApply = (attempts = 0) => {
            if (triggerGoogleSelect(langCode)) return;
            if (attempts < 10) setTimeout(() => tryApply(attempts + 1), 300);
            else window.location.reload();
        };

        setTimeout(() => tryApply(), 150);
    }, [currentLang]);

    useEffect(() => {
        if (currentLang === 'en') return;
        setGoogTransCookie(currentLang);

        const id = setInterval(() => {
            if (triggerGoogleSelect(currentLang)) clearInterval(id);
        }, 400);

        const stop = setTimeout(() => clearInterval(id), 6000);
        return () => { clearInterval(id); clearTimeout(stop); };
    }, []);

    return (
        <LanguageContext.Provider value={{ currentLang, changeLanguage, languages }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within LanguageProvider');
    return context;
};