import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, TrendingUp, DollarSign } from 'lucide-react';
import { orderService } from '../services/api';
import { OrderList } from './OrderList';

export const OrderManagement = ({ onAddOrder, refreshTrigger, showNotification }) => {
  const [stats, setStats] = useState({ 
    totalOrders: 0, 
    draftOrders: 0, 
    completedOrders: 0,
    totalValue: 0 
  });

  const loadStats = React.useCallback(async () => {
    try {
      const data = await orderService.getAll();
      const orders = Array.isArray(data?.orders) ? data.orders : Array.isArray(data) ? data : [];
      const totalOrders = orders.length;
      const draftOrders = orders.filter(o => o.status === 'draft').length;
      const completedOrders = orders.filter(o => o.status === 'completed').length;
      const totalValue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      
      setStats({ totalOrders, draftOrders, completedOrders, totalValue });
    } catch (error) {
      console.error('Failed to load order stats:', error);
    }
  }, []);
  
  useEffect(() => {
    loadStats();
  }, [refreshTrigger, loadStats]);


  return (
    <div className="w-full max-w-full p-4 overflow-x-hidden sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
          <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Draft Orders</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.draftOrders}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedOrders}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-purple-600">Rp {stats.totalValue.toLocaleString('id-ID')}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Order Management</h3>
                <p className="text-sm text-gray-600">Manage purchase and sales orders</p>
              </div>
              <button
                onClick={onAddOrder}
                className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-white transition-all rounded-lg sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Create Order</span>
              </button>
            </div>
          </div>
          <div className="p-6">
            <OrderList refreshTrigger={refreshTrigger} showNotification={showNotification} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};