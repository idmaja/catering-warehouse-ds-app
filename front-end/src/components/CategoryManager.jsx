import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Tag, X } from 'lucide-react';
import { categoryService } from '../services/api';
import { ConfirmModal } from './ConfirmModal';

export const CategoryManager = ({ isOpen, onClose, showNotification }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', color: '#3B82F6' });

  const colorOptions = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, category: null });

  const loadCategories = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '8'
      });
      const response = await categoryService.getAllWithPagination(params.toString());
      setCategories(
        Array.isArray(response?.data) 
          ? response.data 
          : response?.data?.data ?? []
      );
      setTotalPages(response?.total_pages || 1);
      setTotalCategories(response?.total || 0);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);
  
  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen, currentPage, loadCategories]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id, formData);
      } else {
        await categoryService.create(formData);
      }
      loadCategories();
      setShowForm(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
      showNotification('success', 'Success', editingCategory ? 'Category updated successfully' : 'Category created successfully');
    } catch (error) {
      showNotification('error', 'Error', 'Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || '', color: category.color || '#3B82F6' });
    setShowForm(true);
  };

  const handleDelete = (category) => {
    setDeleteConfirm({ isOpen: true, category });
  };

  const confirmDelete = async () => {
    try {
      await categoryService.delete(deleteConfirm.category.id);
      loadCategories();
      showNotification('success', 'Success', 'Category deleted successfully');
    } catch (error) {
      showNotification('error', 'Error', 'Failed to delete category');
    }
    setDeleteConfirm({ isOpen: false, category: null });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg sm:h-10 sm:w-10 bg-gradient-to-r from-green-500 to-blue-600">
                <Tag className="w-4 h-4 text-white sm:h-5 sm:w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Category Manager</h2>
                <p className="hidden text-xs text-gray-500 sm:text-sm sm:block">Manage inventory categories</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="flex flex-col items-start justify-between gap-3 mb-6 sm:flex-row sm:items-center sm:gap-0">
              <h3 className="text-lg font-semibold">Categories</h3>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-white transition-all rounded-lg bg-gradient-to-r from-green-600 to-blue-600 hover:shadow-lg sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 mb-6 rounded-lg bg-gray-50"
              >
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Category name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 sm:text-base"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 sm:text-base"
                  />
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Color</label>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({ ...formData, color })}
                          className={`w-8 h-8 rounded-full border-2 ${
                            formData.color === color ? 'border-gray-800' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 sm:text-base"
                    >
                      {editingCategory ? 'Update' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingCategory(null);
                        setFormData({ name: '', description: '', color: '#3B82F6' });
                      }}
                      className="px-4 py-2 text-sm text-gray-700 bg-gray-300 rounded-lg hover:bg-gray-400 sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {loading ? (
              <div className="py-8 text-center">Loading categories...</div>
            ) : (
              <div className="grid gap-3">
                {(Array.isArray(categories) ? categories : []).map((category) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 transition-shadow bg-white border rounded-lg sm:p-4 hover:shadow-md"
                  >
                    <div className="flex items-center flex-1 min-w-0 mr-3 space-x-3">
                      <div 
                        className="flex-shrink-0 w-4 h-4 rounded-full" 
                        style={{ backgroundColor: category.color || '#3B82F6' }}
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate sm:text-base">{category.name}</h4>
                        {category.description && (
                          <p className="text-xs text-gray-500 truncate sm:text-sm">{category.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 space-x-1 sm:space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-blue-600 rounded-lg hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category)}
                        className="p-2 text-red-600 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 mt-4 rounded-lg bg-gray-50">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * 8) + 1} to {Math.min(currentPage * 8, totalCategories)} of {totalCategories} categories
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-2 py-1 text-sm font-medium rounded ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
        
        <ConfirmModal
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, category: null })}
          onConfirm={confirmDelete}
          title="Delete Category"
          message={`Are you sure you want to delete "${deleteConfirm.category?.name}"? This action cannot be undone.`}
        />
      </motion.div>
    </AnimatePresence>
  );
};