const API_BASE = 'http://localhost:8080/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (response) => {
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Session expired. Please login again.');
  }
  return response;
};

export const categoryService = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE}/categories`, {
        headers: getAuthHeaders(),
      });

      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.status === 'success' && data.data) return data.data || [];

      throw new Error(data.message || 'Failed to retrieve categories');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot retrieve categories. Please check your internet connection.');
      }
      throw error;
    }
  },
  
  getAllWithPagination: async (queryParams) => {
    try {
      const response = await fetch(`${API_BASE}/categories?${queryParams}`, {
        headers: getAuthHeaders(),
      });

      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.status === 'success' && data.data) return data.data;

      throw new Error(data.message || 'Failed to retrieve categories');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot retrieve categories. Please check your internet connection.');
      }
      throw error;
    }
  },
  
  create: async (category) => {
    try {
      const response = await fetch(`${API_BASE}/admin/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(category),
      });

      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status === 'success' && data.data) return data.data || [];

      throw new Error(data.message || 'Failed to create category');
    } catch (error) {
      // throw new Error(data.message);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot create category. Please check your internet connection.');
      }
      throw error;
    }
  },
  
  update: async (id, category) => {
    try {
      const response = await fetch(`${API_BASE}/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(category),
      });

      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status !== 'success') throw new Error(data.message || 'Failed to update category');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot update category. Please check your internet connection.');
      }
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE}/admin/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status !== 'success') throw new Error(data.message);
    
      throw new Error(data.message || 'Failed to delete category');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot delete category. Please check your internet connection.');
      }
      throw error;
    }
  },
};

export const authService = {
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
      
      if (data.status === 'success' && data.data?.token) {
        localStorage.setItem('token', data.data.token);
        return data.data.token;
      }
      throw new Error(data.message || 'Login failed');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot login. Please check your internet connection.');
      }
      throw error;
    }
  },

  logout: () => localStorage.removeItem('token'),

  isAuthenticated: () => !!localStorage.getItem('token'),
};

export const reportService = {
  getDashboardReport: async (revenueFilter = 'monthly') => {
    try {
      const response = await fetch(`${API_BASE}/reports/dashboard?revenue_filter=${revenueFilter}`, {
        headers: getAuthHeaders(),
      });

      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.status === 'success' && data.data) return data.data || [];

      throw new Error(data.message || 'Failed to retrieve revenue');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot retrieve revenue. Please check your internet connection.');
      }
      throw error;
    }
  },
};

export const auditService = {
  getAllLogs: async () => {
    try {
      const response = await fetch(`${API_BASE}/superadmin/activity-logs`, {
        headers: getAuthHeaders(),
      });

      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.status === 'success' && data.data) return data.data || [];

      throw new Error(data.message || 'Failed to retrieve activity logs');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot retrieve activity logs. Please check your internet connection.');
      }
      throw error;
    }
  },

  getLogById: async (id) => {
    try {
      const response = await fetch(`${API_BASE}/superadmin/activity-logs/${id}`, {
        headers: getAuthHeaders(),
      });

      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status === 'success' && data.data) return data.data || [];

      throw new Error(data.message || 'Failed to retrieve activity log by ID');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot retrieve activity logs by ID. Please check your internet connection.');
      }
      throw error;
    }
  },
};

export const itemService = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE}/items`, {
        headers: getAuthHeaders(),
      });
      
      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status === 'success' && data.data) return data.data || [];

      throw new Error(data.message || 'Failed to retrieve items');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot retrieve items. Please check your internet connection.');
      }
      throw error;
    }
  },
  
  getAllWithPagination: async (queryParams) => {
    try {
      const response = await fetch(`${API_BASE}/items?${queryParams}`, {
        headers: getAuthHeaders(),
      });
      
      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status === 'success' && data.data) return data.data;

      throw new Error(data.message || 'Failed to retrieve items');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot retrieve items. Please check your internet connection.');
      }
      throw error;
    }
  },
  
  create: async (item) => {
    try {
      const response = await fetch(`${API_BASE}/admin/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(item),
      });
      
      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status === 'success' && data.data) return data.data || [];

      throw new Error(data.message || 'Failed to create item');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot retrieve items. Please check your internet connection.');
      }
      throw error;
    }
  },
  
  update: async (id, item) => {
    try {
      const response = await fetch(`${API_BASE}/admin/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(item),
      });
      
      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status === 'success') return data.data || [];

      throw new Error(data.message || 'Failed to update item');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot update item. Please check your internet connection.');
      }
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE}/admin/items/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status !== 'success') throw new Error(data.message || 'Failed to delete item');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot delete item. Please check your internet connection.');
      }
      throw error;
    }
  },
  
  getStats: async () => {
    try {
      const response = await fetch(`${API_BASE}/items/stats`, {
        headers: getAuthHeaders(),
      });
      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.status === 'success' && data.data) {
        return data.data || { totalItems: 0, lowStock: 0, totalCategories: 0 };
      }

      throw new Error(data.message || 'Failed to retrieve item stats');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot retrieve item stats. Please check your internet connection.');
      }
      return { totalItems: 0, lowStock: 0, totalCategories: 0 };
    }
  },

  generateSKU: async () => {
    try {
      const response = await fetch(`${API_BASE}/items/generate-sku`, {
        headers: getAuthHeaders(),
      });
      
      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status === 'success' && data.data) return data.data.sku || '';

      throw new Error(data.message || 'Failed to generate SKU');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot generate SKU. Please check your internet connection.');
      }
      throw error;
    }
  },
};

