/**
 * RequireAuth Component
 * 
 * Higher-order component that protects routes by:
 * - Checking for token presence
 * - Redirecting to login if token is missing
 * - Optionally showing a toast message
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to continue');
      navigate('/login');
      return;
    }
  }, [navigate]);

  return <>{children}</>;
};

export default RequireAuth; 