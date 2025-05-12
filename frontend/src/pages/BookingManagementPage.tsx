/**
 * Booking Management Page
 * 
 * Displays a list of bookings for properties owned by the agent:
 * - Shows pending bookings with confirm/cancel actions
 * - Shows confirmed bookings with cancel action
 * - Handles loading states and error messages
 */

import React, { useState } from 'react';
import BookingTable from '../components/BookingTable';
import RequireAuth from '../components/RequireAuth';
import { api } from '../utils/api';

const BookingManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async (bookingId: number) => {
    try {
      setLoading(true);
      setError(null);

      await api.put(`/bookings/${bookingId}/confirm`, {});

      alert('Booking confirmed successfully');
      // Refresh the booking list
      window.location.reload();
    } catch (err: any) {
      if (err && err.response && err.response.status === 401) {
        console.error('401 Unauthorized:', err.response);
      }
      setError(err instanceof Error ? err.message : 'Failed to confirm booking');
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: number) => {
    try {
      setLoading(true);
      setError(null);

      await api.put(`/bookings/${bookingId}/cancel`, {});

      alert('Booking cancelled successfully');
      // Refresh the booking list
      window.location.reload();
    } catch (err: any) {
      if (err && err.response && err.response.status === 401) {
        console.error('401 Unauthorized:', err.response);
      }
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Manage Bookings</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <BookingTable 
        isOwner={true} 
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  );
};

export default () => (
  <RequireAuth>
    <BookingManagementPage />
  </RequireAuth>
); 