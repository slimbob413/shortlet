import React from 'react';
import { Link } from 'react-router-dom';

interface ListingCardProps {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  owner_name: string;
}

/**
 * ListingCard component displays a property listing in a card format
 * @param props - Component props including property details and image URL
 */
const ListingCard: React.FC<ListingCardProps> = ({
  id,
  title,
  description,
  price,
  imageUrl,
  owner_name,
}) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
      data-testid="listing-card"
    >
      <Link to={`/listings/${id}`}>
        <div className="relative h-48 bg-gray-200">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.png';
            }}
          />
        </div>
        <div className="p-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-1">
            {title}
          </h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
            {description}
          </p>
          <div className="flex justify-between items-center">
            <p className="text-blue-600 font-bold text-lg">
              ${price.toLocaleString()}/night
            </p>
            <p className="text-gray-500 text-sm">by {owner_name}</p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ListingCard; 