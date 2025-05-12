/**
 * Admin Dashboard Page
 * 
 * Displays admin overview and moderation tools:
 * - Summary cards showing total users, agents, properties, and bookings
 * - Table of newest users with deactivation controls
 * - Table of newest properties with deactivation controls
 * - Handles loading and error states
 */

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { api } from '../utils/api';
import RequireAuth from '../components/RequireAuth';

interface Overview {
  users: number;
  agents: number;
  properties: number;
  bookings: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  isActive: boolean;
}

interface Property {
  id: number;
  title: string;
  price: number;
  createdAt: string;
  isActive: boolean;
  owner: {
    name: string;
  };
}

const AdminDashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [overviewData, usersData, propertiesData] = await Promise.all([
          api.get('/admin/overview'),
          api.get('/admin/users?limit=5'),
          api.get('/admin/properties?limit=5')
        ]);

        setOverview(overviewData);
        setUsers(usersData.users);
        setProperties(propertiesData.properties);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeactivateUser = async (userId: number) => {
    try {
      await api.put(`/admin/users/${userId}/deactivate`, {});

      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, isActive: false }
          : user
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate user');
    }
  };

  const handleDeactivateProperty = async (propertyId: number) => {
    try {
      await api.put(`/admin/properties/${propertyId}/deactivate`, {});

      setProperties(properties.map(property => 
        property.id === propertyId 
          ? { ...property, isActive: false }
          : property
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate property');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Users</h2>
          <p className="text-3xl font-bold text-blue-600">{overview?.users || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Agents</h2>
          <p className="text-3xl font-bold text-green-600">{overview?.agents || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Properties</h2>
          <p className="text-3xl font-bold text-purple-600">{overview?.properties || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Bookings</h2>
          <p className="text-3xl font-bold text-orange-600">{overview?.bookings || 0}</p>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Users</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(user.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.isActive && (
                      <button
                        onClick={() => handleDeactivateUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Properties Table */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Properties</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Listed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {properties.map(property => (
                <tr key={property.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {property.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {property.owner.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${property.price}/night
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(property.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${property.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {property.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {property.isActive && (
                      <button
                        onClick={() => handleDeactivateProperty(property.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Deactivate
                      </button>
                    )}
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
    <AdminDashboardPage />
  </RequireAuth>
); 