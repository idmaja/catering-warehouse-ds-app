import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submenuService, menuCategoryService, menuService } from '../services/api';
import { Plus, Edit, Trash2, Search, Menu, DollarSign, ChefHat, CheckCircle, FileText, Tag, Link, X } from 'lucide-react';

export const SubmenuList = ({ showNotification }) => {
  const [submenus, setSubmenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingSubmenu, setDeletingSubmenu] = useState(null);
  const [editingSubmenu, setEditingSubmenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    linked_menus: [],
    sell_price: '',
    status: 'active'
  });

  const loadSubmenus = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm })
      });
      
      const response = await submenuService.getAllWithPagination(queryParams.toString());
      setSubmenus(response.data || []);
      setTotalPages(response.total_pages || 1);
    } catch (error) {
      console.error('Failed to load submenus:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await menuCategoryService.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, []);

  const loadMenus = useCallback(async () => {
    try {
      const response = await menuService.getAllWithPagination('limit=100');
      setMenus(response.data || []);
    } catch (error) {
      console.error('Failed to load menus:', error);
    }
  }, []);

  useEffect(() => {
    loadCategories();
    loadMenus();
  }, []);

  useEffect(() => {
    loadSubmenus();
  }, [searchTerm, currentPage]);

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
      const submenuData = {
        ...formData,
        sell_price: parseFloat(formData.sell_price)
      };

      if (editingSubmenu) {
        await submenuService.update(editingSubmenu.id, submenuData);
        showNotification('success', 'Success', 'Submenu updated successfully');
      } else {
        await submenuService.create(submenuData);
        showNotification('success', 'Success', 'Submenu created successfully');
      }
      
      setShowModal(false);
      setEditingSubmenu(null);
      setFormData({ title: '', description: '', category_id: '', linked_menus: [], sell_price: '', status: 'active' });
      loadSubmenus();
    } catch (error) {
      console.error('Failed to save submenu:', error);
      showNotification('error', 'Error', `Failed to ${editingSubmenu ? 'update' : 'create'} submenu`);
    }
  };

  const handleEdit = (submenu) => {
    setEditingSubmenu(submenu);
    setFormData({
      title: submenu.title || '',
      description: submenu.description || '',
      category_id: submenu.category_id || '',
      linked_menus: submenu.linked_menus || [],
      sell_price: submenu.sell_price?.toString() || '',
      status: submenu.status || 'active'
    });
    setShowModal(true);
  };

  const handleDelete = (submenu) => {
    setDeletingSubmenu(submenu);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await submenuService.delete(deletingSubmenu.id);
      showNotification('success', 'Success', 'Submenu deleted successfully');
      loadSubmenus();
    } catch (error) {
      console.error('Failed to delete submenu:', error);
      showNotification('error', 'Error', 'Failed to delete submenu');
    } finally {
      setShowDeleteModal(false);
      setDeletingSubmenu(null);
    }
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
      {/* Header */}
      <div className="flex flex-col items-start justify-between mb-6 space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <motion.div 
          className="flex flex-col items-start space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search submenus..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full py-2 pl-10 pr-10 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:w-auto"
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
              className="px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 hover:text-blue-700 sm:flex-shrink-0"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
        <motion.button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 text-white transition-all duration-200 rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Submenu
        </motion.button>
      </div>

      {/* Submenu List */}
      <motion.div 
        className="overflow-hidden bg-white shadow-xl rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="block sm:hidden">
          {submenus.map((submenu, index) => (
            <div key={submenu.id} className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 mr-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-700">
                    <Menu className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{submenu.title}</div>
                    <div className="text-xs text-gray-500">{submenu.description}</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => handleEdit(submenu)}
                    className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(submenu)}
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
                  <span className="text-gray-600">Category:</span>
                  {submenu.category_name ? (
                    <span 
                      className="px-2 py-1 text-xs font-medium text-white rounded-full"
                      style={{ backgroundColor: submenu.category_color || '#6B7280' }}
                    >
                      {submenu.category_name}
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                      No Category
                    </span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-semibold">Rp {submenu.sell_price?.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    submenu.status === 'active' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {submenu.status}
                  </span>
                </div>
                {submenu.linked_menus && submenu.linked_menus.length > 0 && (
                  <div>
                    <span className="text-gray-600">Linked Menus:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {submenu.linked_menus.map((menuId, idx) => {
                        const menu = menus.find(m => m.id === menuId);
                        return menu ? (
                          <span key={idx} className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                            {menu.title}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="hidden overflow-x-auto sm:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Submenu Details</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Category</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Price</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
                {submenus.map((submenu, index) => (
                  <tr 
                    key={submenu.id}
                    className="transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-700">
                          <Menu className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{submenu.title}</div>
                          <div className="text-sm text-gray-500">{submenu.description}</div>
                          {submenu.linked_menus && submenu.linked_menus.length > 0 && (
                            <div className="mt-1">
                              <span className="text-xs text-blue-600 font-medium">Linked to: </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {submenu.linked_menus.map((menuId, index) => {
                                  const menu = menus.find(m => m.id === menuId);
                                  return menu ? (
                                    <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                      {menu.title}
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {submenu.category_name ? (
                        <span 
                          className="px-3 py-1 text-xs font-medium text-white rounded-full shadow-sm"
                          style={{ backgroundColor: submenu.category_color || '#6B7280' }}
                        >
                          {submenu.category_name}
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                          No Category
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm font-semibold text-gray-900">
                        <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                        Rp {submenu.sell_price?.toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        submenu.status === 'active' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {submenu.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <motion.button
                          onClick={() => handleEdit(submenu)}
                          className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(submenu)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
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
              className="w-full max-w-2xl max-h-[90vh] bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                    <ChefHat className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {editingSubmenu ? 'Edit Submenu' : 'Add New Submenu'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {editingSubmenu ? 'Update submenu details' : 'Create a new submenu item'}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setShowModal(false);
                    setEditingSubmenu(null);
                    setFormData({ title: '', description: '', category_id: '', linked_menus: [], sell_price: '', status: 'active' });
                  }}
                  className="p-2 text-gray-400 transition-colors rounded-lg hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <form id="submenu-form" onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-6">
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-2"
                  >
                    <label className="block text-sm font-medium text-gray-700">Sub Menu Title</label>
                    <div className="relative">
                      <ChefHat className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                      <input
                        type="text"
                        required
                        className="w-full py-3 pl-10 pr-4 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white"
                        placeholder="Enter submenu name"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-2"
                  >
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <div className="relative">
                      <textarea
                        className="w-full px-4 py-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white"
                        placeholder="Enter submenu description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-2"
                  >
                    <label className="block text-sm font-medium text-gray-700">Linked Menus</label>
                    <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                      <p className="mb-3 text-sm text-gray-600">Select which menus this submenu can be added to:</p>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {menus.map((menu) => (
                          <label key={menu.id} className="flex items-center p-2 rounded hover:bg-white">
                            <input
                              type="checkbox"
                              checked={formData.linked_menus.includes(menu.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    linked_menus: [...formData.linked_menus, menu.id]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    linked_menus: formData.linked_menus.filter(id => id !== menu.id)
                                  });
                                }
                              }}
                              className="mr-2 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{menu.title}</span>
                          </label>
                        ))}
                      </div>
                      {formData.linked_menus.length === 0 && (
                        <p className="mt-2 text-sm text-gray-500">No menus selected</p>
                      )}
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                  >
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <div className="relative">
                      <Tag className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                      <select
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        className="w-full py-3 pl-10 pr-4 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white"
                      >
                        <option value="">Select category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                  >
                    <label className="block text-sm font-medium text-gray-700">Selling Price</label>
                    <div className="relative">
                      <DollarSign className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                      <input
                        type="number"
                        required
                        min="0"
                        step="1000"
                        className="w-full py-3 pl-10 pr-4 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white"
                        placeholder="Enter price in Rupiah"
                        value={formData.sell_price}
                        onChange={(e) => setFormData({ ...formData, sell_price: e.target.value })}
                      />
                    </div>
                    {formData.sell_price && (
                      <p className="text-sm text-gray-600">
                        Preview: Rp {parseInt(formData.sell_price || 0).toLocaleString('id-ID')}
                      </p>
                    )}
                  </motion.div>
                </div>

                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-2"
                  >
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="relative">
                      <CheckCircle className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full py-3 pl-10 pr-4 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </motion.div>



                </form>
              </div>
              
              <div className="flex justify-end p-6 space-x-3 border-t border-gray-200 bg-gray-50">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSubmenu(null);
                    setFormData({ title: '', description: '', category_id: '', linked_menus: [], sell_price: '', status: 'active' });
                  }}
                  className="px-6 py-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  form="submenu-form"
                  className="px-6 py-2 text-white transition-colors rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {editingSubmenu ? 'Update Submenu' : 'Create Submenu'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && deletingSubmenu && (
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
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Submenu</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to delete <span className="font-medium text-gray-900">{deletingSubmenu.title}</span>? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <motion.button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};