import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import {
    FiSearch, FiEye, FiTrash2, FiUserX, FiUserCheck,
    FiX, FiMail, FiPhone, FiMapPin, FiUser
} from 'react-icons/fi';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [viewUser, setViewUser] = useState(null);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const res = await adminAPI.getAllUsers();
            setUsers(res.data?.data || res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        const action = currentStatus === 'Active' ? 'block' : 'unblock';
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
        try {
            await adminAPI.toggleUserStatus(userId);
            setMsg(`✓ User ${action}ed successfully`);
            setTimeout(() => setMsg(''), 3000);
            loadUsers();
        } catch (err) {
            setMsg('❌ Action failed');
            setTimeout(() => setMsg(''), 3000);
        }
    };

    const handleDelete = async (userId, name) => {
        if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
        try {
            await adminAPI.deleteUser(userId);
            setMsg(`✓ User "${name}" deleted`);
            setTimeout(() => setMsg(''), 3000);
            loadUsers();
        } catch (err) {
            setMsg('❌ Delete failed');
            setTimeout(() => setMsg(''), 3000);
        }
    };

    const filteredUsers = users.filter(u =>
        !search ||
        u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.mobile?.includes(search)
    );

    if (loading) {
        return (
            <div style={s.loading}>
                <div style={s.spinner}></div>
                <p>Loading users...</p>
            </div>
        );
    }

    return (
        <div style={s.wrap}>
            <div style={s.header}>
                <div>
                    <h1 style={s.title}>User Management</h1>
                    <p style={s.desc}>Total: {users.length} users • Active: {users.filter(u => u.status === 'Active').length} • Blocked: {users.filter(u => u.status === 'Blocked').length}</p>
                </div>
            </div>

            {msg && <div style={s.msgBar}>{msg}</div>}

            <div style={s.card}>
                <div style={s.searchBar}>
                    <FiSearch style={s.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by name, email or mobile..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={s.searchInput}
                    />
                </div>

                <div style={s.tableWrap}>
                    <table style={s.table}>
                        <thead>
                            <tr>
                                <th style={s.th}>Name</th>
                                <th style={s.th}>Email</th>
                                <th style={s.th}>Role</th>
                                <th style={s.th}>Status</th>
                                <th style={s.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((u) => (
                                <tr key={u.id} style={s.tr}>
                                    <td style={s.td}>
                                        <div style={s.userCell}>
                                            <div style={s.avatar}>{u.fullName?.charAt(0)?.toUpperCase()}</div>
                                            <span style={s.userName}>{u.fullName}</span>
                                        </div>
                                    </td>
                                    <td style={s.td}>{u.email}</td>
                                    <td style={s.td}>
                                        <span style={{
                                            ...s.roleBadge,
                                            background: u.role === 'ADMIN' ? '#FEF3C7' : '#DBEAFE',
                                            color: u.role === 'ADMIN' ? '#92400E' : '#1E40AF'
                                        }}>{u.role}</span>
                                    </td>
                                    <td style={s.td}>
                                        <span style={{
                                            ...s.statusBadge,
                                            background: u.status === 'Active' ? '#D1FAE5' : '#FEE2E2',
                                            color: u.status === 'Active' ? '#065F46' : '#991B1B'
                                        }}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td style={s.td}>
                                        <div style={s.actions}>
                                            <button onClick={() => setViewUser(u)}
                                                style={{ ...s.actionBtn, ...s.viewBtn }} title="View">
                                                <FiEye /> View
                                            </button>
                                            {u.role !== 'ADMIN' && (
                                                <>
                                                    <button onClick={() => handleToggleStatus(u.id, u.status)}
                                                        style={{
                                                            ...s.actionBtn,
                                                            background: u.status === 'Active' ? '#FEF3C7' : '#D1FAE5',
                                                            color: u.status === 'Active' ? '#92400E' : '#065F46'
                                                        }}>
                                                        {u.status === 'Active' ? <><FiUserX /> Block</> : <><FiUserCheck /> Unblock</>}
                                                    </button>
                                                    <button onClick={() => handleDelete(u.id, u.fullName)}
                                                        style={{ ...s.actionBtn, ...s.deleteBtn }}>
                                                        <FiTrash2 /> Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div style={s.empty}>No users found</div>
                )}
            </div>

            {/* View Modal */}
            {viewUser && (
                <div style={s.modal} onClick={() => setViewUser(null)}>
                    <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={s.modalHeader}>
                            <h3 style={s.modalTitle}>User Details</h3>
                            <button onClick={() => setViewUser(null)} style={s.modalClose}><FiX /></button>
                        </div>
                        <div style={s.modalBody}>
                            <div style={s.userProfileTop}>
                                <div style={s.avatarLg}>{viewUser.fullName?.charAt(0)?.toUpperCase()}</div>
                                <div>
                                    <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>{viewUser.fullName}</h2>
                                    <p style={{ fontSize: 13, color: '#6B7280' }}>{viewUser.role} • {viewUser.status}</p>
                                </div>
                            </div>
                            <div style={s.detailsGrid}>
                                <DetailRow icon={<FiMail />} label="Email" value={viewUser.email} />
                                <DetailRow icon={<FiPhone />} label="Mobile" value={viewUser.mobile} />
                                <DetailRow icon={<FiUser />} label="Age" value={viewUser.age || 'N/A'} />
                                <DetailRow icon={<FiUser />} label="Gender" value={viewUser.gender || 'N/A'} />
                                <DetailRow icon={<FiMapPin />} label="District" value={viewUser.district || 'N/A'} />
                                <DetailRow icon={<FiUser />} label="Category" value={viewUser.category || 'N/A'} />
                                <DetailRow icon={<FiUser />} label="Occupation" value={viewUser.occupation || 'N/A'} />
                                <DetailRow icon={<FiUser />} label="Income" value={viewUser.annualIncome ? `₹${Number(viewUser.annualIncome).toLocaleString('en-IN')}` : 'N/A'} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const DetailRow = ({ icon, label, value }) => (
    <div style={s.detailRow}>
        <div style={s.detailIcon}>{icon}</div>
        <div>
            <div style={s.detailLabel}>{label}</div>
            <div style={s.detailValue}>{value}</div>
        </div>
    </div>
);

const s = {
    wrap: { padding: '20px 0', maxWidth: 1400, margin: '0 auto' },
    loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 80, gap: 16 },
    spinner: { width: 48, height: 48, border: '4px solid #E5E7EB', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    header: { marginBottom: 24 },
    title: { fontSize: 28, fontWeight: 800, color: '#111827', marginBottom: 6 },
    desc: { fontSize: 14, color: '#6B7280' },
    msgBar: { padding: 14, background: '#D1FAE5', color: '#065F46', borderRadius: 10, marginBottom: 16, fontWeight: 600 },
    card: { background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden' },
    searchBar: { display: 'flex', alignItems: 'center', gap: 10, padding: 20, borderBottom: '1px solid #F3F4F6' },
    searchIcon: { color: '#6B7280', fontSize: 18 },
    searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: 14 },
    tableWrap: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: 16, textAlign: 'left', background: '#F9FAFB', fontSize: 12, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #E5E7EB' },
    tr: { borderBottom: '1px solid #F3F4F6' },
    td: { padding: 16, fontSize: 14, color: '#111827' },
    userCell: { display: 'flex', alignItems: 'center', gap: 12 },
    avatar: { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 },
    userName: { fontWeight: 700 },
    roleBadge: { padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700 },
    statusBadge: { padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 700 },
    actions: { display: 'flex', gap: 6, flexWrap: 'wrap' },
    actionBtn: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
    viewBtn: { background: '#EEF2FF', color: '#4F46E5' },
    deleteBtn: { background: '#FEE2E2', color: '#DC2626' },
    empty: { textAlign: 'center', padding: 40, color: '#6B7280' },

    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 },
    modalContent: { background: '#fff', borderRadius: 16, width: '100%', maxWidth: 600, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottom: '1px solid #E5E7EB' },
    modalTitle: { fontSize: 18, fontWeight: 800 },
    modalClose: { width: 32, height: 32, background: '#F3F4F6', border: 'none', borderRadius: 8, cursor: 'pointer' },
    modalBody: { padding: 24, overflow: 'auto' },
    userProfileTop: { display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #F3F4F6' },
    avatarLg: { width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800 },
    detailsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 },
    detailRow: { display: 'flex', gap: 12, padding: 14, background: '#F9FAFB', borderRadius: 10 },
    detailIcon: { width: 36, height: 36, background: '#EEF2FF', color: '#4F46E5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    detailLabel: { fontSize: 11, color: '#6B7280', fontWeight: 700, marginBottom: 2 },
    detailValue: { fontSize: 13, fontWeight: 700, color: '#111827' }
};

export default AdminUsers;