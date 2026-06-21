// API Service Helper
const API = {
  // Helper for requests
  async request(url, options = {}) {
    const token = localStorage.getItem('token');
    
    // Set headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error(`API Error: ${error.message}`);
      throw error;
    }
  },

  // Auth Endpoints
  auth: {
    async login(email, password) {
      return await API.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },

    async register(name, email, password) {
      return await API.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
    },

    async getProfile() {
      return await API.request('/api/auth/profile', {
        method: 'GET',
      });
    },
  },

  // Products Endpoints
  products: {
    async getAll(keyword = '', category = '') {
      let url = '/api/products';
      const params = [];
      if (keyword) params.push(`keyword=${encodeURIComponent(keyword)}`);
      if (category && category !== 'All') params.push(`category=${encodeURIComponent(category)}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      return await API.request(url, { method: 'GET' });
    },

    async getById(id) {
      return await API.request(`/api/products/${id}`, { method: 'GET' });
    },

    async create(productData) {
      return await API.request('/api/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });
    },

    async update(id, productData) {
      return await API.request(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
      });
    },

    async delete(id) {
      return await API.request(`/api/products/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Orders Endpoints
  orders: {
    async create(orderData) {
      return await API.request('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
    },

    async getMyOrders() {
      return await API.request('/api/orders/myorders', { method: 'GET' });
    },

    async getById(id) {
      return await API.request(`/api/orders/${id}`, { method: 'GET' });
    },

    async getAll() {
      return await API.request('/api/orders', { method: 'GET' });
    },

    async updateStatus(id, status) {
      return await API.request(`/api/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    },
  },
};
