/**
 * Main application entry point
 * 
 * Sets up Express server with:
 * - CORS and JSON middleware
 * - Health check endpoint
 * - API route mounting
 * - Database connection
 * - Server startup
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './db';
import authRoutes from './routes/authRoutes';
import agentRoutes from './routes/agentRoutes';
import propertyRoutes from './routes/propertyRoutes';
import bookingRoutes from './routes/bookingRoutes';
import adminRoutes from './routes/adminRoutes';
import listingRoutes from './routes/listingRoutes';
import { Request, Response, NextFunction } from 'express';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Enable CORS for frontend
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/listings', listingRoutes);

// 404 handler (must be after all other routes)
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 4000;

// Initialize database and start server
AppDataSource.initialize()
  .then(() => {
    console.log('📦 Database connection established');
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error during initialization:', error);
    process.exit(1);
  }); 