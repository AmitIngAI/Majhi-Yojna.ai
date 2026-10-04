import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, userAPI } from '../../services/api';
import {
    FiUser, FiLock, FiSave, FiMail, FiPhone,
    FiEye, FiEyeOff, FiShield, FiSettings
} from 'react-icons/fi';

const AdminSettings = () => {
    const { user, updateUser } = useAuth();
    const [tab, setTab] = useState('profile');
    const [msg, setMsg] = useState('');
    const [msgType, setMsgType] = useState('success');

    const [profile, setProfile] = useState({
        fullName: '', email: '', mobile: ''
    });

    const [pwd, setPwd] = useState({
        oldPassword: '', newPassword: '', confirmPassword: ''
    });

    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConf, setShowConf] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const res = await userAPI.getProfile();
            const d = res.data?.data || res.data || {};
            setProfile({
                fullName: d.fullName || '',
                email: d.email || '',
                mobile: d.mobile || ''
            });
        } catch (err) { console.error(err); }
    };

    const showMsg = (message, type = 'success') => {
        setMsg(message);
        setMsgType(type);
        setTimeout(() => setMsg(''), 3000);
    };

    const handleProfileSave = async () => {
        if (!profile.fullName) return showMsg('Name required', 'error');
        setSaving(true);
        try {
            await authAPI.updateAdminProfile({
                fullName: profile.fullName,
                mobile: profile.mobile
            });
            updateUser({ ...user, fullName: profile.fullName });
            showMsg('✓ Profile updated successfully');
        } catch (err) {
            showMsg('❌ Update failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSave = async () => {
        if (!pwd.oldPassword) return showMsg('Old password required', 'error');
        if (pwd.newPassword.length < 6) return showMsg('Password must be at least 6 characters', 'error');
        if (pwd.newPassword !== pwd.confirmPassword) return showMsg('Passwords do not match', 'error');

        setSaving(true);
        try {
            const res = await authAPI.changePassword({
                oldPassword: pwd.oldPassword,
                newPassword: pwd.newPassword
            });
            if (res.data.success) {
                showMsg('✓ Password changed successfully');
                setPwd({ oldPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                showMsg('❌ ' + res.data.message, 'error');
            }
        } catch (err) {
            showMsg('❌ ' + (err.response?.data?.message || 'Failed'), 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={s.wrap}>
            <div style={s.header}>
                <h1 style={s.title}><FiSettings style={{ marginRight: 10 }} />Admin Settings</h1>
                <p style={s.desc}>Manage your account settings and preferences</p>
            </div>

            {msg && (
                <div style={{
                    ...s.msgBar,
                    background: msgType === 'success' ? '#D1FAE5' : '#FEE2E2',
                    color: msgType === 'success' ? '#065F46' : '#991B1B'
                }}>{msg}</div>
            )}

            <div style={s.tabsCard}>
                <button onClick={() => setTab('profile')}
                    style={{ ...s.tab, ...(tab === 'profile' ? s.tabActive : {}) }}>
                    <FiUser /> Profile Info
                </button>
                <button onClick={() => setTab('password')}
                    style={{ ...s.tab, ...(tab === 'password' ? s.tabActive : {}) }}>
                    <FiLock /> Change Password
                </button>
                <button onClick={() => setTab('security')}
                    style={{ ...s.tab, ...(tab === 'security' ? s.tabActive : {}) }}>
                    <FiShield /> Security
                </button>
            </div>

            {tab === 'profile' && (
                <div style={s.card}>
                    <h3 style={s.cardTitle}>Profile Information</h3>
                    <p style={s.cardDesc}>Update your personal information</p>
                    <div style={s.form}>
                        <Field label="Full Name" icon={<FiUser />} value={profile.fullName}
                            onChange={v => setProfile({ ...profile, fullName: v })} />
                        <Field label="Email (cannot be changed)" icon={<FiMail />} value={profile.email} disabled />
                        <Field label="Mobile Number" icon={<FiPhone />} value={profile.mobile}
                            onChange={v => setProfile({ ...profile, mobile: v })} />
                        <button onClick={handleProfileSave} disabled={saving} style={s.saveBtn}>
                            <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            )}

            {tab === 'password' && (
                <div style={s.card}>
                    <h3 style={s.cardTitle}>Change Password</h3>
                    <p style={s.cardDesc}>Update your password to keep account secure</p>
                    <div style={s.form}>
                        <Field label="Current Password" icon={<FiLock />} type={showOld ? 'text' : 'password'}
                            value={pwd.oldPassword} onChange={v => setPwd({ ...pwd, oldPassword: v })}
                            rightIcon={<button onClick={() => setShowOld(!showOld)} style={s.eyeBtn}>{showOld ? <FiEyeOff /> : <FiEye />}</button>} />
                        <Field label="New Password (min 6 chars)" icon={<FiLock />} type={showNew ? 'text' : 'password'}
                            value={pwd.newPassword} onChange={v => setPwd({ ...pwd, newPassword: v })}
                            rightIcon={<button onClick={() => setShowNew(!showNew)} style={s.eyeBtn}>{showNew ? <FiEyeOff /> : <FiEye />}</button>} />
                        <Field label="Confirm New Password" icon={<FiLock />} type={showConf ? 'text' : 'password'}
                            value={pwd.confirmPassword} onChange={v => setPwd({ ...pwd, confirmPassword: v })}
                            rightIcon={<button onClick={() => setShowConf(!showConf)} style={s.eyeBtn}>{showConf ? <FiEyeOff /> : <FiEye />}</button>} />
                        <button onClick={handlePasswordSave} disabled={saving} style={s.saveBtn}>
                            <FiSave /> {saving ? 'Updating...' : 'Change Password'}
                        </button>
                    </div>
                </div>
            )}

            {tab === 'security' && (
                <div style={s.card}>
                    <h3 style={s.cardTitle}>Security & Account Info</h3>
                    <div style={s.securityGrid}>
                        <SecurityItem icon="🔐" title="Account Role" value={user?.role || 'ADMIN'} />
                        <SecurityItem icon="✅" title="Account Status" value="Active" color="#10B981" />
                        <SecurityItem icon="🛡️" title="2FA Status" value="Not enabled" color="#F59E0B" />
                        <SecurityItem icon="📧" title="Email Verified" value="Yes" color="#10B981" />
                        <SecurityItem icon="🕐" title="Last Login" value="Recently" />
                        <SecurityItem icon="🔑" title="Session Type" value="JWT Token" />
                    </div>
                </div>
            )}
        </div>
    );
};

const Field = ({ label, icon, type = 'text', value, onChange, disabled, rightIcon }) => (
    <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>{label}</label>
        <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '0 12px', background: disabled ? '#F3F4F6' : '#fff' }}>
            <span style={{ color: '#6B7280', marginRight: 8 }}>{icon}</span>
            <input type={type} value={value || ''} onChange={(e) => onChange && onChange(e.target.value)}
                disabled={disabled}
                style={{ flex: 1, padding: '12px 0', border: 'none', outline: 'none', fontSize: 14, background: 'transparent' }} />
            {rightIcon}
        </div>
    </div>
);

const SecurityItem = ({ icon, title, value, color = '#111827' }) => (
    <div style={{ padding: 16, background: '#F9FAFB', borderRadius: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ fontSize: 28 }}>{icon}</div>
        <div>
            <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 700, marginBottom: 2 }}>{title}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color }}>{value}</div>
        </div>
    </div>
);

const s = {
    wrap: { padding: '20px 0', maxWidth: 900, margin: '0 auto' },
    header: { marginBottom: 24 },
    title: { fontSize: 28, fontWeight: 800, color: '#111827', display: 'flex', alignItems: 'center' },
    desc: { fontSize: 14, color: '#6B7280', marginTop: 4 },
    msgBar: { padding: 14, borderRadius: 10, marginBottom: 16, fontWeight: 600 },
    tabsCard: { display: 'flex', gap: 4, background: '#fff', padding: 8, borderRadius: 12, border: '1px solid #E5E7EB', marginBottom: 20 },
    tab: { flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', background: 'transparent', color: '#6B7280', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' },
    tabActive: { background: '#4F46E5', color: '#fff' },
    card: { background: '#fff', padding: 30, borderRadius: 16, border: '1px solid #E5E7EB' },
    cardTitle: { fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 6 },
    cardDesc: { fontSize: 13, color: '#6B7280', marginBottom: 24 },
    form: { maxWidth: 500 },
    saveBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)', color: '#fff', padding: '12px 28px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 10 },
    eyeBtn: { background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280', display: 'flex', alignItems: 'center' },
    securityGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }
};

export default AdminSettings;