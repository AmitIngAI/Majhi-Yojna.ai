import React, { useState } from 'react';
import {
    FiUser, FiMail, FiMessageSquare, FiSend,
    FiMapPin, FiPhone, FiCheckCircle, FiClock,
    FiEdit3
} from 'react-icons/fi';
import { HiSparkles, HiOutlineChatAlt2 } from 'react-icons/hi';
import { FaWhatsapp, FaLinkedin, FaTwitter, FaInstagram } from 'react-icons/fa';
import { contactAPI } from '../services/api';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', subject: '', message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError]     = useState('');
    const [focused, setFocused] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await contactAPI.send(formData);
            setSuccess(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setSuccess(false), 4000);
        } catch (err) {
            setError('Failed to send message. Please try again.');
        }
        setLoading(false);
    };

    /* ── Input field renderer ── */
    const renderInput = (name, placeholder, Icon, type = 'text') => (
        <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>{placeholder}</label>
            <div style={{
                ...styles.inputBox,
                borderColor: focused === name ? '#4F46E5' : '#E5E7EB',
                boxShadow: focused === name
                    ? '0 0 0 4px rgba(79,70,229,0.08)'
                    : '0 1px 2px rgba(0,0,0,0.02)'
            }}>
                <Icon style={{
                    ...styles.inputIcon,
                    color: focused === name ? '#4F46E5' : '#9CA3AF'
                }} />
                <input
                    type={type}
                    name={name}
                    placeholder={`Enter your ${placeholder.toLowerCase()}`}
                    value={formData[name]}
                    onChange={handleChange}
                    onFocus={() => setFocused(name)}
                    onBlur={() => setFocused(null)}
                    required
                    style={styles.input}
                />
            </div>
        </div>
    );

    return (
        <div style={styles.page}>

            {/* ══════════ HEADER SECTION ══════════ */}
            <div style={styles.headerSection}>
                <div style={styles.headerContent}>
                    <div style={styles.badge}>
                        <HiSparkles size={12} style={{ marginRight: 5 }} />
                        GET IN TOUCH
                    </div>
                    <h1 style={styles.mainTitle}>
                        We'd love to <span style={styles.titleAccent}>hear from you</span>
                    </h1>
                    <p style={styles.mainSubtitle}>
                        Have questions about Maharashtra welfare schemes?
                        Our team is here to help you 24/7.
                    </p>
                </div>
            </div>

            {/* ══════════ MAIN GRID ══════════ */}
            <div style={styles.wrapper}>
                <div style={styles.grid}>

                    {/* ═══ LEFT: CONTACT INFO CARDS ═══ */}
                    <div style={styles.leftPanel}>

                        {/* Info Card - Location */}
                        <div style={styles.infoCard}>
                            <div style={{ ...styles.infoIcon, background: '#EEF2FF', color: '#4F46E5' }}>
                                <FiMapPin size={22} />
                            </div>
                            <div>
                                <h3 style={styles.infoTitle}>Office Address</h3>
                                <p style={styles.infoText}>
                                    Mantralaya, Nariman Point<br />
                                    Mumbai, Maharashtra 400032
                                </p>
                            </div>
                        </div>

                        {/* Info Card - Email */}
                        <div style={styles.infoCard}>
                            <div style={{ ...styles.infoIcon, background: '#DCFCE7', color: '#16A34A' }}>
                                <FiMail size={22} />
                            </div>
                            <div>
                                <h3 style={styles.infoTitle}>Email Support</h3>
                                <p style={styles.infoText}>
                                    admin@mahabenefit.in<br />
                                    <span style={styles.infoSub}>Reply within 24 hours</span>
                                </p>
                            </div>
                        </div>

                        {/* Info Card - Phone */}
                        <div style={styles.infoCard}>
                            <div style={{ ...styles.infoIcon, background: '#FFEDD5', color: '#F97316' }}>
                                <FiPhone size={22} />
                            </div>
                            <div>
                                <h3 style={styles.infoTitle}>Toll-Free Helpline</h3>
                                <p style={styles.infoText}>
                                    +91-1800-120-840<br />
                                    <span style={styles.infoSub}>Mon-Sat, 9 AM - 6 PM</span>
                                </p>
                            </div>
                        </div>

                        {/* Info Card - Working Hours */}
                        <div style={styles.infoCard}>
                            <div style={{ ...styles.infoIcon, background: '#F3E8FF', color: '#9333EA' }}>
                                <FiClock size={22} />
                            </div>
                            <div>
                                <h3 style={styles.infoTitle}>Working Hours</h3>
                                <p style={styles.infoText}>
                                    Monday - Saturday<br />
                                    <span style={styles.infoSub}>9:00 AM to 6:00 PM IST</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ═══ CENTER: CONTACT FORM ═══ */}
                    <div style={styles.formPanel}>
                        <div style={styles.formHeader}>
                            <div style={styles.formIconBadge}>
                                <FiEdit3 size={22} color="#4F46E5" />
                            </div>
                            <div>
                                <h2 style={styles.formTitle}>Send us a Message</h2>
                                <p style={styles.formSubtitle}>
                                    Fill out the form and we'll respond quickly.
                                </p>
                            </div>
                        </div>

                        {/* Success Alert */}
                        {success && (
                            <div style={styles.successAlert}>
                                <FiCheckCircle size={20} />
                                <div>
                                    <strong>Message sent successfully!</strong>
                                    <div style={{ fontSize: 13, marginTop: 2, opacity: 0.9 }}>
                                        We'll get back to you within 24 hours.
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error Alert */}
                        {error && (
                            <div style={styles.errorAlert}>
                                <span style={{ fontSize: 18 }}>⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit}>

                            {/* Name + Email — Two columns */}
                            <div style={styles.formRow}>
                                {renderInput('name', 'Full Name', FiUser)}
                                {renderInput('email', 'Email Address', FiMail, 'email')}
                            </div>

                            {/* Subject — Full width */}
                            {renderInput('subject', 'Subject', HiOutlineChatAlt2)}

                            {/* Message — Textarea */}
                            <div style={styles.inputGroup}>
                                <label style={styles.inputLabel}>Message</label>
                                <div style={{
                                    ...styles.textareaBox,
                                    borderColor: focused === 'message' ? '#4F46E5' : '#E5E7EB',
                                    boxShadow: focused === 'message'
                                        ? '0 0 0 4px rgba(79,70,229,0.08)'
                                        : '0 1px 2px rgba(0,0,0,0.02)'
                                }}>
                                    <FiMessageSquare style={{
                                        ...styles.textareaIcon,
                                        color: focused === 'message' ? '#4F46E5' : '#9CA3AF'
                                    }} />
                                    <textarea
                                        name="message"
                                        placeholder="Write your message here..."
                                        value={formData.message}
                                        onChange={handleChange}
                                        onFocus={() => setFocused('message')}
                                        onBlur={() => setFocused(null)}
                                        required
                                        rows="5"
                                        style={styles.textarea}
                                    />
                                </div>
                            </div>

                            {/* Character count */}
                            <div style={styles.charCount}>
                                {formData.message.length} characters
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    ...styles.submitBtn,
                                    opacity: loading ? 0.7 : 1,
                                    cursor: loading ? 'wait' : 'pointer'
                                }}>
                                {loading ? (
                                    <>
                                        <div style={styles.spinner} />
                                        Sending Message...
                                    </>
                                ) : (
                                    <>
                                        Send Message
                                        <FiSend style={{ marginLeft: 8 }} />
                                    </>
                                )}
                            </button>

                            {/* Note */}
                            <p style={styles.formNote}>
                                🔒 Your information is safe and encrypted.
                                We never share your data with third parties.
                            </p>
                        </form>
                    </div>
                </div>

                {/* ══════════ FAQ / QUICK LINKS SECTION ══════════ */}
                <div style={styles.bottomStrip}>
                    <div style={styles.stripCard}>
                        <div style={{ ...styles.stripIcon, background: '#EEF2FF', color: '#4F46E5' }}>
                            💬
                        </div>
                        <div>
                            <h4 style={styles.stripTitle}>Live Chat</h4>
                            <p style={styles.stripText}>Get instant help via AI chatbot</p>
                        </div>
                    </div>
                    <div style={styles.stripCard}>
                        <div style={{ ...styles.stripIcon, background: '#DCFCE7', color: '#16A34A' }}>
                            📚
                        </div>
                        <div>
                            <h4 style={styles.stripTitle}>Help Center</h4>
                            <p style={styles.stripText}>Browse frequently asked questions</p>
                        </div>
                    </div>
                    <div style={styles.stripCard}>
                        <div style={{ ...styles.stripIcon, background: '#FFEDD5', color: '#F97316' }}>
                            🎓
                        </div>
                        <div>
                            <h4 style={styles.stripTitle}>Scheme Guides</h4>
                            <p style={styles.stripText}>Learn how to apply step-by-step</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spinner keyframes */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

