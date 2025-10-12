import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, ShoppingCart } from 'lucide-react';

export const CateringOrderDetail = ({ 
  showDetailsModal, 
  setShowDetailsModal, 
  selectedOrder, 
  submenus, 
  getStatusColor 
}) => {
  if (!showDetailsModal || !selectedOrder) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          <div className="mb-6">
            <div className="flex items-center justify-between p-6 mb-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-600">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedOrder.order_number}</h2>
                  <p className="text-sm text-gray-600">Order Details & Summary</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 text-gray-400 rounded-lg hover:text-gray-600 hover:bg-white"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
              <div className="p-6 border border-orange-200 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100">
                <div className="flex items-center mb-3">
                  <ShoppingCart className="w-5 h-5 mr-2 text-orange-600" />
                  <h3 className="font-semibold text-orange-800">Order Info</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">Status: <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span></p>
                  <p className="text-sm text-gray-700">Items: <span className="font-medium">{selectedOrder.items?.length || 0}</span></p>
                  <p className="text-sm text-gray-700">Created: <span className="font-medium">{new Date(selectedOrder.created_at).toLocaleDateString()}</span></p>
                </div>
              </div>
              
              <div className="p-6 border border-blue-200 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="flex items-center mb-3">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Customer</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">Name: <span className="font-medium">{selectedOrder.customer_name}</span></p>
                  {selectedOrder.customer_phone && (
                    <p className="text-sm text-gray-700">Phone: <span className="font-medium">{selectedOrder.customer_phone}</span></p>
                  )}
                  <p className="text-sm text-gray-700">Payment: <span className="font-medium text-blue-600">{selectedOrder.payment_via?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span></p>
                </div>
              </div>
              
              <div className="p-6 border border-green-200 rounded-xl bg-gradient-to-br from-green-50 to-green-100">
                <div className="flex items-center mb-3">
                  <Calendar className="w-5 h-5 mr-2 text-green-600" />
                  <h3 className="font-semibold text-green-800">Delivery</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">Date: <span className="font-medium">{new Date(selectedOrder.delivery_date).toLocaleDateString()}</span></p>
                  <p className="text-sm text-gray-700">Time: <span className="font-medium">{new Date(selectedOrder.delivery_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></p>
                  <p className="text-sm text-gray-700">Total: <span className="font-bold text-green-600">Rp {selectedOrder.total_amount?.toLocaleString('id-ID')}</span></p>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <ShoppingCart className="w-5 h-5 mr-2 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-800">Order Items</h3>
              </div>
              <div className="space-y-4">
                {selectedOrder.items?.map((item, index) => {
                  const itemTotal = (item.price * item.quantity) + (item.submenus?.reduce((total, submenu) => total + (submenu.price * submenu.quantity), 0) || 0);
                  return (
                    <div key={index} className="overflow-hidden border border-gray-200 rounded-xl">
                      <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-purple-700">
                              <span className="text-sm font-bold text-white">{index + 1}</span>
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{item.item_name}</h4>
                              <div className="flex items-center mt-1 space-x-4">
                                <span className="px-2 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded-full">Qty: {item.quantity}</span>
                                <span className="text-sm text-gray-600">@ Rp {item.price?.toLocaleString('id-ID')}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              Rp {itemTotal?.toLocaleString('id-ID')}
                            </p>
                            <p className="text-xs text-gray-500">Item Total</p>
                          </div>
                        </div>
                      </div>
                      
                      {item.submenus && item.submenus.length > 0 && (
                        <div className="p-4 bg-orange-50">
                          <div className="flex items-center mb-3">
                            <span className="text-sm font-semibold text-orange-800">🍽️ Added Toppings</span>
                          </div>
                          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            {item.submenus.map((submenu, submenuIndex) => {
                              const submenuData = submenus.find(s => s.id === submenu.item_id);
                              return (
                                <div key={submenuIndex} className="flex items-center justify-between p-3 bg-white border border-orange-200 rounded-lg">
                                  <div className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                                    <span className="text-sm font-medium text-gray-700">
                                      {submenuData?.title}
                                    </span>
                                    <span className="px-1.5 py-0.5 text-xs bg-orange-100 text-orange-700 rounded">x{submenu.quantity}</span>
                                  </div>
                                  <span className="text-sm font-semibold text-orange-600">
                                    Rp {(submenu.price * submenu.quantity)?.toLocaleString('id-ID')}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="p-6 border-t-4 border-orange-500 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">💰</span>
                  <span className="text-xl font-bold text-gray-900">Grand Total</span>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-orange-600">
                    Rp {selectedOrder.total_amount?.toLocaleString('id-ID')}
                  </span>
                  <p className="text-sm text-gray-600">All items & toppings included</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};