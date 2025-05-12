import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Shortlet</h3>
            <p className="text-gray-300">
              Your trusted platform for short-term rentals.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/listings" className="text-gray-300 hover:text-white">
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-gray-300 hover:text-white">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <p className="text-gray-300">
              Email: support@shortlet.com<br />
              Phone: (555) 123-4567
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} Shortlet. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 