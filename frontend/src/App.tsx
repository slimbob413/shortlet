/**
 * Main Application Component
 * 
 * Sets up the application routing structure:
 * - Public routes (home, listings, auth)
 * - Protected routes (dashboard, bookings)
 * - Wraps all routes in a common layout
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import { ListingsPage } from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UserDashboardPage from './pages/UserDashboardPage';
import AgentDashboardPage from './pages/AgentDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import BookingManagementPage from './pages/BookingManagementPage';
import RequireRole from './components/RequireRole';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <RequireRole role="user">
                <UserDashboardPage />
              </RequireRole>
            } 
          />
          <Route 
            path="/dashboard/agent" 
            element={
              <RequireRole role="agent">
                <AgentDashboardPage />
              </RequireRole>
            } 
          />
          <Route 
            path="/dashboard/admin" 
            element={
              <RequireRole role="admin">
                <AdminDashboardPage />
              </RequireRole>
            } 
          />
          <Route 
            path="/dashboard/bookings" 
            element={
              <RequireRole role="agent">
                <BookingManagementPage />
              </RequireRole>
            } 
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App; 