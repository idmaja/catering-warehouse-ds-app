import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Package, ShoppingCart, AlertTriangle, DollarSign } from 'lucide-react';
import { reportService } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

export const ReportDashboard = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revenueFilter, setRevenueFilter] = useState('monthly');

  const loadReportData = React.useCallback(async () => {
    try {
      const data = await reportService.getDashboardReport(revenueFilter);
      setReportData(data);
    } catch (error) {
      console.error('Failed to load report data:', error);
    } finally {
      setLoading(false);
    }
  }, [revenueFilter]);

  
  useEffect(() => {
    loadReportData();
  }, [loadReportData]);


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading report...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full p-4 overflow-x-hidden sm:p-6 ">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive warehouse performance overview</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-blue-600">{reportData?.totalItems || 0}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-green-600">{reportData?.totalOrders || 0}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-600">Rp {(reportData?.totalRevenue || 0).toLocaleString('id-ID')}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-red-600">{reportData?.lowStockItems || 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
          {/* Orders by Status */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl"
          >
            <h3 className="flex items-center mb-4 text-lg font-semibold">
              <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
              Orders by Status
            </h3>
            <div className="h-64">
              <Doughnut
                data={{
                  labels: reportData?.ordersByStatus?.map(item => item.status.charAt(0).toUpperCase() + item.status.slice(1)) || [],
                  datasets: [{
                    data: reportData?.ordersByStatus?.map(item => item.count) || [],
                    backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
                    borderWidth: 2,
                    borderColor: '#fff'
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                      callbacks: {
                        label: (context) => `${context.label}: ${context.parsed} orders`
                      }
                    }
                  },
                  animation: {
                    animateRotate: true,
                    duration: 1000
                  }
                }}
              />
            </div>
          </motion.div>

          {/* Top Items */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl"
          >
            <h3 className="flex items-center mb-4 text-lg font-semibold">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Top Performing Items
            </h3>
            <div className="h-64">
              <Bar
                data={{
                  labels: reportData?.topItems?.map(item => item.itemName.length > 10 ? item.itemName.substring(0, 10) + '...' : item.itemName) || [],
                  datasets: [{
                    label: 'Revenue (Rp)',
                    data: reportData?.topItems?.map(item => item.revenue) || [],
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context) => `Revenue: Rp ${context.parsed.y.toLocaleString('id-ID')}`
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `Rp ${value.toLocaleString('id-ID')}`
                      }
                    }
                  },
                  animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                  }
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Monthly Revenue & Category Stats */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Revenue */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center text-lg font-semibold">
                <DollarSign className="w-5 h-5 mr-2 text-purple-600" />
                Revenue
              </h3>
              <select
                value={revenueFilter}
                onChange={(e) => setRevenueFilter(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="h-64">
              <Line
                data={{
                  labels: reportData?.revenueData?.map(item => item.period) || [],
                  datasets: [{
                    label: 'Revenue',
                    data: reportData?.revenueData?.map(item => item.revenue) || [],
                    borderColor: 'rgba(147, 51, 234, 1)',
                    backgroundColor: 'rgba(147, 51, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context) => `Revenue: Rp ${context.parsed.y.toLocaleString('id-ID')}`
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `Rp ${value.toLocaleString('id-ID')}`
                      }
                    }
                  },
                  animation: {
                    duration: 1500,
                    easing: 'easeOutQuart'
                  }
                }}
              />
            </div>
          </motion.div>

          {/* Category Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl"
          >
            <h3 className="flex items-center mb-4 text-lg font-semibold">
              <Package className="w-5 h-5 mr-2 text-blue-600" />
              Category Performance
            </h3>
            <div className="h-64">
              <Bar
                data={{
                  labels: reportData?.categoryStats?.map(item => item.categoryName) || [],
                  datasets: [{
                    label: 'Total Value (Rp)',
                    data: reportData?.categoryStats?.map(item => item.totalValue) || [],
                    backgroundColor: [
                      'rgba(59, 130, 246, 0.8)',
                      'rgba(16, 185, 129, 0.8)',
                      'rgba(245, 158, 11, 0.8)',
                      'rgba(239, 68, 68, 0.8)',
                      'rgba(139, 92, 246, 0.8)'
                    ],
                    borderColor: [
                      'rgba(59, 130, 246, 1)',
                      'rgba(16, 185, 129, 1)',
                      'rgba(245, 158, 11, 1)',
                      'rgba(239, 68, 68, 1)',
                      'rgba(139, 92, 246, 1)'
                    ],
                    borderWidth: 1
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context) => `Value: Rp ${context.parsed.y.toLocaleString('id-ID')}`
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `Rp ${value.toLocaleString('id-ID')}`
                      }
                    }
                  },
                  animation: {
                    duration: 1200,
                    easing: 'easeOutBounce'
                  }
                }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};