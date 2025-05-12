/**
 * RequireRole Component
 * 
 * Protects routes based on user role:
 * - Checks JWT token for role
 * - Redirects to login if unauthorized
 * - Shows toast error message
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  userId: number;
  role: string;
}

interface RequireRoleProps {
  children: React.ReactNode;
  role: 'user' | 'agent' | 'admin';
}

const RequireRole: React.FC<RequireRoleProps> = ({ children, role }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to access this page');
      navigate('/login');
      return;
    }

    try {
      const decoded = jwtDecode<JWTPayload>(token);
      if (decoded.role !== role) {
        toast.error('You do not have permission to access this page');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Invalid session. Please log in again');
      navigate('/login');
    }
  }, [navigate, role]);

  return <>{children}</>;
};

export default RequireRole; 