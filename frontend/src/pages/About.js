import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    HiArrowRight, HiSparkles, HiShieldCheck, HiGlobeAlt
} from 'react-icons/hi2';
import {
    FiUsers, FiAward, FiTarget, FiTrendingUp,
    FiCheckCircle, FiUserPlus
} from 'react-icons/fi';
import {
    FaGraduationCap, FaBriefcase, FaTractor,
    FaBalanceScale, FaHome, FaTh,
    FaRobot, FaDatabase, FaShieldAlt, FaCode
} from 'react-icons/fa';

/* ═══════════════════════════════════════════
   COUNTER HOOK
═══════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════
   ANIMATED STAT — FIXED (Google Translate proof)
═══════════════════════════════════════════ */
const AnimatedStat = ({ value, label, icon, prefix = '', suffix = '', started }) => {
    const numericValue = parseFloat(String(value).replace(/[^0-9.]/g, ''));
    const count = useCounter(numericValue, 2000, started);
    const isDecimal = String(value).includes('.');
    const displayValue = `${prefix}${isDecimal ? count.toFixed(1) : Math.floor(count)}${suffix}`;

    return (
        <div style={S.statCard}>
            <div style={S.statIconWrap}>{icon}</div>
            <div
                style={S.statValue}
                className="notranslate"
                translate="no"
            >
                {displayValue}
            </div>
            <div style={S.statLabel}>{label}</div>
        </div>
    );
};

