import { useAuthStore } from '@/store/authStore';
import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

// Pages
import Layout from '@/components/Layout';
import CustomersPage from '@/pages/CustomersPage';
import RestaurantsPage from '@/pages/RestaurantsPage';
import DashboardPage from '@/pages/DashboardPage';
import DronesPage from '@/pages/DronesPage';
import LoginPage from '@/pages/LoginPage';
import OrdersPage from '@/pages/OrdersPage';
import AssignDronePage from '@/pages/AssignDronePage';
import { setupDefaultHub } from '@/lib/hub-setup';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  const { checkAuth } = useAuthStore();
  
  useEffect(() => {
    checkAuth();
    
    // Setup default hub on app initialization
    setupDefaultHub().catch(error => {
      console.error('Failed to setup default hub:', error);
    });
  }, [checkAuth]);
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="restaurants" element={<RestaurantsPage />} />
          <Route path="drones" element={<DronesPage />} />
          <Route path="assign-drone" element={<AssignDronePage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
