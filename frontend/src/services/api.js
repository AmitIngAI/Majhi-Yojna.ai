import axios from 'axios';

const BASE_URL = (process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080') + '/api';
const ML_URL   = (process.env.REACT_APP_ML_URL || 'http://localhost:5000') + '/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

 api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token');
     if (token) {
        config.headers.Authorization = `Bearer ${token}`;
     }
      return config;
    });

 api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            const code = error.response?.data?.code;
            const msg = error.response?.data?.message;

            if (code === 'USER_BLOCKED') {
                sessionStorage.clear();
                alert('🚫 ' + (msg || 'Your account has been blocked by admin'));
                window.location.href = '/login';
            } else if (code === 'USER_DELETED') {
                sessionStorage.clear();
                alert('❌ ' + (msg || 'Your account has been deleted'));
                window.location.href = '/login';
            } else if (error.response?.status === 401) {
                sessionStorage.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    health: () => api.get('/auth/health'),
    changePassword: (data) => api.put('/auth/change-password', data),
    updateAdminProfile: (data) => api.put('/auth/update-profile', data)
};

export const userAPI = {
    getProfile: () => api.get('/user/profile'),
    updateProfile: (data) => api.put('/user/profile', data)
};

export const schemeAPI = {
    getAll: () => api.get('/schemes/all'),
    getById: (id) => api.get(`/schemes/${id}`),
    getByCategory: (category) => api.get(`/schemes/category/${category}`)
};

export const recommendationAPI = {
    getRecommendations: (userId) => api.get(`/recommendations/${userId}`),
    getEligible: (userId) => api.get(`/recommendations/${userId}/eligible`),
    getLifeEvents: (userId) => api.get(`/recommendations/${userId}/life-events`)
};

export const savedAPI = {
    getSaved: (userId) => api.get(`/saved/${userId}`),
    toggleSave: (userId, schemeId) => api.post(`/saved/${userId}/toggle/${schemeId}`)
};

export const adminAPI = {
    getDashboard: () => api.get('/admin/dashboard'),
    getAllUsers: () => api.get('/admin/users'),
    toggleUserStatus: (userId) => api.put(`/admin/users/${userId}/toggle-status`),
    deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
    getAllSchemes: () => api.get('/admin/schemes'),
    addScheme: (data) => api.post('/admin/schemes', data),
    updateScheme: (id, data) => api.put(`/admin/schemes/${id}`, data),
    deleteScheme: (id) => api.delete(`/admin/schemes/${id}`),
    getActivities: () => api.get('/admin/activities')
};

export const notificationAPI = {
    getAll: (userId) => api.get(`/notifications/${userId}`),
    getUnreadCount: (userId) => api.get(`/notifications/${userId}/unread-count`),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: (userId) => api.put(`/notifications/${userId}/read-all`),
    delete: (id) => api.delete(`/notifications/${id}`)
};

export const mlAPI = {
    recommend: (data) => axios.post(`${ML_URL}/recommend`, data),
    schemes: () => axios.get(`${ML_URL}/schemes`),
    health: () => axios.get(`${ML_URL}/health`)
};

    export const contactAPI = {
        send            : (data)          => api.post('/contact', data),
        getAllAdmin     : ()              => api.get('/contact/admin/all'),
        getUnreadCount  : ()              => api.get('/contact/admin/unread-count'),
        markAsRead      : (id)            => api.put(`/contact/admin/${id}/mark-read`),
        reply           : (id, replyText) => api.put(`/contact/admin/${id}/reply`, { reply: replyText }),
        markResolved    : (id)            => api.put(`/contact/admin/${id}/resolve`),
        delete          : (id)            => api.delete(`/contact/admin/${id}`)
    };

export default api;