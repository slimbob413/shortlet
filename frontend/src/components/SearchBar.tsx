import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface SearchBarProps {
  onSearch: (params: {
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    availableStart?: string;
    availableEnd?: string;
  }) => void;
}

/**
 * SearchBar component for filtering property listings
 * 
 * Features:
 * - Text search for property titles and descriptions
 * - Price range filtering with min/max inputs
 * - Date range selection for availability
 * - Responsive layout that stacks on mobile
 * 
 * @param props - Component props including the onSearch callback
 */
export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      search: search || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      availableStart: startDate?.toISOString().split('T')[0],
      availableEnd: endDate?.toISOString().split('T')[0]
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
      <input
        type="text"
        placeholder="Search properties..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        data-testid="search-input"
      />
      
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
          className="w-32 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
          className="w-32 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2">
        <DatePicker
          selected={startDate}
          onChange={(date: Date | null) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Available from"
          className="w-40 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <DatePicker
          selected={endDate}
          onChange={(date: Date | null) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate || undefined}
          placeholderText="Available until"
          className="w-40 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Apply Filters
      </button>
    </form>
  );
}; 