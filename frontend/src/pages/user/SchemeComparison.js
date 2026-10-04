import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { schemeAPI } from '../../services/api';
import {
    FiPlus, FiX, FiSearch, FiCheckCircle, FiXCircle,
    FiArrowRight, FiExternalLink, FiAward
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';

const SchemeComparison = () => {
    const [allSchemes, setAllSchemes] = useState([]);
    const [selectedSchemes, setSelectedSchemes] = useState([null, null, null]);
    const [showPicker, setShowPicker] = useState(null); // slot index
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSchemes();
    }, []);

    const fetchSchemes = async () => {
        try {
            const res = await schemeAPI.getAll();
            const data = res.data?.data || res.data || [];
            setAllSchemes(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const selectScheme = (scheme) => {
        const newSelected = [...selectedSchemes];
        newSelected[showPicker] = scheme;
        setSelectedSchemes(newSelected);
        setShowPicker(null);
        setSearchQuery('');
    };

    const removeScheme = (idx) => {
        const newSelected = [...selectedSchemes];
        newSelected[idx] = null;
        setSelectedSchemes(newSelected);
    };

    const filteredSchemes = allSchemes.filter(s =>
        !searchQuery || s.schemeName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const validSchemes = selectedSchemes.filter(s => s !== null);
    const showComparison = validSchemes.length >= 2;

    if (loading) {
        return (
            <div style={styles.loadingWrap}>
                <div style={styles.spinner}></div>
                <p>Loading schemes...</p>
            </div>
        );
    }

    return (
        <div style={styles.wrapper}>
            {/* HEADER */}
            <section style={styles.header}>
                <div style={styles.headerDecor}></div>
                <div style={styles.headerContent}>
                    <div style={styles.headerBadge}>
                        <FiAward style={{ marginRight: 6, color: '#4F46E5' }} />
                        SIDE-BY-SIDE COMPARISON
                    </div>
                    <h1 style={styles.headerTitle}>
                        Scheme <span style={styles.headerAccent}>Comparison</span>
                    </h1>
                    <p style={styles.headerDesc}>
                        Compare up to 3 government schemes side-by-side to find the best fit for you
                    </p>
                </div>
            </section>

            {/* SELECTION SLOTS */}
            <div style={styles.slotsCard}>
                <div style={styles.slotsHeader}>
                    <h3 style={styles.slotsTitle}>📋 Select Schemes to Compare</h3>
                    <span style={styles.slotsCount}>{validSchemes.length} of 3 selected</span>
                </div>
                <div style={styles.slotsGrid}>
                    {selectedSchemes.map((scheme, i) => (
                        <div key={i} style={{
                            ...styles.slot,
                            ...(scheme ? styles.slotFilled : {})
                        }}>
                            {scheme ? (
                                <>
                                    <button onClick={() => removeScheme(i)} style={styles.removeSlotBtn}>
                                        <FiX />
                                    </button>
                                    <div style={styles.slotIcon}>🎯</div>
                                    <h4 style={styles.slotSchemeName}>{scheme.schemeName}</h4>
                                    <span style={styles.slotCategory}>{scheme.category}</span>
                                </>
                            ) : (
                                <button onClick={() => setShowPicker(i)} style={styles.emptySlot}>
                                    <FiPlus style={{ fontSize: 32 }} />
                                    <div style={styles.slotLabel}>Add Scheme #{i + 1}</div>
                                    <div style={styles.slotHint}>Click to select</div>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* SCHEME PICKER MODAL */}
            {showPicker !== null && (
                <div style={styles.modal} onClick={() => setShowPicker(null)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Select a Scheme</h3>
                            <button onClick={() => setShowPicker(null)} style={styles.modalClose}>
                                <FiX />
                            </button>
                        </div>
                        <div style={styles.modalSearch}>
                            <FiSearch style={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search schemes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={styles.searchInput}
                                autoFocus
                            />
                        </div>
                        <div style={styles.schemesList}>
                            {filteredSchemes.map((s, i) => (
                                <button key={i} onClick={() => selectScheme(s)} style={styles.schemeOption}>
                                    <div>
                                        <div style={styles.schemeOptName}>{s.schemeName}</div>
                                        <div style={styles.schemeOptCat}>{s.category}</div>
                                    </div>
                                    <FiArrowRight />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* COMPARISON TABLE */}
            {showComparison ? (
                <div style={styles.comparisonCard}>
                    <h3 style={styles.comparisonTitle}>📊 Detailed Comparison</h3>
                    <div style={styles.tableWrap}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.thFirst}>Criteria</th>
                                    {validSchemes.map((s, i) => (
                                        <th key={i} style={styles.th}>
                                            <div style={styles.thName}>{s.schemeName}</div>
                                            <div style={styles.thCat}>{s.category}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <ComparisonRow label="Age Range" values={validSchemes.map(s => `${s.ageMin || 0} - ${s.ageMax || 100} years`)} />
                                <ComparisonRow label="Income Limit" values={validSchemes.map(s => `₹${s.incomeLimit ? Number(s.incomeLimit).toLocaleString('en-IN') : 'No limit'}`)} />
                                <ComparisonRow label="Gender" values={validSchemes.map(s => s.genderRequired || 'All')} />
                                <ComparisonRow label="Category" values={validSchemes.map(s => s.categoryRequired || 'All')} />
                                <ComparisonRow label="Occupation" values={validSchemes.map(s => s.occupationRequired || 'Any')} />
                                <ComparisonRow label="Education" values={validSchemes.map(s => s.educationRequired || 'Any')} />
                                <ComparisonRow label="Area" values={validSchemes.map(s => s.ruralUrbanRequired || 'Rural & Urban')} />
                                <ComparisonRow label="BPL Required" values={validSchemes.map(s => s.bplRequired || 'Any')} />
                                <ComparisonRow label="State" values={validSchemes.map(s => s.state || 'Maharashtra')} />
                                <ComparisonRow label="Status" values={validSchemes.map(s => s.status || 'Active')} isStatus />
                                <tr>
                                    <td style={styles.tdFirst}>Benefits</td>
                                    {validSchemes.map((s, i) => (
                                        <td key={i} style={styles.tdBenefits}>
                                            {s.benefits ? (s.benefits.length > 100 ? s.benefits.substring(0, 100) + '...' : s.benefits) : 'N/A'}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td style={styles.tdFirst}>Description</td>
                                    {validSchemes.map((s, i) => (
                                        <td key={i} style={styles.tdBenefits}>
                                            {s.description ? (s.description.length > 100 ? s.description.substring(0, 100) + '...' : s.description) : 'N/A'}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td style={styles.tdFirst}>Actions</td>
                                    {validSchemes.map((s, i) => (
                                        <td key={i} style={styles.tdActions}>
                                            <Link to={`/user/schemes/${s.id}`} style={styles.viewBtn}>
                                                View Details
                                            </Link>
                                            {s.officialLink && (
                                                <a href={s.officialLink} target="_blank" rel="noreferrer" style={styles.applyBtn}>
                                                    Apply <FiExternalLink style={{ marginLeft: 4 }} />
                                                </a>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* AI Recommendation */}
                    <div style={styles.aiBox}>
                        <HiSparkles style={{ fontSize: 32, color: '#F97316' }} />
                        <div style={{ flex: 1 }}>
                            <h4 style={styles.aiTitle}>💡 Best Match Recommendation</h4>
                            <p style={styles.aiDesc}>
                                Based on the comparison, <strong>{validSchemes[0].schemeName}</strong> appears to have the widest eligibility criteria. Check the details to see which one best suits your profile.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>⚖️</div>
                    <h3 style={styles.emptyTitle}>Select 2-3 Schemes</h3>
                    <p style={styles.emptyDesc}>
                        Click on the empty slots above to select schemes and compare them side-by-side
                    </p>
                </div>
            )}
        </div>
    );
};

const ComparisonRow = ({ label, values, isStatus }) => (
    <tr>
        <td style={styles.tdFirst}>{label}</td>
        {values.map((v, i) => (
            <td key={i} style={styles.td}>
                {isStatus ? (
                    <span style={{ ...styles.statusBadge, background: '#F0FDF4', color: '#10B981' }}>
                        ● {v}
                    </span>
                ) : v}
            </td>
        ))}
    </tr>
);

const styles = {
    wrapper: { padding: '20px 0', maxWidth: 1400, margin: '0 auto' },
    loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 80, gap: 16 },
    spinner: { width: 48, height: 48, border: '4px solid #E5E7EB', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },

    header: { textAlign: 'center', padding: 40, background: 'linear-gradient(135deg, #EEF2FF 0%, #ffffff 50%, #FFF7ED 100%)', borderRadius: 20, marginBottom: 24, position: 'relative', overflow: 'hidden' },
    headerDecor: { position: 'absolute', top: -100, right: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)', borderRadius: '50%' },
    headerContent: { position: 'relative', zIndex: 2 },
    headerBadge: { display: 'inline-flex', alignItems: 'center', background: 'rgba(79,70,229,0.15)', color: '#4338CA', padding: '6px 14px', borderRadius: 100, fontSize: 11, fontWeight: 800, marginBottom: 14 },
    headerTitle: { fontSize: 36, fontWeight: 800, color: '#111827', marginBottom: 12 },
    headerAccent: { background: 'linear-gradient(135deg, #4F46E5 0%, #F97316 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    headerDesc: { fontSize: 15, color: '#4B5563' },

    slotsCard: { background: '#ffffff', padding: 24, borderRadius: 16, border: '1px solid #E5E7EB', marginBottom: 24 },
    slotsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    slotsTitle: { fontSize: 18, fontWeight: 800, color: '#111827' },
    slotsCount: { fontSize: 13, color: '#6B7280', fontWeight: 700 },
    slotsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
    slot: { position: 'relative', minHeight: 180, padding: 20, background: '#F9FAFB', borderRadius: 12, border: '2px dashed #D1D5DB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' },
    slotFilled: { background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)', borderStyle: 'solid', borderColor: '#4F46E5' },
    removeSlotBtn: { position: 'absolute', top: 12, right: 12, width: 28, height: 28, background: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14, color: '#EF4444' },
    slotIcon: { fontSize: 40, marginBottom: 10 },
    slotSchemeName: { fontSize: 14, fontWeight: 800, color: '#111827', marginBottom: 6 },
    slotCategory: { fontSize: 11, color: '#4F46E5', fontWeight: 700, textTransform: 'uppercase' },
    emptySlot: { width: '100%', height: '100%', background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', color: '#6B7280' },
    slotLabel: { fontSize: 14, fontWeight: 700 },
    slotHint: { fontSize: 12, color: '#9CA3AF' },

    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 },
    modalContent: { background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 600, maxHeight: '80vh', display: 'flex', flexDirection: 'column' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottom: '1px solid #E5E7EB' },
    modalTitle: { fontSize: 18, fontWeight: 800, color: '#111827' },
    modalClose: { width: 32, height: 32, background: '#F3F4F6', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16 },
    modalSearch: { display: 'flex', alignItems: 'center', gap: 10, padding: 16, borderBottom: '1px solid #E5E7EB' },
    searchIcon: { color: '#6B7280', fontSize: 16 },
    searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: 14 },
    schemesList: { flex: 1, overflow: 'auto', padding: 8 },
    schemeOption: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', textAlign: 'left' },
    schemeOptName: { fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 4 },
    schemeOptCat: { fontSize: 11, color: '#6B7280' },

    comparisonCard: { background: '#ffffff', padding: 24, borderRadius: 16, border: '1px solid #E5E7EB', marginBottom: 24 },
    comparisonTitle: { fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 16 },
    tableWrap: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thFirst: { padding: 14, background: '#F9FAFB', textAlign: 'left', fontSize: 12, fontWeight: 800, color: '#374151', borderBottom: '2px solid #E5E7EB', textTransform: 'uppercase', letterSpacing: 0.5, width: 150 },
    th: { padding: 14, background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)', textAlign: 'left', borderBottom: '2px solid #4F46E5' },
    thName: { fontSize: 13, fontWeight: 800, color: '#111827', marginBottom: 4 },
    thCat: { fontSize: 10, color: '#4F46E5', fontWeight: 700, textTransform: 'uppercase' },
    tdFirst: { padding: 14, background: '#F9FAFB', fontSize: 12, fontWeight: 700, color: '#374151', borderBottom: '1px solid #F3F4F6' },
    td: { padding: 14, fontSize: 13, color: '#111827', borderBottom: '1px solid #F3F4F6' },
    tdBenefits: { padding: 14, fontSize: 12, color: '#6B7280', borderBottom: '1px solid #F3F4F6', lineHeight: 1.5 },
    tdActions: { padding: 14, borderBottom: '1px solid #F3F4F6' },
    statusBadge: { display: 'inline-block', padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700 },
    viewBtn: { display: 'inline-block', background: '#4F46E5', color: '#ffffff', padding: '8px 14px', borderRadius: 8, textDecoration: 'none', fontSize: 12, fontWeight: 700, marginBottom: 6, marginRight: 6 },
    applyBtn: { display: 'inline-flex', alignItems: 'center', background: '#10B981', color: '#ffffff', padding: '8px 14px', borderRadius: 8, textDecoration: 'none', fontSize: 12, fontWeight: 700 },

    aiBox: { display: 'flex', gap: 16, padding: 20, background: 'linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)', borderRadius: 12, marginTop: 20, border: '1px solid #FDBA74' },
    aiTitle: { fontSize: 15, fontWeight: 800, color: '#9A3412', marginBottom: 6 },
    aiDesc: { fontSize: 13, color: '#7C2D12', lineHeight: 1.6 },

    emptyState: { textAlign: 'center', padding: 80, background: '#ffffff', borderRadius: 20, border: '1px solid #E5E7EB' },
    emptyIcon: { fontSize: 80, marginBottom: 20 },
    emptyTitle: { fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 10 },
    emptyDesc: { fontSize: 14, color: '#6B7280', maxWidth: 450, margin: '0 auto' }
};

export default SchemeComparison;