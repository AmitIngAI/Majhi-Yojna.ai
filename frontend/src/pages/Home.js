import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiSparkles, HiArrowRight } from 'react-icons/hi2';
import {
    FiUsers, FiTrendingUp, FiAward, FiTarget,
    FiUserPlus, FiCpu, FiFileText
} from 'react-icons/fi';
import {
    FaGraduationCap, FaBriefcase,
    FaTractor, FaBalanceScale, FaHome, FaTh
} from 'react-icons/fa';

/* COUNTER HOOK — animates numbers on scroll */
const useCounter = (target, duration = 2000, startCounting) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!startCounting) return;
        let start = 0;
        const numericTarget = parseFloat(String(target).replace(/[^0-9.]/g, ''));
        const isDecimal = String(target).includes('.');
        const step = numericTarget / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= numericTarget) {
                setCount(numericTarget);
                clearInterval(timer);
            } else {
                setCount(isDecimal ? parseFloat(start.toFixed(1)) : Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [startCounting, target, duration]);
    return count;
};

/* ANIMATED STAT COMPONENT */
const AnimatedStat = ({ value, label, icon, prefix = '', suffix = '', started }) => {
    const numericValue = parseFloat(String(value).replace(/[^0-9.]/g, ''));
    const count = useCounter(numericValue, 2000, started);
    const isDecimal = String(value).includes('.');

    const displayValue = `${prefix}${isDecimal ? count.toFixed(1) : Math.floor(count)}${suffix}`;

    return (
        <div style={styles.statCard}>
            <div style={styles.statIcon}>{icon}</div>
            <div
                style={styles.statValue}
                className="notranslate"
                translate="no"
            >
                {displayValue}
            </div>
            <div style={styles.statLabel}>{label}</div>
        </div>
    );
};