export const orderService = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE}/orders`, {
        headers: getAuthHeaders(),
      });
      
      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status === 'success' && data.data) return data.data || [];

      throw new Error(data.message || 'Failed to retrieve orders');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot retrieve orders. Please check your internet connection.');
      }
      throw error;
    }
  },
  
  getAllWithFilters: async (queryParams) => {
    try {
      const response = await fetch(`${API_BASE}/orders?${queryParams}`, {
        headers: getAuthHeaders(),
      });
      
      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status === 'success' && data.data) return data.data || { orders: [], total: 0 };

      throw new Error(data.message || 'Failed to retrieve orders');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot retrieve orders. Please check your internet connection.');
      }
      throw error;
    }
  },
  
  create: async (order) => {
    try {
      const response = await fetch(`${API_BASE}/admin/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(order),
      });
      
      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status === 'success' && data.data) return data.data || [];

      throw new Error(data.message || 'Failed to create order');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot create order. Please check your internet connection.');
      }
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE}/orders/${id}`, {
        headers: getAuthHeaders(),
      });
      
      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status === 'success' && data.data) return data.data || [];

      throw new Error(data.message || 'Failed to retrieve order by ID');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot retrieve order by ID. Please check your internet connection.');
      }
      throw error;
    }
  },
  
  updateStatus: async (id, status) => {
    try {
      const response = await fetch(`${API_BASE}/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ status }),
      });
      
      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status === 'success' && data.data) throw new Error(data.message) || 'Failed to update order status';
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot update order status. Please check your internet connection.');
      }
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE}/admin/orders/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status === 'success' && data.data) throw new Error(data.message || 'Failed to delete order');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot delete order. Please check your internet connection.');
      }
      throw error;
    }
  },
};

