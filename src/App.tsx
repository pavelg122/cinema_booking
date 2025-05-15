import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import MovieDetailPage from './pages/MovieDetailPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/user/ProfilePage';
import BookingsPage from './pages/user/BookingsPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/DashboardPage';
import AdminMovies from './pages/admin/MoviesPage';
import AdminScreenings from './pages/admin/ScreeningsPage';
import AdminBookings from './pages/admin/BookingsPage';
import AdminReports from './pages/admin/ReportsPage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="movies" element={<MoviesPage />} />
          <Route path="movies/:id" element={<MovieDetailPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          
          {/* Protected User Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="seats/:screeningId" element={<SeatSelectionPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="payment-success" element={<PaymentSuccessPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="bookings" element={<BookingsPage />} />
          </Route>
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="movies" element={<AdminMovies />} />
          <Route path="screenings" element={<AdminScreenings />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;