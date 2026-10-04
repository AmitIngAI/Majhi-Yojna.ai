import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { schemeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    FiSearch, FiX, FiArrowRight,
    FiUsers, FiMapPin,
    FiAward, FiTrendingUp
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import {
    FaGraduationCap, FaBriefcase, FaTractor,
    FaBalanceScale, FaHome, FaHeartbeat, FaFemale, FaTh
} from 'react-icons/fa';

const Schemes = () => {
    const [schemes, setSchemes]         = useState([]);
    const [filtered, setFiltered]       = useState([]);
    const [loading, setLoading]         = useState(true);
    const [search, setSearch]           = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [activeGender, setActiveGender]     = useState('all');
    const [hoveredCard, setHoveredCard] = useState(null);

    // ─── Pagination ───
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    const { user }       = useAuth();
    const navigate       = useNavigate();
    const location       = useLocation();
    const [searchParams] = useSearchParams();
    const urlCategory    = searchParams.get('category');

    // ─── Detect if user is inside dashboard ───
    const isInsideDashboard = location.pathname.startsWith('/user/');
    const detailPath = isInsideDashboard ? '/user/schemes' : '/schemes';

    /* ── Fetch schemes ── */
    useEffect(() => {
        loadSchemes();
    }, []);

    useEffect(() => {
        if (urlCategory) setActiveCategory(urlCategory.toLowerCase());
    }, [urlCategory]);

    useEffect(() => {
        applyFilters();
    }, [search, activeCategory, activeGender, schemes]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory, activeGender, search]);

    const loadSchemes = async () => {
        try {
            const res = await schemeAPI.getAll();
            setSchemes(res.data.data || res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...schemes];

        if (activeCategory !== 'all') {
            result = result.filter(s =>
                s.category?.toLowerCase().includes(activeCategory.toLowerCase())
                || s.category?.toLowerCase().replace(' ', '-') === activeCategory
            );
        }

        if (activeGender !== 'all') {
            result = result.filter(s =>
                s.gender?.toLowerCase() === activeGender.toLowerCase()
                || s.gender?.toLowerCase() === 'all'
            );
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(s =>
                s.name?.toLowerCase().includes(q)
                || s.schemeName?.toLowerCase().includes(q)
                || s.description?.toLowerCase().includes(q)
                || s.category?.toLowerCase().includes(q)
            );
        }

        setFiltered(result);
    };

    /* ── Category config ── */
    const categories = [
        { id: 'all',            label: 'All Schemes',    icon: <FaTh />,            color: '#4F46E5' },
        { id: 'education',      label: 'Education',      icon: <FaGraduationCap />, color: '#4F46E5' },
        { id: 'employment',     label: 'Employment',     icon: <FaBriefcase />,     color: '#10B981' },
        { id: 'agriculture',    label: 'Agriculture',    icon: <FaTractor />,       color: '#F97316' },
        { id: 'social-justice', label: 'Social Justice', icon: <FaBalanceScale />,  color: '#8B5CF6' },
        { id: 'housing',        label: 'Housing',        icon: <FaHome />,          color: '#EF4444' },
        { id: 'health',         label: 'Health',         icon: <FaHeartbeat />,     color: '#EC4899' },
        { id: 'women',          label: 'Women',          icon: <FaFemale />,        color: '#F59E0B' }
    ];

    const getCategoryConfig = (cat) => {
        const key = cat?.toLowerCase().replace(' ', '-');
        return categories.find(c => c.id === key) || categories[0];
    };

    const clearFilters = () => {
        setActiveCategory('all');
        setActiveGender('all');
        setSearch('');
    };

    /* ── Pagination Logic ── */
    const totalPages     = Math.ceil(filtered.length / itemsPerPage);
    const indexOfLast    = currentPage * itemsPerPage;
    const indexOfFirst   = indexOfLast - itemsPerPage;
    const currentSchemes = filtered.slice(indexOfFirst, indexOfLast);

    const goToPage = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 400, behavior: 'smooth' });
    };

    // ─── Handle card click — Navigate to right detail page ───
    const handleCardClick = (schemeId) => {
    if (!user && !isInsideDashboard) {
        sessionStorage.setItem('redirectAfterLogin', `/user/schemes/${schemeId}`);
        navigate('/login', {
            state: {
                from: `/schemes/${schemeId}`,
                message: 'Please login to view scheme details and apply'
            }
        });
        return;
    }
    navigate(`${detailPath}/${schemeId}`);
    };

    return (
        <div style={styles.page}>

            {/* ══════ 1. HERO BANNER ══════ */}
            <section style={styles.hero}>
                <div style={styles.blob1} />
                <div style={styles.blob2} />

                {/* Ashoka Chakra */}
                <div style={styles.chakraWatermark}>
                    <svg viewBox="0 0 100 100" width="100%" height="100%" opacity="0.06">
                        <circle cx="50" cy="50" r="45" stroke="white"
                            strokeWidth="2" fill="none" />
                        {Array.from({ length: 24 }).map((_, i) => {
                            const a = (i * 15 * Math.PI) / 180;
                            return (
                                <line key={i}
                                    x1={50 + 10 * Math.cos(a)}
                                    y1={50 + 10 * Math.sin(a)}
                                    x2={50 + 44 * Math.cos(a)}
                                    y2={50 + 44 * Math.sin(a)}
                                    stroke="white" strokeWidth="1.5" />
                            );
                        })}
                        <circle cx="50" cy="50" r="10" stroke="white"
                            strokeWidth="2" fill="none" />
                    </svg>
                </div>

                {/* Tricolor top */}
                <div style={styles.tricolorTop}>
                    <div style={{ flex: 1, background: '#FF9933' }} />
                    <div style={{ flex: 1, background: '#ffffff' }} />
                    <div style={{ flex: 1, background: '#138808' }} />
                </div>

                <div style={styles.heroContent}>
                    <div style={styles.heroBadge}>
                        <HiSparkles size={13} style={{ marginRight: 6 }} />
                        30+ VERIFIED GOVERNMENT SCHEMES · MAHARASHTRA
                    </div>

                    <h1 style={styles.heroTitle}>
                        Discover <span style={styles.heroOrange}>Government</span>
                        <br />
                        Welfare <span style={styles.heroGreen}>Schemes</span>
                    </h1>

                    <p style={styles.heroDesc}>
                        Browse all Maharashtra Government schemes tailored for you.
                        Filter by category, check eligibility, and apply directly.
                    </p>

                    {/* Stats Bar */}
                    <div style={styles.statsBar}>
                        <div style={styles.statItem}>
                            <FiAward size={22} color="#FF9933" />
                            <div>
                                <div style={styles.statNum}>{schemes.length || 30}+</div>
                                <div style={styles.statLabel}>Total Schemes</div>
                            </div>
                        </div>
                        <div style={styles.statDivider} />
                        <div style={styles.statItem}>
                            <FiUsers size={22} color="#4ADE80" />
                            <div>
                                <div style={styles.statNum}>1000+</div>
                                <div style={styles.statLabel}>Citizens Helped</div>
                            </div>
                        </div>
                        <div style={styles.statDivider} />
                        <div style={styles.statItem}>
                            <FiTrendingUp size={22} color="#F97316" />
                            <div>
                                <div style={styles.statNum}>₹5.2Cr</div>
                                <div style={styles.statLabel}>Benefits Unlocked</div>
                            </div>
                        </div>
                    </div>

                    {/* Big Search Bar */}
                    <div style={styles.heroSearchWrap}>
                        <FiSearch style={styles.heroSearchIcon} />
                        <input
                            type="text"
                            placeholder="Search schemes by name, keyword or category..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={styles.heroSearch}
                        />
                        {search && (
                            <button onClick={() => setSearch('')}
                                style={styles.heroSearchClear}>
                                <FiX />
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* ══════ 2. CATEGORY PILLS ══════ */}
            <section style={styles.pillsSection}>
                <div style={styles.pillsContainer}>
                    <div style={styles.pillsScroll}>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                style={{
                                    ...styles.pill,
                                    ...(activeCategory === cat.id ? {
                                        background: cat.color,
                                        color: '#ffffff',
                                        borderColor: cat.color,
                                        boxShadow: `0 8px 20px ${cat.color}40`
                                    } : {})
                                }}>
                                <span style={{
                                    ...styles.pillIcon,
                                    color: activeCategory === cat.id ? '#ffffff' : cat.color
                                }}>
                                    {cat.icon}
                                </span>
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════ 3. MAIN CONTENT ══════ */}
            <section style={styles.mainSection}>
                <div style={styles.container}>

                    {/* Results Header */}
                    <div style={styles.resultsHeader}>
                        <div>
                            <h2 style={styles.resultsTitle}>
                                {activeCategory === 'all'
                                    ? 'All Schemes'
                                    : categories.find(c => c.id === activeCategory)?.label
                                }
                            </h2>
                            <p style={styles.resultsCount}>
                                Showing <strong>{filtered.length}</strong> of {schemes.length} schemes
                            </p>
                        </div>

                        {(activeCategory !== 'all' || activeGender !== 'all' || search) && (
                            <button onClick={clearFilters} style={styles.clearBtn}>
                                <FiX size={14} /> Clear All Filters
                            </button>
                        )}
                    </div>

                    {/* Loading */}
                    {loading ? (
                        <div style={styles.loadingBox}>
                            <div style={styles.loadingSpinner} />
                            <p>Loading schemes...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        /* Empty State */
                        <div style={styles.emptyBox}>
                            <div style={styles.emptyIcon}>🔍</div>
                            <h3 style={styles.emptyTitle}>No schemes found</h3>
                            <p style={styles.emptyDesc}>
                                Try adjusting your filters or search terms
                            </p>
                            <button onClick={clearFilters} style={styles.emptyBtn}>
                                Reset Filters
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Scheme Cards Grid */}
                            <div style={styles.cardsGrid}>
                                {currentSchemes.map((scheme, i) => {
                                    const catConfig = getCategoryConfig(scheme.category);
                                    return (
                                        <div
                                            key={scheme.id || i}
                                            onMouseEnter={() => setHoveredCard(scheme.id)}
                                            onMouseLeave={() => setHoveredCard(null)}
                                            onClick={() => handleCardClick(scheme.id)}
                                            style={{
                                                ...styles.card,
                                                transform: hoveredCard === scheme.id
                                                    ? 'translateY(-8px)'
                                                    : 'translateY(0)',
                                                boxShadow: hoveredCard === scheme.id
                                                    ? `0 20px 40px ${catConfig.color}25`
                                                    : '0 2px 12px rgba(0,0,0,0.06)',
                                                borderColor: hoveredCard === scheme.id
                                                    ? catConfig.color
                                                    : '#F3F4F6'
                                            }}>

                                            {/* Card Header */}
                                            <div style={styles.cardHeader}>
                                                <div style={{
                                                    ...styles.categoryBadge,
                                                    background: `${catConfig.color}15`,
                                                    color: catConfig.color
                                                }}>
                                                    <span style={styles.categoryIcon}>
                                                        {catConfig.icon}
                                                    </span>
                                                    {(scheme.category || 'General').toUpperCase()}
                                                </div>
                                                {scheme.status && (
                                                    <span style={styles.statusChip}>
                                                        <span style={styles.statusDot} />
                                                        Active
                                                    </span>
                                                )}
                                            </div>

                                            {/* Colored accent */}
                                            <div style={{
                                                ...styles.cardAccent,
                                                background: `linear-gradient(90deg, ${catConfig.color} 0%, ${catConfig.color}80 100%)`
                                            }} />

                                            {/* Card Body */}
                                            <div style={styles.cardBody}>
                                                <h3 style={styles.cardTitle}>
                                                    {scheme.name || scheme.schemeName || 'Scheme Name'}
                                                </h3>

                                                <p style={styles.cardDesc}>
                                                    {scheme.description
                                                        ? scheme.description.substring(0, 120) + (scheme.description.length > 120 ? '...' : '')
                                                        : 'Government welfare scheme for eligible Maharashtra citizens.'
                                                    }
                                                </p>

                                                {/* Info Grid */}
                                                <div style={styles.infoGrid}>
                                                    <div style={styles.infoItem}>
                                                        <div style={styles.infoLabel}>AGE</div>
                                                        <div style={styles.infoValue}>
                                                            {scheme.minAge || scheme.ageMin || 0}-{scheme.maxAge || scheme.ageMax || 100}
                                                        </div>
                                                    </div>
                                                    <div style={styles.infoDivider} />
                                                    <div style={styles.infoItem}>
                                                        <div style={styles.infoLabel}>INCOME</div>
                                                        <div style={styles.infoValue}>
                                                            ₹{(scheme.maxIncome || scheme.incomeLimit)
                                                                ? ((scheme.maxIncome || scheme.incomeLimit) / 100000).toFixed(1) + 'L'
                                                                : 'Any'}
                                                        </div>
                                                    </div>
                                                    <div style={styles.infoDivider} />
                                                    <div style={styles.infoItem}>
                                                        <div style={styles.infoLabel}>FOR</div>
                                                        <div style={styles.infoValue}>
                                                            {scheme.gender || scheme.genderRequired || 'All'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Benefits Highlight */}
                                                {scheme.benefits && (
                                                    <div style={styles.benefitBox}>
                                                        <span style={styles.benefitIcon}>💰</span>
                                                        <span style={styles.benefitText}>
                                                            {scheme.benefits.substring(0, 60)}
                                                            {scheme.benefits.length > 60 ? '...' : ''}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Footer */}
                                                <div style={styles.cardFooter}>
                                                    <span style={{
                                                        ...styles.viewLink,
                                                        color: catConfig.color
                                                    }}>
                                                        {!user && !isInsideDashboard ? 'Login to View' : 'View Full Details'}
                                                        <FiArrowRight
                                                            size={14}
                                                            style={{
                                                                marginLeft: 6,
                                                                transform: hoveredCard === scheme.id
                                                                    ? 'translateX(4px)'
                                                                    : 'translateX(0)',
                                                                transition: 'transform 0.3s'
                                                            }}
                                                        />
                                                    </span>
                                                    <span style={styles.locationChip}>
                                                        <FiMapPin size={11} /> MH
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ══════ PAGINATION ══════ */}
                            {totalPages > 1 && (
                                <div style={styles.paginationWrap}>
                                    {/* Previous */}
                                    <button
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        style={{
                                            ...styles.pageBtn,
                                            ...styles.pageArrow,
                                            opacity: currentPage === 1 ? 0.4 : 1,
                                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                                        }}>
                                        ← Prev
                                    </button>

                                    {/* Page numbers */}
                                    <div style={styles.pageNumbers}>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(page =>
                                                page === 1
                                                || page === totalPages
                                                || Math.abs(page - currentPage) <= 1
                                            )
                                            .map((page, idx, arr) => (
                                                <React.Fragment key={page}>
                                                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                                                        <span style={styles.pageDots}>···</span>
                                                    )}
                                                    <button
                                                        onClick={() => goToPage(page)}
                                                        style={{
                                                            ...styles.pageBtn,
                                                            ...(currentPage === page ? styles.pageBtnActive : {})
                                                        }}>
                                                        {page}
                                                    </button>
                                                </React.Fragment>
                                            ))
                                        }
                                    </div>

                                    {/* Next */}
                                    <button
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        style={{
                                            ...styles.pageBtn,
                                            ...styles.pageArrow,
                                            opacity: currentPage === totalPages ? 0.4 : 1,
                                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                                        }}>
                                        Next →
                                    </button>
                                </div>
                            )}

                            {/* Page Info */}
                            {totalPages > 1 && (
                                <div style={styles.pageInfo}>
                                    Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                                    &nbsp;·&nbsp; Showing {indexOfFirst + 1}–{Math.min(indexOfLast, filtered.length)} of {filtered.length} schemes
                                </div>
                            )}
                        </>
                    )}

                    {/* ══════ CTA Section — ONLY show in PUBLIC view ══════ */}
                    {filtered.length > 0 && !isInsideDashboard && (
                        <div style={styles.ctaBox}>
                            <div style={styles.ctaLeft}>
                                <div style={styles.ctaBadge}>
                                    <HiSparkles size={12} style={{ marginRight: 5 }} />
                                    AI-POWERED
                                </div>
                                <h3 style={styles.ctaTitle}>
                                    Not sure which schemes are for you?
                                </h3>
                                <p style={styles.ctaDesc}>
                                    Let our AI recommend the best schemes based on
                                    your profile — takes just 30 seconds!
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/register')}
                                style={styles.ctaBtn}>
                                Get AI Recommendations <FiArrowRight style={{ marginLeft: 8 }} />
                            </button>
                        </div>
                    )}

                    {/* ══════ Inside Dashboard CTA — Show DIFFERENT CTA ══════ */}
                    {filtered.length > 0 && isInsideDashboard && (
                        <div style={styles.ctaBox}>
                            <div style={styles.ctaLeft}>
                                <div style={styles.ctaBadge}>
                                    <HiSparkles size={12} style={{ marginRight: 5 }} />
                                    AI-POWERED FOR YOU
                                </div>
                                <h3 style={styles.ctaTitle}>
                                    Want personalized recommendations?
                                </h3>
                                <p style={styles.ctaDesc}>
                                    Our AI analyzes your profile to find the best schemes matched to your eligibility.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/user/recommendations')}
                                style={styles.ctaBtn}>
                                View My Recommendations <FiArrowRight style={{ marginLeft: 8 }} />
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
};

/* ═══════════════════════════════════════════
   STYLES
═══════════════════════════════════════════ */
const styles = {
    page: {
        width: '100%',
        backgroundColor: '#F9FAFB',
        minHeight: '100vh'
    },

    /* ═══ HERO ═══ */
    hero: {
        position: 'relative',
        background: 'linear-gradient(160deg, #1E1B4B 0%, #312E81 40%, #1E3A8A 70%, #1E1B4B 100%)',
        overflow: 'hidden'
    },
    blob1: {
        position: 'absolute', top: '-80px', right: '-80px',
        width: '350px', height: '350px',
        background: 'radial-gradient(circle, rgba(249,115,22,0.25) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
    },
    blob2: {
        position: 'absolute', bottom: '-60px', left: '-60px',
        width: '300px', height: '300px',
        background: 'radial-gradient(circle, rgba(74,222,128,0.2) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
    },
    chakraWatermark: {
        position: 'absolute', top: '50%', right: '5%',
        transform: 'translateY(-50%)',
        width: '300px', height: '300px',
        pointerEvents: 'none', zIndex: 0
    },
    tricolorTop: {
        display: 'flex', height: '5px', width: '100%',
        position: 'relative', zIndex: 5
    },
    heroContent: {
        position: 'relative', zIndex: 2,
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '70px 40px 80px',
        textAlign: 'center'
    },
    heroBadge: {
        display: 'inline-flex', alignItems: 'center',
        background: 'rgba(255,255,255,0.12)',
        backdropFilter: 'blur(10px)',
        color: 'rgba(255,255,255,0.9)',
        padding: '8px 18px', borderRadius: '100px',
        fontSize: '11px', fontWeight: '700', letterSpacing: '1.5px',
        border: '1px solid rgba(255,255,255,0.2)',
        marginBottom: '24px'
    },
    heroTitle: {
        fontSize: '54px', fontWeight: '900', color: '#ffffff',
        letterSpacing: '-2px', lineHeight: '1.1',
        marginBottom: '20px'
    },
    heroOrange: { color: '#FF9933' },
    heroGreen: { color: '#4ADE80' },
    heroDesc: {
        fontSize: '17px', color: 'rgba(255,255,255,0.8)',
        lineHeight: '1.7', maxWidth: '620px',
        margin: '0 auto 36px'
    },
    statsBar: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '32px',
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '16px',
        padding: '18px 32px',
        marginBottom: '36px'
    },
    statItem: {
        display: 'flex', alignItems: 'center', gap: '12px',
        color: '#ffffff'
    },
    statNum: {
        fontSize: '22px', fontWeight: '800',
        letterSpacing: '-0.5px', textAlign: 'left'
    },
    statLabel: {
        fontSize: '11px', opacity: 0.7,
        fontWeight: '600', letterSpacing: '0.5px',
        textTransform: 'uppercase'
    },
    statDivider: {
        width: '1px', height: '30px',
        background: 'rgba(255,255,255,0.15)'
    },

    /* HERO SEARCH */
    heroSearchWrap: {
        position: 'relative',
        maxWidth: '600px',
        margin: '0 auto'
    },
    heroSearchIcon: {
        position: 'absolute',
        left: '22px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '20px',
        color: '#9CA3AF',
        zIndex: 2
    },
    heroSearch: {
        width: '100%',
        padding: '18px 60px 18px 56px',
        fontSize: '15px',
        border: 'none',
        borderRadius: '14px',
        background: '#ffffff',
        color: '#111827',
        outline: 'none',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        fontFamily: 'inherit',
        fontWeight: '500'
    },
    heroSearchClear: {
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '36px', height: '36px',
        border: 'none',
        background: '#F3F4F6',
        borderRadius: '50%',
        color: '#6B7280',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },

    /* ═══ CATEGORY PILLS ═══ */
    pillsSection: {
        background: '#ffffff',
        borderBottom: '1px solid #F3F4F6',
        padding: '20px 0',
        position: 'sticky',
        top: '88px',
        zIndex: 50,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    },
    pillsContainer: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 40px'
    },
    pillsScroll: {
        display: 'flex',
        gap: '10px',
        overflowX: 'auto',
        paddingBottom: '4px'
    },
    pill: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        borderRadius: '100px',
        border: '1.5px solid #E5E7EB',
        background: '#ffffff',
        color: '#4B5563',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        whiteSpace: 'nowrap',
        fontFamily: 'inherit',
        flexShrink: 0
    },
    pillIcon: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px'
    },

    /* ═══ MAIN ═══ */
    mainSection: {
        padding: '48px 0 80px'
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 40px'
    },
    resultsHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
    },
    resultsTitle: {
        fontSize: '28px',
        fontWeight: '800',
        color: '#111827',
        marginBottom: '6px',
        letterSpacing: '-0.5px'
    },
    resultsCount: {
        fontSize: '14px',
        color: '#6B7280',
        margin: 0
    },
    clearBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 18px',
        background: '#FEE2E2',
        color: '#DC2626',
        border: 'none',
        borderRadius: '10px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.2s'
    },

    /* ═══ LOADING & EMPTY ═══ */
    loadingBox: {
        textAlign: 'center',
        padding: '80px 20px',
        color: '#6B7280'
    },
    loadingSpinner: {
        width: '40px',
        height: '40px',
        border: '3px solid #E5E7EB',
        borderTopColor: '#4F46E5',
        borderRadius: '50%',
        margin: '0 auto 20px',
        animation: 'spin 0.8s linear infinite'
    },
    emptyBox: {
        textAlign: 'center',
        padding: '80px 20px',
        background: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #F3F4F6'
    },
    emptyIcon: { fontSize: '56px', marginBottom: '16px' },
    emptyTitle: {
        fontSize: '22px',
        fontWeight: '800',
        color: '#111827',
        marginBottom: '8px'
    },
    emptyDesc: {
        fontSize: '14px',
        color: '#6B7280',
        marginBottom: '24px'
    },
    emptyBtn: {
        padding: '12px 28px',
        background: '#4F46E5',
        color: '#ffffff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        fontFamily: 'inherit'
    },

    /* ═══ CARDS GRID ═══ */
    cardsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '24px'
    },
    card: {
        background: '#ffffff',
        borderRadius: '20px',
        border: '1.5px solid #F3F4F6',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
    },
    cardAccent: {
        height: '4px',
        width: '100%'
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 22px 12px'
    },
    categoryBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '100px',
        fontSize: '10.5px',
        fontWeight: '800',
        letterSpacing: '1px'
    },
    categoryIcon: {
        fontSize: '13px',
        display: 'flex'
    },
    statusChip: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        background: '#F0FDF4',
        color: '#16A34A',
        borderRadius: '100px',
        fontSize: '11px',
        fontWeight: '700'
    },
    statusDot: {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: '#16A34A',
        animation: 'pulse 2s infinite'
    },

    cardBody: {
        padding: '4px 22px 22px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
    },
    cardTitle: {
        fontSize: '17px',
        fontWeight: '800',
        color: '#111827',
        marginBottom: '10px',
        lineHeight: '1.35',
        minHeight: '46px'
    },
    cardDesc: {
        fontSize: '13.5px',
        color: '#6B7280',
        lineHeight: '1.6',
        marginBottom: '18px',
        minHeight: '65px'
    },

    /* INFO GRID */
    infoGrid: {
        display: 'flex',
        alignItems: 'center',
        background: '#F9FAFB',
        borderRadius: '12px',
        padding: '14px',
        marginBottom: '14px',
        border: '1px solid #F3F4F6'
    },
    infoItem: {
        flex: 1,
        textAlign: 'center'
    },
    infoLabel: {
        fontSize: '10px',
        fontWeight: '700',
        color: '#9CA3AF',
        letterSpacing: '1px',
        marginBottom: '4px'
    },
    infoValue: {
        fontSize: '14px',
        fontWeight: '800',
        color: '#111827'
    },
    infoDivider: {
        width: '1px',
        height: '30px',
        background: '#E5E7EB'
    },

    benefitBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 14px',
        background: '#F0FDF4',
        border: '1px solid #BBF7D0',
        borderRadius: '10px',
        marginBottom: '16px'
    },
    benefitIcon: {
        fontSize: '14px'
    },
    benefitText: {
        fontSize: '12px',
        color: '#166534',
        fontWeight: '600',
        lineHeight: '1.5'
    },

    cardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '14px',
        borderTop: '1px dashed #E5E7EB',
        marginTop: 'auto'
    },
    viewLink: {
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: '13px',
        fontWeight: '700'
    },
    locationChip: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 10px',
        background: '#EEF2FF',
        color: '#4338CA',
        borderRadius: '100px',
        fontSize: '11px',
        fontWeight: '700'
    },

    /* ═══ PAGINATION ═══ */
    paginationWrap: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px',
        marginTop: '48px',
        flexWrap: 'wrap'
    },
    pageNumbers: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    },
    pageBtn: {
        minWidth: '42px',
        height: '42px',
        padding: '0 14px',
        background: '#ffffff',
        border: '1.5px solid #E5E7EB',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '700',
        color: '#4B5563',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontFamily: 'inherit',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    pageBtnActive: {
        background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
        color: '#ffffff',
        border: '1.5px solid #4F46E5',
        boxShadow: '0 6px 16px rgba(79,70,229,0.35)'
    },
    pageArrow: {
        fontWeight: '600',
        color: '#111827'
    },
    pageDots: {
        color: '#9CA3AF',
        fontWeight: '700',
        padding: '0 4px'
    },
    pageInfo: {
        textAlign: 'center',
        marginTop: '16px',
        fontSize: '13px',
        color: '#6B7280',
        fontWeight: '500'
    },

    /* ═══ CTA BOX ═══ */
    ctaBox: {
        marginTop: '60px',
        background: 'linear-gradient(135deg, #1E1B4B 0%, #4F46E5 100%)',
        borderRadius: '24px',
        padding: '48px 44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '32px',
        flexWrap: 'wrap',
        position: 'relative',
        overflow: 'hidden'
    },
    ctaLeft: {
        flex: 1,
        minWidth: '280px'
    },
    ctaBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.15)',
        color: '#ffffff',
        padding: '6px 14px',
        borderRadius: '100px',
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing: '1.5px',
        marginBottom: '14px'
    },
    ctaTitle: {
        fontSize: '26px',
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: '10px',
        letterSpacing: '-0.5px'
    },
    ctaDesc: {
        fontSize: '14.5px',
        color: 'rgba(255,255,255,0.8)',
        lineHeight: '1.7',
        margin: 0
    },
    ctaBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '16px 32px',
        background: 'linear-gradient(135deg, #FF9933 0%, #F97316 100%)',
        color: '#ffffff',
        border: 'none',
        borderRadius: '12px',
        fontSize: '14.5px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 10px 30px rgba(249,115,22,0.4)',
        fontFamily: 'inherit',
        letterSpacing: '0.3px',
        flexShrink: 0
    }
};

export default Schemes;