/* ═══════════════════════════════════════════
   MAIN ABOUT COMPONENT
═══════════════════════════════════════════ */
const About = () => {
    const [statsVisible, setStatsVisible]     = useState(false);
    const [hoveredProblem, setHoveredProblem] = useState(null);
    const [hoveredTeam, setHoveredTeam]       = useState(null);
    const [activeTab, setActiveTab]           = useState('mission');
    const statsRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
            { threshold: 0.3 }
        );
        if (statsRef.current) observer.observe(statsRef.current);
        return () => observer.disconnect();
    }, []);

    const stats = [
        { value: '1000', suffix: '+', prefix: '', label: 'Citizens Helped',   icon: <FiUsers      size={22}/> },
        { value: '30',   suffix: '+', prefix: '', label: 'Verified Schemes',  icon: <FiAward      size={22}/> },
        { value: '98.7', suffix: '%', prefix: '', label: 'AI Accuracy',       icon: <FiTarget     size={22}/> },
        { value: '5.2',  suffix: 'Cr',prefix: '₹',label: 'Benefits Unlocked',icon: <FiTrendingUp size={22}/> }
    ];

    const problems = [
        {
            icon  : '😔',
            title : 'Lack of Awareness',
            desc  : 'Millions of eligible Maharashtra citizens never claim their welfare benefits simply because they don\'t know schemes exist.',
            color : '#EF4444',
            soft  : '#FEF2F2'
        },
        {
            icon  : '🌐',
            title : 'Scattered Information',
            desc  : 'Scheme information is scattered across dozens of government portals written in complex bureaucratic language.',
            color : '#F97316',
            soft  : '#FFF7ED'
        },
        {
            icon  : '📋',
            title : 'Complex Eligibility',
            desc  : 'Citizens struggle to understand if they qualify for schemes and what documents they need to apply.',
            color : '#8B5CF6',
            soft  : '#F5F3FF'
        }
    ];

    const missionTabs = {
        mission: {
            title  : '🎯 Our Mission',
            text   : 'To democratize access to Maharashtra government welfare schemes by leveraging Artificial Intelligence — ensuring every eligible citizen receives the benefits they are entitled to, regardless of digital literacy or language barriers.',
            points : ['Bridge the digital divide', 'Empower rural citizens', 'Simplify bureaucracy through AI']
        },
        vision: {
            title  : '🔭 Our Vision',
            text   : 'A Maharashtra where no eligible citizen misses out on welfare benefits. We envision a fully automated, transparent, and citizen-first benefits delivery system powered by AI.',
            points : ['Pan-Maharashtra coverage', '100% scheme awareness', 'Zero leakage of benefits']
        },
        values: {
            title  : '💎 Our Values',
            text   : 'Transparency, Inclusivity, and Innovation guide every decision we make. We believe technology should serve the underserved and that government data should work for citizens.',
            points : ['Citizen-first approach', 'Open & transparent AI', 'Continuous improvement']
        }
    };

    const govSchemeCategories = [
        { icon: <FaGraduationCap />, label: 'Education',     count: '05', color: '#4F46E5' },
        { icon: <FaBriefcase />,     label: 'Employment',    count: '06', color: '#10B981' },
        { icon: <FaTractor />,       label: 'Agriculture',   count: '06', color: '#F97316' },
        { icon: <FaBalanceScale />,  label: 'Social Justice',count: '05', color: '#8B5CF6' },
        { icon: <FaHome />,          label: 'Housing',       count: '05', color: '#EF4444' },
        { icon: <FaTh />,            label: 'Others',        count: '11', color: '#0EA5E9' }
    ];

    return (
        <div style={S.page}>

            {/* ══════════ 1. HERO ══════════ */}
            <section style={S.hero}>
                <div style={S.blob1} />
                <div style={S.blob2} />
                <div style={S.blob3} />

                <div style={S.chakraWatermark}>
                    <svg viewBox="0 0 100 100" width="100%" height="100%" opacity="0.06">
                        <circle cx="50" cy="50" r="45" stroke="white" strokeWidth="2" fill="none" />
                        {Array.from({ length: 24 }).map((_, i) => {
                            const a = (i * 15 * Math.PI) / 180;
                            return (
                                <line key={i}
                                    x1={50 + 10 * Math.cos(a)} y1={50 + 10 * Math.sin(a)}
                                    x2={50 + 44 * Math.cos(a)} y2={50 + 44 * Math.sin(a)}
                                    stroke="white" strokeWidth="1.5" />
                            );
                        })}
                        <circle cx="50" cy="50" r="10" stroke="white" strokeWidth="2" fill="none" />
                    </svg>
                </div>

                <div style={S.tricolorStrip}>
                    <div style={{ flex: 1, background: '#FF9933' }} />
                    <div style={{ flex: 1, background: '#ffffff' }} />
                    <div style={{ flex: 1, background: '#138808' }} />
                </div>

                <div style={S.heroContent}>
                    <div style={S.emblemRow}>
                        <div style={S.emblemBox}>
                            <svg width="72" height="72" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="48" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                                <path d="M50 8 A42 42 0 0 1 88 65" stroke="#FF9933" strokeWidth="4" strokeLinecap="round" fill="none" />
                                <path d="M12 60 A42 42 0 0 0 55 92" stroke="#138808" strokeWidth="4" strokeLinecap="round" fill="none" />
                                <path d="M42 42 Q50 32,58 42 L58 46 L42 46 Z" fill="white" opacity="0.9" />
                                <rect x="38" y="46" width="24" height="3" fill="white" opacity="0.8" />
                                <rect x="36" y="50" width="28" height="20" fill="white" opacity="0.15" stroke="white" strokeWidth="1" strokeOpacity="0.5" />
                                <circle cx="50" cy="50" r="6" stroke="white" strokeWidth="1.5" fill="none" opacity="0.7" />
                            </svg>
                        </div>

                        {/* ═══ CENTER TITLE — Brand name protected ═══ */}
                        <div style={S.heroTitleBlock}>
                            <h1 style={S.heroTitle} className="notranslate" translate="no">
                                <span style={S.heroTitleMarathi}>
                                    <span style={S.marathiOrange}>माझी</span>
                                    <span style={S.marathiDash}> - </span>
                                    <span style={S.marathiGreen}>योजना</span>
                                </span>
                            </h1>
                            <h2 style={S.heroSubTitle} className="notranslate" translate="no">
                                Majhi Yojana
                            </h2>
                            <p style={S.heroTagline}>AI-Powered Welfare Scheme Assistant</p>
                        </div>

                        <div style={{ ...S.emblemBox, opacity: 0.7 }}>
                            <svg width="72" height="72" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="48" fill="rgba(255,255,255,0.12)" stroke="rgba(255,153,51,0.6)" strokeWidth="1.5" />
                                {Array.from({ length: 8 }).map((_, i) => {
                                    const a = (i * 45 * Math.PI) / 180;
                                    return (
                                        <ellipse key={i}
                                            cx={50 + 30 * Math.cos(a)}
                                            cy={50 + 30 * Math.sin(a)}
                                            rx="6" ry="12"
                                            transform={`rotate(${i*45},${50+30*Math.cos(a)},${50+30*Math.sin(a)})`}
                                            fill="rgba(255,153,51,0.5)" />
                                    );
                                })}
                                <circle cx="50" cy="50" r="14" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
                                <circle cx="50" cy="50" r="5" fill="rgba(255,153,51,0.8)" />
                            </svg>
                        </div>
                    </div>

                    <p style={S.heroDesc}>
                        An AI-powered platform bridging the gap between Maharashtra
                        citizens and the government welfare schemes they deserve —
                        but don't know about.
                    </p>
                </div>

                <div style={S.tricolorStrip}>
                    <div style={{ flex: 1, background: '#FF9933' }} />
                    <div style={{ flex: 1, background: '#ffffff', opacity: 0.3 }} />
                    <div style={{ flex: 1, background: '#138808' }} />
                </div>
            </section>

            {/* ══════════ 2. ANIMATED STATS ══════════ */}
            <section ref={statsRef} style={S.statsSection}>
                <div style={S.statsInner}>
                    {stats.map((s, i) => (
                        <AnimatedStat key={i} {...s} started={statsVisible} />
                    ))}
                </div>
            </section>

            {/* ══════════ 3. MISSION / VISION / VALUES TABS ══════════ */}
            <section style={S.missionSection}>
                <div style={S.container}>
                    <div style={S.sectionHeader}>
                        <div style={S.sectionBadge}>
                            <HiGlobeAlt size={12} style={{ marginRight: 5 }} />
                            WHO WE ARE
                        </div>
                        <h2 style={S.sectionTitle}>
                            Driven by <span style={S.titleAccentBlue}>Purpose</span>,
                            Powered by <span style={S.titleAccentOrange}>AI</span>
                        </h2>
                    </div>

                    <div style={S.tabRow}>
                        {Object.keys(missionTabs).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    ...S.tabBtn,
                                    ...(activeTab === tab ? S.tabBtnActive : {})
                                }}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div style={S.tabContent}>
                        <div style={S.tabLeft}>
                            <h3 style={S.tabTitle}>{missionTabs[activeTab].title}</h3>
                            <p style={S.tabText}>{missionTabs[activeTab].text}</p>
                            <div style={S.tabPoints}>
                                {missionTabs[activeTab].points.map((pt, i) => (
                                    <div key={i} style={S.tabPoint}>
                                        <FiCheckCircle size={16} color="#4F46E5" />
                                        <span>{pt}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={S.tabRight}>
                            <div style={S.catGrid}>
                                {govSchemeCategories.map((c, i) => (
                                    <div key={i} style={{
                                        ...S.catChip,
                                        borderLeft  : `3px solid ${c.color}`,
                                        background  : `${c.color}08`
                                    }}>
                                        <span style={{ color: c.color, fontSize: 18 }}>{c.icon}</span>
                                        <div>
                                            <div style={S.catChipLabel}>{c.label}</div>
                                            <div
                                                style={{ ...S.catChipCount, color: c.color }}
                                                className="notranslate"
                                                translate="no"
                                            >
                                                {c.count} Schemes
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════ 4. PROBLEM ══════════ */}
            <section style={S.problemSection}>
                <div style={S.container}>
                    <div style={S.sectionHeader}>
                        <div style={{ ...S.sectionBadge, background: '#FEE2E2', color: '#DC2626' }}>
                            ⚠️ THE CHALLENGE
                        </div>
                        <h2 style={S.sectionTitle}>
                            Why Most Citizens Miss Out on
                            <span style={S.titleAccentOrange}> Their Benefits</span>
                        </h2>
                        <p style={S.sectionDesc}>
                            Maharashtra has 30+ active welfare schemes — yet majority
                            of eligible citizens never receive them.
                        </p>
                    </div>

                    <div style={S.problemGrid}>
                        {problems.map((p, i) => (
                            <div
                                key={i}
                                onMouseEnter={() => setHoveredProblem(i)}
                                onMouseLeave={() => setHoveredProblem(null)}
                                style={{
                                    ...S.problemCard,
                                    transform   : hoveredProblem === i ? 'translateY(-8px)' : 'translateY(0)',
                                    boxShadow   : hoveredProblem === i
                                        ? `0 20px 40px ${p.color}20`
                                        : '0 2px 15px rgba(0,0,0,0.06)',
                                    borderColor : hoveredProblem === i ? p.color : '#E5E7EB'
                                }}>
                                <div style={{ ...S.problemIconWrap, background: p.soft }}>
                                    <span style={{ fontSize: 36 }}>{p.icon}</span>
                                </div>
                                <div
                                    style={{ ...S.problemTag, background: p.soft, color: p.color }}
                                    className="notranslate"
                                    translate="no"
                                >
                                    Problem {i + 1}
                                </div>
                                <h3 style={S.problemTitle}>{p.title}</h3>
                                <p style={S.problemDesc}>{p.desc}</p>
                                <div style={{ ...S.problemBar, background: p.color }} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
};

/* ═══════════════════════════════════════════
   STYLES 
═══════════════════════════════════════════ */
const S = {
    page : { width: '100%', backgroundColor: '#ffffff', color: '#111827' },

    hero: {
        position   : 'relative',
        background : 'linear-gradient(160deg, #1E1B4B 0%, #312E81 40%, #1E3A8A 70%, #1E1B4B 100%)',
        overflow   : 'hidden',
        paddingBottom: '0'
    },
    blob1: {
        position: 'absolute', top: '-80px', right: '-80px',
        width: '350px', height: '350px',
        background: 'radial-gradient(circle, rgba(249,115,22,0.25) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
    },
    blob2: {
        position: 'absolute', bottom: '40px', left: '-60px',
        width: '300px', height: '300px',
        background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
    },
    blob3: {
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
    },
    chakraWatermark: {
        position: 'absolute', top: '50%', right: '8%', transform: 'translateY(-50%)',
        width: '320px', height: '320px', pointerEvents: 'none', zIndex: 0
    },
    tricolorStrip: {
        display: 'flex', height: '5px', width: '100%', position: 'relative', zIndex: 5
    },
    heroContent: {
        position: 'relative', zIndex: 2, textAlign: 'center',
        padding: '60px 40px 50px', maxWidth: '900px', margin: '0 auto'
    },
    heroBadge: {
        display: 'inline-flex', alignItems: 'center',
        background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)',
        color: 'rgba(255,255,255,0.9)', padding: '8px 18px', borderRadius: '100px',
        fontSize: '11px', fontWeight: '700', letterSpacing: '1.5px',
        border: '1px solid rgba(255,255,255,0.2)', marginBottom: '32px'
    },
    emblemRow: {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '28px', marginBottom: '24px'
    },
    emblemBox: {
        width: '80px', height: '80px', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.08)', borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)'
    },
    heroTitleBlock : { flex: 1, maxWidth: '600px' },
    heroTitle: { margin: '0 0 6px', lineHeight: '1.1' },
    heroTitleMarathi: {
        fontSize: '58px', fontWeight: '900',
        fontFamily: "'Noto Sans Devanagari', sans-serif",
        display: 'inline-flex', alignItems: 'center', gap: '4px'
    },
    marathiOrange : { color: '#FF9933' },
    marathiDash   : { color: '#ffffff', margin: '0 4px', fontWeight: '900' },
    marathiGreen  : { color: '#4ADE80' },
    heroSubTitle: {
        fontSize: '28px', fontWeight: '800', color: '#ffffff',
        letterSpacing: '-0.5px', margin: '0 0 8px',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
    },
    heroTagline: {
        fontSize: '14px', color: 'rgba(255,255,255,0.65)',
        letterSpacing: '0.5px', margin: '0'
    },
    heroDesc: {
        fontSize: '17px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.75',
        maxWidth: '620px', margin: '24px auto 28px'
    },

    statsSection: {
        background : 'linear-gradient(135deg, #1E1B4B 0%, #4F46E5 100%)',
        padding    : '60px 60px'
    },
    statsInner: {
        maxWidth: '1200px', margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px'
    },
    statCard: {
        textAlign: 'center', color: 'white', padding: '20px',
        background: 'rgba(255,255,255,0.07)', borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)'
    },
    statIconWrap: {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '48px', height: '48px', background: 'rgba(255,255,255,0.12)',
        borderRadius: '12px', margin: '0 auto 14px'
    },
    statValue: {
        fontSize: '42px', fontWeight: '800', letterSpacing: '-1px',
        marginBottom: '6px', lineHeight: '1'
    },
    statLabel: { fontSize: '13px', opacity: 0.8, fontWeight: '500' },

    container: { maxWidth: '1200px', margin: '0 auto', padding: '0 40px', width: '100%' },
    sectionHeader: { textAlign: 'center', marginBottom: '56px' },
    sectionBadge: {
        display: 'inline-flex', alignItems: 'center', background: '#EEF2FF',
        color: '#4338CA', padding: '6px 16px', borderRadius: '100px',
        fontSize: '11px', fontWeight: '700', letterSpacing: '1.5px', marginBottom: '16px'
    },
    sectionTitle: {
        fontSize: '40px', fontWeight: '800', lineHeight: '1.15',
        letterSpacing: '-1.5px', color: '#111827', marginBottom: '14px'
    },
    sectionDesc: {
        fontSize: '16px', color: '#6B7280', maxWidth: '580px',
        margin: '0 auto', lineHeight: '1.7'
    },
    titleAccentBlue   : { color: '#4F46E5' },
    titleAccentOrange : { color: '#F97316' },

    missionSection: { padding: '100px 0', background: '#F9FAFB', width: '100%' },
    tabRow: { display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '48px' },
    tabBtn: {
        padding: '12px 32px', borderRadius: '100px', border: '1.5px solid #E5E7EB',
        background: '#ffffff', color: '#6B7280', fontWeight: '600', fontSize: '14px',
        cursor: 'pointer', transition: 'all 0.25s ease', fontFamily: 'inherit'
    },
    tabBtnActive: {
        background  : 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
        color       : '#ffffff',
        border      : '1.5px solid #4F46E5',
        boxShadow   : '0 4px 14px rgba(79,70,229,0.35)'
    },
    tabContent: {
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start'
    },
    tabLeft  : {},
    tabTitle : { fontSize: '26px', fontWeight: '800', color: '#111827', marginBottom: '16px' },
    tabText  : { fontSize: '15px', color: '#4B5563', lineHeight: '1.8', marginBottom: '24px' },
    tabPoints: { display: 'flex', flexDirection: 'column', gap: '12px' },
    tabPoint : {
        display: 'flex', alignItems: 'center', gap: '10px',
        fontSize: '14px', fontWeight: '600', color: '#374151'
    },
    tabRight : {},
    catGrid  : { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
    catChip  : {
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '14px 16px', borderRadius: '10px', border: '1px solid #E5E7EB'
    },
    catChipLabel : { fontSize: '13px', fontWeight: '700', color: '#111827' },
    catChipCount : { fontSize: '12px', fontWeight: '600', marginTop: '2px' },

    problemSection: { padding: '100px 0', background: '#ffffff', width: '100%' },
    problemGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' },
    problemCard: {
        background: '#ffffff', borderRadius: '20px', padding: '36px 28px',
        border: '1.5px solid #E5E7EB',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative', overflow: 'hidden'
    },
    problemIconWrap: {
        width: '72px', height: '72px', borderRadius: '18px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px'
    },
    problemTag: {
        display: 'inline-block', padding: '4px 12px', borderRadius: '100px',
        fontSize: '11px', fontWeight: '700', letterSpacing: '1px', marginBottom: '12px'
    },
    problemTitle : { fontSize: '20px', fontWeight: '800', color: '#111827', marginBottom: '12px' },
    problemDesc  : { fontSize: '14px', color: '#6B7280', lineHeight: '1.75' },
    problemBar   : {
        position: 'absolute', bottom: '0', left: '0', right: '0',
        height: '3px', borderRadius: '0 0 20px 20px'
    }
};

export default About;