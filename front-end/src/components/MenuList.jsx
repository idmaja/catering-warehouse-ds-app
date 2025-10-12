import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { menuService, menuCategoryService } from '../services/api';
import { Plus, Edit, Trash2, Search, ChefHat, DollarSign, FileText, Tag, CheckCircle } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

export const MenuList = ({ showNotification }) => {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingMenu, setDeletingMenu] = useState(null);
  const [editingMenu, setEditingMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    sell_price: '',
    status: 'active'
  });

  const loadMenus = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm })
      });
      
      const response = await menuService.getAllWithPagination(queryParams.toString());
      setMenus(response.data || []);
      setTotalPages(response.total_pages || 1);
    } catch (error) {
      console.error('Failed to load menus:', error);
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

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadMenus();
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
      const menuData = {
        ...formData,
        sell_price: parseFloat(formData.sell_price)
      };

      if (editingMenu) {
        await menuService.update(editingMenu.id, menuData);
        showNotification('success', 'Success', 'Menu updated successfully');
      } else {
        await menuService.create(menuData);
        showNotification('success', 'Success', 'Menu created successfully');
      }
      
      setShowModal(false);
      setEditingMenu(null);
      setFormData({ title: '', description: '', category_id: '', sell_price: '', status: 'active' });
      loadMenus();
    } catch (error) {
      console.error('Failed to save menu:', error);
      showNotification('error', 'Error', `Failed to ${editingMenu ? 'update' : 'create'} menu`);
    }
  };

  const handleEdit = (menu) => {
    setEditingMenu(menu);
    setFormData({
      title: menu.title,
      description: menu.description,
      category_id: menu.category_id || '',
      sell_price: menu.sell_price.toString(),
      status: menu.status
    });
    setShowModal(true);
  };

  const handleDelete = (menu) => {
    setDeletingMenu(menu);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await menuService.delete(deletingMenu.id);
      showNotification('success', 'Success', 'Menu deleted successfully');
      loadMenus();
    } catch (error) {
      console.error('Failed to delete menu:', error);
      showNotification('error', 'Error', 'Failed to delete menu');
    } finally {
      setShowDeleteModal(false);
      setDeletingMenu(null);
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
                placeholder="Search menus..."
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
          Add Menu
        </motion.button>
      </div>

      {/* Menu List */}
      <motion.div 
        className="overflow-hidden bg-white shadow-xl rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="block sm:hidden">
          {menus.map((menu, index) => (
            <div key={menu.id} className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 mr-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                    <ChefHat className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{menu.title}</div>
                    <div className="text-xs text-gray-500">{menu.description}</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => handleEdit(menu)}
                    className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(menu)}
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
                  {menu.category_name ? (
                    <span 
                      className="px-2 py-1 text-xs font-medium text-white rounded-full"
                      style={{ backgroundColor: menu.category_color || '#6B7280' }}
                    >
                      {menu.category_name}
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                      No Category
                    </span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-semibold">Rp {menu.sell_price?.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    menu.status === 'active' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {menu.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="hidden overflow-x-auto sm:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Menu Details</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Category</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Price</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
                {menus.map((menu, index) => (
                  <tr 
                    key={menu.id}
                    className="transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                          <ChefHat className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{menu.title}</div>
                          <div className="text-sm text-gray-500">{menu.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {menu.category_name ? (
                        <span 
                          className="px-3 py-1 text-xs font-medium text-white rounded-full shadow-sm"
                          style={{ backgroundColor: menu.category_color || '#6B7280' }}
                        >
                          {menu.category_name}
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
                        Rp {menu.sell_price?.toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        menu.status === 'active' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {menu.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <motion.button
                          onClick={() => handleEdit(menu)}
                          className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(menu)}
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
              className="w-full max-w-2xl p-8 bg-white shadow-2xl rounded-3xl"
            >
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                  <ChefHat className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {editingMenu ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h2>
                <p className="mt-2 text-gray-600">
                  {editingMenu ? 'Update menu item details' : 'Create a new menu item for your restaurant'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="flex items-center mb-3 text-sm font-semibold text-gray-700">
                      <ChefHat className="w-4 h-4 mr-2 text-blue-600" />
                      Menu Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 text-gray-900 transition-all duration-200 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-gray-300"
                      placeholder="Enter menu item name"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center mb-3 text-sm font-semibold text-gray-700">
                      <FileText className="w-4 h-4 mr-2 text-blue-600" />
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 text-gray-900 transition-all duration-200 border-2 border-gray-200 resize-none rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-gray-300"
                      rows="4"
                      placeholder="Describe your menu item..."
                    />
                  </div>

                  <div>
                    <label className="flex items-center mb-3 text-sm font-semibold text-gray-700">
                      <Tag className="w-4 h-4 mr-2 text-blue-600" />
                      Category
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full px-4 py-3 text-gray-900 transition-all duration-200 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-gray-300"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center mb-3 text-sm font-semibold text-gray-700">
                      <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                      Selling Price (Rupiah) *
                    </label>
                    <div className="relative">
                      <span className="absolute font-medium text-gray-500 transform -translate-y-1/2 left-4 top-1/2">Rp</span>
                      <input
                        type="number"
                        step="1000"
                        min="0"
                        value={formData.sell_price}
                        onChange={(e) => setFormData({ ...formData, sell_price: e.target.value })}
                        className="w-full py-3 pl-12 pr-4 text-gray-900 transition-all duration-200 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 hover:border-gray-300"
                        placeholder="0"
                        required
                      />
                    </div>
                    {formData.sell_price && (
                      <p className="mt-2 text-sm text-gray-600">
                        Preview: Rp {parseInt(formData.sell_price || 0).toLocaleString('id-ID')}
                      </p>
                    )}
                  </div>

                  
                  {/* <div>
                    <label className="flex items-center mb-3 text-sm font-semibold text-gray-700">
                      <Clock className="w-4 h-4 mr-2 text-blue-600" />
                      Preparation Time
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={formData.prep_time || ''}
                      onChange={(e) => setFormData({ ...formData, prep_time: e.target.value })}
                      className="w-full px-4 py-3 text-gray-900 transition-all duration-200 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-gray-300"
                      placeholder="Minutes"
                    />
                  </div> */}
                </div>

                <div>
                    <label className="flex items-center mb-3 text-sm font-semibold text-gray-700">
                      <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 text-gray-900 transition-all duration-200 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-gray-300"
                    >
                      <option value="active">🟢 Active</option>
                      <option value="inactive">🔴 Inactive</option>
                    </select>
                  </div>


                <div className="pt-6 border-t border-gray-200">
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <motion.button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingMenu(null);
                        setFormData({ title: '', description: '', category_id: '', sell_price: '', status: 'active' });
                      }}
                      className="px-8 py-3 font-semibold text-gray-700 transition-all duration-200 bg-gray-100 border-2 border-gray-200 rounded-xl hover:bg-gray-200 hover:border-gray-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="px-8 py-3 font-semibold text-white transition-all duration-200 shadow-lg rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="flex items-center justify-center">
                        {editingMenu ? (
                          <>
                            <Edit className="w-4 h-4 mr-2" />
                            Update Menu
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Menu
                          </>
                        )}
                      </span>
                    </motion.button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        show={showDeleteModal && deletingMenu}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Menu"
        message={`Are you sure you want to delete ${deletingMenu?.title}? This action cannot be undone.`}
      />
    </motion.div>
  );
};