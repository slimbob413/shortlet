import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-gray-800">
            Shortlet
          </Link>
          <div className="space-x-4">
            <Link to="/listings" className="text-gray-600 hover:text-gray-800">
              Listings
            </Link>
            <Link to="/login" className="text-gray-600 hover:text-gray-800">
              Login
            </Link>
            <Link to="/signup" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header; 