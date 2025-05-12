/**
 * Listings Page
 * 
 * Displays a grid of available properties:
 * - Fetches properties from the API on mount
 * - Shows loading state while fetching
 * - Renders properties in a responsive grid
 * - Each property is displayed as a card with key details
 */

import React, { useState, useEffect } from 'react';
import { SearchBar } from '../components/SearchBar';
import ListingCard from '../components/ListingCard';
import Skeleton from 'react-loading-skeleton';
import { api } from '../utils/api';
import RequireAuth from '../components/RequireAuth';
import 'react-loading-skeleton/dist/skeleton.css';

interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  images: string[];
  owner_name: string;
}

interface FilterParams {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
}

export const ListingsPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterParams>({});

  const fetchProperties = async (params: FilterParams = {}) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
      if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const data = await api.get(`/properties?${queryParams.toString()}`);
      setProperties(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties(filters);
  }, [filters]);

  const handleFilter = (params: FilterParams) => {
    setFilters(params);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Available Properties</h1>
        
        <SearchBar onSearch={handleFilter} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="listings-loading">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
              <Skeleton height={200} />
              <div className="p-4">
                <Skeleton height={24} width="80%" />
                <Skeleton height={16} width="60%" className="mt-2" />
                <Skeleton height={16} width="40%" className="mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Available Properties</h1>
        <SearchBar onSearch={handleFilter} />
        <div className="flex justify-center items-center min-h-[200px]" data-testid="listings-error">
          <div className="text-red-500 text-center">
            <p className="text-xl mb-2">Error loading properties</p>
            <p>{error}</p>
            <button 
              onClick={() => fetchProperties(filters)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasNoResults = properties.length === 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Available Properties</h1>
      
      <SearchBar onSearch={handleFilter} />

      {hasNoResults ? (
        <div className="flex justify-center items-center min-h-[200px]" data-testid="no-listings">
          <div className="text-gray-500 text-center">
            <p className="text-xl mb-2">No properties found</p>
            <p>Try adjusting your search filters</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="listings-grid">
          {properties.map((property) => {
            const thumbnail = property.images && property.images.length > 0
              ? property.images[0]
              : '/placeholder.png';
              
            return (
              <ListingCard
                key={property.id}
                id={property.id}
                title={property.title}
                description={property.description}
                price={property.price}
                imageUrl={thumbnail}
                owner_name={property.owner_name}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

// Wrap the export with RequireAuth
export default () => (
  <RequireAuth>
    <ListingsPage />
  </RequireAuth>
); 