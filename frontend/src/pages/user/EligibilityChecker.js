import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { recommendationAPI, userAPI, schemeAPI, mlAPI } from '../../services/api';
import {
    FiCheckCircle, FiXCircle, FiAlertCircle, FiArrowRight,
    FiRefreshCw, FiInfo, FiTarget, FiTrendingUp, FiUser,
    FiDollarSign, FiMapPin, FiBriefcase, FiHeart, FiEdit3,
    FiChevronDown, FiChevronUp, FiSearch
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { FaGraduationCap, FaIdCard, FaHome, FaFemale } from 'react-icons/fa';

const EligibilityChecker = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('current');
    const [profileData, setProfileData] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [allSchemes, setAllSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedScheme, setExpandedScheme] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // What-If Simulator state
    const [simProfile, setSimProfile] = useState({
        age: '', gender: '', category: '', occupation: '',
        annualIncome: '', is_bpl: 0, is_disabled: 0
    });
    const [simResults, setSimResults] = useState(null);
    const [simulating, setSimulating] = useState(false);

    useEffect(() => {
        if (user?.userId) fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pRes, rRes, sRes] = await Promise.allSettled([
                userAPI.getProfile(),
                recommendationAPI.getRecommendations(user.userId),
                schemeAPI.getAll()
            ]);
            if (pRes.status === 'fulfilled') {
                const p = pRes.value.data?.data || pRes.value.data;
                setProfileData(p);
                setSimProfile({
                    age: p?.age || '',
                    gender: p?.gender || 'Male',
                    category: p?.category || 'General',
                    occupation: p?.occupation || 'Student',
                    annualIncome: p?.annualIncome || '',
                    is_bpl: p?.bplCard === 'Yes' ? 1 : 0,
                    is_disabled: p?.disability === 'Yes' ? 1 : 0
                });
            }
            if (rRes.status === 'fulfilled') {
                setRecommendations(rRes.value.data?.data || rRes.value.data || []);
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

    // ─── What-If Simulator (ab api.js ke mlAPI se — localhost hardcode nahi) ───
    const runSimulation = async () => {
        setSimulating(true);
        try {
            const res = await mlAPI.recommend({
                age: parseInt(simProfile.age) || 25,
                gender: simProfile.gender,
                category: simProfile.category,
                occupation: simProfile.occupation,
                annual_income: parseInt(simProfile.annualIncome) || 100000,
                state: 'Maharashtra',
                is_bpl: parseInt(simProfile.is_bpl) || 0,
                is_disabled: parseInt(simProfile.is_disabled) || 0
            });
            setSimResults(res.data);
        } catch (err) {
            console.error(err);
            alert('Simulation failed. Make sure ML API is running.');
        } finally {
            setSimulating(false);
        }
    };

    // ─── Calculate Stats ───
    const totalSchemes = allSchemes.length;
    const eligibleCount = recommendations.length;
    const notEligibleCount = Math.max(0, totalSchemes - eligibleCount);
    const almostEligible = recommendations.filter(r => (r.matchScore || 0) >= 70 && (r.matchScore || 0) < 90).length;
    const highMatch = recommendations.filter(r => (r.matchScore || 0) >= 90).length;

    const totalScore = recommendations.reduce((sum, r) => sum + (r.matchScore || 90), 0);
    const avgMatchScore = recommendations.length > 0
        ? Math.round(totalScore / recommendations.length)
        : 0;

    const eligibilityPercent = avgMatchScore > 0 ? avgMatchScore : 90;
    const filteredRecs = recommendations.filter(r =>
        !searchQuery || r.schemeName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const eligibleIds = new Set(recommendations.map(r => r.schemeId || r.id));
    const notEligibleSchemes = allSchemes.filter(s => !eligibleIds.has(s.id)).slice(0, 10);

    const getReason = (scheme) => {
        const reasons = [];
        if (profileData?.age) {
            if (scheme.ageMin && profileData.age < scheme.ageMin)
                reasons.push(`Minimum age required: ${scheme.ageMin} years (You: ${profileData.age})`);
            if (scheme.ageMax && profileData.age > scheme.ageMax)
                reasons.push(`Maximum age: ${scheme.ageMax} years (You: ${profileData.age})`);
        }
        if (profileData?.annualIncome && scheme.incomeLimit &&
            parseFloat(profileData.annualIncome) > parseFloat(scheme.incomeLimit)) {
            reasons.push(`Income limit: ₹${Number(scheme.incomeLimit).toLocaleString('en-IN')} (You: ₹${Number(profileData.annualIncome).toLocaleString('en-IN')})`);
        }
        if (scheme.genderRequired && scheme.genderRequired !== 'All' &&
            profileData?.gender !== scheme.genderRequired) {
            reasons.push(`Only for ${scheme.genderRequired}`);
        }
        if (scheme.categoryRequired && scheme.categoryRequired !== 'All' &&
            !scheme.categoryRequired.includes(profileData?.category)) {
            reasons.push(`Only for category: ${scheme.categoryRequired}`);
        }
        if (scheme.occupationRequired && scheme.occupationRequired !== 'Any' &&
            profileData?.occupation !== scheme.occupationRequired) {
            reasons.push(`Only for ${scheme.occupationRequired}s`);
        }
        return reasons.length > 0 ? reasons : ['Profile requirements not fully met'];
    };

    if (loading) {
        return (
            <div style={styles.loadingWrap}>
                <div style={styles.spinner}></div>
                <p>Analyzing eligibility...</p>
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
                        <FiCheckCircle style={{ marginRight: 6, color: '#10B981' }} />
                        ELIGIBILITY CHECKER
                    </div>
                    <h1 style={styles.headerTitle}>
                        Check Your <span style={styles.headerAccent}>Scheme Eligibility</span>
                    </h1>
                    <p style={styles.headerDesc}>
                        Real-time eligibility analysis based on your profile and government scheme criteria
                    </p>
                </div>
            </section>

            {/* MAIN STATS CARD */}
            <section style={styles.statsCard}>
                <div style={styles.mainCircle}>
                    <svg width="140" height="140" viewBox="0 0 140 140">
                        <circle cx="70" cy="70" r="60" stroke="#F3F4F6" strokeWidth="12" fill="none" />
                        <circle cx="70" cy="70" r="60" stroke="#10B981" strokeWidth="12" fill="none"
                            strokeDasharray={`${(eligibilityPercent / 100) * 377} 377`}
                            strokeLinecap="round" transform="rotate(-90 70 70)" />
                    </svg>
                    <div style={styles.circleText}>
                        <div style={styles.circlePercent}>{eligibilityPercent}%</div>
                        <div style={styles.circleLabel}>Match Score</div>
                    </div>
                </div>

                <div style={styles.statsInfo}>
                    <h2 style={styles.statsTitle}>Your Eligibility Overview</h2>
                    <p style={styles.statsDesc}>
                        {eligibilityPercent >= 30
                            ? `Great! You qualify for ${eligibleCount} out of ${totalSchemes} schemes.`
                            : eligibilityPercent >= 10
                            ? `You qualify for ${eligibleCount} schemes. Complete your profile for more matches.`
                            : 'Complete your profile to unlock more scheme matches.'}
                    </p>
                    <div style={styles.statsRow}>
                        <StatBox value={eligibleCount} label="Eligible" color="#10B981" />
                        <StatBox value={almostEligible} label="Almost Eligible" color="#F59E0B" />
                        <StatBox value={notEligibleCount} label="Not Eligible" color="#EF4444" />
                        <StatBox value={highMatch} label="Perfect Match" color="#4F46E5" />
                    </div>
                </div>
            </section>

            {/* TABS */}
            <div style={styles.tabsWrap}>
                <button onClick={() => setActiveTab('current')}
                    style={{ ...styles.tab, ...(activeTab === 'current' ? styles.tabActive : {}) }}>
                    <FiCheckCircle /> Current Eligibility
                </button>
                <button onClick={() => setActiveTab('simulator')}
                    style={{ ...styles.tab, ...(activeTab === 'simulator' ? styles.tabActive : {}) }}>
                    <FiRefreshCw /> What-If Simulator
                </button>
                <button onClick={() => setActiveTab('reasons')}
                    style={{ ...styles.tab, ...(activeTab === 'reasons' ? styles.tabActive : {}) }}>
                    <FiXCircle /> Why Not Eligible
                </button>
            </div>

            {/* CURRENT ELIGIBILITY TAB */}
            {activeTab === 'current' && (
                <>
                    <div style={styles.contentCard}>
                        <div style={styles.cardHeader}>
                            <h3 style={styles.cardTitle}>📋 Your Profile Summary</h3>
                            <Link to="/user/profile" style={styles.editLink}>
                                <FiEdit3 /> Edit Profile
                            </Link>
                        </div>
                        <div style={styles.summaryGrid}>
                            <SummaryItem icon={<FiUser />} label="Age" value={`${profileData?.age || '-'} years`} color="#4F46E5" />
                            <SummaryItem icon={<FiDollarSign />} label="Income" value={`₹${profileData?.annualIncome ? Number(profileData.annualIncome).toLocaleString('en-IN') : '-'}`} color="#10B981" />
                            <SummaryItem icon={<FaIdCard />} label="Category" value={profileData?.category || '-'} color="#F97316" />
                            <SummaryItem icon={<FiMapPin />} label="Location" value={profileData?.district || '-'} color="#3B82F6" />
                            <SummaryItem icon={<FiBriefcase />} label="Occupation" value={profileData?.occupation || '-'} color="#F59E0B" />
                            <SummaryItem icon={<FaGraduationCap />} label="Education" value={profileData?.education || '-'} color="#8B5CF6" />
                            <SummaryItem icon={<FaFemale />} label="Gender" value={profileData?.gender || '-'} color="#EC4899" />
                            <SummaryItem icon={<FaHome />} label="House" value={profileData?.houseOwnership || '-'} color="#EF4444" />
                        </div>
                    </div>

                    <div style={styles.searchWrap}>
                        <FiSearch style={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search eligible schemes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>

                    <div style={styles.contentCard}>
                        <h3 style={styles.cardTitle}>✅ Schemes You're Eligible For ({filteredRecs.length})</h3>
                        {filteredRecs.length === 0 ? (
                            <div style={styles.emptyBox}>
                                <FiAlertCircle style={{ fontSize: 48, color: '#F59E0B' }} />
                                <p>No eligible schemes found. Complete your profile for better matches.</p>
                                <Link to="/user/profile" style={styles.primaryBtn}>Complete Profile</Link>
                            </div>
                        ) : (
                            <div style={styles.schemesList}>
                                {filteredRecs.map((rec, i) => {
                                    const isExpanded = expandedScheme === (rec.schemeId || rec.id);
                                    const matchScore = Math.round(rec.matchScore || 85);
                                    return (
                                        <div key={i} style={styles.schemeItem}>
                                            <div style={styles.schemeMain}
                                                onClick={() => setExpandedScheme(isExpanded ? null : (rec.schemeId || rec.id))}>
                                                <div style={styles.schemeLeft}>
                                                    <div style={{
                                                        ...styles.matchCircle,
                                                        background: matchScore >= 90 ? '#F0FDF4' : matchScore >= 80 ? '#EEF2FF' : '#FFFBEB',
                                                        color: matchScore >= 90 ? '#10B981' : matchScore >= 80 ? '#4F46E5' : '#F59E0B'
                                                    }}>
                                                        {matchScore}%
                                                    </div>
                                                    <div>
                                                        <h4 style={styles.schemeName}>{rec.schemeName}</h4>
                                                        <p style={styles.schemeCategory}>{rec.category || rec.ministry}</p>
                                                    </div>
                                                </div>
                                                <div style={styles.schemeRight}>
                                                    <span style={styles.validBadge}>
                                                        <FiCheckCircle /> Eligible
                                                    </span>
                                                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                                </div>
                                            </div>
                                            {isExpanded && (
                                                <div style={styles.schemeExpand}>
                                                    <p style={styles.schemeDesc}>{rec.description || rec.benefits}</p>
                                                    {rec.matchedRules && rec.matchedRules.length > 0 && (
                                                        <div style={styles.rulesBox}>
                                                            <h5 style={styles.rulesTitle}>Why You Qualify:</h5>
                                                            <ul style={styles.rulesList}>
                                                                {rec.matchedRules.slice(0, 5).map((rule, j) => (
                                                                    <li key={j} style={styles.ruleItem}>
                                                                        <FiCheckCircle style={{ color: '#10B981', flexShrink: 0 }} />
                                                                        {rule.replace(/[✅❌]/g, '').trim()}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    <div style={styles.expandActions}>
                                                        <Link to={`/user/schemes/${rec.schemeId || rec.id}`} style={styles.viewBtn}>
                                                            View Details <FiArrowRight />
                                                        </Link>
                                                        {rec.officialLink && (
                                                            <a href={rec.officialLink} target="_blank" rel="noreferrer" style={styles.applyBtn}>
                                                                Apply Now
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* WHAT-IF SIMULATOR */}
            {activeTab === 'simulator' && (
                <div style={styles.contentCard}>
                    <div style={styles.simIntro}>
                        <HiSparkles style={{ fontSize: 32, color: '#4F46E5' }} />
                        <div>
                            <h3 style={styles.cardTitle}>What-If Simulator</h3>
                            <p style={styles.simDesc}>Change your profile details to see how it affects your scheme eligibility</p>
                        </div>
                    </div>

                    <div style={styles.simGrid}>
                        <SimInput label="Age" type="number" value={simProfile.age}
                            onChange={v => setSimProfile({ ...simProfile, age: v })} />
                        <SimSelect label="Gender" value={simProfile.gender}
                            onChange={v => setSimProfile({ ...simProfile, gender: v })}
                            options={['Male', 'Female', 'Other']} />
                        <SimSelect label="Category" value={simProfile.category}
                            onChange={v => setSimProfile({ ...simProfile, category: v })}
                            options={['General', 'OBC', 'SC', 'ST', 'NT', 'VJ', 'EWS']} />
                        <SimSelect label="Occupation" value={simProfile.occupation}
                            onChange={v => setSimProfile({ ...simProfile, occupation: v })}
                            options={['Farmer', 'Student', 'Unemployed', 'Small Business Owner', 'Daily Wage Worker', 'Street Vendor']} />
                        <SimInput label="Annual Income (₹)" type="number" value={simProfile.annualIncome}
                            onChange={v => setSimProfile({ ...simProfile, annualIncome: v })} />
                        <SimSelect label="BPL Card" value={simProfile.is_bpl}
                            onChange={v => setSimProfile({ ...simProfile, is_bpl: v })}
                            options={[{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }]} />
                    </div>

                    <button onClick={runSimulation} disabled={simulating} style={styles.simBtn}>
                        {simulating ? (
                            <><div style={styles.btnSpinner}></div>Simulating...</>
                        ) : (
                            <><FiRefreshCw /> Run Simulation</>
                        )}
                    </button>

                    {simResults && (
                        <div style={styles.simResults}>
                            <h4 style={styles.resultTitle}>
                                🎯 Simulation Result: {simResults.total_eligible || 0} eligible schemes
                            </h4>
                            <div style={styles.compareBox}>
                                <div style={styles.compareBefore}>
                                    <div style={styles.compareLabel}>Current Profile</div>
                                    <div style={styles.compareValue}>{eligibleCount} schemes</div>
                                </div>
                                <FiArrowRight style={{ fontSize: 32, color: '#6B7280' }} />
                                <div style={styles.compareAfter}>
                                    <div style={styles.compareLabel}>Simulated Profile</div>
                                    <div style={{ ...styles.compareValue, color: '#10B981' }}>
                                        {simResults.total_eligible || 0} schemes
                                    </div>
                                </div>
                            </div>
                            <div style={styles.simSchemesList}>
                                {(simResults.recommendations || []).slice(0, 5).map((s, i) => (
                                    <div key={i} style={styles.simSchemeItem}>
                                        <FiCheckCircle style={{ color: '#10B981' }} />
                                        <span>{s.scheme_name}</span>
                                        <span style={styles.miniScore}>{Math.round(s.match_percentage || 85)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* WHY NOT ELIGIBLE TAB */}
            {activeTab === 'reasons' && (
                <div style={styles.contentCard}>
                    <div style={styles.simIntro}>
                        <FiXCircle style={{ fontSize: 32, color: '#EF4444' }} />
                        <div>
                            <h3 style={styles.cardTitle}>Why You're Not Eligible</h3>
                            <p style={styles.simDesc}>Understand what's blocking you from these schemes and how to qualify</p>
                        </div>
                    </div>

                    {notEligibleSchemes.length === 0 ? (
                        <div style={styles.emptyBox}>
                            <FiCheckCircle style={{ fontSize: 48, color: '#10B981' }} />
                            <p>You're eligible for all available schemes! 🎉</p>
                        </div>
                    ) : (
                        <div style={styles.schemesList}>
                            {notEligibleSchemes.map((scheme, i) => {
                                const reasons = getReason(scheme);
                                return (
                                    <div key={i} style={styles.schemeItem}>
                                        <div style={styles.schemeMain}>
                                            <div style={styles.schemeLeft}>
                                                <div style={{ ...styles.matchCircle, background: '#FEE2E2', color: '#EF4444' }}>
                                                    <FiXCircle />
                                                </div>
                                                <div>
                                                    <h4 style={styles.schemeName}>{scheme.schemeName}</h4>
                                                    <p style={styles.schemeCategory}>{scheme.category}</p>
                                                </div>
                                            </div>
                                            <span style={styles.notEligibleBadge}>Not Eligible</span>
                                        </div>
                                        <div style={styles.reasonsBox}>
                                            <h5 style={styles.rulesTitle}>Reasons:</h5>
                                            <ul style={styles.rulesList}>
                                                {reasons.map((reason, j) => (
                                                    <li key={j} style={styles.ruleItem}>
                                                        <FiXCircle style={{ color: '#EF4444', flexShrink: 0 }} />
                                                        {reason}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Sub Components ───
const StatBox = ({ value, label, color }) => (
    <div style={styles.statBox}>
        <div style={{ ...styles.statValue, color }}>{value}</div>
        <div style={styles.statLabel}>{label}</div>
    </div>
);

const SummaryItem = ({ icon, label, value, color }) => (
    <div style={styles.summaryItem}>
        <div style={{ ...styles.summaryIcon, background: `${color}15`, color }}>{icon}</div>
        <div>
            <div style={styles.summaryLabel}>{label}</div>
            <div style={styles.summaryValue}>{value}</div>
        </div>
    </div>
);

const SimInput = ({ label, type = 'text', value, onChange }) => (
    <div style={styles.simInputGroup}>
        <label style={styles.simLabel}>{label}</label>
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
            style={styles.simInput} placeholder={`Enter ${label}`} />
    </div>
);

const SimSelect = ({ label, value, onChange, options }) => (
    <div style={styles.simInputGroup}>
        <label style={styles.simLabel}>{label}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)} style={styles.simInput}>
            {options.map(opt => {
                const val = typeof opt === 'object' ? opt.value : opt;
                const lbl = typeof opt === 'object' ? opt.label : opt;
                return <option key={val} value={val}>{lbl}</option>;
            })}
        </select>
    </div>
);

const styles = {
    wrapper: { padding: '20px 0', maxWidth: 1400, margin: '0 auto' },
    loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 80, gap: 16 },
    spinner: { width: 48, height: 48, border: '4px solid #E5E7EB', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    header: { textAlign: 'center', padding: '40px', background: 'linear-gradient(135deg, #F0FDF4 0%, #ffffff 50%, #EEF2FF 100%)', borderRadius: 20, marginBottom: 24, position: 'relative', overflow: 'hidden' },
    headerDecor: { position: 'absolute', top: -100, right: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', borderRadius: '50%' },
    headerContent: { position: 'relative', zIndex: 2 },
    headerBadge: { display: 'inline-flex', alignItems: 'center', background: 'rgba(16,185,129,0.15)', color: '#065F46', padding: '6px 14px', borderRadius: 100, fontSize: 11, fontWeight: 800, letterSpacing: 1, marginBottom: 14 },
    headerTitle: { fontSize: 36, fontWeight: 800, color: '#111827', marginBottom: 12, letterSpacing: -1 },
    headerAccent: { background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    headerDesc: { fontSize: 15, color: '#4B5563' },

    statsCard: { display: 'flex', gap: 32, alignItems: 'center', padding: 32, background: '#ffffff', borderRadius: 20, border: '1px solid #E5E7EB', marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' },
    mainCircle: { position: 'relative', flexShrink: 0 },
    circleText: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' },
    circlePercent: { fontSize: 32, fontWeight: 800, color: '#10B981', letterSpacing: -1 },
    circleLabel: { fontSize: 11, color: '#6B7280', fontWeight: 700, marginTop: 2 },
    statsInfo: { flex: 1 },
    statsTitle: { fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 8 },
    statsDesc: { fontSize: 14, color: '#6B7280', marginBottom: 20 },
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 },
    statBox: { textAlign: 'center', padding: 12, background: '#F9FAFB', borderRadius: 10 },
    statValue: { fontSize: 24, fontWeight: 800 },
    statLabel: { fontSize: 11, color: '#6B7280', fontWeight: 600, marginTop: 4 },

    tabsWrap: { display: 'flex', gap: 8, marginBottom: 20, background: '#ffffff', padding: 8, borderRadius: 12, border: '1px solid #E5E7EB' },
    tab: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', background: 'transparent', color: '#6B7280', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
    tabActive: { background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#ffffff' },

    contentCard: { background: '#ffffff', padding: 24, borderRadius: 16, border: '1px solid #E5E7EB', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    cardTitle: { fontSize: 18, fontWeight: 800, color: '#111827' },
    editLink: { display: 'inline-flex', alignItems: 'center', gap: 6, color: '#4F46E5', fontSize: 13, fontWeight: 700, textDecoration: 'none' },

    summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 },
    summaryItem: { display: 'flex', gap: 12, alignItems: 'center', padding: 14, background: '#F9FAFB', borderRadius: 10 },
    summaryIcon: { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 },
    summaryLabel: { fontSize: 11, color: '#6B7280', fontWeight: 700, marginBottom: 2 },
    summaryValue: { fontSize: 13, fontWeight: 800, color: '#111827' },

    searchWrap: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#ffffff', borderRadius: 10, border: '1px solid #E5E7EB', marginBottom: 20 },
    searchIcon: { color: '#6B7280', fontSize: 16 },
    searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: 14 },

    schemesList: { display: 'flex', flexDirection: 'column', gap: 12 },
    schemeItem: { background: '#F9FAFB', borderRadius: 12, border: '1px solid #F3F4F6', overflow: 'hidden' },
    schemeMain: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, cursor: 'pointer' },
    schemeLeft: { display: 'flex', gap: 14, alignItems: 'center', flex: 1 },
    matchCircle: { width: 52, height: 52, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, flexShrink: 0 },
    schemeName: { fontSize: 14, fontWeight: 800, color: '#111827', marginBottom: 4 },
    schemeCategory: { fontSize: 12, color: '#6B7280' },
    schemeRight: { display: 'flex', alignItems: 'center', gap: 12 },
    validBadge: { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F0FDF4', color: '#10B981', padding: '6px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700 },
    notEligibleBadge: { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FEE2E2', color: '#EF4444', padding: '6px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700 },
    schemeExpand: { padding: '0 16px 16px', borderTop: '1px solid #F3F4F6' },
    schemeDesc: { fontSize: 13, color: '#6B7280', lineHeight: 1.6, margin: '12px 0' },
    rulesBox: { background: '#ffffff', padding: 14, borderRadius: 8, marginTop: 12 },
    reasonsBox: { background: '#FEF2F2', padding: 14, margin: '0 16px 16px', borderRadius: 8, border: '1px solid #FECACA' },
    rulesTitle: { fontSize: 12, fontWeight: 800, color: '#374151', marginBottom: 8 },
    rulesList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 },
    ruleItem: { display: 'flex', gap: 8, fontSize: 12, color: '#4B5563', lineHeight: 1.5 },
    expandActions: { display: 'flex', gap: 8, marginTop: 12 },
    viewBtn: { flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#4F46E5', color: '#ffffff', padding: '10px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 12, fontWeight: 700 },
    applyBtn: { flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#10B981', color: '#ffffff', padding: '10px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 12, fontWeight: 700 },

    emptyBox: { textAlign: 'center', padding: 40 },
    primaryBtn: { display: 'inline-flex', alignItems: 'center', marginTop: 16, background: '#4F46E5', color: '#ffffff', padding: '12px 24px', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 700 },

    simIntro: { display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 24, padding: 16, background: '#EEF2FF', borderRadius: 12 },
    simDesc: { fontSize: 13, color: '#4B5563', marginTop: 4 },
    simGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 },
    simInputGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
    simLabel: { fontSize: 12, fontWeight: 700, color: '#374151' },
    simInput: { padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none' },
    simBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)', color: '#ffffff', padding: '14px 32px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 20px rgba(79,70,229,0.35)' },
    btnSpinner: { width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },

    simResults: { marginTop: 24, padding: 24, background: '#F0FDF4', borderRadius: 12, border: '1px solid #86EFAC' },
    resultTitle: { fontSize: 18, fontWeight: 800, color: '#065F46', marginBottom: 16 },
    compareBox: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 20, background: '#ffffff', borderRadius: 10, marginBottom: 16 },
    compareBefore: { textAlign: 'center' },
    compareAfter: { textAlign: 'center' },
    compareLabel: { fontSize: 12, color: '#6B7280', fontWeight: 700, marginBottom: 6 },
    compareValue: { fontSize: 28, fontWeight: 800, color: '#111827' },
    simSchemesList: { display: 'flex', flexDirection: 'column', gap: 8 },
    simSchemeItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#ffffff', borderRadius: 8, fontSize: 13, color: '#111827', fontWeight: 600 },
    miniScore: { marginLeft: 'auto', background: '#F0FDF4', color: '#10B981', padding: '2px 10px', borderRadius: 100, fontSize: 11, fontWeight: 800 }
};

export default EligibilityChecker;