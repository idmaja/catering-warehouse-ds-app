import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuList } from './MenuList';
import { SubmenuList } from './SubmenuList';
import { MenuCategoryList } from './MenuCategoryList';
import { ChefHat, Menu, Palette } from 'lucide-react';

export const MenuManagement = ({ showNotification }) => {
  const [activeTab, setActiveTab] = useState('menus');

  const tabs = [
    { id: 'menus', label: 'Menus', icon: ChefHat },
    { id: 'submenus', label: 'Sub Menus', icon: Menu },
    { id: 'categories', label: 'Categories', icon: Palette }
  ];

  return (
    <motion.div 
      className="p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center mb-6">
          <div className="flex items-center justify-center w-12 h-12 mr-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
              Menu Management
            </h1>
            <p className="text-gray-600 mt-1">Manage your restaurant menus, submenus, and categories</p>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-2">
          <nav className="flex space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className="w-4 h-4 mr-2 relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </motion.button>
              );
            })}
          </nav>
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'menus' && <MenuList showNotification={showNotification} />}
          {activeTab === 'submenus' && <SubmenuList showNotification={showNotification} />}
          {activeTab === 'categories' && <MenuCategoryList showNotification={showNotification} />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};