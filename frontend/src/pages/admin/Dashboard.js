import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import {
    FiUsers, FiFileText, FiClipboard, FiTrendingUp,
    FiUser, FiBell, FiCheckCircle, FiHeart,
    FiChevronRight, FiActivity, FiSettings, FiPieChart,
    FiTrash2, FiPlus, FiShield, FiCalendar
} from 'react-icons/fi';
import { FaBuilding, FaRupeeSign } from 'react-icons/fa';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState({
        totalUsers: 0,
        totalSchemes: 0,
        activeSchemes: 0,
        totalApplications: 0,
        unreadMessages: 0,
        recentActivities: [],
        categoryDistribution: [],
        userGrowth: [],
        userTrend: '+0%',
        schemeTrend: '+0%',
        appTrend: '+0%',
        benefitTrend: '+18%'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
        const interval = setInterval(loadDashboard, 15000);
        return () => clearInterval(interval);
    }, []);

    const loadDashboard = async () => {
        try {
            const res = await adminAPI.getDashboard();
            const d = res.data?.data || res.data || {};
            setData({
                totalUsers: d.totalUsers || 0,
                totalSchemes: d.totalSchemes || 0,
                activeSchemes: d.activeSchemes || 0,
                totalApplications: d.totalApplications || 0,
                unreadMessages: d.unreadMessages || 0,
                recentActivities: d.recentActivities || [],
                categoryDistribution: d.categoryDistribution || [],
                userGrowth: d.userGrowth || [],
                userTrend: d.userTrend || '+0%',
                schemeTrend: d.schemeTrend || '+0%',
                appTrend: d.appTrend || '+0%',
                benefitTrend: d.benefitTrend || '+0%'
            });
        } catch (err) {
            console.error('Dashboard error:', err);
        } finally {
            setLoading(false);
        }
    };

    // ─── Real benefits calc ───
    const totalBenefits = data.totalApplications * 25000;
    const benefitsDisplay = totalBenefits > 100000
        ? `₹${(totalBenefits / 100000).toFixed(1)} L`
        : `₹${(totalBenefits / 1000).toFixed(0)}K`;

    // ─── Time Ago ───
    const timeAgo = (date) => {
        if (!date) return 'Recently';
        const now = new Date();
        const past = new Date(date);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} mins ago`;
        if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return past.toLocaleDateString('en-IN');
    };

    // ─── Activity Icon ───
    const getActivityIcon = (type) => {
        const map = {
            'USER_REGISTERED': { icon: <FiUsers />, bg: '#DBEAFE', color: '#3B82F6' },
            'PROFILE_UPDATED': { icon: <FiUser />, bg: '#F0FDF4', color: '#10B981' },
            'SCHEME_SAVED': { icon: <FiHeart />, bg: '#FCE7F3', color: '#EC4899' },
            'SCHEME_APPLIED': { icon: <FiFileText />, bg: '#FEF3C7', color: '#F59E0B' },
            'SCHEME_ADDED': { icon: <FiPlus />, bg: '#E9D5FF', color: '#8B5CF6' },
            'SCHEME_DELETED': { icon: <FiTrash2 />, bg: '#FEE2E2', color: '#EF4444' },
            'USER_STATUS_CHANGED': { icon: <FiUser />, bg: '#FEF3C7', color: '#F59E0B' },
            'USER_DELETED': { icon: <FiTrash2 />, bg: '#FEE2E2', color: '#EF4444' },
            'SCHEME_UPDATED': { icon: <FiFileText />, bg: '#DBEAFE', color: '#3B82F6' },
            'NOTIFICATION_SENT': { icon: <FiBell />, bg: '#FFF7ED', color: '#F97316' },
            'DOCUMENT_VERIFIED': { icon: <FiCheckCircle />, bg: '#F0FDF4', color: '#10B981' }
        };
        return map[type] || { icon: <FiActivity />, bg: '#F3F4F6', color: '#6B7280' };
    };

    const getActivityLabel = (type) => {
        const map = {
            'USER_REGISTERED': 'New User Registered',
            'PROFILE_UPDATED': 'Profile Updated',
            'SCHEME_SAVED': 'Scheme Saved',
            'SCHEME_APPLIED': 'Scheme Applied',
            'SCHEME_ADDED': 'New Scheme Added',
            'SCHEME_DELETED': 'Scheme Removed',
            'SCHEME_UPDATED': 'Scheme Updated',
            'USER_STATUS_CHANGED': 'User Status Changed',
            'USER_DELETED': 'User Deleted',
            'NOTIFICATION_SENT': 'Notification Sent',
            'DOCUMENT_VERIFIED': 'Document Verified'
        };
        return map[type] || 'Activity';
    };

    if (loading) {
        return (
            <div style={styles.loadingWrap}>
                <div style={styles.spinner}></div>
                <p>Loading admin dashboard...</p>
            </div>
        );
    }

    return (
        <div style={styles.wrapper}>

            {/* ═══════════ WELCOME BANNER (Admin Style) ═══════════ */}
            <section style={styles.welcomeBanner}>
                <div style={styles.bannerDecor1}></div>
                <div style={styles.bannerDecor2}></div>
                <div style={styles.bannerContainer}>

                    <div style={styles.bannerLeft}>
                        <div style={styles.adminBadge}>
                            <FiShield style={{ marginRight: 8 }} />
                            Administrator Portal
                        </div>
                        <h1 style={styles.welcomeTitle}>
                            Welcome, <span style={styles.userNameHighlight}>
                                {user?.fullName?.split(' ')[0] || 'Admin'}!
                            </span>
                        </h1>
                        <p style={styles.welcomeSubtitle}>
                            You have <strong>{data.totalUsers}</strong> registered users and <strong>{data.totalSchemes}</strong> active schemes to manage.
                        </p>
                        <div style={styles.chipsRow}>
                            <div style={styles.infoChip}>
                                <FiCalendar style={styles.chipIcon} />
                                <span>Today: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                            <div style={styles.infoChip}>
                                <span style={styles.onlineDot}></span>
                                <span style={{ color: '#10B981', fontWeight: 700 }}>System Online</span>
                            </div>
                            <div style={styles.infoChip}>
                                <FiActivity style={styles.chipIcon} />
                                <span>{data.recentActivities.length} recent activities</span>
                            </div>
                        </div>
                    </div>

                    <div style={styles.bannerRight}>
                        <div style={styles.adminCard}>
                            <div style={styles.adminAvatar}>
                                {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                            <div style={styles.adminInfo}>
                                <div style={styles.adminName}>{user?.fullName || 'Admin'}</div>
                                <div style={styles.adminEmail}>{user?.email || 'admin@mahabenefit.in'}</div>
                                <div style={styles.adminRole}>
                                    <FiShield style={{ fontSize: 11, marginRight: 4 }} />
                                    {user?.role || 'ADMINISTRATOR'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── STATS GRID ─── */}
            <div style={styles.statsGrid}>
                <StatCard
                    icon={<FiUsers />}
                    label="Total Users"
                    value={data.totalUsers.toLocaleString('en-IN')}
                    trend={data.userTrend}
                    trendLabel="vs. last month"
                    bg="linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%)"
                    iconBg="#3B82F6"
                />
                <StatCard
                    icon={<FiFileText />}
                    label="Total Schemes"
                    value={data.totalSchemes}
                    trend={data.schemeTrend}
                    trendLabel="vs. last month"
                    bg="linear-gradient(135deg, #D1FAE5 0%, #ECFDF5 100%)"
                    iconBg="#10B981"
                />
                <StatCard
                    icon={<FiClipboard />}
                    label="User Interest"
                    value={data.totalApplications}
                    trend={data.appTrend}
                    trendLabel="saves + apps"
                    bg="linear-gradient(135deg, #FED7AA 0%, #FFF7ED 100%)"
                    iconBg="#F97316"
                />
                <StatCard
                    icon={<FaRupeeSign />}
                    label="Total Benefits"
                    value={benefitsDisplay}
                    trend={data.benefitTrend}
                    trendLabel="est. yearly"
                    bg="linear-gradient(135deg, #E9D5FF 0%, #F5F3FF 100%)"
                    iconBg="#8B5CF6"
                />
            </div>

            {/* ─── CHARTS ROW ─── */}
            <div style={styles.chartsRow}>

                <div style={styles.chartCard}>
                    <div style={styles.chartHeader}>
                        <div style={styles.chartTitleWrap}>
                            <div style={styles.chartIcon}>
                                <FiUsers />
                            </div>
                            <h3 style={styles.chartTitle}>User Growth Analytics</h3>
                        </div>
                    </div>
                    <div style={styles.chartArea}>
                        <UserGrowthChart growthData={data.userGrowth} totalUsers={data.totalUsers} />
                    </div>
                </div>

                <div style={styles.chartCard}>
                    <div style={styles.chartHeader}>
                        <div style={styles.chartTitleWrap}>
                            <div style={styles.chartIcon}>
                                <FiPieChart />
                            </div>
                            <h3 style={styles.chartTitle}>Scheme Distribution</h3>
                        </div>
                    </div>
                    <div style={styles.donutWrap}>
                        <SchemeDonutChart
                            total={data.totalSchemes}
                            categories={data.categoryDistribution}
                        />
                        <div style={styles.donutLegend}>
                            {data.categoryDistribution.slice(0, 6).map((cat, i) => (
                                <LegendItem
                                    key={i}
                                    color={cat.color}
                                    label={cat.category}
                                    value={`${cat.percentage}%`}
                                    count={cat.count}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── BOTTOM ROW ─── */}
            <div style={styles.bottomRow}>

                <div style={styles.activitiesCard}>
                    <div style={styles.activityHeader}>
                        <div style={styles.chartTitleWrap}>
                            <div style={styles.activityIconMain}>
                                <FiActivity />
                            </div>
                            <h3 style={styles.chartTitle}>Recent Activities</h3>
                        </div>
                    </div>

                    {data.recentActivities.length === 0 ? (
                        <div style={styles.emptyActivity}>
                            <FiActivity style={{ fontSize: 40, color: '#9CA3AF', marginBottom: 12 }} />
                            <p style={{ color: '#6B7280', fontSize: 14 }}>No recent activities yet</p>
                            <p style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>
                                Activities appear when users interact with the platform
                            </p>
                        </div>
                    ) : (
                        <div style={styles.activitiesList}>
                            {data.recentActivities.map((activity, i) => {
                                const iconData = getActivityIcon(activity.activityType);
                                return (
                                    <div key={activity.id || i} style={styles.activityRow}>
                                        <div style={{
                                            ...styles.activityIcon,
                                            background: iconData.bg,
                                            color: iconData.color
                                        }}>
                                            {iconData.icon}
                                        </div>
                                        <div style={styles.activityInfo}>
                                            <div style={styles.activityLabel}>
                                                {getActivityLabel(activity.activityType)}
                                            </div>
                                        </div>
                                        <div style={styles.activityTitle}>
                                            {activity.title}
                                        </div>
                                        <div style={styles.activityTime}>
                                            <span style={styles.timeDot}></span>
                                            {timeAgo(activity.createdAt)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div style={styles.quickLinksCard}>
                    <div style={{ ...styles.chartTitleWrap, marginBottom: 20 }}>
                        <div style={styles.linkIconMain}>
                            <FiActivity />
                        </div>
                        <h3 style={styles.chartTitle}>Quick Links</h3>
                    </div>
                    <div style={styles.linksList}>
                        <QuickLink
                            icon={<FaBuilding />}
                            label="Scheme List"
                            to="/admin/schemes"
                            bg="#FFF7ED"
                            color="#F97316"
                        />
                        <QuickLink
                            icon={<FiUsers />}
                            label="User Management"
                            to="/admin/users"
                            bg="#DBEAFE"
                            color="#3B82F6"
                        />
                        <QuickLink
                            icon={<FiFileText />}
                            label="Messages"
                            to="/admin/messages"
                            bg="#FCE7F3"
                            color="#EC4899"
                        />
                        <QuickLink
                            icon={<FiSettings />}
                            label="Settings"
                            to="/admin/settings"
                            bg="#E9D5FF"
                            color="#8B5CF6"
                        />
                    </div>
                </div>
            </div>

            <div style={styles.footerNote}>
                © 2026 माझी योजना.AI Government Benefits Advisor · Smart Governance for a Better Tomorrow
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════
// SUB COMPONENTS
// ═══════════════════════════════════════════

const StatCard = ({ icon, label, value, trend, trendLabel, bg, iconBg }) => (
    <div style={{ ...styles.statCard, background: bg }}>
        <div style={{ ...styles.statIcon, background: iconBg }}>
            {icon}
        </div>
        <div style={styles.statContent}>
            <div style={styles.statLabel}>{label}</div>
            <div style={styles.statValue}>{value}</div>
            <div style={styles.statTrend}>
                <FiTrendingUp style={{ fontSize: 12, color: '#10B981' }} />
                <span style={styles.trendValue}>{trend}</span>
                <span style={styles.trendLabel}>{trendLabel}</span>
            </div>
        </div>
    </div>
);

const LegendItem = ({ color, label, value, count }) => (
    <div style={styles.legendItem}>
        <span style={{ ...styles.legendDot, background: color }}></span>
        <span style={styles.legendLabel}>{label}</span>
        <span style={styles.legendValue}>— {value}</span>
        <span style={styles.legendCount}>({count})</span>
    </div>
);

const QuickLink = ({ icon, label, to, bg, color }) => (
    <Link to={to} style={{ ...styles.quickLink, background: bg }}>
        <div style={{ ...styles.quickLinkIcon, color: color }}>
            {icon}
        </div>
        <span style={styles.quickLinkLabel}>{label}</span>
        <FiChevronRight style={{ color: color, fontSize: 18, marginLeft: 'auto' }} />
    </Link>
);

const UserGrowthChart = ({ growthData, totalUsers }) => {
    if (!growthData || growthData.length === 0) {
        return (
            <div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF' }}>
                No growth data available
            </div>
        );
    }

    const maxUsers = Math.max(...growthData.map(p => p.users), 10);
    const chartWidth = 640;
    const chartHeight = 200;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingBottom = 20;
    const usableWidth = chartWidth - paddingLeft - paddingRight;
    const usableHeight = chartHeight - paddingBottom;

    const points = growthData.map((p, i) => ({
        x: paddingLeft + (i / (growthData.length - 1)) * usableWidth,
        y: usableHeight - (p.users / maxUsers) * (usableHeight - 20),
        label: p.label,
        users: p.users
    }));

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = `${pathD} L ${points[points.length - 1].x} ${usableHeight} L ${paddingLeft} ${usableHeight} Z`;

    const yScale = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(maxUsers * f));

    return (
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 20}`} style={{ width: '100%', height: 240 }}>
            <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.02" />
                </linearGradient>
            </defs>

            {yScale.map((val, i) => {
                const y = usableHeight - (i / 4) * (usableHeight - 20);
                return (
                    <g key={i}>
                        <line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y}
                              stroke="#F3F4F6" strokeWidth="1" strokeDasharray="4 4" />
                        <text x={paddingLeft - 8} y={y + 4} fontSize="10" fill="#9CA3AF" textAnchor="end">
                            {val}
                        </text>
                    </g>
                );
            })}

            <path d={areaD} fill="url(#areaGradient)" />
            <path d={pathD} fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />

            {points.map((p, i) => (
                <g key={i}>
                    <circle cx={p.x} cy={p.y} r="5" fill="#3B82F6" />
                    <circle cx={p.x} cy={p.y} r="3" fill="#ffffff" />
                    <text x={p.x} y={chartHeight + 15} fontSize="10" fill="#6B7280" textAnchor="middle">
                        {p.label}
                    </text>
                </g>
            ))}

            {points.length > 0 && (
                <g>
                    <rect
                        x={points[points.length - 1].x - 45}
                        y={points[points.length - 1].y - 40}
                        width="80" height="26" rx="6" fill="#3B82F6"
                    />
                    <text
                        x={points[points.length - 1].x - 5}
                        y={points[points.length - 1].y - 22}
                        fontSize="12" fontWeight="700" fill="#ffffff" textAnchor="middle"
                    >
                        {totalUsers} Users
                    </text>
                </g>
            )}
        </svg>
    );
};

