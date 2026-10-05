import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { FiGlobe, FiChevronDown, FiCheck } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';

const LanguageToggle = ({ variant = 'default' }) => {
    const { currentLang, changeLanguage, languages } = useLanguage();
    const [showDropdown, setShowDropdown] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [isHovered, setIsHovered] = useState(false);
    const dropdownRef = useRef(null);

    const activeLang = languages.find(l => l.code === currentLang) || languages[0];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLangChange = (code) => {
        changeLanguage(code);
        setShowDropdown(false);
    };

    // Language-specific gradient colors
    const langColors = {
        'en': { grad: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)', shadow: 'rgba(59,130,246,0.4)' },
        'mr': { grad: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', shadow: 'rgba(16,185,129,0.4)' }
    };

    const activeColor = langColors[currentLang] || langColors['en'];

    // ─── Compact variant (for dashboard sidebar) ───
    if (variant === 'compact') {
        return (
            <div ref={dropdownRef} style={styles.compactWrap}>
                <button 
                    onClick={() => setShowDropdown(!showDropdown)}
                    style={{
                        ...styles.compactBtn,
                        background: activeColor.grad,
                        boxShadow: `0 4px 12px ${activeColor.shadow}`
                    }}
                    className="notranslate">
                    <FiGlobe size={14} />
                    <span style={{ fontWeight: 800 }}>{activeLang.flag}</span>
                    <span style={{ fontWeight: 700 }}>{activeLang.code.toUpperCase()}</span>
                    <FiChevronDown size={12} style={{
                        transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s'
                    }} />
                </button>

                {showDropdown && (
                    <div style={styles.compactDropdown} className="notranslate">
                        {languages.map(lang => {
                            const isActive = currentLang === lang.code;
                            const langColor = langColors[lang.code];
                            return (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLangChange(lang.code)}
                                    onMouseEnter={() => setHoveredItem(lang.code)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    style={{
                                        ...styles.compactItem,
                                        background: isActive ? langColor.grad :
                                                   hoveredItem === lang.code ? '#F9FAFB' : 'transparent',
                                        color: isActive ? '#ffffff' : '#111827'
                                    }}>
                                    <span style={{ fontSize: 18 }}>{lang.flag}</span>
                                    <span style={{ flex: 1, textAlign: 'left', fontWeight: 700 }}>{lang.native}</span>
                                    {isActive && (
                                        <span style={styles.compactCheck}>
                                            <FiCheck size={12} />
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // ─── Default variant (for navbar) ───
    return (
        <div ref={dropdownRef} style={styles.wrap}>
            <button 
                onClick={() => setShowDropdown(!showDropdown)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    ...styles.btn,
                    background: activeColor.grad,
                    boxShadow: isHovered
                        ? `0 8px 20px ${activeColor.shadow}, 0 0 0 3px rgba(255,255,255,0.5)`
                        : `0 4px 14px ${activeColor.shadow}`,
                    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)'
                }}
                className="notranslate">
                
                {/* Animated globe icon */}
                <div style={styles.globeIcon}>
                    <FiGlobe size={16} />
                </div>
                
                {/* Flag */}
                <span style={styles.flag}>{activeLang.flag}</span>
                
                {/* Language name */}
                <span style={styles.langName}>{activeLang.native}</span>
                
                {/* Sparkle effect */}
                <HiSparkles size={12} style={styles.sparkle} />
                
                {/* Chevron */}
                <FiChevronDown 
                    size={14} 
                    style={{
                        transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                    }} 
                />
            </button>

            {showDropdown && (
                <div style={styles.dropdown} className="notranslate">
                    {/* Colorful header */}
                    <div style={styles.dropdownHeader}>
                        <div style={styles.headerBg}></div>
                        <div style={styles.headerContent}>
                            <HiSparkles style={{ marginRight: 8, color: '#F59E0B' }} />
                            <span>Choose Language</span>
                        </div>
                        <div style={styles.headerSubtext}>
                        </div>
                    </div>

                    {/* Language options */}
                    <div style={styles.itemsWrap}>
                        {languages.map(lang => {
                            const isActive = currentLang === lang.code;
                            const langColor = langColors[lang.code];
                            const isHov = hoveredItem === lang.code;
                            
                            return (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLangChange(lang.code)}
                                    onMouseEnter={() => setHoveredItem(lang.code)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    style={{
                                        ...styles.item,
                                        background: isActive
                                            ? langColor.grad
                                            : isHov 
                                            ? '#F9FAFB'
                                            : 'transparent',
                                        boxShadow: isActive
                                            ? `0 4px 12px ${langColor.shadow}`
                                            : 'none',
                                        transform: isHov && !isActive ? 'translateX(4px)' : 'translateX(0)'
                                    }}>
                                    
                                    {/* Flag with circle bg */}
                                    <div style={{
                                        ...styles.flagCircle,
                                        background: isActive ? 'rgba(255,255,255,0.25)' : '#F3F4F6'
                                    }}>
                                        <span style={{ fontSize: 22 }}>{lang.flag}</span>
                                    </div>
                                    
                                    {/* Language info */}
                                    <div style={{ flex: 1, textAlign: 'left' }}>
                                        <div style={{
                                            ...styles.itemNative,
                                            color: isActive ? '#ffffff' : '#111827'
                                        }}>
                                            {lang.native}
                                        </div>
                                        <div style={{
                                            ...styles.itemEng,
                                            color: isActive ? 'rgba(255,255,255,0.85)' : '#6B7280'
                                        }}>
                                            {lang.label}
                                        </div>
                                    </div>
                                    
                                    {/* Check badge */}
                                    {isActive && (
                                        <div style={styles.checkBadge}>
                                            <FiCheck size={14} />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    /* ═══ DEFAULT VARIANT (Navbar) ═══ */
    wrap: {
        position: 'relative',
        display: 'inline-block'
    },
    btn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '11px 18px',
        border: 'none',
        borderRadius: 100,
        color: '#ffffff',
        cursor: 'pointer',
        fontSize: 13,
        fontFamily: 'inherit',
        fontWeight: 700,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden'
    },
    globeIcon: {
        display: 'inline-flex',
        alignItems: 'center',
        animation: 'spin 8s linear infinite'
    },
    flag: {
        fontSize: 18,
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
    },
    langName: {
        fontSize: 13,
        fontWeight: 800,
        letterSpacing: '0.3px'
    },
    sparkle: {
        color: '#FCD34D',
        animation: 'pulse 2s ease-in-out infinite'
    },

    /* ═══ DROPDOWN ═══ */
    dropdown: {
        position: 'absolute',
        top: 'calc(100% + 10px)',
        right: 0,
        width: 'min(300px, calc(100vw - 32px))',
        background: '#ffffff',
        borderRadius: 20,
        boxShadow: '0 25px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.03)',
        overflow: 'hidden',
        zIndex: 999,
        animation: 'dropdownFade 0.3s ease-out'
    },
    dropdownHeader: {
        position: 'relative',
        padding: '18px 20px',
        overflow: 'hidden'
    },
    headerBg: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #EC4899 100%)',
        opacity: 0.95
    },
    headerContent: {
        position: 'relative',
        fontSize: 15,
        fontWeight: 800,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        zIndex: 2,
        letterSpacing: '0.3px'
    },
    headerSubtext: {
        position: 'relative',
        fontSize: 11,
        color: 'rgba(255,255,255,0.85)',
        marginTop: 4,
        fontWeight: 500,
        zIndex: 2
    },
    itemsWrap: {
        padding: 8
    },
    item: {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '12px 14px',
        border: 'none',
        borderRadius: 12,
        width: '100%',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        marginBottom: 4
    },
    flagCircle: {
        width: 40,
        height: 40,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        flexShrink: 0
    },
    itemNative: {
        fontSize: 15,
        fontWeight: 800,
        marginBottom: 2,
        transition: 'color 0.2s'
    },
    itemEng: {
        fontSize: 11,
        fontWeight: 600,
        transition: 'color 0.2s'
    },
    checkBadge: {
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.25)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid rgba(255,255,255,0.4)',
        animation: 'checkPop 0.4s ease-out'
    },
    footer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '12px 20px',
        background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
        borderTop: '1px solid #E5E7EB'
    },
    footerIcon: {
        fontSize: 14,
        animation: 'spin 6s linear infinite'
    },
    footerText: {
        fontSize: 10,
        color: '#6B7280',
        fontWeight: 700,
        letterSpacing: '0.3px'
    },

    /* ═══ COMPACT VARIANT (Dashboard Sidebar) ═══ */
    compactWrap: {
        position: 'relative',
        display: 'inline-block'
    },
    compactBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '9px 14px',
        border: 'none',
        borderRadius: 100,
        color: '#ffffff',
        cursor: 'pointer',
        fontSize: 12,
        fontFamily: 'inherit',
        fontWeight: 800,
        transition: 'all 0.3s',
        letterSpacing: '0.3px'
    },
    compactDropdown: {
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: 200,
        background: '#ffffff',
        borderRadius: 14,
        boxShadow: '0 15px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.03)',
        overflow: 'hidden',
        zIndex: 999,
        padding: 6,
        animation: 'dropdownFade 0.25s ease-out'
    },
    compactItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '11px 12px',
        border: 'none',
        borderRadius: 10,
        width: '100%',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 13,
        transition: 'all 0.2s',
        marginBottom: 3
    },
    compactCheck: {
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.3)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1.5px solid rgba(255,255,255,0.5)'
    }
};

export default LanguageToggle;