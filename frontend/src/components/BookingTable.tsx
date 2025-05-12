import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { API_BASE_URL } from '../utils/api';

interface Booking {
  id: number;
  property: {
    title: string;
  };
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}

interface BookingTableProps {
  isOwner?: boolean;
  onConfirm?: (bookingId: number) => Promise<void>;
  onCancel?: (bookingId: number) => Promise<void>;
  loading?: boolean;
}

const BookingTable: React.FC<BookingTableProps> = ({ isOwner = false }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/bookings`);
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        const data = await response.json();
        setBookings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleStatusUpdate = async (bookingId: number, newStatus: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }

      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus as 'pending' | 'confirmed' | 'cancelled' }
          : booking
      ));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update booking status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-100">
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
              Status
            </th>
            {isOwner && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                {booking.property.title}
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
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </td>
              {isOwner && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingTable; 