import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { recommendationAPI, savedAPI, userAPI, schemeAPI } from '../../services/api';
import { calculateProfileCompletion } from '../../utils/profileUtils';
import {
    FiTarget, FiCheckCircle, FiHeart, FiFileText, FiArrowRight,
    FiExternalLink, FiClock, FiUser, FiTrendingUp, FiAlertCircle,
    FiCalendar, FiAward, FiActivity, FiBookmark, FiEye
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { FaUniversity, FaIdCard } from 'react-icons/fa';

const UserDashboard = () => {
    const { user } = useAuth();

    // ─── REAL STATE ───
    const [recommendations, setRecommendations] = useState([]);
    const [savedSchemes, setSavedSchemes] = useState([]);
    const [allSchemes, setAllSchemes] = useState([]);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user?.userId) fetchAllData();
    }, [user]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [profileRes, recRes, savedRes, schemesRes] = await Promise.allSettled([
                userAPI.getProfile(),
                recommendationAPI.getRecommendations(user.userId),
                savedAPI.getSaved(user.userId),
                schemeAPI.getAll()
            ]);

            if (profileRes.status === 'fulfilled') {
                setProfileData(profileRes.value.data?.data || profileRes.value.data);
            }
            if (recRes.status === 'fulfilled') {
                const recData = recRes.value.data?.data || recRes.value.data || [];
                setRecommendations(Array.isArray(recData) ? recData : []);
            }
            if (savedRes.status === 'fulfilled') {
                const savedData = savedRes.value.data?.data || savedRes.value.data || [];
                setSavedSchemes(Array.isArray(savedData) ? savedData : []);
            }
            if (schemesRes.status === 'fulfilled') {
                const schemesData = schemesRes.value.data?.data || schemesRes.value.data || [];
                setAllSchemes(Array.isArray(schemesData) ? schemesData : []);
            }
        } catch (err) {
            console.error('Dashboard error:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    // ─── COMPUTED VALUES ───

    // Profile Completion — sirf profileUtils wala (duplicate hata diya)
    const profileCompletion = calculateProfileCompletion(profileData);
    const isProfileComplete = profileCompletion >= 80;

    // Format Date
    const formatDate = (date) => {
        if (!date) return 'Recently';
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Get Time Ago
    const timeAgo = (date) => {
        if (!date) return 'Recently';
        const now = new Date();
        const past = new Date(date);
        const diffMs = now - past;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor(diffMs / (1000 * 60));

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHrs < 24) return `${diffHrs} hr ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return formatDate(date);
    };

    // ─── REAL STATS (only what user has done) ───
    const realStats = [
        {
            label: 'Profile Completion',
            value: profileCompletion,
            suffix: '%',
            desc: profileCompletion >= 80 ? 'Excellent!' : profileCompletion >= 50 ? 'Almost there' : 'Needs attention',
            icon: <FiUser />,
            color: profileCompletion >= 80 ? '#10B981' : profileCompletion >= 50 ? '#F59E0B' : '#EF4444',
            bg: profileCompletion >= 80 ? '#F0FDF4' : profileCompletion >= 50 ? '#FFFBEB' : '#FEF2F2'
        },
        {
            label: 'Matched Schemes',
            value: recommendations.length,
            suffix: '',
            desc: recommendations.length > 0 ? 'AI recommendations' : 'Complete profile first',
            icon: <FiCheckCircle />,
            color: '#4F46E5',
            bg: '#EEF2FF'
        },
        {
            label: 'Saved for Later',
            value: savedSchemes.length,
            suffix: '',
            desc: savedSchemes.length > 0 ? 'Your bookmarks' : 'No saves yet',
            icon: <FiBookmark />,
            color: '#EC4899',
            bg: '#FDF2F8'
        },
        {
            label: 'Total Schemes',
            value: allSchemes.length,
            suffix: '',
            desc: 'Available in Maharashtra',
            icon: <FiAward />,
            color: '#F97316',
            bg: '#FFF7ED'
        }
    ];

    // ─── REAL ACTIVITY (only actions that user performed) ───
    const buildRealActivity = () => {
        const activities = [];

        if (profileData?.updatedAt || profileData?.createdAt) {
            activities.push({
                icon: <FiUser />,
                title: profileCompletion === 100 ? 'Profile Completed' : 'Profile Updated',
                desc: `Your profile is ${profileCompletion}% complete`,
                time: timeAgo(profileData.updatedAt || profileData.createdAt),
                color: '#4F46E5',
                bg: '#EEF2FF'
            });
        }

        if (savedSchemes.length > 0) {
            activities.push({
                icon: <FiHeart />,
                title: `${savedSchemes.length} Scheme${savedSchemes.length > 1 ? 's' : ''} Saved`,
                desc: 'You bookmarked schemes for later review',
                time: 'Recent',
                color: '#EC4899',
                bg: '#FDF2F8'
            });
        }

        if (recommendations.length > 0) {
            activities.push({
                icon: <HiSparkles />,
                title: 'AI Recommendations Ready',
                desc: `${recommendations.length} schemes matched to your profile`,
                time: 'Available now',
                color: '#F97316',
                bg: '#FFF7ED'
            });
        }

        if (user) {
            activities.push({
                icon: <FiCheckCircle />,
                title: 'Welcome to माझी योजना.AI',
                desc: 'Account created successfully',
                time: timeAgo(user.createdAt) || 'Welcome!',
                color: '#10B981',
                bg: '#F0FDF4'
            });
        }

        return activities;
    };

    const activities = buildRealActivity();

    // ─── ACTION CARDS (based on user state) ───
    const getActionCards = () => {
        const actions = [];

        // Profile incomplete → priority: profile complete karo
        if (!isProfileComplete) {
            actions.push({
                icon: <FiUser />,
                title: 'Complete Your Profile',
                desc: `Profile ${profileCompletion}% done — finish it for AI matches`,
                to: '/user/profile',
                color: '#F59E0B',
                bg: '#FFFBEB',
                priority: true
            });
        }

        // If has recommendations → show them
        if (recommendations.length > 0) {
            actions.push({
                icon: <FiTarget />,
                title: 'View AI Recommendations',
                desc: `${recommendations.length} schemes matched for you`,
                to: '/user/recommendations',
                color: '#4F46E5',
                bg: '#EEF2FF',
                priority: isProfileComplete
            });
        }

        // Saved schemes
        actions.push({
            icon: <FiBookmark />,
            title: 'Saved Schemes',
            desc: savedSchemes.length > 0
                ? `${savedSchemes.length} scheme${savedSchemes.length > 1 ? 's' : ''} bookmarked`
                : 'No saves yet — start bookmarking',
            to: '/user/saved',
            color: '#EC4899',
            bg: '#FDF2F8'
        });

        // Browse all schemes (dashboard ke andar hi rahe)
        actions.push({
            icon: <FiFileText />,
            title: 'Browse All Schemes',
            desc: `Explore ${allSchemes.length}+ government schemes`,
            to: '/user/schemes',
            color: '#10B981',
            bg: '#F0FDF4'
        });

        return actions;
    };

    const actionCards = getActionCards();

    // Loading state
    if (loading) {
        return (
            <div style={styles.loadingWrap}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div style={styles.wrapper}>

            {/* ═══════════ WELCOME BANNER (Government Style) ═══════════ */}
            <section style={styles.welcomeBanner}>
                <div style={styles.bannerDecor1}></div>
                <div style={styles.bannerDecor2}></div>

                <div style={styles.bannerContainer}>
                    <div style={styles.bannerLeft}>
                        <div style={styles.govBadge}>
                            <FaUniversity style={{ marginRight: 8 }} />
                            Government of Maharashtra Portal
                        </div>

                        <h1 style={styles.welcomeTitle}>
                            नमस्कार, <span style={styles.userNameHighlight}>
                                {user?.fullName?.split(' ')[0] || 'Citizen'}!
                            </span>
                        </h1>
                        <p style={styles.welcomeSubtitle}>
                            {isProfileComplete
                                ? `You have ${recommendations.length} government scheme${recommendations.length !== 1 ? 's' : ''} matched to your profile.`
                                : 'Complete your profile to unlock personalized AI recommendations.'}
                        </p>

                        <div style={styles.chipsRow}>
                            <div style={styles.infoChip}>
                                <FiCalendar style={styles.chipIcon} />
                                <span>Today: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                            {profileData?.district && (
                                <div style={styles.infoChip}>
                                    <FaUniversity style={styles.chipIcon} />
                                    <span>{profileData.district}, Maharashtra</span>
                                </div>
                            )}
                            {profileData?.aadhaarNumber && (
                                <div style={styles.infoChip}>
                                    <FaIdCard style={styles.chipIcon} />
                                    <span>Aadhaar Added</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={styles.bannerRight}>
                        <div style={styles.avatarCard}>
                            <div style={styles.avatarLarge}>
                                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div style={styles.avatarInfo}>
                                <div style={styles.avatarName}>{user?.fullName || 'User'}</div>
                                <div style={styles.avatarEmail}>{user?.email}</div>
                                <div style={styles.memberSince}>
                                    <FiClock style={{ fontSize: 11, marginRight: 4 }} />
                                    Member since {formatDate(user?.createdAt) || 'today'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════ QUICK STATS ═══════════ */}
            <section style={styles.statsSection}>
                <div style={styles.statsGrid}>
                    {realStats.map((stat, i) => (
                        <div key={i} style={styles.statCard}>
                            <div style={styles.statTop}>
                                <div style={{
                                    ...styles.statIconBox,
                                    background: stat.bg,
                                    color: stat.color
                                }}>
                                    {stat.icon}
                                </div>
                            </div>
                            <div style={styles.statValueWrap}>
                                <span style={styles.statValue}>{stat.value}</span>
                                {stat.suffix && <span style={styles.statSuffix}>{stat.suffix}</span>}
                            </div>
                            <div style={styles.statLabel}>{stat.label}</div>
                            <div style={{ ...styles.statDesc, color: stat.color }}>
                                {stat.desc}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══════════ PROFILE INCOMPLETE WARNING ═══════════ */}
            {!isProfileComplete && (
                <section style={styles.warningSection}>
                    <div style={styles.warningCard}>
                        <div style={styles.warningLeft}>
                            <div style={styles.warningIcon}>
                                <FiAlertCircle />
                            </div>
                            <div>
                                <h3 style={styles.warningTitle}>
                                    Profile {profileCompletion}% Complete
                                </h3>
                                <p style={styles.warningDesc}>
                                    Complete your profile to unlock <strong>AI-powered scheme recommendations</strong> tailored specifically for you.
                                </p>
                                <div style={styles.warningProgress}>
                                    <div style={styles.warningProgressBar}>
                                        <div style={{
                                            ...styles.warningProgressFill,
                                            width: `${profileCompletion}%`
                                        }}></div>
                                    </div>
                                    <span style={styles.warningPercent}>{profileCompletion}%</span>
                                </div>
                            </div>
                        </div>
                        <Link to="/user/profile" style={styles.warningBtn}>
                            Complete Now
                            <FiArrowRight style={{ marginLeft: 8 }} />
                        </Link>
                    </div>
                </section>
            )}

            {/* ═══════════ MAIN CONTENT GRID ═══════════ */}
            <section style={styles.mainSection}>
                <div style={styles.mainGrid}>

                    {/* ═══════ LEFT: Recommendations + Actions ═══════ */}
                    <div style={styles.leftColumn}>

                        <div style={styles.contentCard}>
                            <div style={styles.cardHeader}>
                                <div style={styles.cardHeaderLeft}>
                                    <div style={{
                                        ...styles.cardHeaderIcon,
                                        background: '#EEF2FF',
                                        color: '#4F46E5'
                                    }}>
                                        <FiTarget />
                                    </div>
                                    <div>
                                        <h2 style={styles.cardTitle}>
                                            Top Recommendations for You
                                        </h2>
                                        <p style={styles.cardSubtitle}>
                                            AI-matched government schemes based on your profile
                                        </p>
                                    </div>
                                </div>
                                {recommendations.length > 3 && (
                                    <Link to="/user/recommendations" style={styles.viewAllBtn}>
                                        View All {recommendations.length}
                                        <FiArrowRight style={{ marginLeft: 6, fontSize: 13 }} />
                                    </Link>
                                )}
                            </div>

                            {recommendations.length === 0 ? (
                                <div style={styles.emptyState}>
                                    <div style={styles.emptyIcon}>🔍</div>
                                    <h3 style={styles.emptyTitle}>
                                        {isProfileComplete ? 'Analyzing Your Profile...' : 'Complete Your Profile'}
                                    </h3>
                                    <p style={styles.emptyDesc}>
                                        {isProfileComplete
                                            ? 'Our AI is finding the best schemes for you. Try Recommendations page for detailed matches.'
                                            : `You've completed ${profileCompletion}% of your profile. Complete it to get AI-powered scheme recommendations.`
                                        }
                                    </p>
                                    <Link to={isProfileComplete ? '/user/recommendations' : '/user/profile'} style={styles.emptyBtn}>
                                        {isProfileComplete ? (
                                            <><HiSparkles style={{ marginRight: 8 }} />View AI Recommendations</>
                                        ) : (
                                            <><FiUser style={{ marginRight: 8 }} />Complete Profile</>
                                        )}
                                    </Link>
                                </div>
                            ) : (
                                <div style={styles.recList}>
                                    {recommendations.slice(0, 4).map((rec, i) => (
                                        <Link
                                            key={rec.schemeId || rec.id || i}
                                            to={`/user/schemes/${rec.schemeId || rec.id || i}`}
                                            style={styles.recCard}>
                                            <div style={styles.recRank}>#{i + 1}</div>
                                            <div style={styles.recInfo}>
                                                <h4 style={styles.recName}>
                                                    {rec.schemeName || rec.name || 'Scheme'}
                                                </h4>
                                                <div style={styles.recMeta}>
                                                    {(rec.category || rec.ministry) && (
                                                        <span style={styles.recCategoryTag}>
                                                            {rec.category || rec.ministry}
                                                        </span>
                                                    )}
                                                    {rec.matchScore && (
                                                        <span style={styles.recMatchTag}>
                                                            {Math.round(rec.matchScore)}% match
                                                        </span>
                                                    )}
                                                </div>
                                                {(rec.description || rec.benefits) && (
                                                    <p style={styles.recDesc}>
                                                        {(rec.description || rec.benefits).length > 100
                                                            ? (rec.description || rec.benefits).substring(0, 100) + '...'
                                                            : (rec.description || rec.benefits)}
                                                    </p>
                                                )}
                                            </div>
                                            <div style={styles.recArrow}>
                                                <FiArrowRight />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick Actions Grid */}
                        <div style={styles.contentCard}>
                            <div style={styles.cardHeader}>
                                <div style={styles.cardHeaderLeft}>
                                    <div style={{
                                        ...styles.cardHeaderIcon,
                                        background: '#FFF7ED',
                                        color: '#F97316'
                                    }}>
                                        <HiSparkles />
                                    </div>
                                    <div>
                                        <h2 style={styles.cardTitle}>Quick Actions</h2>
                                        <p style={styles.cardSubtitle}>
                                            Frequently used features to help you get started
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.actionsGrid}>
                                {actionCards.map((action, i) => (
                                    <Link key={i} to={action.to} style={{
                                        ...styles.actionCard,
                                        ...(action.priority ? styles.actionCardPriority : {})
                                    }}>
                                        {action.priority && (
                                            <div style={styles.priorityBadge}>PRIORITY</div>
                                        )}
                                        <div style={{
                                            ...styles.actionIcon,
                                            background: action.bg,
                                            color: action.color
                                        }}>
                                            {action.icon}
                                        </div>
                                        <div style={styles.actionContent}>
                                            <h4 style={styles.actionTitle}>{action.title}</h4>
                                            <p style={styles.actionDesc}>{action.desc}</p>
                                        </div>
                                        <FiArrowRight style={styles.actionArrow} />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ═══════ RIGHT: Activity + Info ═══════ */}
                    <div style={styles.rightColumn}>

                        <div style={styles.contentCard}>
                            <div style={styles.cardHeader}>
                                <div style={styles.cardHeaderLeft}>
                                    <div style={{
                                        ...styles.cardHeaderIcon,
                                        background: '#F0FDF4',
                                        color: '#10B981'
                                    }}>
                                        <FiActivity />
                                    </div>
                                    <div>
                                        <h2 style={styles.cardTitle}>Your Activity</h2>
                                        <p style={styles.cardSubtitle}>Recent actions on the portal</p>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.activityList}>
                                {activities.map((activity, i) => (
                                    <div key={i} style={styles.activityItem}>
                                        <div style={{
                                            ...styles.activityIcon,
                                            background: activity.bg,
                                            color: activity.color
                                        }}>
                                            {activity.icon}
                                        </div>
                                        <div style={styles.activityContent}>
                                            <h4 style={styles.activityTitle}>{activity.title}</h4>
                                            <p style={styles.activityDesc}>{activity.desc}</p>
                                            <div style={styles.activityTime}>
                                                <FiClock style={{ fontSize: 10, marginRight: 4 }} />
                                                {activity.time}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {isProfileComplete && (
                            <div style={styles.aiPromoCard}>
                                <div style={styles.aiPromoDecor}></div>
                                <div style={styles.aiPromoContent}>
                                    <div style={styles.aiPromoIcon}>
                                        <HiSparkles />
                                    </div>
                                    <h3 style={styles.aiPromoTitle}>
                                        Get More Recommendations
                                    </h3>
                                    <p style={styles.aiPromoDesc}>
                                        Explore all AI-matched schemes with detailed insights and one-click apply
                                    </p>
                                    <Link to="/user/recommendations" style={styles.aiPromoBtn}>
                                        Explore Now
                                        <FiArrowRight style={{ marginLeft: 8 }} />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

/* ═══════════════════════════════════════════ */
/*                    STYLES                    */
/* ═══════════════════════════════════════════ */

const styles = {
    wrapper: { width: '100%', background: '#F9FAFB', minHeight: '100vh', paddingBottom: '40px' },

    loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' },
    spinner: { width: '48px', height: '48px', border: '4px solid #E5E7EB', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    loadingText: { color: '#6B7280', fontSize: '15px', fontWeight: '600' },

    // ═══ WELCOME BANNER ═══
    welcomeBanner: { position: 'relative', width: '100%', background: 'linear-gradient(135deg, #EEF2FF 0%, #ffffff 50%, #FFF7ED 100%)', padding: '40px 60px', overflow: 'hidden', borderBottom: '1px solid #E5E7EB' },
    bannerDecor1: { position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)', borderRadius: '50%' },
    bannerDecor2: { position: 'absolute', bottom: '-150px', left: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)', borderRadius: '50%' },
    bannerContainer: { position: 'relative', maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '40px', flexWrap: 'wrap', zIndex: 2 },
    bannerLeft: { flex: 1, minWidth: '300px' },
    govBadge: { display: 'inline-flex', alignItems: 'center', background: 'linear-gradient(135deg, #1E3A8A 0%, #4F46E5 100%)', color: '#ffffff', padding: '8px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '16px', boxShadow: '0 4px 14px rgba(30,58,138,0.25)' },
    welcomeTitle: { fontSize: '36px', fontWeight: '800', color: '#111827', marginBottom: '10px', letterSpacing: '-1px', lineHeight: 1.2, fontFamily: "'Noto Sans Devanagari', 'Plus Jakarta Sans', sans-serif" },
    userNameHighlight: { background: 'linear-gradient(135deg, #4F46E5 0%, #F97316 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
    welcomeSubtitle: { fontSize: '16px', color: '#4B5563', lineHeight: 1.6, marginBottom: '20px', maxWidth: '600px' },
    chipsRow: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
    infoChip: { display: 'inline-flex', alignItems: 'center', background: '#ffffff', color: '#111827', padding: '8px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: '600', border: '1px solid #E5E7EB', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' },
    chipIcon: { color: '#4F46E5', fontSize: '14px', marginRight: '6px' },

    // Avatar Card
    bannerRight: { flexShrink: 0 },
    avatarCard: { background: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '16px', minWidth: '280px' },
    avatarLarge: { width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '800', boxShadow: '0 8px 20px rgba(79,70,229,0.35)', border: '3px solid #ffffff', flexShrink: 0 },
    avatarInfo: { flex: 1 },
    avatarName: { fontSize: '16px', fontWeight: '800', color: '#111827', marginBottom: '2px' },
    avatarEmail: { fontSize: '12px', color: '#6B7280', marginBottom: '8px' },
    memberSince: { display: 'flex', alignItems: 'center', fontSize: '11px', color: '#9CA3AF', fontWeight: '600' },

    // ═══ STATS ═══
    statsSection: { padding: '30px 60px 0', width: '100%' },
    statsGrid: { maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' },
    statCard: { background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', transition: 'all 0.3s ease' },
    statTop: { marginBottom: '16px' },
    statIconBox: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
    statValueWrap: { display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '6px' },
    statValue: { fontSize: '36px', fontWeight: '900', color: '#111827', letterSpacing: '-1.5px', lineHeight: 1 },
    statSuffix: { fontSize: '16px', fontWeight: '700', color: '#6B7280' },
    statLabel: { fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px' },
    statDesc: { fontSize: '12px', fontWeight: '700' },

    // ═══ WARNING ═══
    warningSection: { padding: '20px 60px 0' },
    warningCard: { maxWidth: '1400px', margin: '0 auto', background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', border: '1px solid #FDE68A', borderRadius: '16px', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' },
    warningLeft: { display: 'flex', gap: '16px', alignItems: 'center', flex: 1 },
    warningIcon: { width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245,158,11,0.15)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 },
    warningTitle: { fontSize: '16px', fontWeight: '800', color: '#92400E', marginBottom: '4px' },
    warningDesc: { fontSize: '13px', color: '#78350F', lineHeight: 1.6, marginBottom: '10px' },
    warningProgress: { display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '400px' },
    warningProgressBar: { flex: 1, height: '8px', background: 'rgba(245,158,11,0.2)', borderRadius: '100px', overflow: 'hidden' },
    warningProgressFill: { height: '100%', background: 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)', borderRadius: '100px', transition: 'width 0.5s ease' },
    warningPercent: { fontSize: '12px', fontWeight: '800', color: '#92400E' },
    warningBtn: { display: 'inline-flex', alignItems: 'center', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#ffffff', padding: '12px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', textDecoration: 'none', boxShadow: '0 6px 20px rgba(245,158,11,0.35)', transition: 'all 0.2s' },

    // ═══ MAIN ═══
    mainSection: { padding: '30px 60px 0' },
    mainGrid: { maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '20px' },
    leftColumn: { display: 'flex', flexDirection: 'column', gap: '20px' },
    rightColumn: { display: 'flex', flexDirection: 'column', gap: '20px' },

    // Content Cards
    contentCard: { background: '#ffffff', padding: '28px', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #F3F4F6' },
    cardHeaderLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
    cardHeaderIcon: { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
    cardTitle: { fontSize: '18px', fontWeight: '800', color: '#111827', marginBottom: '4px' },
    cardSubtitle: { fontSize: '13px', color: '#6B7280' },
    viewAllBtn: { display: 'inline-flex', alignItems: 'center', color: '#4F46E5', background: '#EEF2FF', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', textDecoration: 'none', transition: 'all 0.2s' },

    // Empty State
    emptyState: { textAlign: 'center', padding: '40px 20px' },
    emptyIcon: { fontSize: '56px', marginBottom: '16px' },
    emptyTitle: { fontSize: '18px', fontWeight: '800', color: '#111827', marginBottom: '8px' },
    emptyDesc: { fontSize: '14px', color: '#6B7280', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px', lineHeight: 1.6 },
    emptyBtn: { display: 'inline-flex', alignItems: 'center', background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)', color: '#ffffff', padding: '12px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', textDecoration: 'none', boxShadow: '0 6px 20px rgba(79,70,229,0.35)', transition: 'all 0.2s' },

    // Recommendations List
    recList: { display: 'flex', flexDirection: 'column', gap: '12px' },
    recCard: { display: 'flex', alignItems: 'center', gap: '16px', padding: '18px', background: '#F9FAFB', borderRadius: '12px', border: '1px solid #F3F4F6', transition: 'all 0.2s', textDecoration: 'none', color: 'inherit' },
    recRank: { width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '800', flexShrink: 0 },
    recInfo: { flex: 1 },
    recName: { fontSize: '15px', fontWeight: '800', color: '#111827', marginBottom: '8px', lineHeight: 1.3 },
    recMeta: { display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' },
    recCategoryTag: { display: 'inline-block', background: '#EEF2FF', color: '#4338CA', padding: '3px 10px', borderRadius: '100px', fontSize: '10px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' },
    recMatchTag: { display: 'inline-block', background: '#F0FDF4', color: '#10B981', padding: '3px 10px', borderRadius: '100px', fontSize: '10px', fontWeight: '700' },
    recDesc: { fontSize: '12px', color: '#6B7280', lineHeight: 1.5 },
    recArrow: { color: '#9CA3AF', fontSize: '18px', flexShrink: 0 },

    // Actions Grid
    actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' },
    actionCard: { position: 'relative', display: 'flex', alignItems: 'center', gap: '14px', padding: '18px', background: '#F9FAFB', borderRadius: '12px', textDecoration: 'none', border: '1px solid #F3F4F6', transition: 'all 0.2s', overflow: 'hidden' },
    actionCardPriority: { background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', border: '1px solid #FDE68A' },
    priorityBadge: { position: 'absolute', top: '8px', right: '8px', background: '#F59E0B', color: '#ffffff', padding: '2px 8px', borderRadius: '100px', fontSize: '9px', fontWeight: '800', letterSpacing: '0.5px' },
    actionIcon: { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 },
    actionContent: { flex: 1 },
    actionTitle: { fontSize: '13px', fontWeight: '800', color: '#111827', marginBottom: '3px' },
    actionDesc: { fontSize: '11.5px', color: '#6B7280', lineHeight: 1.5 },
    actionArrow: { color: '#9CA3AF', fontSize: '16px', flexShrink: 0 },

    // Activity List
    activityList: { display: 'flex', flexDirection: 'column', gap: '14px' },
    activityItem: { display: 'flex', gap: '14px', padding: '14px', background: '#F9FAFB', borderRadius: '12px', border: '1px solid #F3F4F6' },
    activityIcon: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 },
    activityContent: { flex: 1 },
    activityTitle: { fontSize: '13px', fontWeight: '800', color: '#111827', marginBottom: '4px' },
    activityDesc: { fontSize: '12px', color: '#6B7280', marginBottom: '6px', lineHeight: 1.5 },
    activityTime: { display: 'inline-flex', alignItems: 'center', fontSize: '11px', color: '#9CA3AF', fontWeight: '600' },

    // AI Promo Card
    aiPromoCard: { position: 'relative', background: 'linear-gradient(135deg, #1E1B4B 0%, #4F46E5 100%)', padding: '28px 24px', borderRadius: '16px', color: '#ffffff', overflow: 'hidden', boxShadow: '0 20px 40px rgba(79,70,229,0.35)' },
    aiPromoDecor: { position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 70%)', borderRadius: '50%' },
    aiPromoContent: { position: 'relative', zIndex: 2, textAlign: 'center' },
    aiPromoIcon: { width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(255,255,255,0.15)', color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '24px' },
    aiPromoTitle: { fontSize: '17px', fontWeight: '800', marginBottom: '8px' },
    aiPromoDesc: { fontSize: '13px', opacity: 0.9, marginBottom: '16px', lineHeight: 1.6 },
    aiPromoBtn: { display: 'inline-flex', alignItems: 'center', background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', color: '#ffffff', padding: '11px 22px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', textDecoration: 'none', boxShadow: '0 6px 20px rgba(249,115,22,0.35)' },

    // Help Card
    helpCard: { background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)', padding: '24px', borderRadius: '16px', border: '1px solid #C7D2FE', textAlign: 'center' },
    helpIcon: { fontSize: '32px', marginBottom: '10px' },
    helpTitle: { fontSize: '15px', fontWeight: '800', color: '#4338CA', marginBottom: '8px' },
    helpDesc: { fontSize: '12px', color: '#4B5563', lineHeight: 1.6, marginBottom: '12px' },
    helpLink: { display: 'inline-block', color: '#4F46E5', fontSize: '13px', fontWeight: '700', textDecoration: 'none' }
};

export default UserDashboard;