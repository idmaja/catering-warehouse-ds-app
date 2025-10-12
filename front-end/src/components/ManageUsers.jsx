import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Edit, Trash2, Shield } from 'lucide-react';
import { userService } from '../services/api';
import { ConfirmModal } from './ConfirmModal';

export const ManageUsers = ({ refreshTrigger, onAddUser, onEditUser, showNotification }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, user: null });

  const loadUsers = useCallback(async () => {
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '5'
        });
        const response = await userService.getAllWithPagination(params.toString());
        setUsers(response?.data || []);
        setTotalPages(response?.total_pages || 1);
        setTotalUsers(response?.total || 0);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoading(false);
      }
    }, [currentPage]);
  
  const handleDelete = (user) => {
    setDeleteConfirm({ isOpen: true, user });
  };

  const confirmDelete = async () => {
    try {
      await userService.delete(deleteConfirm.user.id);
      loadUsers();
      showNotification('success', 'Success', 'User deleted successfully');
    } catch (error) {
      showNotification('error', 'Error', 'Failed to delete user');
    }
    setDeleteConfirm({ isOpen: false, user: null });
  };

  useEffect(() => {
    loadUsers();
  }, [refreshTrigger, currentPage, loadUsers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full p-4 overflow-x-hidden sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'admin').length}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Super Admins</p>
                <p className="text-2xl font-bold text-red-600">{users.filter(u => u.role === 'superadmin').length}</p>
              </div>
              <Shield className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">System Users</h3>
                <p className="text-sm text-gray-600">Manage user accounts and roles</p>
              </div>
              <div className="w-full sm:w-auto">
                <button 
                  onClick={onAddUser}
                  className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-white rounded-lg sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add User</span>
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Username</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Role</th>
                    <th className="hidden px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase sm:table-cell">Created</th>
                    <th className="hidden px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase sm:table-cell">Updated</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{user.username}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{user.email || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'superadmin' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="hidden px-6 py-4 text-sm text-gray-500 whitespace-nowrap sm:table-cell">
                        {new Date(user.created_at).toLocaleDateString('en-GB', {
                          timeZone: 'Asia/Jakarta',
                          day: '2-digit',
                          month: '2-digit', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        }).replace(/\//g, '-').replace(', ', '-')} WIB
                      </td>
                      <td className="hidden px-6 py-4 text-sm text-gray-500 whitespace-nowrap sm:table-cell">
                        {new Date(user.updated_at).toLocaleDateString('en-GB', {
                          timeZone: 'Asia/Jakarta',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric', 
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        }).replace(/\//g, '-').replace(', ', '-')} WIB
                      </td>
                      {/* {
                        console.log(user) 
                      } */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => onEditUser(user)}
                            className="p-1 text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {user.role !== 'superadmin' && (
                            <button 
                              onClick={() => handleDelete(user)}
                              className="p-1 text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 mt-4 rounded-lg bg-gray-50">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * 5) + 1} to {Math.min(currentPage * 5, totalUsers)} of {totalUsers} users
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
          </div>
        </div>
        
        <ConfirmModal
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, user: null })}
          onConfirm={confirmDelete}
          title="Delete User"
          message={`Are you sure you want to delete user "${deleteConfirm.user?.username}"? This action cannot be undone.`}
        />
      </motion.div>
    </div>
  );
};