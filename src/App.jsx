import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import MarketplacePage from './pages/MarketplacePage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import BuyerOrdersPage from './pages/BuyerOrdersPage';
import SellerLayout from './pages/seller/SellerLayout';
import SellerAnalyticsPage from './pages/seller/SellerAnalyticsPage';
import SellerStudioPage from './pages/seller/SellerStudioPage';
import SellerFulfillmentPage from './pages/seller/SellerFulfillmentPage';

export default function App() {
  return (
    <ShopProvider>
      <BrowserRouter>
        <Routes>
          {/* Root Layout containing Navbar, <Outlet />, Toast Stack, and Modals */}
          <Route path="/" element={<MainLayout />}>
            
            {/* Public Marketplace & Product Details Routes */}
            <Route index element={<MarketplacePage />} />
            <Route path="product/:id" element={<ProductDetailsPage />} />

            {/* Protected Order Tracking Route (Accessible to Buyers & Sellers) */}
            <Route element={<ProtectedRoute allowedRoles={['buyer', 'seller']} />}>
              <Route path="orders" element={<BuyerOrdersPage />} />
            </Route>

            {/* Protected Seller Portal with Nested <Outlet /> Tabs */}
            <Route element={<ProtectedRoute allowedRoles={['seller']} />}>
              <Route path="seller" element={<SellerLayout />}>
                <Route index element={<Navigate to="analytics" replace />} />
                <Route path="analytics" element={<SellerAnalyticsPage />} />
                <Route path="studio" element={<SellerStudioPage />} />
                <Route path="fulfillment" element={<SellerFulfillmentPage />} />
              </Route>
            </Route>

            {/* Catch-All Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ShopProvider>
  );
}