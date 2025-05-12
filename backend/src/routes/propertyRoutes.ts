/**
 * Property Routes
 * 
 * Handles all property-related operations:
 * - Creating new properties
 * - Listing all properties with filtering capabilities
 * - Getting property details
 * - Updating property information
 * - Deleting properties
 * 
 * All routes are prefixed with /api/properties
 */

import express, { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../db';
import { Property } from '../entities/Property';
import { validate } from 'class-validator';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Validation schema
const propertySchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(10),
  price: z.number().positive(),
  availability: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  images: z.array(z.string().url()).optional(),
});

// Error handling middleware
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Property route error:', err);
  console.error('Error stack:', err.stack);
  res.status(500).json({ 
    message: 'Internal server error',
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// Create new property
router.post('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Creating property with data:', req.body);
    const validatedData = propertySchema.parse(req.body);
    
    const propertyRepository = AppDataSource.getRepository(Property);
    const property = propertyRepository.create({
      ...validatedData,
      ownerId: req.user!.userId
    });

    // Validate the property data
    const errors = await validate(property);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Save the property
    const savedProperty = await propertyRepository.save(property);
    return res.status(201).json(savedProperty);
  } catch (error) {
    console.error('Error in POST /:', error);
    next(error);
  }
});

/**
 * Get all properties with optional filtering
 * @query {string} [search] - Search term for title or description
 * @query {number} [minPrice] - Minimum price filter
 * @query {number} [maxPrice] - Maximum price filter
 * @query {string} [available] - Date string (YYYY-MM-DD) to check availability
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, minPrice, maxPrice, available } = req.query;
    
    const propertyRepository = AppDataSource.getRepository(Property);
    const queryBuilder = propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.owner', 'owner')
      .select([
        'property.id',
        'property.title',
        'property.description',
        'property.price',
        'property.availability',
        'property.createdAt',
        'property.updatedAt',
        'owner.id',
        'owner.name',
        'owner.email'
      ]);

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(property.title ILIKE :search OR property.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply price range filter
    if (minPrice || maxPrice) {
      queryBuilder.andWhere('property.price BETWEEN :minPrice AND :maxPrice', {
        minPrice: minPrice || 0,
        maxPrice: maxPrice || Number.MAX_SAFE_INTEGER
      });
    }

    // Apply availability filter
    if (available) {
      queryBuilder.andWhere(':available = ANY(property.availability)', {
        available
      });
    }

    const properties = await queryBuilder.getMany();
    return res.json(properties);
  } catch (error) {
    console.error('Error in GET /:', error);
    next(error);
  }
});

// Get property by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const propertyRepository = AppDataSource.getRepository(Property);
    const property = await propertyRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['owner'],
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        availability: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          id: true,
          name: true,
          email: true
        }
      }
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    return res.json(property);
  } catch (error) {
    console.error('Error in GET /:id:', error);
    next(error);
  }
});

// Update property
router.put('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const propertyRepository = AppDataSource.getRepository(Property);
    const property = await propertyRepository.findOne({
      where: { id: parseInt(req.params.id) }
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check ownership
    if (property.ownerId !== req.user!.userId) {
      return res.status(403).json({ message: 'Not authorized to update this property' });
    }

    const validatedData = propertySchema.parse(req.body);
    const updatedProperty = propertyRepository.merge(property, validatedData);

    // Validate the updated property
    const errors = await validate(updatedProperty);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const savedProperty = await propertyRepository.save(updatedProperty);
    return res.json(savedProperty);
  } catch (error) {
    console.error('Error in PUT /:id:', error);
    next(error);
  }
});

// Delete property
router.delete('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const propertyRepository = AppDataSource.getRepository(Property);
    const property = await propertyRepository.findOne({
      where: { id: parseInt(req.params.id) }
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check ownership
    if (property.ownerId !== req.user!.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this property' });
    }

    await propertyRepository.remove(property);
    return res.status(204).send();
  } catch (error) {
    console.error('Error in DELETE /:id:', error);
    next(error);
  }
});

// Apply error handling middleware
router.use(errorHandler);

export default router;