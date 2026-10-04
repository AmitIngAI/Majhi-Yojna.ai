import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userAPI, schemeAPI } from '../../services/api';
import {
    FiArrowRight, FiChevronRight, FiUser, FiInfo, FiEdit3
} from 'react-icons/fi';
import {
    FaGraduationCap, FaBriefcase, FaHome, FaHeartbeat,
    FaUsers, FaWheelchair, FaBaby, FaUserFriends
} from 'react-icons/fa';

const BenefitTimeline = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [allSchemes, setAllSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('roadmap');

    useEffect(() => {
        if (user?.userId) fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const [pRes, sRes] = await Promise.allSettled([
                userAPI.getProfile(),
                schemeAPI.getAll()
            ]);
            if (pRes.status === 'fulfilled') {
                setProfile(pRes.value.data?.data || pRes.value.data);
            }
            if (sRes.status === 'fulfilled') {
                setAllSchemes(sRes.value.data?.data || sRes.value.data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const currentAge = profile?.age || 25;

    // ─── Age Milestones (matching image) ───
    const ageStages = [
        { age: currentAge, icon: <FiUser />, label: 'Years', bg: '#DBEAFE', color: '#3B82F6', current: true },
        { age: 30, icon: <FaUsers />, label: 'Years', bg: '#D1FAE5', color: '#10B981' },
        { age: 35, icon: <FaGraduationCap />, label: 'Years', bg: '#DBEAFE', color: '#3B82F6' },
        { age: 40, icon: <FaBriefcase />, label: 'Years', bg: '#FED7AA', color: '#F97316' },
        { age: 50, icon: <FaHeartbeat />, label: 'Years', bg: '#D1FAE5', color: '#10B981' },
        { age: 60, icon: <FaUserFriends />, label: 'Years', bg: '#E9D5FF', color: '#8B5CF6' },
        { age: '60+', icon: <FaWheelchair />, label: 'Years', bg: '#FCE7F3', color: '#EC4899' }
    ];

    // ─── Schemes You Can Apply Now (current age eligible) ───
    const currentSchemes = allSchemes.filter(s =>
        currentAge >= (s.ageMin || 0) && currentAge <= (s.ageMax || 100)
    );

    // ─── Future Eligibility (Next 10 Years) ───
    const futureSchemes = allSchemes.filter(s => {
        const minAge = s.ageMin || 0;
        return minAge > currentAge && minAge <= currentAge + 40;
    }).sort((a, b) => (a.ageMin || 0) - (b.ageMin || 0));

    // ─── Life Stage Groups ───
    const lifeStages = [
        {
            title: 'Education Stage',
            range: '(18 - 25 Years)',
            desc: 'Scholarships, Skill Development, Education Loans',
            icon: <FaGraduationCap />,
            bg: '#DBEAFE',
            color: '#3B82F6',
            schemes: allSchemes.filter(s =>
                (s.ageMin >= 15 && s.ageMax <= 30) ||
                s.occupationRequired === 'Student' ||
                s.schemeName?.toLowerCase().includes('scholar')
            )
        },
        {
            title: 'Career Building',
            range: '(25 - 40 Years)',
            desc: 'Job Support, Entrepreneurship, Financial Aid',
            icon: <FaBriefcase />,
            bg: '#FED7AA',
            color: '#F97316',
            schemes: allSchemes.filter(s =>
                (s.ageMin >= 18 && s.ageMax <= 45) &&
                (s.occupationRequired === 'Unemployed' ||
                 s.occupationRequired === 'Small Business Owner' ||
                 s.schemeName?.toLowerCase().includes('udyoj') ||
                 s.schemeName?.toLowerCase().includes('loan') ||
                 s.schemeName?.toLowerCase().includes('berojgar'))
            )
        },
        {
            title: 'Family Life',
            range: '(25 - 50 Years)',
            desc: 'Health, Housing, Insurance, Maternity Benefits',
            icon: <FaHome />,
            bg: '#FCE7F3',
            color: '#EC4899',
            schemes: allSchemes.filter(s =>
                s.category?.toLowerCase().includes('hous') ||
                s.category?.toLowerCase().includes('health') ||
                s.schemeName?.toLowerCase().includes('gharkul') ||
                s.schemeName?.toLowerCase().includes('awas') ||
                s.schemeName?.toLowerCase().includes('arogya')
            )
        },
        {
            title: 'Post Retirement',
            range: '(50+ Years)',
            desc: 'Pension, Senior Citizen Benefits, Healthcare',
            icon: <FaWheelchair />,
            bg: '#D1FAE5',
            color: '#10B981',
            schemes: allSchemes.filter(s =>
                s.ageMin >= 50 ||
                s.seniorCitizenRequired === 'Yes' ||
                s.schemeName?.toLowerCase().includes('senior') ||
                s.schemeName?.toLowerCase().includes('pension')
            )
        }
    ];

    // ─── Icon for scheme based on category ───
    const getSchemeIcon = (scheme) => {
        const name = (scheme.schemeName || '').toLowerCase();
        const cat = (scheme.category || '').toLowerCase();
        if (name.includes('scholar') || cat.includes('education')) return { icon: <FaGraduationCap />, bg: '#DBEAFE', color: '#3B82F6' };
        if (name.includes('arogya') || cat.includes('health')) return { icon: <FaHeartbeat />, bg: '#FEE2E2', color: '#EF4444' };
        if (name.includes('matru') || name.includes('women') || cat.includes('women')) return { icon: <FaBaby />, bg: '#FCE7F3', color: '#EC4899' };
        if (name.includes('skill') || name.includes('training')) return { icon: <FaBriefcase />, bg: '#DBEAFE', color: '#3B82F6' };
        if (name.includes('awas') || name.includes('gharkul')) return { icon: <FaHome />, bg: '#FED7AA', color: '#F97316' };
        if (name.includes('senior') || name.includes('pension')) return { icon: <FaWheelchair />, bg: '#D1FAE5', color: '#10B981' };
        return { icon: <FaBriefcase />, bg: '#E9D5FF', color: '#8B5CF6' };
    };

    if (loading) {
        return (
            <div style={styles.loadingWrap}>
                <div style={styles.spinner}></div>
                <p>Loading your benefit timeline...</p>
            </div>
        );
    }

    return (
        <div style={styles.wrapper}>

            {/* HEADER */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.pageTitle}>Benefit Timeline</h1>
                    <p style={styles.pageDesc}>Your age-based roadmap to plan and track government benefits.</p>
                </div>
            </div>

            {/* ─── AGE ROADMAP VISUAL (Always Show) ─── */}
            <div style={styles.roadmapCard}>
                <h2 style={styles.roadmapTitle}>Your Age-based Roadmap</h2>

                <div style={styles.timeline}>
                    <div style={styles.timelineLine}></div>
                    {ageStages.map((stage, i) => (
                        <div key={i} style={styles.timelineNode}>
                            {stage.current && (
                                <div style={styles.nowLabel}>Now</div>
                            )}
                            <div style={{
                                ...styles.nodeCircle,
                                background: stage.bg,
                                color: stage.color,
                                border: stage.current ? `3px solid ${stage.color}` : 'none',
                                boxShadow: stage.current ? `0 0 0 6px ${stage.color}20` : 'none'
                            }}>
                                {stage.icon}
                            </div>
                            <div style={{
                                ...styles.nodeAge,
                                color: stage.current ? '#111827' : '#374151'
                            }}>
                                {stage.age}
                            </div>
                            <div style={styles.nodeLabel}>{stage.label}</div>
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div style={styles.legend}>
                    <div style={styles.legendItem}>
                        <span style={{ ...styles.legendDot, background: '#10B981' }}></span>
                        Eligible Now
                    </div>
                    <div style={styles.legendItem}>
                        <span style={{ ...styles.legendDot, background: '#3B82F6' }}></span>
                        Future Eligible
                    </div>
                    <div style={styles.legendItem}>
                        <span style={{ ...styles.legendDot, background: '#F97316' }}></span>
                        May Become Eligible
                    </div>
                    <div style={styles.legendItem}>
                        <span style={{ ...styles.legendDot, background: '#9CA3AF' }}></span>
                        Not Applicable
                    </div>
                </div>
            </div>

            {/* ═══ 3-COLUMN GRID ═══ */}
            <div style={styles.threeColGrid}>

                {/* COLUMN 1: Schemes You Can Apply Now */}
                <div style={styles.column}>
                    <div style={styles.columnHeader}>
                        <h3 style={styles.columnTitle}>Schemes You Can Apply Now</h3>
                        <span style={styles.columnBadge}>
                            {currentSchemes.length} Schemes
                        </span>
                    </div>
                    <div style={styles.schemeItemsList}>
                        {currentSchemes.slice(0, 4).map((s, i) => {
                            const iconData = getSchemeIcon(s);
                            return (
                                <Link key={i} to={`/user/schemes/${s.id}`} style={styles.schemeItemLink}>
                                    <div style={{
                                        ...styles.schemeIcon,
                                        background: iconData.bg,
                                        color: iconData.color
                                    }}>
                                        {iconData.icon}
                                    </div>
                                    <div style={styles.schemeInfo}>
                                        <div style={styles.schemeName}>
                                            {s.schemeName?.length > 40 ? s.schemeName.substring(0, 40) + '...' : s.schemeName}
                                        </div>
                                        <div style={styles.schemeSubtext}>
                                            {s.description
                                                ? (s.description.length > 45 ? s.description.substring(0, 45) + '...' : s.description)
                                                : 'Government scheme for you'}
                                        </div>
                                    </div>
                                    <FiChevronRight style={styles.chevron} />
                                </Link>
                            );
                        })}
                    </div>
                    <Link to="/user/schemes" style={styles.viewAllLink}>
                        View All
                    </Link>
                </div>

                {/* COLUMN 2: Future Eligibility */}
                <div style={styles.column}>
                    <div style={styles.columnHeader}>
                        <h3 style={styles.columnTitle}>Future Eligibility (Next 10 Years)</h3>
                    </div>
                    <div style={styles.schemeItemsList}>
                        {futureSchemes.slice(0, 4).map((s, i) => {
                            const yearsLeft = (s.ageMin || 0);
                            return (
                                <Link key={i} to={`/user/schemes/${s.id}`} style={styles.futureItemLink}>
                                    <div style={styles.yearBadge}>
                                        <div style={styles.yearNumber}>{yearsLeft}</div>
                                        <div style={styles.yearText}>Years</div>
                                    </div>
                                    <div style={styles.schemeInfo}>
                                        <div style={styles.schemeName}>
                                            {s.schemeName?.length > 30 ? s.schemeName.substring(0, 30) + '...' : s.schemeName}
                                        </div>
                                        <div style={styles.schemeSubtext}>
                                            {s.description
                                                ? (s.description.length > 40 ? s.description.substring(0, 40) + '...' : s.description)
                                                : 'Eligible in future'}
                                        </div>
                                    </div>
                                    <div style={styles.atAgeBadge}>
                                        At {yearsLeft} Years
                                    </div>
                                </Link>
                            );
                        })}
                        {futureSchemes.length === 0 && (
                            <div style={styles.emptyMini}>
                                <p style={{ color: '#6B7280', fontSize: 13 }}>You're eligible for most age-based schemes!</p>
                            </div>
                        )}
                    </div>
                    <Link to="/user/schemes" style={styles.viewAllLink}>
                        View All
                    </Link>
                </div>

                {/* COLUMN 3: Life Stage Schemes */}
                <div style={styles.column}>
                    <div style={styles.columnHeader}>
                        <h3 style={styles.columnTitle}>Life Stage Schemes</h3>
                    </div>
                    <div style={styles.schemeItemsList}>
                        {lifeStages.map((stage, i) => (
                            <div key={i} style={styles.lifeStageItem}>
                                <div style={{
                                    ...styles.stageIcon,
                                    background: stage.bg,
                                    color: stage.color
                                }}>
                                    {stage.icon}
                                </div>
                                <div style={styles.stageInfo}>
                                    <div style={styles.stageTitle}>
                                        {stage.title} <span style={styles.stageRange}>{stage.range}</span>
                                    </div>
                                    <div style={styles.stageDesc}>{stage.desc}</div>
                                </div>
                                <div style={styles.stageCount}>
                                    {stage.schemes.length} Schemes
                                </div>
                                <FiChevronRight style={styles.chevron} />
                            </div>
                        ))}
                    </div>
                    <Link to="/user/schemes" style={styles.viewAllLink}>
                        View All
                    </Link>
                </div>
            </div>

            {/* TIP BAR */}
            <div style={styles.tipBar}>
                <div style={styles.tipLeft}>
                    <div style={styles.tipIcon}>
                        <FiInfo />
                    </div>
                    <div>
                        <strong style={styles.tipStrong}>Tip:</strong> Keep your profile updated to get accurate timeline and personalized scheme suggestions.
                    </div>
                </div>
                <Link to="/user/profile" style={styles.updateBtn}>
                    <FiEdit3 style={{ marginRight: 6 }} />
                    Update Profile
                </Link>
            </div>
        </div>
    );
};

const styles = {
    wrapper: {
        padding: '20px 0',
        maxWidth: 1400,
        margin: '0 auto'
    },
    loadingWrap: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 80,
        gap: 16
    },
    spinner: {
        width: 48,
        height: 48,
        border: '4px solid #E5E7EB',
        borderTopColor: '#3B82F6',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
    },

    header: {
        marginBottom: 24
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: 800,
        color: '#111827',
        marginBottom: 6,
        letterSpacing: -0.5
    },
    pageDesc: {
        fontSize: 14,
        color: '#6B7280'
    },

    /* ─── TABS ─── */
    tabsCard: {
        background: '#ffffff',
        padding: 8,
        borderRadius: 14,
        border: '1px solid #E5E7EB',
        display: 'flex',
        gap: 4,
        marginBottom: 20
    },
    tab: {
        flex: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '14px 20px',
        background: 'transparent',
        color: '#6B7280',
        border: 'none',
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
        borderBottom: '3px solid transparent'
    },
    tabActive: {
        background: 'transparent',
        color: '#3B82F6',
        fontWeight: 700,
        borderBottom: '3px solid #3B82F6'
    },
    tabIcon: {
        fontSize: 16
    },

    /* ─── ROADMAP VISUAL ─── */
    roadmapCard: {
        background: '#ffffff',
        padding: 30,
        borderRadius: 16,
        border: '1px solid #E5E7EB',
        marginBottom: 20
    },
    roadmapTitle: {
        fontSize: 18,
        fontWeight: 800,
        color: '#111827',
        marginBottom: 30
    },

    timeline: {
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '40px 20px 20px',
        marginBottom: 30
    },
    timelineLine: {
        position: 'absolute',
        top: 78,
        left: 60,
        right: 60,
        height: 2,
        background: 'repeating-linear-gradient(90deg, #D1D5DB 0, #D1D5DB 6px, transparent 6px, transparent 12px)',
        zIndex: 0
    },
    timelineNode: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 2,
        minWidth: 80
    },
    nowLabel: {
        position: 'absolute',
        top: -30,
        background: 'transparent',
        color: '#111827',
        fontSize: 14,
        fontWeight: 700
    },
    nodeCircle: {
        width: 60,
        height: 60,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        marginBottom: 12,
        background: '#F3F4F6'
    },
    nodeAge: {
        fontSize: 20,
        fontWeight: 800,
        marginBottom: 2
    },
    nodeLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: 600
    },

    /* ─── LEGEND ─── */
    legend: {
        display: 'flex',
        justifyContent: 'center',
        gap: 30,
        flexWrap: 'wrap',
        padding: '20px 0 0',
        borderTop: '1px solid #F3F4F6'
    },
    legendItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 13,
        color: '#374151',
        fontWeight: 600
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 3
    },

    /* ─── 3 COLUMN GRID ─── */
    threeColGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 20,
        marginBottom: 20
    },
    column: {
        background: '#ffffff',
        padding: 20,
        borderRadius: 16,
        border: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column'
    },
    columnHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 14,
        borderBottom: '1px solid #F3F4F6'
    },
    columnTitle: {
        fontSize: 15,
        fontWeight: 800,
        color: '#111827'
    },
    columnBadge: {
        background: '#EEF2FF',
        color: '#4F46E5',
        padding: '4px 10px',
        borderRadius: 100,
        fontSize: 11,
        fontWeight: 700
    },

    /* ─── SCHEME ITEMS ─── */
    schemeItemsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        flex: 1
    },
    schemeItemLink: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        background: '#F9FAFB',
        borderRadius: 10,
        textDecoration: 'none',
        transition: 'all 0.2s',
        border: '1px solid transparent'
    },
    schemeIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        flexShrink: 0
    },
    schemeInfo: {
        flex: 1,
        minWidth: 0
    },
    schemeName: {
        fontSize: 13,
        fontWeight: 700,
        color: '#111827',
        marginBottom: 4,
        lineHeight: 1.3
    },
    schemeSubtext: {
        fontSize: 11,
        color: '#6B7280',
        lineHeight: 1.4
    },
    chevron: {
        color: '#9CA3AF',
        fontSize: 16,
        flexShrink: 0
    },

    /* ─── FUTURE ITEMS ─── */
    futureItemLink: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        background: '#F9FAFB',
        borderRadius: 10,
        textDecoration: 'none',
        transition: 'all 0.2s'
    },
    yearBadge: {
        background: '#F97316',
        color: '#ffffff',
        borderRadius: 8,
        padding: '8px 10px',
        textAlign: 'center',
        minWidth: 50,
        flexShrink: 0
    },
    yearNumber: {
        fontSize: 16,
        fontWeight: 800,
        lineHeight: 1
    },
    yearText: {
        fontSize: 9,
        fontWeight: 600,
        opacity: 0.9,
        marginTop: 2
    },
    atAgeBadge: {
        background: '#DBEAFE',
        color: '#1E40AF',
        padding: '4px 10px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        flexShrink: 0
    },

    /* ─── LIFE STAGE ITEMS ─── */
    lifeStageItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        background: '#F9FAFB',
        borderRadius: 10,
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    stageIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        flexShrink: 0
    },
    stageInfo: {
        flex: 1,
        minWidth: 0
    },
    stageTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: '#111827',
        marginBottom: 4
    },
    stageRange: {
        fontSize: 11,
        color: '#6B7280',
        fontWeight: 500
    },
    stageDesc: {
        fontSize: 11,
        color: '#6B7280',
        lineHeight: 1.4
    },
    stageCount: {
        background: '#F3F4F6',
        color: '#374151',
        padding: '4px 10px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        flexShrink: 0
    },

    emptyMini: {
        padding: 20,
        textAlign: 'center'
    },

    viewAllLink: {
        display: 'block',
        textAlign: 'center',
        marginTop: 16,
        padding: '10px 0',
        color: '#3B82F6',
        fontSize: 13,
        fontWeight: 700,
        textDecoration: 'none',
        borderTop: '1px solid #F3F4F6'
    },

    /* ─── TIP BAR ─── */
    tipBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        background: '#EFF6FF',
        border: '1px solid #BFDBFE',
        borderRadius: 12,
        flexWrap: 'wrap',
        gap: 16
    },
    tipLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        flex: 1
    },
    tipIcon: {
        width: 36,
        height: 36,
        borderRadius: 8,
        background: '#3B82F6',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        flexShrink: 0
    },
    tipStrong: {
        color: '#1E40AF'
    },
    updateBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        background: '#ffffff',
        color: '#374151',
        padding: '10px 20px',
        borderRadius: 8,
        border: '1px solid #D1D5DB',
        fontSize: 13,
        fontWeight: 700,
        textDecoration: 'none',
        whiteSpace: 'nowrap'
    }
};

export default BenefitTimeline;