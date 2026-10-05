import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LanguageToggle from '../common/LanguageToggle';
import {
    FiHome, FiUser, FiHeart, FiTarget, FiBookOpen,
    FiCheckCircle, FiFileText, FiBell, FiSearch,
    FiLogOut, FiChevronDown, FiSettings,
    FiMenu, FiX, FiMail
} from 'react-icons/fi';
import { contactAPI } from '../../services/api';
import { HiSparkles } from 'react-icons/hi2';
import useMediaQuery from '../../utils/useMediaQuery';

const UserLayout = ({ children, isAdmin = false }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const isMobile = useMediaQuery('(max-width: 1024px)');
    const [showProfile, setShowProfile] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 1024);

    // ─── Unread messages count for admin ───
    const [unreadMessages, setUnreadMessages] = useState(0);

    // Screen size badalne pe sidebar sahi state me aaye
    useEffect(() => {
        setSidebarOpen(!isMobile);
    }, [isMobile]);

    // Page badalne pe: profile dropdown band, mobile pe drawer band
    useEffect(() => {
        setShowProfile(false);
        if (isMobile) setSidebarOpen(false);
    }, [location.pathname]);

    // ─── Fetch unread count every 30s (admin only) ───
    useEffect(() => {
        if (isAdmin) {
            const fetchUnread = async () => {
                try {
                    const res = await contactAPI.getUnreadCount();
                    setUnreadMessages(res.data?.data?.count || 0);
                } catch (err) { console.error(err); }
            };
            fetchUnread();
            const interval = setInterval(fetchUnread, 30000);
            return () => clearInterval(interval);
        }
    }, [isAdmin]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const userMenu = [
        {
            section: 'MAIN',
            items: [
                { icon: <FiHome size={17} />, label: 'Dashboard', to: '/user/dashboard' }
            ]
        },
        {
            section: 'MY ACCOUNT',
            items: [
                { icon: <FiUser size={17} />,  label: 'Profile Details', to: '/user/profile' },
                { icon: <FiHeart size={17} />, label: 'Saved Schemes',   to: '/user/saved' },
                { icon: <FiBell size={17} />,  label: 'Notifications',   to: '/user/notifications' }
            ]
        },
        {
            section: 'SCHEMES & BENEFITS',
            items: [
                { icon: <FiTarget size={17} />,      label: 'Recommendations',   to: '/user/recommendations' },
                { icon: <FiBookOpen size={17} />,    label: 'All Schemes',       to: '/user/schemes' },
                { icon: <FiCheckCircle size={17} />, label: 'Eligibility Check', to: '/user/eligibility' },
                { icon: <FiFileText size={17} />,    label: 'Scheme Comparison', to: '/user/comparison' },
                { icon: <FiTarget size={17} />,      label: 'Benefit Timeline',  to: '/user/timeline' },
                { icon: <FiUser size={17} />,        label: 'Family Dashboard',  to: '/user/family' }
            ]
        }
    ];

    const adminMenu = [
        {
            section: 'MAIN',
            items: [
                { icon: <FiHome size={17} />, label: 'Dashboard', to: '/admin/dashboard' }
            ]
        },
        {
            section: 'MANAGEMENT',
            items: [
                { icon: <FiBookOpen size={17} />, label: 'Manage Schemes', to: '/admin/schemes' },
                { icon: <FiUser size={17} />,     label: 'Manage Users',   to: '/admin/users' },
                {
                    icon: <FiMail size={17} />,
                    label: 'Messages',
                    to: '/admin/messages',
                    badge: unreadMessages > 0 ? unreadMessages : null
                }
            ]
        },
        {
            section: 'ADMIN',
            items: [
                { icon: <FiSettings size={17} />, label: 'Settings', to: '/admin/settings' }
            ]
        }
    ];

    const menu = isAdmin ? adminMenu : userMenu;

    const isActive = (path) =>
        location.pathname === path ||
        (path === '/user/schemes' && location.pathname.startsWith('/user/schemes/'));

    const getPageTitle = () => {
        const path = location.pathname;
        const titles = {
            '/user/dashboard':       'Dashboard',
            '/user/profile':         'Profile',
            '/user/saved':           'Saved Schemes',
            '/user/schemes':         'All Schemes',
            '/user/recommendations': 'Recommendations',
            '/user/eligibility':     'Eligibility Check',
            '/user/comparison':      'Scheme Comparison',
            '/user/timeline':        'Benefit Timeline',
            '/user/family':          'Family Dashboard',
            '/user/applications':    'My Applications',
            '/user/notifications':   'Notifications',
            '/admin/dashboard':      'Admin Dashboard',
            '/admin/schemes':        'Manage Schemes',
            '/admin/users':          'Manage Users',
            '/admin/messages':       'Contact Messages',
            '/admin/settings':       'Admin Settings'
        };
        if (path.startsWith('/user/schemes/')) return 'Scheme Details';
        return titles[path] || 'Dashboard';
    };

    const sidebarVisible = sidebarOpen || isMobile;

    return (
        <div style={styles.wrapper}>

            {/* ═══════ BACKDROP (mobile drawer khula ho tab) ═══════ */}
            {isMobile && sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={styles.backdrop}
                />
            )}

            {/* ═══════ SIDEBAR (FIXED POSITION) ═══════ */}
            <aside style={{
                ...styles.sidebar,
                height: '100dvh',
                width: isMobile ? '280px' : (sidebarOpen ? '260px' : '0'),
                maxWidth: '85vw',
                padding: sidebarVisible ? '24px 16px' : '0',
                transform: isMobile && !sidebarOpen ? 'translateX(-100%)' : 'none',
                boxShadow: isMobile && !sidebarOpen ? 'none' : styles.sidebar.boxShadow,
                transition: 'width 0.3s ease, padding 0.3s ease, transform 0.3s ease'
            }}>
                {sidebarVisible && (
                    <>
                        {/* Close button (sirf mobile drawer me) */}
                        {isMobile && (
                            <button
                                onClick={() => setSidebarOpen(false)}
                                style={styles.drawerClose}
                                aria-label="Close menu">
                                <FiX size={18} />
                            </button>
                        )}

                        {/* Logo */}
                        <Link to="/" style={styles.logoWrap}>
                            <div style={styles.logoIcon}>
                                <svg width="30" height="30" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="48" fill="#fff" stroke="#E5E7EB" strokeWidth="1"/>
                                    <path d="M50 8 A42 42 0 0 1 88 65" stroke="#FF9933" strokeWidth="5" strokeLinecap="round" fill="none"/>
                                    <path d="M12 60 A42 42 0 0 0 55 92" stroke="#138808" strokeWidth="5" strokeLinecap="round" fill="none"/>
                                    <path d="M42 42 Q50 32,58 42 L58 46 L42 46 Z" fill="#1E3A8A"/>
                                    <rect x="36" y="50" width="28" height="22" fill="#1E3A8A"/>
                                </svg>
                            </div>
                            <div className="notranslate" translate="no">
                                <div style={styles.logoMarathi}>
                                    <span style={{ color: '#FF9933' }}>माझी</span>
                                    <span style={{ color: '#fff', margin: '0 2px' }}>-</span>
                                    <span style={{ color: '#4ADE80' }}>योजना</span>
                                </div>
                                <div style={styles.logoEng}>
                                    {isAdmin ? 'Admin Panel' : 'Majhi Yojana'}
                                </div>
                            </div>
                        </Link>

                        {/* Menu */}
                        <div style={styles.menuWrap}>
                            {menu.map((section, i) => (
                                <div key={i} style={styles.menuSection}>
                                    <div style={styles.menuHeading}>{section.section}</div>
                                    {section.items.map((item, j) => (
                                        <Link
                                            key={j}
                                            to={item.to}
                                            style={{
                                                ...styles.menuItem,
                                                ...(isActive(item.to) ? styles.menuItemActive : {})
                                            }}>
                                            <span style={{
                                                ...styles.menuIcon,
                                                color: isActive(item.to) ? '#FF9933' : 'rgba(255,255,255,0.6)'
                                            }}>
                                                {item.icon}
                                            </span>
                                            <span style={styles.menuLabel}>{item.label}</span>
                                            {item.badge && (
                                                <span style={styles.menuBadge}>{item.badge}</span>
                                            )}
                                            {isActive(item.to) && <span style={styles.menuActiveDot} />}
                                        </Link>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Help Card */}
                        <div style={styles.helpCard}>
                            <div style={styles.helpIcon}>
                                <HiSparkles size={22} color="#4ADE80" />
                            </div>
                            <div style={styles.helpTitle}>Need Help?</div>
                            <p style={styles.helpText}>Email Support</p>
                            <p style={styles.infoText}>
                                support@majhiyojana.ai<br />
                                <span style={styles.infoSub}>Reply within 24 hours</span>
                            </p>
                        </div>
                    </>
                )}
            </aside>

            {/* ═══════ MAIN AREA — with dynamic margin ═══════ */}
            <div style={{
                ...styles.mainArea,
                marginLeft: (!isMobile && sidebarOpen) ? '260px' : '0'
            }}>

                {/* TOP BAR */}
                <header style={{
                    ...styles.topbar,
                    padding: isMobile ? '10px 14px' : '16px 30px',
                    gap: isMobile ? 8 : 20
                }}>
                    <div style={{ ...styles.topLeft, minWidth: 0, gap: isMobile ? 10 : 16 }}>
                        <button onClick={() => setSidebarOpen(!sidebarOpen)}
                            style={styles.toggleBtn}
                            aria-label="Toggle menu">
                            {sidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
                        </button>

                        <div style={{ minWidth: 0 }}>
                            {!isMobile && (
                                <div style={styles.breadcrumb}>Majhi Yojana / {getPageTitle()}</div>
                            )}
                            <h1 style={{
                                ...styles.pageTitle,
                                fontSize: isMobile ? 16 : 20,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {getPageTitle()}
                            </h1>
                        </div>
                    </div>

                    <div style={{ ...styles.topRight, flexShrink: 0, gap: isMobile ? 6 : 10 }}>
                        <LanguageToggle variant={isMobile ? 'compact' : 'default'} />
                        <div style={styles.profileWrap}>
                            <button
                                onClick={() => setShowProfile(!showProfile)}
                                style={{
                                    ...styles.profileBtn,
                                    padding: isMobile ? '4px' : '6px 14px 6px 6px'
                                }}>
                                <div style={styles.avatar}>
                                    {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                {!isMobile && (
                                    <div style={styles.profileInfo}>
                                        <div style={styles.profileName}>
                                            {user?.fullName?.split(' ')[0] || 'User'}
                                        </div>
                                        <div style={styles.profileRole}>
                                            {isAdmin ? 'Admin' : 'Citizen'}
                                        </div>
                                    </div>
                                )}
                                {!isMobile && <FiChevronDown size={14} color="#6B7280" />}
                            </button>

                            {showProfile && (
                                <div style={styles.dropdown}>
                                    <div style={styles.dropdownHeader}>
                                        <div style={{ ...styles.avatar, width: 44, height: 44, fontSize: 18 }}>
                                            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={styles.dropName}>{user?.fullName || 'User'}</div>
                                            <div style={styles.dropEmail}>{user?.email || 'user@example.com'}</div>
                                        </div>
                                    </div>
                                    <div style={styles.dropdownDivider} />

                                    {/* ═══ ADMIN MENU ═══ */}
                                    {isAdmin ? (
                                        <>
                                            <Link to="/admin/dashboard" style={styles.dropdownItem}>
                                                <FiHome size={15} /> Dashboard
                                            </Link>
                                            <Link to="/admin/settings" style={styles.dropdownItem}>
                                                <FiSettings size={15} /> Admin Settings
                                            </Link>
                                        </>
                                    ) : (
                                        /* ═══ USER MENU ═══ */
                                        <>
                                            <Link to="/user/profile" style={styles.dropdownItem}>
                                                <FiUser size={15} /> My Profile
                                            </Link>
                                            <Link to="/user/saved" style={styles.dropdownItem}>
                                                <FiHeart size={15} /> Saved Schemes
                                            </Link>
                                            <Link to="/user/notifications" style={styles.dropdownItem}>
                                                <FiBell size={15} /> Notifications
                                            </Link>
                                        </>
                                    )}

                                    <div style={styles.dropdownDivider} />
                                    <button onClick={handleLogout}
                                        style={{ ...styles.dropdownItem, color: '#EF4444' }}>
                                        <FiLogOut size={15} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div
                    className="mj-content"
                    style={{
                        ...styles.content,
                        padding: isMobile ? '16px 14px' : '28px 30px'
                    }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════
   STYLES — FIXED SIDEBAR (fixed position)
═══════════════════════════════════════════ */
const styles = {
    wrapper: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F0F4FF 0%, #FFF7ED 100%)',
        position: 'relative'
    },

    backdrop: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 49
    },

    /* ═══ SIDEBAR — FIXED POSITION (Full Height Always!) ═══ */
    sidebar: {
        background: 'linear-gradient(180deg, #1E1B4B 0%, #312E81 60%, #1E3A8A 100%)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        flexShrink: 0,
        transition: 'width 0.3s ease, padding 0.3s ease',
        boxShadow: '4px 0 24px rgba(30,27,75,0.15)',
        zIndex: 50,
        overflowY: 'auto',
        overflowX: 'hidden'
    },
    drawerClose: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 34,
        height: 34,
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.2)',
        background: 'rgba(255,255,255,0.08)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 2
    },
    logoWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '0 6px 22px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        marginBottom: '20px',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        flexShrink: 0
    },
    logoIcon: {
        width: '40px', height: '40px',
        borderRadius: '50%',
        background: '#ffffff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        flexShrink: 0
    },
    logoMarathi: {
        fontSize: '15px', fontWeight: '800',
        fontFamily: "'Noto Sans Devanagari', sans-serif",
        lineHeight: '1.1'
    },
    logoEng: {
        fontSize: '10.5px', fontWeight: '600',
        color: 'rgba(255,255,255,0.6)', marginTop: '2px'
    },
    menuWrap: {
        flex: 1,
        minHeight: 0
    },
    menuSection: { marginBottom: '20px' },
    menuHeading: {
        fontSize: '10px', fontWeight: '800',
        color: 'rgba(255,255,255,0.35)',
        letterSpacing: '1.5px', padding: '0 12px 10px',
        textTransform: 'uppercase', whiteSpace: 'nowrap'
    },
    menuItem: {
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '10px 12px', borderRadius: '8px',
        color: 'rgba(255,255,255,0.75)',
        textDecoration: 'none', fontSize: '13.5px',
        fontWeight: '500', marginBottom: '2px',
        transition: 'all 0.2s ease', position: 'relative',
        whiteSpace: 'nowrap'
    },
    menuItemActive: {
        background: 'rgba(255,255,255,0.12)',
        color: '#ffffff', fontWeight: '700'
    },
    menuIcon: { display: 'flex', transition: 'color 0.2s' },
    menuLabel: { flex: 1 },
    menuBadge: {
        background: '#EF4444',
        color: '#ffffff', padding: '2px 7px',
        borderRadius: '100px', fontSize: '9.5px', fontWeight: '700'
    },
    menuActiveDot: {
        position: 'absolute', right: '10px',
        width: '6px', height: '6px',
        borderRadius: '50%', background: '#FF9933'
    },
    helpCard: {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '14px', padding: '18px 16px',
        textAlign: 'center', flexShrink: 0,
        marginTop: 'auto'
    },
    helpIcon: {
        width: '44px', height: '44px',
        borderRadius: '50%',
        background: 'rgba(74,222,128,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 10px'
    },
    helpTitle: {
        fontSize: '13px', fontWeight: '800',
        color: '#ffffff', marginBottom: '4px'
    },
    helpText: {
        fontSize: '11.5px',
        color: 'rgba(255,255,255,0.6)',
        marginBottom: '12px', lineHeight: '1.5'
    },
    helpBtn: {
        display: 'inline-block',
        background: 'linear-gradient(135deg, #FF9933 0%, #F97316 100%)',
        color: '#ffffff', padding: '8px 18px',
        borderRadius: '8px', fontSize: '12px', fontWeight: '700',
        textDecoration: 'none',
        boxShadow: '0 4px 12px rgba(249,115,22,0.35)'
    },

    /* ═══ MAIN AREA — with dynamic margin ═══ */
    mainArea: {
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        minHeight: '100vh',
        transition: 'margin-left 0.3s ease'
    },

    /* ═══ TOPBAR ═══ */
    topbar: {
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(226,232,240,0.5)',
        padding: '16px 30px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: '20px',
        position: 'sticky', top: 0,
        zIndex: 40,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
    },
    topLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
    toggleBtn: {
        width: '38px', height: '38px',
        borderRadius: '10px',
        border: '1.5px solid #E5E7EB',
        background: '#ffffff', color: '#4B5563',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
    },
    breadcrumb: {
        fontSize: '11px', color: '#9CA3AF',
        fontWeight: '600', letterSpacing: '0.3px',
        marginBottom: '2px'
    },
    pageTitle: {
        fontSize: '20px', fontWeight: '800',
        color: '#111827', letterSpacing: '-0.5px',
        margin: 0
    },
    topRight: { display: 'flex', alignItems: 'center', gap: '10px' },
    searchWrap: { position: 'relative' },
    searchIcon: {
        position: 'absolute', left: '12px',
        top: '50%', transform: 'translateY(-50%)',
        color: '#9CA3AF', fontSize: '14px'
    },
    searchInput: {
        width: '240px', padding: '9px 14px 9px 36px',
        border: '1.5px solid #E5E7EB', borderRadius: '10px',
        fontSize: '13px', background: '#F9FAFB',
        color: '#111827', outline: 'none',
        fontFamily: 'inherit', fontWeight: '500'
    },
    iconBtn: {
        width: '40px', height: '40px',
        border: '1.5px solid #E5E7EB', borderRadius: '10px',
        background: '#ffffff', color: '#4B5563',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', position: 'relative'
    },
    notifDot: {
        position: 'absolute', top: '10px', right: '11px',
        width: '8px', height: '8px', background: '#EF4444',
        borderRadius: '50%', border: '2px solid #ffffff'
    },
    profileWrap: { position: 'relative' },
    profileBtn: {
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '6px 14px 6px 6px',
        border: '1.5px solid #E5E7EB',
        borderRadius: '100px', background: '#ffffff',
        cursor: 'pointer', fontFamily: 'inherit'
    },
    avatar: {
        width: '34px', height: '34px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
        color: '#ffffff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '14px', fontWeight: '800', flexShrink: 0
    },
    profileInfo: { textAlign: 'left' },
    profileName: {
        fontSize: '13px', fontWeight: '700',
        color: '#111827', lineHeight: '1.2'
    },
    profileRole: {
        fontSize: '10.5px', color: '#9CA3AF',
        fontWeight: '600', marginTop: '1px'
    },
    dropdown: {
        position: 'absolute', top: 'calc(100% + 8px)', right: 0,
        width: 'min(260px, calc(100vw - 28px))', background: '#ffffff',
        borderRadius: '14px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
        border: '1px solid #E5E7EB',
        overflow: 'hidden', zIndex: 200
    },
    dropdownHeader: {
        display: 'flex', alignItems: 'center', gap: '12px', padding: '16px'
    },
    dropName: { fontSize: '14px', fontWeight: '800', color: '#111827' },
    dropEmail: {
        fontSize: '12px', color: '#6B7280', marginTop: '2px',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
    },
    dropdownDivider: { height: '1px', background: '#F3F4F6' },
    dropdownItem: {
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '11px 16px', fontSize: '13.5px',
        color: '#374151', fontWeight: '500',
        cursor: 'pointer', textDecoration: 'none',
        border: 'none', background: 'transparent',
        width: '100%', textAlign: 'left', fontFamily: 'inherit'
    },

    /* CONTENT */
    content: {
        flex: 1,
        padding: '28px 30px',
        background: 'transparent',
        minWidth: 0
    }
};

export default UserLayout;