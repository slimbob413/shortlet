import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ListingsPage } from '../pages/ListingsPage';

// Mock fetch
global.fetch = jest.fn();

describe('ListingsPage', () => {
  const mockProperties = [
    {
      id: 1,
      title: 'Test Property 1',
      description: 'Test Description 1',
      price: 100,
      images: ['test1.jpg'],
      owner_name: 'Test Owner 1',
    },
    {
      id: 2,
      title: 'Test Property 2',
      description: 'Test Description 2',
      price: 200,
      images: ['test2.jpg'],
      owner_name: 'Test Owner 2',
    },
  ];

  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders property titles', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProperties,
    });

    render(<ListingsPage />);

    // Wait for properties to load
    await waitFor(() => {
      expect(screen.getByText('Test Property 1')).toBeInTheDocument();
      expect(screen.getByText('Test Property 2')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {}));

    render(<ListingsPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error state when fetch fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<ListingsPage />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
}); 