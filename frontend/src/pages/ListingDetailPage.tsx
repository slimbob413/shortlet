/**
 * Listing Detail Page
 * 
 * Displays detailed information about a property:
 * - Fetches property details by ID
 * - Shows property images, description, and pricing
 * - Handles booking requests
 * - Responsive layout for all devices
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ImageCarousel from '../components/ImageCarousel';
import { api } from '../utils/api';

interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  images: string[];
  owner: {
    name: string;
  };
  availability: string[];
}

const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await api.get(`/properties/${id}`);
        // Transform the data to match our interface
        setProperty({
          ...data,
          images: data.images || ['https://via.placeholder.com/800x600?text=No+Image+Available'],
          owner: data.owner || { name: 'Unknown Host' },
          price: data.price || 0,
          description: data.description || 'No description available',
          title: data.title || 'Untitled Property',
          availability: data.availability || [],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleBookNow = async () => {
    if (!property) return;

    setBookingLoading(true);
    try {
      await api.post('/bookings', {
        propertyId: property.id,
        checkInDate: new Date().toISOString().split('T')[0], // Today's date
        checkOutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      });

      alert('Booking created successfully!');
      navigate('/dashboard/bookings');
    } catch (err: any) {
      if (err && err.response && err.response.status === 401) {
        console.error('401 Unauthorized:', err.response);
      }
      alert(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error || 'Property not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Image Carousel */}
        <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
          <ImageCarousel images={property.images} />
        </div>

        {/* Property Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-800">{property.title}</h1>
            <p className="text-2xl font-bold text-blue-600">
              ${property.price.toLocaleString()}/night
            </p>
          </div>

          <p className="text-gray-600 mb-6">{property.description}</p>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-gray-500 mb-4">Hosted by {property.owner.name}</p>
          </div>

          {/* Book Now Button */}
          <button
            onClick={handleBookNow}
            disabled={bookingLoading}
            className={`w-full py-3 px-6 rounded-lg text-white font-semibold text-lg
              ${
                bookingLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }
              transition-colors duration-200`}
          >
            {bookingLoading ? 'Processing...' : 'Book Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailPage; 