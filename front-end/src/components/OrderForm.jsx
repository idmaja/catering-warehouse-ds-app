import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Plus, Trash2 } from 'lucide-react';
import { orderService, itemService } from '../services/api';

export const OrderForm = ({ onSave, onCancel, showNotification }) => {
  const [type, setType] = useState('purchase');
  const [items, setItems] = useState([{ item_id: '', item_name: '', quantity: 1, price: 0, priceFormatted: '' }]);
  const [availableItems, setAvailableItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const response = await itemService.getAll();
      setAvailableItems(response?.data || []);
    } catch (error) {
      console.error('Failed to load items:', error);
      setAvailableItems([]);
    }
  };

  const addItem = () => {
    setItems([...items, { item_id: '', item_name: '', quantity: 1, price: 0, priceFormatted: '' }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const formatPrice = (value) => {
    if (!value) return '';
    const numericValue = value.toString().replace(/[^\d]/g, '');
    if (!numericValue) return '';
    return parseInt(numericValue).toLocaleString('id-ID');
  };

  const parsePrice = (formattedValue) => {
    if (!formattedValue) return 0;
    return parseInt(formattedValue.toString().replace(/[^\d]/g, '')) || 0;
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    
    if (field === 'quantity') {
      updated[index][field] = parseInt(value) || 1;
    } else if (field === 'price') {
      updated[index]['priceFormatted'] = formatPrice(value);
      updated[index][field] = parsePrice(value);
    } else {
      updated[index][field] = value;
    }
    
    // Auto-fill item name when item is selected
    if (field === 'item_id' && value) {
      const selectedItem = availableItems.find(item => item.id === value);
      if (selectedItem) {
        updated[index]['item_name'] = selectedItem.name;
      }
    }
    
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = { type, items: items.filter(item => item.item_id) };
      await orderService.create(orderData);
      onSave();
      showNotification('success', 'Success', 'Order created successfully');
    } catch (error) {
      showNotification('error', 'Error', 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Create Order</h3>
                <p className="text-sm text-gray-500">Add a new purchase or sales order</p>
              </div>
            </div>
            <button onClick={onCancel} className="p-2 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Order Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="purchase">Purchase Order</option>
                <option value="sales">Sales Order</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">Order Items</label>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center px-3 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Item</span>
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="p-3 space-y-3 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <select
                        value={item.item_id}
                        onChange={(e) => updateItem(index, 'item_id', e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-lg"
                        required
                      >
                        <option value="">Select Item</option>
                        {availableItems.map((availableItem) => (
                          <option key={availableItem.id} value={availableItem.id}>
                            {availableItem.name} (SKU: {availableItem.sku})
                          </option>
                        ))}
                      </select>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-600 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {item.item_name && (
                      <div className="text-sm font-medium text-gray-700">
                        Item: {item.item_name}
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <label className="block mb-1 text-xs text-gray-600">Quantity</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                          min="1"
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block mb-1 text-xs text-gray-600">Price (Rp)</label>
                        <input
                          type="text"
                          value={item.priceFormatted || ''}
                          onChange={(e) => updateItem(index, 'price', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="0"
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block mb-1 text-xs text-gray-600">Stock Impact</label>
                        <div className="px-3 py-2 text-sm bg-gray-100 rounded-lg">
                          {item.item_id && (() => {
                            const selectedItem = availableItems.find(ai => ai.id === item.item_id);
                            if (!selectedItem) return 'N/A';
                            const currentStock = selectedItem.quantity;
                            const impact = type === 'purchase' ? item.quantity : -item.quantity;
                            const newStock = currentStock + impact;
                            return (
                              <div>
                                <div className="text-xs text-gray-600">Current: {currentStock}</div>
                                <div className={`font-medium ${
                                  type === 'purchase' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {type === 'purchase' ? '+' : ''}{impact} → {newStock}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block mb-1 text-xs text-gray-600">Subtotal</label>
                        <div className="px-3 py-2 text-sm font-medium bg-gray-100 rounded-lg">
                          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-6 border-t">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-900">Total Order:</span>
                <span className="text-xl font-bold text-blue-600">
                  Rp {items.reduce((total, item) => total + (item.price * item.quantity), 0).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 text-white rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Creating Order...' : 'Create Order'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};