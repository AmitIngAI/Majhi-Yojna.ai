import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { recommendationAPI, userAPI, savedAPI } from '../../services/api';
import { calculateProfileCompletion, isProfileComplete as checkComplete } from '../../utils/profileUtils';
import {
    FiCheckCircle, FiHeart, FiArrowRight,
    FiSearch, FiUser, FiCalendar, FiZap, FiAlertCircle
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import {
    FaGraduationCap, FaBriefcase, FaTractor, FaBalanceScale,
    FaHome, FaHeartbeat, FaFemale, FaTh, FaBaby, FaRing, FaBirthdayCake
} from 'react-icons/fa';

const Recommendations = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('ai');
    const [recommendations, setRecommendations] = useState([]);
    const [lifeEvents, setLifeEvents] = useState([]);
    const [profileData, setProfileData] = useState(null);
    const [savedIds, setSavedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (user?.userId) fetchAllData();
    }, [user]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [profileRes, recRes, evRes, savedRes] = await Promise.allSettled([
                userAPI.getProfile(),
                recommendationAPI.getRecommendations(user.userId),
                recommendationAPI.getLifeEvents(user.userId),
                savedAPI.getSaved(user.userId)
            ]);

            if (profileRes.status === 'fulfilled') {
                setProfileData(profileRes.value.data?.data || profileRes.value.data);
            }
            if (recRes.status === 'fulfilled') {
                setRecommendations(recRes.value.data?.data || recRes.value.data || []);
            }
            if (evRes.status === 'fulfilled') {
                setLifeEvents(evRes.value.data?.data || evRes.value.data || []);
            }
            if (savedRes.status === 'fulfilled') {
                const saved = savedRes.value.data?.data || savedRes.value.data || [];
                setSavedIds(saved.map(s => s.schemeId || s.id));
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleSave = async (schemeId) => {
        try {
            await savedAPI.toggleSave(user.userId, schemeId);
            if (savedIds.includes(schemeId)) {
                setSavedIds(savedIds.filter(id => id !== schemeId));
            } else {
                setSavedIds([...savedIds, schemeId]);
            }
        } catch (err) {
            console.error('Save error:', err);
        }
    };

    const profileCompletion = calculateProfileCompletion(profileData);
    const isProfileComplete = checkComplete(profileData);

    // ─── Category Icons ───
    const getCategoryIcon = (category) => {
        if (!category) return <FaTh />;
        const cat = category.toLowerCase();
        if (cat.includes('education')) return <FaGraduationCap />;
        if (cat.includes('employ') || cat.includes('skill')) return <FaBriefcase />;
        if (cat.includes('agri') || cat.includes('krishi')) return <FaTractor />;
        if (cat.includes('social') || cat.includes('justice')) return <FaBalanceScale />;
        if (cat.includes('hous') || cat.includes('mhada')) return <FaHome />;
        if (cat.includes('health') || cat.includes('arogya')) return <FaHeartbeat />;
        if (cat.includes('women') || cat.includes('female')) return <FaFemale />;
        return <FaTh />;
    };

    const getCategoryColor = (category) => {
        if (!category) return '#6B7280';
        const cat = category.toLowerCase();
        if (cat.includes('education')) return '#4F46E5';
        if (cat.includes('employ') || cat.includes('skill')) return '#F97316';
        if (cat.includes('agri')) return '#10B981';
        if (cat.includes('social')) return '#F59E0B';
        if (cat.includes('hous')) return '#3B82F6';
        if (cat.includes('health')) return '#EF4444';
        if (cat.includes('women')) return '#EC4899';
        return '#6366F1';
    };

    // ─── Life Event Icons ───
    const getEventIcon = (event) => {
        const lower = event?.toLowerCase() || '';
        if (lower.includes('birth') || lower.includes('child')) return <FaBaby />;
        if (lower.includes('marriage') || lower.includes('widow')) return <FaRing />;
        if (lower.includes('birthday') || lower.includes('age') || lower.includes('young')) return <FaBirthdayCake />;
        if (lower.includes('senior') || lower.includes('retire')) return <FiUser />;
        if (lower.includes('farm')) return <FaTractor />;
        if (lower.includes('student') || lower.includes('scholar')) return <FaGraduationCap />;
        if (lower.includes('employ') || lower.includes('job')) return <FaBriefcase />;
        return <HiSparkles />;
    };

    // ─── Hidden Benefits = schemes with 90%+ match ───
    const hiddenBenefits = recommendations.filter(r => (r.matchScore || 0) >= 90);

    // ─── Tabs ───
    const tabs = [
        { id: 'ai', label: 'AI Suggested', icon: <HiSparkles />, count: recommendations.length },
        { id: 'life', label: 'Life Events', icon: <FiCalendar />, count: lifeEvents.length },
        { id: 'hidden', label: 'Hidden Benefits', icon: <FiZap />, count: hiddenBenefits.length }
    ];

    // ─── Search Filter Only ───
    const filterSchemes = (schemes) => {
        if (!searchQuery) return schemes;
        const q = searchQuery.toLowerCase();
        return schemes.filter(s =>
            s.schemeName?.toLowerCase().includes(q) ||
            s.description?.toLowerCase().includes(q) ||
            s.benefits?.toLowerCase().includes(q) ||
            s.category?.toLowerCase().includes(q)
        );
    };

    const filteredRecs = filterSchemes(recommendations);

    if (loading) {
        return (
            <div style={styles.loadingWrap}>
                <div style={styles.spinner}></div>
                <p>Loading AI recommendations...</p>
            </div>
        );
    }

    return (
        <div style={styles.wrapper}>

            {/* ═══════════ HEADER ═══════════ */}
            <section style={styles.header}>
                <div style={styles.headerDecor}></div>
                <div style={styles.headerContainer}>
                    <div style={styles.headerBadge}>
                        <HiSparkles style={{ marginRight: 6, color: '#F97316' }} />
                        AI-Powered Recommendations
                    </div>
                    <h1 style={styles.headerTitle}>
                        Schemes <span style={styles.headerAccent}>Just for You</span>
                    </h1>
                    <p style={styles.headerDesc}>
                        Discover {recommendations.length}+ government schemes matched to your profile using advanced AI algorithms
                    </p>

                    <div style={styles.headerStats}>
                        <div style={styles.headerStat}>
                            <div style={styles.headerStatValue}>{recommendations.length}</div>
                            <div style={styles.headerStatLabel}>AI Matched</div>
                        </div>
                        <div style={styles.headerStatDivider}></div>
                        <div style={styles.headerStat}>
                            <div style={styles.headerStatValue}>{lifeEvents.length}</div>
                            <div style={styles.headerStatLabel}>Life Events</div>
                        </div>
                        <div style={styles.headerStatDivider}></div>
                        <div style={styles.headerStat}>
                            <div style={styles.headerStatValue}>{hiddenBenefits.length}</div>
                            <div style={styles.headerStatLabel}>Hidden Benefits</div>
                        </div>
                        <div style={styles.headerStatDivider}></div>
                        <div style={styles.headerStat}>
                            <div style={styles.headerStatValue}>{profileCompletion}%</div>
                            <div style={styles.headerStatLabel}>Profile Score</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════ PROFILE WARNING ═══════════ */}
            {!isProfileComplete && (
                <div style={styles.warningBar}>
                    <FiAlertCircle style={{ fontSize: 20, color: '#F59E0B' }} />
                    <span>Your profile is {profileCompletion}% complete. Complete it for more accurate recommendations.</span>
                    <Link to="/user/profile" style={styles.warningLink}>Complete Profile →</Link>
                </div>
            )}

            {/* ═══════════ MAIN ═══════════ */}
            <section style={styles.mainSection}>
                <div style={styles.mainContainer}>

                    {/* Tabs + Search */}
                    <div style={styles.tabsWrap}>
                        <div style={styles.tabs}>
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        ...styles.tab,
                                        ...(activeTab === tab.id ? styles.tabActive : {})
                                    }}>
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                    <span style={{
                                        ...styles.tabCount,
                                        ...(activeTab === tab.id ? styles.tabCountActive : {})
                                    }}>{tab.count}</span>
                                </button>
                            ))}
                        </div>

                        <div style={styles.searchBar}>
                            <FiSearch style={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search schemes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={styles.searchInput}
                            />
                        </div>
                    </div>

                    {/* AI SUGGESTED TAB */}
                    {activeTab === 'ai' && (
                        <div style={styles.contentGrid}>
                            {filteredRecs.length === 0 ? (
                                <EmptyState
                                    icon="🎯"
                                    title="No Matches Found"
                                    desc={searchQuery ? "Try different search terms" : "Complete your profile to get personalized recommendations"}
                                    btnText="Complete Profile"
                                    btnLink="/user/profile"
                                />
                            ) : (
                                filteredRecs.map((rec, i) => (
                                    <SchemeCard
                                        key={rec.schemeId || rec.id || i}
                                        scheme={rec}
                                        rank={i + 1}
                                        isSaved={savedIds.includes(rec.schemeId || rec.id)}
                                        onToggleSave={() => toggleSave(rec.schemeId || rec.id)}
                                        getCategoryIcon={getCategoryIcon}
                                        getCategoryColor={getCategoryColor}
                                    />
                                ))
                            )}
                        </div>
                    )}

                    {/* LIFE EVENTS TAB */}
                    {activeTab === 'life' && (
                        <div style={styles.lifeEventsGrid}>
                            {lifeEvents.length === 0 ? (
                                <div style={{ gridColumn: 'span 2' }}>
                                    <EmptyState
                                        icon="📅"
                                        title="No Life Event Schemes"
                                        desc="Update your profile with life events (marriage, birth, retirement) to see relevant schemes"
                                        btnText="Update Profile"
                                        btnLink="/user/profile"
                                    />
                                </div>
                            ) : (
                                lifeEvents.map((event, i) => {
                                    // Find schemes related to this life event from recommendations
                                    const relatedSchemes = recommendations.filter(r => {
                                        const eventLower = event.event?.toLowerCase() || '';
                                        const schemeName = r.schemeName?.toLowerCase() || '';
                                        const schemeCat = r.category?.toLowerCase() || '';
                                        if (eventLower.includes('senior')) return schemeName.includes('senior') || schemeName.includes('pension');
                                        if (eventLower.includes('farm')) return schemeCat.includes('agri') || schemeName.includes('krish');
                                        if (eventLower.includes('student') || eventLower.includes('young')) return schemeName.includes('scholar') || schemeName.includes('student');
                                        if (eventLower.includes('widow')) return schemeName.includes('widow');
                                        if (eventLower.includes('sc/st') || eventLower.includes('welfare')) return schemeName.includes('sc') || schemeName.includes('st');
                                        if (eventLower.includes('business') || eventLower.includes('loan')) return schemeName.includes('loan') || schemeName.includes('udyoj');
                                        if (eventLower.includes('unemploy')) return schemeName.includes('berojgar') || schemeName.includes('swayam');
                                        return false;
                                    }).slice(0, 3);

                                    return (
                                        <div key={i} style={styles.lifeEventCard}>
                                            <div style={styles.lifeEventHeader}>
                                                <div style={styles.lifeEventIcon}>
                                                    {getEventIcon(event.event)}
                                                </div>
                                                <div>
                                                    <div style={styles.lifeEventBadge}>LIFE EVENT</div>
                                                    <h3 style={styles.lifeEventTitle}>{event.event || 'Life Event'}</h3>
                                                </div>
                                            </div>
                                            <p style={styles.lifeEventDesc}>{event.suggestion || event.description}</p>

                                            {relatedSchemes.length > 0 && (
                                                <div style={styles.lifeEventSchemes}>
                                                    <div style={styles.lifeEventSchemesTitle}>
                                                        🎯 Related Schemes ({relatedSchemes.length}):
                                                    </div>
                                                    {relatedSchemes.map((s, j) => (
                                                        <Link key={j} to={`/user/schemes/${s.schemeId || s.id}`} style={styles.lifeEventScheme}>
                                                            <FiCheckCircle style={{ color: '#10B981', flexShrink: 0 }} />
                                                            <span style={{ flex: 1 }}>{s.schemeName}</span>
                                                            <span style={styles.miniScore}>{Math.round(s.matchScore || 85)}%</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* HIDDEN BENEFITS TAB */}
                    {activeTab === 'hidden' && (
                        <div style={styles.contentGrid}>
                            {hiddenBenefits.length === 0 ? (
                                <EmptyState
                                    icon="💎"
                                    title="No Hidden Benefits Yet"
                                    desc="Hidden benefits are high-match schemes (90%+). Complete your profile for better matches."
                                    btnText="Browse All Schemes"
                                    btnLink="/user/schemes"
                                />
                            ) : (
                                <>
                                    <div style={styles.hiddenBanner}>
                                        <FiZap style={{ fontSize: 28, color: '#F97316' }} />
                                        <div>
                                            <h3 style={styles.hiddenBannerTitle}>💎 Exclusive Hidden Benefits</h3>
                                            <p style={styles.hiddenBannerDesc}>
                                                These are high-value schemes matched with 90%+ accuracy — don't miss out!
                                            </p>
                                        </div>
                                    </div>
                                    {hiddenBenefits.map((rec, i) => (
                                        <SchemeCard
                                            key={rec.schemeId || rec.id || i}
                                            scheme={rec}
                                            rank={i + 1}
                                            isSaved={savedIds.includes(rec.schemeId || rec.id)}
                                            onToggleSave={() => toggleSave(rec.schemeId || rec.id)}
                                            getCategoryIcon={getCategoryIcon}
                                            getCategoryColor={getCategoryColor}
                                            isHidden={true}
                                        />
                                    ))}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

// ─── Scheme Card ───
const SchemeCard = ({ scheme, rank, isSaved, onToggleSave, getCategoryIcon, getCategoryColor, isHidden }) => {
    const catColor = getCategoryColor(scheme.category);
    const matchScore = Math.round(scheme.matchScore || 85);

    return (
        <div style={styles.schemeCard}>
            {isHidden && <div style={styles.hiddenBadge}>💎 HIDDEN GEM</div>}

            <div style={styles.cardTop}>
                <div style={styles.rankBadge}>#{rank}</div>
                <button onClick={onToggleSave} style={{
                    ...styles.saveBtn,
                    color: isSaved ? '#EC4899' : '#9CA3AF'
                }}>
                    <FiHeart style={{ fill: isSaved ? '#EC4899' : 'none' }} />
                </button>
            </div>

            <div style={{
                ...styles.cardIcon,
                background: `linear-gradient(135deg, ${catColor}20 0%, ${catColor}10 100%)`,
                color: catColor
            }}>
                {getCategoryIcon(scheme.category)}
            </div>

            <span style={{
                ...styles.categoryTag,
                background: `${catColor}15`,
                color: catColor
            }}>
                {scheme.category?.toUpperCase() || 'GENERAL'}
            </span>

            <h3 style={styles.schemeName}>{scheme.schemeName || 'Scheme Name'}</h3>

            <p style={styles.schemeDesc}>
                {scheme.description
                    ? (scheme.description.length > 90
                        ? scheme.description.substring(0, 90) + '...'
                        : scheme.description)
                    : 'Government scheme for eligible citizens'}
            </p>

            {scheme.benefits && (
                <div style={styles.benefitBox}>
                    💰 {scheme.benefits.length > 50
                        ? scheme.benefits.substring(0, 50) + '...'
                        : scheme.benefits}
                </div>
            )}

            <div style={styles.matchRow}>
                <div style={styles.matchInfo}>
                    <div style={styles.matchLabel}>AI Match Score</div>
                    <div style={{
                        ...styles.matchScore,
                        color: matchScore >= 90 ? '#10B981' : matchScore >= 80 ? '#4F46E5' : '#F59E0B'
                    }}>{matchScore}%</div>
                </div>
                <div style={styles.matchBar}>
                    <div style={{
                        ...styles.matchFill,
                        width: `${matchScore}%`,
                        background: matchScore >= 90
                            ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
                            : matchScore >= 80
                            ? 'linear-gradient(90deg, #4F46E5 0%, #4338CA 100%)'
                            : 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)'
                    }}></div>
                </div>
            </div>

            <Link to={`/user/schemes/${scheme.schemeId || scheme.id}`} style={styles.viewBtn}>
                View Details
                <FiArrowRight style={{ marginLeft: 6 }} />
            </Link>
        </div>
    );
};

// ─── Empty State ───
const EmptyState = ({ icon, title, desc, btnText, btnLink }) => (
    <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>{icon}</div>
        <h3 style={styles.emptyTitle}>{title}</h3>
        <p style={styles.emptyDesc}>{desc}</p>
        <Link to={btnLink} style={styles.emptyBtn}>
            {btnText} <FiArrowRight style={{ marginLeft: 8 }} />
        </Link>
    </div>
);

/* STYLES — Same as before */
const styles = {
    wrapper: { width: '100%', background: '#F9FAFB', minHeight: '100vh', paddingBottom: '60px' },
    loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' },
    spinner: { width: '48px', height: '48px', border: '4px solid #E5E7EB', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },

    header: {
        position: 'relative', background: 'linear-gradient(135deg, #EEF2FF 0%, #ffffff 50%, #FFF7ED 100%)',
        padding: '50px 60px', overflow: 'hidden', textAlign: 'center'
    },
    headerDecor: {
        position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)', borderRadius: '50%'
    },
    headerContainer: { position: 'relative', maxWidth: '1000px', margin: '0 auto', zIndex: 2 },
    headerBadge: {
        display: 'inline-flex', alignItems: 'center',
        background: 'linear-gradient(135deg, #1E3A8A 0%, #4F46E5 100%)',
        color: '#ffffff', padding: '8px 18px', borderRadius: '100px',
        fontSize: '12px', fontWeight: '700', marginBottom: '20px'
    },
    headerTitle: { fontSize: '44px', fontWeight: '800', color: '#111827', marginBottom: '14px', letterSpacing: '-1.5px' },
    headerAccent: {
        background: 'linear-gradient(135deg, #4F46E5 0%, #F97316 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
    },
    headerDesc: { fontSize: '16px', color: '#4B5563', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px' },
    headerStats: {
        display: 'inline-flex', justifyContent: 'center', alignItems: 'center',
        gap: '30px', background: '#ffffff', padding: '20px 40px',
        borderRadius: '20px', border: '1px solid #E5E7EB', boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
    },
    headerStat: { textAlign: 'center' },
    headerStatValue: { fontSize: '28px', fontWeight: '800', color: '#4F46E5', letterSpacing: '-1px' },
    headerStatLabel: { fontSize: '12px', color: '#6B7280', fontWeight: '600', marginTop: '4px' },
    headerStatDivider: { width: '1px', height: '40px', background: '#E5E7EB' },

    warningBar: {
        maxWidth: '1400px', margin: '20px auto 0', padding: '14px 24px',
        background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px',
        display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#78350F', fontWeight: '600'
    },
    warningLink: { marginLeft: 'auto', color: '#F59E0B', fontWeight: '700', textDecoration: 'none', fontSize: '13px' },

    mainSection: { padding: '30px 60px 0' },
    mainContainer: { maxWidth: '1400px', margin: '0 auto' },

    tabsWrap: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        gap: '20px', flexWrap: 'wrap', background: '#ffffff', padding: '16px',
        borderRadius: '14px', border: '1px solid #E5E7EB', marginBottom: '20px'
    },
    tabs: { display: 'flex', gap: '4px' },
    tab: {
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '10px 20px', background: 'transparent', color: '#6B7280',
        border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
    },
    tabActive: {
        background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
        color: '#ffffff', boxShadow: '0 4px 12px rgba(79,70,229,0.3)'
    },
    tabCount: { background: '#F3F4F6', color: '#6B7280', padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: '700' },
    tabCountActive: { background: 'rgba(255,255,255,0.25)', color: '#ffffff' },
    searchBar: {
        display: 'flex', alignItems: 'center', gap: '10px',
        background: '#F9FAFB', padding: '10px 16px',
        borderRadius: '10px', border: '1px solid #E5E7EB', minWidth: '280px'
    },
    searchIcon: { color: '#6B7280', fontSize: '16px' },
    searchInput: { flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', color: '#111827' },

    contentGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },

    schemeCard: {
        background: '#ffffff', padding: '24px', borderRadius: '16px',
        border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', position: 'relative'
    },
    hiddenBadge: {
        position: 'absolute', top: '-8px', right: '16px',
        background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
        color: '#ffffff', padding: '4px 12px', borderRadius: '100px',
        fontSize: '10px', fontWeight: '800', letterSpacing: '0.5px'
    },
    cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
    rankBadge: {
        background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
        color: '#ffffff', padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800'
    },
    saveBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px', padding: '4px' },
    cardIcon: {
        width: '52px', height: '52px', borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '22px', marginBottom: '14px'
    },
    categoryTag: {
        display: 'inline-block', fontSize: '10px', fontWeight: '700',
        padding: '4px 10px', borderRadius: '100px', letterSpacing: '0.5px',
        marginBottom: '12px', alignSelf: 'flex-start'
    },
    schemeName: { fontSize: '16px', fontWeight: '800', color: '#111827', marginBottom: '10px', lineHeight: 1.3, minHeight: '42px' },
    schemeDesc: { fontSize: '13px', color: '#6B7280', lineHeight: 1.6, marginBottom: '12px', flex: 1 },
    benefitBox: {
        background: '#F0FDF4', color: '#059669', padding: '8px 12px',
        borderRadius: '8px', fontSize: '12px', fontWeight: '600',
        marginBottom: '14px', border: '1px solid rgba(16,185,129,0.15)'
    },
    matchRow: { marginBottom: '14px' },
    matchInfo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
    matchLabel: { fontSize: '11px', color: '#6B7280', fontWeight: '700', letterSpacing: '0.5px' },
    matchScore: { fontSize: '16px', fontWeight: '800' },
    matchBar: { height: '6px', background: '#F3F4F6', borderRadius: '100px', overflow: 'hidden' },
    matchFill: { height: '100%', borderRadius: '100px', transition: 'width 0.5s ease' },
    viewBtn: {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
        color: '#ffffff', padding: '11px 16px', borderRadius: '10px',
        fontSize: '13px', fontWeight: '700', textDecoration: 'none'
    },

    lifeEventsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' },
    lifeEventCard: { background: '#ffffff', padding: '28px', borderRadius: '16px', border: '1px solid #E5E7EB' },
    lifeEventHeader: { display: 'flex', gap: '16px', marginBottom: '16px' },
    lifeEventIcon: {
        width: '56px', height: '56px', borderRadius: '14px',
        background: 'linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)',
        color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '24px', flexShrink: 0
    },
    lifeEventBadge: {
        display: 'inline-block', background: '#FFF7ED', color: '#EA580C',
        padding: '3px 10px', borderRadius: '100px', fontSize: '10px',
        fontWeight: '700', letterSpacing: '0.5px', marginBottom: '4px'
    },
    lifeEventTitle: { fontSize: '18px', fontWeight: '800', color: '#111827' },
    lifeEventDesc: { fontSize: '14px', color: '#6B7280', lineHeight: 1.6, marginBottom: '16px' },
    lifeEventSchemes: { background: '#F9FAFB', padding: '14px', borderRadius: '10px', border: '1px solid #F3F4F6' },
    lifeEventSchemesTitle: { fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '10px' },
    lifeEventScheme: {
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 8px', fontSize: '13px', color: '#4F46E5',
        fontWeight: '600', textDecoration: 'none', borderRadius: '6px',
        transition: 'all 0.2s'
    },
    miniScore: {
        background: '#F0FDF4', color: '#10B981',
        padding: '2px 8px', borderRadius: '100px',
        fontSize: '11px', fontWeight: '800'
    },

    hiddenBanner: {
        gridColumn: 'span 3',
        display: 'flex', gap: '16px', alignItems: 'center',
        background: 'linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)',
        padding: '20px 24px', borderRadius: '14px',
        border: '1px solid #FDBA74', marginBottom: '4px'
    },
    hiddenBannerTitle: { fontSize: '16px', fontWeight: '800', color: '#9A3412', marginBottom: '4px' },
    hiddenBannerDesc: { fontSize: '13px', color: '#7C2D12', lineHeight: 1.6 },

    emptyState: {
        gridColumn: 'span 3',
        textAlign: 'center', padding: '80px 20px',
        background: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB'
    },
    emptyIcon: { fontSize: '64px', marginBottom: '16px' },
    emptyTitle: { fontSize: '22px', fontWeight: '800', color: '#111827', marginBottom: '10px' },
    emptyDesc: { fontSize: '14px', color: '#6B7280', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' },
    emptyBtn: {
        display: 'inline-flex', alignItems: 'center',
        background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
        color: '#ffffff', padding: '12px 24px', borderRadius: '10px',
        fontSize: '14px', fontWeight: '700', textDecoration: 'none'
    }
};

export default Recommendations;