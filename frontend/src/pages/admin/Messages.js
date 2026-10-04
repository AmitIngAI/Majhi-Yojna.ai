import React, { useState, useEffect } from 'react';
import { contactAPI } from '../../services/api';
import {
    FiSearch, FiEye, FiTrash2, FiMail, FiPhone,
    FiClock, FiCheck, FiCheckCircle, FiX,
    FiUser, FiSend, FiAlertCircle, FiFilter
} from 'react-icons/fi';

const AdminMessages = () => {
    const [messages, setMessages] = useState([]);
    const [stats, setStats] = useState({ total: 0, unread: 0, replied: 0, resolved: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [viewMsg, setViewMsg] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [replying, setReplying] = useState(false);
    const [toast, setToast] = useState('');

    useEffect(() => {
        loadMessages();
        // Auto-refresh every 30 seconds
        const interval = setInterval(loadMessages, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadMessages = async () => {
        try {
            const res = await contactAPI.getAllAdmin();
            const data = res.data?.data || {};
            setMessages(data.messages || []);
            setStats(data.stats || { total: 0, unread: 0, replied: 0, resolved: 0 });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleView = async (msg) => {
        setViewMsg(msg);
        setReplyText(msg.adminReply || '');
        if (msg.status === 'Unread') {
            try {
                await contactAPI.markAsRead(msg.id);
                loadMessages();
            } catch (err) { console.error(err); }
        }
    };

    const handleReply = async () => {
        if (!replyText.trim()) {
            showToast('❌ Reply cannot be empty');
            return;
        }
        setReplying(true);
        try {
            await contactAPI.reply(viewMsg.id, replyText);
            showToast('✅ Reply sent successfully');
            
            // Also open email client
            const subject = `Re: ${viewMsg.subject}`;
            const body = `Dear ${viewMsg.name},\n\n${replyText}\n\n---\nOriginal Message:\n${viewMsg.message}\n\nBest Regards,\nMahaBenefit Admin Team`;
            window.location.href = `mailto:${viewMsg.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            
            setViewMsg(null);
            loadMessages();
        } catch (err) {
            showToast('❌ Reply failed');
        } finally {
            setReplying(false);
        }
    };

    const handleResolve = async (id) => {
        try {
            await contactAPI.markResolved(id);
            showToast('✅ Marked as resolved');
            setViewMsg(null);
            loadMessages();
        } catch (err) {
            showToast('❌ Failed');
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete message from ${name}?`)) return;
        try {
            await contactAPI.delete(id);
            showToast('✅ Message deleted');
            setViewMsg(null);
            loadMessages();
        } catch (err) {
            showToast('❌ Delete failed');
        }
    };

    const filtered = messages.filter(m => {
        if (filter !== 'all' && m.status?.toLowerCase() !== filter) return false;
        if (search) {
            const q = search.toLowerCase();
            return m.name?.toLowerCase().includes(q) ||
                   m.email?.toLowerCase().includes(q) ||
                   m.subject?.toLowerCase().includes(q) ||
                   m.message?.toLowerCase().includes(q);
        }
        return true;
    });

    const timeAgo = (date) => {
        if (!date) return '';
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        const hrs = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins} min ago`;
        if (hrs < 24) return `${hrs}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString('en-IN');
    };

    const getStatusColor = (status) => {
        const map = {
            'Unread': { bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
            'Read': { bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
            'Replied': { bg: '#DBEAFE', color: '#1E40AF', dot: '#3B82F6' },
            'Resolved': { bg: '#D1FAE5', color: '#065F46', dot: '#10B981' }
        };
        return map[status] || map['Unread'];
    };

    if (loading) {
        return (
            <div style={s.loading}>
                <div style={s.spinner}></div>
                <p>Loading messages...</p>
            </div>
        );
    }

    return (
        <div style={s.wrap}>
            {/* HEADER */}
            <div style={s.header}>
                <div>
                    <h1 style={s.title}>
                        <FiMail style={{ marginRight: 10 }} />
                        Contact Messages
                    </h1>
                    <p style={s.desc}>Manage user inquiries and support requests</p>
                </div>
            </div>

            {toast && <div style={s.toast}>{toast}</div>}

            {/* STATS */}
            <div style={s.statsGrid}>
                <StatCard label="Total Messages" value={stats.total} color="#4F46E5" bg="#EEF2FF" icon={<FiMail />} />
                <StatCard label="Unread" value={stats.unread} color="#EF4444" bg="#FEE2E2" icon={<FiAlertCircle />} />
                <StatCard label="Replied" value={stats.replied} color="#3B82F6" bg="#DBEAFE" icon={<FiSend />} />
                <StatCard label="Resolved" value={stats.resolved} color="#10B981" bg="#D1FAE5" icon={<FiCheckCircle />} />
            </div>

            {/* FILTERS */}
            <div style={s.filterBar}>
                <div style={s.searchWrap}>
                    <FiSearch style={s.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by name, email, subject..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={s.searchInput}
                    />
                </div>
                <div style={s.filterChips}>
                    <FiFilter style={{ color: '#6B7280', marginRight: 4 }} />
                    <button onClick={() => setFilter('all')} style={{ ...s.chip, ...(filter === 'all' ? s.chipActive : {}) }}>
                        All ({stats.total})
                    </button>
                    <button onClick={() => setFilter('unread')} style={{ ...s.chip, ...(filter === 'unread' ? s.chipActive : {}) }}>
                        Unread ({stats.unread})
                    </button>
                    <button onClick={() => setFilter('read')} style={{ ...s.chip, ...(filter === 'read' ? s.chipActive : {}) }}>
                        Read
                    </button>
                    <button onClick={() => setFilter('replied')} style={{ ...s.chip, ...(filter === 'replied' ? s.chipActive : {}) }}>
                        Replied ({stats.replied})
                    </button>
                    <button onClick={() => setFilter('resolved')} style={{ ...s.chip, ...(filter === 'resolved' ? s.chipActive : {}) }}>
                        Resolved ({stats.resolved})
                    </button>
                </div>
            </div>

            {/* MESSAGES LIST */}
            {filtered.length === 0 ? (
                <div style={s.empty}>
                    <FiMail style={{ fontSize: 60, color: '#D1D5DB', marginBottom: 16 }} />
                    <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 8 }}>No messages found</h3>
                    <p style={{ color: '#6B7280', fontSize: 14 }}>
                        {search ? 'Try a different search term' : 'Messages will appear here when users submit contact forms'}
                    </p>
                </div>
            ) : (
                <div style={s.messagesList}>
                    {filtered.map(msg => {
                        const statusStyle = getStatusColor(msg.status);
                        return (
                            <div key={msg.id} style={{
                                ...s.msgCard,
                                borderLeftColor: statusStyle.dot,
                                background: msg.status === 'Unread' ? '#FEFEFE' : '#F9FAFB'
                            }}>
                                <div style={s.msgLeft}>
                                    <div style={s.msgAvatar}>
                                        {msg.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                </div>

                                <div style={s.msgContent}>
                                    <div style={s.msgHeader}>
                                        <div>
                                            <div style={s.msgName}>
                                                {msg.name}
                                                {msg.status === 'Unread' && <span style={s.newBadge}>NEW</span>}
                                            </div>
                                            <div style={s.msgMeta}>
                                                <span><FiMail size={11} /> {msg.email}</span>
                                                {msg.phone && <span><FiPhone size={11} /> {msg.phone}</span>}
                                                <span><FiClock size={11} /> {timeAgo(msg.createdAt)}</span>
                                            </div>
                                        </div>
                                        <span style={{
                                            ...s.statusBadge,
                                            background: statusStyle.bg,
                                            color: statusStyle.color
                                        }}>
                                            ● {msg.status}
                                        </span>
                                    </div>

                                    <div style={s.msgSubject}>
                                        📌 <strong>{msg.subject || 'General Inquiry'}</strong>
                                    </div>

                                    <p style={s.msgPreview}>
                                        {msg.message?.length > 150
                                            ? msg.message.substring(0, 150) + '...'
                                            : msg.message}
                                    </p>

                                    <div style={s.msgActions}>
                                        <button onClick={() => handleView(msg)} style={{ ...s.actionBtn, ...s.viewBtn }}>
                                            <FiEye /> View & Reply
                                        </button>
                                        {msg.status !== 'Resolved' && (
                                            <button onClick={() => handleResolve(msg.id)} style={{ ...s.actionBtn, ...s.resolveBtn }}>
                                                <FiCheck /> Mark Resolved
                                            </button>
                                        )}
                                        <button onClick={() => handleDelete(msg.id, msg.name)} style={{ ...s.actionBtn, ...s.deleteBtn }}>
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* VIEW/REPLY MODAL */}
            {viewMsg && (
                <div style={s.modal} onClick={() => setViewMsg(null)}>
                    <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={s.modalHeader}>
                            <div>
                                <h3 style={s.modalTitle}>Message from {viewMsg.name}</h3>
                                <p style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                                    Received {timeAgo(viewMsg.createdAt)}
                                </p>
                            </div>
                            <button onClick={() => setViewMsg(null)} style={s.modalClose}><FiX /></button>
                        </div>

                        <div style={s.modalBody}>
                            {/* Sender Info */}
                            <div style={s.senderCard}>
                                <div style={s.senderAvatar}>{viewMsg.name?.charAt(0)?.toUpperCase()}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>{viewMsg.name}</div>
                                    <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
                                        <FiMail size={12} style={{ marginRight: 4 }} /> {viewMsg.email}
                                    </div>
                                    {viewMsg.phone && (
                                        <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                                            <FiPhone size={12} style={{ marginRight: 4 }} /> {viewMsg.phone}
                                        </div>
                                    )}
                                </div>
                                <span style={{
                                    ...s.statusBadge,
                                    background: getStatusColor(viewMsg.status).bg,
                                    color: getStatusColor(viewMsg.status).color
                                }}>
                                    ● {viewMsg.status}
                                </span>
                            </div>

                            {/* Subject */}
                            <div style={s.subjectBox}>
                                <label style={s.fieldLabel}>Subject:</label>
                                <div style={s.subjectText}>{viewMsg.subject || 'General Inquiry'}</div>
                            </div>

                            {/* Message */}
                            <div style={s.messageBox}>
                                <label style={s.fieldLabel}>Message:</label>
                                <div style={s.messageText}>{viewMsg.message}</div>
                            </div>

                            {/* Existing Reply */}
                            {viewMsg.adminReply && (
                                <div style={s.replyBox}>
                                    <label style={s.fieldLabel}>
                                        ✅ Your Previous Reply ({timeAgo(viewMsg.repliedAt)}):
                                    </label>
                                    <div style={s.replyText}>{viewMsg.adminReply}</div>
                                </div>
                            )}

                            {/* Reply Form */}
                            <div style={s.replyForm}>
                                <label style={s.fieldLabel}>
                                    {viewMsg.adminReply ? '✏️ Update Reply:' : '📝 Type your reply:'}
                                </label>
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Write your reply here... This will be sent via email to the user."
                                    rows={6}
                                    style={s.replyTextarea}
                                />
                                <p style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>
                                    💡 Tip: Reply will open your default email client to send to {viewMsg.email}
                                </p>
                            </div>
                        </div>

                        <div style={s.modalFooter}>
                            <button onClick={() => handleDelete(viewMsg.id, viewMsg.name)} style={{ ...s.footerBtn, ...s.footerDelete }}>
                                <FiTrash2 /> Delete
                            </button>
                            {viewMsg.status !== 'Resolved' && (
                                <button onClick={() => handleResolve(viewMsg.id)} style={{ ...s.footerBtn, ...s.footerResolve }}>
                                    <FiCheckCircle /> Mark Resolved
                                </button>
                            )}
                            <button onClick={handleReply} disabled={replying} style={{ ...s.footerBtn, ...s.footerReply }}>
                                <FiSend /> {replying ? 'Sending...' : 'Send Reply'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ label, value, color, bg, icon }) => (
    <div style={s.statCard}>
        <div style={{ ...s.statIcon, background: bg, color }}>{icon}</div>
        <div>
            <div style={s.statLabel}>{label}</div>
            <div style={{ ...s.statValue, color }}>{value}</div>
        </div>
    </div>
);

const s = {
    wrap: { padding: '20px 0', maxWidth: 1400, margin: '0 auto' },
    loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 80, gap: 16 },
    spinner: { width: 48, height: 48, border: '4px solid #E5E7EB', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },

    header: { marginBottom: 24 },
    title: { fontSize: 28, fontWeight: 800, color: '#111827', display: 'flex', alignItems: 'center' },
    desc: { fontSize: 14, color: '#6B7280', marginTop: 4 },

    toast: {
        position: 'fixed', top: 20, right: 20, zIndex: 200,
        padding: '14px 24px', background: '#111827', color: '#fff',
        borderRadius: 10, fontSize: 14, fontWeight: 600,
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
    },

    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 },
    statCard: { display: 'flex', gap: 14, alignItems: 'center', padding: 20, background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB' },
    statIcon: { width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 },
    statLabel: { fontSize: 12, color: '#6B7280', fontWeight: 700, marginBottom: 4 },
    statValue: { fontSize: 28, fontWeight: 800, letterSpacing: -0.5 },

    filterBar: { display: 'flex', gap: 16, padding: 16, background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' },
    searchWrap: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB', flex: 1, minWidth: 240 },
    searchIcon: { color: '#6B7280', fontSize: 16 },
    searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent' },
    filterChips: { display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
    chip: { padding: '8px 14px', background: '#F3F4F6', color: '#6B7280', border: 'none', borderRadius: 100, fontSize: 12, fontWeight: 700, cursor: 'pointer' },
    chipActive: { background: '#4F46E5', color: '#fff' },

    empty: { textAlign: 'center', padding: 80, background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB' },

    messagesList: { display: 'flex', flexDirection: 'column', gap: 12 },
    msgCard: {
        display: 'flex', gap: 16, padding: 20, borderRadius: 12,
        border: '1px solid #E5E7EB', borderLeft: '4px solid',
        transition: 'all 0.2s'
    },
    msgLeft: { flexShrink: 0 },
    msgAvatar: {
        width: 48, height: 48, borderRadius: '50%',
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, fontWeight: 800
    },
    msgContent: { flex: 1 },
    msgHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 8 },
    msgName: { fontSize: 15, fontWeight: 800, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 },
    newBadge: { background: '#EF4444', color: '#fff', padding: '2px 8px', borderRadius: 100, fontSize: 9, fontWeight: 800, letterSpacing: 0.5 },
    msgMeta: { display: 'flex', gap: 14, fontSize: 11, color: '#6B7280', marginTop: 4, flexWrap: 'wrap' },
    statusBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' },
    msgSubject: { fontSize: 13, color: '#374151', marginBottom: 8 },
    msgPreview: { fontSize: 13, color: '#6B7280', lineHeight: 1.6, marginBottom: 12 },
    msgActions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
    actionBtn: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
    viewBtn: { background: '#4F46E5', color: '#fff' },
    resolveBtn: { background: '#10B981', color: '#fff' },
    deleteBtn: { background: '#FEE2E2', color: '#DC2626' },

    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 },
    modalContent: { background: '#fff', borderRadius: 16, width: '100%', maxWidth: 700, maxHeight: '90vh', display: 'flex', flexDirection: 'column' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: 24, borderBottom: '1px solid #E5E7EB' },
    modalTitle: { fontSize: 18, fontWeight: 800, color: '#111827' },
    modalClose: { width: 32, height: 32, background: '#F3F4F6', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modalBody: { padding: 24, overflow: 'auto', flex: 1 },
    senderCard: { display: 'flex', gap: 14, alignItems: 'center', padding: 16, background: '#F9FAFB', borderRadius: 12, marginBottom: 20 },
    senderAvatar: { width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800 },
    fieldLabel: { fontSize: 12, fontWeight: 800, color: '#374151', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    subjectBox: { marginBottom: 18 },
    subjectText: { padding: '12px 16px', background: '#F9FAFB', borderRadius: 8, fontSize: 14, fontWeight: 700, color: '#111827' },
    messageBox: { marginBottom: 18 },
    messageText: { padding: 16, background: '#F9FAFB', borderRadius: 8, fontSize: 13, color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap' },
    replyBox: { marginBottom: 18, padding: 16, background: '#F0FDF4', borderRadius: 10, border: '1px solid #86EFAC' },
    replyText: { fontSize: 13, color: '#065F46', lineHeight: 1.7, whiteSpace: 'pre-wrap' },
    replyForm: { marginTop: 20 },
    replyTextarea: { width: '100%', padding: '12px 16px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', minHeight: 120, outline: 'none' },
    modalFooter: { display: 'flex', gap: 10, padding: 20, borderTop: '1px solid #E5E7EB' },
    footerBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '12px 20px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
    footerDelete: { background: '#FEE2E2', color: '#DC2626' },
    footerResolve: { background: '#10B981', color: '#fff' },
    footerReply: { background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)', color: '#fff', flex: 1, justifyContent: 'center' }
};

export default AdminMessages;