import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { schemeAPI, savedAPI } from '../services/api';
import {
    FiArrowLeft, FiHeart, FiExternalLink, FiCheckCircle,
    FiFileText, FiUsers, FiDollarSign, FiCalendar, FiMapPin,
    FiPhone, FiMail, FiBookOpen, FiClipboard, FiClock,
    FiAward, FiShield, FiTrendingUp, FiTarget, FiInfo,
    FiAlertCircle, FiChevronRight, FiShare2, FiPrinter,
    FiBriefcase
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import {
    FaGraduationCap, FaBriefcase, FaTractor, FaBalanceScale,
    FaHome, FaHeartbeat, FaFemale, FaTh, FaIdCard, FaCheckCircle
} from 'react-icons/fa';

const SchemeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [scheme, setScheme] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchSchemeDetails();
        if (user?.userId) checkIfSaved();
    }, [id, user]);

    const fetchSchemeDetails = async () => {
        try {
            setLoading(true);
            const res = await schemeAPI.getById(id);
            const data = res.data?.data || res.data;
            setScheme(data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const checkIfSaved = async () => {
        try {
            const res = await savedAPI.getSaved(user.userId);
            const saved = res.data?.data || res.data || [];
            const found = saved.some(s => (s.schemeId || s.scheme?.id) === parseInt(id));
            setIsSaved(found);
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleSave = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            setSaving(true);
            await savedAPI.toggleSave(user.userId, parseInt(id));
            setIsSaved(!isSaved);
            setMsg(isSaved ? '✓ Removed from saved' : '❤️ Saved successfully!');
            setTimeout(() => setMsg(''), 2500);
        } catch (err) {
            console.error(err);
            setMsg('❌ Failed to save');
            setTimeout(() => setMsg(''), 2500);
        } finally {
            setSaving(false);
        }
    };

    const handleApplyClick = (e) => {
    if (!user) {
        e.preventDefault();
        sessionStorage.setItem('redirectAfterLogin', `/user/schemes/${id}`);
        sessionStorage.setItem('pendingApplyLink', scheme.officialLink);
        navigate('/login', { 
            state: { 
                from: `/schemes/${id}`,
                message: 'Please login to apply for this scheme'
            }
        });
    }
   };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: scheme?.schemeName,
                text: scheme?.description,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            setMsg('✓ Link copied to clipboard');
            setTimeout(() => setMsg(''), 2500);
        }
    };

    const handlePrint = () => window.print();

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

    if (loading) {
        return (
            <div style={styles.loadingWrap}>
                <div style={styles.spinner}></div>
                <p style={{ color: '#6B7280', marginTop: 16 }}>Loading scheme details...</p>
            </div>
        );
    }

    if (!scheme) {
        return (
            <div style={styles.errorWrap}>
                <FiAlertCircle style={{ fontSize: 64, color: '#EF4444' }} />
                <h2>Scheme Not Found</h2>
                <p>The scheme you're looking for doesn't exist</p>
                <Link to="/user/schemes" style={styles.backBtn}>
                    <FiArrowLeft style={{ marginRight: 8 }} />
                    Back to Schemes
                </Link>
            </div>
        );
    }

    const catColor = getCategoryColor(scheme.category);

    // ─── Parse comma-separated fields into arrays ───
    const parseList = (text) => {
        if (!text) return [];
        return text.split(/[,;.\n]/).map(s => s.trim()).filter(s => s.length > 5);
    };

    const eligibilityList = parseList(scheme.eligibilityCriteria);
    const documentsList = parseList(scheme.requiredDocuments);
    const processList = parseList(scheme.applicationProcess);
    const benefitsList = parseList(scheme.benefits);

    // Default lists if empty
    const defaultDocs = [
        'Aadhaar Card',
        'PAN Card (if applicable)',
        'Income Certificate',
        'Domicile Certificate (Maharashtra)',
        'Bank Account Details',
        'Recent Passport Size Photograph',
        'Category Certificate (if applicable)',
        'Ration Card / BPL Card (if applicable)'
    ];

    const defaultProcess = [
        'Visit the official portal or nearest CSC (Common Service Center)',
        'Register/Login with your Aadhaar number',
        'Fill the application form with accurate details',
        'Upload all required documents (scanned copies)',
        'Submit the application and note down the reference number',
        'Track your application status online',
        'Receive approval notification via SMS/Email',
        'Benefits will be credited directly to your bank account (DBT)'
    ];

    return (
        <div style={styles.wrapper}>

            {/* Breadcrumb */}
            <div style={styles.breadcrumb}>
                <Link to="/user/dashboard" style={styles.breadcrumbLink}>Dashboard</Link>
                <FiChevronRight style={{ fontSize: 14, color: '#9CA3AF' }} />
                <Link to="/user/schemes" style={styles.breadcrumbLink}>Schemes</Link>
                <FiChevronRight style={{ fontSize: 14, color: '#9CA3AF' }} />
                <span style={styles.breadcrumbCurrent}>{scheme.schemeName}</span>
            </div>

            {msg && (
                <div style={styles.msgBar}>
                    <span>{msg}</span>
                </div>
            )}

            {/* HERO HEADER */}
            <section style={{
                ...styles.hero,
                background: `linear-gradient(135deg, ${catColor}15 0%, ${catColor}05 100%)`,
                borderColor: `${catColor}30`
            }}>
                <div style={styles.heroDecor}></div>
                <div style={styles.heroContainer}>
                    <div style={styles.heroLeft}>
                        <div style={{
                            ...styles.categoryBadge,
                            background: `${catColor}20`,
                            color: catColor
                        }}>
                            {getCategoryIcon(scheme.category)}
                            <span>{scheme.category?.toUpperCase() || 'GENERAL'}</span>
                        </div>

                        <h1 style={styles.heroTitle}>{scheme.schemeName}</h1>

                        <p style={styles.heroDesc}>
                            {scheme.description || 'A government scheme aimed at providing benefits to eligible citizens of Maharashtra.'}
                        </p>

                        <div style={styles.heroMeta}>
                            <div style={styles.metaItem}>
                                <FiMapPin style={{ color: catColor }} />
                                <span>Maharashtra</span>
                            </div>
                            <div style={styles.metaItem}>
                                <FiAward style={{ color: catColor }} />
                                <span>Government Scheme</span>
                            </div>
                            <div style={styles.metaItem}>
                                <FiShield style={{ color: catColor }} />
                                <span>{scheme.status || 'Active'}</span>
                            </div>
                        </div>

                        <div style={styles.heroActions}>
                            {scheme.officialLink && (
                                <a 
                                    href={user ? scheme.officialLink : '#'} 
                                    onClick={handleApplyClick}
                                    target={user ? "_blank" : "_self"} 
                                    rel="noreferrer" 
                                    style={{
                                        ...styles.applyBtn,
                                        background: `linear-gradient(135deg, ${catColor} 0%, ${catColor}CC 100%)`
                                    }}>
                                    <FiExternalLink style={{ marginRight: 8 }} />
                                    {user ? 'Apply on Official Portal' : 'Login to Apply'}
                                </a>
                            )}
                            <button onClick={handleToggleSave} disabled={saving} style={{
                                ...styles.saveBtn,
                                background: isSaved ? '#FDF2F8' : '#ffffff',
                                color: isSaved ? '#EC4899' : '#374151',
                                borderColor: isSaved ? '#F9A8D4' : '#E5E7EB'
                            }}>
                                <FiHeart style={{
                                    marginRight: 8,
                                    fill: isSaved ? '#EC4899' : 'none'
                                }} />
                                {isSaved ? 'Saved' : 'Save for Later'}
                            </button>
                            <button onClick={handleShare} style={styles.iconBtn} title="Share">
                                <FiShare2 />
                            </button>
                            <button onClick={handlePrint} style={styles.iconBtn} title="Print">
                                <FiPrinter />
                            </button>
                        </div>
                    </div>

                    <div style={styles.heroRight}>
                        <div style={{
                            ...styles.heroIcon,
                            background: `linear-gradient(135deg, ${catColor}30 0%, ${catColor}10 100%)`,
                            color: catColor
                        }}>
                            {getCategoryIcon(scheme.category)}
                        </div>
                    </div>
                </div>
            </section>

            {/* QUICK STATS */}
            <section style={styles.statsSection}>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, background: '#EEF2FF', color: '#4F46E5' }}>
                        <FiUsers />
                    </div>
                    <div>
                        <div style={styles.statLabel}>Age Range</div>
                        <div style={styles.statValue}>
                            {scheme.ageMin || 0} - {scheme.ageMax || 100} years
                        </div>
                    </div>
                </div>

                <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, background: '#F0FDF4', color: '#10B981' }}>
                        <FiDollarSign />
                    </div>
                    <div>
                        <div style={styles.statLabel}>Income Limit</div>
                        <div style={styles.statValue}>
                            ₹{scheme.incomeLimit ? Number(scheme.incomeLimit).toLocaleString('en-IN') : 'No limit'}
                        </div>
                    </div>
                </div>

                <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, background: '#FFF7ED', color: '#F97316' }}>
                        <FiUsers />
                    </div>
                    <div>
                        <div style={styles.statLabel}>Category</div>
                        <div style={styles.statValue}>
                            {scheme.categoryRequired || 'All'}
                        </div>
                    </div>
                </div>

                <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, background: '#FDF2F8', color: '#EC4899' }}>
                        <FiTarget />
                    </div>
                    <div>
                        <div style={styles.statLabel}>Gender</div>
                        <div style={styles.statValue}>
                            {scheme.genderRequired || 'All'}
                        </div>
                    </div>
                </div>
            </section>

            {/* TABS */}
            <section style={styles.tabsSection}>
                <div style={styles.tabs}>
                    {[
                        { id: 'overview', label: 'Overview', icon: <FiInfo /> },
                        { id: 'eligibility', label: 'Eligibility', icon: <FiCheckCircle /> },
                        { id: 'benefits', label: 'Benefits', icon: <FiAward /> },
                        { id: 'documents', label: 'Documents', icon: <FaIdCard /> },
                        { id: 'process', label: 'How to Apply', icon: <FiClipboard /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                ...styles.tab,
                                ...(activeTab === tab.id ? {
                                    ...styles.tabActive,
                                    borderBottomColor: catColor,
                                    color: catColor
                                } : {})
                            }}>
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* CONTENT AREA */}
            <section style={styles.contentSection}>
                <div style={styles.contentMain}>

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <>
                            <ContentCard title="About This Scheme" icon={<FiInfo />} color={catColor}>
                                <p style={styles.paragraph}>
                                    {scheme.description || `${scheme.schemeName} is a government-backed scheme launched by the Government of Maharashtra to provide financial and social support to eligible citizens. This scheme aims to improve the quality of life and provide essential benefits to those who qualify.`}
                                </p>
                                {scheme.specialConditions && (
                                    <div style={styles.noteBox}>
                                        <FiAlertCircle style={{ color: '#F59E0B', flexShrink: 0 }} />
                                        <div>
                                            <strong>Special Conditions:</strong>
                                            <p style={{ margin: '4px 0 0' }}>{scheme.specialConditions}</p>
                                        </div>
                                    </div>
                                )}
                            </ContentCard>

                            <ContentCard title="Key Highlights" icon={<HiSparkles />} color={catColor}>
                                <div style={styles.highlightsGrid}>
                                    <HighlightItem icon="💰" title="Financial Benefit" desc={scheme.benefits?.substring(0, 60) || 'Direct benefit transfer'} />
                                    <HighlightItem icon="🎯" title="Target Group" desc={scheme.categoryRequired || 'All eligible citizens'} />
                                    <HighlightItem icon="📍" title="Coverage Area" desc="Maharashtra State" />
                                    <HighlightItem icon="⚡" title="Application Mode" desc="Online / Offline" />
                                    <HighlightItem icon="🏛️" title="Implementing Body" desc="Government of Maharashtra" />
                                    <HighlightItem icon="✅" title="Status" desc={scheme.status || 'Active'} />
                                </div>
                            </ContentCard>
                        </>
                    )}

                    {/* ELIGIBILITY TAB */}
                    {activeTab === 'eligibility' && (
                        <>
                            <ContentCard title="Eligibility Criteria" icon={<FiCheckCircle />} color={catColor}>
                                <div style={styles.criteriaGrid}>
                                    <CriteriaCard icon={<FiUsers />} title="Age Requirement"
                                        value={`${scheme.ageMin || 0} - ${scheme.ageMax || 100} years`} color="#4F46E5" />
                                    <CriteriaCard icon={<FiDollarSign />} title="Annual Income Limit"
                                        value={`Up to ₹${scheme.incomeLimit ? Number(scheme.incomeLimit).toLocaleString('en-IN') : 'No limit'}`} color="#10B981" />
                                    <CriteriaCard icon={<FiTarget />} title="Gender"
                                        value={scheme.genderRequired || 'All Genders'} color="#EC4899" />
                                    <CriteriaCard icon={<FaIdCard />} title="Category"
                                        value={scheme.categoryRequired || 'All Categories'} color="#F97316" />
                                    <CriteriaCard icon={<FiBriefcase />} title="Occupation"
                                        value={scheme.occupationRequired || 'Any'} color="#F59E0B" />
                                    <CriteriaCard icon={<FaGraduationCap />} title="Education"
                                        value={scheme.educationRequired || 'Any'} color="#8B5CF6" />
                                    <CriteriaCard icon={<FiMapPin />} title="Residence"
                                        value="Maharashtra State" color="#3B82F6" />
                                    <CriteriaCard icon={<FaHome />} title="Area"
                                        value={scheme.ruralUrbanRequired || 'Rural & Urban'} color="#EF4444" />
                                </div>

                                {eligibilityList.length > 0 && (
                                    <div style={styles.listSection}>
                                        <h4 style={styles.listTitle}>Detailed Eligibility Rules:</h4>
                                        <ul style={styles.list}>
                                            {eligibilityList.map((item, i) => (
                                                <li key={i} style={styles.listItem}>
                                                    <FiCheckCircle style={{ color: '#10B981', flexShrink: 0, marginTop: 2 }} />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div style={styles.checkBox}>
                                    <FiTarget style={{ fontSize: 24, color: catColor }} />
                                    <div>
                                        <strong>Am I Eligible?</strong>
                                        <p>Check your eligibility instantly using our AI-powered eligibility checker</p>
                                    </div>
                                    <Link to="/user/eligibility" style={{ ...styles.checkBtn, background: catColor }}>
                                        Check Now
                                    </Link>
                                </div>
                            </ContentCard>
                        </>
                    )}

                    {/* BENEFITS TAB */}
                    {activeTab === 'benefits' && (
                        <>
                            <ContentCard title="Scheme Benefits" icon={<FiAward />} color={catColor}>
                                <div style={styles.benefitHighlight}>
                                    <div style={styles.benefitIcon}>💰</div>
                                    <div>
                                        <h3 style={styles.benefitMainTitle}>What You Get</h3>
                                        <p style={styles.benefitMainDesc}>
                                            {scheme.benefits || 'Financial assistance and support benefits as per government norms'}
                                        </p>
                                    </div>
                                </div>

                                {benefitsList.length > 0 && (
                                    <div style={styles.listSection}>
                                        <h4 style={styles.listTitle}>Detailed Benefits:</h4>
                                        <ul style={styles.list}>
                                            {benefitsList.map((item, i) => (
                                                <li key={i} style={styles.listItem}>
                                                    <FaCheckCircle style={{ color: '#10B981', flexShrink: 0, marginTop: 2 }} />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {scheme.healthCoverage && (
                                    <div style={styles.noteBox}>
                                        <FaHeartbeat style={{ color: '#EF4444', flexShrink: 0, fontSize: 20 }} />
                                        <div>
                                            <strong>Health Coverage:</strong>
                                            <p style={{ margin: '4px 0 0' }}>{scheme.healthCoverage}</p>
                                        </div>
                                    </div>
                                )}
                            </ContentCard>

                            <ContentCard title="Additional Perks" icon={<FiTrendingUp />} color={catColor}>
                                <div style={styles.perksGrid}>
                                    <PerkCard icon="💳" title="Direct Bank Transfer" desc="Benefits credited directly to your bank account" />
                                    <PerkCard icon="📱" title="Digital Application" desc="Apply online from anywhere" />
                                    <PerkCard icon="🔒" title="Secure Process" desc="Aadhaar-based verification" />
                                    <PerkCard icon="⚡" title="Fast Processing" desc="Quick approval and disbursement" />
                                    <PerkCard icon="🎯" title="No Hidden Charges" desc="100% free government scheme" />
                                    <PerkCard icon="📞" title="24/7 Support" desc="Helpline for assistance" />
                                </div>
                            </ContentCard>
                        </>
                    )}

                    {/* DOCUMENTS TAB */}
                    {activeTab === 'documents' && (
                        <>
                            <ContentCard title="Required Documents" icon={<FaIdCard />} color={catColor}>
                                <p style={styles.paragraph}>
                                    Please keep the following documents ready before applying for this scheme:
                                </p>

                                <div style={styles.docsGrid}>
                                    {(documentsList.length > 0 ? documentsList : defaultDocs).map((doc, i) => (
                                        <div key={i} style={styles.docCard}>
                                            <div style={{ ...styles.docIcon, background: `${catColor}15`, color: catColor }}>
                                                <FaIdCard />
                                            </div>
                                            <div>
                                                <div style={styles.docName}>{doc}</div>
                                                <div style={styles.docStatus}>
                                                    <FiCheckCircle style={{ color: '#10B981' }} />
                                                    Required
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={styles.noteBox}>
                                    <FiInfo style={{ color: '#3B82F6', flexShrink: 0, fontSize: 20 }} />
                                    <div>
                                        <strong>Document Guidelines:</strong>
                                        <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
                                            <li>All documents should be self-attested</li>
                                            <li>Scanned copies should be clear and readable</li>
                                            <li>File size limit: 2MB per document</li>
                                            <li>Accepted formats: PDF, JPG, PNG</li>
                                        </ul>
                                    </div>
                                </div>
                            </ContentCard>
                        </>
                    )}

                    {/* PROCESS TAB */}
                    {activeTab === 'process' && (
                        <>
                            <ContentCard title="Application Process" icon={<FiClipboard />} color={catColor}>
                                <div style={styles.stepsWrap}>
                                    {(processList.length > 0 ? processList : defaultProcess).map((step, i) => (
                                        <div key={i} style={styles.step}>
                                            <div style={{ ...styles.stepNumber, background: catColor }}>
                                                {i + 1}
                                            </div>
                                            <div style={styles.stepContent}>
                                                <div style={styles.stepText}>{step}</div>
                                            </div>
                                            {i < (processList.length > 0 ? processList : defaultProcess).length - 1 && (
                                                <div style={styles.stepConnector}></div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div style={styles.applyCTA}>
                                    <div>
                                        <h3 style={styles.ctaTitle}>Ready to Apply?</h3>
                                        <p style={styles.ctaDesc}>Start your application on the official government portal</p>
                                    </div>
                                    {scheme.officialLink && (
                                        <a 
                                            href={user ? scheme.officialLink : '#'}
                                            onClick={handleApplyClick}
                                            target={user ? "_blank" : "_self"} 
                                            rel="noreferrer" 
                                            style={{
                                                ...styles.ctaBtn,
                                                background: `linear-gradient(135deg, ${catColor} 0%, ${catColor}CC 100%)`
                                            }}>
                                            {user ? 'Apply Now' : 'Login to Apply'} <FiExternalLink style={{ marginLeft: 8 }} />
                                        </a>
                                    )}
                                </div>
                            </ContentCard>

                            <ContentCard title="Help & Support" icon={<FiPhone />} color={catColor}>
                                <div style={styles.supportGrid}>
                                    <div style={styles.supportCard}>
                                        <FiPhone style={{ fontSize: 24, color: catColor }} />
                                        <div>
                                            <div style={styles.supportLabel}>Helpline</div>
                                            <div style={styles.supportValue}>1800-XXX-XXXX</div>
                                        </div>
                                    </div>
                                    <div style={styles.supportCard}>
                                        <FiMail style={{ fontSize: 24, color: catColor }} />
                                        <div>
                                            <div style={styles.supportLabel}>Email</div>
                                            <div style={styles.supportValue}>support@maharashtra.gov.in</div>
                                        </div>
                                    </div>
                                    <div style={styles.supportCard}>
                                        <FiMapPin style={{ fontSize: 24, color: catColor }} />
                                        <div>
                                            <div style={styles.supportLabel}>Visit Office</div>
                                            <div style={styles.supportValue}>Nearest CSC Center</div>
                                        </div>
                                    </div>
                                </div>
                            </ContentCard>
                        </>
                    )}
                </div>

                {/* SIDEBAR */}
                <aside style={styles.sidebar}>
                    <div style={styles.sidebarCard}>
                        <h3 style={styles.sidebarTitle}>Quick Actions</h3>
                        <div style={styles.sidebarActions}>
                            <button onClick={handleToggleSave} style={styles.sidebarBtn}>
                                <FiHeart style={{
                                    fill: isSaved ? '#EC4899' : 'none',
                                    color: isSaved ? '#EC4899' : '#374151'
                                }} />
                                {isSaved ? 'Saved' : 'Save Scheme'}
                            </button>
                            <button onClick={handleShare} style={styles.sidebarBtn}>
                                <FiShare2 />
                                Share
                            </button>
                            <button onClick={handlePrint} style={styles.sidebarBtn}>
                                <FiPrinter />
                                Print
                            </button>
                            <Link to="/user/eligibility" style={{ ...styles.sidebarBtn, textDecoration: 'none' }}>
                                <FiCheckCircle />
                                Check Eligibility
                            </Link>
                        </div>
                    </div>

                    <div style={styles.sidebarCard}>
                        <h3 style={styles.sidebarTitle}>Related Info</h3>
                        <div style={styles.infoList}>
                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>Scheme ID</span>
                                <span style={styles.infoValue}>#{scheme.id}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>State</span>
                                <span style={styles.infoValue}>Maharashtra</span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>Status</span>
                                <span style={{ ...styles.infoValue, color: '#10B981' }}>
                                    ● {scheme.status || 'Active'}
                                </span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>Type</span>
                                <span style={styles.infoValue}>State Govt</span>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        ...styles.sidebarCard,
                        background: `linear-gradient(135deg, ${catColor}15 0%, ${catColor}05 100%)`,
                        border: `1px solid ${catColor}30`
                    }}>
                        <HiSparkles style={{ fontSize: 32, color: catColor, marginBottom: 12 }} />
                        <h4 style={{ fontSize: 15, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
                            Get AI Recommendations
                        </h4>
                        <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 12 }}>
                            Discover more schemes matched to your profile
                        </p>
                        <Link to="/user/recommendations" style={{
                            ...styles.sidebarBtn,
                            background: catColor,
                            color: '#ffffff',
                            justifyContent: 'center',
                            textDecoration: 'none'
                        }}>
                            View All <FiChevronRight />
                        </Link>
                    </div>
                </aside>
            </section>
        </div>
    );
};

// ─── Sub Components ───
const ContentCard = ({ title, icon, color, children }) => (
    <div style={styles.contentCard}>
        <div style={styles.contentHeader}>
            <div style={{ ...styles.contentIcon, background: `${color}15`, color: color }}>
                {icon}
            </div>
            <h2 style={styles.contentTitle}>{title}</h2>
        </div>
        <div style={styles.contentBody}>{children}</div>
    </div>
);

const HighlightItem = ({ icon, title, desc }) => (
    <div style={styles.highlightItem}>
        <div style={styles.highlightEmoji}>{icon}</div>
        <div>
            <div style={styles.highlightTitle}>{title}</div>
            <div style={styles.highlightDesc}>{desc}</div>
        </div>
    </div>
);

const CriteriaCard = ({ icon, title, value, color }) => (
    <div style={styles.criteriaCard}>
        <div style={{ ...styles.criteriaIcon, background: `${color}15`, color: color }}>{icon}</div>
        <div>
            <div style={styles.criteriaTitle}>{title}</div>
            <div style={styles.criteriaValue}>{value}</div>
        </div>
    </div>
);

const PerkCard = ({ icon, title, desc }) => (
    <div style={styles.perkCard}>
        <div style={styles.perkIcon}>{icon}</div>
        <div style={styles.perkTitle}>{title}</div>
        <div style={styles.perkDesc}>{desc}</div>
    </div>
);

const styles = {
    wrapper: { width: '100%', minHeight: '100vh', paddingBottom: '40px' },
    loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' },
    spinner: { width: '48px', height: '48px', border: '4px solid #E5E7EB', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    errorWrap: { textAlign: 'center', padding: '80px 20px' },
    backBtn: { display: 'inline-flex', alignItems: 'center', background: '#4F46E5', color: '#fff', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, marginTop: 20 },

    breadcrumb: { display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 0', fontSize: '13px', color: '#6B7280' },
    breadcrumbLink: { color: '#4F46E5', textDecoration: 'none', fontWeight: 600 },
    breadcrumbCurrent: { color: '#111827', fontWeight: 700, maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },

    msgBar: { padding: '12px 20px', background: '#D1FAE5', color: '#065F46', borderRadius: '10px', marginBottom: '16px', fontSize: '14px', fontWeight: '600' },

    hero: { position: 'relative', padding: '40px', borderRadius: '20px', overflow: 'hidden', border: '1px solid', marginBottom: '20px' },
    heroDecor: { position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0,0,0,0.03) 0%, transparent 70%)', borderRadius: '50%' },
    heroContainer: { position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '30px', flexWrap: 'wrap', zIndex: 2 },
    heroLeft: { flex: 1, minWidth: 300 },
    categoryBadge: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '100px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '16px' },
    heroTitle: { fontSize: '32px', fontWeight: '800', color: '#111827', marginBottom: '12px', letterSpacing: '-1px', lineHeight: 1.2 },
    heroDesc: { fontSize: '15px', color: '#4B5563', lineHeight: 1.7, marginBottom: '20px', maxWidth: 700 },
    heroMeta: { display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' },
    metaItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#374151', fontWeight: 600 },
    heroActions: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
    applyBtn: { display: 'inline-flex', alignItems: 'center', color: '#fff', padding: '14px 24px', borderRadius: '12px', textDecoration: 'none', fontSize: '14px', fontWeight: '700', boxShadow: '0 6px 20px rgba(0,0,0,0.15)' },
    saveBtn: { display: 'inline-flex', alignItems: 'center', padding: '14px 24px', borderRadius: '12px', border: '1.5px solid', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
    iconBtn: { width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', border: '1.5px solid #E5E7EB', borderRadius: '12px', color: '#374151', cursor: 'pointer', fontSize: '16px' },
    heroRight: { flexShrink: 0 },
    heroIcon: { width: '160px', height: '160px', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '72px' },

    statsSection: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
    statCard: { display: 'flex', alignItems: 'center', gap: '14px', padding: '18px', background: '#ffffff', borderRadius: '14px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' },
    statIcon: { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 },
    statLabel: { fontSize: '11px', color: '#6B7280', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' },
    statValue: { fontSize: '15px', fontWeight: '800', color: '#111827' },

    tabsSection: { marginBottom: '24px', borderBottom: '1px solid #E5E7EB' },
    tabs: { display: 'flex', gap: '4px', overflowX: 'auto' },
    tab: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 20px', background: 'transparent', color: '#6B7280', border: 'none', borderBottom: '3px solid transparent', fontSize: '14px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' },
    tabActive: { fontWeight: '800' },

    contentSection: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' },
    contentMain: { display: 'flex', flexDirection: 'column', gap: '20px' },
    contentCard: { background: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' },
    contentHeader: { display: 'flex', alignItems: 'center', gap: '14px', padding: '20px 24px', borderBottom: '1px solid #F3F4F6' },
    contentIcon: { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
    contentTitle: { fontSize: '18px', fontWeight: '800', color: '#111827' },
    contentBody: { padding: '24px' },
    paragraph: { fontSize: '14px', color: '#4B5563', lineHeight: 1.8 },

    noteBox: { display: 'flex', gap: '12px', padding: '16px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', marginTop: '16px', fontSize: '13px', color: '#78350F' },

    highlightsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' },
    highlightItem: { display: 'flex', gap: '12px', padding: '14px', background: '#F9FAFB', borderRadius: '10px' },
    highlightEmoji: { fontSize: '28px' },
    highlightTitle: { fontSize: '13px', fontWeight: '800', color: '#111827', marginBottom: '4px' },
    highlightDesc: { fontSize: '12px', color: '#6B7280', lineHeight: 1.5 },

    criteriaGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' },
    criteriaCard: { display: 'flex', gap: '14px', padding: '16px', background: '#F9FAFB', borderRadius: '12px', border: '1px solid #F3F4F6' },
    criteriaIcon: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 },
    criteriaTitle: { fontSize: '11px', color: '#6B7280', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' },
    criteriaValue: { fontSize: '14px', fontWeight: '800', color: '#111827' },

    listSection: { marginTop: '24px' },
    listTitle: { fontSize: '15px', fontWeight: '800', color: '#111827', marginBottom: '12px' },
    list: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' },
    listItem: { display: 'flex', gap: '10px', fontSize: '14px', color: '#374151', lineHeight: 1.6 },

    checkBox: { display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: '#F9FAFB', borderRadius: '12px', marginTop: '20px', flexWrap: 'wrap' },
    checkBtn: { padding: '10px 20px', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: '700', textDecoration: 'none' },

    benefitHighlight: { display: 'flex', gap: '20px', alignItems: 'center', padding: '24px', background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)', borderRadius: '12px', border: '1px solid #86EFAC', marginBottom: '20px' },
    benefitIcon: { fontSize: '48px' },
    benefitMainTitle: { fontSize: '18px', fontWeight: '800', color: '#065F46', marginBottom: '8px' },
    benefitMainDesc: { fontSize: '14px', color: '#047857', lineHeight: 1.6 },

    perksGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' },
    perkCard: { padding: '18px', background: '#F9FAFB', borderRadius: '12px', textAlign: 'center', border: '1px solid #F3F4F6' },
    perkIcon: { fontSize: '32px', marginBottom: '10px' },
    perkTitle: { fontSize: '13px', fontWeight: '800', color: '#111827', marginBottom: '4px' },
    perkDesc: { fontSize: '11px', color: '#6B7280', lineHeight: 1.5 },

    docsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '20px' },
    docCard: { display: 'flex', gap: '12px', alignItems: 'center', padding: '14px', background: '#F9FAFB', borderRadius: '10px', border: '1px solid #F3F4F6' },
    docIcon: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 },
    docName: { fontSize: '13px', fontWeight: '700', color: '#111827', marginBottom: '2px' },
    docStatus: { fontSize: '11px', color: '#10B981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' },

    stepsWrap: { display: 'flex', flexDirection: 'column', gap: '16px' },
    step: { display: 'flex', gap: '16px', position: 'relative' },
    stepNumber: { width: '36px', height: '36px', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', flexShrink: 0, zIndex: 2 },
    stepContent: { flex: 1, padding: '8px 0' },
    stepText: { fontSize: '14px', color: '#374151', lineHeight: 1.6 },
    stepConnector: { position: 'absolute', left: '17px', top: '36px', bottom: '-16px', width: '2px', background: '#E5E7EB', zIndex: 1 },

    applyCTA: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)', borderRadius: '12px', marginTop: '24px', gap: '16px', flexWrap: 'wrap' },
    ctaTitle: { fontSize: '18px', fontWeight: '800', color: '#111827', marginBottom: '4px' },
    ctaDesc: { fontSize: '13px', color: '#6B7280' },
    ctaBtn: { display: 'inline-flex', alignItems: 'center', color: '#fff', padding: '14px 28px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: '700' },

    supportGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' },
    supportCard: { display: 'flex', gap: '14px', alignItems: 'center', padding: '18px', background: '#F9FAFB', borderRadius: '12px' },
    supportLabel: { fontSize: '11px', color: '#6B7280', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' },
    supportValue: { fontSize: '13px', fontWeight: '700', color: '#111827' },

    sidebar: { display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '90px', alignSelf: 'flex-start' },
    sidebarCard: { background: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #E5E7EB' },
    sidebarTitle: { fontSize: '14px', fontWeight: '800', color: '#111827', marginBottom: '14px' },
    sidebarActions: { display: 'flex', flexDirection: 'column', gap: '8px' },
    sidebarBtn: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#F9FAFB', border: '1px solid #F3F4F6', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer', textAlign: 'left', width: '100%' },
    infoList: { display: 'flex', flexDirection: 'column', gap: '10px' },
    infoRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F3F4F6', fontSize: '13px' },
    infoLabel: { color: '#6B7280', fontWeight: '600' },
    infoValue: { color: '#111827', fontWeight: '700' }
};

export default SchemeDetail;