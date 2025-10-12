import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, LogOut, BarChart3, Users, Menu, X, TrendingUp, FileText, ChefHat, ShoppingCart } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

export const Sidebar = ({ currentPage, onPageChange, onAddItem, onShowCategories, isDarkMode, onToggleDarkMode }) => {
  // const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [userUsername, setUserUsername] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserUsername(payload.username || '');
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    authService.logout();
    window.location.href = '/login';
  };

  const menuItems = [
    { icon: TrendingUp, label: 'Item Reports', page: 'reports' },
    { icon: BarChart3, label: 'Item Dashboard', page: 'dashboard' },
    { icon: Package, label: 'Item Orders', page: 'orders' },
    { icon: ChefHat, label: 'Menu Management', page: 'menus' },
    { icon: ShoppingCart, label: 'Catering Orders', page: 'catering-orders' },
    ...(userUsername === 'superadmin' ? [
      { icon: Users, label: 'Manage Users', page: 'users' },
      { icon: FileText, label: 'Activity Logs', page: 'activity-logs' }
    ] : []),
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed z-50 p-2 bg-white rounded-lg shadow-lg lg:hidden top-4 left-4"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 lg:hidden bg-black/50"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isOpen || window.innerWidth >= 1024 ? 0 : -300 }}
        className="fixed top-0 left-0 z-50 flex flex-col w-64 h-screen bg-white shadow-xl lg:relative lg:translate-x-0 lg:flex-shrink-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg">
              {/* <Package className="w-6 h-6 text-white" /> */}
              <img src='/logo512.png' alt='Logo D&S'></img>
            </div>
            <div>
              <h1 className="text-xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
                Catering D&S
              </h1>
              <p className="text-xs text-gray-500">Catering Management</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded lg:hidden hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 pb-32 space-y-2 overflow-y-auto">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (item.page) {
                  onPageChange(item.page);
                } else if (item.action) {
                  item.action();
                }
                setIsOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                currentPage === item.page
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </motion.button>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
          <div className="relative px-3 py-2 mb-3 rounded-lg group bg-gradient-to-r from-indigo-500 to-purple-600">
            <p className="text-sm font-bold text-center text-white">
              {userUsername.toUpperCase()}
            </p>
            <div className="absolute px-2 py-1 mb-2 text-xs text-white transition-opacity duration-200 transform -translate-x-1/2 bg-gray-800 rounded opacity-0 bottom-full left-1/2 group-hover:opacity-100 whitespace-nowrap">
              Username
              <div className="absolute w-0 h-0 transform -translate-x-1/2 border-t-4 border-l-4 border-r-4 border-transparent top-full left-1/2 border-t-gray-800"></div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-red-600 transition-all duration-200 rounded-lg hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Logout</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md p-6 mx-4 bg-white shadow-2xl rounded-2xl"
          >
            <div className="flex items-center mb-4 space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Confirm Logout</h3>
            </div>
            <p className="mb-6 text-gray-600">Are you sure you want to logout? You will need to sign in again to access your account.</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-3 font-medium text-gray-800 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-3 font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};