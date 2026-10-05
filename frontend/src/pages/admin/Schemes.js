import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import useMediaQuery from '../../utils/useMediaQuery';
import {
    FiPlus, FiSearch, FiEye, FiEdit2, FiTrash2, FiX,
    FiCheckCircle, FiFileText
} from 'react-icons/fi';
import { FaIdCard } from 'react-icons/fa';

// ─── PREDEFINED DOCUMENTS LIST ───
const ALL_DOCUMENTS = [
    { id: 'aadhaar', name: 'Aadhaar Card', icon: '🆔', category: 'Identity' },
    { id: 'pan', name: 'PAN Card', icon: '💳', category: 'Identity' },
    { id: 'voter', name: 'Voter ID Card', icon: '🗳️', category: 'Identity' },
    { id: 'driving', name: 'Driving License', icon: '🚗', category: 'Identity' },
    { id: 'passport', name: 'Passport', icon: '📘', category: 'Identity' },

    { id: 'ration', name: 'Ration Card', icon: '📋', category: 'Family' },
    { id: 'bpl', name: 'BPL Card', icon: '💰', category: 'Family' },
    { id: 'family', name: 'Family Certificate', icon: '👨‍👩‍👧', category: 'Family' },

    { id: 'income', name: 'Income Certificate', icon: '💵', category: 'Financial' },
    { id: 'salary', name: 'Salary Slip (Last 3 months)', icon: '📄', category: 'Financial' },
    { id: 'itr', name: 'Income Tax Return (ITR)', icon: '📊', category: 'Financial' },
    { id: 'bank', name: 'Bank Account Details / Passbook', icon: '🏦', category: 'Financial' },

    { id: 'domicile', name: 'Domicile Certificate (Maharashtra)', icon: '🏛️', category: 'Address' },
    { id: 'residence', name: 'Residence Proof', icon: '🏠', category: 'Address' },
    { id: 'address', name: 'Address Proof (Electricity/Water Bill)', icon: '📍', category: 'Address' },

    { id: 'caste', name: 'Caste Certificate', icon: '📜', category: 'Category' },
    { id: 'sc_st', name: 'SC/ST Certificate', icon: '📜', category: 'Category' },
    { id: 'obc', name: 'OBC / NT / VJ Certificate', icon: '📜', category: 'Category' },
    { id: 'ews', name: 'EWS Certificate', icon: '📜', category: 'Category' },
    { id: 'minority', name: 'Minority Community Certificate', icon: '📜', category: 'Category' },

    { id: 'birth', name: 'Birth Certificate', icon: '🎂', category: 'Personal' },
    { id: 'age', name: 'Age Proof', icon: '📅', category: 'Personal' },
    { id: 'marriage', name: 'Marriage Certificate', icon: '💍', category: 'Personal' },
    { id: 'divorce', name: 'Divorce Decree', icon: '📃', category: 'Personal' },
    { id: 'death', name: 'Death Certificate (Spouse - for widows)', icon: '🕊️', category: 'Personal' },

    { id: 'education', name: 'Educational Qualification Certificate', icon: '🎓', category: 'Education' },
    { id: 'marksheet', name: 'Latest Mark Sheet', icon: '📝', category: 'Education' },
    { id: 'school', name: 'School/College Bonafide Certificate', icon: '🏫', category: 'Education' },
    { id: 'admission', name: 'Admission Letter', icon: '📨', category: 'Education' },

    { id: 'photo', name: 'Recent Passport Size Photograph', icon: '📸', category: 'Documents' },
    { id: 'signature', name: 'Signature (Scanned)', icon: '✍️', category: 'Documents' },
    { id: 'medical', name: 'Medical Certificate', icon: '⚕️', category: 'Medical' },
    { id: 'disability', name: 'Disability Certificate (40%+)', icon: '♿', category: 'Medical' },

    { id: 'occupation', name: 'Occupation/Employment Certificate', icon: '💼', category: 'Employment' },
    { id: 'unemployment', name: 'Unemployment Certificate', icon: '📄', category: 'Employment' },
    { id: 'business', name: 'Business Registration / GST', icon: '🏢', category: 'Employment' },

    { id: 'land', name: 'Land Ownership Documents (7/12 Extract)', icon: '🌾', category: 'Property' },
    { id: 'farmer', name: 'Farmer ID Card', icon: '👨‍🌾', category: 'Property' },
    { id: 'crop', name: 'Crop Insurance Details', icon: '🌱', category: 'Property' },
    { id: 'house', name: 'House Ownership Papers', icon: '🏘️', category: 'Property' },

    { id: 'senior', name: 'Senior Citizen Card', icon: '👴', category: 'Special' },
    { id: 'widow', name: 'Widow Certificate', icon: '👰', category: 'Special' },
    { id: 'defence', name: 'Ex-Serviceman Certificate', icon: '🎖️', category: 'Special' }
];

