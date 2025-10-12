import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, BarChart3, TrendingUp, Plus, Tag, Search } from 'lucide-react';
import { itemService, categoryService } from '../services/api';
import { ItemList } from './ItemList';

export const Dashboard = ({ onEditItem, refreshTrigger, showNotification, onShowCategories }) => {
  const [refreshList] = useState(false);
  const [stats, setStats] = useState({ totalItems: 0, lowStock: 0, totalCategories: 0 });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    loadStats();
    loadCategories();
  }, [refreshList, refreshTrigger]);
  
  const loadStats = async () => {
    try {
      const data = await itemService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryService.getAll();
      setCategories(response?.data || []);
      // console.log('Categories loaded:', response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([]);
    }
  };

  return (
    <div className="w-full max-w-full p-4 overflow-x-hidden sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600">{stats.lowStock}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalCategories}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Inventory Items</h3>
                <p className="text-sm text-gray-600">Manage your warehouse inventory</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-3 sm:items-center">
                  <div className="relative">
                    <Search className="absolute w-4 h-4 text-gray-400 left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search items by name or SKU..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full py-2 pl-10 pr-4 text-sm bg-white border border-gray-300 rounded-lg sm:w-72 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg sm:w-48 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id} style={{color: category.color}}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditItem()}
                    className="flex items-center justify-center px-4 py-2 space-x-2 text-white transition-all rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item</span>
                  </button>
                  <button
                    onClick={onShowCategories}
                    className="flex items-center justify-center px-4 py-2 space-x-2 text-white transition-all rounded-lg bg-gradient-to-r from-green-600 to-blue-600 hover:shadow-lg"
                  >
                    <Tag className="w-4 h-4" />
                    <span>Categories</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <ItemList onEdit={onEditItem} refresh={refreshList} refreshTrigger={refreshTrigger} showNotification={showNotification} selectedCategory={selectedCategory} searchTerm={searchTerm} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};