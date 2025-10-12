import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { ManageUsers } from './ManageUsers';
import { OrderManagement } from './OrderManagement';
import { ReportDashboard } from './ReportDashboard';
import { ActivityLogs } from './ActivityLogs';
import { ItemForm } from './ItemForm';
import { CategoryManager } from './CategoryManager';
import { UserForm } from './UserForm';
import { OrderForm } from './OrderForm';
import { Notification } from './Notification';
import { MenuManagement } from './MenuManagement';
import { CateringOrders } from './CateringOrders';

export const MainLayout = ({ page = 'dashboard' }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(page);

  useEffect(() => {
    setCurrentPage(page);
  }, [page]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    const routes = {
      dashboard: '/dashboard',
      reports: '/reports',
      orders: '/orders',
      users: '/accounts',
      'activity-logs': '/activity-logs',
      menus: '/menus',
      'catering-orders': '/catering-orders'
    };
    navigate(routes[newPage] || '/dashboard');
  };
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(undefined);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(undefined);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleAddItem = () => {
    setEditingItem(undefined);
    setShowForm(true);
  };

  const showNotification = (type, title, message) => {
    setNotification({ type, title, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingItem(undefined);
    setRefreshTrigger(prev => prev + 1);
    // setTimeout(() => window.location.reload(), 1500);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(undefined);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onEditItem={(item) => { setEditingItem(item); setShowForm(true); }} refreshTrigger={refreshTrigger} showNotification={showNotification} onShowCategories={() => setShowCategoryManager(true)} />;
      case 'reports':
        return <ReportDashboard />;
      case 'users':
        return <ManageUsers 
          refreshTrigger={refreshTrigger} 
          onAddUser={() => { setEditingUser(undefined); setShowUserForm(true); }}
          onEditUser={(user) => { setEditingUser(user); setShowUserForm(true); }}
          showNotification={showNotification}
        />;
      case 'activity-logs':
        return <ActivityLogs />;
      case 'orders':
        return <OrderManagement 
          onAddOrder={() => setShowOrderForm(true)}
          refreshTrigger={refreshTrigger}
          showNotification={showNotification}
        />;
      case 'menus':
        return <MenuManagement showNotification={showNotification} />;
      case 'catering-orders':
        return <CateringOrders showNotification={showNotification} />;
      default:
        return <Dashboard onEditItem={(item) => { setEditingItem(item); setShowForm(true); }} refreshTrigger={refreshTrigger} showNotification={showNotification} onShowCategories={() => setShowCategoryManager(true)} />;
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar 
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onAddItem={handleAddItem}
        onShowCategories={() => setShowCategoryManager(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />
      
      <main className="flex-1 w-full lg:w-auto overflow-y-auto">
        <div className="w-full pt-16 text-gray-900 lg:pt-0">
          {renderPage()}
        </div>
      </main>

      {showForm && (
        <ItemForm
          item={editingItem}
          onSave={handleSave}
          onCancel={handleCancel}
          showNotification={showNotification}
        />
      )}
      
      <CategoryManager
        isOpen={showCategoryManager}
        onClose={() => {
          setShowCategoryManager(false);
          setRefreshTrigger(prev => prev + 1);
        }}
        showNotification={showNotification}
      />
      
      {showUserForm && (
        <UserForm
          user={editingUser}
          onSave={() => {
            setShowUserForm(false);
            setEditingUser(undefined);
            setRefreshTrigger(prev => prev + 1);
          }}
          onCancel={() => {
            setShowUserForm(false);
            setEditingUser(undefined);
          }}
          showNotification={showNotification}
        />
      )}
      
      {showOrderForm && (
        <OrderForm
          onSave={() => {
            setShowOrderForm(false);
            setRefreshTrigger(prev => prev + 1);
            setTimeout(() => window.location.reload(), 100);
          }}
          onCancel={() => setShowOrderForm(false)}
          showNotification={showNotification}
        />
      )}
      
      <Notification 
        notification={notification} 
        onClose={() => setNotification(null)} 
      />
    </div>
  );
};