/* MAIN HOME COMPONENT */
const Home = () => {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [hoveredCat, setHoveredCat] = useState(null);
    const [statsVisible, setStatsVisible] = useState(false);
    const statsRef = useRef(null);

    // ── Intersection Observer for counter animation
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setStatsVisible(true);
            },
            { threshold: 0.3 }
        );
        if (statsRef.current) observer.observe(statsRef.current);
        return () => observer.disconnect();
    }, []);

    // ───  LATEST UPDATES ───
    const latestUpdates = [
        '🎓 Post-Matric Scholarship for SC/ST/OBC students — Applications open for 2025-26',
        '👩 Ladki Bahin Yojana — ₹1,500/month for eligible women aged 21-65 years',
        '🌾 PM Kisan Samman Nidhi — ₹6,000/year direct benefit for Maharashtra farmers',
        '🏠 Ramai Awas Gharkul Yojana — Free housing for SC/ST families in Maharashtra',
        '💊 Mahatma Jyotirao Phule Jan Arogya Yojana — Free medical treatment up to ₹5 lakh',
        '🍽️ Shiv Bhojan Thali — Nutritious meals at just ₹10 across Maharashtra',
        '💼 Annasaheb Patil Loan Scheme — Interest-free loans up to ₹10 lakh for youth',
        '🚜 Mahatma Jyotiba Phule Krishi Karj Mafi — Loan waiver for eligible farmers',
        '🤖 NEW: AI-powered scheme recommendations now available — Sign up free!'
    ];

    // ─── CATEGORIES ───
    const categories = [
        {
            title: 'EDUCATION',
            count: ' Schemes',
            image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=85',
            icon: <FaGraduationCap />,
            link: '/schemes?category=education'
        },
        {
            title: 'EMPLOYMENT',
            count: ' Schemes',
            image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=85',
            icon: <FaBriefcase />,
            link: '/schemes?category=employment'
        },
        {
            title: 'AGRICULTURE',
            count: ' Schemes',
            image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=85',
            icon: <FaTractor />,
            link: '/schemes?category=agriculture'
        },
        {
            title: 'SOCIAL JUSTICE',
            count: ' Schemes',
            image: 'https://images.unsplash.com/photo-1589391886645-d51941baf7fb?w=1200&q=85',
            icon: <FaBalanceScale />,
            link: '/schemes?category=social-justice'
        },
        {
            title: 'HOUSING',
            count: ' Schemes',
            image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=85',
            icon: <FaHome />,
            link: '/schemes?category=housing'
        },
        {
            title: 'WOMEN',
            count: ' Schemes',
            image: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=1200&q=85',
            icon: <FaTh />,
            link: '/schemes?category=women'
        }
    ];

    // ─── STATS (with prefix/suffix) ───
    const stats = [
        { value: '1000', suffix: '+', prefix: '', label: 'Active Citizens', icon: <FiUsers /> },
        { value: '5.2', suffix: 'Cr', prefix: '₹', label: 'Benefits Unlocked', icon: <FiTrendingUp /> },
        { value: '98.7', suffix: '%', prefix: '', label: 'AI Accuracy', icon: <FiTarget /> },
        { value: '30', suffix: '+', prefix: '', label: 'Verified Schemes', icon: <FiAward /> }
    ];

    // ─── HOW IT WORKS ───
    const steps = [
        {
            num: '01',
            icon: <FiUserPlus />,
            title: 'Create Your Profile',
            desc: 'Sign up in 30 seconds. Fill your basic details — age, income, occupation, and location.',
            color: '#4F46E5'
        },
        {
            num: '02',
            icon: <FiCpu />,
            title: 'AI Analyzes Instantly',
            desc: 'Our AI scans 30+ Maharashtra schemes and matches them based on eligibility rules.',
            color: '#F97316'
        },
        {
            num: '03',
            icon: <FiFileText />,
            title: 'Get Your Results',
            desc: 'Receive personalized recommendations with direct apply links and document checklists.',
            color: '#10B981'
        }
    ];

    const handleCTA = () => {
        if (isLoggedIn) navigate('/user/recommendations');
        else navigate('/register');
    };

    return (
        <div style={styles.wrapper}>

            {/* ═══════════  LATEST UPDATE TICKER ═══════════ */}
            <section style={styles.tickerSection}>
                <div style={styles.tickerBadge} className="notranslate" translate="no">
                    <span style={styles.tickerBadgeDot} />
                    Latest Update
                </div>
                <div style={styles.tickerWrap}>
                    <div style={styles.tickerTrack} className="ticker-track">
                        {[...latestUpdates, ...latestUpdates].map((update, i) => (
                            <span key={i} style={styles.tickerItem}>
                                <span style={styles.tickerDot}>●</span>
                                {update}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ CATEGORIES ═══════════ */}
            <section style={styles.categoriesSection}>
                <div style={styles.categoriesGrid}>
                    {categories.map((cat, i) => (
                        <Link
                            key={i}
                            to={cat.link}
                            onMouseEnter={() => setHoveredCat(i)}
                            onMouseLeave={() => setHoveredCat(null)}
                            style={styles.categoryCard}
                        >
                            <div style={{
                                ...styles.categoryBg,
                                backgroundImage: `url(${cat.image})`,
                                transform: hoveredCat === i ? 'scale(1.15)' : 'scale(1)'
                            }} />

                            <div style={styles.categoryBottomGradient} />

                            <div style={{
                                ...styles.categoryContent,
                                transform: hoveredCat === i ? 'translateY(-15px)' : 'translateY(0)'
                            }}>
                                <div style={{
                                    ...styles.categoryIcon,
                                    transform: hoveredCat === i ? 'scale(1.2) rotate(-5deg)' : 'scale(1)'
                                }}>
                                    {cat.icon}
                                </div>
                                <h3 style={styles.categoryTitle}>{cat.title}</h3>
                                <p style={styles.categoryCount}>{cat.count}</p>

                                <div style={{
                                    ...styles.categoryHoverCta,
                                    opacity: hoveredCat === i ? 1 : 0,
                                    transform: hoveredCat === i ? 'translateY(0)' : 'translateY(20px)'
                                }}>
                                    Explore Schemes <HiArrowRight style={{ marginLeft: 6 }} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ═══════════ ANIMATED STATS BAR ═══════════ */}
            <section ref={statsRef} style={styles.statsSection}>
                <div style={styles.statsInner}>
                    {stats.map((s, i) => (
                        <AnimatedStat
                            key={i}
                            value={s.value}
                            label={s.label}
                            icon={s.icon}
                            prefix={s.prefix}
                            suffix={s.suffix}
                            started={statsVisible}
                        />
                    ))}
                </div>
            </section>

            {/* ═══════════ HOW IT WORKS ═══════════ */}
            <section style={styles.howSection}>
                <div style={styles.container}>
                    <div style={styles.sectionHeader}>
                        <div style={styles.sectionBadge}>HOW IT WORKS</div>
                        <h2 style={styles.sectionTitle}>
                            Get started in <span style={styles.underline}>3 simple steps</span>
                        </h2>
                        <p style={styles.sectionDesc}>
                            From signup to receiving benefits — the entire process takes less than 5 minutes.
                        </p>
                    </div>

                    <div style={styles.stepsRow}>
                        {steps.map((step, i) => (
                            <React.Fragment key={i}>
                                <div style={styles.stepCard}>
                                    <div style={{
                                        ...styles.stepIconBox,
                                        background: `linear-gradient(135deg, ${step.color} 0%, ${step.color}CC 100%)`,
                                        boxShadow: `0 10px 30px ${step.color}40`
                                    }}>
                                        {step.icon}
                                    </div>
                                    <div
                                        style={{ ...styles.stepNum, color: step.color }}
                                        className="notranslate"
                                        translate="no"
                                    >
                                        STEP {step.num}
                                    </div>
                                    <h3 style={styles.stepTitle}>{step.title}</h3>
                                    <p style={styles.stepDesc}>{step.desc}</p>
                                </div>

                                {i < steps.length - 1 && (
                                    <div style={styles.stepArrow}>
                                        <HiArrowRight />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ ANIMATIONS ═══ */}
            <style>{`
                @keyframes ticker {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50%      { opacity: 0.3; }
                }
                .ticker-track:hover {
                    animation-play-state: paused !important;
                }

                /* Extra safety for Google Translate */
                .notranslate {
                    unicode-bidi: isolate;
                }
            `}</style>
        </div>
    );
};

/* STYLES — */
const styles = {
    wrapper: {
        width: '100%',
        backgroundColor: '#ffffff',
        color: '#111827'
    },

    tickerSection: {
        width: '100%',
        background: 'linear-gradient(90deg, #1E1B4B 0%, #312E81 50%, #1E3A8A 100%)',
        display: 'flex',
        alignItems: 'center',
        height: '48px',
        overflow: 'hidden',
        position: 'relative',
        borderBottom: '2px solid #FF9933'
    },
    tickerBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: 'linear-gradient(135deg, #FF9933 0%, #F97316 100%)',
        color: '#ffffff',
        padding: '10px 24px 10px 20px',
        fontSize: '12.5px',
        fontWeight: '800',
        letterSpacing: '0.5px',
        height: '100%',
        flexShrink: 0,
        position: 'relative',
        zIndex: 2,
        clipPath: 'polygon(0 0, 100% 0, calc(100% - 16px) 100%, 0 100%)',
        paddingRight: '36px',
        boxShadow: '4px 0 12px rgba(0,0,0,0.15)',
        textTransform: 'uppercase'
    },
    tickerBadgeDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#ffffff',
        display: 'inline-block',
        animation: 'blink 1.5s infinite'
    },
    tickerWrap: {
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
        height: '100%',
        display: 'flex',
        alignItems: 'center'
    },
    tickerTrack: {
        display: 'flex',
        alignItems: 'center',
        gap: '50px',
        whiteSpace: 'nowrap',
        animation: 'ticker 60s linear infinite',
        willChange: 'transform',
        paddingLeft: '30px'
    },
    tickerItem: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '14px',
        color: '#ffffff',
        fontSize: '13.5px',
        fontWeight: '500',
        letterSpacing: '0.2px'
    },
    tickerDot: {
        color: '#FF9933',
        fontSize: '10px'
    },

    categoriesSection: {
        width: '100%',
        background: '#000000'
    },
    categoriesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '0',
        width: '100%',
        height: 'calc(100vh - 88px - 48px)',
        minHeight: '600px'
    },
    categoryCard: {
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        textDecoration: 'none',
        display: 'block'
    },
    categoryBg: {
        position: 'absolute',
        inset: 0,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 1
    },
    categoryBottomGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '65%',
        background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.9) 100%)',
        zIndex: 2,
        pointerEvents: 'none'
    },
    categoryContent: {
        position: 'absolute',
        left: '30px',
        right: '30px',
        bottom: '30px',
        zIndex: 3,
        color: '#ffffff',
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    categoryIcon: {
        fontSize: '38px',
        color: '#ffffff',
        marginBottom: '14px',
        opacity: 0.95,
        textShadow: '0 2px 12px rgba(0,0,0,0.5)',
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'inline-block'
    },
    categoryTitle: {
        fontSize: '24px',
        fontWeight: '800',
        marginBottom: '6px',
        letterSpacing: '0.5px',
        textShadow: '0 2px 12px rgba(0,0,0,0.6)',
        color: '#ffffff',
        lineHeight: '1.2',
        maxWidth: '90%'
    },
    categoryCount: {
        fontSize: '15px',
        fontWeight: '500',
        opacity: 0.95,
        textShadow: '0 2px 12px rgba(0,0,0,0.6)',
        color: '#ffffff'
    },
    categoryHoverCta: {
        display: 'inline-flex',
        alignItems: 'center',
        marginTop: '18px',
        padding: '10px 20px',
        backgroundColor: 'rgba(255,255,255,0.25)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '100px',
        fontSize: '13px',
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: '1px',
        border: '1px solid rgba(255,255,255,0.4)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        textTransform: 'uppercase'
    },

    statsSection: {
        width: '100%',
        background: 'linear-gradient(135deg, #1E1B4B 0%, #4F46E5 100%)',
        padding: '60px 60px'
    },
    statsInner: {
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        width: '100%'
    },
    statCard: { textAlign: 'center', color: 'white' },
    statIcon: { fontSize: '24px', marginBottom: '10px', opacity: 0.9 },
    statValue: {
        fontSize: '42px', fontWeight: '800',
        marginBottom: '6px', letterSpacing: '-1px'
    },
    statLabel: { fontSize: '15px', opacity: 0.85, fontWeight: '500' },

    container: { maxWidth: '1400px', margin: '0 auto', width: '100%' },
    sectionHeader: { textAlign: 'center', marginBottom: '60px' },
    sectionBadge: {
        display: 'inline-block',
        backgroundColor: 'rgba(79,70,229,0.08)', color: '#4338CA',
        padding: '6px 14px', borderRadius: '100px',
        fontSize: '12px', fontWeight: '700', letterSpacing: '1px',
        marginBottom: '16px'
    },
    sectionTitle: {
        fontSize: '44px', fontWeight: '800', lineHeight: '1.15',
        letterSpacing: '-1.5px', color: '#111827', marginBottom: '16px'
    },
    underline: { color: '#4F46E5' },
    sectionDesc: {
        fontSize: '18px', color: '#6B7280',
        maxWidth: '600px', margin: '0 auto', lineHeight: '1.6'
    },

    howSection: {
        padding: '100px 60px',
        background: '#F9FAFB',
        width: '100%'
    },
    stepsRow: {
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
        gap: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
    },
    stepCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: '40px 32px',
        borderRadius: '20px',
        border: '1px solid #E5E7EB',
        transition: 'all 0.3s ease',
        minHeight: '320px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
    },
    stepIconBox: {
        width: '72px',
        height: '72px',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
        color: '#ffffff',
        marginBottom: '24px'
    },
    stepNum: {
        fontSize: '12px',
        fontWeight: '800',
        letterSpacing: '2px',
        marginBottom: '10px'
    },
    stepTitle: {
        fontSize: '22px',
        fontWeight: '800',
        color: '#111827',
        marginBottom: '14px'
    },
    stepDesc: {
        fontSize: '15px',
        color: '#6B7280',
        lineHeight: '1.7'
    },
    stepArrow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px',
        color: '#4F46E5',
        alignSelf: 'center'
    }
};

export default Home;