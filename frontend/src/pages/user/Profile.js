import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import { calculateProfileCompletion } from '../../utils/profileUtils';
import {
    FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase,
    FiSave, FiCheckCircle, FiAlertCircle,
    FiArrowRight, FiArrowLeft, FiCalendar, FiLoader
} from 'react-icons/fi';
import { FaIdCard, FaHome, FaUserFriends, FaMapMarkedAlt } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';

// ─── MAHARASHTRA DISTRICT & TALUKA DATA ───
const maharashtraData = {
    "Ahmednagar": ["Nagar", "Shevgaon", "Pathardi", "Nevala", "Jamkhed", "Karjat", "Shrigonda", "Parner", "Akole", "Sangamner", "Kopargaon", "Rahata", "Shrirampur", "Rahuri"],
    "Akola": ["Akola", "Akot", "Telhara", "Balapur", "Murtijapur", "Patur", "Barshitakli"],
    "Amravati": ["Amravati", "Bhatkuli", "Nandgaon Khandeshwar", "Anjangaon Surji", "Achalpur", "Chandur Bazar", "Morshi", "Warud", "Tiosa", "Chandur Railway", "Dhamangaon Railway", "Chikhaldara", "Dharni"],
    "Aurangabad": ["Aurangabad", "Kannad", "Soegaon", "Sillod", "Phulambri", "Khuldabad", "Vaijapur", "Gangapur", "Paithan"],
    "Beed": ["Beed", "Ashti", "Patoda", "Shirur Kasar", "Georai", "Majalgaon", "Wadwani", "Kaij", "Dharur", "Parli", "Ambejogai"],
    "Bhandara": ["Bhandara", "Tumsar", "Pauni", "Mohadi", "Sakoli", "Lakhandur", "Lakhani"],
    "Buldhana": ["Buldhana", "Chikhli", "Deulgaon Raja", "Jalgaon Jamod", "Sindkhed Raja", "Lonar", "Mehkar", "Khamgaon", "Nandura", "Motala", "Malkapur", "Nandura", "Shegaon", "Sangrampur"],
    "Chandrapur": ["Chandrapur", "Saoli", "Mul", "Gondpipri", "Pombhurna", "Sindewahi", "Rajura", "Korpana", "Jivati", "Ballarpur", "Bhadravati", "Warora", "Chimur", "Nagbhid", "Bramhapuri"],
    "Dhule": ["Dhule", "Sakri", "Sindkheda", "Shirpur"],
    "Gadchiroli": ["Gadchiroli", "Chamorshi", "Mulchera", "Desaiganj", "Armori", "Kurkheda", "Korchi", "Dhanora", "Etapalli", "Bhamragad", "Aheri", "Sironcha"],
    "Gondia": ["Gondia", "Tirora", "Goregaon", "Amgaon", "Salekasa", "Sadak Arjuni", "Arjuni Morgaon", "Deori"],
    "Hingoli": ["Hingoli", "Kalamnuri", "Sengaon", "Aundha Nagnath", "Basmath"],
    "Jalgaon": ["Jalgaon", "Bhusawal", "Amalner", "Chopda", "Erandol", "Parola", "Yawal", "Muktainagar", "Raver", "Bhadgaon", "Chalisgaon", "Pachora", "Jamner", "Bodwad", "Dharangaon"],
    "Jalna": ["Jalna", "Ambad", "Bhokardan", "Jafrabad", "Badnapur", "Partur", "Ghansawangi", "Mantha"],
    "Kolhapur": ["Karvir", "Panhala", "Shahuwadi", "Kagal", "Hatkanangale", "Shirol", "Radhanagari", "Gaganbawada", "Bhudargad", "Ajara", "Chandgad", "Gadhinglaj"],
    "Latur": ["Latur", "Ausa", "Nilanga", "Renapur", "Chakur", "Deoni", "Shirur Anantpal", "Udgir", "Jalkot", "Ahmedpur"],
    "Mumbai City": ["Mumbai City"],
    "Mumbai Suburban": ["Kurla", "Andheri", "Borivali"],
    "Nagpur": ["Nagpur Urban", "Nagpur Rural", "Kamptee", "Hingna", "Katol", "Narkhed", "Savner", "Kalameshwar", "Ramtek", "Mouda", "Parseoni", "Umred", "Kuhi", "Bhiwapur"],
    "Nanded": ["Nanded", "Ardhapur", "Mudkhed", "Bhokar", "Umri", "Loha", "Kandhar", "Kinwat", "Himayatnagar", "Hadgaon", "Mahur", "Deglur", "Mukhed", "Dharmabad", "Biloli", "Naigaon"],
    "Nandurbar": ["Nandurbar", "Navapur", "Shahada", "Talode", "Akkalkuwa", "Akrani"],
    "Nashik": ["Nashik", "Igatpuri", "Dindori", "Peth", "Trimbakeshwar", "Kalwan", "Deola", "Surgana", "Baglan", "Malegaon", "Nandgaon", "Chandwad", "Niphad", "Sinnar", "Yeola"],
    "Osmanabad": ["Dharashiv", "Tuljapur", "Bhum", "Paranda", "Washi", "Kalamb", "Lohara", "Umarga"],
    "Palghar": ["Palghar", "Vasai", "Dahanu", "Talasari", "Jawhar", "Mokhada", "Vada", "Vikramgad"],
    "Parbhani": ["Parbhani", "Sonpeth", "Gangakhed", "Palam", "Purna", "Sailu", "Jintur", "Manwath", "Pathri"],
    "Pune": ["Pune City", "Haveli", "Khed", "Shirur", "Junnar", "Ambegaon", "Maval", "Mulshi", "Bhor", "Velhe", "Purandar", "Baramati", "Indapur", "Daund"],
    "Raigad": ["Alibag", "Uran", "Pen", "Panvel", "Khalapur", "Karjat", "Roha", "Sudhagad", "Mangaon", "Tala", "Murud", "Shrivardhan", "Mhasla", "Mahad", "Poladpur"],
    "Ratnagiri": ["Ratnagiri", "Sangameshwar", "Lanja", "Rajapur", "Chiplun", "Guhagar", "Khed", "Dapoli", "Mandangad"],
    "Sangli": ["Miraj", "Kavathe-Mahankal", "Tasgaon", "Jat", "Shirala", "Walwa", "Khanapur", "Palus", "Atpadi", "Kadegaon"],
    "Satara": ["Satara", "Karad", "Wai", "Mahabaleshwar", "Khandala", "Phaltan", "Khatav", "Man", "Koregaon", "Patan", "Jaoli"],
    "Sindhudurg": ["Kudal", "Malvan", "Devgad", "Vengurla", "Kankavli", "Sawantwadi", "Dodamarg", "Vaibhavwadi"],
    "Solapur": ["Solapur North", "Solapur South", "Akkalkot", "Barshi", "Mangalwedha", "Pandharpur", "Sangola", "Malshiras", "Mohol", "Madha", "Karmala"],
    "Thane": ["Thane", "Kalyan", "Murbad", "Bhiwandi", "Shahapur", "Ulhasnagar", "Ambarnath"],
    "Wardha": ["Wardha", "Deoli", "Seloo", "Arvi", "Ashti", "Karanja", "Hinganghat", "Samudrapur"],
    "Washim": ["Washim", "Malegaon", "Risod", "Mangrulpir", "Karanja", "Manora"],
    "Yavatmal": ["Yavatmal", "Arni", "Babulgaon", "Kalamb", "Darwha", "Digras", "Ner", "Pusad", "Umarkhed", "Mahagaon", "Kelapur", "Ralegaon", "Ghatanji", "Wani", "Maregaon", "Zari Jamani"]
};

