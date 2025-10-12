import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Calendar, User, ShoppingCart, Phone } from 'lucide-react';

export const CateringOrderModal = ({ 
  showModal, 
  setShowModal, 
  formData, 
  setFormData, 
  handleSubmit, 
  menus, 
  submenus, 
  addItem, 
  removeItem, 
  updateItem, 
  addTopping, 
  updateSubmenuQuantity, 
  getLinkedSubmenus 
}) => {
  if (!showModal) return null;

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
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-r from-orange-500 to-red-600">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">New Catering Order</h2>
            <p className="mt-2 text-gray-600">Create a new catering order with menu and submenu items</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="flex items-center mb-3 text-sm font-semibold text-gray-700">
                  <User className="w-4 h-4 mr-2 text-orange-600" />
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full px-4 py-3 text-gray-900 transition-all duration-200 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 hover:border-gray-300"
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div>
                <label className="flex items-center mb-3 text-sm font-semibold text-gray-700">
                  <Phone className="w-4 h-4 mr-2 text-orange-600" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  className="w-full px-4 py-3 text-gray-900 transition-all duration-200 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 hover:border-gray-300"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="flex items-center mb-3 text-sm font-semibold text-gray-700">
                  <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                  Delivery Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.delivery_date}
                  onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                  className="w-full px-4 py-3 text-gray-900 transition-all duration-200 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 hover:border-gray-300"
                  required
                />
              </div>
              <div>
                <label className="flex items-center mb-3 text-sm font-semibold text-gray-700">
                  💳 Payment Via *
                </label>
                <select
                  value={formData.payment_via}
                  onChange={(e) => setFormData({ ...formData, payment_via: e.target.value })}
                  className="w-full px-4 py-3 text-gray-900 transition-all duration-200 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 hover:border-gray-300"
                  required
                >
                  <option value="">Select Payment Method</option>
                  <option value="qris">QRIS</option>
                  <option value="cash">Cash</option>
                  <option value="bri">BRI</option>
                  <option value="shopeepay">Shopeepay</option>
                  <option value="gopay">Gopay</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <ShoppingCart className="w-4 h-4 mr-2 text-orange-600" />
                  Order Items *
                </label>
                <motion.button
                  type="button"
                  onClick={addItem}
                  className="flex items-center px-4 py-2 text-white transition-all duration-200 rounded-lg shadow-md bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </motion.button>
              </div>
              
              {formData.items.length === 0 && (
                <div className="p-8 text-center border-2 border-gray-200 border-dashed rounded-xl">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No items added yet</p>
                  <p className="text-sm text-gray-400">Click "Add Item" to start building the order</p>
                </div>
              )}
              
              {formData.items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-4 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100"
                >
                  <div>
                    <label className="block mb-2 text-xs font-medium text-gray-600">Menu</label>
                    <select
                      value={item.item_id}
                      onChange={(e) => updateItem(index, 'item_id', e.target.value)}
                      className="w-full px-3 py-2 text-sm transition-all duration-200 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      required
                    >
                      <option value="">Select Menu</option>
                      {menus.map((menuItem) => (
                        <option key={menuItem.id} value={menuItem.id}>
                          {menuItem.title} - Rp {menuItem.sell_price?.toLocaleString('id-ID')}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {item.item_id && (
                    <div className="mt-4">
                      <div className="p-3 border border-orange-200 rounded-lg bg-orange-50">
                        <h4 className="mb-2 text-sm font-semibold text-orange-800">🍽️ Customize Your Order (Add Toppings)</h4>
                        {getLinkedSubmenus(item.item_id).length > 0 ? (
                          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            {getLinkedSubmenus(item.item_id).map((submenu) => (
                              <motion.button
                                key={submenu.id}
                                type="button"
                                onClick={() => addTopping(index, submenu.id)}
                                className="flex items-center justify-between p-2 text-left transition-all duration-200 bg-white border border-orange-200 rounded-lg hover:bg-orange-100 hover:border-orange-300"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <span className="text-sm font-medium text-gray-700">{submenu.title}</span>
                                <span className="text-xs font-semibold text-orange-600">
                                  +Rp {submenu.sell_price?.toLocaleString('id-ID')}
                                </span>
                              </motion.button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-orange-600">No toppings available for this menu</p>
                        )}
                      </div>
                      
                      {item.submenus && item.submenus.length > 0 && (
                        <div className="mt-2">
                          <h5 className="mb-2 text-xs font-medium text-gray-600">Added Toppings:</h5>
                          <div className="space-y-1">
                            {item.submenus.map((submenu, submenuIndex) => (
                              <div key={submenuIndex} className="flex items-center justify-between p-2 bg-white border rounded">
                                <span className="flex-1 text-sm">{submenus.find(s => s.id === submenu.item_id)?.title}</span>
                                <div className="flex items-center space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => updateSubmenuQuantity(index, submenuIndex, submenu.quantity - 1)}
                                    className="flex items-center justify-center w-6 h-6 text-xs text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                                  >
                                    -
                                  </button>
                                  <span className="w-8 font-medium text-center">{submenu.quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => updateSubmenuQuantity(index, submenuIndex, submenu.quantity + 1)}
                                    className="flex items-center justify-center w-6 h-6 text-xs text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                                  >
                                    +
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedItems = [...formData.items];
                                      updatedItems[index].submenus = updatedItems[index].submenus.filter((_, i) => i !== submenuIndex);
                                      setFormData({ ...formData, items: updatedItems });
                                    }}
                                    className="ml-2 text-red-600 hover:text-red-800"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-4">
                    <div className="md:col-span-1">
                      <label className="block mb-2 text-xs font-medium text-gray-600">Quantity</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 text-sm transition-all duration-200 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        min="1"
                        placeholder="1"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block mb-2 text-xs font-medium text-gray-600">Price</label>
                      <div className="relative">
                        <span className="absolute text-sm text-gray-500 transform -translate-y-1/2 left-3 top-1/2">Rp</span>
                        <input
                          type="text"
                          value={item.price ? parseFloat(item.price).toLocaleString('id-ID') : ''}
                          className="w-full py-2 pl-8 pr-3 text-sm transition-all duration-200 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100"
                          placeholder="0"
                          disabled
                        />
                      </div>
                    </div>
                    <div className="flex items-end md:col-span-1">
                      <motion.button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="w-full px-3 py-2 text-white transition-all duration-200 bg-red-600 rounded-lg hover:bg-red-700"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </motion.button>
                    </div>
                  </div>
                  
                  {item.price && item.quantity && (
                    <div className="pt-3 mt-3 border-t border-gray-300">
                      <p className="text-sm font-semibold text-gray-700">
                        Menu Subtotal: Rp {(parseFloat(item.price || 0) * parseInt(item.quantity || 1)).toLocaleString('id-ID')}
                      </p>
                      {item.submenus && item.submenus.length > 0 && (
                        <p className="text-sm text-gray-600">
                          Toppings: Rp {item.submenus.reduce((total, submenu) => total + (submenu.price * submenu.quantity), 0).toLocaleString('id-ID')}
                        </p>
                      )}
                      <p className="text-sm font-bold text-gray-900">
                        Total: Rp {((parseFloat(item.price || 0) * parseInt(item.quantity || 1)) + (item.submenus?.reduce((total, submenu) => total + (submenu.price * submenu.quantity), 0) || 0)).toLocaleString('id-ID')}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
              
              {formData.items.length > 0 && (
                <div className="p-4 border border-orange-200 rounded-xl bg-gradient-to-r from-orange-50 to-red-50">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">Total Order:</span>
                    <span className="text-xl font-bold text-orange-600">
                      Rp {formData.items.reduce((total, item) => {
                        const menuTotal = parseFloat(item.price || 0) * parseInt(item.quantity || 1);
                        const submenuTotal = (item.submenus || []).reduce((subTotal, submenu) => 
                          subTotal + (submenu.price * submenu.quantity), 0
                        );
                        return total + menuTotal + submenuTotal;
                      }, 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <motion.button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setFormData({ customer_name: '', customer_phone: '', delivery_date: '', payment_via: '', items: [] });
                }}
                className="px-6 py-3 text-gray-600 transition-all duration-200 border border-gray-300 rounded-lg hover:bg-gray-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                className="px-6 py-3 text-white transition-all duration-200 rounded-lg shadow-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Create Order
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};