const AdminSchemes = () => {
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingScheme, setEditingScheme] = useState(null);
    const [viewScheme, setViewScheme] = useState(null);
    const [msg, setMsg] = useState('');

    const isMobile = useMediaQuery('(max-width: 768px)');
    const isSmall  = useMediaQuery('(max-width: 480px)');

    // ─── Form state with selectedDocuments as array ───
    const [form, setForm] = useState({
        schemeName: '', category: 'Health', description: '', benefits: '',
        eligibilityCriteria: '', applicationProcess: '',
        officialLink: '', ageMin: 18, ageMax: 60, incomeLimit: 200000,
        genderRequired: 'All', categoryRequired: 'All', occupationRequired: 'Any',
        status: 'Active',
        selectedDocuments: []
    });

    useEffect(() => {
        loadSchemes();
    }, []);

    const loadSchemes = async () => {
        try {
            const res = await adminAPI.getAllSchemes();
            setSchemes(res.data?.data || res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setForm({
            schemeName: '', category: 'Health', description: '', benefits: '',
            eligibilityCriteria: '', applicationProcess: '',
            officialLink: '', ageMin: 18, ageMax: 60, incomeLimit: 200000,
            genderRequired: 'All', categoryRequired: 'All', occupationRequired: 'Any',
            status: 'Active',
            selectedDocuments: []
        });
        setEditingScheme(null);
        setShowModal(true);
    };

    const openEditModal = (scheme) => {
        let selectedDocs = [];
        if (scheme.requiredDocuments) {
            selectedDocs = scheme.requiredDocuments
                .split(/[,;\n]/)
                .map(d => d.trim())
                .filter(d => d.length > 0);
        }
        setForm({ ...scheme, selectedDocuments: selectedDocs });
        setEditingScheme(scheme);
        setShowModal(true);
    };

    // ─── Toggle document selection ───
    const toggleDocument = (docName) => {
        setForm(prev => {
            const isSelected = prev.selectedDocuments.includes(docName);
            return {
                ...prev,
                selectedDocuments: isSelected
                    ? prev.selectedDocuments.filter(d => d !== docName)
                    : [...prev.selectedDocuments, docName]
            };
        });
    };

    // ─── Select/Deselect all documents in a category ───
    const toggleCategory = (categoryName) => {
        const categoryDocs = ALL_DOCUMENTS.filter(d => d.category === categoryName).map(d => d.name);
        const allSelected = categoryDocs.every(d => form.selectedDocuments.includes(d));

        setForm(prev => ({
            ...prev,
            selectedDocuments: allSelected
                ? prev.selectedDocuments.filter(d => !categoryDocs.includes(d))
                : [...new Set([...prev.selectedDocuments, ...categoryDocs])]
        }));
    };

    const handleSave = async () => {
        if (!form.schemeName || !form.category) {
            alert('Scheme Name and Category are required');
            return;
        }

        const dataToSend = {
            ...form,
            requiredDocuments: form.selectedDocuments.join(', ')
        };
        delete dataToSend.selectedDocuments;

        try {
            if (editingScheme) {
                await adminAPI.updateScheme(editingScheme.id, dataToSend);
                setMsg('✓ Scheme updated & users notified');
            } else {
                await adminAPI.addScheme(dataToSend);
                setMsg('✓ Scheme added & users notified');
            }
            setTimeout(() => setMsg(''), 3000);
            setShowModal(false);
            loadSchemes();
        } catch (err) {
            setMsg('❌ Save failed');
            setTimeout(() => setMsg(''), 3000);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete "${name}"? Users will be notified.`)) return;
        try {
            await adminAPI.deleteScheme(id);
            setMsg('✓ Deleted & users notified');
            setTimeout(() => setMsg(''), 3000);
            loadSchemes();
        } catch (err) {
            setMsg('❌ Delete failed');
            setTimeout(() => setMsg(''), 3000);
        }
    };

    const filtered = schemes.filter(s =>
        !search || s.schemeName?.toLowerCase().includes(search.toLowerCase()) ||
        s.category?.toLowerCase().includes(search.toLowerCase())
    );

    const documentsByCategory = ALL_DOCUMENTS.reduce((acc, doc) => {
        if (!acc[doc.category]) acc[doc.category] = [];
        acc[doc.category].push(doc);
        return acc;
    }, {});

    const getDocCount = (sch) => sch.requiredDocuments
        ? sch.requiredDocuments.split(',').filter(d => d.trim()).length
        : 0;

    const statusStyle = (status) => ({
        ...s.statusBadge,
        background: status === 'Active' ? '#D1FAE5' : '#FEE2E2',
        color: status === 'Active' ? '#065F46' : '#991B1B'
    });

    const renderActions = (sch) => (
        <div style={s.actions}>
            <button onClick={() => setViewScheme(sch)}
                style={{ ...s.actionBtn, ...s.viewBtn }} title="View"><FiEye /></button>
            <button onClick={() => openEditModal(sch)}
                style={{ ...s.actionBtn, background: '#FEF3C7', color: '#92400E' }} title="Edit"><FiEdit2 /></button>
            <button onClick={() => handleDelete(sch.id, sch.schemeName)}
                style={{ ...s.actionBtn, ...s.deleteBtn }} title="Delete"><FiTrash2 /></button>
        </div>
    );

    // grid helpers (modal ke andar)
    const grid2 = { display: 'grid', gridTemplateColumns: isSmall ? 'minmax(0, 1fr)' : 'repeat(2, minmax(0, 1fr))', gap: 12 };
    const grid3 = { display: 'grid', gridTemplateColumns: isSmall ? 'minmax(0, 1fr)' : isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))', gap: 12 };

    if (loading) return <div style={s.loading}><div style={s.spinner}></div><p>Loading schemes...</p></div>;

    return (
        <div style={s.wrap}>
            <div style={{
                ...s.header,
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'stretch' : 'center',
                gap: isMobile ? 14 : 0,
                marginBottom: isMobile ? 16 : 24
            }}>
                <div>
                    <h1 style={{ ...s.title, fontSize: isMobile ? 22 : 28 }}>Scheme Management</h1>
                    <p style={s.desc}>Total: {schemes.length} schemes</p>
                </div>
                <button onClick={openAddModal} style={{ ...s.addBtn, justifyContent: 'center', width: isMobile ? '100%' : 'auto' }}>
                    <FiPlus /> Add New Scheme
                </button>
            </div>

            {msg && <div style={s.msgBar}>{msg}</div>}

            <div style={s.card}>
                <div style={{ ...s.searchBar, padding: isMobile ? 12 : 20 }}>
                    <FiSearch style={s.searchIcon} />
                    <input type="text" placeholder="Search by scheme name..."
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        style={{ ...s.searchInput, fontSize: isMobile ? 16 : 14 }} />
                </div>

                {isMobile ? (
                    /* ─── MOBILE: cards ─── */
                    <div style={s.cardList}>
                        {filtered.map((sch) => (
                            <div key={sch.id} style={s.schemeCard}>
                                <div style={s.schemeCardTop}>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div style={s.schemeCardId}>#{sch.id}</div>
                                        <div style={s.schemeCardName}>{sch.schemeName}</div>
                                    </div>
                                    <span style={statusStyle(sch.status)}>● {sch.status}</span>
                                </div>
                                <div style={s.metaGrid}>
                                    <div style={s.metaBox}>
                                        <div style={s.metaLabel}>CATEGORY</div>
                                        <div style={s.metaValue}>{sch.category}</div>
                                    </div>
                                    <div style={s.metaBox}>
                                        <div style={s.metaLabel}>AGE</div>
                                        <div style={s.metaValue}>{sch.ageMin}-{sch.ageMax}</div>
                                    </div>
                                    <div style={s.metaBox}>
                                        <div style={s.metaLabel}>INCOME</div>
                                        <div style={s.metaValue}>₹{sch.incomeLimit ? Number(sch.incomeLimit).toLocaleString('en-IN') : 'Any'}</div>
                                    </div>
                                    <div style={s.metaBox}>
                                        <div style={s.metaLabel}>DOCS</div>
                                        <div style={s.metaValue}>
                                            <span style={s.docCountBadge}><FaIdCard size={11} /> {getDocCount(sch)}</span>
                                        </div>
                                    </div>
                                </div>
                                {renderActions(sch)}
                            </div>
                        ))}
                    </div>
                ) : (
                    /* ─── DESKTOP: table ─── */
                    <div style={s.tableWrap}>
                        <table style={s.table}>
                            <thead>
                                <tr>
                                    <th style={s.th}>ID</th>
                                    <th style={s.th}>Scheme Name</th>
                                    <th style={s.th}>Category</th>
                                    <th style={s.th}>Age</th>
                                    <th style={s.th}>Income</th>
                                    <th style={s.th}>Docs</th>
                                    <th style={s.th}>Status</th>
                                    <th style={s.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((sch) => (
                                    <tr key={sch.id} style={s.tr}>
                                        <td style={s.td}><strong>#{sch.id}</strong></td>
                                        <td style={s.td}><strong>{sch.schemeName}</strong></td>
                                        <td style={s.td}>{sch.category}</td>
                                        <td style={s.td}>{sch.ageMin}-{sch.ageMax}</td>
                                        <td style={s.td}>₹{sch.incomeLimit ? Number(sch.incomeLimit).toLocaleString('en-IN') : 'Any'}</td>
                                        <td style={s.td}>
                                            <span style={s.docCountBadge}>
                                                <FaIdCard size={11} /> {getDocCount(sch)}
                                            </span>
                                        </td>
                                        <td style={s.td}>
                                            <span style={statusStyle(sch.status)}>● {sch.status}</span>
                                        </td>
                                        <td style={s.td}>{renderActions(sch)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {filtered.length === 0 && <div style={s.empty}>No schemes found</div>}
            </div>

            {/* ═══════ ADD/EDIT MODAL ═══════ */}
            {showModal && (
                <div style={{ ...s.modal, padding: isMobile ? 8 : 20 }} onClick={() => setShowModal(false)}>
                    <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={{ ...s.modalHeader, padding: isMobile ? 14 : 20 }}>
                            <h3 style={{ ...s.modalTitle, fontSize: isMobile ? 17 : 20 }}>{editingScheme ? '✏️ Edit Scheme' : '➕ Add New Scheme'}</h3>
                            <button onClick={() => setShowModal(false)} style={s.modalClose}><FiX /></button>
                        </div>
                        <div style={{ ...s.modalBody, padding: isMobile ? 12 : 24 }}>

                            {/* ─── BASIC INFO ─── */}
                            <div style={{ ...s.sectionCard, padding: isMobile ? 14 : 20 }}>
                                <div style={s.sectionTitle}>📋 Basic Information</div>
                                <FormInput label="Scheme Name *" value={form.schemeName}
                                    onChange={v => setForm({ ...form, schemeName: v })} />
                                <FormSelect label="Category *" value={form.category}
                                    onChange={v => setForm({ ...form, category: v })}
                                    options={['Health', 'Education', 'Employment', 'Agriculture', 'Housing', 'Social Justice', 'Women']} />
                                <FormTextarea label="Description" value={form.description}
                                    onChange={v => setForm({ ...form, description: v })} />
                                <FormTextarea label="Benefits" value={form.benefits}
                                    onChange={v => setForm({ ...form, benefits: v })} />
                                <FormInput label="Official Link" value={form.officialLink}
                                    onChange={v => setForm({ ...form, officialLink: v })} />
                            </div>

                            {/* ─── ELIGIBILITY ─── */}
                            <div style={{ ...s.sectionCard, padding: isMobile ? 14 : 20 }}>
                                <div style={s.sectionTitle}>🎯 Eligibility Criteria</div>
                                <div style={grid2}>
                                    <FormInput label="Min Age" type="number" value={form.ageMin}
                                        onChange={v => setForm({ ...form, ageMin: parseInt(v) || 0 })} />
                                    <FormInput label="Max Age" type="number" value={form.ageMax}
                                        onChange={v => setForm({ ...form, ageMax: parseInt(v) || 100 })} />
                                </div>
                                <FormInput label="Income Limit (₹)" type="number" value={form.incomeLimit}
                                    onChange={v => setForm({ ...form, incomeLimit: parseFloat(v) || 0 })} />
                                <div style={grid3}>
                                    <FormSelect label="Gender" value={form.genderRequired}
                                        onChange={v => setForm({ ...form, genderRequired: v })}
                                        options={['All', 'Male', 'Female']} />
                                    <FormSelect label="Category For" value={form.categoryRequired}
                                        onChange={v => setForm({ ...form, categoryRequired: v })}
                                        options={['All', 'General', 'OBC', 'SC', 'ST', 'EWS']} />
                                    <FormSelect label="Status" value={form.status}
                                        onChange={v => setForm({ ...form, status: v })}
                                        options={['Active', 'Inactive']} />
                                </div>
                            </div>

                            {/* ═══════ REQUIRED DOCUMENTS - MULTI-SELECT ═══════ */}
                            <div style={{ ...s.sectionCard, padding: isMobile ? 14 : 20 }}>
                                <div style={{ ...s.docSectionHeader, flexWrap: 'wrap', gap: 10 }}>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div style={s.sectionTitle}>📄 Required Documents</div>
                                        <p style={s.docSectionDesc}>
                                            Select documents required for this scheme. Users will see these in scheme details.
                                        </p>
                                    </div>
                                    <div style={s.selectedCount}>
                                        <FiCheckCircle style={{ color: '#10B981' }} />
                                        <strong>{form.selectedDocuments.length}</strong> selected
                                    </div>
                                </div>

                                {form.selectedDocuments.length > 0 && (
                                    <div style={s.selectedPreview}>
                                        <div style={s.previewLabel}>✅ Selected Documents:</div>
                                        <div style={s.chipsRow}>
                                            {form.selectedDocuments.map((doc, i) => (
                                                <span key={i} style={s.selectedChip}>
                                                    {doc}
                                                    <button
                                                        onClick={() => toggleDocument(doc)}
                                                        style={s.removeChipBtn}>
                                                        <FiX size={12} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div style={s.docsContainer}>
                                    {Object.entries(documentsByCategory).map(([categoryName, docs]) => {
                                        const categoryDocNames = docs.map(d => d.name);
                                        const selectedInCategory = categoryDocNames.filter(d => form.selectedDocuments.includes(d)).length;
                                        const allSelected = selectedInCategory === docs.length;
                                        const someSelected = selectedInCategory > 0 && selectedInCategory < docs.length;

                                        return (
                                            <div key={categoryName} style={s.categoryBlock}>
                                                <div style={s.categoryHeader}>
                                                    <label style={s.categoryLabel}>
                                                        <input
                                                            type="checkbox"
                                                            checked={allSelected}
                                                            ref={el => el && (el.indeterminate = someSelected)}
                                                            onChange={() => toggleCategory(categoryName)}
                                                            style={s.categoryCheckbox}
                                                        />
                                                        <span style={s.categoryName}>{categoryName}</span>
                                                        <span style={s.categoryCount}>
                                                            {selectedInCategory}/{docs.length}
                                                        </span>
                                                    </label>
                                                </div>
                                                <div style={s.docsGrid}>
                                                    {docs.map(doc => {
                                                        const isSelected = form.selectedDocuments.includes(doc.name);
                                                        return (
                                                            <label key={doc.id} style={{
                                                                ...s.docItem,
                                                                background: isSelected ? '#EEF2FF' : '#F9FAFB',
                                                                borderColor: isSelected ? '#4F46E5' : '#E5E7EB'
                                                            }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => toggleDocument(doc.name)}
                                                                    style={s.docCheckbox}
                                                                />
                                                                <span style={s.docIcon}>{doc.icon}</span>
                                                                <span style={{
                                                                    ...s.docName,
                                                                    color: isSelected ? '#4338CA' : '#111827',
                                                                    fontWeight: isSelected ? 700 : 500
                                                                }}>
                                                                    {doc.name}
                                                                </span>
                                                                {isSelected && (
                                                                    <FiCheckCircle style={s.docCheckIcon} />
                                                                )}
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ─── ELIGIBILITY & PROCESS ─── */}
                            <div style={{ ...s.sectionCard, padding: isMobile ? 14 : 20 }}>
                                <div style={s.sectionTitle}>📝 Detailed Information</div>
                                <FormTextarea label="Eligibility Criteria (detailed)" value={form.eligibilityCriteria}
                                    onChange={v => setForm({ ...form, eligibilityCriteria: v })}
                                    placeholder="Enter detailed eligibility criteria (comma or semicolon separated)" />
                                <FormTextarea label="Application Process" value={form.applicationProcess}
                                    onChange={v => setForm({ ...form, applicationProcess: v })}
                                    placeholder="Step-by-step application process" />
                            </div>

                        </div>
                        <div style={{ ...s.modalFooter, padding: isMobile ? 12 : 20 }}>
                            <button onClick={() => setShowModal(false)} style={s.cancelBtn}>Cancel</button>
                            <button onClick={handleSave} style={s.saveBtn}>
                                {editingScheme ? '💾 Update Scheme' : '➕ Add Scheme'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════ VIEW MODAL ═══════ */}
            {viewScheme && (
                <div style={{ ...s.modal, padding: isMobile ? 8 : 20 }} onClick={() => setViewScheme(null)}>
                    <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={{ ...s.modalHeader, padding: isMobile ? 14 : 20 }}>
                            <h3 style={{ ...s.modalTitle, fontSize: isMobile ? 17 : 20, minWidth: 0, wordBreak: 'break-word' }}>{viewScheme.schemeName}</h3>
                            <button onClick={() => setViewScheme(null)} style={s.modalClose}><FiX /></button>
                        </div>
                        <div style={{ ...s.modalBody, padding: isMobile ? 12 : 24 }}>
                            <div style={s.viewSection}>
                                <div style={s.viewRow}><strong>Category:</strong> {viewScheme.category}</div>
                                <div style={s.viewRow}><strong>Description:</strong> {viewScheme.description || 'N/A'}</div>
                                <div style={s.viewRow}><strong>Benefits:</strong> {viewScheme.benefits || 'N/A'}</div>
                                <div style={s.viewRow}><strong>Age:</strong> {viewScheme.ageMin} - {viewScheme.ageMax}</div>
                                <div style={s.viewRow}><strong>Income Limit:</strong> ₹{viewScheme.incomeLimit ? Number(viewScheme.incomeLimit).toLocaleString('en-IN') : 'Any'}</div>
                                <div style={s.viewRow}><strong>Status:</strong> <span style={{ color: '#10B981' }}>● {viewScheme.status}</span></div>
                                {viewScheme.officialLink && (
                                    <div style={s.viewRow}>
                                        <strong>Link:</strong> <a href={viewScheme.officialLink} target="_blank" rel="noreferrer" style={{ color: '#4F46E5' }}>{viewScheme.officialLink}</a>
                                    </div>
                                )}
                            </div>

                            {viewScheme.requiredDocuments && (
                                <div style={s.viewSection}>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: '#111827', marginBottom: 12 }}>
                                        📄 Required Documents:
                                    </div>
                                    <div style={s.chipsRow}>
                                        {viewScheme.requiredDocuments.split(',').map((doc, i) => (
                                            <span key={i} style={s.viewDocChip}>
                                                <FiFileText size={12} /> {doc.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const FormInput = ({ label, type = 'text', value, onChange, placeholder }) => (
    <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>{label}</label>
        <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none', minWidth: 0 }} />
    </div>
);

const FormTextarea = ({ label, value, onChange, placeholder }) => (
    <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>{label}</label>
        <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} rows={3}
            placeholder={placeholder}
            style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none' }} />
    </div>
);

const FormSelect = ({ label, value, onChange, options }) => (
    <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>{label}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, background: '#fff', minWidth: 0 }}>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    </div>
);

const s = {
    wrap: { padding: '20px 0', maxWidth: 1400, margin: '0 auto', minWidth: 0 },
    loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 80, gap: 16 },
    spinner: { width: 48, height: 48, border: '4px solid #E5E7EB', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 28, fontWeight: 800, color: '#111827', marginBottom: 6 },
    desc: { fontSize: 14, color: '#6B7280' },
    addBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)', color: '#fff', padding: '12px 24px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 20px rgba(79,70,229,0.35)' },
    msgBar: { padding: 14, background: '#D1FAE5', color: '#065F46', borderRadius: 10, marginBottom: 16, fontWeight: 600 },
    card: { background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden' },
    searchBar: { display: 'flex', alignItems: 'center', gap: 10, padding: 20, borderBottom: '1px solid #F3F4F6' },
    searchIcon: { color: '#6B7280', fontSize: 18, flexShrink: 0 },
    searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: 14, minWidth: 0 },
    tableWrap: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: 16, textAlign: 'left', background: '#F9FAFB', fontSize: 12, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 },
    tr: { borderBottom: '1px solid #F3F4F6' },
    td: { padding: 16, fontSize: 14, color: '#111827' },
    statusBadge: { padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' },
    docCountBadge: { display: 'inline-flex', alignItems: 'center', gap: 4, background: '#EEF2FF', color: '#4F46E5', padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700 },
    actions: { display: 'flex', gap: 6, flexWrap: 'wrap' },
    actionBtn: { padding: 8, borderRadius: 8, border: 'none', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    viewBtn: { background: '#EEF2FF', color: '#4F46E5' },
    deleteBtn: { background: '#FEE2E2', color: '#DC2626' },
    empty: { textAlign: 'center', padding: 40, color: '#6B7280' },

    /* MOBILE CARDS */
    cardList: { display: 'flex', flexDirection: 'column', gap: 12, padding: 12 },
    schemeCard: { background: '#F9FAFB', border: '1px solid #F3F4F6', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 12 },
    schemeCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
    schemeCardId: { fontSize: 11, fontWeight: 800, color: '#6B7280', marginBottom: 2 },
    schemeCardName: { fontSize: 15, fontWeight: 800, color: '#111827', lineHeight: 1.35, wordBreak: 'break-word' },
    metaGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 },
    metaBox: { background: '#fff', border: '1px solid #F3F4F6', borderRadius: 8, padding: '8px 10px', minWidth: 0 },
    metaLabel: { fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.8, marginBottom: 3 },
    metaValue: { fontSize: 13, fontWeight: 700, color: '#111827', wordBreak: 'break-word' },

    /* MODAL */
    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 },
    modalContent: { background: '#fff', borderRadius: 16, width: '100%', maxWidth: 800, maxHeight: '96dvh', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: 20, borderBottom: '1px solid #E5E7EB', background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)' },
    modalTitle: { fontSize: 20, fontWeight: 800, color: '#111827' },
    modalClose: { width: 34, height: 34, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    modalBody: { padding: 24, overflow: 'auto', flex: 1, minHeight: 0 },
    modalFooter: { display: 'flex', gap: 10, padding: 20, borderTop: '1px solid #E5E7EB', background: '#F9FAFB', flexWrap: 'wrap' },
    cancelBtn: { flex: '1 1 120px', padding: '14px 20px', background: '#fff', color: '#111827', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
    saveBtn: { flex: '1 1 160px', padding: '14px 20px', background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' },

    /* SECTIONS */
    sectionCard: { background: '#F9FAFB', padding: 20, borderRadius: 12, marginBottom: 20, border: '1px solid #F3F4F6' },
    sectionTitle: { fontSize: 15, fontWeight: 800, color: '#111827', marginBottom: 14 },

    /* DOCUMENTS SECTION */
    docSectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    docSectionDesc: { fontSize: 12, color: '#6B7280', marginTop: 4 },
    selectedCount: { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#D1FAE5', color: '#065F46', padding: '8px 14px', borderRadius: 100, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' },

    selectedPreview: { background: '#fff', padding: 14, borderRadius: 10, border: '1px solid #E5E7EB', marginBottom: 16 },
    previewLabel: { fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 },
    chipsRow: { display: 'flex', flexWrap: 'wrap', gap: 6 },
    selectedChip: { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)', color: '#fff', padding: '5px 10px 5px 12px', borderRadius: 100, fontSize: 11, fontWeight: 600, maxWidth: '100%' },
    removeChipBtn: { background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', padding: 0, flexShrink: 0 },

    docsContainer: { display: 'flex', flexDirection: 'column', gap: 14 },
    categoryBlock: { background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', overflow: 'hidden' },
    categoryHeader: { padding: '12px 16px', background: '#F3F4F6', borderBottom: '1px solid #E5E7EB' },
    categoryLabel: { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', margin: 0 },
    categoryCheckbox: { width: 18, height: 18, accentColor: '#4F46E5', cursor: 'pointer' },
    categoryName: { fontSize: 13, fontWeight: 800, color: '#111827', flex: 1 },
    categoryCount: { background: '#EEF2FF', color: '#4F46E5', padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700 },

    docsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(250px, 100%), 1fr))', gap: 8, padding: 12 },
    docItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1.5px solid', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s', position: 'relative', minWidth: 0 },
    docCheckbox: { width: 16, height: 16, accentColor: '#4F46E5', cursor: 'pointer', flexShrink: 0 },
    docIcon: { fontSize: 16 },
    docName: { fontSize: 12, flex: 1, minWidth: 0, wordBreak: 'break-word' },
    docCheckIcon: { color: '#10B981', fontSize: 14, flexShrink: 0 },

    /* VIEW MODAL */
    viewSection: { background: '#F9FAFB', padding: 16, borderRadius: 10, marginBottom: 16 },
    viewRow: { padding: '6px 0', fontSize: 14, color: '#374151', wordBreak: 'break-word' },
    viewDocChip: { display: 'inline-flex', alignItems: 'center', gap: 5, background: '#EEF2FF', color: '#4338CA', padding: '6px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600 }
};

export default AdminSchemes;