/* ═══════════════════════════════════════════
   STYLES
═══════════════════════════════════════════ */
const styles = {
    page: {
        width      : '100%',
        minHeight  : '100vh',
        background : '#F9FAFB'
    },

    /* ── HEADER ── */
    headerSection: {
        width      : '100%',
        background : 'linear-gradient(180deg, #EEF2FF 0%, #F9FAFB 100%)',
        padding    : '70px 20px 50px',
        textAlign  : 'center'
    },
    headerContent: {
        maxWidth : '700px',
        margin   : '0 auto'
    },
    badge: {
        display         : 'inline-flex',
        alignItems      : 'center',
        background      : 'rgba(79,70,229,0.1)',
        color           : '#4338CA',
        padding         : '6px 14px',
        borderRadius    : '100px',
        fontSize        : '11px',
        fontWeight      : '700',
        letterSpacing   : '1.5px',
        marginBottom    : '20px'
    },
    mainTitle: {
        fontSize      : '52px',
        fontWeight    : '900',
        color         : '#111827',
        letterSpacing : '-2px',
        lineHeight    : '1.1',
        marginBottom  : '18px'
    },
    titleAccent: {
        background          : 'linear-gradient(135deg, #4F46E5 0%, #F97316 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor : 'transparent',
        backgroundClip      : 'text'
    },
    mainSubtitle: {
        fontSize   : '17px',
        color      : '#6B7280',
        lineHeight : '1.7',
        maxWidth   : '560px',
        margin     : '0 auto'
    },

    /* ── WRAPPER ── */
    wrapper: {
        maxWidth : '1280px',
        margin   : '0 auto',
        padding  : '0 20px 80px'
    },

    /* ── GRID ── */
    grid: {
        display             : 'grid',
        gridTemplateColumns : '1fr 1.6fr',
        gap                 : '32px',
        alignItems          : 'start',
        marginTop           : '-20px'
    },

    /* ── LEFT PANEL: Info Cards ── */
    leftPanel: {
        display       : 'flex',
        flexDirection : 'column',
        gap           : '16px'
    },
    infoCard: {
        display         : 'flex',
        alignItems      : 'flex-start',
        gap             : '16px',
        background      : '#ffffff',
        padding         : '22px',
        borderRadius    : '16px',
        border          : '1px solid #F3F4F6',
        boxShadow       : '0 1px 3px rgba(0,0,0,0.04)',
        transition      : 'all 0.25s ease'
    },
    infoIcon: {
        width          : '48px',
        height         : '48px',
        borderRadius   : '12px',
        display        : 'flex',
        alignItems     : 'center',
        justifyContent : 'center',
        flexShrink     : 0
    },
    infoTitle: {
        fontSize     : '15px',
        fontWeight   : '700',
        color        : '#111827',
        marginBottom : '6px'
    },
    infoText: {
        fontSize   : '13px',
        color      : '#4B5563',
        lineHeight : '1.7',
        margin     : 0
    },
    infoSub: {
        fontSize   : '12px',
        color      : '#9CA3AF',
        fontWeight : '500'
    },
    socialSection: {
        background   : '#ffffff',
        padding      : '22px',
        borderRadius : '16px',
        border       : '1px solid #F3F4F6',
        boxShadow    : '0 1px 3px rgba(0,0,0,0.04)'
    },
    socialTitle: {
        fontSize     : '13px',
        fontWeight   : '700',
        color        : '#111827',
        marginBottom : '14px',
        letterSpacing: '0.5px',
        textTransform: 'uppercase'
    },
    socialRow: {
        display: 'flex',
        gap    : '10px'
    },
    socialBtn: {
        width          : '42px',
        height         : '42px',
        borderRadius   : '12px',
        background     : '#F9FAFB',
        display        : 'flex',
        alignItems     : 'center',
        justifyContent : 'center',
        textDecoration : 'none',
        border         : '1px solid #F3F4F6',
        transition     : 'all 0.2s ease'
    },

    /* ── FORM PANEL ── */
    formPanel: {
        background   : '#ffffff',
        padding      : '40px 44px',
        borderRadius : '20px',
        border       : '1px solid #F3F4F6',
        boxShadow    : '0 4px 20px rgba(0,0,0,0.04)'
    },
    formHeader: {
        display      : 'flex',
        alignItems   : 'center',
        gap          : '16px',
        marginBottom : '28px',
        paddingBottom: '24px',
        borderBottom : '1px solid #F3F4F6'
    },
    formIconBadge: {
        width          : '48px',
        height         : '48px',
        borderRadius   : '14px',
        background     : '#EEF2FF',
        display        : 'flex',
        alignItems     : 'center',
        justifyContent : 'center',
        flexShrink     : 0
    },
    formTitle: {
        fontSize     : '22px',
        fontWeight   : '800',
        color        : '#111827',
        marginBottom : '4px'
    },
    formSubtitle: {
        fontSize : '14px',
        color    : '#6B7280',
        margin   : 0
    },
    successAlert: {
        display         : 'flex',
        alignItems      : 'flex-start',
        gap             : '12px',
        background      : '#F0FDF4',
        color           : '#166534',
        padding         : '16px 18px',
        borderRadius    : '12px',
        marginBottom    : '20px',
        border          : '1px solid #BBF7D0',
        fontSize        : '14px'
    },
    errorAlert: {
        display         : 'flex',
        alignItems      : 'center',
        gap             : '10px',
        background      : '#FEF2F2',
        color           : '#991B1B',
        padding         : '14px 18px',
        borderRadius    : '12px',
        fontSize        : '14px',
        fontWeight      : '600',
        marginBottom    : '20px',
        border          : '1px solid #FECACA'
    },

    /* ── FORM ROW / INPUTS ── */
    formRow: {
        display             : 'grid',
        gridTemplateColumns : '1fr 1fr',
        gap                 : '18px'
    },
    inputGroup: {
        marginBottom : '20px'
    },
    inputLabel: {
        display      : 'block',
        fontSize     : '13px',
        fontWeight   : '600',
        color        : '#374151',
        marginBottom : '8px',
        letterSpacing: '0.2px'
    },
    inputBox: {
        display      : 'flex',
        alignItems   : 'center',
        background   : '#F9FAFB',
        border       : '1.5px solid #E5E7EB',
        borderRadius : '10px',
        padding      : '0 14px',
        transition   : 'all 0.2s ease'
    },
    inputIcon: {
        fontSize   : '18px',
        marginRight: '10px',
        transition : 'color 0.2s',
        flexShrink : 0
    },
    input: {
        flex       : 1,
        padding    : '13px 0',
        fontSize   : '14px',
        border     : 'none',
        outline    : 'none',
        background : '#ffffff', 
        color      : '#111827',
        fontFamily : 'inherit',
        fontWeight : '500',
        WebkitAppearance : 'none',
        MozAppearance    : 'none',
        appearance       : 'none',
        boxShadow        : 'none',
        WebkitBoxShadow  : '0 0 0 1000px #F9FAFB inset',
        WebkitTextFillColor: '#111827'
    },
    textareaBox: {
        display      : 'flex',
        alignItems   : 'flex-start',
        background   : '#F9FAFB',
        border       : '1.5px solid #E5E7EB',
        borderRadius : '10px',
        padding      : '14px',
        transition   : 'all 0.2s ease'
    },
    textareaIcon: {
        fontSize   : '18px',
        marginRight: '10px',
        marginTop  : '2px',
        transition : 'color 0.2s',
        flexShrink : 0
    },
    textarea: {
        flex       : 1,
        border     : 'none',
        outline    : 'none',
        background : 'transparent',
        fontSize   : '14px',
        color      : '#111827',
        fontFamily : 'inherit',
        fontWeight : '500',
        resize     : 'vertical',
        minHeight  : '120px',
        lineHeight : '1.6'
    },
    charCount: {
        textAlign  : 'right',
        fontSize   : '12px',
        color      : '#9CA3AF',
        marginTop  : '-12px',
        marginBottom: '20px'
    },
    submitBtn: {
        width          : '100%',
        padding        : '16px',
        background     : 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
        color          : '#ffffff',
        border         : 'none',
        borderRadius   : '12px',
        fontSize       : '15px',
        fontWeight     : '700',
        display        : 'inline-flex',
        alignItems     : 'center',
        justifyContent : 'center',
        transition     : 'all 0.25s',
        boxShadow      : '0 8px 20px rgba(79,70,229,0.3)',
        fontFamily     : 'inherit',
        letterSpacing  : '0.3px'
    },
    spinner: {
        width        : '18px',
        height       : '18px',
        border       : '2.5px solid rgba(255,255,255,0.3)',
        borderTopColor: '#ffffff',
        borderRadius : '50%',
        marginRight  : '10px',
        animation    : 'spin 0.8s linear infinite'
    },
    formNote: {
        marginTop  : '16px',
        fontSize   : '12px',
        color      : '#9CA3AF',
        textAlign  : 'center',
        margin     : '16px 0 0'
    },

    /* ── BOTTOM STRIP ── */
    bottomStrip: {
        marginTop           : '40px',
        display             : 'grid',
        gridTemplateColumns : 'repeat(3, 1fr)',
        gap                 : '16px'
    },
    stripCard: {
        display         : 'flex',
        alignItems      : 'center',
        gap             : '16px',
        background      : '#ffffff',
        padding         : '20px 24px',
        borderRadius    : '14px',
        border          : '1px solid #F3F4F6',
        boxShadow       : '0 1px 3px rgba(0,0,0,0.04)',
        transition      : 'all 0.25s ease',
        cursor          : 'pointer'
    },
    stripIcon: {
        width          : '48px',
        height         : '48px',
        borderRadius   : '12px',
        display        : 'flex',
        alignItems     : 'center',
        justifyContent : 'center',
        fontSize       : '22px',
        flexShrink     : 0
    },
    stripTitle: {
        fontSize     : '15px',
        fontWeight   : '700',
        color        : '#111827',
        marginBottom : '3px'
    },
    stripText: {
        fontSize : '13px',
        color    : '#6B7280',
        margin   : 0
    }
};

export default Contact;