const Profile = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    const [activeSection, setActiveSection] = useState('personal');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState('');
    const [fetchingPin, setFetchingPin] = useState(false);

    const [profile, setProfile] = useState({
        fullName: '', email: '', phone: '', dateOfBirth: '', age: '', gender: '',
        address: '', district: '', taluka: '', city: '', pincode: '', state: 'Maharashtra', ruralUrban: '',
        category: '', aadhaarNumber: '', panNumber: '', rationCard: '', bplStatus: false,
        occupation: '', annualIncome: '', employmentStatus: '', educationLevel: '',
        maritalStatus: '', familyMembers: '',
        isWidow: false, isSeniorCitizen: false, isDisabled: false, disabilityType: '',
        landOwnership: '', houseStatus: ''
    });

    const sectionOrder = ['personal', 'address', 'documents', 'employment', 'family', 'additional'];

    // ─── Helpers: Format Date ───
    const formatDateForInput = (dateStr, age) => {
        if (dateStr && typeof dateStr === 'string') {
            let str = dateStr.trim();
            if (str.includes('T')) str = str.split('T')[0];
            const ymdMatch = str.match(/^(\d{4})[-/.](0?[1-9]|1[012])[-/.](0?[1-9]|[12][0-9]|3[01])$/);
            if (ymdMatch) return `${ymdMatch[1]}-${ymdMatch[2].padStart(2, '0')}-${ymdMatch[3].padStart(2, '0')}`;
        }
        if (dateStr) {
            try {
                const d = new Date(dateStr);
                if (!isNaN(d.getTime())) {
                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                }
            } catch (e) { }
        }
        if (age) {
            const parsedAge = parseInt(age);
            if (!isNaN(parsedAge) && parsedAge > 0 && parsedAge < 110) {
                const estYear = new Date().getFullYear() - parsedAge;
                return `${estYear}-01-01`;
            }
        }
        return '';
    };

    const formatDateForDisplay = (dateStr) => {
        if (!dateStr) return '';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch (e) { return dateStr; }
    };

    // ─── Fetch Profile ───
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await userAPI.getProfile();
                const data = response.data.data || response.data;
                if (data) {
                    const userAge = data.age ? data.age.toString() : '';
                    const formattedDob = formatDateForInput(data.dateOfBirth, userAge);
                    setProfile({
                        fullName: data.fullName || '', email: data.email || '', phone: data.mobile || '',
                        dateOfBirth: formattedDob, age: userAge, gender: data.gender || '',
                        address: data.address || '', district: data.district || '', taluka: data.taluka || '',
                        city: data.city || '', pincode: data.pincode || '', state: data.state || 'Maharashtra',
                        ruralUrban: data.ruralUrban || '', category: data.category || '',
                        aadhaarNumber: data.aadhaarNumber || '', panNumber: data.panNumber || '',
                        rationCard: data.rationCard || '', bplStatus: data.bplCard === 'Yes',
                        occupation: data.occupation || '', annualIncome: data.annualIncome ? data.annualIncome.toString() : '',
                        employmentStatus: data.employmentStatus || '', educationLevel: data.education || '',
                        maritalStatus: data.maritalStatus || '', familyMembers: data.familySize ? data.familySize.toString() : '',
                        isWidow: data.widowStatus === 'Yes', isSeniorCitizen: data.seniorCitizen === 'Yes' || (userAge && parseInt(userAge) >= 60),
                        isDisabled: data.disability === 'Yes', disabilityType: data.disabilityType || '',
                        landOwnership: data.landOwnership ? data.landOwnership.toString() : '', houseStatus: data.houseOwnership || ''
                    });
                }
            } catch (err) {
                console.error('❌ Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchProfile();
    }, [user]);

    // ─── Handle Change ───
    const handleChange = (field, value) => {
        setProfile(prev => {
            const updated = { ...prev, [field]: value };
            if (field === 'dateOfBirth' && value) {
                const today = new Date();
                const birthDate = new Date(value);
                if (!isNaN(birthDate.getTime())) {
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const m = today.getMonth() - birthDate.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
                    if (age >= 0 && age < 120) {
                        updated.age = age.toString();
                        if (age >= 60) updated.isSeniorCitizen = true;
                    }
                }
            }
            // Auto-clear taluka if district changes to avoid mismatch
            if (field === 'district') {
                updated.taluka = ''; 
            }
            return updated;
        });
    };

    // ─── Pincode Auto-Fill Logic ───
    const handlePincodeChange = async (pin) => {
        handleChange('pincode', pin);
        
        if (pin.length === 6) {
            setFetchingPin(true);
            try {
                const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
                const data = await res.json();
                if (data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
                    const postOffice = data[0].PostOffice[0];
                    
                    // Match API district string with our exact district list
                    let matchedDistrict = postOffice.District;
                    const apiDist = matchedDistrict.toLowerCase();
                    const exactMatch = Object.keys(maharashtraData).find(d => d.toLowerCase() === apiDist || apiDist.includes(d.toLowerCase()));
                    if (exactMatch) matchedDistrict = exactMatch;

                    setProfile(prev => ({
                        ...prev,
                        city: postOffice.Name,
                        district: matchedDistrict,
                        taluka: postOffice.Block !== "NA" ? postOffice.Block : matchedDistrict,
                        state: postOffice.State
                    }));
                }
            } catch (e) {
                console.error("Pincode fetch error", e);
            } finally {
                setFetchingPin(false);
            }
        }
    };

    // ─── Completion calculation ───
    const backendMapped = {
        fullName: profile.fullName, email: profile.email, mobile: profile.phone,
        dateOfBirth: profile.dateOfBirth, age: profile.age, gender: profile.gender, 
        district: profile.district, category: profile.category, 
        occupation: profile.occupation, annualIncome: profile.annualIncome, 
        education: profile.educationLevel, maritalStatus: profile.maritalStatus
    };
    const completion = calculateProfileCompletion(backendMapped);

    // ─── Save Profile ───
    const handleSave = async (moveToNext = false) => {
        setError('');
        try {
            setSaving(true);
            const backendData = {
                fullName: profile.fullName, email: profile.email, mobile: profile.phone,
                dateOfBirth: profile.dateOfBirth, age: profile.age ? parseInt(profile.age) : null,
                gender: profile.gender, address: profile.address, district: profile.district,
                taluka: profile.taluka, city: profile.city, pincode: profile.pincode,
                ruralUrban: profile.ruralUrban, category: profile.category, aadhaarNumber: profile.aadhaarNumber,
                panNumber: profile.panNumber, rationCard: profile.rationCard, bplCard: profile.bplStatus ? 'Yes' : 'No',
                occupation: profile.occupation, annualIncome: profile.annualIncome ? parseFloat(profile.annualIncome) : null,
                employmentStatus: profile.employmentStatus, education: profile.educationLevel,
                maritalStatus: profile.maritalStatus, familySize: profile.familyMembers ? parseInt(profile.familyMembers) : null,
                widowStatus: profile.isWidow ? 'Yes' : 'No', seniorCitizen: profile.isSeniorCitizen ? 'Yes' : 'No',
                disability: profile.isDisabled ? 'Yes' : 'No', disabilityType: profile.disabilityType,
                landOwnership: profile.landOwnership ? parseFloat(profile.landOwnership) : 0, houseOwnership: profile.houseStatus
            };

            const response = await userAPI.updateProfile(backendData);
            const savedData = response.data.data || response.data;
            updateUser({ ...user, ...savedData });

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2500);

            if (moveToNext) {
                const currentIndex = sectionOrder.indexOf(activeSection);
                if (currentIndex < sectionOrder.length - 1) {
                    setTimeout(() => {
                        setActiveSection(sectionOrder[currentIndex + 1]);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 500);
                }
            }
            return true;
        } catch (err) {
            console.error('❌ Save error:', err);
            setError('Failed to save profile. Please try again.');
            setTimeout(() => setError(''), 3000);
            return false;
        } finally {
            setSaving(false);
        }
    };

    const goToPreviousSection = () => {
        const currentIndex = sectionOrder.indexOf(activeSection);
        if (currentIndex > 0) {
            setActiveSection(sectionOrder[currentIndex - 1]);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const isSectionFilled = (sid) => {
        const fields = {
            personal: ['fullName', 'phone', 'gender', 'dateOfBirth'],
            address: ['district', 'city', 'ruralUrban', 'pincode'],
            documents: ['category', 'aadhaarNumber'],
            employment: ['occupation', 'annualIncome', 'educationLevel'],
            family: ['maritalStatus'],
            additional: ['houseStatus']
        };
        return (fields[sid] || []).every(f => profile[f]);
    };

    const sections = [
        { id: 'personal',   label: 'Personal Info',   icon: <FiUser />,        color: '#4F46E5' },
        { id: 'address',    label: 'Address',         icon: <FaMapMarkedAlt />, color: '#F97316' },
        { id: 'documents',  label: 'Documents',       icon: <FaIdCard />,      color: '#10B981' },
        { id: 'employment', label: 'Employment',      icon: <FiBriefcase />,   color: '#F59E0B' },
        { id: 'family',     label: 'Family Details',  icon: <FaUserFriends />, color: '#EC4899' },
        { id: 'additional', label: 'Additional Info', icon: <FaHome />,        color: '#3B82F6' }
    ];

    if (loading) {
        return (
            <div style={styles.loadingWrap}>
                <div style={styles.spinner}></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div style={styles.wrapper}>

            {/* HEADER BANNER */}
            <section style={styles.headerBanner}>
                <div style={styles.bannerDecor1}></div>
                <div style={styles.bannerDecor2}></div>
                <div style={styles.headerContainer}>
                    <div style={styles.headerLeft}>
                        <div style={styles.avatar}>{profile.fullName?.charAt(0)?.toUpperCase() || 'U'}</div>
                        <div>
                            <div style={styles.userBadge}>
                                <HiSparkles style={{ marginRight: 6, color: '#F97316' }} />
                                माझी योजना.AI Member
                            </div>
                            <h1 style={styles.userName}>{profile.fullName || 'Complete Your Profile'}</h1>
                            <div style={styles.userMeta}>
                                <span style={styles.metaItem}>
                                    <FiMail style={styles.metaIcon} />
                                    {profile.email || 'No email'}
                                </span>
                                {profile.phone && (
                                    <span style={styles.metaItem}>
                                        <FiPhone style={styles.metaIcon} />
                                        {profile.phone}
                                    </span>
                                )}
                                {profile.dateOfBirth && (
                                    <span style={styles.metaItem}>
                                        <FiCalendar style={styles.metaIcon} />
                                        DOB: {formatDateForDisplay(profile.dateOfBirth)} {profile.age ? `(${profile.age} yrs)` : ''}
                                    </span>
                                )}
                                {profile.district && (
                                    <span style={styles.metaItem}>
                                        <FiMapPin style={styles.metaIcon} />
                                        {profile.district}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div style={styles.headerRight}>
                        <div style={styles.completionCard}>
                            <div style={styles.completionHeader}>
                                <span style={styles.completionLabel}>Profile Completion</span>
                                <span style={styles.completionValue}>{completion}%</span>
                            </div>
                            <div style={styles.progressBarWrap}>
                                <div style={{
                                    ...styles.progressBar,
                                    width: `${completion}%`,
                                    background: completion >= 80
                                        ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
                                        : completion >= 50
                                        ? 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)'
                                        : 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)'
                                }}></div>
                            </div>
                            <p style={styles.completionHint}>
                                {completion >= 80 ? '✓ Complete! Get AI recommendations now.' : `${80 - completion}% more to unlock AI recommendations`}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* MAIN CONTENT */}
            <section style={styles.mainSection}>
                <div style={styles.mainContainer}>
                    <aside style={styles.sidebar}>
                        <div style={styles.sidebarHeader}>
                            <FiUser style={{ color: '#4F46E5', fontSize: 20 }} />
                            <h3 style={styles.sidebarTitle}>Profile Sections</h3>
                        </div>
                        <div style={styles.sidebarNav}>
                            {sections.map((sec) => {
                                const filled = isSectionFilled(sec.id);
                                const isActive = activeSection === sec.id;
                                return (
                                    <button
                                        key={sec.id}
                                        onClick={() => setActiveSection(sec.id)}
                                        style={{
                                            ...styles.sidebarItem,
                                            ...(isActive ? { ...styles.sidebarItemActive, borderLeftColor: sec.color } : {})
                                        }}>
                                        <div style={{
                                            ...styles.sidebarIcon,
                                            background: filled ? '#F0FDF4' : `${sec.color}15`,
                                            color: filled ? '#10B981' : sec.color
                                        }}>
                                            {filled ? <FiCheckCircle /> : sec.icon}
                                        </div>
                                        <span style={styles.sidebarLabel}>{sec.label}</span>
                                        {filled && <span style={styles.completeDot}></span>}
                                    </button>
                                );
                            })}
                        </div>
                        <div style={styles.infoCard}>
                            <div style={styles.infoIcon}>💡</div>
                            <h4 style={styles.infoTitle}>Fast Fill</h4>
                            <p style={styles.infoText}>Enter your Pincode in the Address section to auto-fill your location details.</p>
                        </div>
                    </aside>

                    <div style={styles.formArea}>
                        {showSuccess && (
                            <div style={styles.successToast}>
                                <FiCheckCircle style={{ fontSize: 20, marginRight: 10 }} />
                                <span>✓ Profile saved successfully!</span>
                            </div>
                        )}
                        {error && (
                            <div style={styles.errorToast}>
                                <FiAlertCircle style={{ fontSize: 20, marginRight: 10 }} />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* PERSONAL SECTION */}
                        {activeSection === 'personal' && (
                            <div style={styles.formCard}>
                                <div style={styles.formHeader}>
                                    <div style={{ ...styles.formHeaderIcon, background: '#EEF2FF', color: '#4F46E5' }}>
                                        <FiUser />
                                    </div>
                                    <div>
                                        <h2 style={styles.formTitle}>Personal Information</h2>
                                        <p style={styles.formSubtitle}>Basic details about you • वैयक्तिक माहिती</p>
                                    </div>
                                </div>
                                <div style={styles.formGrid}>
                                    <Input label="Full Name" value={profile.fullName} onChange={v => handleChange('fullName', v)} placeholder="Enter your full name" />
                                    <Input label="Email" type="email" value={profile.email} onChange={v => handleChange('email', v)} disabled />
                                    <Input label="Phone" type="tel" value={profile.phone} onChange={v => handleChange('phone', v)} placeholder="+91 9876543210" />
                                    <Input label="Date of Birth" type="date" value={profile.dateOfBirth} onChange={v => handleChange('dateOfBirth', v)} />
                                    <Input label="Age" type="number" value={profile.age} onChange={v => handleChange('age', v)} placeholder="Auto-calculated from DOB" />
                                    <Select label="Gender" value={profile.gender} onChange={v => handleChange('gender', v)}
                                        options={[{ value: 'Male', label: 'Male / पुरुष' }, { value: 'Female', label: 'Female / स्त्री' }, { value: 'Other', label: 'Other / इतर' }]} />
                                </div>
                            </div>
                        )}

                        {/* 📍 ADDRESS SECTION (UPDATED WITH PINCODE & DROPDOWNS) */}
                        {activeSection === 'address' && (
                            <div style={styles.formCard}>
                                <div style={styles.formHeader}>
                                    <div style={{ ...styles.formHeaderIcon, background: '#FFF7ED', color: '#F97316' }}><FaMapMarkedAlt /></div>
                                    <div>
                                        <h2 style={styles.formTitle}>Address Details</h2>
                                        <p style={styles.formSubtitle}>Where you live • पत्ता तपशील</p>
                                    </div>
                                </div>
                                
                                <div style={styles.noteBoxAddress}>
                                    <FiMapPin style={{ color: '#F97316', fontSize: 20, flexShrink: 0 }} />
                                    <div>
                                        <strong>Magic Autofill:</strong> Enter your 6-digit Pincode to automatically fetch your District, Taluka, and City.
                                    </div>
                                </div>

                                <div style={styles.formGrid}>
                                    {/* PINCODE (Triggers Auto-fill) */}
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>
                                            Pincode 
                                            {fetchingPin && <span style={{color: '#F97316', marginLeft: 8, fontSize: 11, fontWeight: 600}}><FiLoader className="spin" style={{display: 'inline', marginBottom: -2}} /> Fetching...</span>}
                                        </label>
                                        <input 
                                            type="text" 
                                            maxLength="6"
                                            value={profile.pincode || ''} 
                                            onChange={(e) => handlePincodeChange(e.target.value.replace(/\D/g, ''))}
                                            placeholder="e.g. 444705" 
                                            style={styles.input} 
                                        />
                                    </div>

                                    {/* DISTRICT (Dropdown) */}
                                    <Select 
                                        label="District" 
                                        value={profile.district} 
                                        onChange={v => handleChange('district', v)}
                                        options={Object.keys(maharashtraData).map(d => ({ value: d, label: d }))} 
                                    />
                                    
                                    {/* TALUKA (Dropdown dependent on District) */}
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Taluka / Block</label>
                                        <select 
                                            value={profile.taluka || ''} 
                                            onChange={(e) => handleChange('taluka', e.target.value)} 
                                            style={styles.select}
                                            disabled={!profile.district}
                                        >
                                            <option value="">{profile.district ? 'Select Taluka' : 'Select District first'}</option>
                                            {profile.district && maharashtraData[profile.district]
                                                ? maharashtraData[profile.district].map(t => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))
                                                : profile.taluka && <option value={profile.taluka}>{profile.taluka}</option> // Fallback if auto-filled but not in strict list
                                            }
                                        </select>
                                    </div>

                                    <Input label="City / Village" value={profile.city} onChange={v => handleChange('city', v)} placeholder="Your city or village" />
                                    
                                    <Select label="Area Type" value={profile.ruralUrban} onChange={v => handleChange('ruralUrban', v)}
                                        options={[{ value: 'Rural', label: 'Rural / ग्रामीण' }, { value: 'Urban', label: 'Urban / शहरी' }]} />
                                    
                                    <Input label="State" value={profile.state || "Maharashtra"} disabled />
                                </div>
                            </div>
                        )}

                        {/* DOCUMENTS SECTION */}
                        {activeSection === 'documents' && (
                            <div style={styles.formCard}>
                                <div style={styles.formHeader}>
                                    <div style={{ ...styles.formHeaderIcon, background: '#ECFDF5', color: '#10B981' }}><FaIdCard /></div>
                                    <div>
                                        <h2 style={styles.formTitle}>Category & Documents</h2>
                                        <p style={styles.formSubtitle}>ID and category info • श्रेणी आणि कागदपत्रे</p>
                                    </div>
                                </div>
                                <div style={styles.formGrid}>
                                    <Select label="Category" value={profile.category} onChange={v => handleChange('category', v)}
                                        options={[
                                            { value: 'General', label: 'General / सर्वसाधारण' }, { value: 'OBC', label: 'OBC' },
                                            { value: 'SC', label: 'SC / अनुसूचित जाती' }, { value: 'ST', label: 'ST / अनुसूचित जमाती' },
                                            { value: 'NT', label: 'NT / भटक्या जमाती' }, { value: 'VJ', label: 'VJ / विमुक्त जमाती' },
                                            { value: 'EWS', label: 'EWS' }
                                        ]} />
                                    <Input label="Aadhaar Number" maxLength="12" value={profile.aadhaarNumber} onChange={v => handleChange('aadhaarNumber', v.replace(/\D/g, ''))} placeholder="12 digit Aadhaar" />
                                    <Input label="PAN Number" maxLength="10" value={profile.panNumber} onChange={v => handleChange('panNumber', v.toUpperCase())} placeholder="ABCDE1234F" />
                                    <Input label="Ration Card Number" value={profile.rationCard} onChange={v => handleChange('rationCard', v)} placeholder="Ration card number" />
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <Checkbox checked={profile.bplStatus} onChange={v => handleChange('bplStatus', v)}
                                            label="I hold a BPL card" desc="Below Poverty Line — enables more schemes" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* EMPLOYMENT SECTION */}
                        {activeSection === 'employment' && (
                            <div style={styles.formCard}>
                                <div style={styles.formHeader}>
                                    <div style={{ ...styles.formHeaderIcon, background: '#FEF3C7', color: '#F59E0B' }}><FiBriefcase /></div>
                                    <div>
                                        <h2 style={styles.formTitle}>Employment & Income</h2>
                                        <p style={styles.formSubtitle}>Work and education • रोजगार आणि उत्पन्न</p>
                                    </div>
                                </div>
                                <div style={styles.formGrid}>
                                    <Select label="Occupation" value={profile.occupation} onChange={v => handleChange('occupation', v)}
                                        options={[
                                            { value: 'Farmer', label: 'Farmer / शेतकरी' }, { value: 'Student', label: 'Student / विद्यार्थी' },
                                            { value: 'Government Employee', label: 'Government Employee' }, { value: 'Private Employee', label: 'Private Employee' },
                                            { value: 'Self Employed', label: 'Self Employed' }, { value: 'Small Business Owner', label: 'Small Business Owner' },
                                            { value: 'Daily Wage Worker', label: 'Daily Wage Worker' }, { value: 'Homemaker', label: 'Homemaker' },
                                            { value: 'Unemployed', label: 'Unemployed / बेरोजगार' }, { value: 'Retired', label: 'Retired / निवृत्त' }
                                        ]} />
                                    <Select label="Employment Status" value={profile.employmentStatus} onChange={v => handleChange('employmentStatus', v)}
                                        options={[
                                            { value: 'Employed', label: 'Employed' }, { value: 'Unemployed', label: 'Unemployed' },
                                            { value: 'Self Employed', label: 'Self Employed' }, { value: 'Retired', label: 'Retired' }
                                        ]} />
                                    <Input label="Annual Income (₹)" type="number" value={profile.annualIncome} onChange={v => handleChange('annualIncome', v)} placeholder="e.g., 250000" />
                                    <Select label="Education Level" value={profile.educationLevel} onChange={v => handleChange('educationLevel', v)}
                                        options={[
                                            { value: 'No Formal Education', label: 'No Formal Education' }, { value: 'Primary', label: 'Primary (1-5)' },
                                            { value: 'Secondary', label: 'Secondary (6-10)' }, { value: 'HSC', label: 'Higher Secondary (11-12)' },
                                            { value: 'Diploma', label: 'Diploma' }, { value: 'Graduate', label: 'Graduate' },
                                            { value: 'Post Graduate', label: 'Post Graduate' }, { value: 'PhD', label: 'PhD' }
                                        ]} />
                                </div>
                            </div>
                        )}

                        {/* FAMILY SECTION */}
                        {activeSection === 'family' && (
                            <div style={styles.formCard}>
                                <div style={styles.formHeader}>
                                    <div style={{ ...styles.formHeaderIcon, background: '#FDF2F8', color: '#EC4899' }}><FaUserFriends /></div>
                                    <div>
                                        <h2 style={styles.formTitle}>Family Details</h2>
                                        <p style={styles.formSubtitle}>Family info • कौटुंबिक तपशील</p>
                                    </div>
                                </div>
                                <div style={styles.formGrid}>
                                    <Select label="Marital Status" value={profile.maritalStatus} onChange={v => handleChange('maritalStatus', v)}
                                        options={[
                                            { value: 'Single', label: 'Single / अविवाहित' }, { value: 'Married', label: 'Married / विवाहित' },
                                            { value: 'Divorced', label: 'Divorced' }, { value: 'Widowed', label: 'Widowed / विधवा-विधुर' }
                                        ]} />
                                    <Input label="Family Members" type="number" value={profile.familyMembers} onChange={v => handleChange('familyMembers', v)} placeholder="Number" />
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={styles.label}>Special Status (Optional)</label>
                                        <div style={styles.checkboxGrid}>
                                            <Checkbox checked={profile.isWidow} onChange={v => handleChange('isWidow', v)} label="Widow / विधवा" desc="Widow schemes" />
                                            <Checkbox checked={profile.isSeniorCitizen} onChange={v => handleChange('isSeniorCitizen', v)} label="Senior Citizen (60+)" desc="Pension & health" />
                                            <Checkbox checked={profile.isDisabled} onChange={v => handleChange('isDisabled', v)} label="Divyang / दिव्यांग" desc="Disability schemes" />
                                        </div>
                                    </div>
                                    {profile.isDisabled && (
                                        <Select label="Disability Type" value={profile.disabilityType} onChange={v => handleChange('disabilityType', v)}
                                            options={[
                                                { value: 'Physical', label: 'Physical' }, { value: 'Visual', label: 'Visual' },
                                                { value: 'Hearing', label: 'Hearing' }, { value: 'Mental', label: 'Mental' },
                                                { value: 'Multiple', label: 'Multiple' }
                                            ]} />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ADDITIONAL SECTION */}
                        {activeSection === 'additional' && (
                            <div style={styles.formCard}>
                                <div style={styles.formHeader}>
                                    <div style={{ ...styles.formHeaderIcon, background: '#DBEAFE', color: '#3B82F6' }}><FaHome /></div>
                                    <div>
                                        <h2 style={styles.formTitle}>Additional Information</h2>
                                        <p style={styles.formSubtitle}>Property details • अतिरिक्त माहिती</p>
                                    </div>
                                </div>
                                <div style={styles.formGrid}>
                                    <Input label="Land Ownership (Acres)" type="number" step="0.01" value={profile.landOwnership} onChange={v => handleChange('landOwnership', v)} placeholder="0.00" />
                                    <Select label="House Status" value={profile.houseStatus} onChange={v => handleChange('houseStatus', v)}
                                        options={[
                                            { value: 'Owned Pucca', label: 'Owned Pucca House' }, { value: 'Owned Kutcha', label: 'Owned Kutcha House' },
                                            { value: 'Rented', label: 'Rented' }, { value: 'Homeless', label: 'Homeless / बेघर' },
                                            { value: 'Living with Family', label: 'Living with Family' }
                                        ]} />
                                </div>
                                {completion >= 80 && (
                                    <div style={styles.noteBox}>
                                        <FiCheckCircle style={{ color: '#10B981', fontSize: 20, flexShrink: 0 }} />
                                        <div><strong>🎉 Profile Complete!</strong> AI recommendations are ready.</div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* NAVIGATION BUTTONS */}
                        <div style={styles.navButtons}>
                            {activeSection !== 'personal' && (
                                <button onClick={goToPreviousSection} style={styles.prevBtn}>
                                    <FiArrowLeft style={{ marginRight: 8 }} />Previous
                                </button>
                            )}
                            <button onClick={() => handleSave(false)} disabled={saving} style={{ ...styles.saveBtn, ...(saving ? styles.saveBtnDisabled : {}) }}>
                                {saving ? (<><div style={styles.btnSpinner}></div>Saving...</>) : (<><FiSave style={{ marginRight: 10 }} />Save</>)}
                            </button>
                            {activeSection !== 'additional' ? (
                                <button onClick={() => handleSave(true)} disabled={saving} style={styles.nextBtn}>
                                    Save & Next<FiArrowRight style={{ marginLeft: 8 }} />
                                </button>
                            ) : (
                                <button
                                    onClick={async () => {
                                        const saved = await handleSave(false);
                                        if (saved && completion >= 80) {
                                            setTimeout(() => navigate('/user/recommendations'), 1000);
                                        }
                                    }}
                                    disabled={saving} style={styles.aiBtn}>
                                    <HiSparkles style={{ marginRight: 10 }} />Save & View AI Recommendations
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

// ─── Reusable Input Component ───
const Input = ({ label, type = 'text', value, onChange, placeholder, disabled, maxLength, step }) => (
    <div style={styles.inputGroup}>
        <label style={styles.label}>{label}</label>
        <input 
            type={type} 
            value={value || ''} 
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder} 
            disabled={disabled} 
            maxLength={maxLength} 
            step={step}
            style={{ 
                ...styles.input, 
                ...(disabled ? { background: '#F3F4F6', cursor: 'not-allowed', color: '#6B7280' } : {}) 
            }} 
        />
    </div>
);

const Select = ({ label, value, onChange, options }) => (
    <div style={styles.inputGroup}>
        <label style={styles.label}>{label}</label>
        <select value={value || ''} onChange={(e) => onChange(e.target.value)} style={styles.select} disabled={options.length === 0}>
            <option value="">Select {label}</option>
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

const Checkbox = ({ checked, onChange, label, desc }) => (
    <div onClick={() => onChange(!checked)} style={{ ...styles.checkboxCard, ...(checked ? styles.checkboxCardActive : {}) }}>
        <input type="checkbox" checked={checked || false} onChange={(e) => onChange(e.target.checked)} style={styles.checkbox} />
        <div style={styles.checkboxLabel}><strong>{label}</strong><span style={styles.checkboxDesc}>{desc}</span></div>
    </div>
);

const styles = {
    wrapper: { width: '100%', background: '#F9FAFB', minHeight: '100vh' },
    loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' },
    spinner: { width: '48px', height: '48px', border: '4px solid #E5E7EB', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    headerBanner: { position: 'relative', width: '100%', background: 'linear-gradient(135deg, #EEF2FF 0%, #ffffff 50%, #FFF7ED 100%)', padding: '50px 60px', overflow: 'hidden', borderBottom: '1px solid #E5E7EB' },
    bannerDecor1: { position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)', borderRadius: '50%' },
    bannerDecor2: { position: 'absolute', bottom: '-150px', left: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)', borderRadius: '50%' },
    headerContainer: { position: 'relative', maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '40px', flexWrap: 'wrap', zIndex: 2 },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '24px' },
    avatar: { width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px', fontWeight: '800', boxShadow: '0 10px 30px rgba(79,70,229,0.4)', border: '4px solid #ffffff' },
    userBadge: { display: 'inline-flex', alignItems: 'center', background: 'rgba(79,70,229,0.08)', color: '#4338CA', padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: '700', marginBottom: '10px' },
    userName: { fontSize: '32px', fontWeight: '800', color: '#111827', marginBottom: '10px', letterSpacing: '-1px' },
    userMeta: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
    metaItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#6B7280', fontWeight: '500' },
    metaIcon: { color: '#4F46E5', fontSize: '15px' },
    headerRight: { minWidth: '360px' },
    completionCard: { background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' },
    completionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    completionLabel: { fontSize: '13px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' },
    completionValue: { fontSize: '28px', fontWeight: '800', color: '#4F46E5' },
    progressBarWrap: { width: '100%', height: '10px', background: '#F3F4F6', borderRadius: '100px', overflow: 'hidden', marginBottom: '12px' },
    progressBar: { height: '100%', borderRadius: '100px', transition: 'width 0.5s ease' },
    completionHint: { fontSize: '12px', color: '#6B7280', fontWeight: '500' },
    mainSection: { width: '100%', padding: '40px 60px 80px' },
    mainContainer: { maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '30px' },
    sidebar: { display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '90px', alignSelf: 'flex-start' },
    sidebarHeader: { display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 20px', background: '#ffffff', borderRadius: '14px', border: '1px solid #E5E7EB' },
    sidebarTitle: { fontSize: '16px', fontWeight: '800', color: '#111827' },
    sidebarNav: { display: 'flex', flexDirection: 'column', gap: '6px', background: '#ffffff', padding: '12px', borderRadius: '14px', border: '1px solid #E5E7EB' },
    sidebarItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '10px', background: 'transparent', border: 'none', borderLeft: '3px solid transparent', cursor: 'pointer', textAlign: 'left', width: '100%', position: 'relative' },
    sidebarItemActive: { background: '#F9FAFB' },
    sidebarIcon: { width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 },
    sidebarLabel: { fontSize: '14px', fontWeight: '600', color: '#111827', flex: 1 },
    completeDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 0 3px #F0FDF4' },
    infoCard: { background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)', padding: '20px', borderRadius: '14px', border: '1px solid #C7D2FE', textAlign: 'center' },
    infoIcon: { fontSize: '32px', marginBottom: '10px' },
    infoTitle: { fontSize: '15px', fontWeight: '700', color: '#4338CA', marginBottom: '8px' },
    infoText: { fontSize: '12px', color: '#4B5563', lineHeight: 1.6 },
    
    noteBoxAddress: { display: 'flex', gap: '12px', padding: '14px 20px', background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', color: '#9A3412', alignItems: 'center' },

    formArea: { display: 'flex', flexDirection: 'column', gap: '20px' },
    successToast: { display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#ffffff', padding: '14px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '600' },
    errorToast: { display: 'flex', alignItems: 'center', background: '#FEE2E2', color: '#B91C1C', padding: '14px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', border: '1px solid #FCA5A5' },
    formCard: { background: '#ffffff', padding: '32px', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' },
    formHeader: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid #F3F4F6' },
    formHeaderIcon: { width: '52px', height: '52px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' },
    formTitle: { fontSize: '22px', fontWeight: '800', color: '#111827', marginBottom: '4px' },
    formSubtitle: { fontSize: '13px', color: '#6B7280', fontWeight: '600' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '13px', fontWeight: '700', color: '#111827' },
    input: { width: '100%', padding: '12px 16px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', color: '#111827', background: '#ffffff', fontFamily: 'inherit', outline: 'none' },
    select: { width: '100%', padding: '12px 16px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', color: '#111827', background: '#ffffff', fontFamily: 'inherit', outline: 'none', cursor: 'pointer' },
    checkboxGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '8px' },
    checkboxCard: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', background: '#F9FAFB', borderRadius: '12px', border: '1.5px solid #E5E7EB', cursor: 'pointer' },
    checkboxCardActive: { background: '#EEF2FF', borderColor: '#4F46E5' },
    checkbox: { width: '18px', height: '18px', cursor: 'pointer', marginTop: '2px', accentColor: '#4F46E5' },
    checkboxLabel: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', color: '#111827' },
    checkboxDesc: { fontSize: '12px', color: '#6B7280', fontWeight: '500' },
    noteBox: { marginTop: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '16px 20px', background: '#F0FDF4', borderRadius: '10px', border: '1px solid #86EFAC', fontSize: '13px', color: '#065F46' },
    navButtons: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
    prevBtn: { display: 'inline-flex', alignItems: 'center', background: '#F3F4F6', color: '#111827', padding: '14px 24px', borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
    saveBtn: { flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)', color: '#ffffff', padding: '14px 24px', borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 6px 20px rgba(79,70,229,0.35)' },
    saveBtnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
    btnSpinner: { width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginRight: '10px' },
    nextBtn: { flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#ffffff', padding: '14px 24px', borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
    aiBtn: { flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', color: '#ffffff', padding: '14px 24px', borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }
};

export default Profile;