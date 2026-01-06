import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Order services
export const orderService = {
  getOrders: (params) => api.get('/orders', { params }),
  getOrderById: (orderId) => api.get(`/orders/${orderId}`),
  createOrder: (orderData) => api.post('/orders', orderData),
  assignOrder: (data) => api.post('/orders/assign', data),
  acceptOrder: (orderId) => api.post(`/orders/${orderId}/accept`),
  rejectOrder: (orderId, reason) => api.post(`/orders/${orderId}/reject`, { reason }),
  markInTransit: (orderId) => api.post(`/orders/${orderId}/in-transit`),
  deliverOrder: (orderId) => api.post(`/orders/${orderId}/deliver`),
  getOrderHistory: () => api.get('/orders/history'),
};

// Repartidor services
export const repartidorService = {
  toggleAvailability: (isAvailable) => api.post('/repartidor/availability', { isAvailable }),
  getEarnings: (period) => api.get('/repartidor/earnings', { params: { period } }),
  getFines: () => api.get('/repartidor/fines'),
  getAvailable: () => api.get('/repartidor/available'),
};

// Admin services
export const adminService = {
  getRepartidores: () => api.get('/admin/repartidores'),
  updateRepartidor: (repartidorId, data) => api.put(`/admin/repartidores/${repartidorId}`, data),
  createFine: (fineData) => api.post('/admin/fines', fineData),
  getAllFines: (params) => api.get('/admin/fines', { params }),
  updateFine: (fineId, data) => api.put(`/admin/fines/${fineId}`, data),
  getReports: (params) => api.get('/admin/reports', { params }),
  
  // Zones
  createZone: (zoneData) => api.post('/admin/zones', zoneData),
  getZones: () => api.get('/admin/zones'),
  updateZone: (zoneId, data) => api.put(`/admin/zones/${zoneId}`, data),
  deleteZone: (zoneId) => api.delete(`/admin/zones/${zoneId}`),
  
  // Establishments
  createEstablishment: (data) => api.post('/admin/establishments', data),
  getEstablishments: () => api.get('/admin/establishments'),
  updateEstablishment: (establishmentId, data) => api.put(`/admin/establishments/${establishmentId}`, data),
  deleteEstablishment: (establishmentId) => api.delete(`/admin/establishments/${establishmentId}`),
  
  // Promotions
  createPromotion: (data) => api.post('/admin/promotions', data),
  getPromotions: () => api.get('/admin/promotions'),
  updatePromotion: (promotionId, data) => api.put(`/admin/promotions/${promotionId}`, data),
  deletePromotion: (promotionId) => api.delete(`/admin/promotions/${promotionId}`),
};

// Notification services
export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markNotificationRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  sendMessage: (data) => api.post('/messages', data),
  getConversation: (params) => api.get('/messages', { params }),
  markMessagesRead: (userId) => api.post('/messages/read', { userId }),
};

export default api;
