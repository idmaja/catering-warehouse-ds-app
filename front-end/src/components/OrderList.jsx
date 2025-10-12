import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Eye, Search, X } from 'lucide-react';
import { orderService } from '../services/api';
import { ConfirmModal } from './ConfirmModal';

export const OrderList = ({ refreshTrigger, showNotification }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, order: null });
  const [selectedOrder, setSelectedOrder] = useState(null);



  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter, dateFilter]);

  const loadOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter }),
        ...(dateFilter && { date_filter: dateFilter }),
        ...(debouncedSearchTerm && { search: debouncedSearchTerm })
      });
      const response = await orderService.getAllWithFilters(params.toString());
      const orders = response?.orders || [];
      setOrders(Array.isArray(orders) ? orders : []);
      setTotalPages(response?.total_pages || 1);
      setTotalOrders(response?.total || 0);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, dateFilter, debouncedSearchTerm, currentPage]);

  useEffect(() => {
    loadOrders();
  }, [refreshTrigger, loadOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      await loadOrders();
      showNotification('success', 'Success', 'Order status updated successfully');
      setTimeout(() => window.location.reload(), 100);
    } catch (error) {
      showNotification('error', 'Error', 'Failed to update order status');
    }
  };

  const handleDelete = (order) => {
    setDeleteConfirm({ isOpen: true, order });
  };

  const confirmDelete = async () => {
    try {
      await orderService.delete(deleteConfirm.order.id);
      await loadOrders();
      showNotification('success', 'Success', 'Order deleted successfully');
      setTimeout(() => window.location.reload(), 100);
    } catch (error) {
      showNotification('error', 'Error', 'Failed to delete order');
    }
    setDeleteConfirm({ isOpen: false, order: null });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    return type === 'purchase' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-6 ">
      {/* Enhanced Filter Section */}
      <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filter & Search Orders</h3>
          <button
            onClick={() => {
              setSearchTerm('');
              setDebouncedSearchTerm('');
              setStatusFilter('');
              setTypeFilter('');
              setDateFilter('');
              setCurrentPage(1);
            }}
            className="px-3 py-1 text-sm text-gray-600 transition-colors border border-gray-300 rounded-lg hover:text-gray-900 hover:bg-gray-50"
          >
            Clear All
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
          <input
            type="text"
            placeholder="Search by order number, item name, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 pl-10 pr-4 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setDebouncedSearchTerm('');
              }}
              className="absolute text-gray-400 right-3 top-3 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Status Filter */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 transition-colors bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Order Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-3 transition-colors bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="purchase">Purchase Orders</option>
              <option value="sales">Sales Orders</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Date Range</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-3 transition-colors bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(debouncedSearchTerm || statusFilter || typeFilter || dateFilter) && (
          <div className="pt-4 mt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Active filters:</span>
              {debouncedSearchTerm && (
                <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                  Search: "{debouncedSearchTerm}"
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setDebouncedSearchTerm('');
                    }}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {statusFilter && (
                <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                  Status: {statusFilter}
                  <button
                    onClick={() => setStatusFilter('')}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {typeFilter && (
                <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded-full">
                  Type: {typeFilter}
                  <button
                    onClick={() => setTypeFilter('')}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {dateFilter && (
                <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-orange-800 bg-orange-100 rounded-full">
                  Date: {dateFilter}
                  <button
                    onClick={() => setDateFilter('')}
                    className="ml-2 text-orange-600 hover:text-orange-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}


      </div>

      <AnimatePresence>
        {orders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 text-center"
          >
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No orders found</h3>
            <p className="text-gray-500">Try adjusting your search or create a new order.</p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 transition-shadow bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                      <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{order.order_number}</h3>
                      <p className="text-sm text-gray-500">Total: Rp {(order.total_amount || 0).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(order.type)}`}>
                      {order.type}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Items : {
                    <span className="px-2 py-[0.2rem] font-medium text-purple-800 bg-purple-300 rounded-full text-md">
                      {order.items?.length} 
                    </span> || 0
                    } | Created : 
                    <span className="px-2 py-1 mx-2 font-medium text-orange-800 bg-orange-100 rounded-full text-md">
                      {new Date(order.created_at).toLocaleDateString('en-GB', {
                          timeZone: 'Asia/Jakarta',
                          day: '2-digit',
                          month: '2-digit', 
                          year: 'numeric',
                      }).replace(/\//g, '-').replace(', ', '-')}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 text-blue-600 rounded-lg hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    {order.status !== 'completed' && (
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className="px-2 py-1 text-xs border rounded"
                      >
                        <option value="draft">Draft</option>
                        <option value="approved">Approved</option>
                        <option value="completed">Completed</option>
                      </select>
                    )}{order.status !== 'completed' && (
                      <button
                        onClick={() => handleDelete(order)}
                        className="p-2 text-red-600 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalOrders)} of {totalOrders} orders
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-1">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                if (totalPages <= 7 || page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2 text-gray-400">...</span>;
                }
                return null;
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
                  <p className="text-sm text-gray-600">{selectedOrder.order_number}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 transition-colors rounded-lg hover:bg-white/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Status Banner */}
              <div className={`p-4 rounded-lg mb-6 ${
                selectedOrder.status === 'completed' ? 'bg-green-50 border border-green-200' :
                selectedOrder.status === 'approved' ? 'bg-blue-50 border border-blue-200' :
                'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full md:text-sm text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full md:text-sm text-xs font-medium ${getTypeColor(selectedOrder.type)}`}>
                      {selectedOrder.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">Rp {(selectedOrder.total_amount || 0).toLocaleString('id-ID')}</p>
                    <p className="text-sm text-gray-600">Total Amount</p>
                  </div>
                </div>
              </div>

              {/* Order Information Grid */}
              <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-gray-50">
                  <p className="mb-1 text-sm font-medium text-gray-600">Order Number</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedOrder.order_number}</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50">
                  <p className="mb-1 text-sm font-medium text-gray-600">Created Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(selectedOrder.created_at).toLocaleDateString('en-GB', {
                      timeZone: 'Asia/Jakarta',
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedOrder.created_at).toLocaleTimeString('en-GB', {
                      timeZone: 'Asia/Jakarta',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50">
                  <p className="mb-1 text-sm font-medium text-gray-600">Items Count</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedOrder.items?.length || 0} Items</p>
                </div>
              </div>

              {/* Items Section */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h4 className="text-lg font-semibold text-gray-900">Order Items</h4>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                            <span className="font-bold text-white">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{item.item_name}</p>
                            <p className="text-sm text-gray-600">Unit Price: Rp {item.price.toLocaleString('id-ID')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Quantity</p>
                              <p className="text-lg font-semibold text-gray-900">{item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Subtotal</p>
                              <p className="text-lg font-semibold text-gray-900">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Total Summary */}
                  <div className="pt-6 mt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                      <span className="text-2xl font-bold text-gray-900">Rp {(selectedOrder.total_amount || 0).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      <ConfirmModal
        show={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, order: null })}
        onConfirm={confirmDelete}
        title="Delete Order"
        message={`Are you sure you want to delete order "${deleteConfirm.order?.order_number}"? This action cannot be undone.`}
      />
    </div>
  );
};