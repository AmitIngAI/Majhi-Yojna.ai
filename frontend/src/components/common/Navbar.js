import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LanguageToggle from './LanguageToggle';
import { FiArrowRight, FiMenu, FiX } from 'react-icons/fi';
import useMediaQuery from '../../utils/useMediaQuery';

const Navbar = () => {
    const { isLoggedIn, isAdmin, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [hoverLink, setHoverLink] = useState(null);
    const [hoverBtn, setHoverBtn] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const isMobile = useMediaQuery('(max-width: 1180px)');

    useEffect(() => { setMenuOpen(false); }, [location.pathname]);
    useEffect(() => { if (!isMobile) setMenuOpen(false); }, [isMobile]);

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { path: '/',        label: 'Home' },
        { path: '/schemes', label: 'All Schemes' },
        { path: '/about',   label: 'About' },
        { path: '/contact', label: 'Contact' }
    ];

    const logoSize = isMobile ? 42 : 50;
    const svgSize  = isMobile ? 36 : 42;

    const authButtons = !isLoggedIn ? (
        <>
            <Link
                to="/login"
                onMouseEnter={() => setHoverBtn('signin')}
                onMouseLeave={() => setHoverBtn(null)}
                style={{
                    ...styles.signInBtn,
                    ...(hoverBtn === 'signin' ? styles.signInBtnHover : {})
                }}>
                Sign In
            </Link>
            <Link
                to="/register"
                onMouseEnter={() => setHoverBtn('cta')}
                onMouseLeave={() => setHoverBtn(null)}
                style={{
                    ...styles.ctaBtn,
                    ...(hoverBtn === 'cta' ? styles.ctaBtnHover : {})
                }}>
                Get Started
                <FiArrowRight style={{ marginLeft: 8, fontSize: 16 }} />
            </Link>
        </>
    ) : (
        <>
            <Link
                to={isAdmin ? '/admin/dashboard' : '/user/dashboard'}
                style={styles.userChip}>
                <div style={styles.userAvatar}>
                    {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span style={styles.userName}>
                    {user?.fullName?.split(' ')[0] || 'Dashboard'}
                </span>
            </Link>
            <button onClick={handleLogout} style={styles.logoutBtn}>
                Logout
            </button>
        </>
    );

    return (
        <nav style={styles.nav}>
            <div style={{
                ...styles.container,
                padding: isMobile ? '10px 16px' : '14px 40px',
                gap: isMobile ? 10 : 30
            }}>

                {/* ═══════ LEFT: LOGO ═══════ */}
                <Link to="/" style={styles.logoWrap}>
                    {/* Government Building Logo */}
                    <div style={{ ...styles.logoIconBox, width: logoSize, height: logoSize }}>
                        <svg width={svgSize} height={svgSize} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="48" fill="#ffffff" stroke="#E5E7EB" strokeWidth="1" />
                            <path d="M 50 8 A 42 42 0 0 1 88 65" stroke="#FF9933" strokeWidth="4" strokeLinecap="round" fill="none" />
                            <path d="M 12 60 A 42 42 0 0 0 55 92" stroke="#138808" strokeWidth="4" strokeLinecap="round" fill="none" />
                            <line x1="50" y1="26" x2="50" y2="38" stroke="#1E3A8A" strokeWidth="1.5" />
                            <path d="M 50 27 L 58 30 L 50 33 Z" fill="#FF9933" />
                            <path d="M 42 42 Q 50 32, 58 42 L 58 46 L 42 46 Z" fill="#1E3A8A" />
                            <circle cx="50" cy="38" r="1.5" fill="#1E3A8A" />
                            <rect x="38" y="46" width="24" height="4" fill="#1E3A8A" />
                            <rect x="36" y="50" width="28" height="22" fill="#1E3A8A" />
                            <rect x="40" y="52" width="2" height="18" fill="#ffffff" />
                            <rect x="46" y="52" width="2" height="18" fill="#ffffff" />
                            <rect x="52" y="52" width="2" height="18" fill="#ffffff" />
                            <rect x="58" y="52" width="2" height="18" fill="#ffffff" />
                            <rect x="34" y="72" width="32" height="3" fill="#1E3A8A" />
                            <rect x="36" y="75" width="28" height="2" fill="#1E3A8A" opacity="0.7" />
                            <rect x="38" y="77" width="24" height="2" fill="#1E3A8A" opacity="0.5" />
                        </svg>
                    </div>

                    {/* Brand Text - Marathi + English */}
                    <div style={styles.brandText} className="notranslate" translate="no">
                        <span style={styles.brandNameMarathi}>
                            <span style={styles.marathiOrange}>माझी</span>
                            <span style={styles.marathiDash}>-</span>
                            <span style={styles.marathiGreen}>योजना</span>
                        </span>
                        <span style={styles.brandNameEnglish} className="mj-brand-eng">
                            Majhi Yojana
                        </span>
                    </div>
                </Link>

                {/* ═══════ CENTER: NAV LINKS (desktop only) ═══════ */}
                {!isMobile && (
                    <div style={styles.linksWrap}>
                        <div style={styles.links}>
                            {navLinks.map((l) => (
                                <Link
                                    key={l.path}
                                    to={l.path}
                                    onMouseEnter={() => setHoverLink(l.path)}
                                    onMouseLeave={() => setHoverLink(null)}
                                    style={{
                                        ...styles.link,
                                        ...(isActive(l.path) ? styles.activeLink : {}),
                                        ...(hoverLink === l.path && !isActive(l.path) ? styles.hoverLink : {})
                                    }}>
                                    {l.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* ═══════ RIGHT: LANGUAGE + AUTH / HAMBURGER ═══════ */}
                <div style={{ ...styles.authSection, gap: isMobile ? 8 : 10 }}>
                    <LanguageToggle variant={isMobile ? 'compact' : 'default'} />
                    {!isMobile && authButtons}
                    {isMobile && (
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            style={styles.menuBtn}
                            aria-label="Menu">
                            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                        </button>
                    )}
                </div>
            </div>

            {/* ═══════ MOBILE PANEL ═══════ */}
            {isMobile && menuOpen && (
                <div style={styles.mobilePanel}>
                    {navLinks.map((l) => (
                        <Link
                            key={l.path}
                            to={l.path}
                            style={{
                                ...styles.mobileLink,
                                ...(isActive(l.path) ? styles.mobileLinkActive : {})
                            }}>
                            {l.label}
                        </Link>
                    ))}
                    <div style={styles.mobileAuth}>{authButtons}</div>
                </div>
            )}
        </nav>
    );
};

const styles = {
    nav: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '1px solid rgba(226,232,240,0.6)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
    },
    container: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 40px',
        gap: '30px'
    },
    logoWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        textDecoration: 'none',
        flexShrink: 0,
        minWidth: 0
    },
    logoIconBox: {
        width: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        background: '#ffffff',
        padding: '2px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #E5E7EB',
        flexShrink: 0
    },

    // ═══ BRAND TEXT (Marathi + English) ═══
    brandText: {
        display       : 'flex',
        flexDirection : 'column',
        lineHeight    : '1.15',
        alignItems    : 'flex-start'
    },
    brandNameMarathi: {
        fontSize      : '20px',
        fontWeight    : '800',
        letterSpacing : '-0.3px',
        fontFamily    : "'Noto Sans Devanagari', sans-serif",
        display       : 'flex',
        alignItems    : 'center',
        gap           : '2px'
    },
    marathiOrange: {
        color : '#FF6B1A'
    },
    marathiDash: {
        color      : '#1E3A8A',
        margin     : '0 2px',
        fontWeight : '900'
    },
    marathiGreen: {
        color : '#138808'
    },
    brandNameEnglish: {
        fontSize      : '15px',
        fontWeight    : '800',
        color         : '#111827',
        letterSpacing : '-0.2px',
        marginTop     : '2px',
        fontFamily    : "'Plus Jakarta Sans', sans-serif"
    },

    // ═══ NAV LINKS ═══
    linksWrap: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center'
    },
    links: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: 'rgba(243,244,246,0.5)',
        padding: '6px',
        borderRadius: '100px',
        border: '1px solid rgba(226,232,240,0.6)'
    },
    link: {
        position: 'relative',
        color: '#4B5563',
        textDecoration: 'none',
        fontSize: '15px',
        fontWeight: '600',
        padding: '10px 22px',
        borderRadius: '100px',
        transition: 'all 0.25s ease',
        minWidth: '90px',
        textAlign: 'center',
        whiteSpace: 'nowrap'
    },
    activeLink: {
        color: '#ffffff',
        backgroundColor: '#4F46E5',
        boxShadow: '0 4px 12px rgba(79,70,229,0.35)'
    },
    hoverLink: {
        color: '#111827',
        backgroundColor: '#ffffff'
    },

    // ═══ AUTH BUTTONS ═══
    authSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexShrink: 0
    },
    signInBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#111827',
        textDecoration: 'none',
        padding: '11px 22px',
        fontSize: '14px',
        fontWeight: '600',
        borderRadius: '10px',
        backgroundColor: 'transparent',
        border: '1.5px solid #E5E7EB',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        whiteSpace: 'nowrap'
    },
    signInBtnHover: {
        backgroundColor: '#F9FAFB',
        borderColor: '#4F46E5',
        color: '#4F46E5'
    },
    ctaBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
        color: '#ffffff',
        textDecoration: 'none',
        padding: '12px 24px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '600',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
        transition: 'all 0.25s ease',
        whiteSpace: 'nowrap'
    },
    ctaBtnHover: {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 24px rgba(79,70,229,0.45)'
    },
    userChip: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        padding: '6px 16px 6px 6px',
        backgroundColor: '#F3F4F6',
        borderRadius: '100px',
        textDecoration: 'none',
        border: '1px solid #E5E7EB',
        transition: 'all 0.2s'
    },
    userAvatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: '700'
    },
    userName: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#111827'
    },
    logoutBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#EF4444',
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: '600',
        borderRadius: '10px',
        backgroundColor: 'transparent',
        border: '1.5px solid #FEE2E2',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },

    // ═══ MOBILE ═══
    menuBtn: {
        width: 42,
        height: 42,
        borderRadius: 10,
        border: '1.5px solid #E5E7EB',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0
    },
    mobilePanel: {
        padding: '8px 16px 18px',
        borderTop: '1px solid #E5E7EB',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        maxHeight: 'calc(100dvh - 64px)',
        overflowY: 'auto'
    },
    mobileLink: {
        padding: '14px 16px',
        borderRadius: 10,
        fontSize: 16,
        fontWeight: 600,
        color: '#374151'
    },
    mobileLinkActive: {
        background: '#EEF2FF',
        color: '#4F46E5'
    },
    mobileAuth: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        marginTop: 10
    }
};

export default Navbar;