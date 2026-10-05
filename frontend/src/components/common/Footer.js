import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi';

const Footer = () => {
    const [email, setEmail] = useState('');

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            alert(`Subscribed with: ${email}`);
            setEmail('');
        }
    };

    const productLinks = [
        { label: 'All Schemes', to: '/schemes' },
        { label: 'AI Recommendations', to: '/user/recommendations' },
        { label: 'Check Eligibility', to: '/user/eligibility' },
        { label: 'Saved Schemes', to: '/user/saved' },
        { label: 'Dashboard', to: '/user/dashboard' }
    ];

    const companyLinks = [
        { label: 'About Us', to: '/about' },
        { label: 'Contact', to: '/contact' }
    ];

    const categoryLinks = [
        { label: 'Education Schemes', to: '/schemes?category=education' },
        { label: 'Employment Schemes', to: '/schemes?category=employment' },
        { label: 'Agriculture Schemes', to: '/schemes?category=agriculture' },
        { label: 'Social Justice', to: '/schemes?category=social-justice' },
        { label: 'Housing Schemes', to: '/schemes?category=housing' }
    ];

    return (
        <footer style={styles.footer}>
            <div style={styles.topAccent}></div>

            <div style={styles.container} className="mj-footer-container">

                <div style={styles.topSection} className="mj-footer-grid">

                    {/* Brand Column */}
                    <div style={styles.brandCol} className="mj-footer-brand">
                        <div style={styles.logoWrap}>
                            {/* Government Building Logo */}
                            <div style={styles.logoIcon}>
                                <svg width="42" height="42" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                            <div style={styles.brandTextWrap} className="notranslate" translate="no">
                                <span style={styles.brandNameMarathi}>
                                    <span style={styles.marathiOrange}>माझी</span>
                                    <span style={styles.marathiDash}>-</span>
                                    <span style={styles.marathiGreen}>योजना</span>
                                </span>
                                <span style={styles.brandNameEnglish} className="mj-brand-eng">
                                    Majhi Yojana
                                </span>
                            </div>
                        </div>

                        <p style={styles.brandDesc}>
                            AI-powered platform helping Maharashtra citizens discover
                            and claim government welfare benefits they deserve. Free,
                            fast, and personalized.
                        </p>

                        <div style={styles.contactList}>
                            <div style={styles.contactItem}>
                                <HiMail style={styles.contactIcon} />
                                <span>support@majhiyojana.ai</span>
                            </div>
                            <div style={styles.contactItem}>
                                <HiPhone style={styles.contactIcon} />
                                <span>+91 1800-XXX-XXXX (Toll-Free)</span>
                            </div>
                            <div style={styles.contactItem}>
                                <HiLocationMarker style={styles.contactIcon} />
                                <span>Mumbai, Maharashtra, India</span>
                            </div>
                        </div>
                    </div>

                    <div style={styles.linkCol}>
                        <h4 style={styles.colHeading}>Product</h4>
                        {productLinks.map((link, i) => (
                            <Link
                                key={i}
                                to={link.to}
                                style={styles.footerLink}
                                onMouseEnter={(e) => e.target.style.color = '#818CF8'}
                                onMouseLeave={(e) => e.target.style.color = '#9CA3AF'}>
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div style={styles.linkCol}>
                        <h4 style={styles.colHeading}>Categories</h4>
                        {categoryLinks.map((link, i) => (
                            <Link
                                key={i}
                                to={link.to}
                                style={styles.footerLink}
                                onMouseEnter={(e) => e.target.style.color = '#818CF8'}
                                onMouseLeave={(e) => e.target.style.color = '#9CA3AF'}>
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div style={styles.linkCol}>
                        <h4 style={styles.colHeading}>Company</h4>
                        {companyLinks.map((link, i) => (
                            <Link
                                key={i}
                                to={link.to}
                                style={styles.footerLink}
                                onMouseEnter={(e) => e.target.style.color = '#818CF8'}
                                onMouseLeave={(e) => e.target.style.color = '#9CA3AF'}>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                <div style={styles.bottomBar} className="mj-footer-bottom">
                    <div style={styles.copyrightWrap}>
                        <span style={styles.copyrightText}>
                            © 2026 <strong style={{ color: '#fff' }}>Majhi Yojana</strong> — All Rights Reserved.
                        </span>
                    </div>

                    <div style={styles.statusWrap}>
                        <span style={styles.statusDot}></span>
                        <span style={styles.statusText}>All systems operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const styles = {
    footer: {
        position: 'relative',
        width: '100%',
        background: 'linear-gradient(180deg, #0F172A 0%, #020617 100%)',
        color: '#9CA3AF',
        overflow: 'hidden'
    },
    topAccent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #4F46E5 0%, #F97316 50%, #10B981 100%)'
    },
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '80px 60px 30px',
        width: '100%'
    },
    topSection: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr',
        gap: '50px',
        marginBottom: '50px'
    },
    brandCol: {},
    logoWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px'
    },
    logoIcon: {
        width: '50px',
        height: '50px',
        background: '#ffffff',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2px',
        boxShadow: '0 4px 14px rgba(255,255,255,0.15)',
        border: '2px solid rgba(255,255,255,0.1)',
        flexShrink: 0
    },

    // ═══ BRAND TEXT (Marathi + English) ═══
    brandTextWrap: {
        display       : 'flex',
        flexDirection : 'column',
        lineHeight    : '1.15',
        alignItems    : 'flex-start'
    },
    brandNameMarathi: {
        fontSize      : '26px',
        fontWeight    : '800',
        letterSpacing : '-0.3px',
        fontFamily    : "'Noto Sans Devanagari', sans-serif",
        display       : 'flex',
        alignItems    : 'center',
        gap           : '2px'
    },
    marathiOrange: {
        color : '#FF9933'
    },
    marathiDash: {
        color      : '#ffffff',
        margin     : '0 2px',
        fontWeight : '900'
    },
    marathiGreen: {
        color : '#10B981'
    },
    brandNameEnglish: {
        fontSize      : '17px',
        fontWeight    : '800',
        color         : '#ffffff',
        letterSpacing : '-0.2px',
        marginTop     : '3px',
        fontFamily    : "'Plus Jakarta Sans', sans-serif"
    },

    brandDesc: {
        fontSize: '14px',
        lineHeight: '1.7',
        color: '#9CA3AF',
        marginBottom: '24px'
    },
    contactList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    contactItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '13px',
        color: '#9CA3AF'
    },
    contactIcon: {
        color: '#818CF8',
        fontSize: '16px',
        flexShrink: 0
    },
    linkCol: {
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
    },
    colHeading: {
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: '700',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        marginBottom: '10px',
        position: 'relative',
        paddingBottom: '10px',
        borderBottom: '2px solid rgba(79,70,229,0.3)',
        width: 'fit-content'
    },
    footerLink: {
        color: '#9CA3AF',
        textDecoration: 'none',
        fontSize: '14px',
        transition: 'color 0.2s ease',
        cursor: 'pointer'
    },
    bottomBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '25px 0 0',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        marginTop: '30px',
        gap: '20px',
        flexWrap: 'wrap'
    },
    copyrightWrap: {},
    copyrightText: {
        fontSize: '13px',
        color: '#6B7280'
    },
    statusWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 14px',
        backgroundColor: 'rgba(16,185,129,0.1)',
        border: '1px solid rgba(16,185,129,0.25)',
        borderRadius: '100px'
    },
    statusDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: '#10B981',
        boxShadow: '0 0 8px #10B981',
        animation: 'pulse 2s ease-in-out infinite'
    },
    statusText: {
        fontSize: '12px',
        color: '#10B981',
        fontWeight: '600'
    }
};

export default Footer;