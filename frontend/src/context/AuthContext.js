import React, {
    createContext,
    useContext,
    useState,
    useEffect
} from 'react';

const AuthContext = createContext(null);

// ─── Storage Helper (Use sessionStorage instead of localStorage) ───
// sessionStorage clears automatically when browser tab/window closes
const storage = {
    getItem: (key) => sessionStorage.getItem(key),
    setItem: (key, value) => sessionStorage.setItem(key, value),
    removeItem: (key) => sessionStorage.removeItem(key),
    clear: () => sessionStorage.clear()
};

export const AuthProvider = ({ children }) => {

    const [user, setUser]       = useState(null);
    const [token, setToken]     = useState(null);
    const [loading, setLoading] = useState(true);

    // ── Load from sessionStorage on start
    useEffect(() => {
        const savedToken = storage.getItem('token');
        const savedUser  = storage.getItem('user');

        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            } catch (err) {
                console.error('Session parse error:', err);
                storage.clear();
            }
        }
        setLoading(false);
    }, []);

    // ── Login 
    const login = (responseData) => {
        const userData = {
            userId          : responseData.userId,
            fullName        : responseData.fullName,
            email           : responseData.email,
            role            : responseData.role,
            profileComplete : responseData.profileComplete
        };

        storage.setItem('token', responseData.token);
        storage.setItem('user',  JSON.stringify(userData));

        setToken(responseData.token);
        setUser(userData);
    };

    // ── Logout 
    const logout = () => {
        storage.clear();
        setToken(null);
        setUser(null);
        window.location.href = '/login';
    };

    // ── Update User 
    const updateUser = (updatedData) => {
        const newUser = { ...user, ...updatedData };
        storage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
    };

    // ── Helpers 
    const isLoggedIn = !!token;
    const isAdmin    = user?.role === 'ADMIN';
    const isUser     = user?.role === 'USER';

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            logout,
            updateUser,
            isLoggedIn,
            isAdmin,
            isUser
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;