const SchemeDonutChart = ({ total, categories }) => {
    if (!categories || categories.length === 0) {
        return (
            <div style={styles.donutContainer}>
                <svg viewBox="0 0 160 160" style={{ width: 160, height: 160 }}>
                    <circle cx="80" cy="80" r="55" fill="none" stroke="#F3F4F6" strokeWidth="20" />
                    <text x="80" y="78" fontSize="24" fontWeight="800" fill="#111827" textAnchor="middle">
                        {total}
                    </text>
                    <text x="80" y="95" fontSize="9" fill="#6B7280" textAnchor="middle" fontWeight="600">
                        Total Schemes
                    </text>
                </svg>
            </div>
        );
    }

    const radius = 55;
    const circumference = 2 * Math.PI * radius;

    let cumOffset = 0;
    const segments = categories.map(cat => {
        const dashArray = (cat.percentage / 100) * circumference;
        const dashOffset = -((cumOffset / 100) * circumference);
        cumOffset += cat.percentage;
        return {
            dashArray,
            dashOffset,
            color: cat.color,
            category: cat.category,
            percentage: cat.percentage
        };
    });

    return (
        <div style={styles.donutContainer}>
            <svg viewBox="0 0 160 160" style={{ width: 160, height: 160 }}>
                <circle cx="80" cy="80" r={radius} fill="none" stroke="#F3F4F6" strokeWidth="20" />
                {segments.map((seg, i) => (
                    <circle key={i}
                        cx="80" cy="80" r={radius}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="20"
                        strokeDasharray={`${seg.dashArray} ${circumference}`}
                        strokeDashoffset={seg.dashOffset}
                        transform="rotate(-90 80 80)"
                        strokeLinecap="butt"
                    />
                ))}
                <text x="80" y="78" fontSize="24" fontWeight="800" fill="#111827" textAnchor="middle">
                    {total}
                </text>
                <text x="80" y="95" fontSize="9" fill="#6B7280" textAnchor="middle" fontWeight="600">
                    Total Schemes
                </text>
            </svg>
        </div>
    );
};

