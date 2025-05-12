/**
 * Agent Dashboard Page
 * 
 * Displays agent's property and booking information:
 * - Summary cards showing total properties, bookings, and revenue
 * - Grid of property cards with booking stats
 * - Table of pending bookings with actions
 * - Handles loading and error states
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { api } from '../utils/api';
import RequireAuth from '../components/RequireAuth';

interface Property {
  id: number;
  title: string;
  price: number;
  images: string[];
}

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

const AgentDashboardPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [propertiesData, bookingsData] = await Promise.all([
          api.get('/properties'),
          api.get('/bookings?agentId=me')
        ]);

        setProperties(propertiesData);
        setBookings(bookingsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleConfirm = async (bookingId: number) => {
    try {
      setLoading(true);
      await api.put(`/bookings/${bookingId}/confirm`, {});

      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'confirmed' }
          : booking
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm booking');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: number) => {
    try {
      setLoading(true);
      await api.put(`/bookings/${bookingId}/cancel`, {});

      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' }
          : booking
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = bookings
    .filter(booking => booking.status === 'confirmed')
    .reduce((sum, booking) => sum + booking.totalPrice, 0);

  const confirmedBookings = bookings.filter(booking => booking.status === 'confirmed');
  const pendingBookings = bookings.filter(booking => booking.status === 'pending');

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Agent Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Properties</h2>
          <p className="text-3xl font-bold text-blue-600">{properties.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Confirmed Bookings</h2>
          <p className="text-3xl font-bold text-green-600">{confirmedBookings.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Revenue</h2>
          <p className="text-3xl font-bold text-purple-600">${totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">My Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => {
            const propertyBookings = bookings.filter(b => b.property.id === property.id);
            const propertyRevenue = propertyBookings
              .filter(b => b.status === 'confirmed')
              .reduce((sum, b) => sum + b.totalPrice, 0);

            return (
              <div key={property.id} className="bg-white rounded-lg shadow overflow-hidden">
                <img 
                  src={property.images[0] || '/placeholder.png'} 
                  alt={property.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{property.title}</h3>
                  <p className="text-gray-600 mb-2">${property.price}/night</p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{propertyBookings.length} bookings</span>
                    <span>${propertyRevenue.toLocaleString()} revenue</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Bookings Table */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Pending Bookings</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingBookings.map(booking => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/listings/${booking.property.id}`} className="text-blue-600 hover:text-blue-800">
                      {booking.property.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(booking.checkInDate), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(booking.checkOutDate), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${booking.totalPrice.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleConfirm(booking.id)}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default () => (
  <RequireAuth>
    <AgentDashboardPage />
  </RequireAuth>
); 