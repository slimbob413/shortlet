/**
 * Admin Routes
 * 
 * Handles admin-specific operations:
 * - Overview statistics
 * - User management
 * - Property moderation
 * 
 * All routes require admin role
 */

import express from 'express';
import { AppDataSource } from '../db';
import { Agent, UserRole } from '../entities/Agent';
import { Property } from '../entities/Property';
import { Booking } from '../entities/Booking';
import { authenticateToken } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();

// Apply auth and admin middleware to all routes
router.use(authenticateToken, isAdmin);

// Get overview statistics
router.get('/overview', async (_req, res) => {
  try {
    const [userCount, agentCount, propertyCount, bookingCount] = await Promise.all([
      AppDataSource.getRepository(Agent).count({ where: { role: UserRole.USER } }),
      AppDataSource.getRepository(Agent).count({ where: { role: UserRole.AGENT } }),
      AppDataSource.getRepository(Property).count(),
      AppDataSource.getRepository(Booking).count(),
    ]);

    res.json({
      users: userCount,
      agents: agentCount,
      properties: propertyCount,
      bookings: bookingCount,
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ error: 'Failed to fetch overview statistics' });
  }
});

// Get paginated users
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await AppDataSource.getRepository(Agent)
      .findAndCount({
        where: { role: UserRole.USER },
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      });

    res.json({
      users,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Deactivate user
router.put('/users/:id/deactivate', async (req, res) => {
  try {
    const user = await AppDataSource.getRepository(Agent).findOne({
      where: { id: parseInt(req.params.id) },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isActive = false;
    await AppDataSource.getRepository(Agent).save(user);

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

// Get paginated properties
router.get('/properties', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [properties, total] = await AppDataSource.getRepository(Property)
      .findAndCount({
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
        relations: ['owner'],
      });

    res.json({
      properties,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Deactivate property
router.put('/properties/:id/deactivate', async (req, res) => {
  try {
    const property = await AppDataSource.getRepository(Property).findOne({
      where: { id: parseInt(req.params.id) },
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    property.isActive = false;
    await AppDataSource.getRepository(Property).save(property);

    res.json({ message: 'Property deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating property:', error);
    res.status(500).json({ error: 'Failed to deactivate property' });
  }
});

export default router; 