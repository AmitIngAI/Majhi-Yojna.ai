import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { savedAPI } from '../../services/api';
import {
    FiHeart, FiExternalLink, FiTrash2, FiEye, FiSearch,
    FiFilter, FiBookmark, FiAlertCircle
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import {
    FaGraduationCap, FaBriefcase, FaTractor, FaBalanceScale,
    FaHome, FaHeartbeat, FaFemale, FaTh
} from 'react-icons/fa';

const SavedSchemes = () => {
    const { user } = useAuth();
    const [saved, setSaved] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (user?.userId) fetchSaved();
    }, [user]);

    const fetchSaved = async () => {
        try {
            setLoading(true);
            const res = await savedAPI.getSaved(user.userId);
            const data = res.data?.data || res.data || [];
            console.log('📥 Saved schemes:', data);
            setSaved(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error:', err);
            setSaved([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (schemeId) => {
        if (!window.confirm('Remove this scheme from saved?')) return;
        try {
            await savedAPI.toggleSave(user.userId, schemeId);
            setSaved(prev => prev.filter(s => (s.schemeId || s.scheme?.id) !== schemeId));
            setMsg('✓ Scheme removed');
            setTimeout(() => setMsg(''), 2500);
        } catch (err) {
            console.error(err);
            setMsg('❌ Failed to remove');
            setTimeout(() => setMsg(''), 2500);
        }
    };

    const getCategoryIcon = (category) => {
        if (!category) return <FaTh />;
        const cat = category.toLowerCase();
        if (cat.includes('education')) return <FaGraduationCap />;
        if (cat.includes('employ')) return <FaBriefcase />;
        if (cat.includes('agri')) return <FaTractor />;
        if (cat.includes('social')) return <FaBalanceScale />;
        if (cat.includes('hous')) return <FaHome />;
        if (cat.includes('health')) return <FaHeartbeat />;
        if (cat.includes('women')) return <FaFemale />;
        return <FaTh />;
    };

    const getCategoryColor = (category) => {
        if (!category) return '#6B7280';
        const cat = category.toLowerCase();
        if (cat.includes('education')) return '#4F46E5';
        if (cat.includes('employ')) return '#F97316';
        if (cat.includes('agri')) return '#10B981';
        if (cat.includes('social')) return '#F59E0B';
        if (cat.includes('hous')) return '#3B82F6';
        if (cat.includes('health')) return '#EF4444';
        if (cat.includes('women')) return '#EC4899';
        return '#6B7280';
    };

    // ─── Filter with proper data extraction ───
    const getSchemeData = (item) => {
        // Handle both {scheme: {...}} and flat structure
        return item.scheme || item;
    };

    const filteredSaved = saved.filter(item => {
        const scheme = getSchemeData(item);
        if (!scheme || !scheme.schemeName) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return scheme.schemeName?.toLowerCase().includes(q) ||
                   scheme.description?.toLowerCase().includes(q);
        }
        return true;
    });

    if (loading) {
        return (
            <div style={styles.loadingWrap}>
                <div style={styles.spinner}></div>
                <p style={{ color: '#6B7280', marginTop: 16 }}>Loading saved schemes...</p>
            </div>
        );
    }

    return (
        <div style={styles.wrapper}>

            {/* HEADER */}
            <section style={styles.header}>
                <div style={styles.headerDecor}></div>
                <div style={styles.headerContainer}>
                    <div>
                        <div style={styles.headerBadge}>
                            <FiHeart style={{ marginRight: 6, color: '#EC4899' }} />
                            YOUR SAVED SCHEMES
                        </div>
                        <h1 style={styles.headerTitle}>
                            Saved for <span style={styles.headerAccent}>Later Review</span>
                        </h1>
                        <p style={styles.headerDesc}>
                            {saved.length > 0
                                ? `You have ${saved.length} scheme${saved.length > 1 ? 's' : ''} bookmarked`
                                : 'Bookmark schemes to review later'}
                        </p>
                    </div>
                    <div style={styles.headerStats}>
                        <div style={styles.statCard}>
                            <FiBookmark style={{ fontSize: 20, color: '#EC4899' }} />
                            <div>
                                <div style={styles.statValue}>{saved.length}</div>
                                <div style={styles.statLabel}>Total Saved</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {msg && <div style={styles.msgBar}><span>{msg}</span></div>}

            <div style={styles.container}>

                {saved.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>🔖</div>
                        <h2 style={styles.emptyTitle}>No Saved Schemes Yet</h2>
                        <p style={styles.emptyDesc}>
                            Browse schemes and click the heart icon to save them here for quick access
                        </p>
                        <div style={styles.emptyBtns}>
                            {/* ✅ CHANGED: /user/schemes instead of /schemes */}
                            <Link to="/user/schemes" style={styles.primaryBtn}>
                                <FiSearch style={{ marginRight: 8 }} />
                                Browse All Schemes
                            </Link>
                            <Link to="/user/recommendations" style={styles.secondaryBtn}>
                                <HiSparkles style={{ marginRight: 8 }} />
                                AI Recommendations
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        <div style={styles.filtersBar}>
                            <div style={styles.searchWrap}>
                                <FiSearch style={styles.searchIcon} />
                                <input
                                    type="text"
                                    placeholder="Search saved schemes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={styles.searchInput}
                                />
                            </div>
                        </div>

                        {filteredSaved.length === 0 ? (
                            <div style={styles.noResults}>
                                <FiAlertCircle style={{ fontSize: 48, color: '#F59E0B' }} />
                                <h3>No schemes match your search</h3>
                                <button onClick={() => setSearchQuery('')} style={styles.clearBtn}>
                                    Clear Search
                                </button>
                            </div>
                        ) : (
                            <>
                                <div style={styles.resultInfo}>
                                    Showing <strong>{filteredSaved.length}</strong> of <strong>{saved.length}</strong> saved schemes
                                </div>

                                <div style={styles.schemesGrid}>
                                    {filteredSaved.map((item, i) => {
                                        const scheme = getSchemeData(item);
                                        const schemeId = scheme.id || item.schemeId;
                                        if (!schemeId) return null;

                                        const catColor = getCategoryColor(scheme.category);

                                        return (
                                            <div key={schemeId || i} style={styles.schemeCard}>
                                                <div style={styles.cardTop}>
                                                    <div style={{
                                                        ...styles.cardIcon,
                                                        background: `linear-gradient(135deg, ${catColor}20 0%, ${catColor}10 100%)`,
                                                        color: catColor
                                                    }}>
                                                        {getCategoryIcon(scheme.category)}
                                                    </div>
                                                    <div style={styles.savedBadge}>
                                                        <FiHeart style={{ fill: '#EC4899', color: '#EC4899' }} />
                                                    </div>
                                                </div>

                                                <span style={{
                                                    ...styles.categoryTag,
                                                    background: `${catColor}15`,
                                                    color: catColor
                                                }}>
                                                    {scheme.category?.toUpperCase() || 'GENERAL'}
                                                </span>

                                                <h3 style={styles.schemeName}>{scheme.schemeName}</h3>

                                                <p style={styles.schemeDesc}>
                                                    {scheme.description
                                                        ? (scheme.description.length > 100
                                                            ? scheme.description.substring(0, 100) + '...'
                                                            : scheme.description)
                                                        : 'Government scheme for eligible citizens'}
                                                </p>

                                                {scheme.benefits && (
                                                    <div style={styles.benefitBox}>
                                                        💰 {scheme.benefits.length > 60
                                                            ? scheme.benefits.substring(0, 60) + '...'
                                                            : scheme.benefits}
                                                    </div>
                                                )}

                                                <div style={styles.cardActions}>
                                                    {/* ✅ CHANGED: /user/schemes/:id */}
                                                    <Link to={`/user/schemes/${schemeId}`} style={styles.viewBtn}>
                                                        <FiEye style={{ marginRight: 6 }} />
                                                        View
                                                    </Link>
                                                    {scheme.officialLink && (
                                                        <a href={scheme.officialLink} target="_blank" rel="noreferrer" style={styles.applyBtn}>
                                                            Apply <FiExternalLink style={{ marginLeft: 4 }} />
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => handleRemove(schemeId)}
                                                        style={styles.removeBtn}
                                                        title="Remove from saved">
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

const styles = {
    wrapper: { width: '100%', minHeight: '100vh', paddingBottom: '40px' },
    loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' },
    spinner: { width: '48px', height: '48px', border: '4px solid #E5E7EB', borderTopColor: '#EC4899', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    header: { position: 'relative', background: 'linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 100%)', padding: '40px', borderRadius: '20px', marginBottom: '24px', overflow: 'hidden', border: '1px solid #F9A8D4' },
    headerDecor: { position: 'absolute', top: '-50px', right: '-50px', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)', borderRadius: '50%' },
    headerContainer: { position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', zIndex: 2 },
    headerBadge: { display: 'inline-flex', alignItems: 'center', background: 'rgba(236,72,153,0.15)', color: '#BE185D', padding: '6px 14px', borderRadius: '100px', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', marginBottom: '14px' },
    headerTitle: { fontSize: '32px', fontWeight: '800', color: '#111827', marginBottom: '8px', letterSpacing: '-1px' },
    headerAccent: { background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    headerDesc: { fontSize: '14px', color: '#6B7280' },
    statCard: { display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 24px', background: '#ffffff', borderRadius: '14px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' },
    statValue: { fontSize: '24px', fontWeight: '800', color: '#111827' },
    statLabel: { fontSize: '12px', color: '#6B7280', fontWeight: '600' },
    msgBar: { padding: '12px 20px', background: '#D1FAE5', color: '#065F46', borderRadius: '10px', marginBottom: '16px', fontSize: '14px', fontWeight: '600' },
    container: {},
    emptyState: { background: '#ffffff', padding: '80px 40px', borderRadius: '20px', border: '1px solid #E5E7EB', textAlign: 'center' },
    emptyIcon: { fontSize: '80px', marginBottom: '20px' },
    emptyTitle: { fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '10px' },
    emptyDesc: { fontSize: '15px', color: '#6B7280', marginBottom: '30px', maxWidth: '450px', margin: '0 auto 30px' },
    emptyBtns: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' },
    primaryBtn: { display: 'inline-flex', alignItems: 'center', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', color: '#ffffff', padding: '14px 28px', borderRadius: '12px', textDecoration: 'none', fontSize: '14px', fontWeight: '700', boxShadow: '0 6px 20px rgba(236,72,153,0.35)' },
    secondaryBtn: { display: 'inline-flex', alignItems: 'center', background: '#F3F4F6', color: '#111827', padding: '14px 28px', borderRadius: '12px', textDecoration: 'none', fontSize: '14px', fontWeight: '700' },
    filtersBar: { background: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #E5E7EB', marginBottom: '20px' },
    searchWrap: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: '#F9FAFB', borderRadius: '10px', border: '1px solid #E5E7EB' },
    searchIcon: { color: '#6B7280', fontSize: '16px' },
    searchInput: { flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', fontFamily: 'inherit' },
    resultInfo: { fontSize: '14px', color: '#6B7280', marginBottom: '16px', padding: '0 4px' },
    noResults: { background: '#ffffff', padding: '60px 40px', borderRadius: '20px', border: '1px solid #E5E7EB', textAlign: 'center' },
    clearBtn: { marginTop: '20px', background: '#EC4899', color: '#ffffff', padding: '10px 24px', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
    schemesGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
    schemeCard: { background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
    cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
    cardIcon: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' },
    savedBadge: { width: '36px', height: '36px', borderRadius: '10px', background: '#FDF2F8', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    categoryTag: { display: 'inline-block', fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '100px', letterSpacing: '0.5px', marginBottom: '12px', alignSelf: 'flex-start' },
    schemeName: { fontSize: '16px', fontWeight: '800', color: '#111827', marginBottom: '10px', lineHeight: 1.3, minHeight: '42px' },
    schemeDesc: { fontSize: '13px', color: '#6B7280', lineHeight: 1.6, marginBottom: '12px', flex: 1 },
    benefitBox: { background: '#F0FDF4', color: '#059669', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', marginBottom: '14px', border: '1px solid rgba(16,185,129,0.15)' },
    cardActions: { display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid #F3F4F6' },
    viewBtn: { flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6', color: '#111827', padding: '10px', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: '700' },
    applyBtn: { flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', color: '#ffffff', padding: '10px', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: '700', boxShadow: '0 4px 12px rgba(236,72,153,0.3)' },
    removeBtn: { width: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }
};

export default SavedSchemes;