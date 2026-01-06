import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.usuario));
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};

export const pedidoService = {
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/pedidos?${params}`);
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/pedidos/${id}`);
    return response.data;
  },

  async create(pedido) {
    const response = await api.post('/pedidos', pedido);
    return response.data;
  },

  async updateEstado(id, estado) {
    const response = await api.put(`/pedidos/${id}/estado`, { estado });
    return response.data;
  },

  async update(id, pedido) {
    const response = await api.put(`/pedidos/${id}`, pedido);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/pedidos/${id}`);
    return response.data;
  },

  async getEstadisticas() {
    const response = await api.get('/pedidos/estadisticas');
    return response.data;
  }
};

export const menuService = {
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/menus?${params}`);
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/menus/${id}`);
    return response.data;
  },

  async create(menu) {
    const response = await api.post('/menus', menu);
    return response.data;
  },

  async update(id, menu) {
    const response = await api.put(`/menus/${id}`, menu);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/menus/${id}`);
    return response.data;
  },

  async getCategorias() {
    const response = await api.get('/menus/categorias');
    return response.data;
  }
};

export const usuarioService = {
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/usuarios?${params}`);
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  async create(usuario) {
    const response = await api.post('/usuarios', usuario);
    return response.data;
  },

  async update(id, usuario) {
    const response = await api.put(`/usuarios/${id}`, usuario);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  }
};
