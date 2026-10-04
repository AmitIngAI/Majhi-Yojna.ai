import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { notificationAPI, schemeAPI } from '../../services/api';
import {
    FiBell, FiCheck, FiTrash2, FiCheckCircle,
    FiPlus, FiEdit2, FiXCircle, FiInfo, FiX,
    FiArrowRight, FiClock, FiEye, FiTag, FiAlertCircle
} from 'react-icons/fi';

const Notifications = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedNotif, setSelectedNotif] = useState(null);
    const [schemeDetails, setSchemeDetails] = useState(null);
    const [loadingScheme, setLoadingScheme] = useState(false);

    useEffect(() => {
        if (user?.userId) load();
        const interval = setInterval(load, 15000);
        return () => clearInterval(interval);
    }, [user]);

    const load = async () => {
        try {
            const res = await notificationAPI.getAll(user.userId);
            const data = res.data?.data || res.data || [];
            console.log('📬 Notifications loaded:', data); // Debug
            setNotifications(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Notification load error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Extract scheme ID from message text
    const extractSchemeId = (message) => {
        if (!message) return null;
        const match = message.match(/\[SCHEME_ID:(\d+)\]/);
        return match ? parseInt(match[1]) : null;
    };

    // Clean message — remove [SCHEME_ID:X] tag
    const cleanMessage = (message) => {
        if (!message) return '';
        return message.replace(/\[SCHEME_ID:\d+\]/g, '').trim();
    };

    // ─── CLICK on notification → Open modal ───
    const handleNotifClick = async (notif) => {
        console.log('🔔 Notification clicked:', notif); // Debug
        setSelectedNotif(notif);
        setSchemeDetails(null);

        // Mark as read
        if (!notif.isRead) {
            try {
                await notificationAPI.markAsRead(notif.id);
                load();
            } catch (err) { console.error(err); }
        }

        // Try to fetch related scheme
        const schemeId = extractSchemeId(notif.message);
        console.log('🎯 Extracted scheme ID:', schemeId); // Debug

        if (schemeId && notif.type !== 'SCHEME_DELETED') {
            setLoadingScheme(true);
            try {
                const res = await schemeAPI.getById(schemeId);
                const data = res.data?.data || res.data;
                console.log('✅ Scheme details loaded:', data); // Debug
                setSchemeDetails(data);
            } catch (err) {
                console.error('❌ Scheme fetch error:', err);
            } finally {
                setLoadingScheme(false);
            }
        }
    };

    const handleViewScheme = (schemeId) => {
        setSelectedNotif(null);
        navigate(`/user/schemes/${schemeId}`);
    };

    const handleMarkRead = async (id, e) => {
        e.stopPropagation();
        try {
            await notificationAPI.markAsRead(id);
            load();
        } catch (err) { console.error(err); }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationAPI.markAllAsRead(user.userId);
            load();
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id, e) => {
        if (e) e.stopPropagation();
        if (!window.confirm('Delete this notification?')) return;
        try {
            await notificationAPI.delete(id);
            if (selectedNotif?.id === id) setSelectedNotif(null);
            load();
        } catch (err) { console.error(err); }
    };

    const getIcon = (type) => {
        const map = {
            'SCHEME_ADDED': {
                icon: <FiPlus />,
                bg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
                color: '#10B981',
                label: 'New Scheme'
            },
            'SCHEME_UPDATED': {
                icon: <FiEdit2 />,
                bg: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
                color: '#3B82F6',
                label: 'Scheme Updated'
            },
            'SCHEME_DELETED': {
                icon: <FiXCircle />,
                bg: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
                color: '#EF4444',
                label: 'Scheme Removed'
            },
            'INFO': {
                icon: <FiInfo />,
                bg: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                color: '#6B7280',
                label: 'Info'
            }
        };
        return map[type] || map['INFO'];
    };

    const timeAgo = (date) => {
        if (!date) return 'Recently';
        const diffMs = new Date() - new Date(date);
        const mins = Math.floor(diffMs / 60000);
        const hrs = Math.floor(diffMs / 3600000);
        const days = Math.floor(diffMs / 86400000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins} min ago`;
        if (hrs < 24) return `${hrs}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString('en-IN');
    };

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const filtered = notifications.filter(n => {
        if (filter === 'unread') return !n.isRead;
        if (filter === 'read') return n.isRead;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (loading) {
        return (
            <div style={s.loading}>
                <div style={s.spinner}></div>
                <p>Loading notifications...</p>
            </div>
        );
    }

    return (
        <div style={s.wrap}>
            {/* HEADER */}
            <div style={s.header}>
                <div>
                    <h1 style={s.title}><FiBell style={{ marginRight: 10 }} />Notifications</h1>
                    <p style={s.desc}>{unreadCount} unread of {notifications.length} total</p>
                </div>
                {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} style={s.markAllBtn}>
                        <FiCheckCircle /> Mark All Read
                    </button>
                )}
            </div>

            {/* FILTERS */}
            <div style={s.filterBar}>
                <button onClick={() => setFilter('all')}
                    style={{ ...s.filterBtn, ...(filter === 'all' ? s.filterActive : {}) }}>
                    All ({notifications.length})
                </button>
                <button onClick={() => setFilter('unread')}
                    style={{ ...s.filterBtn, ...(filter === 'unread' ? s.filterActive : {}) }}>
                    Unread ({unreadCount})
                </button>
                <button onClick={() => setFilter('read')}
                    style={{ ...s.filterBtn, ...(filter === 'read' ? s.filterActive : {}) }}>
                    Read ({notifications.length - unreadCount})
                </button>
            </div>

            {filtered.length === 0 ? (
                <div style={s.empty}>
                    <FiBell style={{ fontSize: 60, color: '#D1D5DB', marginBottom: 16 }} />
                    <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
                        No notifications
                    </h3>
                    <p style={{ color: '#6B7280', fontSize: 14 }}>You're all caught up!</p>
                </div>
            ) : (
                <div style={s.list}>
                    {filtered.map(n => {
                        const iconData = getIcon(n.type);
                        const previewMsg = cleanMessage(n.message);

                        return (
                            <div
                                key={n.id}
                                onClick={() => handleNotifClick(n)}
                                style={{
                                    ...s.item,
                                    background: n.isRead ? '#fff' : 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)',
                                    borderColor: n.isRead ? '#E5E7EB' : '#C7D2FE'
                                }}>
                                <div style={{ ...s.itemIcon, background: iconData.bg, color: iconData.color }}>
                                    {iconData.icon}
                                </div>
                                <div style={s.itemContent}>
                                    <div style={s.itemHeader}>
                                        <div>
                                            <span style={s.typeBadge}>{iconData.label}</span>
                                            <h4 style={s.itemTitle}>
                                                {n.title}
                                                {!n.isRead && <span style={s.newDot}></span>}
                                            </h4>
                                        </div>
                                        <span style={s.itemTime}>{timeAgo(n.createdAt)}</span>
                                    </div>
                                    <p style={s.itemMessage}>
                                        {previewMsg?.length > 100 ? previewMsg.substring(0, 100) + '...' : previewMsg}
                                    </p>
                                    <div style={s.clickHint}>
                                        <FiEye size={12} /> Click to view full details
                                    </div>
                                </div>
                                <div style={s.itemActions}>
                                    {!n.isRead && (
                                        <button onClick={(e) => handleMarkRead(n.id, e)}
                                            style={{ ...s.actionBtn, background: '#EEF2FF', color: '#4F46E5' }}>
                                            <FiCheck />
                                        </button>
                                    )}
                                    <button onClick={(e) => handleDelete(n.id, e)}
                                        style={{ ...s.actionBtn, background: '#FEE2E2', color: '#DC2626' }}>
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ═══════════ DETAIL MODAL ═══════════ */}
            {selectedNotif && (
                <div style={s.modalOverlay} onClick={() => setSelectedNotif(null)}>
                    <div style={s.modalBox} onClick={(e) => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div style={{
                            ...s.modalHead,
                            background: getIcon(selectedNotif.type).bg
                        }}>
                            <div style={s.modalHeadLeft}>
                                <div style={{
                                    ...s.modalHeadIcon,
                                    color: getIcon(selectedNotif.type).color
                                }}>
                                    {getIcon(selectedNotif.type).icon}
                                </div>
                                <div>
                                    <div style={{
                                        ...s.modalTypeBadge,
                                        color: getIcon(selectedNotif.type).color
                                    }}>
                                        {getIcon(selectedNotif.type).label}
                                    </div>
                                    <h2 style={s.modalHeadTitle}>{selectedNotif.title}</h2>
                                </div>
                            </div>
                            <button onClick={() => setSelectedNotif(null)} style={s.modalCloseBtn}>
                                <FiX size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={s.modalBodyContent}>

                            {/* Time Card */}
                            <div style={s.timeInfoBox}>
                                <FiClock style={{ color: '#6B7280', fontSize: 18 }} />
                                <div>
                                    <div style={s.timeInfoLabel}>Received on</div>
                                    <div style={s.timeInfoValue}>{formatDate(selectedNotif.createdAt)}</div>
                                </div>
                            </div>

                            {/* Full Message Section */}
                            <div style={s.detailSection}>
                                <div style={s.detailLabel}>
                                    📝 What Changed / Details
                                </div>
                                <div style={s.detailMessageBox}>
                                    {cleanMessage(selectedNotif.message).split('\n').map((line, i) => (
                                        line.trim() && (
                                            <p key={i} style={s.messageLine}>
                                                {line.trim()}
                                            </p>
                                        )
                                    ))}
                                </div>
                            </div>

                            {/* Loading Scheme */}
                            {loadingScheme && (
                                <div style={s.loadingBox}>
                                    <div style={s.miniSpinner}></div>
                                    <p>Loading scheme details...</p>
                                </div>
                            )}

                            {/* Scheme Details (if available) */}
                            {schemeDetails && !loadingScheme && (
                                <div style={s.detailSection}>
                                    <div style={s.detailLabel}>
                                        🎯 Related Scheme
                                    </div>
                                    <div style={s.schemeInfoCard}>
                                        <div style={s.schemeInfoHead}>
                                            <div style={{ flex: 1 }}>
                                                <h3 style={s.schemeInfoName}>{schemeDetails.schemeName}</h3>
                                                <div style={s.schemeInfoCat}>
                                                    <FiTag size={12} /> {schemeDetails.category}
                                                </div>
                                            </div>
                                            <span style={{
                                                ...s.schemeInfoStatus,
                                                background: schemeDetails.status === 'Active' ? '#D1FAE5' : '#FEE2E2',
                                                color: schemeDetails.status === 'Active' ? '#065F46' : '#991B1B'
                                            }}>
                                                ● {schemeDetails.status}
                                            </span>
                                        </div>

                                        {schemeDetails.description && (
                                            <p style={s.schemeInfoDesc}>
                                                {schemeDetails.description.length > 180
                                                    ? schemeDetails.description.substring(0, 180) + '...'
                                                    : schemeDetails.description}
                                            </p>
                                        )}

                                        <div style={s.schemeStatsGrid}>
                                            <div style={s.schemeStatBox}>
                                                <div style={s.schemeStatLabel}>Age Range</div>
                                                <div style={s.schemeStatValue}>
                                                    {schemeDetails.ageMin} - {schemeDetails.ageMax}y
                                                </div>
                                            </div>
                                            <div style={s.schemeStatBox}>
                                                <div style={s.schemeStatLabel}>Income</div>
                                                <div style={s.schemeStatValue}>
                                                    ₹{schemeDetails.incomeLimit
                                                        ? Number(schemeDetails.incomeLimit).toLocaleString('en-IN')
                                                        : 'Any'}
                                                </div>
                                            </div>
                                            <div style={s.schemeStatBox}>
                                                <div style={s.schemeStatLabel}>For</div>
                                                <div style={s.schemeStatValue}>
                                                    {schemeDetails.categoryRequired || 'All'}
                                                </div>
                                            </div>
                                        </div>

                                        {schemeDetails.benefits && (
                                            <div style={s.schemeBenefitsBox}>
                                                💰 <strong>Benefits:</strong> {schemeDetails.benefits.length > 120
                                                    ? schemeDetails.benefits.substring(0, 120) + '...'
                                                    : schemeDetails.benefits}
                                            </div>
                                        )}

                                        <button
                                            onClick={() => handleViewScheme(schemeDetails.id)}
                                            style={s.viewSchemeBtn}>
                                            <FiEye /> View Full Scheme Details <FiArrowRight />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Deleted Scheme Warning */}
                            {selectedNotif.type === 'SCHEME_DELETED' && (
                                <div style={s.warningBox}>
                                    <FiAlertCircle style={{ fontSize: 22, color: '#EF4444', flexShrink: 0 }} />
                                    <div>
                                        <strong style={{ color: '#991B1B', fontSize: 14 }}>
                                            Scheme No Longer Available
                                        </strong>
                                        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#7F1D1D', lineHeight: 1.6 }}>
                                            This scheme has been permanently removed from the portal.
                                            You cannot access it anymore.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div style={s.modalFooterBar}>
                            <button onClick={(e) => handleDelete(selectedNotif.id, e)}
                                style={{ ...s.footBtn, ...s.footDeleteBtn }}>
                                <FiTrash2 /> Delete
                            </button>
                            {schemeDetails && (
                                <button onClick={() => handleViewScheme(schemeDetails.id)}
                                    style={{ ...s.footBtn, ...s.footViewBtn }}>
                                    <FiEye /> Go to Scheme <FiArrowRight />
                                </button>
                            )}
                            {!schemeDetails && (
                                <button onClick={() => setSelectedNotif(null)}
                                    style={{ ...s.footBtn, ...s.footCloseBtn }}>
                                    Close
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const s = {
    wrap: { padding: '20px 0', maxWidth: 900, margin: '0 auto' },
    loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 80, gap: 16 },
    spinner: { width: 48, height: 48, border: '4px solid #E5E7EB', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    miniSpinner: { width: 32, height: 32, border: '3px solid #E5E7EB', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' },

    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 28, fontWeight: 800, color: '#111827', display: 'flex', alignItems: 'center' },
    desc: { fontSize: 14, color: '#6B7280', marginTop: 4 },
    markAllBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, background: '#EEF2FF', color: '#4F46E5', padding: '10px 18px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' },

    filterBar: { display: 'flex', gap: 8, marginBottom: 20 },
    filterBtn: { padding: '10px 20px', background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#6B7280', cursor: 'pointer' },
    filterActive: { background: '#4F46E5', color: '#fff', borderColor: '#4F46E5' },

    empty: { textAlign: 'center', padding: 60, background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB' },
    list: { display: 'flex', flexDirection: 'column', gap: 12 },

    item: {
        display: 'flex', gap: 14, padding: 18, borderRadius: 12,
        border: '1.5px solid', alignItems: 'flex-start',
        cursor: 'pointer', transition: 'all 0.2s'
    },
    itemIcon: {
        width: 48, height: 48, borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0
    },
    itemContent: { flex: 1, minWidth: 0 },
    itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    typeBadge: {
        display: 'inline-block', background: 'rgba(79,70,229,0.1)',
        color: '#4F46E5', padding: '3px 10px', borderRadius: 100,
        fontSize: 10, fontWeight: 800, letterSpacing: 0.5,
        marginBottom: 6, textTransform: 'uppercase'
    },
    itemTitle: { fontSize: 15, fontWeight: 800, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 },
    newDot: { width: 8, height: 8, borderRadius: '50%', background: '#4F46E5', boxShadow: '0 0 0 3px rgba(79,70,229,0.2)' },
    itemTime: { fontSize: 12, color: '#6B7280', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 10 },
    itemMessage: { fontSize: 13, color: '#4B5563', lineHeight: 1.6, marginBottom: 8 },
    clickHint: {
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 11, color: '#4F46E5', fontWeight: 700
    },
    itemActions: { display: 'flex', flexDirection: 'column', gap: 6 },
    actionBtn: {
        width: 32, height: 32, borderRadius: 8, border: 'none',
        cursor: 'pointer', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 14
    },

    /* ═══ MODAL ═══ */
    modalOverlay: {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, padding: 20
    },
    modalBox: {
        background: '#fff', borderRadius: 20, width: '100%',
        maxWidth: 700, maxHeight: '90vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
        animation: 'modalPop 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    modalHead: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: 24
    },
    modalHeadLeft: { display: 'flex', gap: 16, alignItems: 'center', flex: 1 },
    modalHeadIcon: {
        width: 56, height: 56, background: 'rgba(255,255,255,0.9)',
        borderRadius: 14, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 26,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', flexShrink: 0
    },
    modalTypeBadge: {
        display: 'inline-block', padding: '4px 12px',
        borderRadius: 100, fontSize: 10, fontWeight: 800,
        letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase',
        background: 'rgba(255,255,255,0.8)'
    },
    modalHeadTitle: {
        fontSize: 20, fontWeight: 800, color: '#111827',
        lineHeight: 1.3, margin: 0
    },
    modalCloseBtn: {
        width: 36, height: 36, background: 'rgba(255,255,255,0.9)',
        border: 'none', borderRadius: 10, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#111827', flexShrink: 0
    },

    modalBodyContent: { padding: 24, overflow: 'auto', flex: 1 },

    timeInfoBox: {
        display: 'flex', gap: 12, alignItems: 'center',
        padding: 14, background: '#F9FAFB', borderRadius: 10,
        marginBottom: 20
    },
    timeInfoLabel: { fontSize: 11, color: '#6B7280', fontWeight: 700, marginBottom: 2 },
    timeInfoValue: { fontSize: 13, color: '#111827', fontWeight: 700 },

    detailSection: { marginBottom: 20 },
    detailLabel: {
        fontSize: 13, fontWeight: 800, color: '#374151',
        marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5
    },
    detailMessageBox: {
        padding: 20, background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
        borderRadius: 12, border: '1px solid #E5E7EB'
    },
    messageLine: {
        fontSize: 14, color: '#111827', lineHeight: 1.7,
        margin: '6px 0', fontWeight: 500
    },

    loadingBox: {
        textAlign: 'center', padding: 30, background: '#F9FAFB',
        borderRadius: 10, marginBottom: 20
    },

    schemeInfoCard: {
        padding: 20, background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)',
        borderRadius: 14, border: '1.5px solid #C7D2FE'
    },
    schemeInfoHead: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: 14, gap: 10
    },
    schemeInfoName: { fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 6 },
    schemeInfoCat: {
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 12, color: '#4F46E5', fontWeight: 700
    },
    schemeInfoStatus: {
        padding: '5px 12px', borderRadius: 100,
        fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap'
    },
    schemeInfoDesc: {
        fontSize: 13, color: '#4B5563', lineHeight: 1.6, marginBottom: 16
    },
    schemeStatsGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10, marginBottom: 14
    },
    schemeStatBox: {
        padding: 12, background: '#fff', borderRadius: 10,
        textAlign: 'center', border: '1px solid #E5E7EB'
    },
    schemeStatLabel: {
        fontSize: 10, color: '#6B7280', fontWeight: 700,
        textTransform: 'uppercase', marginBottom: 4
    },
    schemeStatValue: { fontSize: 13, fontWeight: 800, color: '#111827' },
    schemeBenefitsBox: {
        padding: 14, background: '#D1FAE5', borderRadius: 10,
        fontSize: 13, color: '#065F46', marginBottom: 14, lineHeight: 1.6
    },
    viewSchemeBtn: {
        width: '100%', display: 'inline-flex', alignItems: 'center',
        justifyContent: 'center', gap: 8,
        background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
        color: '#fff', padding: '13px 20px', borderRadius: 10,
        border: 'none', fontSize: 14, fontWeight: 700,
        cursor: 'pointer', boxShadow: '0 4px 14px rgba(79,70,229,0.35)'
    },

    warningBox: {
        display: 'flex', gap: 14, padding: 18, background: '#FEF2F2',
        borderRadius: 12, border: '1.5px solid #FCA5A5', marginTop: 16
    },

    modalFooterBar: {
        display: 'flex', gap: 10, padding: 20,
        borderTop: '1px solid #E5E7EB', background: '#F9FAFB'
    },
    footBtn: {
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '13px 20px', borderRadius: 10, border: 'none',
        fontSize: 13, fontWeight: 700, cursor: 'pointer'
    },
    footDeleteBtn: { background: '#FEE2E2', color: '#DC2626' },
    footViewBtn: {
        background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
        color: '#fff', flex: 1, justifyContent: 'center'
    },
    footCloseBtn: {
        background: '#F3F4F6', color: '#374151',
        flex: 1, justifyContent: 'center'
    }
};

export default Notifications;