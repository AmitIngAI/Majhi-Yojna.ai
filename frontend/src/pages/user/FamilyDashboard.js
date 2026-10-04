import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { schemeAPI } from '../../services/api';
import {
    FiPlus, FiEdit2, FiTrash2, FiUsers, FiTarget,
    FiDollarSign, FiAward, FiArrowRight, FiX, FiCheckCircle
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';

const FamilyDashboard = () => {
    const { user } = useAuth();
    const [members, setMembers] = useState([]);
    const [allSchemes, setAllSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);

    // Form state
    const [form, setForm] = useState({
        name: '', relation: 'Spouse', age: '', gender: 'Male',
        occupation: 'Student', category: 'General', annualIncome: '', isBpl: false
    });

    useEffect(() => {
        loadMembers();
        fetchSchemes();
    }, []);

    const loadMembers = () => {
        // Store in localStorage for now (can be moved to backend later)
        const saved = localStorage.getItem(`family_${user?.userId}`);
        if (saved) {
            const list = JSON.parse(saved);
            setMembers(list);
            if (list.length > 0) setSelectedMember(list[0]);
        }
    };

    const saveMembers = (list) => {
        localStorage.setItem(`family_${user?.userId}`, JSON.stringify(list));
        setMembers(list);
    };

    const fetchSchemes = async () => {
        try {
            const res = await schemeAPI.getAll();
            setAllSchemes(res.data?.data || res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setForm({
            name: '', relation: 'Spouse', age: '', gender: 'Male',
            occupation: 'Student', category: 'General', annualIncome: '', isBpl: false
        });
        setEditingMember(null);
        setShowModal(true);
    };

    const openEditModal = (member) => {
        setForm(member);
        setEditingMember(member);
        setShowModal(true);
    };

    const handleSave = () => {
        if (!form.name || !form.age) {
            alert('Please fill name and age');
            return;
        }
        const memberData = {
            ...form,
            id: editingMember?.id || Date.now(),
            age: parseInt(form.age),
            annualIncome: parseInt(form.annualIncome) || 0
        };
        let newList;
        if (editingMember) {
            newList = members.map(m => m.id === editingMember.id ? memberData : m);
        } else {
            newList = [...members, memberData];
        }
        saveMembers(newList);
        if (!selectedMember) setSelectedMember(memberData);
        setShowModal(false);
    };

    const handleDelete = (id) => {
        if (!window.confirm('Remove this family member?')) return;
        const newList = members.filter(m => m.id !== id);
        saveMembers(newList);
        if (selectedMember?.id === id) setSelectedMember(newList[0] || null);
    };

    // Get eligible schemes for a member
    const getMemberSchemes = (member) => {
        if (!member) return [];
        return allSchemes.filter(s => {
            const ageOk = member.age >= (s.ageMin || 0) && member.age <= (s.ageMax || 100);
            const incomeOk = !s.incomeLimit || member.annualIncome <= parseFloat(s.incomeLimit);
            const genderOk = !s.genderRequired || s.genderRequired === 'All' || s.genderRequired === member.gender;
            const catOk = !s.categoryRequired || s.categoryRequired === 'All' || s.categoryRequired.includes(member.category);
            const occOk = !s.occupationRequired || s.occupationRequired === 'Any' || s.occupationRequired === 'All' || s.occupationRequired === member.occupation;
            return ageOk && incomeOk && genderOk && catOk && occOk;
        });
    };

    // Calculate estimated benefits
    const estimateBenefits = (schemes) => {
        // Estimate ₹20K per scheme on average
        return schemes.length * 20000;
    };

    // Calculate totals
    const totalMembers = members.length;
    const totalEligible = members.reduce((sum, m) => sum + getMemberSchemes(m).length, 0);
    const totalBenefits = members.reduce((sum, m) => sum + estimateBenefits(getMemberSchemes(m)), 0);
    const highPrioritySchemes = members.reduce((sum, m) => {
        return sum + getMemberSchemes(m).filter(s =>
            s.category?.toLowerCase().includes('health') ||
            s.schemeName?.toLowerCase().includes('housing') ||
            s.schemeName?.toLowerCase().includes('education')
        ).length;
    }, 0);

    const getAvatar = (member) => {
        const emojis = {
            'Spouse': '💑', 'Son': '👦', 'Daughter': '👧',
            'Father': '👨', 'Mother': '👩', 'Brother': '🧑',
            'Sister': '👱‍♀️', 'Grandfather': '👴', 'Grandmother': '👵'
        };
        return emojis[member.relation] || '👤';
    };

    if (loading) {
        return (
            <div style={styles.loadingWrap}>
                <div style={styles.spinner}></div>
                <p>Loading family dashboard...</p>
            </div>
        );
    }

    return (
        <div style={styles.wrapper}>
            {/* HEADER + ADD BUTTON */}
            <div style={styles.topBar}>
                <button onClick={openAddModal} style={styles.addBtn}>
                    <FiPlus /> Add Family Member
                </button>
            </div>

            {/* STATS */}
            <div style={styles.statsGrid}>
                <StatCard icon={<FiUsers />} value={totalMembers} label="Total Family Members" color="#4F46E5" bg="#EEF2FF" />
                <StatCard icon={<FiTarget />} value={totalEligible} label="Total Eligible Schemes" color="#F97316" bg="#FFF7ED" />
                <StatCard icon={<FiDollarSign />} value={`₹${(totalBenefits / 1000).toFixed(1)}K`} label="Total Family Benefits" color="#10B981" bg="#F0FDF4" />
                <StatCard icon={<FiAward />} value={highPrioritySchemes} label="High Priority Schemes" color="#EC4899" bg="#FDF2F8" />
            </div>

            {members.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>👨‍👩‍👧‍👦</div>
                    <h2 style={styles.emptyTitle}>No Family Members Added</h2>
                    <p style={styles.emptyDesc}>
                        Add your family members to check schemes they're eligible for and maximize your family benefits
                    </p>
                    <button onClick={openAddModal} style={styles.primaryBtn}>
                        <FiPlus style={{ marginRight: 8 }} /> Add First Member
                    </button>
                </div>
            ) : (
                <div style={styles.mainGrid}>
                    {/* LEFT: Members List */}
                    <div style={styles.leftPanel}>
                        <div style={styles.panelHeader}>
                            <h3 style={styles.panelTitle}>Family Members</h3>
                            <button onClick={openAddModal} style={styles.miniAddBtn}>
                                <FiPlus /> Add
                            </button>
                        </div>
                        <div style={styles.membersList}>
                            {members.map(m => {
                                const schemes = getMemberSchemes(m);
                                const benefits = estimateBenefits(schemes);
                                const isSelected = selectedMember?.id === m.id;
                                return (
                                    <div key={m.id}
                                        onClick={() => setSelectedMember(m)}
                                        style={{
                                            ...styles.memberCard,
                                            ...(isSelected ? styles.memberCardActive : {})
                                        }}>
                                        <div style={styles.memberAvatar}>{getAvatar(m)}</div>
                                        <div style={styles.memberInfo}>
                                            <h4 style={styles.memberName}>{m.name}</h4>
                                            <p style={styles.memberMeta}>
                                                {m.relation} • {m.age}y • {m.occupation}
                                            </p>
                                            <div style={styles.memberStats}>
                                                <span style={styles.memberStat}>
                                                    <FiCheckCircle style={{ color: '#10B981' }} /> {schemes.length} eligible
                                                </span>
                                                <span style={styles.memberBenefit}>
                                                    💰 ₹{(benefits / 1000).toFixed(0)}K
                                                </span>
                                            </div>
                                        </div>
                                        <div style={styles.memberActions}>
                                            <button onClick={(e) => { e.stopPropagation(); openEditModal(m); }} style={styles.iconBtn}>
                                                <FiEdit2 />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }}
                                                style={{ ...styles.iconBtn, background: '#FEE2E2', color: '#EF4444' }}>
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* RIGHT: Selected Member Details */}
                    <div style={styles.rightPanel}>
                        {selectedMember ? (
                            <>
                                <div style={styles.detailHeader}>
                                    <h3 style={styles.panelTitle}>Scheme Summary by Member</h3>
                                    <p style={styles.detailSubtitle}>Real schemes matched from database</p>
                                </div>

                                <div style={styles.selectedMemberCard}>
                                    <div style={styles.selectedAvatar}>{getAvatar(selectedMember)}</div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={styles.selectedName}>{selectedMember.name}</h3>
                                        <p style={styles.selectedRelation}>{selectedMember.relation}</p>
                                    </div>
                                    <div style={styles.selectedStats}>
                                        <div style={styles.selectedBenefit}>
                                            ₹{(estimateBenefits(getMemberSchemes(selectedMember)) / 1000).toFixed(0)}K
                                        </div>
                                        <div style={styles.selectedCount}>
                                            {getMemberSchemes(selectedMember).length} schemes
                                        </div>
                                    </div>
                                </div>

                                <h4 style={styles.eligibleHeader}>
                                    Real Eligible Schemes ({getMemberSchemes(selectedMember).length}):
                                </h4>
                                {getMemberSchemes(selectedMember).length === 0 ? (
                                    <div style={styles.emptyBox}>
                                        <p>No eligible schemes for this member's profile</p>
                                    </div>
                                ) : (
                                    <div style={styles.schemesList}>
                                        {getMemberSchemes(selectedMember).slice(0, 8).map((s, i) => (
                                            <Link key={i} to={`/user/schemes/${s.id}`} style={styles.schemeItem}>
                                                <FiCheckCircle style={{ color: '#10B981' }} />
                                                <span style={{ flex: 1 }}>{s.schemeName}</span>
                                                <FiArrowRight />
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                <div style={styles.totalBox}>
                                    <div>
                                        <div style={styles.totalLabel}>Total Family Benefits (Estimated)</div>
                                        <div style={styles.totalValue}>
                                            ₹{(totalBenefits / 1000).toFixed(1)}K / year
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 36 }}>💰</div>
                                </div>
                            </>
                        ) : (
                            <p style={{ textAlign: 'center', color: '#6B7280', padding: 40 }}>
                                Select a family member to see their eligible schemes
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* ADD/EDIT MODAL */}
            {showModal && (
                <div style={styles.modal} onClick={() => setShowModal(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>
                                {editingMember ? '✏️ Edit Member' : '➕ Add Family Member'}
                            </h3>
                            <button onClick={() => setShowModal(false)} style={styles.modalClose}>
                                <FiX />
                            </button>
                        </div>
                        <div style={styles.modalBody}>
                            <FormInput label="Full Name *" value={form.name}
                                onChange={v => setForm({ ...form, name: v })} placeholder="Enter name" />
                            <FormSelect label="Relation" value={form.relation}
                                onChange={v => setForm({ ...form, relation: v })}
                                options={['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Grandfather', 'Grandmother']} />
                            <FormInput label="Age *" type="number" value={form.age}
                                onChange={v => setForm({ ...form, age: v })} placeholder="Age in years" />
                            <FormSelect label="Gender" value={form.gender}
                                onChange={v => setForm({ ...form, gender: v })}
                                options={['Male', 'Female', 'Other']} />
                            <FormSelect label="Occupation" value={form.occupation}
                                onChange={v => setForm({ ...form, occupation: v })}
                                options={['Student', 'Farmer', 'Unemployed', 'Small Business Owner', 'Daily Wage Worker', 'Homemaker', 'Retired', 'Private Employee', 'Government Employee']} />
                            <FormSelect label="Category" value={form.category}
                                onChange={v => setForm({ ...form, category: v })}
                                options={['General', 'OBC', 'SC', 'ST', 'NT', 'VJ', 'EWS']} />
                            <FormInput label="Annual Income (₹)" type="number" value={form.annualIncome}
                                onChange={v => setForm({ ...form, annualIncome: v })} placeholder="Annual income" />
                        </div>
                        <div style={styles.modalFooter}>
                            <button onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancel</button>
                            <button onClick={handleSave} style={styles.saveBtn}>
                                {editingMember ? 'Update' : 'Add Member'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ icon, value, label, color, bg }) => (
    <div style={styles.statCard}>
        <div style={{ ...styles.statIcon, background: bg, color }}>{icon}</div>
        <div style={styles.statValue}>{value}</div>
        <div style={styles.statLabel}>{label}</div>
    </div>
);

const FormInput = ({ label, type = 'text', value, onChange, placeholder }) => (
    <div style={styles.formGroup}>
        <label style={styles.formLabel}>{label}</label>
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder} style={styles.formInput} />
    </div>
);

const FormSelect = ({ label, value, onChange, options }) => (
    <div style={styles.formGroup}>
        <label style={styles.formLabel}>{label}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)} style={styles.formInput}>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    </div>
);

const styles = {
    wrapper: { padding: '20px 0', maxWidth: 1400, margin: '0 auto' },
    loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 80, gap: 16 },
    spinner: { width: 48, height: 48, border: '4px solid #E5E7EB', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },

    topBar: { display: 'flex', justifyContent: 'flex-end', marginBottom: 20 },
    addBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)', color: '#ffffff', padding: '12px 24px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 20px rgba(79,70,229,0.35)' },

    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
    statCard: { background: '#ffffff', padding: 20, borderRadius: 14, border: '1px solid #E5E7EB' },
    statIcon: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14 },
    statValue: { fontSize: 32, fontWeight: 800, color: '#111827', marginBottom: 4 },
    statLabel: { fontSize: 12, color: '#6B7280', fontWeight: 700 },

    emptyState: { textAlign: 'center', padding: 80, background: '#ffffff', borderRadius: 20, border: '1px solid #E5E7EB' },
    emptyIcon: { fontSize: 80, marginBottom: 20 },
    emptyTitle: { fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 10 },
    emptyDesc: { fontSize: 14, color: '#6B7280', marginBottom: 24, maxWidth: 500, margin: '0 auto 24px' },
    primaryBtn: { display: 'inline-flex', alignItems: 'center', background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)', color: '#ffffff', padding: '14px 28px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' },

    mainGrid: { display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 20 },
    leftPanel: { background: '#ffffff', padding: 20, borderRadius: 16, border: '1px solid #E5E7EB' },
    rightPanel: { background: '#ffffff', padding: 20, borderRadius: 16, border: '1px solid #E5E7EB' },
    panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    panelTitle: { fontSize: 16, fontWeight: 800, color: '#111827' },
    miniAddBtn: { display: 'inline-flex', alignItems: 'center', gap: 4, background: '#EEF2FF', color: '#4F46E5', padding: '6px 12px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' },

    membersList: { display: 'flex', flexDirection: 'column', gap: 12 },
    memberCard: { display: 'flex', gap: 12, padding: 14, background: '#F9FAFB', borderRadius: 12, border: '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s' },
    memberCardActive: { background: '#EEF2FF', borderColor: '#4F46E5' },
    memberAvatar: { fontSize: 40, flexShrink: 0 },
    memberInfo: { flex: 1 },
    memberName: { fontSize: 14, fontWeight: 800, color: '#111827', marginBottom: 4 },
    memberMeta: { fontSize: 12, color: '#6B7280', marginBottom: 6 },
    memberStats: { display: 'flex', gap: 10, fontSize: 11 },
    memberStat: { display: 'flex', alignItems: 'center', gap: 4, color: '#10B981', fontWeight: 700 },
    memberBenefit: { color: '#F97316', fontWeight: 700 },
    memberActions: { display: 'flex', flexDirection: 'column', gap: 4 },
    iconBtn: { width: 28, height: 28, background: '#EEF2FF', color: '#4F46E5', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 },

    detailHeader: { marginBottom: 16 },
    detailSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 4 },
    selectedMemberCard: { display: 'flex', gap: 14, alignItems: 'center', padding: 16, background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)', borderRadius: 12, marginBottom: 16 },
    selectedAvatar: { fontSize: 40 },
    selectedName: { fontSize: 18, fontWeight: 800, color: '#111827' },
    selectedRelation: { fontSize: 13, color: '#6B7280' },
    selectedStats: { textAlign: 'right' },
    selectedBenefit: { fontSize: 20, fontWeight: 800, color: '#10B981' },
    selectedCount: { fontSize: 11, color: '#6B7280', fontWeight: 700 },

    eligibleHeader: { fontSize: 13, fontWeight: 800, color: '#374151', marginBottom: 12 },
    schemesList: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 },
    schemeItem: { display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: '#F9FAFB', borderRadius: 8, textDecoration: 'none', color: '#111827', fontSize: 13, fontWeight: 600 },
    emptyBox: { textAlign: 'center', padding: 30, background: '#F9FAFB', borderRadius: 12 },

    totalBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 18, background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)', borderRadius: 12, border: '1px solid #86EFAC' },
    totalLabel: { fontSize: 12, color: '#065F46', fontWeight: 700, marginBottom: 4 },
    totalValue: { fontSize: 22, fontWeight: 800, color: '#059669' },

    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 },
    modalContent: { background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 500, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottom: '1px solid #E5E7EB' },
    modalTitle: { fontSize: 18, fontWeight: 800, color: '#111827' },
    modalClose: { width: 32, height: 32, background: '#F3F4F6', border: 'none', borderRadius: 8, cursor: 'pointer' },
    modalBody: { flex: 1, overflow: 'auto', padding: 20, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 },
    modalFooter: { display: 'flex', gap: 10, padding: 20, borderTop: '1px solid #E5E7EB' },
    cancelBtn: { flex: 1, padding: '12px 20px', background: '#F3F4F6', color: '#111827', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
    saveBtn: { flex: 1, padding: '12px 20px', background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)', color: '#ffffff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
    formLabel: { fontSize: 12, fontWeight: 700, color: '#374151' },
    formInput: { padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none' }
};

export default FamilyDashboard;