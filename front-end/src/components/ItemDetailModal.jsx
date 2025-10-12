import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Hash, Tag, BarChart3, Calendar, AlertTriangle } from 'lucide-react';

export const ItemDetailModal = ({ item, isOpen, onClose }) => {
  if (!isOpen || !item) return null;

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-100' };
    if (quantity < 10) return { text: 'Low Stock', color: 'text-orange-600 bg-orange-100' };
    if (quantity < 50) return { text: 'Medium Stock', color: 'text-yellow-600 bg-yellow-100' };
    return { text: 'In Stock', color: 'text-green-600 bg-green-100' };
  };

  const stockStatus = getStockStatus(item.quantity);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 mt-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
                <p className="text-sm text-gray-500">Item Details</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 transition-colors rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center p-4 space-x-3 rounded-lg bg-gray-50">
                  <Hash className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">SKU</p>
                    <p className="text-lg font-semibold text-gray-900">{item.sku}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 space-x-3 rounded-lg bg-gray-50">
                  <Tag className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Category</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {item.category_name || 'Uncategorized'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center p-4 space-x-3 rounded-lg bg-gray-50">
                  <BarChart3 className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Quantity</p>
                    <p className="text-2xl font-bold text-gray-900">{item.quantity}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 space-x-3 rounded-lg bg-gray-50">
                  <AlertTriangle className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Stock Status</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${stockStatus.color}`}>
                      {stockStatus.text}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <div className="p-4 rounded-lg bg-blue-50">
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Description</h3>
                <p className="leading-relaxed text-gray-700">{item.description}</p>
              </div>
            )}

            {/* Timestamps */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center p-4 space-x-3 border border-gray-200 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Created</p>
                  <p className="text-sm text-gray-900">
                    {new Date(item.created_at).toLocaleDateString('en-GB', {
                      timeZone: 'Asia/Jakarta',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })} WIB
                  </p>
                </div>
              </div>
              
              <div className="flex items-center p-4 space-x-3 border border-gray-200 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Updated</p>
                  <p className="text-sm text-gray-900">
                    {new Date(item.updated_at).toLocaleDateString('en-GB', {
                      timeZone: 'Asia/Jakarta',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })} WIB
                  </p>
                </div>
              </div>
            </div>

            {/* Stock Analysis */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50">
              <h3 className="mb-3 text-lg font-semibold text-gray-900">Stock Analysis</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-indigo-600">{item.quantity}</p>
                  <p className="text-xs text-gray-600">Current Stock</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {item.quantity > 0 ? Math.ceil(item.quantity / 30) : 0}
                  </p>
                  <p className="text-xs text-gray-600">Est. Months Supply</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {item.quantity < 10 ? 10 - item.quantity : 0}
                  </p>
                  <p className="text-xs text-gray-600">Reorder Needed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    Rp {(item.quantity * 1000).toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-gray-600">Est. Value</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};