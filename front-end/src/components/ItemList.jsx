import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, Package } from 'lucide-react';
import { itemService } from '../services/api';
import { ConfirmModal } from './ConfirmModal';
import { ItemDetailModal } from './ItemDetailModal';

export const ItemList = ({ onEdit, refresh, refreshTrigger, showNotification, selectedCategory, searchTerm = '' }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, item: null });
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadItems = React.useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '9',
        ...(debouncedSearchTerm && { search: debouncedSearchTerm })
      });
      const response = await itemService.getAllWithPagination(params.toString());
      let filteredItems = response?.data || [];
      
      // Client-side category filtering
      if (selectedCategory) {
        filteredItems = filteredItems.filter(item => item.category_id === selectedCategory);
      }
      
      setItems(filteredItems);
      setTotalPages(response?.total_pages || 1);
      setTotalItems(response?.total || 0);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategory, debouncedSearchTerm]);

  useEffect(() => {
    loadItems();
  }, [refresh, refreshTrigger, loadItems]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, debouncedSearchTerm]);

  const handleDelete = (item) => {
    setDeleteConfirm({ isOpen: true, item });
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const confirmDelete = async () => {
    try {
      await itemService.delete(deleteConfirm.item.id);
      loadItems();
      showNotification('success', 'Success', 'Item deleted successfully');
    } catch (error) {
      showNotification('error', 'Error', 'Failed to delete item');
    }
    setDeleteConfirm({ isOpen: false, item: null });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading items...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-3 ">
      {/* Items Grid */}
      <AnimatePresence>
        {items.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 text-center"
          >
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No items found</h3>
            <p className="text-gray-500">Try adjusting your search or add a new item.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
                className="p-6 transition-all duration-300 bg-white border border-gray-200 shadow-lg cursor-pointer rounded-xl hover:shadow-xl"
                onClick={() => handleItemClick(item)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        {item.category_name && (
                          <span 
                            className="px-2 py-1 ml-1 text-xs font-medium text-white rounded-full"
                            style={{ backgroundColor: item.category_color || '#3B82F6' }}
                          >
                            {item.category_name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(item);
                      }}
                      className="p-2 text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item);
                      }}
                      className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Quantity</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.quantity > 10 
                        ? 'bg-green-100 text-green-800' 
                        : item.quantity > 5 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.quantity}
                    </span>
                  </div>
                  
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((item.quantity / 50) * 100, 100)}%` }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                      className={`h-2 rounded-full ${
                        item.quantity > 10 
                          ? 'bg-green-500' 
                          : item.quantity > 5 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500'
                      }`}
                    ></motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 mt-6 bg-white border border-gray-200 rounded-xl">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * 9) + 1} to {Math.min(currentPage * 9, totalItems)} of {totalItems} items
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
      
      <ConfirmModal
        show={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, item: null })}
        onConfirm={confirmDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${deleteConfirm.item?.name}"? This action cannot be undone.`}
      />
      
      <ItemDetailModal
        item={selectedItem}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedItem(null);
        }}
      />
    </div>
  );
};