/**
 * User Dashboard Page
 * 
 * Displays user's booking information:
 * - Summary cards showing total and upcoming bookings
 * - Table of all bookings with actions
 * - Handles loading and error states
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import BookingTable from '../components/BookingTable';
import { api } from '../utils/api';
import RequireAuth from '../components/RequireAuth';

interface Booking {
  id: number;
  property: {
    id: number;
    title: string;
  };
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}

const UserDashboardPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await api.get('/bookings');
        setBookings(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancel = async (bookingId: number) => {
    try {
      setLoading(true);
      setError(null);

      await api.put(`/bookings/${bookingId}/cancel`, {});

      // Update local state instead of reloading
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' }
          : booking
      ));
      toast.success('Booking cancelled successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel booking';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const upcomingBookings = bookings.filter(booking => 
    new Date(booking.checkInDate) > new Date() && booking.status !== 'cancelled'
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Dashboard</h1>
        
        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Skeleton height={120} />
          <Skeleton height={120} />
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Skeleton count={5} height={60} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Bookings</h2>
          <p className="text-3xl font-bold text-blue-600">{bookings.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Upcoming Bookings</h2>
          <p className="text-3xl font-bold text-green-600">{upcomingBookings.length}</p>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <BookingTable 
          isOwner={false} 
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default () => (
  <RequireAuth>
    <UserDashboardPage />
  </RequireAuth>
); 