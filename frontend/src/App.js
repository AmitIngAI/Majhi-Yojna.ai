import React, { useEffect } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation
} from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

// Common
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import UserLayout from './components/user/UserLayout';

// Public Pages
import Home         from './pages/Home';
import AuthPage     from './pages/AuthPage';
import Schemes      from './pages/Schemes';
import SchemeDetail from './pages/SchemeDetail';
import About        from './pages/About';
import Contact      from './pages/Contact';

// User Pages
import UserDashboard      from './pages/user/Dashboard';
import UserProfile        from './pages/user/Profile';
import Recommendations    from './pages/user/Recommendations';
import EligibilityChecker from './pages/user/EligibilityChecker';
import SchemeComparison   from './pages/user/SchemeComparison';
import BenefitTimeline    from './pages/user/BenefitTimeline';
import FamilyDashboard    from './pages/user/FamilyDashboard';
import SavedSchemes       from './pages/user/SavedSchemes';
import Notifications      from './pages/user/Notifications';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminSchemes   from './pages/admin/Schemes';
import AdminUsers     from './pages/admin/Users';
import AdminMessages from './pages/admin/Messages';
import AdminSettings  from './pages/admin/Settings';

import './App.css';
import './styles/custom.css';

/* ═══════════════════════════════════════════
   PROTECTED ROUTE — Requires Login
═══════════════════════════════════════════ */
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isLoggedIn, isAdmin } = useAuth();
    if (!isLoggedIn) return <Navigate to="/login" replace />;
    if (adminOnly && !isAdmin) return <Navigate to="/user/dashboard" replace />;
    return children;
};

/* ═══════════════════════════════════════════
   PUBLIC ONLY ROUTE — Only for Not Logged In
═══════════════════════════════════════════ */
const PublicRoute = ({ children }) => {
    const { isLoggedIn, isAdmin } = useAuth();
    if (isLoggedIn) {
        return isAdmin
            ? <Navigate to="/admin/dashboard" replace />
            : <Navigate to="/user/dashboard" replace />;
    }
    return children;
};

/* ═══════════════════════════════════════════
   APP ROUTES
═══════════════════════════════════════════ */
const AppRoutes = () => {
    const location = useLocation();
    const { isLoggedIn } = useAuth();

    const isDashboardRoute =
        location.pathname.startsWith('/user') ||
        location.pathname.startsWith('/admin');

    const hideNavbar = isLoggedIn && isDashboardRoute;

    return (
        <>
            {!hideNavbar && <Navbar />}
            <main style={{ minHeight: hideNavbar ? '100vh' : '80vh' }}>
                <Routes>

                    {/* ═══════ PUBLIC PAGES ═══════ */}
                    <Route path="/"            element={<Home />} />
                    <Route path="/schemes"     element={<Schemes />} />
                    <Route path="/schemes/:id" element={<SchemeDetail />} />
                    <Route path="/about"       element={<About />} />
                    <Route path="/contact"     element={<Contact />} />

                    {/* ═══════ AUTH PAGES ═══════ */}
                    <Route path="/login" element={
                        <PublicRoute>
                            <AuthPage initialMode="signin" />
                        </PublicRoute>
                    } />
                    <Route path="/register" element={
                        <PublicRoute>
                            <AuthPage initialMode="signup" />
                        </PublicRoute>
                    } />

                    {/* ═══════ USER PROTECTED ROUTES ═══════ */}
                    <Route path="/user/dashboard" element={
                        <ProtectedRoute>
                            <UserLayout><UserDashboard /></UserLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/user/profile" element={
                        <ProtectedRoute>
                            <UserLayout><UserProfile /></UserLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/user/recommendations" element={
                        <ProtectedRoute>
                            <UserLayout><Recommendations /></UserLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/user/eligibility" element={
                        <ProtectedRoute>
                            <UserLayout><EligibilityChecker /></UserLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/user/comparison" element={
                        <ProtectedRoute>
                            <UserLayout><SchemeComparison /></UserLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/user/timeline" element={
                        <ProtectedRoute>
                            <UserLayout><BenefitTimeline /></UserLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/user/family" element={
                        <ProtectedRoute>
                            <UserLayout><FamilyDashboard /></UserLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/user/saved" element={
                        <ProtectedRoute>
                            <UserLayout><SavedSchemes /></UserLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/user/schemes" element={
                        <ProtectedRoute>
                            <UserLayout><Schemes /></UserLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/user/schemes/:id" element={
                        <ProtectedRoute>
                            <UserLayout><SchemeDetail /></UserLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/user/notifications" element={
                        <ProtectedRoute>
                            <UserLayout><Notifications /></UserLayout>
                        </ProtectedRoute>
                    } />

                    {/* ═══════ ADMIN PROTECTED ROUTES ═══════ */}
                    <Route path="/admin/dashboard" element={
                        <ProtectedRoute adminOnly={true}>
                            <UserLayout isAdmin><AdminDashboard /></UserLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/admin/schemes" element={
                        <ProtectedRoute adminOnly={true}>
                            <UserLayout isAdmin><AdminSchemes /></UserLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/admin/users" element={
                        <ProtectedRoute adminOnly={true}>
                            <UserLayout isAdmin><AdminUsers /></UserLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/admin/messages" element={
                        <ProtectedRoute adminOnly={true}>
                            <UserLayout isAdmin><AdminMessages /></UserLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/admin/settings" element={
                        <ProtectedRoute adminOnly={true}>
                            <UserLayout isAdmin><AdminSettings /></UserLayout>
                        </ProtectedRoute>
                    } />

                    {/* ═══════ FALLBACK — 404 ═══════ */}
                    <Route path="*" element={<Navigate to="/" replace />} />

                </Routes>
            </main>
            {!hideNavbar && <Footer />}
        </>
    );
};

/* ═══════════════════════════════════════════
   MAIN APP COMPONENT
═══════════════════════════════════════════ */
const App = () => {
    useEffect(() => {
        if (localStorage.getItem('token')) {
            console.log('🧹 Cleaning old localStorage tokens...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('redirectAfterLogin');
            localStorage.removeItem('pendingApplyLink');
        }
    }, []);

    return (
        <LanguageProvider>
            <AuthProvider>
                <Router>
                    <AppRoutes />
                </Router>
            </AuthProvider>
        </LanguageProvider>
    );
};

export default App;