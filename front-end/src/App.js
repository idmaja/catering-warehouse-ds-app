import React, { useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Login';
import { MainLayout } from './components/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GoogleCallback } from './components/GoogleCallback';
import { authService } from './services/api';

function App() {
  const isAuthenticated = useMemo(() => authService.isAuthenticated(), []);
  
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/reports" replace /> : 
              <Login />
            } 
          />
          <Route path="/auth/callback" element={<GoogleCallback />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <MainLayout page="dashboard" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <MainLayout page="orders" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <MainLayout page="reports" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/accounts" 
            element={
              <ProtectedRoute>
                <MainLayout page="users" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/activity-logs" 
            element={
              <ProtectedRoute>
                <MainLayout page="activity-logs" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/menus" 
            element={
              <ProtectedRoute>
                <MainLayout page="menus" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/catering-orders" 
            element={
              <ProtectedRoute>
                <MainLayout page="catering-orders" />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;