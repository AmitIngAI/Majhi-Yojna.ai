import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import {
    FiUser, FiMail, FiLock, FiPhone,
    FiEye, FiEyeOff, FiCheckCircle, FiCalendar,
    FiArrowRight, FiAlertCircle
} from 'react-icons/fi';

const AuthPage = ({ initialMode = 'signin' }) => {
    const [isSignUp, setIsSignUp]       = useState(initialMode === 'signup');
    const [loading, setLoading]         = useState(false);
    const [error, setError]             = useState('');
    const [showPassword, setShowPwd]    = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [focused, setFocused]         = useState(null);
    const [transitioning, setTransitioning] = useState(false);

    const [loginData, setLoginData] = useState({
        email: '', password: ''
    });

    const [signupData, setSignupData] = useState({
        fullName : '',
        email    : '',
        mobile   : '',
        password : '',
        confirm  : '',
        gender   : '',
        age      : ''
    });

    const { login } = useAuth();
    const navigate  = useNavigate();
    const location  = useLocation();

    const redirectMessage = location.state?.message;
    const redirectFrom = location.state?.from;

    useEffect(() => {
        setIsSignUp(location.pathname === '/register');
        const params = new URLSearchParams(location.search);
        const email = params.get('email');
        const password = params.get('password');
        const autoFill = params.get('autoFill');
        if (email || password) {
            setLoginData({ email: email || '', password: password || '' });
            if (autoFill === 'true') {
                console.log('🔑 Credentials auto-filled. Click Sign In to continue.');
            }
        }
    }, [location.pathname, location.search]);

    const toggleMode = () => {
        setTransitioning(true);
        setError('');
        setTimeout(() => {
            const newMode = !isSignUp;
            setIsSignUp(newMode);
            navigate(newMode ? '/register' : '/login', { replace: true });
            setTimeout(() => setTransitioning(false), 50);
        }, 300);
    };

    const handlePostLoginRedirect = (role) => {
        const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
        const pendingApply = sessionStorage.getItem('pendingApplyLink');
        if (savedRedirect) {
            sessionStorage.removeItem('redirectAfterLogin');
            if (pendingApply) {
                sessionStorage.removeItem('pendingApplyLink');
                window.open(pendingApply, '_blank');
            }
            navigate(savedRedirect);
            return;
        }
        if (redirectFrom) {
            navigate(redirectFrom);
            return;
        }
        navigate(role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await authAPI.login(loginData);
            if (res.data.token) {
                login(res.data);
                handlePostLoginRedirect(res.data.role);
            } else {
                setError(res.data.message || 'Login failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (signupData.password !== signupData.confirm) {
            setError('Passwords do not match');
            return;
        }
        if (signupData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (signupData.mobile.length !== 10) {
            setError('Mobile number must be 10 digits');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const payload = {
                fullName : signupData.fullName,
                email    : signupData.email,
                mobile   : signupData.mobile,
                password : signupData.password,
                gender   : signupData.gender,
                age      : parseInt(signupData.age),
                state    : 'Maharashtra'
            };
            const res = await authAPI.register(payload);
            if (res.data.token) {
                login(res.data);
                const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
                if (savedRedirect) {
                    sessionStorage.removeItem('redirectAfterLogin');
                    const pendingApply = sessionStorage.getItem('pendingApplyLink');
                    if (pendingApply) {
                        sessionStorage.removeItem('pendingApplyLink');
                        window.open(pendingApply, '_blank');
                    }
                    navigate(savedRedirect);
                } else {
                    navigate('/user/profile');
                }
            } else {
                setError(res.data.message || 'Registration failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const loginBg  = 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1600&q=80';
    const signupBg = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=80';

    return (
        <div style={{
            ...styles.page,
            backgroundImage: `linear-gradient(135deg, rgba(30,27,75,0.9) 0%, rgba(79,70,229,0.8) 50%, rgba(249,115,22,0.75) 100%), url(${isSignUp ? signupBg : loginBg})`
        }}>
            <div style={styles.bgBlob1} />
            <div style={styles.bgBlob2} />

            <div style={{
                ...styles.card,
                opacity: transitioning ? 0.5 : 1
            }}>
                <div style={{
                    ...styles.side,
                    ...(isSignUp ? styles.sideForm : styles.sideVisual)
                }}>
                    {isSignUp ? (
                        <FormPanel type="signup"
                            signupData={signupData} setSignupData={setSignupData}
                            error={error} loading={loading}
                            focused={focused} setFocused={setFocused}
                            showPassword={showPassword} setShowPwd={setShowPwd}
                            showConfirm={showConfirm} setShowConfirm={setShowConfirm}
                            onSubmit={handleSignup}
                            redirectMessage={redirectMessage} />
                    ) : (
                        <VisualPanel mode="signup-cta" onToggle={toggleMode} />
                    )}
                </div>

                <div style={{
                    ...styles.side,
                    ...(isSignUp ? styles.sideVisual : styles.sideForm)
                }}>
                    {isSignUp ? (
                        <VisualPanel mode="signin-cta" onToggle={toggleMode} />
                    ) : (
                        <FormPanel type="signin"
                            loginData={loginData} setLoginData={setLoginData}
                            error={error} loading={loading}
                            focused={focused} setFocused={setFocused}
                            showPassword={showPassword} setShowPwd={setShowPwd}
                            onSubmit={handleLogin}
                            redirectMessage={redirectMessage} />
                    )}
                </div>
            </div>

            <div style={styles.bottomBrand}>
                 Majhi Yojana
            </div>

            <style>{`
                input:-webkit-autofill,
                input:-webkit-autofill:hover,
                input:-webkit-autofill:focus,
                input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
                    -webkit-text-fill-color: #111827 !important;
                    transition: background-color 5000s ease-in-out 0s !important;
                    caret-color: #111827 !important;
                }
                input[type="email"]::-webkit-contacts-auto-fill-button,
                input[type="email"]::-webkit-credentials-auto-fill-button,
                input[type="password"]::-webkit-credentials-auto-fill-button {
                    visibility: hidden !important;
                    display: none !important;
                    pointer-events: none !important;
                    position: absolute !important;
                    right: 0 !important;
                    width: 0 !important;
                }
                input:focus, select:focus { outline: none !important; }
                input::placeholder {
                    color: #9CA3AF !important;
                    opacity: 1 !important;
                    font-weight: 400 !important;
                }
                
                /* ✅ FIXED: Full width inputs */
                .auth-input-wrapper {
                    position: relative;
                    width: 100%;
                    display: block;
                }
                .auth-input-wrapper input {
                    width: 100% !important;
                    box-sizing: border-box !important;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes slideInRight {
                    from { transform: translateX(30px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideInLeft {
                    from { transform: translateX(-30px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .slide-form-in {
                    animation: slideInRight 0.5s ease-out;
                }
                .slide-visual-in {
                    animation: slideInLeft 0.5s ease-out;
                }
                .card-body::-webkit-scrollbar {
                    width: 6px;
                }
                .card-body::-webkit-scrollbar-thumb {
                    background: #E5E7EB;
                    border-radius: 3px;
                }
            `}</style>
        </div>
    );
};

/* ═══════════════════════════════════════════
   VISUAL PANEL (Purple side)
═══════════════════════════════════════════ */
const VisualPanel = ({ mode, onToggle }) => (
    <div style={styles.visual} className={mode === 'signup-cta' ? 'slide-visual-in' : 'slide-form-in'}>
        <div style={styles.chakra}>
            <svg viewBox="0 0 100 100" width="100%" height="100%">
                <circle cx="50" cy="50" r="45" stroke="white" strokeWidth="1.5" fill="none" opacity="0.2" />
                {Array.from({ length: 24 }).map((_, i) => {
                    const a = (i * 15 * Math.PI) / 180;
                    return (
                        <line key={i}
                            x1={50 + 10 * Math.cos(a)} y1={50 + 10 * Math.sin(a)}
                            x2={50 + 44 * Math.cos(a)} y2={50 + 44 * Math.sin(a)}
                            stroke="white" strokeWidth="1.5" opacity="0.2" />
                    );
                })}
                <circle cx="50" cy="50" r="10" stroke="white" strokeWidth="2" fill="none" opacity="0.2" />
            </svg>
        </div>

        <div style={styles.tricolor}>
            <div style={{ flex: 1, background: '#FF9933' }} />
            <div style={{ flex: 1, background: '#ffffff' }} />
            <div style={{ flex: 1, background: '#138808' }} />
        </div>

        <div style={styles.visualContent}>
            <div style={styles.brandChip}>
                <span style={{ color: '#FF9933' }}>माझी</span>
                <span style={{ color: '#fff', margin: '0 3px' }}>-</span>
                <span style={{ color: '#4ADE80' }}>योजना</span>
            </div>

            {mode === 'signup-cta' ? (
                <>
                    <h2 style={styles.visualTitle}>New Here?</h2>
                    <p style={styles.visualDesc}>
                        Sign up and discover 30+ Maharashtra government
                        welfare schemes tailored just for you.
                    </p>
                    <ul style={styles.featureList}>
                        <li style={styles.featureItem}><FiCheckCircle size={18} color="#4ADE80"/>AI-powered recommendations</li>
                        <li style={styles.featureItem}><FiCheckCircle size={18} color="#4ADE80"/>Instant eligibility check</li>
                        <li style={styles.featureItem}><FiCheckCircle size={18} color="#4ADE80"/>100% free forever</li>
                        <li style={styles.featureItem}><FiCheckCircle size={18} color="#4ADE80"/>Multi-language support</li>
                    </ul>
                    <button onClick={onToggle} style={styles.visualBtn}>
                        Create Account <FiArrowRight style={{ marginLeft: 8 }} />
                    </button>
                </>
            ) : (
                <>
                    <h2 style={styles.visualTitle}>Welcome Back!</h2>
                    <p style={styles.visualDesc}>
                        Already have an account? Sign in to continue exploring
                        your personalized government scheme recommendations.
                    </p>
                    <ul style={styles.featureList}>
                        <li style={styles.featureItem}><FiCheckCircle size={18} color="#4ADE80"/>Your saved schemes</li>
                        <li style={styles.featureItem}><FiCheckCircle size={18} color="#4ADE80"/>Application tracking</li>
                        <li style={styles.featureItem}><FiCheckCircle size={18} color="#4ADE80"/>Personalized dashboard</li>
                        <li style={styles.featureItem}><FiCheckCircle size={18} color="#4ADE80"/>Priority scheme alerts</li>
                    </ul>
                    <button onClick={onToggle} style={styles.visualBtn}>
                        Sign In Instead <FiArrowRight style={{ marginLeft: 8 }} />
                    </button>
                </>
            )}

            <div style={styles.statsRow}>
                <div style={styles.statItem}>
                    <div style={styles.statNum}>30+</div>
                    <div style={styles.statLabel}>Schemes</div>
                </div>
                <div style={styles.statDivider} />
                <div style={styles.statItem}>
                    <div style={styles.statNum}>1000+</div>
                    <div style={styles.statLabel}>Users</div>
                </div>
                <div style={styles.statDivider} />
                <div style={styles.statItem}>
                    <div style={styles.statNum}>98%</div>
                    <div style={styles.statLabel}>Accuracy</div>
                </div>
            </div>
        </div>
    </div>
);

/* ═══════════════════════════════════════════
   FORM PANEL
═══════════════════════════════════════════ */
const FormPanel = ({
    type, loginData, setLoginData, signupData, setSignupData,
    error, loading, focused, setFocused, showPassword, setShowPwd,
    showConfirm, setShowConfirm, onSubmit, redirectMessage
}) => (
    <div style={styles.formSide} className={type === 'signup' ? 'slide-visual-in' : 'slide-form-in'}>
        <div style={styles.formBody} className="card-body">
            <FormLogo />

            {type === 'signin' ? (
                <>
                    <h1 style={styles.formTitle}>Welcome Back!</h1>
                    <p style={styles.formSubtitle}>Please log in to your account.</p>

                    {redirectMessage && (
                        <div style={styles.redirectBox}>
                            <FiAlertCircle style={{ fontSize: 18, flexShrink: 0 }} />
                            <span>{redirectMessage}</span>
                        </div>
                    )}

                    {error && <div style={styles.errorBox}>⚠️ {error}</div>}

                    <form onSubmit={onSubmit} style={styles.form}>
                        <Field
                            name="email" label="Email Address" type="email" Icon={FiMail}
                            placeholder="you@example.com"
                            value={loginData.email}
                            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                            focused={focused} setFocused={setFocused}
                        />
                        <Field
                            name="password" label="Password" type="password" Icon={FiLock}
                            placeholder="Enter your password"
                            value={loginData.password}
                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                            focused={focused} setFocused={setFocused}
                            showToggle showPassword={showPassword} setShowPwd={setShowPwd}
                        />

                        <button type="submit" disabled={loading}
                            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}>
                            {loading ? (<><div style={styles.spinner}/>Signing In...</>) : 'Sign In'}
                        </button>
                    </form>
                </>
            ) : (
                <>
                    <h1 style={styles.formTitle}>Create Account</h1>
                    <p style={styles.formSubtitle}>Join Majhi Yojana today. It's free!</p>

                    {redirectMessage && (
                        <div style={styles.redirectBox}>
                            <FiAlertCircle style={{ fontSize: 18, flexShrink: 0 }} />
                            <span>{redirectMessage}</span>
                        </div>
                    )}

                    {error && <div style={styles.errorBox}>⚠️ {error}</div>}

                    <form onSubmit={onSubmit} style={styles.form}>
                        <div style={styles.rowGrid}>
                            <Field
                                name="fullName" label="Full Name" type="text" Icon={FiUser}
                                placeholder="Rahul Sharma"
                                value={signupData.fullName}
                                onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                                focused={focused} setFocused={setFocused}
                            />
                            <Field
                                name="age" label="Age" type="number" Icon={FiCalendar}
                                placeholder="25" min="16" max="100"
                                value={signupData.age}
                                onChange={(e) => setSignupData({ ...signupData, age: e.target.value })}
                                focused={focused} setFocused={setFocused}
                            />
                        </div>

                        <Field
                            name="signup-email" label="Email Address" type="email" Icon={FiMail}
                            placeholder="you@example.com"
                            value={signupData.email}
                            onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                            focused={focused} setFocused={setFocused}
                        />

                        <div style={styles.rowGrid}>
                            <Field
                                name="mobile" label="Mobile" type="tel" Icon={FiPhone}
                                placeholder="10 digit" maxLength="10"
                                value={signupData.mobile}
                                onChange={(e) => setSignupData({ ...signupData, mobile: e.target.value.replace(/\D/g, '') })}
                                focused={focused} setFocused={setFocused}
                            />

                            <div style={styles.field}>
                                <label style={styles.fieldLabel}>Gender</label>
                                <div style={{
                                    ...styles.inputBox,
                                    borderColor: focused === 'gender' ? '#4F46E5' : '#E5E7EB',
                                    boxShadow: focused === 'gender'
                                        ? '0 0 0 4px rgba(79,70,229,0.08)' : 'none'
                                }}>
                                    <FiUser style={{
                                        ...styles.fieldIcon,
                                        color: focused === 'gender' ? '#4F46E5' : '#9CA3AF'
                                    }} />
                                    <select
                                        name="gender"
                                        value={signupData.gender}
                                        onChange={(e) => setSignupData({ ...signupData, gender: e.target.value })}
                                        onFocus={() => setFocused('gender')}
                                        onBlur={() => setFocused(null)}
                                        required
                                        style={styles.select}>
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div style={styles.rowGrid}>
                            <Field
                                name="signup-password" label="Password" type="password" Icon={FiLock}
                                placeholder="Min 6 chars"
                                value={signupData.password}
                                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                                focused={focused} setFocused={setFocused}
                                showToggle showPassword={showPassword} setShowPwd={setShowPwd}
                            />
                            <Field
                                name="confirm" label="Confirm" type="password" Icon={FiLock}
                                placeholder="Repeat"
                                value={signupData.confirm}
                                onChange={(e) => setSignupData({ ...signupData, confirm: e.target.value })}
                                focused={focused} setFocused={setFocused}
                                showToggle showPassword={showConfirm} setShowPwd={setShowConfirm}
                            />
                        </div>
                        <button type="submit" disabled={loading}
                            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1, marginTop: '14px' }}>
                            {loading ? (<><div style={styles.spinner}/>Creating Account...</>) : 'Create Account'}
                        </button>
                    </form>
                </>
            )}
        </div>
    </div>
);

const FormLogo = () => (
    <div style={styles.smallLogoRow}>
        <div style={styles.smallLogoIcon}>
            <svg width="30" height="30" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="#fff" stroke="#E5E7EB" strokeWidth="1"/>
                <path d="M50 8 A42 42 0 0 1 88 65" stroke="#FF9933" strokeWidth="5" strokeLinecap="round" fill="none"/>
                <path d="M12 60 A42 42 0 0 0 55 92" stroke="#138808" strokeWidth="5" strokeLinecap="round" fill="none"/>
                <path d="M42 42 Q50 32,58 42 L58 46 L42 46 Z" fill="#1E3A8A"/>
                <rect x="36" y="50" width="28" height="22" fill="#1E3A8A"/>
            </svg>
        </div>
        <div>
            <div style={styles.smallLogoMarathi}>
                <span style={{ color: '#FF6B1A' }}>माझी</span>
                <span style={{ color: '#1E3A8A' }}>-</span>
                <span style={{ color: '#138808' }}>योजना</span>
            </div>
            <div style={styles.smallLogoEng}>Majhi Yojana</div>
        </div>
    </div>
);

/* ═══════════════════════════════════════════
   ✅ FIXED FIELD COMPONENT (Full Width)
═══════════════════════════════════════════ */
const Field = ({
    name, label, type, Icon, placeholder, value, onChange,
    focused, setFocused, showToggle, showPassword, setShowPwd,
    min, max, maxLength
}) => (
    <div style={styles.field}>
        <label style={styles.fieldLabel}>{label}</label>
        <div style={{
            ...styles.inputBox,
            borderColor: focused === name ? '#4F46E5' : '#E5E7EB',
            boxShadow: focused === name
                ? '0 0 0 4px rgba(79,70,229,0.08)'
                : 'none'
        }}>
            <Icon style={{
                ...styles.fieldIcon,
                color: focused === name ? '#4F46E5' : '#9CA3AF'
            }} />
            <input
                type={showToggle && showPassword ? 'text' : type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onFocus={() => setFocused(name)}
                onBlur={() => setFocused(null)}
                autoComplete="off"
                required
                min={min}
                max={max}
                maxLength={maxLength}
                style={styles.input}
            />
            {showToggle && (
                <span onClick={() => setShowPwd(!showPassword)} style={styles.eyeIcon}>
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                </span>
            )}
        </div>
    </div>
);

/* ═══════════════════════════════════════════
   ✅ FIXED STYLES (Full Width Inputs)
═══════════════════════════════════════════ */
const styles = {
    page: {
        minHeight      : 'calc(100vh - 88px)',
        display        : 'flex',
        alignItems     : 'center',
        justifyContent : 'center',
        padding        : '30px 20px 60px',
        position       : 'relative',
        overflow       : 'hidden',
        backgroundSize : 'cover',
        backgroundPosition: 'center',
        transition     : 'background-image 0.6s ease-in-out'
    },
    bgBlob1: {
        position: 'absolute', top: '-150px', left: '-150px',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(79,70,229,0.3) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
    },
    bgBlob2: {
        position: 'absolute', bottom: '-150px', right: '-150px',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(249,115,22,0.3) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
    },
    card: {
        width: '100%', maxWidth: '1050px', height: '640px',
        background: '#ffffff', borderRadius: '24px',
        overflow: 'hidden', display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
        zIndex: 2, position: 'relative',
        transition: 'opacity 0.3s ease'
    },
    side: { position: 'relative', overflow: 'hidden', height: '100%' },
    sideVisual: {
        background: 'linear-gradient(160deg, #1E1B4B 0%, #312E81 40%, #4F46E5 100%)'
    },
    sideForm: { background: '#ffffff' },

    /* VISUAL PANEL */
    visual: { position: 'relative', height: '100%', color: '#ffffff', overflow: 'hidden' },
    chakra: {
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '300px', height: '300px',
        opacity: 0.35, pointerEvents: 'none', zIndex: 1
    },
    tricolor: {
        display: 'flex', height: '4px', width: '100%',
        position: 'absolute', top: 0, left: 0, zIndex: 5
    },
    visualContent: {
        position: 'relative', zIndex: 3,
        padding: '60px 40px 40px', height: '100%',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between'
    },
    brandChip: {
        display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center',
        background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
        padding: '10px 20px', borderRadius: '100px',
        border: '1px solid rgba(255,255,255,0.25)',
        marginBottom: '32px', fontSize: '16px', fontWeight: '800',
        fontFamily: "'Noto Sans Devanagari', sans-serif"
    },
    visualTitle: {
        fontSize: '36px', fontWeight: '900',
        marginBottom: '14px', letterSpacing: '-1px', lineHeight: '1.1'
    },
    visualDesc: {
        fontSize: '14px', lineHeight: '1.75',
        opacity: 0.9, marginBottom: '26px'
    },
    featureList: { listStyle: 'none', padding: 0, margin: '0 0 26px 0' },
    featureItem: {
        display: 'flex', alignItems: 'center', gap: '10px',
        fontSize: '13.5px', padding: '7px 0',
        opacity: 0.95, fontWeight: '500'
    },
    visualBtn: {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        padding: '13px 26px', background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(10px)', color: '#ffffff',
        border: '2px solid rgba(255,255,255,0.4)',
        borderRadius: '12px', fontSize: '13px', fontWeight: '700',
        cursor: 'pointer', transition: 'all 0.25s',
        letterSpacing: '0.5px', fontFamily: 'inherit',
        alignSelf: 'flex-start', textTransform: 'uppercase'
    },
    statsRow: {
        display: 'flex', alignItems: 'center', gap: '20px',
        marginTop: 'auto', paddingTop: '28px',
        borderTop: '1px solid rgba(255,255,255,0.15)'
    },
    statItem: { flex: 1, textAlign: 'center' },
    statNum: {
        fontSize: '22px', fontWeight: '800',
        letterSpacing: '-0.5px', marginBottom: '2px'
    },
    statLabel: {
        fontSize: '10.5px', opacity: 0.7,
        fontWeight: '600', letterSpacing: '0.5px',
        textTransform: 'uppercase'
    },
    statDivider: {
        width: '1px', height: '30px',
        background: 'rgba(255,255,255,0.15)'
    },

    /* ✅ FORM SIDE - FIXED WIDTH */
    formSide: {
        height: '100%',
        overflow: 'hidden',
        width: '100%'          // ← ADDED
    },
    formBody: {
        height: '100%',
        overflowY: 'auto',
        padding: '40px 45px',
        width: '100%',         // ← ADDED
        boxSizing: 'border-box' // ← ADDED
    },
    form: {
        width: '100%'          // ← ADDED
    },

    smallLogoRow: {
        display: 'flex', alignItems: 'center',
        gap: '10px', marginBottom: '20px'
    },
    smallLogoIcon: {
        width: '40px', height: '40px', borderRadius: '50%',
        background: '#ffffff', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        border: '1px solid #E5E7EB',
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
    },
    smallLogoMarathi: {
        fontSize: '15px', fontWeight: '800',
        fontFamily: "'Noto Sans Devanagari', sans-serif",
        lineHeight: '1.1'
    },
    smallLogoEng: {
        fontSize: '11px', fontWeight: '700',
        color: '#111827', marginTop: '2px'
    },

    formTitle: {
        fontSize: '26px', fontWeight: '900',
        color: '#111827', marginBottom: '6px',
        letterSpacing: '-0.5px'
    },
    formSubtitle: {
        fontSize: '13px', color: '#6B7280', marginBottom: '22px'
    },

    redirectBox: {
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
        color: '#92400E', padding: '12px 16px',
        borderRadius: '10px', fontSize: '12.5px',
        marginBottom: '16px',
        border: '1px solid #FCD34D',
        fontWeight: '600', lineHeight: 1.5
    },
    errorBox: {
        background: '#FEF2F2', color: '#991B1B',
        padding: '11px 14px', borderRadius: '10px',
        fontSize: '12.5px', marginBottom: '16px',
        border: '1px solid #FECACA', fontWeight: '500'
    },

    /* ✅ FIELD - FULL WIDTH */
    field: {
        marginBottom: '14px',
        width: '100%'          // ← ADDED
    },
    fieldLabel: {
        display: 'block', fontSize: '11.5px',
        fontWeight: '700', color: '#374151',
        marginBottom: '5px', letterSpacing: '0.3px'
    },
    inputBox: {
        display: 'flex', alignItems: 'center',
        background: '#ffffff', border: '1.5px solid #E5E7EB',
        borderRadius: '10px', padding: '0 12px',
        transition: 'all 0.2s ease',
        width: '100%',         // ← ADDED
        boxSizing: 'border-box' // ← ADDED
    },
    fieldIcon: {
        fontSize: '16px', marginRight: '8px',
        transition: 'color 0.2s', flexShrink: 0
    },
    /* ✅ INPUT - FULL WIDTH FIX */
    input: {
        flex: 1,
        padding: '12px 0',
        fontSize: '14px',
        border: 'none',
        outline: 'none',
        background: 'transparent',
        color: '#111827',
        fontFamily: 'inherit',
        fontWeight: '500',
        WebkitAppearance: 'none',
        appearance: 'none',
        width: '100%',           // ← CHANGED
        minWidth: 0,
        boxSizing: 'border-box'  // ← ADDED
    },
    select: {
        flex: 1,
        padding: '12px 0',
        fontSize: '14px',
        border: 'none',
        outline: 'none',
        background: 'transparent',
        color: '#111827',
        fontFamily: 'inherit',
        fontWeight: '500',
        cursor: 'pointer',
        width: '100%'
    },
    eyeIcon: {
        cursor: 'pointer', color: '#9CA3AF',
        fontSize: '16px', marginLeft: '8px',
        display: 'flex', alignItems: 'center', flexShrink: 0
    },
    rowGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        width: '100%'          // ← ADDED
    },
    submitBtn: {
        width: '100%',
        padding: '14px',
        background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
        color: '#ffffff', border: 'none',
        borderRadius: '10px', fontSize: '14px',
        fontWeight: '700', display: 'inline-flex',
        alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.25s',
        boxShadow: '0 8px 20px rgba(79,70,229,0.3)',
        fontFamily: 'inherit', letterSpacing: '0.3px',
        cursor: 'pointer',
        boxSizing: 'border-box',   // ← ADDED
        marginTop: '20px'          // ← ADDED
    },
    spinner: {
        width: '15px', height: '15px',
        border: '2.5px solid rgba(255,255,255,0.3)',
        borderTopColor: '#ffffff', borderRadius: '50%',
        marginRight: '8px', animation: 'spin 0.8s linear infinite'
    },
    bottomBrand: {
        position: 'absolute', bottom: '15px',
        left: '50%', transform: 'translateX(-50%)',
        fontSize: '12px', color: '#ffffff',
        fontWeight: '600', letterSpacing: '0.5px',
        zIndex: 3, textShadow: '0 2px 8px rgba(0,0,0,0.5)'
    }
};

export default AuthPage;