// ═══════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════

const styles = {
    wrapper: {
        padding: '20px 0',
        maxWidth: 1400,
        margin: '0 auto'
    },
    loadingWrap: {
        display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 80, gap: 16
    },
    spinner: {
        width: 48, height: 48, border: '4px solid #E5E7EB',
        borderTopColor: '#3B82F6', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
    },

    /* ═══ WELCOME BANNER (Like User Dashboard) ═══ */
    welcomeBanner: {
        position: 'relative',
        width: '100%',
        background: 'linear-gradient(135deg, #EEF2FF 0%, #ffffff 50%, #FFF7ED 100%)',
        padding: '30px 40px',
        overflow: 'hidden',
        borderRadius: 20,
        marginBottom: 24,
        border: '1px solid #E5E7EB'
    },
    bannerDecor1: {
        position: 'absolute',
        top: '-100px',
        right: '-100px',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)',
        borderRadius: '50%'
    },
    bannerDecor2: {
        position: 'absolute',
        bottom: '-150px',
        left: '-100px',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)',
        borderRadius: '50%'
    },
    bannerContainer: {
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '30px',
        flexWrap: 'wrap',
        zIndex: 2
    },
    bannerLeft: { flex: 1, minWidth: '300px' },
    adminBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1E3A8A 0%, #4F46E5 100%)',
        color: '#ffffff',
        padding: '8px 16px',
        borderRadius: '100px',
        fontSize: '12px',
        fontWeight: '700',
        letterSpacing: '0.5px',
        marginBottom: '14px',
        boxShadow: '0 4px 14px rgba(30,58,138,0.25)'
    },
    welcomeTitle: {
        fontSize: '32px',
        fontWeight: '800',
        color: '#111827',
        marginBottom: '8px',
        letterSpacing: '-1px',
        lineHeight: 1.2
    },
    userNameHighlight: {
        background: 'linear-gradient(135deg, #4F46E5 0%, #F97316 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
    },
    welcomeSubtitle: {
        fontSize: '15px',
        color: '#4B5563',
        lineHeight: 1.6,
        marginBottom: '18px',
        maxWidth: '600px'
    },
    chipsRow: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap'
    },
    infoChip: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: '#ffffff',
        color: '#111827',
        padding: '8px 14px',
        borderRadius: '100px',
        fontSize: '12px',
        fontWeight: '600',
        border: '1px solid #E5E7EB',
        boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
    },
    chipIcon: {
        color: '#4F46E5',
        fontSize: '14px'
    },
    bannerRight: { flexShrink: 0 },
    adminCard: {
        background: '#ffffff',
        padding: '18px 22px',
        borderRadius: '16px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        minWidth: '280px'
    },
    adminAvatar: {
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #1E3A8A 0%, #4F46E5 100%)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: '800',
        boxShadow: '0 8px 20px rgba(30,58,138,0.35)',
        border: '3px solid #ffffff',
        flexShrink: 0
    },
    adminInfo: { flex: 1 },
    adminName: {
        fontSize: '16px',
        fontWeight: '800',
        color: '#111827',
        marginBottom: '2px'
    },
    adminEmail: {
        fontSize: '12px',
        color: '#6B7280',
        marginBottom: '6px'
    },
    adminRole: {
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: '10px',
        color: '#4F46E5',
        fontWeight: '800',
        letterSpacing: '0.5px',
        background: '#EEF2FF',
        padding: '3px 8px',
        borderRadius: '100px'
    },
    onlineDot: {
        width: 8, height: 8, borderRadius: '50%',
        background: '#10B981', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)',
        display: 'inline-block'
    },

    /* STATS */
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 },
    statCard: {
        display: 'flex', gap: 18, alignItems: 'flex-start',
        padding: 24, borderRadius: 16, border: '1px solid #E5E7EB'
    },
    statIcon: {
        width: 56, height: 56, borderRadius: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#ffffff', fontSize: 24, flexShrink: 0
    },
    statContent: { flex: 1 },
    statLabel: { fontSize: 13, color: '#6B7280', fontWeight: 600, marginBottom: 6 },
    statValue: { fontSize: 32, fontWeight: 800, color: '#111827', letterSpacing: -1, marginBottom: 8, lineHeight: 1 },
    statTrend: { display: 'flex', alignItems: 'center', gap: 4 },
    trendValue: { fontSize: 12, color: '#10B981', fontWeight: 800 },
    trendLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: 500, marginLeft: 4 },

    /* CHARTS */
    chartsRow: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginBottom: 24 },
    chartCard: { background: '#ffffff', padding: 24, borderRadius: 16, border: '1px solid #E5E7EB' },
    chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    chartTitleWrap: { display: 'flex', alignItems: 'center', gap: 12 },
    chartIcon: {
        width: 36, height: 36, borderRadius: 10,
        background: '#EFF6FF', color: '#3B82F6',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
    },
    chartTitle: { fontSize: 16, fontWeight: 800, color: '#111827' },
    chartSelect: {
        padding: '8px 14px', background: '#F9FAFB', border: '1px solid #E5E7EB',
        borderRadius: 8, fontSize: 12, color: '#374151', fontWeight: 600, cursor: 'pointer'
    },
    chartArea: { minHeight: 240 },

    /* DONUT */
    donutWrap: { display: 'flex', alignItems: 'center', gap: 20, padding: '10px 0' },
    donutContainer: { flexShrink: 0 },
    donutLegend: { flex: 1, display: 'flex', flexDirection: 'column', gap: 10 },
    legendItem: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 },
    legendDot: { width: 12, height: 12, borderRadius: '50%', flexShrink: 0 },
    legendLabel: { color: '#374151', fontWeight: 600, flex: 1 },
    legendValue: { color: '#111827', fontWeight: 700 },
    legendCount: { color: '#9CA3AF', fontSize: 11, fontWeight: 600 },

    /* BOTTOM ROW */
    bottomRow: { display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, marginBottom: 24 },
    activitiesCard: { background: '#ffffff', padding: 24, borderRadius: 16, border: '1px solid #E5E7EB' },
    activityHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    activityIconMain: {
        width: 36, height: 36, borderRadius: 10,
        background: '#EFF6FF', color: '#3B82F6',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
    },
    viewAllLink: { color: '#3B82F6', fontSize: 13, fontWeight: 700, textDecoration: 'none' },
    emptyActivity: { textAlign: 'center', padding: '40px 20px' },

    activitiesList: { display: 'flex', flexDirection: 'column', gap: 8 },
    activityRow: {
        display: 'grid', gridTemplateColumns: '48px 1fr 1.2fr auto',
        alignItems: 'center', gap: 14, padding: '12px 14px',
        background: '#F9FAFB', borderRadius: 10, border: '1px solid #F3F4F6'
    },
    activityIcon: {
        width: 40, height: 40, borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
    },
    activityInfo: {},
    activityLabel: { fontSize: 13, fontWeight: 700, color: '#111827' },
    activityTitle: { fontSize: 13, color: '#374151', fontWeight: 600 },
    activityTime: {
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 12, color: '#6B7280', fontWeight: 600, whiteSpace: 'nowrap'
    },
    timeDot: { width: 6, height: 6, borderRadius: '50%', background: '#10B981' },

    /* QUICK LINKS */
    quickLinksCard: { background: '#ffffff', padding: 24, borderRadius: 16, border: '1px solid #E5E7EB' },
    linkIconMain: {
        width: 36, height: 36, borderRadius: 10,
        background: '#F5F3FF', color: '#8B5CF6',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
    },
    linksList: { display: 'flex', flexDirection: 'column', gap: 10 },
    quickLink: {
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px', borderRadius: 12,
        textDecoration: 'none', transition: 'all 0.2s'
    },
    quickLinkIcon: {
        width: 32, height: 32,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
    },
    quickLinkLabel: { fontSize: 14, fontWeight: 700, color: '#111827' },

    footerNote: {
        textAlign: 'center', padding: 20,
        color: '#9CA3AF', fontSize: 12, fontWeight: 500,
        borderTop: '1px solid #F3F4F6'
    }
};

export default AdminDashboard;