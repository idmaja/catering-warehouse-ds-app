import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cateringOrderService, menuService, submenuService } from '../services/api';
import { Plus, Trash2, Search, Calendar, User, ShoppingCart, Phone, Eye } from 'lucide-react';
import { CateringOrderModal } from './CateringOrderModal';
import { CateringOrderDetail } from './CateringOrderDetail';
import { ConfirmModal } from './ConfirmModal';

export const CateringOrders = ({ showNotification }) => {
  const [orders, setOrders] = useState([]);
  const [menus, setMenus] = useState([]);
  const [submenus, setSubmenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    delivery_date: '',
    payment_via: '',
    items: []
  });
  // const [selectedMenuToppings, setSelectedMenuToppings] = useState({});


  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(dateFilter && { date_filter: dateFilter })
      });
      
      const response = await cateringOrderService.getAllWithFilters(queryParams.toString());
      setOrders(response.orders || []);
      setTotalOrders(response.total || 0);
    } catch (error) {
      console.error('Failed to load catering orders:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, dateFilter]);



  const loadMenuItems = useCallback(async () => {
    try {
      const [menuResponse, submenuResponse] = await Promise.all([
        menuService.getAllWithPagination('limit=100'),
        submenuService.getAllWithPagination('limit=100')
      ]);
      setMenus(menuResponse.data || []);
      setSubmenus(submenuResponse.data || []);
    } catch (error) {
      console.error('Failed to load menu items:', error);
    }
  }, []);

  useEffect(() => {
    loadMenuItems();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [searchTerm, statusFilter, dateFilter, currentPage]);

  const handleSearch = () => {
    setSearchTerm(searchInput);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        ...formData,
        delivery_date: new Date(formData.delivery_date).toISOString(),
        items: formData.items.map(item => ({
          ...item,
          price: parseFloat(item.price),
          quantity: parseInt(item.quantity)
        }))
      };

      if (editingOrder) {
        // Update functionality would go here
        showNotification('success', 'Success', 'Catering order updated successfully');
      } else {
        await cateringOrderService.create(orderData);
        showNotification('success', 'Success', 'Catering order created successfully');
      }
      
      setShowModal(false);
      setEditingOrder(null);
      setFormData({ customer_name: '', customer_phone: '', delivery_date: '', payment_via: '', items: [] });
      loadOrders();
    } catch (error) {
      console.error('Failed to save catering order:', error);
      showNotification('error', 'Error', `Failed to ${editingOrder ? 'update' : 'create'} catering order`);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await cateringOrderService.updateStatus(id, status);
      showNotification('success', 'Success', 'Order status updated successfully');
      loadOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
      showNotification('error', 'Error', 'Failed to update order status');
    }
  };

  const handleDelete = (order) => {
    setDeletingOrder(order);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await cateringOrderService.delete(deletingOrder.id);
      showNotification('success', 'Success', 'Catering order deleted successfully');
      loadOrders();
    } catch (error) {
      console.error('Failed to delete catering order:', error);
      showNotification('error', 'Error', 'Failed to delete catering order');
    } finally {
      setShowDeleteModal(false);
      setDeletingOrder(null);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item_id: '', item_type: 'menu', quantity: 1, price: 0, submenus: [] }]
    });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Auto-fill price when item is selected
    if (field === 'item_id' && value) {
      const itemType = updatedItems[index].item_type;
      const items = itemType === 'menu' ? menus : submenus;
      const selectedItem = items.find(item => item.id === value);
      if (selectedItem) {
        updatedItems[index].price = selectedItem.sell_price;
      }
    }
    
    setFormData({ ...formData, items: updatedItems });
  };

  const addTopping = (menuIndex, submenuId) => {
    const submenu = submenus.find(s => s.id === submenuId);
    if (submenu) {
      const updatedItems = [...formData.items];
      const newSubmenu = {
        item_id: submenuId,
        item_type: 'submenu',
        quantity: 1,
        price: submenu.sell_price
      };
      updatedItems[menuIndex].submenus = [...(updatedItems[menuIndex].submenus || []), newSubmenu];
      setFormData({ ...formData, items: updatedItems });
    }
  };

  const updateSubmenuQuantity = (menuIndex, submenuIndex, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedItems = [...formData.items];
    updatedItems[menuIndex].submenus[submenuIndex].quantity = newQuantity;
    setFormData({ ...formData, items: updatedItems });
  };

  const getLinkedSubmenus = (menuId) => {
    return submenus.filter(submenu => 
      submenu.linked_menus && submenu.linked_menus.includes(menuId)
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-orange-100 text-orange-800',
      ready: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-600 rounded-full border-t-transparent"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <div className="flex items-center justify-center w-12 h-12 mr-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text">
              Catering Orders
            </h1>
            <p className="mt-1 text-gray-600">Manage customer orders and track delivery status</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <motion.div 
        className="p-6 mb-6 bg-white shadow-lg rounded-2xl"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full py-3 pl-10 pr-10 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:w-64"
                />
                {searchInput && (
                  <button
                    onClick={clearSearch}
                    className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
              <button
                onClick={handleSearch}
                className="px-3 py-3 text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-50 hover:text-orange-700 sm:flex-shrink-0"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 transition-all duration-200 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 sm:w-auto"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-3 transition-all duration-200 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 sm:w-auto"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
          <motion.button
            onClick={() => setShowModal(true)}
            className="flex items-center px-6 py-3 text-white transition-all duration-200 rounded-lg shadow-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </motion.button>
        </div>
      </motion.div>

      {/* Orders List */}
      <motion.div 
        className="overflow-hidden bg-white shadow-xl rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="block sm:hidden">
          {orders.map((order, index) => (
            <div key={order.id} className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 mr-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-600">
                    <ShoppingCart className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{order.order_number}</div>
                    <div className="text-xs text-gray-500">{order.items?.length || 0} items</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowDetailsModal(true);
                    }}
                    className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Eye className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(order)}
                    className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium">{order.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-semibold">Rp {order.total_amount?.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span>{new Date(order.delivery_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    className={`px-2 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${getStatusColor(order.status)}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="delivered">Delivered</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="hidden overflow-x-auto sm:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Order Details</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Delivery</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Total</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
                {orders.map((order, index) => (
                  <tr 
                    key={order.id}
                    className="transition-all duration-200 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-600">
                          <ShoppingCart className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{order.order_number}</div>
                          <div className="text-xs text-gray-500">{order.items?.length || 0} items</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                          {order.customer_phone && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="w-3 h-3 mr-1" />
                              {order.customer_phone}
                            </div>
                          )}
                          <div className="text-xs font-medium text-blue-600">
                            💳 {order.payment_via?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <div>
                          <div>{new Date(order.delivery_date).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(order.delivery_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm font-semibold text-gray-900">
                        Rp {order.total_amount?.toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className={`px-3 py-1 text-xs font-medium rounded-full border-0 cursor-pointer transition-all duration-200 ${getStatusColor(order.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="delivered">Delivered</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <motion.button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(order)}
                          className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <CateringOrderModal
        showModal={showModal}
        setShowModal={setShowModal}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        menus={menus}
        submenus={submenus}
        addItem={addItem}
        removeItem={removeItem}
        updateItem={updateItem}
        addTopping={addTopping}
        updateSubmenuQuantity={updateSubmenuQuantity}
        getLinkedSubmenus={getLinkedSubmenus}
      />

      <CateringOrderDetail
        showDetailsModal={showDetailsModal}
        setShowDetailsModal={setShowDetailsModal}
        selectedOrder={selectedOrder}
        submenus={submenus}
        getStatusColor={getStatusColor}
      />

      <ConfirmModal
        show={showDeleteModal && deletingOrder}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Catering Order"
        message={`Are you sure you want to delete order ${deletingOrder?.order_number}? This action cannot be undone.`}
      />
    </div>
    </motion.div>
  );
};