export const menuCategoryService = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE}/menu-categories`, {
        headers: getAuthHeaders(),
      });

      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.status === 'success' && data.data) return data.data || [];

      throw new Error(data.message || 'Failed to retrieve menu categories');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot retrieve menu categories. Please check your internet connection.');
      }
      throw error;
    }
  },
  
  create: async (category) => {
    try {
      const response = await fetch(`${API_BASE}/admin/menu-categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(category),
      });

      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status === 'success' && data.data) return data.data || [];

      throw new Error(data.message || 'Failed to create menu category');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot create menu category. Please check your internet connection.');
      }
      throw error;
    }
  },
  
  update: async (id, category) => {
    try {
      const response = await fetch(`${API_BASE}/admin/menu-categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(category),
      });

      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status !== 'success') throw new Error(data.message || 'Failed to update menu category');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot update menu category. Please check your internet connection.');
      }
      throw error;
    }
  },
};

export const menuService = {
  getAllWithPagination: async (queryParams) => {
    try {
      const response = await fetch(`${API_BASE}/menus?${queryParams}`, {
        headers: getAuthHeaders(),
      });
      
      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status === 'success' && data.data) return data.data;

      throw new Error(data.message || 'Failed to retrieve menus');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot retrieve menus. Please check your internet connection.');
      }
      throw error;
    }
  },
  
  create: async (menu) => {
    try {
      const response = await fetch(`${API_BASE}/admin/menus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(menu),
      });
      
      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status === 'success' && data.data) return data.data || [];

      throw new Error(data.message || 'Failed to create menu');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot create menu. Please check your internet connection.');
      }
      throw error;
    }
  },
  
  update: async (id, menu) => {
    try {
      const response = await fetch(`${API_BASE}/admin/menus/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(menu),
      });
      
      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status === 'success') return data.data || [];

      throw new Error(data.message || 'Failed to update menu');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot update menu. Please check your internet connection.');
      }
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE}/admin/menus/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status !== 'success') throw new Error(data.message || 'Failed to delete menu');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot delete menu. Please check your internet connection.');
      }
      throw error;
    }
  },
};

export const submenuService = {
  getAllWithPagination: async (queryParams) => {
    try {
      const response = await fetch(`${API_BASE}/submenus?${queryParams}`, {
        headers: getAuthHeaders(),
      });
      
      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status === 'success' && data.data) return data.data;

      throw new Error(data.message || 'Failed to retrieve submenus');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot retrieve submenus. Please check your internet connection.');
      }
      throw error;
    }
  },
  
  getLinkedToMenu: async (menuId) => {
    try {
      const response = await submenuService.getAllWithPagination('limit=100');
      const allSubmenus = response.data || [];
      return allSubmenus.filter(submenu => 
        submenu.linked_menus && submenu.linked_menus.includes(menuId)
      );
    } catch (error) {
      console.error('Failed to get linked submenus:', error);
      return [];
    }
  },
  
  create: async (submenu) => {
    try {
      const response = await fetch(`${API_BASE}/admin/submenus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(submenu),
      });
      
      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status === 'success' && data.data) return data.data || [];

      throw new Error(data.message || 'Failed to create submenu');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot create submenu. Please check your internet connection.');
      }
      throw error;
    }
  },
  
  update: async (id, submenu) => {
    try {
      const response = await fetch(`${API_BASE}/admin/submenus/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(submenu),
      });
      
      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status === 'success') return data.data || [];

      throw new Error(data.message || 'Failed to update submenu');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot update submenu. Please check your internet connection.');
      }
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE}/admin/submenus/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status !== 'success') throw new Error(data.message || 'Failed to delete submenu');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot delete submenu. Please check your internet connection.');
      }
      throw error;
    }
  },
};

export const cateringOrderService = {
  getAllWithFilters: async (queryParams) => {
    try {
      const response = await fetch(`${API_BASE}/catering-orders?${queryParams}`, {
        headers: getAuthHeaders(),
      });
      
      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status === 'success' && data.data) return data.data || { orders: [], total: 0 };

      throw new Error(data.message || 'Failed to retrieve catering orders');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot retrieve catering orders. Please check your internet connection.');
      }
      throw error;
    }
  },
  
  create: async (order) => {
    try {
      const response = await fetch(`${API_BASE}/admin/catering-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(order),
      });
      
      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status === 'success' && data.data) return data.data || [];

      throw new Error(data.message || 'Failed to create catering order');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot create catering order. Please check your internet connection.');
      }
      throw error;
    }
  },
  
  updateStatus: async (id, status) => {
    try {
      const response = await fetch(`${API_BASE}/admin/catering-orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ status }),
      });
      
      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status !== 'success') throw new Error(data.message || 'Failed to update catering order status');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot update catering order status. Please check your internet connection.');
      }
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE}/admin/catering-orders/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status !== 'success') throw new Error(data.message || 'Failed to delete catering order');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot delete catering order. Please check your internet connection.');
      }
      throw error;
    }
  },
};

export const userService = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE}/superadmin/users`, {
        headers: getAuthHeaders(),
      });
      
      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status === 'success' && data.data) return data.data || [];

      throw new Error(data.message || 'Failed retrieve users');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot retrieve users. Please check your internet connection.');
      }
      throw error;
    }
  },
  
  getAllWithPagination: async (queryParams) => {
    try {
      const response = await fetch(`${API_BASE}/superadmin/users?${queryParams}`, {
        headers: getAuthHeaders(),
      });
      
      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status === 'success' && data.data) return data.data;

      throw new Error(data.message || 'Failed retrieve users');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot retrieve users. Please check your internet connection.');
      }
      throw error;
    }
  },
  
  create: async (user) => {
    try {
      const response = await fetch(`${API_BASE}/superadmin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(user),
      });

      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status === 'success' && data.data) return data.data || [];
      
      throw new Error(data.message || 'Failed to create user');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot create user. Please check your internet connection.');
      }
      throw error;
    }
  },
  
  update: async (id, user) => {
    try {
      const response = await fetch(`${API_BASE}/superadmin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(user),
      });

      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.status === 'success' && data.data) throw new Error(data.message || 'Failed to update user');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot update user. Please check your internet connection.');
      }
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE}/superadmin/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      await handleResponse(response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.status !== 'success') throw new Error(data.message || 'Failed to delete user');

    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot delete user. Please check your internet connection.');
      }
      throw error;
    }
  },
};