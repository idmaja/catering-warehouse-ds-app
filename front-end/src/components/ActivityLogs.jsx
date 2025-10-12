import React, { useState, useEffect, useCallback } from 'react';
import { auditService, userService } from '../services/api';
import { ArrowDown, ArrowRight } from 'lucide-react';

export const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState(new Set());
  const [filters, setFilters] = useState({
    username: '',
    action: '',
    resource: '',
    date: ''
  });

  const applyFilters = useCallback(() => {
    let filtered = logs;

    if (filters.date) {
      filtered = filtered.filter(dayLog => dayLog.date === filters.date);
    }

    if (filters.username || filters.action || filters.resource) {
      filtered = filtered.map(dayLog => ({
        ...dayLog,
        activities: dayLog.activities.filter(activity => {
          return (!filters.username || activity.username === filters.username) &&
                 (!filters.action || activity.action === filters.action) &&
                 (!filters.resource || activity.resource.toLowerCase().includes(filters.resource.toLowerCase()));
        })
      })).filter(dayLog => dayLog.activities.length > 0);
    }

    setFilteredLogs(filtered);
  }, [logs, filters]);

  useEffect(() => {
    loadLogs();
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadLogs = async () => {
    try {
      const data = await auditService.getAllLogs();
      setLogs(data);
    } catch (error) {
      console.error('Failed to load activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userService.getAll();
      setUsers(response?.data?.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ username: '', action: '', resource: '', date: '' });
  };

  const toggleDay = (logId) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedDays(newExpanded);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Activity Logs</h1>
      
      {/* Filters */}
      <div className="p-6 mb-8 border border-blue-100 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
        <div className="flex items-center mb-6">
          <div className="flex items-center justify-center w-8 h-8 mr-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800">Filter Activity Logs</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Username
            </label>
            <div className="relative">
              <select
                value={filters.username}
                onChange={(e) => handleFilterChange('username', e.target.value)}
                className="w-full px-4 py-3 transition-all duration-200 bg-white border-2 border-gray-200 rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300"
              >
                <option value=""> All Users</option>
                {users.map((user) => (
                  <option key={user.id} value={user.username}>
                     {user.username}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Action
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                placeholder="Search actions..."
                className="w-full px-4 py-3 transition-all duration-200 bg-white border-2 border-gray-200 rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-green-300"
              />
                {/* <option value=""> All Actions</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE"> UPDATE</option>
                <option value="DELETE"> DELETE</option>
                <option value="GET"> GET</option>
                <option value="POST"> POST</option>
                <option value="PUT"> PUT</option>
              </select> */}
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Resource
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.resource}
                onChange={(e) => handleFilterChange('resource', e.target.value)}
                placeholder="Search resources..."
                className="w-full px-4 py-3 placeholder-gray-400 transition-all duration-200 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-300"
              />
              <div className="absolute inset-y-0 right-0 flex items-center px-3">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Date
            </label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="w-full px-4 py-3 transition-all duration-200 bg-white border-2 border-gray-200 rounded-lg cursor-pointer focus:ring-2 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            {filteredLogs.length >= 0 && (
              <span className="flex items-center">
                {filteredLogs.length > 0 && (
                  <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                Found {filteredLogs.length} day(s) with matching activities and 
                Found {filteredLogs.reduce((total, log) => total + log.activities.length, 0)} activities              
              </span>
            )}
          </div>
          <button
            onClick={clearFilters}
            className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 transform rounded-lg shadow-md md:px-6 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 hover:scale-105 hover:shadow-lg"
          >
            <svg className="w-6 h-6 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className='text-xs md:text-sm'>Clear All</span>
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredLogs.map((dayLog) => (
          <div key={dayLog.id} className="bg-white rounded-lg shadow">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleDay(dayLog.id)}
            >
              <div className="flex items-center space-x-3">
                <div className="text-lg font-semibold text-gray-900">
                  {new Date(dayLog.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <span className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded-full">
                  {dayLog.activities.length} activities
                </span>
              </div>
              <div className="text-gray-400">
                {expandedDays.has(dayLog.id) ? <ArrowDown/> : <ArrowRight />}
              </div>
            </div>
            
            {expandedDays.has(dayLog.id) && (
              <div className="border-t">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase md:px-6">Username</th>
                        <th className="px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase md:px-6">Action</th>
                        <th className="px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase md:px-6">Resource</th>
                        <th className="table-cell px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase md:px-6">Details</th>
                        <th className="px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase md:px-6">Time</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dayLog.activities.map((activity, index) => (
                        <tr key={index}>
                          <td className="px-3 py-4 text-sm font-medium text-gray-900 md:px-6 whitespace-nowrap">
                            {activity.username}
                          </td>
                          <td className="px-3 py-4 md:px-6 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              activity.action === 'GET' ? 'bg-blue-100 text-blue-800' :
                              activity.action === 'POST' ? 'bg-green-100 text-green-800' :
                              activity.action === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                              activity.action === 'DELETE' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {activity.action}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900 md:px-6 whitespace-nowrap">
                            {activity.resource}
                          </td>
                          <td className="table-cell max-w-xs px-3 py-4 text-sm text-gray-900 truncate md:px-6">
                            {activity.details}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500 md:px-6 whitespace-nowrap">
                            {new Date(activity.timestamp).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {filteredLogs.length === 0 && logs.length > 0 && (
          <div className="py-8 text-center text-gray-500">
            No logs match the current filters
          </div>
        )}
        
        {logs.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No activity logs found
          </div>
        )}
      </div>
    </div>
  );
};